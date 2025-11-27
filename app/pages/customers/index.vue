<script setup lang="ts">
import type { Customer } from "~/types";
import { provinces, getDistrictsByProvince, getProvinceNames } from "~/utils/provinces";

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
  age: "",
  province: "",
  district: "",
  village: "",
});

// Form validation errors
const errors = reactive({
  firstName: "",
  lastName: "",
  phone: "",
  age: "",
  province: "",
  district: "",
  village: "",
});

// File upload
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

// Province and district data
const availableProvinces = getProvinceNames();
const availableDistricts = computed(() => {
  if (!form.province) return [];
  return getDistrictsByProvince(form.province);
});

// Watch province change to reset district
watch(() => form.province, () => {
  form.district = "";
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

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (!file.type.startsWith("image/")) {
      error("ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ");
      return;
    }
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

// Remove selected file
const removeFile = () => {
  selectedFile.value = null;
  previewUrl.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Open new modal
const openNewModal = () => {
  isEditing.value = false;
  editingCustomer.value = null;
  phoneExists.value = false;
  existingCustomer.value = null;
  selectedFile.value = null;
  previewUrl.value = null;
  Object.assign(form, {
    firstName: "",
    lastName: "",
    phone: "",
    age: "",
    province: "",
    district: "",
    village: "",
  });
  // Reset errors
  Object.assign(errors, {
    firstName: "",
    lastName: "",
    phone: "",
    age: "",
    province: "",
    district: "",
    village: "",
  });
  showModal.value = true;
};

// Open edit modal
const openEditModal = (customer: Customer) => {
  isEditing.value = true;
  editingCustomer.value = customer;
  phoneExists.value = false;
  existingCustomer.value = null;
  selectedFile.value = null;
  previewUrl.value = customer.image || null;
  Object.assign(form, {
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    age: (customer as any).age?.toString() || "",
    province: (customer as any).province || "",
    district: (customer as any).district || "",
    village: (customer as any).village || "",
  });
  // Reset errors
  Object.assign(errors, {
    firstName: "",
    lastName: "",
    phone: "",
    age: "",
    province: "",
    district: "",
    village: "",
  });
  showModal.value = true;
};

// Validate form
const validateForm = (): boolean => {
  let isValid = true;
  
  // Reset errors
  errors.firstName = "";
  errors.lastName = "";
  errors.phone = "";
  errors.age = "";
  errors.province = "";
  errors.district = "";
  errors.village = "";

  // Validate firstName
  if (!form.firstName.trim()) {
    errors.firstName = "ກະລຸນາປ້ອນຊື່";
    isValid = false;
  }

  // Validate lastName
  if (!form.lastName.trim()) {
    errors.lastName = "ກະລຸນາປ້ອນນາມສະກຸນ";
    isValid = false;
  }

  // Validate phone
  if (!form.phone.trim()) {
    errors.phone = "ກະລຸນາປ້ອນເບີໂທ";
    isValid = false;
  } else if (!/^[0-9]{8,11}$/.test(form.phone.replace(/\s/g, ""))) {
    errors.phone = "ເບີໂທຕ້ອງມີ 8-11 ຕົວເລກ";
    isValid = false;
  }

  // Validate age
  if (!form.age) {
    errors.age = "ກະລຸນາປ້ອນອາຍຸ";
    isValid = false;
  } else {
    const ageNum = parseInt(form.age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      errors.age = "ອາຍຸຕ້ອງລະຫວ່າງ 0-150 ປີ";
      isValid = false;
    }
  }

  // Validate province
  if (!form.province) {
    errors.province = "ກະລຸນາເລືອກແຂວງ";
    isValid = false;
  }

  // Validate district
  if (!form.district) {
    errors.district = "ກະລຸນາເລືອກເມືອງ";
    isValid = false;
  }

  // Validate village
  if (!form.village.trim()) {
    errors.village = "ກະລຸນາປ້ອນຊື່ບ້ານ";
    isValid = false;
  }

  return isValid;
};

// Save customer
const saveCustomer = async () => {
  // Validate form
  if (!validateForm()) {
    error("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
    return;
  }

  if (phoneExists.value && !isEditing.value) {
    error("ເບີໂທນີ້ມີໃນລະບົບແລ້ວ");
    return;
  }

  try {
    const url = isEditing.value ? `/api/customers/${editingCustomer.value?.id}` : "/api/customers";
    const method = isEditing.value ? "PUT" : "POST";

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("firstName", form.firstName.trim());
    formData.append("lastName", form.lastName.trim());
    formData.append("phone", form.phone.trim());
    formData.append("age", form.age);
    formData.append("province", form.province);
    formData.append("district", form.district);
    formData.append("village", form.village.trim());
    
    if (selectedFile.value) {
      formData.append("image", selectedFile.value);
    }

    await $fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: formData,
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
                  <div class="w-10 h-10 rounded-full bg-clinic-accent/20 flex items-center justify-center overflow-hidden">
                    <img
                      v-if="(customer as any).image"
                      :src="(customer as any).image"
                      :alt="`${customer.firstName} ${customer.lastName}`"
                      class="w-full h-full object-cover"
                    />
                    <Icon v-else name="lucide:user" class="w-5 h-5 text-clinic-accent" />
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
                <div v-if="(customer as any).province || (customer as any).district || (customer as any).village">
                  <span v-if="(customer as any).village">{{ (customer as any).village }}, </span>
                  <span v-if="(customer as any).district">{{ (customer as any).district }}, </span>
                  <span v-if="(customer as any).province">{{ (customer as any).province }}</span>
                </div>
                <span v-else>-</span>
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

        <!-- Image Upload -->
        <div>
          <label class="input-label">ຮູບພາບ</label>
          <div class="flex items-center gap-4">
            <div class="relative">
              <div
                class="w-24 h-24 rounded-xl bg-clinic-muted border-2 border-dashed border-clinic-border 
                       flex items-center justify-center overflow-hidden cursor-pointer
                       hover:border-clinic-accent transition-colors"
                @click="fileInput?.click()"
              >
                <img
                  v-if="previewUrl"
                  :src="previewUrl"
                  alt="Preview"
                  class="w-full h-full object-cover"
                />
                <Icon
                  v-else
                  name="lucide:image"
                  class="w-8 h-8 text-gray-400"
                />
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
              <button
                v-if="previewUrl"
                type="button"
                @click="removeFile"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full 
                       flex items-center justify-center text-white text-xs"
              >
                <Icon name="lucide:x" class="w-4 h-4" />
              </button>
            </div>
            <div class="flex-1">
              <button
                type="button"
                @click="fileInput?.click()"
                class="btn btn-secondary btn-sm"
              >
                <Icon name="lucide:upload" class="w-4 h-4" />
                ເລືອກຮູບພາບ
              </button>
              <p class="text-xs text-gray-400 mt-2">
                PNG, JPG, GIF (ສູງສຸດ 5MB)
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label">ຊື່ *</label>
            <input 
              v-model="form.firstName" 
              type="text" 
              class="input"
              :class="{ 'input-error': errors.firstName }"
            />
            <p v-if="errors.firstName" class="text-red-400 text-xs mt-1">
              {{ errors.firstName }}
            </p>
          </div>
          <div>
            <label class="input-label">ນາມສະກຸນ *</label>
            <input 
              v-model="form.lastName" 
              type="text" 
              class="input"
              :class="{ 'input-error': errors.lastName }"
            />
            <p v-if="errors.lastName" class="text-red-400 text-xs mt-1">
              {{ errors.lastName }}
            </p>
          </div>
        </div>

        <div>
          <label class="input-label">ເບີໂທ *</label>
          <input
            v-model="form.phone"
            type="tel"
            class="input"
            :class="{ 'input-error': errors.phone || phoneExists }"
          />
          <p v-if="errors.phone" class="text-red-400 text-xs mt-1">
            {{ errors.phone }}
          </p>
        </div>

        <div>
          <label class="input-label">ແຂວງ *</label>
          <select 
            v-model="form.province" 
            class="select"
            :class="{ 'input-error': errors.province }"
          >
            <option value="">-- ເລືອກແຂວງ --</option>
            <option v-for="province in availableProvinces" :key="province" :value="province">
              {{ province }}
            </option>
          </select>
          <p v-if="errors.province" class="text-red-400 text-xs mt-1">
            {{ errors.province }}
          </p>
        </div>

        <div>
          <label class="input-label">ເມືອງ *</label>
          <select 
            v-model="form.district" 
            class="select"
            :class="{ 'input-error': errors.district }"
            :disabled="!form.province"
          >
            <option value="">-- ເລືອກເມືອງ --</option>
            <option v-for="district in availableDistricts" :key="district" :value="district">
              {{ district }}
            </option>
          </select>
          <p v-if="errors.district" class="text-red-400 text-xs mt-1">
            {{ errors.district }}
          </p>
        </div>

        <div>
          <label class="input-label">ບ້ານ *</label>
          <input 
            v-model="form.village" 
            type="text" 
            class="input" 
            placeholder="ປ້ອນຊື່ບ້ານ"
            :class="{ 'input-error': errors.village }"
          />
          <p v-if="errors.village" class="text-red-400 text-xs mt-1">
            {{ errors.village }}
          </p>
        </div>

        <div>
          <label class="input-label">ອາຍຸ *</label>
          <input 
            v-model="form.age" 
            type="number" 
            class="input" 
            placeholder="ປ້ອນອາຍຸ" 
            min="0" 
            max="150"
            :class="{ 'input-error': errors.age }"
          />
          <p v-if="errors.age" class="text-red-400 text-xs mt-1">
            {{ errors.age }}
          </p>
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

