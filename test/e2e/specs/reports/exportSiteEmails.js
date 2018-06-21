module.exports = {
  '@tags': ['reports'],
  'download an email export': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    // Export all emails.
    browser
      .url(devServer)
      .waitForElementVisible('#data-table-wrapper', 5000)
      .click('.navbar-action-icon.glyphicon-download-alt')
      .waitForElementVisible('.reports-wrapper', 5000)
      .click('select[id="export-list"] option[value="exportSiteEmails"]')
      .setValue('input[name="export-options"]', 'all')
      .click('button[aria-label="Export Table"]')
      .pause(2000)
      // .waitForElementVisible('button[aria-label="Fire!"]', 5000)
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert.alert-success', 5000)
      .assert.containsText('.alert.alert-success', 'Exported: "site_email_address_export.txt" (70.233 KB)')
      .click('.alert.alert-success.message-0 button[aria-label="Close"]');

    // Export only content_editor emails.
    browser
      .clearValue('input[name="export-options"]')
      .setValue('input[name="export-options"]', 'content_editor')
      .click('button[aria-label="Export Table"]')
      .waitForElementVisible('button[aria-label="Fire!"]', 5000)
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert.alert-success', 5000)
      .assert.containsText('.alert.alert-success', 'Exported: "site_email_address_export.txt" (36.282 KB)')
      .click('button[aria-label="Close"]')
      // .click('.alert.alert-success.message-0 button[aria-label="Close"]')
      .end();
  },
};
