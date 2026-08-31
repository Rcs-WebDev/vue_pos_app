<template>
  <div class="employees-master-page pos-card">
    <div class="page-title-row">
      <h2>{{ langStore.t('employeesTitle') }}</h2>
      <el-button type="primary" :icon="Plus" @click="openAddModal">{{ langStore.t('addEmployee') }}</el-button>
    </div>

    <!-- Main Navigation Tabs -->
    <el-tabs v-model="activeTab" class="emp-tabs">
      <!-- 1. Daftar Pegawai -->
      <el-tab-pane :label="langStore.t('employees')" name="staff">
        <el-table :data="staffList" style="width: 100%" stripe size="default">
          <el-table-column prop="name" :label="langStore.t('employeeNameCol')" min-width="160" font-weight="bold" />
          <el-table-column prop="role" :label="langStore.t('roleCol')" width="160">
            <template #default="scope">
              <el-tag :type="getRoleTagType(scope.row.role)">{{ scope.row.role }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="Email" width="180" />
          <el-table-column prop="phone" :label="langStore.t('phoneCol')" width="140" />
          <el-table-column prop="branch" :label="langStore.currentLang === 'en' ? 'Branch' : 'Cabang'" width="150" />
          <el-table-column prop="status" :label="langStore.t('statusCol')" width="100">
            <template #default="scope">
              <el-tag type="success">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="langStore.t('actionCol')" width="120" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" plain @click="openEditEmpModal(scope.row)">Edit</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 2. Hak Akses Karyawan -->
      <el-tab-pane :label="langStore.t('employeePermissions')" name="permissions">
        <div class="permission-roles-section">
          <div v-for="roleGroup in roleGroups" :key="roleGroup.roleName" class="role-group-card">
            <div class="role-header">
              <div class="r-title">{{ roleGroup.roleName }}</div>
              <el-button type="text" :icon="Edit" @click="editRoleGroup(roleGroup)">Edit Role</el-button>
            </div>
            <div class="role-members-list">
              <div v-for="member in roleGroup.members" :key="member.id" class="member-permission-row">
                <div class="m-info">
                  <el-avatar :size="32" class="avatar-bg">{{ member.name[0] }}</el-avatar>
                  <span class="m-name">{{ member.name }}</span>
                </div>

                <div class="perm-switches">
                  <div class="switch-item">
                    <span class="s-label">Pelayan POS</span>
                    <el-switch v-model="member.perms.pos" size="small" />
                  </div>
                  <div class="switch-item">
                    <span class="s-label">Kasir</span>
                    <el-switch v-model="member.perms.cashier" size="small" />
                  </div>
                  <div class="switch-item">
                    <span class="s-label">Manager</span>
                    <el-switch v-model="member.perms.manager" size="small" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 3. Pelacakan Komisi Penjualan -->
      <el-tab-pane :label="langStore.t('salesCommission')" name="commission">
        <div class="commission-wrapper">
          <div class="comm-filter-bar">
            <el-date-picker v-model="commDateRange" type="daterange" range-separator="s/d" start-placeholder="1 Aug 2026" end-placeholder="31 Aug 2026" size="default" />
            <div class="export-btns">
              <el-button size="default" :icon="Document">Export CSV</el-button>
              <el-button type="primary" size="default" :icon="Printer">Export PDF</el-button>
            </div>
          </div>

          <div class="comm-summary-row">
            <div class="c-box blue">
              <span class="lbl">Total Komisi Terakumulasi</span>
              <span class="val">IDR 35.000.000</span>
            </div>
            <div class="c-box green">
              <span class="lbl">Target Omzet Penjualan Insentif</span>
              <span class="val">IDR 3.830.000</span>
            </div>
          </div>

          <el-table :data="commissionLogs" style="width: 100%" stripe class="mt-4">
            <el-table-column prop="date" label="Tanggal" width="140" />
            <el-table-column prop="staff" label="Petugas Karyawan" min-width="160" font-weight="bold" />
            <el-table-column prop="sales" label="Pencapaian Penjualan" width="160" align="right">
              <template #default="scope">
                <span>{{ formatRp(scope.row.sales) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="commission" label="Komisi (Rp)" width="140" align="right">
              <template #default="scope">
                <span class="text-green font-bold">{{ formatRp(scope.row.commission) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="bonus" label="Bonus Insentif" width="140" align="right">
              <template #default="scope">
                <span>{{ formatRp(scope.row.bonus) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 4. Log Aktivitas Karyawan -->
      <el-tab-pane :label="langStore.t('employeeLogs')" name="logs">
        <div class="activity-logs-wrapper">
          <div class="filter-log-header">
            <el-input v-model="logSearch" placeholder="Cari Log Transaksi / Staff / Pembatalan" style="width: 320px;" :prefix-icon="Search" />
          </div>

          <el-table :data="activityLogs" style="width: 100%" stripe>
            <el-table-column prop="txNo" label="No. Transaksi" width="180" font-weight="bold" />
            <el-table-column prop="datetime" label="Tanggal & Jam" width="160" />
            <el-table-column prop="staff" label="Pengatur / Kasir" width="140" />
            <el-table-column prop="actionType" label="Jenis Aktivitas" min-width="180">
              <template #default="scope">
                <el-tag :type="getLogTagType(scope.row.actionType)">{{ scope.row.actionType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="Nominal" width="130" align="right">
              <template #default="scope">
                <span>{{ formatRp(scope.row.amount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="Status Audit" width="120">
              <template #default="scope">
                <el-tag type="info">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 5. JADWAL & SHIFT KARYAWAN -->
      <el-tab-pane label="Jadwal & Shift Karyawan" name="schedule">
        <div class="shift-schedule-wrapper">
          <div class="roster-section-header">
            <div>
              <h3>Peta Jadwal Kerja Mingguan & Rotasi Shift Otomatis</h3>
              <p class="text-sub">Penugasan shift kerja karyawan dengan fitur rotasi berkala otomatis.</p>
            </div>
            <div class="header-btns flex gap-2">
              <el-button type="warning" :icon="Refresh" @click="runAutoShiftRotation">Rotasi Shift Otomatis</el-button>
              <el-button type="primary" :icon="Calendar" @click="openRosterModal">Atur Penugasan Shift</el-button>
            </div>
          </div>

          <el-table :data="weeklyRoster" style="width: 100%" stripe class="mt-2 border-box">
            <el-table-column prop="staffName" label="Nama Karyawan" width="150" font-weight="bold" />
            <el-table-column prop="role" label="Jabatan" width="130" />
            <el-table-column label="Senin" width="110" align="center">
              <template #default="scope"><el-tag :type="getShiftTagType(scope.row.mon)">{{ scope.row.mon }}</el-tag></template>
            </el-table-column>
            <el-table-column label="Selasa" width="110" align="center">
              <template #default="scope"><el-tag :type="getShiftTagType(scope.row.tue)">{{ scope.row.tue }}</el-tag></template>
            </el-table-column>
            <el-table-column label="Rabu" width="110" align="center">
              <template #default="scope"><el-tag :type="getShiftTagType(scope.row.wed)">{{ scope.row.wed }}</el-tag></template>
            </el-table-column>
            <el-table-column label="Kamis" width="110" align="center">
              <template #default="scope"><el-tag :type="getShiftTagType(scope.row.thu)">{{ scope.row.thu }}</el-tag></template>
            </el-table-column>
            <el-table-column label="Jumat" width="110" align="center">
              <template #default="scope"><el-tag :type="getShiftTagType(scope.row.fri)">{{ scope.row.fri }}</el-tag></template>
            </el-table-column>
            <el-table-column label="Sabtu" width="110" align="center">
              <template #default="scope"><el-tag :type="getShiftTagType(scope.row.sat)">{{ scope.row.sat }}</el-tag></template>
            </el-table-column>
            <el-table-column label="Minggu" width="110" align="center">
              <template #default="scope"><el-tag :type="getShiftTagType(scope.row.sun)">{{ scope.row.sun }}</el-tag></template>
            </el-table-column>
          </el-table>

          <div class="roster-section-header mt-5">
            <div>
              <h3>Master Shift Timing Penjadwalan</h3>
              <p class="text-sub">Definisi jam operasional kerja (Mulai & Selesai) untuk mesin absensi.</p>
            </div>
            <el-button type="success" :icon="Plus" @click="isShiftModalOpen = true">+ Tambah Shift Timing</el-button>
          </div>

          <el-table :data="shiftTimings" style="width: 100%" stripe class="mt-2">
            <el-table-column prop="name" label="Nama Shift" min-width="140" font-weight="bold" />
            <el-table-column prop="startTime" label="Jam Mulai" width="120" />
            <el-table-column prop="endTime" label="Jam Selesai" width="120" />
            <el-table-column prop="tolerance" label="Toleransi Keterlambatan" width="180" />
            <el-table-column prop="badge" label="Status Master" width="120">
              <template #default="scope">
                <el-tag type="danger" effect="dark" round>{{ scope.row.badge }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Modal Edit Karyawan -->
    <el-dialog v-model="isEditEmpOpen" title="Edit Data Karyawan" width="500px">
      <el-form :model="editingEmp" label-width="140px" v-if="editingEmp">
        <el-form-item label="Nama Karyawan">
          <el-input v-model="editingEmp.name" />
        </el-form-item>
        <el-form-item label="Role / Jabatan">
          <el-select v-model="editingEmp.role" style="width: 100%;">
            <el-option label="Supervisor / Manager" value="Supervisor / Manager" />
            <el-option label="POS Staff" value="POS Staff" />
            <el-option label="POS Staff Senior" value="POS Staff Senior" />
            <el-option label="Dapur Resto" value="Dapur Resto" />
          </el-select>
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="editingEmp.email" />
        </el-form-item>
        <el-form-item label="No. Handphone">
          <el-input v-model="editingEmp.phone" />
        </el-form-item>
        <el-form-item label="Cabang Outlet">
          <el-input v-model="editingEmp.branch" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="editingEmp.status" style="width: 100%;">
            <el-option label="Aktif" value="Aktif" />
            <el-option label="Cuti" value="Cuti" />
            <el-option label="Nonaktif" value="Nonaktif" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isEditEmpOpen = false">Batal</el-button>
        <el-button type="primary" @click="saveEditEmp">Simpan Perubahan</el-button>
      </template>
    </el-dialog>

    <!-- Modal Tambah Shift Timing -->
    <el-dialog v-model="isShiftModalOpen" title="Tambah Shift Timing" width="460px">
      <el-form :model="newShift" label-width="140px">
        <el-form-item label="Nama Shift"><el-input v-model="newShift.name" placeholder="Shift Pagi" /></el-form-item>
        <el-form-item label="Jam Mulai"><el-input v-model="newShift.startTime" placeholder="07:00:00" /></el-form-item>
        <el-form-item label="Jam Selesai"><el-input v-model="newShift.endTime" placeholder="15:00:00" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isShiftModalOpen = false">Batal</el-button>
        <el-button type="success" @click="saveShift">Simpan Shift</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import { Plus, Edit, Document, Printer, Search, Calendar, Refresh } from '@element-plus/icons-vue';

const route = useRoute();
const langStore = useLangStore();
const activeTab = ref('staff');

const syncTab = () => {
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  } else if (route.path.includes('roles')) {
    activeTab.value = 'permissions';
  } else if (route.path.includes('commission')) {
    activeTab.value = 'commission';
  } else if (route.path.includes('logs')) {
    activeTab.value = 'logs';
  } else if (route.path.includes('schedule')) {
    activeTab.value = 'schedule';
  } else {
    activeTab.value = 'staff';
  }
};

onMounted(syncTab);
watch(() => [route.path, route.query.tab], syncTab);
const commDateRange = ref('');
const logSearch = ref('');
const isShiftModalOpen = ref(false);
const isEditEmpOpen = ref(false);
const editingEmp = ref(null);

const newShift = reactive({
  name: 'Shift Pagi Resto',
  startTime: '07:00:00',
  endTime: '15:00:00'
});

const staffList = ref([
  { id: 1, name: 'bien', role: 'Supervisor / Manager', email: 'bien@pos-store.id', phone: '081234567890', branch: 'Kantor Cabang Yogyakarta', status: 'Aktif' },
  { id: 2, name: 'Riky', role: 'POS Staff', email: 'riky@pos-store.id', phone: '081298765432', branch: 'Kantor Cabang Yogyakarta', status: 'Aktif' },
  { id: 3, name: 'Bambang', role: 'POS Staff', email: 'bambang@pos-store.id', phone: '081311223344', branch: 'Outlet Utama', status: 'Aktif' },
  { id: 4, name: 'Rina', role: 'POS Staff Senior', email: 'rina@pos-store.id', phone: '081344556677', branch: 'Outlet Utama', status: 'Aktif' }
]);

const fetchEmployeesFromDB = async () => {
  try {
    const res = await fetch('/api/employees');
    if (res.ok) {
      const data = await res.json();
      if (data && data.length) staffList.value = data;
    }
  } catch (err) {
    console.log('Using default staff list');
  }
};

onMounted(() => {
  fetchEmployeesFromDB();
});

const weeklyRoster = ref([
  { staffName: 'bien', role: 'Manager', mon: 'Shift 1', tue: 'Shift 1', wed: 'Shift 1', thu: 'Shift 1', fri: 'Shift 1', sat: 'OFF', sun: 'OFF' },
  { staffName: 'Riky', role: 'Kasir', mon: 'Shift 1', tue: 'Shift 1', wed: 'Shift 2', thu: 'Shift 2', fri: 'OFF', sat: 'Shift 3', sun: 'Shift 3' },
  { staffName: 'Bambang', role: 'Kasir', mon: 'Shift 2', tue: 'Shift 2', wed: 'OFF', thu: 'Shift 1', fri: 'Shift 1', sat: 'Shift 1', sun: 'Shift 2' },
  { staffName: 'Rina', role: 'Dapur', mon: 'Shift 3', tue: 'OFF', wed: 'Shift 3', thu: 'Shift 3', fri: 'Shift 2', sat: 'Shift 2', sun: 'Shift 1' }
]);

const shiftTimings = ref([
  { name: 'Shift 1 (Pagi)', startTime: '07:00:00', endTime: '15:00:00', tolerance: '15 Menit', badge: 'PROMO' },
  { name: 'Shift 2 (Siang)', startTime: '13:00:00', endTime: '21:00:00', tolerance: '15 Menit', badge: 'PROMO' },
  { name: 'Shift 3 (Malam)', startTime: '18:00:00', endTime: '02:00:00', tolerance: '15 Menit', badge: 'ACTIVE' }
]);

const roleGroups = ref([
  {
    roleName: 'Supervisor',
    members: [
      { id: 1, name: 'Heri Subagja', perms: { pos: true, cashier: true, manager: true } },
      { id: 2, name: 'Riky L.', perms: { pos: true, cashier: true, manager: true } }
    ]
  },
  {
    roleName: 'POS Staff',
    members: [
      { id: 3, name: 'Riky', perms: { pos: true, cashier: true, manager: false } },
      { id: 4, name: 'Bambang', perms: { pos: true, cashier: true, manager: false } }
    ]
  }
]);

const commissionLogs = ref([
  { date: '15 Agustus 2026', staff: 'Riky', sales: 12500000, commission: 1250000, bonus: 250000 },
  { date: '14 Agustus 2026', staff: 'Rina', sales: 18000000, commission: 1800000, bonus: 350000 }
]);

const activityLogs = ref([
  { txNo: '8FC126081500000001', datetime: '15-Aug-2026 18:20', staff: 'Riky', actionType: 'Pembatalan Transaksi (Void)', amount: 39000, status: 'Audited' },
  { txNo: '8FC126081500000002', datetime: '15-Aug-2026 17:45', staff: 'Bambang', actionType: 'Pengembalian Barang (Refund)', amount: 25000, status: 'Audited' }
]);

const formatRp = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const getRoleTagType = (role) => {
  if (role.includes('Supervisor') || role.includes('Manager')) return 'danger';
  if (role.includes('Senior')) return 'warning';
  return 'primary';
};

const getLogTagType = (action) => {
  if (action.includes('Void') || action.includes('Pembatalan')) return 'danger';
  if (action.includes('Refund') || action.includes('Pengembalian')) return 'warning';
  return 'info';
};

const getShiftTagType = (shift) => {
  if (shift === 'OFF') return 'info';
  if (shift.includes('1')) return 'success';
  if (shift.includes('2')) return 'warning';
  return 'danger';
};

const openAddModal = () => {
  ElNotification({ title: 'Pegawai', message: 'Form pendaftaran pegawai baru dibuka.', type: 'info' });
};

const openEditEmpModal = (row) => {
  editingEmp.value = { ...row };
  isEditEmpOpen.value = true;
};

const saveEditEmp = async () => {
  if (!editingEmp.value) return;
  const idx = staffList.value.findIndex(e => e.id === editingEmp.value.id || e.name === editingEmp.value.name);
  if (idx !== -1) {
    staffList.value[idx] = { ...editingEmp.value };
  }
  try {
    await fetch(`/api/employees/${editingEmp.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingEmp.value)
    });
  } catch (err) {
    console.warn('API employees offline, saved locally');
  }
  isEditEmpOpen.value = false;
  ElNotification({ title: 'Karyawan', message: `Data karyawan ${editingEmp.value.name} berhasil diperbarui!`, type: 'success' });
};

const runAutoShiftRotation = () => {
  const shiftOrder = ['Shift 1', 'Shift 2', 'Shift 3', 'OFF'];
  weeklyRoster.value.forEach(row => {
    ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].forEach(day => {
      const current = row[day];
      const curIdx = shiftOrder.indexOf(current);
      if (curIdx !== -1) {
        row[day] = shiftOrder[(curIdx + 1) % shiftOrder.length];
      }
    });
  });
  ElNotification({
    title: 'Rotasi Shift Otomatis',
    message: 'Rotasi shift mingguan staf berhasil diperbarui secara otomatis!',
    type: 'success'
  });
};

const openRosterModal = () => {
  ElNotification({ title: 'Roster Staff', message: 'Form penugasan jadwal mingguan karyawan dibuka.', type: 'info' });
};

const editRoleGroup = (group) => {
  ElNotification({ title: 'Hak Akses', message: `Mengedit konfigurasi role ${group.roleName}`, type: 'info' });
};

const saveShift = () => {
  shiftTimings.value.push({
    name: newShift.name,
    startTime: newShift.startTime,
    endTime: newShift.endTime,
    tolerance: '15 Menit',
    badge: 'ACTIVE'
  });
  isShiftModalOpen.value = false;
  ElNotification({ title: 'Shift Timing', message: 'Master Shift timing baru berhasil disimpan!', type: 'success' });
};
</script>

<style scoped>
.employees-master-page { padding: 20px; }
.page-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }

.roster-section-header { display: flex; justify-content: space-between; align-items: center; }
.text-sub { font-size: 12px; color: #8c8c8c; margin-top: 2px; }

.role-group-card { background-color: #fafafa; border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.role-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e8e8e8; padding-bottom: 8px; margin-bottom: 12px; }
.r-title { font-size: 15px; font-weight: 700; color: #1f2937; }

.member-permission-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #f0f0f0; }
.m-info { display: flex; align-items: center; gap: 10px; }
.avatar-bg { background-color: #1890ff; color: white; font-weight: bold; }
.m-name { font-size: 13px; font-weight: 600; }

.perm-switches { display: flex; gap: 20px; }
.switch-item { display: flex; align-items: center; gap: 8px; }
.s-label { font-size: 12px; color: #595959; }

.comm-filter-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.comm-summary-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.c-box { padding: 16px; border-radius: 8px; color: white; display: flex; flex-direction: column; }
.c-box.blue { background-color: #1890ff; }
.c-box.green { background-color: #52c41a; }
.c-box .lbl { font-size: 12px; opacity: 0.9; }
.c-box .val { font-size: 22px; font-weight: 800; }

.text-green { color: #52c41a; }
.font-bold { font-weight: bold; }
.mt-4 { margin-top: 16px; }
.mt-5 { margin-top: 24px; }
.mt-2 { margin-top: 8px; }
.border-box { border: 1px solid #e8e8e8; border-radius: 6px; }
</style>
