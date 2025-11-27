<script setup lang="ts">
import type { Service } from "~/types";

definePageMeta({
  middleware: "auth",
});

const { getAuthHeaders } = useAuth();
const { success, error } = useNotification();

const services = ref<Service[]>([]);
const isLoading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const editingService = ref<Service | null>(null);

const form = reactive({
  name: "",
  description: "",
  price: 0,
});

// Fetch services
const fetchServices = async () => {
  isLoading.value = true;
  try {
    const res = await $fetch<{ success: boolean; data: Service[] }>("/api/services", {
      headers: getAuthHeaders(),
    });
    if (res.success) services.value = res.data || [];
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  } finally {
    isLoading.value = false;
  }
};

// Open new modal
const openNewModal = () => {
  isEditing.value = false;
  editingService.value = null;
  Object.assign(form, { name: "", description: "", price: 0 });
  showModal.value = true;
};

// Open edit modal
const openEditModal = (service: Service) => {
  isEditing.value = true;
  editingService.value = service;
  Object.assign(form, {
    name: service.name,
    description: service.description || "",
    price: service.price,
  });
  showModal.value = true;
};

// Save service
const saveService = async () => {
  if (!form.name || !form.price) {
    error("ກະລຸນາປ້ອນຊື່ ແລະ ລາຄາ");
    return;
  }

  try {
    const url = isEditing.value ? `/api/services/${editingService.value?.id}` : "/api/services";
    const method = isEditing.value ? "PUT" : "POST";

    await $fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: form,
    });

    success(isEditing.value ? "ອັບເດດບໍລິການສຳເລັດ" : "ເພີ່ມບໍລິການສຳເລັດ");
    showModal.value = false;
    fetchServices();
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  }
};

// Delete service
const deleteService = async (service: Service) => {
  if (!confirm(`ຕ້ອງການລຶບ "${service.name}" ບໍ່?`)) return;

  try {
    await $fetch(`/api/services/${service.id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    success("ລຶບບໍລິການສຳເລັດ");
    fetchServices();
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  }
};

// Format currency
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    minimumFractionDigits: 0,
  }).format(value);

onMounted(() => {
  fetchServices();
});
</script>

<template>
  <div>
    <PageHeader title="ບໍລິການ" description="ຈັດການບໍລິການຂອງຮ້ານ">
      <template #actions>
        <button @click="openNewModal" class="btn btn-primary">
          <Icon name="lucide:plus" class="w-4 h-4" />
          ເພີ່ມບໍລິການ
        </button>
      </template>
    </PageHeader>

    <!-- Services Grid -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin text-clinic-accent" />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="service in services"
        :key="service.id"
        class="card p-5 hover:border-clinic-accent/50 transition-all group"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
            <Icon name="lucide:heart-handshake" class="w-6 h-6 text-pink-400" />
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="openEditModal(service)"
              class="p-2 hover:bg-clinic-dark rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <Icon name="lucide:pencil" class="w-4 h-4" />
            </button>
            <button
              @click="deleteService(service)"
              class="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 class="text-lg font-semibold text-white mb-2">{{ service.name }}</h3>
        <p v-if="service.description" class="text-gray-400 text-sm mb-4 line-clamp-2">
          {{ service.description }}
        </p>

        <div class="pt-4 border-t border-clinic-border">
          <p class="text-2xl font-bold text-clinic-accent">
            {{ formatCurrency(service.price) }}
          </p>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="services.length === 0"
        class="col-span-full text-center py-12 text-gray-400"
      >
        <Icon name="lucide:heart-handshake" class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>ບໍ່ມີບໍລິການ</p>
      </div>
    </div>

    <!-- Modal -->
    <Modal :show="showModal" :title="isEditing ? 'ແກ້ໄຂບໍລິການ' : 'ເພີ່ມບໍລິການ'" @close="showModal = false">
      <form @submit.prevent="saveService" class="space-y-4">
        <div>
          <label class="input-label">ຊື່ບໍລິການ *</label>
          <input v-model="form.name" type="text" class="input" required />
        </div>

        <div>
          <label class="input-label">ລາຍລະອຽດ</label>
          <textarea v-model="form.description" class="input" rows="3" />
        </div>

        <div>
          <label class="input-label">ລາຄາ *</label>
          <input v-model.number="form.price" type="number" class="input" min="0" required />
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="showModal = false" class="btn btn-secondary flex-1">
            ຍົກເລີກ
          </button>
          <button type="submit" class="btn btn-primary flex-1">
            {{ isEditing ? "ບັນທຶກ" : "ເພີ່ມ" }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

