// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  'show/hide stats search': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;

    browser
      .url(devServer)
      .waitForElementVisible('#data-table-wrapper', 5000)
      .assert.elementPresent('.stats-search-wrapper')
      .setValue('#query-name input', ['1000', browser.Keys.ENTER])
      .assert.containsText('.result-count', 'Result Count: 20')
      // IDs of sites are used here with the checkboxes as an easy way
      // to check which sites are in the list.
      // @todo Make an assertion command where site names are converted to IDs.
      .assert.visible('.row-id-589a3514926f5b45a65b733c')
      .assert.visible('.row-id-5951512f926f5b5050b42ddd');

    browser
      .click('.navbar-action-icon.glyphicon-search')
      .pause(2000)
      .assert.elementNotPresent('#statsSearch')
      .end();
  },
};
