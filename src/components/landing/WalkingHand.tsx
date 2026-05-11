"use client";

// PLACEHOLDER: replace with Mario & Rafa asset when delivered.
// Stylised hand+arm with two fingers as "legs" doing a walking cycle.
// The arm bobs gently; the two fingers alternate up/down at ~1Hz.

import { motion } from "framer-motion";

const STEP_DURATION = 0.55;

export function WalkingHand() {
  return (
    <div className="relative mx-auto w-full max-w-[320px] select-none">
      <motion.div
        className="relative h-[200px]"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 flex h-full items-end justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: STEP_DURATION * 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <svg
            viewBox="0 0 240 180"
            className="h-full w-auto drop-shadow-[0_18px_24px_rgba(0,0,0,0.18)]"
            aria-hidden
          >
            <defs>
              <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FBD9C6" />
                <stop offset="100%" stopColor="#F4B997" />
              </linearGradient>
              <linearGradient id="sleeve" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--secondary)" />
                <stop offset="100%" stopColor="var(--secondary-hover)" />
              </linearGradient>
            </defs>

            {/* sleeve / forearm — emerges from the right edge */}
            <path
              d="M240 40 Q200 38 178 52 L156 90 Q176 96 198 92 Q224 88 240 78 Z"
              fill="url(#sleeve)"
            />
            {/* cuff */}
            <path
              d="M156 90 Q166 94 178 96 L184 76 Q170 74 156 78 Z"
              fill="#fff"
              opacity="0.9"
            />
            {/* palm */}
            <ellipse cx="120" cy="96" rx="44" ry="34" fill="url(#skin)" />
            {/* thumb */}
            <ellipse
              cx="82"
              cy="78"
              rx="14"
              ry="9"
              fill="url(#skin)"
              transform="rotate(-22 82 78)"
            />
          </svg>

          {/* two fingers acting as legs — absolute, animated alternating */}
          <div className="pointer-events-none absolute bottom-[14px] left-1/2 flex w-[120px] -translate-x-[58%] justify-between">
            <Leg delay={0} />
            <Leg delay={STEP_DURATION} />
          </div>
        </motion.div>

        {/* floor dais — accent strip the hand "walks on" */}
        <div
          className="absolute inset-x-6 bottom-1 h-[10px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--accent) 0%, rgba(184,228,239,0.15) 70%, transparent 100%)",
          }}
        />
      </motion.div>
    </div>
  );
}

function Leg({ delay }: { delay: number }) {
  return (
    <motion.div
      className="h-[44px] w-[22px] rounded-full"
      style={{
        background:
          "linear-gradient(180deg, #FBD9C6 0%, #F4B997 60%, #E29874 100%)",
        boxShadow: "0 6px 10px rgba(0,0,0,0.18)",
      }}
      animate={{ y: [0, -14, 0], rotate: [-2, 4, -2] }}
      transition={{
        duration: STEP_DURATION * 2,
        ease: "easeInOut",
        repeat: Infinity,
        delay,
      }}
    />
  );
}
