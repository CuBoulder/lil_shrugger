<template>
  <div class="container">
    <div id="packages">
      <message-area></message-area>
    <div class="row col-md-12">
      <label for="atlas-query">Atlas Query</label>
      <input type="text"
             id="atlas-query"
             v-model="atlasQuery"
             class="form-control">
      <button class="btn btn-primary pull-right" @click.prevent="search()">Search</button>
    </div>
      <form>
        <div class="row col-md-12 form-group">
          <label for="update-options">Update Assets:</label>
          <div id="update-options">
            <div v-for="type in codeTypes"
                :key="type"
                class="form-check">
              <input class="form-check-input"
                     type="checkbox"
                     v-model="saveCodeTypes"
                     :value="type">
                {{type}}
            </div>
          </div>
          <!-- Cores select list. -->
          <label for="selectCore">Cores:</label>
          <select name="selectCore"
                  id="selectCore"
                  class="form-control">
            <option :key="asset.id"
                    :value="asset.id"
                    v-for="asset in cores">
              {{asset.name}} - {{asset.version}} || Asset ID:{{asset.id}}
            </option>
          </select>
          <!-- Profiles select list. -->
          <label for="selectCore">Profiles:</label>
          <select name="selectCore"
                  id="selectCore"
                  class="form-control">
            <option :key="asset.id"
                    :value="asset.id"
                    v-for="asset in profiles">
              {{asset.name}} - {{asset.version}} || Asset ID:{{asset.id}}
            </option>
          </select>
        </div>
        <div class="row col-md-12 form-group">
          <!-- Bundles add select list. -->
          <div id="bundles-add" class="col-md-6">
            <label for="bundles-add">Add Packages:</label>
            <div class="form-check"
              :key="asset.id"
              v-for="asset in modules">
              <input class="form-check-input"
                    type="checkbox"
                    :id="'bundle-' + asset.id"
                    :value="asset.id"
                    v-model="addBundles">
              {{asset.name}} - {{asset.version}} || Asset ID:{{asset.id}}
              <span v-if="asset.is_current === true">
                (Current)
              </span>
            </div>
          </div>
          <!-- Bundles add select list. -->
          <div id="bundles-remove" class="col-md-6">
            <label for="bundles-remove">Remove Packages:</label>
            <div class="form-check"
              :key="asset.id"
              v-for="asset in modules">
              <input class="form-check-input"
                    type="checkbox"
                    :id="'bundle-' + asset.id"
                    :value="asset.id"
                    v-model="removeBundles">
              {{asset.name}} - {{asset.version}} || Asset ID:{{asset.id}}
              <span v-if="asset.is_current === true">
                (Current)
              </span>
            </div>
          </div>
        </div>
        <confirm-button label="Update Packages"
                        callback="updatePackages"
                        :params="{}">
          </confirm-button>
      </form>
    </div>
  </div>
</template>

<script>
  import code from '../js/code';
  import bus from '../js/bus';
  import atlas from '../js/atlas';
  import store from '../vuex/store';

  export default {
    name: 'Packages',
    data() {
      return {
        cores: [],
        profiles: [],
        modules: [],
        codeTypes: ['core', 'profile', 'package'],
        saveCodeTypes: [],
        addBundles: [],
        removeBundles: [],
        atlasQuery: '?where={"type":"express","status":"installed"}',
      };
    },
    created() {
      const that = this;

      this.initialize(that);

      bus.$on('updatePackages', () => {
        that.updatePackages(that);
      });
    },
    methods: {
      initialize(that) {
        const baseURL = store.state.atlasEnvironments[store.state.env];
        // Get all code assets.
        code.get(baseURL)
        .then((data) => {
          const options = {
            codeData: data,
          };

          console.log(data);

          store.commit('addSitesGridData', options);

          // Create buckets of cores, profiles and bundles.
          that.cores = data.filter(asset => asset.code_type === 'core').sort();
          that.profiles = data.filter(asset => asset.code_type === 'profile').sort();
          that.modules = data.filter(asset => asset.code_type === 'module');

          that.modules.sort((a, b) => {
            /*
            if (Object.prototype.hasOwnProperty.call(a.name, 'localeCompare')) {
              const sortOptions = {
                sensitivity: 'base',
                numeric: true,
              };

              return b.name.localeCompare(a.name, 'en', sortOptions);
            } */

            return b.name - a.name;
          });
        });
      },
      search() {
        const baseURL = store.state.atlasEnvironments[store.state.env];
        console.log(this.atlasQuery);

        atlas.request(baseURL, 'sites', this.atlasQuery)
        .then((data) => {
          console.log(data);
          let returnedSites = [];
          data.forEach((element) => {
            returnedSites = returnedSites.concat(element);
          });
          this.sitesToUpdate = returnedSites;

          const siteList = this.sitesToUpdate.map(val => val.path);

          bus.$emit('onMessage', {
            text: '<p>You will update the following sites (Site Count:' + this.sitesToUpdate.length + ').</p>' +
              '<p><strong>Paths:</strong><br/>' + siteList.join(', ') + '</p>',
            alertType: 'alert-warning',
          });
        })
        .catch((error) => {
          console.log(error);
        });
      },
      updatePackages(that) {
        console.log('actual-vue-js', that);

        // Loop through code types that are supposed to change.
        that.saveCodeTypes.forEach((type) => {
          // Loop through each site to update and remove/add packages.
          that.sitesToUpdate.forEach((site) => {

          });
        });
      },
    },
  };
</script>

<style scoped>

</style>

