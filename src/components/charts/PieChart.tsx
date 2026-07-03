"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  labels: string[];
  data: number[];
}

export default function PieChart({ labels, data }: PieChartProps) {
  const bgColors = [
    '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', 
    '#34d399', '#2dd4bf', '#38bdf8', '#60a5fa', '#818cf8', 
    '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: bgColors.slice(0, labels.length),
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 10,
          font: { size: 10 },
          color: '#64748b'
        }
      }
    }
  };

  return <Doughnut data={chartData} options={options} />;
}
