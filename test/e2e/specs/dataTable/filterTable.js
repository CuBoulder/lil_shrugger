module.exports = {
  '@tags': ['filter'],
  'Filter Table Options': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    // Filter the results for code.
    browser
      .url(devServer + '/code')
      .waitForElementVisible('.result-count', 5000)
      .assert.containsText('.result-count', 'Result Count: 83')
      .setValue('#filter-records-input', 'digital')
      .assert.containsText('.result-count', 'Result Count: 1')
      .clearValue('#filter-records-input');

    // Filter the results for sites.
    browser
      .url(devServer)
      .waitForElementVisible('.result-count', 5000)
      .assert.containsText('.result-count', 'Result Count: 971')
      .setValue('#filter-records-input', 'digital')
      .assert.containsText('.result-count', 'Result Count: 26')
      .clearValue('#filter-records-input')
      // Use expression search.
      .click('button[aria-label="Toggle Expression Search"]')
      .assert.containsText('.result-count', 'Result Count: 971')
      .clearValue('input[name="query"]')
      .setValue('#filter-records-input', ['row.nodes_total > 200', browser.Keys.ENTER])
      .assert.containsText('.result-count', 'Result Count: 130')
      .assert.visible('.row-id-589a3514926f5b45a65b733c')
      .assert.visible('.row-id-589b39aa926f5b57367e4a04')
      .click('.navbar-action-icon.glyphicon.glyphicon-refresh')
      .pause(1000)
      .assert.containsText('.result-count', 'Result Count: 971')
      // Use expression search DSL methods.
      // "packages.or()" is broken...
      .end();
  },
};
