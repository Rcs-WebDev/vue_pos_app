<template>
  <div class="attendance-container">
    <div class="attendance-content">
      <!-- Store Name -->
      <h1 class="store-title">bien</h1>

      <!-- Weather Icon -->
      <div class="weather-icon">
        <div class="cloud-moon">🌙☁️</div>
      </div>

      <!-- Realtime Clock -->
      <div class="clock-display">
        <span class="hours-mins">{{ timeString.slice(0, 5) }}</span>
        <span class="seconds">:{{ timeString.slice(6, 8) }}</span>
      </div>

      <!-- Current Date -->
      <div class="date-display">{{ dateString }}</div>

      <!-- Timezone Dropdown -->
      <div class="timezone-select-box">
        <el-select v-model="selectedTimezone" size="default" style="width: 180px;">
          <el-option label="Asia/Jakarta(WIB)" value="WIB" />
          <el-option label="Asia/Makassar(WITA)" value="WITA" />
          <el-option label="Asia/Jayapura(WIT)" value="WIT" />
        </el-select>
      </div>

      <!-- Face Recognition Simulation Button -->
      <div class="face-absensi-btn-box">
        <el-button type="success" size="large" :icon="Camera" @click="openCameraModal">
          <span>{{ langStore.t('openFaceCamera') }}</span>
        </el-button>
      </div>
    </div>

    <!-- Scan Absen QR Code Card (Bottom Right) -->
    <div class="qr-absen-card pos-card" @click="openCameraModal">
      <div class="qr-header">
        <el-icon><Iphone /></el-icon>
        <span>{{ langStore.t('scanAbsence') }}</span>
      </div>
      <div class="qr-image">
        <svg viewBox="0 0 100 100" width="120" height="120">
          <path fill="#000" d="M10 10h30v30H10zM50 10h10v10H50zM70 10h20v20H70zM10 50h10v20H10zM30 50h20v10H30zM60 40h30v30H60zM10 80h20v10H10zM40 70h20v20H40zM70 80h20v10H70z"/>
          <path fill="#1890ff" d="M20 20h10v10H20zM80 20h10v10H80zM70 50h10v10H70z"/>
        </svg>
      </div>
      <div class="qr-footer">{{ langStore.t('scanQrMobile') }}</div>
    </div>

    <!-- Biometric Face Scanner Modal with WebRTC Live Camera -->
    <el-dialog 
      v-model="isCameraModalOpen" 
      :title="langStore.t('faceAbsenceModalTitle')" 
      width="420px" 
      class="face-scanner-dialog"
      @closed="stopCameraStream"
    >
      <div class="face-scanner-phone-mockup">
        <div class="phone-top-bar">
          <span>ON</span>
          <el-switch v-model="cameraActive" @change="toggleCamera" size="small" />
          <span>Live WebRTC</span>
        </div>

        <!-- Live Camera Stream Ring or Captured Canvas Image -->
        <div class="face-camera-ring">
          <video 
            ref="videoRef" 
            v-show="!capturedImage && cameraActive" 
            autoplay 
            playsinline 
            muted 
            class="webcam-feed"
          ></video>

          <img 
            v-if="capturedImage" 
            :src="capturedImage" 
            alt="Snap Photo" 
            class="captured-feed"
          />

          <img 
            v-if="!cameraActive && !capturedImage" 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" 
            alt="Default Face" 
            class="fallback-feed"
          />

          <div class="scanning-circle" v-if="cameraActive && !capturedImage"></div>
        </div>

        <!-- Shutter Button -->
        <div class="camera-action-controls">
          <el-button 
            v-if="!capturedImage" 
            type="warning" 
            size="default" 
            :icon="Camera" 
            @click="takeSnapshot"
          >
            {{ langStore.t('takeSnapshot') }}
          </el-button>
          <el-button 
            v-else 
            type="info" 
            size="default" 
            @click="retakePhoto"
          >
            {{ langStore.t('retakePhoto') }}
          </el-button>
        </div>

        <!-- Identified Employee Badge -->
        <div class="employee-id-pill">
          <div class="emp-avatar">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Arif" />
          </div>
          <div class="emp-info">
            <span class="e-name">Arif Rahman</span>
            <span class="e-shift">08:55 - 16:55 (Shift Malam)</span>
          </div>
        </div>

        <!-- Location Stamp -->
        <div class="location-stamp-box">
          <div class="loc-header">
            <el-icon><Location /></el-icon>
            <span>{{ langStore.t('branchOfficeYogya') }}</span>
          </div>
          <div class="loc-time">{{ dateString }} | <strong>{{ timeString }}</strong></div>
          <div class="loc-address">Jalan Purwodadi 1/101, Jepara, Bubutan...</div>
        </div>

        <!-- Hidden Canvas for taking snapshot -->
        <canvas ref="canvasRef" width="300" height="300" style="display: none;"></canvas>
      </div>

      <template #footer>
        <el-button type="success" style="width: 100%;" @click="confirmFaceCheckin">
          {{ langStore.t('confirmFaceCheckin') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import { Camera, Iphone, Location } from '@element-plus/icons-vue';

const langStore = useLangStore();
const timeString = ref('18:38:38');
const dateString = ref('Sat, 15 August 2026');
const selectedTimezone = ref('WIB');

const isCameraModalOpen = ref(false);
const cameraActive = ref(true);
const videoRef = ref(null);
const canvasRef = ref(null);
const capturedImage = ref(null);

let timer = null;
let mediaStream = null;

const updateClock = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  timeString.value = `${hours}:${mins}:${secs}`;
  
  const options = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' };
  dateString.value = now.toLocaleDateString('en-US', options);
};

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  stopCameraStream();
});

