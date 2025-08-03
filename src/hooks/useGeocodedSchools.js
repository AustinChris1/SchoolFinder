// src/hooks/useGeocodedSchools.js
import { useState, useEffect, useCallback } from 'react';


  const useGeocodedSchools = (schools) => {
    const [geocodedSchools, setGeocodedSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      let isCancelled = false; // To prevent state updates on unmounted components
  
      const fetchSchoolLocations = async () => {
        setLoading(true);
        setError(null);
        setGeocodedSchools([]); // Clear previous results
  
        if (!schools || schools.length === 0) {
          setLoading(false);
          return;
        }
  
        try {
          // Ensure Google Maps API and Places library are loaded
          if (!window.google || !window.google.maps || !window.google.maps.importLibrary) {
            throw new Error("Google Maps API not loaded or 'places' library not imported. Make sure the script is loaded with libraries=places.");
          }
          const { Place } = await google.maps.importLibrary('places');
  
          const geocodingPromises = schools.map(async (school) => {
            if (isCancelled) return null; // Abort if hook unmounts
  
            // Construct the query for Google Places API
            const query = school.address // Prefer specific address if available
              ? `${school.school_name}, ${school.address}, Nigeria`
              : `${school.school_name}, ${school.lga}, ${school.state}, Nigeria`;
  
            const request = {
              textQuery: query,
              // CORRECTED: Request 'location' as a top-level field for the new Places API
              fields: ['displayName', 'formattedAddress', 'location'],
            };
  
            try {
              const { places } = await Place.searchByText(request);
              if (places && places.length > 0) {
                const mainPlace = places[0];
                // CORRECTED ACCESS: Use .lat() and .lng() methods on the LatLng object returned by mainPlace.location
                if (mainPlace.location) { // Check if location object exists
                  return {
                    ...school,
                    lat: mainPlace.location.lat(),  // <-- Use lat() method
                    lng: mainPlace.location.lng(), // <-- Use lng() method
                    // Optionally store the Google Maps' version of address and display name
                    googleMapsFormattedAddress: mainPlace.formattedAddress,
                    googleMapsDisplayName: mainPlace.displayName,
                  };
                }
              }
              // If no place found or no valid location, return school with undefined lat/lng
              console.warn(`Could not geocode '${school.school_name}'. No precise location found.`);
              return { ...school, lat: undefined, lng: undefined, geocodeFailure: true };
            } catch (placeErr) {
              console.warn(`Error geocoding school '${school.school_name}':`, placeErr);
              return { ...school, lat: undefined, lng: undefined, geocodeError: placeErr.message };
            }
          });
  
          // Execute all geocoding requests in parallel
          const results = await Promise.all(geocodingPromises);
  
          if (!isCancelled) {
            // Filter out any nulls that might result from cancelled promises
            setGeocodedSchools(results.filter(school => school !== null));
          }
        } catch (err) {
          console.error('General Google Maps Geocoding API Error:', err);
          if (!isCancelled) {
            setError(`Could not fetch school locations: ${err.message}. Ensure Places API (New) is enabled and API key is valid.`);
          }
        } finally {
          if (!isCancelled) {
            setLoading(false);
          }
        }
      };
  
      // Trigger geocoding whenever the list of schools changes
      fetchSchoolLocations();
  
      // Cleanup function to cancel ongoing operations if component unmounts
      return () => {
        isCancelled = true;
      };
    }, [schools]); // Dependency array: re-run if 'schools' array reference changes
  
    return { geocodedSchools, loading, error };
  };
  
  export default useGeocodedSchools;