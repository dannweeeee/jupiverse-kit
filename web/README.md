# Jupiverse Kit Web

The docs/playground site lives in a pnpm workspace with the SDK at the repository root.

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/dannxbt/jupiverse-kit.git
```

2. Install dependencies from the repository root

```bash
pnpm install
```

3. Run the development server

```bash
pnpm dev:web
```

Or from this directory after the root install:

```bash
pnpm dev
```

If you deploy this app on Vercel, keep the repository root as the project root (or enable including files outside the Root Directory) so Vercel can use the workspace `pnpm-lock.yaml`.
