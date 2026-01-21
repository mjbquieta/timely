<template>
  <PageLayout title="Company Dashboard" subtitle="Manage your company branches">
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

    <!-- Branches List -->
    <div v-else class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Company Branches</h3>
          <div
            class="px-3 py-1 bg-palette-dark-blue bg-opacity-10 text-palette-dark-blue rounded-full text-sm font-medium"
          >
            {{ branches.length }} {{ branches.length === 1 ? 'Branch' : 'Branches' }}
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="branches.length === 0" class="text-center py-12">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
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
          <h3 class="mt-2 text-sm font-medium text-gray-900">No branches</h3>
          <p class="mt-1 text-sm text-gray-500">No branches have been created for this company yet.</p>
        </div>

        <!-- Branches Grid -->
        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="branch in branches"
            :key="branch.id"
            class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ branch.name }}</h4>
                <div class="space-y-2 text-sm text-gray-600">
                  <div v-if="branch.timezone" class="flex items-center">
                    <svg
                      class="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {{ branch.timezone }}
                  </div>
                  <div v-if="branch.deviceSerialNumber" class="flex items-center">
                    <svg
                      class="w-4 h-4 mr-2 text-gray-400"
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
                    <span class="font-mono text-xs">{{ branch.deviceSerialNumber }}</span>
                  </div>
                  <div v-if="branch.address1" class="flex items-start">
                    <svg
                      class="w-4 h-4 mr-2 text-gray-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <div>{{ branch.address1 }}</div>
                      <div v-if="branch.address2">{{ branch.address2 }}</div>
                      <div v-if="branch.city || branch.state || branch.zip">
                        {{ [branch.city, branch.state, branch.zip].filter(Boolean).join(', ') }}
                      </div>
                      <div v-if="branch.country">{{ branch.country }}</div>
                    </div>
                  </div>
                  <div v-if="branch.phone" class="flex items-center">
                    <svg
                      class="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {{ branch.phone }}
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="text-xs text-gray-500">
                Created: {{ formatDate(branch.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api'
import type { CompanyBranch } from '../types'

const authStore = useAuthStore()

const branches = ref<CompanyBranch[]>([])
const isLoading = ref(false)

const fetchBranches = async () => {
  if (!authStore.company?.id) {
    console.error('Company ID not found')
    return
  }

  try {
    isLoading.value = true
    const data = await apiService.getCompanyBranches(authStore.company.id)
    branches.value = data
  } catch (error) {
    console.error('Failed to fetch company branches:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  fetchBranches()
})
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>

