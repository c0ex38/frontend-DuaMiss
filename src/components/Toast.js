import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const Toast = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast || !toast.message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 2.5));
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [toast, onClose]);

  if (!toast) return null;

  const getToastStyles = (type) => {
    switch (type) {
      case 'error':
        return {
          bg: 'from-red-500 via-pink-500 to-rose-600',
          icon: "M6 18L18 6M6 6l12 12",
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          borderColor: 'border-red-300/50',
          glowColor: 'shadow-red-500/25',
          particles: '🔥'
        };
      case 'warning':
        return {
          bg: 'from-amber-400 via-orange-500 to-yellow-600',
          icon: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          borderColor: 'border-amber-300/50',
          glowColor: 'shadow-amber-500/25',
          particles: '⚠️'
        };
      case 'info':
        return {
          bg: 'from-blue-500 via-indigo-500 to-purple-600',
          icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-300/50',
          glowColor: 'shadow-blue-500/25',
          particles: 'ℹ️'
        };
      default:
        return {
          bg: 'from-emerald-400 via-green-500 to-teal-600',
          icon: "M5 13l4 4L19 7",
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          borderColor: 'border-green-300/50',
          glowColor: 'shadow-green-500/25',
          particles: '✨'
        };
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ 
          opacity: 0, 
          y: -100, 
          scale: 0.3, 
          rotate: -15,
          filter: "blur(10px)"
        }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          rotate: 0,
          filter: "blur(0px)"
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.5, 
          y: -100, 
          rotate: 15,
          filter: "blur(10px)",
          transition: { 
            duration: 0.4,
            ease: "easeInOut"
          } 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          duration: 0.6 
        }}
        className={`fixed top-6 right-6 z-50 max-w-sm`}
      >
        {/* Background with gradient and glassmorphism */}
        <div className={`
          relative overflow-hidden rounded-3xl p-1 
          bg-gradient-to-br ${styles.bg}
          shadow-2xl ${styles.glowColor}
          border ${styles.borderColor}
          backdrop-blur-xl
        `}>
          {/* Inner content container */}
          <div className="relative bg-white/95 backdrop-blur-xl rounded-[22px] p-5">
            {/* Animated particles */}
            <div className="absolute top-2 right-2 text-lg opacity-60 animate-bounce">
              {styles.particles}
            </div>
            
            {/* Floating background elements */}
            <div className="absolute inset-0 overflow-hidden rounded-[22px]">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-full"
              />
              <motion.div
                animate={{ 
                  rotate: -360,
                  scale: [1, 0.8, 1]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-tr from-white/10 to-transparent rounded-full"
              />
            </div>

            {/* Main content */}
            <div className="relative flex items-start space-x-4">
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 300
                }}
                className={`
                  flex-shrink-0 w-12 h-12 ${styles.iconBg} 
                  rounded-2xl flex items-center justify-center
                  shadow-lg border border-white/50
                  relative overflow-hidden
                `}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <svg className={`w-6 h-6 ${styles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={styles.icon} />
                  </svg>
                </motion.div>
                
                {/* Icon glow effect */}
                <motion.div
                  animate={{ 
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`absolute inset-0 ${styles.iconBg} rounded-2xl blur-sm opacity-40`}
                />
              </motion.div>
              
              {/* Message content */}
              <div className="flex-1 min-w-0 pr-2">
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-800 font-semibold text-base leading-relaxed"
                >
                  {toast.message}
                </motion.p>
                
                {/* Subtitle or timestamp */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-500 text-xs mt-1"
                >
                  {new Date().toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </motion.p>
              </div>
              
              {/* Enhanced close button */}
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 90,
                  backgroundColor: "rgba(0,0,0,0.1)"
                }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-all duration-200 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Enhanced progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200/50 rounded-b-[22px] overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                className={`h-full bg-gradient-to-r ${styles.bg} relative overflow-hidden rounded-b-[22px]`}
              >
                {/* Moving shine effect */}
                <motion.div
                  animate={{ x: [-100, 200] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent transform skew-x-12"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
