<script setup lang="ts">
defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="['rounded-xl border border-border bg-card text-card-foreground shadow-xs', $props.class]">
    <slot />
  </div>
</template>
