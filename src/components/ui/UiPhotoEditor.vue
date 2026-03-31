<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import { X, ZoomIn, ZoomOut, RotateCcw, Check } from 'lucide-vue-next'

const CROP_W = 360
const CROP_H = 480 // 3:4

const props = defineProps<{
  open: boolean
  file: File | null
}>()

const emit = defineEmits<{
  close: []
  confirm: [croppedFile: File]
}>()

const imgEl = ref<HTMLImageElement | null>(null)
const naturalW = ref(0)
const naturalH = ref(0)
const imgSrc = ref('')

const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, px: 0, py: 0 })

const minZoom = computed(() => {
  if (!naturalW.value || !naturalH.value) return 1
  return Math.max(CROP_W / naturalW.value, CROP_H / naturalH.value)
})
const maxZoom = computed(() => minZoom.value * 6)

watch(() => props.file, (file) => {
  if (!file) return
  if (imgSrc.value.startsWith('blob:')) URL.revokeObjectURL(imgSrc.value)
  imgSrc.value = URL.createObjectURL(file)
  naturalW.value = 0
  naturalH.value = 0
  zoom.value = 1
  panX.value = 0
  panY.value = 0
})

function onImgLoad(e: Event) {
  const img = e.target as HTMLImageElement
  naturalW.value = img.naturalWidth
  naturalH.value = img.naturalHeight
  fitToFill()
}

function fitToFill() {
  zoom.value = minZoom.value
  const dw = naturalW.value * zoom.value
  const dh = naturalH.value * zoom.value
  panX.value = (CROP_W - dw) / 2
  panY.value = (CROP_H - dh) / 2
}

function clamp() {
  const dw = naturalW.value * zoom.value
  const dh = naturalH.value * zoom.value
  panX.value = Math.min(0, Math.max(CROP_W - dw, panX.value))
  panY.value = Math.min(0, Math.max(CROP_H - dh, panY.value))
}

function startDrag(e: MouseEvent) {
  isDragging.value = true
  dragStart.value = { x: e.clientX, y: e.clientY, px: panX.value, py: panY.value }
}

function moveDrag(e: MouseEvent) {
  if (!isDragging.value) return
  panX.value = dragStart.value.px + e.clientX - dragStart.value.x
  panY.value = dragStart.value.py + e.clientY - dragStart.value.y
  clamp()
}

function stopDrag() {
  isDragging.value = false
}

function applyZoom(newZ: number, cx = CROP_W / 2, cy = CROP_H / 2) {
  const clamped = Math.max(minZoom.value, Math.min(maxZoom.value, newZ))
  const r = clamped / zoom.value
  panX.value = cx - r * (cx - panX.value)
  panY.value = cy - r * (cy - panY.value)
  zoom.value = clamped
  clamp()
}

function onWheel(e: WheelEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  applyZoom(zoom.value * (1 - e.deltaY / 400), e.clientX - rect.left, e.clientY - rect.top)
}

const sliderVal = computed({
  get: () => {
    const range = maxZoom.value - minZoom.value
    return range > 0 ? ((zoom.value - minZoom.value) / range) * 100 : 0
  },
  set: (v: number) => {
    applyZoom(minZoom.value + (v / 100) * (maxZoom.value - minZoom.value))
  },
})

// Circle preview: scale crop to 64x64
const pScale = computed(() => 64 / CROP_W)
const pTopOffset = computed(() => (64 - CROP_H * pScale.value) / 2)

