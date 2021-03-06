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
      </div>
      <a class="navbar-brand" :href="baseURL">¯\_(ツ)_/¯</a>
      <div id="navbar" class="navbar-collapse collapse">
        <ul class="nav navbar-nav">
          <li><a href="https://github.com/CuBoulder/lil_shrugger/releases" target="_blank"><span :class="shruggerVersionClasses">{{ shruggerVersion }}</span></a></li>
          <li v-for="route in routes"
               :key="route.name">
            <router-link :id="'route-link-' + route.name" :to="route.path">{{ route.name }}</router-link>
          </li>
        </ul>
        <div class="nav navbar-nav navbar-right">
          <!-- Action Icons -->
          <div class="action-icons-wrapper">
            <span v-for="icon in actionIcons"
                  :class="'navbar-action-icon glyphicon glyphicon-' + icon.name"
                  aria-hidden="true"
                  :key="icon.name"
                  :title="icon.title"
                  @click="show(icon.component)">
            </span>
            <!-- Help Link -->
            <a class="help-link"
               :href="'https://github.com/CuBoulder/lil_shrugger/wiki/' + currentRoute"
               title="Help Link"
               target="_blank">
              <span class="navbar-action-icon glyphicon glyphicon-question-sign"></span>
            </a>
          </div>
          <!-- Environment Selector -->
          <div class="styled-select" v-if="multipleEnvironments">
            <select name="selectEnv" id="selectEnv" @change="changeEnv($event)">
              <option v-for="(env, index) in environments"
                      :value="index"
                      :key="index"
                      :selected="selectedEnv == env ? true : null">
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
  import Router from '../router.ts';
  import store from '../store.ts';
  import bus from '../services/bus.ts';
  // import github from '../services/github.ts';

  export default {
    name: 'Navbar',
    data() {
      return {
        routes: Router.options.routes,
        icons: store.state.actionIcons,
        environments: store.state.atlasEnvironments,
        baseURL: localStorage.getItem('baseURL') ? localStorage.getItem('baseURL') : '/shrugger',
        shruggerVersionClasses: 'shrugger-default-version',
      };
    },
    // @todo Add back in if 2.0 versions are released.
    // created() {
    //   github.getLatestReleases('lil_shrugger').then((releases) => {
    //     if (releases[0]) {
    //       store.commit('addLatestShruggeRelease', releases[0]);
    //     }
    //   });
    // },
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
        const icons = store.state.actionIcons[this.$route.name] ? store.state.actionIcons[this.$route.name] : [];

        // If we are on Pantheon then limit the number of icons.
        // @todo Think of a better way of doing this where the exclusion is more explicit.
        if (window.location.hostname.includes('pantheonsite') && store.state.developerMode === false) {
          return icons.filter(el => !['commands'].includes(el.component));
        }

        return icons;
      },
      currentRoute() {
        return Router.app._route.name;
      },
      shruggerVersion() {
        if (store.state.shruggerVersion !== store.state.shruggerLatestRelease.tag_name) {
          this.shruggerVersionClasses = 'shrugger-old-version';
          return `v${store.state.shruggerLatestRelease.tag_name} is an old release!`;
        }

        return `v${store.state.shruggerVersion}`;
      },
    },
    methods: {
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

  nav.environment-NewDev:before {
    background: purple;
  }

  nav.environment-NewTest:before {
    background: darkgoldenrod;
  }

  nav.environment-NewProd:before {
    background: black;
  }

  /* Environment Selector */
  .styled-select {
    overflow: hidden;
    background: url(http://i62.tinypic.com/2e3ybe1.jpg) no-repeat right center;
    width: 200px;
    background-color: #ffffff;
    display: inline-block;
    margin-top: 12px;
  }

  .styled-select select {
    border: 1px solid #e7e7e7;
    height: 30px;
    width: 250px;
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
    cursor: pointer;
  }

  .help-link {
    color: #777;
  }

  .shrugger-default-version {
    color: inherit;
  }

  .shrugger-old-version {
    color: red;
  }

</style>
