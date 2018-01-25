
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

/**
 * Centralized data store for Vue instance.
 */
const store = new Vuex.Store({

  state: {
    actionIcons: {
      Sites: [
        { name: 'search', component: 'statsSearch' },
        { name: 'th-list', component: 'commands' },
        { name: 'refresh', component: 'table' },
      ],
      Code: [
        { name: 'refresh', component: 'table' },
      ],
    },
    atlasEnvironments: {
      Local: 'https://python.local/atlas/',
      Dev: 'https://osr-atlas01.int.colorado.edu/atlas/',
      Test: 'https://osr-atlas02.int.colorado.edu/atlas/',
      Prod: 'https://osr-atlas03.int.colorado.edu/atlas/',
    },
    codeKeys: ['id', 'name', 'label', 'version', 'code_type', 'is_current', 'commit_hash',
      'tag', 'updated', 'created'],
    commands: [],
    currentQuery: null,
    defaultSelectedSitesKeys: ['id', 'path', 'status', 'core', 'profile', 'packages', 'updated'],
    defaultSelectedCodeKeys: ['id', 'name', 'label', 'version', 'code_type', 'is_current', 'commit_hash', 'tag'],
    defaultSitesQuery: '?where={"type":"express"}',
    editContent: {},
    env: localStorage.getItem('env') ? localStorage.getItem('env') : 'Local',
    expressEnvironments: {
      Local: 'https://express.local/',
      Dev: 'https://www-dev.colorado.edu/',
      Test: 'https://www-test.colorado.edu/',
      Prod: 'https://www.colorado.edu/',
    },
    filteredData: [],
    filterKey: '',
    gitHubRepos: [],
    gitHubBranches: [],
    recordsToShow: 10,
    reportsList: ['exportTable', 'exportSiteContactEmail'],
    searchFilter: '',
    selectOptions: {
      status: ['available', 'installed', 'launching'],
      code_type: ['module', 'core', 'profile'],
      is_current: [true, false],
      tag: ['addon_bundles', 'request_bundles', 'beta_bundles', 'admin_bundles'],
    },
    sitesGridData: {
      cachedData: [],
      codeData: [],
      sitesData: [],
      statsData: [],
      tempGridData: [],
    },
    siteKeys: ['id', 'path', 'status', 'core', 'profile', 'packages', 'updated', 'created'],
    sitesSendCommand: [],
    statsKeys: ['instance', 'name', 'status', 'nodes_total', 'nodes_by_type', 'nodes_other', 'days_since_last_edit',
      'beans_total', 'beans_by_type', 'beans_other', 'context', 'context_other_conditions', 'context_other_reactions',
      'variable_cron_last', 'variable_site_403', 'variable_site_404', 'variable_theme_default', 'variable_ga_account',
      'variable_livechat_license_number', 'profile_module_manager', 'express_code_version', 'express_core_schema_version',
      'theme_is_responsive', 'overridden_features', 'drupal_system_status', 'custom_logo_settings', 'username',
      'email_address', 'bundles', 'webforms', 'update_group'],
    statsQueryOptions: [],
    userPermissions: ['Code:row:edit', 'Code:row:delete', 'Code:createCode', 'Packages', 'Sites:row:edit', 'Sites:row:delete',
      'Sites:createSite', 'Sites:commands:command', 'Sites:commands:export', 'Sites:statsSearch:save', 'Settings:credentials'],
    sitesEditKeys: ['path', 'status'],
    codeEditKeys: ['label', 'version', 'code_type', 'is_current', 'commit_hash', 'tag'],
  },
  mutations: {
    addEditContent(state, options) {
      if (!state.editContent[options.rowId]) {
        Vue.set(state.editContent, [options.rowId], {});
      }
      Vue.set(state.editContent[options.rowId], [options.rowKey], options.content);
    },
    addRows(state, options) {
      state.recordsToShow = options;
    },
    storeQuery(state, currentQuery) {
      state.currentQuery = currentQuery;
    },
    switchEnv(state, environment) {
      state.env = environment;
      localStorage.setItem('env', environment);
    },
    setQueries(state, queries) {
      state.statsQueryOptions = [];
      queries.forEach((element) => {
        state.statsQueryOptions = [].concat(state.statsQueryOptions, element);
      });
    },
    setCommands(state, sentCommands) {
      state.commands = [];
      sentCommands.forEach((element) => {
        state.commands = [].concat(state.commands, element);
      });
    },
    setFilterKey(state, filter) {
      state.filterKey = filter;
    },
    addSiteToCommands(state, options) {
      // If option is to add, merge siteId into array.
      if (options.add === true) {
        const set = new Set(state.sitesSendCommand.concat([options.siteId]));
        const arr = Array.from(set);
        state.sitesSendCommand = arr;
      } else {
        // Remove Id from array.
        const arr = state.sitesSendCommand.filter(element => element !== options.siteId);
        state.sitesSendCommand = arr;
      }
    },
    addAllSitesToCommands(state, siteIds) {
      state.sitesSendCommand = siteIds;
    },
    addFilteredData(state, data) {
      state.filteredData = data;
    },
    addGitHubRepos(state, repos) {
      state.gitHubRepos = repos;
    },
    addGitHubBranches(state, branches) {
      state.gitHubBranches = branches;
    },
    addSitesGridData(state, options) {
      Object.keys(options).forEach((el) => {
        state.sitesGridData[el] = [];
        state.sitesGridData[el] = options[el];
      });
    },
  },
});

