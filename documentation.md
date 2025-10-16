MedChron Dashboard & Verification: Frontend Technical Proposal (V1)

Author: Jonas Kratochvil
Scope: Frontend architecture & implementation for the MedChron Dashboard (Advanced) and Project-level Verification view. Backend APIs assumed; this focuses on UI/UX, state, data contracts, routing, and rollout.

1) Executive Summary

Create an org-level MedChron Dashboard in Advanced to view status and initiate MedChrons (single + multi-select).

Add a Verification step in the project MedChron section to include/exclude candidate medical docs before running.

Disable auto-run for non-initiated projects; show clear status in both places.

Ship V1 inside the monolith; keep API boundaries clean for future extraction.

2) Scope (Frontend V1)

New Advanced page: MedChron Dashboard.

Enhancements to Project → MedChron: Verification step & compact status.

Feature-flagged exposure and Advanced-permission gate.

Telemetry, accessibility, tests, and progressive rollout.

Non-Goals (V1)

Backend job orchestration, classification improvements, or cost modeling.

Full run history export/analytics, centralized notifications, saved views (V1.5+).

3) Information Architecture & Routing

Advanced → MedChron Dashboard: /advanced/medchron

Project → MedChron: /projects/:id/medchron (existing), with a new Verification subview.

Routes behind: ff.medchronV1 (feature flag) and perm.advanced.medchron (permission) for Dashboard.

4) Key Screens & Components
A. MedChron Dashboard (Advanced)

Summary Cards: Completed | In Progress | Pending/Queued | Not initiated | Review (N).

Projects Table: Bulk select, Project name (link), Status chip, Initiation date, Initiated by.

Toolbar: Search by project name, Status filter (multi), Page size, Pagination.

Bulk actions: Initiate (enabled on selection). Confirmation modal shows project count + estimated cost range.

Guardrails: Batch size cap (config; default 50), daily org cap, rate-limited queue, no select-all across pages.

B. Project MedChron – Verification

Header + Badge: “Verification” with Review (N) when unprocessed medical-classified docs exist.

Candidates Grid:

Columns: ✅ (included by default), Filename, Path, Type, Uploaded by/at, Row action: Exclude.

Bulk exclude by folder/path (grouped view).

Add files: Picker from Folders & Docs; dedupe with friendly message.

Primary CTA: Run MedChron (XX files) uses only included docs.

Status Widget (post-run): Queued / In progress (X/Y) / Completed; last-updated; link back to Dashboard.

5) State Machines (High-Level)
Project Verification

Dashboard Row
NotInitiated | Review(N) | Pending | InProgress(%) | Completed
Bulk Initiate → rows to Pending; per-row failure toasts.

Refresh: poll or SSE (if present) every 30–60s; manual refresh button.

6) Data Contracts (TypeScript)
type MedchronStatus =
  | { kind: "not_initiated" }
  | { kind: "review"; pendingCount: number }
  | { kind: "pending" }
  | { kind: "in_progress"; processed: number; total: number }
  | { kind: "completed" };

interface DashboardProjectRow {
  projectId: string;
  projectName: string;
  status: MedchronStatus;
  initiatedBy?: { id: string; name: string } | null;
  initiatedAt?: string | null; // ISO
}

interface VerificationCandidate {
  docId: string;
  fileName: string;
  path: string;
  type?: string;
  uploadedBy?: string;
  uploadedAt?: string; // ISO
  included: boolean; // default true
}

interface RunSnapshot {
  projectId: string;
  includedDocIds: string[];
  excludedDocIds: string[];
  initiatedBy: string;
  initiatedAt: string; // ISO
}

16) Appendix — Status Chips (Visual Spec)
Status	Chip Label	Description
Not initiated	Not initiated	No run yet.
Review	Review (N)	N unprocessed medical-classified docs to review.
Pending	Pending	Queued; waiting for workers.
In Progress	In progress (X/Y)	X processed of Y total source docs.
Completed	Completed	Latest run completed.

MedChron Dashboard and source verification
Problem
Today, MedChron auto-runs on every project, driving large, unnecessary expenses before customers actually ask for it.
Users have no org-level place to see what’s initiated, in progress, or done.
Inside a project, users often don’t know MedChron’s state until they open the section; if some meds were processed earlier and others weren’t, they may not realize the chronology is missing records.
Goal
Add a new “MedChron Dashboard” under the Advanced section. It shows org-wide status and lets users initiate MedChron for one or multiple projects at once. It pairs with a project-level Verification step (review sources before submitting to MedChron) so the two experiences work together.
Dashboard MedChron view
Table columns: Bulk selector, Project name, MedChron status, Initiation date, Initiated by.
Statuses:
Not initiated
Review (N)  = N new docs classified as medical need review
In progress (X/Y) = X out of Y documents processed 
Completed
Bulk initiation:
Select multiple projects and Initiate in one action.
Bulk initiation uses auto-review (no per-project document review).
Possible guardrails options:
confirmation modal with # projects
batch size limit (e.g., 10)
soft caps per org/day, rate-limited queue, and no “select all across all pages.”
Search & filters:
by project name and status
Hyperlink
from a row to the project’s MedChron section
Project-level MedChron verification view
Purpose: confirm sources before sending to MedChron; default is all candidate medical docs pre-selected.
What shows: filename + file path
Actions: 
Exclude per file or by folder/path
Add from Folders & Docs
Zero-state: if the classifier finds none, explain why and still allow Add to run manually.
Run: “Run MedChron (XX files)” uses only currently included docs
After run: compact status/progress (X/Y) on the dashboard
Triggering & cost rules
Turn off auto-processing for non-initiated projects
When new docs arrive on an already-initiated project, Surface Review (N) in Dashboard and let users run review the new files before they are passed no MedChron.
Permissions
Advanced-permission-gated access to the Dashboard.
Respect project permissions for deeper details; the Dashboard can still list rows safely, and hide sensitive details if the user lacks access.
Success criteria
Lower spend: fewer MedChron runs that are never viewed or are duplicative.
More control: adoption of Dashboard initiation and project-level review.
Clarity: fewer tickets about “is it running / what’s missing?” and visible org-wide status.

