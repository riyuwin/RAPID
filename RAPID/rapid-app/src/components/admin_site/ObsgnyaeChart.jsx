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

const ObsgynChart = ({ chart_data, selectedMonth }) => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const obsgynCategories = [
        "Gyn PPH", "Haemorrhage Greater", "Gyn Haemorrhage Less", "Gyn Labour", "Gyn Pre-Delivery"
    ];

    const processChartData = (data, selectedMonth) => {
        const categoryCounts = {
            "Gyn Haemorrhage": 0,
            "Gyn Haemorrhage Less": 0,
            "Gyn Labour": 0,
            "Gyn PPH": 0,
            "Gyn Pre-Delivery": 0,
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
                if (month === selectedMonthIndex && item.obs_gnyae) {
                    if (item.obs_gnyae.obsGynHaemorrhage) categoryCounts["Gyn Haemorrhage"]++;
                    if (item.obs_gnyae.obsGynHaemorrhageLess) categoryCounts["Gyn Haemorrhage Less"]++;
                    if (item.obs_gnyae.obsGynLabour) categoryCounts["Gyn Labour"]++;
                    if (item.obs_gnyae.obsGynPPH) categoryCounts["Gyn PPH"]++;
                    if (item.obs_gnyae.obsGynPreDelivery) categoryCounts["Gyn Pre-Delivery"]++;
                }
            }
        });

        return categoryCounts;
    };

    const categoryCounts = processChartData(chart_data, selectedMonth);

    const data = {
        labels: obsgynCategories,
        datasets: [
            {
                label: `Cases in ${selectedMonth}`,
                data: obsgynCategories.map(category => categoryCounts[category]),
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
            title: { display: true, text: `Obstetric & Gynecological Cases in ${selectedMonth}` },
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

export default ObsgynChart;
