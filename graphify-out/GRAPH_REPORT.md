# Graph Report - .  (2026-05-28)

## Corpus Check
- 85 files · ~55,126 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 479 nodes · 671 edges · 52 communities (44 shown, 8 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 60 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App State and Types|App State and Types]]
- [[_COMMUNITY_Package Config|Package Config]]
- [[_COMMUNITY_Init and Mount|Init and Mount]]
- [[_COMMUNITY_Kiro Requirements|Kiro Requirements]]
- [[_COMMUNITY_Palette Component|Palette Component]]
- [[_COMMUNITY_Speckit PowerShell Scripts|Speckit PowerShell Scripts]]
- [[_COMMUNITY_Store and State Types|Store and State Types]]
- [[_COMMUNITY_Speckit Manifest Files|Speckit Manifest Files]]
- [[_COMMUNITY_Graphify Detect Output|Graphify Detect Output]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Claude Skills Integration|Claude Skills Integration]]
- [[_COMMUNITY_DirView Component|DirView Component]]
- [[_COMMUNITY_Shortcut Registry|Shortcut Registry]]
- [[_COMMUNITY_Git Extension Commands|Git Extension Commands]]
- [[_COMMUNITY_Kiro Design Docs|Kiro Design Docs]]
- [[_COMMUNITY_API Contract|API Contract]]
- [[_COMMUNITY_Git Branch Workflow|Git Branch Workflow]]
- [[_COMMUNITY_Bash Feature Scripts|Bash Feature Scripts]]
- [[_COMMUNITY_Claude Integration Config|Claude Integration Config]]
- [[_COMMUNITY_Speckit Workflow Registry|Speckit Workflow Registry]]
- [[_COMMUNITY_Component Props and Root|Component Props and Root]]
- [[_COMMUNITY_Feature Branch Creation|Feature Branch Creation]]
- [[_COMMUNITY_Speckit Init Options|Speckit Init Options]]
- [[_COMMUNITY_Speckit Task Phases|Speckit Task Phases]]
- [[_COMMUNITY_Kiro Task List|Kiro Task List]]
- [[_COMMUNITY_Feature Branch Scripts|Feature Branch Scripts]]
- [[_COMMUNITY_Project Plan and CLAUDE|Project Plan and CLAUDE.md]]
- [[_COMMUNITY_Directory Item Types|Directory Item Types]]
- [[_COMMUNITY_AppState Data Model|AppState Data Model]]
- [[_COMMUNITY_Search Index and Results|Search Index and Results]]
- [[_COMMUNITY_Modal Sheet Component|Modal Sheet Component]]
- [[_COMMUNITY_Theme and ARIA Research|Theme and ARIA Research]]
- [[_COMMUNITY_Demo App|Demo App]]
- [[_COMMUNITY_Git Bash Utilities|Git Bash Utilities]]
- [[_COMMUNITY_Keyboard Shortcut Design|Keyboard Shortcut Design]]
- [[_COMMUNITY_Shadow DOM Integration|Shadow DOM Integration]]
- [[_COMMUNITY_Claude Settings|Claude Settings]]
- [[_COMMUNITY_Git PowerShell Utilities|Git PowerShell Utilities]]
- [[_COMMUNITY_Bash Repo Init Script|Bash Repo Init Script]]
- [[_COMMUNITY_Bash Auto Commit Script|Bash Auto Commit Script]]
- [[_COMMUNITY_Speckit Feature State|Speckit Feature State]]
- [[_COMMUNITY_Project Constitution|Project Constitution]]
- [[_COMMUNITY_Checklist Template|Checklist Template]]
- [[_COMMUNITY_Search Result Type|Search Result Type]]

## God Nodes (most connected - your core abstractions)
1. `Tasks: Rove UI Component (tasks.md)` - 15 edges
2. `Rove UI Component Feature Specification` - 14 edges
3. `compilerOptions` - 12 edges
4. `ShortcutRegistry` - 12 edges
5. `DirNav Kiro Design Document` - 12 edges
6. `Implementation Plan: Rove UI Component (plan.md)` - 12 edges
7. `Feature Specification: Rove UI Component (spec.md)` - 12 edges
8. `Rove UI Component Data Model` - 12 edges
9. `files` - 11 edges
10. `Data Model: Rove UI Component (data-model.md)` - 11 edges

