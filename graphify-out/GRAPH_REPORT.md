# Graph Report - .  (2026-05-28)

## Corpus Check
- 82 files · ~51,750 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 493 nodes · 652 edges · 46 communities (37 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_DirView Component|DirView Component]]
- [[_COMMUNITY_Speckit Extension System|Speckit Extension System]]
- [[_COMMUNITY_SDD Workflow and Templates|SDD Workflow and Templates]]
- [[_COMMUNITY_Package Config|Package Config]]
- [[_COMMUNITY_Graphify Artifacts|Graphify Artifacts]]
- [[_COMMUNITY_Git Extension Commands|Git Extension Commands]]
- [[_COMMUNITY_Speckit PowerShell Utilities|Speckit PowerShell Utilities]]
- [[_COMMUNITY_Speckit Manifest Files|Speckit Manifest Files]]
- [[_COMMUNITY_Modal Sheet and Focus|Modal Sheet and Focus]]
- [[_COMMUNITY_Claude Skills Integration|Claude Skills Integration]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Shadow DOM and ARIA|Shadow DOM and ARIA]]
- [[_COMMUNITY_Shortcut Registry|Shortcut Registry]]
- [[_COMMUNITY_Bash Feature Scripts|Bash Feature Scripts]]
- [[_COMMUNITY_Palette Component|Palette Component]]
- [[_COMMUNITY_Demo App|Demo App]]
- [[_COMMUNITY_Claude Integration Config|Claude Integration Config]]
- [[_COMMUNITY_Workflow Registry|Workflow Registry]]
- [[_COMMUNITY_Project Constitution|Project Constitution]]
- [[_COMMUNITY_Feature Branch Creation|Feature Branch Creation]]
- [[_COMMUNITY_Speckit Init Options|Speckit Init Options]]
- [[_COMMUNITY_Feature Branch PS Scripts|Feature Branch PS Scripts]]
- [[_COMMUNITY_Dual Build Targets|Dual Build Targets]]
- [[_COMMUNITY_ModalSheet Component|ModalSheet Component]]
- [[_COMMUNITY_LocalStorage Schema|LocalStorage Schema]]
- [[_COMMUNITY_UI Sub-Components|UI Sub-Components]]
- [[_COMMUNITY_App State and Config|App State and Config]]
- [[_COMMUNITY_Shortcut Design|Shortcut Design]]
- [[_COMMUNITY_Git Bash Utilities|Git Bash Utilities]]
- [[_COMMUNITY_Claude Settings|Claude Settings]]
- [[_COMMUNITY_Git PS Utilities|Git PS Utilities]]
- [[_COMMUNITY_Breadcrumbs Component|Breadcrumbs Component]]
- [[_COMMUNITY_Bash Auto-Commit|Bash Auto-Commit]]
- [[_COMMUNITY_Bash Repo Init|Bash Repo Init]]
- [[_COMMUNITY_TitleBar Component|TitleBar Component]]
- [[_COMMUNITY_Speckit Feature State|Speckit Feature State]]
- [[_COMMUNITY_Checklist Template|Checklist Template]]
- [[_COMMUNITY_PaletteResult Component|PaletteResult Component]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 12 edges
2. `ShortcutRegistry` - 12 edges
3. `files` - 11 edges
4. `files` - 10 edges
5. `AppState` - 9 edges
6. `Feature Specification Template` - 9 edges
7. `Tasks Template` - 9 edges
8. `Rove Demo Page` - 9 edges
9. `init()` - 8 edges
10. `DirectoryNode` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Feature Specification Template` --rationale_for--> `Rationale: Spec Must Be Technology-Agnostic`  [INFERRED]
  .specify/templates/spec-template.md → .claude/skills/speckit-specify/SKILL.md
- `Rove Project CLAUDE.md` --references--> `Implementation Plan: Rove UI Component (plan.md)`  [EXTRACTED]
  CLAUDE.md → .specify/specs/001-dirnav-ui-component/plan.md
- `Constitution Check Gate` --references--> `Constitution File (.specify/memory/constitution.md)`  [INFERRED]
  .specify/templates/plan-template.md → .claude/skills/speckit-constitution/SKILL.md
- `Feature Specification Template` --references--> `Template Sync Propagation on Constitution Update`  [EXTRACTED]
  .specify/templates/spec-template.md → .claude/skills/speckit-constitution/SKILL.md
- `User Stories Section` --references--> `speckit-tasks Skill`  [EXTRACTED]
  .specify/templates/spec-template.md → .claude/skills/speckit-tasks/SKILL.md

## Hyperedges (group relationships)
- **Spec Kit Git Lifecycle Hook System** — extensionsyml_speckit_extensions_config, git_extension_manifest, cmd_speckit_git_commit, cmd_speckit_git_feature, cmd_speckit_git_initialize [EXTRACTED 0.95]
- **Rove Core Type System (discriminated union nodes)** — rove_type_directory_node, rove_type_directory_item, rove_type_directory_node_item, rove_type_action_item, rove_type_input_item, rove_type_virtual_item [EXTRACTED 1.00]
- **Rove Dual-Mode UI (palette + dir view components)** — rove_mode_palette, rove_mode_dir, rove_component_palette, rove_component_dirview, rove_component_modalsheet [EXTRACTED 0.95]
- **Spec Kit Specification-Driven Development Pipeline** — skill_specify_speckit_specify, skill_clarify_speckit_clarify, skill_plan_speckit_plan, skill_tasks_speckit_tasks, skill_analyze_speckit_analyze, skill_implement_speckit_implement [EXTRACTED 1.00]
- **Spec Kit Git Integration Subsystem** — skill_git_initialize_speckit_git_initialize, skill_git_feature_speckit_git_feature, skill_git_remote_speckit_git_remote, skill_git_validate_speckit_git_validate, skill_git_commit_speckit_git_commit [INFERRED 0.92]
- **Spec Kit Core Template Triad (spec/plan/tasks)** — spec_template_spec_template, plan_template_plan_template, tasks_template_tasks_template [EXTRACTED 0.97]

## Communities (46 total, 9 thin omitted)

### Community 0 - "DirView Component"
Cohesion: 0.07
Nodes (48): DirView(), DirViewProps, EphemeralCtx, InlineTextMode, MultiSelectMode, EphemeralOption, Palette(), PaletteEphemeral (+40 more)

### Community 1 - "Speckit Extension System"
Cohesion: 0.06
Nodes (38): check-prerequisites.ps1 Script, extensions.yml Hook Configuration File, Graceful Degradation Without Git, Constitution as Non-Negotiable Authority, Coverage Gap Detection, Extension Hook System (before/after_analyze), Severity Levels (CRITICAL/HIGH/MEDIUM/LOW), speckit-analyze Skill (+30 more)

### Community 2 - "SDD Workflow and Templates"
Cohesion: 0.07
Nodes (35): Specification-Driven Development (SDD) Workflow, Complexity Tracking Table, Constitution Check Gate, Plan Template, Project Structure Section, Technical Context Section, Constitution File (.specify/memory/constitution.md), Constitution Semantic Versioning Policy (+27 more)

### Community 3 - "Package Config"
Cohesion: 0.07
Nodes (28): deleted_files, files, code, document, image, paper, video, graphifyignore_patterns (+20 more)

### Community 4 - "Graphify Artifacts"
Cohesion: 0.07
Nodes (28): description, devDependencies, @leeoniya/ufuzzy, solid-js, solid-transition-group, typescript, vite, vite-plugin-dts (+20 more)

### Community 5 - "Git Extension Commands"
Cohesion: 0.08
Nodes (13): InputFormProps, ModalSheetProps, HighlightSegment, PaletteResultProps, NavigationState, OverlayState, PaletteState, SearchResult (+5 more)

### Community 6 - "Speckit PowerShell Utilities"
Cohesion: 0.11
Nodes (23): Feature Branch Naming Convention (sequential/timestamp patterns), Command: speckit.git.commit (Auto-Commit), Command: speckit.git.feature (Create Feature Branch), Command: speckit.git.initialize (Init Repo), Command: speckit.git.remote (Detect Remote URL), Command: speckit.git.validate (Branch Validation), Auto-Execute Hooks Setting, Hook: after_specify (+15 more)

### Community 7 - "Speckit Manifest Files"
Cohesion: 0.23
Nodes (11): Find-FeatureDirByPrefix(), Find-SpecifyRoot(), Get-CurrentBranch(), Get-FeatureDirFromBranchPrefixOrExit(), Get-FeaturePathsEnv(), Get-Python3Command(), Get-RepoRoot(), Get-SpecKitEffectiveBranchName() (+3 more)

### Community 8 - "Modal Sheet and Focus"
Cohesion: 0.13
Nodes (14): files, .specify/scripts/powershell/check-prerequisites.ps1, .specify/scripts/powershell/common.ps1, .specify/scripts/powershell/create-new-feature.ps1, .specify/scripts/powershell/setup-plan.ps1, .specify/scripts/powershell/setup-tasks.ps1, .specify/templates/checklist-template.md, .specify/templates/constitution-template.md (+6 more)

### Community 9 - "Claude Skills Integration"
Cohesion: 0.14
Nodes (13): files, .claude/skills/speckit-analyze/SKILL.md, .claude/skills/speckit-checklist/SKILL.md, .claude/skills/speckit-clarify/SKILL.md, .claude/skills/speckit-constitution/SKILL.md, .claude/skills/speckit-implement/SKILL.md, .claude/skills/speckit-plan/SKILL.md, .claude/skills/speckit-specify/SKILL.md (+5 more)

### Community 10 - "TypeScript Config"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, declarationDir, jsx, jsxImportSource, module, moduleResolution, outDir (+5 more)

### Community 11 - "Shadow DOM and ARIA"
Cohesion: 0.19
Nodes (13): Rationale: Custom focus trap (~25 lines) over library dependency, Component: ModalSheet.tsx (Input/Virtual Loading Overlay), Custom Focus Trap (modal overlays, ~25 lines), Tasks Phase 8: Node Types and Activation (US6), Type: ActionItem (type: action), Type: DirectoryItem (discriminated union), Type: DirectoryNodeItem (type: directory), Type: InputItem (type: input) (+5 more)

### Community 12 - "Shortcut Registry"
Cohesion: 0.20
Nodes (3): _extract_highest_number(), get_highest_from_branches(), create-new-feature.sh script

### Community 13 - "Bash Feature Scripts"
Cohesion: 0.27
Nodes (10): Rove Demo Page, Fuzzy Search Across Leaf Nodes, Rove Instance 1 (demo), Rove Instance 2 (demo2), Keyboard Shortcuts (Toggle/Swap/Navigate/Accept/Dismiss), localStorage Persistence, demo/main.ts Entry Point, Multi-Instance Isolation Feature (+2 more)

### Community 14 - "Palette Component"
Cohesion: 0.20
Nodes (9): invoke_separator, script, default_integration, installed_integrations, integration, integration_settings, claude, integration_state_schema (+1 more)

### Community 15 - "Demo App"
Cohesion: 0.20
Nodes (9): schema_version, description, installed_at, name, source, updated_at, version, workflows (+1 more)

### Community 16 - "Claude Integration Config"
Cohesion: 0.22
Nodes (9): Rationale: Custom two-tier shortcut registry (global + focus-scoped), Rationale: uFuzzy chosen for bundle size (1.2kb vs 24kb fuse.js), Module: fuzzy.ts (uFuzzy wrapper + index builder), Module: registry.ts (ShortcutRegistry), Keyboard Shortcut Registry (two-tier global/scoped), Tasks Phase 2: Foundational (Types, Store, Search, Shortcuts), Tasks Phase 7: Keyboard Shortcuts (US5), Type: SearchIndex (haystack + items arrays) (+1 more)

### Community 17 - "Workflow Registry"
Cohesion: 0.36
Nodes (9): Rove Project CLAUDE.md, Project Constitution (Unfilled Placeholder), Project Constitution Template, Public API Contract: Rove UI Component (contracts/api.md), Data Model: Rove UI Component (data-model.md), Implementation Plan: Rove UI Component (plan.md), Research: Rove UI Component (research.md), Feature Spec: Rove UI Component (spec.md) (+1 more)

### Community 18 - "Project Constitution"
Cohesion: 0.39
Nodes (7): ConvertTo-CleanBranchName(), Get-BranchName(), Get-HighestNumberFromBranches(), Get-HighestNumberFromNames(), Get-HighestNumberFromRemoteRefs(), Get-HighestNumberFromSpecs(), Get-NextBranchNumber()

### Community 19 - "Feature Branch Creation"
Cohesion: 0.22
Nodes (8): ai, ai_skills, branch_numbering, context_file, here, integration, script, speckit_version

### Community 20 - "Speckit Init Options"
Cohesion: 0.29
Nodes (8): Rationale: Manual attachShadow over solid-element (no custom element overhead), Component: Root.tsx (Shadow DOM host + SolidJS mount), FR-020: Embed in shadow DOM appended to document.body, Public API: init(config: ConsumerConfig): ComponentInstance, Shadow DOM Isolation, Tasks Phase 3: Init + Shadow DOM (US8), Theme Implementation (CSS custom properties + prefers-color-scheme), Type: ComponentInstance

### Community 21 - "Feature Branch PS Scripts"
Cohesion: 0.25
Nodes (8): Module: app-state.ts (SolidJS createStore root), Module: config.ts (Config Resolution), SolidJS (Internal Rendering), Type: AppState (SolidJS Root Store), Type: ConsumerConfig, Type: DirectoryNode, Type: MetaSettings, Type: WindowState

### Community 22 - "Dual Build Targets"
Cohesion: 0.46
Nodes (7): ConvertTo-CleanBranchName(), Get-BranchName(), Get-HighestNumberFromBranches(), Get-HighestNumberFromNames(), Get-HighestNumberFromRemoteRefs(), Get-HighestNumberFromSpecs(), Get-NextBranchNumber()

### Community 23 - "ModalSheet Component"
Cohesion: 0.33
Nodes (6): ARIA Implementation Strategy, Component: Palette.tsx, FR-022: ARIA essentials (roles, aria-live, focus trap), Multi-Instance Support (isolated by keyPrefix), Tasks Phase 10: Polish and Cross-Cutting Concerns, Tasks Phase 4: Command Palette (US1)

### Community 24 - "LocalStorage Schema"
Cohesion: 0.40
Nodes (6): Rationale: Dot-notation localStorage key schema for category grouping, localStorage Key Schema ({prefix}.{category}.{setting}), Meta Directory (auto-injected, reserved key), Module: meta-tree.ts (auto-injects meta DirectoryNode), Module: persist.ts (localStorage adapter), Tasks Phase 9: Meta Directory and User Settings (US7)

### Community 25 - "UI Sub-Components"
Cohesion: 0.33
Nodes (6): Component: Breadcrumbs.tsx, Component: DirView.tsx, Component: TitleBar.tsx, Directory View Pagination (9 items/page, 1=prev/9=next), Tasks Phase 5: Dir View + Window Behavior (US2+US4), Type: NavigationState

### Community 26 - "App State and Config"
Cohesion: 0.47
Nodes (6): Rove UI Component, FR-001: Default to command palette mode, Directory View Mode, Command Palette Mode, Tasks Phase 6: Mode Switching (US3), TypeScript 5.8

### Community 27 - "Shortcut Design"
Cohesion: 0.50
Nodes (5): Rationale: Two Vite build targets (library ESM/CJS + userscript IIFE), Library Build (ESM+CJS, SolidJS external), Userscript Build (IIFE, self-contained, window.__ROVE__), Tasks Phase 1: Project Setup, Vite 6 (Build Tool)

### Community 29 - "Claude Settings"
Cohesion: 0.50
Nodes (3): permissions, additionalDirectories, allow

## Knowledge Gaps
- **202 isolated node(s):** `code`, `document`, `paper`, `image`, `video` (+197 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `speckit-specify Skill` connect `Speckit Extension System` to `SDD Workflow and Templates`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `Full SDD Cycle Workflow` connect `SDD Workflow and Templates` to `Speckit Extension System`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `Feature Specification Template` connect `Speckit Extension System` to `SDD Workflow and Templates`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `code`, `document`, `paper` to the rest of the system?**
  _202 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DirView Component` be split into smaller, more focused modules?**
  _Cohesion score 0.06832298136645963 - nodes in this community are weakly interconnected._
- **Should `Speckit Extension System` be split into smaller, more focused modules?**
  _Cohesion score 0.06258890469416785 - nodes in this community are weakly interconnected._
- **Should `SDD Workflow and Templates` be split into smaller, more focused modules?**
  _Cohesion score 0.06890756302521009 - nodes in this community are weakly interconnected._