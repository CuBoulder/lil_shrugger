<template>
  <div v-if="messages.length > 0">
    <div :class="[bsAlert, message.alertType, 'message-' + index]" v-for="(message, index) in messages">
      <button type="button" class="close" aria-label="Close" @click="close(index)">
        <span aria-hidden="true">&times;</span>
      </button>
      <div v-html="message.text"></div>
    </div>
  </div>
</template>


<script>
  import bus from '../js/bus';

  export default {
    name: 'MessageArea',
    data() {
      return {
        messages: [],
        bsAlert: 'alert',
      };
    },
    created() {
      const that = this;

      // To use this anywhere:
      // bus.$emit('onMessage', {text: 'You have deleted a site.', alertType: 'alert-info'});
      // You can use any available bootstrap alert classes:
      // alert-info, alert-success, alert-danger, etc.
      bus.$on('onMessage', (params) => {
        that.messages.push(params);
      });
    },
    methods: {
      close: function close(index) {
        this.messages.splice(index, 1);
      },
    },
  };
  </script>

<style scoped>

.alert {
  word-wrap: break-word;
}

</style>
