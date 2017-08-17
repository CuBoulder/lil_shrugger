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
      sortOrders[key] = 1
    });
    return {
      sortKey: '',
      sortOrders: sortOrders,
      showAllRows: false,
      allChecked: false
    }
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
          })
        })
      }

      if (sortKey) {
        data = data.slice().sort(function (a, b) {
          a = a[sortKey];
          b = b[sortKey];
          return (a === b ? 0 : a > b ? 1 : -1) * order;
        })
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
        return siteConfig.selectOptions
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
    }
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
      }
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
          return '<a href="' + atlasEnvironment + 'code/' + value + '">' + value + '</a>';
        } else {
          return '<a href="' + atlasEnvironment + 'sites/' + value + '">' + '(Site)</a><br/>(<a href="' + atlasEnvironment + 'statistics/' + this.data.statistics + '">Stats</a>)';
        }
      }

      // Deal with empty packages arrays.
      if (key === 'packages') {
        if (value.length === 0) {
          return 'N/A';
        }
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
      store.commit('addSiteToCommands', {add: this.checked, siteId: this.data.path});

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
        })
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
        return {}
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
    }
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
  template: '<div><div :class="[bsAlert, message.alertType]" v-for="(message, index) in messages">{{message.text}}<button type="button" class="close" aria-label="Close" @click="close(index)"><span aria-hidden="true">&times;</span></button></div></div>',
  props: {
    messages: {
      type: Array,
      default: []
    },
    bsAlert: {
      type: String,
      default: 'alert'
    }
  },
  methods: {
    close: function (index) {
      this.messages.splice(index, 1);
    }
  }
});

let alert = new Vue({
  el: '#alert',
  data: {
    messages: []
  },
  created() {
    // To use this anywhere: bus.$emit('onMessage', {text: 'You have deleted a site.', alertType: 'alert-info'});
    // You can use any available bootstrap alert classes: alert-info, alert-success, alert-danger, etc.
    bus.$on('onMessage', function (params) {
      alert.messages.push(params);
    });
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
    }
  },
  created () {
    // Allow other autocomplete inputs to interact and update each other.
    let that = this;
    bus.$on('matchKeys', function (params) {
      // If the key of this component matches then change the desired key.
      if (params.key === that.theKey) {
        that.keyword = params.keyword;
      }
    })
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
