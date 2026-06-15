import { About } from '@/components/About';
import { Contact, Footer } from '@/components/Contact';
import { EducationSection } from '@/components/Education';
import { EmptyState } from '@/components/EmptyState';
import { ExperienceSection } from '@/components/Experience';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Projects } from '@/components/Projects';
import { Skills } from '@/components/Skills';
import { getPortfolioData } from '@/lib/strapi';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolioData();

  if (!profile) {
    return { title: 'Portfolio', description: 'Personal portfolio powered by Strapi CMS' };
  }

  return {
    title: `${profile.name} — Portfolio`,
    description: profile.headline,
  };
}

export default async function HomePage() {
  const data = await getPortfolioData();

  if (!data.profile) {
    return <EmptyState />;
  }

  const { profile, skills, projects, experiences, educations } = data;

  return (
    <>
      <Header name={profile.name} />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <ExperienceSection experiences={experiences} />
        <EducationSection educations={educations} />
        <Contact profile={profile} />
      </main>
      <Footer name={profile.name} />
    </>
  );
}
