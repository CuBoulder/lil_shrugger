<template>
  <div class="row create-code" >
    <label for="addRepo">Select A Repo</label>
    <a target="_blank"
       href="https://github.com/CuBoulder/lil_shrugger/wiki/Code#create-code">&nbsp;
      <span class="navbar-action-icon glyphicon glyphicon-question-sign"></span>
    </a>
    <select name="addRepo"
            id="addRepo"
            @change="changeRepo($event)"
            class="form-control">
      <option v-for="(value, index) in repos"
              :key="index"
              :value="index">
        {{value.name}}
      </option>
    </select>
    <!-- Second dropdown -->
    <transition name="fade">
      <div v-if="branchReady">
        <label for="addBranch">Select A Branch</label>
        <select name="addBranch"
                id="addBranch"
                @change="changeBranch($event)"
                class="form-control">
          <option v-for="(branch, index) in branches"
                  :key="branch.name + '-' + branch.commit.sha"
                  :value="index">
            {{branch.name}}
          </option>
        </select>
        <label for="code_type">Type:</label>
        <select name="code_type"
                id="code_type"
                v-model="codeType"
                class="form-control">
          <option v-for="anOption in selectOptions.code_type"
                  :key="anOption"
                  :value="anOption">
            {{anOption}}
          </option>
        </select>
        <label for="is_current">Is Current:</label>
        <select name="is_current"
                id="is_current"
                v-model="isCurrent"
                class="form-control">
          <option v-for="anOption in selectOptions.is_current"
                  :key="anOption"
                  :value="anOption">
            {{anOption}}
          </option>
        </select>
        <label for="tag">Tag:</label>
        <input type="text"
                name="tag"
                id="tag"
                class="form-control"
                v-model="tag">
        <label for="code_version">Version:</label>
        <input type="text"
                name="code_version"
                id="code_version"
                class="form-control"
                v-model="codeVersion">
        <label for="code_label">Label:</label>
        <input type="text"
                name="code_label"
                id="code_label"
                class="form-control"
                v-model="codeLabel">
      </div>
    </transition>
    <!-- End Second dropdown -->
    <confirm-button label="Add Row"
                    v-if="ready"
                    class="pull-left add-button"
                    callback="createCode"
                    :params="{}">
    </confirm-button>
  </div>
</template>

<script>
  import store from '../store.ts';
  import bus from '../services/bus.ts';
  import atlas from '../services/atlas.ts';
  import code from '../services/code.ts';
  import github from '../services/github.ts';
  import shrugger from '../services/shrugger.ts';

  export default {
    name: 'CreateCode',
    data() {
      return {
        selectOptions: store.state.selectOptions,
        branchToAdd: {},
        activeRepo: {},
        ready: false,
        branchReady: false,
        addCode: false,
        codeType: 'module',
        tag: '',
        codeVersion: '',
        codeLabel: '',
        isCurrent: false,
      };
    },
    mounted() {
      const that = this;
      // Create a site.
      bus.$on('createCode', function codeCreateCode() {
        that.createCodeListener(that);
      });
      // Cancel creating a site.
      bus.$on('validate--createCode', function codeValidateCreateCode() {
        that.validateCreateCodeListener(that);
      });
      // Cancel creating a site.
      bus.$on('cancel--createCode', function codeCancelCreateCode() {
        that.cancelCreateCodeListener(that);
      });
    },
    beforeDestroy() {
      // Remove event listeners.
      bus.$off(['createCode', 'codeCreateCode']);
      bus.$off(['validate--createCode', 'codeValidateCreateCode']);
      bus.$off(['cancel--createCode', 'codeCancelCreateCode']);
    },
    computed: {
      userInput() {
        return {
          version: this.codeVersion,
          type: this.codeType,
          label: this.codeLabel,
          is_current: this.isCurrent,
          tag: this.tag,
        };
      },
      repos() {
        return store.state.gitHubRepos;
      },
      branches() {
        return store.state.gitHubBranches;
      },
      classes() {
        return !this.addCode ? this.styles.closed : this.styles.open;
      },
    },
    methods: {
      changeRepo(event) {
        const that = this;

        // Set to true for branch select list to appear.
        this.branchReady = true;
        this.ready = false;
        this.branchToAdd = {};

        // Get a list of branches for the active repo.
        store.commit('addGitHubBranches', []);
        this.activeRepo = this.repos[event.target.value];
        const response = github.getBranches(this.activeRepo.name);

        // Save branches to the central store.
        response.then((branchesList) => {
          console.log(branchesList);
          store.commit('addGitHubBranches', branchesList);
          // Add a default; otherwise user can't select first element.
          const first = {
            name: '-Select-',
            commit: {
              hash: null,
            },
          };
          that.branches.unshift(first);
        });
      },
      changeBranch(event) {
        // Display the Create Code Asset button.
        this.ready = true;
        this.branchToAdd = {};
        this.branchToAdd = store.state.gitHubBranches[event.target.value];
      },
      validateCreateCodeListener(that) {
        const repo = that.activeRepo;
        const branch = that.branchToAdd;
        const input = that.userInput;
        bus.$emit('onMessage', {
          text: `<p>You are about to create a code record from the "${repo.name}" repository:</p>` +
            `Branch:<pre>${JSON.stringify(branch)}</pre><br>` +
            `User Input:<pre>${JSON.stringify(input)}</pre><br>` +
            'If anything looks amiss, please refresh the application via your browser, e.g. "cmd+shift+R" on Chrome for Mac OS.',
          alertType: 'alert-warning',
        });
      },
      createCodeListener(that) {
        const repo = that.activeRepo;
        const branch = that.branchToAdd;
        const input = that.userInput;

        // Need to check for special code assets (drupal/express) and set data accordingly.
        if (repo.name === 'drupal-7.x') {
          repo.name = 'drupal';
        }

        // Turn tag into array.
        if (typeof input.tag === 'string') {
          input.tag = input.tag.split(',');
        }

        // Make body to send to Atlas.
        const codeAsset = {
          git_url: repo.ssh_url,
          commit_hash: branch.commit.sha,
          meta: {
            version: input.version,
            code_type: input.type,
            name: repo.name,
            label: input.label,
            is_current: input.is_current,
            tag: input.tag,
          },
        };

        // Make request to add code to Atlas.
        const baseURL = store.state.atlasEnvironments[store.state.env];
        atlas.request(baseURL, 'code', '', 'POST', JSON.stringify(codeAsset))
          .then((resp) => {
            console.log(resp);
            if (typeof resp !== 'undefined') {
              // Wait a little so the response has new entries.
              shrugger.wait(5000);

              bus.$emit('onMessage', {
                text: 'You have created a code asset.',
                alertType: 'alert-success',
              });
              code.get(store.state.atlasEnvironments[store.state.env])
                .then((data) => {
                  const options = {
                    codeData: data,
                  };

                  store.commit('addSitesGridData', options);
                });
            } else {
              bus.$emit('onMessage', {
                text: 'Soemthing may have went wrong. Please check the browser\'s console log and network tab.',
                alertType: 'alert-error',
              });
            }
          })
          .catch(error => console.log(error));

        that.addCode = false;

        // Cancel rowView components.
        bus.$emit('rowHide');
        bus.$emit('cancelRowAdd');
      },
      cancelCreateCodeListener(that) {
        bus.$emit('cancelRowAdd', that);
      },
    },
  };
</script>

<style scoped>

button {
  margin-top: 10px;
}

.create-code {
  margin-bottom: 25px;
}

</style>
