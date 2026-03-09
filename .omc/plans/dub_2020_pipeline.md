# Plan: 2020 강의 한국어 더빙 파이프라인

## 요약

MIT "The Missing Semester" 2020 영어 강의 11개를 한국어로 더빙하는 end-to-end 파이프라인 구축.
모든 작업은 USB 가상환경(`/media/namykim/EXT4`) 내에서만 수행되며,
파이프라인의 각 단계(전사, 번역, TTS, 합성)는 LLM이 자율적으로 오케스트레이션한다.

---

## 현황

| 항목 | 상태 |
|------|------|
| `_2020_kr/*.md` 한국어 번역 (12 파일) | **완료** |
| 비디오 ID (`kr_lec*_2020`) | **플레이스홀더** — 실제 YouTube 영상 없음 |
| WhisperX / TTS / yt-dlp | **미설치** (Python 환경 최소: pip, setuptools만) |
| FFmpeg 7.0.2 (정적 바이너리) | **설치됨** (`/media/namykim/EXT4/bin/ffmpeg`) |
| NVIDIA GPU | **미확인** — `nvidia-smi` 미발견. CPU fallback 필요 |

## 대상 강의 (11개)

| # | 파일 | 원본 YouTube ID | 한국어 제목 |
|---|------|----------------|------------|
| 1 | course-shell.md | Z56Jmr9Z34Q | 쉘(Shell) |
| 2 | shell-tools.md | kgII-YWo3Zw | 쉘 도구들 |
| 3 | editors.md | a6Q8Na575qc | 편집기 |
| 4 | data-wrangling.md | sz_dsktIjt4 | 데이터 정제 |
| 5 | command-line.md | e8BO_dYxk5c | 커맨드 라인 환경 |
| 6 | version-control.md | 2sjqTHE0zok | 버전 관리 |
| 7 | debugging-profiling.md | l812pUnKxME | 디버깅 및 프로파일링 |
| 8 | metaprogramming.md | _Ms1Z4xfqv4 | 메타프로그래밍 |
| 9 | security.md | tjwobAmnKTo | 보안 |
| 10 | potpourri.md | JZDt-PRq0uo | 팟푸리 |
| 11 | qa.md | Wz50FvGG6xU | Q&A |

---

## 수용 기준 (Acceptance Criteria)

1. 11개 강의 각각에 대해 한국어 더빙 MP4 파일이 생성된다.
2. 더빙 오디오의 각 세그먼트 시작 시간은 원본 영어 세그먼트와 ±1초 이내.
3. 기술 용어(grep, vim, git 등)는 영어 원어 유지, 설명은 자연스러운 한국어.
4. 최종 영상은 MP4 (H.264 + AAC), 원본 해상도 유지.
5. 종속성 파일(`requirements.txt`, 설치 스크립트)이 프로젝트 루트에 존재.
6. 전체 파이프라인은 `dubbing/` 디렉토리에 구조화된 스크립트로 존재.

---

## 아키텍처 결정

### TTS 엔진: **edge-tts**
- **선택 이유:** 무료, API 키 불필요, Microsoft Azure Neural 음성, 한국어 고품질 (`ko-KR-SunHiNeural`, `ko-KR-InJoonNeural`), SSML rate 조절 지원
- **대안 탈락:** gTTS (음질 낮음), Coqui TTS (GPU 필수, 무거움), Google Cloud TTS (API 키 필요)

### 전사 엔진: **WhisperX** (faster-whisper 백엔드)
- CPU 모드: `--compute_type int8`, 모델 `base` 또는 `small`
- GPU 있을 경우: `--compute_type float16`, 모델 `large-v3`
- **Fallback:** GPU 없고 CPU 너무 느릴 경우 → YouTube 자동 자막(`yt-dlp --write-auto-sub`) 사용

### 화자 분리 (Diarization): **생략**
- 대부분 단일 화자 강의. Q&A만 다중 화자이나, 별도 처리 불필요 (전체를 단일 화자로 처리).
- pyannote.audio 의존성 및 HuggingFace 토큰 요구사항 제거.

### 오디오 소스 분리: **생략**
- 배경 소음 보존 불필요. 강의 녹화는 깨끗한 실내 오디오.
- TTS 클린 오디오로 전체 교체.

### 번역: **LLM (Claude/Gemini)**
- 이미 `_2020_kr/*.md`에 완성된 한국어 번역 존재.
- WhisperX 전사 → LLM이 문맥 기반 한국어 번역 수행.
- 코드/명령어는 영어 유지, 설명만 번역.

---

## 구현 단계

### Phase 0: 종속성 파일 생성 및 설치

**0.1 — 종속성 파일 생성**
- `dubbing/requirements.txt` — Python 패키지
- `dubbing/install.sh` — 설치 스크립트 (USB 격리)
- `dubbing/README.md` — 파이프라인 사용법

