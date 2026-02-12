<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  HelpCircle,
  Languages,
  Settings,
  Search,
} from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/branding', label: 'Брендинг', icon: Settings },
  { path: '/seo', label: 'SEO', icon: Search },
  { path: '/locales', label: 'Переводы', icon: Languages },
  { path: '/speakers', label: 'Спикеры', icon: Users },
  { path: '/faq', label: 'FAQ', icon: HelpCircle },
]

const currentPath = computed(() => route.path)
</script>

<template>
  <aside class="w-64 border-r border-sidebar-border bg-sidebar flex flex-col shrink-0">
    <div class="h-16 flex items-center px-6 border-b border-sidebar-border">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Settings class="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h1 class="text-sm font-semibold leading-none">PCPF Admin</h1>
          <p class="text-xs text-muted-foreground mt-0.5">Управление контентом</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 p-3 space-y-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
        :class="
          currentPath === item.path
            ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
            : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
        "
      >
        <component :is="item.icon" class="w-4 h-4" />
        {{ item.label }}
      </router-link>
    </nav>

    <div class="p-4 border-t border-sidebar-border">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span class="text-xs font-medium">A</span>
        </div>
        <div>
          <p class="text-sm font-medium leading-none">Админ</p>
          <p class="text-xs text-muted-foreground mt-0.5">admin@offered.uz</p>
        </div>
      </div>
    </div>
  </aside>
</template>
