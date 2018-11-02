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

<style lang="scss">
/*#app {*/
  /*font-family: 'Avenir', Helvetica, Arial, sans-serif;*/
  /*-webkit-font-smoothing: antialiased;*/
  /*-moz-osx-font-smoothing: grayscale;*/
  /*text-align: center;*/
  /*color: #2c3e50;*/
/*}*/
/*#nav {*/
  /*padding: 30px;*/
  /*a {*/
    /*font-weight: bold;*/
    /*color: #2c3e50;*/
    /*&.router-link-exact-active {*/
      /*color: #42b983;*/
    /*}*/
  /*}*/
/*}*/

/* Needed for sticky navbar at top of pages. */
body {
  padding-top: 100px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
}

.slide-fade-enter-active {
  transition: all .2s ease;
}
.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
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

@media (min-width: 768px) {
  .row {
    margin-left: 0px;
    margin-right: 0px;
  }
}
</style>
