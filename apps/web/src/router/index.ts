import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../views/LandingPage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/branch/login',
      name: 'branch-login',
      component: () => import('../views/LoginPage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/company/login',
      name: 'company-login',
      component: () => import('../views/CompanyLoginPage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/employee/login',
      name: 'employee-login',
      component: () => import('../views/EmployeeLoginPage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/employees',
      name: 'employees',
      component: () => import('../views/EmployeesPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/attendances',
      name: 'attendances',
      component: () => import('../views/AttendanceLogsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/attendances/daily',
      name: 'attendances-daily',
      component: () => import('../views/AttendanceDailyLogsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/departments',
      name: 'departments',
      component: () => import('../views/DepartmentsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/departments/:id',
      name: 'department-detail',
      component: () => import('../views/DepartmentDetailPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/shifts',
      name: 'shifts',
      component: () => import('../views/ShiftsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/holidays',
      name: 'holidays',
      component: () => import('../views/HolidaysPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/rest-days',
      name: 'rest-days',
      component: () => import('../views/RestDaysPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/payroll-cutoff',
      name: 'payroll-cutoff',
      component: () => import('../views/PayrollCutoffPage.vue'),
      meta: { requiresAuth: true },
    },
    // Company routes
    {
      path: '/company/dashboard',
      name: 'company-dashboard',
      component: () => import('../views/CompanyDashboardPage.vue'),
      meta: { requiresAuth: true, requiresCompany: true },
    },
    {
      path: '/company/details',
      name: 'company-details',
      component: () => import('../views/CompanyDetailsPage.vue'),
      meta: { requiresAuth: true, requiresCompany: true },
    },
    {
      path: '/company/owner',
      name: 'owner-details',
      component: () => import('../views/OwnerDetailsPage.vue'),
      meta: { requiresAuth: true, requiresCompany: true },
    },
    // Employee routes
    {
      path: '/employee/dashboard',
      name: 'employee-dashboard',
      component: () => import('../views/EmployeeDashboardPage.vue'),
      meta: { requiresAuth: true, requiresAttendee: true },
    },
    {
      path: '/employee/details',
      name: 'employee-details',
      component: () => import('../views/EmployeeDetailsPage.vue'),
      meta: { requiresAuth: true, requiresAttendee: true },
    },
    {
      path: '/employee/branch',
      name: 'employee-branch',
      component: () => import('../views/EmployeeBranchDetailsPage.vue'),
      meta: { requiresAuth: true, requiresAttendee: true },
    },
    {
      path: '/employee/attendances',
      name: 'employee-attendances',
      component: () => import('../views/EmployeeAttendanceLogsPage.vue'),
      meta: { requiresAuth: true, requiresAttendee: true },
    },
    // Employee Portal - Payroll Master routes
    {
      path: '/employee/holidays',
      name: 'employee-holidays',
      component: () => import('../views/HolidaysPage.vue'),
      meta: { requiresAuth: true, requiresAttendee: true, requiresPayrollMaster: true },
    },
    {
      path: '/employee/rest-days',
      name: 'employee-rest-days',
      component: () => import('../views/RestDaysPage.vue'),
      meta: { requiresAuth: true, requiresAttendee: true, requiresPayrollMaster: true },
    },
    {
      path: '/employee/payroll-cutoff',
      name: 'employee-payroll-cutoff',
      component: () => import('../views/PayrollCutoffPage.vue'),
      meta: { requiresAuth: true, requiresAttendee: true, requiresPayrollMaster: true },
    },
  ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth state if not already done
  if (!authStore.isAuthenticated) {
    authStore.initializeAuth()
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to appropriate login page
    if (to.meta.requiresCompany) {
      next('/company/login')
    } else if (to.meta.requiresAttendee) {
      next('/employee/login')
    } else {
      next('/branch/login')
    }
    return
  }

  // Check if route requires company owner
  if (to.meta.requiresCompany && !authStore.isCompanyOwner) {
    next('/company/login')
    return
  }

  // Check if route requires attendee
  if (to.meta.requiresAttendee && !authStore.isAttendee) {
    next('/employee/login')
    return
  }

  // Check if route requires payroll master
  if (to.meta.requiresPayrollMaster && !authStore.isPayrollMaster) {
    next('/employee/dashboard')
    return
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect to appropriate dashboard
    if (authStore.isCompanyOwner) {
      next('/company/dashboard')
    } else if (authStore.isAttendee) {
      next('/employee/dashboard')
    } else {
      next('/dashboard')
    }
    return
  }

  next()
})

export default router
