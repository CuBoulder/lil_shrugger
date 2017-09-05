
/**
 * Import navbar HTML and insert into DOM of pages.
 *
 * @type {Element}
 */
let link = document.querySelector('link[href="src/partials/navbar.html"]');
let content = link.import;
let el = content.querySelector('script');
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
    icons: {
      type: String,
      default: ''
    },
    environments: {
      type: Object,
      default: function () {
        return store.state.atlasEnvironments
      }
    },
    baseURL: {
      type: String,
      default: localStorage.getItem('baseURL')
    }
  },
  computed: {
    selectedEnv: function () {
      return store.state.atlasEnvironments[store.state.env];
    },
    selectedEnvName: function () {
      return store.state.env;
    },
    navClasses: function () {
      return 'navbar navbar-default navbar-fixed-top environment-' +  store.state.env;
    },
    multipleEnvironments: function () {
      // Only return true if environments object has more than one property.
      return Object.keys(this.environments).length > 1;
    },
    actionIcons: function () {
      return store.state.actionIcons[this.icons];
    }
  },
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
      //localStorage.setItem('env', event.target.value);
      store.commit('switchEnv', event.target.value);
      bus.$emit('switchEnv', event.target.value);
    },
    show: function (component) {
      bus.$emit('navbarShow', component);
    }
  }
});

let navbar = new Vue({
  el: '#atlas-navbar',
  data: {
    routes: routes,
    environments: store.state.atlasEnvironments,
  }
});
