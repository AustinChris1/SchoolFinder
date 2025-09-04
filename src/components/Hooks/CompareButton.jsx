import React from 'react';
import { Scale } from 'lucide-react';
import { motion } from 'framer-motion';

const CompareButton = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Compare Schools"
    >
      <Scale size={20} className="mr-2" /> Compare Schools
    </motion.button>
  );
};

export default CompareButton;