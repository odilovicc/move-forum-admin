<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
  <div class="flex h-screen bg-background text-foreground">
    <AppSidebar />
    <main class="flex-1 overflow-auto">
      <router-view />
    </main>
  </div>
</template>
