# Org Management Console

A React admin console for managing community organizations (clubs/societies): a member roster,
meetings, budget/finance, bylaws documents, and a unified pending-approvals queue. Frontend
counterpart to [`sso-gateway-bff`](https://github.com/Omercanbasboga/sso-gateway-bff) — the browser
never talks to the identity provider directly, only to that gateway via a same-site session cookie.

This is a personal, generic reimplementation of the architecture and patterns from a production
admin console I built and operated as part of a larger internal system. It is written from scratch
for this repository — no proprietary code, credentials, branding, or infrastructure details from
that project are included.

## A note on the UI layer

The original app was built on top of a commercial React admin template (Creative Tim's Soft UI
Dashboard PRO). That template's code and design system are licensed and not open source, so none
of it is reproduced here. This version is a from-scratch layout and component set on plain
[MUI](https://mui.com/) (fully open source), preserving the same *architecture and interaction
patterns* — not the original visual design.

## What it does

- **Organizations** — list, view, and manage community organizations, with per-organization
  president/advisor/category metadata (`OrganizationList`, `OrganizationDetail`).
- **Tabbed organization detail** — general info, members, meetings, budget, and bylaws, one
  parameterized detail screen instead of a page per sub-resource (`OrganizationDetail` + its
  `tabs/*`) — the same idea as the `AssignmentTab` pattern in the companion
  [`iam-admin-console`](https://github.com/Omercanbasboga/iam-admin-console) repo, applied here to
  an organization's own sub-resources instead of permission assignment.
- **Unified pending-approvals queue** — meetings, membership requests, and bylaws uploads all flow
  through *one* generic table + *one* approve/reject confirmation dialog, keyed by entity type,
  rather than three separate screens (`PendingApprovalsPage`).
- **Budget tab** — balance/income/expense summary cards plus a searchable transaction ledger.
- **Bylaws tab** — document upload with an approval-status chip, feeding the same approvals queue
  above.
- **Categories / Locations / Users** — supporting reference-data screens using the same generic
  `DataTable` component throughout.

## Tech stack

React 18, React Router 6, MUI 5, Axios. No state-management library — each screen owns its own
`useEffect`-driven fetch, which is enough at this scope.

## Configuration

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `REACT_APP_API_BASE_URL` | Base URL of the BFF gateway this app talks to |
| `REACT_APP_OAUTH_PATH` | The gateway's OAuth2 authorization path, used by the sign-in redirect |
| `REACT_APP_API_TIMEOUT` | Optional request timeout override (ms) |

## Running locally

```bash
npm install
npm start
```
