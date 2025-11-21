import React, { useRef, useEffect } from 'react';
import { ScrollView, Platform } from 'react-native';

// Klavye ile scroll edilebilen ScrollView
export default function KeyboardScrollView({ children, ...props }) {
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e) => {
        if (!scrollViewRef.current) return;

        const scrollAmount = 50; // Her tuşta kaydırma miktarı
        
        switch(e.key) {
          case 'ArrowUp':
            e.preventDefault();
            scrollViewRef.current.scrollTo({ 
              y: Math.max(0, (scrollViewRef.current.scrollTop || 0) - scrollAmount),
              animated: true 
            });
            break;
          case 'ArrowDown':
            e.preventDefault();
            scrollViewRef.current.scrollTo({ 
              y: (scrollViewRef.current.scrollTop || 0) + scrollAmount,
              animated: true 
            });
            break;
          case 'PageUp':
            e.preventDefault();
            scrollViewRef.current.scrollTo({ 
              y: Math.max(0, (scrollViewRef.current.scrollTop || 0) - 300),
              animated: true 
            });
            break;
          case 'PageDown':
            e.preventDefault();
            scrollViewRef.current.scrollTo({ 
              y: (scrollViewRef.current.scrollTop || 0) + 300,
              animated: true 
            });
            break;
          case 'Home':
            e.preventDefault();
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
            break;
          case 'End':
            e.preventDefault();
            scrollViewRef.current.scrollTo({ y: 999999, animated: true });
            break;
        }
      };

      // Dinleyiciyi ekle
      window.addEventListener('keydown', handleKeyDown);

      // Temizle
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  return (
    <ScrollView 
      ref={scrollViewRef}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
