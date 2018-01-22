<template>
  <div>
    <form id="search" class="row">
      <div class="form-group">
        <div class="col-md-8">
          <label for="filter-records">Filter Table</label>
          <input
            id="filter-records"
            class="form-control"
            name="query"
            @keydown.enter.prevent="selectFilter()"
            v-model="filterKey">
        </div>
        <div class="col-md-2">
          <label for="expression-search">Expression Search</label>
          <input type="checkbox"
            id="expression-search"
            class="form-control"
            name="expression-search"
            v-model="expressionFilter">
        </div>
      </div>
    </form>
    <div class="result-count">Result Count: {{resultCount}}</div>
    <div v-if="noResults">
      <div class="alert alert-info">Your query returned no results.</div>
    </div>
    <div class="table-responsive">
      <table class="table table-striped table-hover table-bordered table-sm">
        <thead>
        <tr>
          <th scope="col" >
            <input type="checkbox"
                  id="select-all-checkbox"
                  name="select-all-checkbox"
                  value="checked"
                  @change="selectAll($event)"
                  v-model="allChecked">
          </th>
          <th v-for="key in columns"
              :key="key"
              @click="sortBy(key)"
              :id="'table-header-' + key"
              scope="col"
              :class="{ active: sortKey == key}">
            {{ key | capitalize }}
            <span class="arrow"
                  v-if="sortKey === key"
                  :class="sortOrders[key] > 0 ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-up'">
            </span>
          </th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <row v-for="(data2, index) in dataObjects"
            v-if="showRow(index)"
            :data="data2"
            :key="data2.id"
            :old-data="filteredData[index]"
            :edit-keys="editKeys"
            :select-keys="selectKeys"
            :all-checked="allChecked"
            :callback="callback"
            :columns="columns">
        </row>
        </tbody>
      </table>
      <!-- Show More Records Links -->
      <div class="show-more-buttons"
           v-if="resultCount > showRowCount">
        <button class="btn btn-default" @click="showMore()" aria-label="Show More">Show More</button>
        <button class="btn btn-default" @click="showAll()" aria-label="Show All">Show All</button>
      </div>
    </div>
    <div v-if="Object.keys(extraContent).length > 0">
      <pre>
        {{extraContent}}
      </pre>
    </div>
  </div>
</template>

