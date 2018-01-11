
module.exports = {
  'Add/edit code': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    browser
      .url(devServer + '/code')
      .waitForElementVisible('#app', 5000)
      .assert.containsText('.result-count', 'Result Count: 112')
      .setValue('#filter-records', 'digital')
      .assert.containsText('.result-count', 'Result Count: 5');

    // Make a hash update.
    browser
      .click('.row-id-591def5f926f5b28e7361dc8 button[aria-label="Edit"]')
      .waitForElementVisible('.row-id-591def5f926f5b28e7361dc8 .current-hash', 5000)
      .getText('.row-id-591def5f926f5b28e7361dc8 .current-hash', (result) => {
        // Remove first part of hash string.
        const parts = result.value.split('Current Hash: ');

        browser.clearValue('input[name="commit_hash"]');
        browser.setValue('input[name="commit_hash"]', parts[1]);
        browser.click('button[aria-label="Update"].record-id-591def5f926f5b28e7361dc8');
        browser.click('button[aria-label="Fire!"].record-id-591def5f926f5b28e7361dc8');
        browser.waitForElementVisible('.row-id-591def5f926f5b28e7361dc8', 5000);
        browser.assert.containsText('.row-id-591def5f926f5b28e7361dc8 .column-commit_hash', parts[1]);
      });

    // Change a tag.
    browser
      .click('.row-id-591def5f926f5b28e7361dc8 button[aria-label="Edit"]')
      .pause(2000)
      // .waitForElementVisible('select[name="tag"]', 5000)
      .click('select[name="tag"] option[value="beta_bundles"]')
      .click('.updateCodeRecord.record-id-591def5f926f5b28e7361dc8')
      .waitForElementVisible('.row-id-591def5f926f5b28e7361dc8', 5000)
      .assert.containsText('.row-id-591def5f926f5b28e7361dc8 .column-tag', 'beta_bundles')
      .end();
  },
};
