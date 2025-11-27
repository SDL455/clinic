<script setup lang="ts">
import type { Customer } from "~/types";

definePageMeta({
  middleware: "auth",
});

const { getAuthHeaders } = useAuth();
const { success, error } = useNotification();

const customers = ref<(Customer & { _count?: { sales: number } })[]>([]);
const isLoading = ref(true);
const search = ref("");
const showModal = ref(false);
const isEditing = ref(false);
const editingCustomer = ref<Customer | null>(null);
const phoneExists = ref(false);
const existingCustomer = ref<Customer | null>(null);

const form = reactive({
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
});

// Fetch customers
const fetchCustomers = async () => {
  isLoading.value = true;
  try {
    const query = search.value ? `?search=${encodeURIComponent(search.value)}` : "";
    const res = await $fetch<{ success: boolean; data: Customer[] }>(`/api/customers${query}`, {
      headers: getAuthHeaders(),
    });
    if (res.success) customers.value = res.data || [];
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  } finally {
    isLoading.value = false;
  }
};

// Check if phone exists
const checkPhone = async () => {
  if (!form.phone || form.phone.length < 8) {
    phoneExists.value = false;
    existingCustomer.value = null;
    return;
  }

  try {
    const res = await $fetch<{
      success: boolean;
      data: { exists: boolean; customer: Customer | null };
    }>(`/api/customers/check-phone?phone=${form.phone}`, {
      headers: getAuthHeaders(),
    });

    if (res.success) {
      // Don't show warning if editing same customer
      if (isEditing.value && res.data.customer?.id === editingCustomer.value?.id) {
        phoneExists.value = false;
        existingCustomer.value = null;
      } else {
        phoneExists.value = res.data.exists;
        existingCustomer.value = res.data.customer;
      }
    }
  } catch (err) {
    // Ignore
  }
};

// Open new modal
const openNewModal = () => {
  isEditing.value = false;
  editingCustomer.value = null;
  phoneExists.value = false;
  existingCustomer.value = null;
  Object.assign(form, {
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });
  showModal.value = true;
};

// Open edit modal
const openEditModal = (customer: Customer) => {
  isEditing.value = true;
  editingCustomer.value = customer;
  phoneExists.value = false;
  existingCustomer.value = null;
  Object.assign(form, {
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    address: customer.address || "",
  });
  showModal.value = true;
};

// Save customer
const saveCustomer = async () => {
  if (!form.firstName || !form.lastName || !form.phone) {
    error("ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ");
    return;
  }

  if (phoneExists.value && !isEditing.value) {
    error("ເບີໂທນີ້ມີໃນລະບົບແລ້ວ");
    return;
  }

  try {
    const url = isEditing.value ? `/api/customers/${editingCustomer.value?.id}` : "/api/customers";
    const method = isEditing.value ? "PUT" : "POST";

    await $fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: form,
    });

    success(isEditing.value ? "ອັບເດດລູກຄ້າສຳເລັດ" : "ເພີ່ມລູກຄ້າສຳເລັດ");
    showModal.value = false;
    fetchCustomers();
  } catch (err: unknown) {
    const e = err as { data?: { message?: string } };
    error(e?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
  }
};

