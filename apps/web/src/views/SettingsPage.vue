<template>
  <PageLayout title="Settings" subtitle="Manage your account settings and preferences">
    <div class="max-w-4xl mx-auto p-6 space-y-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="flex items-center space-x-3">
          <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span class="text-gray-600">Loading settings...</span>
        </div>
      </div>

      <!-- Settings Content -->
      <div v-else class="flex flex-col gap-6">
        <!-- Branch Information Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Branch Information</h2>
            <button
              @click="saveBranchInfo"
              :disabled="branchLoading"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <svg
                v-if="branchLoading"
                class="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{ branchLoading ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Branch Name </label>
              <input
                v-model="branchInfo.branchName"
                type="text"
                placeholder="Enter branch name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Email </label>
              <input
                v-model="branchInfo.email"
                type="email"
                placeholder="Enter email address"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Username </label>
              <input
                v-model="branchInfo.username"
                type="text"
                placeholder="Enter username"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Timezone </label>
              <select
                v-model="branchInfo.timezone"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select timezone</option>
                <option v-for="option in timezoneOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Password Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Password</h2>
            <button
              @click="savePassword"
              :disabled="passwordLoading"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <svg
                v-if="passwordLoading"
                class="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{ passwordLoading ? 'Updating...' : 'Update Password' }}</span>
            </button>
          </div>

          <!-- Password Error Display -->
          <div
            v-if="passwordError && !showPasswordChangeModal"
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
          >
            <p class="text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Current Password </label>
              <input
                v-model="passwordInfo.currentPassword"
                type="password"
                placeholder="Enter current password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                @input="passwordError = ''"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> New Password </label>
              <input
                v-model="passwordInfo.newPassword"
                type="password"
                placeholder="Enter new password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                @input="passwordError = ''"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                v-model="passwordInfo.confirmPassword"
                type="password"
                placeholder="Confirm new password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                @input="passwordError = ''"
              />
            </div>
          </div>
        </div>

        <!-- Device Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <!-- Device Error Display -->
          <div
            v-if="deviceError && !showPasswordModal"
            class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
          >
            <p class="text-sm text-yellow-600">{{ deviceError }}</p>
          </div>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Device</h2>
            <button
              @click="saveDeviceInfo"
              :disabled="deviceLoading"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <svg
                v-if="deviceLoading"
                class="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{ deviceLoading ? 'Saving...' : 'Save Device' }}</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Serial Number </label>
              <input
                v-model="deviceInfo.serialNumber"
                type="text"
                placeholder="Enter device serial number"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                @input="clearDeviceError"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Device Password Modal -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closePasswordModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Confirm Device Update</h3>
            <button
              @click="closePasswordModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p class="text-sm text-gray-600 mb-4">
            Please enter your password to update the device serial number to
            <strong>{{ deviceInfo.serialNumber }}</strong>
          </p>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              v-model="devicePassword"
              type="password"
              placeholder="Enter your password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              @keyup.enter="confirmDeviceUpdate"
            />
          </div>

          <div v-if="deviceError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ deviceError }}</p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closePasswordModal"
              :disabled="deviceLoading"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="confirmDeviceUpdate"
              :disabled="deviceLoading || !devicePassword.trim()"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors flex items-center space-x-2"
            >
              <svg
                v-if="deviceLoading"
                class="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{ deviceLoading ? 'Updating...' : 'Update Device' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Change Confirmation Modal -->
    <div
      v-if="showPasswordChangeModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closePasswordChangeModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Confirm Password Change</h3>
            <button
              @click="closePasswordChangeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p class="text-sm text-gray-600 mb-4">
            Are you sure you want to change your password? This action cannot be undone.
          </p>

          <div v-if="passwordError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closePasswordChangeModal"
              :disabled="passwordLoading"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="confirmPasswordChange"
              :disabled="passwordLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors flex items-center space-x-2"
            >
              <svg
                v-if="passwordLoading"
                class="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{ passwordLoading ? 'Updating...' : 'Change Password' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api'
import type { BranchInfoResponse } from '../types'

const authStore = useAuthStore()

// Branch Information
const branchInfo = reactive({
  branchName: '',
  email: '',
  username: '',
  timezone: '',
})

// Password Information
const passwordInfo = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Device Information
const deviceInfo = reactive({
  serialNumber: '',
})

// Device password modal
const showPasswordModal = ref(false)
const devicePassword = ref('')
const deviceError = ref('')
const originalSerialNumber = ref('')
const deviceErrorTimer = ref<number | null>(null)

// Password change modal
const showPasswordChangeModal = ref(false)
const passwordError = ref('')

// Loading states
const branchLoading = ref(false)
const passwordLoading = ref(false)
const deviceLoading = ref(false)
const isLoading = ref(false)

// Timezone options
const timezoneOptions = [{ label: 'UTC+08:00 (Asia/Manila)', value: 'Asia/Manila' }]

