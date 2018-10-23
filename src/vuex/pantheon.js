/**
 * Copy of custom config for Pantheon.
 */

 /* eslint-disable */

 // If localStorage isn't set to right environment, set it.
// We hard-code in the environment we declared above.
if (window.location.host === 'dev-shrugger-8.pantheonsite.io') {
  if (localStorage.getItem('env') !== 'Dev') {
    localStorage.setItem('env', 'Dev');
  }
}

if (window.location.host === 'test-shrugger-8.pantheonsite.io') {
  if (localStorage.getItem('env') !== 'Test') {
    localStorage.setItem('env', 'Test');
  }
}

if (window.location.host === 'live-shrugger-8.pantheonsite.io') {
  if (localStorage.getItem('env') !== 'Prod') {
    localStorage.setItem('env', 'Prod');
  }
}

// Set base URL since most of the time it is located at "/shrugger".
if (localStorage.getItem('baseURL') !== '/shrugger') {
  localStorage.setItem('baseURL', '/shrugger');
}

// These items need to be done after other JS has initialized.

  // Set Atlas Environment to be singular.
  if (window.location.host === 'dev-shrugger-8.pantheonsite.io') {
    store.state.atlasEnvironments = {Dev: 'https://osr-dev-util01.int.colorado.edu/atlas/'};
    store.commit('switchEnv', 'Dev');
  }

  if (window.location.host === 'test-shrugger-8.pantheonsite.io') {
    store.state.atlasEnvironments = {Test: 'https://osr-test-util01.int.colorado.edu/atlas/'};
    store.commit('switchEnv', 'Test');
  }

  if (window.location.host === 'live-shrugger-8.pantheonsite.io') {
    store.state.atlasEnvironments = {Prod: 'https://osr-prod-util01.int.colorado.edu/atlas/'};
    store.commit('switchEnv', 'Prod');
  }

  // Restrict user permissions to exporting reports and editing rows.
  store.state.userPermissions = ['Sites:commands:export'];

  // Remove edit keys from code and site assets.
  store.state.sitesEditKeys = [];
  store.state.codeEditKeys = ['tag'];
