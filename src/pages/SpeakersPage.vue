<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTextarea from '@/components/ui/UiTextarea.vue'
import UiDialog from '@/components/ui/UiDialog.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { useSpeakersStore, type Speaker } from '@/stores/speakers'
import { Plus, Pencil, Trash2, User } from 'lucide-vue-next'

const store = useSpeakersStore()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)

const form = ref({
  name: '',
  nameEn: '',
  photo: '',
  position: '',
  bio: '',
})

function openCreateDialog() {
  editingId.value = null
  form.value = { name: '', nameEn: '', photo: '', position: '', bio: '' }
  dialogOpen.value = true
}

function openEditDialog(speaker: Speaker) {
  editingId.value = speaker.id
  form.value = {
    name: speaker.name,
    nameEn: speaker.nameEn,
    photo: speaker.photo,
    position: speaker.position,
    bio: speaker.bio,
  }
  dialogOpen.value = true
}

function openDeleteDialog(id: number) {
  deletingId.value = id
  deleteDialogOpen.value = true
}

async function handleSave() {
  if (editingId.value) {
    await store.updateSpeaker(editingId.value, form.value)
  } else {
    await store.addSpeaker(form.value)
  }
  dialogOpen.value = false
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
      <UiCard v-for="speaker in store.speakers" :key="speaker.id" class="overflow-hidden">
        <div class="p-5">
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0"
            >
              <User v-if="!speaker.photo" class="w-5 h-5 text-muted-foreground" />
              <span v-else class="text-sm font-semibold">{{ speaker.name[0] }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-medium text-sm truncate">{{ speaker.name }}</h3>
              <p class="text-xs text-muted-foreground mt-0.5 truncate">{{ speaker.nameEn }}</p>
              <UiBadge variant="secondary" class="mt-2">{{ speaker.position }}</UiBadge>
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
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium mb-1.5 block">Имя (RU)</label>
            <UiInput v-model="form.name" placeholder="Имя на русском" />
          </div>
          <div>
            <label class="text-sm font-medium mb-1.5 block">Имя (EN)</label>
            <UiInput v-model="form.nameEn" placeholder="Name in English" />
          </div>
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Должность</label>
          <UiInput v-model="form.position" placeholder="Должность или компания" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Фото (идентификатор)</label>
          <UiInput v-model="form.photo" placeholder="Например: SailyaHamidova" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Биография</label>
          <UiTextarea v-model="form.bio" placeholder="Краткая биография спикера" :rows="4" />
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
