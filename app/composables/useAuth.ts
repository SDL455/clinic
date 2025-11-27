import type { AuthUser, UserRole } from "~/types";

// =========================================
// Auth State
// =========================================

const authUser = ref<AuthUser | null>(null);
const isLoading = ref(false);

export function useAuth() {
  // Initialize from localStorage on client
  const initAuth = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem("auth_user");
      if (stored) {
        try {
          authUser.value = JSON.parse(stored);
        } catch {
          localStorage.removeItem("auth_user");
        }
      }
    }
  };

  // Login
  const login = async (username: string, password: string) => {
    isLoading.value = true;

    try {
      const response = await $fetch<{ success: boolean; data: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: { username, password },
      });

      if (response.success && response.data) {
        authUser.value = response.data;

        if (import.meta.client) {
          localStorage.setItem("auth_user", JSON.stringify(response.data));
        }

        return { success: true };
      }

      return { success: false, error: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ" };
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      return {
        success: false,
        error: err?.data?.message || "ເກີດຂໍ້ຜິດພາດ",
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Logout
  const logout = () => {
    authUser.value = null;

    if (import.meta.client) {
      localStorage.removeItem("auth_user");
    }

    navigateTo("/login");
  };

  // Check if user is logged in
  const isLoggedIn = computed(() => !!authUser.value);

  // Check if user is admin
  const isAdmin = computed(() => authUser.value?.role === "ADMIN");

  // Get auth headers
  const getAuthHeaders = () => {
    if (!authUser.value?.token) return {};
    return {
      Authorization: `Bearer ${authUser.value.token}`,
    };
  };

  // Check role
  const hasRole = (role: UserRole) => authUser.value?.role === role;

  return {
    user: authUser,
    isLoading,
    isLoggedIn,
    isAdmin,
    initAuth,
    login,
    logout,
    getAuthHeaders,
    hasRole,
  };
}

