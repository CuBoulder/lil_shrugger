import Vue from 'vue';
import Router from 'vue-router';

// Import pages.
import Sites from '@/pages/Sites';
import Settings from '@/pages/Settings';
import Code from '@/pages/Code';
import Packages from '@/pages/Packages';
import store from '../vuex/store';

Vue.use(Router);

const theRoutes = [
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
];

// Check permissions for including Packages page.
if (store.state.userPermissions.includes('Packages')) {
  theRoutes.push({
    path: '/packages',
    name: 'Packages',
    component: Packages,
  });
}

theRoutes.push({
  path: '/settings',
  name: 'Settings',
  component: Settings,
});

export default new Router({
  mode: 'history',
  base: process.env.SUBDIRECTORY ? `/${process.env.SUBDIRECTORY}` : '',
  routes: theRoutes,
});
