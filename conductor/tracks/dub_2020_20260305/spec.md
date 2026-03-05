# Specification: 2020년 강의 한국어 더빙 진행

## Overview
Provide high-quality Korean dubbing for all 11 lectures of the 2020 "Missing Semester" curriculum. The goal is to enhance accessibility and comprehension for Korean-speaking students by offering a natural and engaging audio experience integrated directly into the website via YouTube.

## Functional Requirements
- **Audio Production:**
    - Generate/Record Korean voiceovers for all 11 lectures.
    - Use a "Natural Voice" style that is conversational and engaging, adhering to product guidelines.
    - Ensure perfect synchronization between the audio and the visual demonstrations in the videos.
- **Content Integration:**
    - Upload the dubbed videos to a dedicated YouTube channel.
    - Update the front matter of all Korean lecture notes (`_2020_kr/*.md`) with the new YouTube video IDs.
- **Terminology:**
    - Maintain English technical terms while providing intuitive Korean explanations in the audio.

## Non-Functional Requirements
- **Audio Quality:** Professional-grade sound without background noise or artifacts.
- **Visual Sync:** Timing must match the original instructor's screen transitions and command entries.
- **Accessibility:** Ensure the dubbing is clear and easy to follow at normal playback speed.

## Acceptance Criteria
- [ ] All 11 lectures from the 2020 curriculum have a corresponding dubbed Korean version.
- [ ] Dubbed videos are hosted on YouTube and correctly linked in the Korean lecture notes.
- [ ] Technical terminology is accurate and consistent with the written Korean translations.
- [ ] Audio-visual synchronization is verified for every lecture.

## Out of Scope
- Dubbing for the 2019 or 2026 curricula.
- Creating new visual content or editing the original video footage beyond audio replacement.
