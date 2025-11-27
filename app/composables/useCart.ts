import type { CartItem, Product, Service, Promotion } from "~/types";

// =========================================
// Cart State
// =========================================

const cartItems = ref<CartItem[]>([]);
const selectedPromotion = ref<Promotion | null>(null);

export function useCart() {
  // Calculate subtotal
  const subtotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.total, 0)
  );

  // Calculate discount
  const discount = computed(() => {
    if (!selectedPromotion.value) return 0;

    if (selectedPromotion.value.isPercent) {
      return (subtotal.value * selectedPromotion.value.discount) / 100;
    }

    return selectedPromotion.value.discount;
  });

  // Calculate total
  const total = computed(() => Math.max(0, subtotal.value - discount.value));

  // Item count
  const itemCount = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  // Add product to cart
  const addProduct = (product: Product) => {
    const existing = cartItems.value.find(
      (item) => item.type === "product" && item.itemId === product.id
    );

    if (existing) {
      if (product.stock && existing.quantity >= product.stock) {
        return { success: false, error: "ສິນຄ້າບໍ່ພຽງພໍ" };
      }
      existing.quantity++;
      existing.total = existing.price * existing.quantity;
    } else {
      cartItems.value.push({
        id: `product-${product.id}`,
        type: "product",
        itemId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        total: Number(product.price),
        stock: product.stock,
      });
    }

    return { success: true };
  };

  // Add service to cart
  const addService = (service: Service) => {
    const existing = cartItems.value.find(
      (item) => item.type === "service" && item.itemId === service.id
    );

    if (existing) {
      existing.quantity++;
      existing.total = existing.price * existing.quantity;
    } else {
      cartItems.value.push({
        id: `service-${service.id}`,
        type: "service",
        itemId: service.id,
        name: service.name,
        price: Number(service.price),
        quantity: 1,
        total: Number(service.price),
      });
    }

    return { success: true };
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    const item = cartItems.value.find((item) => item.id === id);

    if (item) {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }

      if (item.stock && quantity > item.stock) {
        return { success: false, error: "ສິນຄ້າບໍ່ພຽງພໍ" };
      }

      item.quantity = quantity;
      item.total = item.price * quantity;
    }

    return { success: true };
  };

  // Remove item
  const removeItem = (id: string) => {
    const index = cartItems.value.findIndex((item) => item.id === id);
    if (index > -1) {
      cartItems.value.splice(index, 1);
    }
  };

  // Clear cart
  const clearCart = () => {
    cartItems.value = [];
    selectedPromotion.value = null;
  };

  // Set promotion
  const setPromotion = (promotion: Promotion | null) => {
    selectedPromotion.value = promotion;
  };

  // Get cart data for API
  const getCartData = () => ({
    items: cartItems.value.map((item) => ({
      type: item.type,
      itemId: item.itemId,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    })),
    subtotal: subtotal.value,
    discount: discount.value,
    total: total.value,
    promotionId: selectedPromotion.value?.id || null,
  });

  return {
    items: cartItems,
    promotion: selectedPromotion,
    subtotal,
    discount,
    total,
    itemCount,
    addProduct,
    addService,
    updateQuantity,
    removeItem,
    clearCart,
    setPromotion,
    getCartData,
  };
}

