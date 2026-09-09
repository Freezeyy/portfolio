'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowDown, Download, Mail, Sparkles } from 'lucide-react';
import type { Profile } from '@/types';
import { getMediaUrl } from '@/lib/strapi';
import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from '@/components/icons/SocialIcons';

export function Hero({ profile }: { profile: Profile }) {
  const resumeUrl = getMediaUrl(profile.resume);

  const socials = [
    { href: profile.github, icon: GitHubIcon, label: 'GitHub' },
    { href: profile.linkedin, icon: LinkedInIcon, label: 'LinkedIn' },
    { href: profile.whatsapp, icon: WhatsAppIcon, label: 'WhatsApp' },
    { href: profile.email ? `mailto:${profile.email}` : null, icon: Mail, label: 'Email' },
  ].filter((item) => item.href);

  return (
    <section className="relative flex min-h-screen items-center px-6 pt-24">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          {profile.availableForWork && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Available for work
            </motion.div>
          )}

          <p className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-accent">
            Portfolio
          </p>

          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl">
            {profile.name}
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-zinc-400 sm:text-2xl">
            {profile.headline}
          </p>

          {profile.location && (
            <p className="mt-4 text-sm text-zinc-500">{profile.location}</p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-[#050508] transition hover:bg-accent/90"
            >
              View my work
              <ArrowDown
                size={16}
                className="transition group-hover:translate-y-0.5"
              />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5"
            >
              Get in touch
            </a>
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-6 py-3 text-sm font-medium text-accent transition hover:border-accent/50 hover:bg-accent/15"
            >
              <Sparkles size={16} />
              Ask my AI twin
            </Link>
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white transition hover:border-accent/40 hover:text-accent"
              >
                <Download size={16} />
                Download resume
              </a>
            )}
          </div>

          {socials.length > 0 && (
            <div className="mt-12 flex items-center gap-3">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-accent/40 hover:text-accent"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 md:block">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-zinc-600"
        >
          <ArrowDown size={20} />
        </motion.div>
      </div>
    </section>
  );
}
