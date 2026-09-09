import type { PortfolioData } from '@/types';

export interface RagChunk {
  id: string;
  type: string;
  title: string;
  content: string;
}

const skillCategoryLabels: Record<string, string> = {
  language: 'Languages',
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Databases',
  devops: 'DevOps & Tools',
  framework: 'Frontend',
  design: 'Other',
  tools: 'DevOps & Tools',
  other: 'Other',
};

function formatDate(date?: string | null): string {
  if (!date) return 'Present';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export function portfolioToChunks(data: PortfolioData): RagChunk[] {
  const chunks: RagChunk[] = [];
  const { profile, skills, projects, experiences, educations } = data;

  if (!profile) return chunks;

  chunks.push({
    id: 'profile',
    type: 'profile',
    title: profile.name,
    content: [
      `Name: ${profile.name}`,
      `Headline: ${profile.headline}`,
      profile.aboutTitle ? `About title: ${profile.aboutTitle}` : null,
      `Bio: ${profile.bio}`,
      profile.location ? `Location: ${profile.location}` : null,
      profile.availableForWork ? 'Currently available for work.' : 'Not actively looking for work.',
      profile.email ? `Email: ${profile.email}` : null,
      profile.website ? `Website: ${profile.website}` : null,
      profile.github ? `GitHub: ${profile.github}` : null,
      profile.linkedin ? `LinkedIn: ${profile.linkedin}` : null,
      profile.whatsapp ? `WhatsApp: ${profile.whatsapp}` : null,
      profile.resume ? 'Resume PDF is available for download on the portfolio.' : null,
    ]
      .filter(Boolean)
      .join('\n'),
  });

  if (skills.length > 0) {
    const grouped = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
      const label = skillCategoryLabels[skill.category] ?? skill.category;
      acc[label] = acc[label] ?? [];
      acc[label].push(skill);
      return acc;
    }, {});

    for (const [category, items] of Object.entries(grouped)) {
      chunks.push({
        id: `skills-${category.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'skills',
        title: `${category} skills`,
        content: items
          .map((s) => `${s.name} (${s.proficiency}% proficiency)`)
          .join(', '),
      });
    }
  }

  for (const project of projects) {
    const tech = Array.isArray(project.technologies)
      ? project.technologies.join(', ')
      : '';
    chunks.push({
      id: `project-${project.documentId}`,
      type: 'project',
      title: project.title,
      content: [
        `Project: ${project.title}`,
        `Description: ${project.description}`,
        project.content ? `Details: ${project.content}` : null,
        tech ? `Technologies: ${tech}` : null,
        project.featured ? 'Featured project.' : null,
        project.liveUrl ? `Live URL: ${project.liveUrl}` : null,
        project.githubUrl ? `GitHub: ${project.githubUrl}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  for (const experience of experiences) {
    chunks.push({
      id: `experience-${experience.documentId}`,
      type: 'experience',
      title: `${experience.role} at ${experience.company}`,
      content: [
        `Role: ${experience.role}`,
        `Company: ${experience.company}`,
        experience.location ? `Location: ${experience.location}` : null,
        `Duration: ${formatDate(experience.startDate)} – ${formatDate(experience.endDate)}`,
        experience.description ? `Description: ${experience.description}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  for (const education of educations) {
    chunks.push({
      id: `education-${education.documentId}`,
      type: 'education',
      title: `${education.degree} — ${education.institution}`,
      content: [
        `Degree: ${education.degree}`,
        `Institution: ${education.institution}`,
        education.field ? `Field: ${education.field}` : null,
        education.startDate || education.endDate
          ? `Duration: ${formatDate(education.startDate)} – ${formatDate(education.endDate)}`
          : null,
        education.description ? `Details: ${education.description}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  return chunks;
}
