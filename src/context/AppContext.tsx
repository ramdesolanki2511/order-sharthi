import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Business,
  UserProfile,
  Customer,
  Product,
  Order,
  Payment,
  CustomerLedgerEntry,
  Dispatch,
  FollowUpReminder,
  NotificationItem,
  SubscriptionInfo,
  Language,
  UserRole,
  OrderItem,
} from '../types';
import { translations } from '../i18n/translations';

// Initial Seed Data for Ambika Textiles Surat
const initialBusiness: Business = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Ambika Textiles & Garments Wholesalers',
  ownerId: '00000000-0000-0000-0000-000000000001',
  businessCategory: 'Textile & Apparel Wholesale',
  gstin: '24AAACA1234A1Z5',
  phone: '+91 98250 12345',
  whatsappNumber: '+91 98250 12345',
  email: 'orders@ambikatextiles.in',
  addressLine1: 'Shop 204, Ring Road New Textile Market',
  addressLine2: 'Near Sahara Darwaja',
  city: 'Surat',
  state: 'Gujarat',
  pincode: '395002',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  allowBackorders: false,
  invoicePrefix: 'INV',
  orderPrefix: 'OS',
};

const initialUser: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'rajesh.patel@ambikatextiles.in',
  fullName: 'Rajeshbhai Patel',
  phone: '+91 98250 12345',
  preferredLanguage: 'gu',
  role: 'owner',
};

const initialProducts: Product[] = [
  {
    id: 'prod-001',
    businessId: initialBusiness.id,
    name: 'Rayon Anarkali Kurti Blue',
    sku: 'KURTI-RAY-BLU',
    unit: 'pcs',
    costPrice: 280,
    sellingPrice: 450,
    taxRate: 5,
    stockQuantity: 140,
    minStockAlert: 25,
    aliases: ['blue anarkali', 'blue kurti', 'rayon blue'],
    isArchived: false,
    createdAt: '2026-10-01',
    variants: [
      { id: 'v-1', productId: 'prod-001', name: 'Size M', stockQuantity: 50, priceAdjustment: 0 },
      { id: 'v-2', productId: 'prod-001', name: 'Size L', stockQuantity: 60, priceAdjustment: 0 },
      { id: 'v-3', productId: 'prod-001', name: 'Size XL', stockQuantity: 30, priceAdjustment: 20 },
    ],
  },
  {
    id: 'prod-002',
    businessId: initialBusiness.id,
    name: 'Pure Cotton Bandhani Saree Maroon',
    sku: 'SAR-BAN-MAR',
    unit: 'pcs',
    costPrice: 520,
    sellingPrice: 850,
    taxRate: 5,
    stockQuantity: 85,
    minStockAlert: 15,
    aliases: ['cotton bandhani', 'maroon saree', 'bandhani maroon'],
    isArchived: false,
    createdAt: '2026-10-02',
    variants: [
      { id: 'v-4', productId: 'prod-002', name: 'Standard 6.3m with Blouse', stockQuantity: 85, priceAdjustment: 0 },
    ],
  },
  {
    id: 'prod-003',
    businessId: initialBusiness.id,
    name: 'Heavy Georgette Dupatta Gold Work',
    sku: 'DUP-GEO-GLD',
    unit: 'pcs',
    costPrice: 160,
    sellingPrice: 290,
    taxRate: 5,
    stockQuantity: 8, // Low Stock Trigger
    minStockAlert: 20,
    aliases: ['gold dupatta', 'georgette dupatta', 'heavy dupatta'],
    isArchived: false,
    createdAt: '2026-10-03',
  },
  {
    id: 'prod-004',
    businessId: initialBusiness.id,
    name: 'Men Linen Kurta Pajama Set White',
    sku: 'MEN-LIN-WHT',
    unit: 'sets',
    costPrice: 420,
    sellingPrice: 720,
    taxRate: 5,
    stockQuantity: 60,
    minStockAlert: 15,
    aliases: ['white kurta', 'men linen set', 'kurta pajama white'],
    isArchived: false,
    createdAt: '2026-10-04',
  },
  {
    id: 'prod-005',
    businessId: initialBusiness.id,
    name: 'Premium Denim Fabric Roll (Dark Indigo)',
    sku: 'FAB-DEN-IND',
    unit: 'meters',
    costPrice: 110,
    sellingPrice: 175,
    taxRate: 5,
    stockQuantity: 550,
    minStockAlert: 100,
    aliases: ['denim roll', 'indigo denim', 'denim fabric'],
    isArchived: false,
    createdAt: '2026-10-05',
  },
];

