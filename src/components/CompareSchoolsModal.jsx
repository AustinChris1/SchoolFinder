// components/CompareSchoolsModal.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, Search, Loader2, MapPin, Sparkles } from 'lucide-react';
import useDebounce from './Hooks/useDebounce';
import { useDeferredValue } from 'react'; // React 18+

// Haversine formula to calculate distance between two lat/lng points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance.toFixed(2);
};

// Insights
const getAIComparisonSummary = async (schoolA, schoolB, userLocation) => {
  if (!schoolA && !schoolB) return null;

  await new Promise(resolve => setTimeout(resolve, 500));

  let points = [];
  const nameA = schoolA?.school_name || schoolA?.name;
  const nameB = schoolB?.school_name || schoolB?.name;

  // 1. Prioritize location and convenience
  if (userLocation && schoolA?.lat && schoolA?.lng && schoolB?.lat && schoolB?.lng) {
    const distanceA = calculateDistance(userLocation.lat, userLocation.lng, schoolA.lat, schoolA.lng);
    const distanceB = calculateDistance(userLocation.lat, userLocation.lng, schoolB.lat, schoolB.lng);

    if (distanceA < distanceB) {
      points.push(`${nameA} is a practical choice because it's significantly closer to your current location, a key factor for saving time on daily commutes.`);
    } else if (distanceB < distanceA) {
      points.push(`For convenience, ${nameB} is a great option as it's located closer to you, potentially making travel much easier.`);
    }
    console.log(distanceA, " ", distanceB)
  }

  // 2. Introduce the development level of the state. This is a big-picture, contextual factor.
  if (schoolA?.state_development_level && schoolB?.state_development_level) {
    if (schoolA.state_development_level > schoolB.state_development_level) {
      points.push(`Located in a more developed state, ${nameA} might offer a more robust infrastructure and a wider range of opportunities outside the classroom.`);
    } else if (schoolB.state_development_level > schoolA.state_development_level) {
      points.push(`Considering the state's development, ${nameB} could provide a more favorable environment for growth and access to better resources.`);
    }
  }

  // 3. Discuss the private vs. public distinction, a major decision point for parents
  if (schoolA?.ownership && schoolB?.ownership && schoolA.ownership !== schoolB.ownership) {
    if (schoolA.ownership === 'Private') {
      points.push(`As a private school, ${nameA} likely offers a more tailored learning experience and smaller class sizes, but it typically comes with higher tuition fees.`);
    }
    if (schoolB.ownership === 'Private') {
      points.push(`Choosing ${nameB} could mean a more personalized curriculum and specialized programs due to its private ownership status.`);
    }
    if (schoolA.ownership === 'Public' && schoolB.ownership === 'Private') {
      points.push(`As a public institution, ${nameA} may have a broader community feel and a more diverse student body compared to the private setting of ${nameB}.`);
    }
  }

  // 4. Finally, use the rating as supporting evidence for reputation
  if (schoolA?.rating && schoolB?.rating) {
    if (schoolA.rating > schoolB.rating) {
      points.push(`While not the only factor, user ratings suggest ${nameA} has a slightly better reputation, with a score of ${schoolA.rating} compared to ${nameB}'s ${schoolB.rating}.`);
    } else if (schoolB.rating > schoolA.rating) {
      points.push(`With a rating of ${schoolB.rating}, ${nameB} is generally perceived more favorably by the community than ${nameA}, which has a rating of ${schoolA.rating}.`);
    } else {
      points.push(`Both schools have a very similar reputation with near-identical ratings of ${schoolA.rating} and ${schoolB.rating}.`);
    }
  }

  // Handle single school selection with more conversational language
  if (schoolA && !schoolB) {
    return `${nameA} looks like a strong contender. Its status as a ${schoolA.ownership} school and its favorable rating of ${schoolA.rating} are definitely points to consider!`;
  }
  if (schoolB && !schoolA) {
    return `You've selected a great option in ${nameB}. It's a ${schoolB.ownership} school with a solid rating of ${schoolB.rating}.`;
  }

  return points.length > 0 ? `Based on a few key factors, here's a look at the two schools: ${points.join(' ')}` : 'We couldn\'t find enough distinct data points to provide meaningful insight at this time. Please select two schools with more complete profiles to get a better comparison!';
};

