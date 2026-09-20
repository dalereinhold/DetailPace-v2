# Agent Instructions for DetailPace v2

This document provides guidance for AI agents working on the DetailPace v2 codebase.

## Project Context

**DetailPace v2** is a modern React + TypeScript UI showcase application built with:
- React 19 with TypeScript
- Vite as build tool
- Tailwind CSS v4 with CSS variables
- shadcn/ui component library built on Radix primitives
- Lucide React for icons

The application demonstrates a fully configured, production-ready component system with examples of dark mode theming, interactive state management, and responsive design patterns.

## Code Quality Standards

### Style & Conventions

- **Language**: TypeScript with strict mode enabled
- **Framework**: React with functional components and hooks
- **Styling**: Tailwind CSS utility classes exclusively
- **Icons**: Lucide React SVG icons only
- **Code Format**: Follow conventions enforced by Biome (currently disabled)
- **Naming**: camelCase for variables/functions, PascalCase for components/classes

### TypeScript Best Practices

- All React components should explicitly type props with interfaces
- Use `React.FC` or function signature for component typing
- Leverage path aliases: `@/components`, `@/lib`, etc.
- Avoid `any` type; use `unknown` when type is truly dynamic
- Ensure all imports are explicit (no implicit default exports)

### React Patterns

- Use functional components with hooks exclusively (no class components)
- Prefer `React.useState` for component state
- Use `React.useCallback` for memoized event handlers in performance-critical scenarios
- Keep components focused and composable
- Extract complex JSX into smaller sub-components
- Use TypeScript for prop interfaces instead of PropTypes

### Styling Conventions

- Use Tailwind utility classes for all styling
- Apply responsive prefixes for mobile-first design: `sm:`, `md:`, `lg:`, etc.
- Use CSS variables via Tailwind for theme consistency (primary, secondary, muted, etc.)
- Apply `@` aliases in className for consistency
- Never use inline style objects unless absolutely necessary
- Group related classes logically in className attributes

### File Organization

```
src/
├── components/
│   ├── ui/                    # shadcn/ui installed components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   └── theme-provider.tsx    # App-wide theme context
├── lib/
│   └── utils.ts              # Shared utilities (cn helper, etc.)
├── assets/                   # Images, fonts, static files
├── App.tsx                   # Main application component
├── main.tsx                  # React entry point
└── index.css                 # Global Tailwind directives
```

### Component Development Guidelines

1. **Create new UI component in `src/components/ui/`**
   - Use shadcn/ui as reference for component structure
   - Implement Radix UI primitives for accessibility
   - Export with `export function ComponentName() { ... }`

2. **Add feature components in `src/components/`**
   - Keep components focused and single-responsibility
   - Use composition over complex conditional logic
   - Export default or named exports consistently

3. **Add utilities in `src/lib/`**
   - Use for reusable functions (not React-specific)
   - Keep pure functions that don't depend on React hooks
   - Document complex utility functions

### Accessibility Standards

- All interactive elements must be keyboard accessible
- Use semantic HTML: `<button>`, `<nav>`, `<main>`, etc.
- Leverage Radix UI primitives for built-in ARIA support
- Test with keyboard navigation (Tab, Enter, Escape)
- Include descriptive `aria-label` attributes where needed
- Ensure color contrast meets WCAG AA standards

## Development Workflow

### Before Making Changes

1. Understand the current component structure by exploring `src/components/ui/`
2. Review existing component patterns in `App.tsx`
3. Check TypeScript types for any related props or state
4. Verify Tailwind class naming conventions

### Making Code Changes

1. **Type-safe modifications**: Always add TypeScript interfaces for new props
2. **Responsive design**: Use mobile-first Tailwind breakpoints
3. **Theme consistency**: Reference existing color and spacing variables
4. **Performance**: Avoid unnecessary re-renders with proper hook dependencies
5. **Testing**: Manually verify changes in dev server before building

### Common Tasks

#### Adding a New Component

1. Check if component exists at `shadcn@latest add <component-name>`
2. If creating custom component, place in `src/components/ui/`
3. Follow existing Button/Card pattern for structure
4. Export with clear prop interface
5. Document with inline comments for non-obvious patterns

#### Modifying Existing Components

- Preserve component's public API (props interface)
- Update related examples in `App.tsx` if needed
- Ensure dark mode support through CSS variables
- Test interactive states (hover, active, disabled, etc.)

#### Styling Adjustments

- Modify Tailwind classes in component files
- Use CSS variables from `index.css` for colors
- Keep responsive classes consistent with existing patterns
- Test in both light and dark modes

#### Adding New Page/Section

1. Create new component file
2. Add to navigation/tabs in `App.tsx`
3. Import icons from Lucide React
4. Use Card, Button, Badge components for consistency
5. Apply existing color and spacing scheme

## Configuration Management

### Vite Configuration (`vite.config.ts`)

- Path alias `@/` maps to `src/` directory
- React plugin enabled for JSX transformation
- Tailwind CSS v4 plugin for CSS processing

### TypeScript Configuration (`tsconfig.json`)

