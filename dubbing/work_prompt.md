# Work Prompt: 2020 Missing Semester 한국어 더빙 파이프라인

> 이 프롬프트를 Claude Code 또는 Gemini CLI에 입력하면,
> LLM이 Phase 1~5를 순차적으로 자율 수행한다.

---

## 환경 제약 (Context Anchor — 절대 위반 금지)

```
USB_ROOT=/media/namykim/EXT4
PYTHON=$USB_ROOT/mamba_root/envs/ai_env/bin/python
FFMPEG=$USB_ROOT/bin/ffmpeg
FFPROBE=$USB_ROOT/bin/ffprobe
PROJECT=$USB_ROOT/workspace/missingsemester
DUBBING=$PROJECT/dubbing

모든 bash 명령 실행 전: source $USB_ROOT/setup_usb_env.sh
sudo 금지. /usr, /etc, /opt, ~ 접근 금지.
모든 파일 I/O는 $USB_ROOT 내부에서만 수행.
```

---

## 역할 (Role)

당신은 **다국어 미디어 엔지니어 겸 번역 전문가**이다.
MIT "The Missing Semester" 2020 영어 강의 11개를 한국어로 더빙하는 end-to-end 파이프라인을 자율 실행한다.

---

## 대상 강의

| Lec# | slug | YouTube ID | 한국어 제목 |
|------|------|-----------|------------|
| 1 | course-shell | Z56Jmr9Z34Q | 쉘(Shell) |
| 2 | shell-tools | kgII-YWo3Zw | 쉘 도구들 |
| 3 | editors | a6Q8Na575qc | 편집기 |
| 4 | data-wrangling | sz_dsktIjt4 | 데이터 정제 |
| 5 | command-line | e8BO_dYxk5c | 커맨드 라인 환경 |
| 6 | version-control | 2sjqTHE0zok | 버전 관리 |
| 7 | debugging-profiling | l812pUnKxME | 디버깅 및 프로파일링 |
| 8 | metaprogramming | _Ms1Z4xfqv4 | 메타프로그래밍 |
| 9 | security | tjwobAmnKTo | 보안 |
| 10 | potpourri | JZDt-PRq0uo | 팟푸리 |
| 11 | qa | Wz50FvGG6xU | Q&A |

---

## 실행 절차 (Stepwise — 각 Phase 완료 후 검증)

### Phase 1: 원본 영상 다운로드 및 오디오 추출

각 강의에 대해 순차 실행:

```bash
source /media/namykim/EXT4/setup_usb_env.sh

# 1. 영상 다운로드 (720p, mp4)
yt-dlp -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]" \
  --merge-output-format mp4 \
  -o "$DUBBING/videos/%(id)s.mp4" \
  "https://www.youtube.com/watch?v={YOUTUBE_ID}"

# 2. 오디오 추출 (16kHz mono WAV)
$FFMPEG -i "$DUBBING/videos/{YOUTUBE_ID}.mp4" \
  -vn -acodec pcm_s16le -ar 16000 -ac 1 \
  "$DUBBING/audio/{slug}.wav"
```

**검증:**
- `ls -la $DUBBING/audio/` → 11개 .wav 파일
- 각 파일: `ffprobe -i {file} -show_entries format=duration` → 30분 이상

---

### Phase 2: WhisperX 전사

```python
import whisperx

device = "cuda" if torch.cuda.is_available() else "cpu"
compute_type = "float16" if device == "cuda" else "int8"
model_size = "large-v3" if device == "cuda" else "base"

model = whisperx.load_model(model_size, device, compute_type=compute_type)

for slug in lectures:
    audio = whisperx.load_audio(f"dubbing/audio/{slug}.wav")
    result = model.transcribe(audio, language="en")

    # Word-level alignment
    align_model, metadata = whisperx.load_align_model(language_code="en", device=device)
    result = whisperx.align(result["segments"], align_model, metadata, audio, device)

    # Save as SRT
    save_as_srt(result, f"dubbing/transcripts/{slug}.srt")
    # Save as JSON (full data)
    save_as_json(result, f"dubbing/transcripts/{slug}.json")
```

