<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTextarea from '@/components/ui/UiTextarea.vue'
import UiDialog from '@/components/ui/UiDialog.vue'
import { useFaqStore, type FaqItem } from '@/stores/faq'
import { Plus, Pencil, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-vue-next'

const store = useFaqStore()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)
const expandedId = ref<number | null>(null)

const form = ref({
  questionRu: '',
  answerRu: '',
  questionUz: '',
  answerUz: '',
  questionEn: '',
  answerEn: '',
})

function openCreateDialog() {
  editingId.value = null
  form.value = {
    questionRu: '',
    answerRu: '',
    questionUz: '',
    answerUz: '',
    questionEn: '',
    answerEn: '',
  }
  dialogOpen.value = true
}

function openEditDialog(item: FaqItem) {
  editingId.value = item.id
  form.value = {
    questionRu: item.questionRu ?? item.question ?? '',
    answerRu: item.answerRu ?? item.answer ?? '',
    questionUz: item.questionUz ?? '',
    answerUz: item.answerUz ?? '',
    questionEn: item.questionEn ?? '',
    answerEn: item.answerEn ?? '',
  }
  dialogOpen.value = true
}

function openDeleteDialog(id: number) {
  deletingId.value = id
  deleteDialogOpen.value = true
}

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

async function handleSave() {
  if (editingId.value) {
    await store.updateItem(editingId.value, form.value)
  } else {
    await store.addItem(form.value)
  }
  dialogOpen.value = false
}

async function handleDelete() {
  if (deletingId.value) {
    await store.deleteItem(deletingId.value)
  }
  deleteDialogOpen.value = false
  deletingId.value = null
}

async function moveUp(index: number) {
  if (index > 0) {
    await store.reorder(index, index - 1)
  }
}

async function moveDown(index: number) {
  if (index < store.items.length - 1) {
    await store.reorder(index, index + 1)
  }
}

onMounted(async () => {
  await store.fetchFaq()
})
</script>

<template>
  <div class="p-8 max-w-4xl">
    <PageHeader title="FAQ" description="Управление часто задаваемыми вопросами">
      <template #actions>
        <UiButton @click="openCreateDialog">
          <Plus class="w-4 h-4" />
          Добавить вопрос
        </UiButton>
      </template>
    </PageHeader>

    <div class="space-y-3 mt-8">
      <UiCard
        v-for="(item, index) in store.items"
        :key="item.id"
        class="overflow-hidden"
      >
        <div
          class="flex items-center gap-3 p-4 cursor-pointer select-none"
          @click="toggleExpand(item.id)"
        >
          <GripVertical class="w-4 h-4 text-muted-foreground shrink-0" />
          <span class="text-xs text-muted-foreground font-mono w-6 shrink-0">{{ index + 1 }}</span>
          <p class="text-sm font-medium flex-1">{{ item.questionRu ?? item.question }}</p>
          <div class="flex items-center gap-1 shrink-0">
            <button
              class="p-1 rounded hover:bg-accent transition-colors cursor-pointer"
              title="Переместить вверх"
              @click.stop="moveUp(index)"
            >
              <ChevronUp class="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              class="p-1 rounded hover:bg-accent transition-colors cursor-pointer"
              title="Переместить вниз"
              @click.stop="moveDown(index)"
            >
              <ChevronDown class="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              class="p-1 rounded hover:bg-accent transition-colors cursor-pointer"
              title="Редактировать"
              @click.stop="openEditDialog(item)"
            >
              <Pencil class="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              class="p-1 rounded hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Удалить"
              @click.stop="openDeleteDialog(item.id)"
            >
              <Trash2 class="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div
          v-if="expandedId === item.id"
          class="px-4 pb-4 pt-0 ml-[3.25rem]"
        >
          <p class="text-sm text-muted-foreground leading-relaxed">{{ item.answerRu ?? item.answer }}</p>
        </div>
      </UiCard>
    </div>

    <div v-if="store.items.length === 0" class="text-center py-12 text-muted-foreground">
      <p class="text-sm">Нет вопросов. Добавьте первый.</p>
    </div>

    <!-- Create / Edit Dialog -->
    <UiDialog
      :open="dialogOpen"
      :title="editingId ? 'Редактировать вопрос' : 'Новый вопрос'"
      @close="dialogOpen = false"
    >
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-1.5 block">Вопрос (RU)</label>
          <UiInput v-model="form.questionRu" placeholder="Введите вопрос на русском" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Ответ (RU)</label>
          <UiTextarea v-model="form.answerRu" placeholder="Введите ответ на русском" :rows="5" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Вопрос (UZ)</label>
          <UiInput v-model="form.questionUz" placeholder="Введите вопрос на узбекском" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Ответ (UZ)</label>
          <UiTextarea v-model="form.answerUz" placeholder="Введите ответ на узбекском" :rows="5" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Вопрос (EN)</label>
          <UiInput v-model="form.questionEn" placeholder="Введите вопрос на английском" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1.5 block">Ответ (EN)</label>
          <UiTextarea v-model="form.answerEn" placeholder="Введите ответ на английском" :rows="5" />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <UiButton variant="outline" @click="dialogOpen = false">Отмена</UiButton>
          <UiButton @click="handleSave">
            {{ editingId ? 'Сохранить' : 'Добавить' }}
          </UiButton>
        </div>
      </div>
    </UiDialog>

    <!-- Delete Confirmation -->
    <UiDialog
      :open="deleteDialogOpen"
      title="Удалить вопрос?"
      description="Это действие нельзя отменить."
      @close="deleteDialogOpen = false"
    >
      <div class="flex justify-end gap-3 pt-4">
        <UiButton variant="outline" @click="deleteDialogOpen = false">Отмена</UiButton>
        <UiButton variant="destructive" @click="handleDelete">Удалить</UiButton>
      </div>
    </UiDialog>
  </div>
</template>
