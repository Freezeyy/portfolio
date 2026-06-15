'use client';

import { motion } from 'framer-motion';
import type { Education } from '@/types';
import { formatDateRange } from '@/lib/utils';
import { SectionLabel } from '@/components/About';

export function EducationSection({
  educations,
}: {
  educations: Education[];
}) {
  if (educations.length === 0) return null;

  return (
    <section className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <SectionLabel>Education</SectionLabel>
          <h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Academic background
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {educations.map((education, index) => (
            <motion.div
              key={education.documentId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-3xl border border-white/8 bg-white/[0.02] p-6"
            >
              <p className="font-mono text-xs text-zinc-500">
                {formatDateRange(education.startDate, education.endDate)}
              </p>
              <h3 className="font-display mt-3 text-xl font-semibold text-white">
                {education.degree}
              </h3>
              <p className="mt-1 text-sm text-accent">{education.institution}</p>
              {education.field && (
                <p className="mt-2 text-sm text-zinc-500">{education.field}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
