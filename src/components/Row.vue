<template>
  <transition name="fade">
    <tr scope="row" :class="'row-id-' + rowData.id">
      <!-- Bulk operations checkbox. -->
      <td>
        <input type="checkbox"
               :id="'checkbox-' + rowData.id"
               :name="'checkbox-' + rowData.id"
               @click="selectRow()"
               v-model="checked">
      </td>
      <!--Row with data. -->
      <td v-for="(key, index) in columns"
          :key="index"
          :class="'column-' + key">
        <div v-html="formatDisplay(rowData[key], key)"></div>
      </td>
      <!-- Row action icons. -->
      <td>
        <button v-if="!view"
                class="btn btn-default"
                @click="viewRecord(rowData)"
                aria-label="View">
          <span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>
        </button>
        <button v-if="view"
                class="btn btn-default"
                @click="hideRecord()"
                aria-label="Close View">
          <span class="glyphicon glyphicon-eye-close" aria-hidden="true"></span>
        </button>
      </td>
    </tr>
  </transition>
</template>

<script>
  import shrugger from '../js/shrugger';
  import store from '../vuex/store';
  import bus from '../js/bus';

  export default {
    name: 'Row',
    props: {
      data: Object,
      options: Object,
    },
    data() {
      return {
        view: false,
        checked: false,
        columns: this.options.columns,
        formatFunction: this.options.formatFunction,
      };
    },
    created() {
      const that = this;

      // Accepts own row component and cancels edit mode.
      /* bus.$on('confirmButtonSuccess', function rowConfirmButtonSuccess(params) {
        if (params.row) {
          that.edit = false;
        }
      }); */

      bus.$on('selectAllRows', function rowSelectAllRows() {
        that.checked = true;
      });

      bus.$on('clearAllRows', function rowClearAllRows() {
        that.checked = false;
      });

      // Hides record view and clears content.
      bus.$on('rowHide', function rowRowHide() {
        that.rowHideListener(that);
      });

      // Clear stuff when environments change.
      /* bus.$on('switchEnv', function rowSwitchEnv() {
        that.rowHideListener(that);
      }); */
    },
    beforeDestroy() {
      // Remove event listeners.
      bus.$off(['confirmButtonSuccess', 'rowConfirmButtonSuccess']);
      // bus.$off(['selectAllRows', 'rowSelectAllRows']);
      // bus.$off(['clearAllRows', 'rowClearAllRows']);
      // bus.$off(['rowHide', 'rowRowHide']);
      // bus.$off(['switchEnv', 'rowSwitchEnv']);
    },
    computed: {
      rowData() {
        return this.data;
      },
    },
    methods: {
      formatDisplay(value, key) {
        // We look for any formatting function passed in.
        if (this.formatFunction) {
          return this.formatFunction(value, key);
        }

        return value;
      },
      selectRow() {
        this.checked = !this.checked;

        // Add row to sites array for commands.
        store.commit('addSiteToCommands', {
          add: this.checked,
          siteId: this.data.path,
        });
      },
      viewRecord() {
        this.view = true;
        bus.$emit('rowView', this);
      },
      hideRecord() {
        bus.$emit('rowHide', this);
      },
      rowHideListener(that) {
        that.view = false;
      },
      userAccessPerm(permission) {
        return shrugger.userAccess(permission);
      },
    },
  };
</script>
