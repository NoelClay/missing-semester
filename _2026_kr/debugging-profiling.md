---
layout: lecture
title: "디버깅과 프로파일링"
description: >
  로깅과 디버거를 사용하여 프로그램을 디버그하는 방법, 그리고 성능을 위해 코드를 프로파일하는 방법을 배웁니다.
thumbnail: /static/assets/thumbnails/2026/lec4.png
date: 2026-01-15
ready: true
panopto: "https://mit.hosted.panopto.com/Panopto/Pages/Viewer.aspx?id=a72c48e3-5eb2-46fa-aa03-b3b700e1ca8d"
video:
  aspect: 56.25
  id: 8VYT9TcUmKs
---

프로그래밍의 황금 법칙은 코드가 당신이 기대하는 것을 하지 않고, 당신이 그것을 하도록 말한 것을 한다는 것입니다. 그 격차를 좁히는 것은 때때로 상당히 어려운 업적이 될 수 있습니다. 이 강의에서, 우리는 버그가 있는 코드와 자원을 많이 먹는 코드를 다루기 위한 유용한 기법들을 다룰 것입니다: 디버깅과 프로파일링.

# 디버깅

## Printf 디버깅과 로깅

> "가장 효과적인 디버깅 도구는 여전히 신중한 생각이며, 신중하게 배치된 프린트 문들과 결합됩니다" — Brian Kernighan, _Unix for Beginners_.

프로그램을 디버그하는 첫 번째 접근 방식은 당신이 문제를 감지한 곳 주변에 프린트 문들을 추가하고, 문제의 원인을 이해하기에 충분한 정보를 추출할 때까지 반복하는 것입니다.

두 번째 접근 방식은 애드 혹 프린트 문들 대신 당신의 프로그램에서 로깅을 사용하는 것입니다. 로깅은 본질적으로 "더 신중한 프린팅"이며, 보통 다음과 같은 것들에 대한 내장 지원을 포함하는 로깅 프레임워크를 통해 수행됩니다:

- 로그들(또는 로그들의 부분집합)을 다른 출력 위치들로 지향할 수 있는 능력;
- 심각도 수준들(INFO, DEBUG, WARN, ERROR 등과 같은)을 설정하고 그에 따라 출력을 필터링할 수 있도록 허용; 그리고
- 그 다음에 더 쉽게 추출될 수 있는 로그 항목들과 관련된 데이터의 구조화된 로깅에 대한 지원.

당신은 또한 보통 프로그래밍하는 동안 로깅 문들을 선제적으로 넣을 것이므로, 당신이 디버그하는 데 필요한 데이터가 이미 있을 수 있습니다! 그리고 실제로, 당신이 프린트 문들을 사용하여 문제를 찾고 수정한 후, 그들을 제거하기 전에 그들을 적절한 로그 문들로 변환하는 것이 종종 가치가 있습니다. 이러한 방식으로, 유사한 버그들이 미래에 발생하면, 당신은 이미 코드를 수정하지 않고 당신이 필요한 진단 정보를 이미 가지고 있을 것입니다.

> **타사 로그들**: 많은 프로그램들이 `-v` 또는 `--verbose` 플래그를 지원하여 실행할 때 더 많은 정보를 인쇄합니다. 이것이 주어진 명령이 왜 실패하는지 발견하는 데 유용할 수 있습니다. 일부는 심지어 더 자세한 정보를 위해 플래그를 반복하도록 허용합니다. 서비스들(데이터베이스, 웹 서버 등)의 문제들을 디버그할 때, 그들의 로그들을 확인하세요 — 종종 Linux에서 `/var/log/`에. `journalctl -u <service>`를 사용하여 systemd 서비스에 대한 로그들을 봅니다. 타사 라이브러리들의 경우, 그들이 환경 변수들이나 구성을 통해 디버그 로깅을 지원하는지 확인하세요.

## 디버거

프린트 디버깅은 당신이 무엇을 프린트할지 알고 코드를 쉽게 수정하고 다시 실행할 수 있을 때 잘 작동합니다. 디버거는 당신이 어떤 정보가 필요한지 확실하지 않을 때, 버그가 재현하기 어려운 조건에서만 나타날 때, 또는 프로그램을 수정하고 다시 시작하는 것이 비싼 경우(긴 시작 시간, 재현하기 복잡한 상태 등)에 가치가 있습니다.

디버거는 프로그램의 실행과 상호 작용할 수 있게 하는 프로그램입니다. 당신이 할 수 있는 것들:

- 특정 라인에 도달할 때 실행을 멈춥니다.
- 한 번에 한 명령어씩 진행합니다.
- 충돌 후 변수들의 값을 검사합니다.
- 주어진 조건이 만족될 때 조건부로 실행을 멈춥니다.
- 그리고 많은 더 고급 기능들.

