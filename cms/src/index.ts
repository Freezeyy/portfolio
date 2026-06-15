import type { Core } from '@strapi/strapi';

const PUBLIC_ACTIONS = [
  'api::profile.profile.find',
  'api::skill.skill.find',
  'api::skill.skill.findOne',
  'api::project.project.find',
  'api::project.project.findOne',
  'api::experience.experience.find',
  'api::experience.experience.findOne',
  'api::education.education.find',
  'api::education.education.findOne',
  'plugin::upload.content-api.find',
  'plugin::upload.content-api.findOne',
];

async function setPublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) return;

  for (const action of PUBLIC_ACTIONS) {
    const permission = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: publicRole.id } });

    if (!permission) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: publicRole.id },
      });
    }
  }
}

async function seedPortfolioData(strapi: Core.Strapi) {
  const existingProfile = await strapi.documents('api::profile.profile').findFirst({});

  if (existingProfile) return;

  await strapi.documents('api::profile.profile').create({
    data: {
      name: 'Alex Chen',
      headline: 'Full-Stack Developer & Creative Technologist',
      bio: 'I craft thoughtful digital experiences at the intersection of design and engineering. With a passion for clean architecture and pixel-perfect interfaces, I help teams ship products that feel as good as they look.',
      aboutTitle: 'Building digital products with intention',
      location: 'San Francisco, CA',
      email: 'hello@alexchen.dev',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      whatsapp: 'https://wa.me/1234567890',
      website: 'https://alexchen.dev',
      availableForWork: true,
    },
    status: 'published',
  });

  const skills: Array<{
    name: string;
    category: 'language' | 'frontend' | 'backend' | 'database' | 'devops';
    proficiency: number;
    order: number;
  }> = [
    { name: 'TypeScript', category: 'language', proficiency: 90, order: 1 },
    { name: 'JavaScript', category: 'language', proficiency: 92, order: 2 },
    { name: 'Python', category: 'language', proficiency: 82, order: 3 },
    { name: 'React', category: 'frontend', proficiency: 95, order: 4 },
    { name: 'Next.js', category: 'frontend', proficiency: 92, order: 5 },
    { name: 'Tailwind CSS', category: 'frontend', proficiency: 88, order: 6 },
    { name: 'Node.js', category: 'backend', proficiency: 88, order: 7 },
    { name: 'Strapi', category: 'backend', proficiency: 85, order: 8 },
    { name: 'PostgreSQL', category: 'database', proficiency: 80, order: 9 },
    { name: 'Docker', category: 'devops', proficiency: 78, order: 10 },
  ];

  for (const skill of skills) {
    await strapi.documents('api::skill.skill').create({
      data: skill,
      status: 'published',
    });
  }

  const projects = [
    {
      title: 'Nebula Analytics',
      slug: 'nebula-analytics',
      description:
        'Real-time data visualization platform processing 2M+ events daily with sub-second query latency.',
      technologies: ['Next.js', 'D3.js', 'PostgreSQL', 'Redis'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com',
      featured: true,
      order: 1,
    },
    {
      title: 'Pulse Health',
      slug: 'pulse-health',
      description:
        'Telemedicine app connecting patients with specialists — HIPAA compliant with end-to-end encryption.',
      technologies: ['React Native', 'Node.js', 'AWS', 'WebRTC'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com',
      featured: true,
      order: 2,
    },
    {
      title: 'Meridian Commerce',
      slug: 'meridian-commerce',
      description:
        'Headless e-commerce engine with AI-powered product recommendations and dynamic pricing.',
      technologies: ['Strapi', 'Next.js', 'Stripe', 'OpenAI'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com',
      featured: true,
      order: 3,
    },
    {
      title: 'Echo Social',
      slug: 'echo-social',
      description:
        'Community platform with real-time messaging, media sharing, and moderation tools.',
      technologies: ['Vue.js', 'Firebase', 'Cloudinary'],
      featured: false,
      order: 4,
    },
  ];

  for (const project of projects) {
    await strapi.documents('api::project.project').create({
      data: project,
      status: 'published',
    });
  }

  const experiences = [
    {
      company: 'Vercel',
      role: 'Senior Frontend Engineer',
      location: 'Remote',
      startDate: '2022-03-01',
      description:
        'Led performance initiatives reducing LCP by 40%. Built design system components used across 12 product teams.',
      order: 1,
    },
    {
      company: 'Stripe',
      role: 'Full-Stack Developer',
      location: 'San Francisco, CA',
      startDate: '2019-06-01',
      endDate: '2022-02-28',
      description:
        'Shipped payment dashboard features serving 100K+ merchants. Migrated legacy React class components to hooks.',
      order: 2,
    },
    {
      company: 'Freelance',
      role: 'Web Developer',
      location: 'Remote',
      startDate: '2017-01-01',
      endDate: '2019-05-31',
      description:
        'Delivered 20+ client projects spanning e-commerce, SaaS dashboards, and marketing sites.',
      order: 3,
    },
  ];

  for (const experience of experiences) {
    await strapi.documents('api::experience.experience').create({
      data: experience,
      status: 'published',
    });
  }

  const educations = [
    {
      institution: 'Stanford University',
      degree: 'M.S. Computer Science',
      field: 'Human-Computer Interaction',
      startDate: '2015-09-01',
      endDate: '2017-06-01',
      order: 1,
    },
    {
      institution: 'UC Berkeley',
      degree: 'B.S. Computer Science',
      field: 'Software Engineering',
      startDate: '2011-09-01',
      endDate: '2015-05-01',
      order: 2,
    },
  ];

  for (const education of educations) {
    await strapi.documents('api::education.education').create({
      data: education,
      status: 'published',
    });
  }

  strapi.log.info('Portfolio seed data created successfully.');
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await setPublicPermissions(strapi);
    await seedPortfolioData(strapi);
  },
};
