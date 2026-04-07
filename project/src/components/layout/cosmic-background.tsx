"use client";

import { motion } from "framer-motion";

export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      {/* Layer 1: Distant static stars */}
      <div className="absolute inset-0 star-field opacity-20" />

      {/* Layer 2: Mid-ground drifting and twinkling stars */}
      <motion.div
        animate={{
          x: [0, -30, 15, 0],
          y: [0, 20, -20, 0],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-[-20%] star-field opacity-40 animate-twinkle"
      />

      {/* Layer 3: Foreground slow nebula pulses */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.15, 0.95, 1],
            opacity: [0.04, 0.07, 0.04],
            x: [0, 20, -10, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] rounded-full bg-white blur-[160px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 0.85, 1],
            opacity: [0.02, 0.05, 0.02],
            y: [0, -30, 15, 0],
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full bg-white blur-[140px]"
        />
      </div>

      {/* Layer 4: Depth vignetting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60" />
    </div>
  );
}
