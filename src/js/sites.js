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

        // Add the homepage path so it can be used in the Sites component display.
        if (typeof element.pool !== 'undefined' && element.pool === 'poolb-homepage' && element.f5only === false) {
          store.commit('storeHomepageP1', element.path);
        }

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
  create(params) {
    const baseURL = store.state.atlasEnvironments[store.state.env];
    const endpoint = 'sites';
    const assets = store.state.codeAssets;

    const body = {
      status: 'pending',
      code: {},
    };

    // Match core label to asset id.
    Object.keys(assets.cores).forEach((el) => {
      if (assets.cores[el] === params.row.core) {
        body.code.core = el;
      }
    });

    // Match profile label to asset id.
    Object.keys(assets.profiles).forEach((el) => {
      if (assets.profiles[el] === params.row.profile) {
        body.code.profile = el;
      }
    });

    // Match core label to asset id.
    Object.keys(assets.packages).forEach((el) => {
      if (params.row.packages.includes(assets.packages[el])) {
        if (typeof body.code.package === 'undefined') {
          body.code.package = [];
        }
        body.code.package.push(el);
      }
    });

    const data = JSON.stringify(body);
    atlas.request(baseURL, endpoint, '', 'POST', data)
      .then((resp) => {
        console.log(resp);
        if (typeof resp !== 'undefined') {
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
        }
      });
  },

  /**
   * Updates a site record based on user input.
   *
   * @param params
   * @param method
   */
  update(params, method = 'PATCH') {
    // If deleting a record, don't send a body.
    let body = null;

    if (method !== 'DELETE') {
      // Define parts of code record that are nested in the settings field.
      const codeKeys = ['core', 'profile', 'packages'];

      // Take input values from formData and put into array for comparison.
      // Only return values that are different.
      const formInput = {};
      Object.keys(params.previous).forEach((key) => {
        // Check if values are different to add to PATCH.
        // Don't need to check etag since user can't change that on form.
        if (params.current[key] !== params.previous[key] && key !== 'etag') {
          // Need to put meta fields in right place.
          if (codeKeys.indexOf(key) !== -1) {
            // Initialize meta field if it doesn't exist yet.
            if (!formInput.code) {
              formInput.code = {};
            }
            formInput.code[key] = params.current[key];
          } else {
            formInput[key] = params.current[key];
          }
        }
      });

      // In Atlas the "package" array is called "packages" when you update it.
      // So, we will rename that part of the code array to reflect the difference in semantics.
      if (typeof formInput.code.packages !== 'undefined') {
        formInput.code.package = formInput.code.packages;
        delete formInput.code.packages;
      }

      // Match labels to code asset IDs.
      const assets = store.state.codeAssets;
      Object.keys(formInput.code).forEach((el) => {
        if (el === 'package') {
          const tempPackages = formInput.code.package;
          formInput.code.package = [];
          Object.keys(assets.packages).forEach((elm) => {
            if (tempPackages.includes(assets.packages[elm])) {
              formInput.code.package.push(elm);
            }
          });
        }

        if (el === 'core') {
          Object.keys(assets.cores).forEach((elm) => {
            if (formInput.code.core === assets.cores[elm]) {
              formInput.code.core = elm;
            }
          });
        }

        if (el === 'profile') {
          Object.keys(assets.profiles).forEach((elm) => {
            if (formInput.code.profile === assets.profiles[elm]) {
              formInput.code.profile = elm;
            }
          });
        }
      });

      body = JSON.stringify(formInput);
    }

    const baseURL = store.state.atlasEnvironments[store.state.env];
    atlas.request(baseURL, 'sites/' + params.current.id, '', method, body, params.current.etag)
      .then((resp) => {
        console.log(resp);
        if (typeof resp !== 'undefined') {
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
        }
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
