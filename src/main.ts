import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

Vue.config.productionTip = false;

// Import components that templates use.
import AutocompleteInput from './components/AutocompleteInput.vue';
import Commands from './components/Commands.vue';
import ConfirmButton from './components/ConfirmButton.vue';
import DataTable from './components/DataTable.vue';
import MessageArea from './components/MessageArea.vue';
import Navbar from './components/Navbar.vue';
import Row from './components/Row.vue';
import StatsSearch from './components/StatsSearch.vue';
import CreateCode from './components/CreateCode.vue';
import RowAdd from './components/RowAdd.vue';
import RowEdit from './components/RowEdit.vue';
import RowView from './components/RowView.vue';
import RowDiff from './components/RowDiff.vue';
import DrilldownDiff from './components/DrilldownDiff.vue';
import Reports from './components/Reports.vue';
import TagInput from './components/TagInput.vue';
import RowBackup from './components/RowBackup.vue';

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
Vue.component('row-backup', RowBackup);


new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
