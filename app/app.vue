<script setup lang="ts">
const { initAuth } = useAuth();

onMounted(() => {
  initAuth();
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
