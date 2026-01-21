<template>
  <PageLayout title="Employee Dashboard" subtitle="Welcome to your employee portal">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <svg
        class="animate-spin h-8 w-8 text-palette-dark-blue"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-6">
      <!-- Welcome Card -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-palette-dark-blue rounded-full flex items-center justify-center">
            <span class="text-white text-2xl font-bold">
              {{ employeeDetails?.profile?.name?.charAt(0).toUpperCase() || 'E' }}
            </span>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900">
              Welcome, {{ employeeDetails?.profile?.name || 'Employee' }}!
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ employeeDetails?.profile?.email || 'No email provided' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Info Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Employee Info Card -->
        <div class="bg-white shadow rounded-lg p-6 border-l-4 border-palette-dark-blue">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="h-8 w-8 text-palette-dark-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h4 class="text-sm font-medium text-gray-500">Employee ID</h4>
              <p class="text-lg font-semibold text-gray-900">
                {{ employeeDetails?.deviceEnrollId || 'N/A' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Branch Info Card -->
        <div class="bg-white shadow rounded-lg p-6 border-l-4 border-palette-medium-blue">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="h-8 w-8 text-palette-medium-blue"
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
            <div class="ml-4">
              <h4 class="text-sm font-medium text-gray-500">Branch</h4>
              <p class="text-lg font-semibold text-gray-900">
                {{ employeeDetails?.branch?.name || 'N/A' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Company Info Card -->
        <div class="bg-white shadow rounded-lg p-6 border-l-4 border-palette-light-beige">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="h-8 w-8 text-palette-light-beige"
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
            <div class="ml-4">
              <h4 class="text-sm font-medium text-gray-500">Company</h4>
              <p class="text-lg font-semibold text-gray-900">
                {{ employeeDetails?.branch?.company?.name || 'N/A' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- View Employee Details Card -->
        <router-link
          to="/employee/details"
          class="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-palette-dark-blue"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-palette-dark-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg
                  class="h-6 w-6 text-palette-dark-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">My Details</h3>
                <p class="text-sm text-gray-600">View your personal information</p>
              </div>
            </div>
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </router-link>

        <!-- View Branch Details Card -->
        <router-link
          to="/employee/branch"
          class="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-palette-dark-blue"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-palette-medium-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg
                  class="h-6 w-6 text-palette-medium-blue"
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
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Branch Details</h3>
                <p class="text-sm text-gray-600">View your branch information</p>
              </div>
            </div>
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </router-link>

        <!-- Attendance Logs Card -->
        <router-link
          to="/employee/attendances"
          class="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-palette-dark-blue"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg
                  class="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Attendance Logs</h3>
                <p class="text-sm text-gray-600">View your attendance records</p>
              </div>
            </div>
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </router-link>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { AttendeeDetailsResponse } from '../types'

const authStore = useAuthStore()

const employeeDetails = ref<AttendeeDetailsResponse | null>(null)
const isLoading = ref(false)

const fetchEmployeeDetails = async () => {
  try {
    isLoading.value = true
    const data = await authStore.fetchAttendeeDetails()
    employeeDetails.value = data
  } catch (error) {
    console.error('Failed to fetch employee details:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchEmployeeDetails()
})
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>

