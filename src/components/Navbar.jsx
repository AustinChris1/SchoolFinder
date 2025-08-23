import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mail, Home, Info, Search } from 'lucide-react';

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

const Navbar = ({ onSelectLevel, currentLevel }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, 
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
    }
  }, []);

  const handleLinkClick = useCallback((event, section) => {
    event.preventDefault(); 
    setIsMobileMenuOpen(false);
    scrollToSection(section);
  }, [scrollToSection]);

  const handleLevelChange = useCallback((level) => {
    onSelectLevel(level);
    setIsMobileMenuOpen(false);
    scrollToSection('schools');
  }, [onSelectLevel, scrollToSection]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'schools', 'contact'];
      const currentScrollPos = window.scrollY + 100; 
      
      for (let section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= currentScrollPos && element.offsetTop + element.offsetHeight > currentScrollPos) {
          setActiveSection(section);
          break;
        }
      }

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

  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const mobileMenuVariants = {
    hidden: { x: '100vw', transition: { duration: 0.25 } },
    visible: { x: 0, transition: { type: 'tween', duration: 0.25, ease: 'easeOut' } },
    exit: { x: '100vw', transition: { duration: 0.25 } },
  };

  const mobileLinkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2
      },
    }),
  };

  const navLinks = [
    { name: 'Home', section: 'home', icon: <Home size={20} /> },
    { name: 'About', section: 'about', icon: <Info size={20} /> },
    { name: 'Schools', section: 'schools', icon: <Search size={20} /> },
    { name: 'Contact', section: 'contact', icon: <Mail size={20} /> },
  ];

  const schoolLevels = [
    { name: 'Primary', value: 'Primary' },
    { name: 'Secondary', value: 'Secondary' },
    { name: 'Tertiary', value: 'Tertiary' },
  ];

  return (
    <motion.header
      className={`
        sticky top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${isScrolled
          ? 'bg-white shadow-lg py-2'
          : 'bg-white border-b-4 border-blue-800 py-4'
        }
      `}
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center relative">
        <motion.a
          href="/"
          className="flex items-center text-3xl font-extrabold cursor-pointer"
          onClick={(e) => handleLinkClick(e, 'home')}
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
          <div className="flex items-center space-x-4 p-1 bg-gray-100 rounded-xl shadow-inner">
            {schoolLevels.map((level) => (
              <motion.button
                key={level.value}
                onClick={() => handleLevelChange(level.value)}
                className={`
                  px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-300
                  ${currentLevel === level.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {level.name}
              </motion.button>
            ))}
          </div>
          {navLinks.map((link) => (
            <motion.a
              key={link.name}
              href={`#${link.section}`}
              className={`
                relative font-semibold text-lg pb-1
                ${activeSection === link.section
                  ? 'text-blue-800'
                  : 'text-gray-600 hover:text-blue-800'
                }
                transition-colors duration-300
              `}
              whileHover={{ y: -2 }}
              onClick={(e) => handleLinkClick(e, link.section)}
            >
              {link.name}
              <AnimatePresence>
                {(activeSection === link.section) && (
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-1 bg-blue-800 rounded-full"
                    layoutId="underline"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                )}
              </AnimatePresence>
            </motion.a>
          ))}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center">
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 hover:text-blue-800 focus:outline-none"
            aria-label="Toggle mobile menu"
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
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.nav
              className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl flex flex-col p-6 md:hidden z-50 overflow-y-auto"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-end mb-8">
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-800"
                  aria-label="Close mobile menu"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={32} />
                </motion.button>
              </div>
              <div className="flex flex-col mb-4 space-y-3">
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">School Levels</p>
                <div className="flex flex-col space-y-2">
                  {schoolLevels.map((level, index) => (
                    <motion.button
                      key={level.value}
                      onClick={() => handleLevelChange(level.value)}
                      className={`
                        px-4 py-2 rounded-lg font-semibold text-lg text-left transition-all duration-300
                        ${currentLevel === level.value
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                      whileHover={{ x: 5 }}
                      variants={mobileLinkVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                    >
                      {level.name}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Navigation</p>
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={`#${link.section}`}
                    className={`
                      px-4 py-2 rounded-lg text-lg flex items-center transition-all duration-300
                      ${activeSection === link.section
                        ? 'text-blue-800 font-bold bg-blue-50'
                        : 'text-gray-800 hover:text-blue-800 hover:bg-gray-100'
                      }
                    `}
                    onClick={(e) => handleLinkClick(e, link.section)}
                    variants={mobileLinkVariants}
                    custom={index + schoolLevels.length}
                    initial="hidden"
                    animate="visible"
                  >
                    <span className="mr-3 text-gray-500">{link.icon}</span> {link.name}
                  </motion.a>
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;