# @rsschool/mcp-server

MCP server that lets AI agents (Claude Desktop, Cursor, Codex, GitHub Copilot)
perform RS School actions on behalf of an authenticated user.

The server uses a Personal Access Token (PAT) generated in RS School to call
the RS School API. The agent inherits the PAT owner's permissions; nothing
more.

## Available tools

Read-only (no side effects):

- `list_my_courses` — list courses the PAT user manages
- `list_course_tasks` — list tasks of a course (use to look up courseTaskIds)
- `preview_eligible_students` — preview students that match the criteria, without issuing
- `search_users` — find users by name, GitHub login, or numeric ID

Write:

- `issue_certificate` — issue a certificate to a single student by github login
- `issue_certificates_bulk` — issue certificates to every student matching the criteria

All write actions require the PAT owner to be a course manager of the target
course, or an admin.

## Typical workflow for bulk issuance

The agent should follow this order before issuing certificates to many
students:

1. `list_my_courses` — pick the course
2. `list_course_tasks` — find the task IDs the criteria reference
3. `preview_eligible_students` — show the user the count and list
4. Wait for explicit confirmation from the user
5. `issue_certificates_bulk` — actually issue

## Generate a PAT

1. Open RS School and sign in as the user the agent should act as
2. Go to Profile → API tokens
3. Click "Create token", choose a name and an expiry, then copy the token
4. The token is shown only once. Save it somewhere safe

Admins can also create PATs for service accounts (system users) from the admin
panel.

## Configure your agent

Set two env vars: `RSAPP_BASE_URL` and `RSAPP_PAT`.

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, or
`%APPDATA%\Claude\claude_desktop_config.json` on Windows:

```json
{
  "mcpServers": {
    "rsschool": {
      "command": "npx",
      "args": ["-y", "@rsschool/mcp-server"],
      "env": {
        "RSAPP_BASE_URL": "https://app.rs.school",
        "RSAPP_PAT": "rsapp_pat_..."
      }
    }
  }
}
```

### Cursor

`~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "rsschool": {
      "command": "npx",
      "args": ["-y", "@rsschool/mcp-server"],
      "env": {
        "RSAPP_BASE_URL": "https://app.rs.school",
        "RSAPP_PAT": "rsapp_pat_..."
      }
    }
  }
}
```

### Codex CLI

`~/.codex/config.toml`:

```toml
[mcp_servers.rsschool]
command = "npx"
args = ["-y", "@rsschool/mcp-server"]

[mcp_servers.rsschool.env]
RSAPP_BASE_URL = "https://app.rs.school"
RSAPP_PAT = "rsapp_pat_..."
```

## Revoke a token

If the token leaks, revoke it from Profile → API tokens. Admins can revoke any
token from the admin panel. Revocation takes effect immediately.

## Audit

Every PAT-authenticated call is recorded in the audit log. Admins can see who
called what, from which token, at what time.