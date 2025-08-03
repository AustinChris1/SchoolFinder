import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mail } from 'lucide-react';

// Custom SVG component for the logo
const SchoolFinderLogo = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-3"
  >
    <rect x="14" y="16" width="20" height="24" rx="2" fill="#2563EB" />
    <path
      d="M14 16L24 10L34 16"
      stroke="#1E3A8A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 20V32H30V20M24 20V32"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 20L12 16L12 36L8 40V20Z"
      fill="#2563EB"
      stroke="#1E3A8A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M40 20L36 16L36 36L40 40V20Z"
      fill="#2563EB"
      stroke="#1E3A8A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || 'home';
      setActiveSection(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLinkClick = useCallback((section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  }, []);

  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const mobileMenuVariants = {
    hidden: { x: '100vw', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
    exit: { x: '100vw', opacity: 0, transition: { duration: 0.3 } },
  };

  const mobileLinkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const navLinks = [
    { name: 'Home', href: '#home', section: 'home' },
    { name: 'About', href: '#about', section: 'about' },
    { name: 'Schools', href: '#schools', section: 'schools' },
  ];

  return (
    <motion.header
      className={`
        sticky top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-lg py-2'
          : 'bg-white border-b-4 border-blue-800 py-4'
        }
      `}
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center relative">
        <motion.a
          href="#home"
          className="flex items-center text-3xl font-extrabold cursor-pointer"
          onClick={() => handleLinkClick('home')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SchoolFinderLogo />
          <span className="text-gray-900 leading-none">
            <span className="block text-xl font-bold">School <span className="text-blue-900">Finder</span></span>
            <span className="block text-sm font-normal text-gray-500">Abuja</span>
          </span>
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <motion.a
              key={link.name}
              href={link.href}
              className={`
                relative font-semibold text-lg pb-1
                ${activeSection === link.section
                  ? 'text-blue-800'
                  : 'text-gray-600 hover:text-blue-800'
                }
                transition-colors duration-300
              `}
              whileHover={{ y: -2 }}
              onClick={() => handleLinkClick(link.section)}
            >
              {link.name}
              <AnimatePresence>
                {(activeSection === link.section) && (
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-1 bg-blue-800"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                )}
              </AnimatePresence>
            </motion.a>
          ))}
          <motion.a
            href="#contact"
            className="inline-flex items-center px-6 py-3 rounded-md font-semibold text-white
                       bg-blue-800 hover:bg-blue-900 transition-colors duration-300 ease-in-out"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleLinkClick('contact')}
          >
            <Mail className="inline-block mr-2" size={20} /> Contact Us
          </motion.a>
        </nav>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center">
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 hover:text-blue-800 focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileMenuOpen ? (
                <motion.div key="x" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }} transition={{ duration: 0.2 }}>
                  <X size={32} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }} transition={{ duration: 0.2 }}>
                  <Menu size={32} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay and Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.nav
              className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl flex flex-col p-6 md:hidden z-50"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-end mb-8">
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-800"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={32} />
                </motion.button>
              </div>
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className={`
                    py-3 text-lg border-b border-gray-100 flex items-center
                    ${activeSection === link.section
                      ? 'text-blue-800 font-bold bg-blue-50'
                      : 'text-gray-800 hover:text-blue-800'
                    }
                  `}
                  onClick={() => handleLinkClick(link.section)}
                  variants={mobileLinkVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 * (index + 1), duration: 0.3 }}
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.a
                href="#contact"
                className="mt-6 px-4 py-3 rounded-md text-lg font-semibold text-white text-center
                           bg-blue-800 hover:bg-blue-900 transition-colors duration-300 ease-in-out flex items-center justify-center"
                onClick={() => handleLinkClick('contact')}
                variants={mobileLinkVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <Mail className="inline-block mr-3" size={20} /> Contact Us
              </motion.a>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;