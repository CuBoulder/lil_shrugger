<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4>View Some Diffs!</h4>
    </div>
    <div class="row panel-body">
      <div v-show="!drilldownDiffs">
        <div class="col col-md-6 lhs-column">
          <label for="statsSelectOld">Older Record</label>
          <select name="statsSelectOld"
                  @change="selectChange('leftStatObject', leftSelectString)" 
                  v-model="leftSelectString" 
                  class="form-control col col-md-6">
            <option v-for="(anOption, index) in selectOptions"
                    :key="index"
                    :value="anOption">
              {{anOption}}
            </option>
          </select>
          <div v-for="(stat, index) in leftStatObject"
               class="left-hand-side-stat"
               :key="index">
            <strong v-html="filteredIndex(index, 'leftStatObject')"></strong>:  <span v-html="stat"></span><br>
          </div>
        </div>
        <div class="col col-md-6 rhs-column">
          <div class="form-check pull-right">
            <label class="form-check-label">
              <input class="form-check-input" type="checkbox" id="chronological" v-model="enableDrilldown">
              Drilldown
            </label>
          </div>
          <label for="statsSelectOld">Newer Record</label>
          <select name="statsSelectNew"
                  @change="selectChange('rightStatObject', rightSelectString)"
                  v-model="rightSelectString" 
                  class="form-control col col-md-6">
            <option v-for="(anOption, index) in selectOptions"
                    :key="index"
                    :value="anOption">
              {{anOption}}
            </option>
          </select>
          <div v-for="(stat, index) in rightStatObject"
              class="right-hand-side-stat"
              :key="index">
            <div @mouseover="hoverOverRow(index, stat)">
              <strong v-html="filteredIndex(index, 'rightStatObject')"></strong>:  <span v-html="stat"></span><br>
            </div>
            <div v-if="hoverRow === index && enableDrilldown">
              <button class="btn btn-primary pull-right drill-btn" @click.prevent="drillDown(index, equalTo, rightSelectString, true)">===</button>
              <button class="btn btn-primary pull-right drill-btn" @click.prevent="drillDown(index, equalTo, rightSelectString, false)">!==</button>
              <div class="input-group">
                <span class="input-group-addon" id="basic-addon3">{{ filteredIndex(index, 'rightStatObject')| stripHTML }} =</span>
                <input
                  id="filter-records-input"
                  class="form-control"
                  aria-describedby="basic-addon3"
                  name="equalTo"
                  @keyup.enter="drillDown(index, equalTo, rightSelectString, true)"
                  v-model="equalTo">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="drilldownDiffs">
        <span class="row cancel-drilldown pull-right">
          <button class="btn btn-primary" @click="cancelDrilldown()">X</button>
        </span>
        <drilldown-diff class="row"
                        :selected-index="selectedObjectIndex"
                        :selected-obj="selectedObject"
                        :objects="differentObjects">
        </drilldown-diff>
      </div>
    </div>
  </div>
</template>

