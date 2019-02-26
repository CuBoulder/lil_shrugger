<template>
  <div>
    <message-area></message-area>
    <transition name="slide-fade">
      <div v-if="showStatsSearch"
            class="col col-md-12">
        <stats-search></stats-search>
      </div>
    </transition>
    <transition name="slide-fade">
      <div v-if="showCommands && userAccessPerm('commands:command')"
            class="col col-md-6">
        <commands></commands>
      </div>
    </transition>
    <transition name="slide-fade">
      <div class="col col-md-6"
            v-if="showReports && userAccessPerm('commands:export')">
        <reports :grid-columns="tableColumns"></reports>
      </div>
    </transition>
    <div v-if="showDataTable !== false"
         class="col col-md-12">
      <data-table :table-options="tableOptions"
                  :columns="tableColumns">
      </data-table>
    </div>
    <transition>
      <button class="btn btn-sm spinner col-md-offset-5"
              v-if="showDataTable === false">
        <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
        Loading...
      </button>
    </transition>
  </div>
</template>

<script>
  import shrugger from '../services/shrugger.ts';
  import store from '../store.ts';
  import bus from '../services/bus.ts';
  import atlas from '../services/atlas.ts';
  import stats from '../services/stats.ts';
  import sites from '../services/sites.ts';
  import code from '../services/code.ts';

  export default {
    name: 'Sites',
    data() {
      return {
        showStatsSearch: true,
        showCommands: false,
        showReports: false,
        showDataTable: false,
        tableOptions: {
          dataName: 'sitesData',
          rowAddComponent: 'row-add',
          addKeys: store.state.sitesAddKeys,
          addCallback: 'createSite',
          autocompleteOptionsKey: 'sitesAddOptions',
          rowViewComponents: [
            {
              tagName: 'row-view',
              tabID: 'tab-row-view',
              tabLabel: 'View',
            },
            {
              tagName: 'row-edit',
              tabID: 'tab-row-edit',
              tabLabel: 'Edit',
              autocompleteOptionsKey: 'sitesAddOptions',
              editKeys: store.state.sitesEditKeys,
              updateCallback: 'updateSiteRecord',
              deleteCallback: 'deleteSiteRecord',
              dataName: 'sitesData',
              editListener: '',
            },
            {
              tagName: 'row-diff',
              tabID: 'tab-row-diff-1',
              tabLabel: 'View Diffs',
              endpoint: 'sites',
              recordID: 'id',
            },
            {
              tagName: 'row-diff',
              tabID: 'tab-row-diff-2',
              tabLabel: 'View Stats Diffs',
              endpoint: 'statistics',
              recordID: 'statistics',
            },
            {
              tagName: 'row-backup',
              tabID: 'tab-row-backup',
              tabLabel: 'Backups',
            },
          ],
          defaultSortKey: store.state.sortOptions.Sites.defaultSortKey,
          defaultSortDirection: store.state.sortOptions.Sites.defaultSortDirection,
          formatFunction: this.formatRowDisplay,
        },
      };
    },
    mounted() {
      console.log('Sites component mounted.');

      // Assign this to that because "this" changes context inside an event.
      const that = this;

      // Grab data for data table.
      this.initialize();

      bus.$on('switchEnv', function sitesSwitchEnv() {
        that.initialize();
      });

      bus.$on('editRow', function sitesEditRow(row) {
        that.editRowListener(row, that);
      });

      bus.$on('createSite', function sitesCreateSite(params) {
        // Get any tags.
        params.row.packages = store.state.tagInputTags.sitesAddOptions;
        sites.create(params);

        // Cancel rowView components.
        bus.$emit('rowHide');
        bus.$emit('cancelRowAdd');
      });

      bus.$on('updateSiteRecord', function sitesUpdateSiteRecord(params) {
        // Get any tags.
        params.current.packages = store.state.tagInputTags.sitesAddOptions;
        sites.update(params);

        // Cancel rowView components.
        bus.$emit('rowHide');
        bus.$emit('cancelRowEdit');
      });

      bus.$on('deleteSiteRecord', function sitesDeleteRecord(params) {
        sites.update(params, 'DELETE');

        // Cancel rowView components.
        bus.$emit('rowHide');
        bus.$emit('cancelRowEdit');
      });

      // Show search when icon in navbar is clicked.
      // Also refresh table data.
      bus.$on('navbarShow', function sitesNavbarShow(component) {
        that.navbarShowListener(component, that);
      });

      bus.$on('rowView', function sitesRowView(row) {
        that.sitesRowViewListener(that, row);
      });
    },
    beforeDestroy() {
      // Remove event listeners.
      bus.$off(['switchEnv', 'sitesSwitchEnv']);
      bus.$off(['editRow', 'sitesEditRow']);
      bus.$off(['updateSiteRecord', 'sitesUpdateSiteRecord']);
      bus.$off(['deleteSiteRecord', 'sitesDeleteRecord']);
      bus.$off(['navbarShow', 'sitesNavbarShow']);
      bus.$off(['createSite', 'createSite']);

      // Erase anything in editContent variable.
      store.commit('addEditContent', 'N/A');

      // Keep this log  for debugging.
      // Replace with actual logging at some point.
      console.log('Sites component destroyed.');
    },
    computed: {
      tableColumns() {
        // Merge site and stats keys together.
        const siteKeys = localStorage.getItem('site-keys') ? JSON.parse(localStorage.getItem('site-keys')) : store.state.defaultSelectedSitesKeys;

        // Make stats empty if not saved since adding all of those keys makes the table unusable.
        const statsKeys = localStorage.getItem('stats-keys') ? JSON.parse(localStorage.getItem('stats-keys')) : [];

        return siteKeys.concat(statsKeys);
      },
    },
    methods: {
      initialize() {
        const baseURL = store.state.atlasEnvironments[store.state.env];

        sites.get(baseURL)
          .then((data) => {
            const options = {
              sitesData: data,
              cachedData: data,
            };

            store.commit('addSitesGridData', options);

            // Add data from code endpoint.
            code.get(baseURL)
              .then((codeRecords) => {
                code.addCodeToSites(store.state.sitesGridData.sitesData, codeRecords);
              })
              .then(() => {
                // Update with stats data.
                stats.get(data, baseURL)
                  .then((statsRecords) => {
                    stats.addStatsToSites(store.state.sitesGridData.sitesData, statsRecords);
                  })
                  .then(() => {
                    // This event fires for other components to know that the siteListing
                    // instance has been loaded. While not ideal, the delay in making the
                    // Atlas request and setting up the data is usually enough time.
                    // @todo use mounted() instead of this.
                    bus.$emit('siteListingMounted', null);

                    // Load data table after data is loaded.
                    this.showDataTable = true;
                  })
                  .catch(error => console.log(error));
              })
              .catch(error => console.log(error));
          });

        // Setup commands for select list.
        atlas.getCommands();

        // Grab search queries.
        atlas.getQueries();

        // If there is a filter query param, then insert it.
        shrugger.setFilterFromQuery();
      },
      formatRowDisplay(value, key) {
        const atlasEnvironment = store.state.atlasEnvironments[store.state.env];

        // Link path to instance.
        if (key === 'path') {
          let pathLabel = value;
          let pathHref = store.state.expressEnvironments[store.state.env] + value + '/';
          if (value === store.state.homepageP1) {
            pathLabel = 'homepage';
            pathHref = store.state.expressEnvironments[store.state.env];
          }

          const destinationLink = localStorage.getItem('destination-link') ?
            localStorage.getItem('destination-link') : store.state.defaultDestinationLink;
          return `<a target="_blank" href="${pathHref}user?destination=${destinationLink}">${pathLabel}</a>`;
        }

        // Link to full code record.
        if (key === 'id') {
          return `<a target="_blank" href="${atlasEnvironment}sites/${value}">(Site)</a>`;
        }

        // Format dates for nicer output.
        if (key === 'created' || key === 'updated') {
          // return shrugger.toDate(value);
          return value;
        }

        // Deal with empty packages arrays.
        if (typeof value === 'undefined' || value.length === 0) {
          return '';
        }

        return value;
      },
      userAccessPerm(permission) {
        return shrugger.userAccess(permission);
      },
      editRowListener(row) {
        const that = this;

        // Check for etag change.
        shrugger.etagCheck(row, that, 'sites');
      },
      navbarShowListener(component, that) {
        switch (component) {
          case 'statsSearch':
            that.showStatsSearch = !that.showStatsSearch;
            break;
          case 'commands':
            if (this.userAccessPerm('commands:export')) {
              that.showCommands = !that.showCommands;
            }
            break;
          case 'reports':
            if (this.userAccessPerm('commands:export')) {
              that.showReports = !that.showReports;
            }
            break;
          case 'table':
            that.initialize();
            break;
          default:
            break;
        }
      },
      sitesRowViewListener(that, row) {
        // Store in central place that other components can use.
        store.commit('addTags', { key: that.tableOptions.autocompleteOptionsKey, tags: row.rowData.packages });
      },
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  #create-site {
    margin-bottom: 0.75em;
  }

  /* Spinner CSS */
  .spinner {
    font-size: 25px;
  }

  .glyphicon-refresh-animate {
      -animation: spin .7s infinite linear;
      -webkit-animation: spin2 .7s infinite linear;
  }

  @-webkit-keyframes spin2 {
      from { -webkit-transform: rotate(0deg);}
      to { -webkit-transform: rotate(360deg);}
  }

  @keyframes spin {
      from { transform: scale(1) rotate(0deg);}
      to { transform: scale(1) rotate(360deg);}
  }
</style>
