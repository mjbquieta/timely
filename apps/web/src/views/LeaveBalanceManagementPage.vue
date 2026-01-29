<template>
  <PageLayout title="Leave Balance Management" subtitle="Manage employee leave allowances">
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
          <span class="ml-2 text-gray-600">Loading leave balances...</span>
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
            <h3 class="text-sm font-medium text-red-800">Error loading leave balances</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchData"
              class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="px-4 py-6 sm:px-0 space-y-6">
      <!-- Year Selector and Summary -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h2 class="text-lg font-medium text-gray-900">Leave Balances for {{ selectedYear }}</h2>
          <select
            v-model="selectedYear"
            @change="fetchData"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
          >
            <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        <div class="text-sm text-gray-600">
          {{ employees.length }} employees | {{ balances.length }} leave records
        </div>
      </div>

      <!-- Employee List with Leave Balances -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Employee Leave Balances</h3>
            <div class="flex items-center space-x-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search employee..."
                class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
              />
            </div>
          </div>

          <!-- Employees Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th
                    v-for="leaveType in leaveTypes"
                    :key="leaveType"
                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ leaveType }}
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="employee in paginatedEmployees" :key="employee.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div
                          class="h-10 w-10 rounded-full bg-palette-dark-blue flex items-center justify-center"
                        >
                          <span class="text-sm font-medium text-gray-200">
                            {{ getInitials(employee.profile?.name) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ employee.profile?.name || 'No Name' }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ employee.profile?.email || 'No Email' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    v-for="leaveType in leaveTypes"
                    :key="leaveType"
                    class="px-4 py-4 whitespace-nowrap text-center"
                  >
                    <div v-if="getEmployeeBalance(employee.id, leaveType)" class="text-sm">
                      <div class="font-medium text-gray-900">
                        {{ getEmployeeBalance(employee.id, leaveType)?.totalAllowance || 0 }}
                      </div>
                      <div class="text-xs text-gray-500">
                        <span class="text-red-500">{{ getEmployeeBalance(employee.id, leaveType)?.usedDays || 0 }}</span>
                        /
                        <span class="text-yellow-600">{{ getEmployeeBalance(employee.id, leaveType)?.pendingDays || 0 }}</span>
                      </div>
                    </div>
                    <div v-else class="text-sm text-gray-400">-</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center space-x-2">
                      <button
                        v-if="!hasAnyBalance(employee.id)"
                        @click="openInitializeModal(employee)"
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Initialize
                      </button>
                      <button
                        v-else
                        @click="openEditModal(employee)"
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-palette-medium-blue hover:bg-palette-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-palette-medium-blue"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="paginatedEmployees.length === 0">
                  <td :colspan="leaveTypes.length + 2" class="px-6 py-8 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Legend -->
          <div class="mt-4 flex items-center space-x-6 text-xs text-gray-500">
            <span>Legend:</span>
            <span class="flex items-center">
              <span class="font-medium text-gray-900 mr-1">Total</span> = Total Allowance
            </span>
            <span class="flex items-center">
              <span class="text-red-500 mr-1">Used</span> / <span class="text-yellow-600 ml-1">Pending</span>
            </span>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-6">
            <div class="flex items-center text-sm text-gray-700">
              <span>
                Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredEmployees.length }} employees
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
              <span class="text-sm text-gray-700"> Page {{ currentPage }} of {{ totalPages }} </span>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages || totalPages === 0"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md',
                  currentPage === totalPages || totalPages === 0
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

    <!-- Initialize Leave Balance Modal -->
    <div
      v-if="showInitializeModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeInitializeModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Initialize Leave Balance</h3>
            <button @click="closeInitializeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-600">
              Initialize leave balances for
              <strong>{{ selectedEmployee?.profile?.name || 'this employee' }}</strong>
              for year {{ selectedYear }}.
            </p>
            <p class="text-xs text-gray-500 mt-2">
              This will create default leave allowances (VL: 15, SL: 15, EL: 3, ML: 105, PL: 7, LWOP: 0).
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closeInitializeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              @click="initializeLeaveBalances"
              :disabled="isInitializing"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                isInitializing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white',
              ]"
            >
              {{ isInitializing ? 'Initializing...' : 'Initialize' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Leave Balance Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeEditModal"
    >
      <div
        class="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Edit Leave Balance - {{ selectedEmployee?.profile?.name }}
            </h3>
            <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-4">
              Adjust leave allowances for <strong>{{ selectedYear }}</strong>.
            </p>

            <div class="space-y-4">
              <div
                v-for="leaveType in leaveTypes"
                :key="leaveType"
                class="flex items-center justify-between py-2 border-b border-gray-100"
              >
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
                    :class="getLeaveTypeColor(leaveType)"
                  >
                    <span class="text-white text-xs font-bold">{{ leaveType }}</span>
                  </div>
                  <span class="ml-3 text-sm font-medium text-gray-700">
                    {{ LEAVE_TYPE_LABELS[leaveType] }}
                  </span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="text-xs text-gray-500">
                    Used: {{ getEmployeeBalance(selectedEmployee?.id, leaveType)?.usedDays || 0 }} |
                    Pending: {{ getEmployeeBalance(selectedEmployee?.id, leaveType)?.pendingDays || 0 }}
                  </div>
                  <input
                    v-model.number="editForm[leaveType]"
                    type="number"
                    min="0"
                    step="0.5"
                    class="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="closeEditModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              @click="saveLeaveBalances"
              :disabled="isSaving"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                isSaving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-palette-medium-blue hover:bg-palette-dark-blue text-white',
              ]"
            >
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '../components/PageLayout.vue'
import { apiService } from '../services/api'
import type { Attendee, LeaveBalance, LeaveType } from '../types'
import { LEAVE_TYPE_LABELS } from '../types'

const router = useRouter()

// Leave types in order
const leaveTypes: LeaveType[] = ['VL', 'SL', 'EL', 'ML', 'PL', 'LWOP']

// State
const employees = ref<Attendee[]>([])
const balances = ref<LeaveBalance[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedYear = ref(new Date().getFullYear())
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// Modal state
const showInitializeModal = ref(false)
const showEditModal = ref(false)
const selectedEmployee = ref<Attendee | null>(null)
const isInitializing = ref(false)
const isSaving = ref(false)
const editForm = reactive<Record<LeaveType, number>>({
  VL: 0,
  SL: 0,
  EL: 0,
  ML: 0,
  PL: 0,
  LWOP: 0,
})

// Computed
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 1, currentYear, currentYear + 1]
})

