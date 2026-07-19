# @rsschool/mcp-server

MCP server that lets AI agents (Claude Desktop, Cursor, Codex, GitHub Copilot)
perform RS School actions on behalf of an authenticated user.

The server uses a Personal Access Token (PAT) generated in RS School to call
the RS School API. The agent inherits the PAT owner's permissions; nothing
more.

## Role-based tools

On startup (stdio) or on every request (hosted HTTP) the server resolves the
PAT owner's roles via the RS School session endpoint and advertises **only the
tools available to those roles**. A student sees student tools, a mentor sees
mentor tools, admins see everything. Calling a tool outside your role set is
rejected locally (and would be denied by the backend anyway).

Roles are derived per course: `student` (skipped for courses you were expelled
from), `mentor`, `manager`, `supervisor`, `dementor`, `taskOwner`, plus the
app-level `admin`.

## Available tools

### common — any authenticated user

| Tool                  | Type | Description                                          |
| --------------------- | ---- | ---------------------------------------------------- |
| `list_my_courses`     | read | Courses you participate in, with your roles in each  |
| `get_my_profile`      | read | Your RS School profile                               |
| `get_course_schedule` | read | Course schedule; `upcomingOnly` for future deadlines |
| `list_course_tasks`   | read | Tasks of a course with IDs and max scores            |

### student

| Tool                              | Type  | Description                                  |
| --------------------------------- | ----- | -------------------------------------------- |
| `get_my_score`                    | read  | Your score, rank and per-task results        |
| `submit_task_solution`            | write | Submit/update a solution URL for a task      |
| `get_my_cross_check_review_stats` | read  | Cross-check reviews you still need to do     |
| `get_my_cross_check_result`       | read  | Feedback you received for a cross-check task |
| `get_course_interviews`           | read  | Interview events and registration windows    |

### mentor

| Tool                        | Type               | Description                                    |
| --------------------------- | ------------------ | ---------------------------------------------- |
| `list_my_students`          | read               | Students assigned to you                       |
| `get_mentor_dashboard`      | read               | Your review queue and student progress         |
| `get_student_summary`       | read               | Score/status/mentor summary for a student      |
| `submit_task_score`         | write              | Submit a score + feedback for a student's task |
| `get_my_interview_students` | read               | Students assigned to you for stage interviews  |
| `update_student_status`     | write, destructive | Expel / restore / self-study a student         |

### course-management — manager (supervisor/dementor for some), admin

| Tool                           | Type               | Description                                  |
| ------------------------------ | ------------------ | -------------------------------------------- |
| `preview_eligible_students`    | read               | Preview certificate criteria matches         |
| `issue_certificate`            | write              | Issue a certificate to one student           |
| `issue_certificates_bulk`      | write              | Issue certificates to all matching students  |
| `get_course_stats`             | read               | Aggregate course statistics                  |
| `list_course_students_details` | read               | Students with score/status/mentor details    |
| `list_course_mentors_details`  | read               | Mentors with activity details                |
| `get_mentor_reviews`           | read               | Reviews done by mentors (dementor oversight) |
| `expel_students`               | write, destructive | Bulk-expel students by criteria              |

### users — manager, admin

| Tool           | Type | Description                            |
| -------------- | ---- | -------------------------------------- |
| `search_users` | read | Find users by name, GitHub login or ID |

Write tools always require explicit confirmation from the human user — tool
descriptions instruct the agent accordingly (e.g. `preview_eligible_students`
before `issue_certificates_bulk`).

## Toolsets

`RSAPP_TOOLSETS` (optional, comma-separated) narrows the surface further on
top of role filtering: `common`, `student`, `mentor`, `course-management`,
`users`.

Examples: `RSAPP_TOOLSETS=common,student` (student profile),
`RSAPP_TOOLSETS=common,mentor` (mentor profile). Unknown names fail fast with
the list of valid toolsets.

## Environment variables

| Variable           | Required   | Description                                                                                                          |
| ------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| `RSAPP_BASE_URL`   | yes        | RS School app URL, e.g. `https://app.rs.school`                                                                      |
| `RSAPP_PAT`        | stdio only | Personal Access Token (`rsapp_pat_…`)                                                                                |
| `RSAPP_API_PREFIX` | no         | API path prefix, default `/api/v2`. Set to empty when pointing directly at the NestJS container/localhost (no nginx) |
| `RSAPP_TOOLSETS`   | no         | Comma-separated toolset filter                                                                                       |

## Generate a PAT

1. Open RS School and sign in as the user the agent should act as
2. Go to Profile → API tokens
3. Click "Create token", choose a name and an expiry, then copy the token
4. The token is shown only once. Save it somewhere safe

Admins can also create PATs for service accounts (system users) from the admin
panel.

## Hosted server (streamable HTTP)

The hosted endpoint is `https://app.rs.school/mcp`. It is stateless: every
request must carry the PAT in the `Authorization` header; responses are plain
JSON (no SSE stream). The tool list is computed per request from your roles.

### Claude Desktop / clients with HTTP support

```json
{
  "mcpServers": {
    "rsschool": {
      "type": "http",
      "url": "https://app.rs.school/mcp",
      "headers": {
        "Authorization": "Bearer rsapp_pat_..."
      }
    }
  }
}
```

## Local server (stdio)

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

## Deployment

The hosted server runs as the `mcp` container next to `client`/`nestjs` in
`docker-compose.yml`; nginx proxies `location /mcp` to it (rate-limited). It
talks to NestJS over the internal docker network
(`RSAPP_BASE_URL=http://nestjs:8080`, `RSAPP_API_PREFIX=` empty because nginx
is not in the path). The image is built by the `build_mcp` job in
`.github/workflows/deploy.yaml` and published as
`ghcr.io/rolling-scopes/rsschool-app-mcp:master`.

Note for stdio sessions: roles are resolved at startup, so a role change (or
PAT revocation) applies after restart; API calls themselves always re-validate
the token.

## Revoke a token

If the token leaks, revoke it from Profile → API tokens. Admins can revoke any
token from the admin panel. Revocation takes effect immediately.

## Audit

Every PAT-authenticated call is recorded in the audit log. Admins can see who
called what, from which token, at what time.