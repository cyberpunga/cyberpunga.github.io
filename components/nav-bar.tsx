"use client";

// import { Brain, Clock, Filter, Search } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { Badge } from "@/components/ui/badge";
// import Link from "next/link";
import { cn } from "@/lib/utils";
// import { LanguageSelector } from "@/components/language-selector";

export function Navbar({ children }: { children: React.ReactNode }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-16 items-center gap-4 px-4",
        "prose dark:prose-invert lg:prose-xl mx-auto font-[family-name:var(--font-space-grotesk)]"
      )}
    >
      <div className="flex items-center gap-2 font-semibold text-lg">
        {/* <Brain className="h-6 w-6 text-red-500" />
        <span className="hidden sm:inline-block">{"LALA"}</span>
        <span className="sm:hidden">SPM</span> */}
        {/* <Link href="/" className="no-underline">
          <h4 className="text-sm ">cyberpunga</h4>
        </Link> */}
      </div>
      <div className="ml-auto flex items-center gap-4">
        {/* <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder={"LALA"}
            className="rounded-md border bg-background pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 w-[240px]"
          />
        </div> */}
        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{"LALA"}</TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
        {children}
        {/* <LanguageSelector /> */}
        {/* <Badge variant="outline" className="border-red-800/50 bg-red-500/10 text-red-500 gap-1 hidden sm:flex">
          <Clock className="h-3 w-3" />
          {"LALA"}
        </Badge> */}
      </div>
    </header>
  );
}
