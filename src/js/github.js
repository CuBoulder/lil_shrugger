/**
 * @file
 * Contains functionality for interacting with the GitHub API.
 */

let currentURL = ''
let myInit = initializeHeaders();
// This function returns the data based on the current page.
let foo = function (pageLink = null) {
  // Use paging link if it exists.
  // The paging link contains the endpoint and query.
  let url = ''
  if (pageLink !== null) {
    url = pageLink
  } else {
    url = currentURL
  }

  let link = ''
  return Promise.resolve(
    fetch(url, myInit)
      .then(handleErrors)
      .then(function (response) {
        link = response.headers
        return response.json()
      })
      .then(function (data) {
        return {
          headers: link,
          data: data
        }
      })
      .catch((error) => {
        bus.$emit('onMessage', {
          text: 'Error in Atlas Request: ' + error,
          alertType: 'alert-danger'
        })
        console.log(error)
      })
  );
};

// This is a wrapper function so all of the data can be returned neatly.
let fetchData = function () {
  // This function does the actual looping through the paging links until
  // it gets to the last page and then exits.
  let recursiveFetch = function (finalData, pageLink) {
    // Call Atlas with the correct page link.
    return foo(pageLink)
      .then(handleErrors)
      .then(function (object) {
        // By pushing the data to an array that exists in recursion, we
        // can return the compiled array.
        // Trying to return a variable outside this lexical scope won't work
        // Since that would be declared synchronously.
        finalData.push(object.data)

        // Check if more pages exist.
        let headerLink = object.headers.get('Link')
        if (headerLink) {
          let nextLink = headerLink.split(',')[0].split(';')
          // Fetch next page if link exists.
          if (nextLink[1].trim() === 'rel="next"') {
            return recursiveFetch(finalData, nextLink[0].slice(1, -1))
          } else {
            return finalData
          }
        } else {
          return finalData
        }
      })
      .catch(error => console.log(error))
  };

  // Finally call recursive function and return a promise with the data in it.
  return recursiveFetch([], null)
}

/**
 * Returns an array of CuBoulder repos and branches.
 *
 * @returns {Array}
 */
function getGitHubRepos() {
  currentURL = 'https://api.github.com/orgs/CuBoulder/repos?per_page=100'

  // Pass the resolved promise along.
  return fetchData()
    .then(function (data) {

      // Combine data into one array.
      let allData = []
      data.forEach(function (element, index) {
        element.forEach(function (part, index2) {
          allData.push(part)
        })
      })

      // Sort alphabetically or by updated date if repo-listing = true.
      if (localStorage.getItem('repo-listing') === "true") {
        allData.sort(function (a, b) {
          return new Date(b.pushed_at) - new Date(a.pushed_at)
        })
      } else {
        allData.sort(function (a, b) {
          if (a.name < b.name) {
            return -1
          }
          if (a.name > b.name) {
            return 1
          }
          return 0
        });
      }

      // Add a default; otherwise user can't select first element.
      let first = {
        name: '-Select-'
      };
      allData.unshift(first)

      return allData
    })
    .catch(error => error);
}

/**
 * Gets a list of branches based on repo.
 *
 * @param repo
 * @returns {Array}
 */
function getRepoBranches(repo) {
  currentURL = 'https://api.github.com/repos/CuBoulder/' + repo + '/branches?per_page=100'

  return fetchData()
    .then(handleErrors)
    .then(function (data) {
      // Combine data into one array.
      let allData = []
      data.forEach(function (element, index) {
        element.forEach(function (part, index2) {
          allData.push(part);
        })
      })
      return allData
    })
    .catch(error => error);
}

/**
 * Takes a GitHub repo and returns the most recent commit regardless of branch.
 *
 * @param repo
 * @param that
 * @returns {string}
 */
function getLatestCommit(repo, that = null) {

  // Need to account for stupid Drupal repo name.
  if (repo === 'drupal') {
    repo = 'drupal-7.x'
  }

  return fetch('https://api.github.com/repos/CuBoulder/' + repo + '/commits', myInit)
    .then(handleErrors)
    .then(response => response.json())
    .then(function (data) {
      // Return first listed commit and passed in object if exists.
      return {
        hash: data[0].sha,
        object: that
      };
    })
    .catch(error => error);
}

/**
 * Initializes common headers used in GitHub requests.
 *
 * @returns {{method: string, headers: Headers, timeout: number}}
 */
function initializeHeaders() {
  let headers = new Headers();
  let auth = btoa(localStorage.getItem('github-username') + ':' + localStorage.getItem('github-token'));
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', 'Basic ' + auth);

  let myInit = {
    method: 'GET',
    headers: headers,
    //mode: 'cors',
    //cache: 'default',
    timeout: 15,
  };

  return myInit;
}
