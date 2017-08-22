/**
 * @file
 * Contains config overrides for on-server use.
 */
document.getElementsByClassName("styled-select")[0].style.display = "none";

localStorage.setItem('atlas-username', '');
localStorage.setItem('atlas-password', '');
localStorage.setItem('github-username', '');
localStorage.setItem('github-token', '');

if (window.location.hostname === 'osr-atlas01.int.colorado.edu') {
  localStorage.setItem('env', 'Dev');
} else if (window.location.hostname === 'osr-atlas02.int.colorado.edu') {
  localStorage.setItem('env', 'Test');
} else if (window.location.hostname === 'osr-atlas03.int.colorado.edu') {
  localStorage.setItem('env', 'Prod');
} else {
  localStorage.setItem('env', 'Local');
}