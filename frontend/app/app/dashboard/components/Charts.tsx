'use client';

import { useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    ScatterController,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    ScatterController
);

interface ChartData {
    label?: string;
    value?: number;
    x?: number;
    y?: number;
}

interface InteractiveChartProps {
    data: ChartData[] | any; // Allow both formats
    type: 'bar' | 'line' | 'scatter' | 'pie';
    width?: number;
    height?: number;
    title?: string;
    options?: any; // Allow custom options
}

export function InteractiveChart({
    data,
    type,
    width = 400,
    height = 300,
    title,
    options: customOptions
}: InteractiveChartProps) {
    const chartRef = useRef<ChartJS>(null);

    // Check if data is already in Chart.js format
    const isChartJsFormat = data && typeof data === 'object' && ('labels' in data || 'datasets' in data);

    const chartData = isChartJsFormat ? data : {
        labels: type === 'scatter' ? undefined : data.map((d: ChartData) => d.label || ''),
        datasets: [{
            label: title || 'Data',
            data: type === 'scatter'
                ? data.map((d: ChartData) => ({ x: d.x || 0, y: d.y || 0 }))
                : data.map((d: ChartData) => d.value || 0),
            backgroundColor: type === 'scatter'
                ? 'rgba(59, 130, 246, 0.6)'
                : 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: type === 'scatter' ? 4 : 3,
        }]
    };

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#f0f6ff',
                    font: {
                        size: 12,
                    }
                }
            },
            title: {
                display: !!title,
                text: title,
                color: '#f0f6ff',
                font: {
                    size: 14,
                    weight: 'bold' as const,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(13, 21, 38, 0.9)',
                titleColor: '#f0f6ff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderWidth: 1,
            }
        },
        scales: type !== 'pie' ? {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#8898aa',
                    font: {
                        size: 11,
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#8898aa',
                    font: {
                        size: 11,
                    }
                }
            }
        } : undefined
    };

    // Merge custom options with defaults
    const finalOptions = customOptions ? { ...defaultOptions, ...customOptions } : defaultOptions;

    return (
        <div style={{ width, height, position: 'relative' }}>
            <Chart
                ref={chartRef}
                type={type === 'scatter' ? 'scatter' : type === 'pie' ? 'pie' : type}
                data={chartData}
                options={finalOptions}
            />
        </div>
    );
}