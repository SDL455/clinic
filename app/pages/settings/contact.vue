<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "admin"],
});

const { success: notifySuccess, error: notifyError } = useNotification();

// State
const contactInfo = ref<any>({
  phone: ["", ""],
  email: "",
  facebook: "",
  line: "",
  website: "",
  address: "",
  province: "ນະຄອນຫຼວງວຽງຈັນ",
  district: "",
  village: "",
  openingHours: {
    monday: "08:00 - 17:00",
    tuesday: "08:00 - 17:00",
    wednesday: "08:00 - 17:00",
    thursday: "08:00 - 17:00",
    friday: "08:00 - 17:00",
    saturday: "08:00 - 12:00",
    sunday: "ປິດ"
  },
  mapUrl: "",
  description: ""
});

const loading = ref(true);
const saving = ref(false);

// Fetch contact info
const fetchContactInfo = async () => {
  try {
    loading.value = true;
    const response = await $fetch("/api/contact");
    if (response.success && response.data) {
      contactInfo.value = { ...response.data };
    }
  } catch (error) {
    console.error("Error fetching contact info:", error);
    notifyError("ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
  } finally {
    loading.value = false;
  }
};

// Save contact info
const saveContactInfo = async () => {
  try {
    saving.value = true;
    
    // Filter out empty phone numbers
    const cleanedData = {
      ...contactInfo.value,
      phone: contactInfo.value.phone.filter((p: string) => p.trim() !== "")
    };
    
    const response = await $fetch("/api/contact", {
      method: "PUT",
      body: cleanedData
    });

    if (response.success) {
      notifySuccess("ບັນທຶກຂໍ້ມູນສຳເລັດແລ້ວ");
    } else {
      notifyError("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ");
    }
  } catch (error) {
    console.error("Error saving contact info:", error);
    notifyError("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ");
  } finally {
    saving.value = false;
  }
};

// Add phone number field
const addPhoneField = () => {
  contactInfo.value.phone.push("");
};

// Remove phone number field
const removePhoneField = (index: number) => {
  if (contactInfo.value.phone.length > 1) {
    contactInfo.value.phone.splice(index, 1);
  }
};

// Preview public page
const previewPublicPage = () => {
  window.open("/info", "_blank");
};

onMounted(() => {
  fetchContactInfo();
});
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="bg-gradient-to-r from-clinic-primary via-clinic-secondary to-clinic-accent-purple rounded-3xl shadow-xl p-8 mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="text-white">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Icon name="lucide:contact" class="w-8 h-8" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-white">ຈັດການຂໍ້ມູນຕິດຕໍ່</h1>
              <p class="text-white/80">ແກ້ໄຂຂໍ້ມູນການຕິດຕໍ່ແລະທີ່ຕັ້ງຂອງຮ້ານ</p>
            </div>
          </div>
        </div>
        <div class="flex gap-3">
          <button @click="previewPublicPage" class="btn glass text-white hover:bg-white/30 shadow-lg">
            <Icon name="lucide:eye" class="w-5 h-5" />
            <span>ເບິ່ງໜ້າສາທາລະນະ</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      <p class="mt-4 text-gray-600">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="saveContactInfo" class="space-y-6">
      <!-- Contact Information Section -->
      <div class="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Icon name="lucide:phone" class="w-6 h-6 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-gray-800">ຂໍ້ມູນຕິດຕໍ່</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Phone Numbers -->
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              ເບີໂທ <span class="text-red-500">*</span>
            </label>
            <div class="space-y-3">
              <div 
                v-for="(phone, index) in contactInfo.phone" 
                :key="index"
                class="flex gap-2"
              >
                <input
                  v-model="contactInfo.phone[index]"
                  type="text"
                  placeholder="020 5555 5555"
                  class="input flex-1"
                  required
                />
                <button
                  v-if="contactInfo.phone.length > 1"
                  type="button"
                  @click="removePhoneField(index)"
                  class="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 border-0"
                >
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                @click="addPhoneField"
                class="btn btn-sm bg-purple-50 text-purple-600 hover:bg-purple-100 border-0 w-full"
              >
                <Icon name="lucide:plus" class="w-4 h-4" />
                <span>ເພີ່ມເບີໂທ</span>
              </button>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              ອີເມວ
            </label>
            <div class="relative">
              <Icon name="lucide:mail" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="contactInfo.email"
                type="email"
                placeholder="info@clinic.la"
                class="input pl-10"
              />
            </div>
          </div>

          <!-- Website -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              ເວັບໄຊ
            </label>
            <div class="relative">
              <Icon name="lucide:globe" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="contactInfo.website"
                type="url"
                placeholder="https://clinic.la"
                class="input pl-10"
              />
            </div>
          </div>

          <!-- Facebook -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Facebook
            </label>
            <div class="relative">
              <Icon name="lucide:facebook" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="contactInfo.facebook"
                type="url"
                placeholder="https://facebook.com/clinic"
                class="input pl-10"
              />
            </div>
          </div>

          <!-- Line -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Line ID
            </label>
            <div class="relative">
              <Icon name="lucide:message-circle" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="contactInfo.line"
                type="text"
                placeholder="@clinic"
                class="input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Address Section -->
      <div class="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Icon name="lucide:map-pin" class="w-6 h-6 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-gray-800">ທີ່ຢູ່</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Address -->
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              ທີ່ຢູ່ລາຍລະອຽດ
            </label>
            <textarea
              v-model="contactInfo.address"
              rows="3"
              placeholder="ເລກທີ, ຊອຍ, ຖະໜົນ..."
              class="input"
            ></textarea>
          </div>

          <!-- Village -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              ບ້ານ
            </label>
            <input
              v-model="contactInfo.village"
              type="text"
              placeholder="ສີສະຫວ່າງ"
              class="input"
            />
          </div>

          <!-- District -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              ເມືອງ
            </label>
            <input
              v-model="contactInfo.district"
              type="text"
              placeholder="ສີສະຫວ່າງ"
              class="input"
            />
          </div>

          <!-- Province -->
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              ແຂວງ
            </label>
            <select v-model="contactInfo.province" class="input">
              <option value="ນະຄອນຫຼວງວຽງຈັນ">ນະຄອນຫຼວງວຽງຈັນ</option>
              <option value="ຫຼວງພະບາງ">ຫຼວງພະບາງ</option>
              <option value="ຊຽງຂວາງ">ຊຽງຂວາງ</option>
              <option value="ຈຳປາສັກ">ຈຳປາສັກ</option>
              <option value="ສະຫວັນນະເຂດ">ສະຫວັນນະເຂດ</option>
              <option value="ຄຳມ່ວນ">ຄຳມ່ວນ</option>
              <option value="ບໍລິຄຳໄຊ">ບໍລິຄຳໄຊ</option>
              <option value="ບໍ່ແກ້ວ">ບໍ່ແກ້ວ</option>
              <option value="ອຸດົມໄຊ">ອຸດົມໄຊ</option>
              <option value="ໄຊຍະບູລີ">ໄຊຍະບູລີ</option>
              <option value="ຫົວພັນ">ຫົວພັນ</option>
              <option value="ຜົ້ງສາລີ">ຜົ້ງສາລີ</option>
              <option value="ວຽງຈັນ">ວຽງຈັນ</option>
              <option value="ຊຽງຂວາງ">ຊຽງຂວາງ</option>
              <option value="ສາລະວັນ">ສາລະວັນ</option>
              <option value="ເຊກອງ">ເຊກອງ</option>
              <option value="ອັດຕະປື">ອັດຕະປື</option>
              <option value="ໄຊສົມບູນ">ໄຊສົມບູນ</option>
            </select>
          </div>

          <!-- Map URL -->
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Google Maps Embed URL
              <span class="text-xs text-gray-500 font-normal ml-2">(Google Maps → Share → Embed a map)</span>
            </label>
            <textarea
              v-model="contactInfo.mapUrl"
              rows="2"
              placeholder="https://www.google.com/maps/embed?..."
              class="input font-mono text-sm"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Opening Hours Section -->
      <div class="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <Icon name="lucide:clock" class="w-6 h-6 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-gray-800">ເວລາເປີດ-ປິດ</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div v-for="(time, day) in contactInfo.openingHours" :key="day" class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 capitalize">
              {{ day }}
            </label>
            <input
              v-model="contactInfo.openingHours[day]"
              type="text"
              placeholder="08:00 - 17:00"
              class="input"
            />
          </div>
        </div>
      </div>

      <!-- Description Section -->
      <div class="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Icon name="lucide:file-text" class="w-6 h-6 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-gray-800">ຄຳອະທິບາຍ</h2>
        </div>

        <textarea
          v-model="contactInfo.description"
          rows="4"
          placeholder="ຄຳອະທິບາຍກ່ຽວກັບຄລີນິກ..."
          class="input"
        ></textarea>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          type="button"
          @click="fetchContactInfo"
          class="btn bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
          :disabled="saving"
        >
          <Icon name="lucide:rotate-ccw" class="w-5 h-5" />
          <span>ລີເຊັດ</span>
        </button>
        <button
          type="submit"
          class="btn bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-lg"
          :disabled="saving"
        >
          <Icon v-if="!saving" name="lucide:save" class="w-5 h-5" />
          <div v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>{{ saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກຂໍ້ມູນ" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
