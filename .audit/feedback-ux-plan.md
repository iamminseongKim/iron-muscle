# Feedback UX

- [x] 1. `how` over the affected subsystem.
- [x] 2. `architect` for parallel design exploration.
- [x] 3. Write the throughput checkpoint as four todo items.
  - Blocking first steps. Check latest tags and releases and inspect current warmup feedback.
  - Independent workstreams. One owner changes set feedback and tempo controls. Root handles exercise notes, translations and whole-product verification.
  - Shared mutable state. Existing WorkoutSet and Tempo stay authoritative. Historical typed feedback remains stored. File ownership separates writes.
  - Smallest safe decomposition. One component owner keeps target display and tempo edits consistent.
- [x] 4. Delegate code-writing to a subagent using your configured feature model.
- [x] 5. Verify on the matching surface.
- [x] 6. Rebase into small, ordered commits. Stack follow-ups.
- [x] 7. If the design is contested, `interrogate` before shipping. skip: no contested design.
- [x] 8. Run **Opening a PR**. skip: project instructions authorize direct verified commit/tag push.

Data shape. Keep plannedTempo, tempo and tempoSource. UI controls edit the existing Tempo object. New discomfort is free-form comment or exercise notes. Existing painFeedback and assistedReps are displayed read-only and preserved.

Alternatives. Sliders reduce taps for broad changes but require drag precision for exact seconds. Presets plus 0.5-second steppers support exact changes without the keyboard. Choose presets and steppers, retaining the prescription as the default.

Done. Warmup feedback opens with actual RPE and notes visible. No structured pain or assisted-rep input remains. Tempo can be changed with taps while keeping planned tempo. RPE and tempo targets have distinct colored labels in the dialog and workout rows. Legacy feedback survives edits and export. Mobile layout and persistence pass actual browser checks.
