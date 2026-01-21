<template>
  <PageLayout
    title="Daily Attendance Logs"
    subtitle="View daily attendance records for your branch"
  >
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
          <span class="ml-2 text-gray-600">Loading daily attendance logs...</span>
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
            <h3 class="text-sm font-medium text-red-800">Error loading daily attendance logs</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="() => fetchDailyLogs()"
              class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Logs Table -->
    <div v-else class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow rounded-lg">
        <!-- Table Header -->
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Daily Attendance Logs ({{ totalEmployees }} employees, {{ totalDays }} days)
            </h3>
            <button
              @click="exportToCSV"
              :disabled="dailyLogs.length === 0"
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
              <span>Export Daily Logs</span>
            </button>
          </div>

          <!-- Filters Section -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Filter Daily Attendance Logs</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Branch Filter (for PAYROLL_MASTER users only) -->
              <div v-if="isPayrollMaster">
                <label for="branch-filter" class="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <select
                  id="branch-filter"
                  v-model="selectedBranchId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                >
                  <option value="">All Branches</option>
                  <option v-for="branch in branchOptions" :key="branch.id" :value="branch.id">
                    {{ branch.name }}
                  </option>
                </select>
              </div>

              <!-- Employee Filter -->
              <div>
                <label for="employee-filter" class="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  id="employee-filter"
                  v-model="selectedEmployeeId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                >
                  <option value="">All Employees</option>
                  <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                    {{ employee.profile?.name || employee.profile?.email || 'Unknown Employee' }}
                  </option>
                </select>
              </div>

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

          <!-- Debug Info (temporary)
          <div class="mb-4 p-4 bg-blue-50 rounded-lg">
            <h4 class="text-sm font-medium text-blue-800 mb-2">Debug Info:</h4>
            <p class="text-xs text-blue-700">Total dates: {{ sortedDates.length }}</p>
            <p class="text-xs text-blue-700">
              Date range: {{ sortedDates[0] }} to {{ sortedDates[sortedDates.length - 1] }}
            </p>
            <p class="text-xs text-blue-700">Total employees: {{ uniqueEmployees.length }}</p>
            <p class="text-xs text-blue-700">Matrix entries: {{ attendanceMatrix.size }}</p>
          </div> -->

          <!-- Table -->
          <div class="relative">
            <!-- Sticky scroll indicator -->
            <div class="sticky top-0 z-10 bg-white border-b border-gray-200 py-2 mb-2">
              <div class="text-xs text-gray-500">
                <span class="inline-flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16l-4-4m0 0l4-4m-4 4h18"
                    ></path>
                  </svg>
                  Scroll horizontally to see all dates
                </span>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300"
                    >
                      Department
                    </th>
                    <th
                      v-for="date in sortedDates"
                      :key="date"
                      scope="col"
                      class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300"
                    >
                      <div class="flex flex-col">
                        <span class="font-semibold">{{ formatDateHeader(date) }}</span>
                        <span class="text-xs text-gray-400 mt-1">{{ getDayName(date) }}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    v-for="(employee, index) in paginatedEmployees"
                    :key="employee.enrollId"
                    :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                  >
                    <td
                      class="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-300"
                    >
                      {{ employee.enrollId }}
                    </td>
                    <td
                      class="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-300"
                    >
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-6 w-6 mr-2">
                          <div
                            class="h-6 w-6 rounded-full bg-palette-dark-blue flex items-center justify-center"
                          >
                            <span class="text-xs font-medium text-gray-200">
                              {{ getInitials(employee.name) }}
                            </span>
                          </div>
                        </div>
                        {{ employee.name }}
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                      {{ employee.departmentName }}
                    </td>
                    <td
                      v-for="date in sortedDates"
                      :key="`${employee.enrollId}-${date}`"
                      class="px-4 py-3 text-center text-sm border-r border-gray-300"
                    >
                      <template v-if="attendanceMatrix.get(`${employee.enrollId}-${date}`)">
                        <div
                          :class="[
                            'font-semibold',
                            attendanceMatrix.get(`${employee.enrollId}-${date}`)?.status ===
                            'NO_WORK'
                              ? 'text-red-600'
                              : 'text-green-600',
                          ]"
                        >
                          {{
                            attendanceMatrix.get(`${employee.enrollId}-${date}`)?.status ===
                            'NO_WORK'
                              ? '✗'
                              : '✓'
                          }}
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                          <div>
                            {{ attendanceMatrix.get(`${employee.enrollId}-${date}`)?.startTime }} -
                            {{ attendanceMatrix.get(`${employee.enrollId}-${date}`)?.endTime }}
                          </div>
                          <div class="font-bold text-palette-dark-blue">
                            Duration:
                            {{ attendanceMatrix.get(`${employee.enrollId}-${date}`)?.duration }}
                          </div>
                        </div>
                      </template>
                      <div v-else class="text-gray-300">-</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-6">
            <div class="flex items-center text-sm text-gray-700">
              <span>
                Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalEmployees }} employees
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
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api'
import type { Attendee as ApiAttendee, DailyLog, DailyAttendee } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const branch = computed(() => authStore.branch)
const isPayrollMaster = computed(() => authStore.userType.includes('PAYROLL_MASTER'))