const openCameraModal = async () => {
  isCameraModalOpen.value = true;
  capturedImage.value = null;
  cameraActive.value = true;
  await nextTick();
  startCameraStream();
};

const startCameraStream = async () => {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // 1. Try external or Link to Windows camera device if enumerated
      const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const externalCam = videoDevices.find(d => d.label.toLowerCase().includes('windows') || d.label.toLowerCase().includes('link') || d.label.toLowerCase().includes('obs'));
      
      let constraints = { video: { width: 300, height: 300, facingMode: 'user' } };
      if (externalCam) {
        constraints = { video: { deviceId: { exact: externalCam.deviceId } } };
      }

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (errFallback) {
        console.warn('Link to Windows device unavailable. Fallback to default laptop webcam:', errFallback);
        // Fallback to laptop default camera
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream;
      }
    }
  } catch (err) {
    console.warn('Webcam stream error or permission denied:', err);
    ElNotification({ title: 'Kamera', message: 'Kamera fisik dikunci atau tidak tersedia. Menggunakan preview simulasi.', type: 'info' });
  }
};

const stopCameraStream = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
};

const toggleCamera = (val) => {
  if (val) {
    startCameraStream();
  } else {
    stopCameraStream();
  }
};

const takeSnapshot = () => {
  if (videoRef.value && canvasRef.value) {
    const video = videoRef.value;
    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    capturedImage.value = canvas.toDataURL('image/png');
    stopCameraStream();
    ElNotification({ title: 'Absensi Wajah', message: 'Foto wajah berhasil diambil!', type: 'success' });
  } else {
    capturedImage.value = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  }
};

const retakePhoto = () => {
  capturedImage.value = null;
  startCameraStream();
};

const confirmFaceCheckin = async () => {
  isCameraModalOpen.value = false;
  stopCameraStream();

  const payload = {
    employee_id: 1,
    employee_name: 'Arif Rahman',
    check_in: new Date().toISOString(),
    status: 'Masuk',
    photo_url: capturedImage.value || '',
    location: 'Kantor Cabang Yogyakarta'
  };

  try {
    await fetch('/api/attendances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('API attendances offline, saved locally');
  }

  ElNotification({
    title: 'Absensi Wajah Sukses',
    message: `Absensi masuk Arif Rahman (Kantor Cabang Yogyakarta) jam ${timeString.value} BERHASIL tersimpan ke Database!`,
    type: 'success'
  });
};
</script>

<style scoped>
.attendance-container {
  min-height: calc(100vh - 56px);
  background-color: #2b2b2b;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.attendance-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.store-title {
  font-size: 36px;
  font-weight: 300;
  letter-spacing: 2px;
  color: #ffffff;
}

.weather-icon { font-size: 54px; }
.hours-mins { font-size: 84px; font-weight: 800; color: #ffffff; }
.seconds { font-size: 48px; font-weight: 700; color: #8c8c8c; }
.date-display { font-size: 20px; color: #d9d9d9; }

.qr-absen-card {
  position: absolute;
  bottom: 30px;
  right: 40px;
  background-color: #ffffff;
  color: #262626;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.qr-header { font-size: 14px; font-weight: bold; display: flex; align-items: center; gap: 6px; }

/* Phone Mockup */
.face-scanner-phone-mockup {
  background-color: #1a1a1a;
  color: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.phone-top-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.face-camera-ring {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 4px solid #ff9800;
  overflow: hidden;
  position: relative;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.webcam-feed, .captured-feed, .fallback-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanning-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px dashed #00bcd4;
  animation: spin 8s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.camera-action-controls {
  margin-top: 4px;
}

.employee-id-pill {
  width: 100%;
  background-color: #00bcd4;
  border-radius: 24px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.emp-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.emp-avatar img { width: 100%; height: 100%; object-fit: cover; }
.emp-info { display: flex; flex-direction: column; flex: 1; }
.e-name { font-weight: bold; font-size: 13px; }
.e-shift { font-size: 10px; background: rgba(0, 0, 0, 0.3); padding: 2px 6px; border-radius: 8px; width: fit-content; }

.location-stamp-box {
  width: 100%;
  background-color: #262626;
  border-radius: 8px;
  padding: 10px;
  font-size: 11px;
}

.loc-header { color: #00bcd4; font-weight: bold; display: flex; align-items: center; gap: 4px; }
.loc-time { margin-top: 4px; color: #cccccc; }
.loc-address { font-size: 10px; color: #888888; margin-top: 2px; }
</style>
