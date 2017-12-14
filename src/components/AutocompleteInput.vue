<template>
  <div class="autocomplete-input">
    <input class="form-control"
           @input="onInput($event.target.value)"
           @keyup.esc="isOpen = false"
           @blur="isOpen = false"
           @keydown.down="moveDown"
           @keydown.up="moveUp"
           @keydown.enter="select"
           v-model="keyword">
    <ul class="options-list" v-show="isOpen">
      <li v-for="(option, index) in fOptions"
          @mouseenter="highlightedPosition = index"
          @mousedown="select"
          :class="{'highlighted': index === highlightedPosition}">
        {{ option[theKey] }}
      </li>
    </ul>
  </div>
</template>

<script>
  import store from '../vuex/store';
  import bus from '../js/bus';

  export default {
    name: 'AutocompleteInput',
    props: {
      model: String,
      optionsKey: String,
      theKey: String,
    },
    data() {
      return {
        isOpen: false,
        highlightedPosition: 0,
        keyword: this.model,
      };
    },
    created() {
      const that = this;

      // Allow other autocomplete inputs to interact and update each other.
      bus.$on('matchKeys', (params) => {
      // If the key of this component matches then change the desired key.
        if (params.key === that.theKey) {
          that.keyword = params.keyword;
        }
      });

      // Add data from query params for search on page load.
      bus.$on('searchByQueryParam', (paramQuery) => {
        if (that.theKey === 'title') {
          that.keyword = paramQuery.title;
        }

        if (that.theKey === 'query') {
          that.keyword = paramQuery.query;
        }
      });
    },
    computed: {
      fOptions() {
        const re = new RegExp(this.keyword, 'i');
        return this.options.filter(o => o[this.theKey].match(re));
      },
      options() {
        return store.state[this.optionsKey];
      },

    },
    methods: {
      onInput(value) {
        this.isOpen = !!value;
        this.highlightedPosition = 0;
      },
      moveDown() {
        if (!this.isOpen) {
          return;
        }
        this.highlightedPosition = (this.highlightedPosition + 1) % this.fOptions.length;
      },
      moveUp() {
        if (!this.isOpen) {
          return;
        }
        this.highlightedPosition = this.highlightedPosition - 1 < 0
          ? this.fOptions.length - 1
          : this.highlightedPosition - 1;
      },
      select() {
        const selectedOption = this.fOptions[this.highlightedPosition];
        this.keyword = selectedOption[this.theKey];
        this.isOpen = false;
        const params = { selectedOption };
        params.key = this.theKey;
        bus.$emit('select', params);
      },
    },
  };
</script>

<style>
  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  /*
  .autocomplete-input {
      position: relative;
      height: 300px;
  }
  */

  ul.options-list {
    z-index: 999;
    display: flex;
    flex-direction: column;
    margin-top: -2px;
    border: 1px solid #dbdbdb;
    border-radius: 0 0 3px 3px;
    position: absolute;
    width: 95%;
    overflow: hidden;
  }

  ul.options-list li {
    width: 100%;
    flex-wrap: wrap;
    background: white;
    margin: 0;
    border-bottom: 1px solid #eee;
    color: #363636;
    padding: 7px;
    cursor: pointer;
  }

  ul.options-list li.highlighted {
    background: #f8f8f8
  }
</style>
