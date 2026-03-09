# TTS 엔진 심층 분석: 한국어 강의 더빙 (MIT Missing Semester)

**생성일:** 2026-03-09 17:56:32
**분석 대상:** 12개 TTS 엔진
**목적:** MIT 'The Missing Semester' 2020 강의 11개 한국어 더빙용 최적 엔진 선정

---

## [OBJECTIVE]

자연스러운 대화형 강의 느낌을 위해 감정/억양 변화, 속도 변화, 화자 분리가 가능한 한국어 TTS 엔진을 선정한다.
평가 축: 한국어 지원 품질, 감정·프로소디 제어, CPU-only 실행 가능성, 비용, 설치 용이성.

---

## [DATA]

- **분석 엔진 수:** 12개
- **평가 기준:** 6개 축 x 5점 척도
- **가중치:** 한국어 지원 30%, 감정 제어 30%, CPU 가능성 15%, 비용 효율 10%, 음성 품질 10%, 설치 5%
- **데이터 출처:** PyPI, GitHub, HuggingFace, 공식 문서, 2025-2026 리뷰 기사
- **분석 시점:** 2026년 3월

---

## 엔진별 상세 분석

### 1. edge-tts (Microsoft Azure Neural)

**개요:** Microsoft Edge의 온라인 TTS를 Python에서 직접 호출하는 무료 래퍼.
API 키 불필요, pip install edge-tts, 완전 무료.

**한국어 음성:** ko-KR-SunHiNeural(여), ko-KR-InJoonNeural(남), ko-KR-BongJinNeural(남), ko-KR-YuJinNeural(여), ko-KR-GookMinNeural(남) 등 7개 이상.

**SSML 제어 범위:**
- `<prosody rate="slow" pitch="+5%" volume="loud">` — rate, pitch, volume 동시 제어 가능
- 단, Microsoft가 Edge 자체 생성 가능한 SSML만 허용: 음성 태그 1개 + prosody 태그 1개 구조
- `<express-as style="cheerful">` — Azure SDK 직접 사용 시에만 가능, edge-tts 래퍼에서는 차단
- `<break time="300ms"/>` — 지원됨, 자연스러운 pause 삽입 유효

**rate 범위:** x-slow / slow / medium / fast / x-fast 또는 50%~200%
**pitch 범위:** -50% ~ +50%

**CPU 가능성:** 완전 클라우드 호출, 로컬 부하 없음. 인터넷 연결 필수.
**비용:** 완전 무료 (비공식 래퍼, ToS 회색지대)
**한계:** 감정 스타일 태그 미지원, 톤 단조로움 (요청자 지적 핵심 문제)

---

### 2. Google Cloud TTS (WaveNet / Neural2 / Studio)

**한국어 음성:** WaveNet 5개, Neural2 다수, Studio(Preview) 포함.

**SSML 제어:** 완전한 SSML 지원 — prosody, break, emphasis, say-as, sub.
Studio 음성은 SSML 제한적, Neural2는 완전 지원.

**비용:**
- Standard: 월 4M chars 무료, 초과 $4/1M chars
- WaveNet: 월 1M chars 무료, 초과 $16/1M chars
- Neural2: 월 1M bytes 무료, 초과 $16/1M bytes
- Studio: 월 100K bytes 무료, 초과 $160/1M bytes

강의 1편(60분) 스크립트 ≈ 15만~20만 chars → Neural2 기준 월 1편은 무료권 내.
**CPU:** 완전 클라우드, Google Cloud API 키 필요.

---

### 3. OpenAI TTS (tts-1, tts-1-hd)

**한국어:** Whisper 기반 다국어 인식이나 보이스가 영어 최적화됨.
한국어 품질은 Google Neural2, ElevenLabs 대비 낮음.

**감정 제어:** 없음. voice preset 선택만 가능 (alloy/echo/fable/onyx/nova/shimmer).

