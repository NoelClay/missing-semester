# Implementation Plan: 2020년 강의 한국어 더빙 진행

## Phase 1: Preparation and Tooling [checkpoint: c5f12f1]
- [x] Task: Create a metadata validation script for lecture notes.
    - [ ] Write failing tests to verify that every lecture note in `_2020_kr/` requires a valid YouTube video ID.
    - [x] Implement the validation script to check for existing and new video IDs.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Preparation and Tooling' (Protocol in workflow.md)

## Phase 2: Dubbing and Integration (Batch 1: Lectures 1-5)
- [x] Task: Produce Korean dubbed versions for Lectures 1-5.
    - [x] Record/Generate natural-style voiceovers.
    - [x] Synchronize audio with original video content.
    - [x] Upload to YouTube and obtain video IDs.
- [x] Task: Update lecture notes for Batch 1.
    - [x] Write failing tests to check for missing video IDs in Lectures 1-5 notes.
    - [ ] Update `_2020_kr/*.md` files with new YouTube IDs.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Dubbing and Integration (Batch 1)' (Protocol in workflow.md)

## Phase 3: Dubbing and Integration (Batch 2: Lectures 6-11)
- [ ] Task: Produce Korean dubbed versions for Lectures 6-11.
    - [x] Record/Generate natural-style voiceovers.
    - [x] Synchronize audio with original video content.
    - [x] Upload to YouTube and obtain video IDs.
- [ ] Task: Update lecture notes for Batch 2.
    - [ ] Write failing tests to check for missing video IDs in Lectures 6-11 notes.
    - [ ] Update `_2020_kr/*.md` files with new YouTube IDs.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Dubbing and Integration (Batch 2)' (Protocol in workflow.md)

## Phase 4: Final Verification and Polish
- [ ] Task: Perform a full site build and link check.
    - [ ] Write tests to ensure all `ready: true` lectures in `_2020_kr/` have valid video embeds.
    - [ ] Run `jekyll build` and verify the `_site` output.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Verification and Polish' (Protocol in workflow.md)