대부분의 프로그래밍 언어는 어떤 형태의 디버거를 지원합니다(또는 함께 제공됩니다). 가장 다재다능한 것은 [`gdb`](https://www.gnu.org/software/gdb/)(GNU Debugger) 및 [`lldb`](https://lldb.llvm.org/)(LLVM Debugger) 같은 **일반 목적 디버거**입니다. 이들은 어떤 네이티브 바이너리를 디버그할 수 있습니다. 많은 언어들은 또한 런타임과 더 긴밀하게 통합되는 **언어별 디버거**를 가지고 있습니다(Python의 pdb나 Java의 jdb 같은).

`gdb`는 C, C++, Rust, 그리고 다른 컴파일된 언어들에 대한 사실상의 표준 디버거입니다. 이것은 거의 모든 프로세스를 조사하고, 그것의 현재 머신 상태를 얻을 수 있게 합니다: 레지스터, 스택, 프로그램 카운터, 그리고 더 많은 것.

일부 유용한 GDB 명령들:

- `run` - 프로그램을 시작합니다
- `b {function}` 또는 `b {file}:{line}` - 브레이크포인트를 설정합니다
- `c` - 실행을 계속합니다
- `step` / `next` / `finish` - 진입 / 건너뛰기 / 종료
- `p {variable}` - 변수의 값을 인쇄합니다
- `bt` - 역추적(호출 스택)을 표시합니다
- `watch {expression}` - 값이 변할 때 멈춥니다

> GDB의 TUI 모드(`gdb -tui` 또는 GDB 내에서 `Ctrl-x a`)를 고려하세요. 소스 코드를 명령 프롬프트와 함께 표시하는 분할 화면 보기를 위해.

### 레코드-재생 디버깅

가장 답답한 버그들 중 일부는 _Heisenbug_입니다: 당신이 그들을 관찰하려고 할 때 사라지거나 행동을 변경하는 것처럼 보이는 버그들. 경쟁 조건, 타이밍 종속 버그, 그리고 특정 시스템 조건 아래에서만 나타나는 문제들이 이 범주에 해당합니다. 전통적인 디버깅은 종종 여기서 쓸모가 없습니다. 왜냐하면 프로그램을 다시 실행하면 다른 동작을 생성하기 때문입니다(예: 프린트 문들이 코드를 충분히 느리게 하여 경쟁이 더 이상 일어나지 않을 수도 있습니다).

**레코드-재생 디버깅**은 프로그램의 실행을 기록하고, 당신이 필요로 하는 만큼 많은 횟수로 결정론적으로 그것을 재생할 수 있도록 하여 이것을 해결합니다. 더욱이, 당신은 실행을 _역방향_으로 진행할 수 있으며, 정확히 어디서 무언가가 잘못되었는지 찾을 수 있습니다.

[rr](https://rr-project.org/)은 프로그램 실행을 기록하고, 전체 디버깅 기능과 함께 결정론적 재생을 허용하는 Linux를 위한 강력한 도구입니다. 이것은 GDB와 함께 작동하므로, 당신은 이미 인터페이스를 알고 있습니다.

기본 사용:

```bash
# Record a program execution
rr record ./my_program

# Replay the recording (opens GDB)
rr replay
```

매직은 재생 중에 일어납니다. 실행이 결정론적이므로, 당신은 **역 디버깅** 명령들을 사용할 수 있습니다:

- `reverse-continue` (`rc`) - 브레이크포인트에 도달할 때까지 역방향으로 실행
- `reverse-step` (`rs`) - 한 라인 뒤로 진행
- `reverse-next` (`rn`) - 뒤로 진행, 함수 호출 건너뛰기
- `reverse-finish` - 현재 함수로 진입할 때까지 뒤로 실행

이것은 디버깅에 정말로 강력합니다. 당신이 충돌이 있다고 합시다 — 버그가 어디에 있는지 추측하고 브레이크포인트를 설정하는 대신, 당신은 할 수 있습니다:

1. 충돌로 실행
2. 손상된 상태를 검사합니다
3. 손상된 변수에 watchpoint를 설정합니다
4. `reverse-continue`를 사용하여 그것이 정확히 어디서 손상되었는지 찾습니다

**rr을 사용할 때:**
- 간헐적으로 실패하는 플레이키 테스트
- 경쟁 조건과 스레딩 버그
- 재현하기 어려운 충돌
- 당신이 "시간을 되돌릴" 수 있길 원하는 모든 버그

> 주의: rr은 Linux에서만 작동하며, 하드웨어 성능 카운터가 필요합니다. 그것은 이들 카운터를 노출하지 않는 VM들(대부분의 AWS EC2 인스턴스들 같은)에서 작동하지 않으며, 그것은 GPU 접근을 지원하지 않습니다. macOS의 경우, [Warpspeed](https://warpspeed.dev/)를 확인하세요.

> **rr과 동시성**: rr이 실행을 결정론적으로 기록하기 때문에, 그것은 스레드 스케줄링을 직렬화합니다. 이것은 일부 경쟁 조건이 특정 타이밍에 달려 있다면 rr 아래에서 나타나지 않을 수도 있습니다. rr은 여전히 경쟁을 디버그하는 데 유용합니다 — 한 번 실패 실행을 캡처하면, 당신은 그것을 안정적으로 재생할 수 있습니다 — 하지만 당신은 간헐적 버그를 잡기 위해 여러 기록 시도가 필요할 수 있습니다. 동시성을 포함하지 않는 버그의 경우, rr이 가장 빛납니다: 당신은 항상 정확한 실행을 재현할 수 있고, 역 디버깅을 사용하여 손상을 사냥할 수 있습니다.

## 시스템 호출 추적

때때로, 당신은 당신의 프로그램이 운영 체제와 어떻게 상호 작용하는지 이해해야 합니다. 프로그램들은 [시스템 호출](https://en.wikipedia.org/wiki/System_call)을 만들어 커널로부터 서비스를 요청합니다 — 파일 열기, 메모리 할당, 프로세스 생성, 그리고 더 많은 것. 이들 호출을 추적하면 프로그램이 왜 중단되는지, 어떤 파일을 접근하려고 하는지, 또는 어디에서 대기하는 데 시간을 보내고 있는지를 나타낼 수 있습니다.

### strace(Linux) 및 dtruss(macOS)

[`strace`](https://www.man7.org/linux/man-pages/man1/strace.1.html)는 당신이 프로그램이 만드는 모든 시스템 호출을 관찰할 수 있게 합니다:

```bash
# Trace all system calls
strace ./my_program

# Trace only file-related calls
strace -e trace=file ./my_program

# Follow child processes (important for programs that start other programs)
strace -f ./my_program

# Trace a running process
strace -p <PID>

# Show timing information
strace -T ./my_program
```

> macOS 및 BSD에서, 유사한 기능을 위해 [`dtruss`](https://www.manpagez.com/man/1/dtruss/)(which wraps `dtrace`)를 사용하세요:

> `strace`에 더 깊은 탐구를 위해, Julia Evans의 우수한 [strace zine](https://jvns.ca/strace-zine-unfolded.pdf)을 확인하세요.

### bpftrace 및 eBPF

[eBPF](https://ebpf.io/)(extended Berkeley Packet Filter)는 커널에서 샌드박스된 프로그램을 실행할 수 있게 하는 강력한 Linux 기술입니다. [`bpftrace`](https://github.com/iovisor/bpftrace)는 eBPF 프로그램을 작성하기 위한 고급 문법을 제공합니다. 이들은 커널에서 실행되는 임의의 프로그램들이며, 따라서 거대한 표현 능력을 가지고 있습니다(비록 약간 어색한 awk 같은 문법도). 그들을 위한 가장 일반적인 사용 사례는 어떤 시스템 호출들이 호출되고 있는지 조사하는 것입니다. 집계들(개수들이나 지연 통계들 같은) 또는 내부 조사(또는 심지어 필터링)를 포함합니다. 시스템 호출 인수들.

```bash
# Trace file opens system-wide (prints immediately)
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_openat { printf("%s %s\n", comm, str(args->filename)); }'

# Count system calls by name (prints summary on Ctrl-C)
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_* { @[probe] = count(); }'
```

그러나, 당신은 또한 [`bcc`](https://github.com/iovisor/bcc) 같은 도구체인을 사용하여 C에서 직접 eBPF 프로그램들을 작성할 수 있습니다. 이것은 또한 `biosnoop` 같은 [많은 유용한 도구들](https://www.brendangregg.com/blog/2015-09-22-bcc-linux-4.3-tracing.html)을 배송합니다. 이것은 디스크 작업에 대한 지연 분포를 인쇄하거나 `opensnoop`은 모든 열린 파일들을 인쇄합니다.

`strace`가 유용하기 때문에 그것이 쉽게 "단지 실행하고 실행"되기 때문에, `bpftrace`는 당신이 더 낮은 오버헤드가 필요할 때, 커널 함수들을 통해 추적하고 싶을 때, 어떤 종류의 집계가 필요할 때 등을 할 때 당신이 도달해야 하는 것입니다. `bpftrace`는 `root`로 실행해야 합니다. 특정 프로세스가 아닌 전체 커널을 모니터링합니다. 특정 프로그램을 대상으로 하려면, 당신은 명령 이름이나 PID로 필터링할 수 있습니다:

```bash
# Filter by command name (prints summary on Ctrl-C)
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_* /comm == "bash"/ { @[probe] = count(); }'

# Trace a specific command from startup using -c (cpid = child PID)
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_* /pid == cpid/ { @[probe] = count(); }' -c 'ls -la'
```

`-c` 플래그는 지정된 명령을 실행하고 `cpid`를 그것의 PID로 설정합니다. 이것은 시작 순간부터 프로그램을 추적하는 데 유용합니다. 추적된 명령이 종료되면, bpftrace는 집계된 결과들을 인쇄합니다.

### 네트워크 디버깅

네트워크 문제들의 경우, [`tcpdump`](https://www.man7.org/linux/man-pages/man1/tcpdump.1.html) 및 [Wireshark](https://www.wireshark.org/)는 네트워크 패킷들을 캡처하고 분석할 수 있게 합니다:

```bash
# Capture packets on port 80
sudo tcpdump -i any port 80

# Capture and save to file for Wireshark analysis
sudo tcpdump -i any -w capture.pcap
```

HTTPS 트래픽의 경우, 암호화는 tcpdump를 덜 유용하게 만듭니다. [mitmproxy](https://mitmproxy.org/) 같은 도구들은 암호화된 트래픽을 검사하기 위한 차단 프록시로 작용할 수 있습니다. 브라우저 개발자 도구(네트워크 탭)는 종종 웹 응용 프로그램에서 HTTPS 요청을 디버그하는 가장 쉬운 방법입니다 — 그들은 복호화된 요청/응답 데이터, 헤더, 그리고 타이밍을 표시합니다.

## 메모리 디버깅

메모리 버그 — 버퍼 오버플로우, 해제 후 사용, 메모리 누수 — 가장 위험하고 디버그하기 어려운 것들입니다. 그들은 종종 즉시 충돌하지 않습니다. 오히려 메모리를 손상시키는 방식으로 훨씬 나중에 문제를 일으킵니다.

### Sanitizer

메모리 버그를 찾는 한 가지 접근 방식은 **sanitizer**를 사용하는 것입니다. 이들은 런타임에 오류를 감지하도록 코드를 계측하는 컴파일러 기능들입니다. 예를 들어, 광범위하게 사용되는 **AddressSanitizer(ASan)**는 다음을 감지합니다:
- 버퍼 오버플로우(스택, 힙, 그리고 전역)
- 해제 후 사용
- 반환 후 사용
- 메모리 누수

```bash
# Compile with AddressSanitizer
gcc -fsanitize=address -g program.c -o program
./program
```

다양한 유용한 sanitizer들이 있습니다:

- **ThreadSanitizer(TSan)**: 멀티스레드 코드에서 데이터 경쟁을 감지합니다(`-fsanitize=thread`)
- **MemorySanitizer(MSan)**: 초기화되지 않은 메모리 읽기를 감지합니다(`-fsanitize=memory`)
- **UndefinedBehaviorSanitizer(UBSan)**: 정수 오버플로우 같은 정의되지 않은 동작을 감지합니다(`-fsanitize=undefined`)

Sanitizer는 재컴파일을 필요로 하지만, CI 파이프라인과 규칙적인 개발 중에 사용하기에 충분히 빠릅니다.

### Valgrind: 재컴파일할 수 없을 때

[Valgrind](https://valgrind.org/)는 대신 메모리 오류를 감지하기 위해 어떤 가상 머신과 같은 것에서 당신의 프로그램을 실행합니다. 그것은 sanitizer보다 느리지만 재컴파일을 필요로 하지 않습니다:

```bash
valgrind --leak-check=full ./my_program
```

Valgrind를 다음에서 사용하세요:
- 당신이 소스 코드를 가지지 않을 때
- 당신이 재컴파일할 수 없을 때(타사 라이브러리들)
- 당신이 sanitizer로 사용할 수 없는 특정 도구들이 필요할 때

Valgrind는 실제로 정말로 강력한 제어된 실행 환경이며, 우리는 나중에 프로파일링을 할 때 그것의 더 많은 것을 볼 것입니다!

## AI를 위한 디버깅

큰 언어 모델들은 놀랍도록 유용한 디버깅 조수가 되었습니다. 그들은 전통적인 도구들을 보완하는 특정 디버깅 작업들에서 탁월합니다.

**LLM이 빛나는 곳:**

- **암호화된 오류 메시지 설명**: 컴파일러 오류들, 특히 C++ 템플릿들이나 Rust의 borrow 체커로부터의 오류들은 악명높게 암호화될 수 있습니다. LLM은 그들을 일반 영어로 번역하고 수정을 제안할 수 있습니다.

- **언어와 추상화 경계 횡단**: 당신이 여러 언어에 걸쳐 있는 문제를 디버그하고 있다면(예: C 라이브러리의 버그가 Python 바인딩을 통해 나타남), LLM은 다양한 계층을 네비게이트하는 데 도움이 될 수 있습니다. 그들은 FFI 경계, 빌드 시스템 문제, 그리고 교차 언어 디버깅(예: 내 프로그램 오류들이지만, 내 종속성 중 하나의 버그 때문이라고 믿습니다)을 이해하는 데 특히 좋습니다.

- **증상과 근본 원인을 연관짓기**: "내 프로그램은 미세하지만 예상보다 10배 더 많은 메모리를 사용합니다"는 LLM이 조사하는 데 도움이 될 수 있는 모호한 증상입니다. 가능한 원인들을 제안하고 무엇을 찾을지 제안합니다.

- **충돌 덤프 및 스택 추적 분석**: 스택 추적을 붙여넣고 그것의 원인이 무엇인지 물어보세요.

> **디버그 기호들에 대한 주의**: 의미 있는 스택 추적과 디버깅을 위해, 당신의 바이너리들(그리고 어떤 링크된 라이브러리들)이 디버그 기호들(`-g` 플래그)로 컴파일되는지 확인하세요. 디버그 정보는 보통 DWARF 형식으로 저장됩니다. 또한, 프레임 포인터들로 컴파일하기(`-fno-omit-frame-pointer`)는 스택 추적을 더 안정적이게 합니다. 특히 프로파일링 도구들을 위해. 이들 없이, 스택 추적들은 단지 메모리 주소들을 표시할 수 있거나 불완전할 수 있습니다. 이것은 Python이나 Java보다 네이티브로 컴파일된 프로그램들(C++, Rust)에 대해 더 많이 중요합니다.

**염두에 두어야 할 제한 사항들:**
- LLM은 그럴듯하지만 잘못된 설명들을 환각할 수 있습니다
- 그들은 버그를 고치기보다 버그를 가리는 수정들을 제안할 수 있습니다
- 항상 실제 디버깅 도구들로 제안들을 검증하세요
- 그들은 당신의 코드를 이해하는 것의 대체가 아닌 보완으로 가장 잘 작동합니다

> 이것은 [개발 환경](/2026/development-environment/#ai-powered-development) 강의에서 다루는 [일반 AI 코딩 능력들](/2026/development-environment/#ai-powered-development)과는 구별됩니다. 여기서 우리는 구체적으로 LLM을 디버깅 보조로 사용하는 것에 대해 말하고 있습니다.

# 프로파일링

당신의 코드가 기능적으로 당신이 기대하는 대로 행동하더라도, 그것이 과정에서 모든 당신의 CPU 또는 메모리를 차지한다면 충분하지 않을 수 있습니다. 알고리즘 클래스들은 종종 빅 _O_ 표기법을 가르치지만, 당신의 프로그램에서 핫 스팟을 찾는 방법은 가르치지 않습니다. [조기 최적화가 모든 악의 근원](https://wiki.c2.com/?PrematureOptimization)이므로, 당신은 프로파일러와 모니터링 도구들에 대해 배워야 합니다. 그들은 당신의 프로그램의 어떤 부분들이 시간과/또는 자원을 가장 많이 차지하고 있는지 이해하는 데 도움이 될 것이므로, 당신은 그 부분들을 최적화하는 데 초점을 맞출 수 있습니다.

## 타이밍

성능을 측정하는 가장 간단한 방법은 사물들의 시간을 정하는 것입니다. 많은 시나리오에서, 그냥 당신의 코드가 두 지점 사이에 걸린 시간을 인쇄하는 것이 충분할 수 있습니다.

그러나, 벽시계 시간은 당신의 컴퓨터가 동시에 다른 프로세스들을 실행 중일 수 있거나, 이벤트들이 일어나기를 대기 중일 수 있기 때문에 오도할 수 있습니다. `time` 명령은 _Real_, _User_, 그리고 _Sys_ 시간을 구별합니다:

- **Real** - 시작부터 종료까지의 벽시계 시간, 대기 중인 시간을 포함하여
- **User** - 사용자 코드를 실행하는 CPU에서 보낸 시간
- **Sys** - 커널 코드를 실행하는 CPU에서 보낸 시간

```bash
$ time curl https://missing.csail.mit.edu &> /dev/null
real	0m0.272s
user	0m0.079s
sys	    0m0.028s
```

여기서, 요청은 거의 300밀리초(실제 시간)가 걸렸지만, CPU 시간의 107ms만(사용자 + sys). 나머지는 네트워크를 대기하는 데 있었습니다.

## 자원 모니터링

때때로, 당신의 프로그램의 성능을 분석하기 위한 첫 번째 단계는 그것의 실제 자원 소비를 이해하는 것입니다. 프로그램들은 종종 자원이 제한될 때 천천히 실행합니다.

- **일반 모니터링**: [`htop`](https://htop.dev/)는 현재 실행 중인 프로세스들을 위한 다양한 통계를 제시하는 `top`의 개선된 버전입니다. 유용한 키바인드: `<F6>`는 프로세스들을 정렬하고, `t`는 트리 계층을 표시하고, `h`는 스레드들을 전환합니다. 또한 [btop](https://github.com/aristocratos/btop)도 있습니다. 이것은 _훨씬_ 더 많은 것들을 모니터링합니다.

- **I/O 작업**: [`iotop`](https://www.man7.org/linux/man-pages/man8/iotop.8.html)은 실시간 I/O 사용 정보를 표시합니다.

- **메모리 사용**: [`free`](https://www.man7.org/linux/man-pages/man1/free.1.html)는 총 자유로운 그리고 사용된 메모리를 표시합니다.

- **열린 파일들**: [`lsof`](https://www.man7.org/linux/man-pages/man8/lsof.8.html)는 프로세스들에 의해 열린 파일들에 대한 파일 정보를 나열합니다. 특정 파일을 열었을 프로세스를 확인하는 데 유용합니다.

- **네트워크 연결들**: [`ss`](https://www.man7.org/linux/man-pages/man8/ss.8.html)는 당신이 네트워크 연결들을 모니터링할 수 있게 합니다. 일반적인 사용 사례는 주어진 포트를 사용하는 프로세스를 파악하는 것입니다: `ss -tlnp | grep :8080`.

- **네트워크 사용**: [`nethogs`](https://github.com/raboof/nethogs) 및 [`iftop`](https://pdw.ex-parrot.com/iftop/)은 프로세스별 네트워크 사용을 모니터링하기 위한 좋은 대화형 CLI 도구들입니다.

## 성능 데이터 시각화

인간들은 숫자 테이블들보다 그래프들에서 패턴들을 훨씬 더 빠르게 발견합니다. 성능을 분석할 때, 당신의 데이터를 플로팅하면 종종 원본 숫자들에서 보이지 않을 추세들, 스파이크들, 그리고 이상들을 드러냅니다.

**데이터 플로팅 가능하게 만들기**: 디버깅을 위해 프린트나 로그 문들을 추가할 때, 나중에 쉽게 그래프로 표시될 수 있도록 출력을 포맷하는 것을 고려하세요. CSV 형식(`1705012345,42.5`)의 간단한 타임스탬프와 값은 산문 문장보다 훨씬 플로팅하기 쉽습니다. JSON 구조화된 로그들도 최소한의 노력으로 파싱되고 플로팅될 수 있습니다. 다시 말해, 당신의 데이터를 [정리된 방식으로](https://vita.had.co.nz/papers/tidy-data.pdf) 로깅하세요.

**gnuplot으로 빠른 플로팅**: 단순 명령줄 플로팅을 위해, [`gnuplot`](http://www.gnuplot.info/)은 데이터 파일들로부터 직접 그래프들을 생성할 수 있습니다:

```bash
# Plot a simple CSV with timestamp,value
gnuplot -e "set datafile separator ','; plot 'latency.csv' using 1:2 with lines"
```

**matplotlib 및 ggplot2를 가진 반복적 탐구**: 더 깊은 분석을 위해, Python의 [`matplotlib`](https://matplotlib.org/) 및 R의 [`ggplot2`](https://ggplot2.tidyverse.org/)는 반복적 탐구를 가능하게 합니다. 일회성 플로팅과 달리, 이들 도구는 당신이 빠르게 데이터를 분할하고 변환하여 가설들을 조사할 수 있게 합니다. ggplot2의 facet 플롯들은 특히 강력합니다 — 당신은 단일 데이터 집합을 여러 서브플롯들에 걸쳐 범주별로 분할할 수 있습니다(예: 끝점별 또는 시간별 요청 지연 faceting) 숨겨질 패턴들을 찾아냅니다.

**예제 사용 사례:**
- 시간에 따른 요청 지연 플로팅은 원본 백분위수들이 모호하게 하는 주기적 느려짐들(가비지 수집, cron 작업, 트래픽 패턴들)을 드러냅니다
- 증가하는 데이터 구조에 대한 삽입 시간을 시각화하는 것은 알고리즘 복잡성 문제들을 노출할 수 있습니다 — 벡터 삽입들의 플롯은 백업 배열이 2배가 될 때 특징적 스파이크들을 표시합니다
- 다양한 차원들(요청 타입, 사용자 동료군, 서버) 별로 메트릭들을 faceting하는 것은 종종 "시스템 전체" 문제가 실제로 한 범주에 격리되어 있음을 드러냅니다

## CPU 프로파일러

대부분의 시간, 사람들이 _프로파일러_를 언급할 때, 그들은 _CPU 프로파일러_를 의미합니다. 두 가지 주요 타입이 있습니다:

- **추적 프로파일러**는 당신의 프로그램이 만드는 모든 함수 호출의 기록을 유지합니다
- **샘플링 프로파일러**는 주기적으로(보통 매 밀리초) 당신의 프로그램을 감지하고, 프로그램의 스택을 기록합니다

샘플링 프로파일러는 더 낮은 오버헤드를 가지고 있으며, 일반적으로 프로덕션 사용을 위해 선호됩니다.

### perf: 샘플링 프로파일러

[`perf`](https://www.man7.org/linux/man-pages/man1/perf.1.html)는 표준 Linux 프로파일러입니다. 그것은 재컴파일 없이 모든 프로그램을 프로파일할 수 있습니다:

`perf stat`은 시간이 어디에 보내지는지에 대한 빠른 개요를 제공합니다:

```bash
$ perf stat ./slow_program

 Performance counter stats for './slow_program':

         3,210.45 msec task-clock                #    0.998 CPUs utilized
               12      context-switches          #    3.738 /sec
                0      cpu-migrations            #    0.000 /sec
              156      page-faults               #   48.587 /sec
   12,345,678,901      cycles                    #    3.845 GHz
    9,876,543,210      instructions              #    0.80  insn per cycle
    1,234,567,890      branches                  #  384.532 M/sec
       12,345,678      branch-misses             #    1.00% of all branches
```

실제 프로그램들에 대한 프로파일러 출력은 대량의 정보를 포함할 것입니다. 인간들은 시각적인 생명체이며, 대량의 숫자들을 읽는 데 매우 형편없습니다. [플레임 그래프](https://www.brendangregg.com/flamegraphs.html)는 프로파일링 데이터를 이해하기 훨씬 더 쉽게 만드는 시각화입니다.

플레임 그래프는 Y 축 상의 함수 호출의 계층 구조와 X 축에 비례하는 소비된 시간을 표시합니다. 그들은 대화형입니다 — 당신은 프로그램의 특정 부분으로 줌을 클릭할 수 있습니다.

[![FlameGraph](https://www.brendangregg.com/FlameGraphs/cpu-bash-flamegraph.svg)](https://www.brendangregg.com/FlameGraphs/cpu-bash-flamegraph.svg)

`perf` 데이터로부터 플레임 그래프를 생성하려면:

```bash
# Record profile
perf record -g ./my_program

# Generate flame graph (requires flamegraph scripts)
perf script | stackcollapse-perf.pl | flamegraph.pl > flamegraph.svg
```

> [Speedscope](https://www.speedscope.app/)를 대화형 웹 기반 플레임 그래프 뷰어로 사용하는 것을 고려하세요. 또는 종합적인 시스템 수준 분석을 위해 [Perfetto](https://perfetto.dev/).

### Valgrind의 Callgrind: 추적 프로파일러

[`callgrind`](https://valgrind.org/docs/manual/cl-manual.html)는 당신의 프로그램의 호출 이력과 명령 개수를 기록하는 프로파일링 도구입니다. 샘플링 프로파일러와 달리, 그것은 정확한 호출 개수를 제공하고, 호출자들과 호출대상들 간의 관계를 표시할 수 있습니다:

```bash
# Run with callgrind
valgrind --tool=callgrind ./my_program

# Analyze with callgrind_annotate (text) or kcachegrind (GUI)
callgrind_annotate callgrind.out.<pid>
kcachegrind callgrind.out.<pid>
```

Callgrind는 샘플링 프로파일러보다 느리지만 정확한 호출 개수를 제공하고, 선택적으로 캐시 동작을 시뮬레이션할 수 있습니다(`--cache-sim=yes`). 당신이 그 정보가 필요하다면.

> 당신이 특정 언어를 사용 중이라면, 더 전문화된 프로파일러가 있을 수 있습니다. 예를 들어, Python은 [`cProfile`](https://docs.python.org/3/library/profile.html)과 [`py-spy`](https://github.com/benfred/py-spy)를 가지고 있고, Go는 [`go tool pprof`](https://pkg.go.dev/cmd/pprof)를 가지고 있고, Rust는 [`cargo-flamegraph`](https://github.com/flamegraph-rs/flamegraph)를 가지고 있습니다.

## 메모리 프로파일러

메모리 프로파일러는 당신의 프로그램이 시간에 따라 메모리를 어떻게 사용하는지 이해하고, 메모리 누수를 찾는 데 도움이 됩니다.

### Valgrind의 Massif

[`massif`](https://valgrind.org/docs/manual/ms-manual.html)는 힙 메모리 사용을 프로파일합니다:

```bash
valgrind --tool=massif ./my_program
ms_print massif.out.<pid>
```

이것은 당신에게 시간에 따른 힙 사용을 표시하며, 메모리 누수와 과도한 할당을 식별하는 데 도움이 됩니다.

> Python의 경우, [`memory-profiler`](https://pypi.org/project/memory-profiler/)는 라인별 메모리 사용 정보를 제공합니다.

## 벤치마킹

다양한 구현들이나 도구들의 성능을 비교해야 할 때, [`hyperfine`](https://github.com/sharkdp/hyperfine)은 명령줄 프로그램들을 벤치마크하는 데 우수합니다:

```bash
$ hyperfine --warmup 3 'fd -e jpg' 'find . -iname "*.jpg"'
Benchmark #1: fd -e jpg
  Time (mean ± σ):      51.4 ms ±   2.9 ms    [User: 121.0 ms, System: 160.5 ms]
  Range (min … max):    44.2 ms …  60.1 ms    56 runs

Benchmark #2: find . -iname "*.jpg"
  Time (mean ± σ):      1.126 s ±  0.101 s    [User: 141.1 ms, System: 956.1 ms]
  Range (min … max):    0.975 s …  1.287 s    10 runs

Summary
  'fd -e jpg' ran
   21.89 ± 2.33 times faster than 'find . -iname "*.jpg"'
```

> 웹 개발의 경우, 브라우저 개발자 도구는 우수한 프로파일러를 포함합니다. [Firefox Profiler](https://profiler.firefox.com/docs/) 및 [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/rendering-tools) 문서를 참조하세요.

# 연습

## 디버깅

1. **정렬 알고리즘 디버그**: 다음 의사 코드는 병합 정렬을 구현하지만 버그를 포함합니다. 당신이 선택한 언어로 그것을 구현하고, 디버거(gdb, lldb, pdb, 또는 당신의 IDE의 디버거)를 사용하여 버그를 찾고 수정하세요.

   ```
   function merge_sort(arr):
       if length(arr) <= 1:
           return arr
       mid = length(arr) / 2
       left = merge_sort(arr[0..mid])
       right = merge_sort(arr[mid..end])
       return merge(left, right)

   function merge(left, right):
       result = []
       i = 0, j = 0
       while i < length(left) AND j < length(right):
           if left[i] <= right[j]:
               append result, left[i]
               i = i + 1
           else:
               append result, right[i]
               j = j + 1
       append remaining elements from left and right
       return result
   ```

   테스트 벡터: `merge_sort([3, 1, 4, 1, 5, 9, 2, 6])`은 `[1, 1, 2, 3, 4, 5, 6, 9]`를 반환해야 합니다. 병합 함수에 단계별로 진행하고 잘못된 요소가 선택되는 곳을 찾기 위해 브레이크포인트를 사용하세요.

1. [`rr`](https://rr-project.org/)을 설치하고, 역 디버깅을 사용하여 손상 버그를 찾으세요. 이 프로그램을 `corruption.c`로 저장하세요:

   ```c
   #include <stdio.h>

   typedef struct {
       int id;
       int scores[3];
   } Student;

   Student students[2];

   void init() {
       students[0].id = 1001;
       students[0].scores[0] = 85;
       students[0].scores[1] = 92;
       students[0].scores[2] = 78;

       students[1].id = 1002;
       students[1].scores[0] = 90;
       students[1].scores[1] = 88;
       students[1].scores[2] = 95;
   }

   void curve_scores(int student_idx, int curve) {
       for (int i = 0; i < 4; i++) {
           students[student_idx].scores[i] += curve;
       }
   }

   int main() {
       init();
       printf("=== Initial state ===\n");
       printf("Student 0: id=%d\n", students[0].id);
       printf("Student 1: id=%d\n", students[1].id);

       curve_scores(0, 5);

       printf("\n=== After curving ===\n");
       printf("Student 0: id=%d\n", students[0].id);
       printf("Student 1: id=%d\n", students[1].id);

       if (students[1].id != 1002) {
           printf("\nERROR: Student 1's ID was corrupted! Expected 1002, got %d\n",
                  students[1].id);
           return 1;
       }
       return 0;
   }
   ```

   `gcc -g corruption.c -o corruption`로 컴파일하고, 실행하세요. 학생 1의 ID가 손상되지만, 손상은 학생 0에만 접촉하는 함수에서 일어납니다. `rr record ./corruption`과 `rr replay`를 사용하여 범인을 찾으세요. `students[1].id`에 watchpoint를 설정하고, 손상 후 `reverse-continue`를 사용하여 정확히 어떤 코드 라인이 그것을 덮어씌웠는지 찾으세요.

1. AddressSanitizer로 메모리 오류를 디버그하세요. 이를 `uaf.c`로 저장하세요:

   ```c
   #include <stdlib.h>
   #include <string.h>
   #include <stdio.h>

   int main() {
       char *greeting = malloc(32);
       strcpy(greeting, "Hello, world!");
       printf("%s\n", greeting);

       free(greeting);

       greeting[0] = 'J';
       printf("%s\n", greeting);

       return 0;
   }
   ```

   먼저 sanitizer 없이 컴파일하고 실행하세요: `gcc uaf.c -o uaf && ./uaf`. 그것이 작동하는 것처럼 보일 수 있습니다. 이제 AddressSanitizer로 컴파일하세요: `gcc -fsanitize=address -g uaf.c -o uaf && ./uaf`. 오류 보고를 읽으세요. ASan이 어떤 버그를 찾습니까? 그것이 식별하는 문제를 수정하세요.

1. `strace`(Linux) 또는 `dtruss`(macOS)를 사용하여 `ls -l` 같은 명령으로 만들어지는 시스템 호출들을 추적하세요. 그것이 어떤 시스템 호출들을 만들고 있습니까? 더 복잡한 프로그램을 추적하고 그것이 어떤 파일들을 열고 있는지 보세요.

1. 암호화된 오류 메시지를 디버그하는 데 도움을 주기 위해 LLM을 사용하세요. 컴파일러 오류(특히 C++ 템플릿들이나 Rust로부터의)를 복사하고 설명과 수정을 물어보세요. `strace` 또는 주소 sanitizer로부터의 일부 출력을 그것에 넣어보세요.

## 프로파일링

1. `perf stat`을 사용하여 당신이 선택한 프로그램에 대한 기본 성능 통계를 얻으세요. 다양한 카운터들이 의미하는 것은 무엇입니까?

1. `perf record`로 프로파일하세요. 이를 `slow.c`로 저장하세요:

   ```c
   #include <math.h>
   #include <stdio.h>

   double slow_computation(int n) {
       double result = 0;
       for (int i = 0; i < n; i++) {
           for (int j = 0; j < 1000; j++) {
               result += sin(i * j) * cos(i + j);
           }
       }
       return result;
   }

   int main() {
       double r = 0;
       for (int i = 0; i < 100; i++) {
           r += slow_computation(1000);
       }
       printf("Result: %f\n", r);
       return 0;
   }
   ```

   디버그 기호들로 컴파일하세요: `gcc -g -O2 slow.c -o slow -lm`. `perf record -g ./slow`을 실행하고, 그 다음 `perf report`를 실행하여 시간이 어디에 보내지는지를 봅니다. flamegraph 스크립트를 사용하여 플레임 그래프를 생성해 보세요.

1. `hyperfine`을 사용하여 같은 작업의 두 개의 다양한 구현을 벤치마크하세요(예: `find` vs `fd`, `grep` vs `ripgrep`, 또는 당신 자신의 코드의 두 버전들).

1. 자원 집약적인 프로그램을 실행하는 동안 `htop`을 사용하여 당신의 시스템을 모니터하세요. `taskset`을 사용하여 프로세스가 사용할 수 있는 CPU들을 제한해 보세요: `taskset --cpu-list 0,2 stress -c 3`. 왜 `stress`가 3개의 CPU들을 사용하지 않습니까?

1. 일반적인 문제는 당신이 리스닝하고 싶은 포트가 이미 다른 프로세스에 의해 차지되었다는 것입니다. 그 프로세스를 발견하는 방법을 배우세요: 먼저 `python -m http.server 4444`를 실행하여 포트 4444에서 최소한의 웹 서버를 시작하세요. 별도의 터미널에서 `ss -tlnp | grep 4444`를 실행하여 프로세스를 찾으세요. `kill <PID>`로 종료하세요.
