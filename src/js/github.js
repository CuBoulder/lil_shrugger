

var repoList = [];
var branchList = [];

/**
 * Returns an array of CuBoulder repos and branches.
 *
 * @returns {Array}
 */
function getGitHubRepos() {
  let headers = new Headers();
  let auth = btoa(siteConfig.gitHub.username + ':' + siteConfig.gitHub.token);
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', 'Basic ' + auth);

  let myInit = {
    method: 'GET',
    headers: headers,
    //mode: 'cors',
    //cache: 'default',
    timeout: 15,
  };

  return fetch('https://api.github.com/orgs/CuBoulder/repos?per_page=100', myInit)
    .then(handleErrors)
    .then(response => response.json())
    .then(function(data) {
      // Sort by pushed at date.
      data.sort(function (a, b) {
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      });

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
  /*
  let auth = btoa(siteConfig.gitHub.username + ':' + siteConfig.gitHub.token);
  let branchReq = new XMLHttpRequest();

  branchReq.open("GET", 'https://api.github.com/repos/CuBoulder/' + repo + '/branches?per_page=100', false);
  branchReq.setRequestHeader('Authorization', 'basic ' + auth);
  branchReq.setRequestHeader('Content-Type', 'application/json');

  branchReq.addEventListener('load', function () {
   branchList = JSON.parse(this.responseText);
  });

  branchReq.send();

  return branchList;
  */

  let headers = new Headers();
  let auth = btoa(siteConfig.gitHub.username + ':' + siteConfig.gitHub.token);
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', 'Basic ' + auth);

  let myInit = {
    method: 'GET',
    headers: headers,
    //mode: 'cors',
    //cache: 'default',
    timeout: 15,
  };

  return fetch('https://api.github.com/repos/CuBoulder/' + repo + '/branches?per_page=100', myInit)
    .then(handleErrors)
    .then(response => response.json())
    .catch(error => error);
}
