

module.exports = {
  'show/hide commands': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    // Send a command to "all" sites filtered by "web".
    browser
      .url(devServer)
      .waitForElementVisible('#data-table-wrapper', 5000)
      .assert.elementNotPresent('.commands-wrapper')
      .click('.navbar-action-icon.glyphicon-th-list')
      .waitForElementVisible('.commands-wrapper', 5000)
      .click('select[id="sendCommand"] option[value="58a36249926f5b6fd81ab36a"]')
      .setValue('#filter-records-input', 'web')
      .click('input[id="select-all-checkbox"]')
      .click('button[aria-label="Send Command"]')
      .assert.containsText('.alert.alert-warning.message-0',
        'You are about to send the "DRUSH - Clear Cache All" command to 3 site(s): "connect","webcentral","demos/web-express".')
      .waitForElementVisible('button[aria-label="Fire!"]', 5000)
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert.alert-success.message-1', 5000)
      .assert.containsText('.alert.alert-success.message-1',
        'Successfully sent "DRUSH - Clear Cache All" command to 3 site(s): ("connect","webcentral","demos/web-express").')
      .click('.alert.alert-success.message-1 button[aria-label="Close"]')
      .click('.alert.alert-warning.message-0 button[aria-label="Close"]');

    // Send a command to one site filtered by "web" which is "connect".
    browser
      .click('input[id="select-all-checkbox"]')
      .click('input[id="checkbox-589a3466926f5b3c2aa37368"]')
      .click('input[id="checkbox-589a3466926f5b3c2aa3736a"]')
      .click('select[id="sendCommand"] option[value="5931890a926f5b6713b49a3c"]')
      .click('button[aria-label="Send Command"]')
      .assert.containsText('.alert.alert-warning.message-0',
        'You are about to send the "run atlas stats" command to 2 site(s): "connect","webcentral".')
      .waitForElementVisible('button[aria-label="Fire!"]', 5000)
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert.alert-success.message-1', 5000)
      .assert.containsText('.alert.alert-success.message-1',
        'Successfully sent "run atlas stats" command to 2 site(s): ("connect","webcentral").')
      .click('.alert.alert-success.message-1 button[aria-label="Close"]')
      .click('.alert.alert-warning.message-0 button[aria-label="Close"]')
      .end();
  },
};
