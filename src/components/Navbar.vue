<template>
  <nav :class="navClasses">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed"
                data-toggle="collapse" data-target="#navbar"
                aria-expanded="false" aria-controls="navbar">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" :href="baseURL">¯\_(ツ)_/¯</a>
      </div>
      <div id="navbar" class="navbar-collapse collapse">
        <ul class="nav navbar-nav">
          <li v-for="route in routes">
            <router-link :id="'route-link-' + route.name" :to="route.path">{{ route.name }}</router-link>
          </li>
        </ul>
        <div class="nav navbar-nav navbar-right">
          <!-- Action Icons -->
          <div class="action-icons-wrapper">
            <span v-for="icon in actionIcons"
                  :class="'navbar-action-icon glyphicon glyphicon-' + icon.name"
                  aria-hidden="true"
                  @click="show(icon.component)">
            </span>
            <!-- Help Link -->
            <a class="help-link" :href="'https://github.com/CuBoulder/lil_shrugger/wiki/' + currentRoute" target="_blank">
              <span class="navbar-action-icon glyphicon glyphicon-question-sign"></span>
            </a>
          </div>
          <!-- Environment Selector -->
          <div class="styled-select" v-if="multipleEnvironments">
            <select name="selectEnv" id="selectEnv" @change="changeEnv($event)">
              <option v-for="(env, index) in environments" :value="index" :selected="selectedEnv == env ? true : null">
                {{index}}
              </option>
            </select>
          </div>
          <div v-else class="no-env-selector">
            <strong>ENV: </strong>{{selectedEnvName}}
          </div>
        </div>
      </div><!--/.nav-collapse -->
    </div><!--/.container-fluid -->
  </nav>
</template>

<script>
  import Router from '../router/index';
  import store from '../vuex/store';
  import bus from '../js/bus';

  export default {
    name: 'Navbar',
    data() {
      return {
        routes: Router.options.routes,
        icons: store.state.actionIcons,
        environments: store.state.atlasEnvironments,
        baseURL: localStorage.getItem('baseURL') ? localStorage.getItem('baseURL') : '/shrugger',
      };
    },
    computed: {
      selectedEnv() {
        return store.state.atlasEnvironments[store.state.env];
      },
      selectedEnvName() {
        return store.state.env;
      },
      navClasses() {
        return `navbar navbar-default navbar-fixed-top environment-${store.state.env}`;
      },
      multipleEnvironments() {
        // Only return true if environments object has more than one property.
        return Object.keys(this.environments).length > 1;
      },
      actionIcons() {
        return store.state.actionIcons[this.$route.name];
      },
      currentRoute() {
        return Router.app._route.name;
      },
    },
    methods: {
      callMeMaybe(callback, params) {
        window[callback](params);
        this.cancel();
      },
      cancel() {
        this.confirmed = false;
        this.finaled = false;
      },
      changeEnv(event) {
        store.commit('switchEnv', event.target.value);
        bus.$emit('switchEnv', event.target.value);
      },
      show(component) {
        bus.$emit('navbarShow', component);
      },
    },
  };
</script>

<style scoped>
  /* Environment Indicator */
  nav {
    padding-top: 20px;
    font-size: 16px;
  }

  nav:before {
    content: '';
    padding: 10px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    width: 100%;
    border-bottom: 1px solid #e7e7e7;
  }

  nav.environment-Prod:before {
    background: red;
  }

  nav.environment-Test:before {
    background: orange;
  }

  nav.environment-Dev:before {
    background: yellow;
  }

  nav.environment-Local:before {
    background: green;
  }

  /* Environment Selector */
  .styled-select {
    overflow: hidden;
    background: url(http://i62.tinypic.com/2e3ybe1.jpg) no-repeat right center;
    height: 50px;
    width: 230px;
    background-color: #ffffff;
    display: inline-block;
  }

  .styled-select select {
    border: 1px solid #e7e7e7;
    height: 97%;
    width: 268px;
    padding: 5px; /* If you add too much padding here, the options won't show in IE */
    background: transparent;
  }

  .no-env-selector {
    display: inline-block;
    padding: 0.25em 0.75em;
    font-size: 1.75em;
    color: #777;
  }

  /* Brand */
  .navbar-brand {
    font-size: 2.70em;
  }

  /* Action Icons */
  .action-icons-wrapper {
    display: inline-block;
    font-size: 2.0em;
    color: #777;
    border-left: 1px solid #e7e7e7;
    height: 50px;
  }

  .navbar-action-icon {
    padding-left: 0.40em;
    padding-top: 0.25em;
    padding-right: 0.40em;
    padding-bottom: 0.25em;
    border-right: 1px solid #e7e7e7;
    height: 100%;
  }

  .help-link {
    color: #777;
  }
</style>
