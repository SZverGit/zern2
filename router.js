import Vue from 'vue'
import Router from 'vue-router'

import OperationList from './components/OperationList'
import SupplyList from './components/Supplies'
import StockViewer from './components/Stock'
import RowViewerParted from './components/operations2/rowViewerParted'
import Stock2 from './components/stock2'
import newOperation from './components/newOperation'
import OperationViewer from './components/operations2/operationViewer'
import test from './components/LoginForm'
import Info from './components/Info'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
      {
        path:'/operation',
        name:'operation',
        component:OperationViewer
      },
      {
          path:'/info',
          name:'info',
          component:Info
      },
      {
          path:'/',
          name:'operations',
          component:OperationList
      },
      {
          path:'/stock',
      name:'stock',
      component:Stock2
      },
      {
          path:'/test',
          name:'test',
          component:test
      },
      {
          path:'/supplies',
          name:'supplyList',
          component:SupplyList
      }
  ]
})
