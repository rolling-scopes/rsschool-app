# @rsschool/mcp-server

MCP server that lets AI agents (Claude Desktop, Cursor, Codex, GitHub Copilot)
perform RS School actions on behalf of an authenticated user.

The server uses a Personal Access Token (PAT) generated in RS School to call
the RS School API. The agent inherits the PAT owner's permissions; nothing
more.

## Available tools

- `issue_certificate` — start the certificate issuance pipeline for a student.
  Requires the PAT owner to be a course manager of the given course, or an
  admin.

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