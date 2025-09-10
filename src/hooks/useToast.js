import { useState, useCallback } from 'react';

const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleApiError = useCallback((error, defaultMessage = 'Bir hata oluştu') => {
    let errorMessage = defaultMessage;
    
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.non_field_errors?.length > 0) {
      errorMessage = error.response.data.non_field_errors[0];
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    showToast(errorMessage, 'error');
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    handleApiError
  };
};

export default useToast;
