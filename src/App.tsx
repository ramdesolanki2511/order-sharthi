/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceFrame } from './components/ui/DeviceFrame';
import { Header } from './components/ui/Header';
import { BottomNav } from './components/ui/BottomNav';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { OrdersScreen } from './components/screens/OrdersScreen';
import { CreateOrderModal } from './components/screens/CreateOrderModal';
import { OrderDetailsModal } from './components/screens/OrderDetailsModal';
import { WhatsAppImportModal } from './components/screens/WhatsAppImportModal';
import { CustomersScreen } from './components/screens/CustomersScreen';
import { CustomerProfileModal } from './components/screens/CustomerProfileModal';
import { CustomerFormModal } from './components/screens/CustomerFormModal';
import { ProductsScreen } from './components/screens/ProductsScreen';
import { ProductFormModal } from './components/screens/ProductFormModal';
import { StockAdjustmentModal } from './components/screens/StockAdjustmentModal';
import { PaymentsScreen } from './components/screens/PaymentsScreen';
import { RecordPaymentModal } from './components/screens/RecordPaymentModal';
import { DispatchScreen } from './components/screens/DispatchScreen';
import { DispatchModal } from './components/screens/DispatchModal';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { FollowUpsScreen } from './components/screens/FollowUpsScreen';
import { SubscriptionScreen } from './components/screens/SubscriptionScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { InvoiceModal } from './components/screens/InvoiceModal';
import { OnboardingTourModal } from './components/screens/OnboardingTourModal';
import { Customer, Product } from './types';
import {
  CreditCard,
  Truck,
  BarChart3,
  Calendar,
  Zap,
  Settings as SettingsIcon,
  ChevronRight,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    moreSubTab,
    setMoreSubTab,
    showOnboardingTour,
    setShowOnboardingTour,
    t,
  } = useApp();

  // Modals state
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [invoiceOrderId, setInvoiceOrderId] = useState<string | null>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [stockAdjustmentProduct, setStockAdjustmentProduct] = useState<Product | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInitialCustomerId, setPaymentInitialCustomerId] = useState<string | undefined>();
  const [paymentInitialOrderId, setPaymentInitialOrderId] = useState<string | undefined>();

  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [createOrderCustomerId, setCreateOrderCustomerId] = useState<string | undefined>();

  // More screen sub-menu items
  const moreMenuItems = [
    { id: 'payments', label: t('paymentsTitle'), icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'dispatches', label: t('dispatchTitle'), icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'reports', label: 'Reports & Accounting', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'followups', label: 'Follow-ups & Reminders', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'subscription', label: t('subscriptionTitle'), icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'settings', label: t('settingsTitle'), icon: SettingsIcon, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  return (
    <DeviceFrame>
      <Header />

      <main className="flex-1 overflow-hidden flex flex-col relative">
        {activeTab === 'dashboard' && (
          <DashboardScreen
            onOpenWhatsAppAI={() => setShowWhatsAppModal(true)}
            onOpenCreateOrder={() => {
              setCreateOrderCustomerId(undefined);
              setShowCreateOrderModal(true);
            }}
            onOpenAddCustomer={() => {
              setCustomerToEdit(null);
              setShowCustomerForm(true);
            }}
            onOpenAddProduct={() => {
              setProductToEdit(null);
              setShowProductForm(true);
            }}
            onOpenRecordPayment={() => {
              setPaymentInitialCustomerId(undefined);
              setPaymentInitialOrderId(undefined);
              setShowPaymentModal(true);
            }}
            onSelectOrder={(id) => setSelectedOrderId(id)}
            onSelectCustomer={(id) => setSelectedCustomerId(id)}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersScreen
            onOpenCreateOrder={() => {
              setCreateOrderCustomerId(undefined);
              setShowCreateOrderModal(true);
            }}
            onOpenWhatsAppAI={() => setShowWhatsAppModal(true)}
            onSelectOrder={(id) => setSelectedOrderId(id)}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersScreen
            onOpenAddCustomer={() => {
              setCustomerToEdit(null);
              setShowCustomerForm(true);
            }}
            onSelectCustomer={(id) => setSelectedCustomerId(id)}
          />
        )}

        {activeTab === 'inventory' && (
          <ProductsScreen
            onOpenAddProduct={() => {
              setProductToEdit(null);
              setShowProductForm(true);
            }}
            onOpenAdjustStock={(p) => setStockAdjustmentProduct(p)}
            onEditProduct={(p) => {
              setProductToEdit(p);
              setShowProductForm(true);
            }}
          />
        )}

        {activeTab === 'more' && (
          <div className="flex-1 overflow-y-auto bg-slate-50 p-3.5 space-y-3">
            {/* Horizontal Sub-tab Pill Navigator */}
            <div className="flex space-x-1.5 overflow-x-auto pb-1 -mx-1 px-1 text-xs">
              {moreMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMoreSubTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold shrink-0 text-xs transition flex items-center space-x-1.5 ${
                    moreSubTab === item.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Sub-tab view container */}
            <div className="pt-1">
              {moreSubTab === 'payments' && (
                <PaymentsScreen
                  onOpenRecordPayment={() => {
                    setPaymentInitialCustomerId(undefined);
                    setPaymentInitialOrderId(undefined);
                    setShowPaymentModal(true);
                  }}
                />
              )}

              {moreSubTab === 'dispatches' && (
                <DispatchScreen onOpenAddDispatch={() => setShowDispatchModal(true)} />
              )}

              {moreSubTab === 'reports' && <ReportsScreen />}

              {moreSubTab === 'followups' && <FollowUpsScreen />}

              {moreSubTab === 'subscription' && <SubscriptionScreen />}

              {moreSubTab === 'settings' && <SettingsScreen />}
            </div>
          </div>
        )}
      </main>

      <BottomNav />

      {/* Modals & Dialogs */}
      <WhatsAppImportModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        onOrderCreated={(orderId) => setSelectedOrderId(orderId)}
      />

      <CreateOrderModal
        isOpen={showCreateOrderModal}
        onClose={() => setShowCreateOrderModal(false)}
        onOrderCreated={(orderId) => setSelectedOrderId(orderId)}
        initialCustomerId={createOrderCustomerId}
      />

      <OrderDetailsModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onOpenInvoice={(id) => setInvoiceOrderId(id)}
        onOpenRecordPayment={(ordId, custId) => {
          setPaymentInitialOrderId(ordId);
          setPaymentInitialCustomerId(custId);
          setShowPaymentModal(true);
        }}
      />

      <CustomerProfileModal
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onOpenCreateOrder={(custId) => {
          setCreateOrderCustomerId(custId);
          setShowCreateOrderModal(true);
        }}
        onOpenRecordPayment={(custId) => {
          setPaymentInitialCustomerId(custId);
          setPaymentInitialOrderId(undefined);
          setShowPaymentModal(true);
        }}
        onSelectOrder={(ordId) => setSelectedOrderId(ordId)}
      />

      <CustomerFormModal
        isOpen={showCustomerForm}
        onClose={() => setShowCustomerForm(false)}
        customerToEdit={customerToEdit}
      />

      <ProductFormModal
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        productToEdit={productToEdit}
      />

      <StockAdjustmentModal
        product={stockAdjustmentProduct}
        onClose={() => setStockAdjustmentProduct(null)}
      />

      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        initialCustomerId={paymentInitialCustomerId}
        initialOrderId={paymentInitialOrderId}
      />

      <DispatchModal
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
      />

      <InvoiceModal
        orderId={invoiceOrderId}
        onClose={() => setInvoiceOrderId(null)}
      />

      <OnboardingTourModal
        isOpen={showOnboardingTour}
        onClose={() => setShowOnboardingTour(false)}
      />
    </DeviceFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
