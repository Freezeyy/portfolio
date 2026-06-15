'use client';

import { motion } from 'framer-motion';
import { Download, Mail } from 'lucide-react';
import type { Profile } from '@/types';
import { getMediaUrl } from '@/lib/strapi';
import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from '@/components/icons/SocialIcons';
import { SectionLabel } from '@/components/About';

export function Contact({ profile }: { profile: Profile }) {
  const resumeUrl = getMediaUrl(profile.resume);

  const links = [
    {
      label: 'Email',
      value: profile.email,
      href: profile.email ? `mailto:${profile.email}` : null,
      icon: Mail,
    },
    {
      label: 'Resume',
      value: 'Download PDF',
      href: resumeUrl,
      icon: Download,
    },
    {
      label: 'GitHub',
      value: 'View profile',
      href: profile.github,
      icon: GitHubIcon,
    },
    {
      label: 'LinkedIn',
      value: 'Connect',
      href: profile.linkedin,
      icon: LinkedInIcon,
    },
    {
      label: 'WhatsApp',
      value: 'Message me',
      href: profile.whatsapp,
      icon: WhatsAppIcon,
    },
  ].filter((link) => link.href);

  return (
    <section id="contact" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-10 sm:p-16"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative max-w-2xl">
            <SectionLabel>Contact</SectionLabel>
            <h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Let&apos;s build something together
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Have a project in mind or just want to say hello? I&apos;d love to
              hear from you.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href!}
                  target={link.label === 'Email' ? undefined : '_blank'}
                  rel={link.label === 'Email' ? undefined : 'noopener noreferrer'}
                  className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-[#050508]/40 px-5 py-4 transition hover:border-accent/30 hover:bg-[#050508]/60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition group-hover:text-accent">
                    <link.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      {link.label}
                    </p>
                    <p className="text-sm font-medium text-white">{link.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-white/5 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {name}. Crafted with Strapi + Next.js.
        </p>
        <a href="#" className="transition hover:text-white">
          Back to top
        </a>
      </div>
    </footer>
  );
}