const initialCustomers: Customer[] = [
  {
    id: 'cust-001',
    businessId: initialBusiness.id,
    name: 'Dineshbhai Patel',
    businessName: 'Patel Traders Surat',
    phone: '+91 98790 55443',
    whatsappNumber: '+91 98790 55443',
    gstin: '24AABCP1122C1ZR',
    billingAddress: 'Plot 45, GIDC Sachin Industrial Area, Surat, Gujarat',
    city: 'Surat',
    state: 'Gujarat',
    category: 'vip',
    creditLimit: 250000,
    paymentTermsDays: 15,
    openingBalance: 0,
    currentBalance: 38450,
    status: 'active',
    lastOrderDate: '2026-10-12',
    totalSales: 184500,
    createdAt: '2026-09-01',
  },
  {
    id: 'cust-002',
    businessId: initialBusiness.id,
    name: 'Maheshbhai Shah',
    businessName: 'Balaji Cloth Emporium',
    phone: '+91 94260 77881',
    whatsappNumber: '+91 94260 77881',
    gstin: '24AAEFB5566D1ZX',
    billingAddress: 'Shop 12, Ratanpole Kapda Bazaar, Ahmedabad, Gujarat',
    city: 'Ahmedabad',
    state: 'Gujarat',
    category: 'distributor',
    creditLimit: 300000,
    paymentTermsDays: 21,
    openingBalance: 15000,
    currentBalance: 62000,
    status: 'active',
    lastOrderDate: '2026-10-11',
    totalSales: 212000,
    createdAt: '2026-09-10',
  },
  {
    id: 'cust-003',
    businessId: initialBusiness.id,
    name: 'Pravinbhai Jadeja',
    businessName: 'Krishna Sarees & Matching',
    phone: '+91 97120 33449',
    whatsappNumber: '+91 97120 33449',
    gstin: '24AAGPK8899K1ZM',
    billingAddress: 'Dharmendra Road, Near Palace Road, Rajkot, Gujarat',
    city: 'Rajkot',
    state: 'Gujarat',
    category: 'regular',
    creditLimit: 150000,
    paymentTermsDays: 15,
    openingBalance: 0,
    currentBalance: 14500,
    status: 'active',
    lastOrderDate: '2026-10-09',
    totalSales: 75000,
    createdAt: '2026-09-15',
  },
  {
    id: 'cust-004',
    businessId: initialBusiness.id,
    name: 'Anilbhai Verma',
    businessName: 'Shubh Garments Wholesale',
    phone: '+91 98241 88992',
    whatsappNumber: '+91 98241 88992',
    gstin: '24AAKFS4433E1ZQ',
    billingAddress: 'Mandvi Tower Road, Vadodara, Gujarat',
    city: 'Vadodara',
    state: 'Gujarat',
    category: 'regular',
    creditLimit: 200000,
    paymentTermsDays: 30,
    openingBalance: 0,
    currentBalance: 0,
    status: 'active',
    lastOrderDate: '2026-10-05',
    totalSales: 45000,
    createdAt: '2026-09-20',
  },
];

