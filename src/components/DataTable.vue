<template>
  <div class="bg-white shadow rounded-lg">
    <!-- Table Header -->
    <div class="px-4 py-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {{ title }} ({{ totalItems }} total)
        </h3>
        <slot name="header-actions"></slot>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-palette-dark-blue"></div>
        <span class="ml-2 text-gray-600">{{ loadingText }}</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
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
            <h3 class="text-sm font-medium text-red-800">{{ errorTitle }}</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              v-if="onRetry"
              @click="onRetry"
              class="mt-2 bg-palette-medium-blue hover:bg-palette-light-beige text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                scope="col"
                :class="[
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.headerClass || '',
                ]"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in items" :key="item.id || index">
              <td
                v-for="column in columns"
                :key="column.key"
                :class="['px-6 py-4 whitespace-nowrap', column.cellClass || '']"
              >
                <slot :name="`cell-${column.key}`" :item="item" :column="column">
                  {{ getCellValue(item, column) }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="showPagination && totalPages > 1" class="flex items-center justify-between mt-6">
        <div class="flex items-center text-sm text-gray-700">
          <span> Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalItems }} results </span>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="onPreviousPage"
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
          <span class="text-sm text-gray-700"> Page {{ currentPage }} of {{ totalPages }} </span>
          <button
            @click="onNextPage"
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
</template>

<script setup lang="ts">
// Types
interface TableColumn {
  key: string
  label: string
  headerClass?: string
  cellClass?: string
  formatter?: (value: any, item: any) => string
}

interface Props {
  title: string
  columns: TableColumn[]
  items: any[]
  totalItems: number
  loading?: boolean
  loadingText?: string
  error?: string | null
  errorTitle?: string
  showPagination?: boolean
  currentPage?: number
  totalPages?: number
  startIndex?: number
  endIndex?: number
}

interface Emits {
  (e: 'retry'): void
  (e: 'previous-page'): void
  (e: 'next-page'): void
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: 'Loading...',
  errorTitle: 'Error loading data',
  showPagination: false,
  currentPage: 1,
  totalPages: 1,
  startIndex: 0,
  endIndex: 0,
})

// Emits
const emit = defineEmits<Emits>()

// Methods
const getCellValue = (item: any, column: TableColumn): string => {
  const value = item[column.key]

  if (column.formatter) {
    return column.formatter(value, item)
  }

  return value || ''
}

const onRetry = () => {
  emit('retry')
}

const onPreviousPage = () => {
  emit('previous-page')
}

const onNextPage = () => {
  emit('next-page')
}
</script>
