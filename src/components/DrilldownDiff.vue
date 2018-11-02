<template>
<div class="drilldown-diff-container">
  <div class="col col-md-4 lhs-column">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title">Change Dates:</h3>
      </div>
      <div class="panel-body"
           :key="obj._updated"
           v-for="obj in objects">
        <span class="lhs-option"
              @click="changeRhs(obj)">
          {{ obj._updated }}
        </span> 
      </div>
    </div>
  </div>
  <div class="col col-md-8 rhs-column">
    <pre>
      {{ rhsObject }}
    </pre>
  </div>
</div>
</template>

<script>
export default {
  name: 'DrilldownDiff',
  props: {
    objects: Array,
    selectedIndex: Number,
    selectedObj: Object,
  },
  data() {
    return {
      rhsObject: {},
    };
  },
  mounted() {
    this.rhsObject = this.selectedObj;
  },
  methods: {
    changeRhs(obj) {
      this.rhsObject = {};
      this.rhsObject = obj;
    },
  },
};
</script>

<style scoped>

.drilldown-diff-container {
  margin-top: 5px;
}

pre {
  /* overflow-wrap: break-word;
  word-wrap: break-word; */
  text-overflow: ellipsis;
  overflow-x: hidden;
}

.panel-body {
  cursor: pointer;
}

.panel-body:hover {
    background-color: rgb(236, 236, 236);
}

</style>