// State
const dailyLogs = ref<DailyLog[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

// Filter state
const employees = ref<ApiAttendee[]>([])
const selectedEmployeeId = ref<string>('')
const startDate = ref<string>('')
const endDate = ref<string>('')
const selectedBranchId = ref<string>('')

// Branch options from store
const branchOptions = computed(() => authStore.getBranchOptions)

// Computed
const totalDays = computed(() => dailyLogs.value.length)
const totalEmployees = computed(() => uniqueEmployees.value.length)
const totalPages = computed(() => Math.ceil(totalEmployees.value / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalEmployees.value))
const paginatedEmployees = computed(() => {
  return uniqueEmployees.value.slice(startIndex.value, endIndex.value)
})

// New computed properties for matrix table
const sortedDates = computed(() => {
  return dailyLogs.value.map((log) => log.date).sort()
})

const uniqueEmployees = computed(() => {
  const employeeMap = new Map()

  dailyLogs.value.forEach((log) => {
    log.attendees.forEach((attendee: DailyAttendee) => {
      if (!employeeMap.has(attendee.enrollId)) {
        employeeMap.set(attendee.enrollId, {
          enrollId: attendee.enrollId,
          name: attendee.name,
          departmentName: attendee.departmentName,
        })
      }
    })
  })

  return Array.from(employeeMap.values()).sort((a, b) => a.enrollId - b.enrollId)
})

// Pre-computed attendance matrix for better performance
const attendanceMatrix = computed(() => {
  const matrix = new Map()

  dailyLogs.value.forEach((log) => {
    log.attendees.forEach((attendee: DailyAttendee) => {
      const key = `${attendee.enrollId}-${log.date}`
      matrix.set(key, attendee)
    })
  })

  return matrix
})

// Helper function to get default date range (15 days before today)
const getDefaultDateRange = () => {
  const today = new Date()
  const endDate = new Date(today)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 14) // 15 days including today

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

// Methods
const fetchDailyLogs = async (queryParams?: {
  attendeeId?: string
  startDate?: string
  endDate?: string
  branchId?: string
}) => {
  try {
    isLoading.value = true
    error.value = null

    // Determine which branch ID to use
    let branchId = branch.value?.id
    if (isPayrollMaster.value && queryParams?.branchId) {
      branchId = queryParams.branchId
    }

    if (!branchId) {
      throw new Error('Branch information not available')
    }

    // If no query params provided, use default date range
    let finalQueryParams = queryParams
    if (!queryParams || (!queryParams.startDate && !queryParams.endDate)) {
      const defaultRange = getDefaultDateRange()
      finalQueryParams = {
        ...queryParams,
        startDate: defaultRange.startDate,
        endDate: defaultRange.endDate,
      }
    }

    const data = await apiService.getDailyAttendanceLogs(branchId, finalQueryParams)

    dailyLogs.value = data

    if (data && data.length > 0) {
      isLoading.value = false
    }
  } catch (err: any) {
    console.error('Failed to fetch daily logs:', err)
    error.value = err.message || 'Failed to fetch daily attendance logs'
  } finally {
    isLoading.value = false
  }
}

const fetchEmployees = async () => {
  try {
    const data = await apiService.getAttendees()
    employees.value = data
  } catch (err: any) {
    console.error('Failed to fetch employees:', err)
    // Don't show error for employees fetch as it's not critical
  }
}

const applyFilters = async () => {
  try {
    // Validate date range - if one date is provided, both should be
    if ((startDate.value && !endDate.value) || (!startDate.value && endDate.value)) {
      error.value = 'Please select both start and end dates for date filtering'
      return
    }

    isLoading.value = true
    error.value = null
    currentPage.value = 1 // Reset to first page when filtering

    if (!branch.value?.id) {
      throw new Error('Branch information not available')
    }

    const queryParams: {
      attendeeId?: string
      startDate?: string
      endDate?: string
      branchId?: string
    } = {}

    if (selectedEmployeeId.value) {
      queryParams.attendeeId = selectedEmployeeId.value
    }
    if (startDate.value && endDate.value) {
      queryParams.startDate = startDate.value
      queryParams.endDate = endDate.value
    }
    if (selectedBranchId.value) {
      queryParams.branchId = selectedBranchId.value
    }

    await fetchDailyLogs(queryParams)
  } catch (err: any) {
    console.error('Failed to fetch filtered daily logs:', err)
    error.value = err.message || 'Failed to fetch filtered daily attendance logs'
  } finally {
    isLoading.value = false
  }
}

const clearFilters = async () => {
  selectedEmployeeId.value = ''
  startDate.value = ''
  endDate.value = ''
  selectedBranchId.value = ''
  await fetchDailyLogs()
}

const getInitials = (name: string | null): string => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateString: string): string => {
  // Display the raw database date without timezone conversion
  const date = new Date(dateString)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const monthName = monthNames[date.getUTCMonth()]

  return `${monthName} ${day}, ${year}`
}

