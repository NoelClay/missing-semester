---
layout: lecture
permalink: /2020/kr/debugging-profiling/
title: "디버깅 및 프로파일링 (Debugging and Profiling)"
description: >
  로깅(logging), 디버거(debuggers), 정적 분석(static analysis)을 사용하여 프로그램을 디버깅하는 방법과 성능을 위해 코드를 프로파일링하는 방법을 배웁니다.
thumbnail: /static/assets/thumbnails/2020/lec7.png
date: 2020-01-23
ready: true
video:
  aspect: 56.25
  id: l812pUnKxME
---

프로그래밍의 황금률 중 하나는 코드가 여러분이 기대하는 대로 동작하는 것이 아니라, 여러분이 명령한 대로 동작한다는 것이다.
그 간극을 좁히는 것은 때로 상당히 어려운 일이 될 수 있다.
이번 강의에서는 버그가 있거나 자원을 많이 소모하는 코드를 다루기 위한 유용한 기술인 디버깅과 프로파일링을 다룰 것이다.

# 디버깅 (Debugging)

## Printf 디버깅 및 로깅 (Printf debugging and Logging)

"가장 효과적인 디버깅 도구는 여전히 신중한 생각과 적절하게 배치된 print 문이다." — Brian Kernighan, _Unix for Beginners_.

프로그램을 디버깅하는 첫 번째 방법은 문제가 발견된 지점 주변에 print 문을 추가하고, 문제의 원인을 이해하기에 충분한 정보를 얻을 때까지 반복하는 것이다.

두 번째 방법은 임시방편적인 print 문 대신 프로그램 내에서 로깅(logging)을 사용하는 것이다. 로깅은 일반적인 print 문보다 여러 면에서 더 낫다.

- 표준 출력 대신 파일, 소켓 또는 원격 서버에 로그를 남길 수 있다.
- 로깅은 심각도 수준(INFO, DEBUG, WARN, ERROR 등)을 지원하여 그에 따라 출력을 필터링할 수 있게 해준다.
- 새로운 문제가 발생했을 때, 로그에 무엇이 잘못되었는지 감지할 수 있는 충분한 정보가 담겨 있을 가능성이 높다.

[여기](/static/files/logger.py)에 메시지를 로깅하는 예제 코드가 있다.

```bash
$ python logger.py
# 일반 print 문처럼 원본 출력
$ python logger.py log
# 로그 형식으로 출력
$ python logger.py log ERROR
# ERROR 수준 이상의 로그만 출력
$ python logger.py color
# 색상이 적용된 형식으로 출력
```

