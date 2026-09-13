import random
from datetime import datetime


class BatterySimulator:

    def __init__(self):
        self.soc = 74.0
        self.soh = 91.0
        self.cycle_count = 486

        self.temperature = 34.8
        self.voltage = 51.8
        self.current = 12.4

        # Battery operating mode
        self.mode = "discharging"

        # General battery platform
        self.battery_type = "EV"


    def generate_reading(self):

        # ==========================================
        # SOC
        # ==========================================

        if self.mode == "discharging":

            # Very slow discharge for realistic simulation
            self.soc -= random.uniform(0.001, 0.004)

        elif self.mode == "charging":

            # Slow charging
            self.soc += random.uniform(0.002, 0.006)

        # Keep SOC between 0 and 100
        self.soc = max(0, min(self.soc, 100))


        # ==========================================
        # CURRENT
        # ==========================================

        if self.mode == "discharging":

            self.current += random.uniform(-0.8, 0.8)

        else:

            self.current += random.uniform(-0.6, 0.6)


        self.current = max(0, min(self.current, 40))


        # ==========================================
        # TEMPERATURE
        # ==========================================

        # Temperature changes gradually
        self.temperature += random.uniform(-0.15, 0.2)

        self.temperature = max(
            20,
            min(self.temperature, 60)
        )


        # ==========================================
        # VOLTAGE
        # ==========================================

        # Small voltage fluctuation
        self.voltage += random.uniform(-0.06, 0.06)

        self.voltage = max(
            45,
            min(self.voltage, 54)
        )


        # ==========================================
        # BATTERY HEALTH
        # ==========================================

        # SOH changes extremely slowly
        # so it behaves like a real long-term metric

        if random.random() < 0.002:

            self.soh -= 0.01

        self.soh = max(
            0,
            min(self.soh, 100)
        )


        # ==========================================
        # CYCLE COUNT
        # ==========================================

        # Cycle count only changes after meaningful
        # battery usage, not every dashboard refresh.

        if self.soc <= 10:

            self.cycle_count += 1

            self.soc = 100


        # ==========================================
        # OUTPUT
        # ==========================================

        return {

            "battery_id": "VS-BAT-00127",

            "battery_type": self.battery_type,

            "timestamp":
                datetime.now().isoformat(),

            "voltage":
                round(self.voltage, 2),

            "current":
                round(self.current, 2),

            "temperature":
                round(self.temperature, 2),

            "soc":
                round(self.soc, 2),

            "soh":
                round(self.soh, 2),

            "cycle_count":
                self.cycle_count,

            "operating_mode":
                self.mode
        }


battery = BatterySimulator()