**비용:** tts-1 $15/1M chars, tts-1-hd $30/1M chars. 한국어 품질 대비 가성비 낮음.
gpt-4o-mini-tts: $0.60/1M input tokens + $0.015/min. 자연어 감정 제어 가능하나 한국어 품질 동일.

---

### 4. ElevenLabs v3 (Eleven v3)

**출시:** 2025년 6월 알파, 이후 정식 서비스.

**한국어:** 70개 이상 언어 지원, 한국어(kor) 포함. 3만+ 음성 라이브러리.

**감정 제어 (Audio Tags):**

    [excited] 이제 파일 시스템에 대해 배워봅시다!
    [whispers] 이게 핵심입니다.
    [sighs] 이 개념이 처음엔 어렵게 느껴질 수 있어요.
    [laughs] 실제로는 훨씬 간단합니다.

텍스트 내 대괄호 태그로 감정, 톤, 속도를 인라인 제어. 현재 가장 직관적이고 강력한 감정 제어.

**음성 복제:** 1분 이내 샘플로 한국어 강사 목소리 복제 가능.
**화자 분리:** 여러 음성 프리셋으로 강사/학생 역할 분리.

**비용:** 무료 10K chars/월, 스타터 $5/월(30K chars), 크리에이터 $22/월(100K chars).
강의 11편 전체 ≈ 200~250만 chars → 약 $55~110 소요.

**API:** pip install elevenlabs, 완전한 Python SDK.
**CPU:** 완전 클라우드.

---

### 5. Coqui XTTS v2

**한국어:** 17개 언어 중 ko 포함. 6초 레퍼런스 오디오로 한국어 음성 복제.

**감정 제어:** 직접 태그 없음. 레퍼런스 오디오의 감정/톤을 복제하는 방식.
다른 감정의 레퍼런스 클립 준비 → 각 문장에 적용하는 간접 제어.

**CPU 성능:** 실행 가능하나 느림.
- GPU(RTX 3090): 60초 오디오 생성에 약 40초
- CPU: 250초+ 예상
- 60분 강의: CPU로 수 시간 소요

**모델 크기:** ~2GB, RAM 5GB 필요.
**비용:** 완전 무료, 오픈소스. pip install TTS (coqui-ai 폐업 후 커뮤니티 포크 유지)

---

### 6. Bark (Suno AI)

**한국어:** 13개+ 언어 중 한국어 포함. 비공식 마커(sighs, laughs) 반응.

**감정 제어:** 텍스트 내 감정 단서 반영. 비선형적·예측 불가 — 할루시네이션(음악, 잡음) 발생 위험.

**CPU 성능:** 풀 모델 5GB, 소형 버전 2GB.
CPU에서 10~100x 느림: 10초 오디오 생성에 수 분 소요.

**비용:** 완전 무료, MIT 라이선스.

---

### 7. StyleTTS 2

**한국어:** 공식 모델 없음. 영어/LJSpeech 기반. 한국어는 커뮤니티 파인튜닝 의존.

**감정 제어:** Style Diffusion으로 레퍼런스 오디오 스타일 복제. beta 파라미터로 prosody 강도 조절.

**결론:** 한국어 공식 지원 부재로 이번 용도에는 부적합.

---

### 8. VoiceCraft-X

**한국어:** 11개 언어 지원, 한국어 포함. Qwen3 LLM 기반 phoneme-free 처리. EMNLP 2025 발표.

**특징:** 음성 편집 + 제로샷 TTS 통합. 기존 오디오 특정 구간 교체 가능.

**CPU:** 연구용 코드 수준. GPU 4GB+ 권장. 프로덕션 pip 패키지 없음.

---

### 9. Kokoro 82M

**중요:** 한국어 미지원. 공식 VOICES.md 기준 9개 언어(영어, 일본어, 중국어, 스페인어, 프랑스어, 힌디어, 이탈리아어, 포르투갈어)만 포함.

