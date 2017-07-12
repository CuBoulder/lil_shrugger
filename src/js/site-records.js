
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
      var updated_date = new Date(element._updated);
      var created_date = new Date(element._created);
      var options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      };

      let item = [];
      //item['id'] = element.sid;
      item['path'] = element.path;
      item['status'] = element.status;
      item['updated'] = updated_date.toLocaleTimeString("en-us", options);
      item['created'] = created_date.toLocaleTimeString("en-us", options);
      item['etag'] = element._etag;
      item['id'] = element._id;
      item['statistics'] = element.statistics;
      item['code'] = element.code;


      item['core'] = '';
      item['profile'] = '';
      item['packages'] = [];
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

  // @todo Add more fields here so you can create a site with different assets than current.
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
 * @param params
 * @param method
 */
function updateSiteRecord(params, method = 'PATCH') {
  // Define parts of code record that are nested in the settings field.
  let settingsKeys = ['page_cache_maximum_age'];

  // Take input values from formData and put into array for comparison.
  // Only return values that are different.
  let formInput = {};
  for (key in params.previous) {

    // Check if values are different to add to PATCH.
    // Don't need to check etag since user can't change that on form.
    if (params.current[key] !== params.previous[key] && key !== 'etag') {

      // Need to put meta fields in right place.
      if (settingsKeys.indexOf(key) !== -1) {
        // Initialize meta field if it doesn't exist yet.
        if (!formInput['settings']) {
          formInput['settings'] = {};
        }
        formInput['settings'][key] = params.current[key];
      } else {
        formInput[key] = params.current[key];
      }
    }
  }

  // If deleting a record, don't send a body.
  let body = null;
  if (method !== 'DELETE') {
    body = JSON.stringify(formInput);
  }

  let baseURL = siteConfig['atlasEnvironments'][localStorage.getItem('env')];
  atlasRequest(baseURL, 'sites/' + params.current.id, query = '', method, body, params.current.etag)
    .then((response) => {
      bus.$emit('onMessage', {
        text: 'You have sent a ' + method + ' request to a site record. Site ID: ' + params.current.id,
        alertType: 'alert-success'
      });
      getSiteRecords(siteConfig['atlasEnvironments'][localStorage.getItem('env')])
        .then(data => siteListing.gridData = data)
    })
    .catch((error) => {
      console.log(error);
    });
}
