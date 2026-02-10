<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { useLocalesStore, LOCALE_LABELS, type LocaleCode } from '@/stores/locales'
import { Search } from 'lucide-vue-next'

const store = useLocalesStore()

const activeTab = ref<LocaleCode>('ru')
const searchQuery = ref('')
const expandedSection = ref<string | null>(null)

const tabs = computed<LocaleCode[]>(() => {
  const fromApi = store.availableLocales.filter((locale): locale is LocaleCode =>
    locale === 'ru' || locale === 'uz' || locale === 'en'
  )
  return fromApi.length > 0 ? fromApi : ['ru', 'uz', 'en']
})

const currentData = computed(() => store.locales[activeTab.value] as Record<string, unknown>)

const sections = computed(() => {
  const data = currentData.value
  const result: { key: string; label: string; fields: { path: string; key: string; value: string }[] }[] = []

  for (const sectionKey in data) {
    const section = data[sectionKey]
    if (typeof section !== 'object' || section === null) continue

    const fields: { path: string; key: string; value: string }[] = []
    collectFields(section as Record<string, unknown>, sectionKey, fields)

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const filtered = fields.filter(
        (f) => f.key.toLowerCase().includes(q) || f.value.toLowerCase().includes(q)
      )
      if (filtered.length > 0) {
        result.push({ key: sectionKey, label: sectionKey, fields: filtered })
      }
    } else {
      result.push({ key: sectionKey, label: sectionKey, fields })
    }
  }

  return result
})

function collectFields(
  obj: Record<string, unknown>,
  prefix: string,
  fields: { path: string; key: string; value: string }[]
) {
  for (const key in obj) {
    const fullPath = `${prefix}.${key}`
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      collectFields(obj[key] as Record<string, unknown>, fullPath, fields)
    } else {
      fields.push({
        path: fullPath,
        key,
        value: String(obj[key] ?? ''),
      })
    }
  }
}

function toggleSection(key: string) {
  expandedSection.value = expandedSection.value === key ? null : key
}

function handleValueChange(path: string, value: string) {
  void store.updateValue(activeTab.value, path, value)
}

onMounted(async () => {
  await Promise.all([store.fetchLocales(), store.fetchAvailableLocales()])
  if (tabs.value.length > 0 && !tabs.value.includes(activeTab.value)) {
    activeTab.value = tabs.value[0] ?? 'ru'
  }
})
</script>

<template>
  <div class="p-8 max-w-5xl">
    <PageHeader title="Переводы" description="Редактирование локализаций (uz, ru, en)" />

    <div class="mt-6 flex items-center gap-4">
      <!-- Language Tabs -->
      <div class="flex bg-muted rounded-lg p-1 gap-1">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer"
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

      <!-- Search -->
      <div class="relative flex-1 max-w-xs">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <UiInput v-model="searchQuery" placeholder="Поиск по ключам..." class="pl-9" />
      </div>
    </div>

    <div class="space-y-3 mt-6">
      <UiCard v-for="section in sections" :key="section.key" class="overflow-hidden">
        <button
          class="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors cursor-pointer"
          @click="toggleSection(section.key)"
        >
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-medium">{{ section.label }}</h3>
            <UiBadge variant="secondary">{{ section.fields.length }}</UiBadge>
          </div>
          <svg
            class="w-4 h-4 text-muted-foreground transition-transform"
            :class="{ 'rotate-180': expandedSection === section.key }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="expandedSection === section.key || searchQuery" class="border-t border-border">
          <div
            v-for="field in section.fields"
            :key="field.path"
            class="flex items-start gap-4 px-4 py-3 border-b border-border last:border-b-0"
          >
            <div class="w-40 shrink-0 pt-1.5">
              <code class="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{{ field.key }}</code>
            </div>
            <div class="flex-1">
              <input
                :value="field.value"
                class="w-full text-sm bg-transparent border-b border-transparent hover:border-border focus:border-ring focus:outline-none py-1 transition-colors"
                @input="handleValueChange(field.path, ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </div>
      </UiCard>
    </div>

    <div v-if="sections.length === 0 && searchQuery" class="text-center py-12 text-muted-foreground">
      <p class="text-sm">Ничего не найдено по запросу "{{ searchQuery }}"</p>
    </div>
  </div>
</template>
