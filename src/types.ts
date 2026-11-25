export type Locale = 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'ja' | 'ko' | 'zh';

export type SectionType = 'hero' | 'video_showcase' | 'feature_bento' | 'pricing' | 'faq';

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface CtaButton {
  label: string;
  url: string;
  variant: 'primary' | 'secondary';
  ariaLabel?: string;
}

export interface VideoMetadata {
  title: string;
  description: string;
  duration: string;
  uploadDate: string;
  thumbnailUrl: string;
  contentUrl: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SectionContent {
  id: string;
  type: SectionType;
  heading: string;
  headingLevel: HeadingLevel;
  subheading?: string;
  cta?: CtaButton;
  videoMetadata?: VideoMetadata;
  faqItems?: FaqItem[];
}

export interface PageManifest {
  slug: string;
  locale: Locale;
  title: string;
  description: string;
  sections: SectionContent[];
  availableLocales: Locale[];
}
