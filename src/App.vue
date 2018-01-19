<template>
  <div id="app">
    <navbar></navbar>
      <div class="page container">
        <transition name="fade">
          <router-view class="row"/>
        </transition>
      </div>
  </div>
</template>

<script>
  // Import commonly used modules.
  import Vue from 'vue';

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

  export default {
    name: 'app',
  };
</script>

<style>

  /* Needed for sticky navbar at top of pages. */
  body {
    padding-top: 100px;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0
  }

  .slide-fade-enter-active {
    transition: all .4s ease;
  }
  .slide-fade-leave-active {
    transition: all .4s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active below version 2.1.8 */ {
    transform: translateY(-10px);
    opacity: 0;
  }


  /* Commands */
  .commands-button {
    display: inline-block;
  }

  #commandsForm {
    margin-bottom: 0.5em;
  }

  #commandsForm .btn {
    margin-top: 0.75em;
  }

  /* Export Table */
  .export-button {
    display: inline-block;
    margin-left: 0.75em;
  }

  @media (min-width: 1200px) {
    .container {
      width: 1450px;
      max-width: 90%;
    }
  }


</style>
