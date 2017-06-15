/**
 * Creates a site with the currently selected environment.
 */
$(document).ready(function () {

  // Click to create new site.
  let myEl = document.getElementById('create-site');

  myEl.addEventListener('click', function() {
    let data = JSON.stringify({
      "status": "pending"
    });

    let xhr = new XMLHttpRequest();

    let current_env = getAtlasURL(document.querySelector('.env-list .selected').innerHTML);
    current_env = current_env + 'sites';

    xhr.open("POST", current_env);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("authorization", "Basic " + siteConfig['postman_token']);

    xhr.send(data);
  }, false);

});