<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4>
        Commands
        <a target="_blank"
          href="https://github.com/CuBoulder/lil_shrugger/wiki/Commands">
          <span class="navbar-action-icon glyphicon glyphicon-question-sign"></span>
        </a>
      </h4>
    </div>
    <form class="row panel-body">
      <label for="sendCommand">Select Command</label>
      <select name="sendCommand" id="sendCommand" class="form-control" v-model="selectedCommand">
        <option v-for="value in commands"
                :key="value._id"
                :value="value._id">
          {{value.name}}
        </option>
      </select>
      <div class="commands-button">
        <confirm-button
            label="Send Command"
            class="commands-button"
            :params="{command: selectedCommand}"
            callback="sendCommand">
        </confirm-button>
      </div>
    </form>
  </div>
</template>

<script>
  import store from '../vuex/store';
  import shrugger from '../js/shrugger';
  import bus from '../js/bus';
  import atlas from '../js/atlas';

  export default {
    name: 'Commands',
    data() {
      return {
        selectedCommand: {
          type: String,
          default: '',
        },
      };
    },
    created() {
      const that = this;

      // Listens for the sendCommand event emitted by the confirm-button component.
      bus.$on('sendCommand', (params) => {
        that.sendCommandListener(params, that);
      });
    },
    computed: {
      /**
       * Returns a list of commands from the central store.
       */
      commands() {
        return store.state.commands;
      },
    },
    methods: {
      /**
       * Send a selected command to a certain set of sites.
       */
      sendCommandListener(params) {
        // Get site Ids to send.
        const siteIds = '"' + store.state.sitesSendCommand.join('","') + '"';
        let queryToSend = '{"path":{"$in":[' + siteIds + ']}}';

        // Convert to unicode.
        queryToSend = shrugger.convertToUnicode(queryToSend);

        // Don't JSON encode since it escapes too much.
        const body = '{"query": "' + queryToSend + '"}';

        // Get command data for etag.
        const command = store.state.commands.filter(element => element._id === params.command);

        // Make request to Atlas and emit message to user.
        atlas.request(store.state.atlasEnvironments[store.state.env], 'commands/' + command[0]._id, '', 'PATCH', body, command[0]._etag)
        .then(() => {
          bus.$emit('onMessage', {
            text: 'Successfully sent "' + command[0].name + '" command to ' + store.state.sitesSendCommand.length + ' site(s): (' + siteIds + ').',
            alertType: 'alert-success',
          });
        })
        .catch((error) => {
          console.log(error);
        });
      },
      userAccessPerm(permission) {
        return shrugger.userAccess(permission);
      },
    },
  };

</script>

<style scoped>
  .commands-button {
    margin-top: 10px;
    margin-left: 0px;
  }
</style>