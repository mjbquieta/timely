<template>
  <PageLayout title="Owner Details" subtitle="View and update owner profile information">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <svg
        class="animate-spin h-8 w-8 text-palette-dark-blue"
        xmlns="http://www.w3.org/2000/svg"
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
    </div>

    <!-- Owner Profile Details -->
    <div v-else class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Owner Profile</h3>
          <button
            v-if="!isEditing"
            @click="startEditing"
            class="px-4 py-2 bg-palette-dark-blue text-white rounded-lg text-sm font-medium hover:bg-palette-medium-blue transition-colors"
          >
            Edit
          </button>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center"
        >
          <svg
            class="h-5 w-5 text-red-400 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          {{ error }}
        </div>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center"
        >
          <svg
            class="h-5 w-5 text-green-400 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          {{ successMessage }}
        </div>

        <!-- Profile Header -->
        <div v-if="ownerProfile" class="flex items-center space-x-4 pb-6 border-b border-gray-200 mb-6">
          <div class="w-16 h-16 bg-palette-dark-blue rounded-full flex items-center justify-center">
            <span class="text-white text-2xl font-bold">
              {{ (ownerProfile.username || 'O').charAt(0).toUpperCase() }}
            </span>
          </div>
          <div>
            <h4 class="text-xl font-semibold text-gray-900">
              {{ ownerProfile.name || ownerProfile.username || 'Owner' }}
            </h4>
            <p class="text-sm text-gray-500">{{ ownerProfile.email || 'No email' }}</p>
          </div>
        </div>

        <!-- Profile Form -->
        <form v-if="ownerProfile" @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- Username (Read-only) -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-500 mb-2">
                Username
              </label>
              <input
                id="username"
                :value="ownerProfile.username"
                type="text"
                disabled
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500"
              />
            </div>

            <!-- Email (Read-only) -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-500 mb-2">Email</label>
              <input
                id="email"
                :value="ownerProfile.email"
                type="email"
                disabled
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500"
              />
            </div>

            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                :disabled="!isEditing"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-palette-dark-blue disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter full name"
              />
            </div>

            <!-- Phone -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                :disabled="!isEditing"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-palette-dark-blue disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="+1-555-123-4567"
              />
            </div>

            <!-- Address 1 -->
            <div>
              <label for="address1" class="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1
              </label>
              <input
                id="address1"
                v-model="form.address1"
                type="text"
                :disabled="!isEditing"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-palette-dark-blue disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <!-- Address 2 -->
            <div>
              <label for="address2" class="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              <input
                id="address2"
                v-model="form.address2"
                type="text"
                :disabled="!isEditing"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-palette-dark-blue disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <!-- City -->
            <div>
              <label for="city" class="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                id="city"
                v-model="form.city"
                type="text"
                :disabled="!isEditing"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-palette-dark-blue disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <!-- State -->
            <div>
              <label for="state" class="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                id="state"
                v-model="form.state"
                type="text"
                :disabled="!isEditing"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-palette-dark-blue disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <!-- ZIP -->
            <div>
              <label for="zip" class="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
              <input
                id="zip"
                v-model="form.zip"
                type="text"
                :disabled="!isEditing"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-palette-dark-blue disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <!-- Country -->
            <div>
              <label for="country" class="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                id="country"
                v-model="form.country"
                type="text"
                :disabled="!isEditing"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-palette-dark-blue disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="isEditing" class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="cancelEditing"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-4 py-2 bg-palette-dark-blue text-white rounded-lg text-sm font-medium hover:bg-palette-medium-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>

        <!-- No Owner Data -->
        <div v-else class="text-center py-12">
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No owner information</h3>
          <p class="mt-1 text-sm text-gray-500">Owner details are not available.</p>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api'
import type { User, Profile } from '../types'

const authStore = useAuthStore()

const owner = ref<User | null>(null)
const ownerProfile = ref<Profile | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)
const error = ref('')
const successMessage = ref('')

const form = reactive({
  name: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country: '',
})

const getOwnerId = (): string | null => {
  // Get owner ID from company or from auth store user
  if (authStore.company?.ownerId) {
    return authStore.company.ownerId
  }
  if (authStore.user?.id) {
    return authStore.user.id
  }
  return null
}

const fetchOwner = async () => {
  const ownerId = getOwnerId()
  if (!ownerId) {
    error.value = 'Owner ID not found'
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    const data = await apiService.getUser(ownerId)
    owner.value = data

    // Extract profile information
    if (data.profile) {
      ownerProfile.value = data.profile

      // Populate form
      form.name = data.profile.name || ''
      form.phone = data.profile.phone || ''
      form.address1 = data.profile.address1 || ''
      form.address2 = data.profile.address2 || ''
      form.city = data.profile.city || ''
      form.state = data.profile.state || ''
      form.zip = data.profile.zip || ''
      form.country = data.profile.country || ''
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch owner details'
    console.error('Failed to fetch owner:', err)
  } finally {
    isLoading.value = false
  }
}

const startEditing = () => {
  isEditing.value = true
  error.value = ''
  successMessage.value = ''
}

const cancelEditing = () => {
  isEditing.value = false
  error.value = ''
  successMessage.value = ''
  // Reset form to original values
  if (ownerProfile.value) {
    form.name = ownerProfile.value.name || ''
    form.phone = ownerProfile.value.phone || ''
    form.address1 = ownerProfile.value.address1 || ''
    form.address2 = ownerProfile.value.address2 || ''
    form.city = ownerProfile.value.city || ''
    form.state = ownerProfile.value.state || ''
    form.zip = ownerProfile.value.zip || ''
    form.country = ownerProfile.value.country || ''
  }
}

const handleSubmit = async () => {
  const ownerId = getOwnerId()
  if (!ownerId) {
    error.value = 'Owner ID not found'
    return
  }

  try {
    isSaving.value = true
    error.value = ''
    successMessage.value = ''

    // Prepare update payload - profile fields at root level
    const updateData: any = {
      name: form.name || null,
      phone: form.phone || null,
      address1: form.address1 || null,
      address2: form.address2 || null,
      city: form.city || null,
      state: form.state || null,
      zip: form.zip || null,
      country: form.country || null,
    }

    const updatedUser = await apiService.updateUser(ownerId, updateData)
    owner.value = updatedUser

    // Update profile
    if (updatedUser.profile) {
      ownerProfile.value = updatedUser.profile
    }

    // Update auth store if this is the current user
    if (authStore.user?.id === ownerId) {
      authStore.user = updatedUser
      if (updatedUser.profile) {
        authStore.profile = updatedUser.profile
        localStorage.setItem('user', JSON.stringify(updatedUser))
        localStorage.setItem('profile', JSON.stringify(updatedUser.profile))
      }
    }

    successMessage.value = 'Owner profile updated successfully'
    isEditing.value = false

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    error.value = err.message || 'Failed to update owner profile'
    console.error('Failed to update owner:', err)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchOwner()
})
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>
