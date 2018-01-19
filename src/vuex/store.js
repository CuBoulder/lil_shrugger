
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
        { name: 'question-sign', component: 'help' },
      ],
      Code: [
        { name: 'refresh', component: 'table' },
        { name: 'question-sign', component: 'help' },
      ],
      Settings: [
        { name: 'question-sign', component: 'help' },
      ],
    },
    atlasEnvironments: {
      Local: 'https://inventory.local/atlas/',
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
    defaultDataTableSortKey: 'updated',
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
    help: {
      sites: 'https://github.com/CuBoulder/lil_shrugger/wiki/Sites',
      code: 'https://github.com/CuBoulder/lil_shrugger/wiki/Code',
      settings: 'https://github.com/CuBoulder/lil_shrugger/wiki/Settings',
    },
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
    userPermissions: ['Code:row:edit', 'Code:row:delete', 'Sites:row:edit', 'Sites:row:delete', 'Sites:createSite',
      'Code:createCode', 'Sites:commands:command', 'Sites:commands:export', 'Sites:statsSearch:save',
      'Settings:credentials'],
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
      // Search for if site is already in list.
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
        state.sitesGridData[el] = options[el];
      });
    },
  },
});

/* Insert local config here. */

export default store;
