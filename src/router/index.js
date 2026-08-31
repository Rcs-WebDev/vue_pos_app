import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import CashierView from '@/views/CashierView.vue';
import ProductsView from '@/views/ProductsView.vue';
import InventoryView from '@/views/InventoryView.vue';
import MarketingView from '@/views/MarketingView.vue';
import CustomersView from '@/views/CustomersView.vue';
import TransactionsView from '@/views/TransactionsView.vue';
import OnlineSalesView from '@/views/OnlineSalesView.vue';
import EmployeesView from '@/views/EmployeesView.vue';
import AttendanceView from '@/views/AttendanceView.vue';
import CashInOutView from '@/views/CashInOutView.vue';
import ReportsView from '@/views/ReportsView.vue';
import SettingsView from '@/views/SettingsView.vue';
import BarcodeLabelView from '@/views/BarcodeLabelView.vue';
import DepositView from '@/views/DepositView.vue';
import FranchiseView from '@/views/FranchiseView.vue';
import BannersView from '@/views/BannersView.vue';
import InsightsView from '@/views/InsightsView.vue';
import PaymentMethodsView from '@/views/PaymentMethodsView.vue';
import OnlineStoreSettingsView from '@/views/OnlineStoreSettingsView.vue';
import FundingView from '@/views/FundingView.vue';
import { useAuthStore } from '@/stores/authStore';

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/', redirect: '/cashier' },
  { path: '/cashier', name: 'Cashier', component: CashierView },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/cash-flow', name: 'CashInOut', component: CashInOutView },
  { path: '/attendance', name: 'Attendance', component: AttendanceView },
  
  // Katalog Produk
  { path: '/products', name: 'Products', component: ProductsView },
  { path: '/products/special-types', name: 'SpecialTypes', component: DepositView },
  { path: '/products/print-barcode', name: 'PrintBarcode', component: BarcodeLabelView },
  { path: '/products/print-label', name: 'PrintLabel', component: BarcodeLabelView },
  { path: '/products/deposit', name: 'Deposit', component: DepositView },
  { path: '/products/raw-materials', name: 'RawMaterials', component: InventoryView },

  // Inventori
  { path: '/inventory', name: 'Inventory', component: InventoryView },
  { path: '/inventory/supply-chain', name: 'SupplyChain', component: InventoryView },
  { path: '/inventory/opname', name: 'Opname', component: InventoryView },
  { path: '/inventory/franchise', name: 'Franchise', component: FranchiseView },

  // Marketing
  { path: '/marketing', name: 'Marketing', component: MarketingView },
  { path: '/marketing/banners', name: 'Banners', component: BannersView },
  { path: '/marketing/satisfaction', name: 'Satisfaction', component: CustomersView },

  // Customers & Suppliers
  { path: '/customers', name: 'Customers', component: CustomersView },
  { path: '/suppliers', name: 'Suppliers', component: CustomersView },
  { path: '/receivables', name: 'Receivables', component: CustomersView },

  // Employees & Hak Akses
  { path: '/employees', name: 'Employees', component: EmployeesView },
  { path: '/employees/roles', name: 'EmployeeRoles', component: EmployeesView },
  { path: '/employees/commission', name: 'EmployeeCommission', component: EmployeesView },
  { path: '/employees/logs', name: 'EmployeeLogs', component: EmployeesView },

  // Insights & AI
  { path: '/insights/recommendations', name: 'AiRecommendations', component: InsightsView },
  { path: '/insights/predictive', name: 'AiPredictive', component: InsightsView },
  { path: '/insights/analytics', name: 'AiAnalytics', component: InsightsView },

  // Reports
  { path: '/reports', name: 'Reports', component: ReportsView },
  { path: '/transactions', name: 'Transactions', component: TransactionsView },
  { path: '/reports/financial', name: 'FinancialReports', component: ReportsView },

  // Lainnya & Gateways
  { path: '/online-sales', name: 'OnlineSales', component: OnlineSalesView },
  { path: '/online-sales/settings', name: 'OnlineStoreSettings', component: OnlineStoreSettingsView },
  { path: '/payment-methods', name: 'PaymentMethods', component: PaymentMethodsView },
  { path: '/gotyme', name: 'GoTyme', component: FundingView },
  { path: '/partnerships', name: 'Partnerships', component: FranchiseView },
  
  // Settings & Help
  { path: '/settings', name: 'Settings', component: SettingsView },
  { path: '/help', name: 'Help', component: DashboardView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.path !== '/login' && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/cashier');
  } else {
    next();
  }
});

export default router;

