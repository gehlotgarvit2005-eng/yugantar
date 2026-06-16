"use client";

import { useState, useEffect } from "react";
import { CinematicLoader } from "./CinematicLoader";
import { ScrollProgress } from "./ScrollProgress";

export function CinematicLoaderWrapper() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // If previously shown in this session, skip immediately
    if (sessionStorage.getItem("yugantar-intro-shown")) {
      setShowLoader(false);
    }
  }, []);

  const handleComplete = () => {
    setShowLoader(false);
    sessionStorage.setItem("yugantar-intro-shown", "true");
  };

  return (
    <>
      {showLoader && <CinematicLoader onComplete={handleComplete} />}
      <ScrollProgress />
    </>
  );
}
