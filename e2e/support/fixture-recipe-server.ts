import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'

// Serves a single static page with schema.org Recipe JSON-LD, so the recipe-import test
// exercises the app's real "structured-data" import path
// (src/app/api/recipes/import/route.ts -> extractRecipeJsonLd/buildRecipeFromJsonLd)
// deterministically — no dependency on a real third-party recipe site staying online/
// unchanged, and no Anthropic call (a structured-data hit short-circuits before the AI
// cleanup path), so it doesn't touch the free-tier quota the AI-quota-gate test also needs.
export const FIXTURE_RECIPE_TITLE = 'E2E Test Sourdough Boule'

const RECIPE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  name: FIXTURE_RECIPE_TITLE,
  description: 'A fixture recipe served locally for Playwright E2E tests.',
  recipeIngredient: [
    '500 g bread flour',
    '350 g water',
    '100 g active sourdough starter',
    '10 g salt',
  ],
  recipeInstructions: [
    { '@type': 'HowToStep', name: 'Autolyse', text: 'Mix flour and water and rest for 30 minutes.' },
    { '@type': 'HowToStep', name: 'Mix', text: 'Add starter and salt, mix thoroughly for 5 minutes.' },
    { '@type': 'HowToStep', name: 'Bulk ferment', text: 'Let the dough bulk ferment for 4 hours, folding every 30 minutes.' },
    { '@type': 'HowToStep', name: 'Bake', text: 'Bake at 450F for 40 minutes.' },
  ],
  prepTime: 'PT20M',
  cookTime: 'PT45M',
  recipeCategory: 'loaf',
}

const HTML = `<!doctype html>
<html>
<head>
<title>${FIXTURE_RECIPE_TITLE}</title>
<script type="application/ld+json">${JSON.stringify(RECIPE_JSON_LD)}</script>
</head>
<body><h1>${FIXTURE_RECIPE_TITLE}</h1></body>
</html>`

export interface FixtureServer {
  url: string
  close: () => Promise<void>
}

export async function startFixtureRecipeServer(): Promise<FixtureServer> {
  const server: Server = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(HTML)
  })

  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo

  return {
    url: `http://127.0.0.1:${port}/recipe`,
    close: () => new Promise<void>((resolve, reject) => server.close(err => (err ? reject(err) : resolve()))),
  }
}
