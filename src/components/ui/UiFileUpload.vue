<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import { ImageIcon, Upload, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    currentUrl?: string
    placeholderUrl?: string
    accept?: string
    disabled?: boolean
  }>(),
  {
    currentUrl: '',
    placeholderUrl: 'https://placehold.co/600x400?text=No+Photo',
    accept: 'image/*',
    disabled: false,
  }
)

const emit = defineEmits<{
  (e: 'file-selected', file: File | null): void
  (e: 'clear-current'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const objectUrl = ref('')

const previewUrl = computed(() => {
  if (objectUrl.value) {
    return objectUrl.value
  }

  if (props.currentUrl) {
    return props.currentUrl
  }

  return props.placeholderUrl
})

const hasCurrentImage = computed(() => Boolean(props.currentUrl))

function revokeObjectUrl() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = ''
  }
}

function setFile(file: File | null) {
  revokeObjectUrl()

  if (file) {
    objectUrl.value = URL.createObjectURL(file)
  }

  emit('file-selected', file)
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  setFile(file)
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
  if (props.disabled) {
    return
  }

  const file = event.dataTransfer?.files?.[0] ?? null
  if (file) {
    setFile(file)
  }
}

function openFileDialog() {
  if (props.disabled) {
    return
  }
  inputRef.value?.click()
}

function clearSelection() {
  setFile(null)
  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

function clearCurrentImage() {
  emit('clear-current')
}

onBeforeUnmount(() => {
  revokeObjectUrl()
})
</script>

<template>
  <div class="space-y-3">
    <input
      ref="inputRef"
      :accept="accept"
      type="file"
      class="hidden"
      :disabled="disabled"
      @change="onFileChange"
    />

    <div
      class="relative overflow-hidden rounded-xl border border-dashed border-border bg-muted/20 p-3"
      :class="{ 'border-primary bg-primary/5': dragOver }"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop="onDrop"
    >
      <img
        :src="previewUrl"
        alt="Preview"
        class="h-40 w-full rounded-lg object-cover"
      />
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition">
        <div
          class="rounded-lg border border-white/20 bg-black/55 px-2 py-1 text-xs text-white backdrop-blur"
        >
          Перетащите изображение или выберите файл
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <UiButton type="button" variant="outline" @click="openFileDialog">
        <Upload class="h-4 w-4" />
        Выбрать файл
      </UiButton>
      <UiButton type="button" variant="ghost" @click="clearSelection">
        <X class="h-4 w-4" />
        Сбросить выбранный
      </UiButton>
      <UiButton
        v-if="hasCurrentImage"
        type="button"
        variant="ghost"
        @click="clearCurrentImage"
      >
        <ImageIcon class="h-4 w-4" />
        Убрать текущее фото
      </UiButton>
    </div>
  </div>
</template>
