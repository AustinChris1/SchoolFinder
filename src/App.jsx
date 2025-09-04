import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'; // Import lazy and Suspense
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
import LoadingScreen from './components/LoadingScreen';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import useDebounce from './components/Hooks/useDebounce';
import ScrollingSchoolsBanner from './components/Hooks/ScrollingSchoolsBanner';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Dynamically import CompareSchoolsModal using React.lazy
const LazyCompareSchoolsModal = lazy(() => import('./components/CompareSchoolsModal'));

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const userIcon = L.icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem',
  zIndex: 0,
};
const defaultCenter = { lat: 9.0820, lng: 7.4913 }; // Abuja, Nigeria
const ITEMS_PER_PAGE = 9;

const getUniqueValues = (data, key) => {
  const values = [...new Set(data.map(item => item[key]))].sort();
  return values.filter(value => value !== undefined && value !== null && value !== '');
};

const MapCenterUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const App = () => {
  const [allSchoolsData, setAllSchoolsData] = useState({
    Primary: [],
    Secondary: [],
    Tertiary: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('FCT-ABUJA');
  const [lgaFilter, setLgaFilter] = useState('');
  const [schoolLevelFilter, setSchoolLevelFilter] = useState('Secondary');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState("Your approximate location");
  const [mapZoom, setMapZoom] = useState(11);
  const [locationError, setLocationError] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [stateLocations, setStateLocations] = useState({});
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [showComparePopup, setShowComparePopup] = useState(false); // State for comparison modal

  useEffect(() => {
    const fetchAllSchools = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [primaryRes, secondaryRes, tertiaryRes] = await Promise.all([
          fetch('/primary.json'),
          fetch('/secondary.json'),
          fetch('/tertiary.json'),
        ]);

        if (!primaryRes.ok || !secondaryRes.ok || !tertiaryRes.ok) {
          throw new Error('Failed to load one or more school data files.');
        }

        const [primaryData, secondaryData, tertiaryData] = await Promise.all([
          primaryRes.json(),
          secondaryRes.json(),
          tertiaryRes.json(),
        ]);

        const enrichData = (data, level) => data.map((school, index) => ({
          ...school,
          id: school.id || `${level}-${index}`, // Ensure unique IDs across all levels
          lat: school.lat || (school.geometry?.location?.lat) || defaultCenter.lat,
          lng: school.lng || (school.geometry?.location?.lng) || defaultCenter.lng,
          rating: school.rating || (Math.random() * (5.0 - 3.0) + 3.0).toFixed(1) * 1 // Dummy rating for comparison demo
        }));

        const allSchools = [...primaryData, ...secondaryData, ...tertiaryData];
        const locationData = {};
        allSchools.forEach(school => {
          if (school.state && school.lat !== null && school.lng !== null && school.lat !== undefined && school.lng !== undefined) {
            if (!locationData[school.state]) {
              locationData[school.state] = { lat: [], lng: [] };
            }
            locationData[school.state].lat.push(school.lat);
            locationData[school.state].lng.push(school.lng);
          }
        });
        const centers = {};
        for (const state in locationData) {
          const avgLat = locationData[state].lat.reduce((a, b) => a + b) / locationData[state].lat.length;
          const avgLng = locationData[state].lng.reduce((a, b) => a + b) / locationData[state].lng.length;
          centers[state] = { lat: avgLat, lng: avgLng };
        }
        setStateLocations(centers);

        setAllSchoolsData({
          Primary: enrichData(primaryData, 'Primary'),
          Secondary: enrichData(secondaryData, 'Secondary'),
          Tertiary: enrichData(tertiaryData, 'Tertiary'),
        });
      } catch (err) {
        setError(err.message);
        setAllSchoolsData({ Primary: [], Secondary: [], Tertiary: [] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllSchools();
  }, []);


  const fetchUserLocation = useCallback(() => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userLoc);
        setMapCenter(userLoc);
        setMapZoom(14);
        setLocationError(null);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLoc.lat}&lon=${userLoc.lng}`)
          .then(response => response.json())
          .then(data => {
            setUserAddress(data.display_name || "Location found, but address is unknown");
          })
          .catch(error => {
            console.error("Reverse geocoding error:", error);
            setUserAddress("Could not fetch address details");
          });
      },
      (error) => {
        console.warn("Browser geolocation failed:", error);
        const errorMessage = error.code === error.PERMISSION_DENIED ? 'Location permission denied. Please enable location services.' : 'Failed to retrieve your location. Please try again.';
        setLocationError(errorMessage);
        setUserLocation(null);
        setMapCenter(defaultCenter);
        setUserAddress("Your approximate location");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);
  useEffect(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);



  const handleRetryLocation = useCallback(() => {

    fetchUserLocation();

  }, [fetchUserLocation]);

  const schools = useMemo(() => {
    return allSchoolsData[schoolLevelFilter] || [];
  }, [allSchoolsData, schoolLevelFilter]);
  useEffect(() => {
    if (schools.length === 0) {
      setFilteredSchools([]);
      return;
    }
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

    if (categoryFilter) {
      results = results.filter(s => s.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    setFilteredSchools(results);
    setCurrentPage(1);
  }, [debouncedSearchTerm, stateFilter, lgaFilter, schools, categoryFilter]);

  useEffect(() => {
    if (stateFilter && stateLocations[stateFilter]) {
      setMapCenter(stateLocations[stateFilter]);
      setMapZoom(12);
    } else {
      setMapCenter(defaultCenter);
      setMapZoom(11);
    }
  }, [stateFilter, stateLocations]);

  const states = useMemo(() => getUniqueValues(schools, 'state'), [schools]);
  const lgas = useMemo(() => {
    if (!stateFilter) return [];
    return getUniqueValues(schools.filter(s => s.state === stateFilter), 'lga');
  }, [schools, stateFilter]);

  const categories = useMemo(() => {
    return getUniqueValues(schools, 'category');
  }, [schools]);

  const totalPages = useMemo(() => Math.ceil(filteredSchools.length / ITEMS_PER_PAGE), [filteredSchools]);

  const currentSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSchools.slice(startIndex, endIndex);
  }, [filteredSchools, currentPage]);

  const handleViewDetails = useCallback((school) => {
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
    setCategoryFilter('');
    setCurrentPage(1);
  }, []);

  const [showScrollToTop, setShowScrollToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenComparePopup = useCallback(() => {
    setShowComparePopup(true);
  }, []);

  const handleCloseComparePopup = useCallback(() => {
    setShowComparePopup(false);
  }, []);

  const sectionVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };
  const sectionChildrenVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
  const cardItemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="bg-gray-50 font-sans relative">
      <AnimatePresence>
        {isLoading && <LoadingScreen message="Fetching all schools..." />}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <ScrollingSchoolsBanner onSelectSchool={handleViewDetails} />
      </motion.div>
      <Navbar onSelectLevel={setSchoolLevelFilter} currentLevel={schoolLevelFilter} onOpenCompare={handleOpenComparePopup} />

      <main>
        <HeroSection />

        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatePresence>
              {userLocation ? (
                <motion.div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                  <div className="flex items-center justify-center text-blue-600 mb-2">
                    <MapPinned size={24} />
                    <span className="ml-3 text-lg font-semibold text-gray-800">{userAddress}</span>
                  </div>
                </motion.div>
              ) : (
                locationError && (
                  <motion.div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center flex flex-col items-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                    <AlertCircle size={32} className="text-red-500 mb-4" />
                    <p className="text-gray-700 font-medium mb-4">{locationError}</p>
                    <motion.button onClick={handleRetryLocation} className="inline-flex items-center px-6 py-2 rounded-full font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <RotateCcw size={18} className="mr-2" /> Try Again
                    </motion.button>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </section>

        <RecommendedSchoolsSection userLocation={userLocation} allSchools={schools} onSelectSchool={handleViewDetails} schoolLevelFilter={schoolLevelFilter} />

        <section id="schools" className="py-20 md:py-24 bg-gradient-to-br from-white to-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 className="text-4xl font-extrabold text-center text-gray-900 mb-6 md:mb-10 leading-tight" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              Discover Your Perfect School
            </motion.h2>

            <motion.div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl mb-12 grid lg:grid-cols-4 gap-6 items-end border border-gray-100" variants={sectionVariants} initial="hidden" animate="visible">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Search size={16} className="mr-2 text-blue-500" /> School Name</label>
                <input type="text" placeholder="e.g., Capital Science Academy" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200" />
              </div>
              <FilterDropdown label="State" options={states} value={stateFilter} onChange={setStateFilter} />
              <FilterDropdown label="LGA" options={lgas} value={lgaFilter} onChange={setLgaFilter} />
              <FilterDropdown label="Category" options={categories} value={categoryFilter} onChange={setCategoryFilter} />
              <div className="lg:col-span-4 flex justify-end">
                <motion.button onClick={handleClearFilters} className="inline-flex items-center px-6 py-2 rounded-full font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-all duration-300 ease-in-out shadow-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <RotateCcw size={18} className="mr-2" /> Clear Filters
                </motion.button>
              </div>
            </motion.div>

            {isLoading ? (
              <motion.p className="text-center py-12 text-gray-600 flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="animate-spin text-blue-500 mb-3" size={48} />
                Fetching schools...
              </motion.p>
            ) : error ? (
              <motion.p className="text-center text-red-500 py-12 flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AlertCircle className="text-red-500 mb-3" size={48} />
                Error: {error}
              </motion.p>
            ) : (
              <>
                <motion.div className="mb-12 shadow-2xl rounded-2xl overflow-hidden border border-gray-100" variants={sectionVariants} initial="hidden" animate="visible">
                  <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={false} style={mapContainerStyle}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapCenterUpdater center={mapCenter} zoom={mapZoom} />
                    {currentSchools.map(s => (<Marker key={s.id} position={[s.lat, s.lng]}><Popup><div className="p-2 max-w-xs"><h3 className="text-lg font-bold text-gray-900 mb-1">{s.school_name || s.name}</h3><p className="text-sm text-gray-600 mb-2">{s.formatted_address || `${s.town}, ${s.state}`}</p><button onClick={() => handleViewDetails(s)} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">View Details</button></div></Popup></Marker>))}
                    {userLocation && (<Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />)}
                  </MapContainer>
                </motion.div>

                {filteredSchools.length > 0 ? (
                  <>
                    <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" variants={sectionChildrenVariants} initial="hidden" animate="visible">
                      <AnimatePresence>
                        {currentSchools.map(school => (<motion.div key={school.id} variants={cardItemVariants} layout><SchoolCard school={school} onSelectSchool={handleViewDetails} /></motion.div>))}
                      </AnimatePresence>
                    </motion.div>
                    {totalPages > 1 && (<motion.div className="flex justify-center items-center gap-4 mt-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
                      <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"><ChevronsLeft size={20} /></button>
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"><ChevronLeft size={20} /></button>
                      <span className="text-sm font-semibold text-gray-700">Page {currentPage} of {totalPages}</span>
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"><ChevronRight size={20} /></button>
                      <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"><ChevronsRight size={20} /></button>
                    </motion.div>)}
                  </>
                ) : (<motion.div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}><p className="2xl font-bold text-gray-800 mb-2">No schools found!</p><p className="text-gray-500">Try adjusting your search term or filters.</p></motion.div>)}
              </>
            )}
          </div>
        </section>

        <AboutSection />
      </main>

      <AnimatePresence>
        {selectedSchool && (<SchoolDetailModal school={selectedSchool} onClose={handleModalClose} />)}
      </AnimatePresence>

      <AnimatePresence>
        {showComparePopup && (
          <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000]"><Loader2 className="animate-spin text-white" size={48} /></div>}>
            <LazyCompareSchoolsModal
              schools={schools}
              onClose={handleCloseComparePopup}
              userLocation={userLocation}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScrollToTop && (<motion.button className="fixed bottom-8 right-8 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out" onClick={scrollToTop} initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Scroll to top"><ArrowUpFromDot size={24} /></motion.button>)}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default App;