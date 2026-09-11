'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

export type MascotState = 'idle' | 'thinking' | 'speaking';

interface ChatMascotProps {
  state: MascotState;
  name: string;
  compact?: boolean;
}

const statusCopy: Record<MascotState, string> = {
  idle: 'Ready to chat!',
  thinking: 'Hmm, let me think...',
  speaking: 'Putting it together...',
};

const mascotImages = {
  idle: '/mascot/idle.png',
  thinking: '/mascot/thinking.png',
  speaking: '/mascot/speaking.png',
} as const;

/** Remove this line once speaking.png is added */
const useSpeakingFallback = true;

function resolveMascotImage(state: MascotState): string {
  if (useSpeakingFallback && state === 'speaking') return mascotImages.idle;
  return mascotImages[state];
}

export function ChatMascot({ state, name, compact = false }: ChatMascotProps) {
  const scale = compact ? 0.72 : 1;
  const imageSrc = resolveMascotImage(state);

  return (
    <div
      className={`relative flex flex-col items-center ${compact ? 'py-2' : 'py-4'}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
    >
      {/* Ambient glow */}
      <motion.div
        animate={{
          opacity: state === 'idle' ? 0.35 : state === 'thinking' ? 0.65 : 0.5,
          scale: state === 'thinking' ? [1, 1.12, 1] : 1,
        }}
        transition={{
          duration: state === 'thinking' ? 1.4 : 0.6,
          repeat: state === 'thinking' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className="absolute top-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl"
      />

      {/* Thought bubble */}
      <AnimatePresence>
        {state === 'thinking' && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            className="absolute -top-2 z-10 rounded-2xl border border-white/10 bg-[#0c0c12] px-4 py-2 shadow-lg shadow-accent/10"
          >
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className="inline-block h-2 w-2 rounded-full bg-accent"
                />
              ))}
            </div>
            <div className="absolute -bottom-2 left-6 h-3 w-3 rotate-45 border-b border-r border-white/10 bg-[#0c0c12]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character image + motion */}
      <motion.div
        animate={{
          y: state === 'idle' ? [0, -6, 0] : state === 'thinking' ? [0, -3, 0] : [0, -5, 0],
          rotate: state === 'thinking' ? [-2, 2, -2] : 0,
          scale: state === 'speaking' ? [1, 1.03, 1] : state === 'idle' ? [1, 1.015, 1] : 1,
        }}
        transition={{
          duration: state === 'idle' ? 3.5 : state === 'thinking' ? 1.2 : 0.55,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-[1]"
      >
        {/* Ground shadow */}
        <div className="absolute -bottom-1 left-1/2 h-3 w-32 -translate-x-1/2 rounded-full bg-black/30 blur-md" />

        <div className="relative h-52 w-44">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative h-full w-full"
            >
              <Image
                src={imageSrc}
                alt={`${name}'s AI twin — ${state}`}
                fill
                className="object-contain drop-shadow-2xl"
                sizes="176px"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Orbiting sparkles when thinking */}
        <AnimatePresence>
          {state === 'thinking' &&
            [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                  x: [0, Math.cos(i * 2.1) * 28, 0],
                  y: [0, Math.sin(i * 2.1) * 28, 0],
                }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.35 }}
                className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_#f0b429]"
              />
            ))}
        </AnimatePresence>
      </motion.div>

      {/* Status */}
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-center"
      >
        <p className="font-display text-sm font-semibold text-white">
          {name.split(' ')[0]}&apos;s AI Twin
        </p>
        <motion.p
          animate={{ opacity: state === 'idle' ? 0.55 : 1 }}
          className="mt-1 text-xs text-accent"
        >
          {statusCopy[state]}
        </motion.p>
      </motion.div>

      {/* Speaking wave bars */}
      <AnimatePresence>
        {state === 'speaking' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-end justify-center gap-1"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                animate={{ height: [8, 18 + i * 2, 8] }}
                transition={{
                  duration: 0.45,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: 'easeInOut',
                }}
                className="w-1 rounded-full bg-accent/80"
                style={{ height: 8 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
