# LLM Agents Instructions

## General

- Read `README.md` first for project overview and architecture
- Read `CONTRIBUTING.md` for local development setup, commands, commit messages, and PR conventions
- Read `GUIDELINES.md` for code style and testing patterns
- Read `DOMAIN.md` for application domain and data models
- Read all `*/README.md` files for workspace specific architecture and development guidelines

## Writing Style

Use the following writing style for documentation, comments and README files.

Audience: Software Engineers. Expect half to be native speakers and half non-native speakers.

- Keep the reading level at or below 9th grade (Fleisch-Kincaid)
- Write in clear, concise, active voice; don't assume passive voice reads well
- Keep noun phrases short and avoid stacked modifiers
- Limit embedded clauses to one level
- Use conditionals sparingly and stick to simple if/then forms; avoid mixed or inverted versions
- Use transition words (however, therefore, because) to show logic instead of expecting readers to infer it
- Spread new ideas across sentences; avoid packing many concepts into one
- Explain cultural references and idioms so readers with different backgrounds understand them
- Do not end list items with a period
- Do not use emojis
- Do not write obvious comments; explain why, not how or what

## Instructions

- Use the `tmp` folder in the repository to store temporary files during execution and planning if needed
- Never run deploy commands
- Run lint, test, compile, and format at the end of each task using the root scripts unless a workspace requires a specific command; if any fail, fix the issues and run the commands again
- Generate a concise summary at the end. Do not be verbose. Save tokens for the next task

## Commands

- `npm run lint`: Run linting
- `npm run test`: Run tests
- `npm run compile`: Compile the project
- `npm run format`: Format the code
