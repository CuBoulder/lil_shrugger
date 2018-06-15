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
          {{value.label}}
        </option>
      </select>
      <div v-if="selectedCommand">
        <strong>Command Object:</strong>
        <pre>
          {{ currentCommandSyntax }}
        </pre>
      </div>
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
      currentCommandSyntax() {
        if (this.commands && this.selectedCommand) {
          return this.commands.find(el => el._id === this.selectedCommand);
        }
        return 'Please select a command.';
      },
    },
    methods: {
      validateCommandListener(params) {
        // Get command data for etag.
        const command = store.state.commands.filter(element => element._id === params.command);

        // Get site Ids to send.
        const siteIds = store.state.sitesSendCommand.join('","');

        // If the siteIds aren't set, then the query will be patched with whatever was there before.
        // If there are selected sites, then show the user what sites they are about to send the command to.
        const queryValidationText = siteIds.length === 0 ?
        `this MongoDB query: ${command[0].query}. If you would like to send the command to specific sites, please cancel the command 
        and select sites from the DataTable.` :
        `${store.state.sitesSendCommand.length} site(s): "${siteIds}".<br><br><strong>WARNING: You will change the command's query to
        only execute on these sites by clicking "Fire!" and running the command.</strong>`;

        atlas.request(store.state.atlasEnvironments[store.state.env], 'drush/' + command[0]._id)
        .then((data) => {
          // Check and see if etags are different and emit error message.
          if (data[0]._etag !== command[0]._etag) {
            bus.$emit('onMessage', {
              text: 'The etag has changed for this command, and the list of selected sites has been reset.<br>' +
                `Please check the command and retry: <a href="${store.state.atlasEnvironments[store.state.env]}drush/${command[0]._id}">` +
                `${store.state.atlasEnvironments[store.state.env]}drush/${command[0]._id}</a>`,
              alertType: 'alert-danger',
            });

            bus.$emit('etagFail', data);
            store.commit('addAllSitesToCommands', []);
            bus.$emit('clearAllRows');

            // Setup commands for select list.
            atlas.getCommands();
          } else {
            bus.$emit('onMessage', {
              text: `You are about to send the "${command[0].label}" command to ${queryValidationText}`,
              alertType: 'alert-warning',
            });
          }
        });
      },
      cancelCommandListener() {
        store.commit('addAllSitesToCommands', []);
        bus.$emit('clearAllRows');
      },
      sendCommandListener(params) {
        /*eslint-disable*/
        // Get command data.
        let command = store.state.commands.filter(element => element._id === params.command);

        // Set default query to be the old one.
        let queryToSend = command.query;

        // Check to see if the query changed and modify the query and success message if so.
        const queryChanged = store.state.sitesSendCommand.join('","').length !== 0;
        let successText = `the following MongoDB query: ${command.query}`;

        if (queryChanged) {
          // Get site Ids to send.
          const siteIds = '"' + store.state.sitesSendCommand.join('","') + '"';

          queryToSend = '{"path":{"$in":[' + siteIds + ']}}';
          successText = `${store.state.sitesSendCommand.length} site(s): ("${siteIds}").`;

          // Convert to unicode.
          queryToSend = shrugger.convertToUnicode(queryToSend);

          // Don't JSON encode since it escapes too much.
          const body = `{"query": "${queryToSend}"}`;

          atlas.request(store.state.atlasEnvironments[store.state.env], 'drush/' + command[0]._id, '', 'PATCH', body, command[0]._etag)
          .then((resp) => {
            console.log(resp);
            if (typeof resp !== 'undefined') {
              bus.$emit('onMessage', {
                text: `Successfully patched "${command[0].label}" command to ${successText} Please wait for the successful execution message.`,
                alertType: 'alert-success',
              });

              // Setup commands for sending POST to execute command.
              setTimeout(function executeCommand() {
                atlas.getCommands();
                command = store.state.commands.filter(element => element._id === params.command);

                // Execute command.
                atlas.request(store.state.atlasEnvironments[store.state.env], `drush/${command[0]._id}/execute`, '', 'POST', null, command[0]._etag)
                .then((resp) => {
                  console.log(resp);
                  bus.$emit('onMessage', {
                    text: `Successfully executed "${command[0].label}". Check the <a href="${store.state.kibanaLink}" target="_blank">Atlas logs</a> to see what is happening.`,
                    alertType: 'alert-success',
                  });
                });

                store.commit('addAllSitesToCommands', []);
                bus.$emit('clearAllRows');

                // Setup commands for select list.
                atlas.getCommands();
              }, 3000);
            } else {
              bus.$emit('onMessage', {
                text: 'Something may have went wrong. Please check the browser\'s console log and network tab.',
                alertType: 'alert-error',
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });

        } else {

          // Execute command.
          atlas.request(store.state.atlasEnvironments[store.state.env], `drush/${command[0]._id}/execute`, '', 'POST', null, command[0]._etag)
          .then((resp) => {
            console.log(resp);
            bus.$emit('onMessage', {
              text: `Successfully executed "${command[0].label}". Check the <a href="${store.state.kibanaLink}" target="_blank">Atlas logs</a> to see what is happening.`,
              alertType: 'alert-success',
            });
          });

          store.commit('addAllSitesToCommands', []);
          bus.$emit('clearAllRows');

          // Setup commands for select list.
          atlas.getCommands();
        }

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