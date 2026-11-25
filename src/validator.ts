import { PageManifest, SectionContent } from './types.js';

export interface ValidationReport {
  valid: boolean;
  errors: string[];
}

export function validatePageAccessibility(page: PageManifest): ValidationReport {
  const errors: string[] = [];

  if (!page.sections || page.sections.length === 0) {
    errors.push('Page must contain at least one content section');
    return { valid: false, errors };
  }

  // 1. Exactly one H1 per page
  const h1Sections = page.sections.filter(s => s.headingLevel === 1);
  if (h1Sections.length === 0) {
    errors.push('WCAG 2.2 Violation: Page must have exactly one H1 heading');
  } else if (h1Sections.length > 1) {
    errors.push(`WCAG 2.2 Violation: Found ${h1Sections.length} H1 headings; only one is permitted`);
  }

  // 2. Heading hierarchy monotonicity (cannot skip levels like h1 -> h3)
  let lastHeadingLevel = 0;
  for (let i = 0; i < page.sections.length; i++) {
    const s = page.sections[i];
    if (i > 0 && s.headingLevel > lastHeadingLevel + 1) {
      errors.push(
        `WCAG 2.2 Violation: Section '${s.id}' skips heading levels (H${lastHeadingLevel} to H${s.headingLevel})`
      );
    }
    lastHeadingLevel = s.headingLevel;

    // 3. CTA Accessibility: descriptive text or aria-label
    if (s.cta) {
      const label = (s.cta.label || '').trim().toLowerCase();
      const aria = (s.cta.ariaLabel || '').trim();
      if (!label && !aria) {
        errors.push(`WCAG 2.2 Violation: CTA in section '${s.id}' lacks accessible label`);
      } else if (['click here', 'learn more', 'read more', 'go'].includes(label) && !aria) {
        errors.push(
          `WCAG 2.2 Warning/Violation: Ambiguous CTA label '${s.cta.label}' in section '${s.id}' requires descriptive ariaLabel`
        );
      }
    }

    // 4. Video Showcase requires complete metadata for SEO & accessibility
    if (s.type === 'video_showcase') {
      if (!s.videoMetadata) {
        errors.push(`Section '${s.id}' of type video_showcase is missing videoMetadata`);
      } else {
        const v = s.videoMetadata;
        if (!v.title || !v.description || !v.thumbnailUrl || !v.contentUrl) {
          errors.push(`Video metadata in section '${s.id}' is missing required fields for Schema.org VideoObject`);
        }
      }
    }

    // 5. FAQ section validation
    if (s.type === 'faq') {
      if (!s.faqItems || s.faqItems.length === 0) {
        errors.push(`FAQ section '${s.id}' must have at least one question & answer pair`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
