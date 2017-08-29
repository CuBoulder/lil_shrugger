/**
 * These routes will appear in the navbar menu.
 *
 * The baseURL variable comes from the settings.html page.
 */
let baseURL = '';
if (localStorage.getItem('baseURL') !== null) {
  baseURL = localStorage.getItem('baseURL');
}

let routes = [
  {name: 'Sites', path: baseURL},
  {name: 'Code', path: baseURL + '/code.html'},
  {name: 'Packages', path: baseURL + '/update-sites.html'},
  {name: 'Settings', path: baseURL + '/settings.html'},
];
