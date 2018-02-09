<template>
  <div class="button-wrapper">
    <button :class="[callback, 'record-id-' + recordID ,'btn btn-primary']"
            v-if="!confirmed"
            @click.prevent="confirm()"
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
            @click.prevent="cancel()"
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
       confirmed: {
          type: Boolean,
          default: false,
        },
      };
    },
    computed: {
      /**
       * Return an ID of the record for CSS targeting.
       */
      recordID() {
        if (this.params.id) {
          return this.params.id.toString();
        }
        return '';
      },
    },
    methods: {
      /**
       * Emit the callback passed in as an event.
       */
      callMeMaybe(callback, params) {
        // Emit whatever event the button confirmed.
        bus.$emit(callback, params);

        // Send event for row component to cancel edit functionality.
        bus.$emit('confirmButtonSuccess', params);

        // Cancel edit mode within confirm button component.
        this.cancel();
      },

      /**
       * Show Fire! and Cancel buttons.
       */
      confirm() {
        this.confirmed = true;
      },

      /**
       * Reset to only show initial button with label.
       */
      cancel() {
        this.confirmed = false;
      },
    },
  };
</script>
