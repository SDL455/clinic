// =========================================
// User Types
// =========================================

export type UserRole = "ADMIN" | "EMPLOYEE";

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthUser extends User {
  token: string;
}

// =========================================
// Customer Types
// =========================================

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerWithHistory extends Customer {
  sales: Sale[];
}

// =========================================
// Product Types
// =========================================

export interface ProductCategory {
  id: number;
  name: string;
  unit: string;
  createdAt: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  categoryId: number;
  isActive: boolean;
  createdAt: string;
  category?: ProductCategory;
}

export interface ProductWithAlerts extends Product {
  isLowStock: boolean;
  isOutOfStock: boolean;
}

// =========================================
// Service Types
// =========================================

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  createdAt: string;
}

// =========================================
// Promotion Types
// =========================================

export interface Promotion {
  id: number;
  name: string;
  description?: string;
  discount: number;
  isPercent: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

// =========================================
// Sale Types
// =========================================

export type PaymentStatus = "PAID" | "UNPAID" | "TRANSFER";

export interface SaleItem {
  id: number;
  saleId: number;
  productId?: number;
  serviceId?: number;
  quantity: number;
  price: number;
  total: number;
  product?: Product;
  service?: Service;
}

export interface Sale {
  id: number;
  invoiceNumber: string;
  customerId: number;
  userId: number;
  promotionId?: number;
  subtotal: number;
  discount: number;
  total: number;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
  customer?: Customer;
  user?: User;
  promotion?: Promotion;
  items?: SaleItem[];
}

// =========================================
// Report Types
// =========================================

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalCustomers: number;
  lowStockProducts: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
}

export interface RevenueReport {
  period: string;
  revenue: number;
  count: number;
}

// =========================================
// API Response Types
// =========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =========================================
// Cart Types (for POS)
// =========================================

export interface CartItem {
  id: string;
  type: "product" | "service";
  itemId: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  stock?: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  promotionId?: number;
}

// =========================================
// Menu & Navigation
// =========================================

export interface MenuItem {
  label: string;
  icon: string;
  to: string;
  adminOnly?: boolean;
}

