<template>
  <div
    class="min-h-screen bg-gradient-to-br from-palette-medium-blue to-palette-off-white flex flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Back to Landing -->
      <router-link
        to="/"
        class="inline-flex items-center text-palette-dark-blue hover:text-palette-medium-blue transition-colors mb-8"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <div class="flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="Timely PH Logo"
            class="w-6 h-6 rounded"
          />
          <span class="font-semibold">
            <span class="text-palette-dark-blue">Timely</span>
            <span class="text-teal-500">PH</span>
          </span>
        </div>
      </router-link>

      <div class="text-center">
        <div
          class="mx-auto h-12 w-12 bg-palette-dark-blue rounded-full flex items-center justify-center mb-4"
        >
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Employee Portal</h2>
        <p class="text-sm text-gray-600">Sign in to your employee account</p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div
            v-if="error"
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center"
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

          <div>
            <label for="emailOrUsername" class="block text-sm font-medium text-gray-700 mb-2">
              Email or Username
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </div>
              <input
                id="emailOrUsername"
                v-model="form.emailOrUsername"
                name="emailOrUsername"
                type="text"
                required
                class="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-palette-dark-blue transition-colors"
                :class="{
                  'border-red-300 focus:ring-red-500 focus:border-red-500': errors.emailOrUsername,
                }"
                placeholder="Enter your email or username"
              />
            </div>
            <p v-if="errors.emailOrUsername" class="mt-2 text-sm text-red-600">
              {{ errors.emailOrUsername }}
            </p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  ></path>
                </svg>
              </div>
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                required
                class="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-palette-dark-blue focus:border-palette-dark-blue transition-colors"
                :class="{
                  'border-red-300 focus:ring-red-500 focus:border-red-500': errors.password,
                }"
                placeholder="Enter your password"
              />
            </div>
            <p v-if="errors.password" class="mt-2 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-palette-dark-blue to-palette-medium-blue hover:from-palette-medium-blue hover:to-palette-light-beige focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-palette-dark-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg
                v-if="isLoading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  emailOrUsername: '',
  password: '',
})

const errors = reactive({
  emailOrUsername: '',
  password: '',
})

const isLoading = ref(false)
const error = ref('')

const validateForm = () => {
  errors.emailOrUsername = ''
  errors.password = ''
  error.value = ''

  if (!form.emailOrUsername.trim()) {
    errors.emailOrUsername = 'Email or username is required'
  }

  if (!form.password) {
    errors.password = 'Password is required'
  }

  return !errors.emailOrUsername && !errors.password
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  try {
    isLoading.value = true
    error.value = '' // Clear any previous errors
    await authStore.attendeeLogin(form.emailOrUsername, form.password)

    // Fetch attendee details to get branch and company info
    await authStore.fetchAttendeeDetails()

    // Redirect to employee dashboard on successful login
    router.push('/employee/dashboard')
  } catch (err: any) {
    error.value = authStore.error || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>

