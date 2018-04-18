<template>
  <div id="packages">
    <message-area></message-area>
    <div class="row col-md-12">
      <label for="atlas-query">Atlas Sites Query</label>
      <input type="text"
            id="atlas-query"
            v-model="atlasQuery"
            class="form-control">
      <button class="btn btn-primary pull-right"
              v-if="!showPackageUpdate"
              @click.prevent="search()">Search</button>
      <button class="btn btn-default pull-right"
              v-if="showPackageUpdate"
              @click.prevent="resetSearch()">Reset</button>
    </div>
    <div v-if="!showPackageUpdate" class="col col-md-6">
      Complete a search before updating packages.
    </div>
    <form v-if="showPackageUpdate">
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
      </div>
      <div class="row col-md-12 form-group">
        <!-- Cores select list. -->
        <label for="selectCore">Cores:</label>
        <select name="selectCore"
                id="selectCore"
                v-model="chosenCore"
                class="form-control">
          <option :key="asset.id"
                  :value="asset.id"
                  v-for="asset in cores">
            {{asset.name}} - {{asset.version}} || Asset ID:{{asset.id}}
          </option>
        </select>
        <!-- Profiles select list. -->
        <label for="selectProfile">Profiles:</label>
        <select name="selectProfile"
                id="selectProfile"
                v-model="chosenProfile"
                class="form-control">
          <option :key="asset.id"
                  :value="asset.id"
                  v-for="asset in profiles">
            {{asset.name}} - {{asset.version}} || Asset ID:{{asset.id}}
          </option>
        </select>
      </div>
      <div class="row col-md-12 form-group">
        <!-- Packages add select list. -->
        <div id="packages-add" class="col-md-6">
          <label for="packages-add">Add Packages:</label>
          <div class="form-check"
            :key="asset.id"
            v-for="asset in modules">
            <input class="form-check-input"
                  type="checkbox"
                  :id="'package-add' + asset.id"
                  :value="asset.id"
                  v-model="addPackages">
            {{asset.name}} - {{asset.version}} || Asset ID:{{asset.id}}
            <span v-if="asset.is_current === true">
              (Current)
            </span>
          </div>
        </div>
        <!-- Packages remove select list. -->
        <div id="packages-remove" class="col-md-6">
          <label for="packages-remove">Remove Packages:</label>
          <div class="form-check"
            :key="asset.id"
            v-for="asset in modules">
            <input class="form-check-input"
                  type="checkbox"
                  :id="'package-remove' + asset.id"
                  :value="asset.id"
                  v-model="removePackages">
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
        addPackages: [],
        removePackages: [],
        atlasQuery: '?where={"type":"express","update_group":1}',
        sitesToUpdate: [],
        chosenProfile: '',
        chosenCore: '',
        showPackageUpdate: false,
      };
    },
    created() {
      const that = this;

      this.initialize(that);

      bus.$on('updatePackages', function packagesUpdatePackages() {
        that.updatePackages(that);
      });
    },
    beforeDestroy() {
      // Remove event listeners.
      bus.$off(['updatePackages', 'packagesUpdatePackages']);
    },
    methods: {
      initialize(that) {
        const baseURL = store.state.atlasEnvironments[store.state.env];

        // Get all code assets.
        code.get(baseURL)
        .then((data) => {
          // Save code data in central store.
          const options = {
            codeData: data,
          };
          store.commit('addSitesGridData', options);

          // Create buckets of cores, profiles, and packages.
          that.cores = data.filter(asset => asset.code_type === 'core').sort();
          that.profiles = data.filter(asset => asset.code_type === 'profile').sort();
          that.modules = data.filter(asset => asset.code_type === 'module');

          // Sort the modules/packages alphabetically for easier search.
          that.modules.sort((a, b) => {
            const sortOptions = {
              sensitivity: 'base',
              numeric: true,
            };
            return a.name.localeCompare(b.name, 'en', sortOptions);
          });
        });
      },
      search() {
        const that = this;
        const baseURL = store.state.atlasEnvironments[store.state.env];

        // Search for sites that match the query.
        atlas.request(baseURL, 'sites', that.atlasQuery)
        .then((data) => {
          // The results come in multiple arrays.
          let returnedSites = [];
          data.forEach((element) => {
            returnedSites = returnedSites.concat(element);
          });
          that.sitesToUpdate = returnedSites;

          // Build a list of sites by path to show the user before they update packages.
          const siteList = that.sitesToUpdate.map(val => val.path);

          bus.$emit('onMessage', {
            text: '<p>You will update the following sites (Site Count:' + that.sitesToUpdate.length + ').</p>' +
              '<p><strong>Paths:</strong><br/>' + siteList.join(', ') + '</p>',
            alertType: 'alert-warning',
          });

          this.showPackageUpdate = true;
        })
        .catch((error) => {
          console.log(error);
        });
      },
      resetSearch() {
        this.showPackageUpdate = false;
        this.sitesToUpdate = false;
      },
      updatePackages(that) {
        const baseURL = store.state.atlasEnvironments[store.state.env];

        // Loop through code types that are supposed to change.
        that.saveCodeTypes.forEach((type) => {
          // Loop through each site that needs updating.
          that.sitesToUpdate.forEach((site) => {
            // Skip sites don't have code on them for some reason.
            if (site.code) {
              // Need to create empty package array, because it isn't normalized on all sites.
              if (!site.code.package) {
                site.code.package = [];
              }

              // Loop through each site to update and remove/add packages.
              if (type === 'package') {
                that.addPackages.forEach((element) => {
                  if (!site.code.package.includes(element)) {
                    site.code.package.push(element);
                  }
                });

                that.removePackages.forEach((element) => {
                  if (site.code.package.includes(element)) {
                    site.code.package.splice(site.code.package.indexOf(element), 1);
                  }
                });
              }

              // If it is a core or profile, we can just replace the string.
              if (type === 'core') {
                site.code.core = that.chosenCore;
              }

              if (type === 'profile') {
                site.code.profile = that.chosenProfile;
              }

              // Make request to Atlas.
              const body = `{"code":${JSON.stringify(site.code)}}`;
              atlas.request(baseURL, 'sites/' + site._id, '', 'PATCH', body, site._etag)
              .then((resp) => {
                console.log(resp);
                if (typeof resp !== 'undefined') {
                  bus.$emit('onMessage', {
                    text: 'You have sent a request to update some code. Good luck on your journey!',
                    alertType: 'alert-success',
                  });
                }
              })
              .catch((error) => {
                console.log(error);
              });
            }
          });
        });
      },
    },
  };
</script>

<style scoped>

button {
  margin-top: 10px;
}

</style>

