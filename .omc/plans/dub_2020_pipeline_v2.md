# Plan v2: 2020 강의 한국어 더빙 파이프라인 (Deep Revised)

> v1에서의 문제: edge-tts의 단조로운 톤, 블록 단위 번역의 맥락 끊김, 화자 분리 미적용, 감정 표현 부재.
> v2 핵심 변경: 화자 분리 기반 LLM 번역 파이프라인 + 감정 제어 가능한 TTS 엔진으로 전면 교체.

---

## 1. 왜 이 작업이 어려운가

더빙은 단순한 "텍스트 → 음성" 변환이 아니다. 고품질 강의 더빙은 5개 레이어의 정합성을 요구한다:

```
Layer 1: 화자 인식 — 누가 말하고 있는가? (강사 vs 학생)
Layer 2: 맥락 번역 — 이전/이후 문장을 참고한 자연스러운 번역
Layer 3: 감정 추론 — 이 문장의 톤은? (설명, 강조, 질문, 유머, 전환)
Layer 4: 프로소디 매핑 — 감정을 TTS 파라미터로 변환 (속도, 피치, 볼륨, 포즈)
Layer 5: 타이밍 동기화 — 원본 영상의 시각적 전환과 더빙 오디오 정합
```

---

## 2. 아키텍처: LLM-Orchestrated Expressive Dubbing Pipeline

```
원본 영상 (YouTube)
      │
      ▼
[yt-dlp] → MP4 + WAV (16kHz)
      │
      ▼
[WhisperX + Diarization] → 화자별 타임스탬프 JSON
      │                       ├── SPEAKER_00 (강사)
      │                       └── SPEAKER_01 (학생)
      │
      ▼
[LLM Pass 1: 전체 맥락 번역] ← 전체 transcript를 한번에 입력
      │   - 블록 단위가 아닌 sliding window (30-50 세그먼트)
      │   - 기술 용어 영어 유지, 해라체
      │   - 화자별 어투 분리 (강사: 강의체, 학생: 질문체)
      │
      ▼
[LLM Pass 2: 감정/프로소디 태깅]
      │   - 각 세그먼트에 감정 라벨 부여:
      │     explain(설명), emphasize(강조), question(질문),
      │     transition(전환), humor(유머), warning(주의)
      │   - TTS 파라미터 매핑:
      │     rate, pitch, pause_before, pause_after
      │
      ▼
[Expressive TTS] ← Gemini 2.5 Flash TTS (primary)
      │              또는 gpt-4o-mini-tts (alternative)
      │   - 감정 라벨 → TTS 프롬프트/instructions 변환
      │   - 강사 음성: Kore (firm) 또는 Charon (informative)
      │   - 학생 음성: Puck (upbeat) 또는 Fenrir (excitable)
      │
      ▼
[타이밍 동기화 엔진]
      │   - TTS duration vs 원본 duration 비교
      │   - 짧으면: silence padding
      │   - 길면: rate 증가 → 재생성 → 그래도 길면 LLM 축약 → 재생성
      │
      ▼
[FFmpeg Assembly]
      │   - 비디오 스트림 복사 (re-encode 없음)
      │   - 한국어 오디오 트랙 교체
      │
      ▼
최종 더빙 MP4
```

---

## 3. TTS 엔진 결정

### 선택: **Gemini 2.5 Flash TTS** (Primary) + **gpt-4o-mini-tts** (Fallback)

#### 왜 Gemini 2.5 Flash TTS인가

| 요소 | edge-tts | Gemini 2.5 Flash TTS |
|------|----------|---------------------|
| 감정 제어 | SSML pitch/rate만 (express-as 차단) | **자연어 프롬프트로 무제한** |
| 한국어 품질 | 일정하고 현학적 | 자연스럽고 대화적 |
| 멀티스피커 | 수동 음성 전환 | **MultiSpeakerVoiceConfig 내장** |
| 강의 톤 조절 | 불가 | "마치 대학 강의처럼 설명해줘" 가능 |
| 비용 | 무료 | **~$4-6 (11편 전체)** |
| 설치 | pip install edge-tts | pip install google-genai |

#### 감정 제어 방식 비교

**edge-tts (한계):**
```xml
<!-- 이게 전부 — 감정 태그 차단됨 -->
<prosody rate="slow" pitch="+10%">이 개념이 핵심이다.</prosody>
```