/* Insert local config here. */
if (process.env.NODE_ENV === 'development') {
  store.state.atlasEnvironments.Local = 'http://atlas.testing:3000/';
}

// Insert Pantheon config.
if (process.env.EXT_ENV === 'pantheon') {
  /* eslint-disable */

  // If localStorage isn't set to right environment, set it.
  // We hard-code in the environment we declared above.
  if (window.location.host === 'dev-shrugger-8.pantheonsite.io') {
    if (localStorage.getItem('env') !== 'Dev') {
      localStorage.setItem('env', 'Dev');
    }
  }

  if (window.location.host === 'test-shrugger-8.pantheonsite.io') {
    if (localStorage.getItem('env') !== 'Test') {
      localStorage.setItem('env', 'Test');
    }
  }

  if (window.location.host === 'live-shrugger-8.pantheonsite.io') {
    if (localStorage.getItem('env') !== 'Prod') {
      localStorage.setItem('env', 'Prod');
    }
  }

  // Set base URL since most of the time it is located at "/shrugger".
  if (localStorage.getItem('baseURL') !== '/shrugger') {
    localStorage.setItem('baseURL', '/shrugger');
  }

  // Set Atlas Environment to be singular.
  if (window.location.host === 'dev-shrugger-8.pantheonsite.io') {
    store.state.atlasEnvironments = {Dev: 'https://osr-atlas01.int.colorado.edu/atlas/'};
    store.commit('switchEnv', 'Dev');
  }

  if (window.location.host === 'test-shrugger-8.pantheonsite.io') {
    store.state.atlasEnvironments = {Test: 'https://osr-atlas02.int.colorado.edu/atlas/'};
    store.commit('switchEnv', 'Test');
  }

  if (window.location.host === 'live-shrugger-8.pantheonsite.io') {
    store.state.atlasEnvironments = {Prod: 'https://osr-atlas03.int.colorado.edu/atlas/'};
    store.commit('switchEnv', 'Prod');
  }

  // Restrict user permissions to exporting reports and editing rows.
  store.state.userPermissions = ['Sites:commands:export'];

  // Remove edit keys from code and site assets.
  store.state.sitesEditKeys = [];
  store.state.codeEditKeys = ['tag'];
  store.state.filterKey = 'available';
}

export default store;
