import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import VTLoader from '../components/VTLoader';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(null);

  const navigateWithLoader = useCallback((url) => {
    setLoading(true);
    setPendingUrl(url);
  }, []);

  useEffect(() => {
    if (pendingUrl && loading) {
      const timer = setTimeout(() => {
        window.location.href = pendingUrl;
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [pendingUrl, loading]);

  const clearLoading = useCallback(() => {
    setLoading(false);
    setPendingUrl(null);
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, navigateWithLoader }}>
      {children}
      <VTLoader loading={loading} onDone={clearLoading} />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);