'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowUp, Sparkles } from 'lucide-react';
import Image from 'next/image';
import type { Profile } from '@/types';
import { getMediaUrl } from '@/lib/strapi';
import { ChatMarkdown } from '@/components/chat/ChatMarkdown';
import { ChatMascot, getMascotImage, type MascotState } from '@/components/chat/ChatMascot';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import type { ChatMessage } from '@/lib/chat/types';
import {
  createWelcomeMessage,
  loadChatSession,
  saveChatSession,
  toApiHistory,
} from '@/lib/chat/storage';
import { typewriterReveal } from '@/lib/chat/typewriter-reveal';

const suggestedQuestions = [
  'What projects have you built?',
  'What technologies do you work with?',
  'Tell me about your work experience',
  'Are you available for hire?',
];

function ChatAssistantAvatar({ state }: { state: MascotState }) {
  return (
    <div className="relative mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-accent/25 bg-zinc-900 ring-1 ring-accent/10">
      <Image
        src={getMascotImage(state)}
        alt=""
        fill
        className="object-cover object-top"
        sizes="32px"
      />
    </div>
  );
}

export function ChatPortfolio({ profile }: { profile: Profile }) {
  const avatarUrl = getMediaUrl(profile.avatar);
  const welcomeMessage = useMemo(
    () => createWelcomeMessage(profile.name),
    [profile.name]
  );
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const stored = loadChatSession();
    if (stored?.length) {
      setMessages([welcomeMessage, ...stored]);
    }
    setHydrated(true);
  }, [welcomeMessage]);

  useEffect(() => {
    if (!hydrated || isLoading) return;
    saveChatSession(messages);
  }, [messages, hydrated, isLoading]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const history = toApiHistory(messages);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setMascotState('thinking');

    const assistantId = crypto.randomUUID();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? 'Request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '' },
      ]);
      setMascotState('speaking');

      const decoder = new TextDecoder();
      let fullText = '';
      let streamDone = false;

      const updateAssistantContent = (content: string) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content } : m))
        );
      };

      const revealPromise = typewriterReveal({
        readTarget: () => fullText,
        isStreamDone: () => streamDone,
        onReveal: updateAssistantContent,
        msPerWord: 38,
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      streamDone = true;
      await revealPromise;
    } catch (error) {
      setMascotState('idle');
      const errorContent =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === assistantId);
        if (exists) {
          return prev.map((m) =>
            m.id === assistantId ? { ...m, content: errorContent } : m
          );
        }
        return [
          ...prev,
          { id: assistantId, role: 'assistant' as const, content: errorContent },
        ];
      });
    } finally {
      setIsLoading(false);
      setMascotState('idle');
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute -right-24 bottom-32 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(240,180,41,0.06)_0%,_transparent_55%)]" />
      </div>

      {/* Header */}
      <header className="relative z-20 shrink-0 border-b border-white/5 bg-[#050508]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:justify-between sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-accent/30 bg-zinc-900 ring-2 ring-accent/10 sm:h-9 sm:w-9">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 32px, 36px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-bold text-accent">
                  {profile.name[0]}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-white">{profile.name}</p>
                <span className="hidden shrink-0 items-center gap-1 rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent sm:inline-flex">
                  <Sparkles size={10} />
                  AI Twin
                </span>
              </div>
              <p className="truncate text-xs text-zinc-500">{profile.headline}</p>
            </div>
          </div>
          <Link
            href="/"
            className="shrink-0 whitespace-nowrap text-xs text-zinc-500 transition hover:text-white"
          >
            <span className="sm:hidden">← Back</span>
            <span className="hidden sm:inline">← Back to portfolio</span>
          </Link>
        </div>
      </header>

      {/* Body — mascot stays fixed, chat scrolls */}
      <div className="relative z-10 mx-auto grid min-h-0 w-full max-w-6xl flex-1 grid-cols-1 px-6 lg:grid-cols-[16rem_1fr] lg:gap-x-10">
        {/* Mascot — desktop sidebar (never scrolls) */}
        <aside className="hidden min-h-0 items-center justify-center py-6 lg:flex">
          <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4 backdrop-blur-sm">
            <ChatMascot state={mascotState} name={profile.name} />
          </div>
        </aside>

        {/* Chat column */}
        <main className="flex min-h-0 flex-col lg:col-start-2">
          {/* Mascot — mobile slim strip */}
          <div className="mb-2 shrink-0 lg:hidden">
            <div className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 backdrop-blur-sm">
              <ChatMascot state={mascotState} name={profile.name} variant="mobile" />
            </div>
          </div>

          {/* Scrollable messages only */}
          <div
            ref={scrollRef}
            className="chat-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-2"
          >
            <div className="space-y-5 pb-2">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {message.role === 'assistant' && (
                      <ChatAssistantAvatar
                        state={
                          message.id === messages[messages.length - 1]?.id &&
                          mascotState !== 'idle'
                            ? mascotState
                            : 'idle'
                        }
                      />
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        message.role === 'user'
                          ? 'bg-accent text-[#050508] font-medium shadow-accent/20'
                          : 'border border-white/8 bg-white/[0.04] text-zinc-300 shadow-black/20'
                      }`}
                    >
                      {message.content ? (
                        message.role === 'assistant' ? (
                          <ChatMarkdown content={message.content} />
                        ) : (
                          message.content
                        )
                      ) : (
                        <ChatTypingIndicator />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <ChatAssistantAvatar state={mascotState} />
                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 shadow-sm">
                    <ChatTypingIndicator />
                  </div>
                </motion.div>
              )}
            </div>

            {messages.length === 1 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 pb-2"
              >
                <p className="mb-3 text-xs uppercase tracking-wider text-zinc-600">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <motion.button
                      key={q}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.06 }}
                      whileHover={{ scale: 1.03, borderColor: 'rgba(240,180,41,0.35)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage(q)}
                      className="rounded-full border border-white/8 bg-white/[0.02] px-4 py-2 text-xs text-zinc-400 transition hover:text-white"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Input — pinned to bottom */}
      <div className="relative z-20 shrink-0 border-t border-white/5 bg-[#050508]/90 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-1 px-6 lg:grid-cols-[16rem_1fr] lg:gap-x-10">
          <div className="hidden lg:block" aria-hidden />
          <form onSubmit={handleSubmit} className="flex items-end gap-3 py-4">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isLoading ? 'AI twin is thinking...' : 'Ask about my work, skills, projects...'
              }
              rows={1}
              disabled={isLoading}
              className="max-h-32 flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/10 disabled:opacity-50"
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-[#050508] transition hover:bg-accent/90 disabled:opacity-40"
            >
              <ArrowUp size={18} />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
