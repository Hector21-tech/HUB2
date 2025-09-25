import { getTenantBySlug, getAllTenants } from '@/src/lib/tenant';

export function isValidIcon(str: string) {
  if (str.length > 10) {
    return false;
  }

  try {
    // Primary validation: Check if the string contains at least one emoji character
    // This regex pattern matches most emoji Unicode ranges
    const emojiPattern = /[\p{Emoji}]/u;
    if (emojiPattern.test(str)) {
      return true;
    }
  } catch (error) {
    // If the regex fails (e.g., in environments that don't support Unicode property escapes),
    // fall back to a simpler validation
    console.warn(
      'Emoji regex validation failed, using fallback validation',
      error
    );
  }

  // Fallback validation: Check if the string is within a reasonable length
  // This is less secure but better than no validation
  return str.length >= 1 && str.length <= 10;
}

type SubdomainData = {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  createdAt: string;
};

export async function getSubdomainData(subdomain: string): Promise<SubdomainData | null> {
  const tenant = await getTenantBySlug(subdomain);

  if (!tenant) {
    return null;
  }

  return {
    id: tenant.id,
    name: tenant.name,
    description: tenant.description,
    logoUrl: tenant.logoUrl,
    createdAt: tenant.createdAt
  };
}

export async function getAllSubdomains() {
  const tenants = await getAllTenants();

  return tenants.map(tenant => ({
    subdomain: tenant.slug,
    name: tenant.name,
    description: tenant.description,
    logoUrl: tenant.logoUrl || '🏢',
    createdAt: tenant.createdAt
  }));
}
