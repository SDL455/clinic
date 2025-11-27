<script setup lang="ts">
import type { Promotion } from "~/types";

definePageMeta({
  middleware: "auth",
});

const { getAuthHeaders } = useAuth();
const { success, error } = useNotification();

const promotions = ref<Promotion[]>([]);
const isLoading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const editingPromotion = ref<Promotion | null>(null);

const form = reactive({
  name: "",
  description: "",
  discount: 0,
  isPercent: false,
  startDate: "",
  endDate: "",
});

// Fetch promotions
const fetchPromotions = async () => {
  isLoading.value = true;
  try {
    const res = await $fetch<{ success: boolean; data: Promotion[] }>("/api/promotions", {
      headers: getAuthHeaders(),
    });
    if (res.success) promotions.value = res.data || [];
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  } finally {
    isLoading.value = false;
  }
};

// Check if promotion is active
const isActive = (promo: Promotion) => {
  const now = new Date();
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);
  return promo.isActive && now >= start && now <= end;
};

// Open new modal
const openNewModal = () => {
  isEditing.value = false;
  editingPromotion.value = null;
  const today = new Date().toISOString().split("T")[0];
  Object.assign(form, {
    name: "",
    description: "",
    discount: 0,
    isPercent: false,
    startDate: today,
    endDate: today,
  });
  showModal.value = true;
};

// Open edit modal
const openEditModal = (promo: Promotion) => {
  isEditing.value = true;
  editingPromotion.value = promo;
  Object.assign(form, {
    name: promo.name,
    description: promo.description || "",
    discount: promo.discount,
    isPercent: promo.isPercent,
    startDate: new Date(promo.startDate).toISOString().split("T")[0],
    endDate: new Date(promo.endDate).toISOString().split("T")[0],
  });
  showModal.value = true;
};

// Save promotion
const savePromotion = async () => {
  if (!form.name || !form.discount || !form.startDate || !form.endDate) {
    error("ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ");
    return;
  }

  try {
    const url = isEditing.value ? `/api/promotions/${editingPromotion.value?.id}` : "/api/promotions";
    const method = isEditing.value ? "PUT" : "POST";

    await $fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: form,
    });

    success(isEditing.value ? "ອັບເດດໂປຣໂມຊັ່ນສຳເລັດ" : "ເພີ່ມໂປຣໂມຊັ່ນສຳເລັດ");
    showModal.value = false;
    fetchPromotions();
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  }
};

// Delete promotion
const deletePromotion = async (promo: Promotion) => {
  if (!confirm(`ຕ້ອງການລຶບ "${promo.name}" ບໍ່?`)) return;

  try {
    await $fetch(`/api/promotions/${promo.id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    success("ລຶບໂປຣໂມຊັ່ນສຳເລັດ");
    fetchPromotions();
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  }
};

// Format date
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("lo-LA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Format discount
const formatDiscount = (promo: Promotion) => {
  if (promo.isPercent) {
    return `${promo.discount}%`;
  }
  return new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    minimumFractionDigits: 0,
  }).format(promo.discount);
};

onMounted(() => {
  fetchPromotions();
});
</script>

<template>
  <div>
    <PageHeader title="ໂປຣໂມຊັ່ນ" description="ຈັດການໂປຣໂມຊັ່ນ ແລະ ສ່ວນຫຼຸດ">
      <template #actions>
        <button @click="openNewModal" class="btn btn-primary">
          <Icon name="lucide:plus" class="w-4 h-4" />
          ເພີ່ມໂປຣໂມຊັ່ນ
        </button>
      </template>
    </PageHeader>

    <!-- Promotions Grid -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin text-clinic-accent" />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="promo in promotions"
        :key="promo.id"
        class="card p-5 hover:border-clinic-accent/50 transition-all group relative overflow-hidden"
      >
        <!-- Status Badge -->
        <div class="absolute top-4 right-4">
          <span
            v-if="isActive(promo)"
            class="badge badge-success animate-pulse"
          >
            ກຳລັງໃຊ້ງານ
          </span>
          <span v-else class="badge badge-warning">ໝົດອາຍຸ</span>
        </div>

        <div class="mb-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Icon name="lucide:percent" class="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <h3 class="text-lg font-semibold text-white mb-2">{{ promo.name }}</h3>
        <p v-if="promo.description" class="text-gray-400 text-sm mb-4 line-clamp-2">
          {{ promo.description }}
        </p>

        <!-- Discount -->
        <div class="text-3xl font-bold text-amber-400 mb-4">
          {{ formatDiscount(promo) }}
        </div>

        <!-- Date Range -->
        <div class="text-sm text-gray-500 mb-4">
          <Icon name="lucide:calendar" class="w-4 h-4 inline mr-1" />
          {{ formatDate(promo.startDate) }} - {{ formatDate(promo.endDate) }}
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-4 border-t border-clinic-border">
          <button
            @click="openEditModal(promo)"
            class="btn btn-secondary btn-sm flex-1"
          >
            <Icon name="lucide:pencil" class="w-4 h-4" />
            ແກ້ໄຂ
          </button>
          <button
            @click="deletePromotion(promo)"
            class="btn btn-sm px-3 hover:bg-red-500/20 text-gray-400 hover:text-red-400"
          >
            <Icon name="lucide:trash-2" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="promotions.length === 0"
        class="col-span-full text-center py-12 text-gray-400"
      >
        <Icon name="lucide:percent" class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>ບໍ່ມີໂປຣໂມຊັ່ນ</p>
      </div>
    </div>

    <!-- Modal -->
    <Modal :show="showModal" :title="isEditing ? 'ແກ້ໄຂໂປຣໂມຊັ່ນ' : 'ເພີ່ມໂປຣໂມຊັ່ນ'" @close="showModal = false">
      <form @submit.prevent="savePromotion" class="space-y-4">
        <div>
          <label class="input-label">ຊື່ໂປຣໂມຊັ່ນ *</label>
          <input v-model="form.name" type="text" class="input" required />
        </div>

        <div>
          <label class="input-label">ລາຍລະອຽດ</label>
          <textarea v-model="form.description" class="input" rows="2" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label">ສ່ວນຫຼຸດ *</label>
            <input v-model.number="form.discount" type="number" class="input" min="0" required />
          </div>
          <div>
            <label class="input-label">ປະເພດ</label>
            <select v-model="form.isPercent" class="select">
              <option :value="false">ຈຳນວນເງິນ (LAK)</option>
              <option :value="true">ເປີເຊັນ (%)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label">ວັນເລີ່ມຕົ້ນ *</label>
            <input v-model="form.startDate" type="date" class="input" required />
          </div>
          <div>
            <label class="input-label">ວັນສິ້ນສຸດ *</label>
            <input v-model="form.endDate" type="date" class="input" required />
          </div>
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

