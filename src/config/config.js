/**
 * @file
 * Contains data used in other places.
 */
let siteConfig = {};

/**
 * The select options can be used in the listing component for when the data/options
 * are known. To make this work, the keys, e.g "status, code_type", map to the columns
 * in the listing table. The keys also have to be listed in the editKeys as well
 * as the selectKeys properties.
 */
siteConfig['selectOptions'] = {
  status: ['available', 'installed', 'launching'],
  code_type: ['module', 'core', 'profile'],
  is_current: [true, false],
};

/**
 * Need to set the default sites search query. The reason for doing this is that
 * the inventory has records off of pool-A and also legacy sites, which we might
 * not care to see.
 */
if (localStorage.getItem('sites-query') === null) {
  localStorage.setItem('sites-query', '?where={"type":"express"}');
}

/**
 * Set the default code query to grab all code assets.
 */
if (localStorage.getItem('code-query') === null) {
  localStorage.setItem('code-query', '');
}

/**
 * An object to help manage state between components and Vue instances.
 *
 * @type {Vuex.Store}
 */
const store = new Vuex.Store({
  state: {
    env: localStorage.getItem('env') ? localStorage.getItem('env') : 'Local',
    atlasEnvironments: {
      Local: 'https://inventory.local/',
      Dev: 'https://osr-atlas01.int.colorado.edu/',
      Test: 'https://osr-atlas02.int.colorado.edu/',
      Prod: 'https://osr-atlas03.int.colorado.edu/'
    },
    expressEnvironments: {
      Local: 'https://express.local/',
      Dev: 'https://www-dev.colorado.edu/',
      Test: 'https://www-test.colorado.edu/',
      Prod: 'https://www.colorado.edu/'
    },
    editContent: {},
    recordsToShow: 10,
    siteKeys: ['id', 'path', 'status', 'core', 'profile', 'packages', 'updated', 'created'],
    codeKeys: ['id', 'name', 'label', 'version', 'code_type', 'is_current', 'commit_hash'],
    statsQueryOptions: [
      { title: 'Sites Status', query: '{"drupal_system_status":true}', rank: 2},
      { title: 'Sites - < 10 nodes', query: '{"nodes_total":{"$lt":10}}', rank: 1},
      { title: 'Un-launched and No Edits in 90 Days', query: '{"status":"installed","days_since_last_edit":{"$gt":90}}', rank: 0},
      { title: 'Archiving - Sites with no edits in > 1 year', query: '{"days_since_last_edit":{"$gt":365}}', rank: 0},
    ],
    sitesSendCommand: [],
    commands: []
  },
  mutations: {
    addEditContent (state, options) {
      if (!state.editContent[options.rowId]) {
        Vue.set(store.state.editContent, [options.rowId], {});
      }
      Vue.set(store.state.editContent[options.rowId], [options.rowKey], options.content);
    },
    addRows (state, options) {
      store.state.recordsToShow = options;
    },
    saveQuery (state, queryOption) {

      // Check if query exists and replace if it does.
      let stored = false;
      store.state.statsQueryOptions.forEach(function (element, index) {
        if (element.query === queryOption.query) {
          store.state.statsQueryOptions[index] = queryOption;
          stored = true;
        }
      });

      if (stored === true) {
        return;
      }

      // Add query if it doesn't exist.
      Vue.set(store.state.statsQueryOptions, store.state.statsQueryOptions.length + 1, queryOption)
    },
    switchEnv (state, environment) {
      store.state.env = environment;
      localStorage.setItem('env', environment);
    },
    setCommands (state, sentCommands) {
      store.state.commands = [];
      sentCommands.forEach(function (element, index) {
        store.state.commands = [].concat(store.state.commands,element);
      })
    },
    addSiteToCommands (state, options) {
      // If option is to add, merge siteId into array.
      if (options.add === true) {
        let set = new Set(store.state.sitesSendCommand.concat([options.siteId]));
        let arr = Array.from(set);
        store.state.sitesSendCommand = arr;
      } else {
        // Remove Id from array.
        let arr = store.state.sitesSendCommand.filter(function (element) {
          return element !== options.siteId;
        });
      }
    },
    addAllSitesToCommands (state, siteIds) {
      // Search for if site is already in list.
      store.state.sitesSendCommand = siteIds;
    }
  }
});

/**
 * You can use the code below to fetch a local config file if you need to override any settings.
 */
/*
fetch(window.location.origin + localStorage.getItem('baseURL') + '/src/config/config.local.js')
  .then(function (response) {
    if (response.status === 200) {
      console.log('Found local configuration file.');
    }
  });
*/
