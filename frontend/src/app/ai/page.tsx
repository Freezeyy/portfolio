import { ChatPortfolio } from '@/components/chat/ChatPortfolio';
import { EmptyState } from '@/components/EmptyState';
import { getPortfolioData } from '@/lib/strapi';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolioData();

  if (!profile) {
    return { title: 'AI Twin', description: 'AI portfolio assistant' };
  }

  return {
    title: `${profile.name} — AI Twin`,
    description: `Ask ${profile.name}'s AI twin about skills, projects, and experience.`,
  };
}

export default async function AiPage() {
  const data = await getPortfolioData();

  if (!data.profile) {
    return <EmptyState />;
  }

  return <ChatPortfolio profile={data.profile} />;
}
