
module.exports = {
  'Add/edit code': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    // Make a hash update.
    browser
      .url(devServer + '/code')
      .waitForElementVisible('#data-table-wrapper', 5000)
      .setValue('#filter-records-input', 'cu_forms_bundle')
      .click('button[aria-label="View"]')
      .waitForElementVisible('a[href="#tab-row-edit"]', 5000)
      .click('a[href="#tab-row-edit"]')
      .clearValue('input[name="commit_hash"]')
      .setValue('input[name="commit_hash"]', '9dfd4ca2559eac478f23c14a56fa73f12d108901')
      .click('button[aria-label="Update"]')
      .pause(3000)
      // For some reason pause worked but waiting for the element doesn't.
      // .waitForElementVisible('button[aria-label="Fire!"]', 5000)
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert-success.message-0', 5000)
      .assert.containsText('.alert-success.message-0', 'You have sent a PATCH request to a code record. Code asset ID: 5b22c93d926f5b125c094a76')
      .pause(5000)
      .assert.containsText('td.column-commit_hash', '9dfd4ca2559eac478f23c14a56fa73f12d108901');


    // Change the meta fields.
    // Table is still filtered to only "cu_forms_bundle" with one record showing.
    browser
      .click('button[aria-label="View"]')
      .waitForElementVisible('a[href="#tab-row-edit"]', 5000)
      .click('a[href="#tab-row-edit"]')
      .setValue('input[name="label"]', 'Forms Bundle')
      .setValue('input[name="version"]', '7.x-2.5')
      .click('select[name="is_current"] option[value="false"]')
      .setValue('input[name="tag"]', 'beta_bundle,two')
      .click('button[aria-label="Update"]')
      .click('button[aria-label="Fire!"]')
      .waitForElementVisible('.alert-success.message-1', 5000)
      .assert.containsText('.alert-success.message-1', 'You have sent a PATCH request to a code record. Code asset ID: 5b22c93d926f5b125c094a76')
      .assert.containsText('td.column-tag', 'beta_bundle,two')
      .assert.containsText('td.column-label', 'Forms Bundle')
      .assert.containsText('td.column-version', '7.x-2.5')
      .end();
  },
};
