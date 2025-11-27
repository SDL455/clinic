<script setup lang="ts">
const { initAuth } = useAuth();
const { initAutoLogout } = useAutoLogout();

onMounted(() => {
  initAuth();
  initAutoLogout();
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
