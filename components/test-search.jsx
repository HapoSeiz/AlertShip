// Test the search functionality directly
export default function TestSearch() {
  const testSearch = async () => {
    console.log("Testing search...");
    
    // Check if Google Maps API is loaded
    if (!window.google?.maps) {
      console.error("Google Maps API not loaded!");
      return;
    }
    
    try {
      // Import the Places library
      const { AutocompleteService, AutocompleteSessionToken } = await window.google.maps.importLibrary("places");
      
      // Create service and session token
      const service = new AutocompleteService();
      const sessionToken = new AutocompleteSessionToken();
      
      // Test request
      const request = {
        input: "Gurgaon",
        types: ["locality", "sublocality", "administrative_area_level_1", "administrative_area_level_2"],
        componentRestrictions: { country: "IN" },
        sessionToken: sessionToken
      };
      
      console.log("Making request:", request);
      
      service.getPlacePredictions(request, (predictions, status) => {
        console.log("Status:", status);
        console.log("Predictions:", predictions);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          console.log("Success! Found", predictions.length, "predictions");
          predictions.forEach((prediction, index) => {
            console.log(`${index + 1}. ${prediction.description} (${prediction.place_id})`);
          });
        } else {
          console.error("Failed to get predictions:", status);
        }
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  return (
    <div>
      <h1>Test Search</h1>
      <button onClick={testSearch}>Test Search</button>
    </div>
  );
}
