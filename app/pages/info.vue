<script setup lang="ts">
// This page is public - shows promotions, contact info, and address
definePageMeta({
  layout: false // Use custom layout for public page
});

const contactInfo = ref<any>(null);
const promotions = ref<any[]>([]);
const loading = ref(true);

// Fetch contact info
const fetchContactInfo = async () => {
  try {
    const response = await $fetch("/api/contact");
    if (response.success) {
      contactInfo.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching contact info:", error);
  }
};

// Fetch active promotions
const fetchPromotions = async () => {
  try {
    const response = await $fetch("/api/promotions");
    console.log("Promotions API Response:", response);
    
    if (response.success) {
      console.log("All promotions:", response.data);
      
      // Filter active promotions only
      const now = new Date();
      console.log("Current date:", now);
      
      promotions.value = response.data.filter((p: any) => {
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        const isActive = p.isActive && now >= start && now <= end;
        
        console.log(`Promotion "${p.name}":`, {
          isActive: p.isActive,
          startDate: start,
          endDate: end,
          currentDate: now,
          passesFilter: isActive
        });
        
        return isActive;
      });
      
      console.log("Filtered promotions:", promotions.value);
    }
  } catch (error) {
    console.error("Error fetching promotions:", error);
  }
};

onMounted(async () => {
  await Promise.all([fetchContactInfo(), fetchPromotions()]);
  loading.value = false;
});

// Format date helper
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get discount text
const getDiscountText = (promo: any) => {
  if (promo.isPercent) {
    return `-${promo.discount}%`;
  }
  return `-${Number(promo.discount).toLocaleString()} ₭`;
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    <!-- Hero Section -->
    <header class="relative overflow-hidden bg-gradient-to-r from-clinic-primary via-clinic-secondary to-clinic-accent-purple">
      <div class="absolute inset-0 bg-black/5"></div>
      <div class="container mx-auto px-4 py-20 relative z-10">
        <div class="max-w-4xl mx-auto text-center text-white">
          <div class="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm mb-6 shadow-2xl">
            <Icon name="lucide:heart-pulse" class="w-14 h-14 animate-pulse" />
          </div>
          <h1 class="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg text-white">ຄລີນິກ ສຸຂະພາບດີ</h1>
          <p class="text-xl text-white/90 mb-8">ໃຫ້ບໍລິການດ້ານສຸຂະພາບທີ່ມີຄຸນນະພາບດ້ວຍທີມງານມືອາຊີບ</p>
          <div class="flex flex-wrap justify-center gap-4">
            <a href="#promotions" class="btn btn-lg bg-white text-clinic-primary hover:bg-white/90 shadow-2xl">
              <Icon name="lucide:megaphone" class="w-5 h-5" />
              <span>ໂປຣໂມຊັນ</span>
            </a>
            <a href="#contact" class="btn btn-lg glass text-white hover:bg-white/30 shadow-2xl">
              <Icon name="lucide:phone" class="w-5 h-5" />
              <span>ຕິດຕໍ່ເຮົາ</span>
            </a>
          </div>
        </div>
      </div>
      <!-- Wave decoration -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" class="w-full h-auto">
          <path fill="#f0f9ff" fill-opacity="1" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </header>

    <div class="container mx-auto px-4 py-12 max-w-7xl">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
        <p class="mt-4 text-gray-600">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
      </div>

      <div v-else>
        <!-- Promotions Section -->
        <section id="promotions" class="mb-16">
          <div class="text-center mb-12">
            <div class="inline-flex items-center gap-3 mb-4">
              <div class="h-1 w-12 bg-gradient-to-r from-clinic-primary to-clinic-secondary rounded-full"></div>
              <Icon name="lucide:megaphone" class="w-8 h-8 text-clinic-primary" />
              <div class="h-1 w-12 bg-gradient-to-r from-clinic-secondary to-clinic-accent-purple rounded-full"></div>
            </div>
            <h2 class="text-4xl font-bold text-clinic-text mb-3">ໂປຣໂມຊັນພິເສດ</h2>
            <p class="text-clinic-text-muted">ລາຍການສ່ວນຫຼຸດແລະໂປຣໂມຊັນທີ່ກຳລັງມີຢູ່</p>
          </div>

          <!-- Promotions Grid -->
          <div v-if="promotions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="promo in promotions" 
              :key="promo.id"
              class="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <!-- Gradient overlay -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div class="relative p-6">
                <!-- Discount Badge -->
                <div class="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform">
                  {{ getDiscountText(promo) }}
                </div>

                <div class="mb-4">
                  <Icon name="lucide:gift" class="w-12 h-12 text-purple-600 mb-3" />
                  <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ promo.name }}</h3>
                  <p class="text-gray-600 leading-relaxed">{{ promo.description }}</p>
                </div>

                <div class="pt-4 border-t border-gray-100">
                  <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Icon name="lucide:calendar" class="w-4 h-4" />
                    <span>ເລີ່ມ: {{ formatDate(promo.startDate) }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <Icon name="lucide:calendar-x" class="w-4 h-4" />
                    <span>ສິ້ນສຸດ: {{ formatDate(promo.endDate) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Promotions -->
          <div v-else class="text-center py-16 bg-white rounded-3xl shadow-lg">
            <Icon name="lucide:package-x" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500 text-lg">ຍັງບໍ່ມີໂປຣໂມຊັນໃນຕອນນີ້</p>
          </div>
        </section>

        <!-- Contact & Location Section -->
        <section v-if="contactInfo" id="contact">
          <div class="text-center mb-12">
            <div class="inline-flex items-center gap-3 mb-4">
              <div class="h-1 w-12 bg-gradient-to-r from-clinic-primary to-clinic-accent rounded-full"></div>
              <Icon name="lucide:map-pin" class="w-8 h-8 text-clinic-primary" />
              <div class="h-1 w-12 bg-gradient-to-r from-clinic-accent to-clinic-secondary rounded-full"></div>
            </div>
            <h2 class="text-4xl font-bold text-clinic-text mb-3">ຕິດຕໍ່ ແລະ ທີ່ຕັ້ງ</h2>
            <p class="text-clinic-text-muted">ຂໍ້ມູນການຕິດຕໍ່ແລະທີ່ຕັ້ງຂອງເຮົາ</p>
          </div>

          <div class="grid lg:grid-cols-2 gap-8">
            <!-- Contact Information -->
            <div class="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
              <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Icon name="lucide:contact" class="w-6 h-6 text-white" />
                </div>
                ຂໍ້ມູນຕິດຕໍ່
              </h3>

              <div class="space-y-6">
                <!-- Phone Numbers -->
                <div v-if="contactInfo.phone && contactInfo.phone.length > 0" class="flex gap-4">
                  <div class="shrink-0">
                    <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <Icon name="lucide:phone" class="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-800 mb-2">ເບີໂທ</p>
                    <div class="space-y-1">
                      <a 
                        v-for="(phone, idx) in contactInfo.phone" 
                        :key="idx"
                        :href="`tel:${phone.replace(/\s/g, '')}`"
                        class="block text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        {{ phone }}
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Email -->
                <div v-if="contactInfo.email" class="flex gap-4">
                  <div class="shrink-0">
                    <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Icon name="lucide:mail" class="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-800 mb-2">ອີເມວ</p>
                    <a :href="`mailto:${contactInfo.email}`" class="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      {{ contactInfo.email }}
                    </a>
                  </div>
                </div>

                <!-- Facebook -->
                <div v-if="contactInfo.facebook" class="flex gap-4">
                  <div class="shrink-0">
                    <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Icon name="lucide:facebook" class="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-800 mb-2">Facebook</p>
                    <a :href="contactInfo.facebook" target="_blank" class="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      {{ contactInfo.facebook }}
                    </a>
                  </div>
                </div>

                <!-- Line -->
                <div v-if="contactInfo.line" class="flex gap-4">
                  <div class="shrink-0">
                    <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <Icon name="lucide:message-circle" class="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-800 mb-2">Line</p>
                    <p class="text-gray-700 font-medium">{{ contactInfo.line }}</p>
                  </div>
                </div>

                <!-- Website -->
                <div v-if="contactInfo.website" class="flex gap-4">
                  <div class="shrink-0">
                    <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Icon name="lucide:globe" class="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-800 mb-2">ເວັບໄຊ</p>
                    <a :href="contactInfo.website" target="_blank" class="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                      {{ contactInfo.website }}
                    </a>
                  </div>
                </div>
              </div>

              <!-- Opening Hours -->
              <div v-if="contactInfo.openingHours" class="mt-8 pt-8 border-t border-gray-200">
                <h4 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Icon name="lucide:clock" class="w-5 h-5 text-purple-600" />
                  ເວລາເປີດເຮັດວຽກ
                </h4>
                <div class="grid grid-cols-2 gap-3">
                  <div v-for="(time, day) in contactInfo.openingHours" :key="day" class="text-sm">
                    <span class="font-medium text-gray-700 capitalize">{{ day }}:</span>
                    <span class="text-gray-600 ml-2">{{ time }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Address & Map -->
            <div class="space-y-6">
              <!-- Address Card -->
              <div class="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Icon name="lucide:map-pin" class="w-6 h-6 text-white" />
                  </div>
                  ທີ່ຢູ່
                </h3>

                <div class="space-y-4">
                  <div v-if="contactInfo.address" class="flex gap-3">
                    <Icon name="lucide:home" class="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                    <p class="text-gray-700 leading-relaxed">{{ contactInfo.address }}</p>
                  </div>
                  <div v-if="contactInfo.village" class="flex gap-3">
                    <Icon name="lucide:map" class="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                    <p class="text-gray-700">ບ້ານ {{ contactInfo.village }}</p>
                  </div>
                  <div v-if="contactInfo.district" class="flex gap-3">
                    <Icon name="lucide:building" class="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                    <p class="text-gray-700">ເມືອງ {{ contactInfo.district }}</p>
                  </div>
                  <div v-if="contactInfo.province" class="flex gap-3">
                    <Icon name="lucide:landmark" class="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                    <p class="text-gray-700">{{ contactInfo.province }}</p>
                  </div>
                </div>
              </div>

              <!-- Map -->
              <div v-if="contactInfo.mapUrl" class="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div class="aspect-video">
                  <iframe 
                    :src="contactInfo.mapUrl" 
                    class="w-full h-full" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="contactInfo.description" class="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-lg p-8">
            <div class="max-w-3xl mx-auto text-center">
              <Icon name="lucide:info" class="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <p class="text-gray-700 text-lg leading-relaxed">{{ contactInfo.description }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900 text-white py-12 mt-20">
      <div class="container mx-auto px-4 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
          <Icon name="lucide:heart-pulse" class="w-8 h-8" />
        </div>
        <h3 class="text-2xl font-bold mb-2">ຄລີນິກ ສຸຂະພາບດີ</h3>
        <p class="text-white/80 mb-6">ໃຫ້ບໍລິການດ້ານສຸຂະພາບທີ່ມີຄຸນນະພາບ</p>
        <p class="text-white/60 text-sm">© 2024 All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.container {
  max-width: 1280px;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
