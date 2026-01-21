<template>
  <PageLayout title="Employees" subtitle="Manage your branch employees">
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
          <span class="ml-2 text-gray-600">Loading employees...</span>
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
            <h3 class="text-sm font-medium text-red-800">Error loading employees</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchEmployees"
              class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Employees Table -->
    <div v-else class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow rounded-lg">
        <!-- Table Header -->
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Employee List ({{ totalEmployees }} total)
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
                    Employee
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Device ID
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
                    Console Access
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
                    Created
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
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
                            {{ getInitials(employee.profile.name) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ employee.profile.name || 'No Name' }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ employee.profile.email || 'No Email' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ employee.deviceEnrollId }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ employee.type.join(', ') }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        employee.hasConsole === 'ALLOWED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ employee.hasConsole === 'ALLOWED' ? 'Yes' : 'No' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ employee?.department?.name || '' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(employee.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="relative">
                      <button
                        @click="toggleMenu(employee.id)"
                        class="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-palette-medium-blue rounded-md"
                        aria-label="More options"
                      >
                        <svg
                          class="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                          />
                        </svg>
                      </button>

                      <!-- Dropdown Menu -->
                      <div
                        v-if="openMenuId === employee.id"
                        class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                        @click.stop
                      >
                        <div class="py-1" role="menu">
                          <button
                            v-if="!employee.type.includes('PAYROLL_MASTER')"
                            @click="handleAssignPayrollMaster(employee)"
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Assign as Payroll Master
                          </button>
                          <button
                            v-else
                            @click="handleRevokePayrollMaster(employee)"
                            class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Revoke Payroll Master Access
                          </button>
                          <button
                            v-if="employee.hasConsole !== 'ALLOWED'"
                            @click="handleAllowConsoleAccess(employee)"
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Allow Console Access
                          </button>
                          <button
                            v-else
                            @click="handleRevokeConsoleAccess(employee)"
                            class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Revoke Console Access
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-6">
            <div class="flex items-center text-sm text-gray-700">
              <span>
                Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalEmployees }} results
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

    <!-- Payroll Master Assignment Confirmation Modal -->
    <div
      v-if="showRoleModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeRoleModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Assign as Payroll Master</h3>
            <button @click="closeRoleModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div class="mb-6">
            <p class="text-sm text-gray-600">
              Are you sure you want to assign
              <strong>{{ selectedEmployee?.profile.name || 'this employee' }}</strong> as a Payroll
              Master?
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closeRoleModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              @click="assignPayrollMaster"
              :disabled="isAssigning"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                isAssigning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-palette-medium-blue hover:bg-palette-light-beige text-white',
              ]"
            >
              {{ isAssigning ? 'Assigning...' : 'Assign' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Revoke Payroll Master Access Confirmation Modal -->
    <div
      v-if="showRevokeModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeRevokeModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Revoke Payroll Master Access</h3>
            <button @click="closeRevokeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div class="mb-6">
            <p class="text-sm text-gray-600">
              Are you sure you want to revoke Payroll Master access for
              <strong>{{ selectedEmployee?.profile.name || 'this employee' }}</strong
              >?
            </p>
            <p class="text-xs text-red-600 mt-2">
              This action will remove their ability to access payroll management features.
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closeRevokeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              @click="revokePayrollMaster"
              :disabled="isRevoking"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                isRevoking
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white',
              ]"
            >
              {{ isRevoking ? 'Revoking...' : 'Revoke Access' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Allow Console Access Modal -->
    <div
      v-if="showConsoleAccessModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeConsoleAccessModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Allow Console Access</h3>
            <button @click="closeConsoleAccessModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <form @submit.prevent="submitConsoleAccess">
            <div class="mb-4">
              <label for="console-email" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="console-email"
                v-model="consoleAccessForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-palette-medium-blue focus:border-palette-medium-blue"
                placeholder="Enter email address"
              />
            </div>

            <div class="mb-4">
              <label for="console-password" class="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="console-password"
                v-model="consoleAccessForm.password"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-palette-medium-blue focus:border-palette-medium-blue"
                placeholder="Enter password"
              />
            </div>

            <div class="mb-6">
              <label
                for="console-confirm-password"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="console-confirm-password"
                v-model="consoleAccessForm.confirmPassword"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-palette-medium-blue focus:border-palette-medium-blue"
                :class="{
                  'border-red-300': passwordMismatch && consoleAccessForm.confirmPassword,
                }"
                placeholder="Confirm password"
              />
              <p
                v-if="passwordMismatch && consoleAccessForm.confirmPassword"
                class="mt-1 text-xs text-red-600"
              >
                Passwords do not match
              </p>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeConsoleAccessModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmittingConsoleAccess || passwordMismatch"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  isSubmittingConsoleAccess || passwordMismatch
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-palette-medium-blue hover:bg-palette-light-beige text-white',
                ]"
              >
                {{ isSubmittingConsoleAccess ? 'Submitting...' : 'Submit' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Revoke Console Access Confirmation Modal -->
    <div
      v-if="showRevokeConsoleAccessModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeRevokeConsoleAccessModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Revoke Console Access</h3>
            <button
              @click="closeRevokeConsoleAccessModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div class="mb-6">
            <p class="text-sm text-gray-600">
              Are you sure you want to revoke console access for
              <strong>{{ selectedEmployee?.profile.name || 'this employee' }}</strong
              >?
            </p>
            <p class="text-xs text-red-600 mt-2">
              This action will remove their ability to log in to the employee portal.
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closeRevokeConsoleAccessModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              @click="revokeConsoleAccess"
              :disabled="isRevokingConsoleAccess"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                isRevokingConsoleAccess
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white',
              ]"
            >
              {{ isRevokingConsoleAccess ? 'Revoking...' : 'Revoke Access' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api'
import type { Attendee } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const profile = computed(() => authStore.profile)

// State
const employees = ref<Attendee[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

// Modal state
const showRoleModal = ref(false)
const showRevokeModal = ref(false)
const showConsoleAccessModal = ref(false)
const showRevokeConsoleAccessModal = ref(false)
const selectedEmployee = ref<Attendee | null>(null)
const isAssigning = ref(false)
const isRevoking = ref(false)
const isSubmittingConsoleAccess = ref(false)
const isRevokingConsoleAccess = ref(false)

// Console access form state
const consoleAccessForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

// Menu state
const openMenuId = ref<string | null>(null)

// Computed
const totalEmployees = computed(() => employees.value.length)
const totalPages = computed(() => Math.ceil(totalEmployees.value / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalEmployees.value))
const paginatedEmployees = computed(() => {
  return employees.value.slice(startIndex.value, endIndex.value)
})

const passwordMismatch = computed(() => {
  return (
    consoleAccessForm.value.password !== '' &&
    consoleAccessForm.value.confirmPassword !== '' &&
    consoleAccessForm.value.password !== consoleAccessForm.value.confirmPassword
  )
})

// Methods
const fetchEmployees = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await apiService.getAttendees()
    employees.value = data
  } catch (err: any) {
    console.error('Failed to fetch employees:', err)
    error.value = err.message || 'Failed to fetch employees'
  } finally {
    isLoading.value = false
  }
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
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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

// Modal methods
const openRoleModal = (employee: Attendee) => {
  // Don't open modal if employee already has PAYROLL_MASTER role
  if (employee.type.includes('PAYROLL_MASTER')) {
    return
  }
  selectedEmployee.value = employee
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  selectedEmployee.value = null
  isAssigning.value = false
}

const openRevokeModal = (employee: Attendee) => {
  selectedEmployee.value = employee
  showRevokeModal.value = true
}

const closeRevokeModal = () => {
  showRevokeModal.value = false
  selectedEmployee.value = null
  isRevoking.value = false
}

const assignPayrollMaster = async () => {
  if (!selectedEmployee.value) return

  try {
    isAssigning.value = true

    // Assign payroll_master role
    await apiService.assignUserRole(selectedEmployee.value.id, 'payroll_master')

    // Show success message (you could add a toast notification here)
    console.log('Payroll Master role assigned successfully')

    // Close modal and refresh data
    closeRoleModal()
    await fetchEmployees()
  } catch (err: any) {
    console.error('Failed to assign payroll master role:', err)
    error.value = err.message || 'Failed to assign payroll master role'
  } finally {
    isAssigning.value = false
  }
}

const revokePayrollMaster = async () => {
  if (!selectedEmployee.value) return

  try {
    isRevoking.value = true

    // Revoke payroll_master role
    await apiService.revokeUserRole(selectedEmployee.value.id, 'payroll_master')

    // Show success message (you could add a toast notification here)
    console.log('Payroll Master role revoked successfully')

    // Close modal and refresh data
    closeRevokeModal()
    await fetchEmployees()
  } catch (err: any) {
    console.error('Failed to revoke payroll master role:', err)
    error.value = err.message || 'Failed to revoke payroll master role'
  } finally {
    isRevoking.value = false
  }
}

// Menu methods
const toggleMenu = (employeeId: string) => {
  if (openMenuId.value === employeeId) {
    openMenuId.value = null
  } else {
    openMenuId.value = employeeId
  }
}

const closeMenu = () => {
  openMenuId.value = null
}

const handleAssignPayrollMaster = (employee: Attendee) => {
  closeMenu()
  openRoleModal(employee)
}

const handleRevokePayrollMaster = (employee: Attendee) => {
  closeMenu()
  openRevokeModal(employee)
}

const handleAllowConsoleAccess = (employee: Attendee) => {
  closeMenu()
  selectedEmployee.value = employee
  // Pre-fill email if available
  consoleAccessForm.value.email = employee.profile.email || ''
  consoleAccessForm.value.password = ''
  consoleAccessForm.value.confirmPassword = ''
  showConsoleAccessModal.value = true
}

const closeConsoleAccessModal = () => {
  showConsoleAccessModal.value = false
  selectedEmployee.value = null
  consoleAccessForm.value = {
    email: '',
    password: '',
    confirmPassword: '',
  }
  isSubmittingConsoleAccess.value = false
}

const submitConsoleAccess = async () => {
  if (!selectedEmployee.value || passwordMismatch.value) return

  try {
    isSubmittingConsoleAccess.value = true
    error.value = null

    await apiService.allowConsoleAccess(selectedEmployee.value.id, {
      email: consoleAccessForm.value.email,
      password: consoleAccessForm.value.password,
    })

    console.log('Console access granted successfully')
    closeConsoleAccessModal()
    // Optionally refresh employees list
    await fetchEmployees()
  } catch (err: any) {
    console.error('Failed to allow console access:', err)
    error.value = err.message || 'Failed to allow console access'
  } finally {
    isSubmittingConsoleAccess.value = false
  }
}

const handleRevokeConsoleAccess = (employee: Attendee) => {
  closeMenu()
  selectedEmployee.value = employee
  showRevokeConsoleAccessModal.value = true
}

const closeRevokeConsoleAccessModal = () => {
  showRevokeConsoleAccessModal.value = false
  selectedEmployee.value = null
  isRevokingConsoleAccess.value = false
}

const revokeConsoleAccess = async () => {
  if (!selectedEmployee.value) return

  try {
    isRevokingConsoleAccess.value = true
    error.value = null

    await apiService.revokeConsoleAccess(selectedEmployee.value.id)

    console.log('Console access revoked successfully')
    closeRevokeConsoleAccessModal()
    // Refresh employees list
    await fetchEmployees()
  } catch (err: any) {
    console.error('Failed to revoke console access:', err)
    error.value = err.message || 'Failed to revoke console access'
  } finally {
    isRevokingConsoleAccess.value = false
  }
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    closeMenu()
  }
}

onMounted(() => {
  fetchEmployees()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>
