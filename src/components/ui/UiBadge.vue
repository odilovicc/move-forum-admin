<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  }>(),
  { variant: 'default' }
)

const classes = computed(() =>
  cn(
    'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
    {
      'bg-primary text-primary-foreground': props.variant === 'default',
      'bg-secondary text-secondary-foreground': props.variant === 'secondary',
      'border border-border text-foreground': props.variant === 'outline',
      'bg-destructive text-destructive-foreground': props.variant === 'destructive',
    }
  )
)
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
