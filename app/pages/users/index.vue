<script setup lang="ts">
import type { User } from "~/types";

definePageMeta({
  middleware: "admin",
});

const { getAuthHeaders, user: currentUser } = useAuth();
const { success, error } = useNotification();

const users = ref<(User & { _count?: { sales: number } })[]>([]);
const isLoading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const editingUser = ref<User | null>(null);

const form = reactive({
  username: "",
  password: "",
  name: "",
  role: "EMPLOYEE" as "ADMIN" | "EMPLOYEE",
  isActive: true,
});

// Fetch users
const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const res = await $fetch<{ success: boolean; data: User[] }>("/api/users", {
      headers: getAuthHeaders(),
    });
    if (res.success) users.value = res.data || [];
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  } finally {
    isLoading.value = false;
  }
};

// Open new modal
const openNewModal = () => {
  isEditing.value = false;
  editingUser.value = null;
  Object.assign(form, {
    username: "",
    password: "",
    name: "",
    role: "EMPLOYEE",
    isActive: true,
  });
  showModal.value = true;
};

// Open edit modal
const openEditModal = (user: User) => {
  isEditing.value = true;
  editingUser.value = user;
  Object.assign(form, {
    username: user.username,
    password: "",
    name: user.name,
    role: user.role,
    isActive: user.isActive,
  });
  showModal.value = true;
};

// Save user
const saveUser = async () => {
  if (!form.username || !form.name) {
    error("ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ");
    return;
  }

  if (!isEditing.value && !form.password) {
    error("ກະລຸນາປ້ອນລະຫັດຜ່ານ");
    return;
  }

  try {
    const url = isEditing.value ? `/api/users/${editingUser.value?.id}` : "/api/users";
    const method = isEditing.value ? "PUT" : "POST";

    const body: Record<string, unknown> = {
      username: form.username,
      name: form.name,
      role: form.role,
      isActive: form.isActive,
    };

    if (form.password) {
      body.password = form.password;
    }

    await $fetch(url, {
      method,
      headers: getAuthHeaders(),
      body,
    });

    success(isEditing.value ? "ອັບເດດຜູ້ໃຊ້ສຳເລັດ" : "ເພີ່ມຜູ້ໃຊ້ສຳເລັດ");
    showModal.value = false;
    fetchUsers();
  } catch (err: unknown) {
    const e = err as { data?: { message?: string } };
    error(e?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
  }
};

// Toggle user status
const toggleStatus = async (user: User) => {
  // Prevent self-disable
  if (user.id === currentUser.value?.id) {
    error("ບໍ່ສາມາດປິດການໃຊ້ງານຕົວເອງໄດ້");
    return;
  }

  try {
    await $fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: { isActive: !user.isActive },
    });
    success("ອັບເດດສະຖານະສຳເລັດ");
    fetchUsers();
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  }
};

// Format date
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("lo-LA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div>
    <PageHeader title="ຜູ້ໃຊ້" description="ຈັດການຜູ້ໃຊ້ລະບົບ">
      <template #actions>
        <button @click="openNewModal" class="btn btn-primary">
          <Icon name="lucide:user-plus" class="w-4 h-4" />
          ເພີ່ມຜູ້ໃຊ້
        </button>
      </template>
    </PageHeader>

    <!-- Users Table -->
    <div class="card">
      <div class="table-container border-0">
        <table class="table">
          <thead>
            <tr>
              <th>ຜູ້ໃຊ້</th>
              <th>ຊື່ຜູ້ໃຊ້</th>
              <th>ບົດບາດ</th>
              <th class="text-center">ການຂາຍ</th>
              <th>ສະຖານະ</th>
              <th>ວັນທີສ້າງ</th>
              <th class="text-right">ຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="7" class="text-center py-8">
                <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin mx-auto text-clinic-accent" />
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="7" class="text-center py-8 text-gray-400">
                ບໍ່ມີຜູ້ໃຊ້
              </td>
            </tr>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                    :class="
                      user.role === 'ADMIN'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-clinic-accent/20 text-clinic-accent'
                    "
                  >
                    <Icon
                      :name="user.role === 'ADMIN' ? 'lucide:shield' : 'lucide:user'"
                      class="w-5 h-5"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-white">{{ user.name }}</p>
                    <p
                      v-if="user.id === currentUser?.id"
                      class="text-xs text-clinic-accent"
                    >
                      (ທ່ານ)
                    </p>
                  </div>
                </div>
              </td>
              <td class="font-mono text-gray-400">{{ user.username }}</td>
              <td>
                <span
                  class="badge"
                  :class="user.role === 'ADMIN' ? 'badge-warning' : 'badge-info'"
                >
                  {{ user.role === "ADMIN" ? "ຜູ້ດູແລລະບົບ" : "ພະນັກງານ" }}
                </span>
              </td>
              <td class="text-center text-gray-400">
                {{ user._count?.sales || 0 }} ຄັ້ງ
              </td>
              <td>
                <button
                  @click="toggleStatus(user)"
                  :disabled="user.id === currentUser?.id"
                  class="badge cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="user.isActive ? 'badge-success' : 'badge-danger'"
                >
                  {{ user.isActive ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ" }}
                </button>
              </td>
              <td class="text-gray-400">{{ formatDate(user.createdAt) }}</td>
              <td class="text-right">
                <button
                  @click="openEditModal(user)"
                  class="p-2 hover:bg-clinic-dark rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <Icon name="lucide:pencil" class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Modal :show="showModal" :title="isEditing ? 'ແກ້ໄຂຜູ້ໃຊ້' : 'ເພີ່ມຜູ້ໃຊ້'" @close="showModal = false">
      <form @submit.prevent="saveUser" class="space-y-4">
        <div>
          <label class="input-label">ຊື່ເຕັມ *</label>
          <input v-model="form.name" type="text" class="input" required />
        </div>

        <div>
          <label class="input-label">ຊື່ຜູ້ໃຊ້ (ໃຊ້ເຂົ້າສູ່ລະບົບ) *</label>
          <input
            v-model="form.username"
            type="text"
            class="input"
            :disabled="isEditing"
            required
          />
        </div>

        <div>
          <label class="input-label">
            ລະຫັດຜ່ານ {{ isEditing ? "(ປ່ອຍວ່າງຖ້າບໍ່ປ່ຽນ)" : "*" }}
          </label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            :required="!isEditing"
            minlength="6"
          />
        </div>

        <div>
          <label class="input-label">ບົດບາດ *</label>
          <select v-model="form.role" class="select">
            <option value="EMPLOYEE">ພະນັກງານ</option>
            <option value="ADMIN">ຜູ້ດູແລລະບົບ</option>
          </select>
        </div>

        <div v-if="isEditing" class="flex items-center gap-2">
          <input
            id="isActive"
            v-model="form.isActive"
            type="checkbox"
            class="w-4 h-4 rounded border-clinic-border bg-clinic-dark text-clinic-accent focus:ring-clinic-accent"
          />
          <label for="isActive" class="text-gray-300">ເປີດໃຊ້ງານ</label>
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

