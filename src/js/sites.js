/**
 * @file
 * Contains all functions related to updating and formatting site records.
 */

import atlas from './atlas';
import store from '../vuex/store';
import bus from './bus';
import shrugger from './shrugger';

export default {
  /**
   * Gets a list of site records based on environment and pass data to template.
   *
   * @param envURL
   */
  get(envURL = null) {
    // If no environment passed in, then get from local storage.
    if (envURL === null) {
      envURL = store.state.atlasEnvironments[store.state.env];
    }

    // Check for query to add to code request.
    const query = localStorage.getItem('sites-query') ? localStorage.getItem('sites-query') : store.state.defaultSitesQuery;

    // Response is a Promise object so we must resolve it to get the data out.
    return atlas.request(envURL, 'sites', query)
      .then(data => this.formatSiteData(data));
  },

  /**
   * Need to format data for table.
   *
   * @param data
   */
  formatSiteData(data) {
    const formattedData = [];

    // Data can be a nested array if it has paging links.
    // This is why there are two loops through the data.
    data.forEach((elements) => {
      elements.forEach((element) => {
        const item = [];

        // item['id'] = element.sid;
        item.path = element.path;
        item.status = element.status;
        item.updated = new Date(element._updated);
        item.created = new Date(element._created);
        item.etag = element._etag;
        item.id = element._id;
        item.statistics = element.statistics;
        item.code = element.code;
        item.update_group = element.update_group;

        item.core = '';
        item.profile = '';
        item.packages = [];
        formattedData.push(item);
      });
    });

    return formattedData;
  },

  /**
   * Creates a site record.
   */
  create() {
    const baseURL = store.state.atlasEnvironments[store.state.env];
    const endpoint = 'sites';

    // @todo Add more fields here so you can create a site with different assets than current.
    const data = JSON.stringify({
      status: 'pending',
    });

    atlas.request(baseURL, endpoint, '', 'POST', data)
      .then(() => {
        // Wait a little so the response has new entries.
        shrugger.wait(5000);

        this.get(store.state.atlasEnvironments[store.state.env])
        .then((records) => {
          store.commit('addSitesGridData', { sitesData: records });
          bus.$emit('onMessage', {
            text: 'Successfully created a site.',
            alertType: 'alert-success',
          });
        })
        .catch((error) => {
          console.log(error);
        });
      });
  },

  /**
   * Updates a site record based on user input.
   *
   * @param params
   * @param method
   */
  update(params, method = 'PATCH') {
    // Define parts of code record that are nested in the settings field.
    const settingsKeys = ['page_cache_maximum_age'];

    // Take input values from formData and put into array for comparison.
    // Only return values that are different.
    const formInput = {};
    Object.keys(params.previous).forEach((key) => {
      // Check if values are different to add to PATCH.
      // Don't need to check etag since user can't change that on form.
      if (params.current[key] !== params.previous[key] && key !== 'etag') {
        // Need to put meta fields in right place.
        if (settingsKeys.indexOf(key) !== -1) {
          // Initialize meta field if it doesn't exist yet.
          if (!formInput.settings) {
            formInput.settings = {};
          }
          formInput.settings[key] = params.current[key];
        } else {
          formInput[key] = params.current[key];
        }
      }
    });

    // If deleting a record, don't send a body.
    let body = null;
    if (method !== 'DELETE') {
      body = JSON.stringify(formInput);
    }

    const baseURL = store.state.atlasEnvironments[store.state.env];
    atlas.request(baseURL, 'sites/' + params.current.id, '', method, body, params.current.etag)
      .then(() => {
        // Wait a little so the response has new entries.
        shrugger.wait(5000);

        bus.$emit('onMessage', {
          text: 'You have sent a ' + method + ' request to a site record. Site ID: ' + params.current.id,
          alertType: 'alert-success',
        });

        this.get(store.state.atlasEnvironments[store.state.env])
          .then((data) => {
            store.commit('addSitesGridData', { sitesData: data });
          });
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
