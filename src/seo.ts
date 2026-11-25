import { PageManifest } from './types.js';

export interface HreflangTag {
  rel: 'alternate';
  hreflang: string;
  href: string;
}

export function generateHreflangTags(page: PageManifest, baseUrl: string): HreflangTag[] {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanSlug = page.slug.replace(/^\/+/, '');
  const tags: HreflangTag[] = [];

  for (const loc of page.availableLocales) {
    const url = loc === 'en' ? `${cleanBase}/${cleanSlug}` : `${cleanBase}/${loc}/${cleanSlug}`;
    tags.push({
      rel: 'alternate',
      hreflang: loc,
      href: url,
    });
  }

  // Add x-default fallback pointing to default 'en'
  tags.push({
    rel: 'alternate',
    hreflang: 'x-default',
    href: `${cleanBase}/${cleanSlug}`,
  });

  return tags;
}

export function generateJsonLd(page: PageManifest, baseUrl: string): object[] {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanSlug = page.slug.replace(/^\/+/, '');
  const pageUrl = page.locale === 'en' ? `${cleanBase}/${cleanSlug}` : `${cleanBase}/${page.locale}/${cleanSlug}`;

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      url: pageUrl,
      name: page.title,
      description: page.description,
      inLanguage: page.locale,
    },
  ];

  for (const s of page.sections) {
    if (s.type === 'video_showcase' && s.videoMetadata) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: s.videoMetadata.title,
        description: s.videoMetadata.description,
        thumbnailUrl: s.videoMetadata.thumbnailUrl,
        contentUrl: s.videoMetadata.contentUrl,
        uploadDate: s.videoMetadata.uploadDate,
        duration: s.videoMetadata.duration,
      });
    }

    if (s.type === 'faq' && s.faqItems && s.faqItems.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: s.faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }
  }

  return schemas;
}