// Fetch initial data
const fetchInitialData = async () => {
  isLoading.value = true
  try {
    // Fetch branch information using store
    const branchData = await authStore.fetchBranchInfoWithCounts()

    // Populate branch information
    if (branchData.branch) {
      branchInfo.branchName = branchData.branch.name || ''
      branchInfo.timezone = branchData.branch.timezone || 'UTC+00'
    }

    // Populate user information
    if (branchData.user?.profile) {
      branchInfo.username = branchData.user.profile.username || ''
      branchInfo.email = branchData.user.profile.email || ''
    }

    // Populate device information
    if (branchData.branch) {
      deviceInfo.serialNumber = branchData.branch.deviceSerialNumber || ''
      originalSerialNumber.value = branchData.branch.deviceSerialNumber || ''
    }
  } catch (error) {
    console.error('Error fetching initial data:', error)
    // Set some fallback sample data
    branchInfo.branchName = 'Sample Branch'
    branchInfo.email = 'admin@samplebranch.com'
    branchInfo.username = 'admin'
    branchInfo.timezone = 'Asia/Manila'
    deviceInfo.serialNumber = 'DEV-001-2024'
  } finally {
    isLoading.value = false
  }
}

// Save functions
const saveBranchInfo = async () => {
  branchLoading.value = true
  try {
    await apiService.updateBranchInfo({
      name: branchInfo.branchName,
      timezone: branchInfo.timezone,
    })

    // Refresh the auth store to get updated branch info
    await authStore.fetchBranchInfoWithCounts()

    console.log('Branch information saved successfully')
  } catch (error) {
    console.error('Error saving branch info:', error)
  } finally {
    branchLoading.value = false
  }
}

const savePassword = async () => {
  // Validate passwords match
  if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
    passwordError.value = 'New passwords do not match'
    return
  }

  // Validate password length
  if (passwordInfo.newPassword.length < 6) {
    passwordError.value = 'New password must be at least 6 characters long'
    return
  }

  // Validate current password is provided
  if (!passwordInfo.currentPassword.trim()) {
    passwordError.value = 'Please enter your current password'
    return
  }

  // Clear any previous errors
  passwordError.value = ''

  // Show confirmation modal
  showPasswordChangeModal.value = true
}

const closePasswordChangeModal = () => {
  showPasswordChangeModal.value = false
  passwordError.value = ''
}

const confirmPasswordChange = async () => {
  passwordLoading.value = true
  passwordError.value = ''

  try {
    await apiService.changePassword(passwordInfo.currentPassword, passwordInfo.newPassword)

    // Clear password fields on success
    passwordInfo.currentPassword = ''
    passwordInfo.newPassword = ''
    passwordInfo.confirmPassword = ''

    // Close modal
    showPasswordChangeModal.value = false

    console.log('Password updated successfully')
    // You can add a toast notification here if you have one
  } catch (error: any) {
    console.error('Error updating password:', error)

    // Handle specific error cases
    if (error.status === 401) {
      passwordError.value = 'Current password is incorrect. Please try again.'
    } else {
      passwordError.value = error.message || 'Failed to update password. Please try again.'
    }
  } finally {
    passwordLoading.value = false
  }
}

const saveDeviceInfo = async () => {
  // Check if serial number has changed
  if (deviceInfo.serialNumber === originalSerialNumber.value) {
    showDeviceError('No changes made to device serial number')
    return
  }

  // Validate serial number is not empty
  if (!deviceInfo.serialNumber.trim()) {
    showDeviceError('Please enter a valid serial number', false)
    return
  }

  // Show password modal
  showPasswordModal.value = true
  deviceError.value = ''
  devicePassword.value = ''
}

const clearDeviceError = () => {
  deviceError.value = ''
  if (deviceErrorTimer.value) {
    clearTimeout(deviceErrorTimer.value)
    deviceErrorTimer.value = null
  }
}

const showDeviceError = (message: string, autoHide = true) => {
  deviceError.value = message

  if (autoHide) {
    // Clear any existing timer
    if (deviceErrorTimer.value) {
      clearTimeout(deviceErrorTimer.value)
    }

    // Set new timer to hide after 3 seconds
    deviceErrorTimer.value = window.setTimeout(() => {
      deviceError.value = ''
      deviceErrorTimer.value = null
    }, 3000)
  }
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  deviceError.value = ''
  devicePassword.value = ''
  // Reset to original value if cancelled
  deviceInfo.serialNumber = originalSerialNumber.value
}

const confirmDeviceUpdate = async () => {
  if (!devicePassword.value.trim()) {
    deviceError.value = 'Please enter your password'
    return
  }

  deviceLoading.value = true
  deviceError.value = ''

  try {
    await apiService.updateDeviceSerialNumber(deviceInfo.serialNumber, devicePassword.value)

    // Update original serial number on success
    originalSerialNumber.value = deviceInfo.serialNumber

    // Close modal and show success
    showPasswordModal.value = false
    devicePassword.value = ''
    deviceError.value = ''

    console.log('Device serial number updated successfully')
    // You can add a toast notification here if you have one
  } catch (error: any) {
    console.error('Error updating device serial number:', error)

    // Handle specific error cases - don't auto-hide password errors
    if (error.status === 401) {
      deviceError.value = 'Invalid password. Please try again.'
    } else {
      deviceError.value =
        error.message || 'Failed to update device serial number. Please try again.'
    }
  } finally {
    deviceLoading.value = false
  }
}

// Load initial data when component mounts
onMounted(() => {
  fetchInitialData()
})

// Cleanup timer when component unmounts
onUnmounted(() => {
  if (deviceErrorTimer.value) {
    clearTimeout(deviceErrorTimer.value)
  }
})
</script>
