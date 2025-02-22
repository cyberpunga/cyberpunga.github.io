"use client";
import { useGlitch } from "react-powerglitch";

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Footer() {
  const glitch = useGlitch({ playMode: "hover" });
  return (
    <footer className="mt-auto mb-16 pb-4">
      <ul className="font-sm mt-8 flex flex-col space-x-0 space-y-2 text-neutral-600 md:flex-row md:space-x-4 md:space-y-0 dark:text-neutral-300">
        <li>
          <div ref={glitch.ref}>
            <a
              className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
              rel="noopener noreferrer"
              target="_blank"
              href="/rss"
            >
              <ArrowIcon />
              <p className="ml-2 h-7">rss</p>
            </a>
          </div>
        </li>
        <li>
          <div ref={glitch.ref}>
            <a
              className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
              rel="noopener noreferrer"
              target="_blank"
              href="https://github.com/cyberpunga"
            >
              <ArrowIcon />
              <p className="ml-2 h-7">github</p>
            </a>
          </div>
        </li>
        <li>
          <div ref={glitch.ref}>
            <a
              className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
              rel="noopener noreferrer"
              target="_blank"
              href="https://github.com/cyberpunga/cyberpunga.github.io"
            >
              <ArrowIcon />
              <p className="ml-2 h-7">view source</p>
            </a>
          </div>
        </li>
      </ul>
      <p className="mt-8 text-neutral-600 dark:text-neutral-300">© {new Date().getFullYear()} cyberpunga</p>
    </footer>
  );
}
