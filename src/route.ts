import { RouteProps } from 'react-router-dom';
import Home from './pages/Home';

import Login from './pages/Login';

const routeList: RouteProps[] = [
  { 
    path: '/login',
    component: Login,
  },
  {
    path: '/home',
    component: Home,
  },
  {
    path: '*',
    component: Login,
  }
];

export default routeList