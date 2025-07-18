// Simple test to see if Google Maps API is loading
console.log("Testing Google Maps API...");

// Check if API is loaded
if (window.google && window.google.maps) {
  console.log("✓ Google Maps API is loaded");
  
  // Check if Places library is available
  if (window.google.maps.places) {
    console.log("✓ Places library is available");
  } else {
    console.log("✗ Places library is NOT available");
  }
} else {
  console.log("✗ Google Maps API is NOT loaded");
}

// Test dynamic import
try {
  window.google.maps.importLibrary("places").then((placesLib) => {
    console.log("✓ Dynamic import successful:", placesLib);
  }).catch((error) => {
    console.log("✗ Dynamic import failed:", error);
  });
} catch (error) {
  console.log("✗ Dynamic import not supported:", error);
}
