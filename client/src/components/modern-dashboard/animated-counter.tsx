import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 2000, 
  className = "", 
  prefix = "", 
  suffix = "" 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/,/g, '')) || 0 
    : value;

  useEffect(() => {
    setIsVisible(true);
    
    if (numericValue === 0) {
      setDisplayValue(0);
      return;
    }

    const startTime = Date.now();
    const startValue = 0;
    const endValue = numericValue;
    
    const updateValue = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      
      setDisplayValue(Math.floor(currentValue));
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        setDisplayValue(endValue);
      }
    };
    
    const timer = setTimeout(() => {
      requestAnimationFrame(updateValue);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [numericValue, duration]);

  const formattedValue = displayValue.toLocaleString();

  return (
    <span 
      className={`${className} ${isVisible ? 'animate-count-up' : 'opacity-0'}`}
    >
      {prefix}{formattedValue}{suffix}
    </span>
  );
}