const initialOrders: Order[] = [
  {
    id: 'ord-1024',
    businessId: initialBusiness.id,
    customerId: 'cust-001',
    customerName: 'Dineshbhai Patel',
    customerBusinessName: 'Patel Traders Surat',
    customerPhone: '+91 98790 55443',
    orderNumber: 'OS-1024',
    status: 'processing',
    paymentStatus: 'partially_paid',
    items: [
      {
        id: 'item-1',
        productId: 'prod-001',
        productName: 'Rayon Anarkali Kurti Blue',
        sku: 'KURTI-RAY-BLU',
        variant: 'Size M',
        quantity: 50,
        unit: 'pcs',
        unitPrice: 450,
        discountPercent: 0,
        taxPercent: 5,
        total: 22500,
      },
      {
        id: 'item-2',
        productId: 'prod-002',
        productName: 'Pure Cotton Bandhani Saree Maroon',
        sku: 'SAR-BAN-MAR',
        quantity: 20,
        unit: 'pcs',
        unitPrice: 850,
        discountPercent: 0,
        taxPercent: 5,
        total: 17000,
      },
    ],
    subtotal: 39500,
    discountAmount: 1000,
    taxAmount: 1925,
    shippingCharges: 450,
    grandTotal: 40875,
    amountPaid: 20000,
    balanceDue: 20875,
    source: 'whatsapp_ai',
    rawMessageText: 'Patel Traders Surat: 50 pcs Rayon Kurti Blue M size, 20 pcs Cotton Bandhani Saree Maroon, urgent dispatch to Sachin branch by Friday.',
    deliveryNotes: 'Send via Surat Golden Transport to Sachin branch',
    expectedDeliveryDate: '2026-10-17',
    createdAt: '2026-10-12',
    updatedAt: '2026-10-12',
  },
  {
    id: 'ord-1025',
    businessId: initialBusiness.id,
    customerId: 'cust-002',
    customerName: 'Maheshbhai Shah',
    customerBusinessName: 'Balaji Cloth Emporium',
    customerPhone: '+91 94260 77881',
    orderNumber: 'OS-1025',
    status: 'ready_for_dispatch',
    paymentStatus: 'unpaid',
    items: [
      {
        id: 'item-3',
        productId: 'prod-002',
        productName: 'Pure Cotton Bandhani Saree Maroon',
        sku: 'SAR-BAN-MAR',
        quantity: 40,
        unit: 'pcs',
        unitPrice: 850,
        discountPercent: 0,
        taxPercent: 5,
        total: 34000,
      },
      {
        id: 'item-4',
        productId: 'prod-004',
        productName: 'Men Linen Kurta Pajama Set White',
        sku: 'MEN-LIN-WHT',
        quantity: 30,
        unit: 'sets',
        unitPrice: 720,
        discountPercent: 0,
        taxPercent: 5,
        total: 21600,
      },
    ],
    subtotal: 55600,
    discountAmount: 1600,
    taxAmount: 2700,
    shippingCharges: 600,
    grandTotal: 57300,
    amountPaid: 0,
    balanceDue: 57300,
    source: 'manual',
    deliveryNotes: 'Pack in 2 waterproof parcel boxes for Ahmedabad delivery',
    expectedDeliveryDate: '2026-10-16',
    createdAt: '2026-10-13',
    updatedAt: '2026-10-13',
  },
  {
    id: 'ord-1023',
    businessId: initialBusiness.id,
    customerId: 'cust-003',
    customerName: 'Pravinbhai Jadeja',
    customerBusinessName: 'Krishna Sarees & Matching',
    customerPhone: '+91 97120 33449',
    orderNumber: 'OS-1023',
    status: 'delivered',
    paymentStatus: 'paid',
    items: [
      {
        id: 'item-5',
        productId: 'prod-003',
        productName: 'Heavy Georgette Dupatta Gold Work',
        sku: 'DUP-GEO-GLD',
        quantity: 50,
        unit: 'pcs',
        unitPrice: 290,
        discountPercent: 0,
        taxPercent: 5,
        total: 14500,
      },
    ],
    subtotal: 14500,
    discountAmount: 500,
    taxAmount: 700,
    shippingCharges: 300,
    grandTotal: 15000,
    amountPaid: 15000,
    balanceDue: 0,
    source: 'phone',
    deliveryNotes: 'Delivered via VRL Logistics Rajkot hub',
    createdAt: '2026-10-09',
    updatedAt: '2026-10-11',
  },
];

const initialPayments: Payment[] = [
  {
    id: 'pay-001',
    businessId: initialBusiness.id,
    customerId: 'cust-001',
    customerName: 'Dineshbhai Patel (Patel Traders)',
    orderId: 'ord-1024',
    orderNumber: 'OS-1024',
    receiptNumber: 'RCP-101',
    amount: 20000,
    paymentMethod: 'upi',
    referenceNumber: 'UPI/42890123982',
    paymentDate: '2026-10-12',
    notes: 'Advance 50% paid via Google Pay UPI',
    createdAt: '2026-10-12',
  },
  {
    id: 'pay-002',
    businessId: initialBusiness.id,
    customerId: 'cust-003',
    customerName: 'Pravinbhai Jadeja (Krishna Sarees)',
    orderId: 'ord-1023',
    orderNumber: 'OS-1023',
    receiptNumber: 'RCP-102',
    amount: 15000,
    paymentMethod: 'bank_transfer',
    referenceNumber: 'NEFT-HDFC998231',
    paymentDate: '2026-10-11',
    notes: 'Full payment received against Bill OS-1023',
    createdAt: '2026-10-11',
  },
];

