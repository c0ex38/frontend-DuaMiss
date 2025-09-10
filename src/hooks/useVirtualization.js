import { useState, useEffect, useRef, useCallback } from 'react';

// Infinite scroll hook
export function useInfiniteScroll(fetchMore, hasMore) {
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setLoading(true);
          fetchMore().finally(() => setLoading(false));
        }
      });
      
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, fetchMore]
  );

  return { lastElementRef, loading };
}

// Virtual list hook for large datasets
export function useVirtualList({ 
  items = [], 
  containerHeight = 400, 
  itemHeight = 100,
  overscan = 2 
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef();
  
  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + overscan * 2,
    safeItems.length
  );
  
  const visibleItems = safeItems.slice(startIndex, endIndex).map((item, index) => ({
    ...item,
    index: startIndex + index,
    style: {
      position: 'absolute',
      top: (startIndex + index) * itemHeight,
      left: 0,
      right: 0,
      height: itemHeight
    }
  }));
  
  const totalHeight = safeItems.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const scrollToIndex = useCallback((index) => {
    if (containerRef.current) {
      const scrollTo = index * itemHeight;
      containerRef.current.scrollTop = scrollTo;
      setScrollTop(scrollTo);
    }
  }, [itemHeight]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    scrollToIndex,
    onScroll: handleScroll,
    startIndex,
    endIndex
  };
}
