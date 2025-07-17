"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user has scrolled down 400px
      setIsVisible(window.scrollY > 400);
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      variant="outline"
      className={cn(
        "fixed bottom-8 right-8 z-50 transition-all duration-300 ease-in-out", // Adjusted position
        "bg-primary text-primary-foreground border-primary",
        "hover:bg-primary/90 hover:border-primary/90",
        "shadow-lg hover:shadow-xl",
        "backdrop-blur-sm bg-opacity-95 rounded-full h-12 w-12", // Increased size
        isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-8 pointer-events-none"
      )}
      aria-label="Back to top"
    >
      <ChevronUp className="h-4 w-4" />
    </Button>
  );
}
