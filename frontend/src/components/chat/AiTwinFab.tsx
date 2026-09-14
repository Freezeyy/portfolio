'use client';

import { animate, motion, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'ai-twin-fab-position';
const DRAG_THRESHOLD_PX = 12;
const MARGIN = 16;

type Edge = 'left' | 'right';

interface SavedPosition {
  edge: Edge;
  y: number;
}

function clampY(y: number, height: number) {
  const maxY = Math.max(MARGIN, window.innerHeight - height - MARGIN);
  return Math.max(MARGIN, Math.min(y, maxY));
}

function snapToWall(centerX: number, width: number): { x: number; edge: Edge } {
  const snapLeft = centerX < window.innerWidth / 2;
  return {
    edge: snapLeft ? 'left' : 'right',
    x: snapLeft ? MARGIN : window.innerWidth - width - MARGIN,
  };
}

function parseSavedPosition(raw: string | null): SavedPosition | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as SavedPosition & { x?: number };
    if (data.edge && typeof data.y === 'number') {
      return { edge: data.edge, y: data.y };
    }
    // Migrate old { x, y } format
    if (typeof data.x === 'number' && typeof data.y === 'number') {
      return {
        edge: data.x < window.innerWidth / 2 ? 'left' : 'right',
        y: data.y,
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

export function AiTwinFab() {
  const pathname = usePathname();
  const router = useRouter();
  const fabRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const isDragGesture = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [edge, setEdge] = useState<Edge>('right');
  const [positioned, setPositioned] = useState(false);
  const [dragConstraints, setDragConstraints] = useState({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });

  const hidden = pathname.startsWith('/ai');

  const updateConstraints = useCallback(() => {
    const el = fabRef.current;
    if (!el) return;
    setDragConstraints({
      left: 0,
      top: 0,
      right: Math.max(0, window.innerWidth - el.offsetWidth),
      bottom: Math.max(0, window.innerHeight - el.offsetHeight),
    });
  }, []);

  const applySavedPosition = useCallback(
    (saved: SavedPosition | null) => {
      const el = fabRef.current;
      if (!el) return;

      const width = el.offsetWidth;
      const height = el.offsetHeight;

      if (saved) {
        const snapX =
          saved.edge === 'left'
            ? MARGIN
            : window.innerWidth - width - MARGIN;
        x.set(snapX);
        y.set(clampY(saved.y, height));
        setEdge(saved.edge);
      } else {
        x.set(window.innerWidth - width - MARGIN);
        y.set(window.innerHeight - height - MARGIN);
        setEdge('right');
      }
    },
    [x, y]
  );

  useLayoutEffect(() => {
    if (hidden) return;

    updateConstraints();
    const saved = parseSavedPosition(localStorage.getItem(STORAGE_KEY));
    applySavedPosition(saved);
    setPositioned(true);
  }, [hidden, applySavedPosition, updateConstraints]);

  useEffect(() => {
    if (hidden || !positioned) return;

    const onResize = () => {
      const el = fabRef.current;
      if (!el) return;

      const width = el.offsetWidth;
      const height = el.offsetHeight;
      const snapX =
        edge === 'left' ? MARGIN : window.innerWidth - width - MARGIN;

      x.set(snapX);
      y.set(clampY(y.get(), height));
      updateConstraints();
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [hidden, positioned, edge, x, y, updateConstraints]);

  function handlePointerDown(e: React.PointerEvent) {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    isDragGesture.current = false;
  }

  function handleDrag(_: unknown, info: { offset: { x: number; y: number } }) {
    if (Math.hypot(info.offset.x, info.offset.y) > DRAG_THRESHOLD_PX) {
      isDragGesture.current = true;
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!pointerStart.current) return;

    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    const distance = Math.hypot(dx, dy);
    pointerStart.current = null;

    // Wait one frame so onDrag / onDragEnd finish first
    requestAnimationFrame(() => {
      if (isDragGesture.current) return;
      if (distance < DRAG_THRESHOLD_PX) router.push('/ai');
    });
  }

  async function handleDragEnd() {
    if (!isDragGesture.current) return;

    const el = fabRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const { x: targetX, edge: targetEdge } = snapToWall(centerX, rect.width);
    const targetY = clampY(rect.top, rect.height);

    await Promise.all([
      animate(x, targetX, { type: 'spring', stiffness: 520, damping: 36 }),
      animate(y, targetY, { type: 'spring', stiffness: 520, damping: 36 }),
    ]);

    setEdge(targetEdge);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ edge: targetEdge, y: targetY })
    );
    isDragGesture.current = false;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push('/ai');
    }
  }

  if (hidden) return null;

  return (
    <motion.div
      ref={fabRef}
      drag
      dragConstraints={dragConstraints}
      dragElastic={0.08}
      dragMomentum={false}
      style={{ x, y, visibility: positioned ? 'visible' : 'hidden' }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: positioned ? 1 : 0, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Ask my AI twin — drag to reposition"
      className="group fixed left-0 top-0 z-50 flex cursor-grab touch-none flex-col items-center gap-1.5 active:cursor-grabbing"
    >
      <div className="relative">
        <span
          className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#0c0c12]/95 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 sm:block ${
            edge === 'left'
              ? 'left-[calc(100%+0.75rem)]'
              : 'right-[calc(100%+0.75rem)]'
          }`}
        >
          Ask my AI twin
        </span>

        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <motion.span
            animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.12, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-1.5 rounded-full bg-accent/40"
            aria-hidden
          />

          <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-accent/60 bg-zinc-900 shadow-lg shadow-accent/25 ring-4 ring-accent/15 transition group-hover:border-accent group-hover:shadow-accent/40 sm:h-20 sm:w-20">
            <Image
              src="/mascot/idle.png"
              alt=""
              fill
              className="scale-110 object-cover object-top"
              sizes="80px"
              draggable={false}
            />
          </div>
        </motion.div>
      </div>

      <span className="rounded-full border border-accent/25 bg-[#0c0c12]/95 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent shadow-lg backdrop-blur-sm sm:hidden">
        AI Twin
      </span>
    </motion.div>
  );
}
