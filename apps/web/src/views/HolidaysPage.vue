<template>
  <PageLayout title="Holidays" subtitle="Manage branch holidays and non-working days">
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
          <span class="ml-2 text-gray-600">Loading holidays...</span>
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
            <h3 class="text-sm font-medium text-red-800">Error loading holidays</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchHolidays"
              class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Holidays Table -->
    <div v-else class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Holiday List ({{ totalHolidays }} total)
            </h3>
            <button
              @click="showCreateModal = true"
              class="bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Create Holiday
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
                    Holiday Name
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Paid
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="holiday in paginatedHolidays" :key="holiday.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div
                          class="h-10 w-10 rounded-full flex items-center justify-center"
                          :class="getHolidayTypeColor(holiday.type)"
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ holiday.name }}</div>
                        <div class="text-sm text-gray-500">
                          {{ holiday.notes || 'No notes' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getHolidayTypeBadgeColor(holiday.type),
                      ]"
                    >
                      {{ formatHolidayType(holiday.type) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ formatDate(holiday.startDate) }}
                    </div>
                    <div v-if="holiday.endDate" class="text-sm text-gray-500">
                      to {{ formatDate(holiday.endDate) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        holiday.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ holiday.isPaid ? 'Paid' : 'Unpaid' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        holiday.isUsedInPayroll
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ holiday.isUsedInPayroll ? 'Used in Payroll' : 'Not Used' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="editHoliday(holiday)"
                        class="text-palette-dark-blue hover:text-palette-medium-blue"
                      >
                        Edit
                      </button>
                      <button
                        @click="openDeleteModal(holiday)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="holidays.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No holidays found. Create one to get started.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
            <div class="flex items-center text-sm text-gray-700">
              <span>Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalHolidays }} results</span>
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

    <!-- Create/Edit Holiday Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showEditModal ? 'Edit Holiday' : 'Create New Holiday' }}
          </h3>
          <form @submit.prevent="showEditModal ? updateHolidayData() : createHolidayData()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  v-model="holidayForm.name"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  placeholder="e.g., New Year's Day"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Type *</label>
                <select
                  v-model="holidayForm.type"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                >
                  <option value="">Select a type</option>
                  <option value="REGULAR_HOLIDAY">Regular Holiday</option>
                  <option value="SPECIAL_NON_WORKING_HOLIDAY">Special Non-Working Holiday</option>
                  <option value="COMPANY_HOLIDAY">Company Holiday</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Start Date *</label>
                  <input
                    v-model="holidayForm.startDate"
                    type="date"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">End Date (optional)</label>
                  <input
                    v-model="holidayForm.endDate"
                    type="date"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
              </div>
              <div class="flex items-center">
                <input
                  v-model="holidayForm.isPaid"
                  type="checkbox"
                  id="isPaid"
                  class="h-4 w-4 text-palette-dark-blue focus:ring-palette-dark-blue border-gray-300 rounded"
                />
                <label for="isPaid" class="ml-2 block text-sm text-gray-900">
                  Paid Holiday
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  v-model="holidayForm.notes"
                  rows="3"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  placeholder="Additional notes about this holiday..."
                ></textarea>
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

    <!-- Delete Holiday Confirmation Modal -->
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
            <h3 class="text-lg font-medium text-gray-900">Delete Holiday</h3>
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
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Delete Holiday</h3>
            <p class="mt-1 text-sm text-gray-500">
              Are you sure you want to delete "{{ holidayToDelete?.name }}"? This action cannot be
              undone.
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
                <h3 class="text-sm font-medium text-red-800">Error deleting holiday</h3>
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
              @click="confirmDeleteHoliday"
              :disabled="isDeleting"
              class="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              <span v-if="isDeleting">Deleting...</span>
              <span v-else>Delete Holiday</span>
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
import PageLayout from '../components/PageLayout.vue'
import { apiService } from '../services/api'
import type { Holiday, HolidayType } from '../types'

const router = useRouter()

// State
const holidays = ref<Holiday[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)
const selectedHoliday = ref<Holiday | null>(null)
const holidayToDelete = ref<Holiday | null>(null)
const deleteError = ref<string | null>(null)
const isDeleting = ref(false)

