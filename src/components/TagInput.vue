<template>
  <div class="tag-input">
    <span :key="index"
          class="label label-default"
          v-for="(tag, index) in tags">
      {{ tag }}
      <span class="label label-danger"
            @click.prevent="removeTag(tag)">[X]</span>
    </span>
    <autocomplete-input
      class="tag-autocomplete"
      :options-key="autocompleteOptionKey"
      the-key="label"
      model="">
    </autocomplete-input>
    <button class="btn btn-primary add-tag"
            @click.prevent="addTag()"
            aria-label="Add Package">
      {{ addTagLabel }}
    </button>
  </div>
</template>

<script>
import bus from '../js/bus';
import store from '../vuex/store';

export default {
  name: 'TagInput',
  props: {
    autocompleteOptionKey: String,
    addTagLabel: String,
  },
  data() {
    return {
      tagToAdd: '',
      tagsToAdd: this.tags ? this.tags : [],
    };
  },
  created() {
    const that = this;

    bus.$on('autocompleteSelect', function tagInputAutocompleteSelect(key, selectedOption) {
      that.autocompleteSelectListener(key, selectedOption, that);
    });
  },
  beforeDestroy() {
    // Remove event listeners.
    // bus.$off(['autocompleteSelect', 'tagInputAutocompleteSelect']);
  },
  computed: {
    tags() {
      return store.state.tagInputTags[this.autocompleteOptionKey];
    },
  },
  methods: {
    addTag() {
      // Store in central place that other components can use.
      this.tagsToAdd.push(this.tagToAdd);
      store.commit('addTags', { key: this.autocompleteOptionKey, tags: this.tagsToAdd });
    },
    removeTag(tag) {
      // There is only one entry per code asset so we can filter only that label out of the array.
      this.tagsToAdd = this.tags.filter(el => el !== tag);
      store.commit('addTags', { key: this.autocompleteOptionKey, tags: this.tagsToAdd });
    },
    autocompleteSelectListener(key, selectedOption, that) {
      that.tagToAdd = selectedOption.label;
    },
  },
};
</script>

<style scoped>

.tag-autocomplete {
  display: inline-block;
  width: 80%;
}

.label {
  font-size: inherit;
  display: inline-block;
  padding-bottom: 0px;
  margin-right: 5px;
  margin-bottom: 3px;
}

/*
.label-default {
  background-color: #8a8a8a;
} */

.label.label-danger {
  margin-right: -7px;
  padding-bottom: 5px;
  cursor: pointer;
}

.autocomplete-input {
    margin-top: 15px;
}

</style>
