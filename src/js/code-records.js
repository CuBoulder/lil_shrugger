
/**
 * Gets a list of site records based on environment and pass data to template.
 *
 * @param env
 */
function getCodeRecords(env) {
  // Check for query to add to code request.
  let query = localStorage.getItem('code-query');
  if (query === null) {
    query = '';
  }

  // Return a promise with formatted code data.
  return atlasRequest(store.state.atlasEnvironments[store.state.env], 'code', query).then(function (data) {
    return formatCodeData(data);
  });
}

/**
 * Need to format data for table.
 *
 * @param data
 */
function formatCodeData(data) {
  let formattedData = [];

  // Data can be a nested array if it has paging links.
  // This is why there are two loops through the data.
  data.forEach(function (elements, index) {
    elements.forEach(function (element, index) {
      let item = [];
      item['label'] = element.meta.label;
      item['code_type'] = element.meta.code_type;
      item['name'] = element.meta.name;
      item['version'] = element.meta.version;
      item['tag'] = element.meta.tag;
      item['is_current'] = element.meta.is_current;
      item['commit_hash'] = element.commit_hash;
      item['etag'] = element._etag;
      item['id'] = element._id;
      formattedData.push(item);
    });
  });

  return formattedData;
}

/**
 * Updates a code asset based on user input.
 *
 * @param params
 * @param method
 */
function updateCodeRecord(params, method = 'PATCH') {

  // Define parts of code record that are nested in the meta field.
  let metaKeys = ['code_type', 'is_current', 'label', 'name', 'version', 'tag'];

  // Turn tag into an array.
  params.current['tag'] = [params.current['tag']];

  // Take input values from formData and put into array for comparison.
  // Only return values that are different.
  let formInput = {};
  for (key in params.previous) {

    // Check if values are different to add to PATCH.
    // Don't need to check etag since user can't change that on form.
    if (params.current[key] !== params.previous[key] && key !== 'etag') {

      // Need to put meta fields in right place.
      if (metaKeys.indexOf(key) !== -1) {
        // Initialize meta field if it doesn't exist yet.
        if (!formInput['meta']) {
          formInput['meta'] = {};
        }
        formInput['meta'][key] = params.current[key];
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
  atlasRequest(baseURL, 'code/' + params.current.id, query = '', method, body, params.current.etag)
    .then(function (response) {
      bus.$emit('onMessage', {
        text: 'You have sent a ' + method + ' request to a site record. Site ID: ' + params.current.id,
        alertType: 'alert-success'
      });

      getCodeRecords(store.state.atlasEnvironments[store.state.env])
        .then(data => codeListing.gridData = data)
    })
    .catch((error) => {
      console.log(error);
    });
}


