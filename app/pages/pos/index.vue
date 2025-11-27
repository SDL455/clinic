<script setup lang="ts">
import type { Product, Service, Customer, Promotion, PaymentStatus } from "~/types";

definePageMeta({
  middleware: "auth",
});

const { getAuthHeaders } = useAuth();
const { success, error } = useNotification();
const cart = useCart();

const products = ref<Product[]>([]);
const services = ref<Service[]>([]);
const customers = ref<Customer[]>([]);
const promotions = ref<Promotion[]>([]);
const isLoading = ref(true);
const activeTab = ref<"products" | "services">("products");
const search = ref("");
const selectedCustomer = ref<Customer | null>(null);
const paymentStatus = ref<PaymentStatus>("UNPAID");
const showCustomerModal = ref(false);
const showNewCustomerModal = ref(false);
const customerSearch = ref("");
const isSubmitting = ref(false);

// New customer form
const newCustomerForm = reactive({
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
});

// Fetch data
const fetchData = async () => {
  isLoading.value = true;
  try {
    const [productsRes, servicesRes, promotionsRes] = await Promise.all([
      $fetch<{ success: boolean; data: Product[] }>("/api/products", {
        headers: getAuthHeaders(),
      }),
      $fetch<{ success: boolean; data: Service[] }>("/api/services", {
        headers: getAuthHeaders(),
      }),
      $fetch<{ success: boolean; data: Promotion[] }>("/api/promotions?activeOnly=true", {
        headers: getAuthHeaders(),
      }),
    ]);

    if (productsRes.success) products.value = productsRes.data || [];
    if (servicesRes.success) services.value = servicesRes.data || [];
    if (promotionsRes.success) promotions.value = promotionsRes.data || [];
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  } finally {
    isLoading.value = false;
  }
};

// Search customers
const searchCustomers = async () => {
  if (customerSearch.value.length < 2) {
    customers.value = [];
    return;
  }

  try {
    const res = await $fetch<{ success: boolean; data: Customer[] }>(
      `/api/customers?search=${encodeURIComponent(customerSearch.value)}`,
      { headers: getAuthHeaders() }
    );
    if (res.success) customers.value = res.data || [];
  } catch (err) {
    // Ignore
  }
};

// Select customer
const selectCustomer = (customer: Customer) => {
  selectedCustomer.value = customer;
  showCustomerModal.value = false;
  customerSearch.value = "";
};

