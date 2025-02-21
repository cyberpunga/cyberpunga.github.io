"use client";
import { useGlitch } from "react-powerglitch";

export default function Page() {
  const glitch = useGlitch();
  return (
    <section className="flex-auto grid place-items-center">
      <div>
        <h1 ref={glitch.ref} className="mb-8 text-2xl font-semibold tracking-tighter">
          si estás leyendo esto, significa que sigues con vida y nos alegra muchísimo.
        </h1>
      </div>
    </section>
  );
}
