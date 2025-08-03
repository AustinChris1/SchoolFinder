import React, { useEffect, useState } from 'react';
import { useJsApiLoader, AutocompleteService, PlacesService, getDistance } from '@react-google-maps/api';

export default function SchoolInfoWindowContent({ school, userLocation }) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [rating, setRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    service.findPlaceFromQuery(
      { query: school.address, fields: ['place_id'] },
      (p, status) => {
        if (status === 'OK' && p.length) {
          service.getDetails(
            { placeId: p[0].place_id, fields: ['photos', 'rating', 'reviews', 'name', 'geometry'] },
            (d, s2) => {
              if (s2 === 'OK') {
                if (d.photos?.length)
                  setPhotoUrl(d.photos[0].getUrl());
                setRating(d.rating);
                setReviews(d.reviews?.slice(0, 2) || []);
                if (userLocation && d.geometry?.location) {
                  const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
                    new window.google.maps.LatLng(userLocation),
                    d.geometry.location
                  );
                  setDistance((dist / 1000).toFixed(2));
                }
              }
            }
          );
        }
      }
    );
  }, [school, userLocation]);

  return (
    <div style={{ maxWidth: '300px' }}>
      <h3 className="text-lg font-bold mb-1">{school.school_name}</h3>
      {photoUrl && <img src={photoUrl} alt={school.school_name} className="w-full rounded mb-2" />}
      {rating != null && <p>⭐ Rating: {rating}</p>}
      {reviews.map((r, i) => (
        <div key={i} className="mt-1 p-2 bg-gray-100 rounded">
          <p className="font-semibold">{r.author_name}:</p>
          <p className="text-sm">"{r.text}"</p>
        </div>
      ))}
      {distance && <p className="mt-2">📍 {distance} km away</p>}
    </div>
  );
}
