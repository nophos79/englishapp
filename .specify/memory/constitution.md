<!--
Sync Impact Report
- Version change: 1.1.0 → 1.2.0 (MINOR: Expanded Principles II, III, VI and Technical Constraints for multi-device family sync with offline-first cache and server-enforced attempt immutability)
- Modified principles:
  - II. Child-Safe, Accessible & Distraction-Free UX (clarified parent-only cloud account, zero child PII)
  - III. Offline-First & Multi-Device PWA (added automatic multi-device family sync over offline cache)
  - VI. Assessment Integrity & Parental Governance (added server-enforced immutability across devices)
- Added sections: None
- Removed sections: None
- Follow-up TODOs: None
-->

# EnglishApp Constitution

## Core Principles

### I. Curriculum-First Alignment (NON-NEGOTIABLE)

All learning modules, exercises, vocabulary lists, grammar drills, irregular verbs, and useful
expressions MUST map explicitly to the Spanish Primary Education English curriculum for 2º Ciclo
(3º y 4º de Primaria) and 3º Ciclo (5º y 6º de Primaria), organized by course, term (First, Second,
Third Term), and Situación de Aprendizaje (SA) in the exact chronological sequence of the school
year (`Starter` → `SA 1..6` + `Festivities`) as referenced in `Docs/`.

- Curriculum content MUST be stored as structured, versioned, original educational data bundled
  with the application (zero heavy PDFs or raw copyrighted scans); raw third-party copyrighted
  photocopiable worksheets MUST NOT be redistributed.
- Every exercise item MUST declare its target course, term, SA/topic, skill area (vocabulary,
  grammar, expressions, irregular verbs, listening/reading), and difficulty level.
- Parents/tutors MUST be able to control which units in the school-year sequence are currently
  enabled or locked for each student so practice matches real classroom pacing.

*Rationale*: Ensures pedagogical coherence with what students actually study in class in the same
order, keeps static curriculum instant and free of cloud storage bloat, and respects intellectual
property.

### II. Child-Safe, Accessible & Distraction-Free UX (NON-NEGOTIABLE)

The user interface MUST be purpose-built for Primary school students (ages 8–12) and compliant
with WCAG 2.1 AA accessibility standards.

- Interactive controls MUST meet touch-friendly sizing (minimum 44×44 px tap targets) with clear
  visual hierarchy and legible typography across tablets, phones, and desktop screens.
- The application MUST contain zero third-party advertisements and zero behavioral tracking.
- Privacy-by-default for minors: only the Parent/Tutor holds an authenticated family account;
  Student profiles MUST remain internal records identified solely by nickname, avatar, and course
  (no child email, full name, or personal data).
- Instructions and UI chrome MUST be clear and supportive (Spanish guidance with English learning
  content) so students can navigate autonomously.

*Rationale*: Minors require a safe, calm, and accessible learning environment that complies with
data-protection expectations (GDPR-K / LOPDGDD) while allowing parents to manage the family account.

### III. Offline-First & Multi-Device PWA

EnglishApp MUST be delivered as a responsive Web Application / Progressive Web App (PWA) capable
of running reliably on desktop browsers, tablets, and mobile phones across the family.

- Family state (student profiles, unit locks, assigned exams, practice progress, mistake queues,
  and attempt history) MUST synchronize across devices signed into the same Parent family account
  (e.g., Parent creates/reviews exams on their phone/PC while Student practices on a tablet).
- Core study flows (browsing enabled curriculum units, completing practice sessions and cached
  assigned exams, and recording attempts) MUST remain functional offline once loaded, queuing
  changes locally and syncing automatically when connectivity returns.
- Initial load and screen transitions MUST remain fast and responsive on modest school tablets
  and low-bandwidth home connections.

*Rationale*: Families naturally split roles across devices (parent's phone vs. child's tablet)
while still needing uninterrupted study during intermittent Wi-Fi.

### IV. Pedagogical Feedback & Active Practice

Learning MUST be active, encouraging, and mastery-oriented rather than passive reading.

- In **Practice mode**, every exercise MUST deliver immediate, constructive feedback *only after*
  the student submits an answer: confirming correct answers with positive reinforcement and showing
  the correct form plus a brief, age-appropriate explanation when incorrect.
- In **Exam mode**, solutions and feedback MUST be withheld until the entire exam is submitted,
  preserving genuine evaluation conditions.
- Incorrectly answered items MUST be recorded for targeted review so students can reinforce weak
  areas (vocabulary, grammar structures, or irregular verb forms).
- Pronunciation support (browser speech synthesis fallback) SHOULD be offered on vocabulary,
  expressions, and example sentences so students connect spelling with sound without requiring
  heavy remote audio storage.

