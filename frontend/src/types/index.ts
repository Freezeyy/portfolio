export interface StrapiMedia {
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
}

export interface Profile {
  documentId: string;
  name: string;
  headline: string;
  bio: string;
  aboutTitle?: string | null;
  location?: string | null;
  email?: string | null;
  avatar?: StrapiMedia | null;
  resume?: StrapiMedia | null;
  github?: string | null;
  linkedin?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  availableForWork?: boolean | null;
}

export interface Skill {
  documentId: string;
  name: string;
  category: 'language' | 'frontend' | 'backend' | 'database' | 'devops';
  proficiency: number;
  order: number;
}

export interface Project {
  documentId: string;
  title: string;
  slug: string;
  description: string;
  content?: string | null;
  image?: StrapiMedia | null;
  technologies?: string[] | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  featured?: boolean | null;
  order: number;
}

export interface Experience {
  documentId: string;
  company: string;
  role: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  logo?: StrapiMedia | null;
  order: number;
}

export interface Education {
  documentId: string;
  institution: string;
  degree: string;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
  order: number;
}

export interface PortfolioData {
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
}
