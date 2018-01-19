<template>
  <div>
    <div>
      <message-area></message-area>
      <div class="pull-right"
           id="create-code"
           v-if="userAccessPerm('createCode')">
        <create-code v-if="userAccessPerm('createCode')"></create-code>
      </div>
      <data-table
          :data="gridData"
          :columns="gridColumns"
          :callback="callback"
          :extra-content="rowViewContent"
          :edit-keys="editKeys"
          :select-keys="selectKeys">
      </data-table>

    </div>
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
        searchQuery: '',
        cachedRecords: [],
        callback: 'updateCodeRecord',
        editKeys: store.state.codeEditKeys,
        selectKeys: ['code_type', 'is_current', 'tag'],
        rowViewContent: {},
        messages: [],
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

      bus.$on('updateCodeRecord', (params) => {
        code.update(params);
      });

      bus.$on('deleteRecord', (params) => {
        code.update(params, 'DELETE');
      });

      // Set anything that needs updated when in edit mode.
      bus.$on('rowEdit', (row) => {
        that.rowEditListener(row, that);
      });

      // Display whole record in view area.
      bus.$on('rowView', (row) => {
        that.rowViewListener(row, that);
      });

      bus.$on('rowHide', (row) => {
        that.rowHideListener(row, that);
      });

      // Refresh table data.
      bus.$on('navbarShow', (component) => {
        that.navbarShowListener(component, that);
      });
    },
    computed: {
      gridColumns() {
        return localStorage.getItem('code-keys') ? JSON.parse(localStorage.getItem('code-keys')) : store.state.codeKeys;
      },
      gridData() {
        return store.state.sitesGridData.codeData;
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
          });

        // Get GitHub data to pass in.
        github.getRepos().then((repoList) => {
          store.commit('addGitHubRepos', repoList);
        });

        // If there is a filter query param, then insert it.
        shrugger.setFilterFromQuery();
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
      rowEditListener(row) {
        let options = {};

        // Add special edit content to the row key by key.
        row.editKeys.forEach((element) => {
          // Get latest commit from GitHub repo.
          if (element === 'commit_hash') {
            github.getLatestCommit(row.data.name, row)
              .then((response) => {
                options = {
                  rowId: row.data.id,
                  rowKey: element,
                  content: '<span class="current-hash"><strong>Current Hash:</strong> ' + response.hash + '</span>',
                };
                store.commit('addEditContent', options);
              });
          } else {
            // Need to set other edit row options to nothing so they can render in component.
            options = {
              rowId: row.data.id,
              rowKey: element,
              content: '',
            };
            store.commit('addEditContent', options);
          }
        });
      },
      rowViewListener(row) {
        // Set temp variable for holding what was in the current table.
        // We can't used the cached data as that is a list of all the records.
        const options = {
          codeData: [row.oldData],
          tempGridData: store.state.sitesGridData.codeData,
        };

        store.commit('addSitesGridData', options);

        // Make call to stats page to get full data to inject.
        fetch(store.state.atlasEnvironments[store.state.env] + 'code/' + row.data.id)
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
          codeData: store.state.sitesGridData.tempGridData,
        };
        store.commit('addSitesGridData', options);

        // Filter table to only show that record.
        bus.$emit('hideRowExtraContent');
      },
      navbarShowListener(component, that) {
        if (component === 'table') {
          that.initialize();
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