const formatDateHeader = (dateString: string): string => {
  // Display the raw database date without timezone conversion
  const date = new Date(dateString)
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`
}

const getDayName = (dateString: string): string => {
  // Display the raw database date without timezone conversion
  const date = new Date(dateString)
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  return dayNames[date.getUTCDay()]
}

const getEmployeeAttendanceForDate = (enrollId: number, date: string) => {
  const log = dailyLogs.value.find((log) => log.date === date)
  if (!log) return null

  return log.attendees.find((attendee: DailyAttendee) => attendee.enrollId === enrollId)
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

const exportToCSV = () => {
  try {
    if (dailyLogs.value.length === 0) {
      error.value = 'No data to export'
      return
    }

    // Create CSV content
    let csvContent = 'Daily Attendance Logs Report\n'
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`

    // Header row
    csvContent += 'ID,Name,Department'
    sortedDates.value.forEach((date) => {
      csvContent += `,${formatDateHeader(date)} (${getDayName(date)})`
    })
    csvContent += '\n'

    // Data rows
    uniqueEmployees.value.forEach((employee) => {
      csvContent += `${employee.enrollId},"${employee.name}","${employee.departmentName}"`

      sortedDates.value.forEach((date) => {
        const attendance = attendanceMatrix.value.get(`${employee.enrollId}-${date}`)
        if (attendance) {
          csvContent += `,"${attendance.startTime} - ${attendance.endTime} (${attendance.duration})"`
        } else {
          csvContent += `,`
        }
      })

      csvContent += '\n'
    })

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `daily_attendance_logs_${new Date().toISOString().split('T')[0]}.csv`,
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err: any) {
    console.error('Error exporting CSV:', err)
    error.value = 'Failed to export CSV report'
  }
}

onMounted(async () => {
  // Set default date range in filter inputs
  const defaultRange = getDefaultDateRange()
  startDate.value = defaultRange.startDate
  endDate.value = defaultRange.endDate

  // Fetch branches for PAYROLL_MASTER users
  if (isPayrollMaster.value) {
    try {
      await authStore.fetchAllBranches()
    } catch (error) {
      console.error('Failed to fetch branches:', error)
    }
  }

  fetchDailyLogs()
  fetchEmployees()
})
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>
