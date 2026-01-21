<template>
  <div class="min-h-screen bg-palette-off-white">
    <!-- Navigation Header -->
    <AppHeader />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
            <p v-if="subtitle" class="mt-1 text-sm text-gray-600">{{ subtitle }}</p>
          </div>
          <slot name="header-actions"></slot>
        </div>
      </div>

      <!-- Page Content -->
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  title: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
})
</script>
