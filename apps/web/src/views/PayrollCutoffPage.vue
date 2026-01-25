<template>
  <PageLayout title="Payroll Cutoff" subtitle="Manage payroll periods and cutoff dates">
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
          <span class="ml-2 text-gray-600">Loading payroll cutoffs...</span>
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
            <h3 class="text-sm font-medium text-red-800">Error loading payroll cutoffs</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchPayrollCutoffs"
              class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payroll Cutoffs Table -->
    <div v-else class="px-4 py-6 sm:px-0">
      <!-- Current Cutoff Card -->
      <div v-if="currentCutoff" class="bg-white shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">Current Active Cutoff</h3>
              <p class="mt-1 text-sm text-gray-500">{{ currentCutoff.name }}</p>
            </div>
            <span
              :class="[
                'inline-flex px-3 py-1 text-sm font-semibold rounded-full',
                getStatusBadgeColor(currentCutoff.status),
              ]"
            >
              {{ currentCutoff.status }}
            </span>
          </div>
          <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Period Start</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDateTime(currentCutoff.periodStartDate, currentCutoff.periodStartTime) }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Period End</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDateTime(currentCutoff.periodEndDate, currentCutoff.periodEndTime) }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Release Date</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ currentCutoff.releaseDate ? formatDate(currentCutoff.releaseDate) : 'Not set' }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Actions</dt>
              <dd class="mt-1">
                <div class="flex space-x-2">
                  <button
                    v-if="currentCutoff.status === 'ACTIVE'"
                    @click="lockCutoff(currentCutoff)"
                    class="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                  >
                    Lock
                  </button>
                  <button
                    v-if="currentCutoff.status === 'LOCKED'"
                    @click="openUnlockModal(currentCutoff)"
                    class="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded"
                  >
                    Unlock
                  </button>
                  <button
                    v-if="currentCutoff.status === 'LOCKED'"
                    @click="releaseCutoff(currentCutoff)"
                    class="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Release
                  </button>
                </div>
              </dd>
            </div>
          </div>
        </div>
      </div>

      <!-- All Cutoffs Table -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              All Payroll Cutoffs ({{ totalCutoffs }} total)
            </h3>
            <button
              @click="showCreateModal = true"
              class="bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Create Cutoff Period
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
                    Cutoff Name
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Period
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Release Date
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
                <tr v-for="cutoff in paginatedCutoffs" :key="cutoff.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div
                          class="h-10 w-10 rounded-full flex items-center justify-center"
                          :class="getStatusIconColor(cutoff.status)"
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
                              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ cutoff.name }}</div>
                        <div class="text-sm text-gray-500">
                          Created {{ formatDate(cutoff.createdAt) }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ formatDate(cutoff.periodStartDate) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      to {{ formatDate(cutoff.periodEndDate) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getStatusBadgeColor(cutoff.status),
                      ]"
                    >
                      {{ cutoff.status }}
                    </span>
                    <div v-if="cutoff.lockedAt" class="text-xs text-gray-500 mt-1">
                      Locked: {{ formatDate(cutoff.lockedAt) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ cutoff.releaseDate ? formatDate(cutoff.releaseDate) : 'Not set' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-if="cutoff.status === 'DRAFT'"
                        @click="editCutoff(cutoff)"
                        class="text-palette-dark-blue hover:text-palette-medium-blue"
                      >
                        Edit
                      </button>
                      <button
                        v-if="cutoff.status === 'DRAFT'"
                        @click="activateCutoff(cutoff)"
                        class="text-green-600 hover:text-green-900"
                      >
                        Activate
                      </button>
                      <button
                        v-if="cutoff.status === 'ACTIVE'"
                        @click="lockCutoff(cutoff)"
                        class="text-yellow-600 hover:text-yellow-900"
                      >
                        Lock
                      </button>
                      <button
                        v-if="cutoff.status === 'LOCKED'"
                        @click="openUnlockModal(cutoff)"
                        class="text-orange-600 hover:text-orange-900"
                      >
                        Unlock
                      </button>
                      <button
                        v-if="cutoff.status === 'LOCKED'"
                        @click="releaseCutoff(cutoff)"
                        class="text-green-600 hover:text-green-900"
                      >
                        Release
                      </button>
                      <button
                        @click="viewAudit(cutoff)"
                        class="text-gray-600 hover:text-gray-900"
                      >
                        Audit
                      </button>
                      <button
                        v-if="cutoff.status === 'DRAFT'"
                        @click="openDeleteModal(cutoff)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="payrollCutoffs.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    No payroll cutoffs found. Create one to get started.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
            <div class="flex items-center text-sm text-gray-700">
              <span
                >Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalCutoffs }} results</span
              >
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

    <!-- Create/Edit Cutoff Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showEditModal ? 'Edit Payroll Cutoff' : 'Create New Payroll Cutoff' }}
          </h3>
          <form @submit.prevent="showEditModal ? updateCutoffData() : createCutoffData()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Cutoff Name *</label>
                <input
                  v-model="cutoffForm.name"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  placeholder="e.g., January 2025 - First Half"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Period Start Date *</label>
                  <input
                    v-model="cutoffForm.periodStartDate"
                    type="date"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Period Start Time *</label>
                  <input
                    v-model="cutoffForm.periodStartTime"
                    type="time"
                    step="1"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Period End Date *</label>
                  <input
                    v-model="cutoffForm.periodEndDate"
                    type="date"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Period End Time *</label>
                  <input
                    v-model="cutoffForm.periodEndTime"
                    type="time"
                    step="1"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Release Date (optional)</label>
                <input
                  v-model="cutoffForm.releaseDate"
                  type="date"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                />
                <p class="mt-1 text-xs text-gray-500">
                  The expected date when payroll will be released to employees
                </p>
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

    <!-- Unlock Modal (requires reason) -->
    <div
      v-if="showUnlockModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Unlock Payroll Cutoff</h3>
          <p class="text-sm text-gray-500 mb-4">
            You are about to unlock "{{ cutoffToUnlock?.name }}". This action will be logged in the
            audit trail.
          </p>
          <form @submit.prevent="confirmUnlock">
            <div>
              <label class="block text-sm font-medium text-gray-700">Reason for unlocking *</label>
              <textarea
                v-model="unlockReason"
                rows="3"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                placeholder="Please provide a reason for unlocking this cutoff..."
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="closeUnlockModal"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {{ isSubmitting ? 'Unlocking...' : 'Unlock Cutoff' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Audit Log Modal -->
    <div
      v-if="showAuditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeAuditModal"
    >
      <div
        class="relative top-10 mx-auto p-5 border w-[700px] shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Audit Log - {{ cutoffForAudit?.name }}
            </h3>
            <button @click="closeAuditModal" class="text-gray-400 hover:text-gray-600">
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

          <div v-if="isLoadingAudit" class="flex items-center justify-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-palette-dark-blue"
            ></div>
            <span class="ml-2 text-gray-600">Loading audit log...</span>
          </div>

          <div v-else-if="auditLogs.length === 0" class="text-center py-8 text-gray-500">
            No audit logs found for this cutoff.
          </div>

          <div v-else class="max-h-96 overflow-y-auto">
            <div
              v-for="log in auditLogs"
              :key="log.id"
              class="border-b border-gray-200 py-3 last:border-0"
            >
              <div class="flex items-start justify-between">
                <div>
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      getAuditActionColor(log.action),
                    ]"
                  >
                    {{ log.action }}
                  </span>
                  <span class="ml-2 text-sm text-gray-600">
                    by {{ log.performer?.profile?.name || log.performer?.profile?.email || 'Unknown' }}
                  </span>
                </div>
                <span class="text-xs text-gray-500">
                  {{ formatDateTime(log.performedAt, '') }}
                </span>
              </div>
              <div v-if="log.reason" class="mt-2 text-sm text-gray-600">
                <span class="font-medium">Reason:</span> {{ log.reason }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Cutoff Confirmation Modal -->
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
            <h3 class="text-lg font-medium text-gray-900">Delete Payroll Cutoff</h3>
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
            <h3 class="mt-2 text-sm font-medium text-gray-900">Delete Payroll Cutoff</h3>
            <p class="mt-1 text-sm text-gray-500">
              Are you sure you want to delete "{{ cutoffToDelete?.name }}"? This action cannot be
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
                <h3 class="text-sm font-medium text-red-800">Error deleting cutoff</h3>
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
              @click="confirmDeleteCutoff"
              :disabled="isDeleting"
              class="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              <span v-if="isDeleting">Deleting...</span>
              <span v-else>Delete Cutoff</span>
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
import type { PayrollCutoff, PayrollCutoffStatus, AuditLog, AuditAction } from '../types'

const router = useRouter()

// State
const payrollCutoffs = ref<PayrollCutoff[]>([])
const currentCutoff = ref<PayrollCutoff | null>(null)
const auditLogs = ref<AuditLog[]>([])
const isLoading = ref(false)
const isLoadingAudit = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showUnlockModal = ref(false)
const showAuditModal = ref(false)
const isSubmitting = ref(false)
const selectedCutoff = ref<PayrollCutoff | null>(null)
const cutoffToDelete = ref<PayrollCutoff | null>(null)
const cutoffToUnlock = ref<PayrollCutoff | null>(null)
const cutoffForAudit = ref<PayrollCutoff | null>(null)
const deleteError = ref<string | null>(null)
const isDeleting = ref(false)
const unlockReason = ref('')

// Form data
const cutoffForm = ref({
  name: '',
  periodStartDate: '',
  periodStartTime: '00:00:00',
  periodEndDate: '',
  periodEndTime: '23:59:59',
  releaseDate: '',
})

// Computed
const totalCutoffs = computed(() => payrollCutoffs.value.length)
const totalPages = computed(() => Math.ceil(totalCutoffs.value / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalCutoffs.value))
const paginatedCutoffs = computed(() => {
  return payrollCutoffs.value.slice(startIndex.value, endIndex.value)
})

// Methods
const fetchPayrollCutoffs = async () => {
  try {
    isLoading.value = true
    error.value = null
    const [cutoffs, current] = await Promise.all([
      apiService.getPayrollCutoffs(),
      apiService.getCurrentPayrollCutoff(),
    ])
    payrollCutoffs.value = cutoffs
    currentCutoff.value = current
  } catch (err: any) {
    console.error('Failed to fetch payroll cutoffs:', err)
    error.value = err.message || 'Failed to fetch payroll cutoffs'
  } finally {
    isLoading.value = false
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

const formatDateTime = (dateString: string, timeString: string): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  if (timeString) {
    return `${formattedDate} ${timeString}`
  }
  return `${formattedDate} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
}

const getStatusBadgeColor = (status: PayrollCutoffStatus): string => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800'
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-800'
    case 'LOCKED':
      return 'bg-yellow-100 text-yellow-800'
    case 'RELEASED':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIconColor = (status: PayrollCutoffStatus): string => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-500'
    case 'ACTIVE':
      return 'bg-blue-500'
    case 'LOCKED':
      return 'bg-yellow-500'
    case 'RELEASED':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

const getAuditActionColor = (action: AuditAction): string => {
  switch (action) {
    case 'CREATE':
      return 'bg-green-100 text-green-800'
    case 'UPDATE':
      return 'bg-blue-100 text-blue-800'
    case 'DELETE':
      return 'bg-red-100 text-red-800'
    case 'LOCK':
      return 'bg-yellow-100 text-yellow-800'
    case 'UNLOCK':
      return 'bg-orange-100 text-orange-800'
    case 'OVERRIDE':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const editCutoff = (cutoff: PayrollCutoff) => {
  selectedCutoff.value = cutoff
  cutoffForm.value = {
    name: cutoff.name,
    periodStartDate: cutoff.periodStartDate.split('T')[0],
    periodStartTime: cutoff.periodStartTime,
    periodEndDate: cutoff.periodEndDate.split('T')[0],
    periodEndTime: cutoff.periodEndTime,
    releaseDate: cutoff.releaseDate ? cutoff.releaseDate.split('T')[0] : '',
  }
  showEditModal.value = true
}

const createCutoffData = async () => {
  try {
    isSubmitting.value = true
    await apiService.createPayrollCutoff({
      name: cutoffForm.value.name,
      periodStartDate: cutoffForm.value.periodStartDate,
      periodStartTime: cutoffForm.value.periodStartTime || '00:00:00',
      periodEndDate: cutoffForm.value.periodEndDate,
      periodEndTime: cutoffForm.value.periodEndTime || '23:59:59',
      releaseDate: cutoffForm.value.releaseDate || undefined,
    })
    await fetchPayrollCutoffs()
    closeModal()
  } catch (err: any) {
    console.error('Failed to create payroll cutoff:', err)
    error.value = err.message || 'Failed to create payroll cutoff'
  } finally {
    isSubmitting.value = false
  }
}

const updateCutoffData = async () => {
  if (!selectedCutoff.value) return
  try {
    isSubmitting.value = true
    await apiService.updatePayrollCutoff(selectedCutoff.value.id, {
      name: cutoffForm.value.name,
      periodStartDate: cutoffForm.value.periodStartDate,
      periodStartTime: cutoffForm.value.periodStartTime || '00:00:00',
      periodEndDate: cutoffForm.value.periodEndDate,
      periodEndTime: cutoffForm.value.periodEndTime || '23:59:59',
      releaseDate: cutoffForm.value.releaseDate || undefined,
    })
    await fetchPayrollCutoffs()
    closeModal()
  } catch (err: any) {
    console.error('Failed to update payroll cutoff:', err)
    error.value = err.message || 'Failed to update payroll cutoff'
  } finally {
    isSubmitting.value = false
  }
}

const activateCutoff = async (cutoff: PayrollCutoff) => {
  try {
    await apiService.activatePayrollCutoff(cutoff.id)
    await fetchPayrollCutoffs()
  } catch (err: any) {
    console.error('Failed to activate cutoff:', err)
    error.value = err.message || 'Failed to activate cutoff'
  }
}

const lockCutoff = async (cutoff: PayrollCutoff) => {
  try {
    await apiService.lockPayrollCutoff(cutoff.id)
    await fetchPayrollCutoffs()
  } catch (err: any) {
    console.error('Failed to lock cutoff:', err)
    error.value = err.message || 'Failed to lock cutoff'
  }
}

const openUnlockModal = (cutoff: PayrollCutoff) => {
  cutoffToUnlock.value = cutoff
  unlockReason.value = ''
  showUnlockModal.value = true
}

const closeUnlockModal = () => {
  showUnlockModal.value = false
  cutoffToUnlock.value = null
  unlockReason.value = ''
}

const confirmUnlock = async () => {
  if (!cutoffToUnlock.value || !unlockReason.value.trim()) return
  try {
    isSubmitting.value = true
    await apiService.unlockPayrollCutoff(cutoffToUnlock.value.id, unlockReason.value)
    await fetchPayrollCutoffs()
    closeUnlockModal()
  } catch (err: any) {
    console.error('Failed to unlock cutoff:', err)
    error.value = err.message || 'Failed to unlock cutoff'
  } finally {
    isSubmitting.value = false
  }
}

const releaseCutoff = async (cutoff: PayrollCutoff) => {
  try {
    await apiService.releasePayrollCutoff(cutoff.id)
    await fetchPayrollCutoffs()
  } catch (err: any) {
    console.error('Failed to release cutoff:', err)
    error.value = err.message || 'Failed to release cutoff'
  }
}

const viewAudit = async (cutoff: PayrollCutoff) => {
  cutoffForAudit.value = cutoff
  showAuditModal.value = true
  isLoadingAudit.value = true
  try {
    const logs = await apiService.getPayrollCutoffAudit(cutoff.id)
    auditLogs.value = logs
  } catch (err: any) {
    console.error('Failed to fetch audit logs:', err)
  } finally {
    isLoadingAudit.value = false
  }
}

const closeAuditModal = () => {
  showAuditModal.value = false
  cutoffForAudit.value = null
  auditLogs.value = []
}

const openDeleteModal = (cutoff: PayrollCutoff) => {
  cutoffToDelete.value = cutoff
  showDeleteModal.value = true
  deleteError.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  cutoffToDelete.value = null
  deleteError.value = null
}

const confirmDeleteCutoff = async () => {
  if (!cutoffToDelete.value) return
  try {
    isDeleting.value = true
    deleteError.value = null
    await apiService.deletePayrollCutoff(cutoffToDelete.value.id)
    await fetchPayrollCutoffs()
    closeDeleteModal()
  } catch (err: any) {
    console.error('Failed to delete cutoff:', err)
    deleteError.value = err.message || 'Failed to delete cutoff'
  } finally {
    isDeleting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedCutoff.value = null
  cutoffForm.value = {
    name: '',
    periodStartDate: '',
    periodStartTime: '00:00:00',
    periodEndDate: '',
    periodEndTime: '23:59:59',
    releaseDate: '',
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
  fetchPayrollCutoffs()
})
</script>
