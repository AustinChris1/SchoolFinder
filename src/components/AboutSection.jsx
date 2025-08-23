import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  MapPin,
  Rocket,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';

const WavyBackground = () => (
  <svg
    className="absolute top-0 left-0 w-full h-full text-blue-500 opacity-5 pointer-events-none"
    viewBox="0 0 1440 320"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      fillOpacity="1"
      d="M0,224L48,224C96,224,192,224,288,208C384,192,480,160,576,165.3C672,171,768,213,864,229.3C960,245,1056,235,1152,224C1248,213,1344,203,1392,197.3L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
    ></path>
  </svg>
);

const AboutSection = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 12 } },
  };

  return (
    <motion.section
      id="about"
      className="py-20 md:py-28 bg-white relative overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <WavyBackground />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-gray-700 relative z-10">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-10 md:mb-16 leading-tight relative"
          variants={textVariants}
        >
          <span className="relative inline-block pb-2">
            About School Finder Abuja
            <motion.span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-blue-500 rounded-full"
              initial={{ scaleX: 0 }}
              animate="visible"
              transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
            />
          </span>
        </motion.h2>

        <div className="max-w-6xl mx-auto text-lg md:text-xl leading-relaxed space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <motion.div variants={textVariants}>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <GraduationCap size={32} className="text-blue-600 mr-3" />
                Our Purpose
              </h3>
              <p className="space-y-4">
                <span className="font-semibold text-gray-800">School Finder Abuja</span> is dedicated to transforming the way parents and guardians discover top-tier educational institutions in the Federal Capital Territory, Abuja. We aim to eliminate the traditional "hustle" of school selection by offering a centralized, intuitive, and comprehensive platform.
              </p>
            </motion.div>

            <motion.div variants={textVariants}>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <ShieldCheck size={32} className="text-green-600 mr-3" />
                Our Commitment
              </h3>
              <p className="space-y-4">
                Officially registered in 2020 (BN 3053893), our core objective is to provide exhaustive details on all secondary schools within Abuja, including vital contact information, authentic reviews, and other pertinent details that empower informed decisions.
              </p>
            </motion.div>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 my-10"
            variants={sectionVariants}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center text-center group"
              variants={cardVariants}
              whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.08)" }}
            >
              <Lightbulb size={48} className="text-purple-500 mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h4 className="text-xl font-bold text-gray-800 mb-2">Our Mission</h4>
              <p className="text-gray-600 text-sm">To simplify school search, offering quality, affordable, and accessible education options from the comfort of your home.</p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center text-center group"
              variants={cardVariants}
              whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.08)" }}
            >
              <MapPin size={48} className="text-blue-500 mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h4 className="text-xl font-bold text-gray-800 mb-2">Current Focus</h4>
              <p className="text-gray-600 text-sm">Comprehensive listing of all secondary schools in Abuja, empowering parents in the FCT to make informed choices.</p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center text-center group"
              variants={cardVariants}
              whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.08)" }}
            >
              <Rocket size={48} className="text-red-500 mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h4 className="text-xl font-bold text-gray-800 mb-2">Future Vision</h4>
              <p className="text-gray-600 text-sm">Expanding to include federal, state, and private tertiary institutions, with a global reach across African countries.</p>
            </motion.div>
          </motion.div>

          <motion.div variants={textVariants} className="text-center pt-8 border-t border-gray-200">
            <p className="font-medium text-gray-700">
              This initiative opens new avenues for educational services, benefiting parents, guardians, and institution owners/proprietors across Nigeria and beyond.
            </p>
            <p className="italic text-sm text-gray-500 mt-2">
              Join us in building a future where quality education is easily accessible.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default AboutSection;