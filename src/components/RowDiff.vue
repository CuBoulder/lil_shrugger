<template>
  <div class="row">
    <h3>I'm a diff!</h3>
    <div class="col col-md-6">
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
      <div>
        <pre>
          {{ leftStatObject }}
        </pre>
      </div>
    </div>
    <div class="col col-md-6">
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
      <div>
        <pre>
          {{ rightStatObject }}
        </pre>
      </div>
    </div>
  </div>
</template>

<script>
  import diff from 'deep-diff';

  import store from '../vuex/store';
  import bus from '../js/bus';
  import atlas from '../js/atlas';
  // import shrugger from '../js/shrugger';

  export default {
    name: 'RowDiff',
    data() {
      return {
        statsObjects: [],
        selectOptions: [],
        leftStatObject: {},
        rightStatObject: {},
        leftSelectString: '',
        rightSelectString: '',
      };
    },
    created() {
      const that = this;

      bus.$on('rowView', (row) => {
        that.viewRowListener(that, row);
      });

      // Erase data when row is hidden.
      bus.$on('rowHide', () => {
        that.clear(that);
      });

      // Erase stuff when changing environments.
      bus.$on('switchEnv', () => {
        that.clear(that);
      });
    },
    methods: {
      viewRowListener(that, row) {
        atlas.request(store.state.atlasEnvironments[store.state.env], 'statistics/', `${row.rowData.statistics}?version=all`)
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

          // acc is an "accumulator array".
          // The null parameter can be used a prefilter.
          // @see https://github.com/flitbit/diff
          const acc = [];
          console.log(diff.diff(that.leftStatObject, that.rightStatObject, null, acc));

          /* diff.observableDiff(that.leftStatObject, that.rightStatObject, (d) => {
            console.log(d);
          }); */
        })
        .catch(error => console.log(error));
      },
      selectChange(side, choice) {
        this[side] = {};
        this[side] = this.statsObjects.find(el => el._updated === choice);
        console.log(diff.diff(this.leftStatObject, this.rightStatObject));
      },
      clear(that) {
        that.statsObjects = [];
        that.selectOptions = [];
        that.leftStatObject = { status: 'Loading...' };
        that.rightStatObject = { status: 'Loading...' };
        that.leftSelectString = '';
        that.rightSelectString = '';
      },
    },
  };
</script>

<style>

</style>
