"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const lerp = (start: number, end: number, t: number) => {
  return start + (end - start) * t;
};

export function AsciiAnimation({ className }: { className?: string }) {
  const preRef = useRef<HTMLPreElement>(null);
  const animationFrameRef = useRef(0);
  const timeRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [smoothPos, setSmoothPos] = useState({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (preRef.current) {
        const rect = preRef.current.getBoundingClientRect();
        targetPos.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      setSmoothPos((prev) => {
        const t = 0.01; // Smoothness factor — smaller = smoother
        return {
          x: lerp(prev.x, targetPos.current.x, t),
          y: lerp(prev.y, targetPos.current.y, t),
        };
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Handle resize and calculate dimensions
  useEffect(() => {
    const handleResize = () => {
      if (preRef.current) {
        const style = window.getComputedStyle(preRef.current);
        const fontWidth = Number.parseFloat(style.fontSize) * 0.6;
        const fontHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2;

        // Limit dimensions for better performance
        const width = Math.min(150, Math.floor(preRef.current.clientWidth / fontWidth));
        const height = Math.min(80, Math.floor(preRef.current.clientHeight / fontHeight));

        setDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const chars = " .,:;+*?%$#@";

    const animate = () => {
      timeRef.current += 0.005;

      if (!preRef.current) return;

      let result = "";

      for (let y = 0; y < dimensions.height; y++) {
        for (let x = 0; x < dimensions.width; x++) {
          // Normalized coordinates
          const nx = x / dimensions.width - 0.5;
          const ny = y / dimensions.height - 0.5;

          // Distance from mouse position (normalized)
          const dx = nx - (smoothPos.x - 0.5);
          const dy = ny - (smoothPos.y - 0.5);
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Wave pattern
          const wave = Math.sin(dist * 10 - timeRef.current * 2) * 0.5 + 0.5;

          // Choose character based on wave value
          const charIndex = Math.floor(wave * (chars.length - 1));
          result += chars[charIndex];
        }
        result += "\n";
      }

      preRef.current.textContent = result;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [dimensions, smoothPos]);

  return (
    <div className={cn("flex items-center justify-center w-full h-screen mx-auto", className)}>
      <pre
        ref={preRef}
        className="w-full h-full p-0 m-0 overflow-hidden font-extralight font-mono text-xl opacity-[15%]"
        style={
          {
            // fontSize: "1.5rem",
            // fontFamily: "monospace",
            // userSelect: "none",
          }
        }
      />
    </div>
  );
}
