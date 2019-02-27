/**
 * Contains all the functions for editing and updating Code Records.
 */

import atlas from './atlas';
import store from '../store';
import bus from './bus';

export default {
  /**
   * Gets a list of site records based on environment and pass data to template.
   */
  get() {
    // Check for query to add to code request.
    const query = localStorage.getItem('code-query') ? localStorage.getItem('code-query') : '';

    // Return a promise with formatted code data.
    return atlas.request(store.state.atlasEnvironments[store.state.env], 'code', query)
      .then(data => this.formatCodeData(data));
  },

  /**
   * Updates a code asset based on user input.
   *
   * @param {object} params
   * @param {string} method
   */
  update(params, method = 'PATCH') {
    // Define parts of code record that are nested in the meta field.
    const metaKeys = ['code_type', 'is_current', 'label', 'name', 'version', 'tag'];

    // Turn tag into an array.
    params.current.tag = params.current.tag.trim().split(',');

    // Capture and delete etag.
    const etag = params.current.etag;
    delete params.current.etag;

    // Take input values from formData and put into array for comparison.
    // Only return values that are different.
    const formInput = {};
    Object.keys(params.previous).forEach((key) => {
      // Check if values are different to add to PATCH.
      // Don't need to check etag since user can't change that on form.
      if (params.current[key] !== params.previous[key] && key !== 'etag') {
        // Need to put meta fields in right place.
        if (metaKeys.indexOf(key) !== -1) {
          // Initialize meta field if it doesn't exist yet.
          if (!formInput.meta) {
            formInput.meta = {};
          }
          formInput.meta[key] = params.current[key];
        } else {
          formInput[key] = params.current[key];
        }
      }
    });

    // If deleting a record, don't send a body.
    let body = {};
    if (method !== 'DELETE') {
      body = JSON.stringify(formInput);
    }

    const baseURL = store.state.atlasEnvironments[store.state.env];
    atlas.request(baseURL, 'code/' + params.current.id, '', method, body, etag)
      .then((resp) => {
        console.log(resp);
        if (typeof resp !== 'undefined') {
          // Wait a little (2 seconds) so the response has new entries.
          setTimeout(() => {
            bus.$emit('onMessage', {
              text: 'You have sent a ' + method + ' request to a code record. Code asset ID: ' + params.current.id,
              alertType: 'alert-success',
            });

            this.get(store.state.atlasEnvironments[store.state.env])
              .then((data) => {
                const options = {
                  codeData: data,
                  cachedData: data,
                };
                store.commit('addSitesGridData', options);
              });
          }, 2000);
        } else {
          bus.$emit('onMessage', {
            text: 'Something may have went wrong. Please check the browser\'s console log and network tab.',
            alertType: 'alert-success',
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  },

  /**
   * Need to format data for table.
   *
   * @param data
   */
  formatCodeData(data) {
    const formattedData = [];

    // Data can be a nested array if it has paging links.
    // This is why there are two loops through the data.
    data.forEach((elements) => {
      elements.forEach((element) => {
        const item = [];

        // Since the tag field is an array, we have to convert it back to a string.
        let tag = '';
        if (Array.isArray(element.meta.tag) && element.meta.tag.length) {
          tag = element.meta.tag.join();
        }

        item.label = element.meta.label;
        item.code_type = element.meta.code_type;
        item.name = element.meta.name;
        item.version = element.meta.version;
        item.tag = tag;
        item.is_current = element.meta.is_current;
        item.commit_hash = element.commit_hash;
        item.etag = element._etag;
        item.id = element._id;

        // Browsers other than Chrome can't handle the date format so it isn't formatted in a more human-readable way.
        item.created = element._created;
        item.updated = element._updated;

        formattedData.push(item);
      });
    });

    return formattedData;
  },

  /**
   * Adds code records to siteListing object.
   *
   * @param siteRecords
   * @param codeRecords
   */
  addCodeToSites(siteRecords, codeRecords) {
    const code = {
      cores: {},
      profiles: {},
      packages: {},
    };

    // Separate out code into profiles, cores, and packages.
    codeRecords.forEach((record) => {
      let label = record.label ? record.label + '-' : '';
      const version = record.version ? record.version : '';

      if (record.code_type === 'profile') {
        code.profiles[record.id] = label + version;
      }

      if (record.code_type === 'core') {
        code.cores[record.id] = label + version;
      }

      if (record.code_type === 'module' || record.code_type === 'theme') {
        // Use name of record as label since the repo name will always be there when labels aren't.
        // For core and profile the names are always the same, so the label is more descriptive.
        label = record.name ? record.name + '-' : '';
        code.packages[record.id] = label + version;
      }
    });

    // Store code assets.
    store.commit('addCodeAssets', code);

    const sitesAddOptions = Object.values(code.packages).map((el) => {
      const foo = {};
      foo.label = el;
      return foo;
    });

    store.commit('addAutocompleteOptions', { key: 'sitesAddOptions', options: sitesAddOptions });

    // Loop through site records to search for code.
    siteRecords.forEach((element, index) => {
      // Don't do anything if there is no code on the site record.
      if (typeof element.code === 'undefined') {
        return;
      }

      if (typeof element.code.core !== 'undefined') {
        const foundKeys = Object.keys(code.cores)
          .filter(key => key === element.code.core);
        siteRecords[index].core = code.cores[foundKeys[0]];
      }

      if (typeof element.code.profile !== 'undefined') {
        const foundKeys = Object.keys(code.profiles)
          .filter(key => key === element.code.profile);
        siteRecords[index].profile = code.profiles[foundKeys[0]];
      }

      if (typeof element.code.package !== 'undefined') {
        // Clear out packages first since we are pushing to an array.
        siteRecords[index].packages = [];

        element.code.package.forEach((element2) => {
          const foundKeys = Object.keys(code.packages)
            .filter(key => key === element2);
          siteRecords[index].packages.push(code.packages[foundKeys[0]]);
        });
      }
    });

    const options = {
      codeData: codeRecords,
      cachedData: siteRecords,
      sitesData: siteRecords,
    };

    store.commit('addSitesGridData', options);
  },
};
