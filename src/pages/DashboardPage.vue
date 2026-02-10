<script setup lang="ts">
import { onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { useSpeakersStore } from '@/stores/speakers'
import { useFaqStore } from '@/stores/faq'
import { useLocalesStore, LOCALE_LABELS } from '@/stores/locales'
import { Users, HelpCircle, Languages, Calendar } from 'lucide-vue-next'

const speakersStore = useSpeakersStore()
const faqStore = useFaqStore()
const localesStore = useLocalesStore()

const stats = [
  {
    label: 'Спикеры',
    value: () => speakersStore.speakers.length,
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'FAQ',
    value: () => faqStore.items.length,
    icon: HelpCircle,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Языки',
    value: () => Object.keys(localesStore.locales).length,
    icon: Languages,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'До форума',
    value: () => {
      const eventDate = new Date('2026-04-08')
      const now = new Date()
      const diff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diff > 0 ? `${diff} дн.` : 'Сегодня'
    },
    icon: Calendar,
    color: 'bg-purple-50 text-purple-600',
  },
]

onMounted(async () => {
  await Promise.all([
    speakersStore.fetchSpeakers(),
    faqStore.fetchFaq(),
    localesStore.fetchLocales(),
    localesStore.fetchAvailableLocales(),
  ])
})
</script>

<template>
  <div class="p-8 max-w-6xl">
    <PageHeader
      title="Dashboard"
      description="Общий обзор контента лендинга"
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      <UiCard v-for="stat in stats" :key="stat.label" class="p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
            <p class="text-2xl font-semibold mt-1">{{ stat.value() }}</p>
          </div>
          <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', stat.color]">
            <component :is="stat.icon" class="w-5 h-5" />
          </div>
        </div>
      </UiCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <UiCard class="p-6">
        <h3 class="font-semibold mb-4">Спикеры</h3>
        <div class="space-y-3">
          <div
            v-for="speaker in speakersStore.speakers.slice(0, 5)"
            :key="speaker.id"
            class="flex items-center gap-3"
          >
            <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span class="text-xs font-medium">{{ speaker.name[0] }}</span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">{{ speaker.name }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ speaker.position }}</p>
            </div>
          </div>
          <router-link
            v-if="speakersStore.speakers.length > 5"
            to="/speakers"
            class="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            + ещё {{ speakersStore.speakers.length - 5 }}
          </router-link>
        </div>
      </UiCard>

      <UiCard class="p-6">
        <h3 class="font-semibold mb-4">Доступные языки</h3>
        <div class="space-y-3">
          <div
            v-for="(label, code) in LOCALE_LABELS"
            :key="code"
            class="flex items-center justify-between py-2"
          >
            <div class="flex items-center gap-3">
              <UiBadge variant="secondary">{{ code.toUpperCase() }}</UiBadge>
              <span class="text-sm">{{ label }}</span>
            </div>
            <span class="text-xs text-muted-foreground">
              {{ localesStore.flattenKeys(localesStore.locales[code] as Record<string, unknown>).length }} ключей
            </span>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
