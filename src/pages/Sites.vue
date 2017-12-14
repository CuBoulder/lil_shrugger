<template>
  <div class="page container">
    <div id="site-listing" class="row">
      <message-area></message-area>
      <transition name="slide-fade">
        <stats-search
            v-if="showStatsSearch">
        </stats-search>
      </transition>
      <transition name="slide-fade">
        <commands
            :grid-columns="gridColumns"
            v-if="showCommands">
        </commands>
      </transition>
      <div class="row pull-right"
           id="create-site"
           v-if="userAccessPerm('createSite')">
        <confirm-button
            label="Create A Site"
            callback="createSite">
        </confirm-button>
      </div>
      <data-table
          :data="gridData"
          class="row"
          :columns="gridColumns"
          :edit-keys="editKeys"
          :select-keys="selectKeys"
          :callback="callback">
      </data-table>
    </div>
  </div>
</template>

<script>
  import shrugger from '../js/shrugger';
  import store from '../vuex/store';
  import bus from '../js/bus';
  import atlas from '../js/atlas';
  import statsService from '../js/statsService';
  import sites from '../js/sites';
  import code from '../js/code';
  import exportService from '../js/exportService';

  export default {
    name: 'Sites',
    data() {
      return {
        editKeys: store.state.sitesEditKeys,
        selectKeys: ['status'],
        callback: 'updateSiteRecord',
        showStatsSearch: true,
        showCommands: false,
      };
    },
    created() {
      // Assign this to that in case needed in events.
      const that = this;

      // Grab data for data table.
      this.initialize();

      bus.$on('sendCommand', (params) => {
        that.sendCommandListener(params, that);
      });

      bus.$on('switchEnv', () => {
        that.initialize();
      });

      // When a user tries to edit a site record, update data if etags don't match.
      bus.$on('etagFail', (env) => {
        that.etagFailListener(env, that);
      });

      bus.$on('updateSiteRecord', (params) => {
        sites.update(params);
      });

      bus.$on('deleteRecord', (params) => {
        sites.update(params, 'DELETE');
      });

      // Set anything that needs updated when in edit mode.
      bus.$on('rowEdit', (row) => {
        that.rowEditListener(row, that);
      });

      // Display whole record in view area.
      bus.$on('rowView', (row) => {
        that.rowViewListener(row, that);
      });

      // Hides record view and repopulates data table.
      bus.$on('rowHide', (row) => {
        that.rowHideListener(row, that);
      });

      // Show search when icon in navbar is clicked.
      // Also refresh table data.
      bus.$on('navbarShow', (component) => {
        that.navbarShowListener(component, that);
      });

      // Updates data table after site record data has been grabbed.
      // Currently adds code and stats records data.
      bus.$on('tableDataUpdate', (siteRecords) => {
        that.tableDataUpdateListener(siteRecords, that);
      });

      // Exports data in table when export button is clicked.
      bus.$on('exportTable', (params) => {
        that.exportTableListener(params, that);
      });

      // Exports data in table when export button is clicked.
      bus.$on('exportSiteContactEmail', (params) => {
        that.exportEmailsListener(params, that);
      });

      bus.$on('createSite', (params) => {
        sites.create(params);
      });
    },
    computed: {
      gridColumns() {
        // Merge site and stats keys together.
        const siteKeys = localStorage.getItem('site-keys') ? JSON.parse(localStorage.getItem('site-keys')) : store.state.siteKeys;

        // Make stats empty if not saved since adding all of those keys makes the table unusable.
        const statsKeys = localStorage.getItem('stats-keys') ? JSON.parse(localStorage.getItem('stats-keys')) : [];

        return siteKeys.concat(statsKeys);
      },
      gridData() {
        return store.state.sitesGridData.sitesData;
      },
    },
    methods: {
      initialize() {
        sites.get(store.state.atlasEnvironments[store.state.env])
          .then((data) => {
            const options = {
              sitesData: data,
              cachedData: data,
            };

            store.commit('addSitesGridData', options);

            // Hide any row if it was being viewed.
            bus.$emit('hideRowExtraContent');

            // Emit event so other data can be added to the table.
            bus.$emit('tableDataUpdate', data);

            // This event fires for other components to know that the siteListing
            // instance has been loaded. While not ideal, the delay in making the
            // Atlas request and setting up the data is usually enough time.
            // @todo use mounted() instead of this.
            bus.$emit('siteListingMounted', null);
          });

        // Setup commands for select list.
        atlas.getCommands();

        // Grab search queries.
        atlas.getQueries();

        // If there is a filter query param, then insert it.
        shrugger.setFilterFromQuery();
      },
      userAccessPerm(permission) {
        return shrugger.userAccess(permission);
      },
      sendCommandListener(params) {
        // Get site Ids to send.
        const siteIds = '"' + store.state.sitesSendCommand.join('","') + '"';
        let queryToSend = '{"path":{"$in":[' + siteIds + ']}}';

        // Convert to unicode.
        queryToSend = shrugger.convertToUnicode(queryToSend);

        // Don't JSON encode since it escapes too much.
        const body = '{"query": "' + queryToSend + '"}';

        // Get command data for etag.
        const command = store.state.commands.filter(element => element._id === params.command);

        atlas.request(store.state.atlasEnvironments[store.state.env], 'commands/' + command[0]._id, '', 'PATCH', body, command[0]._etag);
      },
      etagFailListener(env) {
        sites.get(store.state.atlasEnvironments[env])
          .then((data) => {
            const options = {
              sitesData: data,
              cachedData: data,
            };
            store.commit('addSitesGridData', options);
          });
      },
      rowEditListener(row) {
        // Add special edit content to the row key by key.
        row.editKeys.forEach((element) => {
          // Need to set edit row options to nothing so they can render in component.
          const options = {
            rowId: row.data.id,
            rowKey: element,
            content: '',
          };
          store.commit('addEditContent', options);
        });
      },
      rowViewListener(row) {
        // Set temp variable for holding what was in the current table.
        // We can't used the cached data as that is a list of all the records.
        const options = {
          tempGridData: store.state.sitesGridData.sitesData,
          sitesData: [row.oldData],
        };
        store.commit('addSitesGridData', options);

        // Make call to stats page to get full data to inject.
        fetch(store.state.atlasEnvironments[store.state.env] + 'statistics/' + row.data.statistics)
          .then(shrugger.handleErrors)
          .then(response => response.json())
          .then((data) => {
            // Filter table to only show that record.
            bus.$emit('viewRowExtraContent', data);
          })
          .catch(error => error);
      },
      rowHideListener() {
        const options = {
          sitesData: store.state.sitesGridData.tempGridData,
        };
        store.commit('addSitesGridData', options);

        // Filter table to only show that record.
        bus.$emit('hideRowExtraContent');
      },
      navbarShowListener(component, that) {
        switch (component) {
          case 'statsSearch':
            that.showStatsSearch = !that.showStatsSearch;
            break;
          case 'commands':
            that.showCommands = !that.showCommands;
            break;
          case 'table':
            that.initialize();
            break;
          case 'help':
            // Redirect user to help article.
            window.location.href = store.state.help.sites;
            break;
          default:
            break;
        }
      },
      tableDataUpdateListener(siteRecords) {
        // Update table with code data once site records have been loaded.
        const baseURL = store.state.atlasEnvironments[store.state.env];
        code.get(baseURL)
          .then((codeRecords) => {
            code.addCodeToSites(siteRecords, codeRecords);
          })
          .catch(error => console.log(error));

        // Update with stats data.
        statsService.getStatsRecords(siteRecords, baseURL)
          .then((statsRecords) => {
            statsService.addStatsToSites(siteRecords, statsRecords);
          })
          .catch(error => console.log(error));
      },
      exportTableListener(params) {
        const rows = store.state.filteredData;
        const columns = params.columns;
        const headers = {};

        // Filter rows to only have keys visible in table.
        const exportData = rows.map((item) => {
          const returnItem = {};
          columns.forEach((element) => {
            // Need to join arrays with different value than comma.
            if (Array.isArray(item[element])) {
              item[element] = item[element].join('|');
            } else if (typeof item[element] === 'object') {
              // If item is still an object, then we need to do more work.
              let mrString = '';
              Object.keys(item[element]).forEach((thing) => {
                mrString = mrString + '|' + thing + ':' + item[element][thing];
              });
              item[element] = mrString;
            } else if (typeof item[element] === 'string') {
              // Strings can have commas.
              item[element] = item[element].replace(new RegExp(',', 'g'), '|');
            }
            returnItem[element] = item[element];

            // Also make columns into header objects.
            headers[element] = element;
          });
          return returnItem;
        });

        // Export to CSV file.
        exportService.exportCSVFile(headers, exportData, 'report');
      },
      exportEmailsListener(params) {
        // Grab the types of emails needed.
        let emailArray = params.options.split(',');

        // If email array is blank, then add "all" option.
        if (emailArray[0] === '') {
          emailArray = ['all'];
        }

        // Reduce number of emails into one list.
        const allEmails = [];
        // If site contacts don't exist, then don't do anything.
        const exportData = store.state.filteredData.filter(item => item.site_contacts);

        exportData.map((item) => {
          // If array is empty or just contains "all", then push all emails.
          let tempEmailArray = [];
          if (Array.isArray(emailArray) && emailArray.length && emailArray.indexOf('all') === -1) {
            emailArray.forEach((element) => {
              // Need to check if site has any users of this type.
              if (item.site_contacts[element]) {
                tempEmailArray = [].concat(tempEmailArray, item.site_contacts[element]);
              }
            });

            allEmails.push(tempEmailArray);
          } else {
            // item.email_address will have all email addresses.
            // @see site_records.js formatStatsData().
            allEmails.push(item.email_address);
          }
        });

        // The final email list will not have duplicates.
        const finalEmails = [];
        allEmails.forEach((el) => {
          // All items should be arrays so we need to also loop through those items.
          if (typeof el !== 'undefined' && Array.isArray(el)) {
            el.forEach((part) => {
              // Value can be undefined or not be an email address.
              if (!part || !part.includes('@')) {
                part = '';
              }

              // We need to lowercase and strip text since emails are weird and can have both
              // lowercase and uppercase versions.
              if (finalEmails.indexOf(part.toLowerCase().trim()) === -1) {
                finalEmails.push(part.toLowerCase().trim());
              }
            });
          }
        });

        // Export to text file.
        exportService.exportTextFile(finalEmails, 'siteContactEmails');
      },
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  #create-site {
    margin-bottom: 0.75em;
  }
</style>
