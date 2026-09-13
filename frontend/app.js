const API_URL = window.location.origin;

let voltageHistory = [];
let temperatureHistory = [];


// ================= BATTERY DATA =================

async function loadBatteryData() {
    try {
        const response = await fetch(`${API_URL}/api/battery`);

        if (!response.ok) {
            throw new Error("Battery API failed");
        }

        const data = await response.json();

        updateDashboard(data);

        // Add latest readings to graph
        voltageHistory.push(Number(data.voltage));
        temperatureHistory.push(Number(data.temperature));

        // Keep last 30 readings
        if (voltageHistory.length > 30) {
            voltageHistory.shift();
        }

        if (temperatureHistory.length > 30) {
            temperatureHistory.shift();
        }

        drawGraph();

    } catch (error) {
        console.error("VoltSure API Error:", error);

        document.getElementById("alert-message").textContent =
            "Unable to connect to VoltSure API.";
    }
}


// ================= DASHBOARD =================

function updateDashboard(data) {

    document.getElementById("soh").textContent =
        Number(data.soh).toFixed(1);

    document.getElementById("soc").textContent =
        Number(data.soc).toFixed(1);

    document.getElementById("temperature").textContent =
        Number(data.temperature).toFixed(1);

    document.getElementById("cycles").textContent =
        data.cycle_count;

    document.getElementById("soc-bar").style.width =
        `${data.soc}%`;

    document.getElementById("voltage").textContent =
        Number(data.voltage).toFixed(2);

    document.getElementById("current").textContent =
        Number(data.current).toFixed(2);

    document.getElementById("temp-bottom").textContent =
        Number(data.temperature).toFixed(1);

    document.getElementById("risk-score").textContent =
        data.risk_score;

    document.getElementById("risk-level").textContent =
        data.risk_level;

    document.getElementById("health-status").textContent =
        data.health_status;

    updateAlerts(data.alerts);

    const timestamp = new Date(data.timestamp);

    document.getElementById("last-updated").textContent =
        `Last updated: ${timestamp.toLocaleTimeString()}`;
}


// ================= ALERTS =================

function updateAlerts(alerts) {

    const container =
        document.getElementById("alerts-container");

    const count =
        document.getElementById("alert-count");


    if (!alerts || alerts.length === 0) {

        count.textContent = "0";

        container.innerHTML = `
            <div class="empty-alert">

                <div>✓</div>

                <div>
                    <strong>No active alerts</strong>

                    <p>
                        Battery operating within normal parameters.
                    </p>
                </div>

            </div>
        `;

        return;
    }


    count.textContent = alerts.length;


    container.innerHTML = alerts.map(alert => `
        <div class="empty-alert">

            <div>!</div>

            <div>
                <strong>Battery Alert</strong>

                <p>${alert}</p>
            </div>

        </div>
    `).join("");
}


// ================= REAL GRAPH =================

function drawGraph() {

    const chart =
        document.querySelector(".chart-placeholder");

    if (!chart || voltageHistory.length < 2) {
        return;
    }


    const width = chart.clientWidth;
    const height = chart.clientHeight;

    const padding = 25;


    // Remove old graph lines
    chart.querySelectorAll(".real-graph").forEach(
        element => element.remove()
    );


    // Find voltage range
    const minVoltage =
        Math.min(...voltageHistory) - 1;

    const maxVoltage =
        Math.max(...voltageHistory) + 1;


    // Convert readings into SVG points
    const points = voltageHistory.map((value, index) => {

        const x =
            padding +
            (index / (voltageHistory.length - 1)) *
            (width - padding * 2);

        const y =
            height -
            padding -
            ((value - minVoltage) /
            (maxVoltage - minVoltage)) *
            (height - padding * 2);

        return `${x},${y}`;

    }).join(" ");


    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    svg.classList.add("real-graph");

    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.position = "absolute";
    svg.style.left = "0";
    svg.style.top = "0";


    const polyline =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polyline"
        );


    polyline.setAttribute("points", points);

    polyline.setAttribute(
        "fill",
        "none"
    );

    polyline.setAttribute(
        "stroke",
        "#17202a"
    );

    polyline.setAttribute(
        "stroke-width",
        "3"
    );

    polyline.setAttribute(
        "stroke-linecap",
        "round"
    );

    polyline.setAttribute(
        "stroke-linejoin",
        "round"
    );


    svg.appendChild(polyline);

    chart.appendChild(svg);
}


// ================= START =================

loadBatteryData();


// Update every 3 seconds
setInterval(loadBatteryData, 3000);

// ================= PAGE NAVIGATION =================

