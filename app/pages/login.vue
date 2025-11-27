<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const { login, isLoading, isLoggedIn } = useAuth();
const { error: showError } = useNotification();
const { fetchSettings, name: clinicName, logo: clinicLogo, subtitle: clinicSubtitle } = useClinicSettings();

// Fetch clinic settings on mount
onMounted(() => {
  fetchSettings();
});

// Redirect if already logged in
watchEffect(() => {
  if (isLoggedIn.value) {
    navigateTo("/");
  }
});

const form = reactive({
  username: "",
  password: "",
});

const errors = reactive({
  username: "",
  password: "",
});

const showPassword = ref(false);
const isFocused = reactive({
  username: false,
  password: false,
});

const validate = () => {
  let isValid = true;
  errors.username = "";
  errors.password = "";

  if (!form.username.trim()) {
    errors.username = "ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້";
    isValid = false;
  }

  if (!form.password) {
    errors.password = "ກະລຸນາປ້ອນລະຫັດຜ່ານ";
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ";
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validate()) return;

  const result = await login(form.username, form.password);

  if (result.success) {
    navigateTo("/");
  } else {
    showError(result.error || "ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ");
  }
};
</script>

<template>
  <div class="login-container">
    <!-- Logo Section with Animation -->
    <!-- <div class="logo-section">
      <div class="logo-wrapper">
        <div class="logo-glow"></div>
        <div class="logo-container">
          <img 
            v-if="clinicLogo" 
            :src="clinicLogo" 
            alt="Clinic Logo" 
            class="logo-image"
          />
          <div v-else class="logo-icon-wrapper">
            <Icon name="lucide:heart-pulse" class="logo-icon" />
          </div>
        </div>
      </div>
      
      <div class="clinic-info">
        <h1 class="clinic-title">{{ clinicName }}</h1>
        <p class="clinic-subtitle">{{ clinicSubtitle || "ລະບົບຈັດການຄລີນິກທີ່ທັນສະໄໝ" }}</p>
      </div>
    </div> -->

    <!-- Login Form with Glassmorphism -->
    <div class="login-form-container">
      <div class="form-header">
        <div class="form-icon-wrapper">
          <Icon name="lucide:shield-check" class="form-icon" />
        </div>
        <h2 class="form-title">ເຂົ້າສູ່ລະບົບ</h2>
        <p class="form-description">ກະລຸນາປ້ອນຂໍ້ມູນເພື່ອເຂົ້າສູ່ລະບົບ</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <!-- Username Field -->
        <div class="form-field">
          <label class="field-label">
            <Icon name="lucide:user" class="label-icon" />
            ຊື່ຜູ້ໃຊ້
          </label>
          <div 
            class="input-wrapper"
            :class="{ 
              'input-focus': isFocused.username, 
              'input-error': errors.username 
            }"
          >
              <Icon
                name="lucide:user"
              class="input-icon"
              />
              <input
                v-model="form.username"
                type="text"
              class="field-input"
                placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
              @focus="isFocused.username = true"
              @blur="isFocused.username = false"
              />
            </div>
          <transition name="slide-down">
            <p v-if="errors.username" class="error-message">
              {{ errors.username }}
            </p>
          </transition>
          </div>

        <!-- Password Field -->
        <div class="form-field">
          <label class="field-label">
            <Icon name="lucide:lock" class="label-icon" />
            ລະຫັດຜ່ານ
          </label>
          <div 
            class="input-wrapper"
            :class="{ 
              'input-focus': isFocused.password, 
              'input-error': errors.password 
            }"
          >
              <Icon
                name="lucide:lock"
              class="input-icon"
              />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
              class="field-input"
                placeholder="ປ້ອນລະຫັດຜ່ານ"
              @focus="isFocused.password = true"
              @blur="isFocused.password = false"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
              class="password-toggle"
              >
                <Icon
                  :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                class="toggle-icon"
                />
              </button>
            </div>
          <transition name="slide-down">
            <p v-if="errors.password" class="error-message">
              {{ errors.password }}
            </p>
          </transition>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
          class="submit-button"
            :disabled="isLoading"
          >
          <span class="button-content">
            <Icon
              v-if="isLoading"
              name="lucide:loader-2"
              class="button-icon animate-spin"
            />
            <Icon v-else name="lucide:log-in" class="button-icon" />
            <span class="button-text">
            {{ isLoading ? "ກຳລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ" }}
            </span>
          </span>
          <span class="button-shine"></span>
          </button>
        </form>
    </div>

    <!-- Footer -->
    <p class="footer-text">
      © {{ new Date().getFullYear() }} {{ clinicName }}. ສະຫງວນລິຂະສິດ.
    </p>
  </div>
</template>

<style scoped>
.login-container {
  @apply w-full max-w-md space-y-8 animate-fade-in;
}