## Surprising Connections (you probably didn't know these)
- `NavigationView Component (Kiro)` --semantically_similar_to--> `src/components/DirView.tsx - Directory View Floating Window`  [INFERRED] [semantically similar]
  .kiro/specs/dirnav-ui-component/design.md → .specify/specs/001-dirnav-ui-component/tasks.md
- `CommandPalette Component with Fuzzy Search (Kiro)` --semantically_similar_to--> `src/components/Palette.tsx - Command Palette Mode UI`  [INFERRED] [semantically similar]
  .kiro/specs/dirnav-ui-component/design.md → .specify/specs/001-dirnav-ui-component/tasks.md
- `Directory Tree Data Structure (Kiro)` --semantically_similar_to--> `DirectoryNode Type (Record<string, DirectoryItem>)`  [INFERRED] [semantically similar]
  .kiro/specs/dirnav-ui-component/design.md → .specify/specs/001-dirnav-ui-component/data-model.md
- `Shadow DOM Integration Strategy (Kiro)` --semantically_similar_to--> `Research Decision: Manual Shadow Root + SolidJS render()`  [INFERRED] [semantically similar]
  .kiro/specs/dirnav-ui-component/design.md → .specify/specs/001-dirnav-ui-component/research.md
- `Keyboard Shortcut Global Event System (Kiro)` --semantically_similar_to--> `Research Decision: Custom Two-Tier Shortcut Registry`  [INFERRED] [semantically similar]
  .kiro/specs/dirnav-ui-component/design.md → .specify/specs/001-dirnav-ui-component/research.md

## Hyperedges (group relationships)
- **Rove Core Specification Pipeline (spec â†’ data-model â†’ plan â†’ tasks â†’ api)** — specify_spec, specify_data_model, specify_plan, specify_tasks, specify_api_contract [EXTRACTED 0.95]
- **Spec Kit Git Lifecycle Hooks (before/after commands trigger git operations)** — specify_extensions_yml, specify_git_extension, specify_git_cmd_commit [EXTRACTED 0.95]
- **DirectoryItem Discriminated Union (directory + action + input + virtual)** — specify_dm_directory_item, specify_dm_directory_node_item, specify_dm_action_item, specify_dm_input_item [EXTRACTED 0.98]
- **Rove Feature Design Artifact Suite (spec + plan + data-model + research + tasks + api)** — rove_spec, rove_plan, rove_data_model, rove_research, rove_tasks, rove_api_contract [EXTRACTED 1.00]
- **Git Extension Command Set (initialize + feature + validate + remote + commit)** — speckit_git_initialize_cmd, speckit_git_feature_cmd, speckit_git_validate_cmd, speckit_git_remote_cmd, speckit_git_commit_cmd [EXTRACTED 1.00]
- **Rove AppState Slices (palette + navigation + window + meta)** — app_state_type, palette_state_type, navigation_state_type, window_state_type, meta_settings_type [EXTRACTED 1.00]

## Communities (52 total, 8 thin omitted)

### Community 0 - "App State and Types"
Cohesion: 0.06
Nodes (49): AppState (root SolidJS store), ARIA Implementation Strategy (combobox/dialog/live region), Command Palette Mode (US1), ComponentInstance Type (show/hide/toggle/destroy), Project Constitution (Memory / Unfilled), Project Constitution Template, ConsumerConfig Type, CSS Consumer Override Tokens (--rove-*) (+41 more)

### Community 1 - "Package Config"
Cohesion: 0.07
Nodes (28): description, devDependencies, @leeoniya/ufuzzy, solid-js, solid-transition-group, typescript, vite, vite-plugin-dts (+20 more)

### Community 2 - "Init and Mount"
Cohesion: 0.18
Nodes (19): mountRoot(), buildMetaTree(), init(), validateNode(), validateTree(), ActionItem, ComponentInstance, ConsumerConfig (+11 more)

