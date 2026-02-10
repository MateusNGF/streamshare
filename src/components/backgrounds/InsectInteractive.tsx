"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./insect-interactive.module.css";
import Matter from "matter-js";

// --- CONFIG ---
const CONFIG = {
    // Physics
    maxSpeed: 4.0,           // Higher values for Matter.js
    maxForce: 0.05,
    safetyRadius: 150,

    // Behaviors
    seekForce: 0.001,
    fleeForce: 0.003,
    wanderForce: 0.0005,
    wallForce: 0.005,
    wallMargin: 100,

    // Timers
    respawnTime: 5000,
    confusedLookDuration: 120, // frames
    confusedTotalLooks: 2,
};

export const InsectInteractive: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const bugRef = useRef<HTMLDivElement>(null);

    // Refs for mutable state avoiding re-renders
    const engineRef = useRef<Matter.Engine | null>(null);
    const insectBodyRef = useRef<Matter.Body | null>(null);
    const mouseRef = useRef<{ x: number, y: number }>({ x: -1000, y: -1000 });
    const requestRef = useRef<number>();

    // Game State Refs
    const stateRef = useRef({
        mode: 'chase' as 'chase' | 'flee' | 'confused',
        isDead: false,
        confusedTimer: 0,
        confusedPhase: 0,
        targetAngle: 0,
        wanderAngle: 0,
    });

    const [uiStatus, setUiStatus] = useState("Curioso");
    const [splats, setSplats] = useState<{ x: number, y: number, id: number }[]>([]);

    // --- SETUP MATTER.JS ---
    useEffect(() => {
        const engine = Matter.Engine.create();
        engine.gravity.y = 0; // Top-down view, no gravity
        engineRef.current = engine;

        // Create Insect Body
        const insect = Matter.Bodies.circle(
            window.innerWidth / 2,
            window.innerHeight / 2,
            20,
            {
                frictionAir: 0.1, // Air resistance
                restitution: 0.5,
                density: 0.001,
                label: 'insect'
            }
        );

        insectBodyRef.current = insect;
        Matter.Composite.add(engine.world, insect);

        // Resize handler
        const handleResize = () => {
            // Optional: update bounds if making walls
        };
        window.addEventListener('resize', handleResize);

        // Mouse handler
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Start Loop
        requestRef.current = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            Matter.Engine.clear(engine);
        };
    }, []);

    // --- PHYSICS HELPERS ---
    const applyForce = (body: Matter.Body, force: Matter.Vector) => {
        Matter.Body.applyForce(body, body.position, force);
    };

    const steer = (target: Matter.Vector, body: Matter.Body, multiplier: number = 1.0) => {
        const desired = Matter.Vector.sub(target, body.position);
        const dist = Matter.Vector.magnitude(desired);

        if (dist > 0) {
            const normalized = Matter.Vector.normalise(desired);
            // Matter.js forces are small, so apply directly
            const force = Matter.Vector.mult(normalized, CONFIG.seekForce * multiplier);
            applyForce(body, force);
        }
    };

    const flee = (target: Matter.Vector, body: Matter.Body) => {
        const desired = Matter.Vector.sub(body.position, target);
        const dist = Matter.Vector.magnitude(desired);

        if (dist > 0) {
            const normalized = Matter.Vector.normalise(desired);
            const force = Matter.Vector.mult(normalized, CONFIG.fleeForce);
            applyForce(body, force);
        }
    };

    const wander = (body: Matter.Body) => {
        stateRef.current.wanderAngle += (Math.random() - 0.5) * 0.2;
        const circleCenter = Matter.Vector.add(body.position, Matter.Vector.mult(body.velocity, 10)); // Project ahead
        const wanderOffset = {
            x: Math.cos(stateRef.current.wanderAngle) * 50,
            y: Math.sin(stateRef.current.wanderAngle) * 50
        };
        const target = Matter.Vector.add(circleCenter, wanderOffset);
        steer(target, body, 0.5);
    };

    const stayWithinWalls = (body: Matter.Body) => {
        const m = CONFIG.wallMargin;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const p = body.position;

        if (p.x < m) applyForce(body, { x: CONFIG.wallForce, y: 0 });
        if (p.x > w - m) applyForce(body, { x: -CONFIG.wallForce, y: 0 });
        if (p.y < m) applyForce(body, { x: 0, y: CONFIG.wallForce });
        if (p.y > h - m) applyForce(body, { x: 0, y: -CONFIG.wallForce });
    };

    // --- GAME LOOP ---
    const gameLoop = () => {
        if (!engineRef.current || !insectBodyRef.current) return;

        const s = stateRef.current;
        const body = insectBodyRef.current;

        if (!s.isDead) {
            Matter.Engine.update(engineRef.current, 1000 / 60);

            // --- BEHAVIOR LOGIC ---

            // Random Confusion
            if (s.mode !== 'confused' && Math.random() < 0.002) {
                s.mode = 'confused';
                s.confusedPhase = 0;
                s.confusedTimer = CONFIG.confusedLookDuration;
                s.targetAngle = Math.random() * Math.PI * 2;
                setUiStatus("???");
            }

            if (s.mode === 'confused') {
                // Slow down
                Matter.Body.setVelocity(body, Matter.Vector.mult(body.velocity, 0.9));

                // Rotate slowly
                const currentAngle = body.angle;
                let diff = s.targetAngle - currentAngle;
                // Normalize angle
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                Matter.Body.setAngle(body, currentAngle + diff * 0.05);

                s.confusedTimer--;
                if (s.confusedTimer <= 0) {
                    s.confusedPhase++;
                    if (s.confusedPhase >= CONFIG.confusedTotalLooks) {
                        s.mode = 'chase';
                        setUiStatus("Curioso");
                    } else {
                        s.targetAngle = Math.random() * Math.PI * 2;
                        s.confusedTimer = CONFIG.confusedLookDuration;
                    }
                }
            } else {
                // Determine Mode based on distance
                const distToMouse = Matter.Vector.magnitude(Matter.Vector.sub(body.position, mouseRef.current));

                if (distToMouse < CONFIG.safetyRadius) {
                    if (s.mode !== 'flee') {
                        s.mode = 'flee';
                        setUiStatus("FUGINDO!");
                    }
                    flee(mouseRef.current, body);
                } else {
                    if (s.mode !== 'chase') {
                        s.mode = 'chase';
                        setUiStatus("Perseguindo");
                    }
                    steer(mouseRef.current, body, 1.0);
                    wander(body);
                }

                stayWithinWalls(body);

                // Speed Limit
                const speed = Matter.Vector.magnitude(body.velocity);
                if (speed > CONFIG.maxSpeed) {
                    Matter.Body.setVelocity(body, Matter.Vector.mult(Matter.Vector.normalise(body.velocity), CONFIG.maxSpeed));
                }

                // Orient body to velocity
                if (speed > 0.1) {
                    const angle = Math.atan2(body.velocity.y, body.velocity.x) + Math.PI / 2;
                    // Smooth rotation
                    const currentAngle = body.angle;
                    let diff = angle - currentAngle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    Matter.Body.setAngle(body, currentAngle + diff * 0.1);
                }
            }
        }

        // --- RENDER SYNCHRONIZATION ---
        if (bugRef.current) {
            bugRef.current.style.transform = `translate(${body.position.x - 40}px, ${body.position.y - 40}px) rotate(${body.angle}rad)`;

            // Visual State Toggling (Performance optimized)
            const aliveSvg = bugRef.current.querySelector<HTMLElement>(`.${styles.bugAliveSvg}`);
            const confusedSvg = bugRef.current.querySelector<HTMLElement>(`.${styles.bugConfusedSvg}`);
            const deadSvg = bugRef.current.querySelector<HTMLElement>(`.${styles.bugDeadSvg}`);

            if (s.isDead) {
                if (aliveSvg) aliveSvg.style.display = 'none';
                if (confusedSvg) confusedSvg.style.display = 'none';
                if (deadSvg) deadSvg.style.display = 'block';
                bugRef.current.classList.add(styles.squashed);
            } else if (s.mode === 'confused') {
                if (aliveSvg) aliveSvg.style.display = 'none';
                if (deadSvg) deadSvg.style.display = 'none';
                if (confusedSvg) confusedSvg.style.display = 'block';
                bugRef.current.classList.remove(styles.squashed);
            } else {
                if (deadSvg) deadSvg.style.display = 'none';
                if (confusedSvg) confusedSvg.style.display = 'none';
                if (aliveSvg) {
                    aliveSvg.style.display = 'block';
                    const speed = Matter.Vector.magnitude(body.velocity);
                    if (speed > 0.1) {
                        aliveSvg.style.animationPlayState = 'running';
                        aliveSvg.style.animationDuration = `${Math.max(0.2, 0.6 - speed * 0.1)}s`;
                    } else {
                        aliveSvg.style.animationPlayState = 'paused';
                    }
                }
                bugRef.current.classList.remove(styles.squashed);
            }
        }

        requestRef.current = requestAnimationFrame(gameLoop);
    };

    // --- INTERACTIONS ---
    const squash = (e: React.MouseEvent) => {
        if (stateRef.current.isDead) return;
        e.stopPropagation();

        const s = stateRef.current;
        const body = insectBodyRef.current!;

        s.isDead = true;
        setUiStatus("ESMAGADO");

        // Stop physics for the bug
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(body, 0);

        setSplats(prev => [...prev, { x: body.position.x, y: body.position.y, id: Date.now() }]);

        setTimeout(respawn, CONFIG.respawnTime);
    };

    const respawn = () => {
        const s = stateRef.current;
        const body = insectBodyRef.current!;
        s.isDead = false;
        s.mode = 'chase';
        setUiStatus("Curioso");
        setSplats([]);

        // Random edge spawn
        const side = Math.floor(Math.random() * 4);
        const w = window.innerWidth;
        const h = window.innerHeight;
        let x = 0, y = 0;

        if (side === 0) { x = Math.random() * w; y = -50; }
        else if (side === 1) { x = w + 50; y = Math.random() * h; }
        else if (side === 2) { x = Math.random() * w; y = h + 50; }
        else { x = -50; y = Math.random() * h; }

        Matter.Body.setPosition(body, { x, y });
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
    };

    return (
        <>
            {/* DEBUG UI <div className="fixed top-4 left-4 z-50 text-white bg-black/50 p-2">{uiStatus}</div> */}

            {splats.map(splat => (
                <div key={splat.id} className={styles.splatEffect} style={{ left: splat.x, top: splat.y }}>
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M40,40 Q30,20 50,10 Q70,20 60,40 Q80,50 70,70 Q50,90 30,70 Q10,50 40,40 Z" fill="#9ece6a" />
                        <circle cx="30" cy="30" r="5" fill="#9ece6a" />
                        <circle cx="70" cy="80" r="8" fill="#9ece6a" />
                    </svg>
                </div>
            ))}

            <div
                ref={bugRef}
                className={styles.container}
                style={{ top: 0, left: 0 }} // Position controlled by transform
                onClick={squash}
            >
                {/* 1. SVG VIVO */}
                <svg className={`${styles.bugAliveSvg}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
                    <g className={styles.bugBody}>
                        <g className={styles.legsB} stroke="#333" strokeWidth="6" strokeLinecap="round">
                            <path d="M70,35 L90,20" />
                            <path d="M30,50 L10,50" />
                            <path d="M70,65 L90,80" />
                        </g>
                        <g className={styles.legsA} stroke="#333" strokeWidth="6" strokeLinecap="round">
                            <path d="M30,35 L10,20" />
                            <path d="M70,50 L90,50" />
                            <path d="M30,65 L10,80" />
                        </g>
                        <g className={styles.antennae} stroke="#333" strokeWidth="2" fill="none">
                            <path d="M40,25 Q30,10 20,15" />
                            <path d="M60,25 Q70,10 80,15" />
                        </g>
                        <ellipse cx="50" cy="55" rx="20" ry="28" fill="#2d3748" stroke="#1a202c" strokeWidth="2" />
                        <path d="M35,35 Q50,15 65,35 L65,45 Q50,55 35,45 Z" fill="#4a5568" stroke="#1a202c" strokeWidth="2" />
                        <path d="M50,38 L50,75" stroke="#1a202c" strokeWidth="1" opacity="0.5" />
                        <circle cx="40" cy="30" r="3" fill="#e53e3e" />
                        <circle cx="60" cy="30" r="3" fill="#e53e3e" />
                    </g>
                </svg>

                {/* 2. SVG CONFUSO */}
                <svg className={`${styles.bugConfusedSvg}`} style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
                    <text x="50" y="20" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24"
                        fill="#ECC94B" textAnchor="middle" className={styles.questionMark}>?</text>

                    <g className={styles.bugConfusion} style={{ transformOrigin: "50px 50px" }}>
                        <g stroke="#333" strokeWidth="6" strokeLinecap="round">
                            <line x1="30" y1="40" x2="15" y2="30" />
                            <line x1="70" y1="40" x2="85" y2="30" />
                            <line x1="30" y1="55" x2="10" y2="55" />
                            <line x1="70" y1="55" x2="90" y2="55" />
                            <line x1="30" y1="70" x2="15" y2="80" />
                            <line x1="70" y1="70" x2="85" y2="80" />
                        </g>

                        <g className={styles.antennaeConfused} stroke="#333" strokeWidth="2" fill="none">
                            <path d="M40,35 Q30,15 20,25" /> <path d="M60,35 Q70,20 80,15" /> </g>

                        <ellipse cx="50" cy="55" rx="20" ry="28" fill="#2d3748" stroke="#1a202c" strokeWidth="2" />
                        <path d="M35,35 Q50,15 65,35 L65,45 Q50,55 35,45 Z" fill="#4a5568" stroke="#1a202c" strokeWidth="2" />

                        <circle cx="38" cy="32" r="4" fill="#e53e3e" />
                        <circle cx="62" cy="32" r="2.5" fill="#e53e3e" />
                    </g>
                </svg>

                {/* 3. SVG ESMAGADO */}
                <svg className={`${styles.bugDeadSvg}`} style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
                    <style>{`
                        .ooze { animation: oozeExpand 2s ease-out forwards; transform-origin: center; }
                        @keyframes oozeExpand { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
                    `}</style>
                    <path className="ooze" d="M20,50 Q10,20 40,30 Q60,10 80,40 Q95,50 85,70 Q70,90 50,85 Q20,90 20,50 Z"
                        fill="#48bb78" opacity="0.9" stroke="none" />

                    <g transform="translate(50, 60) scale(1.3, 0.4) translate(-50, -50)">

                        <g stroke="#1a202c" strokeWidth="4" strokeLinecap="round" fill="none">
                            <path d="M20,40 L10,20" />
                            <path d="M80,40 L95,25" />
                            <path d="M20,60 L5,70" />
                            <path d="M80,60 L95,75" />
                            <path d="M50,80 L50,95" /> </g>

                        <ellipse cx="50" cy="50" rx="25" ry="30" fill="#2d3748" stroke="#1a202c" strokeWidth="3" />

                        <path d="M30,30 Q50,10 70,30 L70,40 Q50,50 30,40 Z" fill="#4a5568" stroke="#1a202c" strokeWidth="3" />
                    </g>

                    <g stroke="#e53e3e" strokeWidth="3" strokeLinecap="round">
                        <line x1="35" y1="45" x2="45" y2="55" />
                        <line x1="45" y1="45" x2="35" y2="55" />
                        <line x1="55" y1="45" x2="65" y2="55" />
                        <line x1="65" y1="45" x2="55" y2="55" />
                    </g>
                </svg>
            </div>
        </>
    );
};
