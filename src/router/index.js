import Vue from 'vue';
import Router from 'vue-router';

// Import pages.
import Sites from '@/pages/Sites';
import Settings from '@/pages/Settings';
import Code from '@/pages/Code';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.SUBDIRECTORY ? `/${process.env.SUBDIRECTORY}` : '',
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
  ],
});
