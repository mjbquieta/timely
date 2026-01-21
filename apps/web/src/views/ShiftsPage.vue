<template>
  <PageLayout title="Shifts" subtitle="Manage your branch shifts">
    <template #header-actions>
      <button
        @click="router.push('/dashboard')"
        class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        Back to Dashboard
      </button>
    </template>

    <!-- Loading State -->
    <div v-if="isLoading" class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-palette-dark-blue"></div>
          <span class="ml-2 text-gray-600">Loading shifts...</span>
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
            <h3 class="text-sm font-medium text-red-800">Error loading shifts</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchShifts"
              class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Shifts Table -->
    <div v-else class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow rounded-lg">
        <!-- Table Header -->
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Shift List ({{ totalShifts }} total)
            </h3>
            <button
              @click="showCreateModal = true"
              class="bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Create Shift
            </button>
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
                    Shift Name
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
                    Time
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Departments
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
                <tr v-for="shift in paginatedShifts" :key="shift.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div
                          class="h-10 w-10 rounded-full bg-palette-dark-blue flex items-center justify-center"
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
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ shift.name }}</div>
                        <div class="text-sm text-gray-500">ID: {{ shift.id.slice(0, 8) }}...</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ shift.description || 'No description' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ formatTime(shift.startTime) }} - {{ formatTime(shift.endTime) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ calculateDuration(shift.startTime, shift.endTime) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        shift.isDefault
                          ? 'bg-palette-dark-blue text-white'
                          : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ shift.isDefault ? 'Default' : 'Regular' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ shift.isDefault ? 'Global' : shift.departments.length + ' department(s)' }}
                    </div>
                    <div v-if="shift.departments.length > 0" class="mt-1">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="dept in shift.departments.slice(0, 2)"
                          :key="dept.id"
                          class="text-xs bg-palette-dark-blue bg-opacity-10 text-palette-dark-blue px-2 py-1 rounded"
                        >
                          {{ dept.name }}
                        </span>
                        <span v-if="shift.departments.length > 2" class="text-xs text-gray-500">
                          +{{ shift.departments.length - 2 }} more
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="editShift(shift)"
                        class="text-palette-dark-blue hover:text-palette-medium-blue"
                      >
                        Edit
                      </button>
                      <button
                        v-if="!shift.isDefault"
                        @click="showDepartmentModal(shift)"
                        class="text-palette-light-beige hover:text-palette-medium-blue"
                      >
                        Departments
                      </button>
                      <button
                        v-if="!shift.isDefault"
                        @click="openDeleteModal(shift)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-6">
            <div class="flex items-center text-sm text-gray-700">
              <span
                >Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalShifts }} results</span
              >
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
              <span class="text-sm text-gray-700">Page {{ currentPage }} of {{ totalPages }}</span>
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

    <!-- Create/Edit Shift Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showEditModal ? 'Edit Shift' : 'Create New Shift' }}
          </h3>
          <form @submit.prevent="showEditModal ? updateShiftData() : createShiftData()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input
                  v-model="shiftForm.name"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  v-model="shiftForm.description"
                  rows="3"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                ></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Start Time (24-hour format, HH:MM:SS)</label
                  >
                  <input
                    v-model="shiftForm.startTime"
                    type="time"
                    step="1"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                    style="font-family: monospace"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >End Time (24-hour format, HH:MM:SS)</label
                  >
                  <input
                    v-model="shiftForm.endTime"
                    type="time"
                    step="1"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                    style="font-family: monospace"
                  />
                </div>
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {{ isSubmitting ? 'Saving...' : showEditModal ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Department Management Modal -->
    <div
      v-if="showDepartmentModalFlag"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Manage Departments for {{ selectedShift?.name }}
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Add Department</label>
              <select
                v-model="selectedDepartmentId"
                class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
              >
                <option value="">Select a department</option>
                <option v-for="dept in availableDepartments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
              <button
                @click="addDepartmentToShift"
                :disabled="!selectedDepartmentId || isSubmitting"
                class="mt-2 bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                Add Department
              </button>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Current Departments</label
              >
              <div v-if="selectedShift?.departments.length === 0" class="text-sm text-gray-500">
                No departments assigned
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="dept in selectedShift?.departments"
                  :key="dept.id"
                  class="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <span class="text-sm">{{ dept.name }}</span>
                  <button
                    @click="removeDepartmentFromShift(dept.id)"
                    :disabled="isSubmitting"
                    class="text-red-600 hover:text-red-900 text-sm disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end mt-6">
            <button
              @click="closeDepartmentModal"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Shift Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeDeleteModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Delete Shift</h3>
            <button @click="closeDeleteModal" class="text-gray-400 hover:text-gray-600">
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

          <div class="text-center">
            <svg
              class="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Delete Shift</h3>
            <p class="mt-1 text-sm text-gray-500">
              Are you sure you want to delete the shift "{{ shiftToDelete?.name }}"? This action
              cannot be undone.
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="deleteError" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
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
                <h3 class="text-sm font-medium text-red-800">Error deleting shift</h3>
                <p class="mt-1 text-sm text-red-700">{{ deleteError }}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="closeDeleteModal"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              @click="confirmDeleteShift"
              :disabled="isDeleting"
              class="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              <span v-if="isDeleting">Deleting...</span>
              <span v-else>Delete Shift</span>
            </button>
          </div>
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
import type { Shift, Department } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const profile = computed(() => authStore.profile)

// State
const shifts = ref<Shift[]>([])
const departments = ref<Department[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDepartmentModalFlag = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)
const selectedShift = ref<Shift | null>(null)
const selectedDepartmentId = ref('')
const shiftToDelete = ref<Shift | null>(null)
const deleteError = ref<string | null>(null)
const isDeleting = ref(false)

// Form data
const shiftForm = ref({
  name: '',
  description: '',
  startTime: '',
  endTime: '',
  isDefault: false,
})

// Computed
const totalShifts = computed(() => shifts.value.length)
const totalPages = computed(() => Math.ceil(totalShifts.value / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalShifts.value))
const paginatedShifts = computed(() => {
  return shifts.value.slice(startIndex.value, endIndex.value)
})

const availableDepartments = computed(() => {
  if (!selectedShift.value) return []

  // Get all departments that are already assigned to any shift
  const allAssignedDeptIds = new Set()
  shifts.value.forEach((shift) => {
    shift.departments.forEach((dept) => {
      allAssignedDeptIds.add(dept.id)
    })
  })

  // Only show departments that are not assigned to any shift
  return departments.value.filter((dept) => !allAssignedDeptIds.has(dept.id))
})

// Methods
const fetchShifts = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await apiService.getShifts()
    shifts.value = data
  } catch (err: any) {
    console.error('Failed to fetch shifts:', err)
    error.value = err.message || 'Failed to fetch shifts'
  } finally {
    isLoading.value = false
  }
}