**Gemini 2.5 Flash TTS (자연어 제어):**
```python
# LLM이 생성한 감정 라벨에 따라 프롬프트 동적 구성
prompt = f"""
[다음 문장을 {emotion_label}한 톤으로 읽어줘.
 마치 한국 대학 CS 강의에서 교수가 학생들에게 직접 설명하는 것처럼.
 속도는 {rate_hint}, 강조 단어에서 잠깐 멈춤.]

{korean_text}
"""
```

**gpt-4o-mini-tts (Fallback):**
```python
response = client.audio.speech.create(
    model="gpt-4o-mini-tts",
    voice="nova",
    input=korean_text,
    instructions=f"Speak as a Korean university professor giving a CS lecture. "
                 f"Tone: {emotion_label}. Speed: {rate_hint}. "
                 f"Pause briefly before emphasizing key concepts."
)
```

#### 음성 할당

| 화자 | Gemini Voice | 특성 | 용도 |
|------|-------------|------|------|
| 강사 (SPEAKER_00) | **Kore** | Firm, 권위 있는 | 메인 강의 설명 |
| 강사 (대안) | **Charon** | Informative, 차분한 | 개념 설명 중심 강의 |
| 학생 (SPEAKER_01) | **Puck** | Upbeat, 밝은 | 질문/답변 |

---

## 4. LLM 번역 파이프라인 상세

### 문제: 블록 단위 번역의 맥락 끊김

```
[원본 SRT 세그먼트 37] "And this is where it gets interesting."
[원본 SRT 세그먼트 38] "Because you can actually pipe the output"
[원본 SRT 세그먼트 39] "of one command into another."
```

블록 단위 번역 시:
```
37: "그리고 여기서 흥미로워진다."      ← 뭐가?
38: "왜냐하면 실제로 출력을 파이프할 수 있기 때문이다." ← 어색
39: "한 명령의 출력을 다른 명령으로."    ← 문장 아님
```

### 해법: Sliding Window 맥락 번역

```python
# LLM에게 전체 맥락과 함께 번역 요청
def translate_with_context(segments, window_start, window_size=30):
    # 현재 윈도우 전후 5개 세그먼트를 참고 맥락으로 포함
    context_before = segments[max(0, window_start-5):window_start]
    current_window = segments[window_start:window_start+window_size]
    context_after = segments[window_start+window_size:window_start+window_size+5]

    prompt = f"""
당신은 MIT CS 강의의 한국어 더빙 스크립트 작성자이다.

## 번역 규칙
1. 해라체 문체 (이다, 한다, 하자)
2. 기술 용어는 영어 유지: shell, pipe, grep, vim, git, SSH, daemon, kernel 등
3. 코드/명령어(백틱 내부)는 절대 번역하지 않는다
4. 이전 맥락과 이후 맥락을 참고하여 자연스러운 흐름 유지
5. 자막 블록이 문장 중간에서 끊겨도, 각 블록의 한국어가 자연스럽게 이어지도록
6. 강사와 학생의 어투를 구분:
   - 강사: "~이다", "~한다", "~살펴보자"
   - 학생: "~인가요?", "~하면 되나요?"

## 이전 맥락 (참고용, 번역 불필요):
{format_segments(context_before)}

## 번역 대상 (각 세그먼트의 한국어 번역을 제공하라):
{format_segments_with_speaker(current_window)}

## 이후 맥락 (참고용, 번역 불필요):
{format_segments(context_after)}

## 출력 형식
각 세그먼트 번호와 한국어 번역을 JSON으로:
[{{"id": 37, "ko": "그리고 여기서부터가 재밌는 부분이다."}}, ...]
"""
    return llm_call(prompt)
```

올바른 결과:
```
37: "그리고 여기서부터가 재밌는 부분이다."
38: "한 명령의 출력을 다른 명령의 입력으로 연결할 수 있기 때문이다."
39: "이것을 pipe라고 한다."
```

---

### LLM Pass 2: 감정/프로소디 태깅

