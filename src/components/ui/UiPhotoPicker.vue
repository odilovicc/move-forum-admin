<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  imageUrl: string
  modelValue: string // "50% 30%" формат
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const containerRef = ref<HTMLDivElement | null>(null)

// Парсим текущее значение в проценты
const position = computed(() => {
  const val = props.modelValue || '50% 50%'
  const parts = val.trim().split(/\s+/)
  const parseVal = (v: string) => {
    if (v === 'center') return 50
    if (v === 'top' || v === 'left') return 0
    if (v === 'bottom' || v === 'right') return 100
    return parseFloat(v) || 50
  }
  return {
    x: parseVal(parts[0] ?? '50%'),
    y: parseVal(parts[1] ?? parts[0] ?? '50%'),
  }
})

function handleClick(e: MouseEvent) {
  const el = containerRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
  const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
  emit('update:modelValue', `${x}% ${y}%`)
}

function handleDrag(e: MouseEvent) {
  if (e.buttons !== 1) return
  handleClick(e)
}
</script>

<template>
  <div class="space-y-2">
    <!-- Интерактивная картинка -->
    <div
      ref="containerRef"
      class="relative w-full aspect-[3/4] rounded-lg overflow-hidden cursor-crosshair border border-border select-none bg-zinc-900"
      @click="handleClick"
      @mousemove="handleDrag"
    >
      <img
        v-if="imageUrl"
        :src="imageUrl"
        class="w-full h-full object-cover pointer-events-none"
        draggable="false"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-xs text-muted-foreground"
      >
        Нет фото
      </div>

      <!-- Маркер позиции -->
      <div
        class="absolute pointer-events-none"
        :style="{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
        }"
      >
        <!-- Прицел -->
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute inset-0 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]" />
          <div class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]" />
        </div>
      </div>

      <!-- Направляющие линии -->
      <div
        class="absolute top-0 bottom-0 w-px bg-white/20 pointer-events-none"
        :style="{ left: `${position.x}%` }"
      />
      <div
        class="absolute left-0 right-0 h-px bg-white/20 pointer-events-none"
        :style="{ top: `${position.y}%` }"
      />
    </div>

    <!-- Превью в круге -->
    <div class="flex items-center gap-3">
      <div class="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 border border-border shrink-0">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          class="w-full h-full object-cover"
          :style="{ objectPosition: modelValue || '50% 50%' }"
          draggable="false"
        />
      </div>
      <p class="text-xs text-muted-foreground">
        Кликните по фото чтобы задать точку фокуса.<br />
        Текущее значение: <code class="text-foreground">{{ modelValue || '50% 50%' }}</code>
      </p>
    </div>
  </div>
</template>