**0.2 — Python 패키지 설치 (USB 격리)**
```bash
source /media/namykim/EXT4/setup_usb_env.sh

# PyTorch CPU (GPU 없는 환경)
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu \
  --cache-dir /media/namykim/EXT4/.pip_cache

# Core dependencies
pip install yt-dlp edge-tts srt pydub soundfile \
  --cache-dir /media/namykim/EXT4/.pip_cache

# WhisperX (--no-deps to prevent PyTorch override)
pip install ctranslate2 faster-whisper \
  --cache-dir /media/namykim/EXT4/.pip_cache
pip install whisperx --no-deps \
  --cache-dir /media/namykim/EXT4/.pip_cache
```

**검증:** `python -c "import whisperx; import edge_tts; print('OK')"`

---

### Phase 1: 원본 영상 다운로드 및 오디오 추출 (LLM 수행)

각 강의에 대해:
```
1. yt-dlp로 원본 영상 다운로드 → dubbing/videos/{lecture_id}.mp4
2. ffmpeg로 오디오 추출 → dubbing/audio/{lecture_id}.wav (16kHz mono)
```

**파일 구조:**
```
dubbing/
├── videos/          # 원본 영상
├── audio/           # 추출된 오디오 (WAV)
├── transcripts/     # WhisperX 전사 결과 (JSON/SRT)
├── translations/    # 한국어 번역 SRT
├── tts_segments/    # TTS 생성 오디오 세그먼트
├── output/          # 최종 더빙 영상
├── requirements.txt
├── install.sh
├── dub_pipeline.py  # 메인 파이프라인 스크립트
└── work_prompt.md   # LLM 작업 프롬프트
```

**검증:** 11개 WAV 파일 존재, 각각 duration > 30분

---

### Phase 2: WhisperX 전사 (LLM 수행)

각 강의 오디오에 대해:
```
1. whisperx {audio}.wav --model base --language en --compute_type int8
2. 출력: word-level timestamps 포함 JSON + SRT
3. dubbing/transcripts/{lecture_id}.json, {lecture_id}.srt
```

**Fallback (CPU 너무 느릴 경우):**
```
yt-dlp --write-auto-sub --sub-lang en --skip-download {url}
→ YouTube 자동 자막을 SRT로 변환
```

**검증:** 각 SRT 파일에 100+ 세그먼트 존재, 타임스탬프 정상

---

### Phase 3: 한국어 번역 (LLM 수행)

LLM이 각 SRT 파일을 처리:
```
1. SRT 세그먼트를 5-10개씩 묶어 번역 컨텍스트 윈도우 구성
2. 번역 규칙:
   - 기술 용어 (grep, vim, git, SSH 등)는 영어 유지
   - 해라체 (해라체) 문체
   - 자연스러운 강의 톤 (딱딱한 번역체 금지)
   - 코드/명령어는 번역하지 않음
3. 출력: dubbing/translations/{lecture_id}_ko.srt
```

**검증:** 원본 SRT와 번역 SRT의 세그먼트 수 일치, 타임스탬프 보존

---

### Phase 4: TTS 음성 합성 (LLM 수행)

각 번역된 SRT 세그먼트에 대해:
```python
import edge_tts

# 각 세그먼트별 TTS 생성
communicate = edge_tts.Communicate(
    text=segment_text,
    voice="ko-KR-SunHiNeural",  # 또는 ko-KR-InJoonNeural (남성)
    rate="+0%"  # 원본 타이밍에 맞게 동적 조절
)
await communicate.save(f"dubbing/tts_segments/{lecture_id}_{seg_id}.mp3")
```

**타이밍 동기화 전략:**
1. 원본 세그먼트 duration 계산 (end_time - start_time)
2. TTS 생성 후 실제 duration 측정
3. TTS가 짧으면: 뒤에 silence padding 추가
4. TTS가 길면: edge-tts rate 파라미터로 속도 증가 (+10%~+30%)
5. 재생성 후에도 길면: 텍스트를 LLM이 축약 → 재생성

**검증:** 각 세그먼트 TTS 파일의 duration이 원본 ±1초 이내

---

### Phase 5: FFmpeg 오디오/비디오 합성 (LLM 수행)

```bash
# 1. 모든 TTS 세그먼트를 연결하여 전체 오디오 트랙 생성
ffmpeg -f concat -safe 0 -i segments_list.txt -c:a aac -b:a 192k full_audio_ko.aac

# 2. 원본 비디오에 한국어 오디오 트랙 교체
ffmpeg -i original_video.mp4 -i full_audio_ko.aac \
  -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 \
  -shortest output/kr_{lecture_id}.mp4
```

**검증:**
- 최종 영상 duration이 원본과 ±2초 이내
- 오디오/비디오 동기화 정상 (첫 1분, 중간, 마지막 1분 spot-check)
- 파일 크기 합리적 (원본과 유사)