const fetchDepartments = async () => {
  try {
    const data = await apiService.getDepartments()
    departments.value = data
  } catch (err: any) {
    console.error('Failed to fetch departments:', err)
  }
}

const formatTime = (timeString: string): string => {
  return timeString.substring(0, 8) // Return HH:mm:ss format
}

const formatTimeForInput = (timeString: string): string => {
  // Ensure time is in HH:mm:ss format for input fields
  const time = timeString.includes('T') ? timeString.split('T')[1] : timeString
  return time.substring(0, 8) // Return HH:mm:ss format
}

const formatTimeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // Ensure 24-hour format with seconds
  if (value.includes('AM') || value.includes('PM')) {
    // Convert 12-hour to 24-hour format
    const [time, period] = value.split(' ')
    const [hours, minutes] = time.split(':')
    let hour24 = parseInt(hours)

    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0
    }

    value = `${hour24.toString().padStart(2, '0')}:${minutes}:00`
    target.value = value
  } else if (value && !value.includes(':')) {
    // If only HH:mm format, add seconds
    value = `${value}:00`
    target.value = value
  }
}

const ensure24HourFormat = (timeString: string): string => {
  // Convert any time format to 24-hour format with seconds
  if (!timeString) return timeString

  // If already in HH:mm:ss format, return as is
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
    return timeString
  }

  // If in HH:mm format, add seconds
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return `${timeString}:00`
  }

  // If in 12-hour format with AM/PM, convert to 24-hour with seconds
  if (timeString.includes('AM') || timeString.includes('PM')) {
    const [time, period] = timeString.split(' ')
    const [hours, minutes] = time.split(':')
    let hour24 = parseInt(hours)

    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0
    }

    return `${hour24.toString().padStart(2, '0')}:${minutes}:00`
  }

  return timeString
}

