
/**
 * Takes an environment label and matches the Atlas URL instance.
 *
 * @param env
 * @returns {*}
 */
function getAtlasURL(env) {
  let atlasURLs = {
    'Local': 'https://inventory.local/',
    'Dev': 'https://osr-atlas01.int.colorado.edu/',
    'Test': 'https://osr-atlas02.int.colorado.edu/',
    'Prod': 'https://osr-atlas03.int.colorado.edu/'
  };
  return atlasURLs[env];
}

/**
 * Makes a request to Atlas.
 *
 * @param baseURL
 * @param endpoint
 * @param query
 * @param method
 * @param body
 * @returns {Promise.<TResult>}
 */
function atlasRequest(baseURL, endpoint, query = '', method = 'GET', body = null, etag = null) {

  // Setup headers to send to Atlas.
  let headers = new Headers();
  let auth = btoa(siteConfig.username + ':' + siteConfig.password);
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', 'Basic ' + auth);

  // The etag is only needed when doing write operations.
  if (method === "PATCH" || method === "PUT") {
    headers.set('If-Match', etag);
  }

  let myInit = {
    method: method,
    headers: headers,
    mode: 'cors',
    //cache: 'default',
    timeout: 15,
  };

  // If body, then add it.
  if (body != null) {
    myInit.body = body;
  }

  // Send request and return response or error.
  return fetch(baseURL + endpoint + query, myInit)
    .then(handleErrors)
    .then(response => response.json())
    .catch(error => error);
}

/**
 * This function can be placed before any call to an external service or when
 * performing an operation that might fail.
 *
 * @param response
 * @returns {*}
 */
function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

/**
 * Pauses execution for specified number of milliseconds.
 *
 * @param ms
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a listing component for data in a table.
 */
Vue.component('listing', {
  template: '#listing',
  props: {
    data: Array,
    columns: Array,
    filterKey: String,
    editKeys: Array,
    callback: String,
    edit: false,
    editId: ''
  },
  data: function () {
    var sortOrders = {}
    this.columns.forEach(function (key) {
      sortOrders[key] = 1
    })
    return {
      sortKey: '',
      sortOrders: sortOrders,
    }
  },
  computed: {
    filteredData: function () {
      var sortKey = this.sortKey
      var filterKey = this.filterKey && this.filterKey.toLowerCase()
      var order = this.sortOrders[sortKey] || 1
      var data = this.data
      if (filterKey) {
        data = data.filter(function (row) {
          return Object.keys(row).some(function (key) {
            return String(row[key]).toLowerCase().indexOf(filterKey) > -1
          })
        })
      }
      if (sortKey) {
        data = data.slice().sort(function (a, b) {
          a = a[sortKey]
          b = b[sortKey]
          return (a === b ? 0 : a > b ? 1 : -1) * order
        })
      }
      return data
    }
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },

  },
  methods: {
    sortBy: function (key) {
      this.sortKey = key
      this.sortOrders[key] = this.sortOrders[key] * -1
    },
    callMeMaybe: function (callback, entry) {
      let formData = document.querySelectorAll('[data-id=' + entry.id + ']');
      window[callback](formData, entry);
      this.cancelEdit();
    },
    link: function (value, key) {
      if (key === 'path') {
        return '<a href="' + siteConfig.host + value + '">' + value + '</a>';
      }
      return value;
    },
    showEdit: function (entry, index = null) {
      if (this.edit && this.editId === entry.id) {
        if (index === null || this.editKeys.indexOf(index) !== -1) {
          return true;
        }
      }
      return false;
    },
    showDefault: function (entry, index = null) {
      if (!this.edit || this.editId !== entry.id || this.editKeys.indexOf(index) === -1 && index !== null) {
        return true;
      }
      return false;
    },
    makeEdit: function (entry) {
      this.edit = !this.edit;
      this.editId = entry.id;
    },
    cancelEdit: function () {
      this.edit = !this.edit;
      this.editId = '';
    }
  }
});

/**
 * Creates a button component with comfirm step.
 */
Vue.component('confirm-button', {
  template: '#confirm-button',
  props: {
    label: String,
    callback: String,
    params: Array,
    confirmed: false,
    finaled: false
  },
  methods: {
    callMeMaybe: function (callback, params) {
      window[callback](params);
    },
    cancel: function () {
      this.confirmed = false;
      this.finaled = false;
    }
  }
});
