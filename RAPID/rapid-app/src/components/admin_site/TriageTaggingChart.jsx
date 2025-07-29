import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const TriageChart = ({ chart_data, selectedMonth }) => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const triageCategories = ["Black", "Green", "Red", "Yellow"];

    const processChartData = (data, selectedMonth) => {
        const categoryCounts = {
            "Black": 0,
            "Green": 0,
            "Red": 0,
            "Yellow": 0,
        };

        const selectedMonthIndex = monthNames.indexOf(selectedMonth);

        data.forEach((item) => {
            if (item.savedAt) {
                let date;
                if (item.savedAt.seconds) {
                    date = item.savedAt.toDate();
                } else {
                    console.warn("Invalid savedAt format, skipping:", item);
                    return;
                }

                const month = date.getMonth();
                if (month === selectedMonthIndex && item.triageTagging) {
                    if (item.triageTagging.triageTaggingB) categoryCounts["Black"]++;
                    if (item.triageTagging.triageTaggingG) categoryCounts["Green"]++;
                    if (item.triageTagging.triageTaggingR) categoryCounts["Red"]++;
                    if (item.triageTagging.triageTaggingY) categoryCounts["Yellow"]++;
                }
            }
        });

        return categoryCounts;
    };

    const categoryCounts = processChartData(chart_data, selectedMonth);

    const getColor = (category) => {
        const colors = {
            "Black": "rgb(0, 0, 0)",
            "Green": "rgb(0, 128, 0)",
            "Red": "rgb(255, 0, 0)",
            "Yellow": "rgb(255, 215, 0)"
        };
        return colors[category];
    };

    const data = {
        labels: triageCategories,
        datasets: [
            {
                label: `Triage Cases in ${selectedMonth}`,
                data: triageCategories.map(category => categoryCounts[category]),
                backgroundColor: triageCategories.map(category => getColor(category)),
                borderColor: "rgb(192, 186, 186)",
                borderWidth: 1,
                barThickness: 40,
                maxBarThickness: 40,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: `Triage Cases in ${selectedMonth}` },
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true },
        },
    };

    return (
        <div style={{ width: "100%", height: "400px" }}>
            <Bar data={data} options={options} />
            {/* Legend */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                <span style={{ marginRight: "15px", color: "black" }}>⬛ Black - Deceased</span>
                <span style={{ marginRight: "15px", color: "green" }}>🟩 Green - Minor</span>
                <span style={{ marginRight: "15px", color: "red" }}>🟥 Red - Immediate</span>
                <span style={{ color: "goldenrod" }}>🟨 Yellow - Delayed</span>
            </div>
        </div>
    );
};

export default TriageChart;
