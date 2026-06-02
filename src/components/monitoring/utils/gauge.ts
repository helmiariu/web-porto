/**
 * Controller class to manage interactive SVG gauge animations.
 * Handles primary progress path rendering, tick animation, and value text updates.
 */
export class GaugeController {
    private path: SVGPathElement;
    private tickStart: SVGLineElement;
    private tickEnd: SVGLineElement;
    private valueText: SVGTextElement;

    private totalLength: number;
    private tickLength: number;
    private currentPercentage: number = 0;
    private targetPercentage: number = 0;
    private animationId: number | null = null;

    public maxLimit: number;
    public precision: number;

    constructor(container: HTMLElement) {
        this.path = container.querySelector(".progress-path") as SVGPathElement;
        this.tickStart = container.querySelector(".tick-start") as SVGLineElement;
        this.tickEnd = container.querySelector(".tick-end") as SVGLineElement;
        this.valueText = container.querySelector(".value-text") as SVGTextElement;

        if (!this.path || !this.tickStart || !this.tickEnd || !this.valueText) {
            throw new Error("Missing required SVG elements in gauge container");
        }

        // Setup main gauge path stroke dash arrays
        this.totalLength = this.path.getTotalLength();
        this.path.style.strokeDasharray = String(this.totalLength);
        this.path.style.strokeDashoffset = String(this.totalLength);

        // Setup tick lengths (typically 2px physically)
        this.tickLength = this.tickStart.getTotalLength();

        this.tickStart.style.strokeDasharray = String(this.tickLength);
        this.tickStart.style.strokeDashoffset = String(this.tickLength);

        this.tickEnd.style.strokeDasharray = String(this.tickLength);
        this.tickEnd.style.strokeDashoffset = String(this.tickLength);

        this.maxLimit = parseFloat(container.getAttribute("data-max") || "100");
        this.precision = parseInt(container.getAttribute("data-precision") || "0", 10);

        const initialPct = parseFloat(container.getAttribute("data-target-percentage") || "0");
        this.update(initialPct, this.valueText.textContent || "0");
    }

    /**
     * Updates the gauge target percentage and value text.
     * Starts animation loop if not already running.
     */
    public update(percentage: number, rawValue: string) {
        this.targetPercentage = Math.min(Math.max(percentage, 0), 100);
        this.valueText.textContent = rawValue;

        if (!this.animationId) {
            this.animationId = requestAnimationFrame(this.animate);
        }
    }

    /**
     * Easing animation loop using requestAnimationFrame.
     */
    private animate = () => {
        const ease = 0.15;
        const diff = this.targetPercentage - this.currentPercentage;

        if (Math.abs(diff) < 0.05) {
            this.currentPercentage = this.targetPercentage;
            this.animationId = null;
        } else {
            this.currentPercentage += diff * ease;
            this.animationId = requestAnimationFrame(this.animate);
        }

        // 1. Update main progress path offset
        const offset = this.totalLength - (this.currentPercentage / 100) * this.totalLength;
        this.path.style.strokeDashoffset = String(offset);

        // 2. Calculate active physical pixels in real-time
        const activePixels = (this.currentPercentage / 100) * this.totalLength;

        // 3. Animate start tick
        const tickStartFilled = Math.min(activePixels, this.tickLength);
        this.tickStart.style.strokeDashoffset = String(this.tickLength - tickStartFilled);

        // 4. Animate end tick
        const startOfEndTick = this.totalLength - this.tickLength;
        const tickEndFilled = Math.min(
            Math.max(activePixels - startOfEndTick, 0),
            this.tickLength
        );
        this.tickEnd.style.strokeDashoffset = String(this.tickLength - tickEndFilled);
    };
}
