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

const TraumaChart = ({ chart_data, selectedMonth }) => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const traumaCategories = [
        "Burns", "Dislocation", "Fracture", "Haemorrhage", "Head Injury",
        "Maxillo-Facial", "Multiple Trauma", "Open Wound", "Shock",
        "Soft Tissue", "Spinal", "Other"
    ];

    const processChartData = (data, selectedMonth) => {
        const categoryCounts = traumaCategories.reduce((acc, category) => {
            acc[category] = 0;
            return acc;
        }, {});

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
                if (month === selectedMonthIndex && item.trauma) {
                    if (item.trauma.traumaBurns) categoryCounts["Burns"]++;
                    if (item.trauma.traumaDislocation) categoryCounts["Dislocation"]++;
                    if (item.trauma.traumaFracture) categoryCounts["Fracture"]++;
                    if (item.trauma.traumaHaemorrhage) categoryCounts["Haemorrhage"]++;
                    if (item.trauma.traumaHeadInjury) categoryCounts["Head Injury"]++;
                    if (item.trauma.traumaMaxilloFacial) categoryCounts["Maxillo-Facial"]++;
                    if (item.trauma.traumaMultiple) categoryCounts["Multiple Trauma"]++;
                    if (item.trauma.traumaOpenWound) categoryCounts["Open Wound"]++;
                    if (item.trauma.traumaShock) categoryCounts["Shock"]++;
                    if (item.trauma.traumaSoftTissue) categoryCounts["Soft Tissue"]++;
                    if (item.trauma.traumaSpinal) categoryCounts["Spinal"]++;
                    if (item.trauma.otherTraumaInput) categoryCounts["Other"]++;
                }
            }
        });

        return categoryCounts;
    };

    const categoryCounts = processChartData(chart_data, selectedMonth);

    const data = {
        labels: traumaCategories,
        datasets: [
            {
                label: `Cases in ${selectedMonth}`,
                data: traumaCategories.map(category => categoryCounts[category]),
                borderColor: "rgb(54, 162, 235)", // Blue line like NeurologicalChart
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
            title: { display: true, text: `Trauma Cases in ${selectedMonth}` },
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

export default TraumaChart;
