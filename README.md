# DetailPace v2

A modern React + TypeScript web application showcasing a UI component library built with shadcn/ui, Radix primitives, and Tailwind CSS v4.

## Overview

DetailPace v2 is a responsive web application that demonstrates a fully configured component system using:

- **React 19** - Latest React framework for building interactive UIs
- **TypeScript** - Type-safe development experience
- **Tailwind CSS v4** - Utility-first CSS framework with CSS variables support
- **shadcn/ui** - High-quality, accessible React components built on Radix UI
- **Radix UI** - Headless primitive components for building accessible UIs
- **Lucide React** - Beautiful, consistent SVG icon library
- **Vite** - Lightning-fast build tool and dev server

## Features

- **Dark Mode Toggle** - Switch between light and dark themes with CSS variable support
- **Interactive Components** - Fully functional component showcase with state management
- **Responsive Design** - Mobile-first approach with breakpoint-aware layouts
- **Tabbed Navigation** - Multi-section content organization (Overview, Buttons, Components)
- **Component Library** - Pre-configured UI primitives ready for expansion
- **Accessibility** - Built-in WCAG compliance through Radix UI primitives

## Project Structure

```
detailpace-v2/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui component library
│   │   └── theme-provider.tsx  # Theme context provider
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn helper)
│   ├── assets/                 # Static assets
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles with Tailwind directives
├── public/                     # Static files
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── components.json             # shadcn/ui configuration
├── biome.json                  # Code quality configuration
├── package.json                # Project dependencies
└── pnpm-lock.yaml              # Dependency lock file
```

## Installation

### Prerequisites

- **Node.js** 18+ or 20+
- **pnpm** (recommended) or npm/yarn

### Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Start development server**

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:5173`

3. **Build for production**

   ```bash
   pnpm build
   ```

4. **Preview production build**

   ```bash
   pnpm preview
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite development server with hot module replacement |
| `pnpm build` | Compile TypeScript and build optimized production bundle |
| `pnpm lint` | Run Biome linter to check code quality |
| `pnpm format` | Format all TypeScript/TSX files with Biome |
| `pnpm typecheck` | Run TypeScript type checking without emitting files |
| `pnpm preview` | Serve the production build locally for testing |

## Component Library

The project comes with essential UI components installed and ready to use:

- **Avatar** - User profile images with fallback support
- **Badge** - Label component for categorizing or highlighting content
- **Button** - Versatile button with multiple variants and sizes
- **Card** - Container component with header, content, footer, and action sections
- **Chart** - Data visualization with Recharts integration
- **Field** - Form field wrapper with label and error support
- **Label** - Form label for accessibility
- **Menubar** - Top-level navigation menu component
- **Separator** - Visual divider for content sections
- **Sheet** - Slide-out panel component (drawer/sidebar)
- **Switch** - Toggle switch control
- **Table** - Data table component for displaying structured data

### Adding More Components

Expand your UI library with additional shadcn/ui components:

```bash
# Add common form controls
pnpm dlx shadcn@latest add input select checkbox switch

# Add overlay components
pnpm dlx shadcn@latest add dialog dropdown-menu sheet modal

# Add data display components
pnpm dlx shadcn@latest add table tabs tooltip

# Add feedback components
pnpm dlx shadcn@latest add alert-dialog progress skeleton sonner
```

Full component catalog available at [shadcn/ui](https://ui.shadcn.com)

## Configuration

### Tailwind CSS v4

Configured with CSS variables for dynamic theming support. Base color scheme is **mist** (neutral/teal).

Key files:
- `src/index.css` - Global styles and Tailwind directives
- `components.json` - Tailwind configuration paths and color scheme

### Radix UI Integration

The **radix-sera** preset provides refined component styling with proper spacing and visual hierarchy.

### TypeScript

Strict type checking enabled with path aliases:
- `@/*` resolves to `src/*`
- `@/components` resolves to component library
- `@/lib` resolves to utilities

### Code Quality

Biome is configured and **enabled** for linting and formatting. The project maintains strict code quality standards:

- **Linting**: Run `pnpm lint` to check for code issues
- **Formatting**: Run `pnpm format` to auto-fix code style
- **Type Checking**: Run `pnpm typecheck` for TypeScript validation

All code passes linting checks with zero errors, following best practices for:
- TypeScript strict mode compliance
- React hooks and component patterns
- Accessibility standards (WCAG AA)
- Security practices (XSS prevention, input validation)

## Theme System

The app implements a theme provider that supports:

- **Light Mode** - Default theme with neutral background
- **Dark Mode** - High-contrast dark theme with CSS variable overrides

Toggle theme using the moon/sun button in the header. Theme preference persists across page reloads.

## Quality & Maintenance

### Code Quality Status

✅ **All code passes strict linting checks**

The project maintains high code quality through:
- **TypeScript Strict Mode** - Full type safety with no `any` types
- **Biome Linter & Formatter** - Automated code quality enforcement
- **Security Reviews** - Prevention of XSS, unsafe operations (e.g., `dangerouslySetInnerHTML` is properly documented)
- **Accessibility Compliance** - WCAG AA standards via Radix UI primitives
- **React Best Practices** - Functional components, proper hook usage, optimal key handling

### Recent Improvements (Latest)

- Fixed chart component imports and Tailwind CSS syntax
- Added SVG accessibility titles to favicon
- Improved parseInt() usage with radix parameter
- Optimized React list keys for better reconciliation
- Added biome-ignore suppressions with proper documentation

### Quality Checks

Run these commands to maintain code quality:

```bash
pnpm lint       # Check for code issues
pnpm format     # Auto-fix formatting
pnpm typecheck  # Verify TypeScript types
pnpm build      # Test production build
```


## Development Workflow

### Hot Module Replacement (HMR)

Vite provides instant feedback during development. Changes to React components automatically reflect in the browser without full page reload.

### Type Safety

Always run type checking before building:

```bash
pnpm typecheck
```

### Component Development

1. Create new component in `src/components/`
2. Use TypeScript for type definitions
3. Style with Tailwind classes
4. Import and use in `App.tsx`
5. Test in dev server before building

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES2020+ JavaScript support
- No IE11 support

## Performance

- **Bundle Size**: Optimized with tree-shaking and code splitting
- **Lazy Loading**: Dynamic imports supported via Vite
- **CSS-in-JS**: Tailwind CSS produces minimal CSS output
- **Icon Library**: Lucide React provides optimized SVG icons

## Troubleshooting

### Port Already in Use

If port 5173 is in use, Vite will automatically use the next available port.

### Module Resolution Errors

Ensure `@/*` alias is configured in:
- `tsconfig.json` - For TypeScript
- `vite.config.ts` - For Vite bundler

### Style Not Applied

1. Verify Tailwind class names are correct
2. Check that `src/index.css` is imported in `main.tsx`
3. Ensure no CSS conflicts from global styles

### Dark Mode Not Working

1. Verify `theme-provider.tsx` is wrapping the app
2. Check that dark class is applied to `documentElement`
3. Ensure Tailwind has dark mode enabled in `components.json`

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Lucide React Icons](https://lucide.dev)
- [Vite Documentation](https://vite.dev)

## License

MIT
