<script setup lang="ts">
definePageMeta({
  middleware: "admin",
});

const { getAuthHeaders } = useAuth();
const { error } = useNotification();

interface ReportData {
  report: { period: string; revenue: number; count: number }[];
  summary: {
    totalRevenue: number;
    totalCount: number;
    avgPerSale: number;
  };
}

const reportData = ref<ReportData | null>(null);
const isLoading = ref(true);
const period = ref("daily");

// Date filters
const startDate = ref(
  new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
);
const endDate = ref(new Date().toISOString().split("T")[0]);

// Fetch report
const fetchReport = async () => {
  isLoading.value = true;
  try {
    const query = new URLSearchParams({
      period: period.value,
      startDate: startDate.value,
      endDate: endDate.value,
    });

    const res = await $fetch<{ success: boolean; data: ReportData }>(
      `/api/reports/revenue?${query}`,
      { headers: getAuthHeaders() }
    );
    if (res.success) reportData.value = res.data;
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  } finally {
    isLoading.value = false;
  }
};

// Format currency
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    minimumFractionDigits: 0,
  }).format(value);

// Format period label
const formatPeriod = (periodStr: string) => {
  if (period.value === "daily") {
    return new Date(periodStr).toLocaleDateString("lo-LA", {
      day: "numeric",
      month: "short",
    });
  }
  if (period.value === "monthly") {
    const [year, month] = periodStr.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("lo-LA", {
      month: "long",
      year: "numeric",
    });
  }
  if (period.value === "weekly") {
    return periodStr.replace("-W", " ອາທິດທີ ");
  }
  return periodStr;
};

// Max revenue for chart
const maxRevenue = computed(() =>
  Math.max(...(reportData.value?.report.map((r) => r.revenue) || [0]), 1)
);

// Watch filters
watch([period, startDate, endDate], () => {
  fetchReport();
});

onMounted(() => {
  fetchReport();
});
</script>

<template>
  <div>
    <PageHeader
      title="ລາຍງານຍອດຂາຍ"
      description="ເບິ່ງລາຍງານຍອດຂາຍປະຈຳວັນ, ອາທິດ, ເດືອນ, ປີ"
    />

    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label class="input-label">ປະເພດລາຍງານ</label>
          <select v-model="period" class="select">
            <option value="daily">ລາຍວັນ</option>
            <option value="weekly">ລາຍອາທິດ</option>
            <option value="monthly">ລາຍເດືອນ</option>
            <option value="yearly">ລາຍປີ</option>
          </select>
        </div>
        <div>
          <label class="input-label">ວັນເລີ່ມຕົ້ນ</label>
          <input v-model="startDate" type="date" class="input" />
        </div>
        <div>
          <label class="input-label">ວັນສິ້ນສຸດ</label>
          <input v-model="endDate" type="date" class="input" />
        </div>
        <div class="flex items-end">
          <button @click="fetchReport" class="btn btn-primary w-full">
            <Icon name="lucide:refresh-cw" class="w-4 h-4" />
            ໂຫຼດໃໝ່
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin text-clinic-accent" />
    </div>

    <template v-else-if="reportData">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="ລາຍຮັບລວມ"
          :value="formatCurrency(reportData.summary.totalRevenue)"
          icon="lucide:wallet"
          color="emerald"
        />
        <StatCard
          title="ຈຳນວນການຂາຍ"
          :value="reportData.summary.totalCount.toLocaleString()"
          icon="lucide:receipt"
          color="cyan"
        />
        <StatCard
          title="ສະເລ່ຍຕໍ່ການຂາຍ"
          :value="formatCurrency(reportData.summary.avgPerSale)"
          icon="lucide:calculator"
          color="purple"
        />
      </div>

      <!-- Chart -->
      <div class="card p-6 mb-6">
        <h3 class="font-semibold text-white mb-6">ກຣາຟລາຍຮັບ</h3>

        <div v-if="reportData.report.length === 0" class="text-center py-12 text-gray-400">
          <Icon name="lucide:bar-chart-2" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>ບໍ່ມີຂໍ້ມູນໃນຊ່ວງນີ້</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in reportData.report"
            :key="item.period"
            class="flex items-center gap-4"
          >
            <div class="w-24 text-sm text-gray-400 shrink-0">
              {{ formatPeriod(item.period) }}
            </div>
            <div class="flex-1 h-8 bg-clinic-dark rounded-lg overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-clinic-accent to-cyan-500 rounded-lg transition-all duration-500"
                :style="{ width: `${(item.revenue / maxRevenue) * 100}%` }"
              />
            </div>
            <div class="w-32 text-right font-semibold text-white shrink-0">
              {{ formatCurrency(item.revenue) }}
            </div>
            <div class="w-16 text-right text-gray-500 text-sm shrink-0">
              {{ item.count }} ຄັ້ງ
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="card-header">
          <h3 class="font-semibold text-white">ຕາຕະລາງລາຍລະອຽດ</h3>
        </div>
        <div class="table-container border-0">
          <table class="table">
            <thead>
              <tr>
                <th>ຊ່ວງເວລາ</th>
                <th class="text-right">ຍອດຂາຍ</th>
                <th class="text-right">ຈຳນວນ</th>
                <th class="text-right">ສະເລ່ຍ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reportData.report.length === 0">
                <td colspan="4" class="text-center py-8 text-gray-400">
                  ບໍ່ມີຂໍ້ມູນ
                </td>
              </tr>
              <tr v-for="item in reportData.report" :key="item.period">
                <td class="font-medium text-white">
                  {{ formatPeriod(item.period) }}
                </td>
                <td class="text-right font-semibold text-clinic-accent">
                  {{ formatCurrency(item.revenue) }}
                </td>
                <td class="text-right text-gray-400">{{ item.count }}</td>
                <td class="text-right text-gray-400">
                  {{ formatCurrency(item.count > 0 ? item.revenue / item.count : 0) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-clinic-dark">
                <td class="font-bold text-white">ລວມ</td>
                <td class="text-right font-bold text-clinic-accent">
                  {{ formatCurrency(reportData.summary.totalRevenue) }}
                </td>
                <td class="text-right font-bold text-white">
                  {{ reportData.summary.totalCount }}
                </td>
                <td class="text-right font-bold text-white">
                  {{ formatCurrency(reportData.summary.avgPerSale) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

