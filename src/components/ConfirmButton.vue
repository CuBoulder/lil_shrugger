<template>
  <div class="button-wrapper">
    <button :class="[callback, 'record-id-' + recordID ,'btn btn-primary']" v-if="!confirmed" @click.prevent="confirm()" :aria-label="label">{{label}}</button>
    <button :class="[callback, 'record-id-' + recordID , 'btn btn-danger']" v-if="confirmed" @click.prevent="callMeMaybe(callback, params)" aria-label="Fire!">Fire!</button>
    <button :class="[callback, 'record-id-' + recordID , 'btn btn-default']" v-if="confirmed" @click.prevent="cancel()" aria-label="Cancel">Cancel</button>
  </div>
</template>

<script>
  import bus from '../js/bus';

  export default {
    name: 'ConfirmButton',
    props: {
      label: String,
      callback: String,
      row: {
        type: Object,
        default() {
          return {};
        },
      },
      params: Object,
      confirmProp: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        confirmed: this.confirmProp,
      };
    },
    computed: {
      recordID() {
        if (this.params.id) {
          return this.params.id.toString();
        }
        return '';
      },
    },
    methods: {
      callMeMaybe(callback, params) {
        // Emit whatever event the button confirmed.
        bus.$emit(callback, params);

        // Send event for row component to cancel edit functionality.
        bus.$emit('confirmButtonSuccess', this.row);

        // Cancel edit mode within confirm button component.
        this.cancel();
      },
      confirm() {
        this.confirmed = true;
      },
      cancel() {
        this.confirmed = false;
      },
    },
  };
</script>