### Community 3 - "Kiro Requirements"
Cohesion: 0.13
Nodes (20): Requirement 5: Command Palette Functionality (Kiro), Requirement 8: Data Structure and Initialization (Kiro), Requirement 3: Directory Display and Navigation (Kiro), DirNav Requirements Document (Kiro), Requirement 4: Keyboard Shortcuts and Controls (Kiro), Requirement 2: Navigation Controls (Kiro), Requirement 6: Node Type Support (Kiro), Requirement 7: Theme and Meta Settings (Kiro) (+12 more)

### Community 4 - "Palette Component"
Cohesion: 0.20
Nodes (12): EphemeralOption, Palette(), PaletteEphemeral, HighlightSegment, PaletteResultProps, appendToIndex(), buildIndex(), search() (+4 more)

### Community 5 - "Speckit PowerShell Scripts"
Cohesion: 0.23
Nodes (11): Find-FeatureDirByPrefix(), Find-SpecifyRoot(), Get-CurrentBranch(), Get-FeatureDirFromBranchPrefixOrExit(), Get-FeaturePathsEnv(), Get-Python3Command(), Get-RepoRoot(), Get-SpecKitEffectiveBranchName() (+3 more)

### Community 6 - "Store and State Types"
Cohesion: 0.15
Nodes (7): NavigationState, PaletteState, WindowState, createAppStore(), DEFAULT_META, defaultAppState(), defaultWindowState()

### Community 7 - "Speckit Manifest Files"
Cohesion: 0.13
Nodes (14): files, .specify/scripts/powershell/check-prerequisites.ps1, .specify/scripts/powershell/common.ps1, .specify/scripts/powershell/create-new-feature.ps1, .specify/scripts/powershell/setup-plan.ps1, .specify/scripts/powershell/setup-tasks.ps1, .specify/templates/checklist-template.md, .specify/templates/constitution-template.md (+6 more)

### Community 8 - "Graphify Detect Output"
Cohesion: 0.14
Nodes (13): files, code, document, image, paper, video, graphifyignore_patterns, needs_graph (+5 more)

### Community 9 - "TypeScript Config"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, declarationDir, jsx, jsxImportSource, module, moduleResolution, outDir (+5 more)

### Community 10 - "Claude Skills Integration"
Cohesion: 0.14
Nodes (13): files, .claude/skills/speckit-analyze/SKILL.md, .claude/skills/speckit-checklist/SKILL.md, .claude/skills/speckit-clarify/SKILL.md, .claude/skills/speckit-constitution/SKILL.md, .claude/skills/speckit-implement/SKILL.md, .claude/skills/speckit-plan/SKILL.md, .claude/skills/speckit-specify/SKILL.md (+5 more)

### Community 11 - "DirView Component"
Cohesion: 0.22
Nodes (8): BreadcrumbsProps, DirView(), EphemeralCtx, InlineTextMode, MultiSelectMode, TitleBarProps, InputItem, NavEntry

### Community 12 - "Shortcut Registry"
Cohesion: 0.17
Nodes (3): ShortcutEntry, ShortcutRegistry, SPECIAL_KEY_CODES

### Community 13 - "Git Extension Commands"
Cohesion: 0.32
Nodes (12): Spec Kit Extensions Configuration (extensions.yml), Sequential Branch Numbering Strategy (001-feature-name), speckit.git.commit Command, speckit.git.feature Command, speckit.git.initialize Command, speckit.git.remote Command, speckit.git.validate Command, Git Extension Configuration (git-config.yml) (+4 more)

### Community 14 - "Kiro Design Docs"
Cohesion: 0.17
Nodes (12): CommandPalette Component with Fuzzy Search (Kiro), Directory Tree Data Structure (Kiro), DirNav Kiro Design Document, DirnavUI Main Container Component (Kiro), NavigationView Component (Kiro), Pagination Strategy - 9 Items Per Page (Kiro), Rationale: CSS Transforms for Smooth Dragging (Kiro), Rationale: React Architecture Choice (Kiro) (+4 more)

### Community 15 - "API Contract"
Cohesion: 0.21
Nodes (12): Public API Contract: Rove UI Component (api.md), API Error Conditions and Messages, init(config: ConsumerConfig): ComponentInstance Entry Point, Keyboard Shortcuts Defaults Table, Multi-Instance Isolation (API Contract), Node Activation Behavior by Mode Table, CSS Custom Property Theming Tokens, Userscript IIFE Global window.__ROVE__ Usage (+4 more)

