"use client";
import Link from "next/link";
import { useGlitch } from "react-powerglitch";

const navItems = {
  "/": {
    name: "home",
  },
  "/blog": {
    name: "blog",
  },
};

export function Navbar() {
  const glitch = useGlitch({
    playMode: "hover",
  });
  const glitchOnClick = useGlitch({
    hideOverflow: true,
    playMode: "click",
    pulse: {
      scale: 2,
    },
  });
  return (
    <aside className="-ml-[8px] mb-16 tracking-tight sticky top-0 text-black bg-white dark:text-white dark:bg-black">
      <div className="">
        <nav
          className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 pr-10">
            {Object.entries(navItems).map(([path, { name }]) => {
              return (
                <div key={path} ref={glitchOnClick.ref}>
                  <Link
                    href={path}
                    ref={glitch.ref}
                    className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1"
                  >
                    {name}
                  </Link>
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
