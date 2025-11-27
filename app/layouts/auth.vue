<script setup lang="ts">
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-clinic-sidebar-from via-clinic-sidebar-via to-clinic-sidebar-to flex items-center justify-center p-4"
  >
    <!-- Background Pattern -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />
      <div
        class="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />
      <div
        class="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl"
      />
      <div
        class="absolute bottom-1/4 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl"
      />
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md">
      <slot />
    </div>

    <!-- Notifications -->
    <NotificationContainer />
  </div>
</template>
