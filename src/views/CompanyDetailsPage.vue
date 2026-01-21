<template>
  <PageLayout title="Company Details" subtitle="View and update your company information">
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

    <!-- Company Details Form -->
    <div v-else class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Company Information</h3>
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

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- Company Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                :disabled="!isEditing"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-palette-dark-blue disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <!-- Phone -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
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

          <!-- Read-only fields -->
          <div class="pt-6 border-t border-gray-200">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-2">Company ID</label>
                <div class="text-sm text-gray-900 font-mono">{{ companyData?.id || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-2">Owner ID</label>
                <div class="text-sm text-gray-900 font-mono">{{ companyData?.ownerId || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-2">Created At</label>
                <div class="text-sm text-gray-900">
                  {{ companyData?.createdAt ? formatDate(companyData.createdAt) : 'N/A' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-2">Updated At</label>
                <div class="text-sm text-gray-900">
                  {{ companyData?.updatedAt ? formatDate(companyData.updatedAt) : 'N/A' }}
                </div>
              </div>
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
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api'
import type { Company } from '../types'

const authStore = useAuthStore()

const companyData = ref<Company | null>(null)
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

const fetchCompany = async () => {
  if (!authStore.company?.id) {
    console.error('Company ID not found')
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    const data = await apiService.getCompany(authStore.company.id)
    companyData.value = data

    // Populate form
    form.name = data.name || ''
    form.phone = data.phone || ''
    form.address1 = data.address1 || ''
    form.address2 = data.address2 || ''
    form.city = data.city || ''
    form.state = data.state || ''
    form.zip = data.zip || ''
    form.country = data.country || ''
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch company details'
    console.error('Failed to fetch company:', err)
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
  if (companyData.value) {
    form.name = companyData.value.name || ''
    form.phone = companyData.value.phone || ''
    form.address1 = companyData.value.address1 || ''
    form.address2 = companyData.value.address2 || ''
    form.city = companyData.value.city || ''
    form.state = companyData.value.state || ''
    form.zip = companyData.value.zip || ''
    form.country = companyData.value.country || ''
  }
}

const handleSubmit = async () => {
  if (!authStore.company?.id) {
    error.value = 'Company ID not found'
    return
  }

  try {
    isSaving.value = true
    error.value = ''
    successMessage.value = ''

    // Prepare update payload (only include fields that are being updated)
    const updateData: Partial<Company> = {}
    if (form.name) updateData.name = form.name
    if (form.phone) updateData.phone = form.phone
    if (form.address1) updateData.address1 = form.address1
    if (form.address2) updateData.address2 = form.address2
    if (form.city) updateData.city = form.city
    if (form.state) updateData.state = form.state
    if (form.zip) updateData.zip = form.zip
    if (form.country) updateData.country = form.country

    const updatedCompany = await apiService.updateCompany(authStore.company.id, updateData)
    companyData.value = updatedCompany

    // Update auth store
    authStore.company = updatedCompany
    localStorage.setItem('company', JSON.stringify(updatedCompany))

    successMessage.value = 'Company details updated successfully'
    isEditing.value = false

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    error.value = err.message || 'Failed to update company details'
    console.error('Failed to update company:', err)
  } finally {
    isSaving.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchCompany()
})
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>

