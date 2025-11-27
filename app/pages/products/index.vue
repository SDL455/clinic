<script setup lang="ts">
import type { Product, ProductCategory } from "~/types";

definePageMeta({
  middleware: "auth",
});

const { getAuthHeaders } = useAuth();
const { success, error } = useNotification();

const products = ref<Product[]>([]);
const categories = ref<ProductCategory[]>([]);
const isLoading = ref(true);
const search = ref("");
const selectedCategory = ref<number | null>(null);
const filter = ref("");

// Modal states
const showModal = ref(false);
const isEditing = ref(false);
const editingProduct = ref<Product | null>(null);

const form = reactive({
  name: "",
  description: "",
  price: 0,
  costPrice: 0,
  stock: 0,
  minStock: 5,
  categoryId: 0,
});

// Fetch data
const fetchData = async () => {
  isLoading.value = true;
  try {
    const query = new URLSearchParams();
    if (search.value) query.set("search", search.value);
    if (selectedCategory.value) query.set("categoryId", String(selectedCategory.value));
    if (filter.value) query.set("filter", filter.value);

    const [productsRes, categoriesRes] = await Promise.all([
      $fetch<{ success: boolean; data: Product[] }>(`/api/products?${query}`, {
        headers: getAuthHeaders(),
      }),
      $fetch<{ success: boolean; data: ProductCategory[] }>("/api/categories", {
        headers: getAuthHeaders(),
      }),
    ]);

    if (productsRes.success) products.value = productsRes.data || [];
    if (categoriesRes.success) categories.value = categoriesRes.data || [];
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
  } finally {
    isLoading.value = false;
  }
};

// Open modal for new product
const openNewModal = () => {
  isEditing.value = false;
  editingProduct.value = null;
  Object.assign(form, {
    name: "",
    description: "",
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 5,
    categoryId: categories.value[0]?.id || 0,
  });
  showModal.value = true;
};

// Open modal for editing
const openEditModal = (product: Product) => {
  isEditing.value = true;
  editingProduct.value = product;
  Object.assign(form, {
    name: product.name,
    description: product.description || "",
    price: product.price,
    costPrice: product.costPrice,
    stock: product.stock,
    minStock: product.minStock,
    categoryId: product.categoryId,
  });
  showModal.value = true;
};

// Save product
const saveProduct = async () => {
  if (!form.name || !form.price || !form.categoryId) {
    error("ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ");
    return;
  }

  try {
    const url = isEditing.value ? `/api/products/${editingProduct.value?.id}` : "/api/products";
    const method = isEditing.value ? "PUT" : "POST";

    await $fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: form,
    });

    success(isEditing.value ? "ອັບເດດສິນຄ້າສຳເລັດ" : "ເພີ່ມສິນຄ້າສຳເລັດ");
    showModal.value = false;
    fetchData();
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  }
};

// Delete product
const deleteProduct = async (product: Product) => {
  if (!confirm(`ຕ້ອງການລຶບ "${product.name}" ບໍ່?`)) return;

  try {
    await $fetch(`/api/products/${product.id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    success("ລຶບສິນຄ້າສຳເລັດ");
    fetchData();
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

// Watch for search changes
watch([search, selectedCategory, filter], () => {
  fetchData();
});

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <PageHeader title="ສິນຄ້າ" description="ຈັດການສິນຄ້າ ແລະ Stock">
      <template #actions>
        <button @click="openNewModal" class="btn btn-primary">
          <Icon name="lucide:plus" class="w-4 h-4" />
          ເພີ່ມສິນຄ້າ
        </button>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <input
            v-model="search"
            type="text"
            class="input"
            placeholder="ຄົ້ນຫາສິນຄ້າ..."
          />
        </div>
        <div>
          <select v-model="selectedCategory" class="select">
            <option :value="null">ທຸກປະເພດ</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div>
          <select v-model="filter" class="select">
            <option value="">ທັງໝົດ</option>
            <option value="low-stock">Stock ໃກ້ໝົດ</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="card">
      <div class="table-container border-0">
        <table class="table">
          <thead>
            <tr>
              <th>ຊື່ສິນຄ້າ</th>
              <th>ປະເພດ</th>
              <th class="text-right">ລາຄາ</th>
              <th class="text-right">Stock</th>
              <th>ສະຖານະ</th>
              <th class="text-right">ຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="text-center py-8">
                <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin mx-auto text-clinic-accent" />
              </td>
            </tr>
            <tr v-else-if="products.length === 0">
              <td colspan="6" class="text-center py-8 text-gray-400">
                ບໍ່ມີສິນຄ້າ
              </td>
            </tr>
            <tr v-for="product in products" :key="product.id">
              <td>
                <div>
                  <p class="font-medium text-white">{{ product.name }}</p>
                  <p v-if="product.description" class="text-sm text-gray-500 truncate max-w-xs">
                    {{ product.description }}
                  </p>
                </div>
              </td>
              <td>
                <span class="badge badge-info">
                  {{ product.category?.name }}
                </span>
              </td>
              <td class="text-right font-medium">
                {{ formatCurrency(product.price) }}
              </td>
              <td class="text-right">
                <span
                  :class="
                    product.stock === 0
                      ? 'text-red-400'
                      : product.stock <= product.minStock
                      ? 'text-amber-400'
                      : 'text-white'
                  "
                >
                  {{ product.stock }} {{ product.category?.unit }}
                </span>
              </td>
              <td>
                <span
                  v-if="product.stock === 0"
                  class="badge badge-danger"
                >
                  ໝົດ Stock
                </span>
                <span
                  v-else-if="product.stock <= product.minStock"
                  class="badge badge-warning"
                >
                  ໃກ້ໝົດ
                </span>
                <span v-else class="badge badge-success">ປົກກະຕິ</span>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(product)"
                    class="p-2 hover:bg-clinic-dark rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <Icon name="lucide:pencil" class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteProduct(product)"
                    class="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                  >
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Modal :show="showModal" :title="isEditing ? 'ແກ້ໄຂສິນຄ້າ' : 'ເພີ່ມສິນຄ້າ'" @close="showModal = false">
      <form @submit.prevent="saveProduct" class="space-y-4">
        <div>
          <label class="input-label">ຊື່ສິນຄ້າ *</label>
          <input v-model="form.name" type="text" class="input" required />
        </div>

        <div>
          <label class="input-label">ລາຍລະອຽດ</label>
          <textarea v-model="form.description" class="input" rows="2" />
        </div>

        <div>
          <label class="input-label">ປະເພດ *</label>
          <select v-model="form.categoryId" class="select" required>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }} ({{ cat.unit }})
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label">ລາຄາຂາຍ *</label>
            <input v-model.number="form.price" type="number" class="input" required min="0" />
          </div>
          <div>
            <label class="input-label">ລາຄາຕົ້ນທຶນ</label>
            <input v-model.number="form.costPrice" type="number" class="input" min="0" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label">Stock</label>
            <input v-model.number="form.stock" type="number" class="input" min="0" />
          </div>
          <div>
            <label class="input-label">Stock ຕ່ຳສຸດ (ແຈ້ງເຕືອນ)</label>
            <input v-model.number="form.minStock" type="number" class="input" min="0" />
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

