# Simtricity Documentation - Docusaurus Setup Notes

This document captures lessons learned and important configuration details for the Simtricity documentation site built with Docusaurus.

## Project Overview

- **URL**: https://docs.simtricity.io
- **Repository**: https://github.com/simtricity/simt-docs
- **Framework**: Docusaurus 3.8.1
- **Deployment**: GitHub Pages with GitHub Actions

## Key Configuration Decisions

### 1. Custom Domain Setup

```typescript
// docusaurus.config.ts
url: 'https://docs.simtricity.io',
baseUrl: '/',
```

- Use `baseUrl: '/'` for custom domains (not `/simt-docs/`)
- Add `static/CNAME` file with domain name
- Configure DNS CNAME record: `docs` → `simtricity.github.io`

### 2. Versioning Strategy

Current setup uses two versions:
- **0.0.1**: Stable/archived version (marked as unmaintained)
- **Latest**: Current development version (marked as unreleased)

```typescript
lastVersion: 'current',
versions: {
  current: {
    label: 'Latest',
    path: '/',
    banner: 'unreleased',
  },
  '0.0.1': {
    label: '0.0.1',
    path: '0.0.1',
    banner: 'unmaintained',
  },
}
```

**Key Learning**: Docusaurus always creates a "Next" version from the `docs/` folder, even with only one defined version.

### 3. Search Configuration

Local search plugin has Node.js 18 compatibility issues in CI. Solution:

```typescript
themes: [
  '@docusaurus/theme-mermaid',
  // Only load search plugin if not in CI environment
  ...(process.env.CI ? [] : [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      // ... config
    ],
  ]),
],
```

This enables search locally but disables it during GitHub Actions builds.

### 4. GitHub Actions Deployment

The `.github/workflows/deploy.yml` workflow:
- Triggers on push to main branch
- Uses Node.js 18 with npm caching
- Builds and deploys to GitHub Pages
- Requires "GitHub Actions" as source in Pages settings

### 5. Three-Product Architecture

Homepage organized around three products:
- **Flows**: Smart meter management (yellow theme)
- **Flux**: Energy trading platform (orange theme)
- **MyEnergy**: Personal energy management (black theme)

Each product has:
- Dedicated documentation section
- Custom button styling
- Heroicon SVG icons
- Placeholder pages for future content

### 6. Branding & Styling

- Hero banner with green-to-blue gradient: `#10B981` to `#3B82F6`
- Product-specific color coding for visual distinction
- Clean, professional card-based layout
- Responsive design for mobile/tablet

## File Structure

```
simt-docs/
├── docs/                    # Latest version documentation
│   ├── flows/              # Complete Flows documentation
│   ├── flux/               # Placeholder for Flux docs
│   └── myenergy/           # Placeholder for MyEnergy docs
├── versioned_docs/         # Versioned documentation snapshots
│   └── version-0.0.1/
├── src/
│   └── pages/
│       └── index.tsx       # Custom homepage
├── static/
│   └── CNAME              # Custom domain file
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions deployment
```

## Common Commands

```bash
# Local development with search
npm run start

# Build locally (with search)
npm run build

# Build for CI (without search)
CI=true npm run build

# Create new version
npm run docusaurus docs:version 1.0.0

# Deploy manually (if needed)
npm run deploy
```

## Sidebar Navigation Configuration

### Explicit Sidebar Configuration (Recommended)
The sidebar is configured explicitly in `sidebars.ts` rather than using `_category_.json` files:

```typescript
// sidebars.ts
const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Flux',
      items: [
        'flux/index',
        {
          type: 'category',
          label: 'Domain Model',
          items: [
            'flux/domain-model/index',
            'flux/domain-model/devices',
          ],
        },
        // ... more categories
      ],
    },
  ],
};
```

**Key Points:**
- Explicit configuration in `sidebars.ts` ensures consistent navigation
- Don't use `_category_.json` files when using explicit sidebars
- All documentation pages must be listed in the sidebar to appear in navigation
- Nested categories create hierarchical navigation

### Alternative: Auto-generated Sidebars with _category_.json
If not using explicit sidebars, you can use `_category_.json` files:

```json
// docs/flux/domain-model/_category_.json
{
  "label": "Domain Model",
  "position": 2
}
```

**Note**: Don't mix both approaches - use either explicit sidebars.ts OR _category_.json files, not both.

## Troubleshooting

### Issue: "Your Docusaurus site did not load properly"
- **Cause**: Wrong baseUrl configuration
- **Fix**: Use `baseUrl: '/'` for custom domains, `baseUrl: '/repo-name/'` for github.io subdomain

### Issue: Build fails in CI with search plugin error
- **Cause**: Node.js 18 compatibility issue with @easyops-cn/docusaurus-search-local
- **Fix**: Conditionally load plugin based on `process.env.CI`

### Issue: Version dropdown shows unwanted "Next" version
- **Cause**: Docusaurus always treats `docs/` folder as development version
- **Fix**: Accept this behavior or disable versioning entirely if only one version needed

### Issue: Sidebar not appearing on documentation pages
- **Cause**: Pages not included in sidebars.ts configuration
- **Fix**: Add all pages to the sidebar configuration in sidebars.ts
- **Alternative cause**: Mixing _category_.json with explicit sidebars
- **Fix**: Remove _category_.json files when using sidebars.ts

### Issue: Broken links warnings/errors
- **Cause**: Relative links resolving incorrectly, especially with versioning
- **Fix**: 
  - Use trailing slashes in links (e.g., `./domain-model/` not `./domain-model`)
  - For parent directory navigation, use `../` not `../index`
  - Links to current directory index should use `./` not `./index`
- **Configuration**: Set `onBrokenLinks: 'throw'` in docusaurus.config.ts to catch issues early
- **Debugging**: Build output shows exact resolution paths for broken links
- **Note**: Broken links in versioned docs (e.g., version-0.0.1) should be ignored as these are historical

### Issue: Links work in current docs but break in versioned docs
- **Cause**: Docusaurus strips trailing slashes during versioning
- **Fix**: Accept that versioned docs may have broken links if structure changed
- **Prevention**: Maintain consistent structure across versions

### IMPORTANT: Versioned Documentation
- **Never modify files in `versioned_docs/` directory** - these are historical snapshots
- Versioned docs are created by `npm run docusaurus docs:version X.X.X` 
- Only edit files in the main `docs/` directory
- Broken links in versioned docs may persist if the structure has changed since that version
- Set `onBrokenLinks: 'warn'` if you need to ignore versioned doc issues

## Future Enhancements

1. **Search Integration**: Consider migrating to Algolia DocSearch when available
2. **Flux Documentation**: Add comprehensive Flux platform documentation
3. **MyEnergy Documentation**: Add customer portal documentation
4. **API Playground**: Consider adding interactive API documentation
5. **Video Tutorials**: Embed video guides for complex workflows

## Deployment Checklist

When deploying updates:
1. ✅ Test build locally with `npm run build`
2. ✅ Verify links work correctly
3. ✅ Check responsive design
4. ✅ Commit and push to main branch
5. ✅ Monitor GitHub Actions for successful deployment
6. ✅ Verify changes at https://docs.simtricity.io

## Resources

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Heroicons](https://heroicons.com/) - Icon library used
- [Mermaid](https://mermaid.js.org/) - Diagram syntax for architecture diagrams