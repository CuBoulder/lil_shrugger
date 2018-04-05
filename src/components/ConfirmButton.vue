<template>
  <div class="button-wrapper">
    <button :class="[callback, 'record-id-' + recordID ,'btn btn-primary']"
            v-if="!confirmed"
            @click.prevent="confirm(callback, params)"
            :aria-label="label">
      {{label}}
    </button>
    <button :class="[callback, 'record-id-' + recordID , 'btn btn-danger']"
            v-if="confirmed"
            @click.prevent="callMeMaybe(callback, params)"
            aria-label="Fire!">
      Fire!
    </button>
    <button :class="[callback, 'record-id-' + recordID , 'btn btn-default']"
            v-if="confirmed"
            @click.prevent="cancel(callback, params)"
            aria-label="Cancel">
      Cancel
    </button>
  </div>
</template>

<script>
  import bus from '../js/bus';

  export default {
    name: 'ConfirmButton',
    props: {
      label: String,
      callback: String,
      params: Object,
    },
    data() {
      return {
        confirmed: false,
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
        bus.$emit('confirmButtonSuccess', params);

        // Cancel edit mode within confirm button component.
        this.cancel();
      },
      confirm(callback, params) {
        this.confirmed = true;

        // Emit validation function.
        bus.$emit(`validate--${callback}`, params);
      },
      cancel(callback, params) {
        this.confirmed = false;

        bus.$emit(`cancel--${callback}`, params);
      },
    },
  };
</script>
