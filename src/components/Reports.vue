<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4>
        Reports
        <a target="_blank"
          href="https://github.com/CuBoulder/lil_shrugger/wiki/Reports">
          <span class="navbar-action-icon glyphicon glyphicon-question-sign"></span>
        </a>
      </h4>
    </div>
    <form class="row panel-body">
      <label for="export-list">Reports List</label>
      <select name="export-list" id="export-list"  class="form-control" v-model="exportCallback">
        <option v-for="report in reportsList"
                :key="report.name"
                :value="report.name">
          {{report.name}}
        </option>
      </select>
      <div v-if="showOptionsInput">
        <label for="export-options">Report Options</label>
        <input type="text"
              id="export-options"
              class="form-control"
              name="export-options"
              v-model="exportOptions">
      </div>
      <confirm-button
          label="Export Table"
          class="export-button"
          :params="{columns: gridColumns, options: exportOptions}"
          :callback="exportCallback">
      </confirm-button>
    </form>
  </div>
</template>

<script>
  import store from '../vuex/store';
  import shrugger from '../js/shrugger';
  import bus from '../js/bus';
  // import atlas from '../js/atlas';
  import download from '../js/download';

  export default {
    name: 'Reports',
    props: {
      gridColumns: Array,
    },
    data() {
      return {
        exportCallback: 'exportTable',
        exportOptions: '',
      };
    },
    created() {
      const that = this;

      // Exports data in table when export button is clicked.
      bus.$on('exportTable', function reportsExportTable(params) {
        that.exportTableListener(params, that);
      });

      // Exports data in table when export button is clicked.
      bus.$on('exportSiteContactEmail', function reportsExportSiteContactEmail(params) {
        that.exportEmailsListener(params, that);
      });
    },
    beforeDestroy() {
      // Remove event listeners.
      bus.$off(['exportTable', 'reportsExportTable']);
      bus.$off(['exportSiteContactEmail', 'reportsExportSiteContactEmail']);
    },
    computed: {
      reportsList() {
        return store.state.reportsList;
      },
      showOptionsInput() {
        return this.reportsList.find(el => el.name === this.exportCallback && el.options);
      },
    },
    methods: {
      exportTableListener(params) {
        const rows = store.state.filteredData;
        const columns = params.columns;
        const headers = {};

        // Filter rows to only have keys visible in table.
        const exportData = Object.values(rows).map((item) => {
          const returnItem = {};
          columns.forEach((element) => {
            // Date objects ended up not coming out right.
            if (item[element] instanceof Date) {
              item[element] = shrugger.toDate(item[element]);
            }

            // Need to join arrays with different value than comma.
            if (Array.isArray(item[element])) {
              item[element] = item[element].join('|');
            }

            // If item is still an object, then we need to more to flatten it into a string.
            if (typeof item[element] === 'object') {
              let mrString = '';
              Object.keys(item[element]).forEach((thing) => {
                mrString = mrString + '|' + thing + ':' + item[element][thing];
              });
              item[element] = mrString;
            }

            // Strings can have commas.
            if (typeof item[element] === 'string') {
              item[element] = item[element].replace(new RegExp(',', 'g'), '|');
            }

            returnItem[element] = item[element];

            // Also make columns into header objects.
            headers[element] = element;
          });
          return returnItem;
        });

        // Export to CSV file.
        download.csv(headers, exportData, 'report');
      },
      exportEmailsListener(params) {
        // Grab the types of emails needed.
        let emailArray = params.options.split(',');

        // If email array is blank, then add "all" option.
        if (emailArray[0] === '') {
          emailArray = ['all'];
        }

        // Reduce number of emails into one list.
        const allEmails = [];
        // If site contacts don't exist, then don't do anything.
        const exportData = Object.values(store.state.filteredData).filter(item => item.site_contacts);

        exportData.map((item) => {
          // If array is empty or just contains "all", then push all emails.
          let tempEmailArray = [];
          if (Array.isArray(emailArray) && emailArray.length && emailArray.indexOf('all') === -1) {
            emailArray.forEach((element) => {
              // Need to check if site has any users of this type.
              if (item.site_contacts[element]) {
                tempEmailArray = [].concat(tempEmailArray, item.site_contacts[element]);
              }
            });

            allEmails.push(tempEmailArray);
          } else {
            // item.email_address will have all email addresses.
            // @see site_records.js formatStatsData().
            allEmails.push(item.email_address);
          }
        });

        // The final email list will not have duplicates.
        const finalEmails = [];
        allEmails.forEach((el) => {
          // All items should be arrays so we need to also loop through those items.
          if (typeof el !== 'undefined' && Array.isArray(el)) {
            el.forEach((part) => {
              // Value can be undefined or not be an email address.
              if (!part || !part.includes('@')) {
                part = '';
              }

              // We need to lowercase and strip text since emails are weird and can have both
              // lowercase and uppercase versions.
              if (finalEmails.indexOf(part.toLowerCase().trim()) === -1) {
                finalEmails.push(part.toLowerCase().trim());
              }
            });
          }
        });

        // Export to text file.
        download.text(finalEmails, 'siteContactEmails');
      },
      userAccessPerm(permission) {
        return shrugger.userAccess(permission);
      },
    },
  };
</script>

<style scoped>

  .export-button {
    margin-top: 10px;
    margin-left: 0px;
  }
</style>
