/**
 * @file
 * Contains config overrides for specific Shrugger instances and deployments.
 */

// Set Atlas creds.
localStorage.setItem('atlas-username', '');
localStorage.setItem('atlas-password', '');

// Set GitHub creds.
localStorage.setItem('github-username', '');
localStorage.setItem('github-token', '');

// Set Atlas Environment to be singular.
store.state.atlasEnvironments = {Dev: 'https://osr-atlas01.int.colorado.edu/atlas/'};
navbar.environments = {Dev: 'https://osr-atlas01.int.colorado.edu/atlas/'};

// If localStorage isn't set to right environment, set it.
// We hard-code in the environment we declared above.
if (localStorage.getItem('env') !== 'Dev') {
  localStorage.setItem('env', 'Dev');
}

// Restrict user permissions other than navbar.
store.state.userPermissions = [];

// Restrict action icons in navbar.
store.state.actionIcons = {
  sites: [],
  code: []
};
