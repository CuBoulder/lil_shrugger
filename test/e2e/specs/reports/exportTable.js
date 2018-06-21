module.exports = {
  '@tags': ['reports'],
  'download a csv export': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    browser
      .url(devServer)
      .waitForElementVisible('#data-table-wrapper', 5000)
      .clearValue('#filter-records-input')
      .setValue('#filter-records-input', 'digital')
      .assert.containsText('.result-count', 'Result Count: 26')
      .click('.navbar-action-icon.glyphicon-download-alt')
      .waitForElementVisible('.reports-wrapper', 5000)
      .click('button[aria-label="Export Table"]')
      .pause(2000)
      // .waitForElementVisible('button[aria-label="Fire!"]', 5000)
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert.alert-success.message-0', 5000)
      .assert.containsText('.alert.alert-success.message-0', 'Exported: "report.csv" (7.499 KB)')
      .click('.alert.alert-success.message-0 button[aria-label="Close"]');

    browser
      .clearValue('#filter-records-input')
      .setValue('#filter-records-input', 'web')
      .click('button[aria-label="Export Table"]')
      .pause(2000)
      // .waitForElementVisible('button[aria-label="Fire!"]', 5000)
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert.alert-success.message-0', 5000)
      .assert.containsText('.alert.alert-success.message-0', 'Exported: "report.csv" (1.132 KB)')
      .click('.alert.alert-success.message-0 button[aria-label="Close"]')
      .end();
  },
};
