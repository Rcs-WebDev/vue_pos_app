import { defineStore } from 'pinia';

const STORED_AUTH_KEY = 'bien_pos_auth';
const STORED_COMMISSION_KEY = 'bien_pos_commission_rate';

export const useAuthStore = defineStore('auth', {
  state: () => {
    let savedUser = null;
    try {
      savedUser = JSON.parse(localStorage.getItem(STORED_AUTH_KEY));
    } catch (e) {
      savedUser = null;
    }

    return {
      user: savedUser, // { username: 'manager'|'staff', name: string, role: 'Manager'|'Staff' }
      commissionRate: Number(localStorage.getItem(STORED_COMMISSION_KEY)) || 10
    };
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    isManager: (state) => state.user?.role === 'Manager',
    isStaff: (state) => state.user?.role === 'Staff',
    canEditCommission: (state) => state.user?.role === 'Manager',
    currentRole: (state) => state.user?.role || 'Guest',
    currentUserName: (state) => state.user?.name || 'Kasir'
  },

  actions: {
    login(role, password) {
      let userObj = null;
      if (role === 'Manager') {
        if (password !== 'manager123') {
          return { success: false, message: 'Password Manager salah!' };
        }
        userObj = {
          username: 'manager',
          name: 'Manager POS',
          role: 'Manager'
        };
      } else if (role === 'Staff') {
        if (password !== 'staff123') {
          return { success: false, message: 'Password Staff salah!' };
        }
        userObj = {
          username: 'staff',
          name: 'Staff Kasir',
          role: 'Staff'
        };
      } else {
        return { success: false, message: 'Peran tidak valid.' };
      }

      this.user = userObj;
      localStorage.setItem(STORED_AUTH_KEY, JSON.stringify(userObj));

      // Sync posStore cashierName if available
      try {
        const { usePosStore } = import.meta.glob('@/stores/posStore', { eager: true });
        if (usePosStore) {
          const posStore = usePosStore();
          posStore.cashierName = userObj.name;
        }
      } catch (e) {
        console.warn('Could not sync cashierName to posStore:', e);
      }

      return { success: true, user: userObj };
    },

    logout() {
      this.user = null;
      localStorage.removeItem(STORED_AUTH_KEY);
    },

    setCommissionRate(newRate) {
      if (!this.canEditCommission) {
        return { success: false, message: 'Akses ditolak! Hanya Manager yang dapat mengubah persentase komisi.' };
      }
      this.commissionRate = Number(newRate);
      localStorage.setItem(STORED_COMMISSION_KEY, String(newRate));
      return { success: true };
    }
  }
});
