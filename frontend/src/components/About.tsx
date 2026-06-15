'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Profile } from '@/types';
import { getMediaUrl } from '@/lib/strapi';

export function About({ profile }: { profile: Profile }) {
  const avatarUrl = getMediaUrl(profile.avatar);

  return (
    <section id="about" className="px-6 py-28">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <SectionLabel>About</SectionLabel>
          <h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {profile.aboutTitle ?? profile.headline}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">{profile.bio}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent/20 via-violet-500/10 to-transparent blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={profile.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <span className="font-display text-7xl font-bold text-white/10">
                    {profile.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-[#050508]/80 p-4 backdrop-blur-md">
              <p className="text-sm text-zinc-400">Currently based in</p>
              <p className="font-medium text-white">{profile.location ?? 'Remote'}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
      {children}
    </p>
  );
}
