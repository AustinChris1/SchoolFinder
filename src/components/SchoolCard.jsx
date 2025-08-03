import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, GraduationCap, BookOpen, ArrowRight, Building2 } from 'lucide-react'; 

const SchoolCard = ({ school, onSelectSchool }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      }
    },
    hover: {
      scale: 1.03, 
      y: -5, 
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(59, 130, 246, 0.5)", 
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      }
    },
    tap: {
      scale: 0.98,
      y: 0,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
    }
  };

  const viewDetailsVariants = {
    rest: { x: 0, opacity: 1 },
    hover: { x: 5, opacity: 1, transition: { duration: 0.2 } },
  };

  const arrowVariants = {
    rest: { x: -10, opacity: 0 },
    hover: { x: 0, opacity: 1, transition: { duration: 0.2 } },
  };

  const getSchoolLevelIcon = (level) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('primary')) return <BookOpen size={18} className="mr-1 text-blue-500" />;
    if (lowerLevel.includes('secondary')) return <GraduationCap size={18} className="mr-1 text-blue-500" />;
    if (lowerLevel.includes('tertiary') || lowerLevel.includes('university')) return <Building2 size={18} className="mr-1 text-blue-500" />;
    return <BookOpen size={18} className="mr-1 text-blue-500" />; 
  };

  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden cursor-pointer relative
                shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out
                border-2 border-transparent hover:border-blue-500 group" 
      onClick={() => onSelectSchool(school)}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      <div className="p-6"> 
        <div className="flex justify-between items-start mb-3"> 
          <h3 className="text-2xl font-extrabold text-gray-900 leading-tight pr-4">{school.school_name}</h3>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap
            ${school.category === 'PRIVATE' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800' : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'}`}>
            {school.category}
          </span>
        </div>

        <p className="text-gray-700 text-base mb-2 flex items-center">
          <MapPin size={16} className="mr-2 text-gray-400" /> {school.lga}, {school.state}
        </p>
        <p className="text-base text-gray-600 flex items-center">
          {getSchoolLevelIcon(school.school_level)} {school.school_level}
        </p>
      </div>

      <motion.div
        className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-3
                    font-semibold text-blue-700 flex items-center justify-between"
        initial="rest"
        animate="rest"
        variants={viewDetailsVariants}
      >
        <span>View Details</span>
        <motion.div variants={arrowVariants} className="flex items-center">
          <ArrowRight className="ml-2 group-hover:block" size={20} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SchoolCard;
