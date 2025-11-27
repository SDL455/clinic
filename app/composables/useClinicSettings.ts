export interface ClinicSettings {
  id: number;
  name: string;
  subtitle: string | null;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
}

// Global state for clinic settings
const clinicSettings = ref<ClinicSettings | null>(null);
const isLoading = ref(false);

export function useClinicSettings() {
  const { getAuthHeaders } = useAuth();

  // Fetch clinic settings
  const fetchSettings = async () => {
    if (clinicSettings.value) return clinicSettings.value;
    
    isLoading.value = true;
    try {
      const response = await $fetch<{ success: boolean; data: ClinicSettings }>("/api/settings");
      if (response.success) {
        clinicSettings.value = response.data;
      }
      return clinicSettings.value;
    } catch (error) {
      console.error("Failed to fetch clinic settings:", error);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Update clinic settings
  const updateSettings = async (formData: FormData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await $fetch<{ success: boolean; data: ClinicSettings; message: string }>("/api/settings", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
      });
      
      if (response.success) {
        clinicSettings.value = response.data;
        return { success: true, message: response.message };
      }
      return { success: false };
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      return { 
        success: false, 
        message: err?.data?.message || "ເກີດຂໍ້ຜິດພາດ" 
      };
    }
  };

  // Computed properties
  const name = computed(() => clinicSettings.value?.name || "ຄລີນິກ ສຸຂະພາບດີ");
  const subtitle = computed(() => clinicSettings.value?.subtitle || "ຜູ້ບໍລິການ");
  const logo = computed(() => clinicSettings.value?.logo || null);

  return {
    settings: clinicSettings,
    isLoading: readonly(isLoading),
    fetchSettings,
    updateSettings,
    name,
    subtitle,
    logo,
  };
}

