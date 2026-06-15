'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Experience } from '@/types';
import { getMediaUrl } from '@/lib/strapi';
import { formatDateRange } from '@/lib/utils';
import { SectionLabel } from '@/components/About';

export function ExperienceSection({
  experiences,
}: {
  experiences: Experience[];
}) {
  return (
    <section id="experience" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <SectionLabel>Experience</SectionLabel>
          <h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Where I&apos;ve worked
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute bottom-0 left-[19px] top-0 w-px bg-gradient-to-b from-accent/50 via-white/10 to-transparent md:left-1/2 md:-translate-x-px" />

          <div className="space-y-10">
            {experiences.map((experience, index) => {
              const logoUrl = getMediaUrl(experience.logo);
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={experience.documentId}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className={`relative grid gap-6 md:grid-cols-2 md:gap-12 ${
                    isEven ? '' : 'md:[&>div:first-child]:order-2'
                  }`}
                >
                  <div className={`${isEven ? 'md:text-right' : ''}`}>
                    <div
                      className={`inline-flex items-center gap-3 ${
                        isEven ? 'md:flex-row-reverse' : ''
                      }`}
                    >
                      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/30 bg-[#050508]">
                        {logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt={experience.company}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="font-display text-xs font-bold text-accent">
                            {experience.company[0]}
                          </span>
                        )}
                      </div>
                      <div className={isEven ? 'md:text-right' : ''}>
                        <p className="font-mono text-xs text-accent">
                          {formatDateRange(
                            experience.startDate,
                            experience.endDate
                          )}
                        </p>
                        <h3 className="font-display text-xl font-semibold text-white">
                          {experience.role}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          {experience.company}
                          {experience.location ? ` · ${experience.location}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
                    {experience.description && (
                      <p className="text-sm leading-relaxed text-zinc-400">
                        {experience.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
