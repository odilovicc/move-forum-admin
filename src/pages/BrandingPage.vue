<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiFileUpload from '@/components/ui/UiFileUpload.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useLocalesStore } from '@/stores/locales'

const store = useLocalesStore()
const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
const ASSET_BASE =
  import.meta.env.VITE_ASSET_BASE ??
  (API_BASE.startsWith('http') ? API_BASE.replace(/\/api\/?$/, '') : window.location.origin)

const form = ref({
  ru: '',
  uz: '',
  en: '',
})

const files = ref({
  ru: null as File | null,
  uz: null as File | null,
  en: null as File | null,
})

const loading = ref(false)

function hydrate() {
  form.value = {
    ru: store.getNestedValue(store.locales.ru ?? {}, 'branding.logo'),
    uz: store.getNestedValue(store.locales.uz ?? {}, 'branding.logo'),
    en: store.getNestedValue(store.locales.en ?? {}, 'branding.logo'),
  }
}

function resolveLogo(path: string) {
  if (!path) return ''
  if (path.startsWith('/uploads/')) {
    return `${ASSET_BASE}${path}`
  }
  return path
}

async function handleSave() {
  loading.value = true
  try {
    const tasks: Promise<unknown>[] = []

    if (files.value.ru) {
      tasks.push(store.uploadBrandingLogo('ru', files.value.ru))
    } else {
      tasks.push(store.updateValue('ru', 'branding.logo', form.value.ru))
    }

    if (files.value.uz) {
      tasks.push(store.uploadBrandingLogo('uz', files.value.uz))
    } else {
      tasks.push(store.updateValue('uz', 'branding.logo', form.value.uz))
    }

    if (files.value.en) {
      tasks.push(store.uploadBrandingLogo('en', files.value.en))
    } else {
      tasks.push(store.updateValue('en', 'branding.logo', form.value.en))
    }

    await Promise.all(tasks)
    files.value = { ru: null, uz: null, en: null }
    hydrate()
  } finally {
    loading.value = false
  }
}

async function clearLogo(locale: 'ru' | 'uz' | 'en') {
  form.value[locale] = ''
  files.value[locale] = null
  await store.updateValue(locale, 'branding.logo', '')
}

function setFile(locale: 'ru' | 'uz' | 'en', file: File | null) {
  files.value[locale] = file
}

onMounted(async () => {
  await store.fetchLocales()
  hydrate()
})
</script>

<template>
  <div class="p-8 max-w-4xl">
    <PageHeader title="Брендинг" description="Логотипы по языкам (ru, uz, en)">
      <template #actions>
        <UiButton :disabled="loading" @click="handleSave">
          {{ loading ? 'Сохранение...' : 'Сохранить' }}
        </UiButton>
      </template>
    </PageHeader>

    <div class="mt-8 space-y-4">
      <UiCard class="p-4">
        <label class="text-sm font-medium mb-1.5 block">Логотип (RU)</label>
        <UiFileUpload
          :current-url="resolveLogo(form.ru)"
          placeholder-url="https://placehold.co/600x300?text=Logo+RU"
          @file-selected="setFile('ru', $event)"
          @clear-current="clearLogo('ru')"
        />
      </UiCard>

      <UiCard class="p-4">
        <label class="text-sm font-medium mb-1.5 block">Логотип (UZ)</label>
        <UiFileUpload
          :current-url="resolveLogo(form.uz)"
          placeholder-url="https://placehold.co/600x300?text=Logo+UZ"
          @file-selected="setFile('uz', $event)"
          @clear-current="clearLogo('uz')"
        />
      </UiCard>

      <UiCard class="p-4">
        <label class="text-sm font-medium mb-1.5 block">Логотип (EN)</label>
        <UiFileUpload
          :current-url="resolveLogo(form.en)"
          placeholder-url="https://placehold.co/600x300?text=Logo+EN"
          @file-selected="setFile('en', $event)"
          @clear-current="clearLogo('en')"
        />
      </UiCard>

      <p class="text-xs text-muted-foreground">Выберите файл и нажмите «Сохранить».</p>
    </div>
  </div>
</template>
