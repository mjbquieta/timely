<template>
  <PageLayout title="Dashboard" subtitle="Welcome to your branch management dashboard">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-palette-dark-blue rounded-md flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ branchInfo?.counts?.totalAttendees || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-palette-medium-blue rounded-md flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Present Today</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ branchInfo?.counts?.presentAttendees || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-palette-light-beige rounded-md flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                  ></path>
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Absent Today</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ branchInfo?.counts?.absentAttendees || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Branch Information -->
    <div class="bg-white shadow rounded-lg mb-8">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Branch Information</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- <div>
            <dt class="text-sm font-medium text-gray-500">Branch ID</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ branchInfo?.branch?.id || 'N/A' }}
            </dd>
          </div> -->
          <div>
            <dt class="text-sm font-medium text-gray-500">Branch Name</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ branchInfo?.branch?.name || 'N/A' }}
            </dd>
          </div>
          <!-- <div>
            <dt class="text-sm font-medium text-gray-500">User Type</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ branchInfo?.user?.type?.join(', ') || 'N/A' }}
            </dd>
          </div> -->
          <div>
            <dt class="text-sm font-medium text-gray-500">Username</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ branchInfo?.user?.profile?.username || 'N/A' }}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Email</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ branchInfo?.user?.profile?.email || 'N/A' }}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Timezone</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ branchInfo?.branch?.timezone || 'N/A' }}
            </dd>
          </div>
          <div class="sm:col-span-2" v-if="branchInfo?.branch?.defaultShift">
            <dt class="text-sm font-medium text-gray-500">Global Shift</dt>
            <dd class="mt-1">
              <div
                class="bg-palette-dark-blue bg-opacity-10 border border-palette-dark-blue rounded-lg p-3"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-semibold text-palette-dark-blue">
                      {{ branchInfo?.branch?.defaultShift?.name || 'N/A' }}
                    </p>
                    <p class="text-xs text-gray-600 mt-1">
                      {{ branchInfo?.branch?.defaultShift?.description || 'No description' }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">
                      {{ branchInfo?.branch?.defaultShift?.startTime || 'N/A' }} -
                      {{ branchInfo?.branch?.defaultShift?.endTime || 'N/A' }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{
                        branchInfo?.branch?.defaultShift?.isDefault
                          ? 'Default Shift'
                          : 'Regular Shift'
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-sm font-medium text-gray-500 flex items-center">
              <svg
                class="w-4 h-4 mr-2 text-palette-dark-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Device Serial Number
            </dt>
            <dd class="mt-1">
              <div
                class="bg-palette-dark-blue bg-opacity-10 border border-palette-dark-blue rounded-lg p-3"
              >
                <div class="flex items-center justify-between">
                  <span class="text-lg font-mono font-semibold text-palette-dark-blue">
                    {{ branchInfo?.branch?.deviceSerialNumber || 'N/A' }}
                  </span>
                  <div
                    class="flex items-center text-xs text-palette-dark-blue bg-white bg-opacity-50 px-2 py-1 rounded"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Device ID
                  </div>
                </div>
              </div>
            </dd>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Attendance Reports Dropdown -->
          <div class="relative">
            <button
              @click="toggleAttendanceDropdown"
              class="bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-between w-full"
            >
              <span>View Attendance Report</span>
              <svg
                class="w-4 h-4 ml-2 transition-transform"
                :class="{ 'rotate-180': isAttendanceDropdownOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="isAttendanceDropdownOpen"
              class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10"
            >
              <button
                @click="navigateToAttendanceAllLogs"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Attendance All Logs
              </button>
              <button
                @click="navigateToAttendanceDailyLogs"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Attendance Daily Logs
              </button>
            </div>
          </div>
          <button
            @click="router.push('/employees')"
            class="bg-palette-medium-blue hover:bg-palette-light-beige text-white px-4 py-3 rounded-md text-sm font-medium transition-colors"
          >
            Manage Employees
          </button>
          <button
            @click="router.push('/departments')"
            class="bg-palette-light-beige hover:bg-palette-medium-blue text-white px-4 py-3 rounded-md text-sm font-medium transition-colors"
          >
            Departments
          </button>
          <button
            @click="router.push('/shifts')"
            class="bg-palette-light-beige hover:bg-palette-medium-blue text-white px-4 py-3 rounded-md text-sm font-medium transition-colors"
          >
            Manage Shifts
          </button>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { BranchInfoResponse } from '../types'

const router = useRouter()
const authStore = useAuthStore()

// Branch information from store
const branchInfo = ref<BranchInfoResponse | null>(null)
const isLoading = ref(false)

// Dropdown state
const isAttendanceDropdownOpen = ref(false)

const fetchBranchInfo = async () => {
  try {
    isLoading.value = true
    const data = await authStore.fetchBranchInfoWithCounts()
    branchInfo.value = data
  } catch (error) {
    console.error('Failed to fetch branch information:', error)
  } finally {
    isLoading.value = false
  }
}

// Dropdown methods
const toggleAttendanceDropdown = () => {
  isAttendanceDropdownOpen.value = !isAttendanceDropdownOpen.value
}

const navigateToAttendanceAllLogs = () => {
  isAttendanceDropdownOpen.value = false
  router.push('/attendances')
}

const navigateToAttendanceDailyLogs = () => {
  isAttendanceDropdownOpen.value = false
  router.push('/attendances/daily')
}

// Click outside handler
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isAttendanceDropdownOpen.value = false
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

<style scoped>
/* Additional custom styles can be added here */
</style>
