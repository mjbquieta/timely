<template>
  <PageLayout title="Departments" subtitle="Manage your branch departments">
    <template #header-actions>
      <div class="flex items-center space-x-3">
        <button
          @click="showCreateModal = true"
          class="bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Create Department
        </button>
        <button
          @click="router.push('/dashboard')"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isLoading" class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-palette-dark-blue"></div>
          <span class="ml-2 text-gray-600">Loading departments...</span>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-4 py-6 sm:px-0">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading departments</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchDepartments"
              class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Departments Table -->
    <div v-else class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow rounded-lg">
        <!-- Table Header -->
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Department List ({{ totalDepartments }} total)
            </h3>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Department Name
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Members
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-palette-dark-blue text-white"
                  >
                    Start Time
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-palette-dark-blue text-white"
                  >
                    End Time
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="department in paginatedDepartments" :key="department.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div
                          class="h-10 w-10 rounded-full bg-palette-dark-blue flex items-center justify-center"
                        >
                          <span class="text-sm font-medium text-white">
                            {{ getInitials(department.name) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ department.name }}
                        </div>
                        <div class="text-sm text-gray-500">
                          ID: {{ department.id.slice(0, 8) }}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ department.description || 'No description' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-dark-blue text-white"
                    >
                      {{ department.users?.length || 0 }} member(s)
                    </span>
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-palette-dark-blue bg-blue-50 px-3 py-1 rounded-md"
                  >
                    {{ department.shift ? formatTime(department.shift.startTime) : 'N/A' }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-palette-dark-blue bg-blue-50 px-3 py-1 rounded-md"
                  >
                    {{ department.shift ? formatTime(department.shift.endTime) : 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(department.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="viewDepartment(department.id)"
                      class="text-palette-dark-blue hover:text-palette-medium-blue transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-6">
            <div class="flex items-center text-sm text-gray-700">
              <span>
                Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalDepartments }} results
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md',
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
                ]"
              >
                Previous
              </button>
              <span class="text-sm text-gray-700">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md',
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
                ]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Department Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Create New Department</h3>
            <button
              @click="closeCreateModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form @submit.prevent="createDepartment" class="space-y-4">
            <div>
              <label for="departmentName" class="block text-sm font-medium text-gray-700 mb-1">
                Department Name *
              </label>
              <input
                id="departmentName"
                v-model="newDepartment.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-transparent"
                placeholder="Enter department name"
              />
            </div>

            <div>
              <label
                for="departmentDescription"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="departmentDescription"
                v-model="newDepartment.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-transparent"
                placeholder="Enter department description (optional)"
              ></textarea>
            </div>

            <div v-if="createError" class="bg-red-50 border border-red-200 rounded-md p-3">
              <p class="text-sm text-red-700">{{ createError }}</p>
            </div>

            <div class="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeCreateModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isCreating"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  isCreating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-palette-dark-blue hover:bg-palette-medium-blue text-white',
                ]"
              >
                <span v-if="isCreating">Creating...</span>
                <span v-else>Create Department</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api'
import type { Department } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const profile = computed(() => authStore.profile)

// State
const departments = ref<Department[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10
const showDeleteModal = ref(false)
const departmentToDelete = ref<Department | null>(null)
const isDeleting = ref(false)
const showCreateModal = ref(false)
const isCreating = ref(false)
const createError = ref<string | null>(null)
const newDepartment = ref({
  name: '',
  description: '',
})

// Computed
const totalDepartments = computed(() => departments.value.length)
const totalPages = computed(() => Math.ceil(totalDepartments.value / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalDepartments.value))
const paginatedDepartments = computed(() => {
  return departments.value.slice(startIndex.value, endIndex.value)
})

// Methods
const fetchDepartments = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await apiService.getDepartments()
    departments.value = data
  } catch (err: any) {
    console.error('Failed to fetch departments:', err)
    error.value = err.message || 'Failed to fetch departments'
  } finally {
    isLoading.value = false
  }
}

const getInitials = (name: string): string => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (timeString: string): string => {
  // Assuming timeString is in HH:mm format or similar
  // If it's a full datetime, extract just the time part
  const time = timeString.includes('T') ? timeString.split('T')[1] : timeString
  return time.substring(0, 5) // Return HH:mm format
}

const viewDepartment = (departmentId: string) => {
  router.push(`/departments/${departmentId}`)
}

const confirmDelete = (department: Department) => {
  departmentToDelete.value = department
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  departmentToDelete.value = null
}

const deleteDepartment = async () => {
  if (!departmentToDelete.value) return

  try {
    isDeleting.value = true
    await apiService.deleteDepartment(departmentToDelete.value.id)

    // Remove from local state
    departments.value = departments.value.filter((dept) => dept.id !== departmentToDelete.value!.id)

    closeDeleteModal()
  } catch (err: any) {
    console.error('Failed to delete department:', err)
    error.value = err.message || 'Failed to delete department'
  } finally {
    isDeleting.value = false
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  createError.value = null
  newDepartment.value = {
    name: '',
    description: '',
  }
}

const createDepartment = async () => {
  if (!newDepartment.value.name.trim()) {
    createError.value = 'Department name is required'
    return
  }

  try {
    isCreating.value = true
    createError.value = null

    const createdDepartment = await apiService.createDepartment({
      name: newDepartment.value.name.trim(),
      description: newDepartment.value.description.trim() || undefined,
    })

    // Add the new department to the list
    departments.value.unshift(createdDepartment)

    // Close modal and reset form
    closeCreateModal()
  } catch (err: any) {
    console.error('Failed to create department:', err)
    createError.value = err.message || 'Failed to create department'
  } finally {
    isCreating.value = false
  }
}

onMounted(() => {
  fetchDepartments()
})
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>
