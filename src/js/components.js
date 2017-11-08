/**
 * Creates a listing component for data in a table.
 */
Vue.component('listing', {
  template: '#listing',
  props: {
    data: Array,
    columns: {
      type: Array,
      required: true
    },
    filterKey: String,
    editKeys: Array,
    selectKeys: Array,
    callback: String,
    extraContent: {
      type: Object,
      default: {}
    },
  },
  data: function () {
    let sortOrders = {};
    this.columns.forEach(function (key) {
      sortOrders[key] = 1;
    });
    return {
      sortKey: '',
      sortOrders: sortOrders,
      showAllRows: false,
      allChecked: false
    };
  },
  computed: {
    filteredData: function () {
      let sortKey = this.sortKey;
      let filterKey = this.filterKey && this.filterKey.toLowerCase();
      let order = this.sortOrders[sortKey] || 1;
      let data = this.data;

      if (filterKey) {
        data = data.filter(function (row) {
          return Object.keys(row).some(function (key) {
            return String(row[key]).toLowerCase().indexOf(filterKey) > -1;
          });
        });
      }

      if (sortKey) {
        data = data.slice().sort(function (a, b) {
          a = a[sortKey];
          b = b[sortKey];
          return (a === b ? 0 : a > b ? 1 : -1) * order;
        });
      }

      // Set filterdData in store to be used elsewhere.
      store.commit('addFilteredData', data);

      return data;
    },
    resultCount: function () {
      return this.filteredData.length;
    },
    noResults: function () {
      return this.filteredData.length < 1;
    },
    dataObjects: function () {
      // Transform data in array to object for comparison later.
      // @todo Remove this function and do this in filteredData().
      let realData = {};
      this.filteredData.forEach(function (element, index) {
        realData[index] = {};
        for (obj in element) {
          realData[index][obj] = element[obj];
        }
      });
      return realData;
    },
    showRowCount: function () {
      return store.state.recordsToShow;
    }
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
  },
  methods: {
    sortBy: function (key) {
      this.sortKey = key;
      this.sortOrders[key] = this.sortOrders[key] * -1;
    },
    showRow: function (index) {
      if (!this.showAllRows) {
        return index < this.showRowCount;
      }
      return true;
    },
    showMore: function () {
      store.commit('addRows', this.showRowCount + 25);
    },
    showAll: function () {
      this.showAllRows = !this.showAllRows;
    },
    selectAll: function () {
      // Add all arrays into one.
      let siteIdsSend = [];
      this.filteredData.forEach(function (element, index) {
        siteIdsSend.push(element.path);
      });

      // Store the site IDs array.
      if (this.allChecked) {
        store.commit('addAllSitesToCommands', siteIdsSend);
      } else {
        store.commit('addAllSitesToCommands', []);
      }
    }
  }
});

/**
 * Creates a button component with comfirm step.
 */
