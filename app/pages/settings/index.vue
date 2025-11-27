<script setup lang="ts">
definePageMeta({
  middleware: "admin",
});

const { success, error } = useNotification();
const { settings, fetchSettings, updateSettings, name, subtitle, logo } = useClinicSettings();

const isLoading = ref(true);
const isSaving = ref(false);

// Form data
const form = reactive({
  name: "",
  subtitle: "",
});

// File upload
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const isDragging = ref(false);

// Initialize form
const initForm = () => {
  form.name = name.value;
  form.subtitle = subtitle.value || "";
  previewUrl.value = logo.value;
};

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    processFile(target.files[0]);
  }
};

// Handle drag and drop
const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    processFile(event.dataTransfer.files[0]);
  }
};

// Process selected file
const processFile = (file: File) => {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    error("ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ");
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error("ຂະໜາດໄຟລ໌ຕ້ອງບໍ່ເກີນ 5MB");
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

// Trigger file input
const triggerFileInput = () => {
  fileInput.value?.click();
};

// Remove selected file
const removeFile = () => {
  selectedFile.value = null;
  previewUrl.value = logo.value;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Save settings
const saveSettings = async () => {
  if (!form.name.trim()) {
    error("ກະລຸນາປ້ອນຊື່ຄລີນິກ");
    return;
  }

  isSaving.value = true;
  try {
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("subtitle", form.subtitle.trim());
    
    if (selectedFile.value) {
      formData.append("logo", selectedFile.value);
    }

    const result = await updateSettings(formData);
    
    if (result.success) {
      success(result.message || "ບັນທຶກສຳເລັດ");
      selectedFile.value = null;
    } else {
      error(result.message || "ເກີດຂໍ້ຜິດພາດ");
    }
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  } finally {
    isSaving.value = false;
  }
};

// Load settings on mount
onMounted(async () => {
  await fetchSettings();
  initForm();
  isLoading.value = false;
});
</script>

<template>
  <div>
    <PageHeader title="ຕັ້ງຄ່າຄລີນິກ" description="ແກ້ໄຂຂໍ້ມູນ ແລະ ຮູບພາບຂອງຄລີນິກ" />

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-clinic-accent" />
    </div>

    <!-- Settings Form -->
    <div v-else class="max-w-2xl mx-auto">
      <form @submit.prevent="saveSettings" class="space-y-6">
        <!-- Logo Upload Section -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Icon name="lucide:image" class="w-5 h-5 text-clinic-accent" />
            ໂລໂກ້ຄລີນິກ
          </h3>

          <!-- Preview & Upload Area -->
          <div class="flex flex-col sm:flex-row items-center gap-6">
            <!-- Current/Preview Logo -->
            <div class="relative group">
              <div
                class="w-32 h-32 rounded-2xl bg-gradient-to-br from-clinic-purple/20 to-clinic-pink/20 border-2 border-dashed border-clinic-border 
                       flex items-center justify-center overflow-hidden transition-all duration-300"
                :class="{ 'border-clinic-accent': isDragging }"
              >
                <img
                  v-if="previewUrl"
                  :src="previewUrl"
                  alt="Clinic Logo"
                  class="w-full h-full object-cover"
                />
                <Icon
                  v-else
                  name="lucide:building-2"
                  class="w-16 h-16 text-clinic-text-muted"
                />
              </div>
              
              <!-- Remove button -->
              <button
                v-if="selectedFile"
                type="button"
                @click="removeFile"
                class="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center 
                       text-white shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <Icon name="lucide:x" class="w-4 h-4" />
              </button>
            </div>

            <!-- Upload Zone -->
            <div
              class="flex-1 w-full"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <div
                class="border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer
                       hover:border-clinic-accent hover:bg-clinic-accent/5"
                :class="isDragging ? 'border-clinic-accent bg-clinic-accent/10' : 'border-clinic-border'"
                @click="triggerFileInput"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileSelect"
                />
                
                <Icon 
                  name="lucide:cloud-upload" 
                  class="w-10 h-10 mx-auto mb-3 transition-colors"
                  :class="isDragging ? 'text-clinic-accent' : 'text-clinic-text-muted'"
                />
                
                <p class="text-sm text-clinic-text-muted mb-1">
                  ລາກ ແລະ ວາງຮູບພາບທີ່ນີ້
                </p>
                <p class="text-xs text-clinic-text-muted">
                  ຫຼື <span class="text-clinic-accent hover:underline">ຄລິກເພື່ອເລືອກ</span>
                </p>
                <p class="text-xs text-clinic-text-muted mt-2">
                  PNG, JPG, GIF (ສູງສຸດ 5MB)
                </p>
              </div>
            </div>
          </div>

          <!-- Selected file info -->
          <div v-if="selectedFile" class="mt-4 p-3 bg-clinic-accent/10 rounded-lg flex items-center gap-3">
            <Icon name="lucide:file-image" class="w-5 h-5 text-clinic-accent" />
            <div class="flex-1 min-w-0">
              <p class="text-sm text-white truncate">{{ selectedFile.name }}</p>
              <p class="text-xs text-clinic-text-muted">
                {{ (selectedFile.size / 1024).toFixed(1) }} KB
              </p>
            </div>
            <button
              type="button"
              @click="removeFile"
              class="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Clinic Info Section -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Icon name="lucide:building" class="w-5 h-5 text-clinic-accent" />
            ຂໍ້ມູນຄລີນິກ
          </h3>

          <div class="space-y-4">
            <div>
              <label class="input-label">ຊື່ຄລີນິກ *</label>
              <input
                v-model="form.name"
                type="text"
                class="input"
                placeholder="ປ້ອນຊື່ຄລີນິກ"
                required
              />
            </div>

            <div>
              <label class="input-label">ຄຳບັນຍາຍ</label>
              <input
                v-model="form.subtitle"
                type="text"
                class="input"
                placeholder="ເຊັ່ນ: ຜູ້ບໍລິການ, ສາຂາກາງ"
              />
            </div>
          </div>
        </div>

        <!-- Preview Card -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Icon name="lucide:eye" class="w-5 h-5 text-clinic-accent" />
            ຕົວຢ່າງ
          </h3>
          
          <div class="bg-gradient-to-r from-clinic-sidebar-from via-clinic-sidebar-via to-clinic-sidebar-to rounded-xl p-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                <img
                  v-if="previewUrl"
                  :src="previewUrl"
                  alt="Preview"
                  class="w-full h-full object-cover"
                />
                <Icon v-else name="lucide:heart-pulse" class="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 class="font-bold text-white text-lg">{{ form.name || 'ຊື່ຄລີນິກ' }}</h1>
                <p class="text-xs text-white/70">{{ form.subtitle || 'ຄຳບັນຍາຍ' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            type="button"
            @click="initForm"
            class="btn btn-secondary flex-1"
            :disabled="isSaving"
          >
            <Icon name="lucide:rotate-ccw" class="w-4 h-4" />
            ຣີເຊັດ
          </button>
          <button
            type="submit"
            class="btn btn-primary flex-1"
            :disabled="isSaving"
          >
            <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <Icon v-else name="lucide:save" class="w-4 h-4" />
            {{ isSaving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

