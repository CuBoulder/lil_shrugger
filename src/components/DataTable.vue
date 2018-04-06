<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4>
        Data Table
        <a target="_blank"
           href="https://github.com/CuBoulder/lil_shrugger/wiki/Data-Table">
          <span class="navbar-action-icon glyphicon glyphicon-question-sign"></span>
        </a>
      </h4>
    </div>
    <div class="panel-body">
    <form id="search" class="row">
      <div class="form-group">
        <div class="col col-md-7 filter-table">
          <div class="input-group">
            <span v-if="expressionFilter" class="input-group-addon" id="basic-addon1">></span>
            <span v-if="!expressionFilter" class="input-group-addon" id="basic-addon1">#</span>
            <input
              id="filter-records-input"
              class="form-control"
              aria-describedby="basic-addon1"
              name="query"
              v-model="filterKey">
          </div>
        </div>
        <div class="col col-md-5" id="expression-search-buttons">
          <button v-if="!expressionFilter" class="btn btn-default" @click.prevent="expressionFilter = !expressionFilter" aria-label="Toggle Expression Search">
          <span class="glyphicon glyphicon-superscript" aria-hidden="true"></span>
          </button>
          <button v-if="expressionFilter" class="btn btn-primary" @click.prevent="expressionFilterSearch()" aria-label="Expression Search">
            Expression Search
          </button>
          <button v-if="expressionFilter" class="btn btn-default" @click.prevent="cancelExpressionFilterSearch()" aria-label="Expression Search">
            Reset
          </button>
          <div class="col pull-right"
               id="add-row"
               v-if="userAccessPerm('addRow')">
            <button @click="addRow()" type="button" class="btn btn-primary" aria-label="Add Row">Add Row</button>
          </div>
        </div>
      </div>
      </form>
      <div class="result-count">Result Count: {{ resultCount }}</div>
      <div v-if="noResults">
        <div class="alert alert-info">Your query returned no results.</div>
      </div>
      <div class="table-responsive">
        <table class="table table-striped table-hover table-sm">
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
                :class="{ active: sortKey === key}">
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
              :key="data.id"
              :options="rowOptions">
          </row>
          </tbody>
        </table>
        <div v-show="showAdd || showEdit || showView"
            class="row col col-md-12">
          <div v-show="showAdd">
            <component :is="rowAddComponent" :options="rowAddOptions"></component>
          </div>
          <!-- Row View Components in tabs. -->
          <div v-show="showView">
            <!-- Nav tabs -->
            <ul class="nav nav-tabs" role="tablist">
              <li v-for="(comp, index) in rowViewComponents"
                  role="presentation"
                  :class="index == 0 ? 'active' : 'foop'"
                  :key="index">
                <a :href="`#${comp.tabID}`" :aria-controls="comp.tabID" role="tab" data-toggle="tab">{{ comp.tabLabel }}</a>
              </li>
            </ul>
            <!-- Tab panes -->
            <div class="tab-content">
              <component v-for="(comp, index) in rowViewComponents" 
                         :key="index"
                         :class="`tab-pane ${index == 0 ? 'active' : ''}`"
                         :id="comp.tabID" 
                         :is="comp.tagName" 
                         :v-show="false"
                         :options="comp">
              </component>
            </div>
          </div>
        </div>
        <!-- Show More Records Links -->
        <div class="show-more-buttons"
            v-if="resultCount > showRowCount">
          <button class="btn btn-default" @click="showMore()" aria-label="Show More">Show More</button>
          <button class="btn btn-default" @click="showAll()" aria-label="Show All">Show All</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import store from '../vuex/store';
  import bus from '../js/bus';
  import shrugger from '../js/shrugger';

  export default {
    name: 'DataTable',
    props: {
      tableOptions: Object,
      columns: Array,
    },
    data() {
      const sortOrders = {};
      this.columns.forEach((key) => {
        sortOrders[key] = Number(this.tableOptions.defaultSortDirection);
      });
      return {
        rowAddComponent: this.tableOptions.rowAddComponent,
        rowViewComponents: this.tableOptions.rowViewComponents,
        rowAddOptions: {
          addKeys: this.tableOptions.addKeys,
          callback: this.tableOptions.addCallback,
          dataName: this.tableOptions.dataName,
          addListener: this.tableOptions.addListener,
          autocompleteOptionsKey: this.tableOptions.autocompleteOptionsKey,
        },
        rowOptions: {
          columns: this.columns,
          formatFunction: this.tableOptions.formatFunction,
        },
        sortKey: this.tableOptions.defaultSortKey ? this.tableOptions.defaultSortKey : '',
        sortOrders,
        showAllRows: false,
        allChecked: false,
        expressionFilter: false,
        cachedData: null,
        showAdd: false,
        showEdit: false,
        showView: false,
      };
    },
    created() {
      const that = this;

      // Sets row content to display.
      bus.$on('addRow', function dataTableAddRow(row) {
        that.rowViewListener(that, row, 'showAdd');
      });

            // Hides record view and clears content.
      bus.$on('cancelRowAdd', function dataTableCancelRowAdd() {
        that.rowHideListener(that, 'showAdd');
      });

      // Sets row content to display.
      bus.$on('editRow', function dataTableEditRow(row) {
        that.rowViewListener(that, row, 'showEdit');
      });

      // Hides record view and clears content.
      bus.$on('cancelRowEdit', function dataTableCancelRowEdit() {
        that.rowHideListener(that, 'showEdit');
      });

      // Sets row content to display.
      bus.$on('rowView', function dataTableRowView(row) {
        that.rowViewListener(that, row, 'showView');
      });

      // Hides record view and clears content.
      bus.$on('rowHide', function dataTableRowHide() {
        that.rowHideListener(that, 'showView');
      });

      // Clear stuff when environments change.
      /* bus.$on('switchEnv', function dataTableSwitchEnv() {
        that.rowHideListener(that, 'showView');
      }); */

      bus.$on('cancel--sendCommand', function commandsCancelCommand() {
        that.cancelCommandListener(that);
      });
    },
    beforeDestroy() {
      // Remove event listeners.
      bus.$off(['rowView', 'dataTableRowView']);
      bus.$off(['rowHide', 'dataTableRowHide']);
      // bus.$off(['switchEnv', 'dataTableSwitchEnv']);
      bus.$off(['addRow', 'dataTableAddRow']);
      bus.$off(['cancelRowAdd', 'dataTableCancelRowAdd']);
      bus.$off(['editRow', 'dataTableEditRow']);
      bus.$off(['cancelRowEdit', 'dataTableCancelRowEdit']);
      bus.$off(['cancel--sendCommand', 'commandsCancelCommand']);
    },
    computed: {
      gridData: {
        get() {
          return store.state.sitesGridData[this.tableOptions.dataName];
        },
        set(value) {
          store.commit('addSitesGridData', value);
        },
      },
      filteredData() {
        const sortKey = this.sortKey;
        const filterKey = this.filterKey;
        // Negative one is DESC; positive one is ASC.
        // I think it is more useful to have the most recent changes first.
        const order = this.sortOrders[sortKey] || 1;
        let data = this.gridData;

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
          return store.state.filterKey[this.tableOptions.dataName];
        },
        set(value) {
          store.commit('setFilterKey', [{ type: this.tableOptions.dataName, filterString: value }]);
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
      rowAddClasses() {
        return 'col-md-12';
      },
      rowViewClasses() {
        return this.showEdit ? 'col-md-6' : 'col-md-12';
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
      rowViewListener(that, row, action) {
        // Set the "action" row to visible.
        that[action] = true;
        that.cachedData = that.gridData;

        // Find row being viewed if not adding a record.
        let foundRow = [];
        if (action !== 'showAdd') {
          foundRow = Object.values(that.gridData).filter(value => value.id === row.data.id);
        }

        // Only show one static row at a time.
        const options = [];
        options[that.tableOptions.dataName] = foundRow;
        store.commit('addSitesGridData', options);
      },
      rowHideListener(that, action) {
        // Set the "action" row to visible.
        that[action] = false;

        // Add back all filtered rows to table.
        const options = {};
        options[that.tableOptions.dataName] = that.cachedData;
        store.commit('addSitesGridData', options);
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
      fuzzyFilterSearch(filterKey, data) {
        return data.filter(row => Object.keys(row)
          .some(key => this.columns.includes(key) && String(row[key]).toLowerCase().indexOf(filterKey.toLowerCase()) > -1));
      },
      expressionFilterSearch() {
        let errorMessage = false;
        const rowData = this.gridData;
        const filterKey = this.filterKey;

        // Disabling eslint since the JS eval is using the row even though it looks like it isn't.
        /* eslint-disable */
        const newData = rowData.filter((row) => {
          // Try to evaluate the expression entered into the filter.
          try {
            if (this.evaluateExpression(filterKey, row)) {
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
              '<br/>Check <a href="https://github.com/CuBoulder/lil_shrugger/wiki/Data-Table#filter-table" target="_blank">' +
              'the search documentation</a> and refresh to search again.',
            alertType: 'alert-danger',
          });
        }

        // Set new data and save old data.
        this.cachedData = this.gridData;

        const options = {};
        options[this.tableOptions.dataName] = newData;

        this.gridData = options;
      },
      cancelExpressionFilterSearch() {
        this.expressionFilter = !this.expressionFilter;

        // Need to reset filter.
        store.commit('setFilterKey', [{ type: this.tableOptions.dataName, filterString: '' }]);

        // Add back cached data.
        if (this.cachedData) {
          const options = {};
          options[this.tableOptions.dataName] = this.cachedData;

          this.gridData = options;
        }
      },
      /* eslint-disable */
      evaluateExpression(filterKey, row) {
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
          or: (code, row) => {
            const re = new RegExp('(' + code + ')', 'i');
            return row.packages && row.packages.some((val) => {
              if (val) {
                return val.match(re);
              }
              return false;
            });
          },
        };

        return eval(filterKey);
      },
      /* eslint-enable */
      userAccessPerm(permission) {
        return shrugger.userAccess(permission);
      },
      addRow() {
        bus.$emit('addRow', {});
      },
      cancelCommandListener(that) {
        that.allChecked = false;
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
  padding-left: 0px;
}


#search {
  padding-bottom: 20px;
}

.result-count {
  padding-left: 15px;
}

</style>