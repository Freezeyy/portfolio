'use client';

import { motion } from 'framer-motion';
import type { Skill } from '@/types';
import { SectionLabel } from '@/components/About';

const categoryConfig: Record<
  Skill['category'],
  { label: string; order: number }
> = {
  language: { label: 'Languages', order: 1 },
  frontend: { label: 'Frontend', order: 2 },
  backend: { label: 'Backend', order: 3 },
  database: { label: 'Databases', order: 4 },
  devops: { label: 'DevOps & Tools', order: 5 },
};

const legacyCategoryMap: Record<string, Skill['category']> = {
  framework: 'frontend',
  design: 'frontend',
  tools: 'devops',
  other: 'backend',
};

function normalizeCategory(category: string): Skill['category'] {
  if (category in categoryConfig) return category as Skill['category'];
  return legacyCategoryMap[category] ?? 'frontend';
}

function SkillBar({ skill, index }: { skill: Skill; index: number }) {
  return (
    <div className="group">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-zinc-200 transition group-hover:text-white">
          {skill.name}
        </span>
        <span className="font-mono text-xs tabular-nums text-zinc-600 transition group-hover:text-zinc-400">
          {skill.proficiency}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.proficiency}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent/50"
        />
      </div>
    </div>
  );
}

export function Skills({ skills }: { skills: Skill[] }) {
  const grouped = skills.reduce<Record<Skill['category'], Skill[]>>((acc, skill) => {
    const key = normalizeCategory(skill.category);
    acc[key] = acc[key] ?? [];
    acc[key].push(skill);
    return acc;
  }, {} as Record<Skill['category'], Skill[]>);

  for (const key of Object.keys(grouped) as Skill['category'][]) {
    grouped[key].sort((a, b) => a.order - b.order || b.proficiency - a.proficiency);
  }

  const categories = (Object.keys(grouped) as Skill['category'][]).sort(
    (a, b) => categoryConfig[a].order - categoryConfig[b].order
  );

  return (
    <section id="skills" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <SectionLabel>Skills</SectionLabel>
          <h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            What I work with
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl border border-white/8 bg-white/[0.02] p-8 sm:p-10"
        >
          <div className="grid gap-10 sm:grid-cols-2 lg:gap-x-16">
            {categories.map((category, categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.06 }}
              >
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  {categoryConfig[category].label}
                </h3>

                <div className="mt-6 space-y-5">
                  {grouped[category].map((skill, skillIndex) => (
                    <SkillBar key={skill.documentId} skill={skill} index={skillIndex} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
