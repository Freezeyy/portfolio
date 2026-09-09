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

export const metadata: Metadata = {
  title: 'Classic Portfolio',
};

export default async function ClassicPage() {
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
