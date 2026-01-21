<template>
  <PageLayout title="Department Details" subtitle="View department information and members">
    <template #header-actions>
      <div class="flex items-center space-x-3">
        <button
          v-if="!department?.shift"
          @click="openManageShiftModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Manage Shift
        </button>

        <button
          @click="openUpdateModal"
          class="bg-palette-medium-blue hover:bg-palette-light-beige text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Update
        </button>

        <button
          @click="openDeleteModal"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Delete
        </button>
        <button
          @click="router.push('/departments')"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Back to Departments
        </button>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isLoading" class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-palette-dark-blue"></div>
          <span class="ml-2 text-gray-600">Loading department details...</span>
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
            <h3 class="text-sm font-medium text-red-800">Error loading department details</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchDepartmentDetail"
              class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Department Details -->
    <div v-else-if="department" class="px-4 py-6 sm:px-0">
      <!-- Department Information Card -->
      <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center mb-6">
            <div class="flex-shrink-0 h-16 w-16">
              <div
                class="h-16 w-16 rounded-full bg-palette-dark-blue flex items-center justify-center"
              >
                <span class="text-xl font-medium text-white">
                  {{ getInitials(department.name) }}
                </span>
              </div>
            </div>
            <div class="ml-6">
              <h3 class="text-2xl font-bold text-gray-900">{{ department.name }}</h3>
              <p class="text-sm text-gray-500">Department ID: {{ department.id }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Description</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ department.description || 'No description provided' }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Branch ID</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ department.branchId }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Created</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(department.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(department.updatedAt) }}</dd>
            </div>
          </div>

          <!-- Shift Information -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-medium text-gray-900">Shift Information</h4>
              <button
                v-if="!department.shift"
                @click="openManageShiftModal"
                class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Assign Shift
              </button>
            </div>

            <div v-if="department.shift" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Shift Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ department.shift.name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Shift Description</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ department.shift.description || 'No description provided' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Start Time</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ formatTime(department.shift.startTime) }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">End Time</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ formatTime(department.shift.endTime) }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Default Shift</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      department.shift.isDefault
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800',
                    ]"
                  >
                    {{ department.shift.isDefault ? 'Yes' : 'No' }}
                  </span>
                </dd>
              </div>
            </div>

            <!-- No Shift Assigned State -->
            <div v-else class="text-center py-8">
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No shift assigned</h3>
              <p class="mt-1 text-sm text-gray-500">
                This department doesn't have a shift assigned yet.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Members Section -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Department Members ({{ department.users.length }} total)
            </h3>

            <button
              @click="openAddUserModal"
              class="bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Users
            </button>
          </div>

          <!-- Members Table -->
          <div v-if="department.users.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Member
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
                  <!-- <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th> -->
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in paginatedUsers" :key="user.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div
                          class="h-10 w-10 rounded-full bg-palette-medium-blue flex items-center justify-center"
                        >
                          <span class="text-sm font-medium text-white">
                            {{ getInitials(getUserName(user.id)) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ getUserName(user.id) }}
                        </div>
                        <div class="text-sm text-gray-500">
                          Device ID: {{ user.deviceEnrollId }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ user.deviceEnrollId }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ user.type.join(', ') }}
                  </td>
                  <!-- <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        user.deviceIsEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800',
                      ]"
                    >
                      {{ user.deviceIsEnabled ? 'Active' : 'Inactive' }}
                    </span>
                  </td> -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(user.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="removeUser(user.id)"
                      :disabled="isRemovingUser === user.id"
                      class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span v-if="isRemovingUser === user.id">Removing...</span>
                      <span v-else>Remove</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination for Members -->
            <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
              <div class="flex items-center text-sm text-gray-700">
                <span>
                  Showing {{ startIndex + 1 }} to {{ endIndex }} of
                  {{ department.users.length }} members
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

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No members</h3>
            <p class="mt-1 text-sm text-gray-500">This department doesn't have any members yet.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <div
      v-if="showAddUserModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeAddUserModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Add Users to Department</h3>
            <button @click="closeAddUserModal" class="text-gray-400 hover:text-gray-600">
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

          <!-- Loading State for Available Users -->
          <div v-if="isLoadingAvailableUsers" class="flex items-center justify-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-palette-dark-blue"
            ></div>
            <span class="ml-2 text-gray-600">Loading available users...</span>
          </div>

          <!-- Available Users List -->
          <div v-else-if="availableUsers.length > 0" class="max-h-96 overflow-y-auto">
            <div class="space-y-2">
              <div
                v-for="user in availableUsers"
                :key="user.id"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div
                      class="h-10 w-10 rounded-full bg-palette-dark-blue flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-white">
                        {{ getInitials(user.profile.name) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.profile.name || 'No Name' }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ user.profile.email || 'No Email' }}
                    </div>
                    <div class="text-xs text-gray-400">Device ID: {{ user.deviceEnrollId }}</div>
                  </div>
                </div>
                <button
                  @click="addUser(user.id)"
                  :disabled="isAddingUser === user.id"
                  class="bg-palette-dark-blue hover:bg-palette-medium-blue disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  <span v-if="isAddingUser === user.id">Adding...</span>
                  <span v-else>Add</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State for Available Users -->
          <div v-else class="text-center py-8">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No available users</h3>
            <p class="mt-1 text-sm text-gray-500">
              All users are already assigned to this department or other departments.
            </p>
          </div>

          <!-- Error State for Available Users -->
          <div
            v-if="availableUsersError"
            class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4"
          >
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
                <h3 class="text-sm font-medium text-red-800">Error loading available users</h3>
                <p class="mt-1 text-sm text-red-700">{{ availableUsersError }}</p>
                <button
                  @click="fetchAvailableUsers"
                  class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Department Modal -->
    <div
      v-if="showUpdateModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeUpdateModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Update Department</h3>
            <button @click="closeUpdateModal" class="text-gray-400 hover:text-gray-600">
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

          <form @submit.prevent="updateDepartment" class="space-y-4">
            <div>
              <label for="departmentName" class="block text-sm font-medium text-gray-700">
                Department Name
              </label>
              <input
                id="departmentName"
                v-model="updateForm.name"
                type="text"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                placeholder="Enter department name"
              />
            </div>

            <div>
              <label for="departmentDescription" class="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="departmentDescription"
                v-model="updateForm.description"
                rows="3"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                placeholder="Enter department description"
              ></textarea>
            </div>

            <!-- Error Message -->
            <div v-if="updateError" class="bg-red-50 border border-red-200 rounded-lg p-4">
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
                  <h3 class="text-sm font-medium text-red-800">Error updating department</h3>
                  <p class="mt-1 text-sm text-red-700">{{ updateError }}</p>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeUpdateModal"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isUpdating"
                class="bg-palette-medium-blue hover:bg-palette-light-beige disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <span v-if="isUpdating">Updating...</span>
                <span v-else>Update Department</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Department Confirmation Modal -->
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
            <h3 class="text-lg font-medium text-gray-900">Delete Department</h3>
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
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Delete Department</h3>
            <p class="mt-1 text-sm text-gray-500">
              Are you sure you want to delete the department "{{ department?.name }}"? This action
              cannot be undone.
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
                <h3 class="text-sm font-medium text-red-800">Error deleting department</h3>
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
              @click="confirmDeleteDepartment"
              :disabled="isDeleting"
              class="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              <span v-if="isDeleting">Deleting...</span>
              <span v-else>Delete Department</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Manage Shift Modal -->
    <div
      v-if="showManageShiftModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ isUpdateMode ? 'Edit Shift' : 'Manage Shift' }}
          </h3>

          <!-- Mode Selection -->
          <div v-if="!isUpdateMode" class="mb-6">
            <div class="flex space-x-4">
              <button
                @click="setShiftMode('create')"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  shiftMode === 'create'
                    ? 'bg-palette-dark-blue text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                ]"
              >
                Create New Shift
              </button>
              <button
                @click="setShiftMode('assign')"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  shiftMode === 'assign'
                    ? 'bg-palette-dark-blue text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                ]"
              >
                Assign Existing Shift
              </button>
            </div>
          </div>

          <!-- Assign Existing Shift -->
          <div v-if="!isUpdateMode && shiftMode === 'assign'">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Select Shift</label>
                <select
                  v-model="selectedShiftId"
                  :disabled="availableShifts.length === 0"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue disabled:bg-gray-100"
                >
                  <option value="">
                    {{
                      availableShifts.length === 0 ? 'No available shifts...' : 'Choose a shift...'
                    }}
                  </option>
                  <option v-for="shift in availableShifts" :key="shift.id" :value="shift.id">
                    {{ shift.name }} ({{ formatTime(shift.startTime) }} -
                    {{ formatTime(shift.endTime) }})
                  </option>
                </select>
                <p v-if="availableShifts.length === 0" class="mt-1 text-sm text-gray-500">
                  All shifts are already assigned to departments.
                </p>
              </div>

              <!-- Error Message -->
              <div v-if="manageShiftError" class="bg-red-50 border border-red-200 rounded-lg p-4">
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
                    <h3 class="text-sm font-medium text-red-800">Error assigning shift</h3>
                    <p class="mt-1 text-sm text-red-700">{{ manageShiftError }}</p>
                  </div>
                </div>
              </div>

              <div class="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  @click="closeManageShiftModal"
                  class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  @click="assignExistingShift"
                  :disabled="!selectedShiftId || isManagingShift"
                  class="bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {{ isManagingShift ? 'Assigning...' : 'Assign Shift' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Create New Shift or Update Existing -->
          <form v-else @submit.prevent="handleShiftSubmit">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input
                  v-model="shiftForm.name"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  v-model="shiftForm.description"
                  rows="3"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                ></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Start Time (24-hour format, HH:MM:SS)</label
                  >
                  <input
                    v-model="shiftForm.startTime"
                    type="time"
                    step="1"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                    style="font-family: monospace"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >End Time (24-hour format, HH:MM:SS)</label
                  >
                  <input
                    v-model="shiftForm.endTime"
                    type="time"
                    step="1"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-palette-dark-blue focus:border-palette-dark-blue"
                    style="font-family: monospace"
                  />
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="manageShiftError"
              class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4"
            >
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
                  <h3 class="text-sm font-medium text-red-800">
                    Error {{ isUpdateMode ? 'updating' : 'creating' }} shift
                  </h3>
                  <p class="mt-1 text-sm text-red-700">{{ manageShiftError }}</p>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="closeManageShiftModal"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isManagingShift"
                class="bg-palette-dark-blue hover:bg-palette-medium-blue text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {{
                  isManagingShift
                    ? isUpdateMode
                      ? 'Updating...'
                      : 'Creating...'
                    : isUpdateMode
                      ? 'Update'
                      : 'Create'
                }}
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
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api'
import type { DepartmentDetail, Attendee, DepartmentUser, Shift } from '../types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const profile = computed(() => authStore.profile)

