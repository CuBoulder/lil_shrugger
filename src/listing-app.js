// register the grid component
Vue.component('demo-grid', {
  template: '#grid-template',
  props: {
    data: Array,
    columns: Array,
    filterKey: String
  },
  data: function () {
    var sortOrders = {}
    this.columns.forEach(function (key) {
      sortOrders[key] = 1
    })
    return {
      sortKey: '',
      sortOrders: sortOrders
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
    }
  },
  methods: {
    sortBy: function (key) {
      this.sortKey = key
      this.sortOrders[key] = this.sortOrders[key] * -1
    }
  }
})

let data = [];
function getSiteRecords(env) {
  // Get response of all site records.
  let response = atlasRequest(getAtlasURL(env), 'sites', '', 'GET');

  // Add links.
  data = addLinks(data);

  // Place
  var demo = new Vue({
    el: '#demo',
    data: {
      searchQuery: '',
      gridColumns: ['sid', 'path', 'status'],
      gridData: data
    }
  });
}

function addLinks(data) {
  return data;
}

function getAtlasURL(env) {
  let atlasURLs = [
    {'local': 'https://inventory.local/'},
    {'dev': 'https://osr-atlas01.int.colorado.edu/'},
    {'test': 'https://osr-atlas02.int.colorado.edu/'},
    {'prod': 'https://osr-atlas03.int.colorado.edu/'}
  ];
  return atlasURLs[env];
}

function atlasRequest(baseURL, endpoint, query = '', method = 'GET', body = null) {

  // Setup headers to send to Atlas.
  let headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', 'Basic ' + auth);
  headers.set('If-Match', etag);

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
  fetch(baseURL + endpoint + query, myInit)
    .then(handleErrors)
    .then(response => response.json())
    .catch(error => error);
}


function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

$(document).ready(function () {
  getSiteRecords(document.querySelector('.env-list .selected').innerHTML);
});

