
import utilities from './shrugger';
// import bus from './bus';
import store from '../vuex/store';

export default {

  /**
   * Makes a request to Atlas.
   *
   * @param {string} baseURL
   * @param endpoint
   * @param query
   * @param method
   * @param body
   * @param etag
   * @returns {Promise.<TResult>}
   */
  request(baseURL, endpoint, query = '', method = 'GET', body = null, etag = null) {
    // Setup headers to send to Atlas.
    const headers = new Headers();
    const auth = btoa(`${localStorage.getItem('atlas-username')}:${localStorage.getItem('atlas-password')}`);
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Basic ${auth}`);

    // The etag is only needed when doing write operations.
    if (method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
      headers.set('If-Match', etag);
    }

    const requestURL = baseURL + endpoint + query;
    const myInit = {
      method,
      headers,
      timeout: 15,
      cache: 'no-store',
    };

    // If body, then add it.
    if (body !== null) {
      myInit.body = body;
    }

    // Send different request based on if GET.
    // GET requests can have paging links.
    if (method !== 'GET') {
      return fetch(requestURL, myInit)
        .then(utilities.handleErrors)
        .then((response) => {
          console.log(response);
          if (response.statusText === 'NO CONTENT') {
            return {};
          }
          return response.json();
        })
        .catch((error) => {
          console.log(error);
        });
    }

    // This function returns the data based on the current page.
    const foo = function foo(pageLink = null) {
      // Use paging link if it exists.
      // The paging link contains the endpoint and query.
      let url = '';
      if (pageLink !== null) {
        url = baseURL + pageLink;
      } else {
        url = baseURL + endpoint + query;
      }

      return Promise.resolve(fetch(url, myInit)
        .then(utilities.handleErrors)
        .then(response => response.json())
        .catch((error) => {
          console.log(error);

          // I don't know how to signal CORS errors to the user.
          // I do know that it will always have the type error below.
          // Type coercison is used here since the error object is weird to me.
          /* eslint-disable */
          /*
          if (error == 'TypeError: Failed to fetch') {
            bus.$emit('onMessage', {
              text: `<strong>Error in Atlas Request</strong><br>
                     <strong>Error Message:</strong> ${error}<br>
                     You can <a href="https://github.com/CuBoulder/lil_shrugger/wiki/TypeError:-Failed-to-fetch">
                     read more about error messages</a> on the wiki.`,
              alertType: 'alert-danger' },
            );
          } */
          /* eslint-enable */
          throw Error(error);
        }));
    };

    // This is a wrapper function so all of the data can be returned neatly.
    const fetchData = function fetchData() {
      // This function does the actual looping through the paging links until
      // it gets to the last page and then exits.
      const recursiveFetch = function recursiveFetch(finalData, pageLink) {
        // Call Atlas with the correct page link.
        return foo(pageLink)
          .then((data) => {
            // This can be a query for just a single asset.
            // If it is, we can tell that from having no data._items.
            if (typeof data._items === 'undefined') {
              finalData.push(data);
              return finalData;
            }

            // By pushing the data to an array that exists in recursion, we
            // can return the compiled array.
            // Trying to return a variable outside this lexical scope won't work
            // Since that would be declared synchronously.
            finalData.push(data._items);

            // Check if more pages exist.
            if (data._links.next) {
              return recursiveFetch(finalData, data._links.next.href);
            }
            return finalData;
          })
          .catch(error => console.log(error));
      };

      // Finally call recursive function and return a promise with the data in it.
      return recursiveFetch([], null);
    };

    // Pass the resolved promise along.
    return fetchData();
  },

  /**
   * Adds Atlas commands to the data store.
   */
  getCommands() {
    this.request(store.state.atlasEnvironments[store.state.env], 'drush')
      .then((response) => {
        store.commit('setCommands', response);
      });
  },

  /**
   * Adds queries to the data store.
   */
  getQueries() {
    this.request(store.state.atlasEnvironments[store.state.env], 'query')
      .then((response) => {
        store.commit('setQueries', response);
      });
  },
};
