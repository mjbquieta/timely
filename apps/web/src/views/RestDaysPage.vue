<template>
  <PageLayout title="Rest Days" subtitle="Manage rest day schedules and rules">
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
          <span class="ml-2 text-gray-600">Loading rest day rules...</span>
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
            <h3 class="text-sm font-medium text-red-800">Error loading rest day rules</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchRestDayRules"
              class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rest Day Rules Table -->
    <div v-else class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Rest Day Rules ({{ totalRules }} total)
            </h3>
            <button
              @click="showCreateModal = true"
              class="bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Create Rest Day Rule
            </button>
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
                    Rule Name
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Schedule Type
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Configuration
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Scope
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Effective Period
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="rule in paginatedRules" :key="rule.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div
                          class="h-10 w-10 rounded-full flex items-center justify-center"
                          :class="
                            rule.scheduleType === 'FIXED_WEEKLY' ? 'bg-blue-500' : 'bg-green-500'
                          "
                        >
                          <svg
                            class="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ rule.name }}</div>
                        <div class="text-sm text-gray-500">
                          Version {{ rule.version }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        rule.scheduleType === 'FIXED_WEEKLY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800',
                      ]"
                    >
                      {{ rule.scheduleType === 'FIXED_WEEKLY' ? 'Fixed Weekly' : 'Rotating' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      <template v-if="rule.scheduleType === 'FIXED_WEEKLY'">
                        {{ formatFixedDays(rule.fixedDays) }}
                      </template>
                      <template v-else>
                        {{ rule.workDays }} work / {{ rule.restDays }} rest
                      </template>
                    </div>
                    <div v-if="rule.scheduleType === 'ROTATING'" class="text-sm text-gray-500">
                      Starts: {{ formatDate(rule.patternStartDate || '') }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getScopeBadgeColor(rule),
                      ]"
                    >
                      {{ getScopeLabel(rule) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      From: {{ formatDate(rule.effectiveFrom) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ rule.effectiveTo ? 'To: ' + formatDate(rule.effectiveTo) : 'No end date' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="editRule(rule)"
                        class="text-palette-dark-blue hover:text-palette-medium-blue"
                      >
                        Edit
                      </button>
                      <button
                        @click="openDeleteModal(rule)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="restDayRules.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No rest day rules found. Create one to get started.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
            <div class="flex items-center text-sm text-gray-700">
              <span>Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalRules }} results</span>
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
              <span class="text-sm text-gray-700">Page {{ currentPage }} of {{ totalPages }}</span>
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

    <!-- Create/Edit Rest Day Rule Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showEditModal ? 'Edit Rest Day Rule' : 'Create New Rest Day Rule' }}
          </h3>
          <form @submit.prevent="showEditModal ? updateRuleData() : createRuleData()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Rule Name *</label>
                <input
                  v-model="ruleForm.name"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  placeholder="e.g., Standard Weekend Rest"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Schedule Type *</label>
                <select
                  v-model="ruleForm.scheduleType"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                >
                  <option value="">Select a type</option>
                  <option value="FIXED_WEEKLY">Fixed Weekly (e.g., Saturday & Sunday)</option>
                  <option value="ROTATING">Rotating (e.g., 4 work days, 1 rest day)</option>
                </select>
              </div>

              <!-- Fixed Weekly Options -->
              <div v-if="ruleForm.scheduleType === 'FIXED_WEEKLY'">
                <label class="block text-sm font-medium text-gray-700 mb-2">Rest Days *</label>
                <div class="flex flex-wrap gap-2">
                  <label
                    v-for="(day, index) in daysOfWeek"
                    :key="index"
                    class="inline-flex items-center"
                  >
                    <input
                      type="checkbox"
                      :value="index"
                      v-model="ruleForm.fixedDays"
                      class="h-4 w-4 text-palette-dark-blue focus:ring-palette-dark-blue border-gray-300 rounded"
                    />
                    <span class="ml-2 text-sm text-gray-700">{{ day }}</span>
                  </label>
                </div>
              </div>

              <!-- Rotating Options -->
              <div v-if="ruleForm.scheduleType === 'ROTATING'" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Work Days *</label>
                    <input
                      v-model.number="ruleForm.workDays"
                      type="number"
                      min="1"
                      required
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                      placeholder="e.g., 4"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Rest Days *</label>
                    <input
                      v-model.number="ruleForm.restDays"
                      type="number"
                      min="1"
                      required
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                      placeholder="e.g., 1"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Pattern Start Date *</label>
                  <input
                    v-model="ruleForm.patternStartDate"
                    type="date"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    The date when this rotating pattern begins (Day 1 of work cycle)
                  </p>
                </div>
              </div>

              <!-- Scope Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Apply To *</label>
                <div class="space-y-2">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      v-model="ruleForm.scope"
                      value="branch"
                      class="h-4 w-4 text-palette-dark-blue focus:ring-palette-dark-blue border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">Entire Branch (Default)</span>
                  </label>
                  <label class="inline-flex items-center ml-4">
                    <input
                      type="radio"
                      v-model="ruleForm.scope"
                      value="department"
                      class="h-4 w-4 text-palette-dark-blue focus:ring-palette-dark-blue border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">Specific Department</span>
                  </label>
                  <label class="inline-flex items-center ml-4">
                    <input
                      type="radio"
                      v-model="ruleForm.scope"
                      value="user"
                      class="h-4 w-4 text-palette-dark-blue focus:ring-palette-dark-blue border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">Specific Employee</span>
                  </label>
                </div>
              </div>

              <!-- Department Selection -->
              <div v-if="ruleForm.scope === 'department'">
                <label class="block text-sm font-medium text-gray-700">Department *</label>
                <select
                  v-model="ruleForm.departmentId"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                >
                  <option value="">Select a department</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>

              <!-- Employee Selection -->
              <div v-if="ruleForm.scope === 'user'">
                <label class="block text-sm font-medium text-gray-700">Employee *</label>
                <select
                  v-model="ruleForm.userId"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                >
                  <option value="">Select an employee</option>
                  <option v-for="attendee in attendees" :key="attendee.id" :value="attendee.id">
                    {{ attendee.profile?.name || attendee.profile?.email || 'Unknown' }}
                  </option>
                </select>
              </div>

              <!-- Effective Period -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Effective From *</label>
                  <input
                    v-model="ruleForm.effectiveFrom"
                    type="date"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Effective To (optional)</label>
                  <input
                    v-model="ruleForm.effectiveTo"
                    type="date"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {{ isSubmitting ? 'Saving...' : showEditModal ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Rest Day Rule Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeDeleteModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Delete Rest Day Rule</h3>
            <button @click="closeDeleteModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="text-center">
            <svg
              class="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Delete Rest Day Rule</h3>
            <p class="mt-1 text-sm text-gray-500">
              Are you sure you want to delete "{{ ruleToDelete?.name }}"? This action cannot be
              undone.
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="deleteError" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
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
                <h3 class="text-sm font-medium text-red-800">Error deleting rest day rule</h3>
                <p class="mt-1 text-sm text-red-700">{{ deleteError }}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="closeDeleteModal"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              @click="confirmDeleteRule"
              :disabled="isDeleting"
              class="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              <span v-if="isDeleting">Deleting...</span>
              <span v-else>Delete Rule</span>
            </button>
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
import type { RestDayRule, RestDayScheduleType, Department, Attendee } from '../types'

const router = useRouter()

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// State
const restDayRules = ref<RestDayRule[]>([])
const departments = ref<Department[]>([])
const attendees = ref<Attendee[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)
const selectedRule = ref<RestDayRule | null>(null)
const ruleToDelete = ref<RestDayRule | null>(null)
const deleteError = ref<string | null>(null)
const isDeleting = ref(false)

// Form data
const ruleForm = ref({
  name: '',
  scheduleType: '' as RestDayScheduleType | '',
  fixedDays: [] as number[],
  workDays: null as number | null,
  restDays: null as number | null,
  patternStartDate: '',
  scope: 'branch' as 'branch' | 'department' | 'user',
  departmentId: '',
  userId: '',
  effectiveFrom: '',
  effectiveTo: '',
})

// Computed
const totalRules = computed(() => restDayRules.value.length)
const totalPages = computed(() => Math.ceil(totalRules.value / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalRules.value))
const paginatedRules = computed(() => {
  return restDayRules.value.slice(startIndex.value, endIndex.value)
})

// Methods
const fetchRestDayRules = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await apiService.getRestDayRules()
    restDayRules.value = data
  } catch (err: any) {
    console.error('Failed to fetch rest day rules:', err)
    error.value = err.message || 'Failed to fetch rest day rules'
  } finally {
    isLoading.value = false
  }
}

const fetchDepartments = async () => {
  try {
    const data = await apiService.getDepartments()
    departments.value = data
  } catch (err: any) {
    console.error('Failed to fetch departments:', err)
  }
}

const fetchAttendees = async () => {
  try {
    const data = await apiService.getAttendees()
    attendees.value = data
  } catch (err: any) {
    console.error('Failed to fetch attendees:', err)
  }
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatFixedDays = (days: number[]): string => {
  if (!days || days.length === 0) return 'None'
  return days.map((d) => daysOfWeek[d]?.substring(0, 3) || d).join(', ')
}

const getScopeLabel = (rule: RestDayRule): string => {
  if (rule.userId) return 'Employee'
  if (rule.departmentId) return 'Department'
  return 'Branch'
}

const getScopeBadgeColor = (rule: RestDayRule): string => {
  if (rule.userId) return 'bg-purple-100 text-purple-800'
  if (rule.departmentId) return 'bg-yellow-100 text-yellow-800'
  return 'bg-gray-100 text-gray-800'
}

const editRule = (rule: RestDayRule) => {
  selectedRule.value = rule
  let scope: 'branch' | 'department' | 'user' = 'branch'
  if (rule.userId) scope = 'user'
  else if (rule.departmentId) scope = 'department'

  ruleForm.value = {
    name: rule.name,
    scheduleType: rule.scheduleType,
    fixedDays: [...(rule.fixedDays || [])],
    workDays: rule.workDays,
    restDays: rule.restDays,
    patternStartDate: rule.patternStartDate || '',
    scope,
    departmentId: rule.departmentId || '',
    userId: rule.userId || '',
    effectiveFrom: rule.effectiveFrom.split('T')[0],
    effectiveTo: rule.effectiveTo ? rule.effectiveTo.split('T')[0] : '',
  }
  showEditModal.value = true
}

const createRuleData = async () => {
  try {
    isSubmitting.value = true
    const payload: any = {
      name: ruleForm.value.name,
      scheduleType: ruleForm.value.scheduleType,
      effectiveFrom: ruleForm.value.effectiveFrom,
    }

    if (ruleForm.value.effectiveTo) {
      payload.effectiveTo = ruleForm.value.effectiveTo
    }

    if (ruleForm.value.scheduleType === 'FIXED_WEEKLY') {
      payload.fixedDays = ruleForm.value.fixedDays
    } else {
      payload.workDays = ruleForm.value.workDays
      payload.restDays = ruleForm.value.restDays
      payload.patternStartDate = ruleForm.value.patternStartDate
    }

    if (ruleForm.value.scope === 'department') {
      payload.departmentId = ruleForm.value.departmentId
    } else if (ruleForm.value.scope === 'user') {
      payload.userId = ruleForm.value.userId
    }

    await apiService.createRestDayRule(payload)
    await fetchRestDayRules()
    closeModal()
  } catch (err: any) {
    console.error('Failed to create rest day rule:', err)
    error.value = err.message || 'Failed to create rest day rule'
  } finally {
    isSubmitting.value = false
  }
}

const updateRuleData = async () => {
  if (!selectedRule.value) return
  try {
    isSubmitting.value = true
    const payload: any = {
      name: ruleForm.value.name,
      scheduleType: ruleForm.value.scheduleType,
      effectiveFrom: ruleForm.value.effectiveFrom,
    }

    if (ruleForm.value.effectiveTo) {
      payload.effectiveTo = ruleForm.value.effectiveTo
    }

    if (ruleForm.value.scheduleType === 'FIXED_WEEKLY') {
      payload.fixedDays = ruleForm.value.fixedDays
    } else {
      payload.workDays = ruleForm.value.workDays
      payload.restDays = ruleForm.value.restDays
      payload.patternStartDate = ruleForm.value.patternStartDate
    }

    if (ruleForm.value.scope === 'department') {
      payload.departmentId = ruleForm.value.departmentId
    } else if (ruleForm.value.scope === 'user') {
      payload.userId = ruleForm.value.userId
    }

    await apiService.updateRestDayRule(selectedRule.value.id, payload)
    await fetchRestDayRules()
    closeModal()
  } catch (err: any) {
    console.error('Failed to update rest day rule:', err)
    error.value = err.message || 'Failed to update rest day rule'
  } finally {
    isSubmitting.value = false
  }
}

const openDeleteModal = (rule: RestDayRule) => {
  ruleToDelete.value = rule
  showDeleteModal.value = true
  deleteError.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  ruleToDelete.value = null
  deleteError.value = null
}

const confirmDeleteRule = async () => {
  if (!ruleToDelete.value) return
  try {
    isDeleting.value = true
    deleteError.value = null
    await apiService.deleteRestDayRule(ruleToDelete.value.id)
    await fetchRestDayRules()
    closeDeleteModal()
  } catch (err: any) {
    console.error('Failed to delete rest day rule:', err)
    deleteError.value = err.message || 'Failed to delete rest day rule'
  } finally {
    isDeleting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedRule.value = null
  ruleForm.value = {
    name: '',
    scheduleType: '',
    fixedDays: [],
    workDays: null,
    restDays: null,
    patternStartDate: '',
    scope: 'branch',
    departmentId: '',
    userId: '',
    effectiveFrom: '',
    effectiveTo: '',
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

onMounted(() => {
  fetchRestDayRules()
  fetchDepartments()
  fetchAttendees()
})
</script>
