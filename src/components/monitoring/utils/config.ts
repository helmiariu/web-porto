export interface MetricConfig {
    id: string;
    label: string;
    unit: string;
    initialValue: number;
    maxLimit: number;
    precision?: number;
}

export const serverMetrics: MetricConfig[] = [
    {
        id: "cpu",
        label: "CPU USAGE",
        unit: "%",
        initialValue: 0,
        maxLimit: 100,
        precision: 1,
    },
    {
        id: "temp",
        label: "CORE TEMP",
        unit: "°C",
        initialValue: 0,
        maxLimit: 100,
        precision: 0,
    },
    {
        id: "download",
        label: "DOWNLOAD",
        unit: "KB/s",
        initialValue: 0,
        maxLimit: 5000,
        precision: 1,
    },
    {
        id: "upload",
        label: "UPLOAD",
        unit: "KB/s",
        initialValue: 0,
        maxLimit: 1000,
        precision: 1,
    },
];