### Community 16 - "Git Branch Workflow"
Cohesion: 0.21
Nodes (12): Auto-Commit Hook Behavior, Feature Branch Naming Convention, Branch Numbering Strategy (Sequential / Timestamp), Git Extension Configuration (git-config.yml), Git Branching Workflow Extension README, Git Remote URL Detection (GitHub Integration), Graceful Degradation When Git Unavailable, speckit.git.commit Command (+4 more)

### Community 17 - "Bash Feature Scripts"
Cohesion: 0.20
Nodes (3): _extract_highest_number(), get_highest_from_branches(), create-new-feature.sh script

### Community 18 - "Claude Integration Config"
Cohesion: 0.20
Nodes (9): invoke_separator, script, default_integration, installed_integrations, integration, integration_settings, claude, integration_state_schema (+1 more)

### Community 19 - "Speckit Workflow Registry"
Cohesion: 0.20
Nodes (9): schema_version, description, installed_at, name, source, updated_at, version, workflows (+1 more)

### Community 20 - "Component Props and Root"
Cohesion: 0.36
Nodes (7): DirViewProps, PaletteProps, RootComponentProps, RootProps, AppState, DirectoryNode, SearchIndex

### Community 21 - "Feature Branch Creation"
Cohesion: 0.39
Nodes (7): ConvertTo-CleanBranchName(), Get-BranchName(), Get-HighestNumberFromBranches(), Get-HighestNumberFromNames(), Get-HighestNumberFromRemoteRefs(), Get-HighestNumberFromSpecs(), Get-NextBranchNumber()

### Community 22 - "Speckit Init Options"
Cohesion: 0.22
Nodes (8): ai, ai_skills, branch_numbering, context_file, here, integration, script, speckit_version

### Community 23 - "Speckit Task Phases"
Cohesion: 0.22
Nodes (9): Tasks: Rove UI Component (tasks.md), Phase 10: Polish and Cross-Cutting Concerns, Phase 1: Setup - Project Init and Build Config, Phase 4: US1 - Command Palette Mode, Phase 5: US2+4 - Directory View + Window Behavior, Phase 6: US3 - Mode Switching, Phase 7: US5 - Keyboard Shortcuts, src/components/DirView.tsx - Directory View Floating Window (+1 more)

### Community 24 - "Kiro Task List"
Cohesion: 0.25
Nodes (8): Task: Improve Accessibility and Styling (Kiro), Task: Improve Command Palette Functionality (Kiro), DirNav Kiro Tasks / Implementation Plan, Task: Add Comprehensive Error Handling (Kiro), Task: Ensure NPM Compatibility (Kiro), Task: Performance Optimizations (Kiro), Task: Implement Shadow DOM Integration (Kiro), Task: Add Directory Tree Validation (Kiro)

### Community 25 - "Feature Branch Scripts"
Cohesion: 0.46
Nodes (7): ConvertTo-CleanBranchName(), Get-BranchName(), Get-HighestNumberFromBranches(), Get-HighestNumberFromNames(), Get-HighestNumberFromRemoteRefs(), Get-HighestNumberFromSpecs(), Get-NextBranchNumber()

### Community 26 - "Project Plan and CLAUDE.md"
Cohesion: 0.25
Nodes (8): Rove Project CLAUDE.md, Spec Kit Plan Reference (CLAUDE.md), Implementation Plan: Rove UI Component (plan.md), Architecture: Multi-Instance Isolation, Architecture: Palette Search Flow, Source Code Directory Structure, Technical Context: SolidJS/TypeScript/uFuzzy/Vite Stack, Architecture: Virtual Node Load Flow

### Community 27 - "Directory Item Types"
Cohesion: 0.25
Nodes (8): ActionItem Type (type: action), DirectoryItem Discriminated Union, DirectoryNodeItem Type (type: directory), InputItem Type (text/textarea/checkbox/select/select-multiple), Meta Directory (Auto-Injected Reserved Node), VirtualItem Type (async load: DirectoryNode), Phase 9: US7 - Meta Directory and User Settings, src/meta/meta-tree.ts - Auto-Injected Meta DirectoryNode Builder

