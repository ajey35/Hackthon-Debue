import React, { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  Autocomplete,
  Marker,
} from "@react-google-maps/api";

const libraries = ["places"];
const mapContainerStyle = {
  height: "400px",
  width: "50%",
};
const defaultCenter = { lat: 40.7128, lng: -74.006 }; // Example center (New York)

const AutoCompleteAddress = () => {
  const [address, setAddress] = useState(""); // Store selected address
  const [coordinates, setCoordinates] = useState(defaultCenter); // Store coordinates for the map center
  const [clickedPosition, setClickedPosition] = useState(null); // Marker position
  const [currentLocation, setCurrentLocation] = useState(null); // Store user's current location
  const autocompleteRef = useRef(null); // Reference for the autocomplete

  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyD0V20e7IgJ_iDfUp8J5TqyPs6l-4TGT3c", // Replace with your API key
    libraries,
  });

  // Get current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setCoordinates({ lat: latitude, lng: longitude }); // Center map at user's location
        },
        (error) => {
          console.error("Error fetching current location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  // Handle loading errors
  if (loadError) {
    return <div>Error loading Google Maps script: {loadError.message}</div>;
  }

  // Show loading message until the script is loaded
  if (!isLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  // Handle address selection from autocomplete
  const handlePlaceChange = () => {
    const place = autocompleteRef.current.getPlace();
    setAddress(place?.formatted_address || "Address not found");
    const location = place?.geometry?.location;
    if (location) {
      setCoordinates({
        lat: location.lat(),
        lng: location.lng(),
      });
      setClickedPosition(null); // Clear the marker from map click
    }
  };

  // Handle map clicks to set markers
  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setClickedPosition({ lat, lng }); // Set marker at the clicked position
    setCoordinates({ lat, lng }); // Update the map center

    try {
      // Fetch address using Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyD0V20e7IgJ_iDfUp8J5TqyPs6l-4TGT3c`
      );
      const data = await response.json();
      const clickedAddress =
        data?.results[0]?.formatted_address || "Address not found";
      setAddress(clickedAddress); // Update address in the input
    } catch (error) {
      console.error("Geocoding failed:", error.message);
      setAddress("Address not found");
    }
  };

  // Handle "Use Current Location" button click
  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setCoordinates(currentLocation); // Set the map center to current location
      setAddress("Current Location"); // Set the address input to "Current Location"
    } else {
      alert("Current location is not available.");
    }
  };

  return (
    <div>
      <h2>Address AutoComplete & Map Click</h2>

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

      {/* Single Button to use current location */}
      <button
        onClick={handleUseCurrentLocation}
        style={{
          marginLeft: '10px',
          marginTop:"10px",
          backgroundColor: '#4285F4', // Google blue color
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '10px 15px',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#357ae8'; // Darker blue on hover
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#4285F4'; // Reset to original blue
        }}
      >
        Use Current Location
      </button>

      <p>Selected Address: {address}</p>

      {/* Google Map Component */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={coordinates}
        zoom={12}
        onClick={handleMapClick} // Handle map clicks
      >
        {/* Add a marker at the clicked position */}
        {clickedPosition && (
          <Marker
            position={clickedPosition} // Marker location
            icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png" // Standard Google red marker icon
          />
        )}

        {/* Add a marker for the current location */}
        {currentLocation && (
          <Marker
            position={currentLocation} // User's current location
            icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" // Blue marker for current location
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default AutoCompleteAddress;
