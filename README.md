# Playtest Swarm

**Real-time AI playtesting for indie games.** Upload a screenshot and economy JSON, get a multi-agent analysis in seconds. Powered by Cerebras Gemma 4 31B.

> Hackathon Track: Track 1 Multiverse Agents + optional Track 3 Enterprise Impact

## Features

- **Multi-Agent Pipeline** -- 9 specialized AI agents analyze UI, UX, economy, progression, and player personas simultaneously
- **Multimodal Input** -- Screenshot (base64 image) + structured economy JSON
- **Local Simulation Tools** -- Deterministic economy simulation, upgrade ROI calculator, drop-rate pacing estimator
- **Structured Output** -- Full `PlaytestSwarmReport` with scores, issues, and actionable patches
- **Balance Patch Generator** -- Auto-generates versioned balance changes with before/after comparison
- **Export Suite** -- Copy balance patch JSON, playtest report markdown, UI fix brief, and social demo summary
- **Cerebras Speed Demo Panel** -- Shows model, latency, tokens/sec, and agent count
- **Mock Mode** -- Full functionality without API key for local development and demos

## Architecture

```
src/
  app/
    layout.tsx          -- Root layout (dark theme)
    page.tsx            -- Main demo page (all sections)
    globals.css         -- Tailwind + scrollbar styles
    api/analyze/
      route.ts          -- POST /api/analyze endpoint
  lib/
    types.ts            -- All TypeScript types & schemas
    simulation.ts       -- Local simulation tools
    agents.mock.ts      -- Mock agent implementations
    cerebras.ts         -- Cerebras API adapter + report validation
    orchestrator.ts     -- Pipeline orchestrator
  components/
    SampleDataLoader.tsx
    UploadPanel.tsx
    AgentTimeline.tsx
    ResultsDashboard.tsx
    UIIssuesPanel.tsx
    BalanceIssuesPanel.tsx
    BalancePatchPanel.tsx
    ExportPanel.tsx
    SpeedMetricsPanel.tsx
  samples/
    starforge-economy.json  -- Sample economy with intentional balance problems
samples/
  starforge-economy.json  -- Same sample data (docs reference)
  bad-idle-rpg-screen-placeholder.md
```

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `CEREBRAS_API_KEY` | -- | Cerebras API key (mock mode if unset) |
| `CEREBRAS_MODEL` | `gemma-4-31b` | Model ID |
| `CEREBRAS_BASE_URL` | `https://api.cerebras.ai/v1` | API base URL |
| `DEBUG_AI_RESPONSE` | -- | Set to `true` to log API response shape (local debugging only; never use in public demos) |

Without `CEREBRAS_API_KEY`, the app runs in **mock mode** -- all agents return realistic demo results instantly.

## Real Cerebras Integration Checklist

When setting up for the live hackathon demo:

1. Set `CEREBRAS_API_KEY` in `.env.local`
2. Verify text-only call to `gemma-4-31b` works
3. Verify image input -- screenshot is sent as `image_url` in OpenAI multimodal format (base64 data URI from FileReader)
4. Verify structured JSON output is parsed and validated
5. If `response_format` is unsupported by the endpoint, the adapter automatically retries without it and logs a warning
6. Verify speed metrics populate in the Cerebras Speed Demo panel
7. If any step fails, the app falls back to mock mode with a visible warning

The adapter in `src/lib/cerebras.ts` sends the full multimodal prompt (image + economy + local tool results) to the OpenAI-compatible `/chat/completions` endpoint. The response is parsed, validated via `validateAndNormalizeReport`, and merged with timing metrics.

## Sample Demo Flow

1. Click **"Load Sample: StarForge Idle RPG"**
2. Optionally upload a game screenshot
3. Optionally edit genre/platform/screen goal metadata
4. Click **"Run Playtest Swarm"**
5. Watch the agent timeline animate
6. Review results:
   - Overall score & main risk
   - 9 agent findings with severity tags
   - 5 UI issues with evidence and fixes
   - 5 balance issues with suggested changes
   - Balance patch diff table
   - Export buttons for reports and social summary

## 60-Second Demo Video Script

1. (0:00) Show landing page -- "Real-time AI playtesting for indie games"
2. (0:05) Click "Load Sample" -- economy data populates
3. (0:10) Upload a screenshot -- preview appears
4. (0:15) Click "Run Playtest Swarm" -- agent timeline animates
5. (0:25) Results appear -- score 42/100, 9 agents, <1s total time
6. (0:35) Scroll through UI issues -- touch target sizes, contrast ratios
7. (0:42) Show balance patch table -- before/after values
8. (0:50) Click "Social Summary" export -- copy the demo-ready summary
9. (0:55) Cerebras Speed Demo panel -- model, latency, tokens/sec
10. (1:00) "Built with Cerebras Gemma 4 31B. Real-time AI game analysis."

## What's Mock vs What Uses Gemma 4

| Component | Mock Mode | Cerebras Mode |
|---|---|---|
| Agent analysis | Pre-written realistic results | Gemma 4 31B generated |
| UI issue detection | Curated demo issues | Vision model analysis |
| Balance issue detection | Deterministic + curated | AI with tool calls |
| Simulation tools | Deterministic TypeScript | Same tools, called by AI |
| Report generation | Template-based | AI-generated structured JSON |
| Latency | <100ms | Real API time |

All agent logic is in `src/lib/agents.mock.ts`. When Cerebras is configured, `src/lib/cerebras.ts` sends the full multimodal prompt -- image + economy JSON + local tool results -- to the API and parses the structured JSON response through `validateAndNormalizeReport`.

## Privacy

Screenshots and economy data are processed server-side via the API route. No data is stored, logged to disk, or sent to third parties beyond Cerebras API (when configured). API keys are server-side only and never exposed to the browser.

## License

MIT
