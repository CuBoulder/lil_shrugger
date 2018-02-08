<template>
  <div>
    <message-area></message-area>
    <create-code :styles="{closed: 'pull-right', open: 'col-md-8'}"
                  v-if="userAccessPerm('createCode')">
    </create-code>
    <data-table :table-options="tableOptions"
                v-if="showDataTable !== false">
    </data-table>
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
  import shrugger from '../js/shrugger';
  import store from '../vuex/store';
  import bus from '../js/bus';
  import code from '../js/code';
  import github from '../js/github';

  export default {
    name: 'Code',
    data() {
      return {
        showDataTable: false,
        tableOptions: {
          dataName: 'codeData',
          callback: 'updateCodeRecord',
          columns: localStorage.getItem('code-keys') ? JSON.parse(localStorage.getItem('code-keys')) : store.state.codeKeys,
          editKeys: store.state.codeEditKeys,
          defaultSortKey: 'updated',
          defaultSortDirection: '1',
          formatFunction: this.formatRowDisplay,
          editListener: this.editRowListener,
        },
      };
    },
    created() {
      const that = this;

      that.initialize();

      bus.$on('switchEnv', () => {
        that.initialize();
      });

      // When a user tries to edit a site record, update data if etags don't match.
      bus.$on('etagFail', (env) => {
        that.etagFailListener(env, that);
      });

      bus.$on('editRow', (row) => {
        that.editRowListener(row, that);
      });

      bus.$on('updateCodeRecord', (params) => {
        code.update(params);
        bus.$emit('cancelRowEdit', that);
      });

      bus.$on('deleteRecord', (params) => {
        if (params.current.code_type) {
          code.update(params, 'DELETE');
        }
      });

      // Refresh table data.
      bus.$on('navbarShow', (component) => {
        that.navbarShowListener(component, that);
      });
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

        // Get GitHub data to pass in.
        github.getRepos().then((repoList) => {
          store.commit('addGitHubRepos', repoList);
        });

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
          return shrugger.toDate(value);
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
      etagFailListener(env) {
        code.get(store.state.atlasEnvironments[env])
          .then((data) => {
            const options = {
              codeData: data,
            };

            store.commit('addSitesGridData', options);
          });
      },
      editRowListener(row) {
        // Get latest commit from GitHub repo.
        if (row.data.commit_hash) {
          github.getLatestCommit(row.data.name, row)
          .then((response) => {
            const options = {
              commit_hash: `<strong>Current Hash:</strong> ${response.hash}</span>`,
            };
            store.commit('addEditContent', options);
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
