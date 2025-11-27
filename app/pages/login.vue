<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const { login, isLoading, isLoggedIn } = useAuth();
const { error: showError } = useNotification();

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
  <div class="animate-fade-in">
    <!-- Logo -->
    <div class="text-center mb-8">
      <div
        class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-clinic-accent to-cyan-500 flex items-center justify-center shadow-2xl shadow-clinic-accent/30"
      >
        <Icon name="lucide:activity" class="w-10 h-10 text-white" />
      </div>
      <h1 class="text-3xl font-bold text-white">Clinic Pro</h1>
      <p class="text-gray-400 mt-2">ລະບົບຈັດການຄລີນິກທີ່ທັນສະໄໝ</p>
    </div>

    <!-- Login Form -->
    <div class="card">
      <div class="card-body">
        <h2 class="text-xl font-semibold text-white text-center mb-6">
          ເຂົ້າສູ່ລະບົບ
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Username -->
          <div>
            <label class="input-label">ຊື່ຜູ້ໃຊ້</label>
            <div class="relative">
              <Icon
                name="lucide:user"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              />
              <input
                v-model="form.username"
                type="text"
                class="input pl-11"
                :class="{ 'input-error': errors.username }"
                placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
              />
            </div>
            <p v-if="errors.username" class="text-red-400 text-sm mt-1">
              {{ errors.username }}
            </p>
          </div>

          <!-- Password -->
          <div>
            <label class="input-label">ລະຫັດຜ່ານ</label>
            <div class="relative">
              <Icon
                name="lucide:lock"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="input pl-11 pr-11"
                :class="{ 'input-error': errors.password }"
                placeholder="ປ້ອນລະຫັດຜ່ານ"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Icon
                  :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                  class="w-5 h-5"
                />
              </button>
            </div>
            <p v-if="errors.password" class="text-red-400 text-sm mt-1">
              {{ errors.password }}
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="isLoading"
          >
            <Icon
              v-if="isLoading"
              name="lucide:loader-2"
              class="w-5 h-5 animate-spin"
            />
            <Icon v-else name="lucide:log-in" class="w-5 h-5" />
            {{ isLoading ? "ກຳລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ" }}
          </button>
        </form>
      </div>
    </div>

    <!-- Footer -->
    <p class="text-center text-gray-500 text-sm mt-6">
      © 2024 Clinic Pro. ສະຫງວນລິຂະສິດ.
    </p>
  </div>
</template>