function confirm() {
  const canvas = document.createElement('canvas')
  canvas.width = CROP_W
  canvas.height = CROP_H
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    imgEl.value!,
    -panX.value / zoom.value,
    -panY.value / zoom.value,
    CROP_W / zoom.value,
    CROP_H / zoom.value,
    0, 0,
    CROP_W, CROP_H,
  )
  canvas.toBlob((blob) => {
    if (!blob) return
    const name = (props.file?.name ?? 'photo').replace(/\.[^.]+$/, '') + '.jpg'
    emit('confirm', new File([blob], name, { type: 'image/jpeg' }))
  }, 'image/jpeg', 0.92)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && file"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4"
      @mouseup="stopDrag"
      @mousemove="moveDrag"
    >
      <div class="bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden select-none">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div>
            <h2 class="font-semibold text-base">Кадрировать фото</h2>
            <p class="text-xs text-muted-foreground mt-0.5">Перетащите · колёсико — масштаб</p>
          </div>
          <button class="p-1.5 rounded-md hover:bg-accent transition-colors" @click="emit('close')">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Crop canvas -->
        <div class="p-5 flex justify-center">
          <div
            class="relative overflow-hidden rounded-xl border border-border bg-zinc-900"
            :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
            :style="{ width: CROP_W + 'px', height: CROP_H + 'px' }"
            @mousedown.prevent="startDrag"
            @wheel.prevent="onWheel"
          >
            <!-- Checkerboard for transparent images -->
            <div
              class="absolute inset-0"
              style="background-image: linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%); background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0px;"
            />

            <img
              ref="imgEl"
              :src="imgSrc"
              class="absolute top-0 left-0 max-w-none pointer-events-none"
              :style="{
                width: naturalW * zoom + 'px',
                height: naturalH * zoom + 'px',
                transform: `translate(${panX}px, ${panY}px)`,
              }"
              draggable="false"
              @load="onImgLoad"
            />

            <!-- Rule-of-thirds -->
            <div class="absolute inset-0 pointer-events-none">
              <div class="absolute top-1/3 inset-x-0 h-px bg-white/15" />
              <div class="absolute top-2/3 inset-x-0 h-px bg-white/15" />
              <div class="absolute left-1/3 inset-y-0 w-px bg-white/15" />
              <div class="absolute left-2/3 inset-y-0 w-px bg-white/15" />
            </div>

            <!-- Crop frame border -->
            <div class="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none" />
          </div>
        </div>

        <!-- Zoom slider -->
        <div class="flex items-center gap-2 px-5 pb-4">
          <button
            class="p-1.5 rounded-md hover:bg-accent transition-colors"
            @click="applyZoom(zoom / 1.3)"
          >
            <ZoomOut class="w-4 h-4" />
          </button>
          <input
            v-model="sliderVal"
            type="range"
            min="0"
            max="100"
            step="0.5"
            class="flex-1 accent-primary"
          />
          <button
            class="p-1.5 rounded-md hover:bg-accent transition-colors"
            @click="applyZoom(zoom * 1.3)"
          >
            <ZoomIn class="w-4 h-4" />
          </button>
          <button
            class="p-1.5 rounded-md hover:bg-accent transition-colors"
            title="По размеру"
            @click="fitToFill"
          >
            <RotateCcw class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Footer: preview + actions -->
        <div class="flex items-center gap-4 px-5 py-4 border-t border-border">
          <!-- Circle preview -->
          <div class="shrink-0 flex flex-col items-center gap-1.5">
            <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-border relative bg-zinc-800">
              <img
                v-if="imgSrc && naturalW"
                :src="imgSrc"
                class="absolute max-w-none pointer-events-none"
                :style="{
                  width: naturalW * zoom * pScale + 'px',
                  left: panX * pScale + 'px',
                  top: panY * pScale + pTopOffset + 'px',
                }"
                draggable="false"
              />
            </div>
            <span class="text-[10px] text-muted-foreground">аватар</span>
          </div>

          <!-- Square preview -->
          <div class="shrink-0 flex flex-col items-center gap-1.5">
            <div class="w-16 h-20 rounded-lg overflow-hidden border border-border relative bg-zinc-800">
              <img
                v-if="imgSrc && naturalW"
                :src="imgSrc"
                class="absolute max-w-none pointer-events-none"
                :style="{
                  width: naturalW * zoom * (64 / CROP_W) + 'px',
                  left: panX * (64 / CROP_W) + 'px',
                  top: panY * (80 / CROP_H) + 'px',
                }"
                draggable="false"
              />
            </div>
            <span class="text-[10px] text-muted-foreground">карточка</span>
          </div>

          <div class="flex-1" />

          <div class="flex gap-2 shrink-0">
            <UiButton variant="outline" @click="emit('close')">Отмена</UiButton>
            <UiButton @click="confirm">
              <Check class="w-4 h-4" />
              Применить
            </UiButton>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>