**Fallback (CPU 10분 테스트 후 1시간 이상 예상 시):**
```bash
# YouTube 자동자막 사용
yt-dlp --write-auto-sub --sub-lang en --sub-format srt \
  --skip-download -o "$DUBBING/transcripts/{slug}" \
  "https://www.youtube.com/watch?v={YOUTUBE_ID}"
```

**검증:**
- 11개 SRT 파일 존재
- 각 SRT: 100개 이상 세그먼트
- 샘플 확인: 첫 5개 세그먼트의 텍스트가 영어이고 의미 있는 내용

---

### Phase 3: 한국어 번역 (LLM 자율 수행)

각 SRT 파일을 읽고, 세그먼트를 5-10개씩 묶어 번역한다.

**번역 규칙:**
1. **해라체** 문체 사용 (예: "~이다", "~한다", "~이라 하자")
2. **기술 용어 영어 유지:** grep, vim, git, SSH, pipe, shell, bash, sudo, root, process, thread, stack, heap, buffer, cache, daemon, kernel, syscall, socket, port, regex, glob, stdin, stdout, stderr 등
3. **코드/명령어 절대 번역 금지:** 백틱(`) 내부, 코드 블록 내용은 원문 유지
4. **자연스러운 강의 톤:** 번역체가 아닌, 한국 대학 강의에서 교수가 직접 말하는 느낌
5. **문맥 보존:** 앞뒤 세그먼트의 내용을 참고하여 대명사, 지시어 해소

**출력 형식:**
원본 SRT와 동일한 세그먼트 번호 및 타임스탬프, 텍스트만 한국어로 교체.

```
1
00:00:01,000 --> 00:00:05,500
자, 이 강의에서는 shell에 대해 이야기해 보겠다.

2
00:00:05,500 --> 00:00:10,200
shell이란 컴퓨터와 텍스트 기반으로 상호작용하는 방법이다.
```

**검증:**
- 원본과 번역 SRT의 세그먼트 수 일치
- 타임스탬프 100% 보존 (diff로 확인)
- 코드/명령어 미번역 확인 (grep으로 백틱 내용 비교)

---

### Phase 4: TTS 음성 합성 (edge-tts)

```python
import edge_tts
import asyncio
import srt
from pydub import AudioSegment

VOICE = "ko-KR-SunHiNeural"  # 여성 (또는 ko-KR-InJoonNeural 남성)

async def generate_tts_for_lecture(slug: str):
    with open(f"dubbing/translations/{slug}_ko.srt") as f:
        subs = list(srt.parse(f.read()))

    for i, sub in enumerate(subs):
        # 원본 세그먼트 duration (ms)
        target_duration_ms = (sub.end - sub.start).total_seconds() * 1000

        # TTS 생성
        rate = "+0%"
        output_path = f"dubbing/tts_segments/{slug}_{i:04d}.mp3"
        communicate = edge_tts.Communicate(sub.content, VOICE, rate=rate)
        await communicate.save(output_path)

        # Duration 비교 및 조정
        tts_audio = AudioSegment.from_mp3(output_path)
        actual_duration_ms = len(tts_audio)

        if actual_duration_ms > target_duration_ms * 1.1:
            # TTS가 10% 이상 길면 → 속도 증가하여 재생성
            speed_ratio = actual_duration_ms / target_duration_ms
            rate_pct = min(int((speed_ratio - 1) * 100), 30)
            rate = f"+{rate_pct}%"
            communicate = edge_tts.Communicate(sub.content, VOICE, rate=rate)
            await communicate.save(output_path)

        elif actual_duration_ms < target_duration_ms * 0.9:
            # TTS가 10% 이상 짧으면 → silence padding 추가
            silence_ms = int(target_duration_ms - actual_duration_ms)
            padded = tts_audio + AudioSegment.silent(duration=silence_ms)
            padded.export(output_path, format="mp3")

        # Rate limiting protection
        await asyncio.sleep(0.5)

asyncio.run(generate_tts_for_lecture("course-shell"))
```

**검증:**
- 각 강의별 TTS 세그먼트 파일 수 == SRT 세그먼트 수
- 랜덤 5개 세그먼트의 duration이 원본 ±1초

---

### Phase 5: FFmpeg 최종 합성

```python
import subprocess
import srt
from pydub import AudioSegment

def assemble_dubbed_video(slug: str, youtube_id: str):
    # 1. SRT 타임스탬프에 맞춰 전체 오디오 트랙 조립
    with open(f"dubbing/translations/{slug}_ko.srt") as f:
        subs = list(srt.parse(f.read()))

    # 전체 영상 duration 구하기
    probe = subprocess.run(
        [FFPROBE, "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", f"dubbing/videos/{youtube_id}.mp4"],
        capture_output=True, text=True
    )
    total_duration_ms = int(float(probe.stdout.strip()) * 1000)

    # 빈 오디오 트랙 (전체 길이)
    full_audio = AudioSegment.silent(duration=total_duration_ms)

    # 각 세그먼트를 정확한 타임스탬프 위치에 overlay
    for i, sub in enumerate(subs):
        seg_path = f"dubbing/tts_segments/{slug}_{i:04d}.mp3"
        seg_audio = AudioSegment.from_mp3(seg_path)
        start_ms = int(sub.start.total_seconds() * 1000)
        full_audio = full_audio.overlay(seg_audio, position=start_ms)

    # WAV로 내보내기
    ko_audio_path = f"dubbing/output/{slug}_ko_audio.wav"
    full_audio.export(ko_audio_path, format="wav")

    # 2. FFmpeg로 비디오 + 한국어 오디오 합성
    output_path = f"dubbing/output/kr_{slug}.mp4"
    subprocess.run([
        FFMPEG, "-y",
        "-i", f"dubbing/videos/{youtube_id}.mp4",
        "-i", ko_audio_path,
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-map", "0:v:0", "-map", "1:a:0",
        "-shortest",
        output_path
    ], check=True)

    print(f"Done: {output_path}")

# 전체 강의 처리
lectures = [
    ("course-shell", "Z56Jmr9Z34Q"),
    ("shell-tools", "kgII-YWo3Zw"),
    ("editors", "a6Q8Na575qc"),
    # ... 나머지
]
for slug, ytid in lectures:
    assemble_dubbed_video(slug, ytid)
```

**검증:**
- `dubbing/output/` 에 11개 `kr_*.mp4` 파일 존재
- 각 파일: ffprobe duration이 원본과 ±2초
- 랜덤 3개 영상의 첫 1분 재생하여 A/V sync 확인
- 파일 크기가 원본과 유사 (±50%)

---

## 오류 복구 프로토콜 (Error-Forward)

오류 발생 시 다음 순서로 자율 복구:
1. `source /media/namykim/EXT4/setup_usb_env.sh` 재실행
2. `LD_LIBRARY_PATH` 확인 (USB lib 포함 여부)
3. 디스크 공간 확인: `df -h /media/namykim/EXT4`
4. WhisperX CUDA OOM → `--compute_type int8`, `--batch_size 4` 축소
5. edge-tts 429 Too Many Requests → 5초 대기 후 재시도 (max 3회)
6. FFmpeg 코덱 에러 → `-c:v libx264` 로 재인코딩
7. 3회 재시도 후에도 실패 → 해당 강의 건너뛰고 다음 진행, 실패 로그 기록

---

## 완료 조건

- [ ] `dubbing/output/` 에 11개 `kr_*.mp4` 파일
- [ ] 각 영상 duration이 원본 ±2초
- [ ] 한국어 음성이 정상 재생됨
- [ ] 기술 용어가 영어로 유지됨
- [ ] 모든 작업이 USB 내부에서만 수행됨