/* Logo Section */
.logo-section {
  @apply text-center space-y-4;
}

.logo-wrapper {
  @apply relative inline-block;
}

.logo-glow {
  @apply absolute inset-0 rounded-full blur-2xl opacity-40;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.4));
  transform: scale(1.2);
  animation: subtle-pulse 4s ease-in-out infinite;
}

.logo-container {
  @apply relative w-24 h-24 mx-auto rounded-3xl 
         flex items-center justify-center shadow-xl
         border-2 border-white/30 backdrop-blur-sm
         transform transition-transform duration-300 hover:scale-105;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(59, 130, 246, 0.9));
}

.logo-image {
  @apply w-full h-full object-cover rounded-3xl;
}

.logo-icon-wrapper {
  @apply w-full h-full flex items-center justify-center;
}

.logo-icon {
  @apply w-12 h-12 text-white drop-shadow-lg;
}

.clinic-info {
  @apply space-y-2;
}

.clinic-title {
  @apply text-4xl font-extrabold tracking-tight;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.clinic-subtitle {
  @apply text-gray-200 text-sm font-medium;
  opacity: 0.85;
}

/* Login Form Container */
.login-form-container {
  @apply rounded-3xl border shadow-2xl overflow-hidden;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-color: rgba(255, 255, 255, 0.18);
}

.form-header {
  @apply text-center p-6 pb-4 space-y-3;
}

.form-icon-wrapper {
  @apply w-16 h-16 mx-auto rounded-2xl 
         flex items-center justify-center shadow-lg;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8));
}

.form-icon {
  @apply w-8 h-8 text-white;
}

.form-title {
  @apply text-2xl font-bold;
  color: #ffffff;
}

.form-description {
  @apply text-sm;
  color: rgba(255, 255, 255, 0.7);
}

/* Form Styles */
.login-form {
  @apply p-6 pt-4 space-y-5;
}

.form-field {
  @apply space-y-2;
}

.field-label {
  @apply flex items-center gap-2 text-sm font-semibold;
  color: rgba(255, 255, 255, 0.9);
}

.label-icon {
  @apply w-4 h-4;
  color: rgba(139, 92, 246, 0.7);
}

.input-wrapper {
  @apply relative flex items-center rounded-xl backdrop-blur-sm
         border-2 transition-all duration-300;
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.input-wrapper:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.25);
}

.input-wrapper.input-focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  transform: scale(1.005);
}

.input-wrapper.input-error {
  border-color: rgba(248, 113, 113, 0.6);
  background: rgba(248, 113, 113, 0.08);
}

.input-icon {
  @apply absolute left-4 w-5 h-5 pointer-events-none;
  color: rgba(255, 255, 255, 0.5);
}

.input-wrapper.input-focus .input-icon {
  color: rgba(139, 92, 246, 0.8);
}

.input-wrapper.input-error .input-icon {
  color: rgba(248, 113, 113, 0.8);
}

.field-input {
  @apply w-full pl-12 pr-12 py-3.5 bg-transparent
         focus:outline-none text-sm font-medium;
  color: #ffffff;
}

.field-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.password-toggle {
  @apply absolute right-4 p-1.5 rounded-lg
         transition-all duration-200;
  color: rgba(255, 255, 255, 0.5);
}

.password-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
}

.toggle-icon {
  @apply w-5 h-5;
}

.error-message {
  @apply text-xs font-medium px-1 flex items-center gap-1;
  color: rgba(248, 113, 113, 0.9);
}

/* Submit Button */
.submit-button {
  @apply relative w-full mt-6 py-3.5 rounded-xl
         text-white font-semibold shadow-lg
         overflow-hidden transition-all duration-300
         disabled:opacity-60 disabled:cursor-not-allowed
         active:scale-[0.98];
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(139, 92, 246, 0.9));
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(59, 130, 246, 1), rgba(139, 92, 246, 1));
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
  transform: translateY(-1px);
}

.button-content {
  @apply relative z-10 flex items-center justify-center gap-2;
}

.button-icon {
  @apply w-5 h-5;
}

.button-text {
  @apply text-base;
}

.button-shine {
  @apply absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
         translate-x-[-100%] transition-transform duration-700;
}

.submit-button:hover .button-shine {
  @apply translate-x-[100%];
}

/* Footer */
.footer-text {
  @apply text-center text-xs font-medium;
  color: rgba(255, 255, 255, 0.6);
}

/* Animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes subtle-pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
}

/* Responsive */
@media (max-width: 640px) {
  .clinic-title {
    @apply text-3xl;
  }
  
  .logo-container {
    @apply w-20 h-20;
  }
  
  .logo-icon {
    @apply w-10 h-10;
  }
}
</style>
