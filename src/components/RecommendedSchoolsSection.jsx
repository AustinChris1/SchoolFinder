import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPaginate from 'react-paginate';
import { MapPinned, Loader2, AlertCircle, MapPin, Car, BookOpen, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Haversine formula to calculate distance between two lat/lng points
const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(coords2.lat - coords1.lat);
  const dLng = toRad(coords2.lng - coords1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1.lat)) *
    Math.cos(toRad(coords2.lat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '1rem',
  zIndex: 0,
};

const userIcon = L.icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ITEMS_PER_PAGE = 5;

const RecommendedSchoolsSection = ({ userLocation, allSchools, onSelectSchool, schoolLevelFilter }) => {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [activeSchool, setActiveSchool] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); 

  const recommendedSchools = useMemo(() => {
    if (!userLocation || !allSchools || allSchools.length === 0) {
      return [];
    }

    let schoolsToConsider = allSchools;
    if (schoolLevelFilter) {
      schoolsToConsider = allSchools.filter(school => {
        const level = school.school_level?.toLowerCase();
        if (schoolLevelFilter.toLowerCase() === 'primary') {
          return level === 'primary';
        } else if (schoolLevelFilter.toLowerCase() === 'secondary') {
          return ['jss only', 'jss and sss', 'sss only'].includes(level);
        } else if (schoolLevelFilter.toLowerCase() === 'tertiary') {
          return ['tertiary', 'university'].includes(level);
        }
        return true; 
      });
    }

    const schoolsWithDistance = schoolsToConsider 
      .map((school) => {
        if (typeof school.lat === 'number' && typeof school.lng === 'number') {
          const distance = haversineDistance(userLocation, {
            lat: school.lat,
            lng: school.lng,
          });
          return { ...school, distance };
        }
        return null;
      })
      .filter(Boolean);

    return schoolsWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 15);
  }, [userLocation, allSchools, schoolLevelFilter]); 

  const schoolsForPage = useMemo(() => {
    const offset = currentPage * ITEMS_PER_PAGE;
    return recommendedSchools.slice(offset, offset + ITEMS_PER_PAGE);
  }, [currentPage, recommendedSchools]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    document.getElementById('recommended-schools-list').scrollIntoView({ behavior: 'smooth' });
  };

  const handleMarkerClick = useCallback((school) => {
    setSelectedSchool(school);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedSchool(null);
  }, []);

  const handleMouseEnter = useCallback((school) => {
    setActiveSchool(school);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveSchool(null);
  }, []);

  const mapCenter = useMemo(() => {
    if (userLocation && recommendedSchools.length > 0) {
      const allLats = [userLocation.lat, ...recommendedSchools.map(s => s.lat)];
      const allLngs = [userLocation.lng, ...recommendedSchools.map(s => s.lng)];
      const avgLat = allLats.reduce((sum, val) => sum + val, 0) / allLats.length;
      const avgLng = allLngs.reduce((sum, val) => sum + val, 0) / allLngs.length;
      return [avgLat, avgLng];
    }
    return userLocation ? [userLocation.lat, userLocation.lng] : [9.0820, 7.4913];
  }, [userLocation, recommendedSchools]);

  const mapZoom = useMemo(() => {
    if (!userLocation || recommendedSchools.length === 0) return 13;
    const distances = recommendedSchools.map(s => s.distance);
    const maxDistance = Math.max(...distances);

    if (maxDistance < 2) return 14;
    if (maxDistance < 5) return 13;
    if (maxDistance < 10) return 12;
    if (maxDistance < 20) return 11;
    return 10;
  }, [userLocation, recommendedSchools]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const cardItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section id="recommended" className="py-20 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-4xl font-extrabold text-center text-gray-900 mb-6 md:mb-10 leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Recommended {schoolLevelFilter} Schools Near You
        </motion.h2>

        <motion.div
          className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {!userLocation ? (
            <div className="text-center py-12 text-gray-600 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-blue-500 mb-3" size={48} />
              <p>Fetching your location to find nearby schools...</p>
              <p className="text-sm mt-2 text-gray-500">Please ensure you have granted location access.</p>
            </div>
          ) : recommendedSchools.length > 0 ? (
            <>
              {/* Map View Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPinned size={24} className="text-blue-600" />
                  Map View
                </h3>
                {mapCenter && (
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    scrollWheelZoom={false}
                    style={mapContainerStyle}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker
                      position={userLocation ? [userLocation.lat, userLocation.lng] : [9.0820, 7.4913]}
                      icon={userIcon}
                    />

                    {recommendedSchools.map((school) => (
                      <Marker
                        key={school.id}
                        position={[school.lat, school.lng]}
                        eventHandlers={{
                          click: () => handleMarkerClick(school),
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <h4 className="font-bold text-lg">{school.school_name}</h4>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin size={14} className="mr-1 text-blue-500" />
                              {school.lga}, {school.state}
                            </p>
                            <p className="text-sm font-semibold text-blue-600 mt-2">
                              {school.distance.toFixed(2)} km away
                            </p>
                            <div className="mt-2 text-xs text-gray-500">
                              <p>Rating: <Star size={12} className="inline-block text-yellow-400" /> {school.rating}</p>
                              <p>Reviews: {school.user_ratings_total}</p>
                            </div>
                            <button
                              onClick={() => onSelectSchool(school)}
                              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                            >
                              View Details
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Car size={24} className="text-blue-600" />
                Top 15 Closest Schools
              </h3>
              <div id="recommended-schools-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {schoolsForPage.map((school) => (
                    <motion.div
                      key={school.id}
                      variants={cardItemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.03, zIndex: 10, transition: { duration: 0.2 } }}
                      onMouseEnter={() => handleMouseEnter(school)}
                      onMouseLeave={handleMouseLeave}
                      className={activeSchool?.id === school.id ? 'ring-2 ring-blue-500 rounded-xl' : ''}
                    >
                      <div
                        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 cursor-pointer transition-all duration-300"
                        onClick={() => onSelectSchool(school)}
                      >
                        <div className="p-6">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">{school.school_name}</h4>
                          <p className="text-gray-600 text-sm flex items-center mb-2">
                            <MapPin size={16} className="mr-2 text-blue-500" />
                            {school.lga}, {school.state}
                          </p>
                          <p className="text-blue-600 font-semibold text-lg">
                            {school.distance.toFixed(2)} km away
                          </p>
                          {school.user_ratings_total && (
                            <div className="flex items-center text-sm text-gray-500 mt-2">
                              <Star size={16} className="text-yellow-400 mr-1" />
                              <span>{school.rating} ({school.user_ratings_total} reviews)</span>
                            </div>
                          )}
                          <div className="text-sm text-gray-500 mt-1 flex items-center">
                            <BookOpen size={16} className="text-gray-400 mr-2" />
                            <span>{school.school_level}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="mt-8">
                <ReactPaginate
                  breakLabel="..."
                  nextLabel={<ChevronRight size={20} />}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  pageCount={Math.ceil(recommendedSchools.length / ITEMS_PER_PAGE)}
                  previousLabel={<ChevronLeft size={20} />}
                  renderOnZeroPageCount={null}
                  containerClassName={"flex justify-center items-center space-x-2 text-gray-800"}
                  pageLinkClassName={"w-10 h-10 flex items-center justify-center rounded-full font-semibold transition-colors duration-200 bg-gray-200 hover:bg-blue-200"}
                  previousLinkClassName={"px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"}
                  nextLinkClassName={"px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"}
                  activeLinkClassName={"!bg-blue-600 !text-white shadow-md hover:!bg-blue-600"}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-600 flex flex-col items-center justify-center">
              <AlertCircle className="text-red-500 mb-3" size={48} />
              <p>Could not find any nearby schools with valid coordinates for the selected level.</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default RecommendedSchoolsSection;