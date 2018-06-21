
import Vue from 'vue';
import Vuex from 'vuex';
// import bus from '../js/bus';

Vue.use(Vuex);

/**
 * Centralized data store for Vue instance.
 */
const store = new Vuex.Store({

  state: {
    actionIcons: {
      Sites: [
        { name: 'search', component: 'statsSearch', title: 'Search' },
        { name: 'th-list', component: 'commands', title: 'Commands' },
        { name: 'download-alt', component: 'reports', title: 'Reports' },
        { name: 'refresh', component: 'table', title: 'Refresh' },
      ],
      Code: [
        { name: 'refresh', component: 'table', title: 'Refresh' },
      ],
    },
    atlasEnvironments: {
      Local: 'http://localhost:3000/',
      NewDev: 'https://osr-dev-util01.int.colorado.edu/atlas/',
      Dev: 'https://osr-atlas01.int.colorado.edu/atlas/',
      NewTest: 'https://osr-test-util01.int.colorado.edu/atlas/',
      Test: 'https://osr-atlas02.int.colorado.edu/atlas/',
      NewProd: 'https://osr-prod-util01.int.colorado.edu/atlas/',
      Prod: 'https://osr-atlas03.int.colorado.edu/atlas/',
    },
    autocompleteOptions: {
      statsQueryOptions: [],
      sitesAddOptions: [],
    },
    codeAssets: {
      cores: {},
      profiles: {},
      packages: {},
    },
    codeEditKeys: {
      autocompleteKeys: [],
      canEdit: ['label', 'version', 'code_type', 'is_current', 'commit_hash', 'tag'],
      selectKeys: ['code_type', 'is_current'],
    },
    codeKeys: ['id', 'name', 'label', 'version', 'code_type', 'is_current', 'commit_hash',
      'tag', 'updated', 'created'],
    commands: [],
    currentQuery: null,
    defaultSelectedSitesKeys: ['id', 'path', 'status', 'core', 'profile', 'packages', 'updated'],
    defaultSelectedCodeKeys: ['id', 'name', 'label', 'version', 'code_type', 'is_current', 'commit_hash', 'tag'],
    defaultSitesQuery: '?where={"type":"express"}',
    developerMode: localStorage.getItem('developer-mode') ? JSON.parse(localStorage.getItem('developer-mode')) : false,
    editContent: 'N/A',
    env: localStorage.getItem('env') ? localStorage.getItem('env') : 'Local',
    expressEnvironments: {
      Local: 'https://express.local/',
      NewDev: 'https://www-dev-new.colorado.edu/',
      Dev: 'https://www-dev.colorado.edu/',
      NewTest: 'https://www-test-new.colorado.edu/',
      Test: 'https://www-test.colorado.edu/',
      NewProd: 'https://www-prod-new.colorado.edu/',
      Prod: 'https://www.colorado.edu/',
    },
    expressUserRoles: ['site_owner', 'content_editor', 'edit_my_content', 'site_editor', 'access_manager', 'campaign_manager', 'forms_manager'],
    filteredData: [],
    filterKey: {
      sitesData: '',
      codeData: '',
    },
    gitHubRepos: [],
    gitHubBranches: [],
    gitHubUsername: localStorage.getItem('github-username') ? localStorage.getItem('github-username') : process.env.GH_USER,
    gitHubToken: localStorage.getItem('github-token') ? localStorage.getItem('github-token') : process.env.GH_TOKEN,
    homepageP1: '',
    recordsToShow: 10,
    reportsList: [
      {
        name: 'exportBundleStats',
        options: true,
      },
      {
        name: 'exportSiteEmails',
        options: true,
      },
      {
        name: 'exportSiteIdentikeys',
        options: true,
      },
      {
        name: 'exportTable',
        options: false,
      },
    ],
    searchFilter: '',
    selectOptions: {
      status: ['available', 'installed', 'launching'],
      code_type: ['module', 'core', 'profile'],
      is_current: [true, false],
      tag: ['addon_bundles', 'request_bundles', 'beta_bundles', 'admin_bundles'],
      core: [],
      profile: [],
      packages: [],
    },
    shruggerVersion: '0.6.3',
    shruggerLatestRelease: { tag_name: '0.6.3' },
    sitesGridData: {
      cachedData: [],
      codeData: [],
      sitesData: [],
      statsData: [],
      tempGridData: [],
    },
    sitesAddKeys: {
      autocompleteKeys: ['packages'],
      canEdit: ['core', 'profile', 'packages'],
      selectKeys: ['core', 'profile'],
    },
    sitesEditKeys: {
      autocompleteKeys: ['packages'],
      canEdit: ['path', 'status', 'core', 'profile', 'packages'],
      selectKeys: ['core', 'profile', 'status'],
    },
    siteKeys: ['id', 'path', 'status', 'core', 'profile', 'packages', 'updated', 'created', 'update_group'],
    sitesSendCommand: [],
    sortOptions: {
      Sites: {
        defaultSortKey: 'updated',
        defaultSortDirection: '1',
      },
      Code: {
        defaultSortKey: 'updated',
        defaultSortDirection: '1',
      },
    },
    statsKeys: ['instance', 'name', 'status', 'nodes_total', 'nodes_by_type', 'nodes_other', 'days_since_last_edit',
      'beans_total', 'beans_by_type', 'beans_other', 'context', 'context_other_conditions', 'context_other_reactions',
      'variable_cron_last', 'variable_site_403', 'variable_site_404', 'variable_theme_default', 'variable_ga_account',
      'variable_livechat_license_number', 'profile_module_manager', 'express_code_version', 'express_core_schema_version',
      'theme_is_responsive', 'overridden_features', 'drupal_system_status', 'custom_logo_settings', 'username',
      'email_address', 'bundles', 'webforms', 'content_editor_count', 'site_owner_count', 'edit_my_content_count',
      'site_editor_count', 'access_manager_count', 'campaign_manager_count', 'forms_manager_count'],
    storedSiteKeys: [],
    tagInputTags: {
      sitesAddOptions: [],
      codeAddOptions: [],
    },
    userPermissions: ['Code:row:edit', 'Code:row:delete', 'Code:addRow', 'Code:createCode', 'Code:navbar:table', 'Packages',
      'Sites:row:edit', 'Sites:row:delete', 'Sites:addRow', 'Sites:createSite', 'Sites:commands:command', 'Sites:commands:export',
      'Sites:statsSearch:save', 'Sites:navbar:statsSearch', 'Sites:navbar:commands', 'Sites:navbar:reports', 'Sites:navbar:table',
      'Settings:credentials'],
  },
  mutations: {
    addEditContent(state, options) {
      state.editContent = options;
      /* Object.keys(options).forEach((element) => {
        state.editContent[element] = options[element];
      }); */
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
        state.autocompleteOptions.statsQueryOptions = [].concat(state.statsQueryOptions, element);
      });
    },
    setCommands(state, sentCommands) {
      state.commands = [];
      sentCommands.forEach((element) => {
        state.commands = [].concat(state.commands, element);
      });
    },
    setFilterKey(state, filters) {
      filters.forEach((el) => {
        state.filterKey[el.type] = el.filterString;
      });
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
    addCodeAssets(state, assets) {
      state.codeAssets = {};
      state.codeAssets = assets;

      // Also need to add as select options in an array.
      state.selectOptions.core = Object.values(assets.cores);
      state.selectOptions.profile = Object.values(assets.profiles);
      state.selectOptions.packages = Object.values(assets.packages);
    },
    addLatestShruggeRelease(state, release) {
      state.shruggerLatestRelease = release;
    },
    storeHomepageP1(state, path) {
      state.homepageP1 = path;
    },
    addAutocompleteOptions(state, params) {
      state.autocompleteOptions[params.key] = params.options;
    },
    addTags(state, params) {
      state.tagInputTags[params.key] = params.tags;
    },
    editDeveloperMode(state, mode) {
      state.developerMode = mode;
    },
  },
});

/* Insert local config here. */
if (process.env.NODE_ENV === 'development') {
  store.state.atlasEnvironments.Local = 'http://localhost:3000/';
  // store.state.gitHubUsername = process.env.GH_USER;
  // store.state.gitHubToken = process.env.GH_TOKEN;
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
  store.state.userPermissions = ['Code:navbar:table', 'Sites:commands:export', 'Sites:navbar:statsSearch',
    'Sites:navbar:reports', 'Sites:navbar:table'];

  // Sort by the status on Pantheon to look like the Webcentral dashboard did.
  store.state.sortOptions.Sites.defaultSortKey = 'status';
  store.state.sortOptions.Sites.defaultSortDirection = '-1';
}

export default store;