const CompareSchoolsModal = React.memo(({ schools, onClose, userLocation }) => {
  const [selectedSchool1Id, setSelectedSchool1Id] = useState('');
  const [selectedSchool2Id, setSelectedSchool2Id] = useState('');
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [selectedCategory1, setSelectedCategory1] = useState('All');
  const [selectedCategory2, setSelectedCategory2] = useState('All');
  const [comparisonSummary, setComparisonSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isFilteringLoading, setIsFilteringLoading] = useState(true);
  const [isComparisonUpdating, setIsComparisonUpdating] = useState(false);

  // Debounce search terms and use useDeferredValue for a smoother UI
  const debouncedSearchTerm1 = useDebounce(searchTerm1, 300);
  const debouncedSearchTerm2 = useDebounce(searchTerm2, 300);
  const deferredSearchTerm1 = useDeferredValue(debouncedSearchTerm1);
  const deferredSearchTerm2 = useDeferredValue(debouncedSearchTerm2);

  // Memoize unique options for category dropdowns
  const uniqueCategories = useMemo(() => {
    return ['All', ...new Set(schools.map(s => s.category).filter(Boolean))].sort();
  }, [schools]);

  // Find the full school objects based on their IDs
  const school1Details = useMemo(() => {
    return schools.find(school => school.id?.toString() === selectedSchool1Id);
  }, [schools, selectedSchool1Id]);

  const school2Details = useMemo(() => {
    return schools.find(school => school.id?.toString() === selectedSchool2Id);
  }, [schools, selectedSchool2Id]);

  // Filter schools for dropdown 1
  const filteredSchoolsForSelection1 = useMemo(() => {
    return schools.filter(school => {
      const categoryMatch = selectedCategory1 === 'All' || (school.category && school.category.toUpperCase() === selectedCategory1.toUpperCase());
      return categoryMatch;
    });
  }, [schools, selectedCategory1]);

  const filteredOptions1 = useMemo(() => {
    return filteredSchoolsForSelection1.filter(school =>
      (school.school_name || school.name)?.toLowerCase().includes(deferredSearchTerm1.toLowerCase())
    );
  }, [filteredSchoolsForSelection1, deferredSearchTerm1]);

  // Filter schools for dropdown 2
  const filteredSchoolsForSelection2 = useMemo(() => {
    return schools.filter(school => {
      const categoryMatch = selectedCategory2 === 'All' || (school.category && school.category.toUpperCase() === selectedCategory2.toUpperCase());
      return categoryMatch;
    });
  }, [schools, selectedCategory2]);

  const filteredOptions2 = useMemo(() => {
    return filteredSchoolsForSelection2.filter(school =>
      (school.school_name || school.name)?.toLowerCase().includes(deferredSearchTerm2.toLowerCase())
    );
  }, [filteredSchoolsForSelection2, deferredSearchTerm2]);

  // Effect to manage isFilteringLoading state
  useEffect(() => {
    setIsFilteringLoading(true);
    const timer = setTimeout(() => {
      setIsFilteringLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory1, selectedCategory2, debouncedSearchTerm1, debouncedSearchTerm2]);

  // Effect to manage comparison summary
  useEffect(() => {
    const fetchSummary = async () => {
      if (school1Details || school2Details) {
        setIsSummaryLoading(true);
        const summary = await getAIComparisonSummary(school1Details, school2Details, userLocation);
        setComparisonSummary(summary);
        setIsSummaryLoading(false);
      } else {
        setComparisonSummary(null);
      }
    };
    fetchSummary();
  }, [school1Details, school2Details, userLocation]);

  // A list of properties to compare.
  const fieldsToCompare = [
    { key: 'school_name', label: 'School Name' },
    { key: 'school_type', label: 'School Type' },
    { key: 'school_level', label: 'School Level' },
    { key: 'state', label: 'State' },
    { key: 'lga', label: 'LGA' },
    { key: 'category', label: 'Category' },
    { key: 'ownership', label: 'Ownership' },
    { key: 'ownership_category', label: 'Ownership Category' },
    { key: 'rating', label: 'Rating', isRating: true },
  ];

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-[1000]"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto transform"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="text-3xl font-bold text-blue-800 flex items-center">
              <Scale size={28} className="mr-3 text-blue-600" /> Compare {schools[0]?.school_type || 'Schools'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-3xl font-bold transition-colors duration-200 focus:outline-none"
              aria-label="Close comparison popup"
            >
              <X size={28} />
            </button>
          </div>

          {isFilteringLoading ? (
            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg shadow-sm">
              <Loader2 className="animate-spin text-blue-600 mb-3" size={40} />
              <p className="text-lg text-gray-700 font-medium">Loading comparison options...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait a moment.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* School 1 Selection & Filter */}
                <div>
                  <label htmlFor="schoolCategoryFilter1" className="block text-gray-700 text-sm font-bold mb-2">
                    Category for School 1:
                  </label>
                  <select
                    id="schoolCategoryFilter1"
                    className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mb-4"
                    value={selectedCategory1}
                    onChange={(e) => {
                      setSelectedCategory1(e.target.value);
                      setSelectedSchool1Id('');
                      setSearchTerm1('');
                    }}
                  >
                    {uniqueCategories.map(category => (
                      <option key={`cat1-${category}`} value={category}>{category}</option>
                    ))}
                  </select>

                  <label htmlFor="search1" className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
                    <Search size={16} className="mr-2 text-blue-500" /> Search School 1:
                  </label>
                  <input
                    id="search1"
                    type="text"
                    placeholder="Type to search..."
                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mb-2"
                    value={searchTerm1}
                    onChange={(e) => setSearchTerm1(e.target.value)}
                  />
                  <label htmlFor="school1" className="block text-gray-700 text-sm font-bold mb-2">
                    Select School 1:
                  </label>
                  <select
                    id="school1"
                    className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={selectedSchool1Id}
                    onChange={(e) => setSelectedSchool1Id(e.target.value)}
                  >
                    <option value="">-- Choose a school --</option>
                    {filteredOptions1.length > 0 ? (
                      filteredOptions1.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.school_name || school.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No schools found for this search/filter</option>
                    )}
                  </select>
                </div>

                {/* School 2 Selection & Filter */}
                <div>
                  <label htmlFor="schoolCategoryFilter2" className="block text-gray-700 text-sm font-bold mb-2">
                    Category for School 2:
                  </label>
                  <select
                    id="schoolCategoryFilter2"
                    className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 mb-4"
                    value={selectedCategory2}
                    onChange={(e) => {
                      setSelectedCategory2(e.target.value);
                      setSelectedSchool2Id('');
                      setSearchTerm2('');
                    }}
                  >
                    {uniqueCategories.map(category => (
                      <option key={`cat2-${category}`} value={category}>{category}</option>
                    ))}
                  </select>

                  <label htmlFor="search2" className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
                    <Search size={16} className="mr-2 text-green-500" /> Search School 2:
                  </label>
                  <input
                    id="search2"
                    type="text"
                    placeholder="Type to search..."
                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 mb-2"
                    value={searchTerm2}
                    onChange={(e) => setSearchTerm2(e.target.value)}
                  />
                  <label htmlFor="school2" className="block text-gray-700 text-sm font-bold mb-2">
                    Select School 2:
                  </label>
                  <select
                    id="school2"
                    className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    value={selectedSchool2Id}
                    onChange={(e) => setSelectedSchool2Id(e.target.value)}
                  >
                    <option value="">-- Choose a school --</option>
                    {filteredOptions2.length > 0 ? (
                      filteredOptions2.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.school_name || school.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No schools found for this search/filter</option>
                    )}
                  </select>
                </div>
              </div>

              {isSummaryLoading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="animate-spin text-purple-500 mr-3" size={32} />
                  <p className="text-lg text-gray-600 mt-2">Generating insights...</p>
                </div>
              )}

              {comparisonSummary && !isSummaryLoading && (
                <motion.div
                  className="bg-purple-50 p-6 rounded-lg shadow-inner border border-purple-200 mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="text-xl font-bold text-purple-800 mb-2 flex items-center">
                    <Sparkles size={20} className="mr-2 text-purple-600" />Insights
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{comparisonSummary}</p>
                </motion.div>
              )}

              {isComparisonUpdating ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="animate-spin text-blue-500 mr-3" size={32} />
                  <p className="text-lg text-gray-600 mt-2">Updating comparison details...</p>
                </div>
              ) : (
                (school1Details || school2Details) && (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* School 1 Details */}
                    <div className="bg-blue-50 p-6 rounded-lg shadow-inner border border-blue-200">
                      <h4 className="text-xl font-bold text-blue-700 mb-4">{school1Details?.school_name || school1Details?.name || 'School 1 Not Selected'}</h4>
                      <ul className="space-y-2">
                        {fieldsToCompare.map(field => {
                          const value1 = school1Details?.[field.key] ?? 'N/A';
                          const value2 = school2Details?.[field.key] ?? 'N/A';
                          let highlightClass = '';
                          if (field.isRating && typeof value1 === 'number' && typeof value2 === 'number') {
                            if (value1 > value2) { highlightClass = 'text-green-600 font-bold'; } else if (value1 < value2) { highlightClass = 'text-red-600'; }
                          }
                          return (
                            <li key={field.key} className="flex flex-wrap items-center">
                              <strong className="text-gray-700 min-w-[120px]">{field.label}:</strong>
                              <span className={`ml-2 ${highlightClass}`}>
                                {field.isRating && typeof value1 === 'number' ? `${value1} ⭐` : value1}
                              </span>
                            </li>
                          );
                        })}
                        {userLocation && school1Details?.lat && school1Details?.lng && (
                          <li className="flex flex-wrap items-center pt-2 border-t border-blue-100 mt-2">
                            <MapPin size={16} className="mr-2 text-blue-600" />
                            <strong className="text-gray-700 min-w-[100px]">Distance:</strong>
                            <span className="ml-2">
                              {calculateDistance(userLocation.lat, userLocation.lng, school1Details.lat, school1Details.lng)} km away
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* School 2 Details */}
                    <div className="bg-green-50 p-6 rounded-lg shadow-inner border border-green-200">
                      <h4 className="text-xl font-bold text-green-700 mb-4">{school2Details?.school_name || school2Details?.name || 'School 2 Not Selected'}</h4>
                      <ul className="space-y-2">
                        {fieldsToCompare.map(field => {
                          const value1 = school1Details?.[field.key] ?? 'N/A';
                          const value2 = school2Details?.[field.key] ?? 'N/A';
                          let highlightClass = '';
                          if (field.isRating && typeof value1 === 'number' && typeof value2 === 'number') {
                            if (value2 > value1) { highlightClass = 'text-green-600 font-bold'; } else if (value2 < value1) { highlightClass = 'text-red-600'; }
                          }
                          return (
                            <li key={field.key} className="flex flex-wrap items-center">
                              <strong className="text-gray-700 min-w-[120px]">{field.label}:</strong>
                              <span className={`ml-2 ${highlightClass}`}>
                                {field.isRating && typeof value2 === 'number' ? `${value2} ⭐` : value2}
                              </span>
                            </li>
                          );
                        })}
                        {userLocation && school2Details?.lat && school2Details?.lng && (
                          <li className="flex flex-wrap items-center pt-2 border-t border-green-100 mt-2">
                            <MapPin size={16} className="mr-2 text-green-600" />
                            <strong className="text-gray-700 min-w-[100px]">Distance:</strong>
                            <span className="ml-2">
                              {calculateDistance(userLocation.lat, userLocation.lng, school2Details.lat, school2Details.lng)} km away
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </motion.div>
                )
              )}

              {!school1Details && !school2Details && !isFilteringLoading && !isComparisonUpdating && (
                <p className="text-center text-gray-600 text-lg mt-8">
                  Select two schools above to compare their details and ratings.
                </p>
              )}

              {(school1Details || school2Details) && !isFilteringLoading && !isComparisonUpdating && (
                <div className="mt-8 text-center text-gray-700 text-sm p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <p>Ratings are highlighted in <span className="text-green-600 font-semibold">green</span> for the higher value and <span className="text-red-600 font-semibold">red</span> for the lower value. "N/A" indicates missing data.</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default CompareSchoolsModal;