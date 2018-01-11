<template>
  <div class="lisitng-wrapper">
    <form id="search" class="row">
      <div class="form-group">
        <label for="filter-records">Filter Table</label>
        <input
            id="filter-records"
            class="form-control"
            name="query"
            v-model="filterKey">
      </div>
    </form>
    <div class="result-count">Result Count: {{resultCount}}</div>
    <div v-if="noResults">
      <div class="alert alert-info">Your query returned no results.</div>
    </div>
    <table class="table table-responsive">
      <thead>
      <tr>
        <th>
          <input type="checkbox"
                 id="select-all-checkbox"
                 name="select-all-checkbox"
                 value="checked"
                 @change="selectAll($event)"
                 v-model="allChecked">
        </th>
        <th v-for="key in columns"
            @click="sortBy(key)"
            :id="'table-header-' + key"
            :class="{ active: sortKey == key}">
          {{ key | capitalize }}
          <span class="arrow" :class="sortOrders[key] > 0 ? 'asc' : 'dsc'">
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
      <!-- Show More Records Links -->
      <div v-if="resultCount > showRowCount">
        <button class="btn btn-default" @click="showMore()" aria-label="Show More">Show More</button>
        <button class="btn btn-default" @click="showAll()" aria-label="Show All">Show All</button>
      </div>
    </table>
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
    },
    data() {
      const sortOrders = {};
      this.columns.forEach((key) => {
        sortOrders[key] = 1;
      });
      return {
        sortKey: '',
        sortOrders,
        showAllRows: false,
        allChecked: false,
        extraContent: {},
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
        const filterKey = this.filterKey && this.filterKey.toLowerCase();
        const order = this.sortOrders[sortKey] || 1;
        let data = this.data;

        if (filterKey) {
          data = data.filter(row => Object.keys(row)
            .some(key => String(row[key]).toLowerCase().indexOf(filterKey) > -1));
        }

        if (sortKey) {
          data = data.slice().sort((a, b) => {
            a = a[sortKey];
            b = b[sortKey];
            return (a === b ? 0 : a > b ? 1 : -1) * order;
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
    },
  };
</script>
