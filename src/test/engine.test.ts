import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PageManifest } from '../types.js';
import { validatePageAccessibility } from '../validator.js';
import { generateHreflangTags, generateJsonLd } from '../seo.js';

describe('Composable Marketing Section Engine Tests', () => {
  const validPage: PageManifest = {
    slug: 'ai-video-generator',
    locale: 'en',
    title: 'AI Video Platform | Enterprise Video Creation',
    description: 'Create high-converting AI videos in minutes without studio equipment.',
    availableLocales: ['en', 'de', 'fr', 'es', 'it', 'pt', 'ja', 'ko', 'zh'],
    sections: [
      {
        id: 'sec-hero',
        type: 'hero',
        heading: 'Create Studio-Quality AI Videos at Scale',
        headingLevel: 1,
        subheading: 'Turn scripts into realistic video content across 140+ languages.',
        cta: {
          label: 'Create Free Video',
          url: '/signup',
          variant: 'primary',
          ariaLabel: 'Create your first free AI video on Synthesia',
        },
      },
      {
        id: 'sec-video',
        type: 'video_showcase',
        heading: 'See It In Action',
        headingLevel: 2,
        videoMetadata: {
          title: 'Product Overview Demo',
          description: 'Interactive walkthrough of enterprise avatar creation',
          duration: 'PT2M30S',
          uploadDate: '2026-11-01',
          thumbnailUrl: 'https://synthesia.io/assets/poster.jpg',
          contentUrl: 'https://synthesia.io/assets/demo.mp4',
        },
      },
      {
        id: 'sec-faq',
        type: 'faq',
        heading: 'Frequently Asked Questions',
        headingLevel: 2,
        faqItems: [
          {
            question: 'How realistic are AI avatars?',
            answer: 'Avatars are rendered using neural video synthesis with micro-facial lip-sync.',
          },
        ],
      },
    ],
  };

  it('passes WCAG 2.2 accessibility validation for a well-structured page', () => {
    const report = validatePageAccessibility(validPage);
    assert.equal(report.valid, true);
    assert.equal(report.errors.length, 0);
  });

  it('rejects pages that skip heading levels (e.g. H1 to H3)', () => {
    const invalidPage: PageManifest = {
      ...validPage,
      sections: [
        {
          id: 'sec-hero',
          type: 'hero',
          heading: 'Hero Title',
          headingLevel: 1,
        },
        {
          id: 'sec-skipped',
          type: 'feature_bento',
          heading: 'Skipped Feature Heading',
          headingLevel: 3, // Skips H2!
        },
      ],
    };

    const report = validatePageAccessibility(invalidPage);
    assert.equal(report.valid, false);
    assert.match(report.errors[0], /skips heading levels/);
  });

  it('rejects pages with multiple H1 headings', () => {
    const invalidPage: PageManifest = {
      ...validPage,
      sections: [
        {
          id: 'sec-1',
          type: 'hero',
          heading: 'First Main Heading',
          headingLevel: 1,
        },
        {
          id: 'sec-2',
          type: 'hero',
          heading: 'Second Main Heading',
          headingLevel: 1,
        },
      ],
    };

    const report = validatePageAccessibility(invalidPage);
    assert.equal(report.valid, false);
    assert.match(report.errors[0], /Found 2 H1 headings/);
  });

  it('flags ambiguous CTA buttons that lack descriptive aria-labels', () => {
    const invalidPage: PageManifest = {
      ...validPage,
      sections: [
        {
          id: 'sec-hero',
          type: 'hero',
          heading: 'Hero Heading',
          headingLevel: 1,
          cta: {
            label: 'Learn More', // Vague label without ariaLabel
            url: '/more',
            variant: 'primary',
          },
        },
      ],
    };

    const report = validatePageAccessibility(invalidPage);
    assert.equal(report.valid, false);
    assert.match(report.errors[0], /Ambiguous CTA label/);
  });

  it('generates bidirectional hreflang alternate links across all 9 locales + x-default', () => {
    const tags = generateHreflangTags(validPage, 'https://synthesia.io');
    // 9 locales + 1 x-default = 10 tags
    assert.equal(tags.length, 10);

    const xDefault = tags.find(t => t.hreflang === 'x-default');
    assert.ok(xDefault);
    assert.equal(xDefault.href, 'https://synthesia.io/ai-video-generator');

    const deTag = tags.find(t => t.hreflang === 'de');
    assert.ok(deTag);
    assert.equal(deTag.href, 'https://synthesia.io/de/ai-video-generator');
  });

  it('compiles Schema.org JSON-LD structured data for WebPage, VideoObject, and FAQPage', () => {
    const schemas = generateJsonLd(validPage, 'https://synthesia.io');
    assert.equal(schemas.length, 3);

    const types = schemas.map(s => (s as { '@type': string })['@type']);
    assert.deepEqual(types, ['WebPage', 'VideoObject', 'FAQPage']);

    const videoSchema = schemas.find(s => (s as { '@type': string })['@type'] === 'VideoObject') as {
      name: string;
      thumbnailUrl: string;
    };
    assert.equal(videoSchema.name, 'Product Overview Demo');
    assert.equal(videoSchema.thumbnailUrl, 'https://synthesia.io/assets/poster.jpg');
  });
});
