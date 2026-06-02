import type { GaugeController } from "./gauge";

const LIVE_API_URL = import.meta.env.PUBLIC_LIVE_API_URL || "";

let eventSource: EventSource | null = null;

/**
 * Interface representing the structure of real-time server metrics.
 */
export interface SSEMetricsPayload {
    cpu?: number;
    temp?: number;
    download?: number;
    upload?: number;
    active_users?: number;
    [key: string]: any;
}

/**
 * Initializes the EventSource connection directly using the environment API URL.
 * Registers handlers to update active GaugeController instances and dispatch global events.
 */
export function connectMetricsSSE(gauges: Record<string, GaugeController>) {
    if (!LIVE_API_URL) {
        console.warn("PUBLIC_LIVE_API_URL is not defined.");
        return null;
    }

    // Close existing connection if any
    disconnectMetricsSSE();

    eventSource = new EventSource(LIVE_API_URL);

    eventSource.onmessage = (event) => {
        try {
            const data: SSEMetricsPayload = JSON.parse(event.data);

            // Update registered gauges
            for (const key in data) {
                const gauge = gauges[key];
                if (gauge) {
                    const rawValue = data[key];
                    if (typeof rawValue === "number") {
                        const pct = (rawValue / gauge.maxLimit) * 100;
                        gauge.update(
                            pct,
                            rawValue.toFixed(gauge.precision)
                        );
                    }
                }
            }

            // Dispatch global event for other interested components (e.g., WatchingBadge)
            window.dispatchEvent(
                new CustomEvent("metrics-update", {
                    detail: data,
                })
            );
        } catch (error) {
            console.error("Failed to process SSE data:", error);
        }
    };

    eventSource.onerror = (err) => {
        console.error("SSE connection error/disconnected:", err);
    };

    return eventSource;
}

/**
 * Closes the active EventSource connection.
 */
export function disconnectMetricsSSE() {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
}
