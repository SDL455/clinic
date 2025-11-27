<script setup lang="ts">
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center p-4"
    style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);"
  >
    <!-- Background Pattern -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
        style="background: rgba(255, 255, 255, 0.08);"
      />
      <div
        class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
        style="background: rgba(255, 255, 255, 0.08);"
      />
      <div
        class="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-2xl"
        style="background: rgba(255, 255, 255, 0.04);"
      />
      <div
        class="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full blur-2xl"
        style="background: rgba(255, 255, 255, 0.04);"
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
