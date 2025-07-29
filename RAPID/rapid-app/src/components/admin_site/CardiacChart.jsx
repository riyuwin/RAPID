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

const CardiacChart = ({ chart_data, selectedMonth }) => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const cardiacCategories = [
        "Cardiac Arrest", "Cardiac Arrhythmia", "Cardiac Chest Pain", "Heart Failure", "Other Cardiac"
    ];

    const processChartData = (data, selectedMonth) => {
        const categoryCounts = {
            "Cardiac Arrest": 0,
            "Cardiac Arrhythmia": 0,
            "Cardiac Chest Pain": 0,
            "Heart Failure": 0,
            "Other Cardiac": 0,
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
                if (month === selectedMonthIndex && item.cardiac) {
                    if (item.cardiac.cardiacArrest) categoryCounts["Cardiac Arrest"]++;
                    if (item.cardiac.cardiacArrhythmia) categoryCounts["Cardiac Arrhythmia"]++;
                    if (item.cardiac.cardiacChestPain) categoryCounts["Cardiac Chest Pain"]++;
                    if (item.cardiac.heartFailure) categoryCounts["Heart Failure"]++;
                    if (item.cardiac.otherCardiacInput) categoryCounts["Other Cardiac"]++;
                }
            }
        });

        return categoryCounts;
    };

    const categoryCounts = processChartData(chart_data, selectedMonth);

    const data = {
        labels: cardiacCategories,
        datasets: [
            {
                label: `Cases in ${selectedMonth}`,
                data: cardiacCategories.map(category => categoryCounts[category]),
                borderColor: "rgb(54, 162, 235)", // Blue line
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: "rgb(54, 162, 235)",
                pointBorderColor: "#fff",
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0, // This makes the line sharp-edged (no curves)
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: `Cardiac Cases in ${selectedMonth}` },
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

export default CardiacChart;
