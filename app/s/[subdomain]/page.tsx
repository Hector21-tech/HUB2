import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSubdomainData } from '@/lib/subdomains';
import { protocol, rootDomain } from '@/lib/utils';

export async function generateMetadata({
  params
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const subdomainData = await getSubdomainData(subdomain);

  if (!subdomainData) {
    return {
      title: rootDomain
    };
  }

  return {
    title: `${subdomainData.name} | Scout Hub`,
    description: `${subdomainData.description} - Enterprise-grade scouting platform`
  };
}

export default async function SubdomainPage({
  params
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const subdomainData = await getSubdomainData(subdomain);

  if (!subdomainData) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute top-4 right-4">
        <Link
          href={`${protocol}://${rootDomain}`}
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          {rootDomain}
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-8">{subdomainData.logoUrl || '⚽'}</div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-4">
            {subdomainData.name}
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            {subdomainData.description}
          </p>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Scout Hub Dashboard 🎯
            </h2>
            <p className="text-slate-300 mb-6">
              Access your scouting platform with comprehensive player management,
              trial scheduling, and analytics.
            </p>
            <Link
              href={`/login`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Access Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
