<template>
  <form id="statsSearch" class="row">
    <h3>Search</h3>
    <hr>
    <div class="form-group row">
      <div class="col-md-6">
        <label for="query-mongo">Query</label>
        <autocomplete-input
            id="query-mongo"
            :options-key="optionsKey"
            the-key="query"
            :model="statsQuery">
        </autocomplete-input>
      </div>
      <div class="col-md-6">
        <label for="query-name">Query Name</label>
        <autocomplete-input
            id="query-name"
            :options-key="optionsKey"
            the-key="title"
            :model="statsQueryName">
        </autocomplete-input>
      </div>
      <div v-if="userAccessPerm('statsSearch:save')">
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
      <button class="btn btn-primary" @click.prevent="saveSearch()" v-if="userAccessPerm('statsSearch:save')">Save To Atlas</button>
      <button class="btn btn-default" v-if="reset" @click.prevent="resetSearch()">Reset</button>
    </div>
  </form>
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
        optionsKey: 'statsQueryOptions',
        reset: false,
      };
    },
    created() {
      const that = this;

      // Listen for autocomplete selections and match both inputs.
      bus.$on('select', (params) => {
        that.selectListener(params, that);
      });

      bus.$on('siteListingMounted', (params) => {
        that.siteListingMountedListener(params, that);
      });
    },
    computed: {
      commands() {
        return store.state.commands;
      },
      filter() {
        return store.state.filterKey;
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

            // Have to send event to set names since they live in autocomplete inputs.
            bus.$emit('searchByQueryParam', paramQuery);
          }
        }
      },
      selectListener(params, that) {
        // Since we know that we have queries and titles, we can check the key and
        // make the opposite property match what the user selected.
        let params2 = {};
        if (params.key === 'title') {
          params2 = {
            keyword: params.selectedOption.query,
            key: 'query',
          };
          bus.$emit('matchKeys', params2);
        } else {
          params2 = {
            keyword: params.selectedOption.title,
            key: 'title',
          };
          bus.$emit('matchKeys', params2);
        }

        // Fill in other keys.
        let currentQuery = {};
        store.state.statsQueryOptions.forEach((element) => {
          if (params2.key === 'title' && element.title === params2.keyword) {
            that.statsQueryDescription = element.description;
            that.statsQueryEndpoint = element.endpoint;
            that.statsQueryTags = element.tags.join(',');
            currentQuery = element;
          }

          if (params2.key === 'query' && element.query === params2.keyword) {
            that.statsQueryDescription = element.description;
            that.statsQueryEndpoint = element.endpoint;
            that.statsQueryTags = element.tags.join(',');
            currentQuery = element;
          }
        });

        // Save current query for check when updating queries.
        store.commit('storeQuery', currentQuery);
      },
      search(querySent = null) {
        let query = null;
        const that = this;

        // If query already passed in, use that.
        if (querySent !== null) {
          query = querySent.query;
        } else {
          // If no passed in query, then we need to grab it from autocomplete fields.
          // Autocomplete is another component.
          this.$children.forEach((element) => {
            if (element.theKey === 'query') {
              query = element.keyword;
            }
          });

          // If no query, then emit an error message and return.
          if (query === null) {
            bus.$emit('onMessage', {
              text: 'No query found.',
              alertType: 'alert-danger',
            });
            return;
          }
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

        // Reset keywords in child components.
        // @todo see if this can be stored in Store object.
        that.$children.forEach((element) => {
          if (typeof element.keyword !== 'undefined') {
            element.keyword = '';
          }
        });

        // Reset other query fields not in autocomplete component.
        that.statsQueryDescription = '';
        that.statsQueryEndpoint = '';
        that.statsQueryTags = '';

        // Reset stored query.
        store.commit('storeQuery', null);

        // By using the cached results when the page is loaded, the query can be reverted.
        store.commit('addSitesGridData', { sitesData: store.state.sitesGridData.cachedData });
        that.reset = false;

        // Reset data in query params.
        history.pushState(null, null, location.origin + location.pathname);
      },
      saveSearch() {
        let queryToSend = null;
        let name = null;
        let userQuery = null;

        // Grab keyword to search for.
        this.$children.forEach((element) => {
          if (element.theKey === 'query') {
            userQuery = element.keyword;
          }
          if (element.theKey === 'title') {
            name = element.keyword;
          }
        });

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
      userAccessPerm(permission) {
        return shrugger.userAccess(permission);
      },
    },
  };
</script>