function showPage(page) {

   

    const mainContent = document.querySelector(".main");

    const overviewElements = [
        ".topbar",
        ".metrics",
        ".dashboard-grid",
        ".bottom-grid",
        "footer"
    ];

    const monitorPage = document.getElementById("monitor-page");
    const analyticsPage =
    document.getElementById("analytics-page");


    // Hide overview
    overviewElements.forEach(selector => {
        const element = document.querySelector(selector);

        if (element) {
            element.style.display = "none";
        }
    });

    // Hide monitor initially
    if (monitorPage) {
        monitorPage.style.display = "none";
    }
    if (analyticsPage) {
    analyticsPage.style.display = "none";
}


    // Show selected page
    if (page === "overview") {

        overviewElements.forEach(selector => {
            const element = document.querySelector(selector);

            if (element) {
                element.style.display = "";
            }
        });

        loadBatteryData();

    }

    else if (page === "monitor") {

        if (monitorPage) {
            monitorPage.style.display = "block";
        }

        loadMonitorData();

    }

    else if (page === "analytics") {

    const analyticsPage =
        document.getElementById("analytics-page");

    if (analyticsPage) {
        analyticsPage.style.display = "block";
    }

    loadAnalyticsData();

}
    

    else if (page === "passport") {

        alert("Battery Passport module — coming next");

    }


    // Update active sidebar item
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.classList.remove("active");
    });

    const selectedButton = Array.from(navItems).find(
        item => {
            const text = item.textContent.trim().toLowerCase();

            if (page === "overview") {
                return text.includes("overview");
            }

            if (page === "monitor") {
                return text.includes("battery monitor");
            }

            if (page === "analytics") {
                return text.includes("analytics");
            }

            if (page === "passport") {
                return text.includes("battery passport");
            }

            return false;
        }
    );

    if (selectedButton) {
        selectedButton.classList.add("active");
    }
}
   
// ================= MONITOR DATA =================

async function loadMonitorData() {

    try {

        const response =
            await fetch(`${API_URL}/api/battery`);

        if (!response.ok) {
            throw new Error("Monitor API failed");
        }

        const data = await response.json();


        document.getElementById("monitor-voltage").textContent =
            Number(data.voltage).toFixed(2);

        document.getElementById("monitor-current").textContent =
            Number(data.current).toFixed(2);

        document.getElementById("monitor-temperature").textContent =
            Number(data.temperature).toFixed(1);

        document.getElementById("monitor-soc").textContent =
            Number(data.soc).toFixed(1);

        document.getElementById("monitor-soh").textContent =
            Number(data.soh).toFixed(1);

        document.getElementById("monitor-cycles").textContent =
            data.cycle_count;


        document.getElementById("monitor-risk").textContent =
            `${data.risk_level} RISK`;

        document.getElementById("monitor-health").textContent =
            data.health_status;

        document.getElementById("monitor-risk-score").textContent =
            data.risk_score;


        updateMonitorAlerts(data.alerts);


    } catch (error) {

        console.error("Monitor Error:", error);

    }
}


// ================= MONITOR ALERTS =================

function updateMonitorAlerts(alerts) {

    const container =
        document.getElementById("monitor-alerts-container");


    if (!alerts || alerts.length === 0) {

        container.innerHTML = `
            <div class="empty-alert">

                <div>✓</div>

                <div>
                    <strong>No active alerts</strong>

                    <p>
                        Battery operating within normal parameters.
                    </p>
                </div>

            </div>
        `;

        return;
    }


    container.innerHTML = alerts.map(alert => `

        <div class="empty-alert">

            <div>!</div>

            <div>
                <strong>Battery Alert</strong>

                <p>${alert}</p>
            </div>

        </div>

    `).join("");
}
// ================= ANALYTICS =================

// ================= ANALYTICS =================

let analyticsReadings = [];

async function loadAnalyticsData() {

    try {

        const response =
            await fetch(`${API_URL}/api/battery/history`);

        if (!response.ok) {
            throw new Error("Analytics API failed");
        }

        const result = await response.json();

        analyticsReadings = result.readings || [];

        if (analyticsReadings.length === 0) {
            console.warn("No historical battery data");
            return;
        }

        // Oldest → newest
        const readings = analyticsReadings
            .slice()
            .reverse();

        const latest =
            readings[readings.length - 1];

        // ================= SUMMARY =================

        document.getElementById("analytics-soh").textContent =
            `${Number(latest.soh).toFixed(1)}%`;

        const degradation =
            Math.max(0, 100 - Number(latest.soh));

        document.getElementById("analytics-degradation").textContent =
            `${degradation.toFixed(1)}%`;

        document.getElementById("analytics-points").textContent =
            readings.length;


        // ================= CHARTS =================

        drawDetailedChart(
            "soh-chart",
            readings,
            "soh",
            "%",
            "State of Health"
        );

        drawDetailedChart(
            "temperature-chart",
            readings,
            "temperature",
            "°C",
            "Temperature"
        );

        drawDetailedChart(
            "soc-chart",
            readings,
            "soc",
            "%",
            "State of Charge"
        );

    } catch (error) {

        console.error("Analytics Error:", error);

    }
}


