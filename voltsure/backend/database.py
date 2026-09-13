import sqlite3
from datetime import datetime


DATABASE_NAME = "voltsure.db"


def get_connection():
    return sqlite3.connect(DATABASE_NAME)


def initialize_database():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS batteries (
            battery_id TEXT PRIMARY KEY,
            manufacturer TEXT,
            chemistry TEXT,
            manufacturing_date TEXT,
            soh REAL,
            cycle_count INTEGER,
            created_at TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS battery_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            battery_id TEXT,
            timestamp TEXT,
            voltage REAL,
            current REAL,
            temperature REAL,
            soc REAL,
            soh REAL
        )
    """)

    connection.commit()
    connection.close()


def register_battery(
    battery_id,
    manufacturer="VoltSure Demo Motors",
    chemistry="LFP",
    manufacturing_date="2026-01-15"
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT OR IGNORE INTO batteries
        (battery_id, manufacturer, chemistry, manufacturing_date,
         soh, cycle_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        battery_id,
        manufacturer,
        chemistry,
        manufacturing_date,
        91.0,
        486,
        datetime.now().isoformat()
    ))

    connection.commit()
    connection.close()


def save_reading(data):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO battery_readings
        (battery_id, timestamp, voltage, current,
         temperature, soc, soh)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data["battery_id"],
        data["timestamp"],
        data["voltage"],
        data["current"],
        data["temperature"],
        data["soc"],
        data["soh"]
    ))

    connection.commit()
    connection.close()


def get_battery_history(battery_id):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT timestamp, voltage, current,
               temperature, soc, soh
        FROM battery_readings
        WHERE battery_id = ?
        ORDER BY id DESC
        LIMIT 50
    """, (battery_id,))

    readings = cursor.fetchall()
    connection.close()

    return readings