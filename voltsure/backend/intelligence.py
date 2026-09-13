def analyze_battery(data):
    temperature = data["temperature"]
    soh = data["soh"]
    voltage = data["voltage"]
    current = data["current"]

    alerts = []
    risk_score = 0

    # Temperature analysis
    if temperature >= 50:
        alerts.append("Critical battery temperature detected")
        risk_score += 50

    elif temperature >= 45:
        alerts.append("High battery temperature detected")
        risk_score += 30

    elif temperature >= 40:
        alerts.append("Temperature is above normal range")
        risk_score += 15

    # Battery health analysis
    if soh < 70:
        alerts.append("Battery health is critically degraded")
        risk_score += 40

    elif soh < 80:
        alerts.append("Battery degradation detected")
        risk_score += 25

    elif soh < 90:
        alerts.append("Moderate battery degradation")
        risk_score += 10

    # Voltage analysis
    if voltage < 45:
        alerts.append("Abnormally low battery voltage")
        risk_score += 25

    # Current analysis
    if current > 35:
        alerts.append("High current detected")
        risk_score += 20

    # Overall risk
    if risk_score >= 50:
        risk_level = "CRITICAL"
        health_status = "IMMEDIATE INSPECTION"

    elif risk_score >= 30:
        risk_level = "HIGH"
        health_status = "ATTENTION REQUIRED"

    elif risk_score >= 15:
        risk_level = "MEDIUM"
        health_status = "MONITOR"

    else:
        risk_level = "LOW"
        health_status = "HEALTHY"

    # Prototype degradation estimate
    degradation_rate = round((100 - soh) / max(data["cycle_count"], 1) * 100, 2)

    return {
        "risk_level": risk_level,
        "health_status": health_status,
        "risk_score": risk_score,
        "alerts": alerts,
        "degradation_rate": degradation_rate
    }