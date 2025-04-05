from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import requests
import pandas as pd
import os

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "http://localhost:5000"}})

# File paths
model_path = "C:/Users/Dell/MineGuardV2/mineguard_backend/random_forest_model1.pkl"
data_path = "C:/Users\Dell/MineGuardV2/mineguard_backend/preprocessed_data.csv"

# Check if files exist
if not os.path.exists(model_path):
    print(f"❌ Model file not found at {model_path}")
    exit(1)

if not os.path.exists(data_path):
    print(f"❌ Dataset file not found at {data_path}")
    exit(1)

# Load model and dataset
model = joblib.load(model_path)
df = pd.read_csv(data_path)

# Print dataset columns for debugging
print("🔍 Columns in dataset:", df.columns)

# API key
API_KEY = os.getenv("OPENWEATHER_API_KEY", "97582d94e3124a6bfce133522e843c7c")

# Weather data
def get_weather_data(lat, lon):
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

# AQI data
def get_aqi_data(lat, lon):
    try:
        url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

# Get mine data
# Get mine data
def get_mine_data(mine_name):
    mine_data = df[df["mine_name"].str.lower() == mine_name.lower()]
    if not mine_data.empty:
        return mine_data.iloc[0]
    return None

# Predict route
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        mine_name = data.get('mine_name')

        # Load your preprocessed data
        df = pd.read_csv("preprocessed_data.csv")

        # Filter the data for the mine
        mine_row = df[df['mine_name'].str.lower() == mine_name.lower()]
        if mine_row.empty:
            return jsonify({"error": "Mine name not found"}), 404

        # Fetch required fields
        depth = float(mine_row['depth'].values[0])
        seismic_magnitude = float(mine_row['Seismic_Magnitude'].values[0])
        humidity = float(mine_row['humidity'].values[0])
        temp = float(mine_row['temperature'].values[0])
        co = float(mine_row['CO'].values[0])
        pm2_5 = float(mine_row['PM2.5'].values[0])
        pm10 = float(mine_row['PM10'].values[0])
        hazard = str(mine_row['hazard_type'].values[0])  # Use from CSV directly

        # Create response
        response = {
            "mine_data": {
                "depth": depth,
                "seismic_activity": seismic_magnitude
            },
            "weather": {
                "humidity": humidity,
                "temp": temp
            },
            "aqi": {
                "co": co,
                "pm2_5": pm2_5,
                "pm10": pm10
            },
            "hazard": hazard  # directly from CSV, no ML model involved
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
CORS(app)
if __name__ == '__main__':
    app.run(debug=True, port=5000)
