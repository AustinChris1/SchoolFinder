import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, GraduationCap, Building, Briefcase, Tag, Globe,
  Star, User, Phone, Mail, Link, DollarSign,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const StarRating = ({ rating }) => {
  if (!rating) return null;
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5 md:gap-1 text-yellow-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          className={`inline-block ${i < rounded ? 'opacity-100' : 'opacity-40'}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05 + 0.5, type: 'spring', stiffness: 200, damping: 10 }}
        >
          <Star size={20} fill="currentColor" strokeWidth={0} />
        </motion.span>
      ))}
      <span className="text-base text-gray-600 ml-2 font-semibold">({rating.toFixed(1)})</span>
    </div>
  );
};

const PhotoCarousel = ({ photos, schoolName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasPhotos = photos && photos.length > 0;
  const hasApiKey = !!import.meta.env.VITE_Maps_API_KEY;

  if (!hasPhotos || !hasApiKey) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
  };

  const getPhotoUrl = (photoReference) => {
    const YOUR_API_KEY = import.meta.env.VITE_Maps_API_KEY;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photoReference}&key=${YOUR_API_KEY}`;
  };

  const currentPhoto = photos[currentIndex];

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-xl shadow-lg border border-gray-200 mb-6 group"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src={getPhotoUrl(currentPhoto.photo_reference)}
        alt={`${schoolName} photo ${currentIndex + 1}`}
        className="w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105 aspect-video"
        style={{ height: 'auto', maxHeight: '450px' }}
        onError={(e) => {
          e.target.src = 'https://placehold.co/800x450/e2e8f0/4a5568?text=Image+Load+Error';
        }}
      />

      {photos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 rounded-full text-gray-800 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Previous photo"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 rounded-full text-gray-800 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Next photo"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </motion.div>
  );
};

const SchoolDetailModal = ({ school, onClose }) => {
  if (!school) return null;

  const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalContentVariants = {
    hidden: { y: "100vh", opacity: 0, scale: 0.8 },
    visible: {
      y: "0",
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 18,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      y: "100vh",
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const sectionChildrenVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <AnimatePresence>
      {school && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center items-center p-4 font-inter"
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6 md:p-8 transform"
            variants={modalContentVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10 p-2 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-7 h-7" />
            </motion.button>

            <motion.div variants={sectionChildrenVariants}>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900 leading-tight">
                {school.school_name}
              </h2>
              {school.formatted_address && (
                <p className="text-gray-700 text-md mb-6 flex items-start">
                  <MapPin size={18} className="mr-2 text-blue-500 flex-shrink-0" />
                  <span className="break-words">{school.formatted_address}</span>
                </p>
              )}
            </motion.div>

            <PhotoCarousel photos={school.photos} schoolName={school.school_name} />

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 mb-8 text-base text-gray-800"
              variants={sectionChildrenVariants}
            >
              {school.category && <div className="flex items-center"><Tag size={18} className="mr-3 text-blue-500" /> <strong>Category:</strong> {school.category}</div>}
              {school.school_level && <div className="flex items-center"><GraduationCap size={18} className="mr-3 text-blue-500" /> <strong>Level:</strong> {school.school_level}</div>}
              {school.ownership && <div className="flex items-center"><Building size={18} className="mr-3 text-blue-500" /> <strong>Ownership:</strong> {school.ownership}</div>}
              {school.location && <div className="flex items-center"><MapPin size={18} className="mr-3 text-blue-500" /> <strong>Location Type:</strong> {school.location}</div>}
              {school.school_type && <div className="flex items-center"><Briefcase size={18} className="mr-3 text-blue-500" /> <strong>School Type:</strong> {school.school_type}</div>}
              
              {school.formatted_phone_number && (
                <div className="flex items-center">
                  <Phone size={18} className="mr-3 text-blue-500" />
                  <strong>Phone:</strong> <a href={`tel:${school.formatted_phone_number}`} className="text-blue-600 hover:underline">{school.formatted_phone_number}</a>
                </div>
              )}
              
              {school.contact_info?.email && (
                <div className="flex items-center">
                  <Mail size={18} className="mr-3 text-blue-500" />
                  <strong>Email:</strong> <a href={`mailto:${school.contact_info.email}`} className="text-blue-600 hover:underline">{school.contact_info.email}</a>
                </div>
              )}
              
              {school.website && (
                <div className="flex items-center">
                  <Link size={18} className="mr-3 text-blue-500" />
                  <strong>Website:</strong> <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{new URL(school.website).hostname}</a>
                </div>
              )}

              {school.fees?.range && <div className="flex items-center"><DollarSign size={18} className="mr-3 text-blue-500" /> <strong>Fees:</strong> {school.fees.range}</div>}
            </motion.div>

            <motion.div
              className="border-t border-gray-200 pt-6 mt-6"
              variants={sectionChildrenVariants}
            >
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 flex items-center">
                <Globe size={24} className="mr-3 text-blue-600" /> School Insights
              </h3>

              <motion.div variants={sectionChildrenVariants}>
                {school.rating && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-1">
                      <Star size={20} className="mr-2 text-blue-500" /> Average Rating:
                    </h4>
                    <StarRating rating={school.rating} />
                  </div>
                )}

                {school.reviews && school.reviews.length > 0 ? (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <User size={20} className="mr-2 text-blue-500" /> Top Reviews:
                    </h4>
                    <ul className="space-y-4 max-h-64 md:max-h-80 overflow-y-auto pr-3 custom-scrollbar">
                      {school.reviews.slice(0, 5).map((review, i) => (
                        <motion.li
                          key={i}
                          className="border border-gray-100 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 shadow-sm"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08, type: 'spring', stiffness: 100, damping: 10 }}
                        >
                          <div className="flex items-center mb-2">
                            {review.profile_photo_url && (
                              <img
                                src={review.profile_photo_url}
                                alt={review.author_name || 'Reviewer'}
                                className="w-8 h-8 rounded-full mr-3 object-cover"
                                onError={(e) => e.target.src = 'https://placehold.co/32x32/d1d5db/374151?text=NA'}
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-800">
                                {review.author_name || 'Anonymous User'}
                              </p>
                              <StarRating rating={review.rating} />
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 italic leading-relaxed">
                            "{review.text || "No review text provided."}"
                          </p>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <motion.div
                    className="text-center text-gray-500 py-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No reviews found for this school.
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SchoolDetailModal;