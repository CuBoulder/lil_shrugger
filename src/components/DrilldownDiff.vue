<template>
<div class="row">
  <div class="col col-md-4 lhs-column">
    <div :key="obj._updated"
         v-for="obj in objects">
      <span @click="changeRhs(obj)">{{ obj._updated }}</span> 
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
      this.rhsObject = obj;
    },
  },
};
</script>

<style>

pre {
  /* overflow-wrap: break-word;
  word-wrap: break-word; */
  text-overflow: ellipsis;
  overflow-x: hidden;
}

</style>
