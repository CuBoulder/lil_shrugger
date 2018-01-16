module.exports = {
  '@tags': ['filter'],
  'Filter Table Options': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    browser
      .url(devServer)
      .assert.containsText('.result-count', 'Result Count: 100')
      .setValue('input[name="query"]', 'digital')
      .assert.containsText('.result-count', 'Result Count: 5')
      .click('#expression-search')
      .assert.containsText('.result-count', 'Result Count: 100')
      .clearValue('input[name="query"]')
      .setValue('input[name="query"]', ['row.nodes_total == 202 || row.nodes_total == 3202', browser.Keys.ENTER])
      .assert.containsText('.result-count', 'Result Count: 2')
      .assert.visible('.row-id-5898b090926f5b130bdde61a')
      .assert.visible('.row-id-5898ef4b926f5b20caa7a2a6')
      .click('.navbar-action-icon.glyphicon.glyphicon-refresh')
      .assert.containsText('.result-count', 'Result Count: 100')
      .end();
  },
};
