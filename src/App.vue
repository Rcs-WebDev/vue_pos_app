<template>
  <div class="app-container" :class="{ 'login-layout': isLoginRoute }">
    <!-- Sidebar Navigation -->
    <Sidebar v-if="!isLoginRoute" :is-collapsed="isSidebarCollapsed" />

    <!-- Main Content Area -->
    <div class="main-content" :class="{ 'full-width': isLoginRoute }">
      <TopHeader 
        v-if="!isLoginRoute"
        :is-collapsed="isSidebarCollapsed" 
        @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed" 
      />

      <!-- Page Route Container -->
      <div class="page-body" :class="{ 'no-padding': isCashierRoute, 'login-body': isLoginRoute }">
        <router-view />
      </div>
    </div>

    <!-- Modals -->
    <PaymentModal v-if="!isLoginRoute" />
    <ReceiptModal v-if="!isLoginRoute" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import TopHeader from '@/components/TopHeader.vue';
import PaymentModal from '@/components/PaymentModal.vue';
import ReceiptModal from '@/components/ReceiptModal.vue';

const isSidebarCollapsed = ref(false);
const route = useRoute();

const isCashierRoute = computed(() => route.path === '/cashier' || route.path === '/');
const isLoginRoute = computed(() => route.path === '/login');
</script>

<style scoped>
.no-padding {
  padding: 0 !important;
}
.full-width {
  margin-left: 0 !important;
  width: 100vw !important;
}
.login-body {
  padding: 0 !important;
  margin: 0 !important;
}
</style>

