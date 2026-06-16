"use client";

import React, { useState, useEffect } from "react";
import { YugantarIntro } from "./YugantarIntro";
import { motion, AnimatePresence } from "framer-motion";

export function LoaderOrchestrator({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (sessionStorage.getItem("yugantar-2026-loader-seen")) {
      setShowLoader(false);
    }
  }, []);

  const handleComplete = () => {
    setShowLoader(false);
    sessionStorage.setItem("yugantar-2026-loader-seen", "true");
  };

  if (!isMounted) {
    return <div className="min-h-full flex flex-col flex-1">{children}</div>;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showLoader && (
          <YugantarIntro onComplete={handleComplete} key="loader" />
        )}
      </AnimatePresence>

      <motion.div
        initial={showLoader ? { opacity: 0, y: 20, filter: "blur(8px)" } : false}
        animate={!showLoader ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-full flex flex-col flex-1"
      >
        {children}
      </motion.div>
    </>
  );
}
