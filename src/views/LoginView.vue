<template>
  <div class="login-wrapper">
    <!-- Top-Right Language Switcher -->
    <div class="login-header-lang">
      <el-dropdown trigger="click" @command="handleLangChange">
        <el-button class="lang-dropdown-btn" size="default" round>
          <span class="lang-flag">{{ langStore.currentLang === 'id' ? '🇮🇩' : '🇬🇧' }}</span>
          <span class="lang-text">{{ langStore.currentLang === 'id' ? 'Bahasa Indonesia' : 'English' }}</span>
          <el-icon class="el-icon--right"><CaretBottom /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="id">🇮🇩 Bahasa Indonesia</el-dropdown-item>
            <el-dropdown-item command="en">🇬🇧 English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="login-card pos-card">
      <div class="brand-section">
        <div class="brand-logo">bien</div>
        <h1 class="brand-title">Bien Point of Sale</h1>
        <p class="brand-subtitle">{{ langStore.t('loginSubtitle') }}</p>
      </div>

      <el-form label-position="top" class="login-form" @submit.prevent="handleLogin">
        <el-form-item :label="langStore.t('roleLabel')">
          <el-select v-model="selectedRole" size="large" style="width: 100%;">
            <el-option label="👨‍💼 Manager (Akses Penuh)" value="Manager" />
            <el-option label="👤 Staff (Akses Terbatas)" value="Staff" />
          </el-select>
        </el-form-item>

        <el-form-item :label="langStore.t('passwordLabel')">
          <el-input 
            v-model="password" 
            type="password" 
            size="large" 
            placeholder="Masukkan kata sandi..." 
            show-password
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-alert
          v-if="errorMessage"
          :title="errorMessage"
          type="error"
          show-icon
          :closable="false"
          class="mb-3"
        />

        <el-button 
          type="primary" 
          size="large" 
          class="login-btn" 
          :loading="isLoading"
          @click="handleLogin"
        >
          {{ langStore.t('loginButton') }}
        </el-button>
      </el-form>

      <!-- Secret Credentials Box (Saved in README.md) -->
      <div class="credentials-box mt-4">
        <div class="cred-header font-bold flex items-center gap-2 text-blue">
          <el-icon><Key /></el-icon>
          <span>{{ langStore.t('secretCredentialsTitle') }}</span>
        </div>
        <div class="cred-body font-12 mt-2">
          <div class="cred-row flex justify-between align-center mb-1">
            <span><strong>Manager:</strong> password <code class="bg-gray">manager123</code></span>
            <el-tag type="danger" size="small">Akses Penuh</el-tag>
          </div>
          <div class="cred-row flex justify-between align-center">
            <span><strong>Staff:</strong> password <code class="bg-gray">staff123</code></span>
            <el-tag type="info" size="small">Akses Terbatas</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import { Lock, Key, CaretBottom } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const langStore = useLangStore();
const router = useRouter();

const selectedRole = ref('Manager');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleLangChange = (lang) => {
  langStore.setLanguage(lang);
};

const handleLogin = () => {
  errorMessage.value = '';
  if (!password.value) {
    errorMessage.value = 'Kata sandi tidak boleh kosong.';
    return;
  }

  isLoading.value = true;
  setTimeout(() => {
    const res = authStore.login(selectedRole.value, password.value);
    isLoading.value = false;

    if (res.success) {
      ElNotification({
        title: langStore.t('loginSuccess'),
        message: `${langStore.t('loginSuccessMsg')} ${res.user.name} (${res.user.role})`,
        type: 'success'
      });
      router.push('/cashier');
    } else {
      errorMessage.value = res.message;
    }
  }, 400);
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #003b8e 100%);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
}

.login-header-lang {
  position: absolute;
  top: 24px;
  right: 24px;
}

.lang-dropdown-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.lang-dropdown-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 36px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.brand-section {
  text-align: center;
  margin-bottom: 28px;
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0088ff 0%, #0052d9 100%);
  color: white;
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 136, 255, 0.4);
}

.brand-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.brand-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
  font-weight: 700;
  font-size: 15px;
  height: 44px;
  border-radius: 8px;
  background: linear-gradient(90deg, #0088ff 0%, #0052d9 100%);
  border: none;
}

.credentials-box {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
}

.bg-gray {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: #1e293b;
}

.mt-4 { margin-top: 16px; }
.mb-3 { margin-bottom: 12px; }
.text-blue { color: #0088ff; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.font-12 { font-size: 12px; }
.font-bold { font-weight: bold; }
</style>
