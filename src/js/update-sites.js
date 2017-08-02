/**
 * Imports Site Listing HTML into DOM of pages using it.
 *
 * @type {Element}
 */
var link = document.querySelector('link[href="src/partials/listing.html"]');
var content = link.import;
var el = content.querySelector('script');
document.querySelector('body').appendChild(el.cloneNode(true));

let baseURL = store.state.atlasEnvironments[store.state.env];

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
      let endpoint = '/sites';

      atlasRequest(baseURL, endpoint, query = siteQuery, method = 'GET', body = null, etag = null).then(data => that.sites = data);
    },
    getCodes() {
      let that = this;
      let endpoint = '/code';

      atlasRequest(baseURL, endpoint, query = '', method = 'GET', body = null, etag = null).then(data => that.codes = data);
    },
    sendToAtlas() {
      let siteOriginalPackages = this.sites._items;

      siteOriginalPackages.forEach(function(e) {
        let baseURL = getAtlasURL(document.querySelector('.env-list .selected').innerHTML);

        let id = e._id;
        let addPackages = vm.updatePackages;
        let removePackages = vm.removePackages;
        let sitePackages = [];

        if (e.code.package) {
          let sitePackages = e.code.package;
        }

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

        if (packagesAdded.length <= 0) {
          return '';
        } else {
          atlasRequest(baseURL, endpoint, query = '', method = 'PATCH', body = data, etag = site_etag);
          window.scrollTo(0, 0);
          $('#update-packages').attr('disabled','disabled');
          console.log('Request has been sent to Atlas.');
        }

      });

    },
    codeName(index) {
      let codeItem = vm.codes._items;

      codeItem.forEach(function(e) {
        let codeName = e.meta.name;
        let codeID = e._id;

        if (codeID === index) {
          index = codeName;
        }
      });

      return index;
    }
  },
  computed: {
    computedCodeName(index) {
      let codeItem = vm.codes._items;
      let sitePackage = vm.sites._items;

      sitePackage.forEach(function(e) {
        let index = e.code.package;

        codeItem.forEach(function(o) {
          let codeName = o.name;
          let codeID = o._id;

          if (codeID === index) {
            let index = codeName;
            return index;
          }
        });
      });
    }
  },
  mounted () {
    this.getCodes()
  }
});
