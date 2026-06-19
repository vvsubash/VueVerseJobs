// State code to full state name mapping
export const stateMap: Record<string, string> = {
  "KA": "Karnataka",
  "MH": "Maharashtra",
  "GJ": "Gujarat",
  "TN": "Tamil Nadu",
  "TS": "Telangana",
  "DL": "Delhi",
  "UP": "Uttar Pradesh",
  "CH": "Chandigarh",
  "OR": "Odisha",
  "KL": "Kerala",
  "PB": "Punjab",
  "UL": "Uttarakhand",
  "CT": "Chhattisgarh",
  "RJ": "Rajasthan",
  "HR": "Haryana",
  "AP": "Andhra Pradesh",
  "WB": "West Bengal"
};

// Top Indian tech cities to state mapping
export const cityToStateMap: Record<string, string> = {
  "bengaluru": "Karnataka",
  "bangalore": "Karnataka",
  "mumbai": "Maharashtra",
  "pune": "Maharashtra",
  "hyderabad": "Telangana",
  "secunderabad": "Telangana",
  "chennai": "Tamil Nadu",
  "noida": "Uttar Pradesh",
  "gurgaon": "Haryana",
  "gurugram": "Haryana",
  "faridabad": "Haryana",
  "ghaziabad": "Uttar Pradesh",
  "new delhi": "Delhi",
  "delhi": "Delhi",
  "kolkata": "West Bengal",
  "ahmedabad": "Gujarat",
  "gandhinagar": "Gujarat",
  "vadodara": "Gujarat",
  "rajkot": "Gujarat",
  "surat": "Gujarat",
  "jaipur": "Rajasthan",
  "coimbatore": "Tamil Nadu",
  "kochi": "Kerala",
  "cochin": "Kerala",
  "trivandrum": "Kerala",
  "thiruvananthapuram": "Kerala",
  "bhubaneswar": "Odisha",
  "mohali": "Punjab",
  "chandigarh": "Chandigarh",
  "indore": "Madhya Pradesh",
  "bhopal": "Madhya Pradesh"
};

// Location parser helper
export const parseLocation = (locStr: string) => {
  if (!locStr || locStr === "N/A" || locStr === "nan" || locStr.toLowerCase().includes("remote")) {
    return { city: null, state: null };
  }
  
  const parts = locStr.split(",").map(p => p.trim());
  let city: string | null = null;
  let state: string | null = null;
  
  if (parts.length >= 3) {
    city = parts[0];
    state = parts[1];
  } else if (parts.length === 2) {
    const part0 = parts[0];
    const part1 = parts[1];
    
    if (part1.toUpperCase() === "IN") {
      if (stateMap[part0.toUpperCase()]) {
        state = stateMap[part0.toUpperCase()];
      } else {
        city = part0;
      }
    } else {
      city = part0.replace(/division|district|city/gi, "").trim();
      state = part1;
    }
  } else if (parts.length === 1) {
    const p = parts[0].toLowerCase();
    if (p.includes("district") || p.includes("division") || p.includes("mandal") || p.includes("city")) {
      city = parts[0].replace(/division|district|mandal|city/gi, "").trim();
    } else {
      const stateName = Object.values(stateMap).find(s => s.toLowerCase() === p);
      if (stateName) {
        state = stateName;
      } else {
        city = parts[0];
      }
    }
  }
  
  // Standardize state
  if (state) {
    const upperState = state.toUpperCase();
    if (stateMap[upperState]) {
      state = stateMap[upperState];
    } else {
      // Capitalize state name
      state = state.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
  }
  
  // Auto-assign state from city if state is missing
  if (city && !state) {
    const cityLower = city.toLowerCase().replace(/division|district|mandal|city/gi, "").trim();
    if (cityToStateMap[cityLower]) {
      state = cityToStateMap[cityLower];
    }
  }
  
  // Clean city name
  if (city) {
    city = city.replace(/division|district|mandal|city/gi, "").trim();
    city = city.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  
  return { city, state };
};
