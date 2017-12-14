<template>
  <form id="commandsForm" class="row">
    <hr>
    <div v-if="userAccessPerm('commands:command')" class="col-md-5">
      <h3>Commands</h3>
      <hr>
      <label for="sendCommand">Select Command</label>
      <select name="sendCommand" id="sendCommand" class="form-control" v-model="selectedCommand">
        <option v-for="(value, index) in commands" :value="value._id">
          {{value.name}}
        </option>
      </select>
      <div class="commands-button">
        <confirm-button
            label="Send Command"
            :params="{command: selectedCommand}"
            callback="sendCommand">
        </confirm-button>
      </div>
    </div>
    <div class="export-button col-md-6" v-if="userAccessPerm('commands:export')">
      <h3>Reports</h3>
      <hr>
      <label for="export-list">Reports List</label>
      <select name="export-list" id="export-list"  class="form-control" v-model="exportCallback">
        <option v-for="report in reportsList" :value="report">{{report}}</option>
      </select>
      <label for="export-options">Report Options</label>
      <input type="text" id="export-options" class="form-control" name="export-options" v-model="exportOptions">
      <confirm-button
          label="Export Table"
          :params="{columns: gridColumns, options: exportOptions}"
          :callback="exportCallback">
      </confirm-button>
    </div>
  </form>
</template>

<script>

  import store from '../vuex/store';
  import utilities from '../js/shrugger';

  export default {
    name: 'Commands',
    props: {
      gridColumns: Array,
    },
    data() {
      return {
        selectedCommand: '',
        exportCallback: 'exportTable',
        exportOptions: '',
      };
    },
    computed: {
      commands() {
        return store.state.commands;
      },
      reportsList() {
        return store.state.reportsList;
      },
    },
    methods: {
      userAccessPerm(permission) {
        return utilities.userAccess(permission);
      },
    },
  };

</script>
