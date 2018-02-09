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
        <button v-if="userAccessPerm('row:edit') && !showEdit()"
                class="btn btn-default"
                @click="makeEdit(rowData)"
                aria-label="Edit">
          <span class="glyphicon glyphicon-edit" aria-hidden="true"></span>
        </button>
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
        <div v-if="showEdit()">
          <button class="btn btn-default" @click="cancelEdit()">Cancel Edit</button>
        </div>
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
        edit: false,
        specialEditContent: {},
        view: false,
        checked: false,
        rowData: this.data,
        columns: this.options.columns,
        formatFunction: this.options.formatFunction,
      };
    },
    created() {
      const that = this;

      // Accepts own row component and cancels edit mode.
      bus.$on('confirmButtonSuccess', (params) => {
        if (params.row) {
          that.edit = false;
        }
      });

      bus.$on('selectAllRows', () => {
        that.checked = true;
      });

      bus.$on('clearAllRows', () => {
        that.checked = false;
      });

      // Sets row content to display.
      bus.$on('cancelRowEdit', () => {
        that.cancelRowEditListener(that);
      });

      // Hides record view and clears content.
      bus.$on('rowHide', () => {
        that.rowHideListener(that);
      });
    },
    computed: {
      editContent() {
        return store.state.editContent;
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
      showEdit(index = null) {
        if (this.edit) {
          if (index === null || this.editKeys.indexOf(index) !== -1) {
            return true;
          }
        }
        return false;
      },
      showDefault(index = null) {
        return !this.edit || this.editKeys.indexOf(index) === -1 && index !== null;
      },
      makeEdit() {
        bus.$emit('editRow', this);
        this.edit = true;
      },
      cancelEdit() {
        bus.$emit('cancelRowEdit', this);
      },
      cancelRowEditListener(that) {
        that.edit = false;
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
