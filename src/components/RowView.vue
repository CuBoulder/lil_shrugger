<template>
  <div>
    <pre>
      {{content}}
    </pre>
  </div>
</template>

<script>
  import bus from '../js/bus';

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
      bus.$on('rowView', (row) => {
        that.rowViewListener(row, that);
      });

      // Hides record view and clears content.
      bus.$on('rowHide', () => {
        that.rowHideListener(that);
      });
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
