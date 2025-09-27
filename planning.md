# Draachenmar Encyclopedia - Project Planning

## Project Vision

The Draachenmar Encyclopedia is a comprehensive, fantasy-themed digital reference for a D&D campaign world, designed to organize and present rich lore including characters, locations, items, and organizations in an accessible, searchable format. The application serves as both a player resource and a living document that grows with the campaign, featuring a custom fantasy aesthetic with parchment backgrounds and medieval typography. Built as a modern single-page application, it prioritizes fast search, responsive design, and content discoverability while maintaining the immersive feel of a medieval tome.

## Current Tech Stack and Versions

### Core Framework

- **React**: 18.2.0 with TypeScript 5.0.2 (package.json:24,45)
- **Build Tool**: Vite 4.4.5 with React plugin (package.json:46, vite.config.ts:1-2)
- **Routing**: React Router DOM 6.8.0 (package.json:26)

### Styling and UI

- **CSS Framework**: Tailwind CSS 3.3.0 with PostCSS (package.json:43, postcss.config.js)
- **Icons**: Lucide React 0.263.1 (package.json:21)
- **Fonts**: Google Fonts - Cinzel (fantasy) and Crimson Text (serif) (index.html:8-10)

### Search and Data Processing

- **Search Engine**: Fuse.js 6.6.2 for fuzzy search (package.json:19)
- **File Processing**: fs-extra 11.3.2, glob 11.0.3, mammoth 1.11.0, yauzl 3.2.0 (package.json:18,20,22,27)
- **Image Optimization**: Sharp 0.34.4 (package.json:42)

### Development Tools

- **TypeScript**: Strict configuration with ES2020 target (tsconfig.json:3,14)
- **Linting**: ESLint 8.45.0 with TypeScript plugin (package.json:38,.eslintrc.cjs:4-7)
- **Script Runner**: tsx 4.20.5 for TypeScript execution (package.json:44)

## Architecture

### Component Boundaries

src/
├── components/          # Reusable UI (Layout, Header, Footer, EntryCard)
├── pages/              # Route handlers (HomePage, CategoryPage, DetailPage, SearchPage)
├── data/               # Static content files (characters.ts:965 lines, locations.ts:967 lines)
├── hooks/              # Custom React hooks (useSearch functionality)
├── types/              # TypeScript definitions (228 lines of interfaces)
├── utils/              # Utility functions (markdown, image processing)
└── contexts/           # React contexts (ThemeContext for dark mode)

### Data Flow Architecture

1. **Static Data Layer**: TypeScript files serve as content database (src/data/index.ts:105)
2. **Type System**: Comprehensive interfaces for all content types (src/types/index.ts:1-228)
3. **Search Layer**: Fuse.js indexes content for fuzzy search (inferred from package.json:19)
4. **Presentation Layer**: React components consume typed data with routing (src/App.tsx:1-46)

### External Services

- **No External APIs**: Fully self-contained application
- **GitHub Pages Deployment**: Base path `/Draachenmar/` configured (vite.config.ts:6)
- **Google Fonts CDN**: External font loading (index.html:8-10)

### Image Management System

- **Public Assets**: Organized by category in `public/images/` (per MISSING_IMAGES_REPORT.md:152-154)
- **Registry System**: 189KB JSON registry tracking all images (per ls output)
- **Optimization Pipeline**: WebP conversion tools (tools/optimize-images.js, tools/README.md:7-29)

## Decisions and Rationale

### Technology Choices

**React + TypeScript + Vite**: Modern development stack prioritizing type safety and fast builds. Choice supports rapid iteration and maintainable code for a content-heavy application (package.json, tsconfig.json).

**Tailwind CSS**: Utility-first approach enables custom fantasy theming without CSS bloat. Extended color palette (primary purple, amber) and custom fonts create immersive medieval aesthetic (tailwind.config.js:7-36).

**Fuse.js for Search**: Client-side fuzzy search eliminates backend complexity while providing sophisticated search across all content types. Appropriate for static content that doesn't change frequently (package.json:19).

**Static Data Files**: TypeScript files as data source rather than CMS or database. Enables version control of content, type safety, and eliminates infrastructure complexity. Suitable for campaign content that's curated rather than user-generated (src/data/ structure).

### Content Migration Strategy

**Word Document Processing**: Scripts suggest content originated from Word documents, requiring extraction and structuring (scripts/extractContent.ts:6054 lines). This implies content creators preferred familiar document editing over direct code editing.

**Image Optimization**: Comprehensive WebP conversion pipeline indicates performance optimization priority, reducing load times for image-heavy fantasy content (tools/README.md, MISSING_IMAGES_REPORT.md).

### Architecture Decisions

**Client-Side Only**: No backend services reduces hosting complexity and costs. Appropriate for read-only encyclopedia with infrequent updates (no server-side code found).

**Category-Based Organization**: URL structure `/category/item` with legacy redirects indicates evolved information architecture (src/App.tsx:31-39). Original `/characters` → `/people` suggests user feedback influenced naming.

## Assumptions Made

1. **Campaign Context**: This is a private D&D campaign tool, not a commercial product (README.md:244-246 mentions personal campaign use)
2. **Content Ownership**: Multiple contributors create content, requiring attribution tracking (ContentSource interface in src/types/index.ts:153-160)
3. **Image Creation Workflow**: 56+ missing character images suggests ongoing content creation outpaces image generation (MISSING_IMAGES_REPORT.md:18)
4. **Performance Priority**: WebP optimization and client-side architecture indicate fast loading is valued over dynamic features

## Open Questions and Risks

### Technical Risks

**Scale Limitations**: Static data files approaching 1000+ lines each (characters.ts:965, locations.ts:967). Risk of performance degradation and merge conflicts as content grows.

- *Next Step*: Evaluate chunking strategies or migration to structured data format

**Image Asset Management**: 56+ missing character portraits create incomplete user experience (MISSING_IMAGES_REPORT.md:18-90).

- *Next Step*: Prioritize image creation pipeline or placeholder system

**Build Size**: No bundle analysis detected. Large image assets and content may impact load times.

- *Next Step*: Implement bundle size monitoring and code splitting

### Product Questions

**Content Contribution Workflow**: No clear process for non-technical users to add content beyond Word document extraction.

- *Next Step*: Define content submission and review process

**Version Control**: No branching strategy evident for content updates from multiple contributors.

- *Next Step*: Establish content governance and contribution guidelines

**Feature Scope**: Phase 2/3 roadmap items (interactive map, user accounts) lack technical specifications (README.md:218-232).

- *Next Step*: Technical feasibility analysis for planned features

### Infrastructure Considerations

**Hosting Strategy**: GitHub Pages deployment with static assets may have bandwidth limitations for image-heavy content.

- *Next Step*: Monitor usage and evaluate CDN requirements

**Backup and Recovery**: No backup strategy evident for content and images stored in repository.

- *Next Step*: CRITICAL - Initialize git repository first, then establish backup procedures

### Immediate Priority Actions

1. **Initialize Version Control**: Set up git repository as critical foundation for collaboration
2. **Complete Image Asset Audit**: Address 56+ missing character portraits systematically
3. **Performance Baseline**: Establish current load time and bundle size metrics
4. **Content Contribution Process**: Document workflow for adding new campaign content
5. **Technical Debt Assessment**: Evaluate Phase 2 feature feasibility against current architecture
