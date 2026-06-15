'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { GitHubIcon } from '@/components/icons/SocialIcons';
import type { Project } from '@/types';
import { getMediaUrl } from '@/lib/strapi';
import { SectionLabel } from '@/components/About';

export function Projects({ projects }: { projects: Project[] }) {
  const featured = projects.filter((project) => project.featured);
  const rest = projects.filter((project) => !project.featured);
  const displayProjects = featured.length > 0 ? featured : projects;

  return (
    <section id="projects" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div className="max-w-2xl">
            <SectionLabel>Projects</SectionLabel>
            <h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Selected work
            </h2>
          </div>
          <p className="max-w-sm text-sm text-zinc-500">
            A curated collection of products, platforms, and experiments.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {displayProjects.map((project, index) => (
            <ProjectCard key={project.documentId} project={project} index={index} />
          ))}
        </div>

        {rest.length > 0 && (
          <div className="mt-6 grid gap-4">
            {rest.map((project, index) => (
              <CompactProjectRow
                key={project.documentId}
                project={project}
                index={index + displayProjects.length}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const imageUrl = getMediaUrl(project.image);
  const technologies = Array.isArray(project.technologies)
    ? project.technologies
    : [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-end bg-gradient-to-br from-zinc-800 via-zinc-900 to-[#050508] p-8">
            <span className="font-display text-5xl font-bold text-white/10">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/20 to-transparent" />
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-semibold text-white">
            {project.title}
          </h3>
          <div className="flex shrink-0 gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} on GitHub`}
                className="rounded-full border border-white/10 p-2 text-zinc-400 transition hover:border-white/20 hover:text-white"
              >
                <GitHubIcon size={16} />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live site`}
                className="rounded-full border border-white/10 p-2 text-zinc-400 transition hover:border-accent/40 hover:text-accent"
              >
                <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-zinc-400">
          {project.description}
        </p>

        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

function CompactProjectRow({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <motion.a
      href={project.liveUrl ?? project.githubUrl ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.02] px-6 py-4 transition hover:border-white/12 hover:bg-white/[0.04]"
    >
      <div>
        <h3 className="font-medium text-white transition group-hover:text-accent">
          {project.title}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">{project.description}</p>
      </div>
      <ArrowUpRight
        size={18}
        className="shrink-0 text-zinc-600 transition group-hover:text-accent"
      />
    </motion.a>
  );
}
