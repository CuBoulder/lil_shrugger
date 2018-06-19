require('babel-register')
var config = require('../../config')

// http://nightwatchjs.org/gettingstarted#settings-file
module.exports = {
  src_folders: ['test/e2e/specs/code'],
  output_folder: 'test/e2e/reports',
  custom_assertions_path: ['test/e2e/custom-assertions'],

  selenium: {
    start_process: true,
    server_path: require('selenium-server').path,
    host: '127.0.0.1',
    port: 4444,
    cli_args: {
      'webdriver.chrome.driver': require('chromedriver').path
    }
  },

  test_settings: {
    default: {
      silent: true,
      globals: {
        devServerURL: 'http://localhost:' + (process.env.PORT || config.dev.port),
        // devServerURL: 'http://localhost:' + (process.env.PORT || config.dev.port),
        waitForConditionTimeout: 10000,
      },
      launch_url: 'http://ondemand.saucelabs.com:80',
      selenium_port: 80,
      selenium_host: 'ondemand.saucelabs.com',
      username: 'osr_service_account',
      access_key: '2b534cde-f699-4529-85da-b88e96e153fe',
      screenshots: {
        enabled: false,
        path: '',
      },
    },

    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
        platform: 'OS X 10.11',
        version: '60',
        // javascriptEnabled: true,
        // acceptSslCerts: true
      }
    },

    firefox: {
      desiredCapabilities: {
        browserName: 'firefox',
        platform: 'OS X 10.11',
        javascriptEnabled: true,
        acceptSslCerts: true,
      }
    }
  }
}
