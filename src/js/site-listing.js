/**
 * Imports Site Listing HTML into DOM of pages using it.
 *
 * @type {Element}
 */
var link = document.querySelector('link[href="src/partials/listing.html"]');
var content = link.import;
var el = content.querySelector('script');
document.querySelector('body').appendChild(el.cloneNode(true));

var link = document.querySelector('link[href="src/partials/row.html"]');
var content = link.import;
var el = content.querySelector('script');
document.querySelector('body').appendChild(el.cloneNode(true));

/**
 * Imports Button HTML into DOM of pages using it.
 *
 * @type {Element}
 */
link = document.querySelector('link[href="src/partials/confirm-button.html"]');
content = link.import;
el = content.querySelector('script');
document.querySelector('body').appendChild(el.cloneNode(true));

// Place site data in table via site-listing template located in site-listing.html.
let siteListing = new Vue({
  el: '#site-listing',
  data: {
    searchQuery: '?where={"nodes_total":{"$gt":1}}',
    gridColumns: ['id', 'path', 'status', 'updated'],
    gridData: [],
    cachedRecords: [],
    editKeys: ['path', 'status'],
    selectKeys: ['status'],
    callback: 'updateSiteRecord',
    reset: false
  },
  created: function () {
    bus.$on('switchEnv', function (env) {
      getSiteRecords(siteConfig.atlasEnvironments[env])
        .then(function (data) {
          siteListing.gridData = data;
          // Cache the result until the next request.
          siteListing.cachedRecords = data;
        });
    })

    // Set anything that needs updated when in edit mode.
    bus.$on('rowEdit', function (row) {
      // Add special edit content to the row key by key.
      row.editKeys.forEach(function (element, index) {
        // Need to set edit row options to nothing so they can render in component.
        let options = {
          rowId: row.data.id,
          rowKey: element,
          content: ''
        }
        store.commit('addEditContent', options)
      })
    })
  },
  computed: {
    showReset: function () {
      return siteListing.reset;
    }
  },
  methods: {
    search: function (query) {

      // Make request to Atlas.
      let baseURL = siteConfig['atlasEnvironments'][localStorage.getItem('env')];
      let response = atlasRequest(baseURL, 'statistics', query);

      // Response is a Promise object so we must resolve it to get the data out.
      response.then(function (objects) {

        // Get array only of site IDs to check from stats query.
        let siteIds = [];
        objects.forEach(function (elements, index) {
          elements.forEach(function (element, index) {
            siteIds.push(element['site']);
          });
        });

        // Filter results by using the site ID stored in stats records.
        let queryResult = siteListing.cachedRecords.filter(function (row) {
          return siteIds.indexOf(row['_id']) > -1
        });

        // By setting the gridData property, the view will automatically update.
        siteListing.gridData = queryResult;
        siteListing.reset = true;
      });
    },
    resetSearch: function () {
      // By using the cached results when the page is loaded, the query can be reverted.
      siteListing.gridData = siteListing.cachedRecords;
      siteListing.searchQuery = '';
      siteListing.reset = false;
    }
  }
});

// Add create a site button to page.
let siteCreateButton = new Vue({
  el: '#create-site',
  data: {
    label: 'Create A Site',
    callback: 'createSite',
  }
});

/**
 * Gets a list of site records based on environment and pass data to template.
 *
 * @param envURL
 */
function getSiteRecords(envURL = null) {
  // If no environment passed in, then get from local storage.
  if (envURL === null) {
    envURL = siteConfig['atlasEnvironments'][localStorage.getItem('env')];
  }

  // Check for query to add to code request.
  let query = localStorage.getItem('sites-query');
  if (query === null) {
    query = '';
  }

  // Response is a Promise object so we must resolve it to get the data out.
  return atlasRequest(envURL, 'sites', query)
    .then(data => formatSiteData(data));
}

/**
 * Need to format data for table.
 *
 * @param data
 */
function formatSiteData(data) {
  let formattedData = [];

  // Data can be a nested array if it has paging links.
  // This is why there are two loops through the data.
  data.forEach(function (elements, index) {
    elements.forEach(function (element, index) {
      // Format date.
      var date = new Date(element._updated);
      var options = {
        weekday: "long", year: "numeric", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit"
      };

      let item = [];
      item['id'] = element.sid;
      item['path'] = element.path;
      item['status'] = element.status;
      item['updated'] = date.toLocaleTimeString("en-us", options);
      item['etag'] = element._etag;
      item['_id'] = element._id;
      formattedData.push(item);
    });
  });

  return formattedData;
}

/**
 * Creates a site record.
 */
function createSite() {
  let baseURL = siteConfig['atlasEnvironments'][localStorage.getItem('env')];
  let endpoint = 'sites';

  let data = JSON.stringify({
    "status": "pending"
  });

  atlasRequest(baseURL, endpoint, query = '', method = 'POST', body = data)
    .then(response =>
      getSiteRecords(siteConfig['atlasEnvironments'][localStorage.getItem('env')])
        .then((data) => {
          siteListing.gridData = data;
          bus.$emit('onMessage', {
            text: 'Successfully created a site.',
            alertType: 'alert-success'
          });
        })
        .catch((error) => {
          console.log(error);
        })
    );
}

/**
 * Updates a site record based on user input.
 *
 * @param formData
 * @param record
 * @param method
 */
function updateSiteRecord(formData, record, method = 'PATCH') {
  // Take input values from formData and put into array for comparison.
  // Only return values that are different.
  let formInput = {};
  formData.forEach(function (value, index) {
    if (value['name'] && record[value['name']] !== value['value']) {
      formInput[value['name']] = value['value'];
    }
  });

  let baseURL = siteConfig['atlasEnvironments'][localStorage.getItem('env')];
  atlasRequest(baseURL, 'sites/' + record['_id'], query = '', method, JSON.stringify(formInput), record['etag'])
    .then((response) => {
      bus.$emit('onMessage', {
        text: 'You have updated a site record. Site ID: ' + record['_id'],
        alertType: 'alert-success'
      });
      getSiteRecords(siteConfig['atlasEnvironments'][localStorage.getItem('env')])
        .then(data => siteListing.gridData = data)
    })
    .catch((error) => {
      console.log(error);
    });
}
