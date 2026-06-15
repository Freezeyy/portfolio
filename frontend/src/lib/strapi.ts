import type {
  Education,
  Experience,
  PortfolioData,
  Profile,
  Project,
  Skill,
  StrapiMedia,
} from '@/types';

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

type StrapiListResponse<T> = {
  data: T[];
};

type StrapiSingleResponse<T> = {
  data: T | null;
};

async function fetchStrapi<T>(path: string): Promise<T> {
  const response = await fetch(`${STRAPI_URL}/api${path}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Strapi request failed: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
}

export function getMediaUrl(media?: StrapiMedia | null): string | null {
  if (!media?.url) return null;
  if (media.url.startsWith('http')) return media.url;
  return `${STRAPI_URL}${media.url}`;
}

export async function getPortfolioData(): Promise<PortfolioData> {
  try {
    const [profileRes, skillsRes, projectsRes, experiencesRes, educationsRes] =
      await Promise.all([
        fetchStrapi<StrapiSingleResponse<Profile>>(
          '/profile?populate=avatar&populate=resume'
        ),
        fetchStrapi<StrapiListResponse<Skill>>(
          '/skills?sort=order:asc&pagination[pageSize]=100'
        ),
        fetchStrapi<StrapiListResponse<Project>>(
          '/projects?sort=order:asc&populate=image&pagination[pageSize]=100'
        ),
        fetchStrapi<StrapiListResponse<Experience>>(
          '/experiences?sort=order:asc&populate=logo&pagination[pageSize]=100'
        ),
        fetchStrapi<StrapiListResponse<Education>>(
          '/educations?sort=order:asc&pagination[pageSize]=100'
        ),
      ]);

    return {
      profile: profileRes.data,
      skills: skillsRes.data ?? [],
      projects: projectsRes.data ?? [],
      experiences: experiencesRes.data ?? [],
      educations: educationsRes.data ?? [],
    };
  } catch {
    return {
      profile: null,
      skills: [],
      projects: [],
      experiences: [],
      educations: [],
    };
  }
}
