import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Tag } from 'lucide-react'; // Import relevant icons

const FilterDropdown = ({ label, options, value, onChange }) => {
  // Determine which icon to use based on the label, or default
  const getIcon = (label) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('state') || lowerLabel.includes('lga') || lowerLabel.includes('location')) {
      return <MapPin className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={20} />;
    }
    // Add more conditions if you have other specific filter types
    return <Tag className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={20} />;
  };

  // Framer Motion Variants for the dropdown container
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // Framer Motion Variants for the select input's interactive state
  const selectInteractiveVariants = {
    rest: {
      borderColor: '#d1d5db', // gray-300
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
      scale: 1,
    },
    hover: {
      borderColor: '#9ca3af', // gray-400
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
      scale: 1.01,
      transition: { duration: 0.2 },
    },
    focus: {
      borderColor: '#3b82f6', // blue-500
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)', // ring-2 with blue-500, a bit more pronounced
      scale: 1.01,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      className="relative group" // Added group for styling children on parent focus
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <label className="block text-sm font-medium text-gray-700 mb-1 pointer-events-none select-none">
        {label}
      </label>
      <motion.div
        className="relative flex items-center w-full"
        initial="rest"
        whileHover="hover"
        whileFocus="focus" // This will apply focus styles when the select inside is focused
        animate="rest"
        variants={selectInteractiveVariants}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          {getIcon(label)}
        </div>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg appearance-none
                     bg-white cursor-pointer
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     text-gray-800 text-base shadow-sm
                     transition-all duration-200 ease-in-out"
        >
          <option value="">All {label}s</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {/* Custom Arrow Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200"
            viewBox="0 0 20 20"
            fill="currentColor"
            variants={{
              rest: { rotate: 0 },
              focus: { rotate: 180 }, // Rotate arrow when focused/open
            }}
            transition={{ duration: 0.2 }}
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </motion.svg>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FilterDropdown;