const initialLedger: CustomerLedgerEntry[] = [
  {
    id: 'led-1',
    businessId: initialBusiness.id,
    customerId: 'cust-001',
    entryType: 'invoice',
    referenceNumber: 'OS-1024',
    description: 'Invoice #OS-1024 (50 Kurti, 20 Saree)',
    debit: 40875,
    credit: 0,
    runningBalance: 40875,
    entryDate: '2026-10-12',
    createdAt: '2026-10-12',
  },
  {
    id: 'led-2',
    businessId: initialBusiness.id,
    customerId: 'cust-001',
    entryType: 'payment',
    referenceNumber: 'RCP-101',
    description: 'UPI Payment received against OS-1024',
    debit: 0,
    credit: 20000,
    runningBalance: 20875,
    entryDate: '2026-10-12',
    createdAt: '2026-10-12',
  },
  {
    id: 'led-3',
    businessId: initialBusiness.id,
    customerId: 'cust-002',
    entryType: 'invoice',
    referenceNumber: 'OS-1025',
    description: 'Invoice #OS-1025 (40 Saree, 30 Kurta Set)',
    debit: 57300,
    credit: 0,
    runningBalance: 62000,
    entryDate: '2026-10-13',
    createdAt: '2026-10-13',
  },
];

const initialDispatches: Dispatch[] = [
  {
    id: 'disp-001',
    businessId: initialBusiness.id,
    orderId: 'ord-1024',
    orderNumber: 'OS-1024',
    customerName: 'Patel Traders Surat',
    transporterName: 'Surat Golden Transport Co.',
    lrNumber: 'SGT-489912',
    trackingNumber: 'TRK-98124',
    parcelCount: 2,
    weightKg: 35.5,
    dispatchDate: '2026-10-13',
    estimatedArrival: '2026-10-14',
    driverPhone: '+91 94280 11223',
    status: 'in_transit',
    notes: 'Sachin industrial gate delivery',
    createdAt: '2026-10-13',
  },
];

const initialReminders: FollowUpReminder[] = [
  {
    id: 'rem-001',
    businessId: initialBusiness.id,
    customerId: 'cust-002',
    customerName: 'Balaji Cloth Emporium',
    customerPhone: '+91 94260 77881',
    reminderType: 'payment_due',
    title: 'Payment reminder for ₹62,000 outstanding balance',
    dueDate: '2026-10-15',
    isCompleted: false,
    notes: 'Credit term of 21 days due this week. Call Maheshbhai.',
    createdAt: '2026-10-12',
  },
  {
    id: 'rem-002',
    businessId: initialBusiness.id,
    customerId: 'cust-001',
    customerName: 'Patel Traders Surat',
    customerPhone: '+91 98790 55443',
    reminderType: 'dispatch_update',
    title: 'Share Bilty / LR #SGT-489912 on WhatsApp',
    dueDate: '2026-10-13',
    isCompleted: false,
    createdAt: '2026-10-13',
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    businessId: initialBusiness.id,
    type: 'low_stock',
    title: 'Low Stock Alert: Georgette Dupatta',
    message: 'Only 8 pcs remaining in stock (below threshold 20 pcs). Reorder from weaver.',
    isRead: false,
    linkTab: 'inventory',
    createdAt: '2026-10-13',
  },
  {
    id: 'notif-2',
    businessId: initialBusiness.id,
    type: 'payment_overdue',
    title: 'Payment Due: Balaji Cloth Emporium',
    message: '₹62,000 due date approaching on 15 Oct.',
    isRead: false,
    linkTab: 'more',
    createdAt: '2026-10-12',
  },
];

const initialSubscription: SubscriptionInfo = {
  tier: 'pro',
  status: 'active',
  monthlyPrice: 999,
  trialDaysLeft: 12,
  maxOrdersPerMonth: 500,
  ordersThisMonth: 18,
  maxStaffMembers: 5,
  aiFeaturesEnabled: true,
  currentPeriodEnd: '2026-10-25',
};

