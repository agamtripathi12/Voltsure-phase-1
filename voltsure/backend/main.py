from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.simulator import battery
from backend.intelligence import analyze_battery
import os

from backend.database import (
    initialize_database,
    register_battery,
    save_reading,
    get_battery_history
)

app = FastAPI(
    title="VoltSure API",
    description="EV Battery Intelligence & Lifecycle Platform",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the existing frontend from the same public server.
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

# Initialize database
initialize_database()

# Register demo battery
register_battery("VS-BAT-00127")


@app.get("/")
def root():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))


@app.get("/health")
def health():
    return {
        "product": "VoltSure",
        "status": "online",
        "message": "Battery intelligence system is running"
    }


@app.get("/style.css")
def style():
    return FileResponse(os.path.join(FRONTEND_DIR, "style.css"))


@app.get("/app.js")
def app_js():
    return FileResponse(os.path.join(FRONTEND_DIR, "app.js"), media_type="application/javascript")


@app.get("/api/battery")
def get_battery():
    # Generate new BMS reading
    battery_data = battery.generate_reading()

    # Save reading into database
    save_reading(battery_data)

    # Analyze battery
    intelligence = analyze_battery(battery_data)

    return {
        **battery_data,
        **intelligence
    }



@app.get("/api/battery/history")
def battery_history():
    history = get_battery_history("VS-BAT-00127")

    readings = []

    for row in history:
        readings.append({
            "timestamp": row[0],
            "voltage": row[1],
            "current": row[2],
            "temperature": row[3],
            "soc": row[4],
            "soh": row[5]
        })

    return {
        "battery_id": "VS-BAT-00127",
        "readings": readings
    }
    
@app.get("/api/battery/passport")
def battery_passport():
    return {
        "battery_id": "VS-BAT-00127",
        "manufacturer": "VoltSure Demo Motors",
        "chemistry": "LFP",
        "manufacturing_date": "2026-01-15",
        "current_soh": battery.soh,
        "cycle_count": battery.cycle_count,
        "lifecycle_status": "IN SERVICE",
        "safety_status": "SAFE",
        "second_life_status": "NOT YET ELIGIBLE",
        "passport_version": "1.0"
    }