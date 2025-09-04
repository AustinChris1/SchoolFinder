import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ScrollingSchoolsBanner.css';
import { Loader2 } from 'lucide-react';

const shuffleArray = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  };
  
const ScrollingSchoolsBanner = ({ onSelectSchool }) => {
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchTopSchools = async () => {
      try {
        const response = await fetch('/topSchools.json');
        if (!response.ok) {
          throw new Error('Failed to fetch top schools data.');
        }
        const data = await response.json();
        const shuffledData = shuffleArray([...data]);

        setSchools(shuffledData);
      } catch (err) {
        console.error("Failed to fetch top schools:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopSchools();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white text-blue-800 overflow-hidden py-2 shadow-inner flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-800" size={20} />
      </div>
    );
  }

  if (error || schools.length === 0) {
    return null;
  }

  const duplicatedSchools = [...schools, ...schools, ...schools];

  const handleSchoolClick = (schoolId) => {
    const school = schools.find(s => s.id === schoolId);
    if (school && onSelectSchool) {
      onSelectSchool(school);
    }
  };

  return (
    <div className="text-blue-800 overflow-hidden py-2 shadow-inner">
      <motion.div
        className="scrolling-text whitespace-nowrap"
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 60,
            ease: "linear",
          },
        }}
      >
        {duplicatedSchools.map((school, index) => (
          <motion.div
            key={`${school.id}-${index}`}
            className="school-item inline-block mx-8 font-semibold text-lg cursor-pointer hover:underline transition-all duration-200"
            onClick={() => handleSchoolClick(school.id)}
            whileHover={{ scale: 1.05 }}
          >
            {school.school_name || school.name}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ScrollingSchoolsBanner;