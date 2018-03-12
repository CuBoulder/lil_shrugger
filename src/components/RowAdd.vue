<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4>Add Record</h4>
    </div>
    <form class="row panel-body">
      <fieldset class="form-group">
        <h4>Default Values:</h4>
        <p>
          <strong>Path -</strong> Generated during site creation. <br>
          <strong>Status -</strong> All sites start out in a "pending" state. They will change to an "available" state once installed but not claimed.
        </p>
        <hr>
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
            <span :key="index"
                  v-for="(pack, index) in packagesToAdd">
                  {{ pack }}
                  <span @click.prevent="removePackage(pack)">[X]</span>
            </span>
            <autocomplete-input
              :id="key + '-autocomplete'"
              options-key="sitesAddOptions"
              the-key="label"
              model="">
            </autocomplete-input>
            <button
                class="btn btn-primary add-package"
                @click.prevent="addPackage()"
                aria-label="Add Package">
              Add Package
            </button>
          </div>
          <div v-else>
            <input type="text"
                  :name="key"
                  class="form-control"
                  v-model="rowData[key]">
          </div>
        </div>
      </fieldset>
      <div class="pull-right">
        <confirm-button label="Add Row"
                        class="pull-left add-button"
                        :callback="callback"
                        :params="params">
        </confirm-button>
        <button class="btn btn-default" @click.prevent="cancelAdd()">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script>
import store from '../vuex/store';
import bus from '../js/bus';
// import atlas from '../js/atlas';
import shrugger from '../js/shrugger';

export default {
  name: 'RowAdd',
  props: {
    options: Object,
  },
  data() {
    return {
      rowData: {},
      rowKeys: this.options.addKeys.canEdit,
      callback: this.options.callback,
      addListener: this.options.addListener,
      packageToAdd: '',
      packagesToAdd: [],
    };
  },
  created() {
    const that = this;
    /* bus.$on('addRow', (row) => {
      that.addRowListener(that, row);
    }); */

    bus.$on('autocompleteSelect', (key, selectedOption) => {
      that.autocompleteSelectListener(key, selectedOption, that);
    });
  },
  computed: {
    params() {
      return {
        row: this.rowData,
      };
    },
    selectOptions() {
      return store.state.selectOptions;
    },
    addSitesPackages() {
      return store.state.codeAssets;
    },
  },
  methods: {
    selectType(index) {
      return this.options.addKeys.selectKeys.includes(index);
    },
    autocompleteType(index) {
      return this.options.addKeys.autocompleteKeys.includes(index);
    },
    /*
    addRowListener(that, row) {
      // Add row data to component as well as a copy of data.
      // that.oldData = Object.assign({}, row.rowData);
      that.rowData = row.rowData;

      // We look for any formatting function passed in.
      if (Object.keys(row.rowData).length > 1 && typeof that.editListener === 'function') {
        that.addListener(row);
      }
    }, */
    userAccessPerm(permission) {
      return shrugger.userAccess(permission);
    },
    cancelAdd() {
      bus.$emit('cancelRowAdd', this);
    },
    autocompleteSelectListener(key, selectedOption, that) {
      that.packageToAdd = selectedOption.label;
    },
    addPackage() {
      this.packagesToAdd.push(this.packageToAdd);
    },
    removePackage(pack) {
      // There is only one entry per code asset so we can filter only that label out of the array.
      this.packagesToAdd = this.packagesToAdd.filter(el => el !== pack);
    },
  },
};
</script>

<style>

.add-button {
  margin-right: 5px;
}

.add-package {
  margin-top: 5px;
}

</style>
