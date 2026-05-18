import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView    from '../views/HomeView.vue'
import CheckerView from '../views/CheckerView.vue'
import AdminView   from '../views/AdminView.vue'
import ReportView  from '../views/ReportView.vue'
import RankingView from '../views/RankingView.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/',        component: HomeView },
  { path: '/checker', component: CheckerView, meta: { roles: ['checker', 'admin'] } },
  { path: '/report',  component: ReportView,  meta: { roles: ['checker', 'admin'] } },
  { path: '/admin',   component: AdminView,   meta: { roles: ['admin'] } },
  { path: '/ranking', component: RankingView },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.roles) {
    const auth = useAuthStore()
    if (!auth.isLoggedIn || !to.meta.roles.includes(auth.role)) {
      return '/'
    }
  }
})

export default router