<script>

  /* eslint-disable */
  import diff from 'deep-diff';

  import store from '../vuex/store';
  import bus from '../js/bus';
  import atlas from '../js/atlas';
  import shrugger from '../js/shrugger';

  export default {
    name: 'RowDiff',
    props: {
      options: Object,
    },
    data() {
      return {
        statsObjects: [],
        selectOptions: [],
        leftStatObject: {},
        rightStatObject: {},
        differentObjects: [],
        selectedObject: {},
        selectedObjectIndex: 0,
        leftSelectString: '',
        rightSelectString: '',
        enableDrilldown: false,
        drilldownDiffs: false,
        hoverRow: -1,
        showEqual: false,
        equalTo: '',
      };
    },
    created() {
      const that = this;

      bus.$on('rowView', function rowDiffRowView(row) {
        that.viewRowListener(that, row);
      });

      // Erase data when row is hidden.
      bus.$on('rowHide', function rowDiffRowHide() {
        that.clear(that);
      });

      // Erase stuff when changing environments.
      bus.$on('switchEnv', function rowDiffSwitchEnv() {
        that.clear(that);
      });
    },
    beforeDestroy() {
      // Remove event listeners.
      bus.$off(['rowView', 'rowDiffRowView']);
      bus.$off(['rowHide', 'rowDiffRowHide']);
      bus.$off(['switchEnv', 'rowDiffSwitchEnv']);
    },
    filters: {
      stripHTML(value) {
        const reg = /(<([^>]+)>)/ig;
        return value.replace(reg, '');
      },
    },
    methods: {
      filteredIndex(value, side) {
        // Add highlighting to the stats key when displayed.
        if (value.includes('>>>')) {
          return `<span class="diff-edit-highlight"> ${value}</span>`;
        }

        if (value.includes('+++')) {
          return `<span class="diff-new-highlight"> ${value}</span>`;
        }

        if (value.includes('xxx')) {
          return `<span class="diff-delete-highlight"> ${value}</span>`;
        }

        return value;
      },
      viewRowListener(that, row) {
        atlas.request(store.state.atlasEnvironments[store.state.env], `${that.options.endpoint}/`, `${row.rowData[that.options.recordID]}?version=all`)
        .then((data) => {
          // Data has stats objects in an array at the zero-eth position.
          const realData = data[0];

          // Pop first element off of array. It is the metadata for the stats objects request.
          realData.shift();

          // The data is in chronological order; so reverse it.
          that.statsObjects = realData.reverse().map((el) => {
            const obj = {};
            Object.keys(el).sort().forEach((elk) => {
              obj[elk] = el[elk];
            });
            return obj;
          });

          that.selectOptions = realData.map((el) => {
            if (el._updated) {
              // return shrugger.toDate(el._updated);
              return el._updated;
            }
            return 'N/A';
          });

          // Add defaults for left and right diff columns.
          that.leftStatObject = that.statsObjects[1];
          that.rightStatObject = that.statsObjects[0];

          // The select list option is stored in a string.
          // I originally tried to use the statsObject._updated property, but Vue only
          // tracks what you tell it so the statsObject can't be used as a model.
          that.leftSelectString = that.statsObjects[1]._updated;
          that.rightSelectString = that.statsObjects[0]._updated;

          that.diffObjects(that.leftStatObject, that.rightStatObject, [], that);
        })
        .catch(error => console.log(error));
      },
      selectChange(side, choice) {

        // Clear stats objects since Vue is only tracking the top-level object.
        this.leftStatObject = {}; 
        this.rightStatObject = {};
        this.leftStatObject = this.statsObjects.find(el => el._updated === this.leftSelectString);
        this.rightStatObject = this.statsObjects.find(el => el._updated === this.rightSelectString);
        
        this.diffObjects(this.leftStatObject, this.rightStatObject);
      },
      cancelDrilldown() {
        this.drilldownDiffs = false;
        this.differentObjects = [];
        this.selectedObjectIndex = 0;
        this.selectedObject = {};
      },
      clear(that) {
        that.statsObjects = [];
        that.selectOptions = [];
        that.leftStatObject = { status: 'Loading...' };
        that.rightStatObject = { status: 'Loading...' };
        that.leftSelectString = '';
        that.rightSelectString = '';
      },
      diffObjects(lhs, rhs, acc = [], that = null) {
        // Standardize "that" object if passed in.
        if (this.leftSelectString) {
          that = this;
        }

        // Clear stats objects since Vue is only tracking the top-level object.
        that.leftStatObject = {}; 
        that.rightStatObject = {};

        // Flatten the stats objects for easier comparisons.
        const flatLhs = shrugger.flatten(lhs);
        const flatRhs = shrugger.flatten(rhs);

        diff.observableDiff(lhs, rhs, (d) => {
          // Since most of the metadata prefixed with an underscore changes, don't highlight those changes.
          if (!d.path[0].startsWith('_')) {
            // Deal with edits.
            if (d.kind === 'E') {
              // Deal with empty valued.
              const editFrom = d.rhs !== '' ? d.rhs : 'N/A';

              // Delete the value first so it can be replaced.
              delete flatRhs['/' + d.path.join('/')];

              // Add a class for targeting via CSS.
              flatRhs['/' + d.path.join('/') + ' >>>'] = `<span class="diff-edit-highlight"> ${editFrom}</span>`;
            }

            // Deal with new properties.
            if (d.kind === 'N') {
              if (typeof d.rhs === 'object') {
                // ...
              } else {
                // Delete the old property and value to replace content ontop of.
                delete flatRhs['/' + d.path.join('/')];

                // Add a class for targeting via CSS.
                flatRhs['/' + d.path.join('/') + ' +++'] = `<span class="diff-new-highlight"> ${d.rhs}</span>`;
              }
            }

            // Deal with deletions.
            if (d.kind === 'D') {
              // Objects have to be looped through so all the child properties can be deleted as well as the top-level item.
              if (typeof d.lhs === 'object') {
                Object.keys(d.lhs).forEach((el) => {
                  // Delete the old property and add a new one to target via CSS.
                  // We use the "lhs" object here to display deletions on the left-hand side.
                  delete flatLhs[`/${d.path.join('/')}/${el}`];
                  flatLhs[`/${d.path.join('/')}/${el} xxx`] = `<span class="diff-delete-highlight"> ${d.lhs[el]}</span>`;
                });
              } else {
                // Delete the old property and add a new one to target via CSS.
                delete flatLhs[`/${d.path.join('/')}`];
                flatLhs[`/${d.path.join('/')} xxx`] = `<span class="diff-delete-highlight"> ${d.lhs}</span>`;
              }
            }
          }
        });

        // Sort new object so edited keys are next to original keys.
        const rightSorted = {};
        Object.keys(flatRhs).sort().forEach((elk) => {
          rightSorted[elk] = flatRhs[elk];
        });

        // Sort new object so edited keys are next to original keys.
        const leftSorted = {};
        Object.keys(flatLhs).sort().forEach((elk) => {
          leftSorted[elk] = flatLhs[elk];
        });

        that.leftStatObject = leftSorted; 
        that.rightStatObject = rightSorted;
      },
      drillDown(index, value, selectString, showEqual) {
        // console.log(index);
        // console.log(value);
        let objects = this.statsObjects;

        // Set drilldown component to show.
        this.drilldownDiffs = true;

        // Sends state of diff to 
        this.showEqual = showEqual;

        // Trim whitespace from index since the modified properties contain characters at the end.
        // Some values have span tags so they must be split and dealt with separately.
        let splitIndex = this.removeAddedMarkup(index);
        let splitValue = this.removeAddedMarkup(value);

        // Find the index of the select string in statsObjects.
        let objectIndex = 0;
        objects.forEach((el, index) => {
          if (el._updated === selectString) {
            objectIndex = index;
          }
        });

        // Find all objects where the value is different than the index.
        let differentObjects = objects.filter((el) => {
          let flattenedObj = shrugger.flatten(el);
          console.log(flattenedObj[splitIndex]);
          console.log(splitValue);
          if (showEqual) {
            if (flattenedObj[splitIndex] == splitValue) {
              return true;
            }
          } else {
            if (flattenedObj[splitIndex] != splitValue || typeof flattenedObj[splitIndex] == 'undefined') {
              return true;
            }
          }
          return false;
        });

        console.log(differentObjects);
        this.differentObjects = differentObjects;
        this.selectedObjectIndex = objectIndex;
        this.selectedObject = this.statsObjects.find(el => this.rightStatObject['/_updated'] == el._updated);
      },
      hoverOverRow(index, stat) {
        // console.log(stat);
        this.hoverRow = index;
        this.equalTo = this.removeAddedMarkup(stat);
      },
      leaveRow(index) {
        this.hoverRow = -1;
        this.equalTo = '';
      },
      removeAddedMarkup(val) {
        // Cast val to string for comparison purposes.
        if (typeof val ==='number' || typeof val === 'boolean') {
          val = val.toString();
        }

        if (val.includes('highlight">')) {
          return val.split('highlight">')[1].split('</span>')[0].trim();
        } 
        return val.trim();
      },
    },
  };
</script>

<style>

.diff-edit-highlight {
  color: orange;
}

.diff-new-highlight {
  color: green;
}

.diff-delete-highlight {
  color: red;
}

.left-hand-side-stat:hover,
.right-hand-side-stat:hover {
  background-color: rgb(236, 236, 236);
}

.lhs-column, .rhs-column {
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.drill-btn {
  margin-left: 2px;
}

</style>
