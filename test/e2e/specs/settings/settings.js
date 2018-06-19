module.exports = {
  'Alter settings': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    // Check keys added/removed from table.
    browser
      .url(devServer)
      .waitForElementVisible('#app', 5000)
      .assert.elementPresent('#table-header-updated')
      .url(devServer + '/settings')
      .click('input#site-updated')
      .click('button[aria-label="Save"]')
      .url(devServer)
      .waitForElementVisible('#app', 5000)
      .assert.elementNotPresent('#table-header-updated')
      .end();
  },
};
