<script setup lang="ts">
const model = defineModel<string>()

defineProps<{
  placeholder?: string
  rows?: number
  disabled?: boolean
}>()
</script>

<template>
  <textarea
    v-model="model"
    :placeholder="placeholder"
    :rows="rows ?? 3"
    :disabled="disabled"
    class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
  />
</template>
