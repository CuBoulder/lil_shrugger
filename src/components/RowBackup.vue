<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4>
        Site Backups
        <a target="_blank"
           href="https://github.com/CuBoulder/lil_shrugger/wiki/RowBackup">
          <span class="navbar-action-icon glyphicon glyphicon-question-sign"></span>
        </a>
      </h4>
    </div>
    <div class="row panel-body">
      <p v-if="backups === {}">
        There are no backups for this site currently.<br>
        Please follow the
        <a href="https://github.com/CuBoulder/documentation/blob/master/backups/on_demand_backups.md">
          site backup documentation
        </a>
        to start a backup.
      </p>
      <div v-if="backups"
           class="table-responsive">
        <table class="table table-striped table-hover table-sm">
          <thead>
          <th>Backup Date</th>
          <th>Files</th>
          <th>Database</th>
          </thead>
          <tbody>
          <tr v-for="backup in backups">
            <td>{{ backup.backup_date }}</td>
            <td class="hand-cursor">{{ formatFilesLink(backup.files) }}</td>
            <td class="hand-cursor">{{ formatFilesLink(backup.database) }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
  import atlas from '../js/atlas';
  import store from '../vuex/store';
  import bus from '../js/bus';

  export default {
    name: 'RowBackup',
    props: {
      options: Object,
    },
    data() {
      return {
        backups: {},
      };
    },
    created() {
      const that = this;

      //
      bus.$on('rowView', function rowViewBackupListener(row) {
        that.getBackup(that, row);
      });

      // Erase data when row is hidden.
      bus.$on('rowHide', function rowBackupRowHide() {
        that.clear(that);
      });

      // Erase stuff when changing environments.
      bus.$on('switchEnv', function rowBackupSwitchEnv() {
        that.clear(that);
      });
    },
    methods: {
      getBackup(that, row) {
        const envURL = store.state.atlasEnvironments[store.state.env];

        // console.log('backups');
        // console.log(row);

        atlas.request(envURL, 'backup', `?where={"site":"${row.rowData.id}"}`)
          .then((data) => {
            console.log(data);
            if (typeof data[0] !== 'undefined') {
              that.backups = data[0];
            }
          });
      },
      clear(that) {
        that.backups = {};
      },
      formatFilesLink(fileName) {
        let envURL = store.state.atlasEnvironments[store.state.env];

        // Remove protocol.
        envURL = envURL.split('//')[1].split('/')[0];

        return `scp ${envURL}:/nfs/prod_backups/backups/${fileName} ~/Downloads`;
      },
    },
  };
</script>

<style scoped>
  .hand-cursor {
    cursor: pointer;
  }
</style>
