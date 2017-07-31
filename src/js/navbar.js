
/**
 * Import navbar HTML and insert into DOM of pages.
 *
 * @type {Element}
 */
var link = document.querySelector('link[href="src/partials/navbar.html"]');
var content = link.import;
var el = content.querySelector('script');
document.querySelector('body').appendChild(el.cloneNode(true));


/**
 * Creates a button component with comfirm step.
 */
Vue.component('atlas-navbar', {
  template: '#a-navbar',
  props: {
    routes: {
      type: Array,
      default: routes
    },
    environments: {
      type: Object,
      default: siteConfig.atlasEnvironments
    }
  },
  computed: {
    selectedEnv: function () {
      return siteConfig.atlasEnvironments[localStorage.getItem('env')];
    }
  },
  /*
  filters: {
    capitalize: function (value) {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },*/
  methods: {
    callMeMaybe: function (callback, params) {
      window[callback](params);
      this.cancel();
    },
    cancel: function () {
      this.confirmed = false;
      this.finaled = false;
    },
    changeEnv: function (event) {
      localStorage.setItem('env', event.target.value);
      bus.$emit('switchEnv', event.target.value);
    }
  }
});

let navbar = new Vue({
  el: '#atlas-navbar',
  data: {
    routes: routes,
    environments: siteConfig.atlasEnvironments
  }
});

$(document).ready(function(){
  // Add indicator on load
  envIndicator();
  $('#selectEnv').on('change', function() {
    envIndicator();
  });
});

// Udpate Environment Indicator
function envIndicator() {
  // Get selected value nad lowercase
  var env = $("#selectEnv").val();
  env = env.toLowerCase();

  // Remove existing indicator classes
  var envs = ["local", "dev", "test", "prod"];
  for (var i = 0, len = envs.length; i < len; i++) {
    $('body').removeClass('environment-' + envs[i]);
  }
  // Apply class for current environment
  $('body').addClass('environment-' + env);
}