### Community 28 - "AppState Data Model"
Cohesion: 0.25
Nodes (8): AppState Root SolidJS Store, MetaSettings Type (mode/theme/shortcuts/etc), NavigationState Type (path/currentNode/page/totalPages), OverlayState Discriminated Union (input/loading/error), PaletteState Type (query/results/selectedIndex/overlay), WindowState Type (x/y/width/height), Phase 8: US6 - Node Types and Activation, src/components/ModalSheet.tsx - Input/Virtual Loading Overlay

### Community 29 - "Search Index and Results"
Cohesion: 0.25
Nodes (8): Fuzzy Search Implementation - Relevance Scoring (Kiro), SearchIndex (haystack[] + SearchResult[] parallel arrays), SearchResult Type (item/key/path/score/ranges), Research Decision: uFuzzy for Fuzzy Search, Phase 2: Foundational - Types/State/Storage/Search/Shortcuts, src/search/fuzzy.ts - uFuzzy Wrapper + Flat Index Builder, src/storage/persist.ts - localStorage Adapter, src/types.ts - All Public + Internal TypeScript Types

### Community 30 - "Modal Sheet Component"
Cohesion: 0.33
Nodes (3): InputFormProps, ModalSheetProps, OverlayState

### Community 31 - "Theme and ARIA Research"
Cohesion: 0.33
Nodes (7): Theme System - Light/Dark/System (Kiro), Research: Rove UI Component (research.md), Research Decision: ARIA Roles + Live Region + Focus Management, Research Decision: Two Vite Build Targets (ESM/IIFE), Research Decision: Custom Focus Trap (~25 lines), Research Decision: dot-notation localStorage Key Schema, Research Decision: CSS Custom Properties + prefers-color-scheme

### Community 32 - "Demo App"
Cohesion: 0.33
Nodes (3): nav, nav2, [debugMode, setDebugMode]

### Community 34 - "Keyboard Shortcut Design"
Cohesion: 0.50
Nodes (5): Keyboard Shortcut Global Event System (Kiro), Rationale: Global Event Listeners on Document (Kiro), Architecture: Two-Tier Shortcut Registry, Research Decision: Custom Two-Tier Shortcut Registry, src/shortcuts/registry.ts - Global + Focus-Scoped Shortcut Registry

### Community 35 - "Shadow DOM Integration"
Cohesion: 0.40
Nodes (5): Shadow DOM Integration Strategy (Kiro), Research Decision: Manual Shadow Root + SolidJS render(), Phase 3: US8 - Initialization, Config, Shadow DOM, src/index.ts - Public init() Entry Point, src/components/Root.tsx - Shadow DOM Host + SolidJS Render Mount

### Community 36 - "Claude Settings"
Cohesion: 0.50
Nodes (3): permissions, additionalDirectories, allow

## Knowledge Gaps
- **163 isolated node(s):** `code`, `document`, `paper`, `image`, `video` (+158 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tasks: Rove UI Component (tasks.md)` connect `Speckit Task Phases` to `Kiro Requirements`, `Shadow DOM Integration`, `API Contract`, `Project Plan and CLAUDE.md`, `Directory Item Types`, `AppState Data Model`, `Search Index and Results`, `Theme and ARIA Research`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Feature Specification: Rove UI Component (spec.md)` connect `Kiro Requirements` to `Project Plan and CLAUDE.md`, `Speckit Task Phases`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `Data Model: Rove UI Component (data-model.md)` connect `API Contract` to `Speckit Task Phases`, `Project Plan and CLAUDE.md`, `Directory Item Types`, `AppState Data Model`, `Search Index and Results`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Rove UI Component Feature Specification` (e.g. with `Demo Index HTML (Dual-instance live demo)` and `Feature Specification Template`) actually correct?**
  _`Rove UI Component Feature Specification` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `code`, `document`, `paper` to the rest of the system?**
  _163 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App State and Types` be split into smaller, more focused modules?**
  _Cohesion score 0.06377551020408163 - nodes in this community are weakly interconnected._
- **Should `Package Config` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._