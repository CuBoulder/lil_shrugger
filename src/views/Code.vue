<template>
  <div>
    <message-area></message-area>
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
  import code from '../services/code.ts';
  import github from '../services/github.ts';

  export default {
    name: 'Code',
    data() {
      return {
        showDataTable: false,
        tableOptions: {
          autocompleteOptionsKey: 'codeAddOptions',
          dataName: 'codeData',
          editCallback: 'updateCodeRecord',
          rowAddComponent: 'create-code',
          defaultSortKey: store.state.sortOptions.Code.defaultSortKey,
          defaultSortDirection: store.state.sortOptions.Code.defaultSortDirection,
          formatFunction: this.formatRowDisplay,
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
              editKeys: store.state.codeEditKeys,
              updateCallback: 'updateCodeRecord',
              deleteCallback: 'deleteCodeRecord',
              dataName: 'sitesData',
              editListener: this.editRowListener,
            },
            {
              tagName: 'row-diff',
              tabID: 'tab-row-diff',
              tabLabel: 'View Diffs',
              endpoint: 'code',
              recordID: 'id',
            },
          ],
        },
      };
    },
    mounted() {
      console.log('Code component mounted.');

      // Assign this to that because "this" changes context inside an event.
      const that = this;

      this.initialize();

      bus.$on('switchEnv', function codeSwitchEnv() {
        that.initialize();
      });

      bus.$on('updateCodeRecord', function codeUpdateCodeRecord(params) {
        code.update(params);

        // Cancel rowView components.
        bus.$emit('rowHide');
        bus.$emit('cancelRowEdit');
      });

      bus.$on('deleteCodeRecord', function codeDeleteRecord(params) {
        code.update(params, 'DELETE');

        // Cancel rowView components.
        bus.$emit('rowHide');
        bus.$emit('cancelRowEdit');
      });

      // Refresh table data.
      bus.$on('navbarShow', function codeNavbarShow(component) {
        that.navbarShowListener(component, that);
      });
    },
    beforeDestroy() {
      // Remove event listeners.
      bus.$off(['switchEnv', 'codeSwitchEnv']);
      bus.$off(['updateCodeRecord', 'codeUpdateCodeRecord']);
      bus.$off(['deleteCodeRecord', 'codeDeleteRecord']);
      bus.$off(['navbarShow', 'codeNavbarShow']);

      // Keep this log  for debugging.
      // Replace with actual logging at some point.
      console.log('Code component destroyed.');

      // Erase anything in editContent variable.
      store.commit('addEditContent', 'N/A');
    },
    computed: {
      tableColumns() {
        return localStorage.getItem('code-keys') ? JSON.parse(localStorage.getItem('code-keys')) : store.state.codeKeys;
      },
    },
    methods: {
      initialize() {
        code.get(store.state.atlasEnvironments[store.state.env])
          .then((data) => {
            const options = {
              codeData: data,
            };

            store.commit('addSitesGridData', options);

            // Load data table after data is loaded.
            this.showDataTable = true;
          });

        // If credentials aren't stored, then don't make the call.
        if (shrugger.getCreds('github-token') && shrugger.getCreds('github-username')) {
          // Get GitHub data to pass in.
          github.getRepos().then((repoList) => {
            store.commit('addGitHubRepos', repoList);
          });
        } else {
          bus.$emit('onMessage', {
            text: 'You don\'t seem to have stored your Github credentials. Please ' +
              '<a href="/settings"> go to the Settings page</a> to add them.',
            alertType: 'alert-warning',
          });
        }

        // If there is a filter query param, then insert it.
        shrugger.setFilterFromQuery();
      },
      formatRowDisplay(value, key) {
        const atlasEnvironment = store.state.atlasEnvironments[store.state.env];

        // Link to full code record.
        if (key === 'id') {
          return '<a target="_blank" href="' + atlasEnvironment + 'code/' + value + '">(Code Record)</a>';
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
      userAccessPerm(permission = null) {
        return shrugger.userAccess(permission);
      },
      editRowListener(row) {
        const that = this;

        // Check for etag change.
        shrugger.etagCheck(row, that, 'code');

        // Get latest commit from GitHub repo.
        if (row.data.commit_hash) {
          // Find current repo's default branch.
          const repoData = store.state.gitHubRepos.find(el => el.name === row.data.name);

          github.getLatestCommitByRepo(row.data.name, row)
          .then((response) => {
            const content = {
              commit_hash: `<span>Current hash of default <strong>${repoData.default_branch}</strong> branch: ` +
                `<a href='${repoData.html_url}/commit/${response.hash}' target="_blank">${response.hash}</a></span>`,
            };
            store.commit('addEditContent', JSON.stringify(content));
          });
        }
      },
      navbarShowListener(component, that) {
        switch (component) {
          case 'table':
            that.initialize();
            break;
          default:
            break;
        }
      },
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  #create-code {
    margin-bottom: 0.75em;
  }
</style>
