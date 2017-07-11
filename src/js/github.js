/**
 * @file
 * Contains functionality for interacting with the GitHub API.
 */

/**
 * Returns an array of CuBoulder repos and branches.
 *
 * @returns {Array}
 */
function getGitHubRepos() {
  let myInit = initializeHeaders();

  return fetch('https://api.github.com/orgs/CuBoulder/repos?per_page=100', myInit)
    .then(handleErrors)
    .then(response => response.json())
    .then(function(data) {
      // Sort alphabetically or by updated date if repo-listing = true.
      if (localStorage.getItem('repo-listing') === "true") {
        data.sort(function (a, b) {
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        });
      } else {
        data.sort(function (a, b) {
          if (a.name < b.name) {return -1}
          if (a.name > b.name) {return 1}
          return 0;
        });
      }

      // Add a default; otherwise user can't select first element.
      let first = {
        name: '-Select-'
      };
      data.unshift(first);

      return data;
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
  let myInit = initializeHeaders();

  return fetch('https://api.github.com/repos/CuBoulder/' + repo + '/branches?per_page=100', myInit)
    .then(handleErrors)
    .then(response => response.json())
    .catch(error => error);
}

/**
 * Takes a GitHub repo and returns the most recent commit regardless of branch.
 *
 * @param repo
 * @returns {string}
 */
function getLatestCommit(repo, that = null) {
  let myInit = initializeHeaders();

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
