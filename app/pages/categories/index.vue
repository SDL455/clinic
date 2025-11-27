<script setup lang="ts">
import type { ProductCategory } from "~/types";

definePageMeta({
  middleware: "auth",
});

const { getAuthHeaders } = useAuth();
const { success, error } = useNotification();

const categories = ref<ProductCategory[]>([]);
const isLoading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const editingCategory = ref<ProductCategory | null>(null);

const form = reactive({
  name: "",
  unit: "",
});

// Default units
const defaultUnits = ["ເມັດ", "ແຜ່ນ", "ອັນ", "ຖົງ", "ກ່ອງ", "ຂວດ"];

// Fetch categories
const fetchCategories = async () => {
  isLoading.value = true;
  try {
    const res = await $fetch<{ success: boolean; data: ProductCategory[] }>("/api/categories", {
      headers: getAuthHeaders(),
    });
    if (res.success) categories.value = res.data || [];
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  } finally {
    isLoading.value = false;
  }
};

// Open new modal
const openNewModal = () => {
  isEditing.value = false;
  editingCategory.value = null;
  form.name = "";
  form.unit = defaultUnits[0];
  showModal.value = true;
};

// Open edit modal
const openEditModal = (category: ProductCategory) => {
  isEditing.value = true;
  editingCategory.value = category;
  form.name = category.name;
  form.unit = category.unit;
  showModal.value = true;
};

// Save category
const saveCategory = async () => {
  if (!form.name || !form.unit) {
    error("ກະລຸນາປ້ອນຊື່ ແລະ ໜ່ວຍ");
    return;
  }

  try {
    const url = isEditing.value ? `/api/categories/${editingCategory.value?.id}` : "/api/categories";
    const method = isEditing.value ? "PUT" : "POST";

    await $fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: form,
    });

    success(isEditing.value ? "ອັບເດດປະເພດສຳເລັດ" : "ເພີ່ມປະເພດສຳເລັດ");
    showModal.value = false;
    fetchCategories();
  } catch (err: unknown) {
    const e = err as { data?: { message?: string } };
    error(e?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
  }
};

// Delete category
const deleteCategory = async (category: ProductCategory) => {
  if (!confirm(`ຕ້ອງການລຶບ "${category.name}" ບໍ່?`)) return;

  try {
    await $fetch(`/api/categories/${category.id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    success("ລຶບປະເພດສຳເລັດ");
    fetchCategories();
  } catch (err: unknown) {
    const e = err as { data?: { message?: string } };
    error(e?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div>
    <PageHeader title="ປະເພດສິນຄ້າ" description="ຈັດການປະເພດສິນຄ້າ">
      <template #actions>
        <button @click="openNewModal" class="btn btn-primary">
          <Icon name="lucide:plus" class="w-4 h-4" />
          ເພີ່ມປະເພດ
        </button>
      </template>
    </PageHeader>

    <!-- Categories Grid -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin text-clinic-accent" />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="category in categories"
        :key="category.id"
        class="card p-5 hover:border-clinic-accent/50 transition-colors"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-clinic-accent/20 flex items-center justify-center">
            <Icon name="lucide:layers" class="w-6 h-6 text-clinic-accent" />
          </div>
          <div class="flex gap-1">
            <button
              @click="openEditModal(category)"
              class="p-2 hover:bg-clinic-dark rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <Icon name="lucide:pencil" class="w-4 h-4" />
            </button>
            <button
              @click="deleteCategory(category)"
              class="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 class="text-lg font-semibold text-white mb-1">{{ category.name }}</h3>
        <p class="text-gray-400 text-sm mb-3">ໜ່ວຍ: {{ category.unit }}</p>

        <div class="pt-3 border-t border-clinic-border">
          <p class="text-sm text-gray-500">
            <Icon name="lucide:package" class="w-4 h-4 inline mr-1" />
            {{ category._count?.products || 0 }} ສິນຄ້າ
          </p>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="categories.length === 0"
        class="col-span-full text-center py-12 text-gray-400"
      >
        <Icon name="lucide:layers" class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>ບໍ່ມີປະເພດສິນຄ້າ</p>
      </div>
    </div>

    <!-- Modal -->
    <Modal :show="showModal" :title="isEditing ? 'ແກ້ໄຂປະເພດ' : 'ເພີ່ມປະເພດ'" @close="showModal = false">
      <form @submit.prevent="saveCategory" class="space-y-4">
        <div>
          <label class="input-label">ຊື່ປະເພດ *</label>
          <input v-model="form.name" type="text" class="input" placeholder="ຕົວຢ່າງ: ຢາເມັດ" required />
        </div>

        <div>
          <label class="input-label">ໜ່ວຍນັບ *</label>
          <select v-model="form.unit" class="select">
            <option v-for="unit in defaultUnits" :key="unit" :value="unit">
              {{ unit }}
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">ຫຼື ພິມໜ່ວຍໃໝ່:</p>
          <input v-model="form.unit" type="text" class="input mt-2" placeholder="ໜ່ວຍອື່ນ..." />
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

