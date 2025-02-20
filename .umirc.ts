import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  routes: [
    {
      name: '登入',
      path: '/user/login',
      component: './User/Login',
      layout: false,
    },
    {
      path: '/home',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: 'OpenAI',
      path: '/openai',
      component: './OpenAI',
    },
    {
      name: 'Chat',
      path: '/',
      component: './Chat',
      layout: false,
    },
    {
      name: '权限演示',
      path: '/access',
      component: './Access',
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
    },
  ],
  npmClient: 'npm',
  esbuildMinifyIIFE: true, // build index.html
});
