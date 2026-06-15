import { AlertCircle } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 text-amber-400" size={32} />
        <h1 className="font-display text-2xl font-bold text-white">
          CMS not connected
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Start the Strapi CMS first, then refresh this page. Run{' '}
          <code className="rounded bg-white/10 px-2 py-0.5 text-amber-200">
            npm run dev:cms
          </code>{' '}
          from the project root.
        </p>
      </div>
    </div>
  );
}
