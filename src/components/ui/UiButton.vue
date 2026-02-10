<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    disabled?: boolean
  }>(),
  {
    variant: 'default',
    size: 'md',
    disabled: false,
  }
)

const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
    {
      'bg-primary text-primary-foreground hover:bg-primary/90': props.variant === 'default',
      'bg-secondary text-secondary-foreground hover:bg-secondary/80': props.variant === 'secondary',
      'border border-border bg-background hover:bg-accent hover:text-accent-foreground': props.variant === 'outline',
      'hover:bg-accent hover:text-accent-foreground': props.variant === 'ghost',
      'bg-destructive text-destructive-foreground hover:bg-destructive/90': props.variant === 'destructive',
    },
    {
      'h-8 px-3 text-xs': props.size === 'sm',
      'h-9 px-4': props.size === 'md',
      'h-10 px-6': props.size === 'lg',
      'h-9 w-9 p-0': props.size === 'icon',
    }
  )
)
</script>

<template>
  <button :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>