*Rationale*: Immediate corrective feedback accelerates practice retention, while delayed feedback
in exams ensures honest assessment of mastery.

### V. Spec-Driven & Test-Verified Delivery

All features MUST follow the Spec-Driven Development (SDD) lifecycle before application code is
written, and core logic MUST be verified by automated tests.

- Every feature MUST have an approved specification (`specs/NNN-feature/spec.md`), technical plan
  (`plan.md`), and actionable task list (`tasks.md`) prior to implementation.
- Pure domain logic (answer evaluation, accent/case normalization, anti-cheat state locks, exam
  generation, progress tracking, offline sync queue, spaced-review selection, and curriculum schema
  validation) MUST be covered by automated unit and integration tests.
- Architecture MUST favor simplicity and YAGNI: avoid custom server maintenance when a managed
  backend-as-a-service satisfies family sync and security requirements cleanly.

*Rationale*: Keeps specifications as the single source of truth, prevents scope creep, and
guarantees that educational grading, exam integrity, and sync logic remain bug-free.

### VI. Assessment Integrity & Parental Governance (NON-NEGOTIABLE)

The application MUST enforce strict separation between the **Parent/Tutor profile** and **Student
profile(s)** so students can practice honestly without gaming or falsifying results.

- Access to the Parent profile on any signed-in device (exam creation, unit unlock/lock controls,
  full attempt history, answer-key previews, student management, and progress resets) MUST be
  protected by a parental PIN.
- Solutions and answer keys MUST NEVER be visible to students before submitting an answer in
  Practice mode or before submitting the complete test in Exam mode.
- Once an answer is submitted in Practice mode or an exam is submitted in Exam mode, the student
  MUST NOT be able to edit that response to inflate scores; retries MUST randomize question and
  option order.
- Every practice session and exam attempt (including scores, timestamps, per-question results, and
  abandoned/incomplete exams) MUST be persisted in an immutable audit history backed by the family
  cloud database (append-only for student flows) so clearing browser data or switching devices
  cannot erase or alter past results. Only authenticated Parent actions may reset a student profile.

*Rationale*: Families rely on EnglishApp to evaluate real learning progress; server-backed
immutability and anti-cheating guards prevent bypassing logs via browser resets while keeping
practice fair for the child.

## Technical & Quality Constraints

- **Platform**: Progressive Web App (installable manifest, service worker for offline caching,
  responsive layout from 360px mobile to desktop).
- **Content Integrity**: All structured curriculum datasets MUST be bundled in the app and
  validated against a formal schema (checking required fields, valid course/term/SA ordering,
  and non-empty answers) as part of automated checks.
- **Persistence & Sync**: Managed cloud backend (Supabase free tier: PostgreSQL + Auth + Row-Level
  Security) combined with a decoupled local offline cache and sync queue. Static curriculum and
  speech synthesis MUST NOT consume remote database or file storage quota. Parental PIN MUST be
  stored hashed, never plaintext.
- **Performance Budget**: Core interactive screens MUST load in under 2 seconds on mid-range
  mobile/tablet hardware and maintain smooth 60 fps interactions.

## Spec-Driven Development Workflow

1. **Constitution** (`/speckit-constitution`): Maintain project-wide principles and constraints in
   `.specify/memory/constitution.md`.
2. **Specify** (`/speckit-specify`): Define user scenarios, functional requirements, entities,
   and technology-agnostic success criteria in `specs/NNN-<short-name>/spec.md`.
3. **Clarify** (`/speckit-clarify`, optional): Resolve ambiguities before architectural design.
4. **Plan** (`/speckit-plan`): Translate the approved specification into architecture, data
   models, and contracts in `plan.md`, verifying constitution compliance.
5. **Tasks** (`/speckit-tasks`): Break the plan into independently testable, prioritized tasks
   in `tasks.md`.
6. **Implement** (`/speckit-implement`): Execute tasks incrementally, running automated tests
   and validating acceptance scenarios at each milestone.

## Governance

- This Constitution supersedes ad-hoc development practices. Every specification, plan, and code
  review MUST verify compliance with all six Core Principles.
- Any exception or added architectural complexity MUST be explicitly documented and justified in
  the feature's `plan.md`.
- Amendments to this Constitution require updating `.specify/memory/constitution.md` with a
  documented rationale and semantic version increment:
  - **MAJOR**: Backward-incompatible removal or redefinition of a Core Principle.
  - **MINOR**: Addition of a new principle or material expansion of governance rules.
  - **PATCH**: Clarifications, wording improvements, or non-semantic refinements.

**Version**: 1.2.0 | **Ratified**: 2026-11-22 | **Last Amended**: 2026-11-22