---

### Phase 6: YouTube 업로드 및 사이트 통합

1. 11개 더빙 영상을 YouTube에 수동 업로드
2. 실제 YouTube video ID 획득
3. `_2020_kr/*.md` front matter의 `kr_lec*_2020` 플레이스홀더를 실제 ID로 교체
4. Jekyll 빌드 및 embed 검증 (`test_embeds.py`, `test_metadata.py`)

---

## 종속성 명세

### Python 패키지 (`dubbing/requirements.txt`)

```
# Core
yt-dlp>=2024.1.0
edge-tts>=6.1.0
srt>=3.5.0
pydub>=0.25.1
soundfile>=0.12.0

# WhisperX pipeline
torch>=2.0.0
torchaudio>=2.0.0
ctranslate2>=4.0.0
faster-whisper>=1.0.0
whisperx>=3.1.0

# Utilities
numpy>=1.24.0
```

### 시스템 바이너리 (이미 설치됨)

| 바이너리 | 경로 | 용도 |
|---------|------|------|
| FFmpeg 7.0.2 | `/media/namykim/EXT4/bin/ffmpeg` | 오디오/비디오 합성 |
| FFprobe | `/media/namykim/EXT4/bin/ffprobe` | 미디어 정보 조회 |
| Python 3.10 | `ai_env/bin/python` | 파이프라인 실행 |
| Node.js 25.7 | `ai_env/bin/node` | (선택) 보조 스크립트 |

### 디스크 공간 예상

| 항목 | 크기 |
|------|------|
| PyTorch CPU | ~800 MB |
| WhisperX + faster-whisper + ctranslate2 | ~500 MB |
| Whisper 모델 (base) | ~150 MB |
| edge-tts | ~5 MB |
| yt-dlp | ~10 MB |
| 원본 영상 11개 (720p) | ~5-8 GB |
| WAV 오디오 11개 | ~1.5 GB |
| TTS 세그먼트 | ~1 GB |
| 최종 더빙 영상 11개 | ~5-8 GB |
| **합계** | **~15-20 GB** |
| **여유 공간** | ~124 GB (충분) |

---

## 리스크 및 완화

| 리스크 | 확률 | 완화 |
|--------|------|------|
| CPU-only WhisperX가 너무 느림 (1시간 강의당 5-10시간) | 높음 | YouTube 자동자막 fallback (`yt-dlp --write-auto-sub`) |
| edge-tts rate limiting | 중간 | 세그먼트 간 2초 딜레이, exponential backoff |
| TTS와 원본 타이밍 불일치 | 높음 | 동적 rate 조절 + silence padding + LLM 텍스트 축약 |
| PyTorch pip 충돌 (report.md 문서화됨) | 높음 | `--no-deps`로 whisperx 설치, PyTorch 먼저 설치 |
| yt-dlp 다운로드 실패 | 낮음 | `--simulate`로 사전 검증 |
| 번역 품질 (환각) | 중간 | 2-pass: 번역 → LLM 자체 검토 |

---

## Work Prompt (LLM 작업 프롬프트)

`dubbing/work_prompt.md`에 저장될 프롬프트로, LLM이 전체 파이프라인을 자율 수행한다.
Phase 0 설치 완료 후, 이 프롬프트를 Claude Code 또는 Gemini CLI에 입력하면
Phase 1~5를 순차적으로 자율 실행한다.

핵심 원칙:
- **Stepwise:** 각 Phase 완료 후 검증 → 다음 Phase 진행
- **Error-Forward:** 에러 시 USB 환경 변수 재점검 후 자율 복구
- **USB Isolation:** 모든 경로는 `$USB_ROOT` 내부
- **Context Layering:** 환경 제약을 프롬프트 최상단에 앵커링

---

## 파일 생성 목록

| 파일 | 용도 |
|------|------|
| `dubbing/requirements.txt` | Python 종속성 |
| `dubbing/install.sh` | USB 격리 설치 스크립트 |
| `dubbing/work_prompt.md` | LLM 자율 수행 프롬프트 |
| `dubbing/dub_pipeline.py` | 메인 파이프라인 (Phase 1-5 통합) |
| `.omc/plans/dub_2020_pipeline.md` | 본 계획서 |

---

## 검증 계획

| 단계 | 검증 방법 |
|------|----------|
| Phase 0 설치 | `python -c "import whisperx; import edge_tts; import yt_dlp"` |
| Phase 1 다운로드 | 11개 WAV 파일 존재, ffprobe로 duration 확인 |
| Phase 2 전사 | 11개 SRT 파일, 각 100+ 세그먼트 |
| Phase 3 번역 | SRT 세그먼트 수 일치, 코드 미번역 확인 |
| Phase 4 TTS | 세그먼트 duration ±1초 이내 |
| Phase 5 합성 | 최종 MP4 duration ±2초, A/V sync 정상 |
