import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const PatientReportChart = ({ chart_data }) => {
    // Function to process Firestore data and group by month
    const processChartData = (data) => {
        // Initialize an array for months (January to December)
        const monthCounts = Array(12).fill(0);

        data.forEach((item) => {
            if (item.savedAt) {
                let date;
                // Check if savedAt is a Firestore Timestamp object
                if (item.savedAt.seconds) {
                    date = item.savedAt.toDate(); // Convert Firestore Timestamp to Date
                } else {
                    console.warn("Invalid savedAt format, skipping:", item);
                    return;
                }
                const month = date.getMonth(); // Get month index (0 = January, 11 = December)
                monthCounts[month] += 1; // Increment the count for the corresponding month
            } else {
                console.warn("Missing savedAt field in item:", item);
            }
        });

        return monthCounts;
    };

    // Process the chart_data to get monthly counts
    const monthlyCounts = processChartData(chart_data);

    const data = {
        labels: [
            "January", "February", "March", "April", "May",
            "June", "July", "August", "September",
            "October", "November", "December"
        ],
        datasets: [
            {
                label: "Records",
                data: monthlyCounts,
                backgroundColor: "rgb(0, 115, 255)",
                borderColor: "rgb(0, 115, 255)",
                borderWidth: 1,
                barThickness: 20, // Controls the exact width of each bar
                maxBarThickness: 20, // Maximum bar width (used when resizing)
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Records per Month",
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    const chartContainerStyle = {
        width: "100%",
        height: "400px",
    };

    return (
        <div style={chartContainerStyle}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default PatientReportChart;
