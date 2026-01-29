<template>
  <PageLayout title="Time Request Approvals" subtitle="Review and approve employee time requests">
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
          <!-- Main Tabs: Pending / Approved -->
          <div class="border-b border-gray-200 mb-6">
            <nav class="-mb-px flex space-x-8">
              <button
                @click="mainTab = 'pending'; fetchRequests()"
                :class="[
                  'py-4 px-1 border-b-2 font-medium text-sm',
                  mainTab === 'pending'
                    ? 'border-palette-dark-blue text-palette-dark-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                ]"
              >
                Pending
                <span
                  v-if="pendingRequests.length > 0"
                  class="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs"
                >
                  {{ pendingRequests.length }}
                </span>
              </button>
              <button
                @click="mainTab = 'approved'; fetchRequests()"
                :class="[
                  'py-4 px-1 border-b-2 font-medium text-sm',
                  mainTab === 'approved'
                    ? 'border-palette-dark-blue text-palette-dark-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                ]"
              >
                Approved
                <span
                  v-if="approvedRequests.length > 0"
                  class="ml-2 bg-green-100 text-green-800 py-0.5 px-2 rounded-full text-xs"
                >
                  {{ approvedRequests.length }}
                </span>
              </button>
            </nav>
          </div>

          <!-- Type Filters -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                @click="activeTab = tab.value; fetchRequests()"
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
            <div class="text-sm text-gray-500">
              {{ currentRequests.length }} {{ mainTab }} request(s)
            </div>
          </div>

          <!-- Pending Requests Table -->
          <div v-if="mainTab === 'pending'" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
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
                    Filed On
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="request in pendingRequests" :key="request.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span class="text-gray-600 font-medium text-sm">
                          {{ getInitials(request.user?.profile?.name) }}
                        </span>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ request.user?.profile?.name || 'Unknown' }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ request.user?.profile?.email || '' }}
                        </div>
                      </div>
                    </div>
                  </td>
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
                    <div class="text-sm text-gray-900 max-w-xs truncate" :title="request.reason">
                      {{ request.reason }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDateTime(request.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="openApproveModal(request)"
                        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Approve
                      </button>
                      <button
                        @click="openRejectModal(request)"
                        class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="pendingRequests.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No pending {{ activeTab === 'all' ? '' : activeTab.toLowerCase() + ' ' }}requests.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Approved Requests Table -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
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
                    Approved By
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved On
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="request in approvedRequests" :key="request.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span class="text-gray-600 font-medium text-sm">
                          {{ getInitials(request.user?.profile?.name) }}
                        </span>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ request.user?.profile?.name || 'Unknown' }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ request.user?.profile?.email || '' }}
                        </div>
                      </div>
                    </div>
                  </td>
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
                    <div class="text-sm text-gray-900 max-w-xs truncate" :title="request.reason">
                      {{ request.reason }}
                    </div>
                    <div v-if="request.reviewerRemarks" class="text-xs text-gray-500 mt-1 italic">
                      "{{ request.reviewerRemarks }}"
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ request.reviewer?.profile?.name || 'Unknown' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ request.reviewedAt ? formatDateTime(request.reviewedAt) : '-' }}
                  </td>
                </tr>
                <tr v-if="approvedRequests.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No approved {{ activeTab === 'all' ? '' : activeTab.toLowerCase() + ' ' }}requests.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <div
      v-if="showApproveModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Approve Request</h3>
          <div class="mb-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-sm">
              <p><strong>Employee:</strong> {{ selectedRequest?.user?.profile?.name }}</p>
              <p><strong>Type:</strong> {{ formatRequestType(selectedRequest!) }}</p>
              <p><strong>Reason:</strong> {{ selectedRequest?.reason }}</p>
            </div>
          </div>
          <form @submit.prevent="confirmApprove">
            <div>
              <label class="block text-sm font-medium text-gray-700">Remarks (optional)</label>
              <textarea
                v-model="reviewRemarks"
                rows="3"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                placeholder="Add any remarks..."
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="showApproveModal = false"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {{ isSubmitting ? 'Approving...' : 'Approve Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div
      v-if="showRejectModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Reject Request</h3>
          <div class="mb-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-sm">
              <p><strong>Employee:</strong> {{ selectedRequest?.user?.profile?.name }}</p>
              <p><strong>Type:</strong> {{ formatRequestType(selectedRequest!) }}</p>
              <p><strong>Reason:</strong> {{ selectedRequest?.reason }}</p>
            </div>
          </div>
          <form @submit.prevent="confirmReject">
            <div>
              <label class="block text-sm font-medium text-gray-700">Reason for Rejection</label>
              <textarea
                v-model="reviewRemarks"
                rows="3"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                placeholder="Please provide a reason for rejection..."
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="showRejectModal = false"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {{ isSubmitting ? 'Rejecting...' : 'Reject Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '../components/PageLayout.vue'
import { apiService } from '../services/api'
import type { TimeRequest, TimeRequestType } from '../types'
import { LEAVE_TYPE_LABELS, HALF_DAY_TYPE_LABELS } from '../types'

const router = useRouter()

// State
const pendingRequests = ref<TimeRequest[]>([])
const approvedRequests = ref<TimeRequest[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const mainTab = ref<'pending' | 'approved'>('pending')
const activeTab = ref<'all' | TimeRequestType>('all')
const isSubmitting = ref(false)

// Modal states
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedRequest = ref<TimeRequest | null>(null)
const reviewRemarks = ref('')

// Computed
const currentRequests = computed(() => {
  return mainTab.value === 'pending' ? pendingRequests.value : approvedRequests.value
})

// Tabs
const tabs = [
  { label: 'All', value: 'all' as const },
  { label: 'Leave', value: 'LEAVE' as const },
  { label: 'Overtime', value: 'OVERTIME' as const },
  { label: 'Undertime', value: 'UNDERTIME' as const },
]

// Methods
const fetchRequests = async () => {
  if (mainTab.value === 'pending') {
    await fetchPendingRequests()
  } else {
    await fetchApprovedRequests()
  }
}

const fetchPendingRequests = async () => {
  try {
    isLoading.value = true
    error.value = null
    const params: { type?: TimeRequestType } = {}
    if (activeTab.value !== 'all') {
      params.type = activeTab.value
    }
    pendingRequests.value = await apiService.getPendingTimeRequests(params)
  } catch (err: any) {
    console.error('Failed to fetch pending requests:', err)
    error.value = err.message || 'Failed to fetch pending requests'
  } finally {
    isLoading.value = false
  }
}

const fetchApprovedRequests = async () => {
  try {
    isLoading.value = true
    error.value = null
    const params: { type?: TimeRequestType } = {}
    if (activeTab.value !== 'all') {
      params.type = activeTab.value
    }
    approvedRequests.value = await apiService.getApprovedTimeRequests(params)
  } catch (err: any) {
    console.error('Failed to fetch approved requests:', err)
    error.value = err.message || 'Failed to fetch approved requests'
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

const getInitials = (name: string | null | undefined): string => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const openApproveModal = (request: TimeRequest) => {
  selectedRequest.value = request
  reviewRemarks.value = ''
  showApproveModal.value = true
}

const openRejectModal = (request: TimeRequest) => {
  selectedRequest.value = request
  reviewRemarks.value = ''
  showRejectModal.value = true
}

const confirmApprove = async () => {
  if (!selectedRequest.value) return
  try {
    isSubmitting.value = true
    await apiService.approveTimeRequest(selectedRequest.value.id, {
      remarks: reviewRemarks.value || undefined,
    })
    showApproveModal.value = false
    await fetchPendingRequests()
    // Also refresh approved list for badge count
    const approvedParams: { type?: TimeRequestType } = {}
    if (activeTab.value !== 'all') {
      approvedParams.type = activeTab.value
    }
    approvedRequests.value = await apiService.getApprovedTimeRequests(approvedParams)
  } catch (err: any) {
    console.error('Failed to approve request:', err)
    error.value = err.message || 'Failed to approve request'
  } finally {
    isSubmitting.value = false
  }
}

const confirmReject = async () => {
  if (!selectedRequest.value) return
  try {
    isSubmitting.value = true
    await apiService.rejectTimeRequest(selectedRequest.value.id, {
      remarks: reviewRemarks.value,
    })
    showRejectModal.value = false
    await fetchPendingRequests()
  } catch (err: any) {
    console.error('Failed to reject request:', err)
    error.value = err.message || 'Failed to reject request'
  } finally {
    isSubmitting.value = false
  }
}

const fetchAllCounts = async () => {
  // Fetch both pending and approved counts for badges
  try {
    const params: { type?: TimeRequestType } = {}
    if (activeTab.value !== 'all') {
      params.type = activeTab.value
    }
    const [pending, approved] = await Promise.all([
      apiService.getPendingTimeRequests(params),
      apiService.getApprovedTimeRequests(params),
    ])
    pendingRequests.value = pending
    approvedRequests.value = approved
  } catch (err: any) {
    console.error('Failed to fetch requests:', err)
    error.value = err.message || 'Failed to fetch requests'
  }
}

onMounted(async () => {
  isLoading.value = true
  await fetchAllCounts()
  isLoading.value = false
})
</script>
