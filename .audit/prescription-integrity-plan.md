# Prescription integrity

- [x] Read the Principles section of the poteto-mode skill.
- [x] Phase A: Frame
- [x] Phase B: Design the workflow
- [x] Phase C: Run the loop
- [x] Phase D: Keep the audit trail
- [x] Phase E: Verify and hand back

Done means the imported prescription remains visible and survives replacement, completion, storage reload and Markdown export, while completed sets keep their original exercise and missing actual values remain missing.

1. Ground against latest remote release and reproduce losses in production helpers.
2. Preserve pending prescriptions during replacement and retain completed exercise items.
3. Display and edit planned tempo independently of actual tempo.
4. Verify import, manual plan updates, persistence, completed history and exports with production functions and browser UI.
5. Run all tests and build, review the diff, then commit and push a SemVer release.

Throughput checkpoint. Three independent slices are import and bulk-plan checks, replacement, and tempo UI. Each ends with focused verification before whole-product tests. No performance claim is part of this work.

The existing three-stage tempo object remains canonical. Optional plan and history fields preserve old JSON and localStorage records without a destructive migration.

Design alternatives. Per-set exercise ownership would require every history and calculation consumer to change. Splitting the exercise item retains existing consumers and preserves completed sets exactly, so the split design is selected.
