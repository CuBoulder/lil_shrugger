/**
 * Imports Site Listing HTML into DOM of pages using it.
 *
 * @type {Element}
 */
let packageBaseURL = store.state.atlasEnvironments[store.state.env];

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

let vm = new Vue({
  el: '#list-full-sites',
  data: {
    finalPackages: [],
    updatePackages: [],
    removePackages: [],
    atlasRequest: [],
    packages: [],
    codes: [],
    sites: [],
    siteQuery: '?where={"code.package":"5972304889b0dc0c61cf5df3"}'
  },
  methods: {
    getSites(siteQuery) {
      let that = this;
      let endpoint = 'sites';
      console.log(packageBaseURL+endpoint+siteQuery);

      atlasRequest(packageBaseURL, endpoint, query = siteQuery, method = 'GET', body = null, etag = null).then(data => that.sites = data[0]).then(
        function setPackages() {
          let singlePackage = [];
          for(site of that.sites) {
            for(single of site.code.package) {
              singlePackage.push(single);
            }
          }
          var names = singlePackage;
          var uniqueNames = [];
          $.each(names, function(i, el){
            if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
          });
          that.packages = uniqueNames;
        }
      );
    },
    getCodes() {
      let that = this;
      let endpoint = 'code';
      console.log(packageBaseURL+endpoint);

      atlasRequest(packageBaseURL, endpoint, query = '', method = 'GET', body = null, etag = null).then(data => that.codes = data[0]);
    },
    sendToAtlas() {
      let that = this;
      let siteOriginalPackages = that.sites;

      siteOriginalPackages.forEach(function(e) {
        // let packageBaseURL = getAtlasURL(document.querySelector('.env-list .selected').innerHTML);

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

        if (packagesAdded.length < 0) {
          return '';
        } else {
          console.log(packagesAdded);
          atlasRequest(packageBaseURL, endpoint, query = '', method = 'PATCH', body = data, etag = site_etag);
          //window.scrollTo(0, 0);
          $('#update-packages').attr('disabled','disabled');
          console.log('Request has been sent to Atlas.');
        }

      });

    },
    codeName(index) {
      let codeItem = vm.codes;

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
      let codeItem = vm.codes;
      let sitePackage = vm.sites;

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
    this.getCodes();
  }
});