<script>
  import store from '../vuex/store';
  import bus from '../js/bus';

  export default {
    name: 'DataTable',
    props: {
      data: Array,
      columns: {
        type: Array,
        required: true,
      },
      editKeys: Array,
      selectKeys: Array,
      callback: String,
      defaultSortKey: String,
      defaultSortDirection: String,
    },
    data() {
      const sortOrders = {};
      this.columns.forEach((key) => {
        sortOrders[key] = Number(this.defaultSortDirection);
      });
      return {
        sortKey: this.defaultSortKey ? this.defaultSortKey : '',
        sortOrders,
        showAllRows: false,
        allChecked: false,
        extraContent: {},
        expressionFilter: false,
      };
    },
    created() {
      const that = this;
      bus.$on('hideRowExtraContent', () => {
        that.hideRowExtraContentListener(that);
      });

      bus.$on('viewRowExtraContent', (data) => {
        that.viewRowExtraContentListener(that, data);
      });

      // Hacky way of dealing with blank code/stats on Sites page load.
      // @todo Figure out.
      bus.$on('siteListingMounted', () => {
        that.siteListingMountedListener(that);
      });
    },
    computed: {
      filteredData() {
        const sortKey = this.sortKey;
        const filterKey = this.filterKey;
        // Negative one is DESC; positive one is ASC.
        // I think it is more useful to have the most recent changes first.
        const order = this.sortOrders[sortKey] || 1;
        let data = this.data;

        // If using the default fuzzy search, then filter that way.
        // The JS expression search is performed on enter keydown and not as
        // the user types.
        if (filterKey && !this.expressionFilter) {
          data = this.fuzzyFilterSearch(filterKey, data);
        }

        if (sortKey) {
          data = data.slice().sort((a, b) => {
            a = typeof a[sortKey] !== 'undefined' ? a[sortKey] : '';
            b = typeof b[sortKey] !== 'undefined' ? b[sortKey] : '';

            // We need to check
            if (Object.prototype.hasOwnProperty.call(a, 'localeCompare')) {
              const sortOptions = {
                sensitivity: 'base',
                numeric: true,
              };

              return b.localeCompare(a, 'en', sortOptions) * order;
            }

            return (a === b ? 0 : a > b ? -1 : 1) * order;
          });
        }

        // Set filteredData in store to be used elsewhere.
        store.commit('addFilteredData', data);

        return data;
      },
      filterKey: {
        get() {
          return store.state.filterKey;
        },
        set(value) {
          store.commit('setFilterKey', value);
        },
      },
      resultCount() {
        return this.filteredData.length;
      },
      noResults() {
        return this.filteredData.length < 1;
      },
      dataObjects() {
        // Transform data in array to object for comparison later.
        // @todo Remove this function and do this in filteredData().
        const realData = {};
        this.filteredData.forEach((element, index) => {
          realData[index] = {};
          Object.keys(element).forEach((part) => {
            realData[index][part] = element[part];
          });
        });
        return realData;
      },
      showRowCount() {
        return store.state.recordsToShow;
      },
    },
    filters: {
      capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      },
    },
    methods: {
      sortBy(key) {
        this.sortKey = key;
        this.sortOrders[key] = this.sortOrders[key] * -1;
      },
      showRow(index) {
        if (!this.showAllRows) {
          return index < this.showRowCount;
        }
        return true;
      },
      showMore() {
        store.commit('addRows', this.showRowCount + 25);
      },
      showAll() {
        this.showAllRows = !this.showAllRows;
      },
      selectAll(evt) {
        if (evt) {
          console.log('evt');
        }
        // Add all arrays into one.
        const siteIdsSend = [];
        this.filteredData.forEach((element) => {
          siteIdsSend.push(element.path);
        });

        // Store the site IDs array.
        if (this.allChecked) {
          store.commit('addAllSitesToCommands', siteIdsSend);
        } else {
          store.commit('addAllSitesToCommands', []);
        }

        // Emit event for rows to select themselves.
        if (this.allChecked) {
          bus.$emit('selectAllRows');
        } else {
          bus.$emit('clearAllRows');
        }
      },
      hideRowExtraContentListener(that) {
        that.extraContent = {};
      },
      viewRowExtraContentListener(that, data) {
        that.extraContent = { data };
      },
      siteListingMountedListener(that) {
        const tempKey = that.filterKey;
        that.filterKey = 'foo';
        that.filterKey = tempKey;
      },
      fuzzyFilterSearch(filterKey, data) {
        return data.filter(row => Object.keys(row)
          .some(key => this.columns.includes(key) && String(row[key]).toLowerCase().indexOf(filterKey.toLowerCase()) > -1));
      },
      expressionFilterSearch(filterKey, data) {
        let errorMessage = false;

        // Disabling eslint since the JS eval is using the row even though it looks like it isn't.
        /* eslint-disable */
        const newData = data.filter((row) => {
          const bundles = {
           /* and: (val) => {
              let match = false;
              row.forEach((val) => {

              });
            }, */
            or: (code) => {
              const re = new RegExp('(' + code + ')', 'i');
              return row.packages.some((val) => {
                if (val) {
                  return val.match(re);
                }
                return false;
              });
            },
          };

          try {
            if (eval(filterKey)) {
              return true;
            }
            return false;
          }
          catch(error) {
            console.log(error);
            errorMessage = error;
          }
        });
        /* eslint-enable */

        // @todo Provide better message here.
        if (errorMessage) {
          bus.$emit('onMessage', {
            text: errorMessage.message +
              '<br/>Check <a href="https://github.com/CuBoulder/lil_shrugger/wiki/Sites#filter-table" target="blank">' +
              'the search documentation</a> and refresh to search again.',
            alertType: 'alert-danger',
          });
        }
        return newData;
      },
      selectFilter() {
        if (this.expressionFilter) {
          this.data = this.expressionFilterSearch(this.filterKey, this.data);
        }
      },
    },
  };
</script>

<style>

td {
  max-width: 270px;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

</style>