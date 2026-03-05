# Implementation Plan: 2020년 강의 한국어 더빙 진행

## Phase 1: Preparation and Tooling [checkpoint: c5f12f1]
- [x] Task: Create a metadata validation script for lecture notes.
    - [x] Write failing tests to verify that every lecture note in `_2020_kr/` requires a valid YouTube video ID.
    - [x] Implement the validation script to check for existing and new video IDs.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Preparation and Tooling' (Protocol in workflow.md)

## Phase 2: AI Pipeline Dubbing (Batch 1: Lectures 1-5)
- [ ] Task: Audio Transcription & Subtitling for Lectures 1-5.
    - [ ] Run WhisperX to generate highly accurate transcription and speaker diarization.
    - [ ] Process transcription via LLM to translate contextually, retaining global CS terms and ensuring natural Korean lecture phrasing without hallucinations.
- [ ] Task: TTS Generation & Audio Syncing for Lectures 1-5.
    - [ ] Generate Korean TTS audio matched exactly to the original timing (preserving natural pauses and flow).
    - [ ] Merge new audio track with the original video.
- [ ] Task: YouTube Upload for Batch 1.
    - [ ] Upload the finished dubbed videos to YouTube.
    - [ ] Retrieve the actual YouTube video IDs.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: AI Pipeline Dubbing (Batch 1)' (Protocol in workflow.md)

## Phase 3: AI Pipeline Dubbing (Batch 2: Lectures 6-11)
- [ ] Task: Audio Transcription & Subtitling for Lectures 6-11.
    - [ ] Run WhisperX to generate highly accurate transcription and speaker diarization.
    - [ ] Process transcription via LLM to translate contextually, retaining global CS terms and ensuring natural Korean lecture phrasing without hallucinations.
- [ ] Task: TTS Generation & Audio Syncing for Lectures 6-11.
    - [ ] Generate Korean TTS audio matched exactly to the original timing (preserving natural pauses and flow).
    - [ ] Merge new audio track with the original video.
- [ ] Task: YouTube Upload for Batch 2.
    - [ ] Upload the finished dubbed videos to YouTube.
    - [ ] Retrieve the actual YouTube video IDs.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: AI Pipeline Dubbing (Batch 2)' (Protocol in workflow.md)

## Phase 4: Final Site Integration and Polish
- [ ] Task: Update lecture notes with Real YouTube IDs.
    - [ ] Modify `_2020_kr/*.md` files with the actual new YouTube IDs generated from Phases 2 and 3.
- [ ] Task: Perform a full site build and link check.
    - [ ] Run `jekyll build` and verify the `_site` output.
    - [ ] Test the embed validations with the newly populated real IDs.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Site Integration and Polish' (Protocol in workflow.md)

## Phase: Review Fixes
- [x] Task: Apply review suggestions 8ca5cee
