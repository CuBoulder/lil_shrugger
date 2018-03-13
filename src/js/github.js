/**
 * @file
 * Contains functionality for interacting with the GitHub API.
 */

import shrugger from './shrugger';

export default {

  // This is a wrapper function so all of the data can be returned neatly.
  fetchData(passedUrl) {
    // This function does the actual looping through the paging links until
    // it gets to the last page and then exits.
    const that = this;
    const recursiveFetch = function recursiveFetch(finalData, pageLink, passedUrl) {
      // This function returns the data based on the current page.
      function foo(pageLink = null, passedUrl) {
        // Use paging link if it exists.
        // The paging link contains the endpoint and query.
        let url = '';
        if (pageLink !== null) {
          url = pageLink;
        } else {
          url = passedUrl;
        }

        let link = '';
        const myInit = that.initializeHeaders();
        return Promise.resolve(fetch(url, myInit)
          .then(shrugger.handleErrors)
          .then((response) => {
            link = response.headers;
            return response.json();
          })
          .then(data => ({
            headers: link,
            data,
          }))
          .catch((error) => {
            console.log(error);
          }));
      }

      // Call Atlas with the correct page link.
      return foo(pageLink, passedUrl)
        .then((object) => {
          // By pushing the data to an array that exists in recursion, we
          // can return the compiled array.
          // Trying to return a variable outside this lexical scope won't work
          // Since that would be declared synchronously.
          finalData.push(object.data);

          // Check if more pages exist.
          const headerLink = object.headers.get('Link');
          if (headerLink) {
            const nextLink = headerLink.split(',')[0].split(';');
            // Fetch next page if link exists.
            if (nextLink[1].trim() === 'rel="next"') {
              return recursiveFetch(finalData, nextLink[0].slice(1, -1));
            }
            return finalData;
          }
          return finalData;
        })
        .catch(error => console.log(error));
    };

    // Finally call recursive function and return a promise with the data in it.
    return recursiveFetch([], null, passedUrl);
  },

  // Returns an array of CuBoulder repos and branches.
  getRepos() {
    const currentUrl = 'https://api.github.com/orgs/CuBoulder/repos?per_page=100';

    // Pass the resolved promise along.
    return this.fetchData(currentUrl)
      .then((data) => {
        // Combine data into one array.
        const allData = [];
        data.forEach((element) => {
          element.forEach((part) => {
            allData.push(part);
          });
        });

        // Sort alphabetically or by updated date if repo-listing = true.
        if (localStorage.getItem('repo-listing') === 'true') {
          allData.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
        } else {
          allData.sort((a, b) => {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          });
        }

        // Add a default; otherwise user can't select first element.
        const first = {
          name: '-Select-',
        };
        allData.unshift(first);

        return allData;
      })
      .catch(error => error);
  },

  /**
   * Gets a list of branches based on repo.
   *
   * @param repo
   * @returns {Array}
   */
  getBranches(repo) {
    const currentURL = 'https://api.github.com/repos/CuBoulder/' + repo + '/branches?per_page=100';

    return this.fetchData(currentURL)
      .then((data) => {
        // Combine data into one array.
        const allData = [];
        data.forEach((element) => {
          element.forEach((part) => {
            allData.push(part);
          });
        });
        return allData;
      })
      .catch(error => error);
  },

  /**
   * Takes a GitHub repo and returns the most recent commit regardless of branch.
   *
   * @param repo
   * @param that
   * @returns {string}
   */
  getLatestCommitByRepo(repo, that = null) {
    const myInit = this.initializeHeaders();

    // Need to account for stupid Drupal repo name.
    if (repo === 'drupal') {
      repo = 'drupal-7.x';
    }

    return fetch('https://api.github.com/repos/CuBoulder/' + repo + '/commits', myInit)
      .then(shrugger.handleErrors)
      .then(response => response.json())
      .then(data =>
        ({
          hash: data[0].sha,
          object: that,
        }))
      .catch(error => error);
  },

  /**
   * Initializes common headers used in GitHub requests.
   *
   * @returns {{method: string, headers: Headers, timeout: number}}
   */
  initializeHeaders() {
    const headers = new Headers();
    const auth = btoa(localStorage.getItem('github-username') + ':' + localStorage.getItem('github-token'));
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', 'Basic ' + auth);

    return {
      method: 'GET',
      headers,
      // mode: 'cors',
      // cache: 'default',
      timeout: 15,
    };
  },
};
