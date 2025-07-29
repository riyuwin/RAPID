import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

const NeurologicalChart = ({ chart_data, selectedMonth }) => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const neurologicalCategories = [
        "Altered LOC", "Seizures", "Stroke", "Other Neurological"
    ];

    const processChartData = (data, selectedMonth) => {
        const categoryCounts = {
            "Altered LOC": 0,
            "Seizures": 0,
            "Stroke": 0,
            "Other Neurological": 0,
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
                if (month === selectedMonthIndex && item.neurological) {
                    if (item.neurological.neurologicalAlteredLOC) categoryCounts["Altered LOC"]++;
                    if (item.neurological.neurologicalSeizures) categoryCounts["Seizures"]++;
                    if (item.neurological.neurologicalStroke) categoryCounts["Stroke"]++;
                    if (item.neurological.otherNeurologicalInput) categoryCounts["Other Neurological"]++;
                }
            }
        });

        return categoryCounts;
    };

    const categoryCounts = processChartData(chart_data, selectedMonth);

    const data = {
        labels: neurologicalCategories,
        datasets: [
            {
                label: `Cases in ${selectedMonth}`,
                data: neurologicalCategories.map(category => categoryCounts[category]),
                borderColor: "rgb(54, 162, 235)", // Blue line
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: "rgb(54, 162, 235)",
                pointBorderColor: "#fff",
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0, // Sharp edges instead of curves
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: `Neurological Cases in ${selectedMonth}` },
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true },
        },
    };

    return (
        <div style={{ width: "100%", height: "400px" }}>
            <Line data={data} options={options} />
        </div>
    );
};

export default NeurologicalChart;
