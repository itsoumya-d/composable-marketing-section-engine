# Composable Marketing Section Engine

A high-performance composable marketing section schema engine designed for enterprise marketing platforms (Astro / headless CMS).

## Problem
Modern marketing websites must allow content editors and AI coding agents to dynamically compose complex landing pages without violating WCAG 2.2 accessibility standards, breaking visual design hierarchies, or causing SEO traffic regressions through missing JSON-LD structured data or broken hreflang tags.

## Core Capabilities
- **Correct-by-Construction Content Schemas**: Strongly-typed validation for Hero, FeatureBento, VideoShowcase, TestimonialGrid, and PricingSection.
- **Automated JSON-LD Structured Data**: Compiles Schema.org `SoftwareApplication`, `VideoObject`, and `FAQPage` metadata.
- **Multi-Locale Translation & Hreflang Mapping**: Generates bi-directional hreflang alternate headers across supported locales.
- **Programmatic WCAG 2.2 AA Linter**: Enforces heading hierarchies (single H1, monotonic heading levels), image alt text, and semantic ARIA labeling.

## Running Tests
```bash
npm install
npm test
```
