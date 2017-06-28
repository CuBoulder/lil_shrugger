/**
 * These routes will appear in the navbar menu.
 *
 * The baseURL variable comes from the settings.html page.
 */
let routes = [
  { name: 'Sites', path: localStorage.getItem('baseURL') + '/' },
  { name: 'Code', path: localStorage.getItem('baseURL') + '/code.html' },
  { name: 'Packages', path: localStorage.getItem('baseURL') + '/update-sites.html' },
  { name: 'Settings', path: localStorage.getItem('baseURL') + '/settings.html' },
];
