<template>
  <PageLayout title="My Attendance Logs" subtitle="View your attendance records">
    <template #header-actions>
      <button
        @click="router.push('/employee/dashboard')"
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
          <span class="ml-2 text-gray-600">Loading attendance records...</span>
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
            <h3 class="text-sm font-medium text-red-800">Error loading attendance records</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchAttendances"
              class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Table -->
    <div v-else class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow rounded-lg">
        <!-- Table Header -->
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Attendance Records ({{ totalAttendances }} total)
            </h3>
            <button
              @click="exportToCSV"
              :disabled="attendances.length === 0"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <span>Export CSV</span>
            </button>
          </div>

          <!-- Filters Section -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Filter Attendance Records</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Start Date Filter -->
              <div>
                <label for="start-date" class="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  id="start-date"
                  v-model="startDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                />
              </div>

              <!-- End Date Filter -->
              <div>
                <label for="end-date" class="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  id="end-date"
                  v-model="endDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                />
              </div>

              <!-- Action Buttons -->
              <div class="flex items-end space-x-2">
                <button
                  @click="applyFilters"
                  class="flex-1 bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  @click="clearFilters"
                  class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="attendances.length === 0"
            class="text-center py-12"
          >
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
            <p class="mt-1 text-sm text-gray-500">No attendance records found for the selected period.</p>
          </div>

          <!-- Table -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date & Time
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
                    Department
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Shift
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
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="attendance in paginatedAttendances" :key="attendance.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ formatDate(attendance.time) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ formatTime(attendance.time) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        attendance.isTimeIn
                          ? 'bg-palette-dark-blue text-white'
                          : 'bg-palette-medium-blue text-white',
                      ]"
                    >
                      {{ attendance.isTimeIn ? 'Time In' : 'Time Out' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ attendance.departmentName || 'Branch Default' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="attendance.startTime && attendance.endTime" class="flex items-center space-x-2">
                      <span class="text-xs font-semibold text-palette-dark-blue bg-blue-50 px-2 py-1 rounded">
                        {{ formatShiftTime(attendance.startTime) }}
                      </span>
                      <span class="text-xs text-gray-400">to</span>
                      <span class="text-xs font-semibold text-palette-dark-blue bg-blue-50 px-2 py-1 rounded">
                        {{ formatShiftTime(attendance.endTime) }}
                      </span>
                    </div>
                    <span v-else class="text-sm text-gray-500">-</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getStatusColor(attendance.status),
                      ]"
                    >
                      {{ attendance.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ attendance.remarks || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="attendances.length > 0" class="flex items-center justify-between mt-6">
            <div class="flex items-center text-sm text-gray-700">
              <span>
                Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalAttendances }} results
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
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '../services/api'
import type { Attendance } from '../types'

const router = useRouter()

// State
const attendances = ref<Attendance[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

// Filter state
const startDate = ref<string>('')
const endDate = ref<string>('')

// Computed
const totalAttendances = computed(() => attendances.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalAttendances.value / itemsPerPage)))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalAttendances.value))
const paginatedAttendances = computed(() => {
  return attendances.value.slice(startIndex.value, endIndex.value)
})

// Methods
const fetchAttendances = async () => {
  try {
    isLoading.value = true
    error.value = null

    const data = await apiService.getMyAttendanceLogs()
    attendances.value = data
  } catch (err: any) {
    console.error('Failed to fetch attendances:', err)
    error.value = err.message || 'Failed to fetch attendance records'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  const seconds = date.getUTCSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const formatShiftTime = (timeString: string): string => {
  const time = timeString.includes('T') ? timeString.split('T')[1] : timeString
  return time.substring(0, 5)
}

const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'REGULAR':
      return 'bg-palette-dark-blue text-white'
    case 'LATE':
      return 'bg-palette-medium-blue text-white'
    case 'ABSENT':
      return 'bg-palette-light-beige text-white'
    case 'HALF_DAY':
      return 'bg-palette-medium-blue text-white'
    default:
      return 'bg-gray-100 text-gray-800'
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

// Filter methods
const applyFilters = async () => {
  try {
    if ((startDate.value && !endDate.value) || (!startDate.value && endDate.value)) {
      error.value = 'Please select both start and end dates for date filtering'
      return
    }

    isLoading.value = true
    error.value = null
    currentPage.value = 1

    const queryParams: {
      startDate?: string
      endDate?: string
    } = {}

    if (startDate.value && endDate.value) {
      queryParams.startDate = startDate.value
      queryParams.endDate = endDate.value
    }

    const data = await apiService.getMyAttendanceLogs(queryParams)
    attendances.value = data
  } catch (err: any) {
    console.error('Failed to fetch filtered attendances:', err)
    error.value = err.message || 'Failed to fetch filtered attendance records'
  } finally {
    isLoading.value = false
  }
}

const clearFilters = async () => {
  startDate.value = ''
  endDate.value = ''
  await fetchAttendances()
}

const exportToCSV = () => {
  try {
    if (attendances.value.length === 0) return

    // Create CSV content
    let csvContent = 'Date,Time,Type,Department,Shift Start,Shift End,Status,Remarks\n'

    attendances.value.forEach((attendance) => {
      const date = formatDate(attendance.time)
      const time = formatTime(attendance.time)
      const type = attendance.isTimeIn ? 'Time In' : 'Time Out'
      const department = attendance.departmentName || 'Branch Default'
      const shiftStart = attendance.startTime ? formatShiftTime(attendance.startTime) : ''
      const shiftEnd = attendance.endTime ? formatShiftTime(attendance.endTime) : ''
      const status = attendance.status
      const remarks = attendance.remarks || ''

      csvContent += `"${date}","${time}","${type}","${department}","${shiftStart}","${shiftEnd}","${status}","${remarks}"\n`
    })

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `my_attendance_logs_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err: any) {
    console.error('Error exporting CSV:', err)
    error.value = 'Failed to export CSV report'
  }
}

onMounted(() => {
  fetchAttendances()
})
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>
