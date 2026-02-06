"use client";

import { useEffect, useRef } from "react";

interface Point {
    x: number;
    y: number;
    originX: number;
    originY: number;
    vx: number;
    vy: number;
}

interface Config {
    spacing: number;
    color: string;
    mouseRadius: number;
    pointSize: number;
    lineWidth: number;
    tension: number;
    friction: number;
}

export function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<Point[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationFrameRef = useRef<number>();
    const configRef = useRef<Config>({
        spacing: 30,       // Increased from 50 to 80 for better performance
        color: "#6d28d9", // StreamShare primary color
        mouseRadius: 150,  // Increased from 50 for better mouse tracking
        pointSize: 0,
        lineWidth: 4,      // Increased from 1.5 for better visibility
        tension: 0.2,
        friction: 0.95,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width: number, height: number;
        let cols: number, rows: number;

        const updatePoint = (point: Point) => {
            const dx = point.x - mouseRef.current.x;
            const dy = point.y - mouseRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < configRef.current.mouseRadius) {
                const angle = Math.atan2(dy, dx);
                const force =
                    (configRef.current.mouseRadius - distance) /
                    configRef.current.mouseRadius;

                // Subtle movement
                const repelPower = 3;

                point.vx += Math.cos(angle) * force * repelPower;
                point.vy += Math.sin(angle) * force * repelPower;
            }

            // Spring back to origin
            const springX = (point.originX - point.x) * configRef.current.tension;
            const springY = (point.originY - point.y) * configRef.current.tension;

            point.vx += springX;
            point.vy += springY;

            point.vx *= configRef.current.friction;
            point.vy *= configRef.current.friction;

            point.x += point.vx;
            point.y += point.vy;
        };

        const drawLines = () => {
            ctx.beginPath();
            ctx.strokeStyle = configRef.current.color;
            ctx.lineWidth = configRef.current.lineWidth;

            // Neon glow effect - increased visibility
            ctx.shadowBlur = 30;         // Increased from 20
            ctx.shadowColor = configRef.current.color;
            ctx.globalAlpha = 0.35;      // Increased from 0.15 to 0.35 for better visibility

            const totalCols = cols + 1;

            for (let i = 0; i < pointsRef.current.length; i++) {
                const p = pointsRef.current[i];

                // Horizontal lines
                if ((i + 1) % totalCols !== 0 && i + 1 < pointsRef.current.length) {
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(pointsRef.current[i + 1].x, pointsRef.current[i + 1].y);
                }

                // Vertical lines
                if (i + totalCols < pointsRef.current.length) {
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(
                        pointsRef.current[i + totalCols].x,
                        pointsRef.current[i + totalCols].y
                    );
                }
            }

            ctx.stroke();

            // Reset shadow
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < pointsRef.current.length; i++) {
                updatePoint(pointsRef.current[i]);
            }

            drawLines();
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        const init = () => {
            const parent = canvas.parentElement;
            if (parent) {
                width = canvas.width = parent.clientWidth;
                height = canvas.height = parent.clientHeight;
            } else {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            }

            pointsRef.current = [];
            cols = Math.ceil(width / configRef.current.spacing) + 2;
            rows = Math.ceil(height / configRef.current.spacing) + 2;

            for (let y = -1; y < rows; y++) {
                for (let x = -1; x < cols; x++) {
                    const px = x * configRef.current.spacing;
                    const py = y * configRef.current.spacing;
                    pointsRef.current.push({
                        x: px,
                        y: py,
                        originX: px,
                        originY: py,
                        vx: 0,
                        vy: 0,
                    });
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouseRef.current.x = -1000;
            mouseRef.current.y = -1000;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                const rect = canvas.getBoundingClientRect();
                mouseRef.current.x = e.touches[0].clientX - rect.left;
                mouseRef.current.y = e.touches[0].clientY - rect.top;
            }
        };

        const handleResize = () => {
            init();
        };

        // Initialize and start animation
        setTimeout(init, 100);
        init();
        animate();

        // Event listeners
        window.addEventListener("resize", handleResize);
        // Mouse events should be on the canvas or window?
        // If we use relative coordinates based on getBoundingClientRect, we should probably listen on the window to track it even if it leaves slightly, but for "InteractiveBackground" usually it's better to verify if the user intention is "mouse over this section".
        // However, the original code had window listeners.
        // If I use window listener, e.clientX is correct global, but rect is local.
        // e.clientX - rect.left works for window listener too as long as the canvas is in the DOM.

        // Better to keep window listener for resize.
        // For mousemove, usually we want effect when over the element. 
        // But let's stick to the plan: "Update handleMouseMove to calculate coordinates relative to the canvas element".
        // The original code added event listeners to `window`. 
        // If I attach to window, `getBoundingClientRect` will work fine.

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("touchmove", handleTouchMove, { passive: true });

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute h-full inset-0 z-0"
            style={{
                filter: "blur(5px)",
            }}
        />
    );
}
