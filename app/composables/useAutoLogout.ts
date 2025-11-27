export function useAutoLogout() {
  const { isLoggedIn, logout } = useAuth();
  const route = useRoute();
  
  let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Reset the inactivity timer
  const resetTimer = () => {
    // Clear existing timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    // Only set timer if user is logged in and not on login page
    if (isLoggedIn.value && route.path !== '/login') {
      inactivityTimer = setTimeout(() => {
        // Auto logout after inactivity
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  // Handle user activity events
  const handleActivity = () => {
    if (isLoggedIn.value && route.path !== '/login') {
      resetTimer();
    }
  };

  // Handle visibility change
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && isLoggedIn.value) {
      resetTimer();
    }
  };

  // Setup event listeners
  const setupListeners = () => {
    if (import.meta.client) {
      // Listen to various user activity events
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      events.forEach((event) => {
        window.addEventListener(event, handleActivity, { passive: true });
      });

      // Also listen to visibility change (when user switches tabs)
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  };

  // Remove event listeners
  const removeListeners = () => {
    if (import.meta.client) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }

    // Clear timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  };

  // Initialize auto logout
  const initAutoLogout = () => {
    if (import.meta.client) {
      setupListeners();
      resetTimer();
    }
  };

  // Watch for login state changes
  watch(isLoggedIn, (loggedIn) => {
    if (loggedIn) {
      initAutoLogout();
    } else {
      removeListeners();
    }
  }, { immediate: true });

  // Watch for route changes
  watch(() => route.path, () => {
    if (isLoggedIn.value && route.path !== '/login') {
      resetTimer();
    } else {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
      }
    }
  });

  // Cleanup on unmount
  onUnmounted(() => {
    removeListeners();
  });

  return {
    initAutoLogout,
    resetTimer,
  };
}

