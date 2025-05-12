import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export const useTokenRefresh = (token, login) => {
  const lastActivityRef = useRef(Date.now());
  const isActiveRef = useRef(true);
  const refreshIntervalRef = useRef(null);

  // Function to update last activity timestamp
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (!isActiveRef.current) {
      isActiveRef.current = true;
      startRefreshInterval();
    }
  }, []);

  // Function to refresh token
  const refreshToken = useCallback(async () => {
    if (!token) return; // Don't try to refresh if there's no token

    try {
      const response = await fetch('http://pragva.in:8000/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      if (data.access_token) {
        login(data.access_token);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  }, [token, login]);

  // Function to start refresh interval
  const startRefreshInterval = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    refreshIntervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        refreshToken();
      }
    }, TOKEN_REFRESH_INTERVAL);
  }, [refreshToken]);

  // Function to check user activity
  const checkActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT && isActiveRef.current) {
      isActiveRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    // Set up activity tracking
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Set up activity check interval
    const activityCheckInterval = setInterval(checkActivity, 1000);

    // Start refresh interval if we have a token
    if (token) {
      startRefreshInterval();
    }

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(activityCheckInterval);
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [token, updateActivity, checkActivity, startRefreshInterval]);

  return {
    isActive: isActiveRef.current,
    lastActivity: lastActivityRef.current,
  };
}; 