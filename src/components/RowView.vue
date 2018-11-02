<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4>View Record: {{ recordName }}</h4>
    </div>
    <div class="panel-body">
      <pre>
        {{content}}
      </pre>
    </div>
  </div>
</template>

<script>
  import bus from '../services/bus.ts';

  export default {
    name: 'RowView',
    data() {
      return {
        content: {},
      };
    },
    created() {
      const that = this;

      // Sets row content to display.
      bus.$on('rowView', function rowViewRowView(row) {
        that.rowViewListener(row, that);
      });

      // Hides record view and clears content.
      bus.$on('rowHide', function rowViewRowHide() {
        that.rowHideListener(that);
      });
    },
    beforeDestroy() {
      // Remove event listeners.
      bus.$off(['rowView', 'rowViewRowView']);
      bus.$off(['rowHide', 'rowViewRowHide']);
    },
    computed: {
      recordName() {
        // Some records might not have a name so ideally some name key should be passed in.
        // this.recordNameKey or something like that.
        return this.content.name ? this.content.name : '';
      },
    },
    methods: {
      rowViewListener(row, that) {
        that.content = row.data;
      },
      rowHideListener(that) {
        that.content = {};
      },
    },
  };
</script>

<style scoped>

</style>
