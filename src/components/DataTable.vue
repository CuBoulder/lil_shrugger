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
            v-model="filterKey">
        </div>
        <div class="col col-md-2" id="expression-search-buttons">
        <button v-if="!expressionFilter" class="btn btn-default" @click.prevent="expressionFilter = !expressionFilter" aria-label="Toggle Expression Search">
          <span class="glyphicon glyphicon-superscript" aria-hidden="true"></span>
        </button>
        <button v-if="expressionFilter" class="btn btn-primary" @click.prevent="expressionFilterSearch()" aria-label="Expression Search">
          Expression Search
        </button>
        <button v-if="expressionFilter" class="btn btn-default" @click.prevent="cancelExpressionFilterSearch()" aria-label="Expression Search">
          Reset
        </button>
        </div>
      </div>
    </form>
    <div class="result-count">Result Count: {{ resultCount }}</div>
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
                   @change="selectAll()"
                   v-model="allChecked">
          </th>
          <th v-for="key in columns"
              :key="key"
              @click="sortBy(key)"
              :id="'table-header-' + key"
              scope="col"
              :class="{ active: sortKey == key}">
            {{ key }}
            <span class="arrow"
                  v-if="sortKey === key"
                  :class="sortOrders[key] > 0 ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-up'">
            </span>
          </th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <row v-for="(data, index) in filteredData"
            v-if="showRow(index)"
            :data="data"
            :key="data._id"
            :old-data="filteredData[index]"
            :edit-keys="editKeys"
            :select-keys="selectKeys"
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
        cachedData: null,
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

            // We need to check whther the value is a string to use this sorting function.
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

        // Convert array into objects.
        const savedData = this.dataObjects(data);

        // Set filteredData in store to be used elsewhere.
        store.commit('addFilteredData', savedData);
        return savedData;
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
        return Object.keys(this.filteredData).length;
      },
      noResults() {
        return this.filteredData.length < 1;
      },
      showRowCount() {
        return store.state.recordsToShow;
      },
    },
    methods: {
      dataObjects(data) {
        // Transform data in array to object for comparison later.
        // @todo Remove this function and do this in filteredData().
        const realData = {};
        data.forEach((element, index) => {
          realData[index] = {};
          Object.keys(element).forEach((part) => {
            realData[index][part] = element[part];
          });
        });
        return realData;
      },
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
      selectAll() {
        // Add all arrays into one.
        const siteIdsSend = [];
        Object.keys(this.filteredData).forEach((element) => {
          siteIdsSend.push(this.filteredData[element].path);
        });

        // Store site IDs and emit event for rows to select themselves.
        if (this.allChecked) {
          store.commit('addAllSitesToCommands', siteIdsSend);
          bus.$emit('selectAllRows');
        } else {
          store.commit('addAllSitesToCommands', []);
          bus.$emit('clearAllRows');
        }
      },
      hideRowExtraContentListener(that) {
        that.extraContent = {};
      },
      viewRowExtraContentListener(that, data) {
        that.extraContent = { data };
      },
      fuzzyFilterSearch(filterKey, data) {
        return data.filter(row => Object.keys(row)
          .some(key => this.columns.includes(key) && String(row[key]).toLowerCase().indexOf(filterKey.toLowerCase()) > -1));
      },
      expressionFilterSearch() {
        let errorMessage = false;
        const data = this.data;
        const filterKey = this.filterKey;

        // Disabling eslint since the JS eval is using the row even though it looks like it isn't.
        /* eslint-disable */
        const newData = data.filter((row) => {
          // We can add helper functions to make it easier to query the code asset records.

          // Add a packages object to help query records.
          const packages = {
            /*
            and: (val) => {
              let match = true;
              row.forEach((val) => {
                if (!this.or(val)) {
                  return false;
                }
              });
              return match;
            }, */
            // Return true if either value is found, e.g. code = 'digital|news' and returns records with either package.
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

          // Try to evaluate the expression entered into the filter.
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

        // Set new data and save old data.
        this.cachedData = this.data;
        this.data = newData;
      },
      cancelExpressionFilterSearch() {
        this.expressionFilter = !this.expressionFilter;

        // Need to reset filter.
        store.commit('setFilterKey', '');

        // Add back cached data.
        if (this.cachedData) {
          this.data = this.cachedData;
        }
      },
    },
  };
</script>

<style scoped>

td {
  max-width: 270px;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

#expression-search-buttons {
  padding-top: 25px;
  padding-left: 0px;
}

#search {
  padding-bottom: 20px;
}

</style>