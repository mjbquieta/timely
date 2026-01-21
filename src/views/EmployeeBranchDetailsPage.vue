<template>
  <PageLayout title="Branch Details" subtitle="View your branch information">
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

    <!-- Branch Details -->
    <div v-else-if="branchDetails" class="space-y-6">
      <!-- Branch Information Card -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
            <div
              class="w-16 h-16 bg-palette-medium-blue rounded-lg flex items-center justify-center"
            >
              <svg
                class="h-8 w-8 text-white"
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
              <h3 class="text-2xl font-bold text-gray-900">{{ branchDetails.name }}</h3>
              <p class="text-sm text-gray-600 mt-1">Branch Information</p>
            </div>
          </div>

          <!-- Branch Details -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Branch Information</h4>
            <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Branch Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ branchDetails.name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Timezone</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ branchDetails.timezone || 'Not specified' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Device Serial Number</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">
                  {{ branchDetails.deviceSerialNumber || 'Not specified' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Phone</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ branchDetails.phone || 'Not provided' }}
                </dd>
              </div>
              <div v-if="branchDetails.address1" class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Address</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <div>{{ branchDetails.address1 }}</div>
                  <div v-if="branchDetails.address2">{{ branchDetails.address2 }}</div>
                  <div v-if="branchDetails.city || branchDetails.state || branchDetails.zip">
                    {{ [branchDetails.city, branchDetails.state, branchDetails.zip]
                        .filter(Boolean)
                        .join(', ') }}
                  </div>
                  <div v-if="branchDetails.country">{{ branchDetails.country }}</div>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Created At</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ formatDate(branchDetails.createdAt) }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ formatDate(branchDetails.updatedAt) }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <!-- Company Information Card -->
      <div v-if="branchDetails.company" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
            <div
              class="w-16 h-16 bg-palette-light-beige rounded-lg flex items-center justify-center"
            >
              <svg
                class="h-8 w-8 text-white"
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
              <h3 class="text-2xl font-bold text-gray-900">
                {{ branchDetails.company.name }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">Company Information</p>
            </div>
          </div>

          <!-- Company Details -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Company Information</h4>
            <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Company Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ branchDetails.company.name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Phone</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ branchDetails.company.phone || 'Not provided' }}
                </dd>
              </div>
              <div v-if="branchDetails.company.address1" class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Address</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <div>{{ branchDetails.company.address1 }}</div>
                  <div v-if="branchDetails.company.address2">
                    {{ branchDetails.company.address2 }}
                  </div>
                  <div v-if="branchDetails.company.city || branchDetails.company.state || branchDetails.company.zip">
                    {{ [branchDetails.company.city, branchDetails.company.state, branchDetails.company.zip]
                        .filter(Boolean)
                        .join(', ') }}
                  </div>
                  <div v-if="branchDetails.company.country">
                    {{ branchDetails.company.country }}
                  </div>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Created At</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ formatDate(branchDetails.company.createdAt) }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ formatDate(branchDetails.company.updatedAt) }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="bg-white shadow rounded-lg p-6 text-center">
      <p class="text-gray-600">Failed to load branch details.</p>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { AttendeeDetailsResponse } from '../types'

const authStore = useAuthStore()

const branchDetails = ref<AttendeeDetailsResponse['branch'] | null>(null)
const isLoading = ref(false)

const fetchBranchDetails = async () => {
  try {
    isLoading.value = true
    const data = await authStore.fetchAttendeeDetails()
    branchDetails.value = data.branch || null
  } catch (error) {
    console.error('Failed to fetch branch details:', error)
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
  fetchBranchDetails()
})
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>

