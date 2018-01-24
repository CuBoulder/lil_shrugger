import Vue from 'vue';
import Router from 'vue-router';

// Import pages.
import Sites from '@/pages/Sites';
import Settings from '@/pages/Settings';
import Code from '@/pages/Code';
import Packages from '@/pages/Packages';

Vue.use(Router);

export default new Router({
  mode: 'history',
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
      path: '/packages',
      name: 'Packages',
      component: Packages,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
    },

  ],
});
