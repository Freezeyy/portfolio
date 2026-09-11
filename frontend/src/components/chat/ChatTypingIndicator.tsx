'use client';

import { motion } from 'framer-motion';

export function ChatTypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 0.75,
            repeat: Infinity,
            delay: i * 0.12,
            ease: 'easeInOut',
          }}
          className="h-2 w-2 rounded-full bg-zinc-400"
        />
      ))}
    </div>
  );
}
