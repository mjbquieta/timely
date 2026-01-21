<template>
  <PageLayout title="My Details" subtitle="View your personal information">
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

    <!-- Employee Details -->
    <div v-else-if="employeeDetails" class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <!-- Profile Header -->
        <div class="flex items-center space-x-6 mb-8 pb-6 border-b border-gray-200">
          <div class="w-20 h-20 bg-palette-dark-blue rounded-full flex items-center justify-center">
            <span class="text-white text-3xl font-bold">
              {{ employeeDetails.profile?.name?.charAt(0).toUpperCase() || 'E' }}
            </span>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900">
              {{ employeeDetails.profile?.name || 'Employee' }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Employee ID: {{ employeeDetails.deviceEnrollId || 'N/A' }}
            </p>
          </div>
        </div>

        <!-- Personal Information Section -->
        <div class="mb-8">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
          <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ employeeDetails.profile?.email || 'Not provided' }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Username</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ employeeDetails.profile?.username || 'Not provided' }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Phone</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ employeeDetails.profile?.phone || 'Not provided' }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Address</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <template v-if="employeeDetails.profile?.address1">
                  {{ employeeDetails.profile.address1 }}
                  <span v-if="employeeDetails.profile.address2">
                    , {{ employeeDetails.profile.address2 }}
                  </span>
                  <br v-if="employeeDetails.profile.city || employeeDetails.profile.state" />
                  <span v-if="employeeDetails.profile.city || employeeDetails.profile.state">
                    {{ [employeeDetails.profile.city, employeeDetails.profile.state]
                        .filter(Boolean)
                        .join(', ') }}
                  </span>
                  <span v-if="employeeDetails.profile.zip">
                    {{ employeeDetails.profile.zip }}
                  </span>
                  <br v-if="employeeDetails.profile.country" />
                  <span v-if="employeeDetails.profile.country">
                    {{ employeeDetails.profile.country }}
                  </span>
                </template>
                <span v-else>Not provided</span>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Employee Information Section -->
        <div class="mb-8">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Employee Information</h4>
          <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Employee ID</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ employeeDetails.deviceEnrollId || 'N/A' }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">User Type</dt>
              <dd class="mt-1">
                <span
                  v-for="type in employeeDetails.type"
                  :key="type"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
                >
                  {{ type }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Console Access</dt>
              <dd class="mt-1">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="
                    employeeDetails.hasConsole === 'ALLOWED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                >
                  {{ employeeDetails.hasConsole }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Device Admin</dt>
              <dd class="mt-1">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="
                    employeeDetails.deviceIsAdmin
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  "
                >
                  {{ employeeDetails.deviceIsAdmin ? 'Yes' : 'No' }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Device Enabled</dt>
              <dd class="mt-1">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="
                    employeeDetails.deviceIsEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  "
                >
                  {{ employeeDetails.deviceIsEnabled ? 'Yes' : 'No' }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Created At</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDate(employeeDetails.createdAt) }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Branch Information Section -->
        <div v-if="employeeDetails.branch" class="mb-8">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Branch Information</h4>
          <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Branch Name</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ employeeDetails.branch.name }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Timezone</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ employeeDetails.branch.timezone || 'Not specified' }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="bg-white shadow rounded-lg p-6 text-center">
      <p class="text-gray-600">Failed to load employee details.</p>
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchEmployeeDetails()
})
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>

