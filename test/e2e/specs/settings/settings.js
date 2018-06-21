module.exports = {
  'Alter settings': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    // Check keys added/removed from table.
    browser
      .url(devServer)
      .waitForElementVisible('#data-table-wrapper', 5000)
      .assert.elementPresent('#table-header-updated')
      .url(devServer + '/settings')
      .waitForElementVisible('.settings-wrapper', 5000)
      // .assert.containsText('input[name="sites-query"]', '?where={"type":"express"}')
      .click('input#site-updated')
      .click('button[aria-label="Save"]')
      .waitForElementVisible('.alert.alert-success.message-0', 5000)
      .assert.containsText('.alert.alert-success.message-0', 'Saved credentials.')
      .url(devServer)
      .waitForElementVisible('#data-table-wrapper', 5000)
      .assert.elementNotPresent('#table-header-updated')
      .end();
  },
};
