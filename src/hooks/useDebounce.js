import { useState, useEffect } from 'react';

// Debounce hook for search optimization
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    console.log('🔍 useDebounce - Input value changed:', value, 'Delay:', delay);
    
    const handler = setTimeout(() => {
      console.log('⏰ useDebounce - Setting debounced value:', value);
      setDebouncedValue(value);
    }, delay);

    return () => {
      console.log('🧹 useDebounce - Clearing timeout');
      clearTimeout(handler);
    };
  }, [value, delay]);

  console.log('📤 useDebounce - Returning debounced value:', debouncedValue);
  return debouncedValue;
}

export default useDebounce;
