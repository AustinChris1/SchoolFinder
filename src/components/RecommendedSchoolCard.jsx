// src/components/RecommendedSchoolCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Gauge, ArrowRight } from 'lucide-react';

const RecommendedSchoolCard = ({ school, distance, onSelect }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between
                 cursor-pointer border border-gray-100 hover:border-blue-300 transition-all duration-200"
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={() => onSelect(school)}
    >
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{school.school_name}</h4>
        <p className="text-gray-600 text-sm flex items-center mb-1">
          <MapPin size={16} className="mr-2 text-blue-500" /> {school.lga}, {school.state}
        </p>
        {distance !== null && (
          <p className="text-blue-700 text-sm font-semibold flex items-center">
            <Gauge size={16} className="mr-2 text-blue-600" /> {distance.toFixed(1)} km away
          </p>
        )}
      </div>
      <div className="mt-4 text-blue-600 font-semibold text-sm flex items-center group">
        View Details
        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </motion.div>
  );
};

export default RecommendedSchoolCard;