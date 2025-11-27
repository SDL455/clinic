<script setup lang="ts">
import type { Product } from "~/types";

const { getAuthHeaders, isLoggedIn } = useAuth();

const lowStockProducts = ref<Product[]>([]);
const isOpen = ref(false);
const isLoading = ref(false);

// Fetch low stock products
const fetchLowStock = async () => {
  if (!isLoggedIn.value) return;

  isLoading.value = true;
  try {
    const response = await $fetch<{ success: boolean; data: Product[] }>(
      "/api/products/low-stock",
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.success) {
      lowStockProducts.value = response.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch low stock products:", error);
  } finally {
    isLoading.value = false;
  }
};

// Fetch on mount
onMounted(() => {
  fetchLowStock();
  // Refresh every 5 minutes
  setInterval(fetchLowStock, 5 * 60 * 1000);
});
</script>

<template>
  <div class="relative">
    <!-- Alert Button -->
    <button
      @click="isOpen = !isOpen"
      class="relative p-2 rounded-lg hover:bg-clinic-dark transition-colors"
      :class="{ 'text-amber-400': lowStockProducts.length > 0 }"
    >
      <Icon name="lucide:bell" class="w-5 h-5" />
      <span
        v-if="lowStockProducts.length > 0"
        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse"
      >
        {{ lowStockProducts.length > 9 ? "9+" : lowStockProducts.length }}
      </span>
    </button>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-80 bg-clinic-surface rounded-xl border border-clinic-border shadow-2xl overflow-hidden z-50"
      >
        <div class="p-4 border-b border-clinic-border">
          <h3 class="font-medium text-white flex items-center gap-2">
            <Icon name="lucide:alert-triangle" class="w-4 h-4 text-amber-400" />
            ແຈ້ງເຕືອນ Stock ໃກ້ໝົດ
          </h3>
        </div>

        <div class="max-h-80 overflow-y-auto">
          <div v-if="isLoading" class="p-4 text-center text-gray-400">
            <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin mx-auto" />
          </div>

          <div
            v-else-if="lowStockProducts.length === 0"
            class="p-4 text-center text-gray-400"
          >
            <Icon name="lucide:package-check" class="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            <p class="text-sm">ບໍ່ມີສິນຄ້າທີ່ Stock ໃກ້ໝົດ</p>
          </div>

          <div v-else class="divide-y divide-clinic-border">
            <NuxtLink
              v-for="product in lowStockProducts"
              :key="product.id"
              :to="`/products/${product.id}`"
              class="p-4 flex items-center gap-3 hover:bg-clinic-dark transition-colors"
              @click="isOpen = false"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="
                  product.stock === 0
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                "
              >
                <Icon
                  :name="product.stock === 0 ? 'lucide:package-x' : 'lucide:package'"
                  class="w-5 h-5"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">
                  {{ product.name }}
                </p>
                <p class="text-xs text-gray-400">
                  ຍັງເຫຼືອ:
                  <span
                    :class="
                      product.stock === 0 ? 'text-red-400' : 'text-amber-400'
                    "
                  >
                    {{ product.stock }} {{ product.category?.unit || "ອັນ" }}
                  </span>
                </p>
              </div>
              <span
                v-if="product.stock === 0"
                class="badge badge-danger"
              >
                ໝົດ
              </span>
              <span v-else class="badge badge-warning">ໃກ້ໝົດ</span>
            </NuxtLink>
          </div>
        </div>

        <NuxtLink
          to="/products?filter=low-stock"
          class="block p-3 text-center text-sm text-clinic-accent hover:bg-clinic-dark transition-colors border-t border-clinic-border"
          @click="isOpen = false"
        >
          ເບິ່ງທັງໝົດ
        </NuxtLink>
      </div>
    </Transition>

    <!-- Click outside to close -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    />
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

