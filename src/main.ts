import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

Vue.config.productionTip = false;

// Import components that templates use.
import AutocompleteInput from './components/AutocompleteInput';
import Commands from './components/Commands';
import ConfirmButton from './components/ConfirmButton';
import DataTable from './components/DataTable';
import MessageArea from './components/MessageArea';
import Navbar from './components/Navbar';
import Row from './components/Row';
import StatsSearch from './components/StatsSearch';
import CreateCode from './components/CreateCode';
import RowAdd from './components/RowAdd';
import RowEdit from './components/RowEdit';
import RowView from './components/RowView';
import RowDiff from './components/RowDiff';
import DrilldownDiff from './components/DrilldownDiff';
import Reports from './components/Reports';
import TagInput from './components/TagInput';

// We need to add the component namespace for the template to recognize it.
Vue.component('autocomplete-input', AutocompleteInput);
Vue.component('commands', Commands);
Vue.component('confirm-button', ConfirmButton);
Vue.component('data-table', DataTable);
Vue.component('message-area', MessageArea);
Vue.component('navbar', Navbar);
Vue.component('row', Row);
Vue.component('stats-search', StatsSearch);
Vue.component('create-code', CreateCode);
Vue.component('row-edit', RowEdit);
Vue.component('row-add', RowAdd);
Vue.component('row-view', RowView);
Vue.component('row-diff', RowDiff);
Vue.component('drilldown-diff', DrilldownDiff);
Vue.component('reports', Reports);
Vue.component('tag-input', TagInput);


new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
