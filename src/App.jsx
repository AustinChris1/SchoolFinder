// src/App.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, AlertCircle, MapPinned, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw, ArrowUpFromDot } from 'lucide-react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FilterDropdown from './components/FilterDropdown';
import SchoolCard from './components/SchoolCard';
import SchoolDetailModal from './components/SchoolDetailModal';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import RecommendedSchoolsSection from './components/RecommendedSchoolsSection';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// --- Constants ---
const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '60vh', borderRadius: '1rem' };
const defaultCenter = { lat: 9.0820, lng: 7.4913 }; // Abuja, Nigeria
const ITEMS_PER_PAGE = 9;

// --- Helper function (remains same) ---
const getUniqueValues = (data, key) => {
  const values = [...new Set(data.map(item => item[key]))].sort();
  return values.filter(value => value !== undefined && value !== null && value !== '');
};

// --- Web Worker for Filtering ---
// We'll create a new file named `filterWorker.js`
// const filterWorker = new Worker(new URL('./workers/filterWorker.js', import.meta.url));

// Main App component
const App = () => {
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('FCT-ABUJA');
  const [lgaFilter, setLgaFilter] = useState('');

  // NEW: State for the filtered results from the web worker
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);

  // --- Modals & Map States ---
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState("Your approximate location");
  const [mapZoom, setMapZoom] = useState(11);
  const [locationError, setLocationError] = useState(null);

  // --- Google Maps Loader ---
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_Maps_API_KEY,
    libraries,
  });

  const reverseGeocode = useCallback((latLng, geocoder) => {
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setUserAddress(results[0].formatted_address);
      } else {
        console.error('Geocoder failed due to: ' + status);
        setUserAddress('Could not determine location details.');
      }
    });
  }, []);

  const fetchUserLocation = useCallback(async (geocoder) => {
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userLoc);
        setMapZoom(14);
        reverseGeocode(userLoc, geocoder);
      },
      async (error) => {
        console.warn("Browser geolocation failed:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please enable location services or use the button below to try again.');
        } else {
          setLocationError('Failed to retrieve your location. Please try again.');
        }

        try {
          const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${import.meta.env.VITE_Maps_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ considerIp: true }),
          });

          const data = await response.json();
          if (data.location) {
            const fallbackLoc = {
              lat: data.location.lat,
              lng: data.location.lng,
            };
            setUserLocation(fallbackLoc);
            reverseGeocode(fallbackLoc, geocoder);
            setLocationError(null);
          } else {
            setUserAddress("Could not determine location.");
            setLocationError('Could not determine your location using fallback methods.');
          }
        } catch (fallbackError) {
          console.error("Google Geolocation API fallback failed", fallbackError);
          setUserAddress("Could not determine location.");
          setLocationError('An unexpected error occurred while trying to find your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [reverseGeocode]);

  const handleRetryLocation = useCallback(() => {
    if (isLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      fetchUserLocation(geocoder);
    }
  }, [isLoaded, fetchUserLocation]);

  // --- Data Fetching (School List) ---
  useEffect(() => {
    fetch('/all_schools.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load school list from local JSON file.');
        }
        return res.json();
      })
      .then(data => {
        const enriched = data.map((school, index) => ({
          ...school,
          id: school.id || `school-${index}`,
          lat: school.lat || (school.geometry && school.geometry.location.lat) || defaultCenter.lat,
          lng: school.lng || (school.geometry && school.geometry.location.lng) || defaultCenter.lng,
        }));
        setSchools(enriched);
        setIsLoading(false);
        setFilteredSchools(enriched); // Initialize filtered schools with all schools
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      fetchUserLocation(geocoder);
    }
  }, [isLoaded, fetchUserLocation]);

  // NEW: Debounced search term and filter effect for better performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // NEW: Effect to trigger filtering only when a filter state changes
  useEffect(() => {
    if (schools.length === 0) return;

    // Use a Web Worker to filter the schools in a background thread
    // This prevents the UI from freezing on large datasets
    // filterWorker.postMessage({
    //   schools,
    //   debouncedSearchTerm,
    //   stateFilter,
    //   lgaFilter
    // });
    // filterWorker.onmessage = (event) => {
    //   setFilteredSchools(event.data);
    //   setIsFiltering(false);
    //   setCurrentPage(1);
    // };

    // Placeholder for Web Worker logic if not implemented
    setIsFiltering(true);
    const timer = setTimeout(() => {
      let results = schools;
      if (debouncedSearchTerm) {
        results = results.filter(s =>
          s.school_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          s.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
      }
      if (stateFilter) {
        results = results.filter(s => s.state === stateFilter);
      }
      if (lgaFilter && stateFilter) {
        results = results.filter(s => s.lga === lgaFilter);
      }
      setFilteredSchools(results);
      setIsFiltering(false);
      setCurrentPage(1);
    }, 50); // Small delay to simulate async filtering
    return () => clearTimeout(timer);

  }, [debouncedSearchTerm, stateFilter, lgaFilter, schools]);

  // Filter options are memoized and efficient
  const states = useMemo(() => getUniqueValues(schools, 'state'), [schools]);
  const lgas = useMemo(() => {
    if (!stateFilter) return [];
    return getUniqueValues(schools.filter(s => s.state === stateFilter), 'lga');
  }, [schools, stateFilter]);

  const totalPages = useMemo(() => Math.ceil(filteredSchools.length / ITEMS_PER_PAGE), [filteredSchools]);
  
  // Only get schools for the current page
  const currentSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSchools.slice(startIndex, endIndex);
  }, [filteredSchools, currentPage]);

  const handleMarkerClick = useCallback((school) => {
    setSelectedSchool(school);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedSchool(null);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: document.getElementById('schools').offsetTop, behavior: 'smooth' });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStateFilter('FCT-ABUJA');
    setLgaFilter('');
    setCurrentPage(1);
  }, []);

  const [showScrollToTop, setShowScrollToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const mapOptions = useMemo(() => ({
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'cooperative',
  }), []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const sectionChildrenVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const cardItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="bg-gray-50 font-sans relative">
      <Navbar />
      <main>
        <HeroSection />
        
        <section className="py-8 md:py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatePresence>
                {userLocation ? (
                  <motion.div
                    className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center justify-center text-blue-600 mb-2">
                      <MapPinned size={24} />
                      <span className="ml-3 text-lg font-semibold text-gray-800">
                        {userAddress || "Fetching location details..."}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  locationError && (
                    <motion.div
                      className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <AlertCircle size={32} className="text-red-500 mb-4" />
                      <p className="text-gray-700 font-medium mb-4">{locationError}</p>
                      <motion.button
                        onClick={handleRetryLocation}
                        className="inline-flex items-center px-6 py-2 rounded-full font-semibold text-sm
                                     bg-blue-600 text-white hover:bg-blue-700
                                     transition-all duration-300 ease-in-out shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <RotateCcw size={18} className="mr-2" /> Try Again
                      </motion.button>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
        </section>

        <RecommendedSchoolsSection
          userLocation={userLocation}
          allSchools={schools}
          onSelectSchool={handleMarkerClick}
        />
        
        <section id="schools" className="py-20 md:py-24 bg-gradient-to-br from-white to-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-4xl font-extrabold text-center text-gray-900 mb-6 md:mb-10 leading-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover Your Perfect School
            </motion.h2>

            <motion.div
              className="bg-white p-6 md:p-8 rounded-2xl shadow-xl mb-12 grid lg:grid-cols-4 gap-6 items-end border border-gray-100"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Search size={16} className="mr-2 text-blue-500" /> School Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Capital Science Academy"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                />
              </div>
              <FilterDropdown label="State" options={states} value={stateFilter} onChange={setStateFilter} />
              <FilterDropdown label="LGA" options={lgas} value={lgaFilter} onChange={setLgaFilter} />
              <div className="lg:col-span-4 flex justify-end">
                <motion.button
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-6 py-2 rounded-full font-semibold text-sm
                                     bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900
                                     transition-all duration-300 ease-in-out shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={18} className="mr-2" /> Clear Filters
                </motion.button>
              </div>
            </motion.div>

            {isLoading || isFiltering ? (
              <motion.p
                className="text-center py-12 text-gray-600 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Loader2 className="animate-spin text-blue-500 mb-3" size={48} />
                {isFiltering ? "Updating list..." : "Loading school list..."}
              </motion.p>
            ) : error ? (
              <motion.p
                className="text-center text-red-500 py-12 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AlertCircle className="text-red-500 mb-3" size={48} />
                Error: {error}
              </motion.p>
            ) : loadError ? (
              <motion.div
                className="text-center text-red-500 py-12 flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AlertCircle className="text-red-500 mb-3" size={48} />
                <h3 className="text-2xl font-bold mb-2">Google Maps Failed to Load</h3>
                <p className="text-gray-600">
                  There was an error loading the Google Maps service. This could be due to a network issue or an invalid API key. Please check your connection and try again.
                </p>
              </motion.div>
            ) : (
              <>
                {isLoaded && (
                  <motion.div
                    className="mb-12 shadow-2xl rounded-2xl overflow-hidden border border-gray-100"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={userLocation || defaultCenter}
                      zoom={mapZoom}
                      options={mapOptions}
                    >
                      {/* NEW: Render markers ONLY for the schools on the current page */}
                      {currentSchools.map(s => (
                        <Marker
                          key={s.id}
                          position={{ lat: s.lat, lng: s.lng }}
                          onClick={() => handleMarkerClick(s)}
                          icon={{
                            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                            fillColor: 'rgb(59, 130, 246)',
                            fillOpacity: 1,
                            strokeWeight: 0,
                            scale: 2,
                          }}
                        />
                      ))}
                      {selectedSchool && (
                        <InfoWindow
                          position={{ lat: selectedSchool.lat, lng: selectedSchool.lng }}
                          onCloseClick={handleModalClose}
                        >
                          <div className="p-2">
                            <h3 className="text-lg font-bold text-gray-900">{selectedSchool.school_name || selectedSchool.name}</h3>
                            <p className="text-sm text-gray-600">{selectedSchool.formatted_address || `${selectedSchool.town}, ${selectedSchool.state}`}</p>
                            <button
                              onClick={() => setSelectedSchool(selectedSchool)}
                              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </InfoWindow>
                      )}
                      {userLocation && (
                        <Marker
                          position={userLocation}
                          icon={{
                            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                          }}
                        />
                      )}
                    </GoogleMap>
                  </motion.div>
                )}

                {filteredSchools.length > 0 ? (
                  <>
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                      variants={sectionChildrenVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <AnimatePresence>
                        {currentSchools.map(school => (
                          <motion.div key={school.id} variants={cardItemVariants} layout>
                            <SchoolCard
                              school={school}
                              onSelectSchool={handleMarkerClick}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                    
                    {totalPages > 1 && (
                      <motion.div
                        className="flex justify-center items-center gap-4 mt-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                        >
                          <ChevronsLeft size={20} />
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-semibold text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                        >
                          <ChevronRight size={20} />
                        </button>
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                        >
                          <ChevronsRight size={20} />
                        </button>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <motion.div
                    className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-2xl font-bold text-gray-800 mb-2">No schools found!</p>
                    <p className="text-gray-500">Try adjusting your search term or filters.</p>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>

        <AboutSection />
      </main>

      <AnimatePresence>
        {selectedSchool && (
          <SchoolDetailModal
            school={selectedSchool}
            onClose={handleModalClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            className="fixed bottom-8 right-8 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll to top"
          >
            <ArrowUpFromDot size={24} />
          </motion.button>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default App;