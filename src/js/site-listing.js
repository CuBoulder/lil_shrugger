var link = document.querySelector('link[href="site-listing.html"]');
var content = link.import;

// Grab DOM from warning.html's document.
var el = content.querySelector('script');

document.querySelector('body').appendChild(el.cloneNode(true));

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
  let response = atlasRequest(getAtlasURL(env), 'sites');

  response.then(function(data){
    console.log(data);
    // Add links.
    data = addLinks(data);

    // Place
    var demo = new Vue({
      el: '#demo',
      data: {
        searchQuery: '',
        gridColumns: ['sid', 'path', 'status'],
        gridData: data._items
      }
    });
  });

}

function addLinks(data) {
  return data;
}

function getAtlasURL(env) {
  let atlasURLs = {
    'Local': 'https://inventory.local/',
    'Dev': 'https://osr-atlas01.int.colorado.edu/',
    'Test': 'https://osr-atlas02.int.colorado.edu/',
    'Prod': 'https://osr-atlas03.int.colorado.edu/'
  };
  return atlasURLs[env];
}

function atlasRequest(baseURL, endpoint, query = '', method = 'GET', body = null) {

  // Setup headers to send to Atlas.
  let headers = new Headers();
  let auth = btoa(localStorage.getItem("username") + ':' + localStorage.getItem("password"));
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', 'Basic ' + auth);

  if (method !== "GET") {
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

  console.log(baseURL + endpoint + query);
  console.log(headers);
  console.log(myInit);

  // Send request and return response or error.
  return fetch(baseURL + endpoint + query, myInit)
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