interface AppContextType {
  business: Business;
  updateBusiness: (updates: Partial<Business>) => void;
  userProfile: UserProfile;
  switchUserRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  activeTab: 'dashboard' | 'orders' | 'customers' | 'inventory' | 'more';
  setActiveTab: (tab: 'dashboard' | 'orders' | 'customers' | 'inventory' | 'more') => void;
  moreSubTab: string;
  setMoreSubTab: (sub: string) => void;
  deviceFrame: boolean;
  setDeviceFrame: (val: boolean) => void;
  // Customers
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'businessId' | 'currentBalance' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  // Products
  products: Product[];
  addProduct: (prod: Omit<Product, 'id' | 'businessId' | 'isArchived' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  adjustStock: (productId: string, quantityDelta: number, reason: string) => boolean;
  // Orders
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => { success: boolean; error?: string; order?: Order };
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  cancelOrder: (orderId: string, reverseStock: boolean) => void;
  repeatOrder: (orderId: string) => Order | null;
  // Payments & Ledger
  payments: Payment[];
  ledger: CustomerLedgerEntry[];
  recordPayment: (paymentData: {
    customerId: string;
    orderId?: string;
    amount: number;
    paymentMethod: Payment['paymentMethod'];
    referenceNumber?: string;
    notes?: string;
  }) => void;
  // Dispatches
  dispatches: Dispatch[];
  addDispatch: (disp: Omit<Dispatch, 'id' | 'businessId' | 'createdAt'>) => void;
  // Reminders
  reminders: FollowUpReminder[];
  toggleReminder: (id: string) => void;
  addReminder: (rem: Omit<FollowUpReminder, 'id' | 'businessId' | 'isCompleted' | 'createdAt'>) => void;
  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  // Subscription
  subscription: SubscriptionInfo;
  upgradeSubscription: (tier: 'starter' | 'pro' | 'business') => void;
  // Onboarding
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (val: boolean) => void;
  showOnboardingTour: boolean;
  setShowOnboardingTour: (val: boolean) => void;
  // Exports
  exportCustomersCSV: () => void;
  exportOrdersCSV: () => void;
  exportLedgerCSV: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [business, setBusiness] = useState<Business>(() => {
    const saved = localStorage.getItem('ordersaathi_business');
    return saved ? JSON.parse(saved) : initialBusiness;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ordersaathi_user');
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('ordersaathi_lang') as Language) || 'gu';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'customers' | 'inventory' | 'more'>('dashboard');
  const [moreSubTab, setMoreSubTab] = useState<string>('payments');
  const [deviceFrame, setDeviceFrame] = useState<boolean>(true); // Mobile frame simulator enabled by default

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('ordersaathi_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ordersaathi_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('ordersaathi_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('ordersaathi_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [ledger, setLedger] = useState<CustomerLedgerEntry[]>(() => {
    const saved = localStorage.getItem('ordersaathi_ledger');
    return saved ? JSON.parse(saved) : initialLedger;
  });

  const [dispatches, setDispatches] = useState<Dispatch[]>(() => {
    const saved = localStorage.getItem('ordersaathi_dispatches');
    return saved ? JSON.parse(saved) : initialDispatches;
  });

  const [reminders, setReminders] = useState<FollowUpReminder[]>(() => {
    const saved = localStorage.getItem('ordersaathi_reminders');
    return saved ? JSON.parse(saved) : initialReminders;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('ordersaathi_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [subscription, setSubscription] = useState<SubscriptionInfo>(() => {
    const saved = localStorage.getItem('ordersaathi_subscription');
    return saved ? JSON.parse(saved) : initialSubscription;
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('ordersaathi_onboarded') === 'true';
  });
  const [showOnboardingTour, setShowOnboardingTour] = useState<boolean>(!hasCompletedOnboarding);

  // Persistence to local storage
  useEffect(() => {
    localStorage.setItem('ordersaathi_business', JSON.stringify(business));
  }, [business]);

  useEffect(() => {
    localStorage.setItem('ordersaathi_user', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('ordersaathi_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('ordersaathi_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ordersaathi_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ordersaathi_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('ordersaathi_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('ordersaathi_subscription', JSON.stringify(subscription));
  }, [subscription]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ordersaathi_lang', lang);
  };

  const t = (key: keyof typeof translations.en): string => {
    const langDict = translations[language] || translations.en;
    return (langDict as any)[key] || translations.en[key] || String(key);
  };

  const updateBusiness = (updates: Partial<Business>) => {
    setBusiness((prev) => ({ ...prev, ...updates }));
  };

  const switchUserRole = (role: UserRole) => {
    setUserProfile((prev) => ({ ...prev, role }));
  };

  // Customer Management
  const addCustomer = (custData: Omit<Customer, 'id' | 'businessId' | 'currentBalance' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: 'cust-' + Date.now(),
      businessId: business.id,
      currentBalance: custData.openingBalance || 0,
      createdAt: new Date().toISOString().split('T')[0],
      totalSales: 0,
    };
    setCustomers((prev) => [newCust, ...prev]);

    if (newCust.openingBalance > 0) {
      const entry: CustomerLedgerEntry = {
        id: 'led-' + Date.now(),
        businessId: business.id,
        customerId: newCust.id,
        entryType: 'opening_balance',
        description: 'Opening Balance',
        debit: newCust.openingBalance,
        credit: 0,
        runningBalance: newCust.openingBalance,
        entryDate: newCust.createdAt,
        createdAt: newCust.createdAt,
      };
      setLedger((prev) => [entry, ...prev]);
    }
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // Product Catalogue
  const addProduct = (prodData: Omit<Product, 'id' | 'businessId' | 'isArchived' | 'createdAt'>): Product => {
    const newProd: Product = {
      ...prodData,
      id: 'prod-' + Date.now(),
      businessId: business.id,
      isArchived: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const adjustStock = (productId: string, quantityDelta: number, reason: string): boolean => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return false;

    const newStock = prod.stockQuantity + quantityDelta;
    if (newStock < 0 && !business.allowBackorders) {
      return false; // Backorders prevented!
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockQuantity: Math.max(0, newStock) } : p))
    );

    // If stock dropped below alert threshold, notify
    if (newStock <= prod.minStockAlert) {
      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        businessId: business.id,
        type: 'low_stock',
        title: `Low Stock: ${prod.name}`,
        message: `Stock is down to ${newStock} ${prod.unit}. Minimum alert: ${prod.minStockAlert}.`,
        isRead: false,
        linkTab: 'inventory',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    return true;
  };

  // Order Operations
  const createOrder = (orderData: Partial<Order>): { success: boolean; error?: string; order?: Order } => {
    // Check stock for all items if backorders are disallowed
    if (!business.allowBackorders) {
      for (const item of orderData.items || []) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod && prod.stockQuantity < item.quantity) {
          return {
            success: false,
            error: `Insufficient stock for "${prod.name}" (Required: ${item.quantity} ${prod.unit}, Available: ${prod.stockQuantity} ${prod.unit}). Enable backorders in Settings to override.`,
          };
        }
      }
    }

    // Deduct stock for all items
    orderData.items?.forEach((item) => {
      adjustStock(item.productId, -item.quantity, `Deducted for Order ${orderData.orderNumber}`);
    });

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      businessId: business.id,
      customerId: orderData.customerId || '',
      customerName: orderData.customerName || 'Customer',
      customerBusinessName: orderData.customerBusinessName,
      customerPhone: orderData.customerPhone,
      orderNumber: orderData.orderNumber || `${business.orderPrefix}-${1000 + orders.length + 1}`,
      status: orderData.status || 'confirmed',
      paymentStatus: (orderData.amountPaid || 0) >= (orderData.grandTotal || 0)
        ? 'paid'
        : (orderData.amountPaid || 0) > 0
        ? 'partially_paid'
        : 'unpaid',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      discountAmount: orderData.discountAmount || 0,
      taxAmount: orderData.taxAmount || 0,
      shippingCharges: orderData.shippingCharges || 0,
      grandTotal: orderData.grandTotal || 0,
      amountPaid: orderData.amountPaid || 0,
      balanceDue: Math.max(0, (orderData.grandTotal || 0) - (orderData.amountPaid || 0)),
      source: orderData.source || 'manual',
      rawMessageText: orderData.rawMessageText,
      deliveryAddress: orderData.deliveryAddress,
      deliveryNotes: orderData.deliveryNotes,
      expectedDeliveryDate: orderData.expectedDeliveryDate,
      internalNotes: orderData.internalNotes,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update customer currentBalance and totalSales
    const balanceIncrease = newOrder.balanceDue;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === newOrder.customerId
          ? {
              ...c,
              currentBalance: c.currentBalance + balanceIncrease,
              totalSales: (c.totalSales || 0) + newOrder.grandTotal,
              lastOrderDate: newOrder.createdAt,
            }
          : c
      )
    );

    // Create Invoice Ledger Entry
    const newLedgerEntry: CustomerLedgerEntry = {
      id: 'led-' + Date.now(),
      businessId: business.id,
      customerId: newOrder.customerId,
      entryType: 'invoice',
      referenceNumber: newOrder.orderNumber,
      description: `Invoice #${newOrder.orderNumber}`,
      debit: newOrder.grandTotal,
      credit: 0,
      runningBalance: 0, // Will be calculated dynamically
      entryDate: newOrder.createdAt,
      createdAt: newOrder.createdAt,
    };

    // If advance was paid upon order creation, also record payment
    const ledgerUpdates = [newLedgerEntry];
    if (newOrder.amountPaid > 0) {
      const paymentEntry: CustomerLedgerEntry = {
        id: 'led-pay-' + Date.now(),
        businessId: business.id,
        customerId: newOrder.customerId,
        entryType: 'payment',
        referenceNumber: 'ADV-' + newOrder.orderNumber,
        description: `Advance received for #${newOrder.orderNumber}`,
        debit: 0,
        credit: newOrder.amountPaid,
        runningBalance: 0,
        entryDate: newOrder.createdAt,
        createdAt: newOrder.createdAt,
      };
      ledgerUpdates.push(paymentEntry);

      const newPayment: Payment = {
        id: 'pay-' + Date.now(),
        businessId: business.id,
        customerId: newOrder.customerId,
        customerName: newOrder.customerBusinessName || newOrder.customerName,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        receiptNumber: `RCP-${100 + payments.length + 1}`,
        amount: newOrder.amountPaid,
        paymentMethod: 'cash',
        paymentDate: newOrder.createdAt,
        notes: `Advance for ${newOrder.orderNumber}`,
        createdAt: newOrder.createdAt,
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    setLedger((prev) => [...ledgerUpdates, ...prev]);

    // Update subscription usage count
    setSubscription((prev) => ({
      ...prev,
      ordersThisMonth: prev.ordersThisMonth + 1,
    }));

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString().split('T')[0] } : o))
    );
  };

  const cancelOrder = (orderId: string, reverseStock: boolean) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    if (reverseStock) {
      ord.items.forEach((item) => {
        adjustStock(item.productId, item.quantity, `Reversed from cancelled Order #${ord.orderNumber}`);
      });
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );

    // Revert customer balance
    setCustomers((prev) =>
      prev.map((c) => (c.id === ord.customerId ? { ...c, currentBalance: Math.max(0, c.currentBalance - ord.balanceDue) } : c))
    );
  };

  const repeatOrder = (orderId: string): Order | null => {
    const existing = orders.find((o) => o.id === orderId);
    if (!existing) return null;

    const res = createOrder({
      customerId: existing.customerId,
      customerName: existing.customerName,
      customerBusinessName: existing.customerBusinessName,
      customerPhone: existing.customerPhone,
      items: existing.items.map((it) => ({ ...it, id: 'item-' + Date.now() + Math.random() })),
      subtotal: existing.subtotal,
      discountAmount: existing.discountAmount,
      taxAmount: existing.taxAmount,
      shippingCharges: existing.shippingCharges,
      grandTotal: existing.grandTotal,
      amountPaid: 0,
      balanceDue: existing.grandTotal,
      source: 'repeat_order',
      deliveryNotes: existing.deliveryNotes,
    });

    return res.order || null;
  };

  // Record Payment
  const recordPayment = ({
    customerId,
    orderId,
    amount,
    paymentMethod,
    referenceNumber,
    notes,
  }: {
    customerId: string;
    orderId?: string;
    amount: number;
    paymentMethod: Payment['paymentMethod'];
    referenceNumber?: string;
    notes?: string;
  }) => {
    const cust = customers.find((c) => c.id === customerId);
    const ord = orderId ? orders.find((o) => o.id === orderId) : undefined;

    const receiptNum = `RCP-${100 + payments.length + 1}`;
    const today = new Date().toISOString().split('T')[0];

    const newPayment: Payment = {
      id: 'pay-' + Date.now(),
      businessId: business.id,
      customerId,
      customerName: cust?.businessName || cust?.name || 'Customer',
      orderId,
      orderNumber: ord?.orderNumber,
      receiptNumber: receiptNum,
      amount,
      paymentMethod,
      referenceNumber,
      paymentDate: today,
      notes,
      createdAt: today,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update customer's current balance
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, currentBalance: Math.max(0, c.currentBalance - amount) } : c))
    );

    // If linked to an order, reduce order balance
    if (ord) {
      const newPaid = ord.amountPaid + amount;
      const newBalance = Math.max(0, ord.grandTotal - newPaid);
      const newStatus = newBalance <= 0 ? 'paid' : 'partially_paid';

      setOrders((prev) =>
        prev.map((o) => (o.id === ord.id ? { ...o, amountPaid: newPaid, balanceDue: newBalance, paymentStatus: newStatus } : o))
      );
    }

    // Record Credit Ledger Entry
    const ledgerEntry: CustomerLedgerEntry = {
      id: 'led-' + Date.now(),
      businessId: business.id,
      customerId,
      entryType: 'payment',
      referenceNumber: receiptNum,
      description: `Payment received (${paymentMethod.toUpperCase()}${referenceNumber ? ` - ${referenceNumber}` : ''})`,
      debit: 0,
      credit: amount,
      runningBalance: Math.max(0, (cust?.currentBalance || 0) - amount),
      entryDate: today,
      createdAt: today,
    };
    setLedger((prev) => [ledgerEntry, ...prev]);
  };

  // Dispatches
  const addDispatch = (dispData: Omit<Dispatch, 'id' | 'businessId' | 'createdAt'>) => {
    const newDisp: Dispatch = {
      ...dispData,
      id: 'disp-' + Date.now(),
      businessId: business.id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDispatches((prev) => [newDisp, ...prev]);

    // Update order status to dispatched
    updateOrderStatus(dispData.orderId, 'dispatched');
  };

  // Reminders
  const toggleReminder = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r)));
  };

  const addReminder = (remData: Omit<FollowUpReminder, 'id' | 'businessId' | 'isCompleted' | 'createdAt'>) => {
    const newRem: FollowUpReminder = {
      ...remData,
      id: 'rem-' + Date.now(),
      businessId: business.id,
      isCompleted: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setReminders((prev) => [newRem, ...prev]);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  // Subscription
  const upgradeSubscription = (tier: 'starter' | 'pro' | 'business') => {
    const prices = { starter: 499, pro: 999, business: 1499 };
    const limits = { starter: 150, pro: 500, business: 2500 };
    setSubscription((prev) => ({
      ...prev,
      tier,
      monthlyPrice: prices[tier],
      maxOrdersPerMonth: limits[tier],
      trialDaysLeft: 30,
      status: 'active',
    }));
  };

  // CSV Exports
  const exportCustomersCSV = () => {
    const headers = ['Name', 'Firm Name', 'Phone', 'WhatsApp', 'GSTIN', 'City', 'Balance Due', 'Credit Limit', 'Total Sales'];
    const rows = customers.map((c) => [
      `"${c.name}"`,
      `"${c.businessName}"`,
      `"${c.phone}"`,
      `"${c.whatsappNumber || ''}"`,
      `"${c.gstin || ''}"`,
      `"${c.city}"`,
      c.currentBalance,
      c.creditLimit,
      c.totalSales || 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OrderSaathi_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOrdersCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Items Count', 'Status', 'Payment Status', 'Grand Total', 'Paid', 'Balance Due'];
    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.createdAt}"`,
      `"${o.customerBusinessName || o.customerName}"`,
      o.items.length,
      `"${o.status}"`,
      `"${o.paymentStatus}"`,
      o.grandTotal,
      o.amountPaid,
      o.balanceDue,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OrderSaathi_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportLedgerCSV = () => {
    const headers = ['Date', 'Customer', 'Type', 'Ref Number', 'Description', 'Debit', 'Credit'];
    const rows = ledger.map((l) => {
      const cust = customers.find((c) => c.id === l.customerId);
      return [
        `"${l.entryDate}"`,
        `"${cust?.businessName || cust?.name || 'Customer'}"`,
        `"${l.entryType}"`,
        `"${l.referenceNumber || ''}"`,
        `"${l.description}"`,
        l.debit,
        l.credit,
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OrderSaathi_Customer_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        business,
        updateBusiness,
        userProfile,
        switchUserRole,
        language,
        setLanguage,
        t,
        activeTab,
        setActiveTab,
        moreSubTab,
        setMoreSubTab,
        deviceFrame,
        setDeviceFrame,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        products,
        addProduct,
        updateProduct,
        adjustStock,
        orders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        repeatOrder,
        payments,
        ledger,
        recordPayment,
        dispatches,
        addDispatch,
        reminders,
        toggleReminder,
        addReminder,
        notifications,
        markNotificationRead,
        subscription,
        upgradeSubscription,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        showOnboardingTour,
        setShowOnboardingTour,
        exportCustomersCSV,
        exportOrdersCSV,
        exportLedgerCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
