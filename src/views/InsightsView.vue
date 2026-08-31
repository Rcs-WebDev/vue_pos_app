<template>
  <div class="insights-page pos-card">
    <div class="page-title-row">
      <div class="title-box">
        <el-icon class="ai-icon"><Cpu /></el-icon>
        <h2>{{ langStore.t('insightsTitle') }}</h2>
      </div>
      <el-tag type="success" size="large">AI Engine: ONLINE</el-tag>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 1. Rekomendasi Penjualan (Cross-selling & Upselling AI) -->
      <el-tab-pane label="Merekomendasikan & Upselling AI" name="recommendations">
        <div class="ai-cards-grid">
          <div class="ai-card pos-card border-blue">
            <div class="ai-tag">💡 Upselling Smart Combo</div>
            <span class="ai-title">Paket Baso Aci + Kopi Susu Gula Aren</span>
            <p class="ai-desc">Pelanggan yang memesan Baso Aci Kuah Pedas memilik peluang 82% untuk membeli Kopi Susu Gula Aren. Tampilkan pop-up kombo otomatis di layar kasir.</p>
            <el-button type="primary" size="small" @click="applyAiRule">Aktifkan Rekomendasi Kasir</el-button>
          </div>

          <div class="ai-card pos-card border-green">
            <div class="ai-tag">🔥 Diskon Jam Sepi (Happy Hour)</div>
            <span class="ai-title">Diskon 15% Jam 14:00 - 16:00</span>
            <p class="ai-desc">Jam 14:00 - 16:00 mengalami penurunan pengunjung sebesar 35%. Terapkan diskon otomatis untuk meningkatkan penjualan jam sepi.</p>
            <el-button type="success" size="small" @click="applyAiRule">Aktifkan Promo Happy Hour</el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- 2. Prediksi Tren Stok (Demand Forecasting) -->
      <el-tab-pane label="Memprediksi Tren Stok & Demand" name="predictive">
        <div class="forecast-section p-4">
          <h3>Prediksi Kebutuhan Bahan Baku Minggu Depan</h3>
          <el-table :data="forecastList" style="width: 100%" stripe class="mt-4">
            <el-table-column prop="item" label="Nama Bahan Baku" min-width="160" font-weight="bold" />
            <el-table-column prop="currentStock" label="Stok Saat Ini" width="140" />
            <el-table-column prop="predictedNeed" label="Estimasi Kebutuhan" width="160" />
            <el-table-column prop="recommendation" label="Saran AI Purchasing" min-width="200">
              <template #default="scope">
                <el-tag type="warning">{{ scope.row.recommendation }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 3. Analisis Performa -->
      <el-tab-pane label="Menganalisis & Melacak Performa" name="analytics">
        <div class="perf-metrics-grid">
          <div class="p-card">
            <span class="lbl">Kecepatan Rata-rata Transaksi Kasir</span>
            <span class="val">42 Detik / Transaksi</span>
          </div>
          <div class="p-card">
            <span class="lbl">Tingkat Retensi Pelanggan (Repeat Order)</span>
            <span class="val">68% Pelanggan Kembali</span>
          </div>
          <div class="p-card">
            <span class="lbl">Margin Keuntungan Bersih Resto</span>
            <span class="val text-green">53.4% Profit Margin</span>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import { Cpu } from '@element-plus/icons-vue';

const route = useRoute();
const langStore = useLangStore();
const activeTab = ref('recommendations');

const syncTab = () => {
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  } else if (route.path.includes('predictive')) {
    activeTab.value = 'predictive';
  } else if (route.path.includes('analytics')) {
    activeTab.value = 'analytics';
  } else {
    activeTab.value = 'recommendations';
  }
};

onMounted(syncTab);
watch(() => [route.path, route.query.tab], syncTab);

const forecastList = ref([
  { item: 'Tepung Tapioka Baso Aci', currentStock: '120 Kg', predictedNeed: '180 Kg', recommendation: '+ Restok 60 Kg sebelum Jumat' },
  { item: 'Biji Kopi Espresso Blend', currentStock: '5 Kg', predictedNeed: '18 Kg', recommendation: '⚠️ Stok Kritis! Restok 15 Kg Hari Ini' },
  { item: 'Daging Ayam Fillet', currentStock: '40 Kg', predictedNeed: '45 Kg', recommendation: 'Stok Cukup (Order Rutin Senin)' }
]);

const applyAiRule = () => {
  ElNotification({ title: 'AI Recommendation Engine', message: 'Aturan rekomendasi pintar AI berhasil diterapkan ke sistem kasir!', type: 'success' });
};
</script>

<style scoped>
.insights-page {
  padding: 20px;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-icon { font-size: 28px; color: #1890ff; }

.ai-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.ai-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-card.border-blue { border-left: 4px solid #1890ff; }
.ai-card.border-green { border-left: 4px solid #52c41a; }

.ai-tag { font-size: 11px; font-weight: bold; color: #1890ff; }
.ai-title { font-size: 15px; font-weight: 700; color: #262626; }
.ai-desc { font-size: 12px; color: #595959; margin-bottom: 8px; }

.perf-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.p-card {
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.p-card .lbl { font-size: 12px; color: #8c8c8c; }
.p-card .val { font-size: 20px; font-weight: 800; color: #262626; margin-top: 4px; }
.text-green { color: #52c41a; }
.p-4 { padding: 16px; }
.mt-4 { margin-top: 16px; }
</style>
