function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface TypewriterRevealOptions {
  /** Reads the full text received so far from the network stream */
  readTarget: () => string;
  /** Returns true once the network stream has finished */
  isStreamDone: () => boolean;
  /** Called with progressively longer slices of the target text */
  onReveal: (partial: string) => void;
  /** Delay between each revealed word (default 38ms) */
  msPerWord?: number;
}

/**
 * Reveals streamed text word-by-word even when the server dumps the full
 * response in a single chunk — gives a natural typing effect on the client.
 */
export async function typewriterReveal({
  readTarget,
  isStreamDone,
  onReveal,
  msPerWord = 38,
}: TypewriterRevealOptions): Promise<void> {
  let revealed = 0;

  while (true) {
    const target = readTarget();

    if (revealed >= target.length) {
      if (isStreamDone()) break;
      await sleep(16);
      continue;
    }

    const rest = target.slice(revealed);
    const wordMatch = rest.match(/^\S+\s*/);
    const step = wordMatch ? wordMatch[0].length : 1;

    revealed += step;
    onReveal(target.slice(0, revealed));
    await sleep(msPerWord);
  }
}
