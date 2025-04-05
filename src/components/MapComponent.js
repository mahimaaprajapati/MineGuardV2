import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";
import Papa from "papaparse";

// Fix marker icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Fly to new location
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.flyTo(center, 10, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const SearchBox = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a mine name.");
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "MineGuard (mahimaaprajapati@gmail.com)",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch location data.");

      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        onSearch([parseFloat(lat), parseFloat(lon)], query);
        setError(null);
      } else {
        setError("Mine location not found! Try another name.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching location data.");
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search for a mine..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="search-btn" onClick={handleSearch}>🔍</button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

const PredictionData = ({ data, isLoading, error }) => (
  <div className="prediction-panel">
    <h3>📊 Prediction Data</h3>
    {isLoading ? (
      <p>Loading data...</p>
    ) : error ? (
      <p className="error-message">{error}</p>
    ) : data ? (
      <>
        <p><strong>🌦️ Weather:</strong> Temp: {data.weather?.temp}°C, Humidity: {data.weather?.humidity}%</p>
        <p><strong>🌍 AQI:</strong> CO: {data.aqi?.co}, PM2.5: {data.aqi?.pm2_5}, PM10: {data.aqi?.pm10}</p>
        <p><strong>🌋 Seismic Activity:</strong> {data.mine_data?.seismic_activity}</p>
        <p><strong>🛑 Hazard Type:</strong> {data.hazard}</p>
      </>
    ) : (
      <p>No data available yet.</p>
    )}
  </div>
);

const MapComponent = () => {
  const [center, setCenter] = useState([20.5937, 78.9629]);
  const [markerPosition, setMarkerPosition] = useState([20.5937, 78.9629]);
  const [mineName, setMineName] = useState("");
  const [predictionData, setPredictionData] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Papa.parse("/data/preprocessed_data.csv", {
      download: true,
      header: true,
      complete: (results) => {
        setCsvData(results.data);
        console.log("Loaded CSV:", results.data);
      },
      error: (err) => {
        console.error("CSV load error:", err);
        setError("Failed to load mine data.");
      },
    });
  }, []);

  const handleSearch = (coords, query) => {
    setCenter(coords);
    setMarkerPosition(coords);

    const searchTerm = query.toLowerCase().trim();
    setMineName(query);

    const matched = csvData.find((item) =>
      item.mine_name?.toLowerCase().trim().includes(searchTerm)
    );

    if (matched) {
      const prediction = {
        weather: {
          temp: matched.temperature,
          humidity: matched.humidity,
        },
        aqi: {
          co: matched.co,
          pm2_5: matched.pm2_5,
          pm10: matched.pm10,
        },
        mine_data: {
          seismic_activity: matched.seismic_activity,
        },
        hazard: matched.hazard_type,
      };

      setPredictionData(prediction);
      setError(null);
    } else {
      setPredictionData(null);
      setError("No prediction data found for this mine.");
    }
  };

  return (
    <div className="map-container">
      <SearchBox onSearch={handleSearch} />
      <div className="map-content">
        <MapContainer center={center} zoom={10} style={{ height: "100vh", width: "75%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={markerPosition}>
            <Popup>{mineName}</Popup>
          </Marker>
          <MapUpdater center={center} />
        </MapContainer>
        <PredictionData data={predictionData} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
};

export default MapComponent;