Vue.component('row', {
  template: '#a-row',
  props: {
    data: Object,
    dataArray: Array,
    editKeys: Array,
    selectKeys: Array,
    columns: Array,
    oldData: Array,
    allChecked: Boolean,
    selectOptions: {
      type: Object,
      default: function () {
        return siteConfig.selectOptions;
      }
    },
    callback: String,
    editProp: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      edit: this.editProp,
      specialEditContent: {},
      view: false,
      checked: this.allChecked
    };
  },
  created: function () {
    // Accepts own row component and cancels edit mode.
    bus.$on('confirmButtonSuccess', function (that) {
      that.edit = false;
    });
  },
  computed: {
    params: function () {
      return {
        previous: this.oldData,
        current: this.data,
      };
    },
    editContent: function () {
      return store.state.editContent;
    },
    isChecked: function () {
      return this.allChecked;
    }
  },
  methods: {
    link: function (value, key) {
      // Link path to instance.
      if (key === 'path') {
        return '<a href="' + store.state.expressEnvironments[store.state.env] + value + '">' + value + '</a>';
      }

      // Link to full code/site record.
      if (key === 'id') {
        let atlasEnvironment = store.state.atlasEnvironments[store.state.env];
        // Determine site or code record from other key.
        if (this.editKeys.indexOf('commit_hash') !== -1) {
          return '<a href="' + atlasEnvironment + 'code/' + value + '">(Code Record)</a>';
        } else {
          return '<a href="' + atlasEnvironment + 'sites/' + value + '">' + '(Site)</a><br/>(<a href="' + atlasEnvironment + 'statistics/' + this.data.statistics + '">Stats</a>)';
        }
      }

      // Deal with empty packages arrays.
      if (typeof value === 'undefined' || value.length === 0) {
        return 'N/A';
      }

      return value;
    },
    selectType: function (index) {
      if (this.selectKeys.indexOf(index) !== -1) {
        return true;
      }
      return false;
    },
    selectRow: function (event) {
      this.checked = !this.checked;

      // Add row to sites array for commands.
      store.commit('addSiteToCommands', {
        add: this.checked,
        siteId: this.data.path
      });

    },
    showEdit: function (index = null) {
      if (this.edit) {
        if (index === null || this.editKeys.indexOf(index) !== -1) {
          return true;
        }
      }
      return false;
    },
    showDefault: function (index = null) {

      // Check for user permission to edit row.
      if (index === null && !userAccess('row:edit')) {
        return false;
      }

      if (!this.edit || this.editKeys.indexOf(index) === -1 && index !== null) {
        return true;
      }
      return false;
    },
    makeEdit: function () {
      // Get row type.
      let type = 'sites';
      if (typeof this.data.code_type !== 'undefined') {
        type = 'code';
      }

      let that = this;
      atlasRequest(store.state.atlasEnvironments[store.state.env], type + '/' + this.data.id)
        .then(function (data) {
          // Check and see if etags are different and update row data if so.
          if (data[0]._etag !== that.data.etag) {
            bus.$emit('onMessage', {
              text: 'The etag has changed for this record. The listing of records has been updated with the latest data.',
              alertType: 'alert-danger'
            });
            bus.$emit('etagFail', that);
            return;
          }

          // Otherwise, continue with row edit.
          that.edit = true;
          // Emit event for other components to act on when row is being edited.
          bus.$emit('rowEdit', that);
        });
    },
    cancelEdit: function () {
      bus.$emit('cancelEdit', this);
      this.edit = false;
    },
    viewRecord: function () {
      this.view = !this.view;
      bus.$emit('rowView', this);
    },
    hideRecord: function () {
      this.view = !this.view;
      bus.$emit('rowHide', this);
    }
  }
});

/**
 * Creates a button component with comfirm step.
 */
Vue.component('confirm-button', {
  template: '#confirm-button',
  props: {
    label: String,
    callback: String,
    row: {
      type: Object,
      default: function () {
        return {};
      }
    },
    params: Object,
    confirmProp: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      confirmed: this.confirmProp,
    };
  },
  methods: {
    callMeMaybe: function (callback, params) {
      // Emit whatever event the button confirmed.
      bus.$emit(callback, params);

      // Send event for row component to cancel edit functionality.
      bus.$emit('confirmButtonSuccess', this.row);

      // Cancel edit mode within confirm button component.
      this.cancel();
    },
    confirm: function () {
      this.confirmed = true;
    },
    cancel: function () {
      this.confirmed = false;
    }
  }
});

Vue.component('message-area', {
  template: '#message-area',
  data () {
    return {
      messages: [],
      bsAlert: 'alert',
    };
  },
  created() {
    let that = this;

    // To use this anywhere: bus.$emit('onMessage', {text: 'You have deleted a site.', alertType: 'alert-info'});
    // You can use any available bootstrap alert classes: alert-info, alert-success, alert-danger, etc.
    bus.$on('onMessage', function (params) {
      that.messages.push(params);
    });
  },
  methods: {
    close: function (index) {
      this.messages.splice(index, 1);
    }
  }
});