```python
def tag_prosody(translated_segments, original_segments):
    prompt = f"""
당신은 한국어 강의 더빙의 프로소디 디렉터이다.
아래 번역된 강의 스크립트의 각 세그먼트에 감정과 음성 파라미터를 태깅하라.

## 감정 라벨 (하나 선택)
- explain: 차분한 설명 (기본)
- emphasize: 핵심 개념 강조 ("이게 중요하다")
- question: 수사적 질문 또는 학생 질문
- transition: 주제 전환 ("자, 이제 다음으로 넘어가자")
- humor: 가벼운 유머, 웃음
- warning: 주의/경고 ("이렇게 하면 안 된다")
- demo: 실시간 시연 설명 ("지금 터미널에서 보면...")
- summary: 요약/정리 ("정리하자면...")

## 음성 파라미터
- rate: slow / normal / fast
- pitch: low / normal / high
- pause_before: 0~2000ms (주제 전환 시 긴 포즈)
- pause_after: 0~1000ms (강조 후 짧은 포즈)
- volume: soft / normal / loud

## 입력 (번역된 세그먼트):
{format_translated(translated_segments)}

## 원본 영어 (참고 — 원래 강사의 톤 파악용):
{format_original(original_segments)}

## 출력 형식 (JSON):
[{{
  "id": 37,
  "emotion": "transition",
  "rate": "normal",
  "pitch": "high",
  "pause_before": 500,
  "pause_after": 200,
  "volume": "normal",
  "tts_prompt_hint": "흥미진진하게, 새로운 개념을 소개하는 톤으로"
}}, ...]
"""
    return llm_call(prompt)
```

---

## 5. WhisperX + 화자 분리 상세

### 왜 화자 분리가 필수인가

Missing Semester 강의에는 학생 질문이 빈번하다:
- 강의 중간 질문 ("그러면 이런 경우에는?")
- Q&A 강의 (Lecture 11) — 전체가 질의응답
- 일부 강의에서 공동 강사 (Jon/Anish)

화자를 분리하지 않으면:
- 학생 질문을 강사 톤으로 더빙 → **극도로 부자연스러움**
- 공동 강사를 같은 음성으로 → 누가 말하는지 구분 불가

### 구현

```python
import whisperx

device = "cpu"
compute_type = "int8"
model_size = "base"  # CPU 환경

# Step 1: 전사
model = whisperx.load_model(model_size, device, compute_type=compute_type)
audio = whisperx.load_audio(audio_path)
result = model.transcribe(audio, language="en")

# Step 2: 단어 정렬
align_model, metadata = whisperx.load_align_model(language_code="en", device=device)
result = whisperx.align(result["segments"], align_model, metadata, audio, device)

# Step 3: 화자 분리 (pyannote 대신 간이 방식)
# 주의: pyannote.audio는 HuggingFace 토큰 필요.
# 대안: WhisperX의 내장 diarization 또는 LLM 기반 화자 추론

# Option A: WhisperX diarize (pyannote 필요)
diarize_model = whisperx.DiarizationPipeline(device=device)
diarize_segments = diarize_model(audio_path)
result = whisperx.assign_word_speakers(diarize_segments, result)

# Option B: LLM 기반 화자 추론 (pyannote 불필요)
# WhisperX 전사 후, LLM이 텍스트 내용 기반으로 화자 추론
# "질문형 문장 + 짧은 세그먼트 = 학생"
# "설명형 문장 + 긴 세그먼트 = 강사"
```

### LLM 기반 화자 추론 (pyannote 대안)

pyannote.audio가 HuggingFace 토큰과 모델 동의를 요구하므로,
LLM을 활용한 텍스트 기반 화자 추론도 유효한 대안:

```python
def infer_speakers_via_llm(segments):
    prompt = f"""
다음은 MIT CS 강의의 영어 전사 세그먼트이다.
각 세그먼트의 화자를 추론하라.

규칙:
- "instructor": 대부분의 설명, 시연, 명령 타이핑
- "student": 짧은 질문, "like...", "so...", 확인 질문
- "instructor" 비율이 90% 이상일 것

{format_segments_for_speaker_detection(segments)}

출력: [{{"id": 1, "speaker": "instructor"}}, ...]
"""
    return llm_call(prompt)
```

---

## 6. TTS 생성: 감정 제어 구현

### Gemini 2.5 Flash TTS 호출

