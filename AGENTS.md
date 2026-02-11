# LLM Agents Instructions

## General

- Read `README.md` first for project overview and architecture
- Read `CONTRIBUTING.md` for local development setup, commands, commit messages, and PR conventions
- Read `GUIDELINES.md` for code style and testing patterns
- Read `DOMAIN.md` for application domain and data models
- Read all `*/README.md` files for workspace specific architecture and development guidelines

## Instructions

- Use the `tmp` folder in the repository to store temporary files during execution and planning if needed
- Never run deploy commands
- Run `npm run lint`, `npm run test`, `npm run compile`, and `npm run format` at the end of each completed task if you modified any files. If any of these steps fail, fix the issues and run the commands again.
- Generate a concise summary at the end. Do not be verbose. Save tokens for the next task
- Prefer telegraph style for communications and reasoning. Sacrifice grammar and punctuation for clarity and conciseness.

## Documentation Style

Use the following writing style for documentation, comments and README files.

Audience: Software Engineers. Expect half to be native speakers and half non-native speakers.

- Keep the reading level at or below 9th grade (Flesch-Kincaid)
- Write in clear, concise, active voice; don't assume passive voice reads well
- Keep noun phrases short and avoid stacked modifiers
- Limit embedded clauses to one level
- Use conditionals sparingly and stick to simple if/then forms; avoid mixed or inverted versions
- Use transition words (however, therefore, because) to show logic instead of expecting readers to infer it
- Spread new ideas across sentences; avoid packing many concepts into one
- Do not end list items with a period
- Do not use emojis
- Do not write obvious comments; explain why, not how or what

## Commands

- `npm run lint`: Run linting
- `npm run test`: Run tests
- `npm run compile`: Compile the project
- `npm run format`: Format the code