Vue.component('autocomplete-input', {
  template: '#autocomplete-input',
  props: {
    model: String,
    optionsKey: String,
    theKey: String
  },
  data () {
    return {
      isOpen: false,
      highlightedPosition: 0,
      keyword: this.model
    };
  },
  created () {
    let that = this;

    // Allow other autocomplete inputs to interact and update each other.
    bus.$on('matchKeys', function (params) {
      // If the key of this component matches then change the desired key.
      if (params.key === that.theKey) {
        that.keyword = params.keyword;
      }
    });

    // Add data from query params for search on page load.
    bus.$on('searchByQueryParam', function (paramQuery) {
      if (that.theKey === 'title') {
        that.keyword = paramQuery.title;
      }

      if (that.theKey === 'query') {
        that.keyword = paramQuery.query;
      }
    });
  },
  computed: {
    fOptions () {
      const re = new RegExp(this.keyword, 'i');
      return this.options.filter(o => o[this.theKey].match(re));
    },
    options: function () {
      return store.state[this.optionsKey];
    }

  },
  methods: {
    onInput: function (value) {
      this.isOpen = !!value;
      this.highlightedPosition = 0;
    },
    moveDown () {
      if (!this.isOpen) {
        return;
      }
      this.highlightedPosition = (this.highlightedPosition + 1) % this.fOptions.length;
    },
    moveUp () {
      if (!this.isOpen) {
        return;
      }
      this.highlightedPosition = this.highlightedPosition - 1 < 0 ? this.fOptions.length - 1 : this.highlightedPosition - 1;
    },
    select () {
      const selectedOption = this.fOptions[this.highlightedPosition];
      this.keyword = selectedOption[this.theKey];
      this.isOpen = false;
      let params = {selectedOption};
      params['key'] = this.theKey;
      bus.$emit('select', params);
    }
  }
});

Vue.component('commands', {
  template: '#commands',
  props: {
    gridColumns: Array,
  },
  data () {
    return {
      selectedCommand: '',
      exportCallback: 'exportTable',
    };
  },
  created () {
    let that = this;
  },
  computed: {
    commands: function () {
      return store.state.commands;
    },
    reportsList: function () {
      return store.state.reportsList;
    },
  },
  methods: {
    userAccessPerm: function (permission) {
      return userAccess(permission);
    },
  },
});

