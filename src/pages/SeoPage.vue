<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTextarea from '@/components/ui/UiTextarea.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useLocalesStore, LOCALE_LABELS, type LocaleCode } from '@/stores/locales'

const store = useLocalesStore()
const loading = ref(false)
const activeTab = ref<LocaleCode>('ru')

const tabs = computed<LocaleCode[]>(() => {
  const fromApi = store.availableLocales.filter((locale): locale is LocaleCode =>
    locale === 'ru' || locale === 'uz' || locale === 'en'
  )
  return fromApi.length > 0 ? fromApi : ['ru', 'uz', 'en']
})

const localizedForm = ref({
  title: '',
  description: '',
  keywords: '',
  eventName: '',
  eventDescription: '',
})

const globalForm = ref({
  siteUrl: '',
  ogImage: '',
  orgName: '',
  orgUrl: '',
  metricaId: '',
  eventStart: '',
  eventEnd: '',
  eventLocationName: '',
  eventLocationAddress: '',
})

function hydrateLocale(locale: LocaleCode) {
  const data = store.locales[locale] ?? {}
  localizedForm.value = {
    title: store.getNestedValue(data, 'seo.title'),
    description: store.getNestedValue(data, 'seo.description'),
    keywords: store.getNestedValue(data, 'seo.keywords'),
    eventName: store.getNestedValue(data, 'seo.event_name'),
    eventDescription: store.getNestedValue(data, 'seo.event_description'),
  }
}

function hydrateGlobal() {
  const data = store.locales.ru ?? {}
  globalForm.value = {
    siteUrl: store.getNestedValue(data, 'seo.site_url'),
    ogImage: store.getNestedValue(data, 'seo.og_image'),
    orgName: store.getNestedValue(data, 'seo.org_name'),
    orgUrl: store.getNestedValue(data, 'seo.org_url'),
    metricaId: store.getNestedValue(data, 'seo.yandex_metrica_id'),
    eventStart: store.getNestedValue(data, 'seo.event_start_date'),
    eventEnd: store.getNestedValue(data, 'seo.event_end_date'),
    eventLocationName: store.getNestedValue(data, 'seo.event_location_name'),
    eventLocationAddress: store.getNestedValue(data, 'seo.event_location_address'),
  }
}

async function handleSave() {
  loading.value = true
  try {
    const tasks: Promise<unknown>[] = []
    const locale = activeTab.value

    tasks.push(store.updateValue(locale, 'seo.title', localizedForm.value.title))
    tasks.push(store.updateValue(locale, 'seo.description', localizedForm.value.description))
    tasks.push(store.updateValue(locale, 'seo.keywords', localizedForm.value.keywords))
    tasks.push(store.updateValue(locale, 'seo.event_name', localizedForm.value.eventName))
    tasks.push(store.updateValue(locale, 'seo.event_description', localizedForm.value.eventDescription))

    const localesToUpdate = tabs.value.length > 0 ? tabs.value : ['ru', 'uz', 'en']
    for (const code of localesToUpdate) {
      tasks.push(store.updateValue(code, 'seo.site_url', globalForm.value.siteUrl))
      tasks.push(store.updateValue(code, 'seo.og_image', globalForm.value.ogImage))
      tasks.push(store.updateValue(code, 'seo.org_name', globalForm.value.orgName))
      tasks.push(store.updateValue(code, 'seo.org_url', globalForm.value.orgUrl))
      tasks.push(store.updateValue(code, 'seo.yandex_metrica_id', globalForm.value.metricaId))
      tasks.push(store.updateValue(code, 'seo.event_start_date', globalForm.value.eventStart))
      tasks.push(store.updateValue(code, 'seo.event_end_date', globalForm.value.eventEnd))
      tasks.push(store.updateValue(code, 'seo.event_location_name', globalForm.value.eventLocationName))
      tasks.push(store.updateValue(code, 'seo.event_location_address', globalForm.value.eventLocationAddress))
    }

    await Promise.all(tasks)
    await store.fetchLocales()
    hydrateGlobal()
    hydrateLocale(locale)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await store.fetchLocales()
  hydrateGlobal()
  hydrateLocale(activeTab.value)
})

watch(activeTab, (value) => {
  hydrateLocale(value)
})
</script>

<template>
  <div class="p-8 max-w-5xl">
    <PageHeader title="SEO и аналитика" description="Мета-теги, Schema.org, аналитика и цели">
      <template #actions>
        <UiButton :disabled="loading" @click="handleSave">
          {{ loading ? 'Сохранение...' : 'Сохранить' }}
        </UiButton>
      </template>
    </PageHeader>

    <div class="mt-6 space-y-4">
      <UiCard class="p-4 space-y-4">
        <h3 class="text-sm font-semibold">Глобальные настройки</h3>
        <div class="grid gap-3 md:grid-cols-2">
          <div>
            <label class="text-xs font-medium mb-1.5 block">Site URL</label>
            <UiInput v-model="globalForm.siteUrl" placeholder="https://procureforum.uz" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1.5 block">OG Image URL</label>
            <UiInput v-model="globalForm.ogImage" placeholder="https://example.com/og.jpg" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1.5 block">Organization Name</label>
            <UiInput v-model="globalForm.orgName" placeholder="AUPP" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1.5 block">Organization URL</label>
            <UiInput v-model="globalForm.orgUrl" placeholder="https://procureforum.uz" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1.5 block">Yandex Metrica ID</label>
            <UiInput v-model="globalForm.metricaId" placeholder="XXXXXXXX" />
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <div>
            <label class="text-xs font-medium mb-1.5 block">Event Start (ISO)</label>
            <UiInput v-model="globalForm.eventStart" placeholder="2026-03-15T10:00:00+05:00" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1.5 block">Event End (ISO)</label>
            <UiInput v-model="globalForm.eventEnd" placeholder="2026-03-15T18:00:00+05:00" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1.5 block">Event Location Name</label>
            <UiInput v-model="globalForm.eventLocationName" placeholder="Tashkent City Hall" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1.5 block">Event Location Address</label>
            <UiInput v-model="globalForm.eventLocationAddress" placeholder="Tashkent, Uzbekistan" />
          </div>
        </div>
      </UiCard>

      <UiCard class="p-4 space-y-4">
        <div class="flex items-center gap-4">
          <h3 class="text-sm font-semibold">Локальные тексты</h3>
          <div class="flex bg-muted rounded-lg p-1 gap-1">
            <button
              v-for="tab in tabs"
              :key="tab"
              class="px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
              :class="
                activeTab === tab
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="activeTab = tab"
            >
              {{ LOCALE_LABELS[tab] }}
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium mb-1.5 block">Title</label>
            <UiInput v-model="localizedForm.title" placeholder="SEO title" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1.5 block">Description</label>
            <UiTextarea v-model="localizedForm.description" rows="3" placeholder="SEO description" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1.5 block">Keywords</label>
            <UiInput v-model="localizedForm.keywords" placeholder="keywords, keywords" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1.5 block">Event Name</label>
            <UiInput v-model="localizedForm.eventName" placeholder="Event name" />
          </div>
          <div>
            <label class="text-xs font-medium mb-1.5 block">Event Description</label>
            <UiTextarea v-model="localizedForm.eventDescription" rows="3" placeholder="Event description" />
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