const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employees.value
  const query = searchQuery.value.toLowerCase()
  return employees.value.filter(
    (emp) =>
      emp.profile?.name?.toLowerCase().includes(query) ||
      emp.profile?.email?.toLowerCase().includes(query)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredEmployees.value.length / itemsPerPage)))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredEmployees.value.length))
const paginatedEmployees = computed(() => {
  return filteredEmployees.value.slice(startIndex.value, endIndex.value)
})

// Group balances by user for easy lookup
const balancesByUser = computed(() => {
  const map = new Map<string, Map<LeaveType, LeaveBalance>>()
  for (const balance of balances.value) {
    if (!map.has(balance.userId)) {
      map.set(balance.userId, new Map())
    }
    map.get(balance.userId)!.set(balance.leaveType, balance)
  }
  return map
})

// Methods
const fetchData = async () => {
  try {
    isLoading.value = true
    error.value = null
    const [employeesData, balancesData] = await Promise.all([
      apiService.getAttendees(),
      apiService.getBranchLeaveBalances(selectedYear.value),
    ])
    employees.value = employeesData
    balances.value = balancesData
    currentPage.value = 1
  } catch (err: any) {
    console.error('Failed to fetch data:', err)
    error.value = err.message || 'Failed to fetch data'
  } finally {
    isLoading.value = false
  }
}

const getInitials = (name: string | null | undefined): string => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getEmployeeBalance = (userId: string | undefined, leaveType: LeaveType): LeaveBalance | undefined => {
  if (!userId) return undefined
  return balancesByUser.value.get(userId)?.get(leaveType)
}

const hasAnyBalance = (userId: string): boolean => {
  return balancesByUser.value.has(userId)
}

const getLeaveTypeColor = (leaveType: LeaveType): string => {
  switch (leaveType) {
    case 'VL':
      return 'bg-blue-500'
    case 'SL':
      return 'bg-red-500'
    case 'EL':
      return 'bg-orange-500'
    case 'ML':
      return 'bg-pink-500'
    case 'PL':
      return 'bg-purple-500'
    case 'LWOP':
      return 'bg-gray-500'
    default:
      return 'bg-gray-500'
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

// Initialize Modal
const openInitializeModal = (employee: Attendee) => {
  selectedEmployee.value = employee
  showInitializeModal.value = true
}

const closeInitializeModal = () => {
  showInitializeModal.value = false
  selectedEmployee.value = null
  isInitializing.value = false
}

const initializeLeaveBalances = async () => {
  if (!selectedEmployee.value) return

  try {
    isInitializing.value = true
    await apiService.initializeUserLeaveBalances(selectedEmployee.value.id, selectedYear.value)
    closeInitializeModal()
    await fetchData()
  } catch (err: any) {
    console.error('Failed to initialize leave balances:', err)
    error.value = err.message || 'Failed to initialize leave balances'
  } finally {
    isInitializing.value = false
  }
}

// Edit Modal
const openEditModal = (employee: Attendee) => {
  selectedEmployee.value = employee
  // Populate form with current values
  for (const leaveType of leaveTypes) {
    const balance = getEmployeeBalance(employee.id, leaveType)
    editForm[leaveType] = balance?.totalAllowance || 0
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedEmployee.value = null
  isSaving.value = false
}

const saveLeaveBalances = async () => {
  if (!selectedEmployee.value) return

  try {
    isSaving.value = true
    const updatePromises: Promise<LeaveBalance>[] = []

    for (const leaveType of leaveTypes) {
      const balance = getEmployeeBalance(selectedEmployee.value.id, leaveType)
      if (balance && balance.totalAllowance !== editForm[leaveType]) {
        updatePromises.push(
          apiService.updateLeaveBalance(balance.id, { totalAllowance: editForm[leaveType] })
        )
      } else if (!balance && editForm[leaveType] > 0) {
        // Create new balance if it doesn't exist but user entered a value
        updatePromises.push(
          apiService.createLeaveBalance({
            userId: selectedEmployee.value.id,
            leaveType,
            year: selectedYear.value,
            totalAllowance: editForm[leaveType],
          })
        )
      }
    }

    await Promise.all(updatePromises)
    closeEditModal()
    await fetchData()
  } catch (err: any) {
    console.error('Failed to save leave balances:', err)
    error.value = err.message || 'Failed to save leave balances'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
