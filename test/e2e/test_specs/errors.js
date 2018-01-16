module.exports = {
  'Add/edit code': function test(browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;



    browser
      .url(devServer)
      .end();
  },
};
