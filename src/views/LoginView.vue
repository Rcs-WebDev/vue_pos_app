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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import { Lock, CaretBottom } from '@element-plus/icons-vue';

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
      langStore.setLanguage('en');
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

.mb-3 { margin-bottom: 12px; }
</style>