// Add new customer
const addNewCustomer = async () => {
  if (!newCustomerForm.firstName || !newCustomerForm.lastName || !newCustomerForm.phone) {
    error("ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ");
    return;
  }

  try {
    const res = await $fetch<{ success: boolean; data: Customer }>("/api/customers", {
      method: "POST",
      headers: getAuthHeaders(),
      body: newCustomerForm,
    });

    if (res.success) {
      selectedCustomer.value = res.data;
      showNewCustomerModal.value = false;
      success("ເພີ່ມລູກຄ້າສຳເລັດ");
      Object.assign(newCustomerForm, {
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
      });
    }
  } catch (err: unknown) {
    const e = err as { data?: { message?: string } };
    error(e?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
  }
};

// Filter products/services
const filteredProducts = computed(() =>
  products.value.filter(
    (p) =>
      p.stock > 0 &&
      p.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

const filteredServices = computed(() =>
  services.value.filter((s) =>
    s.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

// Add to cart
const addProductToCart = (product: Product) => {
  const result = cart.addProduct(product);
  if (!result.success) {
    error(result.error || "ເກີດຂໍ້ຜິດພາດ");
  }
};

const addServiceToCart = (service: Service) => {
  cart.addService(service);
};

// Apply promotion
const applyPromotion = (promo: Promotion | null) => {
  cart.setPromotion(promo);
};

// Submit order
const submitOrder = async () => {
  if (!selectedCustomer.value) {
    error("ກະລຸນາເລືອກລູກຄ້າ");
    return;
  }

  if (cart.items.value.length === 0) {
    error("ກະລຸນາເພີ່ມສິນຄ້າ ຫຼື ບໍລິການ");
    return;
  }

  isSubmitting.value = true;

  try {
    const cartData = cart.getCartData();
    const res = await $fetch<{ success: boolean; data: { id: number } }>("/api/sales", {
      method: "POST",
      headers: getAuthHeaders(),
      body: {
        customerId: selectedCustomer.value.id,
        items: cartData.items,
        subtotal: cartData.subtotal,
        discount: cartData.discount,
        total: cartData.total,
        promotionId: cartData.promotionId,
        status: paymentStatus.value,
      },
    });

    if (res.success) {
      success("ບັນທຶກການຂາຍສຳເລັດ");
      cart.clearCart();
      selectedCustomer.value = null;
      paymentStatus.value = "UNPAID";
      // Navigate to invoice
      navigateTo(`/sales/${res.data.id}`);
    }
  } catch (err) {
    error("ເກີດຂໍ້ຜິດພາດ");
  } finally {
    isSubmitting.value = false;
  }
};

// Format currency
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    minimumFractionDigits: 0,
  }).format(value);

// Watch customer search
watch(customerSearch, searchCustomers);

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="h-[calc(100vh-7rem)]">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <!-- Products/Services Panel -->
      <div class="lg:col-span-2 flex flex-col">
        <div class="card flex-1 flex flex-col overflow-hidden">
          <!-- Tabs -->
          <div class="flex border-b border-clinic-border">
            <button
              @click="activeTab = 'products'"
              class="flex-1 px-4 py-3 font-medium transition-colors"
              :class="
                activeTab === 'products'
                  ? 'text-clinic-accent border-b-2 border-clinic-accent'
                  : 'text-gray-400 hover:text-white'
              "
            >
              <Icon name="lucide:package" class="w-4 h-4 inline mr-2" />
              ສິນຄ້າ
            </button>
            <button
              @click="activeTab = 'services'"
              class="flex-1 px-4 py-3 font-medium transition-colors"
              :class="
                activeTab === 'services'
                  ? 'text-clinic-accent border-b-2 border-clinic-accent'
                  : 'text-gray-400 hover:text-white'
              "
            >
              <Icon name="lucide:heart-handshake" class="w-4 h-4 inline mr-2" />
              ບໍລິການ
            </button>
          </div>

          <!-- Search -->
          <div class="p-4 border-b border-clinic-border">
            <input
              v-model="search"
              type="text"
              class="input"
              placeholder="ຄົ້ນຫາ..."
            />
          </div>

          <!-- Items Grid -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="isLoading" class="flex items-center justify-center h-full">
              <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-clinic-accent" />
            </div>

            <!-- Products -->
            <div
              v-else-if="activeTab === 'products'"
              class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3"
            >
              <button
                v-for="product in filteredProducts"
                :key="product.id"
                @click="addProductToCart(product)"
                class="p-4 rounded-xl bg-clinic-dark border border-clinic-border hover:border-clinic-accent transition-all text-left group"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs text-gray-500">
                    {{ product.category?.name }}
                  </span>
                  <span
                    class="text-xs"
                    :class="
                      product.stock <= product.minStock
                        ? 'text-amber-400'
                        : 'text-gray-500'
                    "
                  >
                    {{ product.stock }}
                  </span>
                </div>
                <p class="font-medium text-white group-hover:text-clinic-accent transition-colors line-clamp-2 text-sm">
                  {{ product.name }}
                </p>
                <p class="text-clinic-accent font-semibold mt-2">
                  {{ formatCurrency(product.price) }}
                </p>
              </button>

              <div
                v-if="filteredProducts.length === 0"
                class="col-span-full text-center py-8 text-gray-400"
              >
                ບໍ່ພົບສິນຄ້າ
              </div>
            </div>

            <!-- Services -->
            <div
              v-else
              class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3"
            >
              <button
                v-for="service in filteredServices"
                :key="service.id"
                @click="addServiceToCart(service)"
                class="p-4 rounded-xl bg-clinic-dark border border-clinic-border hover:border-pink-500 transition-all text-left group"
              >
                <Icon name="lucide:heart-handshake" class="w-5 h-5 text-pink-400 mb-2" />
                <p class="font-medium text-white group-hover:text-pink-400 transition-colors line-clamp-2 text-sm">
                  {{ service.name }}
                </p>
                <p class="text-pink-400 font-semibold mt-2">
                  {{ formatCurrency(service.price) }}
                </p>
              </button>

              <div
                v-if="filteredServices.length === 0"
                class="col-span-full text-center py-8 text-gray-400"
              >
                ບໍ່ພົບບໍລິການ
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Panel -->
      <div class="flex flex-col">
        <div class="card flex-1 flex flex-col overflow-hidden">
          <!-- Customer Selection -->
          <div class="p-4 border-b border-clinic-border">
            <label class="input-label">ລູກຄ້າ</label>
            <div v-if="selectedCustomer" class="flex items-center gap-3 p-3 bg-clinic-dark rounded-lg">
              <div class="w-10 h-10 rounded-full bg-clinic-accent/20 flex items-center justify-center">
                <Icon name="lucide:user" class="w-5 h-5 text-clinic-accent" />
              </div>
              <div class="flex-1">
                <p class="font-medium text-white">
                  {{ selectedCustomer.firstName }} {{ selectedCustomer.lastName }}
                </p>
                <p class="text-sm text-gray-400">{{ selectedCustomer.phone }}</p>
              </div>
              <button
                @click="selectedCustomer = null"
                class="text-gray-400 hover:text-red-400"
              >
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>
            <div v-else class="flex gap-2">
              <button
                @click="showCustomerModal = true"
                class="btn btn-secondary flex-1"
              >
                <Icon name="lucide:search" class="w-4 h-4" />
                ຄົ້ນຫາລູກຄ້າ
              </button>
              <button
                @click="showNewCustomerModal = true"
                class="btn btn-primary"
              >
                <Icon name="lucide:user-plus" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Cart Items -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="cart.items.value.length === 0" class="text-center py-8 text-gray-400">
              <Icon name="lucide:shopping-cart" class="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>ກະຕ່າວ່າງເປົ່າ</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="item in cart.items.value"
                :key="item.id"
                class="flex items-center gap-3 p-3 bg-clinic-dark rounded-lg"
              >
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-white truncate">{{ item.name }}</p>
                  <p class="text-sm text-gray-400">
                    {{ formatCurrency(item.price) }} x {{ item.quantity }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="cart.updateQuantity(item.id, item.quantity - 1)"
                    class="w-8 h-8 rounded-lg bg-clinic-surface flex items-center justify-center hover:bg-clinic-border transition-colors"
                  >
                    <Icon name="lucide:minus" class="w-4 h-4" />
                  </button>
                  <span class="w-8 text-center">{{ item.quantity }}</span>
                  <button
                    @click="cart.updateQuantity(item.id, item.quantity + 1)"
                    class="w-8 h-8 rounded-lg bg-clinic-surface flex items-center justify-center hover:bg-clinic-border transition-colors"
                  >
                    <Icon name="lucide:plus" class="w-4 h-4" />
                  </button>
                </div>
                <p class="font-semibold text-clinic-accent w-24 text-right">
                  {{ formatCurrency(item.total) }}
                </p>
                <button
                  @click="cart.removeItem(item.id)"
                  class="text-gray-400 hover:text-red-400"
                >
                  <Icon name="lucide:x" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Promotion -->
          <div v-if="promotions.length > 0" class="px-4 py-3 border-t border-clinic-border">
            <label class="input-label">ໂປຣໂມຊັ່ນ</label>
            <select
              class="select"
              :value="cart.promotion.value?.id || ''"
              @change="(e) => applyPromotion(promotions.find((p) => p.id === Number((e.target as HTMLSelectElement).value)) || null)"
            >
              <option value="">ບໍ່ໃຊ້ໂປຣໂມຊັ່ນ</option>
              <option v-for="promo in promotions" :key="promo.id" :value="promo.id">
                {{ promo.name }} (-{{ promo.isPercent ? `${promo.discount}%` : formatCurrency(promo.discount) }})
              </option>
            </select>
          </div>

          <!-- Payment Status -->
          <div class="px-4 py-3 border-t border-clinic-border">
            <label class="input-label">ສະຖານະການຈ່າຍ</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="status in ['PAID', 'UNPAID', 'TRANSFER'] as PaymentStatus[]"
                :key="status"
                @click="paymentStatus = status"
                class="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                :class="
                  paymentStatus === status
                    ? status === 'PAID'
                      ? 'bg-emerald-500 text-white'
                      : status === 'TRANSFER'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-amber-500 text-white'
                    : 'bg-clinic-dark text-gray-400 hover:text-white'
                "
              >
                {{ status === "PAID" ? "ຈ່າຍ" : status === "TRANSFER" ? "ໂອນ" : "ບໍ່ຈ່າຍ" }}
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="p-4 border-t border-clinic-border space-y-2">
            <div class="flex justify-between text-gray-400">
              <span>ຍອດລວມ</span>
              <span>{{ formatCurrency(cart.subtotal.value) }}</span>
            </div>
            <div v-if="cart.discount.value > 0" class="flex justify-between text-amber-400">
              <span>ສ່ວນຫຼຸດ</span>
              <span>-{{ formatCurrency(cart.discount.value) }}</span>
            </div>
            <div class="flex justify-between text-xl font-bold text-white pt-2 border-t border-clinic-border">
              <span>ທັງໝົດ</span>
              <span class="text-clinic-accent">{{ formatCurrency(cart.total.value) }}</span>
            </div>
          </div>

          <!-- Submit -->
          <div class="p-4 border-t border-clinic-border">
            <button
              @click="submitOrder"
              class="btn btn-primary w-full btn-lg"
              :disabled="isSubmitting || !selectedCustomer || cart.items.value.length === 0"
            >
              <Icon
                v-if="isSubmitting"
                name="lucide:loader-2"
                class="w-5 h-5 animate-spin"
              />
              <Icon v-else name="lucide:check" class="w-5 h-5" />
              ບັນທຶກການຂາຍ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Search Modal -->
    <Modal :show="showCustomerModal" title="ຄົ້ນຫາລູກຄ້າ" @close="showCustomerModal = false">
      <div class="space-y-4">
        <input
          v-model="customerSearch"
          type="text"
          class="input"
          placeholder="ປ້ອນຊື່ ຫຼື ເບີໂທ..."
          autofocus
        />

        <div class="max-h-64 overflow-y-auto space-y-2">
          <button
            v-for="customer in customers"
            :key="customer.id"
            @click="selectCustomer(customer)"
            class="w-full p-3 rounded-lg bg-clinic-dark hover:bg-clinic-border transition-colors text-left flex items-center gap-3"
          >
            <div class="w-10 h-10 rounded-full bg-clinic-accent/20 flex items-center justify-center">
              <Icon name="lucide:user" class="w-5 h-5 text-clinic-accent" />
            </div>
            <div>
              <p class="font-medium text-white">
                {{ customer.firstName }} {{ customer.lastName }}
              </p>
              <p class="text-sm text-gray-400">{{ customer.phone }}</p>
            </div>
          </button>

          <div v-if="customerSearch.length >= 2 && customers.length === 0" class="text-center py-4 text-gray-400">
            ບໍ່ພົບລູກຄ້າ
          </div>
        </div>
      </div>
    </Modal>

    <!-- New Customer Modal -->
    <Modal :show="showNewCustomerModal" title="ເພີ່ມລູກຄ້າໃໝ່" @close="showNewCustomerModal = false">
      <form @submit.prevent="addNewCustomer" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label">ຊື່ *</label>
            <input v-model="newCustomerForm.firstName" type="text" class="input" required />
          </div>
          <div>
            <label class="input-label">ນາມສະກຸນ *</label>
            <input v-model="newCustomerForm.lastName" type="text" class="input" required />
          </div>
        </div>

        <div>
          <label class="input-label">ເບີໂທ *</label>
          <input v-model="newCustomerForm.phone" type="tel" class="input" required />
        </div>

        <div>
          <label class="input-label">ທີ່ຢູ່</label>
          <textarea v-model="newCustomerForm.address" class="input" rows="2" />
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="showNewCustomerModal = false" class="btn btn-secondary flex-1">
            ຍົກເລີກ
          </button>
          <button type="submit" class="btn btn-primary flex-1">
            ເພີ່ມ
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

