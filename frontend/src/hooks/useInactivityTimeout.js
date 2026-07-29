import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const INACTIVITY_LIMIT = 10 * 60 * 1000;

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'wheel'];

const useInactivityTimeout = () => {
  const { logout } = useAuth();
  const timerRef = useRef(null);

  const resetTimer = useRef(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT);
  }).current;

  useEffect(() => {
    resetTimer();

    const handleActivity = () => resetTimer();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [resetTimer]);
};

export default useInactivityTimeout;
