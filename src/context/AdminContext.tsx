import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LoginResult {
  success: boolean;
  error?: string;
  lockoutSeconds?: number;
  remainingAttempts?: number;
}

interface AdminContextType {
  isAdmin: boolean;
  isVerifyingAuth: boolean;
  loginAsAdmin: (passcode: string) => Promise<LoginResult>;
  logoutAdmin: () => Promise<void>;
  changePasscode: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  isAccessModalOpen: boolean;
  openAccessModal: () => void;
  closeAccessModal: () => void;
  lockoutRemaining: number;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Helper function to provide authenticated headers for API calls
export function getAdminAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem('saify_admin_token') ||
    sessionStorage.getItem('saify_admin_token') ||
    '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState<boolean>(true);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  // Verify server session on load
  useEffect(() => {
    const token =
      localStorage.getItem('saify_admin_token') ||
      sessionStorage.getItem('saify_admin_token');

    if (!token) {
      setIsAdmin(false);
      setIsVerifyingAuth(false);
      try {
        localStorage.removeItem('saify_owner_mode');
      } catch {}
      return;
    }

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated === true) {
          setIsAdmin(true);
          try {
            localStorage.setItem('saify_owner_mode', 'true');
          } catch {}
        } else {
          // Invalidate fake or expired token
          setIsAdmin(false);
          try {
            localStorage.removeItem('saify_admin_token');
            sessionStorage.removeItem('saify_admin_token');
            localStorage.removeItem('saify_owner_mode');
          } catch {}
        }
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => {
        setIsVerifyingAuth(false);
      });
  }, []);

  // Check URL query param e.g. ?admin=true or hash #admin
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || window.location.hash === '#admin') {
      setIsAccessModalOpen(true);
    }

    // Keyboard shortcut: Ctrl + Shift + A + B (or Cmd + Shift + A + B) to toggle Owner Access modal
    const currentlyPressed = new Set<string>();
    let lastKeyInfo: { key: string; time: number } | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifierActive = (e.ctrlKey || e.metaKey) && e.shiftKey;
      const key = e.key.toLowerCase();
      currentlyPressed.add(key);

      if (isModifierActive) {
        const hasA = currentlyPressed.has('a');
        const hasB = currentlyPressed.has('b');

        // Condition 1: Both A and B are held simultaneously with Ctrl+Shift
        if (hasA && hasB) {
          e.preventDefault();
          setIsAccessModalOpen((prev) => !prev);
          currentlyPressed.clear();
          lastKeyInfo = null;
          return;
        }

        // Condition 2: A was pressed and then B is pressed (or vice-versa) within 2 seconds while holding Ctrl+Shift
        const now = Date.now();
        if (
          (key === 'b' && lastKeyInfo?.key === 'a' && now - lastKeyInfo.time < 2000) ||
          (key === 'a' && lastKeyInfo?.key === 'b' && now - lastKeyInfo.time < 2000)
        ) {
          e.preventDefault();
          setIsAccessModalOpen((prev) => !prev);
          currentlyPressed.clear();
          lastKeyInfo = null;
          return;
        }

        if (key === 'a' || key === 'b') {
          lastKeyInfo = { key, time: now };
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      currentlyPressed.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const loginAsAdmin = async (passcode: string): Promise<LoginResult> => {
    if (lockoutRemaining > 0) {
      return {
        success: false,
        error: `Security lockout active. Please wait ${lockoutRemaining}s.`,
        lockoutSeconds: lockoutRemaining,
      };
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.lockoutSeconds) {
          setLockoutRemaining(data.lockoutSeconds);
        }
        return {
          success: false,
          error: data.error || 'Authentication failed. Access denied.',
          lockoutSeconds: data.lockoutSeconds,
          remainingAttempts: data.remainingAttempts,
        };
      }

      // Successful authentication with backend token
      const token = data.token;
      if (token) {
        try {
          localStorage.setItem('saify_admin_token', token);
          sessionStorage.setItem('saify_admin_token', token);
          localStorage.setItem('saify_owner_mode', 'true');
        } catch {}
      }

      setIsAdmin(true);
      setLockoutRemaining(0);
      setIsAccessModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: 'Network error communicating with authentication service.',
      };
    }
  };

  const changePasscode = async (
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/change-passcode', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ oldPasscode: oldPass, newPasscode: newPass }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Could not change passcode.' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error updating passcode.' };
    }
  };

  const logoutAdmin = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
      });
    } catch {}

    setIsAdmin(false);
    try {
      localStorage.removeItem('saify_admin_token');
      sessionStorage.removeItem('saify_admin_token');
      localStorage.removeItem('saify_owner_mode');
    } catch {}
  };

  const openAccessModal = () => setIsAccessModalOpen(true);
  const closeAccessModal = () => setIsAccessModalOpen(false);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isVerifyingAuth,
        loginAsAdmin,
        logoutAdmin,
        changePasscode,
        isAccessModalOpen,
        openAccessModal,
        closeAccessModal,
        lockoutRemaining,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
