<script setup lang="ts">
import type { DashboardStats, Sale } from "~/types";

definePageMeta({
  middleware: "auth",
});

const { getAuthHeaders, isAdmin } = useAuth();

const stats = ref<DashboardStats | null>(null);
const recentSales = ref<Sale[]>([]);
const isLoading = ref(true);

// Fetch dashboard data
const fetchDashboard = async () => {
  isLoading.value = true;
  try {
    const [statsRes, salesRes] = await Promise.all([
      $fetch<{ success: boolean; data: DashboardStats }>("/api/dashboard/stats", {
        headers: getAuthHeaders(),
      }),
      $fetch<{ success: boolean; data: Sale[] }>("/api/sales?limit=5", {
        headers: getAuthHeaders(),
      }),
    ]);

    if (statsRes.success) {
      stats.value = statsRes.data;
    }
    if (salesRes.success) {
      recentSales.value = salesRes.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch dashboard:", error);
  } finally {
    isLoading.value = false;
  }
};

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    minimumFractionDigits: 0,
  }).format(value);
};

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("lo-LA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Payment status badge
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

onMounted(() => {
  fetchDashboard();
});
</script>

<template>
  <div>
    <PageHeader
      title="ໜ້າຫຼັກ"
      description="ພາບລວມຂອງທຸລະກິດຂອງທ່ານ"
    >
      <template #actions>
        <NuxtLink to="/pos" class="btn btn-primary">
          <Icon name="lucide:plus" class="w-4 h-4" />
          ຂາຍໃໝ່
        </NuxtLink>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin text-clinic-accent" />
    </div>

    <template v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="ຍອດຂາຍມື້ນີ້"
          :value="formatCurrency(stats?.todayRevenue || 0)"
          icon="lucide:calendar"
          color="emerald"
        />
        <StatCard
          title="ຍອດຂາຍອາທິດນີ້"
          :value="formatCurrency(stats?.weekRevenue || 0)"
          icon="lucide:calendar-days"
          color="cyan"
        />
        <StatCard
          title="ລູກຄ້າທັງໝົດ"
          :value="stats?.totalCustomers?.toLocaleString() || '0'"
          icon="lucide:users"
          color="purple"
        />
        <StatCard
          title="ສິນຄ້າໃກ້ໝົດ"
          :value="stats?.lowStockProducts || 0"
          icon="lucide:alert-triangle"
          color="amber"
        />
      </div>

      <!-- Admin Only Stats -->
      <div v-if="isAdmin" class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="ຍອດຂາຍເດືອນນີ້"
          :value="formatCurrency(stats?.monthRevenue || 0)"
          icon="lucide:trending-up"
          color="emerald"
        />
        <StatCard
          title="ຈຳນວນການຂາຍ"
          :value="stats?.totalSales?.toLocaleString() || '0'"
          icon="lucide:receipt"
          color="cyan"
        />
        <StatCard
          title="ລາຍຮັບທັງໝົດ"
          :value="formatCurrency(stats?.totalRevenue || 0)"
          icon="lucide:wallet"
          color="purple"
        />
      </div>

      <!-- Recent Sales -->
      <div class="card">
        <div class="card-header flex items-center justify-between">
          <h3 class="font-semibold text-white">ການຂາຍຫຼ້າສຸດ</h3>
          <NuxtLink to="/sales" class="text-sm text-clinic-accent hover:underline">
            ເບິ່ງທັງໝົດ
          </NuxtLink>
        </div>
        <div class="table-container border-0">
          <table class="table">
            <thead>
              <tr>
                <th>ເລກບິນ</th>
                <th>ລູກຄ້າ</th>
                <th>ຍອດລວມ</th>
                <th>ສະຖານະ</th>
                <th>ວັນທີ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="recentSales.length === 0">
                <td colspan="5" class="text-center py-8 text-gray-400">
                  ບໍ່ມີການຂາຍຫຼ້າສຸດ
                </td>
              </tr>
              <tr
                v-for="sale in recentSales"
                :key="sale.id"
                class="cursor-pointer"
                @click="navigateTo(`/sales/${sale.id}`)"
              >
                <td class="font-mono text-clinic-accent">
                  {{ sale.invoiceNumber }}
                </td>
                <td>
                  {{ sale.customer?.firstName }} {{ sale.customer?.lastName }}
                </td>
                <td class="font-medium">{{ formatCurrency(sale.total) }}</td>
                <td>
                  <span class="badge" :class="getStatusBadge(sale.status).class">
                    {{ getStatusBadge(sale.status).label }}
                  </span>
                </td>
                <td class="text-gray-400">{{ formatDate(sale.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

