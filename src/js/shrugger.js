/**
 * @file
 * Contains utility functions for the lil_shrugger application.
 */

import store from '../vuex/store';
import Router from '../router/index';
import bus from './bus';


export default {
  /**
   * This function can be placed before any call to an external service or when
   * performing an operation that might fail.
   *
   * @param response
   * @returns {*}
   */
  handleErrors(response) {
    if (!response.ok) {
      // @todo Figure out why the Vue object is being passed in as a response.
      console.log(response);
      bus.$emit('onMessage', {
        text: '<strong>Error in Atlas Request:</strong>' +
          '<br/>Status Code: ' + response.status +
          '<br/>Text: ' + response.statusText +
          '<br/>URL: ' + response.url,
        alertType: 'alert-danger' },
      );
      // throw Error(response.statusText);
    }
    return response;
  },
  /**
   * PRIVATE
   * Flatten a deep object into a one level object with it’s path as key
   *
   * @param  {object} object - The object to be flattened
   *
   * @return {object}        - The resulting flat object
   */
  flatten(object) {
    return Object.assign({}, ...(function _flatten(objectBit, path = '') { // spread the result into our return object
      return [].concat( // concat everything into one level
        ...Object.keys(objectBit).map( // iterate over object
          key => (typeof objectBit[key] === 'object' ? // check if there is a nested object
            _flatten(objectBit[key], `${path}/${key}`) : // call itself if there is
            ({ [`${path}/${key}`]: objectBit[key] })), // append object with it’s path as key
        ));
    }(object)));
  },

  /**
   * Checks whether user can access permissions.
   *
   * @param permission
   *
   * @returns {boolean}
   */
  userAccess(permission = null) {
    // Add the page component name for more granular permissions.
    const router = Router;

    // Check to see if permission is in permissions array.
    return store.state.userPermissions.includes(router.currentRoute.name + ':' + permission);
  },

  /**
   * Converts a string to Unicode based on the Mongo DB query syntax.
   *
   * @param string
   * @returns {*}
   */
  convertToUnicode(string = null) {
    // If no string, then return.
    if (string === null) {
      console.log('No string passed into Unicode conversion function.');
      return null;
    }

    // These values all come from characters used for queries sent to Atlas.
    let newString = string.replace(new RegExp('{', 'g'), '\\u007B');
    newString = newString.replace(new RegExp('}', 'g'), '\\u007d');
    newString = newString.replace(new RegExp(/\[/, 'g'), '\\u005B');
    newString = newString.replace(new RegExp(/\]/, 'g'), '\\u005D');
    newString = newString.replace(new RegExp('"', 'g'), '\\u0022');
    newString = newString.replace(new RegExp(':', 'g'), '\\u003a');
    newString = newString.replace(new RegExp(',', 'g'), '\\u002c');
    newString = newString.replace(new RegExp(/\$/, 'g'), '\\u0024');

    return newString;
  },

  /**
   * Sets a delay in milliseconds.
   *
   * @param time
   * @returns {Promise}
   */
  sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  },

  /**
   * Grabs the filter query and sets filterKey if it exists.
   */
  setFilterFromQuery() {
    // If filter is in URL, then place that in filter input.
    // Check for query params.
    if (window.location.search !== '') {
      // Format the query params into an array.
      const queryParams = {};
      window.location.search.slice(1).split('&').map((item) => {
        const parts = item.split('=');
        queryParams[parts[0]] = parts[1];
      });

      // Get property names to match to filter and search.
      const propertyNames = Object.getOwnPropertyNames(queryParams);

      if (propertyNames.indexOf('filter') !== -1) {
        store.commit('setFilterKey', queryParams.filter);
      }
    }
  },
};
