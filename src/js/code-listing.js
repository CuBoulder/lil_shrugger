
// Imports Site Listing HTML into DOM of pages using it.
var link = document.querySelector('link[href="src/partials/listing.html"]');
var content = link.import;
var el = content.querySelector('script');
document.querySelector('body').appendChild(el.cloneNode(true));

// Imports Button HTML into DOM of pages using it.
link = document.querySelector('link[href="src/partials/confirm-button.html"]');
content = link.import;
el = content.querySelector('script');
document.querySelector('body').appendChild(el.cloneNode(true));

// Place site data in table via site-listing template located in site-listing.html.
codeListing = new Vue({
  el: '#code-listing',
  data: {
    searchQuery: '',
    gridColumns: ['id', 'label', 'name', 'version', 'code_type', 'hash'],
    gridData: [],
    callback: 'updateCodeRecord',
    editKeys: ['label', 'name', 'version', 'code_type', 'hash'],
    selectKeys: ['code_type'],
  },
  created: function () {
    bus.$on('switchEnv', function (env) {
      getCodeRecords(siteConfig.atlasEnvironments[env])
        .then(function (data) {
          codeListing.gridData = data;
        });
    })
  }
});

// Add create code button.
let codeCreateButton = new Vue({
  el: '#create-code',
  data: {
    selectOptions: siteConfig.selectOptions.type,
    repos: [],
    branches: [],
    branchToAdd: {},
    activeRepo: {},
    ready: false,
    branchReady: false,
    addCode: false,
    codeType: '',
    codeVersion: '',
    codeLabel: '',
  },
  computed: {
    userInput: function () {
      return {
        version: this.codeVersion,
        type: this.codeType,
        label: this.codeLabel,
      };
    }
  },
  methods: {
    changeRepo: function (event) {
      // Set to true for branch select list to appear.
      this.branchReady = true;
      this.branches = [];
      this.activeRepo = this.repos[event.target.value];

      let that = this;
      let response = getRepoBranches(this.activeRepo.name);

      response.then(function (branchesList) {
        that.branches = branchesList;

        // Add a default; otherwise user can't select first element.
        let first = {
          name: '-Select-',
          commit: {
            hash: null
          }
        };
        that.branches.unshift(first);
      });
    },
    changeBranch: function (event) {
      this.ready = true;
      this.branchToAdd = this.branches[event.target.value];
    },
    codeButton: function () {
      this.addCode = true;
    },
    createCode: function () {
      let repo = this.activeRepo;
      let branch = this.branchToAdd;
      let input = this.userInput;

      let codeAsset = {
        "git_url": repo.git_url,
        "commit_hash": branch.commit.sha,
        "meta": {
          "version": input.version,
          "code_type": input.type,
          "name": branch.name,
          "label": input.label,
          "is_current": true
        }
      };

      let baseURL = localStorage.getItem('env');
      atlasRequest(baseURL, 'code', query = '', 'POST', JSON.stringify(codeAsset))
        .then(response =>
          getCodeRecords(document.querySelector('.env-list .selected').innerHTML)
            .then(data => codeListing.gridData = data)
        );

      this.addCode = false;
    }
  }
});


/**
 * Gets a list of site records based on environment and pass data to template.
 *
 * @param env
 */
function getCodeRecords(env) {
  // Return a promise with formatted code data.
 return atlasRequest(localStorage.getItem('env'), 'code').then(function(data){
    return formatCodeData(data._items);
  });
}

/**
 * Need to format data for table.
 *
 * @param data
 */
function formatCodeData(data) {
  let formattedData = [];

  data.forEach(function (element, index) {
    let item = [];
    item['label'] = element.meta.label;
    item['code_type'] = element.meta.code_type;
    item['name'] = element.meta.name;
    item['version'] = element.meta.version;
    item['hash'] = element.commit_hash;
    item['etag'] = element._etag;
    item['id'] = element._id;
    formattedData.push(item);
  });

  return formattedData;
}

/**
 * Updates a code asset based on user input.
 *
 * @param formData
 * @param record
 * @param method
 */
function updateCodeRecord(formData, record, method = 'PATCH') {

  // Define parts of code record that are nested in the meta field.
  let metaKeys = ['code_type', 'is_current', 'label', 'name', 'version'];

  // Take input values from formData and put into array for comparison.
  // Only return values that are different.
  let formInput = {};
  formData.forEach(function (value, index) {
    if (value['name'] && record[value['name']] !== value['value']) {
      // Need to put meta fields in right place.
      if (metaKeys.indexOf(value['name']) !== -1) {
        // Initialize meta field if it doesn't exist yet.
        if (!formInput['meta']) {
          formInput['meta'] = {};
        }
        formInput['meta'][value['name']] = value['value'];
      } else {
        formInput[value['name']] = value['value'];
      }
    }
  });

  let baseURL = localStorage.getItem('env');
  atlasRequest(baseURL, 'code/' + record['id'], query = '', method, JSON.stringify(formInput), record['etag']);
}