로그를 더 읽기 쉽게 만드는 가장 좋은 팁 중 하나는 색상을 입히는 것이다.
이미 터미널이 가독성을 높이기 위해 색상을 사용한다는 것을 눈치챘을 것이다. 하지만 터미널은 어떻게 색상을 표시할까?
`ls`나 `grep` 같은 프로그램은 **ANSI 이스케이프 코드(ANSI escape codes)**를 사용한다. 이는 쉘에 출력 색상을 변경하도록 지시하는 특별한 문자 시퀀스이다. 예를 들어, `echo -e "\e[38;2;255;0;0mThis is red\e[0m"`를 실행하면 터미널이 [트루 컬러(true color)](https://github.com/termstandard/colors#truecolor-support-in-output-devices)를 지원하는 한 `This is red`라는 메시지가 빨간색으로 출력된다. 터미널이 이를 지원하지 않는 경우(예: macOS의 Terminal.app), 16가지 색상을 선택할 수 있는 더 범용적인 이스케이프 코드를 사용할 수 있다. 예: `echo -e "\e[31;1mThis is red\e[0m"`.

다음 스크립트는 터미널에 다양한 RGB 색상을 출력하는 방법을 보여준다(트루 컬러를 지원하는 경우).

```bash
#!/usr/bin/env bash
for R in $(seq 0 20 255); do
    for G in $(seq 0 20 255); do
        for B in $(seq 0 20 255); do
            printf "\e[38;2;${R};${G};${B}m█\e[0m";
        done
    done
done
```

## 서드파티 로그 (Third party logs)

더 큰 소프트웨어 시스템을 구축하기 시작하면 별도의 프로그램으로 실행되는 의존성(dependencies)을 마주하게 될 것이다.
웹 서버, 데이터베이스, 메시지 브로커 등이 대표적인 예이다.
이러한 시스템과 상호작용할 때 클라이언트 측 에러 메시지만으로는 충분하지 않을 수 있으므로, 해당 시스템의 로그를 읽는 것이 필요할 때가 많다.

다행히 대부분의 프로그램은 시스템 어딘가에 자신만의 로그를 작성한다.
UNIX 시스템에서 프로그램들은 보통 `/var/log` 아래에 로그를 쓴다.
예를 들어, [NGINX](https://www.nginx.com/) 웹 서버는 로그를 `/var/log/nginx`에 저장한다.
최근에는 시스템의 모든 로그 메시지가 모이는 **시스템 로그(system log)**를 사용하는 경우가 늘고 있다.
대부분의(전부는 아님) Linux 시스템은 어떤 서비스가 활성화되고 실행 중인지 등 시스템의 많은 것들을 제어하는 시스템 데몬인 `systemd`를 사용한다.
`systemd`는 로그를 특수한 형식으로 `/var/log/journal` 아래에 저장하며, [`journalctl`](https://www.man7.org/linux/man-pages/man1/journalctl.1.html) 명령어를 사용하여 메시지를 확인할 수 있다.
마찬가지로 macOS에는 여전히 `/var/log/system.log`가 존재하지만, 점점 더 많은 도구들이 [`log show`](https://www.manpagez.com/man/1/log/) 명령어로 확인할 수 있는 시스템 로그를 사용한다.
대부분의 UNIX 시스템에서는 [`dmesg`](https://www.man7.org/linux/man-pages/man1/dmesg.1.html) 명령어를 사용하여 커널 로그에 접근할 수도 있다.

시스템 로그에 로깅하려면 [`logger`](https://www.man7.org/linux/man-pages/man1/logger.1.html) 쉘 프로그램을 사용할 수 있다.
다음은 `logger`를 사용하고 해당 항목이 시스템 로그에 기록되었는지 확인하는 예제이다.
또한 대부분의 프로그래밍 언어에는 시스템 로그에 로깅할 수 있는 바인딩이 있다.

```bash
logger "Hello Logs"
# macOS에서
log show --last 1m | grep Hello
# Linux에서
journalctl --since "1m ago" | grep Hello
```

데이터 정리 강의에서 보았듯이 로그는 매우 장황할 수 있으며, 원하는 정보를 얻기 위해 어느 정도의 가공과 필터링이 필요하다.
만약 `journalctl`이나 `log show`를 과하게 필터링하고 있다면, 출력 결과에 대해 첫 번째 필터링을 수행할 수 있는 해당 명령어들의 플래그를 사용하는 것이 좋다.
또한 로그 파일을 더 나은 방식으로 보여주고 탐색하게 해주는 [`lnav`](https://lnav.org/)와 같은 도구들도 있다.

## 디버거 (Debuggers)

printf 디버깅만으로 충분하지 않을 때는 디버거를 사용해야 한다.
디버거는 프로그램의 실행과 상호작용할 수 있게 해주는 프로그램으로, 다음과 같은 기능들을 제공한다.

- 프로그램이 특정 라인에 도달했을 때 실행 중단.
- 프로그램을 한 번에 한 명령어씩 단계별로 실행.
- 프로그램이 중단된 후 변수 값 확인.
- 특정 조건이 충족될 때 실행을 조건부로 중단.
- 그 외 많은 고급 기능들.

많은 프로그래밍 언어는 어떤 형태로든 디버거를 제공한다.
Python의 경우 Python Debugger인 [`pdb`](https://docs.python.org/3/library/pdb.html)가 있다.

다음은 `pdb`가 지원하는 몇 가지 명령어에 대한 간략한 설명이다.

- **l**(ist) - 현재 라인 주변의 11개 라인을 표시하거나 이전 목록을 이어서 표시한다.
- **s**(tep) - 현재 라인을 실행하고 가능한 첫 번째 기회에 멈춘다.
- **n**(ext) - 현재 함수의 다음 라인에 도달하거나 함수가 반환될 때까지 실행을 계속한다.
- **b**(reak) - 브레이크포인트(breakpoint)를 설정한다(제공된 인자에 따라 다름).
- **p**(rint) - 현재 컨텍스트에서 표현식을 평가하고 그 값을 출력한다. [`pprint`](https://docs.python.org/3/library/pprint.html)를 사용하여 표시하는 **pp**도 있다.
- **r**(eturn) - 현재 함수가 반환될 때까지 실행을 계속한다.
- **q**(uit) - 디버거를 종료한다.

버그가 있는 다음 Python 코드를 수정하기 위해 `pdb`를 사용하는 예제를 살펴보자. (강의 비디오 참조).

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n):
            if arr[j] > arr[j+1]:
                arr[j] = arr[j+1]
                arr[j+1] = arr[j]
    return arr

print(bubble_sort([4, 2, 1, 8, 7, 6]))
```


Python은 인터프리터 언어이므로 `pdb` 쉘을 사용하여 명령어를 실행하고 명령을 내릴 수 있다는 점에 유의하라.
[`ipdb`](https://pypi.org/project/ipdb/)는 [`IPython`](https://ipython.org) REPL을 사용하는 개선된 `pdb`로, `pdb` 모듈과 동일한 인터페이스를 유지하면서 탭 완성, 구문 하이라이팅, 더 나은 트레이스백(tracebacks), 더 나은 인트로스펙션(introspection) 기능을 제공한다.

더 낮은 수준(low-level)의 프로그래밍을 할 때는 [`gdb`](https://www.gnu.org/software/gdb/)(및 사용 편의성을 개선한 [`pwndbg`](https://github.com/pwndbg/pwndbg))와 [`lldb`](https://lldb.llvm.org/)를 살펴보는 것이 좋다.
이들은 C와 같은 언어의 디버깅에 최적화되어 있지만, 거의 모든 프로세스를 조사하여 레지스터, 스택, 프로그램 카운터 등의 현재 머신 상태를 얻을 수 있게 해준다.


## 특수 도구 (Specialized Tools)

디버깅하려는 대상이 블랙박스 바이너리라 할지라도 도움을 줄 수 있는 도구들이 있다.
프로그램이 커널만이 할 수 있는 작업을 수행해야 할 때마다 [시스템 콜(System Calls)](https://en.wikipedia.org/wiki/System_call)을 사용한다.
프로그램이 수행하는 시스템 콜을 추적할 수 있게 해주는 명령어들이 있다. Linux에는 [`strace`](https://www.man7.org/linux/man-pages/man1/strace.1.html)가 있고, macOS와 BSD에는 [`dtrace`](https://dtrace.org/about/)가 있다. `dtrace`는 자체 언어인 `D`를 사용하기 때문에 사용하기 까다로울 수 있지만, `strace`와 더 유사한 인터페이스를 제공하는 [`dtruss`](https://www.manpagez.com/man/1/dtruss/)라는 래퍼가 있다(자세한 내용은 [여기](https://8thlight.com/blog/colin-jones/2015/11/06/dtrace-even-better-than-strace-for-osx.html) 참조).

아래는 `ls` 실행 시 발생하는 [`stat`](https://www.man7.org/linux/man-pages/man2/stat.2.html) 시스템 콜 추적 결과를 보여주기 위해 `strace`나 `dtruss`를 사용한 예시이다. `strace`에 대해 더 깊이 알고 싶다면 [이 기사](https://blogs.oracle.com/linux/strace-the-sysadmins-microscope-v2)와 [이 진(zine)](https://jvns.ca/strace-zine-unfolded.pdf)을 읽어보는 것을 추천한다.

```bash
# Linux에서
sudo strace -e lstat ls -l > /dev/null
# macOS에서
sudo dtruss -t lstat64_extended ls -l > /dev/null
```

어떤 상황에서는 프로그램의 문제를 파악하기 위해 네트워크 패킷을 살펴봐야 할 수도 있다.
[`tcpdump`](https://www.man7.org/linux/man-pages/man1/tcpdump.1.html)와 [Wireshark](https://www.wireshark.org/)와 같은 도구는 네트워크 패킷 분석기로, 네트워크 패킷의 내용을 읽고 다양한 기준에 따라 필터링할 수 있게 해준다.

웹 개발의 경우 Chrome/Firefox 개발자 도구가 매우 유용하다. 다음과 같은 수많은 도구를 포함하고 있다.
- 소스 코드 - 모든 웹사이트의 HTML/CSS/JS 소스 코드를 조사.
- 실시간 HTML, CSS, JS 수정 - 웹사이트의 콘텐츠, 스타일, 동작을 변경하여 테스트 (웹사이트 스크린샷이 항상 유효한 증거는 아님을 직접 확인할 수 있다).
- JavaScript 쉘 - JS REPL에서 명령어 실행.
- 네트워크 - 요청 타임라인 분석.
- 스토리지 - 쿠키(Cookies) 및 로컬 애플리케이션 저장소 조사.

## 정적 분석 (Static Analysis)

어떤 문제들은 코드를 실행할 필요조차 없다.
예를 들어, 코드를 주의 깊게 살펴보는 것만으로도 루프 변수가 이미 존재하는 변수나 함수 이름을 가리고(shadowing) 있거나, 변수를 정의하기 전에 읽고 있다는 것을 깨달을 수 있다.
여기서 [정적 분석(static analysis)](https://en.wikipedia.org/wiki/Static_program_analysis) 도구들이 등장한다.
정적 분석 프로그램은 소스 코드를 입력으로 받아 코딩 규칙을 사용하여 정확성을 추론한다.

다음 Python 코드 조각에는 몇 가지 실수가 있다.
먼저, 루프 변수 `foo`가 이전의 함수 정의 `foo`를 가리고 있다. 또한 마지막 라인에서 `bar` 대신 `baz`라고 썼기 때문에, 프로그램은 (1분이 걸리는) `sleep` 호출을 완료한 후 충돌할 것이다.

```python
import time

def foo():
    return 42

for foo in range(5):
    print(foo)
bar = 1
bar *= 0.2
time.sleep(60)
print(baz)
```

정적 분석 도구는 이러한 종류의 문제들을 식별할 수 있다. 이 코드에 [`pyflakes`](https://pypi.org/project/pyflakes)를 실행하면 두 버그와 관련된 에러를 얻게 된다. [`mypy`](https://mypy-lang.org/)는 타입 체크 문제를 감지할 수 있는 또 다른 도구이다. 여기서 `mypy`는 `bar`가 처음에 `int`였다가 나중에 `float`으로 캐스팅되었다는 점을 경고할 것이다.
다시 한번 강조하지만, 이 모든 문제들은 코드를 실행하지 않고도 감지되었다.

```bash
$ pyflakes foobar.py
foobar.py:6: redefinition of unused 'foo' from line 3
foobar.py:11: undefined name 'baz'

$ mypy foobar.py
foobar.py:6: error: Incompatible types in assignment (expression has type "int", variable has type "Callable[[], Any]")
foobar.py:9: error: Incompatible types in assignment (expression has type "float", variable has type "int")
foobar.py:11: error: Name 'baz' is not defined
Found 3 errors in 1 file (checked 1 source file)
```

쉘 도구 강의에서는 쉘 스크립트를 위한 유사한 도구인 [`shellcheck`](https://www.shellcheck.net/)를 다루었다.

대부분의 에디터와 IDE는 이러한 도구의 출력을 에디터 내에 표시하여 경고와 에러 위치를 하이라이팅해 준다.
이를 흔히 **코드 린팅(code linting)**이라고 부르며, 스타일 위반이나 보안상 취약한 구조와 같은 다른 유형의 문제들을 표시하는 데에도 사용될 수 있다.

Vim에서는 [`ale`](https://vimawesome.com/plugin/ale)이나 [`syntastic`](https://vimawesome.com/plugin/syntastic) 플러그인을 사용하여 이를 수행할 수 있다.
Python의 경우, [`pylint`](https://github.com/PyCQA/pylint)와 [`pep8`](https://pypi.org/project/pep8/)은 스타일 린터의 예이며, [`bandit`](https://pypi.org/project/bandit/)은 흔한 보안 문제를 찾기 위해 설계된 도구이다.
다른 언어들의 경우에도 [Awesome Static Analysis](https://github.com/mre/awesome-static-analysis)(Writing 섹션 참조)나 린터 목록인 [Awesome Linters](https://github.com/caramelomartins/awesome-linters)와 같이 유용한 정적 분석 도구들이 잘 정리되어 있다.

스타일 린팅의 보완 도구로는 Python의 [`black`](https://github.com/psf/black), Go의 `gofmt`, Rust의 `rustfmt`, JavaScript, HTML, CSS를 위한 [`prettier`](https://prettier.io/)와 같은 코드 포매터(code formatters)가 있다.
이러한 도구들은 해당 프로그래밍 언어의 일반적인 스타일 패턴에 맞게 코드를 자동으로 포맷팅해 준다.
자신의 코드 스타일 제어권을 내주는 것이 내키지 않을 수도 있지만, 코드 형식을 표준화하는 것은 다른 사람들이 여러분의 코드를 읽는 데 도움이 되며, 여러분 역시 (스타일이 표준화된) 다른 사람의 코드를 더 잘 읽을 수 있게 해줄 것이다.

# 프로파일링 (Profiling)

코드가 기능적으로는 예상대로 동작하더라도, 그 과정에서 모든 CPU나 메모리를 점유한다면 충분히 좋은 코드라고 할 수 없다.
알고리즘 수업에서는 주로 빅 오(_O_) 표기법을 가르치지만 프로그램의 핫스팟(hot spots)을 찾는 법은 가르쳐주지 않는다.
[조급한 최적화는 모든 악의 근원](https://wiki.c2.com/?PrematureOptimization)이므로, 프로파일러와 모니터링 도구에 대해 배워야 한다. 이 도구들은 프로그램의 어떤 부분이 가장 많은 시간이나 자원을 소모하는지 파악하여 여러분이 어느 부분을 최적화하는 데 집중해야 할지 알려줄 것이다.

## 시간 측정 (Timing)

디버깅의 경우와 마찬가지로, 많은 시나리오에서 코드의 두 지점 사이에 걸린 시간을 출력하는 것만으로도 충분할 수 있다.
다음은 Python의 [`time`](https://docs.python.org/3/library/time.html) 모듈을 사용한 예시이다.

```python
import time, random
n = random.randint(1, 10) * 100

# 현재 시간 가져오기
start = time.time()

# 작업 수행
print("Sleeping for {} ms".format(n))
time.sleep(n/1000)

# 시작 시간과 현재 시간 사이의 차이 계산
print(time.time() - start)

# 출력 결과
# Sleeping for 500 ms
# 0.5713930130004883
```

하지만 실제 소요 시간(wall clock time)은 오해의 소지가 있을 수 있다. 컴퓨터가 동시에 다른 프로세스를 실행 중이거나 이벤트를 기다리고 있을 수 있기 때문이다. 도구들은 일반적으로 **Real**(실제 시간), **User**(사용자 시간), **Sys**(시스템 시간)를 구분한다. 일반적으로 **User** + **Sys**는 프로세스가 실제로 CPU에서 보낸 시간을 알려준다(더 자세한 설명은 [여기](https://stackoverflow.com/questions/556405/what-do-real-user-and-sys-mean-in-the-output-of-time1) 참조).

- **Real** - 프로그램의 시작부터 종료까지 걸린 실제 시간. 다른 프로세스가 사용한 시간과 대기 시간(I/O나 네트워크 대기 등)을 포함한다.
- **User** - 사용자 코드를 실행하며 CPU에서 보낸 시간.
- **Sys** - 커널 코드를 실행하며 CPU에서 보낸 시간.

예를 들어, HTTP 요청을 수행하는 명령어 앞에 [`time`](https://www.man7.org/linux/man-pages/man1/time.1.html)을 붙여 실행해 보라. 느린 연결 환경에서는 아래와 같은 결과를 얻을 수 있다. 요청이 완료되는 데 2초 이상 걸렸지만, 프로세스는 CPU 사용자 시간으로 15ms, 커널 CPU 시간으로 12ms만 사용했다.

```bash
$ time curl https://missing.csail.mit.edu &> /dev/null
real    0m2.561s
user    0m0.015s
sys     0m0.012s
```

## 프로파일러 (Profilers)

### CPU

대부분 사람들이 **프로파일러**라고 말할 때는 가장 흔한 **CPU 프로파일러**를 의미한다.
CPU 프로파일러에는 크게 **트레이싱(tracing)** 프로파일러와 **샘플링(sampling)** 프로파일러 두 종류가 있다.
트레이싱 프로파일러는 프로그램이 수행하는 모든 함수 호출 기록을 유지하는 반면, 샘플링 프로파일러는 프로그램의 상태를 주기적으로(보통 매 밀리초마다) 조사하여 스택을 기록한다.
이 기록들을 사용하여 프로그램이 가장 많은 시간을 어디에 썼는지 집계된 통계치를 보여준다.
이 주제에 대해 더 자세히 알고 싶다면 [이 입문 기사](https://jvns.ca/blog/2017/12/17/how-do-ruby---python-profilers-work-)를 추천한다.

대부분의 프로그래밍 언어는 코드를 분석하는 데 사용할 수 있는 어떤 형태의 커맨드 라인 프로파일러를 가지고 있다.
이들은 대개 완전한 IDE와 통합되어 있지만, 이번 강의에서는 커맨드 라인 도구 자체에 집중할 것이다.

Python에서는 `cProfile` 모듈을 사용하여 함수 호출당 시간을 프로파일링할 수 있다. 다음은 Python으로 구현한 조잡한 grep 예제이다.

```python
#!/usr/bin/env python

import sys, re

def grep(pattern, file):
    with open(file, 'r') as f:
        print(file)
        for i, line in enumerate(f.readlines()):
            pattern = re.compile(pattern)
            match = pattern.search(line)
            if match is not None:
                print("{}: {}".format(i, line), end="")

if __name__ == '__main__':
    times = int(sys.argv[1])
    pattern = sys.argv[2]
    for i in range(times):
        for file in sys.argv[3:]:
            grep(pattern, file)
```

다음 명령어를 사용하여 이 코드를 프로파일링할 수 있다. 출력 결과를 분석해 보면 I/O가 대부분의 시간을 차지하고 있으며, 정규 표현식을 컴파일하는 데에도 상당한 시간이 걸린다는 점을 알 수 있다. 정규 표현식은 한 번만 컴파일하면 되므로 루프 밖으로 빼낼 수 있다.

```
$ python -m cProfile -s tottime grep.py 1000 '^(import|\s*def)[^,]*$' *.py

[프로그램 출력 생략]

 ncalls  tottime  percall  cumtime  percall filename:lineno(function)
     8000    0.266    0.000    0.292    0.000 {built-in method io.open}
     8000    0.153    0.000    0.894    0.000 grep.py:5(grep)
    17000    0.101    0.000    0.101    0.000 {built-in method builtins.print}
     8000    0.100    0.000    0.129    0.000 {method 'readlines' of '_io._IOBase' objects}
    93000    0.097    0.000    0.111    0.000 re.py:286(_compile)
    93000    0.069    0.000    0.069    0.000 {method 'search' of '_sre.SRE_Pattern' objects}
    93000    0.030    0.000    0.141    0.000 re.py:231(compile)
    17000    0.019    0.000    0.029    0.000 codecs.py:318(decode)
        1    0.017    0.017    0.911    0.911 grep.py:3(<module>)

[생략된 라인들]
```


Python의 `cProfile` 프로파일러(및 많은 프로파일러들)의 주의점은 함수 호출당 시간을 표시한다는 것이다. 코드가 내부 함수 호출까지 계산하기 때문에, 특히 서드파티 라이브러리를 사용하는 경우 금방 직관적이지 않게 될 수 있다.
프로파일링 정보를 표시하는 더 직관적인 방법은 코드 라인당 소요 시간을 포함하는 것이며, 이것이 바로 **라인 프로파일러(line profilers)**가 하는 일이다.

예를 들어, 다음 Python 코드는 클래스 웹사이트에 요청을 보내고 응답을 파싱하여 페이지 내의 모든 URL을 가져온다.

```python
#!/usr/bin/env python
import requests
from bs4 import BeautifulSoup

# line_profiler에게 이 함수를 분석하고 싶다고
# 알려주는 데코레이터이다.
@profile
def get_urls():
    response = requests.get('https://missing.csail.mit.edu')
    s = BeautifulSoup(response.content, 'lxml')
    urls = []
    for url in s.find_all('a'):
        urls.append(url['href'])

if __name__ == '__main__':
    get_urls()
```

Python의 `cProfile`을 사용하면 2500줄이 넘는 출력을 얻게 되며, 정렬을 하더라도 어디에 시간이 소요되는지 이해하기 어렵다. [`line_profiler`](https://github.com/pyutils/line_profiler)를 실행하면 각 라인당 소요 시간을 보여준다.

```bash
$ kernprof -l -v a.py
Wrote profile results to urls.py.lprof
Timer unit: 1e-06 s

Total time: 0.636188 s
File: a.py
Function: get_urls at line 5

Line #  Hits         Time  Per Hit   % Time  Line Contents
==============================================================
 5                                           @profile
 6                                           def get_urls():
 7         1     613909.0 613909.0     96.5      response = requests.get('https://missing.csail.mit.edu')
 8         1      21559.0  21559.0      3.4      s = BeautifulSoup(response.content, 'lxml')
 9         1          2.0      2.0      0.0      urls = []
10        25        685.0     27.4      0.1      for url in s.find_all('a'):
11        24         33.0      1.4      0.0          urls.append(url['href'])
```

### 메모리 (Memory)

C나 C++ 같은 언어에서 메모리 누수(memory leaks)는 프로그램이 더 이상 필요하지 않은 메모리를 해제하지 않게 할 수 있다.
메모리 디버깅 과정을 돕기 위해 메모리 누수를 식별해 주는 [Valgrind](https://valgrind.org/) 같은 도구를 사용할 수 있다.

Python과 같이 가비지 컬렉션(garbage collection)이 작동하는 언어에서도 메모리 프로파일러를 사용하는 것은 유용하다. 메모리 내 객체에 대한 포인터가 남아 있는 한 가비지 컬렉션이 수행되지 않기 때문이다.
다음은 [memory-profiler](https://pypi.org/project/memory-profiler/)를 사용하여 실행한 프로그램과 그 결과이다 (`line-profiler`와 같은 데코레이터 사용에 유의하라).

```python
@profile
def my_func():
    a = [1] * (10 ** 6)
    b = [2] * (2 * 10 ** 7)
    del b
    return a

if __name__ == '__main__':
    my_func()
```

```bash
$ python -m memory_profiler example.py
Line #    Mem usage  Increment   Line Contents
==============================================
     3                           @profile
     4      5.97 MB    0.00 MB   def my_func():
     5     13.61 MB    7.64 MB       a = [1] * (10 ** 6)
     6    166.20 MB  152.59 MB       b = [2] * (2 * 10 ** 7)
     7     13.61 MB -152.59 MB       del b
     8     13.61 MB    0.00 MB       return a
```

### 이벤트 프로파일링 (Event Profiling)

디버깅을 위해 `strace`를 사용했던 것처럼, 프로파일링할 때 실행 중인 코드의 세부 사항을 무시하고 블랙박스처럼 다루고 싶을 때가 있다.
[`perf`](https://www.man7.org/linux/man-pages/man1/perf.1.html) 명령어는 CPU의 차이를 추상화하여 시간이나 메모리가 아닌 프로그램과 관련된 시스템 이벤트를 보고한다.
예를 들어 `perf`는 낮은 캐시 지역성(cache locality), 많은 양의 페이지 폴트(page faults) 또는 라이브락(livelocks) 등을 쉽게 보고할 수 있다. 다음은 명령어 개요이다.

- `perf list` - perf로 추적 가능한 이벤트 나열.
- `perf stat COMMAND ARG1 ARG2` - 프로세스나 명령어와 관련된 다양한 이벤트 횟수 획득.
- `perf record COMMAND ARG1 ARG2` - 명령어 실행을 기록하고 통계 데이터를 `perf.data`라는 파일에 저장.
- `perf report` - `perf.data`에 수집된 데이터를 포맷팅하여 출력.


### 시각화 (Visualization)

실제 프로그램에 대한 프로파일러 출력은 소프트웨어 프로젝트의 복잡성 때문에 방대한 양의 정보를 포함하게 된다.
인간은 시각적인 동물이며, 방대한 숫자를 읽고 의미를 파악하는 데 서툴다.
따라서 프로파일러의 출력을 파싱하기 쉬운 방식으로 보여주는 많은 도구들이 있다.

샘플링 프로파일러의 CPU 프로파일링 정보를 표시하는 일반적인 방법 중 하나는 **플레임 그래프(Flame Graph)**를 사용하는 것이다. Y축에는 함수 호출 계층 구조를, X축에는 소요 시간에 비례하는 너비를 표시한다. 이들은 대화형(interactive)이기도 해서, 프로그램의 특정 부분으로 줌인하여 스택 트레이스를 얻을 수도 있다(아래 이미지를 클릭해 보라).

[![FlameGraph](https://www.brendangregg.com/FlameGraphs/cpu-bash-flamegraph.svg)](https://www.brendangregg.com/FlameGraphs/cpu-bash-flamegraph.svg)

콜 그래프(Call graphs) 또는 제어 흐름 그래프(control flow graphs)는 함수를 노드로, 함수 호출을 노드 간의 유향 간선(directed edges)으로 포함하여 프로그램 내 서브루틴 간의 관계를 보여준다. 호출 횟수나 소요 시간과 같은 프로파일링 정보와 결합하면, 콜 그래프는 프로그램의 흐름을 해석하는 데 매우 유용할 수 있다.
Python에서는 [`pycallgraph`](https://pycallgraph.readthedocs.io/) 라이브러리를 사용하여 이를 생성할 수 있다.

![Call Graph](https://upload.wikimedia.org/wikipedia/commons/2/2f/A_Call_Graph_generated_by_pycallgraph.png)


## 자원 모니터링 (Resource Monitoring)

때때로 프로그램의 성능을 분석하는 첫 번째 단계는 실제 자원 소비량이 얼마인지 이해하는 것이다.
프로그램은 자원이 제한될 때(예: 메모리 부족 또는 느린 네트워크 연결) 느리게 실행되는 경우가 많다.
CPU 사용량, 메모리 사용량, 네트워크, 디스크 사용량 등 다양한 시스템 자원을 조사하고 표시하는 수많은 커맨드 라인 도구들이 있다.

- **범용 모니터링** - 가장 인기 있는 것은 [`top`](https://www.man7.org/linux/man-pages/man1/top.1.html)의 개선된 버전인 [`htop`](https://htop.dev/)이다.
`htop`은 시스템에서 현재 실행 중인 프로세스들에 대한 다양한 통계를 보여준다. `htop`은 수많은 옵션과 키 바인딩을 가지고 있는데, 유용한 것들로는 프로세스 정렬을 위한 `<F6>`, 트리 계층 구조를 보여주는 `t`, 스레드를 켜고 끄는 `h` 등이 있다.
훌륭한 UI를 가진 유사한 구현체인 [`glances`](https://nicolargo.github.io/glances/)도 확인해 보라. 모든 프로세스에 걸친 집계 지표를 얻기 위한 [`dool`](https://github.com/scottchiefbaker/dool)은 I/O, 네트워킹, CPU 활용률, 컨텍스트 스위치 등 다양한 서브시스템에 대한 실시간 자원 지표를 계산해 주는 또 다른 멋진 도구이다.
- **I/O 작업** - [`iotop`](https://www.man7.org/linux/man-pages/man8/iotop.8.html)은 실시간 I/O 사용 정보를 표시하며, 프로세스가 과도한 I/O 디스크 작업을 수행 중인지 확인하는 데 유용하다.
- **디스크 사용량** - [`df`](https://www.man7.org/linux/man-pages/man1/df.1.html)는 파티션별 지표를 표시하고, [`du`](https://man7.org/linux/man-pages/man1/du.1.html)는 현재 디렉토리의 파일별 **디스크 사용량(disk usage)**을 표시한다. 이 도구들에서 `-h` 플래그는 사람이 읽기 쉬운(**h**uman readable) 형식으로 출력하도록 지시한다.
`du`의 더 대화형인 버전은 [`ncdu`](https://dev.yorhel.nl/ncdu)로, 탐색하면서 폴더를 이동하고 파일과 폴더를 삭제할 수 있게 해준다.
- **메모리 사용량** - [`free`](https://www.man7.org/linux/man-pages/man1/free.1.html)는 시스템의 전체 자유 메모리 및 사용 메모리 양을 표시한다. 메모리 정보는 `htop`과 같은 도구에서도 표시된다.
- **열린 파일** - [`lsof`](https://www.man7.org/linux/man-pages/man8/lsof.8.html)는 프로세스에 의해 열린 파일 정보를 나열한다. 어떤 프로세스가 특정 파일을 열었는지 확인하는 데 매우 유용할 수 있다.
- **네트워크 연결 및 설정** - [`ss`](https://www.man7.org/linux/man-pages/man8/ss.8.html)는 들어오고 나가는 네트워크 패킷 통계뿐만 아니라 인터페이스 통계도 모니터링할 수 있게 해준다. `ss`의 흔한 사용 사례는 머신에서 어떤 프로세스가 특정 포트를 사용 중인지 알아내는 것이다. 라우팅, 네트워크 장치 및 인터페이스를 표시하려면 [`ip`](https://man7.org/linux/man-pages/man8/ip.8.html)를 사용할 수 있다. 참고로 `netstat`와 `ifconfig`는 각각 앞서 언급한 도구들로 대체되어 사용이 권장되지 않는다(deprecated).
- **네트워크 사용량** - [`nethogs`](https://github.com/raboof/nethogs)와 [`iftop`](https://pdw.ex-parrot.com/iftop/)은 네트워크 사용량을 모니터링하기 위한 좋은 대화형 CLI 도구이다.

이 도구들을 테스트하고 싶다면 [`stress`](https://linux.die.net/man/1/stress) 명령어를 사용하여 머신에 인위적으로 부하를 가할 수도 있다.


### 특수 도구 (Specialized tools)

때로는 어떤 소프트웨어를 사용할지 결정하는 데 블랙박스 벤치마킹만으로 충분할 때가 있다.
[`hyperfine`](https://github.com/sharkdp/hyperfine) 같은 도구는 커맨드 라인 프로그램을 빠르게 벤치마킹할 수 있게 해준다.
예를 들어, 쉘 도구 강의에서 우리는 `find`보다 `fd`를 추천했다. 자주 실행하는 작업에서 `hyperfine`을 사용하여 두 도구를 비교해 볼 수 있다.
예를 들어 아래 예시에서 `fd`는 내 머신에서 `find`보다 20배 더 빨랐다.

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

디버깅의 경우와 마찬가지로, 브라우저들도 웹페이지 로딩을 프로파일링하여 어디에 시간이 소요되는지(로딩, 렌더링, 스크립팅 등) 파악할 수 있는 훌륭한 도구들을 갖추고 있다.
[Firefox](https://profiler.firefox.com/docs/)와 [Chrome](https://developers.google.com/web/tools/chrome-devtools/rendering-tools)에 대한 더 자세한 정보를 확인해 보라.

# 연습 문제 (Exercises)

## 디버깅 (Debugging)
1. Linux에서 `journalctl`을 사용하거나 macOS에서 `log show`를 사용하여 지난 하루 동안의 슈퍼 유저(superuser) 접근 및 명령어들을 확인하라.
기록이 없다면 `sudo ls`와 같은 무해한 명령어를 실행하고 다시 확인해 보라.

1. 명령어들에 익숙해지기 위해 [이 `pdb` 튜토리얼](https://github.com/spiside/pdb-tutorial)을 직접 따라 해보라. 더 깊이 있는 튜토리얼을 원한다면 [이 글](https://realpython.com/python-debugging-pdb)을 읽어보라.

1. [`shellcheck`](https://www.shellcheck.net/)를 설치하고 다음 스크립트를 확인해 보라. 코드의 무엇이 잘못되었는가? 수정하라. 경고를 자동으로 받을 수 있도록 에디터에 린터 플러그인을 설치하라.

   ```bash
   #!/bin/sh
   ## 예시: 여러 문제가 있는 전형적인 스크립트
   for f in $(ls *.m3u)
   do
     grep -qi hq.*mp3 $f \
       && echo -e 'Playlist $f contains a HQ file in mp3 format'
   done
   ```

1. (고급) [가역 디버깅(reversible debugging)](https://undo.io/resources/reverse-debugging-whitepaper/)에 대해 읽어보고 [`rr`](https://rr-project.org/)이나 [`RevPDB`](https://morepypy.blogspot.com/2016/07/reverse-debugging-for-python.html)를 사용하여 간단한 예제를 실행해 보라.
## 프로파일링 (Profiling)

1. [여기](/static/files/sorts.py)에 몇 가지 정렬 알고리즘 구현체가 있다. [`cProfile`](https://docs.python.org/3/library/profile.html)과 [`line_profiler`](https://github.com/pyutils/line_profiler)를 사용하여 삽입 정렬(insertion sort)과 퀵 정렬(quicksort)의 런타임을 비교하라. 각 알고리즘의 병목 지점은 어디인가? 그다음 `memory_profiler`를 사용하여 메모리 소비량을 확인하라. 왜 삽입 정렬이 더 나은가? 이제 제자리(inplace) 버전의 퀵 정렬을 확인하라. 도전 과제: `perf`를 사용하여 각 알고리즘의 사이클 수(cycle counts)와 캐시 히트(cache hits) 및 미스(misses)를 확인하라.

1. 여기 각 숫자에 대해 함수를 사용하는, (다소 복잡하게 짜인) 피보나치 수 계산 Python 코드가 있다.

   ```python
   #!/usr/bin/env python
   def fib0(): return 0

   def fib1(): return 1

   s = """def fib{}(): return fib{}() + fib{}()"""

   if __name__ == '__main__':

       for n in range(2, 10):
           exec(s.format(n, n-1, n-2))
       # from functools import lru_cache
       # for n in range(10):
       #     exec("fib{} = lru_cache(1)(fib{})".format(n, n))
       print(eval("fib9()"))
   ```

   코드를 파일에 넣고 실행 가능하게 만드라. 사전 요구 사항인 [`pycallgraph`](https://lewiscowles1986.github.io/py-call-graph/)와 [`graphviz`](https://graphviz.org/)를 설치하라. (`dot`을 실행할 수 있다면 이미 GraphViz가 있는 것이다.) 코드를 `pycallgraph graphviz -- ./fib.py`로 실행하고 `pycallgraph.png` 파일을 확인하라. `fib0`은 몇 번 호출되었는가? 함수를 메모이제이션(memoizing)하여 성능을 개선할 수 있다. 주석 처리된 라인들을 해제하고 이미지를 다시 생성하라. 이제 각 `fibN` 함수를 몇 번 호출하는가?

1. 흔한 문제 중 하나는 사용하려는 포트가 이미 다른 프로세스에 의해 점유되어 있는 경우이다. 해당 프로세스의 PID를 찾는 법을 배워보자. 먼저 `python -m http.server 4444`를 실행하여 4444 포트에서 대기하는 최소한의 웹 서버를 시작하라. 별도의 터미널에서 `lsof | grep LISTEN`을 실행하여 모든 리스닝 프로세스와 포트를 출력하라. 해당 프로세스의 PID를 찾아 `kill <PID>` 명령어로 종료하라.

1. 프로세스의 자원을 제한하는 것도 유용한 도구가 될 수 있다.
`stress -c 3`을 실행하고 `htop`으로 CPU 소비량을 시각화하라. 이제 `taskset --cpu-list 0,2 stress -c 3`을 실행하고 시각화하라. `stress`가 3개의 CPU를 사용하고 있는가? 왜 그렇지 않은가? [`man taskset`](https://www.man7.org/linux/man-pages/man1/taskset.1.html)을 읽어보라.
도전 과제: [`cgroups`](https://www.man7.org/linux/man-pages/man7/cgroups.7.html)를 사용하여 동일한 결과를 얻어보라. `stress -m`의 메모리 소비량을 제한해 보라.

1. (고급) `curl ipinfo.io` 명령어는 HTTP 요청을 수행하여 사용자의 공용 IP 정보를 가져온다. [Wireshark](https://www.wireshark.org/)를 열고 `curl`이 보내고 받은 요청 및 응답 패킷을 스니핑(sniff)해 보라. (힌트: HTTP 패킷만 보려면 `http` 필터를 사용하라).
EOF
