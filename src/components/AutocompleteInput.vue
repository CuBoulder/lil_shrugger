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
    <ul class="options-list" v-show="isOpen === true">
      <li v-for="(option, index) in fOptions"
          :key="index"
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
        isOpen: {
          type: Boolean,
          default: false,
        },
        highlightedPosition: {
          type: Number,
          default: 0,
        },
        keyword: this.model,
      };
    },
    created() {
      const that = this;

      // Set autocomplete input.
      bus.$on('setAutocompleteInput', (key, value) => {
        if (that.theKey === key) {
          that.keyword = value;
        }
      });

      // Clear autocomplete input.
      bus.$on('clearAutocompleteInput', (key) => {
        if (that.theKey === key) {
          that.keyword = '';
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
        bus.$emit('autocompleteSelect', this.theKey, selectedOption);
      },
    },
  };
</script>

<style scoped>
  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

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
