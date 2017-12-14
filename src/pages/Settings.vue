<template>
  <div class="container">
    <div id="user-settings">
      <message-area></message-area>
      <form>
        <div v-if="userAccessPerm('credentials')">
          <fieldset class="form-group">
            <label for="username">Atlas Username</label>
            <input type="text" id="username" class="form-control" name="username" v-model="username">
            <label for="password">Atlas Password</label>
            <input type="password" id="password" class="form-control" name="password" v-model="password">
          </fieldset>
          <fieldset class="form-group">
            <label for="base-url">Base URL</label>
            <input type="text" id="base-url" class="form-control" name="host" v-model="baseURL">
            <p class="form-text text-muted">
              If you have this application in sub-directory of your virtual host, then add with beginning slash, e.g "/shrugger".
              If you have this application at the root-level, then leave blank.
            </p>
          </fieldset>
          <fieldset class="form-group">
            <label for="github-username">GitHub Username</label>
            <input type="text" id="github-username" class="form-control" name="github-username" v-model="gitHub.username">
            <label for="github-token">GitHub Token</label>
            <input type="text" id="github-token" class="form-control" name="github-token" v-model="gitHub.token">
            <p class="form-text text-muted">
              Need to setup
              <a href="https://github.com/settings/tokens">https://github.com/settings/tokens</a> under Personal access tokens.
            </p>
          </fieldset>
        </div>
        <fieldset class="form-group">
          <label for="sites-query">Sites Query</label>
          <input type="text" id="sites-query" class="form-control" name="sites-query" v-model="sitesQuery">
          <label for="code-query">Code Query</label>
          <input type="text" id="code-query" class="form-control" name="code-query" v-model="codeQuery">
        </fieldset>
        <fieldset class="form-group">
          <h4>Repositories Listing</h4>
          <p class="form-text text-muted">
            You can choose to have the repository list for creating code be chronologically by updated date instead of alphabetically.
          </p>
          <div class="form-check">
            <label class="form-check-label">
              <input class="form-check-input" type="checkbox" id="chronological" v-model="repoListing">
              Chronological
            </label>
          </div>
          <h4>Site Record Keys</h4>
          <p class="form-text text-muted">
            Choose which keys you want to include in the site record listing.
          </p>
          <div class="form-check checkbox-inline" v-for="key in siteKeys">
            <label class="form-check-label">
              <input class="form-check-input" type="checkbox" :id="'site-' + key" :value="key" v-model="saveSiteKeys">
              {{key}}
            </label>
          </div>
          <h4>Stats Record Keys</h4>
          <p class="form-text text-muted">
            Choose which keys you want to include in the site record listing.
          </p>
          <div class="form-check checkbox-inline" v-for="key in statsKeys">
            <label class="form-check-label">
              <input class="form-check-input" type="checkbox" :id="'stats-' + key" :value="key" v-model="saveStatsKeys">
              {{key}}
            </label>
          </div>
          <h4>Code Record Keys</h4>
          <p class="form-text text-muted">
            Choose which keys you want to include in the code record listing.
          </p>
          <div class="form-check checkbox-inline" v-for="key in codeKeys">
            <label class="form-check-label">
              <input class="form-check-input" type="checkbox" :id="'code-' + key" :value="key" v-model="saveCodeKeys">
              {{key}}
            </label>
          </div>
        </fieldset>
        <button @click="saveCreds()" type="button" class="btn btn-primary">Save</button>
        <button @click="clearStorage()" type="button" class="btn btn-danger">Clear Local Storage</button>
      </form>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue';
  import shrugger from '../js/shrugger';
  import store from '../vuex/store';
  import bus from '../js/bus';
  import MessageArea from '../components/MessageArea';

  // We need to add the component namespace for the template to recognize it.
  Vue.component('message-area', MessageArea);

  export default {
    name: 'Settings',
    data() {
      return {
        username: localStorage.getItem('atlas-username') ? localStorage.getItem('atlas-username') : '',
        password: localStorage.getItem('atlas-password') ? localStorage.getItem('atlas-password') : '',
        baseURL: localStorage.getItem('baseURL') ? localStorage.getItem('baseURL') : '/shrugger',
        gitHub: {
          username: localStorage.getItem('github-username') ? localStorage.getItem('github-username') : '',
          token: localStorage.getItem('github-token') ? localStorage.getItem('github-token') : '',
        },
        sitesQuery: localStorage.getItem('sites-query') ? localStorage.getItem('sites-query') : '?where={"type":"express"}',
        codeQuery: localStorage.getItem('code-query') ? localStorage.getItem('code-query') : '',
        repoListing: localStorage.getItem('repo-listing') ? JSON.parse(localStorage.getItem('repo-listing')) : false,
        saveSiteKeys: localStorage.getItem('site-keys') ? JSON.parse(localStorage.getItem('site-keys')) : ['id', 'path', 'status', 'core', 'profile', 'packages'],
        saveCodeKeys: localStorage.getItem('code-keys') ? JSON.parse(localStorage.getItem('code-keys')) : ['id', 'name', 'label', 'version', 'code_type', 'is_current', 'commit_hash'],
        saveStatsKeys: localStorage.getItem('stats-keys') ? JSON.parse(localStorage.getItem('stats-keys')) : [],
      };
    },
    created() {
      const that = this;

      // Show search when icon in navbar is clicked.
      // Also refresh table data.
      bus.$on('navbarShow', (component) => {
        that.navbarShowListener(component);
      });
    },
    computed: {
      siteKeys() {
        return store.state.siteKeys;
      },
      codeKeys() {
        return store.state.codeKeys;
      },
      statsKeys() {
        return store.state.statsKeys;
      },
    },
    methods: {
      saveCreds() {
        localStorage.setItem('atlas-username', this.username);
        localStorage.setItem('atlas-password', this.password);
        localStorage.setItem('baseURL', this.baseURL);
        localStorage.setItem('github-username', this.gitHub.username);
        localStorage.setItem('github-token', this.gitHub.token);
        localStorage.setItem('sites-query', this.sitesQuery);
        localStorage.setItem('code-query', this.codeQuery);
        localStorage.setItem('repo-listing', JSON.stringify(this.repoListing));
        localStorage.setItem('code-keys', JSON.stringify(this.saveCodeKeys));
        localStorage.setItem('site-keys', JSON.stringify(this.saveSiteKeys));
        localStorage.setItem('stats-keys', JSON.stringify(this.saveStatsKeys));

        // Send success message.
        // Not needed because of reload.
        /*
        bus.$emit('onMessage', {
          text: 'Successfully saved settings.',
          alertType: 'alert-success',
        }); */

        // Redirect user so any settings changes can be reloaded.
        location.reload();
      },
      clearStorage() {
        localStorage.clear();

        // Send success message.
        // Not needed because of reload.
        /*
        bus.$emit('onMessage', {
          text: 'Cleared localStorage values.',
          alertType: 'alert-success',
        }); */
        // Location reload might not be the best. If not, use the below.
        // this.$router.go(this.$router.currentRoute);
        location.reload();
      },
      userAccessPerm(permission) {
        return shrugger.userAccess(permission);
      },
      navbarShowListener(component) {
        switch (component) {
          case 'help':
            // Redirect user to help article.
            window.location.href = store.state.help.settings;
            break;
          default:
            break;
        }
      },
    },
  };
</script>
