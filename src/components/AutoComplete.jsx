import React, { useState, useRef } from "react";
import { GoogleMap, useLoadScript, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"];
const mapContainerStyle = {
  height: "300px",
  width: "100%",
};
const defaultCenter = { lat: 40.7128, lng: -74.006 }; // Example center (New York)

const AutoCompleteAddress = () => {
  const [address, setAddress] = useState(""); // Store selected address
  const [coordinates, setCoordinates] = useState(defaultCenter); // Store user's location
  const autocompleteRef = useRef(null); // Reference for the autocomplete
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyD0V20e7IgJ_iDfUp8J5TqyPs6l-4TGT3c", // Replace with your API key
    libraries,
  });

  if (loadError) {
    return <div>Error loading Google Maps script: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  const handlePlaceChange = () => {
    const place = autocompleteRef.current.getPlace();
    setAddress(place?.formatted_address || "Address not found");
    const location = place?.geometry?.location;
    if (location) {
      setCoordinates({
        lat: location.lat(),
        lng: location.lng(),
      });
    }
  };

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });

          // Fetch address using Geocoding API
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyD0V20e7IgJ_iDfUp8J5TqyPs6l-4TGT3c`
          );
          const data = await response.json();
          const currentAddress = data?.results[0]?.formatted_address || "Address not found";
          setAddress(currentAddress);
        },
        (error) => {
          console.error("Error fetching location:", error.message);
          alert("Unable to fetch current location. Please try again.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div>
      <h2>Address AutoComplete</h2>

      {/* Autocomplete Input */}
      <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={handlePlaceChange}
      >
        <input
          type="text"
          placeholder="Enter an address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            width: "300px",
            height: "40px",
            fontSize: "16px",
            padding: "0 10px",
          }}
        />
      </Autocomplete>

      {/* Button to Get Current Location */}
      <button
        onClick={fetchCurrentLocation}
        style={{
          marginLeft: "10px",
          height: "40px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Use Current Location
      </button>

      <p>Selected Address: {address}</p>

      {/* Map Display */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={coordinates}
        zoom={12}
      >
        {/* Add a marker at the user's location */}
        {coordinates && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "red",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default AutoCompleteAddress;
