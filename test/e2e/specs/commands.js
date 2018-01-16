

module.exports = {
  'show/hide commands': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    browser
      .url(devServer)
      .waitForElementVisible('#app', 5000)
      .assert.elementNotPresent('#commandsForm')
      .setValue('input[name="query"]', 'law')
      .click('.navbar-action-icon.glyphicon-th-list')
      .waitForElementVisible('#commandsForm', 5000)
      .click('select[id="sendCommand"] option[value="58a36249926f5b6fd81ab36a"]')
      .click('input[id="select-all-checkbox"]')
      .click('button[aria-label="Send Command"]')
      .waitForElementVisible('button[aria-label="Fire!"]', 5000)
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert.alert-success.message-0', 5000)
      .assert.containsText('.alert.alert-success.message-0',
        'Successfully sent "cache clear" command to 4 site(s): ("law","cuub","sportsclub/cycling","mcneill").')
      // @todo Figure out why not working.
      .click('.alert.alert-success button[aria-label="Close"]');

    browser
      .click('input[id="checkbox-5899e207926f5b3a34cae06d"]')
      .click('select[id="sendCommand"] option[value="5931890a926f5b6713b49a3c"]')
      .click('button[aria-label="Send Command"]')
      .waitForElementVisible('button[aria-label="Fire!"]', 5000)
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert.alert-success.message-1', 5000)
      .assert.containsText('.alert.alert-success.message-1', 'Successfully sent "run atlas stats" command to 3 site(s): ("law","cuub","mcneill").')
      .click('button[aria-label="Close"]')
      .end();
  },
};
