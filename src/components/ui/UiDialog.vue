<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
  description?: string
}>()

const emit = defineEmits<{
  close: []
}>()

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="props.open"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="onOverlayClick"
      >
        <div class="fixed inset-0 bg-black/50" />
        <div
          class="relative z-50 w-full max-w-lg max-h-[85vh] overflow-auto rounded-xl border border-border bg-background p-6 shadow-lg"
          @click.stop
        >
          <div class="mb-4">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
            <p v-if="description" class="text-sm text-muted-foreground mt-1">{{ description }}</p>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.15s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
