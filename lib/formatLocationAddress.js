// Shared address formatting utility 
// Accepts a Google Place Details object or Geocoder result

export function formatLocationAddress(place) {
  // Support both address_components (legacy) and addressComponents (new API)
  const addressComponents = place.address_components || place.addressComponents || [];
  if (!addressComponents.length) {
    return {
      address: place.formatted_address || place.name || "",
      components: {},
    };
  }

  const getComponent = (type) => {
    const comp = addressComponents.find((c) => {
      const types = c.types || c.type || [];
      return Array.isArray(types) ? types.includes(type) : types === type;
    });
    return comp ? (comp.long_name || comp.longName || comp.longText || "") : "";
  };

  const getAllComponents = (type) => {
    return addressComponents
      ? addressComponents.filter((c) => {
          const types = c.types || c.type || [];
          return Array.isArray(types) ? types.includes(type) : types === type;
        }).map((c) => c.long_name || c.longName || c.longText || "")
      : [];
  };

  // Priority: premise > neighborhood > sector+subCity > sector > subCity > route > fallback
  const premise = getComponent("premise");
  const neighborhood = getComponent("neighborhood");
  const allSublocalities = [
    ...getAllComponents("sublocality"),
    ...getAllComponents("sublocality_level_1"),
    ...getAllComponents("sublocality_level_2"),
    ...getAllComponents("sublocality_level_3"),
    ...getAllComponents("sublocality_level_4"),
  ];
  let sector = allSublocalities.find((part) => /^Sector\s*\d+/i.test(part));
  let subCity = allSublocalities.find((part) => part && !/^Sector\s*\d+/i.test(part));
  let route = getComponent("route");
  let fallback = place.name || "";

  let address = "";
  if (premise) {
    address = premise;
  } else if (neighborhood) {
    address = neighborhood;
  } else if (sector && subCity) {
    address = `${sector}, ${subCity}`;
  } else if (sector) {
    address = sector;
  } else if (subCity) {
    address = subCity;
  } else if (route) {
    address = route;
  } else {
    address = fallback;
  }

  let city = getComponent("locality");
  if (!city) city = getComponent("administrative_area_level_2");
  if (!city) city = getComponent("administrative_area_level_1");
  const pinCode = getComponent("postal_code");
  const state = getComponent("administrative_area_level_1");

  // Compose full address string
  let fullAddress = address;
  if (city) fullAddress += `, ${city}`;
  if (state) fullAddress += `, ${state}`;
  if (pinCode) fullAddress += `, ${pinCode}`;

  return {
    address: fullAddress,
    components: {
      premise,
      route,
      neighborhood,
      sublocality: subCity || "",
      locality: address, // The best locality identifier based on priority
      city: city || "",
      state: state || "",
      pinCode: pinCode || "",
    },
  };
}
