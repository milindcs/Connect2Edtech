# TODO - Move Dashboard to Frontend

- [x] Inspect frontend dashboard components + routing (Admin/Hr/Student + `/dashboard` redirect)
- [x] Inspect backend `server.js` to confirm only API routes + static SPA fallback exist (no server-side dashboard pages)
- [ ] Ensure frontend `/dashboard` and role routes are the only dashboard entrypoints (keep backend API + SPA fallback)
- [ ] Optional cleanup: consolidate duplicate dashboard UI components (`frontend/src/views/dashboard/*` vs `frontend/src/views/shared/dashboard/*`)
- [ ] Test manually: navigate to `/dashboard`, `/admin`, `/hr`, `/student` while authenticated/unauthenticated.
- [ ] Build/run checks (frontend + backend) and fix any issues.