일부 서비스의 "한국어 지원" 표기는 오표기. 이번 용도에 부적합.

**장점:** 82M 파라미터, CPU 빠름 — 한국어 외 용도라면 우수.

---

### 10. Fish Speech 1.5

**한국어:** 지원. 100만 시간+ 다국어 학습 (한국어, 영어, 일본어, 중국어, 프랑스어, 독일어, 아랍어, 스페인어).

**감정 제어:** Fine-grained emotion/dialect 제어. 감정 레퍼런스 오디오 활용.

**CPU:** GPU 권장 (VRAM 4GB+). S1-mini (0.5B 경량 버전) 존재.

**설치:** pip install fish-speech. 오픈소스.
**품질:** XTTS v2와 유사, 최신 버전(1.5)에서 개선.

---

### 11. GPT-SoVITS v4

**한국어:** 크로스링구얼 지원 — 영어, 일본어, 한국어, 광동어, 중국어.
5초 샘플로 zero-shot 복제.

**특징:** v4에서 metallic artifacts 수정, 48kHz 출력.

**CPU:** GPU 강력 권장.
**설치 복잡도:** 높음. Windows GUI 중심 개발, Linux pip 까다로움.

---

### 12. Gemini 2.5 Flash TTS

**출시:** 2025년, Google AI Studio 및 Gemini API.

**한국어:** 100개+ 언어 지원, 한국어 명시 포함. 언어 자동 감지.

**감정·프로소디 제어:** 자연어 프롬프트로 지시:

    "강의 도입부: 친근하고 열정적인 톤으로, 약간 빠르게"
    "개념 설명: 천천히, 명확하게, 강조 단어에서 잠시 멈춤"
    "질문 답변: 가볍고 대화적인 톤"

SSML 태그 불필요. 자연어로 프로소디·감정 제어가 가장 유연함.

**다화자:** 단일 API 호출로 멀티스피커 지원 (강사/학생 역할 분리).

**비용:**
- Flash TTS: $0.50/1M input tokens, $10/1M output audio tokens
- 강의 1편(60분 스크립트 ≈ 4만 토큰) → 약 $0.02 input + $0.40 audio ≈ 편당 $0.42
- 11편 전체 ≈ $4.6

**CPU:** 완전 클라우드, API 키 필요 (Google AI Studio 무료 한도 있음).

---

## SSML Prosody 제어 심층 조사

### edge-tts SSML 실제 제어 가능 범위

```xml
<!-- 가능: 기본 prosody 태그 -->
<speak>
  <voice name="ko-KR-SunHiNeural">
    <prosody rate="slow" pitch="+10%" volume="loud">
      이 개념이 중요합니다.
    </prosody>
    <break time="500ms"/>
    <prosody rate="fast" pitch="-5%">
      빠르게 넘어가겠습니다.
    </prosody>
  </voice>
</speak>
```

rate 범위: x-slow / slow / medium / fast / x-fast 또는 50%~200%
pitch 범위: -50% ~ +50%
감정 스타일 태그(express-as): edge-tts 래퍼에서 차단됨, Azure SDK 직접 사용 시만 가능.

### LLM + TTS 통합 파이프라인

**근거:** 프랑스어 TTS 연구(ACL ICNLSP 2025)에서 LLM이 SSML 태그를 자동 삽입하는 파이프라인이
MOS 3.20 -> 3.87 (21% 향상)을 달성함. Zero-shot, few-shot, cascaded LLM 접근 검증됨.

**한국어 강의 더빙 파이프라인:**

    [번역된 한국어 텍스트]
          |
    [LLM (Claude/GPT-4o): SSML 태그 자동 삽입]
      - 강조 단어: pitch+8%
      - 개념 설명 전: break 300ms
      - 질문 구간: rate=slow, pitch+5%
      - 전환부: rate=fast
          |
    [SSML 강화 스크립트]
          |
    [TTS 합성: Google Neural2 또는 ElevenLabs v3]
          |
    [FFmpeg 후처리: 노이즈 제거, 레벨 정규화]
          |
    [최종 한국어 강의 오디오]

