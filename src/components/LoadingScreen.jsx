import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

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

const LoadingScreen = ({ message }) => {
  const [topSchools, setTopSchools] = useState([]);

  useEffect(() => {
    const fetchTopSchools = async () => {
      try {
        const response = await fetch("/topSchools.json");
        if (response.ok) {
          const data = await response.json();
          const shuffledData = shuffleArray([...data]);
          setTopSchools(shuffledData);
        }
      } catch (err) {
        console.error("Failed to fetch top schools:", err);
      }
    };

    fetchTopSchools();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const schoolVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 0.08,
      scale: 1,
      y: 0,
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-white to-blue-100" />

        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-300 opacity-30 blur-3xl"
          animate={{ x: [0, 50, -50, 0], y: [0, -30, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-20%] w-[40rem] h-[40rem] rounded-full bg-blue-400 opacity-20 blur-3xl"
          animate={{ x: [0, -60, 60, 0], y: [0, 40, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="absolute inset-0 z-0 flex flex-wrap items-center justify-center gap-12 p-8 overflow-hidden">
          <motion.div
            className="flex flex-wrap gap-12 justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {topSchools.length > 0 ? (
              topSchools.map((school, i) => (
                <motion.div
                  key={i}
                  className="text-gray-800 font-extrabold text-5xl whitespace-nowrap select-none drop-shadow-md"
                  variants={schoolVariants}
                >
                  {school.school_name || school.name}
                </motion.div>
              ))
            ) : (
              ""
            )}
          </motion.div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          >
            <Loader2 className="text-indigo-600 w-20 h-20 drop-shadow-lg" />
            <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-30" />
          </motion.div>

          <motion.h2
            className="mt-8 text-4xl font-extrabold text-gray-900 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {message || "Loading..."}
          </motion.h2>

          <motion.p
            className="text-gray-600 max-w-sm mt-3 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            This might take a little while.
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;