let env = document.querySelector('.env-list .selected').innerHTML;
let baseURL = getAtlasURL(env);
let baseSitesURL = baseURL + '/sites';
let baseCodeURL = baseURL + '/code';

var vm = new Vue({
  el: '#list-full-sites',
  data: {
    finalPackages: [],
    updatePackages: [],
    removePackages: [],
    atlasRequest: [],
    packages: [],
    codes: [],
    sites: [],
    siteQuery: []
  },
  methods: {
    getSites(siteQuery) {
      let that = this;
      let request = new XMLHttpRequest();
      request.open('GET', (baseSitesURL + siteQuery), true);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          that.sites = JSON.parse(request.responseText);
        } else {
          // We reached our target server, but it returned an error
        }
      };

      request.send();
    },
    getCodes() {
      let that = this;
      let request = new XMLHttpRequest();
      request.open('GET', baseCodeURL, true);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          that.codes = JSON.parse(request.responseText);
        } else {
          // We reached our target server, but it returned an error
        }
      };

      request.send();
    },
    sendToAtlas() {
      let siteOriginalPackages = this.sites._items;

      siteOriginalPackages.forEach(function(e) {
        let baseURL = getAtlasURL(document.querySelector('.env-list .selected').innerHTML);

        let id = e._id;
        let addPackages = vm.updatePackages;
        let removePackages = vm.removePackages;
        let sitePackages = e.code.package;

        let endpoint = 'sites/' + id;

        function remove(array, element) {
          const index = array.indexOf(element);
          array.splice(index, 1);
        }

        if (removePackages.length > 0) {
          removePackages.forEach(function (e) {
            remove(sitePackages, "e");
          });
        }

        let packagesAdded = sitePackages.concat(addPackages);

        let data = JSON.stringify({
          "code": {
            "package": packagesAdded
          }
        });

        let site_etag = e._etag;

        console.log(data);
        atlasRequest(baseURL, endpoint, query = '', method = 'PATCH', body = data, etag = site_etag);
      });

      // atlasRequest(baseURL, endpoint, query = '', method = 'GET', body = null, etag = null);
    }
  },
  computed: {
    computedFinalPackages() {
      let siteOriginalPackages = vm.sites._items[1].code.package;
      let finalPackages = vm.finalPackages;
      let removePackages = vm.removePackages;
      let output = siteOriginalPackages;
      return output;
    }
  },
  mounted () {
    this.getCodes()
  }
});