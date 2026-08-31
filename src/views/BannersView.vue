<template>
  <div class="banners-page pos-card">
    <div class="page-title-row">
      <h2>{{ langStore.t('bannersTitle') }}</h2>
      <el-button type="primary" :icon="Plus" @click="openAddBannerModal">{{ langStore.t('addBanner') }}</el-button>
    </div>

    <!-- Banner Grid -->
    <div class="banners-grid">
      <div v-for="b in banners" :key="b.id" class="banner-card pos-card">
        <div class="b-image">
          <img :src="b.image" :alt="b.title" />
        </div>
        <div class="b-body">
          <span class="b-title">{{ b.title }}</span>
          <span class="b-placement">{{ langStore.t('positionLbl') }}: {{ b.placement }}</span>
          <div class="b-footer">
            <el-tag :type="b.status === 'Aktif' || b.status === 'Active' ? 'success' : 'info'">{{ langStore.currentLang === 'en' && b.status === 'Aktif' ? 'Active' : b.status }}</el-tag>
            <el-button size="small" type="text" danger>{{ langStore.t('deleteProduct') }}</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const langStore = useLangStore();

const banners = ref([
  { id: 1, title: 'Spanduk Promo Merdeka Diskon 10%', placement: 'Display Depan Resto', status: 'Aktif', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80' },
  { id: 2, title: 'Banner Kopi Susu Gula Aren Buy 1 Get 1', placement: 'Kasir Customer Screen & Tablet', status: 'Aktif', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' }
]);

const openAddBannerModal = () => {
  ElNotification({ title: langStore.t('bannersTitle'), message: langStore.currentLang === 'id' ? 'Upload banner promosi baru dibuka.' : 'Upload new promotional banner modal opened.', type: 'info' });
};
</script>

<style scoped>
.banners-page {
  padding: 20px;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.banners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.banner-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.b-image { height: 160px; overflow: hidden; }
.b-image img { width: 100%; height: 100%; object-fit: cover; }
.b-body { padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.b-title { font-size: 14px; font-weight: bold; color: #262626; }
.b-placement { font-size: 11px; color: #8c8c8c; }
.b-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
</style>
