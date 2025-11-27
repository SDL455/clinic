<script setup lang="ts">
interface Props {
  show: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const props = withDefaults(defineProps<Props>(), {
  title: "ຢືນຢັນ",
  message: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການດຳເນີນການນີ້?",
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

const iconClass = computed(() => {
  switch (props.type) {
    case "warning":
      return "text-amber-400 bg-amber-400/20";
    case "info":
      return "text-cyan-400 bg-cyan-400/20";
    default:
      return "text-red-400 bg-red-400/20";
  }
});

const confirmClass = computed(() => {
  switch (props.type) {
    case "warning":
      return "btn-warning";
    case "info":
      return "btn-primary";
    default:
      return "btn-danger";
  }
});
</script>

<template>
  <Modal :show="show" @close="emit('cancel')">
    <div class="text-center">
      <div
        class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
        :class="iconClass"
      >
        <Icon :name="iconName" class="w-8 h-8" />
      </div>

      <h3 class="text-xl font-semibold text-white mb-2">{{ title }}</h3>
      <p class="text-gray-400 mb-6">{{ message }}</p>

      <div class="flex gap-3 justify-center">
        <button @click="emit('cancel')" class="btn btn-secondary">
          {{ cancelText }}
        </button>
        <button @click="emit('confirm')" class="btn" :class="confirmClass">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </Modal>
</template>

