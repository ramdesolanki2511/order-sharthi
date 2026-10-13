export type Language = 'gu' | 'hi' | 'en';

export type UserRole = 'owner' | 'manager' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  preferredLanguage: Language;
  role: UserRole;
}

export interface Business {
  id: string;
  name: string;
  ownerId: string;
  businessCategory: string;
  gstin?: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  logoUrl?: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  allowBackorders: boolean;
  invoicePrefix: string;
  orderPrefix: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  businessName: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  gstin?: string;
  billingAddress: string;
  shippingAddress?: string;
  city: string;
  state: string;
  category: 'regular' | 'vip' | 'distributor' | 'bulk';
  creditLimit: number;
  paymentTermsDays: number;
  openingBalance: number;
  currentBalance: number; // positive = customer owes us money
  notes?: string;
  status: 'active' | 'inactive' | 'blocked';
  lastOrderDate?: string;
  totalSales?: number;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  stockQuantity: number;
  priceAdjustment: number;
}

export interface Product {
  id: string;
  businessId: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  sku: string;
  barcode?: string;
  unit: string; // pcs, meters, boxes, sets, rolls, thaan
  costPrice: number;
  sellingPrice: number;
  taxRate: number; // 5%, 12%, 18%
  hsnCode?: string;
  stockQuantity: number;
  minStockAlert: number;
  imageUrl?: string;
  description?: string;
  aliases?: string[];
  isArchived: boolean;
  variants?: ProductVariant[];
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  variantId?: string;
  movementType: 'stock_in' | 'stock_out' | 'adjustment' | 'order_dispatch' | 'order_cancellation';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceId?: string;
  reason: string;
  createdAt: string;
}

export type OrderStatus =
  | 'draft'
  | 'pending_confirmation'
  | 'confirmed'
  | 'processing'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  productName: string;
  sku?: string;
  variant?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  total: number;
}

export interface Order {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerBusinessName?: string;
  customerPhone?: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCharges: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  source: 'manual' | 'whatsapp_ai' | 'phone' | 'repeat_order';
  rawMessageText?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  expectedDeliveryDate?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other';

export interface Payment {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  orderNumber?: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string; // UPI UTR or Cheque No
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

export interface CustomerLedgerEntry {
  id: string;
  businessId: string;
  customerId: string;
  entryType: 'invoice' | 'payment' | 'credit_note' | 'opening_balance';
  referenceId?: string;
  referenceNumber?: string;
  description: string;
  debit: number; // Added to customer balance (invoice)
  credit: number; // Subtracted from customer balance (payment)
  runningBalance: number;
  entryDate: string;
  createdAt: string;
}

export type DispatchStatus = 'booked' | 'dispatched' | 'in_transit' | 'delivered';

export interface Dispatch {
  id: string;
  businessId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  transporterName: string;
  lrNumber?: string; // Lorry Receipt / Bilty
  trackingNumber?: string;
  parcelCount: number;
  weightKg?: number;
  dispatchDate: string;
  estimatedArrival?: string;
  driverPhone?: string;
  status: DispatchStatus;
  notes?: string;
  createdAt: string;
}

export interface FollowUpReminder {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderId?: string;
  reminderType: 'payment_due' | 'order_reorder' | 'dispatch_update' | 'general';
  title: string;
  dueDate: string;
  isCompleted: boolean;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  businessId: string;
  type: 'low_stock' | 'payment_overdue' | 'new_order' | 'dispatch_ready' | 'trial_expiry';
  title: string;
  message: string;
  isRead: boolean;
  linkTab?: string;
  createdAt: string;
}

export interface SubscriptionInfo {
  tier: 'free_trial' | 'starter' | 'pro' | 'business';
  status: 'active' | 'past_due' | 'expired';
  monthlyPrice: number;
  trialDaysLeft: number;
  maxOrdersPerMonth: number;
  ordersThisMonth: number;
  maxStaffMembers: number;
  aiFeaturesEnabled: boolean;
  currentPeriodEnd: string;
}

export interface AIExtractedItem {
  rawText?: string;
  productName: string;
  matchedProductId?: string;
  sku?: string;
  quantity: number;
  unit: string;
  variant?: string;
  unitPrice: number;
  status: 'matched' | 'unknown_product' | 'ambiguous_quantity' | 'missing_price';
  notes?: string;
}

export interface AIExtractedOrder {
  source: 'gemini-ai' | 'heuristic-engine';
  detectedCustomerName: string;
  matchedCustomerId?: string;
  deliveryNotes?: string;
  requestedDeliveryDate?: string;
  paymentTerms?: string;
  confidenceScore: number;
  items: AIExtractedItem[];
}
