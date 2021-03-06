

import atlas from './atlas.ts';
import store from '../store.ts';

export default {

  /**
   * Gets a list of site records based on environment and pass data to template.
   *
   * @param siteRecords
   * @param envURL
   */
  get(siteRecords, envURL = null) {
    // If no environment passed in, then get from local storage.
    if (envURL === null) {
      envURL = store.state.atlasEnvironments[store.state.env];
    }

    // Only grab sites in the list.
    const idsArray = [];
    siteRecords.forEach((element) => {
      if (Array.isArray(element)) {
        idsArray.push(element.statistics);
      }
    });
    const idsString = '"' + idsArray.join('","') + '"';

    // Don't JSON encode since it escapes too much.
    let query = '?where={"_id":{"$in":[' + idsString + ']}}';
    query = '';

    // Response is a Promise object so we must resolve it to get the data out.
    return atlas.request(envURL, 'statistics', query)
      .then(data => this.formatStatsData(data));
  },

  /**
   * Need to format data for table.
   *
   * @param data
   */
  formatStatsData(data) {
    const formattedData = [];

    // Data can be a nested array if it has paging links.
    // This is why there are two loops through the data.
    data.forEach((elements) => {
      elements.forEach((element) => {
        const item = [];

        // Loop through object.
        Object.keys(element).forEach((part) => {
          // We are splitting out what is in the users section so that it can be
          // filtered by as well as exported in separate columns.
          if (part === 'users') {
            // Store emails and usernames separately for reporting.
            item.username = [];
            item.email_address = [];
            store.state.expressUserRoles.forEach((role) => {
              item.username = item.username.concat(element.users.username[role]);
              item.email_address = item.email_address.concat(element.users.email_address[role]);
            });

            // Include the actual stats, just in case.
            item.site_email_address = element.users.email_address;
            item.site_username = element.users.username;

            // Add counts.
            if (element.users.counts) {
              store.state.expressUserRoles.forEach((role) => {
                item[`${role}_count`] = element.users.counts[role];
              });
            }
          } else if (part === '_id') {
            item.stats_id = element[part];
          } else {
            // All other fields get added as is.
            // @todo create a way for adapters to be added to format data.
            item[part] = element[part];
          }
        });

        // Get bundles out.
        formattedData.push(item);
      });
    });

    return formattedData;
  },

  /**
   * Adds code records to siteListing object.
   *
   * @param siteRecords
   * @param statsRecords
   */
  addStatsToSites(siteRecords, statsRecords) {
    // Merge together arrays.
    statsRecords.forEach((element) => {
      // Extract index of siteRecords from element site ID.
      const siteIndex = siteRecords.findIndex(item => item.id === element.site);

      if (typeof siteRecords[siteIndex] !== 'undefined') {
        Object.keys(element).forEach((part) => {
          if (typeof element[part] !== 'undefined') {
            siteRecords[siteIndex][part] = element[part];
          } else {
            siteRecords[siteIndex][part] = 'N/A';
          }
        });
      }
    });

    // Set the sites data to be empty so computed variable combining sites, code,
    // and stats will update on refresh. The data doesn't add stats if that data
    // hasn't changed, which is likely between page load and refresh action.
    const options = {
      sitesData: siteRecords,
      statsData: statsRecords,
      cachedData: siteRecords,
    };

    store.commit('addSitesGridData', options);
  },
};
