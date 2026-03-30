<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiRichEditor from '@/components/ui/UiRichEditor.vue'
import UiDialog from '@/components/ui/UiDialog.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiFileUpload from '@/components/ui/UiFileUpload.vue'
import UiPhotoPicker from '@/components/ui/UiPhotoPicker.vue'
import { useSpeakersStore, type Speaker } from '@/stores/speakers'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-vue-next'

const store = useSpeakersStore()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)
const photoFile = ref<File | null>(null)
const NO_PHOTO_PLACEHOLDER = 'https://placehold.co/600x400?text=No+Photo'


const form = ref({
  nameRu: '',
  nameUz: '',
  nameEn: '',
  photo: '',
  photoPosition: 'center',
  positionRu: '',
  positionUz: '',
  positionEn: '',
  bioRu: '',
  bioUz: '',
  bioEn: '',
  order: '0',
})

function openCreateDialog() {
  editingId.value = null
  form.value = {
    nameRu: '',
    nameUz: '',
    nameEn: '',
    photo: '',
    photoPosition: 'center',
    positionRu: '',
    positionUz: '',
    positionEn: '',
    bioRu: '',
    bioUz: '',
    bioEn: '',
    order: String(store.speakers.length),
  }
  photoFile.value = null
  dialogOpen.value = true
}

function openEditDialog(speaker: Speaker) {
  editingId.value = speaker.id
  form.value = {
    nameRu: speaker.nameRu ?? speaker.name ?? '',
    nameUz: speaker.nameUz ?? '',
    nameEn: speaker.nameEn ?? '',
    photo: speaker.photo,
    photoPosition: speaker.photoPosition ?? 'center',
    positionRu: speaker.positionRu ?? speaker.position ?? '',
    positionUz: speaker.positionUz ?? '',
    positionEn: speaker.positionEn ?? '',
    bioRu: speaker.bioRu ?? speaker.bio ?? '',
    bioUz: speaker.bioUz ?? '',
    bioEn: speaker.bioEn ?? '',
    order: String(speaker.order),
  }
  photoFile.value = null
  dialogOpen.value = true
}

function openDeleteDialog(id: number) {
  deletingId.value = id
  deleteDialogOpen.value = true
}

async function handleSave() {
  const payload = {
    nameRu: form.value.nameRu,
    nameUz: form.value.nameUz,
    nameEn: form.value.nameEn,
    photo: form.value.photo,
    photoPosition: form.value.photoPosition,
    positionRu: form.value.positionRu,
    positionUz: form.value.positionUz,
    positionEn: form.value.positionEn,
    bioRu: form.value.bioRu,
    bioUz: form.value.bioUz,
    bioEn: form.value.bioEn,
    order: Number(form.value.order),
  }

  if (editingId.value) {
    const updated = await store.updateSpeaker(editingId.value, payload)
    if (photoFile.value && updated) {
      await store.uploadPhoto(editingId.value, photoFile.value)
    }
  } else {
    const created = await store.addSpeaker(payload)
    if (photoFile.value && created) {
      await store.uploadPhoto(created.id, photoFile.value)
    }
  }

  dialogOpen.value = false
  photoFile.value = null
}

async function handleDelete() {
  if (deletingId.value) {
    await store.deleteSpeaker(deletingId.value)
  }
  deleteDialogOpen.value = false
  deletingId.value = null
}

onMounted(async () => {
  await store.fetchSpeakers()
})

const ASSET_BASE = import.meta.env.VITE_ASSET_BASE ?? ''

