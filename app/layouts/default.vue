<script setup lang="ts">
import type { MenuItem } from "~/types";

const { user, logout, isAdmin } = useAuth();
const route = useRoute();
const { fetchSettings, name: clinicName, subtitle: clinicSubtitle, logo: clinicLogo } = useClinicSettings();

// Fetch clinic settings on load
onMounted(() => {
  fetchSettings();
});

// Drawer state
const isDrawerExpanded = ref(true); // For desktop: expanded (with text) or collapsed (icons only)
const isDrawerOpen = ref(false); // For mobile: open or closed
const isMobile = ref(false);

// Logout confirmation dialog
const showLogoutDialog = ref(false);

// Handle logout confirmation
const handleLogout = () => {
  showLogoutDialog.value = true;
};

// Confirm logout
const confirmLogout = () => {
  showLogoutDialog.value = false;
  logout();
};

// Cancel logout
const cancelLogout = () => {
  showLogoutDialog.value = false;
};

// Menu items
const menuItems = computed<MenuItem[]>(() => [
  { label: "ໜ້າຫຼັກ", icon: "lucide:home", to: "/" },
  { label: "ຂາຍສິນຄ້າ", icon: "lucide:shopping-cart", to: "/pos" },
  { label: "ລູກຄ້າ", icon: "lucide:users", to: "/customers" },
  { label: "ສິນຄ້າ", icon: "lucide:package", to: "/products" },
  { label: "ປະເພດສິນຄ້າ", icon: "lucide:layers", to: "/categories" },
  { label: "ບໍລິການ", icon: "lucide:heart-handshake", to: "/services" },
  { label: "ໂປຣໂມຊັ່ນ", icon: "lucide:megaphone", to: "/promotions" },
  { label: "ປະຫວັດການຂາຍ", icon: "lucide:file-text", to: "/sales" },
  { label: "ລາຍງານ", icon: "lucide:bar-chart-2", to: "/reports", adminOnly: true },
  { label: "ຜູ້ໃຊ້", icon: "lucide:user-cog", to: "/users", adminOnly: true },
  { label: "ຕັ້ງຄ່າຄລີນິກ", icon: "lucide:settings", to: "/settings", adminOnly: true },
]);

// Filter menu based on role
const filteredMenu = computed(() =>
  menuItems.value.filter((item) => !item.adminOnly || isAdmin.value)
);

// Check if route is active
const isActive = (path: string) => route.path === path;

// Handle responsive
const checkMobile = () => {
  if (import.meta.client) {
    isMobile.value = window.innerWidth < 1024;
    if (isMobile.value) {
      isDrawerOpen.value = false;
    }
  }
};

// Toggle drawer
const toggleDrawer = () => {
  if (isMobile.value) {
    isDrawerOpen.value = !isDrawerOpen.value;
  } else {
    isDrawerExpanded.value = !isDrawerExpanded.value;
  }
};

// Close drawer on mobile navigation
const handleNavigation = () => {
  if (isMobile.value) {
    isDrawerOpen.value = false;
  }
};

// Computed drawer width class
const drawerWidthClass = computed(() => {
  if (isMobile.value) {
    return isDrawerOpen.value ? 'w-72 translate-x-0' : 'w-72 -translate-x-full';
  }
  return isDrawerExpanded.value ? 'w-72 translate-x-0' : 'w-20 translate-x-0';
});

// Computed main content margin
const mainMarginClass = computed(() => {
  if (isMobile.value) return 'ml-0';
  return isDrawerExpanded.value ? 'lg:ml-72' : 'lg:ml-20';
});

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener("resize", checkMobile);
  }
});
</script>

