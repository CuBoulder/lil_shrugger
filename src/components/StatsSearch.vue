<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4>
        Stats Search
        <a target="_blank"
           href="https://github.com/CuBoulder/lil_shrugger/wiki/Stats-Search">
          <span class="navbar-action-icon glyphicon glyphicon-question-sign"></span>
        </a>
      </h4>
    </div>
    <form class="row panel-body">
      <div class="form-group row">
        <div class="col-md-6">
          <label for="mongo-query">MongoDB Query</label>
          <input type="text" name="mongo-query" id="mongo-query" class="form-control" v-model="statsQuery">
        </div>
        <div class="col-md-6">
          <label for="query-name">Query Title <a href="#" @click.prevent="showQueryList = !showQueryList">(Show Query List)</a></label>
          <autocomplete-input
              id="query-name"
              :options-key="optionsKey"
              the-key="title"
              :model="statsQueryName">
          </autocomplete-input>
        </div>
        <div v-if="userAccessPerm('statsSearch:save')">
          <div class="col-md-6">
            <label for="query-edit-name">Add/Edit Query Title</label>
            <input type="text" name="query_edit_name" id="query-edit-name" class="form-control" v-model="statsEditName">
          </div>
          <div class="col-md-6">
            <label for="query-description">Query Description</label>
            <input type="text" name="query_description" id="query-description" class="form-control" v-model="statsQueryDescription">
          </div>
          <!-- Comment out until another endpoint other than stats is searched on this page.
          <div class="col-md-4">
            <label for="query-endpoint">Query Endpoint</label>
            <input type="text" name="query_endpoint" id="query-endpoint" class="form-control" v-model="statsQueryEndpoint">
          </div>
          -->
          <div class="col-md-6">
            <label for="query-tags">Query Tags</label>
            <input type="text" name="query_tags" id="query-tags" class="form-control" v-model="statsQueryTags">
          </div>
        </div>
      </div>
      <div class="form-group row col-md-6">
        <button class="btn btn-primary" @click.prevent="search()">Search</button>
        <button class="btn btn-default" v-if="reset" @click.prevent="resetSearch()">Reset</button>
        <button class="btn btn-warning" @click.prevent="saveSearch()" v-if="userAccessPerm('statsSearch:save') && reset">Save</button>
        <button class="btn btn-danger" @click.prevent="deleteSearch()" v-if="userAccessPerm('statsSearch:save') && reset">Delete</button>
      </div>
      <div v-if="showQueryList" class="form-group row col-md-10">
        <div class="panel panel-default">
          <div class="panel-heading">
            <h4>Query List</h4>
          </div>
          <ul class="list-group panel-body">
            <li v-for="query in queryList"
                :key="query._id"
                class="list-group-item ">
            <strong>{{query.title}}</strong> -- {{query.query}}<br />
              {{query.description}}
            </li>
          </ul>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
  import shrugger from '../js/shrugger';
  import store from '../vuex/store';
  import bus from '../js/bus';
  import atlas from '../js/atlas';

  export default {
    name: 'StatsSearch',
    data() {
      return {
        statsQuery: '',
        statsQueryName: '',
        statsQueryDescription: '',
        statsQueryEndpoint: '',
        statsQueryTags: '',
        statsEditName: '',
        optionsKey: 'statsQueryOptions',
        reset: false,
        showQueryList: false,
      };
    },
    created() {
      const that = this;

      // Add query options to search/filters.
      bus.$on('siteListingMounted', function statsSearchSiteListingMounted(params) {
        that.siteListingMountedListener(params, that);
      });

      bus.$on('autocompleteSelect', function statsSearchAutocompleteSelect(key, selectedOption) {
        that.autocompleteSelectListener(key, selectedOption, that);
      });
    },
    beforeDestroy() {
      // Remove event listeners.
      bus.$off(['siteListingMounted', 'statsSearchSiteListingMounted']);
      bus.$off(['autocompleteSelect', 'statsSearchAutocompleteSelect']);
    },
    computed: {
      filter() {
        return store.state.filterKey;
      },
      queryList() {
        return store.state.statsQueryOptions.sort((a, b) => {
          const sortOptions = {
            sensitivity: 'base',
            numeric: true,
          };
          return b.title.localeCompare(a.title, 'en', sortOptions) * -1;
        });
      },
    },
    methods: {
      siteListingMountedListener(params, that) {
        // Check for query params.
        if (window.location.search === '') {
          return;
        }

        // Format the query params into an array.
        const queryParams = {};
        window.location.search.slice(1).split('&').map((item) => {
          const parts = item.split('=');
          queryParams[parts[0]] = parts[1];
        });

        // Get property names to match to filter and search.
        const propertyNames = Object.getOwnPropertyNames(queryParams);

        // Set the search.
        if (propertyNames.indexOf('query') !== -1) {
          // Find the query name of the ID entered.
          const storedQueries = store.state.statsQueryOptions;

          let paramQuery = {};
          storedQueries.forEach((element) => {
            if (element._id === queryParams.query) {
              paramQuery = element;
            }
          });

          // If ID found, perform search.
          if (paramQuery !== 'undefined') {
            that.search(paramQuery);

            // Have to send event to set name field since it lives in an autocomplete input.
            bus.$emit('setAutocompleteInput', 'title', paramQuery.title);

            // Add other fields.
            that.statsQueryDescription = paramQuery.description;
            that.statsQueryEndpoint = paramQuery.endpoint;
            that.statsQueryTags = paramQuery.tags.join(',');
            that.statsQuery = paramQuery.query;
            that.statsEditName = paramQuery.title;
          }
        }
      },
      autocompleteSelectListener(key, selectedOption, that) {
        // Fill in other fields in stats search.
        if (key === 'title') {
          let currentQuery = {};
          store.state.statsQueryOptions.forEach((element) => {
            if (element.title === selectedOption.title) {
              that.statsQueryDescription = element.description;
              that.statsQueryEndpoint = element.endpoint;
              that.statsQueryTags = element.tags.join(',');
              that.statsQuery = element.query;
              that.statsQueryName = element.title;
              that.statsEditName = element.title;
              currentQuery = element;
            }
          });

          // Save current query for check when updating queries.
          store.commit('storeQuery', currentQuery);
        }
      },
      search(querySent = null) {
        let query = null;
        const that = this;

        // If query already passed in, use that.
        if (querySent !== null) {
          query = querySent.query;
        } else {
          query = that.statsQuery;
        }

        // Find the query name of the ID entered.
        const storedQueries = store.state.statsQueryOptions;
        let paramQuery = {};
        storedQueries.forEach((element) => {
          if (element.query === query) {
            paramQuery = element;
          }
        });

        // Set the history to update the query parameters for sharing URLs.;
        const filter = that.filter ? '?filter=' + btoa(that.filter) : '';

        // We have to check for the existence of the first query parameter here.
        // I'm sure this can be done in a better way, but with only two parameters
        // this is fine for now.
        let queryS = '';
        if (filter) {
          queryS = paramQuery._id ? '&query=' + paramQuery._id : '';
        } else {
          queryS = paramQuery._id ? '?query=' + paramQuery._id : '';
        }

        // The blank parameters aren't added here.
        const queryString = filter + queryS;
        history.pushState(null, null, location.origin + location.pathname + queryString);

        // Make request to Atlas.
        const baseURL = store.state.atlasEnvironments[store.state.env];
        atlas.request(baseURL, 'statistics', '?where=' + query)
          .then((objects) => {
            // If no search results returned, catch with error.
            if (typeof objects['0']._error !== 'undefined') {
              bus.$emit('onMessage', {
                text: 'Error in Atlas Request: ' + objects['0']._error.message + '. Your search has been reset.',
                alertType: 'alert-danger',
              });
              that.$options.methods.resetSearch(that);
            }

            // Get array only of site IDs to check from stats query.
            const siteIds = [];
            objects.forEach((elements) => {
              elements.forEach((element) => {
                siteIds.push(element.site);
              });
            });

            // Filter results by using the site ID stored in stats records.
            // By setting the gridData property, the view will automatically update.
            const dat = store.state.sitesGridData.cachedData
              .filter(row => siteIds.indexOf(row.id) > -1);
            store.commit('addSitesGridData', { sitesData: dat });
            that.reset = true;
          })
          .catch((error) => {
            console.log(error);
          });
      },
      resetSearch(thing = null) {
        const that = thing || this;

        // Reset keyword in autocomplete input.
        bus.$emit('clearAutocompleteInput', 'title');

        // Reset other query fields not in autocomplete component.
        that.statsQueryDescription = '';
        that.statsQueryEndpoint = '';
        that.statsQueryTags = '';
        that.statsQuery = '';
        that.statsEditName = '';

        // Reset stored query.
        store.commit('storeQuery', null);

        // By using the cached results when the page is loaded, the query can be reverted.
        store.commit('addSitesGridData', { sitesData: store.state.sitesGridData.cachedData });
        that.reset = false;

        // Reset data in query params.
        history.pushState(null, null, location.origin + location.pathname);

        // Grab search queries.
        atlas.getQueries();
      },
      saveSearch() {
        let queryToSend = null;
        const name = this.statsEditName;
        const userQuery = this.statsQuery;

        // Convert to unicode.
        queryToSend = shrugger.convertToUnicode(userQuery);

        // Make tags into string with quotes.
        const tags = this.statsQueryTags.replace(new RegExp(',', 'g'), '","');
        const data = '{"title": "' + name + '", "description": "' + this.statsQueryDescription
          + '", "endpoint": ["statistic"], "query": "' + queryToSend + '", "tags": ["' + tags + '"], "rank": 1}';

        // Make request to Atlas.
        const baseURL = store.state.atlasEnvironments[store.state.env];
        const currentQuery = store.state.currentQuery;

        // If there is a current query, then we assume we are patching it.
        if (currentQuery !== null && userQuery === currentQuery.query) {
          atlas.request(baseURL, 'query/' + currentQuery._id, '', 'PATCH', data, currentQuery._etag)
            .then(() => {
              // Wait a little so the response has new entries.
              shrugger.wait(5000);

              bus.$emit('onMessage', {
                text: 'You have sent a PATCH request to a query record. query ID: ' + currentQuery._id + '. Search and reset to add new query.',
                alertType: 'alert-success',
              });

              // Grab search queries.
              atlas.getQueries();
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          // If no current query, then we assume we are making a new one.
          atlas.request(baseURL, 'query', '', 'POST', data)
            .then(() => {
              // Wait a little so the response has new entries.
              shrugger.wait(5000);

              bus.$emit('onMessage', {
                text: 'You have sent a POST request to add query record. Search and reset to add new query.',
                alertType: 'alert-success',
              });

              // Grab search queries.
              atlas.getQueries();
            })
            .catch((error) => {
              console.log(error);
            });
        }
      },
      deleteSearch() {
        // Get the current query object.
        const currentQuery = this.queryList.find(value => value.query === this.statsQuery);

        // Send request to Atlas.
        const baseURL = store.state.atlasEnvironments[store.state.env];
        atlas.request(baseURL, 'query/' + currentQuery._id, '', 'DELETE', null, currentQuery._etag)
          .then(() => {
            // Wait a little so the response has new entries.
            shrugger.wait(5000);

            bus.$emit('onMessage', {
              text: 'You have sent a DELETE request to a query record. Query ID: ' + currentQuery._id,
              alertType: 'alert-success',
            });

            // Grab search queries.
            atlas.getQueries();
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