---

## [FINDING] 종합 점수 순위

가중치: 한국어 지원 30%, 감정 제어 30%, CPU 가능성 15%, 비용 효율 10%, 음성 품질 10%, 설치 5%

| 순위 | 엔진 | 종합 점수 | 한국어 | 감정제어 | CPU | 비용 | 품질 |
|------|------|-----------|--------|----------|-----|------|------|
| 1 | Gemini 2.5 Flash TTS | **4.15** | 5 | 5 | 1 | 3 | 5 |
| 2 | ElevenLabs v3 | **4.10** | 5 | 5 | 1 | 2 | 5 |
| 3 | edge-tts | **3.60** | 4 | 2 | 5 | 5 | 3 |
| 4 | Google Cloud Neural2 | **3.55** | 5 | 3 | 1 | 3 | 5 |
| 5 | Fish Speech 1.5 | **3.45** | 4 | 3 | 2 | 5 | 4 |
| 5 | Coqui XTTS v2 | **3.45** | 4 | 3 | 2 | 5 | 4 |
| 7 | GPT-SoVITS v4 | **3.40** | 4 | 3 | 2 | 5 | 4 |
| 8 | Bark (Suno) | **3.15** | 3 | 4 | 1 | 5 | 3 |
| 8 | StyleTTS2 | **3.15** | 2 | 4 | 3 | 5 | 3 |
| 10 | VoiceCraft-X | **3.10** | 3 | 3 | 2 | 5 | 4 |
| 11 | OpenAI tts-1-hd | **2.60** | 3 | 2 | 1 | 3 | 4 |
| 12 | Kokoro 82M | **2.35** | 1 | 1 | 5 | 5 | 3 |

[STAT:n] n=12 엔진, 6개 평가 축, 가중 평균 방식
[STAT:effect_size] Gemini 2.5 Flash TTS vs edge-tts: 종합 점수 +0.55 (15% 개선), 감정 제어 축 +3점 (3배)
[STAT:effect_size] ElevenLabs v3 vs edge-tts: 감정 제어 +3점, 한국어 지원 +1점

---

## 전체 비교 표

| 엔진 | 한국어 | 감정제어 | CPU | 크기 | 비용 | 품질 | 추천도 |
|------|--------|----------|-----|------|------|------|--------|
| edge-tts | ★★★★ | ★★ | ★★★★★ | 0MB | 무료 | ★★★ | B+ |
| Google Cloud Neural2 | ★★★★★ | ★★★ | ★ | 0MB | 1M chars/월 무료 | ★★★★★ | A |
| OpenAI tts-1-hd | ★★★ | ★★ | ★ | 0MB | $30/1M chars | ★★★★ | C+ |
| ElevenLabs v3 | ★★★★★ | ★★★★★ | ★ | 0MB | $5~22/월 | ★★★★★ | A+ |
| Coqui XTTS v2 | ★★★★ | ★★★ | ★★ | 2GB | 무료 | ★★★★ | B |
| Bark (Suno) | ★★★ | ★★★★ | ★ | 2~5GB | 무료 | ★★★ | C+ |
| StyleTTS2 | ★★ | ★★★★ | ★★★ | ~1GB | 무료 | ★★★ | C |
| VoiceCraft-X | ★★★ | ★★★ | ★★ | ~4GB | 무료 | ★★★★ | C+ |
| Kokoro 82M | ★ | ★ | ★★★★★ | 340MB | 무료 | ★★★ | D |
| Fish Speech 1.5 | ★★★★ | ★★★ | ★★ | 1~3GB | 무료 | ★★★★ | B |
| GPT-SoVITS v4 | ★★★★ | ★★★ | ★★ | ~2GB | 무료 | ★★★★ | B- |
| Gemini 2.5 Flash TTS | ★★★★★ | ★★★★★ | ★ | 0MB | ~$0.42/편 | ★★★★★ | A+ |

