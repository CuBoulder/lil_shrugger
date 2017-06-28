/**
 * Create an event bus to emit events across the application.
 */
var bus = new Vue();

/**
 * Makes a request to Atlas.
 *
 * @param baseURL
 * @param endpoint
 * @param query
 * @param method
 * @param body
 * @param etag
 * @returns {Promise.<TResult>}
 */
function atlasRequest(baseURL, endpoint, query = '', method = 'GET', body = null, etag = null) {

  // Setup headers to send to Atlas.
  let headers = new Headers();
  let auth = btoa(localStorage.getItem('atlas-username') + ':' + localStorage.getItem('atlas-password'));
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', 'Basic ' + auth);

  // The etag is only needed when doing write operations.
  if (method === "PATCH" || method === "PUT" || method === 'DELETE') {
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
 * Deletes a site or code record.
 *
 * @param record
 * @returns {*}
 */
function deleteRecord(record) {
  // For now, just check for something in the site record that is different
  // than the code record.
  if (record['hash']) {
    return updateCodeRecord([], record, 'DELETE');
  }
  return updateSiteRecord([], record, 'DELETE');
}

/**
 * Creates a listing component for data in a table.
 */
Vue.component('listing', {
  template: '#listing',
  props: {
    data: Array,
    columns: {
      type: Array,
      required: true
    },
    filterKey: String,
    editKeys: Array,
    selectKeys: Array,
    callback: String,
    edit: {
      type: Boolean,
      default: false
    },
    editId: {
      type: String,
      default: ''
    }
  },
  data: function () {
    var sortOrders = {}
    this.columns.forEach(function (key) {
      sortOrders[key] = 1
    })
    return {
      sortKey: '',
      sortOrders: sortOrders,
      selectOptions: siteConfig.selectOptions
    }
  },
  computed: {
    filteredData: function () {
      var sortKey = this.sortKey
      //var filterKey = this.filterKey && this.filterKey.toLowerCase()
      var order = this.sortOrders[sortKey] || 1
      var data = this.data
      /*
      if (filterKey) {
        data = data.filter(function (row) {
          return Object.keys(row).some(function (key) {
            return String(row[key]).toLowerCase().indexOf(filterKey) > -1
          })
        })
      }
      */
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
        return '<a href="' + localStorage.getItem('host') + value + '">' + value + '</a>';
      }
      return value;
    },
    selectType: function (index) {
      if (this.selectKeys.indexOf(index) !== -1) {
        return true;
      }
      return false;
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
      this.cancel();
    },
    cancel: function () {
      this.confirmed = false;
      this.finaled = false;
    }
  }
});

Vue.component('message-area', {
  template: '<p :class="alertType">{{message}}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></p>',
  props: [
    'message',
    'alertType'
  ]
});

var alert = new Vue({
  el: '#alert',
  data: {
    message: '',
    alertType: ''
  },
  created() {
    // To use this anywhere: bus.$emit('onMessage', ['You have deleted a site.', 'alert-info']);
    // You can use any available bootstrap alert: alert-info, alert-success, alert-danger, etc.
    bus.$on('onMessage', ([message, alertType]) => {
      alert.message = message;
      alert.alertType = alertType;
    });
  }
});
