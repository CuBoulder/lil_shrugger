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
      .waitForElementVisible('#app', 5000)
      .assert.elementPresent('#statsSearch')
      .setValue('#query-name input', ['1000', browser.Keys.ENTER])
      // IDs of sites are used here with the checkboxes as an easy way
      // to check which sites are in the list.
      // @todo Make an assertion command where site names are converted to IDs.
      .assert.visible('#checkbox-5898ef4b926f5b20caa7a2a6')
      .assert.visible('#checkbox-5899e708926f5b3a332a386b');

    browser
      .click('.navbar-action-icon.glyphicon-search')
      .pause(2000)
      .assert.elementNotPresent('#statsSearch')
      .end();
  },
};
