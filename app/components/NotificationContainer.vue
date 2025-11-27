<script setup lang="ts">
const { notifications, remove } = useNotification();

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return "lucide:check-circle";
    case "error":
      return "lucide:x-circle";
    case "warning":
      return "lucide:alert-triangle";
    default:
      return "lucide:info";
  }
};

const getClass = (type: string) => {
  switch (type) {
    case "success":
      return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
    case "error":
      return "bg-red-500/20 border-red-500/40 text-red-400";
    case "warning":
      return "bg-amber-500/20 border-amber-500/40 text-amber-400";
    default:
      return "bg-cyan-500/20 border-cyan-500/40 text-cyan-400";
  }
};
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="p-4 rounded-lg border backdrop-blur-sm shadow-xl flex items-start gap-3"
          :class="getClass(notification.type)"
        >
          <Icon :name="getIcon(notification.type)" class="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p class="flex-1 text-sm">{{ notification.message }}</p>
          <button
            @click="remove(notification.id)"
            class="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

