module.exports = {
  '@tags': ['reports'],
  'download a csv export': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    browser
      .url(devServer)
      .waitForElementVisible('#app', 5000)
      .setValue('input[name="query"]', 'law')
      .click('.navbar-action-icon.glyphicon-th-list')
      .waitForElementVisible('button[aria-label="Export Table"]', 5000)
      .click('button[aria-label="Export Table"]')
      .waitForElementVisible('button[aria-label="Fire!"]', 5000)
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert.alert-success', 5000)
      .assert.containsText('.alert.alert-success', 'Exported: "report.csv" (0.566 KB)')
      .end();
  },
};
