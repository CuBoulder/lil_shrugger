/**
 * Gets a list of site records based on environment and pass data to template.
 *
 * @param envURL
 */
function getSiteRecords(envURL = null) {
  // If no environment passed in, then get from local storage.
  if (envURL === null) {
    envURL = store.state.atlasEnvironments[store.state.env];
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
      let updated_date = new Date(element._updated);
      let created_date = new Date(element._created);
      let options = {
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
  let baseURL = store.state.atlasEnvironments[store.state.env];
  let endpoint = 'sites';

  // @todo Add more fields here so you can create a site with different assets than current.
  let data = JSON.stringify({
    "status": "pending"
  });

  atlasRequest(baseURL, endpoint, query = '', method = 'POST', body = data)
    .then(response =>
      getSiteRecords(store.state.atlasEnvironments[store.state.env])
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

  let baseURL = store.state.atlasEnvironments[store.state.env];
  atlasRequest(baseURL, 'sites/' + params.current.id, query = '', method, body, params.current.etag)
    .then((response) => {
      bus.$emit('onMessage', {
        text: 'You have sent a ' + method + ' request to a site record. Site ID: ' + params.current.id,
        alertType: 'alert-success'
      });

      getSiteRecords(store.state.atlasEnvironments[store.state.env])
        .then(data => siteListing.gridData = data);
    })
    .catch((error) => {
      console.log(error);
    });
}

/**
 * Adds code records to siteListing object.
 *
 * @param siteRecords
 * @param codeRecords
 */
function addCodeToSites(siteRecords, codeRecords) {
  let code = {
    cores: {},
    profiles: {},
    packages: {},
  };

  // Separate out code into profiles, cores, and packages.
  codeRecords.forEach(function (record, index) {

    let label = record['label'] ? record['label'] + '-' : '';
    let version = record['version'] ? record['version'] : '';

    if (record['code_type'] === 'profile') {
      code.profiles[label + version] = record['id'];
    }

    if (record['code_type'] === 'core') {
      code.cores[[label + version]] = record['id'];
    }

    if (record['code_type'] === 'module' || record['code_type'] === 'theme') {
      // Use name of record as label since the repo name will always be there when labels aren't.
      // For core and profile the names are always the same, so the label is more descriptive.
      label = record['name'] ? record['name'] + '-' : '';
      code.packages[[label + version]] = record['id'];
    }
  });

  // Loop through site records to search for code.
  siteRecords.forEach(function (element, index) {

    // Don't do anything if there is no code on the site record.
    if (typeof element['code'] === 'undefined') {
      return;
    }

    if (typeof element['code']['core'] !== 'undefined') {
      let foundKeys = Object.keys(code.cores).filter(function (key) {
        return code.cores[key] === element['code']['core'];
      });
      siteRecords[index]['core'] = foundKeys[0];
    }

    if (typeof element['code']['profile'] !== 'undefined') {
      let foundKeys = Object.keys(code.profiles).filter(function (key) {
        return code.profiles[key] === element['code']['profile'];
      });
      siteRecords[index]['profile'] = foundKeys[0];
    }

    if (typeof element['code']['package'] !== 'undefined') {
      // Clear out packages first since we are pushing to an array.
      siteRecords[index]['packages'] = [];

      element['code']['package'].forEach(function (element2, index2) {
        let foundKeys = Object.keys(code.packages).filter(function (key) {
          return code.packages[key] === element2;
        });
        siteRecords[index]['packages'].push(foundKeys[0]);
      });
    }
  });

  Vue.set(siteListing.codeData, siteRecords);
  // Cache the result until the next request.
  Vue.set(siteListing.cachedRecords, siteRecords);
}


/**
 * Gets a list of site records based on environment and pass data to template.
 *
 * @param envURL
 */
function getStatsRecords(siteRecords, envURL = null) {
  // If no environment passed in, then get from local storage.
  if (envURL === null) {
    envURL = store.state.atlasEnvironments[store.state.env];
  }

  // Only grab sites in the list.
  let idsArray = [];
  siteRecords.forEach(function (element, index) {
    if (Array.isArray(element)) {
      idsArray.push(element['statistics']);
    }
  });
  let idsString = '"' + idsArray.join('","') + '"';

  // Don't JSON encode since it escapes too much.
  let query = '?where={"_id":{"$in":[' + idsString + ']}}';
  query = '';

  // Response is a Promise object so we must resolve it to get the data out.
  return atlasRequest(envURL, 'statistics', query)
    .then(data => formatStatsData(data));
}

/**
 * Need to format data for table.
 *
 * @param data
 */
function formatStatsData(data) {
  let formattedData = [];

  // Data can be a nested array if it has paging links.
  // This is why there are two loops through the data.
  data.forEach(function (elements, index) {
    elements.forEach(function (element, index2) {
      let item = [];

      // Loop through object.
      for (part in element) {

        // We are splitting out what is in the users section so that it can be filtered by as well as exported in separate columns.
        if (part === 'users') {
          item['username'] = [].concat(element['users']['username']['content_editor'], element['users']['username']['site_contact']);
          item['email_address'] = [].concat(element['users']['email_address']['content_editor'], element['users']['email_address']['site_contact']);
          continue;
        }

        // All other fields get added as is.
        // @todo create a way for adpaters to be added to format data.
        item[part] = element[part];
      }

      // Get bundles out
      formattedData.push(item);
    });
  });

  return formattedData;
}

/**
 * Adds code records to siteListing object.
 *
 * @param siteRecords
 * @param statsRecords
 */
function addStatsToSites(siteRecords, statsRecords) {

  // Merge together arrays.
  let newRecords = [];
  statsRecords.forEach(function (element, index) {

    // Extract index of siteRecords from element site ID.
    let siteIndex = siteRecords.findIndex(function (item) {
      return item['id'] === element['site'];
    });

    if (typeof siteRecords[siteIndex] !== 'undefined') {
      for (part in element) {
        if (typeof element[part] !== 'undefined') {
          siteRecords[siteIndex][part] = element[part];
        } else {
          siteRecords[siteIndex][part] = 'N/A';
        }
      }
    }
  });

  // Set the sites data to be empty so computed variable combining sites, code, and stats will update on refresh.
  // The data doesn't add stats if that data hasn't changed, which is likely between page load and refresh action.
  Vue.set(siteListing.sitesData, []);

  Vue.set(siteListing.statsData, siteRecords);
  // Cache the result until the next request.
  Vue.set(siteListing.cachedRecords, siteRecords);
}
