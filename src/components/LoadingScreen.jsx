
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ message }) => {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-50 bg-opacity-95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {message || "Loading..."}
      </h2>
      <p className="text-gray-600 text-center max-w-sm">
        This might take a while.
      </p>
    </motion.div>
  );
};

export default LoadingScreen;