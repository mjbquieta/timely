<template>
  <PageLayout title="My Leave Balance" subtitle="View your leave credits and usage">
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
          <span class="ml-2 text-gray-600">Loading leave balance...</span>
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
            <h3 class="text-sm font-medium text-red-800">Error loading leave balance</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchBalance"
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
      <!-- Year Selector -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">Leave Balance for {{ selectedYear }}</h2>
        <select
          v-model="selectedYear"
          @change="fetchBalance"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
        >
          <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>

      <!-- Summary Cards -->
      <div v-if="balanceData" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white shadow rounded-lg p-4">
          <div class="text-sm font-medium text-gray-500">Total Allowance</div>
          <div class="mt-1 text-2xl font-semibold text-gray-900">
            {{ balanceData.summary.totalAllowance }} days
          </div>
        </div>
        <div class="bg-white shadow rounded-lg p-4">
          <div class="text-sm font-medium text-gray-500">Used</div>
          <div class="mt-1 text-2xl font-semibold text-red-600">
            {{ balanceData.summary.totalUsed }} days
          </div>
        </div>
        <div class="bg-white shadow rounded-lg p-4">
          <div class="text-sm font-medium text-gray-500">Pending</div>
          <div class="mt-1 text-2xl font-semibold text-yellow-600">
            {{ balanceData.summary.totalPending }} days
          </div>
        </div>
        <div class="bg-white shadow rounded-lg p-4">
          <div class="text-sm font-medium text-gray-500">Available</div>
          <div class="mt-1 text-2xl font-semibold text-green-600">
            {{ balanceData.summary.totalAvailable }} days
          </div>
        </div>
      </div>

      <!-- Leave Balance Details -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Leave Balance by Type</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Allowance
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Used
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="balance in balanceData?.balances" :key="balance.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div
                        class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                        :class="getLeaveTypeColor(balance.leaveType)"
                      >
                        <span class="text-white text-xs font-bold">{{ balance.leaveType }}</span>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ LEAVE_TYPE_LABELS[balance.leaveType] }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ balance.totalAllowance }} days
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {{ balance.usedDays }} days
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                    {{ balance.pendingDays }} days
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {{ getAvailable(balance) }} days
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        class="h-2.5 rounded-full"
                        :class="getProgressColor(balance)"
                        :style="{ width: getUsagePercentage(balance) + '%' }"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ getUsagePercentage(balance).toFixed(0) }}% used
                    </div>
                  </td>
                </tr>
                <tr v-if="!balanceData?.balances.length">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No leave balance found for {{ selectedYear }}. Please contact your administrator.
                  </td>
                </tr>
              </tbody>
            </table>
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
import type { LeaveBalanceSummary, LeaveBalance, LeaveType } from '../types'
import { LEAVE_TYPE_LABELS } from '../types'

const router = useRouter()

// State
const balanceData = ref<LeaveBalanceSummary | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedYear = ref(new Date().getFullYear())

// Computed
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 1, currentYear, currentYear + 1]
})

// Methods
const fetchBalance = async () => {
  try {
    isLoading.value = true
    error.value = null
    balanceData.value = await apiService.getMyLeaveBalance(selectedYear.value)
  } catch (err: any) {
    console.error('Failed to fetch leave balance:', err)
    error.value = err.message || 'Failed to fetch leave balance'
  } finally {
    isLoading.value = false
  }
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

const getAvailable = (balance: LeaveBalance): number => {
  return balance.totalAllowance - balance.usedDays - balance.pendingDays
}

const getUsagePercentage = (balance: LeaveBalance): number => {
  if (balance.totalAllowance === 0) return 0
  return ((balance.usedDays + balance.pendingDays) / balance.totalAllowance) * 100
}

const getProgressColor = (balance: LeaveBalance): string => {
  const percentage = getUsagePercentage(balance)
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

onMounted(() => {
  fetchBalance()
})
</script>
