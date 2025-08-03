import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Mail,
  Home,
  Info,
  BookOpen, 
  Copyright,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ShieldCheck
} from 'lucide-react';

const Footer = () => {
  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        when: "beforeChildren", 
        staggerChildren: 0.2,
      },
    },
  };

  const columnVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const linkItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.footer
      id="contact"
      className="bg-gray-900 text-white py-12 md:py-16 overflow-hidden relative"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible" 
      viewport={{ once: true, amount: 0.3 }} 
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950 opacity-90 z-0"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10 relative z-10">

        {/* Column 1: School Finder Info */}
        <motion.div variants={columnVariants}>
          <h3 className="text-2xl font-bold mb-4 text-blue-400">School Finder</h3>
          <motion.p variants={linkItemVariants} className="text-gray-400 text-sm md:text-base leading-relaxed flex items-start mb-2">
            <MapPin size={18} className="mr-3 mt-0.5 flex-shrink-0 text-blue-300" />
            <span className="break-words">
              ABUJA DRIVE 3. HOUSE 48B<br />
              PRINCE & PRINCESS ESTATE. GUDU. ABUJA
            </span>
          </motion.p>
          <motion.p variants={linkItemVariants} className="text-gray-500 text-xs mt-1">BN: 3053893</motion.p>
        </motion.div>

        {/* Column 2: Quick Links */}
        <motion.div variants={columnVariants}>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <motion.li variants={linkItemVariants}>
              <a href="#home" className="flex items-center hover:text-white transition-colors duration-200 group">
                <Home size={18} className="mr-3 text-gray-400 group-hover:text-white transition-colors" /> Home
              </a>
            </motion.li>
            <motion.li variants={linkItemVariants}>
              <a href="#about" className="flex items-center hover:text-white transition-colors duration-200 group">
                <Info size={18} className="mr-3 text-gray-400 group-hover:text-white transition-colors" /> About Us
              </a>
            </motion.li>
            <motion.li variants={linkItemVariants}>
              <a href="#schools" className="flex items-center hover:text-white transition-colors duration-200 group">
                <BookOpen size={18} className="mr-3 text-gray-400 group-hover:text-white transition-colors" /> Find Schools
              </a>
            </motion.li>
            <motion.li variants={linkItemVariants}>
              <a href="/privacy-policy" className="flex items-center hover:text-white transition-colors duration-200 group">
                <ShieldCheck size={18} className="mr-3 text-gray-400 group-hover:text-white transition-colors" /> Privacy Policy
              </a>
            </motion.li>
          </ul>
        </motion.div>

        {/* Column 3: Get in Touch */}
        <motion.div variants={columnVariants}>
          <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
          <p className="text-gray-400 text-sm md:text-base mb-3">For partnerships and advertising opportunities:</p>
          <motion.a
            href="mailto:info@schoolfinder.com"
            className="flex items-center text-blue-300 hover:text-blue-200 hover:underline mb-3 text-base font-semibold transition-colors duration-200"
            variants={linkItemVariants}
            whileHover={{ x: 5 }} 
          >
            <Mail size={20} className="mr-3 text-blue-300" /> info@schoolfinder.com
          </motion.a>
          <motion.a
            href="tel:+2348012345678" 
            className="flex items-center text-blue-300 hover:text-blue-200 hover:underline mb-4 text-base font-semibold transition-colors duration-200"
            variants={linkItemVariants}
            whileHover={{ x: 5 }}
          >
            <Phone size={20} className="mr-3 text-blue-300" /> +234 801 234 5678
          </motion.a>
        </motion.div>

        {/* Column 4: Social Media (New Column for better layout) */}
        <motion.div variants={columnVariants}>
          <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
          <div className="flex space-x-4">
            <motion.a
              href="https://facebook.com/schoolfinder" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Facebook size={24} />
            </motion.a>
            <motion.a
              href="https://twitter.com/schoolfinder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Twitter size={24} />
            </motion.a>
            <motion.a
              href="https://instagram.com/schoolfinder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-500 transition-colors duration-200"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Instagram size={24} />
            </motion.a>
            <motion.a
              href="https://linkedin.com/company/schoolfinder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Linkedin size={24} />
            </motion.a>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 md:mt-16 text-center text-gray-500 text-sm relative z-10 border-t border-gray-700 pt-6">
        <motion.p
          variants={linkItemVariants} 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          className="flex items-center justify-center"
        >
          <Copyright size={16} className="mr-2 text-gray-500" />
          &copy; {new Date().getFullYear()} School Finder Abuja. All rights reserved.
        </motion.p>
      </div>
    </motion.footer>
  );
};

export default Footer;