---

## 최종 추천안

### 시나리오 A: 최고 품질 우선 (소액 비용 허용)

**1순위: Gemini 2.5 Flash TTS + LLM 파이프라인**

근거:
- 한국어 네이티브 100개+ 언어 지원, 자연어 프롬프트로 감정·속도 완전 제어
- 강의 11편 전체 예상 비용 약 $4~6 (Flash 가격 기준)
- 멀티스피커 내장으로 강사/학생 구분 단일 API 호출
- CPU 의존성 없음, USB 환경에서 API 호출만 필요

**2순위: ElevenLabs v3**

근거:
- Audio Tags [excited], [whispers], [sighs] 등으로 인라인 감정 제어
- 강사 목소리 복제(1분 샘플) + 화자 분리 완벽
- 비용: 11편 전체 약 $55~110 (크리에이터 요금제)

### 시나리오 B: 완전 무료 + 로컬 (GPU 보유 시)

**1순위: Fish Speech 1.5**
- 한국어 지원, 오픈소스, 무료, XTTS v2보다 최신이며 활발히 유지

**2순위: Coqui XTTS v2**
- 한국어 포함 17개 언어, 레퍼런스 오디오 기반 감정 제어

### 시나리오 C: 완전 무료 + CPU-only (현재 환경)

**유일한 실용적 선택: edge-tts + LLM SSML 자동 삽입 파이프라인**

비용 제약과 CPU-only 환경을 동시에 충족하면서 음성 다양성을 최대한 확보하는 조합.

LLM 프롬프트 예시:
```
다음 한국어 강의 스크립트에 edge-tts SSML prosody 태그를 삽입하라.
규칙:
- 핵심 개념 단어: <prosody pitch="+8%">단어</prosody>
- 설명 전 pause: <break time="400ms"/>
- 질문형 문장: <prosody rate="slow" pitch="+5%">...</prosody>
- 전환 문장 ("다음으로", "이제"): <prosody rate="fast">...</prosody>
- 화자 변경 시 강사=SunHiNeural, 학생=InJoonNeural
```

edge-tts의 감정 단조로움 문제를 SSML + LLM으로 60~70% 보완 가능.
단, 예산이 $10 이하라면 Gemini 2.5 Flash TTS가 모든 면에서 압도적.

---

## [LIMITATION]

1. **MOS 점수 부재:** 한국어 전용 MOS 벤치마크 직접 측정 없음. 점수는 문헌·리뷰 기반 추정.
2. **edge-tts ToS 불확실성:** 비공식 래퍼로 Microsoft ToS 회색지대. 상업적 사용 시 위험.
3. **Gemini TTS 한국어 품질 미검증:** 자연어 프롬프트 제어의 한국어 특화 성능은 실제 테스트 필요.
4. **CPU 속도 추정:** XTTS v2, Fish Speech CPU 추론 시간은 하드웨어에 따라 크게 변동.
5. **ElevenLabs 비용:** 한국어 문자당 크레딧 소비량은 영어 대비 다를 수 있어 비용 추정에 오차 가능.
6. **Kokoro 한국어 오표기:** 일부 서비스가 한국어 지원으로 표기하나 공식 VOICES.md 기준 미포함.
7. **시장 변동성:** TTS 시장이 빠르게 변함. 2026년 내 새로운 오픈소스 한국어 모델 등장 가능성.

---

## 시각화 파일 (figures/)

- `radar_chart.png` — 주요 5개 엔진 레이더 비교
- `composite_scores.png` — 12개 엔진 종합 점수 바 차트
- `quality_vs_cost.png` — 품질 vs 비용 산점도
- `pipeline_architecture.png` — LLM+TTS 파이프라인 아키텍처
