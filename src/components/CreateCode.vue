<template>
  <div class="row" >
    <button v-if="!addCode" class="btn btn-primary" @click="codeButton()">Add
      Code
    </button>
    <transition name="fade">
      <div v-if="addCode">
        <label for="addRepo">Select A Repo</label>
        <select name="addRepo"
                id="addRepo"
                @change="changeRepo($event)"
                class="form-control">
          <option v-for="(value, index) in repos" :value="index">
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
              <option v-for="(branch, index) in branches" :value="index">
                {{branch.name}}
              </option>
            </select>
            <label for="code_type">Type:</label>
            <select name="code_type"
                    id="code_type"
                    v-model="codeType"
                    class="form-control">
              <option v-for="anOption in selectOptions.code_type" :value="anOption">
                {{anOption}}
              </option>
            </select>
            <label for="is_current">Is Current:</label>
            <select name="is_current"
                    id="is_current"
                    v-model="isCurrent"
                    class="form-control">
              <option v-for="anOption in selectOptions.is_current" :value="anOption">
                {{anOption}}
              </option>
            </select>
            <label for="tag">Tag:</label>
            <select name="tag"
                    id="tag"
                    v-model="tag"
                    class="form-control">
              <option v-for="anOption in selectOptions.tag" :value="anOption">
                {{anOption}}
              </option>
            </select>
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
        <button v-if="ready" class="btn btn-primary" @click="createCode()">Create
          Code Asset
        </button>
        <button v-if="addCode" class="btn btn-default" @click="addCode = false">Cancel</button>
      </div>
    </transition>
  </div>
</template>

<script>
  import store from '../vuex/store';
  import bus from '../js/bus';
  import atlas from '../js/atlas';
  import code from '../js/code';
  import github from '../js/github';

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
        tag: 'beta_bundle',
        codeVersion: '',
        codeLabel: '',
        isCurrent: false,
      };
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
    },
    methods: {
      changeRepo(event) {
        // Set to true for branch select list to appear.
        this.branchReady = true;
        this.branches = [];
        this.activeRepo = this.repos[event.target.value];

        const that = this;
        const response = github.getBranches(this.activeRepo.name);

        response.then((branchesList) => {
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
        this.ready = true;
        this.branchToAdd = this.branches[event.target.value];
      },
      codeButton() {
        this.addCode = true;
      },
      createCode() {
        const repo = this.activeRepo;
        const branch = this.branchToAdd;
        const input = this.userInput;

        // Need to check for special code assets (drupal/express) and set data accordingly.
        if (repo.name === 'drupal-7.x') {
          repo.name = 'drupal';
        }

        // Turn tag into array.
        input.tag = [input.tag];

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

        const baseURL = store.state.atlasEnvironments[store.state.env];
        atlas.request(baseURL, 'code', '', 'POST', JSON.stringify(codeAsset))
          .then(() => {
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
          })
          .catch(error => console.log(error));
        this.addCode = false;
      },
    },
  };

</script>
