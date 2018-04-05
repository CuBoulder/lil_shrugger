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
        selectedCommand: '',
      };
    },
    created() {
      const that = this;

      bus.$on('validate--sendCommand', function commandsValidateCommand(params) {
        that.validateCommandListener(params, that);
      });

      bus.$on('cancel--sendCommand', function commandsCancelCommand() {
        that.cancelCommandListener();
      });

      bus.$on('sendCommand', function commandsSendCommand(params) {
        that.sendCommandListener(params, that);
      });
    },
    beforeDestroy() {
      // Remove event listeners.
      bus.$off(['sendCommand', 'commandsSendCommand']);
      bus.$off(['validate--sendCommand', 'commandsValidateCommand']);
      bus.$off(['cancel--sendCommand', 'commandsCancelCommand']);
    },
    computed: {
      commands() {
        return store.state.commands;
      },
    },
    methods: {
      validateCommandListener(params) {
        // Get site Ids to send.
        const siteIds = '"' + store.state.sitesSendCommand.join('","') + '"';

        // Get command data for etag.
        const command = store.state.commands.filter(element => element._id === params.command);

        bus.$emit('onMessage', {
          text: `You are about to send the "${command[0].name}" command to ${store.state.sitesSendCommand.length} site(s): ${siteIds}.`,
          alertType: 'alert-warning',
        });
      },
      cancelCommandListener() {
        store.commit('addAllSitesToCommands', []);
        bus.$emit('clearAllRows');
      },
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