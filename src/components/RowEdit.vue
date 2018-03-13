<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4>Edit Record: {{ rowData.path || (`${rowData.name} - ${rowData.label} (${rowData.version})`) }}</h4>
    </div>
    <form class="row panel-body">
      <!-- Row description text. -->
      <h4>Edit Information:</h4>
      <span class="edit-content"
            v-html="editContent"></span>
      <hr>
      <fieldset class="form-group">
        <div v-for="key in rowKeys"
            :key="key">
          <label for="key">{{ key }}</label>
          <div v-if="selectType(key)">
            <select :name="key" v-model="rowData[key]" class="form-control">
              <option v-for="anOption in selectOptions[key]"
                      :key="anOption"
                      :value="anOption" :selected=" rowData[key] == anOption ? true : null">
                {{anOption}}
              </option>
            </select>
          </div>
          <div v-else>
            <input type="text"
                  :name="key"
                  class="form-control"
                  v-model="rowData[key]">
          </div>
        </div>
      </fieldset>
      <confirm-button label="Update"
                      class="pull-left edit-button"
                      :callback="callback"
                      :params="params">
      </confirm-button>
      <confirm-button label="Delete"
                      class="pull-left edit-button"
                      v-if="userAccessPerm('row:delete')"
                      callback="deleteRecord"
                      :params="params">
      </confirm-button>
    </form>
  </div>
</template>

<script>
  import store from '../vuex/store';
  import bus from '../js/bus';
  import atlas from '../js/atlas';
  import shrugger from '../js/shrugger';

  export default {
    name: 'RowEdit',
    props: {
      options: Object,
    },
    data() {
      return {
        rowData: {},
        oldData: {},
        rowKeys: this.options.editKeys.canEdit,
        callback: this.options.callback,
        editListener: this.options.editListener,
      };
    },
    created() {
      const that = this;

      bus.$on('editRow', (row) => {
        that.editRowListener(that, row);
      });

      // Sets row content to display.
      bus.$on('cancelRowEdit', () => {
        that.cancelRowEditListener(that);
      });
    },
    computed: {
      params() {
        return {
          previous: this.oldData,
          current: this.rowData,
          id: this.rowData.id,
          row: this,
        };
      },
      selectOptions() {
        return store.state.selectOptions;
      },
      editContent() {
        return store.state.editContent;
      },
    },
    methods: {
      selectType(index) {
        return this.options.editKeys.selectKeys.includes(index);
      },
      makeEdit() {
        const that = this;

        // Get row type.
        let type = 'sites';
        if (typeof this.rowData.code_type !== 'undefined') {
          type = 'code';
        }

        atlas.request(store.state.atlasEnvironments[store.state.env], type + '/' + that.data.id)
        .then((data) => {
          // Check and see if etags are different and update row data if so.
          if (data[0]._etag !== that.data.etag) {
            bus.$emit('onMessage', {
              text: 'The etag has changed for this record. The listing of records has been updated with the latest data.',
              alertType: 'alert-danger',
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
      editRowListener(that, row) {
        // Add row data to component as well as a copy of data.
        that.oldData = Object.assign({}, row.rowData);
        that.rowData = row.rowData;

        // We look for any formatting function passed in.
        if (Object.keys(row.rowData).length > 1 && typeof that.editListener === 'function') {
          that.editListener(row);
        }
      },
      cancelRowEditListener(that) {
        that.rowData = {};
      },
      userAccessPerm(permission) {
        return shrugger.userAccess(permission);
      },
    },
  };
</script>

<style scoped>

.edit-button {
  margin-right: 5px;
}

.edit-content {
  padding-left: 10px;
}
</style>
