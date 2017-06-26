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

        baseCodeURL = baseSitesURL + siteQuery;
        console.log(baseCodeURL);

      $.getJSON( baseCodeURL, {
        format: "json"
      })
        .done(function( data ) {
          that.sites = data;
        });
    },
    getCodes() {
      let that = this;
      $.getJSON( baseCodeURL, {
        format: "json"
      })
        .done(function( data ) {
          that.codes = data;
        });
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
          if (confirm("You're about to send an empty array that will remove all packages. (This message will appear for each site, sorry.)")) {
            atlasRequest(baseURL, endpoint, query = '', method = 'PATCH', body = data, etag = site_etag);

            $('#messages').html('<p class="alert alert-success" role="alert">Request has been sent to Atlas.</p>');
            window.scrollTo(0, 0);
            $('#update-packages').attr('disabled','disabled');
            console.log('Request has been sent to Atlas.');
          } else {
            console.log('action canceled.');
            return '';
          }
        } else {
          return '';
        }

      });

      // atlasRequest(baseURL, endpoint, query = '', method = 'GET', body = null, etag = null);
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