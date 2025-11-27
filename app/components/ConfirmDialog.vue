<script setup lang="ts">
interface Props {
  show: boolean;
  title?: string;
  message?: string;
  subtitle?: string; // ຂໍ້ຄວາມແຖວທີ 2 ທີ່ສະແດງສີແດງ
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const props = withDefaults(defineProps<Props>(), {
  title: "ຢືນຢັນ",
  message: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການດຳເນີນການນີ້?",
  subtitle: "",
  confirmText: "ຢືນຢັນ",
  cancelText: "ຍົກເລີກ",
  type: "danger",
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const iconName = computed(() => {
  switch (props.type) {
    case "warning":
      return "lucide:alert-triangle";
    case "info":
      return "lucide:info";
    default:
      return "lucide:alert-circle";
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="show" class="dialog-overlay" @click.self="emit('cancel')">
        <div class="dialog-container">
          <!-- Icon - Top Left -->
          <div class="dialog-icon-wrapper">
            <div 
              class="dialog-icon"
              :class="{
                'icon-warning': type === 'warning',
                'icon-danger': type === 'danger',
                'icon-info': type === 'info'
              }"
            >
              <Icon :name="iconName" class="icon-svg" />
            </div>
          </div>

          <!-- Content -->
          <div class="dialog-content">
            <!-- Message -->
            <p class="dialog-message">
              {{ message }}
            </p>

            <!-- Subtitle (red text) -->
            <p v-if="subtitle" class="dialog-subtitle">
              {{ subtitle }}
            </p>
          </div>

          <!-- Actions -->
          <div class="dialog-actions">
            <button 
              @click="emit('cancel')" 
              class="dialog-btn dialog-btn-cancel"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="emit('confirm')" 
              class="dialog-btn dialog-btn-confirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  @apply fixed inset-0 bg-black/50 backdrop-blur-sm z-50
         flex items-center justify-center p-4;
}

.dialog-container {
  @apply bg-white rounded-lg shadow-2xl max-w-md w-full
         relative overflow-hidden;
  animation: slide-up 0.3s ease-out;
  border-radius: 8px;
}

/* Icon - Top Left */
.dialog-icon-wrapper {
  @apply absolute top-4 left-4;
}

.dialog-icon {
  @apply w-14 h-14 rounded-full flex items-center justify-center
         shadow-lg;
}

.icon-warning {
  background-color: #fbbf24;
}

.icon-danger {
  @apply bg-red-500;
}

.icon-info {
  @apply bg-blue-500;
}

.icon-svg {
  @apply w-8 h-8 text-white;
  font-weight: bold;
}

/* Content */
.dialog-content {
  @apply pt-6 pb-2 px-6;
  padding-left: 5.5rem;
}

.dialog-message {
  @apply text-gray-900 text-base mb-1;
  line-height: 1.5;
  font-weight: 500;
}

.dialog-subtitle {
  @apply text-red-500 text-sm;
  line-height: 1.4;
}

/* Actions */
.dialog-actions {
  @apply flex gap-3 px-6 pb-6 pt-4;
}

.dialog-btn {
  @apply flex-1 py-2.5 px-4 rounded-lg font-medium text-sm
         transition-all duration-200 focus:outline-none
         focus:ring-2 focus:ring-offset-2;
}

.dialog-btn-cancel {
  @apply bg-white text-blue-500
         hover:bg-gray-50 active:bg-gray-100;
  border: 2px solid #93c5fd;
  focus:ring-blue-300;
}

.dialog-btn-confirm {
  @apply text-white
         hover:opacity-90 active:opacity-80
         shadow-md hover:shadow-lg;
  background-color: #60a5fa;
  focus:ring-blue-300;
}

/* Animations */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-container,
.dialog-leave-to .dialog-container {
  transform: translateY(20px) scale(0.95);
}
</style>