// Format date
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("lo-LA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Watch search
watch(search, () => {
  fetchCustomers();
});

// Watch phone for check
watch(() => form.phone, checkPhone);

onMounted(() => {
  fetchCustomers();
});
</script>

<template>
  <div>
    <PageHeader title="ລູກຄ້າ" description="ຈັດການຂໍ້ມູນລູກຄ້າ">
      <template #actions>
        <button @click="openNewModal" class="btn btn-primary">
          <Icon name="lucide:user-plus" class="w-4 h-4" />
          ເພີ່ມລູກຄ້າ
        </button>
      </template>
    </PageHeader>

    <!-- Search -->
    <div class="card p-4 mb-6">
      <div class="relative">
        <Icon
          name="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
        />
        <input
          v-model="search"
          type="text"
          class="input pl-11"
          placeholder="ຄົ້ນຫາລູກຄ້າ (ຊື່, ນາມສະກຸນ, ເບີໂທ)..."
        />
      </div>
    </div>

    <!-- Customers Table -->
    <div class="card">
      <div class="table-container border-0">
        <table class="table">
          <thead>
            <tr>
              <th>ລູກຄ້າ</th>
              <th>ເບີໂທ</th>
              <th>ທີ່ຢູ່</th>
              <th class="text-center">ການຊື້</th>
              <th>ວັນທີລົງທະບຽນ</th>
              <th class="text-right">ຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="text-center py-8">
                <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin mx-auto text-clinic-accent" />
              </td>
            </tr>
            <tr v-else-if="customers.length === 0">
              <td colspan="6" class="text-center py-8 text-gray-400">
                ບໍ່ມີລູກຄ້າ
              </td>
            </tr>
            <tr v-for="customer in customers" :key="customer.id">
              <td>
                <NuxtLink
                  :to="`/customers/${customer.id}`"
                  class="flex items-center gap-3 hover:text-clinic-accent"
                >
                  <div class="w-10 h-10 rounded-full bg-clinic-accent/20 flex items-center justify-center">
                    <Icon name="lucide:user" class="w-5 h-5 text-clinic-accent" />
                  </div>
                  <span class="font-medium text-white">
                    {{ customer.firstName }} {{ customer.lastName }}
                  </span>
                </NuxtLink>
              </td>
              <td>
                <a :href="`tel:${customer.phone}`" class="text-clinic-accent hover:underline">
                  {{ customer.phone }}
                </a>
              </td>
              <td class="text-gray-400 max-w-xs truncate">
                {{ customer.address || "-" }}
              </td>
              <td class="text-center">
                <span class="badge badge-info">
                  {{ customer._count?.sales || 0 }} ຄັ້ງ
                </span>
              </td>
              <td class="text-gray-400">
                {{ formatDate(customer.createdAt) }}
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/customers/${customer.id}`"
                    class="p-2 hover:bg-clinic-dark rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <Icon name="lucide:history" class="w-4 h-4" />
                  </NuxtLink>
                  <button
                    @click="openEditModal(customer)"
                    class="p-2 hover:bg-clinic-dark rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <Icon name="lucide:pencil" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Modal :show="showModal" :title="isEditing ? 'ແກ້ໄຂລູກຄ້າ' : 'ເພີ່ມລູກຄ້າ'" @close="showModal = false">
      <form @submit.prevent="saveCustomer" class="space-y-4">
        <!-- Phone Warning -->
        <div v-if="phoneExists && existingCustomer" class="alert alert-warning">
          <Icon name="lucide:alert-triangle" class="w-5 h-5 flex-shrink-0" />
          <div>
            <p class="font-medium">ເບີໂທນີ້ມີໃນລະບົບແລ້ວ!</p>
            <p class="text-sm">
              ລູກຄ້າ: {{ existingCustomer.firstName }} {{ existingCustomer.lastName }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label">ຊື່ *</label>
            <input v-model="form.firstName" type="text" class="input" required />
          </div>
          <div>
            <label class="input-label">ນາມສະກຸນ *</label>
            <input v-model="form.lastName" type="text" class="input" required />
          </div>
        </div>

        <div>
          <label class="input-label">ເບີໂທ *</label>
          <input
            v-model="form.phone"
            type="tel"
            class="input"
            :class="{ 'input-error': phoneExists }"
            required
          />
        </div>

        <div>
          <label class="input-label">ທີ່ຢູ່</label>
          <textarea v-model="form.address" class="input" rows="2" />
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="showModal = false" class="btn btn-secondary flex-1">
            ຍົກເລີກ
          </button>
          <button type="submit" class="btn btn-primary flex-1" :disabled="phoneExists && !isEditing">
            {{ isEditing ? "ບັນທຶກ" : "ເພີ່ມ" }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