- Path mapping: `@/*` → `./src/*`
- Target ES2020 with module ESNext
- Strict mode enabled for type safety

### Tailwind Configuration (`components.json`)

- Style: `radix-sera` - Radix primitives with refined styling
- Color base: `mist` - Neutral/teal color scheme
- CSS variables enabled for theme support
- Icon library: Lucide React

### Biome Configuration (`biome.json`)

Biome is **enabled** for code quality checks. The linter and formatter are active and enforced:
- Run `pnpm lint` to check for code issues
- Run `pnpm format` to auto-fix formatting
- All code must pass linting before committing

## Testing & Validation

### Manual Testing

1. **Visual Testing**: `pnpm dev` and browse application
2. **Responsive Design**: Test at different viewport sizes (mobile, tablet, desktop)
3. **Theme Switching**: Toggle dark mode and verify all colors update
4. **Interactions**: Click all buttons, inputs, and interactive elements
5. **Keyboard Navigation**: Tab through all interactive elements

### Type Checking

```bash
pnpm typecheck
```

Verify no TypeScript compilation errors before committing.

### Building

```bash
pnpm build
```

Ensures production bundle is valid and optimized.

## Performance Considerations

- Keep components lean and focused
- Use React.memo for expensive child components
- Avoid inline function definitions in event handlers
- Leverage Tailwind's tree-shaking for CSS optimization
- Use dynamic imports for large feature sections

## Common Pitfalls to Avoid

1. **Don't modify shadcn/ui components directly** - Create custom wrappers instead
2. **Don't mix Tailwind with inline styles** - Use utility classes exclusively
3. **Don't forget TypeScript types** - Always type props and returns
4. **Don't hardcode colors** - Use CSS variables from theme
5. **Don't create deeply nested components** - Extract to separate files
6. **Don't ignore dark mode** - Test theme switching for all new components
7. **Don't use `className` string concatenation** - Use `cn()` utility for conditionals
8. **Don't use array indices as React keys** - Always use stable, unique identifiers
9. **Don't use `parseInt()` without radix** - Always specify radix parameter for parseInt
10. **Don't leave SVG elements without titles** - Add `<title>` for accessibility

## Linting & Code Quality

The project enforces strict code quality standards through Biome:

### Active Linting Rules

- **TypeScript Strict Mode** - No implicit any, proper typing required
- **React Best Practices** - Correct hook usage, key handling, prop typing
- **Accessibility (a11y)** - WCAG standards for SVG, semantic HTML
- **Security** - XSS prevention, dangerous operations flagged with documentation
- **Performance** - Proper hook dependencies, memoization where needed

### When You Make Changes

1. Always run `pnpm lint` before committing
2. Use `pnpm format` to fix formatting issues
3. Add biome-ignore comments only when necessary, with clear explanation
4. Example suppression:
   ```tsx
   // biome-ignore lint/security/noDangerouslySetInnerHtml: CSS is generated from internal config, not user input
   <style dangerouslySetInnerHTML={{ __html: cssString }} />
   ```

## Git Commit Guidelines

- Write clear, concise commit messages describing the change
- Use imperative mood: "Add button component" not "Added button"
- Reference related issues if applicable
- Keep commits focused on single feature or fix
- Squash related commits before pushing to main

Example:
```
Add dark mode toggle to navigation header

- Implement theme provider with light/dark mode
- Add moon/sun icon toggle button
- Apply CSS variable overrides for dark theme
```

## Resources & References

- **shadcn/ui**: https://ui.shadcn.com
- **Radix UI**: https://www.radix-ui.com
- **Tailwind CSS v4**: https://tailwindcss.com
- **React Docs**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Lucide Icons**: https://lucide.dev
- **Vite Guide**: https://vite.dev

## Architecture Decisions

### Why Tailwind CSS?

- Utility-first approach enables rapid UI development
- CSS variables support allows dynamic theming
- Tree-shaking removes unused styles automatically
- v4 brings better performance and smaller bundle sizes

### Why Radix UI?

- Provides accessible, unstyled primitives
- No opinionated styling - full control via Tailwind
- Excellent keyboard navigation and ARIA support
- Headless approach allows maximum flexibility

### Why shadcn/ui?

- Built on Radix primitives with Tailwind styling
- Copy-paste component pattern allows customization
- Components are yours to modify and extend
- Active community with rich component ecosystem

## Debugging Tips

1. **Dev Tools**: Use React DevTools browser extension
2. **Console Logging**: Add `console.log()` for state tracking
3. **Network Tab**: Check for failed asset loads
4. **Source Maps**: TypeScript source maps included in dev build
5. **Vite HMR**: Check browser console for HMR connection issues

## Future Enhancements

Possible next steps for the project:

1. Add more shadcn/ui components (Table, Dialog, Sheet, etc.)
2. Implement component documentation site
3. Add unit tests with Vitest
4. Set up E2E testing with Playwright or Cypress
5. Create design tokens documentation
6. Build storybook for component isolation and testing
7. Add form handling with react-hook-form
8. Implement state management if needed (Zustand, Jotai)