<template>
  <div class="min-h-screen bg-clinic-bg">
    <!-- Sidebar Drawer -->
    <aside
      class="drawer transition-all duration-300 ease-in-out shadow-xl no-print"
      :class="drawerWidthClass"
    >
      <!-- Logo Header with Gradient -->
      <div 
        class="shrink-0 bg-gradient-to-r from-clinic-sidebar-from via-clinic-sidebar-via to-clinic-sidebar-to"
        :class="isDrawerExpanded || isMobile ? 'p-5' : 'p-3'"
      >
        <div 
          class="flex items-center"
          :class="isDrawerExpanded || isMobile ? 'gap-3' : 'justify-center'"
        >
          <div
            class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 overflow-hidden"
          >
            <img 
              v-if="clinicLogo" 
              :src="clinicLogo" 
              alt="Clinic Logo" 
              class="w-full h-full object-cover"
            />
            <Icon v-else name="lucide:heart-pulse" class="w-7 h-7 text-white" />
          </div>
          <div 
            v-if="isDrawerExpanded || isMobile"
            class="overflow-hidden transition-all duration-300"
          >
            <h1 class="font-bold text-white text-lg whitespace-nowrap">{{ clinicName }}</h1>
            <p class="text-xs text-white/70 whitespace-nowrap">{{ clinicSubtitle }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 space-y-1 overflow-y-auto bg-clinic-surface" :class="isDrawerExpanded || isMobile ? 'px-3' : 'px-2'">
        <NuxtLink
          v-for="item in filteredMenu"
          :key="item.to"
          :to="item.to"
          class="menu-item group relative"
          :class="[
            { 'menu-item-active': isActive(item.to) },
            isDrawerExpanded || isMobile ? '' : 'justify-center px-0'
          ]"
          @click="handleNavigation"
        >
          <Icon :name="item.icon" class="w-5 h-5 shrink-0" />
          <span 
            v-if="isDrawerExpanded || isMobile"
            class="whitespace-nowrap overflow-hidden transition-all duration-300 font-medium"
          >
            {{ item.label }}
          </span>
          <!-- Tooltip for collapsed state -->
          <div 
            v-if="!isDrawerExpanded && !isMobile"
            class="absolute left-full ml-2 px-3 py-2 bg-clinic-surface border border-clinic-border rounded-xl shadow-xl
                   opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200
                   whitespace-nowrap z-50 text-clinic-text"
          >
            {{ item.label }}
          </div>
        </NuxtLink>
      </nav>

      <!-- User Section -->
      <div class="border-t border-clinic-border shrink-0 bg-clinic-surface" :class="isDrawerExpanded || isMobile ? 'p-4' : 'p-2'">
        <div 
          class="flex items-center mb-3"
          :class="isDrawerExpanded || isMobile ? 'gap-3' : 'justify-center'"
        >
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-br from-clinic-purple to-clinic-pink flex items-center justify-center shrink-0"
          >
            <Icon name="lucide:user" class="w-5 h-5 text-white" />
          </div>
          <div 
            v-if="isDrawerExpanded || isMobile"
            class="flex-1 min-w-0 overflow-hidden"
          >
            <p class="font-semibold text-clinic-text truncate">{{ user?.name }}</p>
            <p class="text-xs text-clinic-text-muted">
              {{ user?.role === "ADMIN" ? "ຜູ້ດູແລລະບົບ" : "ພະນັກງານ" }}
            </p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full btn bg-red-50 text-red-500 hover:bg-red-100 border-0 text-sm"
          :class="isDrawerExpanded || isMobile ? '' : 'px-2'"
        >
          <Icon name="lucide:log-out" class="w-4 h-4 shrink-0" />
          <span v-if="isDrawerExpanded || isMobile">ອອກຈາກລະບົບ</span>
        </button>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div
      v-if="isMobile && isDrawerOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden no-print"
      @click="isDrawerOpen = false"
    />

    <!-- Main Content -->
    <div
      class="transition-all duration-300 min-h-screen print:ml-0"
      :class="mainMarginClass"
    >
      <!-- Top Navbar -->
      <header
        class="h-16 bg-clinic-surface/90 backdrop-blur-xl border-b border-clinic-border sticky top-0 z-20 no-print"
      >
        <div class="h-full flex items-center justify-between px-4 lg:px-6">
          <!-- Left: Menu Toggle -->
          <button
            @click="toggleDrawer"
            class="p-2 rounded-xl hover:bg-clinic-muted transition-colors text-clinic-text"
          >
            <Icon 
              :name="!isMobile && !isDrawerExpanded ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" 
              class="w-6 h-6" 
            />
          </button>

          <!-- Right: Actions -->
          <div class="flex items-center gap-2 sm:gap-3">
            <!-- Stock Alerts -->
            <LowStockAlert />

            <!-- User Badge -->
            <div class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-clinic-muted rounded-full">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-clinic-accent to-clinic-cyan flex items-center justify-center">
                <span class="text-xs font-bold text-white">{{ user?.name?.charAt(0) || 'A' }}</span>
              </div>
              <span class="text-sm font-medium text-clinic-text">{{ user?.name || 'Admin' }}</span>
            </div>

            <!-- Quick Actions -->
            <NuxtLink
              to="/pos"
              class="btn bg-gradient-to-r from-clinic-pink to-fuchsia-500 text-white btn-sm shadow-lg shadow-pink-500/25"
            >
              <Icon name="lucide:plus" class="w-4 h-4" />
              <span class="hidden sm:inline">ຂາຍສິນຄ້າ</span>
            </NuxtLink>
          </div>
        </div>
      </header>

      <!-- Page Content - Responsive -->
      <main class="p-3 sm:p-4 lg:p-6">
        <slot />
      </main>
    </div>

    <!-- Notifications -->
    <div class="no-print">
      <NotificationContainer />
    </div>

    <!-- Logout Confirmation Dialog -->
    <ConfirmDialog
      :show="showLogoutDialog"
      message="ທ່ານຕ້ອງການອອກລະບົບແທ້ບໍ່?"
      subtitle="ກົດປຸ່ມ 'OK' ເພື່ອຢືນຢັນການອອກລະບົບ"
      confirm-text="OK"
      cancel-text="Cancel"
      type="warning"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />
  </div>
</template>
