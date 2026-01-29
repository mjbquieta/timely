<template>
  <PageLayout title="My Time Requests" subtitle="File and manage your leave, overtime, and undertime requests">
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
          <span class="ml-2 text-gray-600">Loading requests...</span>
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
            <h3 class="text-sm font-medium text-red-800">Error loading requests</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchRequests"
              class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <!-- Tabs and Actions -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                @click="activeTab = tab.value"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  activeTab === tab.value
                    ? 'bg-white text-palette-dark-blue shadow'
                    : 'text-gray-600 hover:text-gray-900',
                ]"
              >
                {{ tab.label }}
              </button>
            </div>
            <div class="flex space-x-2">
              <button
                @click="openLeaveModal"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                File Leave
              </button>
              <button
                @click="openOvertimeModal"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                File OT
              </button>
              <button
                @click="openUndertimeModal"
                class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                File UT
              </button>
            </div>
          </div>

          <!-- Requests Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filed On
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="request in filteredRequests" :key="request.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getTypeBadgeClass(request.type)">
                      {{ formatRequestType(request) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="request.type === 'LEAVE'" class="text-sm">
                      <div class="font-medium text-gray-900">
                        {{ formatDate(request.startDate!) }} - {{ formatDate(request.endDate!) }}
                      </div>
                      <div class="text-gray-500">
                        {{ HALF_DAY_TYPE_LABELS[request.halfDayType || 'NONE'] }}
                      </div>
                    </div>
                    <div v-else-if="request.type === 'OVERTIME'" class="text-sm">
                      <div class="font-medium text-gray-900">{{ formatDate(request.otDate!) }}</div>
                      <div class="text-gray-500">
                        {{ request.otStartTime }} - {{ request.otEndTime }}
                        ({{ formatMinutes(request.otTotalMinutes!) }})
                      </div>
                    </div>
                    <div v-else class="text-sm">
                      <div class="font-medium text-gray-900">{{ formatDate(request.utDate!) }}</div>
                      <div class="text-gray-500">
                        {{ request.utStartTime }} - {{ request.utEndTime }}
                        ({{ formatMinutes(request.utTotalMinutes!) }})
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 max-w-xs truncate">{{ request.reason }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusBadgeClass(request.status)">
                      {{ TIME_REQUEST_STATUS_LABELS[request.status] }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDateTime(request.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      v-if="request.status === 'PENDING'"
                      @click="cancelRequest(request)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Cancel
                    </button>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                </tr>
                <tr v-if="filteredRequests.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No {{ activeTab === 'all' ? '' : activeTab.toLowerCase() + ' ' }}requests found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Leave Request Modal -->
    <div
      v-if="showLeaveModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">File Leave Request</h3>
          <form @submit.prevent="submitLeaveRequest">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Leave Type *</label>
                <select
                  v-model="leaveForm.leaveType"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                >
                  <option value="">Select leave type</option>
                  <option v-for="(label, value) in LEAVE_TYPE_LABELS" :key="value" :value="value">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Start Date *</label>
                  <input
                    v-model="leaveForm.startDate"
                    type="date"
                    required
                    :min="leaveMinDate"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">End Date *</label>
                  <input
                    v-model="leaveForm.endDate"
                    type="date"
                    required
                    :min="leaveForm.startDate || leaveMinDate"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Half Day</label>
                <select
                  v-model="leaveForm.halfDayType"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                >
                  <option v-for="(label, value) in HALF_DAY_TYPE_LABELS" :key="value" :value="value">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Reason *</label>
                <textarea
                  v-model="leaveForm.reason"
                  rows="3"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  placeholder="Please provide a reason for your leave request..."
                ></textarea>
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="showLeaveModal = false"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Overtime Request Modal -->
    <div
      v-if="showOvertimeModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">File Overtime Request</h3>
          <form @submit.prevent="submitOvertimeRequest">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Date *</label>
                <input
                  v-model="overtimeForm.otDate"
                  type="date"
                  required
                  :min="minPastDate"
                  :max="maxPastDate"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Start Time *</label>
                  <input
                    v-model="overtimeForm.otStartTime"
                    type="time"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">End Time *</label>
                  <input
                    v-model="overtimeForm.otEndTime"
                    type="time"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Reason *</label>
                <textarea
                  v-model="overtimeForm.reason"
                  rows="3"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  placeholder="Please provide a reason for your overtime request..."
                ></textarea>
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="showOvertimeModal = false"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Undertime Request Modal -->
    <div
      v-if="showUndertimeModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">File Undertime Request</h3>
          <form @submit.prevent="submitUndertimeRequest">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Date *</label>
                <input
                  v-model="undertimeForm.utDate"
                  type="date"
                  required
                  :min="minPastDate"
                  :max="maxPastDate"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Start Time *</label>
                  <input
                    v-model="undertimeForm.utStartTime"
                    type="time"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">End Time *</label>
                  <input
                    v-model="undertimeForm.utEndTime"
                    type="time"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Reason *</label>
                <textarea
                  v-model="undertimeForm.reason"
                  rows="3"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  placeholder="Please provide a reason for your undertime request..."
                ></textarea>
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="showUndertimeModal = false"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
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
import PageLayout from '../components/PageLayout.vue'
import { apiService } from '../services/api'
import type {
  TimeRequest,
  TimeRequestType,
  LeaveType,
  HalfDayType,
} from '../types'
import {
  LEAVE_TYPE_LABELS,
  TIME_REQUEST_STATUS_LABELS,
  HALF_DAY_TYPE_LABELS,
} from '../types'

const router = useRouter()

// State
const requests = ref<TimeRequest[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref<'all' | TimeRequestType>('all')
const isSubmitting = ref(false)

// Modal states
const showLeaveModal = ref(false)
const showOvertimeModal = ref(false)
const showUndertimeModal = ref(false)

// Tabs
const tabs = [
  { label: 'All Requests', value: 'all' as const },
  { label: 'Leave', value: 'LEAVE' as const },
  { label: 'Overtime', value: 'OVERTIME' as const },
  { label: 'Undertime', value: 'UNDERTIME' as const },
]

// Form data
const leaveForm = ref({
  leaveType: '' as LeaveType | '',
  startDate: '',
  endDate: '',
  halfDayType: 'NONE' as HalfDayType,
  reason: '',
})

const overtimeForm = ref({
  otDate: '',
  otStartTime: '',
  otEndTime: '',
  reason: '',
})

const undertimeForm = ref({
  utDate: '',
  utStartTime: '',
  utEndTime: '',
  reason: '',
})

// Computed
const maxPastDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const minPastDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() - 7) // Allow dates up to 7 days in the past
  return date.toISOString().split('T')[0]
})

// For Emergency Leave (EL) and Sick Leave (SL), allow any past date
// For other leave types, restrict to 7 days in the past
const leaveMinDate = computed(() => {
  const leaveType = leaveForm.value.leaveType
  if (leaveType === 'EL' || leaveType === 'SL') {
    return undefined // No minimum date restriction for EL and SL
  }
  return minPastDate.value
})

const filteredRequests = computed(() => {
  if (activeTab.value === 'all') {
    return requests.value
  }
  return requests.value.filter((r) => r.type === activeTab.value)
})

// Methods
const fetchRequests = async () => {
  try {
    isLoading.value = true
    error.value = null
    requests.value = await apiService.getMyTimeRequests()
  } catch (err: any) {
    console.error('Failed to fetch requests:', err)
    error.value = err.message || 'Failed to fetch requests'
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

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const formatRequestType = (request: TimeRequest): string => {
  if (request.type === 'LEAVE' && request.leaveType) {
    return LEAVE_TYPE_LABELS[request.leaveType]
  }
  return request.type
}

const getTypeBadgeClass = (type: TimeRequestType): string => {
  const base = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full'
  switch (type) {
    case 'LEAVE':
      return `${base} bg-green-100 text-green-800`
    case 'OVERTIME':
      return `${base} bg-blue-100 text-blue-800`
    case 'UNDERTIME':
      return `${base} bg-orange-100 text-orange-800`
    default:
      return `${base} bg-gray-100 text-gray-800`
  }
}

const getStatusBadgeClass = (status: string): string => {
  const base = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full'
  switch (status) {
    case 'PENDING':
      return `${base} bg-yellow-100 text-yellow-800`
    case 'APPROVED':
      return `${base} bg-green-100 text-green-800`
    case 'REJECTED':
      return `${base} bg-red-100 text-red-800`
    case 'CANCELLED':
      return `${base} bg-gray-100 text-gray-800`
    case 'INCLUDED_IN_PAYROLL':
      return `${base} bg-blue-100 text-blue-800`
    default:
      return `${base} bg-gray-100 text-gray-800`
  }
}

const openLeaveModal = () => {
  leaveForm.value = {
    leaveType: '',
    startDate: '',
    endDate: '',
    halfDayType: 'NONE',
    reason: '',
  }
  showLeaveModal.value = true
}

const openOvertimeModal = () => {
  overtimeForm.value = {
    otDate: '',
    otStartTime: '',
    otEndTime: '',
    reason: '',
  }
  showOvertimeModal.value = true
}

const openUndertimeModal = () => {
  undertimeForm.value = {
    utDate: '',
    utStartTime: '',
    utEndTime: '',
    reason: '',
  }
  showUndertimeModal.value = true
}

const submitLeaveRequest = async () => {
  try {
    isSubmitting.value = true
    await apiService.createLeaveRequest({
      leaveType: leaveForm.value.leaveType as LeaveType,
      startDate: leaveForm.value.startDate,
      endDate: leaveForm.value.endDate,
      halfDayType: leaveForm.value.halfDayType,
      reason: leaveForm.value.reason,
    })
    showLeaveModal.value = false
    await fetchRequests()
  } catch (err: any) {
    console.error('Failed to submit leave request:', err)
    error.value = err.message || 'Failed to submit leave request'
  } finally {
    isSubmitting.value = false
  }
}

const submitOvertimeRequest = async () => {
  try {
    isSubmitting.value = true
    await apiService.createOvertimeRequest({
      otDate: overtimeForm.value.otDate,
      otStartTime: overtimeForm.value.otStartTime,
      otEndTime: overtimeForm.value.otEndTime,
      reason: overtimeForm.value.reason,
    })
    showOvertimeModal.value = false
    await fetchRequests()
  } catch (err: any) {
    console.error('Failed to submit overtime request:', err)
    error.value = err.message || 'Failed to submit overtime request'
  } finally {
    isSubmitting.value = false
  }
}

const submitUndertimeRequest = async () => {
  try {
    isSubmitting.value = true
    await apiService.createUndertimeRequest({
      utDate: undertimeForm.value.utDate,
      utStartTime: undertimeForm.value.utStartTime,
      utEndTime: undertimeForm.value.utEndTime,
      reason: undertimeForm.value.reason,
    })
    showUndertimeModal.value = false
    await fetchRequests()
  } catch (err: any) {
    console.error('Failed to submit undertime request:', err)
    error.value = err.message || 'Failed to submit undertime request'
  } finally {
    isSubmitting.value = false
  }
}

const cancelRequest = async (request: TimeRequest) => {
  if (!confirm('Are you sure you want to cancel this request?')) return
  try {
    await apiService.cancelTimeRequest(request.id)
    await fetchRequests()
  } catch (err: any) {
    console.error('Failed to cancel request:', err)
    error.value = err.message || 'Failed to cancel request'
  }
}

onMounted(() => {
  fetchRequests()
})
</script>
