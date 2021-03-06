<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4>Edit Record: {{ rowData.path || (`${rowData.name} - ${rowData.label} (${rowData.version})`) }}</h4>
    </div>
    <form class="row panel-body">
      <div v-show="!userAccessPerm('row:edit')">
        <h4>Insufficent permissions to edit.</h4>
      </div>
      <div v-show="userAccessPerm('row:edit')">
        <!-- Row description text. -->
        <div v-if="editContent != 'N/A'">
          <h4>Edit Information:</h4>
          <span class="edit-content"
                v-html="editContent"></span>
          <hr>
        </div>
        <!-- Row edit form. -->
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
            <div v-else-if="autocompleteType(key)">
              <tag-input add-tag-label="Add Package"
                        :autocomplete-option-key="autocompleteOptionsKey">
              </tag-input>
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
                        :callback="updateCallback"
                        :params="params">
        </confirm-button>
        <confirm-button label="Delete"
                        class="pull-left edit-button"
                        v-if="userAccessPerm('row:delete')"
                        :callback="deleteCallback"
                        :params="params">
        </confirm-button>
      </div>
    </form>
  </div>
</template>

<script>
  import store from '../store.ts';
  import bus from '../services/bus.ts';
  import atlas from '../services/atlas.ts';
  import shrugger from '../services/shrugger.ts';

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
        updateCallback: this.options.updateCallback,
        deleteCallback: this.options.deleteCallback,
        editListener: this.options.editListener,
        autocompleteOptionsKey: this.options.autocompleteOptionsKey,
      };
    },
    created() {
      const that = this;

      bus.$on('rowView', function rowEditRowView(row) {
        that.editRowListener(that, row);
      });
    },
    beforeDestroy() {
      // Remove event listeners.
      bus.$off(['rowView', 'rowEditRowView']);
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
      autocompleteType(index) {
        return this.options.editKeys.autocompleteKeys.includes(index);
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