```python
from google import genai
from google.genai import types
import base64

client = genai.Client()  # GEMINI_API_KEY 환경변수에서 자동 로드

# 감정 라벨 → TTS 프롬프트 매핑
EMOTION_PROMPTS = {
    "explain": "차분하고 명확하게, 대학 교수가 학생에게 친절히 설명하는 톤으로",
    "emphasize": "열정적으로 강조하면서, 핵심 단어에서 잠깐 멈추고, 약간 느리게",
    "question": "호기심 어린 톤으로, 끝을 올리며, 청자의 생각을 유도하듯",
    "transition": "밝고 경쾌하게, '자 다음으로' 느낌으로, 약간 빠르게",
    "humor": "가볍고 유쾌하게, 미소 띤 목소리로",
    "warning": "진지하고 단호하게, 천천히, 주의를 환기하는 톤으로",
    "demo": "차분하지만 집중된 톤으로, 화면을 같이 보고 있는 느낌으로",
    "summary": "정리하는 톤으로, 차분하고 약간 느리게, 마무리 느낌"
}

# 화자별 음성 설정
SPEAKER_VOICES = {
    "instructor": "Kore",    # Firm, 권위 있는
    "student": "Puck"        # Upbeat, 밝은
}

async def generate_segment_audio(segment, emotion_data):
    emotion = emotion_data["emotion"]
    speaker = segment["speaker"]
    text = segment["ko_text"]

    # 프로소디 힌트와 텍스트 결합
    tts_input = f"""[{EMOTION_PROMPTS[emotion]}]

{text}"""

    voice_name = SPEAKER_VOICES.get(speaker, "Kore")

    response = client.models.generate_content(
        model="gemini-2.5-flash-preview-tts",
        contents=tts_input,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice_name
                    )
                )
            )
        )
    )

    # 오디오 데이터 저장
    audio_data = response.candidates[0].content.parts[0].inline_data.data
    output_path = f"dubbing/tts_segments/{segment['slug']}_{segment['id']:04d}.wav"
    with open(output_path, "wb") as f:
        f.write(audio_data)

    return output_path
```

---

## 7. 타이밍 동기화 엔진

```python
from pydub import AudioSegment
import subprocess

def sync_segment_timing(tts_path, target_start_ms, target_end_ms, segment, emotion_data):
    """TTS 오디오를 원본 타이밍에 맞게 조정"""
    target_duration_ms = target_end_ms - target_start_ms
    tts_audio = AudioSegment.from_wav(tts_path)
    actual_duration_ms = len(tts_audio)

    tolerance = 0.15  # 15% 허용 오차

    if actual_duration_ms > target_duration_ms * (1 + tolerance):
        # Case 1: TTS가 너무 길다
        overshoot_ratio = actual_duration_ms / target_duration_ms

        if overshoot_ratio < 1.3:
            # 1.3배 이내 → FFmpeg atempo로 속도 조절
            tempo = overshoot_ratio
            adjusted_path = tts_path.replace(".wav", "_adjusted.wav")
            subprocess.run([
                FFMPEG, "-y", "-i", tts_path,
                "-filter:a", f"atempo={tempo}",
                adjusted_path
            ], check=True)
            return adjusted_path

        else:
            # 1.3배 초과 → LLM에게 텍스트 축약 요청 후 TTS 재생성
            shortened_text = llm_shorten(segment["ko_text"], target_ratio=0.8)
            return regenerate_tts(shortened_text, emotion_data, tts_path)

    elif actual_duration_ms < target_duration_ms * (1 - tolerance):
        # Case 2: TTS가 너무 짧다 → silence padding
        silence_ms = int(target_duration_ms - actual_duration_ms)
        # 무음을 앞뒤로 분배 (pause_before / pause_after 비율에 따라)
        pause_before = emotion_data.get("pause_before", 0)
        pause_after = emotion_data.get("pause_after", 0)
        total_pause = pause_before + pause_after
        if total_pause > 0:
            front_pad = int(silence_ms * pause_before / total_pause)
            back_pad = silence_ms - front_pad
        else:
            front_pad = silence_ms // 3
            back_pad = silence_ms - front_pad

        padded = (AudioSegment.silent(duration=front_pad) +
                  tts_audio +
                  AudioSegment.silent(duration=back_pad))
        padded_path = tts_path.replace(".wav", "_padded.wav")
        padded.export(padded_path, format="wav")
        return padded_path

    else:
        # Case 3: 허용 범위 내 → 그대로 사용
        return tts_path
```

---

## 8. 전체 파이프라인 실행 흐름

```
강의 1개당 실행 시간 추정 (50분 강의 기준):

Phase 1: 다운로드 + 오디오 추출          ~5분
Phase 2: WhisperX 전사 (CPU int8 base)   ~30-60분 (또는 YouTube 자막 ~1분)
Phase 3: LLM Pass 1 - 맥락 번역          ~10분 (Gemini/Claude API)
Phase 4: LLM Pass 2 - 감정 태깅          ~5분
Phase 5: TTS 생성 (Gemini Flash)          ~15분 (API 호출 + rate limit 대기)
Phase 6: 타이밍 동기화                    ~5분
Phase 7: FFmpeg 합성                      ~3분
Phase 8: 품질 검증                        ~2분

총: 약 75-100분/강의 (WhisperX CPU) 또는 45-60분/강의 (YouTube 자막 fallback)
11개 강의 전체: ~8-18시간
```

