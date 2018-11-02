import Vue from 'vue';
import Router from 'vue-router';
import Sites from './views/Sites.vue';
import Code from './views/Code.vue';
import Settings from './views/Settings.vue';
import Packages from './views/Packages.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Sites',
      component: Sites,
    },
    {
      path: '/code',
      name: 'Code',
      component: Code,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
    },
    {
      path: '/packages',
      name: 'Packages',
      component: Packages,
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    // },
  ],
});
