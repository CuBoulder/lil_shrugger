<template>
  <transition name="fade">
    <tr scope="row" :class="'row-id-' + data.id">
      <!-- Bulk operations checkbox. -->
      <td>
        <input type="checkbox"
               :id="'checkbox-' + data.id"
               :name="'checkbox-' + data.id"
               value="checked"
               @change="selectRow($event)"
               v-model="isChecked">
      </td>
      <!--Row with data and edit/inputs. -->
      <td v-for="(key, index) in columns" :class="'column-' + key">
        <div v-if="showDefault(key)" v-html="link(data[key],key)"></div>
        <div v-if="showEdit(key)">
          <div v-if="selectType(key)">
            <select :name="key" v-model="data[key]">
              <option v-for="anOption in selectOptions[key]" :value="anOption" :selected=" data[key] == anOption ? true : null">{{anOption}}</option>
            </select>
          </div>
          <div v-else>
            <input type="text" :name="key" v-model="data[key]">
          </div>
          <!-- Adding an editOptions div so that fields can have special things happen when in edit mode. -->
          <div v-html="editContent[data.id][key]"></div>
        </div>
      </td>
      <!-- @todo Only add Edit option if there are editKeys -->
      <td>
        <button v-if="userAccessPerm('row:edit') && showDefault()" class="btn btn-default" @click="makeEdit()" aria-label="Edit">
          <span class="glyphicon glyphicon-edit" aria-hidden="true"></span>
        </button>
        <button v-if="!view" class="btn btn-default" @click="viewRecord()" aria-label="View">
          <span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>
        </button>
        <button v-if="view" class="btn btn-default" @click="hideRecord()" aria-label="Close View">
          <span class="glyphicon glyphicon-eye-close" aria-hidden="true"></span>
        </button>
        <div v-if="showEdit()">
          <confirm-button label="Update"
                          :row="this"
                          :edit="edit"
                          :callback="callback"
                          :params="params">
          </confirm-button>
          <confirm-button label="Delete"
                          v-if="userAccessPerm('row:delete')"
                          :row="this"
                          :edit="edit"
                          callback="deleteRecord"
                          :params="params">
          </confirm-button>
          <button class="btn btn-default" @click="cancelEdit()">Cancel Edit</button>
        </div>
      </td>
    </tr>
  </transition>
</template>

<script>
  import utilities from '../js/shrugger';
  import atlas from '../js/atlas';
  import store from '../vuex/store';
  import bus from '../js/bus';

  export default {
    name: 'Row',
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
        default() {
          return store.state.selectOptions;
        },
      },
      callback: String,
      editProp: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        edit: this.editProp,
        specialEditContent: {},
        view: false,
        checked: this.allChecked,
      };
    },
    created() {
      // Accepts own row component and cancels edit mode.
      bus.$on('confirmButtonSuccess', (that) => {
        that.edit = false;
      });

      bus.$on('selectAllRows', () => {
        this.checked = true;
      });

      bus.$on('clearAllRows', () => {
        this.checked = false;
      });
    },
    computed: {
      params() {
        return {
          previous: this.oldData,
          current: this.data,
          id: this.data.id,
        };
      },
      editContent() {
        return store.state.editContent;
      },
      isChecked() {
        return this.checked;
      },
    },
    methods: {
      link(value, key) {
        // Link path to instance.
        if (key === 'path') {
          return '<a href="' + store.state.expressEnvironments[store.state.env] + value + '/user?destination=/admin/people/invite">' + value + '</a>';
        }

        // Link to full code/site record.
        if (key === 'id') {
          const atlasEnvironment = store.state.atlasEnvironments[store.state.env];
          // Determine site or code record from other key.
          if (this.editKeys.indexOf('commit_hash') !== -1) {
            return '<a href="' + atlasEnvironment + 'code/' + value + '">(Code Record)</a>';
          }
          return '<a href="' + atlasEnvironment + 'sites/' + value + '">' + '(Site)</a><br/>(<a href="' + atlasEnvironment + 'statistics/' + this.data.statistics + '">Stats</a>)';
        }

        // Deal with empty packages arrays.
        if (typeof value === 'undefined' || value.length === 0) {
          return 'N/A';
        }

        return value;
      },
      selectType(index) {
        return this.selectKeys.includes(index);
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
        // Get row type.
        let type = 'sites';
        if (typeof this.data.code_type !== 'undefined') {
          type = 'code';
        }

        const that = this;
        atlas.request(store.state.atlasEnvironments[store.state.env], type + '/' + this.data.id)
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
      cancelEdit() {
        bus.$emit('cancelEdit', this);
        this.edit = false;
      },
      viewRecord() {
        this.view = !this.view;
        bus.$emit('rowView', this);
      },
      hideRecord() {
        this.view = !this.view;
        bus.$emit('rowHide', this);
      },
      userAccessPerm(permission) {
        return utilities.userAccess(permission);
      },
    },
  };
</script>