// State
const department = ref<DepartmentDetail | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

// Add/Remove User State
const showAddUserModal = ref(false)
const availableUsers = ref<Attendee[]>([])
const allBranchUsers = ref<Attendee[]>([]) // Store all branch users for name lookup
const isLoadingAvailableUsers = ref(false)
const availableUsersError = ref<string | null>(null)
const isAddingUser = ref<string | null>(null)
const isRemovingUser = ref<string | null>(null)

// Update Department State
const showUpdateModal = ref(false)
const updateForm = ref({
  name: '',
  description: '',
})
const updateError = ref<string | null>(null)
const isUpdating = ref(false)

// Delete Department State
const showDeleteModal = ref(false)
const deleteError = ref<string | null>(null)
const isDeleting = ref(false)

// Manage Shift State
const showManageShiftModal = ref(false)
const isUpdateMode = ref(false)
const shiftMode = ref<'create' | 'assign'>('create')
const shiftForm = ref({
  name: '',
  description: '',
  startTime: '',
  endTime: '',
})
const availableShifts = ref<Shift[]>([])
const selectedShiftId = ref('')
const manageShiftError = ref<string | null>(null)
const isManagingShift = ref(false)

// Computed
const totalPages = computed(() => Math.ceil((department.value?.users.length || 0) / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() =>
  Math.min(startIndex.value + itemsPerPage, department.value?.users.length || 0),
)
const paginatedUsers = computed(() => {
  if (!department.value) return []
  return department.value.users.slice(startIndex.value, endIndex.value)
})

// Methods
const fetchDepartmentDetail = async () => {
  const departmentId = route.params.id as string
  if (!departmentId) {
    error.value = 'Department ID is required'
    return
  }

  try {
    isLoading.value = true
    error.value = null
    const data = await apiService.getDepartmentDetail(departmentId)
    department.value = data
    updateForm.value = {
      name: data.name,
      description: data.description,
    }
  } catch (err: any) {
    console.error('Failed to fetch department detail:', err)
    error.value = err.message || 'Failed to fetch department details'
  } finally {
    isLoading.value = false
  }
}

const fetchAvailableUsers = async () => {
  try {
    isLoadingAvailableUsers.value = true
    availableUsersError.value = null

    // Use existing allBranchUsers if available, otherwise fetch
    if (allBranchUsers.value.length === 0) {
      const allUsers = await apiService.getAllBranchAttendees()
      allBranchUsers.value = allUsers
    }

    availableUsers.value = allBranchUsers.value.filter((user) => !user.department)
  } catch (err: any) {
    console.error('Failed to fetch available users:', err)
    availableUsersError.value = err.message || 'Failed to fetch available users'
  } finally {
    isLoadingAvailableUsers.value = false
  }
}

// Helper function to get user name by ID
const getUserName = (userId: string): string => {
  const user = allBranchUsers.value.find((u) => u.id === userId)
  return user?.profile?.name || 'No Name'
}

const openAddUserModal = async () => {
  showAddUserModal.value = true
  await fetchAvailableUsers()
}

const closeAddUserModal = () => {
  showAddUserModal.value = false
  availableUsers.value = []
  availableUsersError.value = null
}

const addUser = async (userId: string) => {
  const departmentId = route.params.id as string
  if (!departmentId) return

  try {
    isAddingUser.value = userId
    const updatedDepartment = await apiService.addUserToDepartment(departmentId, userId)
    department.value = updatedDepartment

    // Remove the user from available users list
    availableUsers.value = availableUsers.value.filter((user) => user.id !== userId)
  } catch (err: any) {
    console.error('Failed to add user to department:', err)
    // You might want to show a toast notification here
  } finally {
    isAddingUser.value = null
  }
}

const removeUser = async (userId: string) => {
  const departmentId = route.params.id as string
  if (!departmentId) return

  try {
    isRemovingUser.value = userId
    await apiService.removeUserFromDepartment(departmentId, userId)

    // Refresh department details to get updated user list
    await fetchDepartmentDetail()
  } catch (err: any) {
    console.error('Failed to remove user from department:', err)
    // You might want to show a toast notification here
  } finally {
    isRemovingUser.value = null
  }
}

const getInitials = (name: string | null): string => {
  if (!name) return '?'
  // If it's a UUID (user ID), take first 2 characters
  if (name.includes('-')) {
    return name.substring(0, 2).toUpperCase()
  }
  // Otherwise treat as name
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatTime = (timeString: string): string => {
  return timeString.substring(0, 8) // Return HH:mm:ss format
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

const openUpdateModal = () => {
  showUpdateModal.value = true
  updateForm.value = {
    name: department.value?.name || '',
    description: department.value?.description || '',
  }
  updateError.value = null
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
  updateForm.value = {
    name: '',
    description: '',
  }
  updateError.value = null
}

const updateDepartment = async () => {
  const departmentId = route.params.id as string
  if (!departmentId) return

  try {
    isUpdating.value = true
    updateError.value = null
    const updatedDepartment = await apiService.updateDepartment(departmentId, updateForm.value)
    department.value = updatedDepartment
    closeUpdateModal()
  } catch (err: any) {
    console.error('Failed to update department:', err)
    updateError.value = err.message || 'Failed to update department'
  } finally {
    isUpdating.value = false
  }
}

const openDeleteModal = () => {
  showDeleteModal.value = true
  deleteError.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteError.value = null
}

const confirmDeleteDepartment = async () => {
  const departmentId = route.params.id as string
  if (!departmentId) return

  try {
    isDeleting.value = true
    deleteError.value = null
    await apiService.deleteDepartment(departmentId)
    router.push('/departments')
  } catch (err: any) {
    console.error('Failed to delete department:', err)
    deleteError.value = err.message || 'Failed to delete department'
  } finally {
    isDeleting.value = false
  }
}

onMounted(async () => {
  await fetchDepartmentDetail()
  await fetchAllBranchUsers()
})

const fetchAllBranchUsers = async () => {
  try {
    const allUsers = await apiService.getAllBranchAttendees()
    allBranchUsers.value = allUsers
  } catch (err: any) {
    console.error('Failed to fetch all branch users:', err)
  }
}

// Shift Management Methods
const openManageShiftModal = async () => {
  showManageShiftModal.value = true
  manageShiftError.value = null

  // Determine if we're in update mode
  isUpdateMode.value = !!department.value?.shift

  if (isUpdateMode.value) {
    // Pre-fill form with existing shift data
    shiftForm.value = {
      name: department.value!.shift.name,
      description: department.value!.shift.description || '',
      startTime: formatTimeForInput(department.value!.shift.startTime),
      endTime: formatTimeForInput(department.value!.shift.endTime),
    }
  } else {
    // Reset form for create mode
    shiftForm.value = {
      name: '',
      description: '',
      startTime: '',
      endTime: '',
    }
    shiftMode.value = 'create'
    selectedShiftId.value = ''

    // Fetch available shifts for assignment
    await fetchAvailableShifts()
  }
}

const closeManageShiftModal = () => {
  showManageShiftModal.value = false
  isUpdateMode.value = false
  shiftMode.value = 'create'
  shiftForm.value = {
    name: '',
    description: '',
    startTime: '',
    endTime: '',
  }
  selectedShiftId.value = ''
  availableShifts.value = []
  manageShiftError.value = null
}

const setShiftMode = (mode: 'create' | 'assign') => {
  shiftMode.value = mode
  manageShiftError.value = null
  if (mode === 'assign') {
    fetchAvailableShifts()
  }
}

const fetchAvailableShifts = async () => {
  try {
    const allShifts = await apiService.getShifts()
    // Filter out shifts that are already assigned to this department
    availableShifts.value = allShifts.filter(
      (shift) => !shift.departments.some((dept) => dept.id === route.params.id),
    )
  } catch (err: any) {
    console.error('Failed to fetch available shifts:', err)
    manageShiftError.value = err.message || 'Failed to fetch available shifts'
  }
}

const handleShiftSubmit = async () => {
  if (isUpdateMode.value) {
    await updateShift()
  } else {
    await createShift()
  }
}

const createShift = async () => {
  const departmentId = route.params.id as string
  if (!departmentId) return

  try {
    isManagingShift.value = true
    manageShiftError.value = null

    // Ensure times are in 24-hour format
    const shiftData = {
      name: shiftForm.value.name,
      description: shiftForm.value.description,
      startTime: ensure24HourFormat(shiftForm.value.startTime),
      endTime: ensure24HourFormat(shiftForm.value.endTime),
    }

    // Create the shift first
    const newShift = await apiService.createShift(shiftData)

    // Then tag the department to the shift
    await apiService.tagDepartmentToShift(newShift.id, departmentId)

    // Refresh department details to show the new shift
    await fetchDepartmentDetail()
    closeManageShiftModal()
  } catch (err: any) {
    console.error('Failed to create shift:', err)
    manageShiftError.value = err.message || 'Failed to create shift'
  } finally {
    isManagingShift.value = false
  }
}

const updateShift = async () => {
  if (!department.value?.shift) return

  try {
    isManagingShift.value = true
    manageShiftError.value = null

    // Ensure times are in 24-hour format
    const shiftData = {
      name: shiftForm.value.name,
      description: shiftForm.value.description,
      startTime: ensure24HourFormat(shiftForm.value.startTime),
      endTime: ensure24HourFormat(shiftForm.value.endTime),
    }

    // Update the shift
    await apiService.updateShift(department.value.shift.id, shiftData)

    // Refresh department details to show the updated shift
    await fetchDepartmentDetail()
    closeManageShiftModal()
  } catch (err: any) {
    console.error('Failed to update shift:', err)
    manageShiftError.value = err.message || 'Failed to update shift'
  } finally {
    isManagingShift.value = false
  }
}

const assignExistingShift = async () => {
  const departmentId = route.params.id as string
  if (!departmentId || !selectedShiftId.value) return

  try {
    isManagingShift.value = true
    manageShiftError.value = null

    // Tag the department to the selected shift
    await apiService.tagDepartmentToShift(selectedShiftId.value, departmentId)

    // Refresh department details to show the assigned shift
    await fetchDepartmentDetail()
    closeManageShiftModal()
  } catch (err: any) {
    console.error('Failed to assign shift:', err)
    manageShiftError.value = err.message || 'Failed to assign shift'
  } finally {
    isManagingShift.value = false
  }
}

// Helper function to format time for input field
const formatTimeForInput = (timeString: string): string => {
  // Ensure time is in HH:mm:ss format for input fields
  const time = timeString.includes('T') ? timeString.split('T')[1] : timeString
  return time.substring(0, 8) // Return HH:mm:ss format
}

const ensure24HourFormat = (timeString: string): string => {
  // Convert any time format to 24-hour format with seconds
  if (!timeString) return timeString

  // If already in HH:mm:ss format, return as is
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
    return timeString
  }

  // If in HH:mm format, add seconds
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return `${timeString}:00`
  }

  // If in 12-hour format with AM/PM, convert to 24-hour with seconds
  if (timeString.includes('AM') || timeString.includes('PM')) {
    const [time, period] = timeString.split(' ')
    const [hours, minutes] = time.split(':')
    let hour24 = parseInt(hours)

    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0
    }

    return `${hour24.toString().padStart(2, '0')}:${minutes}:00`
  }

  return timeString
}
</script>

<style scoped>
/* Additional custom styles can be added here */

/* Force 24-hour format for time inputs */
input[type='time']::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

/* Ensure time inputs display in 24-hour format */
input[type='time'] {
  direction: ltr;
}

/* Custom styling for time inputs to emphasize 24-hour format */
input[type='time']::before {
  content: '24h';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #6b7280;
  pointer-events: none;
}
</style>
