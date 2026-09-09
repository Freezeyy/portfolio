import { ChatPortfolio } from '@/components/chat/ChatPortfolio';
import { EmptyState } from '@/components/EmptyState';
import { getPortfolioData } from '@/lib/strapi';
import type { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolioData();

  if (!profile) {
    return { title: 'Portfolio', description: 'AI-powered portfolio' };
  }

  return {
    title: `${profile.name} — AI Portfolio`,
    description: `Ask ${profile.name}'s AI assistant about skills, projects, and experience.`,
  };
}

export default async function HomePage() {
  const data = await getPortfolioData();

  if (!data.profile) {
    return <EmptyState />;
  }

  return (
    <>
      <ChatPortfolio profile={data.profile} />
      <div className="fixed bottom-20 right-4 z-20">
        <Link
          href="/classic"
          className="rounded-full border border-white/10 bg-[#050508]/80 px-3 py-1.5 text-xs text-zinc-500 backdrop-blur transition hover:border-white/20 hover:text-white"
        >
          Classic view
        </Link>
      </div>
    </>
  );
}
