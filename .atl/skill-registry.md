# Skill Registry — bamzuk-mascotas

## Project Skills

| Skill | Triggers | Source |
|-------|----------|--------|
| `dropea-graphql` | Interacción con API de Dropea | AGENTS.md |
| `nextjs-appRouter` | Páginas o componentes Next.js | AGENTS.md |
| `ecommerce-patterns` | Carrito, catálogo, checkout | AGENTS.md |
| `es-pt-market` | i18n, páginas legales, checkout | AGENTS.md |

## User Skills (installed)

| Skill | Triggers | Path |
|-------|----------|------|
| `branch-pr` | Pull requests, PR creation | ~/.claude/skills/branch-pr |
| `issue-creation` | GitHub issues | ~/.config/opencode/skills/issue-creation |
| `judgment-day` | "judgment day", adversarial review | ~/.claude/skills/judgment-day |
| `skill-creator` | New AI skills | ~/.claude/skills/skill-creator |
| `skill-registry` | "update skills", registry | ~/.config/opencode/skills/skill-registry |
| `sdd-init` | SDD initialization | ~/.config/opencode/skills/sdd-init |
| `sdd-design` | Technical design | ~/.config/opencode/skills/sdd-design |
| `sdd-propose` | Change proposals | ~/.config/opencode/skills/sdd-propose |
| `sdd-tasks` | Task breakdown | ~/.config/opencode/skills/sdd-tasks |
| `sdd-apply` | Task implementation | ~/.claude/skills/sdd-apply |
| `sdd-archive` | Change archive | ~/.claude/skills/sdd-archive |
| `sdd-explore` | Codebase exploration | ~/.claude/skills/sdd-explore |
| `sdd-spec` | Specifications | ~/.claude/skills/sdd-spec |
| `sdd-verify` | Implementation verification | ~/.config/opencode/skills/sdd-verify |
| `sdd-onboard` | SDD walkthrough | ~/.config/opencode/skills/sdd-onboard |

## Project Conventions

- **Stack**: Next.js 15 App Router + TypeScript + Tailwind CSS v4
- **API**: Dropea GraphQL (`graphql-request`)
- **Test**: Vitest + @testing-library/react + Playwright (E2E)
- **Lint**: ESLint (via `next lint`)
- **Format**: Prettier
- **Auth**: x-api-key header
- **i18n**: next-intl (ES / PT)
- **State (cart)**: Zustand + localStorage

## Testing Capabilities

| Layer | Available | Tool |
|-------|-----------|------|
| Unit | ✅ | Vitest |
| Integration | ✅ | @testing-library/react |
| E2E | ✅ | Playwright |

### Commands
- Tests: `npm test` (vitest run)
- Coverage: `npm run test:coverage`
- E2E: `npm run test:e2e`
- Lint: `npm run lint`
- Format: `npm run format`