---

## 9. 비용 추정

### Gemini 2.5 Flash TTS

| 항목 | 예상 값 |
|------|---------|
| 강의당 한국어 텍스트 | ~8,000-12,000 자 |
| 11개 강의 총 텍스트 | ~100,000 자 (~25K tokens) |
| 입력 비용 | $0.50/1M tokens × 25K = **~$0.013** |
| 오디오 출력 비용 | $10/1M tokens × ~500K audio tokens = **~$5.00** |
| **총 TTS 비용** | **~$5-7** |

### LLM 번역/태깅 (Gemini 2.5 Flash)

| 항목 | 예상 값 |
|------|---------|
| 번역 Pass 1 | ~$0.50 |
| 감정 태깅 Pass 2 | ~$0.20 |
| 텍스트 축약/재시도 | ~$0.30 |
| **총 LLM 비용** | **~$1.00** |

### **전체 비용: ~$6-8 (11개 강의)**

---

## 10. 종속성 추가 (v2 변경사항)

### 추가 필요 패키지

```
# requirements_v2.txt에 추가
google-genai>=1.0.0          # Gemini 2.5 Flash TTS API
openai>=1.0.0                # gpt-4o-mini-tts (fallback)
# pyannote.audio는 선택 — LLM 기반 화자 추론으로 대체 가능
```

### 환경변수 필요

```bash
# .env 파일에 추가 (USB 내부)
GEMINI_API_KEY=your_key_here     # Gemini TTS용
OPENAI_API_KEY=your_key_here     # Fallback TTS용 (선택)
```

---

## 11. 리스크 및 완화 (v2 업데이트)

| 리스크 | 확률 | 완화 |
|--------|------|------|
| Gemini TTS 한국어 품질이 기대 이하 | 중간 | 1개 세그먼트 샘플 테스트 후 결정. Fallback: gpt-4o-mini-tts |
| Gemini TTS preview API 변경/중단 | 낮음 | gpt-4o-mini-tts로 즉시 전환 가능 (동일 아키텍처) |
| LLM 감정 태깅 품질 | 중간 | 원본 영어 오디오의 에너지/피치 분석으로 교차 검증 |
| WhisperX CPU 너무 느림 | 높음 | YouTube 자동자막 fallback + LLM 후처리 |
| 화자 분리 정확도 | 중간 | pyannote 사용 불가 시 LLM 텍스트 기반 추론 |
| TTS rate limiting | 중간 | 세그먼트 간 1초 딜레이, exponential backoff |
| 번역 품질 (환각) | 중간 | 2-pass: 번역 → 별도 LLM 검토 pass |

---

## 12. 수용 기준 (v2 강화)

1. [ ] 11개 강의 각각에 대해 한국어 더빙 MP4 생성
2. [ ] 화자 분리: 강사와 학생이 **다른 음성**으로 더빙됨
3. [ ] 감정 표현: 강조/질문/전환/유머 등 톤 변화가 **청취 가능**
4. [ ] 번역 맥락: 연속된 세그먼트를 들었을 때 **자연스러운 흐름**
5. [ ] 기술 용어: shell, pipe, git 등 영어 원어 유지 (**grep 테스트**)
6. [ ] 타이밍: 각 세그먼트 ±1초, 전체 영상 ±3초
7. [ ] 각 강의의 첫 2분을 재생하여 **A/V sync + 몰입도** 주관 평가
8. [ ] 전체 비용 $10 이하

---

## 13. v1 → v2 변경 로그

| 항목 | v1 | v2 |
|------|----|----|
| TTS 엔진 | edge-tts (무료, 단조로움) | **Gemini 2.5 Flash TTS** (감정 제어, ~$5) |
| 번역 방식 | 5-10 세그먼트 묶음 | **30-50 세그먼트 sliding window** |
| 감정 제어 | 없음 | **LLM Pass 2로 8가지 감정 태깅** |
| 화자 분리 | 생략 | **WhisperX diarization 또는 LLM 추론** |
| 화자별 음성 | 단일 음성 | **강사: Kore, 학생: Puck** |
| 타이밍 동기화 | silence padding만 | **FFmpeg atempo + LLM 축약 + padding** |
| 번역 검증 | 없음 | **LLM 교차 검증 pass** |
| 비용 | $0 | **~$6-8** |
| 몰입도 | 낮음 (현학적) | **높음 (대화형 강의 느낌)** |
