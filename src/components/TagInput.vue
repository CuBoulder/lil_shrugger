<template>
  <div>
    <span :key="index"
          v-for="(tag, index) in tagsToAdd">
          {{ tag }}
          <span @click.prevent="removePackage(tag)">[X]</span>
    </span>
    <autocomplete-input
      :options-key="autocompleteOptionKey"
      the-key="label"
      model="">
    </autocomplete-input>
    <button
        class="btn btn-primary add-package"
        @click.prevent="addTag()"
        aria-label="Add Package">
      {{ addTagLabel }}
    </button>
  </div>
</template>

<script>
import bus from '../js/bus';

export default {
  name: 'TagInput',
  props: {
    autocompleteOptionKey: String,
    addTagLabel: String,
  },
  data() {
    return {
      tagToAdd: '',
      tagsToAdd: [],
    };
  },
  created() {
    const that = this;

    bus.$on('autocompleteSelect', (key, selectedOption) => {
      that.autocompleteSelectListener(key, selectedOption, that);
    });
  },
  methods: {
    addTag() {
      this.tagsToAdd.push(this.tagsToAdd);
    },
    removeTag(tag) {
      // There is only one entry per code asset so we can filter only that label out of the array.
      this.tagsToAdd = this.tagsToAdd.filter(el => el !== tag);
    },
    autocompleteSelectListener(key, selectedOption, that) {
      that.tagToAdd = selectedOption.label;
    },
  },
};
</script>

<style>

</style>
