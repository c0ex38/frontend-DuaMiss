import { motion } from 'framer-motion';

// Skeleton loader component
export const SkeletonLoader = ({ rows = 3, className = "" }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: rows }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-3/4" />
          </div>
          <div className="w-20 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
        </div>
      </motion.div>
    ))}
  </div>
);

// Shimmer effect
export const ShimmerEffect = ({ children, loading }) => (
  <div className="relative overflow-hidden">
    {children}
    {loading && (
      <motion.div
        animate={{ x: [-100, 100] }}
        transition={{ 
          repeat: Infinity, 
          duration: 1.5, 
          ease: "linear" 
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12"
      />
    )}
  </div>
);

// Advanced loading spinner
export const LoadingSpinner = ({ size = "md", color = "blue" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const colorClasses = {
    blue: "border-blue-500",
    emerald: "border-emerald-500",
    purple: "border-purple-500",
    pink: "border-pink-500"
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`
          ${sizeClasses[size]} 
          border-4 ${colorClasses[color]} 
          border-t-transparent rounded-full
        `}
      />
    </div>
  );
};
