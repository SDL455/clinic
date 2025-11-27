<script setup lang="ts">
import type { Sale } from "~/types";

definePageMeta({
  middleware: "auth",
});

const { getAuthHeaders } = useAuth();
const { success, error } = useNotification();

const sales = ref<Sale[]>([]);
const isLoading = ref(true);
const search = ref("");
const statusFilter = ref("");

// Fetch sales
const fetchSales = async () => {
  isLoading.value = true;
  try {
    const query = new URLSearchParams();
    if (search.value) query.set("search", search.value);
    if (statusFilter.value) query.set("status", statusFilter.value);

    const res = await $fetch<{ success: boolean; data: Sale[] }>(
      `/api/sales?${query}`,
      { headers: getAuthHeaders() }
    );
    if (res.success) sales.value = res.data || [];
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  } finally {
    isLoading.value = false;
  }
};

// Update status
const updateStatus = async (sale: Sale, status: string) => {
  try {
    await $fetch(`/api/sales/${sale.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: { status },
    });
    success("ອັບເດດສະຖານະສຳເລັດ");
    fetchSales();
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

// Format date
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("lo-LA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Payment status
const getStatusBadge = (status: string) => {
  switch (status) {
    case "PAID":
      return { class: "badge-success", label: "ຈ່າຍແລ້ວ" };
    case "TRANSFER":
      return { class: "badge-info", label: "ໂອນ" };
    default:
      return { class: "badge-warning", label: "ຍັງບໍ່ຈ່າຍ" };
  }
};

// Watch filters
watch([search, statusFilter], () => {
  fetchSales();
});

onMounted(() => {
  fetchSales();
});
</script>

<template>
  <div>
    <PageHeader title="ປະຫວັດການຂາຍ" description="ເບິ່ງ ແລະ ຈັດການການຂາຍ">
      <template #actions>
        <NuxtLink to="/pos" class="btn btn-primary">
          <Icon name="lucide:plus" class="w-4 h-4" />
          ຂາຍໃໝ່
        </NuxtLink>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="relative">
          <Icon
            name="lucide:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
          />
          <input
            v-model="search"
            type="text"
            class="input pl-11"
            placeholder="ຄົ້ນຫາ (ເລກບິນ, ຊື່ລູກຄ້າ, ເບີໂທ)..."
          />
        </div>
        <select v-model="statusFilter" class="select">
          <option value="">ທຸກສະຖານະ</option>
          <option value="PAID">ຈ່າຍແລ້ວ</option>
          <option value="UNPAID">ຍັງບໍ່ຈ່າຍ</option>
          <option value="TRANSFER">ໂອນ</option>
        </select>
      </div>
    </div>

    <!-- Sales Table -->
    <div class="card">
      <div class="table-container border-0">
        <table class="table">
          <thead>
            <tr>
              <th>ເລກບິນ</th>
              <th>ລູກຄ້າ</th>
              <th>ລາຍການ</th>
              <th class="text-right">ຍອດລວມ</th>
              <th>ສະຖານະ</th>
              <th>ວັນທີ</th>
              <th class="text-right">ຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="7" class="text-center py-8">
                <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin mx-auto text-clinic-accent" />
              </td>
            </tr>
            <tr v-else-if="sales.length === 0">
              <td colspan="7" class="text-center py-8 text-gray-400">
                ບໍ່ມີການຂາຍ
              </td>
            </tr>
            <tr
              v-for="sale in sales"
              :key="sale.id"
              class="cursor-pointer"
              @click="navigateTo(`/sales/${sale.id}`)"
            >
              <td class="font-mono text-clinic-accent">
                {{ sale.invoiceNumber }}
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-clinic-accent/20 flex items-center justify-center">
                    <Icon name="lucide:user" class="w-4 h-4 text-clinic-accent" />
                  </div>
                  <div>
                    <p class="font-medium text-white">
                      {{ sale.customer?.firstName }} {{ sale.customer?.lastName }}
                    </p>
                    <p class="text-xs text-gray-500">{{ sale.customer?.phone }}</p>
                  </div>
                </div>
              </td>
              <td class="text-gray-400">
                {{ sale.items?.length || 0 }} ລາຍການ
              </td>
              <td class="text-right font-semibold text-white">
                {{ formatCurrency(sale.total) }}
              </td>
              <td @click.stop>
                <select
                  class="select py-1 text-sm"
                  :value="sale.status"
                  @change="(e) => updateStatus(sale, (e.target as HTMLSelectElement).value)"
                >
                  <option value="PAID">ຈ່າຍແລ້ວ</option>
                  <option value="UNPAID">ຍັງບໍ່ຈ່າຍ</option>
                  <option value="TRANSFER">ໂອນ</option>
                </select>
              </td>
              <td class="text-gray-400 text-sm">
                {{ formatDate(sale.createdAt) }}
              </td>
              <td class="text-right" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/sales/${sale.id}`"
                    class="p-2 hover:bg-clinic-dark rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <Icon name="lucide:eye" class="w-4 h-4" />
                  </NuxtLink>
                  <NuxtLink
                    :to="`/sales/${sale.id}?print=true`"
                    class="p-2 hover:bg-clinic-dark rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <Icon name="lucide:printer" class="w-4 h-4" />
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

