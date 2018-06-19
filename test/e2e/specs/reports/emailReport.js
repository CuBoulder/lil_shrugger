module.exports = {
  '@tags': ['reports'],
  'download an email export': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    browser
      .url(devServer)
      .waitForElementVisible('#app', 5000)
      .click('.navbar-action-icon.glyphicon-th-list')
      .waitForElementVisible('button[aria-label="Export Table"]', 5000)
      .click('select[id="export-list"] option[value="exportSiteContactEmail"]')
      .setValue('input[name="export-options"]', 'all')
      .click('button[aria-label="Export Table"]')
      .waitForElementVisible('button[aria-label="Fire!"]', 5000)
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert.alert-success', 5000)
      .assert.containsText('.alert.alert-success', 'Exported: "siteContactEmails.txt" (16.097 KB)')
      .click('button[aria-label="Close"]');

    browser
      .clearValue('input[name="export-options"]')
      .setValue('input[name="export-options"]', 'content_editor')
      .click('button[aria-label="Export Table"]')
      .waitForElementVisible('button[aria-label="Fire!"]', 5000)
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert.alert-success', 5000)
      .assert.containsText('.alert.alert-success', 'Exported: "siteContactEmails.txt" (8.114 KB)')
      .click('button[aria-label="Close"]')
      .end();
  },
};