// ==================================================
// DETAILED BATTERY CHART
// ==================================================

function drawDetailedChart(
    canvasId,
    readings,
    valueKey,
    unit,
    label
) {

    const canvas =
        document.getElementById(canvasId);

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    const dpr =
        window.devicePixelRatio || 1;

    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // ------------------------------------------------
    // Use latest 60 points for readable visualization
    // ------------------------------------------------

    const data =
        readings.slice(-60);


    const values =
        data.map(
            item => Number(item[valueKey])
        );


    if (values.length < 2) {

        ctx.font = "14px Arial";
        ctx.fillText(
            "Waiting for historical data...",
            30,
            40
        );

        return;
    }


    // ------------------------------------------------
    // Chart dimensions
    // ------------------------------------------------

    const paddingLeft = 55;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 40;


    const chartWidth =
        width -
        paddingLeft -
        paddingRight;

    const chartHeight =
        height -
        paddingTop -
        paddingBottom;


    // ------------------------------------------------
    // Min / Max
    // ------------------------------------------------

    let minValue =
        Math.min(...values);

    let maxValue =
        Math.max(...values);


    // Add visual breathing room

    const range =
        maxValue - minValue || 1;

    minValue -= range * 0.15;
    maxValue += range * 0.15;


    // ------------------------------------------------
    // Background grid
    // ------------------------------------------------

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#e8edf1";

    const gridLines = 5;

    for (let i = 0; i <= gridLines; i++) {

        const y =
            paddingTop +
            (i / gridLines) *
            chartHeight;

        ctx.beginPath();

        ctx.moveTo(
            paddingLeft,
            y
        );

        ctx.lineTo(
            width - paddingRight,
            y
        );

        ctx.stroke();
    }


    // ------------------------------------------------
    // Y axis labels
    // ------------------------------------------------

    ctx.fillStyle = "#7b8794";
    ctx.font = "10px Arial";
    ctx.textAlign = "right";

    for (let i = 0; i <= gridLines; i++) {

        const value =
            maxValue -
            (i / gridLines) *
            (maxValue - minValue);

        const y =
            paddingTop +
            (i / gridLines) *
            chartHeight;

        ctx.fillText(
            `${value.toFixed(1)}${unit}`,
            paddingLeft - 8,
            y + 3
        );
    }


    // ------------------------------------------------
    // X axis labels
    // ------------------------------------------------

    ctx.textAlign = "center";
    ctx.fillStyle = "#8a96a3";

    const labelCount = 6;

    for (let i = 0; i < labelCount; i++) {

        const index =
            Math.floor(
                (i / (labelCount - 1)) *
                (data.length - 1)
            );

        const item =
            data[index];

        const x =
            paddingLeft +
            (index / (data.length - 1)) *
            chartWidth;

        const date =
            new Date(item.timestamp);

        const time =
            date.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );

        ctx.fillText(
            time,
            x,
            height - 15
        );
    }


    // ------------------------------------------------
    // Chart line
    // ------------------------------------------------

    ctx.strokeStyle = "#17202a";
    ctx.lineWidth = 2.5;

    ctx.beginPath();

    values.forEach(
        (value, index) => {

            const x =
                paddingLeft +
                (index / (values.length - 1)) *
                chartWidth;

            const y =
                paddingTop +
                (
                    (maxValue - value) /
                    (maxValue - minValue)
                ) *
                chartHeight;


            if (index === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);

            }

        }
    );

    ctx.stroke();


    // ------------------------------------------------
    // Data points
    // ------------------------------------------------

    ctx.fillStyle = "#17202a";

    values.forEach(
        (value, index) => {

            const x =
                paddingLeft +
                (index / (values.length - 1)) *
                chartWidth;

            const y =
                paddingTop +
                (
                    (maxValue - value) /
                    (maxValue - minValue)
                ) *
                chartHeight;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                2.5,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );


    // ------------------------------------------------
    // Latest value
    // ------------------------------------------------

    const latestValue =
        values[values.length - 1];

    ctx.fillStyle = "#17202a";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "left";

    ctx.fillText(
        `${label}: ${latestValue.toFixed(2)}${unit}`,
        paddingLeft,
        15
    );
}


// ==================================================
// REDRAW WHEN WINDOW SIZE CHANGES
// ==================================================

window.addEventListener(
    "resize",
    () => {

        if (analyticsReadings.length > 0) {

            const readings =
                analyticsReadings
                    .slice()
                    .reverse();

            drawDetailedChart(
                "soh-chart",
                readings,
                "soh",
                "%",
                "State of Health"
            );

            drawDetailedChart(
                "temperature-chart",
                readings,
                "temperature",
                "°C",
                "Temperature"
            );

            drawDetailedChart(
                "soc-chart",
                readings,
                "soc",
                "%",
                "State of Charge"
            );
        }
    }
);