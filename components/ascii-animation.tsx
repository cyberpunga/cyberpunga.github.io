"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export function AsciiAnimation({ className }: { className?: string }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0 });
  const animationFrameRef = useRef(0);
  const timeRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (preRef.current) {
        const rect = preRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          // y: (e.clientY - rect.top) / rect.height,
          y: 0,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animation loop
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const chars = " .,:;+*?%S#@";

    const animate = () => {
      timeRef.current += 0.03;

      if (!preRef.current) return;

      let result = "";

      for (let y = 0; y < dimensions.height; y++) {
        for (let x = 0; x < dimensions.width; x++) {
          // Normalized coordinates
          const nx = x / dimensions.width - 0.5;
          const ny = y / dimensions.height - 0.5;

          // Distance from mouse position (normalized)
          const dx = nx - (mousePosition.x - 0.5);
          const dy = ny - (mousePosition.y - 0.5);
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
  }, [dimensions, mousePosition]);

  return (
    <div className={cn("flex items-center justify-center w-full h-screen mx-auto", className)}>
      <pre
        ref={preRef}
        className="w-full h-full p-0 m-0 overflow-hidden leading-[10px] font-mono opacity-[5%]"
        style={{
          fontSize: "1.5rem",
          fontFamily: "monospace",
          userSelect: "none",
        }}
      />
    </div>
  );
}