// Form data
const holidayForm = ref({
  name: '',
  type: '' as HolidayType | '',
  startDate: '',
  endDate: '',
  isPaid: true,
  notes: '',
})

// Computed
const totalHolidays = computed(() => holidays.value.length)
const totalPages = computed(() => Math.ceil(totalHolidays.value / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalHolidays.value))
const paginatedHolidays = computed(() => {
  return holidays.value.slice(startIndex.value, endIndex.value)
})

// Methods
const fetchHolidays = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await apiService.getHolidays()
    holidays.value = data
  } catch (err: any) {
    console.error('Failed to fetch holidays:', err)
    error.value = err.message || 'Failed to fetch holidays'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatHolidayType = (type: HolidayType): string => {
  switch (type) {
    case 'REGULAR_HOLIDAY':
      return 'Regular Holiday'
    case 'SPECIAL_NON_WORKING_HOLIDAY':
      return 'Special Non-Working'
    case 'COMPANY_HOLIDAY':
      return 'Company Holiday'
    default:
      return type
  }
}

const getHolidayTypeColor = (type: HolidayType): string => {
  switch (type) {
    case 'REGULAR_HOLIDAY':
      return 'bg-red-500'
    case 'SPECIAL_NON_WORKING_HOLIDAY':
      return 'bg-orange-500'
    case 'COMPANY_HOLIDAY':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

const getHolidayTypeBadgeColor = (type: HolidayType): string => {
  switch (type) {
    case 'REGULAR_HOLIDAY':
      return 'bg-red-100 text-red-800'
    case 'SPECIAL_NON_WORKING_HOLIDAY':
      return 'bg-orange-100 text-orange-800'
    case 'COMPANY_HOLIDAY':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const editHoliday = (holiday: Holiday) => {
  selectedHoliday.value = holiday
  holidayForm.value = {
    name: holiday.name,
    type: holiday.type,
    startDate: holiday.startDate,
    endDate: holiday.endDate || '',
    isPaid: holiday.isPaid,
    notes: holiday.notes || '',
  }
  showEditModal.value = true
}

const createHolidayData = async () => {
  try {
    isSubmitting.value = true
    await apiService.createHoliday({
      name: holidayForm.value.name,
      type: holidayForm.value.type as HolidayType,
      startDate: holidayForm.value.startDate,
      endDate: holidayForm.value.endDate || undefined,
      isPaid: holidayForm.value.isPaid,
      notes: holidayForm.value.notes || undefined,
    })
    await fetchHolidays()
    closeModal()
  } catch (err: any) {
    console.error('Failed to create holiday:', err)
    error.value = err.message || 'Failed to create holiday'
  } finally {
    isSubmitting.value = false
  }
}

const updateHolidayData = async () => {
  if (!selectedHoliday.value) return
  try {
    isSubmitting.value = true
    await apiService.updateHoliday(selectedHoliday.value.id, {
      name: holidayForm.value.name,
      type: holidayForm.value.type as HolidayType,
      startDate: holidayForm.value.startDate,
      endDate: holidayForm.value.endDate || undefined,
      isPaid: holidayForm.value.isPaid,
      notes: holidayForm.value.notes || undefined,
    })
    await fetchHolidays()
    closeModal()
  } catch (err: any) {
    console.error('Failed to update holiday:', err)
    error.value = err.message || 'Failed to update holiday'
  } finally {
    isSubmitting.value = false
  }
}

const openDeleteModal = (holiday: Holiday) => {
  holidayToDelete.value = holiday
  showDeleteModal.value = true
  deleteError.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  holidayToDelete.value = null
  deleteError.value = null
}

const confirmDeleteHoliday = async () => {
  if (!holidayToDelete.value) return
  try {
    isDeleting.value = true
    deleteError.value = null
    await apiService.deleteHoliday(holidayToDelete.value.id)
    await fetchHolidays()
    closeDeleteModal()
  } catch (err: any) {
    console.error('Failed to delete holiday:', err)
    deleteError.value = err.message || 'Failed to delete holiday'
  } finally {
    isDeleting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedHoliday.value = null
  holidayForm.value = {
    name: '',
    type: '',
    startDate: '',
    endDate: '',
    isPaid: true,
    notes: '',
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
  fetchHolidays()
})
</script>
