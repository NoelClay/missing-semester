# Specification: 2020년 강의 한국어 더빙 진행

## Overview
Provide high-quality Korean dubbing for all 11 lectures of the 2020 "Missing Semester" curriculum. The goal is to enhance accessibility and comprehension for Korean-speaking students by offering a natural and engaging audio experience integrated directly into the website via YouTube.

## Functional Requirements
- **Audio Production Pipeline (AI-Driven):**
    - **Transcription:** Use **WhisperX** to accurately transcribe the original English lectures and perform speaker diarization (화자 분리).
    - **Translation & Subtitling:** Contextually process the transcription to create accurate, hallucination-free Korean subtitles. Maintain global standard CS terminology in English, while ensuring the Korean translation is highly intuitive and captures the natural "lecture" feel.
    - **TTS Generation & Synchronization:** Use high-quality TTS for the Korean voiceovers. The generated audio must strictly map to the original timing and pauses of the English speech (e.g., if there is a 3-second speech followed by a 15-second pause, the Korean TTS must replicate this exact timing for natural flow).
- **Content Integration:**
    - Actually upload the generated, dubbed videos to YouTube.
    - Update the front matter of all Korean lecture notes (`_2020_kr/*.md`) with the **real** YouTube video IDs.

## Non-Functional Requirements
- **Audio Quality:** Professional-grade sound without background noise or artifacts.
- **Visual Sync:** Timing must match the original instructor's screen transitions and command entries precisely.
- **Accessibility:** Ensure the dubbing is clear and easy to follow at normal playback speed.

## Acceptance Criteria
- [ ] All 11 lectures from the 2020 curriculum have a corresponding dubbed Korean version processed via WhisperX and context-aware LLM translation.
- [ ] Dubbed videos are hosted on YouTube using real video IDs and linked in the Korean lecture notes.
- [ ] Technical terminology is accurate, un-hallucinated, and consistent with the written Korean translations.
- [ ] Audio-visual synchronization is verified, preserving original pauses and pacing perfectly.

## Out of Scope
- Dubbing for the 2019 or 2026 curricula.
- Creating new visual content or editing the original video footage beyond audio replacement.
