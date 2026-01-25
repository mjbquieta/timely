<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
      <div class="flex justify-between h-20">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="flex items-center space-x-4">
              <!-- Branch Icon -->
              <div class="flex-shrink-0">
                <div
                  class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200"
                >
                  <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>

              <!-- Branch/Company Info -->
              <div class="flex flex-col">
                <h1
                  class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                >
                  {{
                    authStore.isCompanyOwner
                      ? authStore.company?.name || 'Company Portal'
                      : authStore.isAttendee
                        ? authStore.branch?.name || 'Employee Portal'
                        : branchInfo?.branch?.name || 'Branch Portal'
                  }}
                </h1>
                <div class="flex items-center space-x-3 mt-1">
                  <div
                    class="flex items-center text-xs px-2 py-1 rounded-full border"
                    :class="
                      authStore.isCompanyOwner
                        ? 'text-purple-600 bg-purple-50 border-purple-200'
                        : authStore.isAttendee
                          ? 'text-green-600 bg-green-50 border-green-200'
                          : 'text-blue-600 bg-blue-50 border-blue-200'
                    "
                  >
                    <span class="font-medium">
                      {{
                        authStore.isCompanyOwner
                          ? 'Company Portal'
                          : authStore.isAttendee
                            ? 'Employee Portal'
                            : 'Branch Portal'
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-6">
          <!-- Navigation Links -->
          <div class="flex items-center space-x-4">
            <!-- Employee Portal Navigation -->
            <template v-if="authStore.isAttendee">
              <!-- Dashboard Link -->
              <router-link
                to="/employee/dashboard"
                class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200"
                :class="
                  $route.name === 'employee-dashboard'
                    ? 'text-palette-dark-blue bg-palette-dark-blue bg-opacity-10 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                "
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                  />
                </svg>
                <span class="text-sm font-medium">DASHBOARD</span>
              </router-link>

              <!-- My Details Link -->
              <router-link
                to="/employee/details"
                class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200"
                :class="
                  $route.name === 'employee-details'
                    ? 'text-palette-dark-blue bg-palette-dark-blue bg-opacity-10 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                "
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span class="text-sm font-medium">MY DETAILS</span>
              </router-link>

              <!-- Branch Details Link -->
              <router-link
                to="/employee/branch"
                class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200"
                :class="
                  $route.name === 'employee-branch'
                    ? 'text-palette-dark-blue bg-palette-dark-blue bg-opacity-10 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                "
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span class="text-sm font-medium">BRANCH DETAILS</span>
              </router-link>

              <!-- Payroll Master Dropdown -->
              <template v-if="authStore.isPayrollMaster">
                <div class="relative">
                  <button
                    @click="toggleEmployeePayrollDropdown"
                    class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200"
                    :class="
                      isEmployeePayrollRoute
                        ? 'text-palette-dark-blue bg-palette-dark-blue bg-opacity-10 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    "
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span class="text-sm font-medium">PAYROLL</span>
                    <svg
                      class="w-4 h-4 transition-transform duration-200"
                      :class="{ 'rotate-180': showEmployeePayrollDropdown }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <!-- Dropdown Menu -->
                  <div
                    v-if="showEmployeePayrollDropdown"
                    class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <router-link
                      to="/employee/holidays"
                      @click="showEmployeePayrollDropdown = false"
                      class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Holidays</span>
                    </router-link>
                    <router-link
                      to="/employee/rest-days"
                      @click="showEmployeePayrollDropdown = false"
                      class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>Rest Days</span>
                    </router-link>
                    <router-link
                      to="/employee/payroll-cutoff"
                      @click="showEmployeePayrollDropdown = false"
                      class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Cutoff Payroll</span>
                    </router-link>
                  </div>
                </div>
              </template>
            </template>

            <!-- Company Portal Navigation -->
            <template v-else-if="authStore.isCompanyOwner">
              <!-- Dashboard Link -->
              <router-link
                to="/company/dashboard"
                class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200"
                :class="
                  $route.name === 'company-dashboard'
                    ? 'text-palette-dark-blue bg-palette-dark-blue bg-opacity-10 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                "
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                  />
                </svg>
                <span class="text-sm font-medium">DASHBOARD</span>
              </router-link>

              <!-- Company Details Link -->
              <router-link
                to="/company/details"
                class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200"
                :class="
                  $route.name === 'company-details'
                    ? 'text-palette-dark-blue bg-palette-dark-blue bg-opacity-10 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                "
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span class="text-sm font-medium">COMPANY DETAILS</span>
              </router-link>

              <!-- Owner Details Link -->
              <router-link
                to="/company/owner"
                class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200"
                :class="
                  $route.name === 'owner-details'
                    ? 'text-palette-dark-blue bg-palette-dark-blue bg-opacity-10 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                "
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span class="text-sm font-medium">OWNER DETAILS</span>
              </router-link>
            </template>

            <!-- Branch Portal Navigation -->
            <template v-else-if="!authStore.isAttendee">
              <!-- Dashboard Link -->
              <router-link
                to="/dashboard"
                class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                  />
                </svg>
                <span class="text-sm font-medium">Dashboard</span>
              </router-link>

              <!-- Payroll Dropdown -->
              <div class="relative">
                <button
                  @click="toggleBranchPayrollDropdown"
                  class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200"
                  :class="
                    isBranchPayrollRoute
                      ? 'text-palette-dark-blue bg-palette-dark-blue bg-opacity-10 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  "
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span class="text-sm font-medium">Payroll</span>
                  <svg
                    class="w-4 h-4 transition-transform duration-200"
                    :class="{ 'rotate-180': showBranchPayrollDropdown }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <!-- Dropdown Menu -->
                <div
                  v-if="showBranchPayrollDropdown"
                  class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  <router-link
                    to="/holidays"
                    @click="showBranchPayrollDropdown = false"
                    class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Holidays</span>
                  </router-link>
                  <router-link
                    to="/rest-days"
                    @click="showBranchPayrollDropdown = false"
                    class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Rest Days</span>
                  </router-link>
                  <router-link
                    to="/payroll-cutoff"
                    @click="showBranchPayrollDropdown = false"
                    class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Cutoff Payroll</span>
                  </router-link>
                </div>
              </div>

              <!-- Settings Link -->
              <router-link
                to="/settings"
                class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span class="text-sm font-medium">Settings</span>
              </router-link>
            </template>
          </div>

          <!-- Divider -->
          <div class="h-6 w-px bg-gray-300"></div>

          <!-- User Info -->
          <div class="flex items-center space-x-4">
            <div class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{
                  (
                    authStore.isCompanyOwner
                      ? authStore.profile?.username || 'User'
                      : branchInfo?.user?.profile?.username || 'User'
                  ).charAt(0).toUpperCase()
                }}
              </span>
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-900">
                {{
                  authStore.isCompanyOwner
                    ? authStore.profile?.username || 'User'
                    : authStore.isAttendee
                      ? authStore.profile?.name || authStore.profile?.email || 'Employee'
                      : branchInfo?.user?.profile?.username || 'User'
                }}
              </span>
              <span class="text-xs text-gray-500">
                {{
                  authStore.isCompanyOwner
                    ? 'Company Owner'
                    : authStore.isAttendee
                      ? 'Employee'
                      : 'Administrator'
                }}
              </span>
            </div>
          </div>

          <!-- Logout Button -->
          <button
            @click="handleLogout"
            class="group flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-red-200 hover:border-red-300"
          >
            <svg
              class="w-4 h-4 group-hover:rotate-12 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api'
import type { BranchInfoResponse } from '../types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Branch information from store
const branchInfo = ref<BranchInfoResponse | null>(null)

// Dropdown states
const showBranchPayrollDropdown = ref(false)
const showEmployeePayrollDropdown = ref(false)

// Computed properties to check if current route is a payroll route
const isBranchPayrollRoute = computed(() => {
  return ['holidays', 'rest-days', 'payroll-cutoff'].includes(route.name as string)
})

const isEmployeePayrollRoute = computed(() => {
  return ['employee-holidays', 'employee-rest-days', 'employee-payroll-cutoff'].includes(route.name as string)
})

// Toggle functions
const toggleBranchPayrollDropdown = () => {
  showBranchPayrollDropdown.value = !showBranchPayrollDropdown.value
  showEmployeePayrollDropdown.value = false
}

const toggleEmployeePayrollDropdown = () => {
  showEmployeePayrollDropdown.value = !showEmployeePayrollDropdown.value
  showBranchPayrollDropdown.value = false
}

// Close dropdowns when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showBranchPayrollDropdown.value = false
    showEmployeePayrollDropdown.value = false
  }
}

const fetchBranchInfo = async () => {
  // Only fetch branch info if not a company owner
  if (authStore.isCompanyOwner) {
    return
  }

  try {
    const data = await authStore.fetchBranchInfoWithCounts()
    branchInfo.value = data
  } catch (error) {
    console.error('Failed to fetch branch information:', error)
  }
}

// Methods
const handleLogout = () => {
  const wasCompanyOwner = authStore.isCompanyOwner
  const wasAttendee = authStore.isAttendee
  authStore.logout()
  if (wasCompanyOwner) {
    router.push('/company/login')
  } else if (wasAttendee) {
    router.push('/employee/login')
  } else {
    router.push('/branch/login')
  }
}

onMounted(() => {
  fetchBranchInfo()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