Vue.component('statsSearch', {
  template: '#stats-search',
  props: {
    filter: String,
  },
  data () {
    return {
      statsQuery: '',
      statsQueryName: '',
      statsQueryDescription: '',
      statsQueryEndpoint: '',
      statsQueryTags: '',
      optionsKey: 'statsQueryOptions',
      reset: false,
    };
  },
  created () {
    let that = this;

    // Listen for autocomplete selections and match both inputs.
    bus.$on('select', function (params) {
      that.selectListener(params, that);
    });

    bus.$on('siteListingMounted', function (params) {
      that.siteListingMountedListener(params, that);
    });
  },
  computed: {
    commands: function () {
      return store.state.commands;
    },
  },
  methods: {
    siteListingMountedListener: function (params, that) {
      // Check for query params.
      if (window.location.search === "") {
        return;
      }

      // Format the query params into an array.
      let queryParams = {};
      window.location.search.slice(1).split('&').map(function (item, index) {
        const parts = item.split('=');
        queryParams[parts[0]] = parts[1];
      });

      // Get property names to match to filter and search.
      const propertyNames = Object.getOwnPropertyNames(queryParams);

      // Set the search.
      if (propertyNames.indexOf('query') !== -1) {
        // Find the query name of the ID entered.
        const storedQueries = store.state.statsQueryOptions;

        let paramQuery = {};
        storedQueries.forEach(function (element) {
          if (element._id == queryParams.query) {
            paramQuery = element;
            return;
          }
        });

        // If ID found, perform search.
        if (paramQuery !== 'undefined') {
          that.search(paramQuery);

          // Have to send event to set names since they live in autocomplete inputs.
          bus.$emit('searchByQueryParam', paramQuery);
        }
      }
    },
    selectListener: function (params, that) {
      // Since we know that we have queries and titles, we can check the key and
      // make the opposite property match what the user selected.
      let params2 = {};
      if (params.key === 'title') {
        params2 = {
          keyword: params.selectedOption.query,
          key: 'query'
        };
        bus.$emit('matchKeys', params2);
      } else {
        params2 = {
          keyword: params.selectedOption.title,
          key: 'title'
        };
        bus.$emit('matchKeys', params2);
      }

      // Fill in other keys.
      let currentQuery = {};
      store.state.statsQueryOptions.forEach(function (element, index) {
        if (params2.key === 'title' && element.title === params2.keyword) {
          that.statsQueryDescription = element.description;
          that.statsQueryEndpoint = element.endpoint;
          that.statsQueryTags = element.tags.join(',');
          currentQuery = element;
        }

        if (params2.key === 'query' && element.query === params2.keyword) {
          that.statsQueryDescription = element.description;
          that.statsQueryEndpoint = element.endpoint;
          that.statsQueryTags = element.tags.join(',');
          currentQuery = element;
        }
      });

      // Save current query for check when updating queries.
      store.commit('storeQuery', currentQuery);
    },
    search: function (querySent = null) {
      let query = null;
      let name = null;
      let that = this;

      // If query already passed in, use that.
      if (querySent !== null) {
        query = querySent.query;
        name = querySent.title;
      }
      // If no passed in query, then we need to grab it from autocomplete fields.
      // Autocomplete is another component.
      else {
        this.$children.forEach(function (element, index) {
          if (element.theKey === 'query') {
            query = element.keyword;
          }
          if (element.theKey === 'title') {
            name = element.keyword;
          }
        });

        // If no query, then emit an error message and return.
        if (query === null) {
          bus.$emit('onMessage', {
            text: 'No query found.',
            alertType: 'alert-danger'
          });
          return;
        }
      }

      // Find the query name of the ID entered.
      const storedQueries = store.state.statsQueryOptions;
      let paramQuery = {};
      storedQueries.forEach(function (element) {
        if (element.query == query) {
          paramQuery = element;
          return;
        }
      });

      // Set the history to update the query parameters for sharing URLs.;
      const filter = that.filter ? '?filter=' + that.filter : '';

      // We have to check for the existence of the first query parameter here.
      // I'm sure this can be done in a better way, but with only two parameters
      // this is fine for now.
      let queryS = '';
      if (filter) {
        queryS = paramQuery._id ? '&query=' + paramQuery._id : '';
      }
      else {
        queryS = paramQuery._id ? '?query=' + paramQuery._id : '';
      }

      // The blank parameters aren't added here.
      const queryString = filter + queryS;
      history.pushState(null, null, location.origin + location.pathname + queryString);

      // Make request to Atlas.
      let baseURL = store.state.atlasEnvironments[store.state.env];
      atlasRequest(baseURL, 'statistics', '?where=' + query)
        .then(function (objects) {

          // If no search results returned, catch with error.
          if (typeof objects["0"]._error !== 'undefined') {
            bus.$emit('onMessage', {
              text: 'Error in Atlas Request: ' + objects["0"]._error.message + '. Your search has been reset.',
              alertType: 'alert-danger'
            });
            that.$options.methods.resetSearch(that);
          }

          // Get array only of site IDs to check from stats query.
          let siteIds = [];
          objects.forEach(function (elements, index) {
            elements.forEach(function (element, index) {
              siteIds.push(element['site']);
            });
          });

          // Filter results by using the site ID stored in stats records.
          // By setting the gridData property, the view will automatically update.
          siteListing.sitesData = siteListing.cachedRecords.filter(function (row) {
            return siteIds.indexOf(row['id']) > -1;
          });
          that.reset = true;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    resetSearch: function (thing = null) {
      let that = thing ? thing : this;

      // Reset keywords in child components.
      // @todo see if this can be stored in Store object.
      that.$children.forEach(function (element) {
        if (typeof element.keyword !== 'undefined') {
          element.keyword = '';
        }
      });

      // Reset other query fields not in autocomplete component.
      that.statsQueryDescription = '';
      that.statsQueryEndpoint = '';
      that.statsQueryTags = '';

      // Reset stored query.
      store.commit('storeQuery', null);

      // By using the cached results when the page is loaded, the query can be reverted.
      siteListing.sitesData = siteListing.cachedRecords;
      siteListing.searchQuery = '';
      that.reset = false;

      // Reset data in query params.
      history.pushState(null, null, location.origin + location.pathname);
    },
    saveSearch: function () {
      let queryToSend = null;
      let name = null;

      // Grab keyword to search for.
      this.$children.forEach(function (element, index) {
        if (element.theKey === 'query') {
          queryToSend = element.keyword;
        }
        if (element.theKey === 'title') {
          name = element.keyword;
        }
      });

      // Convert to unicode.
      queryToSend = convertToUnicode(queryToSend);

      // Make tags into string with quotes.
      const tags = this.statsQueryTags.replace(new RegExp(',', 'g'), '","');
      const data = '{"title": "' + name + '", "description": "' + this.statsQueryDescription + '", "endpoint": ["statistic"], "query": "' + queryToSend + '", "tags": ["' + tags + '"], "rank": 1}';

      // Make request to Atlas.
      let baseURL = store.state.atlasEnvironments[store.state.env];
      let currentQuery = store.state.currentQuery;

      // If there is a current query, then we assume we are patching it.
      if (currentQuery !== null) {
        atlasRequest(baseURL, 'query/' + currentQuery['_id'], '', 'PATCH', data, currentQuery['_etag'])
          .then((response) => {
            bus.$emit('onMessage', {
              text: 'You have sent a PATCH request to a query record. query ID: ' + currentQuery['_id'] + '. Search and reset to add new query.',
              alertType: 'alert-success'
            });
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        // If no current query, then we assume we are making a new one.
        atlasRequest(baseURL, 'query', '', 'POST', data)
          .then((response) => {
            bus.$emit('onMessage', {
              text: 'You have sent a POST request to add query record. Search and reset to add new query.',
              alertType: 'alert-success'
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
    userAccessPerm: function (permission) {
      return userAccess(permission);
    },
  },
});

// Add create code button.
Vue.component('createCode', {
  template: '#create-code',
  data () {
    return {
      selectOptions: siteConfig.selectOptions,
      branches: [],
      branchToAdd: {},
      activeRepo: {},
      ready: false,
      branchReady: false,
      addCode: false,
      codeType: 'module',
      tag: 'beta_bundle',
      codeVersion: '',
      codeLabel: '',
      isCurrent: false,
    }
  },
  computed: {
    userInput: function () {
      return {
        version: this.codeVersion,
        type: this.codeType,
        label: this.codeLabel,
        is_current: this.isCurrent,
        tag: this.tag,
      };
    },
    repos: function () {
      return store.state.gitHubRepos;
    },
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

      // Need to check for special code assets (drupal/express) and set data accordingly.
      if (repo.name === 'drupal-7.x') {
        repo.name = 'drupal';
      }

      // Turn tag into array.
      input.tag = [input['tag']];

      let codeAsset = {
        "git_url": repo.ssh_url,
        "commit_hash": branch.commit.sha,
        "meta": {
          "version": input.version,
          "code_type": input.type,
          "name": repo.name,
          "label": input.label,
          "is_current": input.is_current,
          "tag": input.tag,
        }
      };

      let baseURL = store.state.atlasEnvironments[store.state.env];
      atlasRequest(baseURL, 'code', query = '', 'POST', JSON.stringify(codeAsset))
        .then((response) => {
          bus.$emit('onMessage', {
            text: 'You have created a code asset.',
            alertType: 'alert-success'
          });
          getCodeRecords(store.state.atlasEnvironments[store.state.env])
            .then(data => codeListing.gridData = data);
        })
        .catch(error => console.log(error));

      this.addCode = false;
    }
  }
});