function imageUrl(path: string) {
  if (!path) {
    return NO_PHOTO_PLACEHOLDER
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${ASSET_BASE}${path}`
}

async function moveUp(index: number) {
  if (index > 0) {
    await store.reorder(index, index - 1)
  }
}

async function moveDown(index: number) {
  if (index < store.speakers.length - 1) {
    await store.reorder(index, index + 1)
  }
}

function onFileSelected(file: File | null) {
  photoFile.value = file
}

function clearCurrentPhoto() {
  form.value.photo = ''
  photoFile.value = null
}
</script>

<template>
  <div class="p-8 max-w-6xl">
    <PageHeader title="Спикеры" description="Управление спикерами форума">
      <template #actions>
        <UiButton @click="openCreateDialog">
          <Plus class="w-4 h-4" />
          Добавить спикера
        </UiButton>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
      <UiCard v-for="(speaker, index) in store.speakers" :key="speaker.id" class="overflow-hidden">
        <div class="p-5">
          <div class="flex items-start gap-4">
            <img
              :src="imageUrl(speaker.photo)"
              class="h-12 w-12 shrink-0 rounded-full object-cover"
              alt="Speaker photo"
            />
            <div class="min-w-0 flex-1">
              <h3 class="font-medium text-sm truncate">{{ speaker.nameRu ?? speaker.name }}</h3>
              <p class="text-xs text-muted-foreground mt-0.5 truncate">{{ speaker.nameEn }}</p>
              <UiBadge variant="secondary" class="mt-2">{{ speaker.positionRu ?? speaker.position }}</UiBadge>
              <p class="mt-2 text-xs text-muted-foreground">Порядок: {{ speaker.order }}</p>
            </div>
            <div class="flex flex-col gap-1">
              <button
                class="rounded border border-border p-1 hover:bg-accent"
                @click="moveUp(index)"
              >
                <ChevronUp class="h-3.5 w-3.5" />
              </button>
              <button
                class="rounded border border-border p-1 hover:bg-accent"
                @click="moveDown(index)"
              >
                <ChevronDown class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-3 line-clamp-2">{{ speaker.bio }}</p>
        </div>
        <div class="flex border-t border-border">
          <button
            class="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            @click="openEditDialog(speaker)"
          >
            <Pencil class="w-3.5 h-3.5" />
            Редактировать
          </button>
          <div class="w-px bg-border" />
          <button
            class="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
            @click="openDeleteDialog(speaker.id)"
          >
            <Trash2 class="w-3.5 h-3.5" />
            Удалить
          </button>
        </div>
      </UiCard>
    </div>

    <!-- Create / Edit Dialog -->
    <UiDialog
      :open="dialogOpen"
      :title="editingId ? 'Редактировать спикера' : 'Новый спикер'"
      @close="dialogOpen = false"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium mb-1.5 block">Имя (RU)</label>
            <UiInput v-model="form.nameRu" placeholder="Имя на русском" />
          </div>
          <div>
            <label class="text-sm font-medium mb-1.5 block">Имя (UZ)</label>
            <UiInput v-model="form.nameUz" placeholder="Ism o‘zbekcha" />
          </div>
          <div>
            <label class="text-sm font-medium mb-1.5 block">Имя (EN)</label>
            <UiInput v-model="form.nameEn" placeholder="Name in English" />
          </div>
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Должность (RU)</label>
          <UiInput v-model="form.positionRu" placeholder="Должность или компания" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium mb-1.5 block">Должность (UZ)</label>
            <UiInput v-model="form.positionUz" placeholder="Lavozim yoki kompaniya" />
          </div>
          <div>
            <label class="text-sm font-medium mb-1.5 block">Должность (EN)</label>
            <UiInput v-model="form.positionEn" placeholder="Position or company" />
          </div>
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Фото спикера</label>
          <UiFileUpload
            :current-url="form.photo"
            :placeholder-url="NO_PHOTO_PLACEHOLDER"
            @file-selected="onFileSelected"
            @clear-current="clearCurrentPhoto"
          />
          <p class="mt-2 text-xs text-muted-foreground">
            Можно загрузить новый файл или оставить текущий путь: <code>{{ form.photo || 'нет фото' }}</code>
          </p>
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Позиция аватара</label>
          <UiPhotoPicker
            :image-url="imageUrl(form.photo)"
            v-model="form.photoPosition"
          />
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Порядок</label>
          <UiInput v-model="form.order" type="number" min="0" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Биография (RU)</label>
          <UiRichEditor v-model="form.bioRu" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium mb-1.5 block">Биография (UZ)</label>
            <UiRichEditor v-model="form.bioUz" />
          </div>
          <div>
            <label class="text-sm font-medium mb-1.5 block">Биография (EN)</label>
            <UiRichEditor v-model="form.bioEn" />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <UiButton variant="outline" @click="dialogOpen = false">Отмена</UiButton>
          <UiButton @click="handleSave">
            {{ editingId ? 'Сохранить' : 'Добавить' }}
          </UiButton>
        </div>
      </div>
    </UiDialog>

    <!-- Delete Confirmation Dialog -->
    <UiDialog
      :open="deleteDialogOpen"
      title="Удалить спикера?"
      description="Это действие нельзя отменить. Спикер будет удален из списка."
      @close="deleteDialogOpen = false"
    >
      <div class="flex justify-end gap-3 pt-4">
        <UiButton variant="outline" @click="deleteDialogOpen = false">Отмена</UiButton>
        <UiButton variant="destructive" @click="handleDelete">Удалить</UiButton>
      </div>
    </UiDialog>
  </div>
</template>