const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(`2000-01-01T${startTime}`)
  const end = new Date(`2000-01-01T${endTime}`)
  const diffMs = end.getTime() - start.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${diffHours}h ${diffMinutes}m`
}

const editShift = (shift: Shift) => {
  selectedShift.value = shift
  shiftForm.value = {
    name: shift.name,
    description: shift.description || '',
    startTime: formatTimeForInput(shift.startTime),
    endTime: formatTimeForInput(shift.endTime),
    isDefault: shift.isDefault,
  }
  showEditModal.value = true
}

const createShiftData = async () => {
  try {
    isSubmitting.value = true

    // Ensure times are in 24-hour format
    const shiftData = {
      ...shiftForm.value,
      startTime: ensure24HourFormat(shiftForm.value.startTime),
      endTime: ensure24HourFormat(shiftForm.value.endTime),
    }

    await apiService.createShift(shiftData)
    await fetchShifts()
    closeModal()
  } catch (err: any) {
    console.error('Failed to create shift:', err)
    error.value = err.message || 'Failed to create shift'
  } finally {
    isSubmitting.value = false
  }
}

const updateShiftData = async () => {
  if (!selectedShift.value) return
  try {
    isSubmitting.value = true

    // Ensure times are in 24-hour format
    const shiftData = {
      ...shiftForm.value,
      startTime: ensure24HourFormat(shiftForm.value.startTime),
      endTime: ensure24HourFormat(shiftForm.value.endTime),
    }

    await apiService.updateShift(selectedShift.value.id, shiftData)
    await fetchShifts()
    closeModal()
  } catch (err: any) {
    console.error('Failed to update shift:', err)
    error.value = err.message || 'Failed to update shift'
  } finally {
    isSubmitting.value = false
  }
}

const openDeleteModal = (shift: Shift) => {
  shiftToDelete.value = shift
  showDeleteModal.value = true
  deleteError.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  shiftToDelete.value = null
  deleteError.value = null
}

const confirmDeleteShift = async () => {
  if (!shiftToDelete.value) return
  try {
    isDeleting.value = true
    deleteError.value = null
    await apiService.deleteShift(shiftToDelete.value.id)
    await fetchShifts()
    closeDeleteModal()
  } catch (err: any) {
    console.error('Failed to delete shift:', err)
    deleteError.value = err.message || 'Failed to delete shift'
  } finally {
    isDeleting.value = false
  }
}

const showDepartmentModal = (shift: Shift) => {
  selectedShift.value = shift
  selectedDepartmentId.value = ''
  showDepartmentModalFlag.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedShift.value = null
  shiftForm.value = {
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    isDefault: false,
  }
}

const closeDepartmentModal = () => {
  showDepartmentModalFlag.value = false
  selectedShift.value = null
  selectedDepartmentId.value = ''
}

const addDepartmentToShift = async () => {
  if (!selectedShift.value || !selectedDepartmentId.value) return
  try {
    isSubmitting.value = true
    await apiService.tagDepartmentToShift(selectedShift.value.id, selectedDepartmentId.value)
    await fetchShifts()
    selectedShift.value = shifts.value.find((s) => s.id === selectedShift.value?.id) || null
    selectedDepartmentId.value = ''
  } catch (err: any) {
    console.error('Failed to add department to shift:', err)
    error.value = err.message || 'Failed to add department to shift'
  } finally {
    isSubmitting.value = false
  }
}

const removeDepartmentFromShift = async (departmentId: string) => {
  if (!selectedShift.value) return
  try {
    isSubmitting.value = true
    await apiService.untagDepartmentFromShift(selectedShift.value.id, departmentId)
    await fetchShifts()
    selectedShift.value = shifts.value.find((s) => s.id === selectedShift.value?.id) || null
  } catch (err: any) {
    console.error('Failed to remove department from shift:', err)
    error.value = err.message || 'Failed to remove department from shift'
  } finally {
    isSubmitting.value = false
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

onMounted(() => {
  fetchShifts()
  fetchDepartments()
})
</script>

<style scoped>
/* Additional custom styles can be added here */

/* Force 24-hour format for time inputs */
input[type='time']::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

/* Ensure time inputs display in 24-hour format */
input[type='time'] {
  direction: ltr;
}

/* Custom styling for time inputs to emphasize 24-hour format */
input[type='time']::before {
  content: '24h';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #6b7280;
  pointer-events: none;
}
</style>
