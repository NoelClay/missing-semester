---
layout: lecture
permalink: /2020/kr/command-line/
title: "커맨드 라인 환경 (Command-line Environment)"
description: >
  작업 제어(job control), 터미널 멀티플렉서(terminal multiplexer), 도트파일(dotfiles), 그리고 SSH를 이용한 원격 머신 사용법에 대해 배웁니다.
thumbnail: /static/assets/thumbnails/2020/lec5.png
date: 2020-01-21
ready: true
video:
  aspect: 56.25
  id: e8BO_dYxk5c
---

이번 강의에서는 쉘을 사용할 때 워크플로우(workflow)를 개선할 수 있는 여러 가지 방법을 살펴본다. 우리는 그동안 쉘을 사용해 왔지만, 주로 개별 명령어를 실행하는 데 집중했다. 이제 여러 프로세스를 동시에 실행하면서 관리하는 방법, 특정 프로세스를 중단하거나 일시 정지하는 방법, 그리고 프로세스를 백그라운드에서 실행하는 방법을 알아본다.

또한, 별칭(aliases)을 정의하고 도트파일(dotfiles)을 사용하여 쉘과 다른 도구들을 개선하는 방법도 배울 것이다. 이 두 가지 모두 시간을 절약하는 데 도움이 된다. 예를 들어, 긴 명령어를 입력할 필요 없이 모든 머신에서 동일한 설정을 사용할 수 있다. 마지막으로 SSH를 사용하여 원격 머신에서 작업하는 방법을 살펴본다.


# 작업 제어 (Job Control)

어떤 경우에는 실행 중인 작업(job)을 중단해야 할 때가 있다. 예를 들어 명령어가 완료되는 데 너무 오래 걸리는 경우(예: 검색할 디렉토리 구조가 매우 큰 `find`)이다.
대부분의 경우 `Ctrl-C`를 누르면 명령어가 중단된다.
하지만 이것이 실제로 어떻게 작동하며, 왜 가끔 프로세스 중단에 실패하는 것일까?

## 프로세스 종료 (Killing a process)

쉘은 프로세스에 정보를 전달하기 위해 **시그널(signal)**이라는 UNIX 통신 메커니즘을 사용한다. 프로세스가 시그널을 받으면 실행을 중단하고 시그널을 처리하며, 시그널이 전달한 정보에 따라 실행 흐름을 바꿀 수도 있다. 이러한 이유로 시그널은 **소프트웨어 인터럽트(software interrupts)**라고 불린다.

우리의 경우 `Ctrl-C`를 입력하면 쉘이 프로세스에 `SIGINT` 시그널을 전달하게 된다.

다음은 `SIGINT`를 캡처하여 무시하고 중단되지 않는 최소한의 Python 프로그램 예시이다. 이 프로그램을 종료하려면 대신 `Ctrl-\`를 입력하여 `SIGQUIT` 시그널을 사용할 수 있다.

```python
#!/usr/bin/env python
import signal, time

def handler(signum, time):
    print("\nSIGINT를 받았지만, 멈추지 않는다")

signal.signal(signal.SIGINT, handler)
i = 0
while True:
    time.sleep(.1)
    print("\r{}".format(i), end="")
    i += 1
```

이 프로그램에 `SIGINT`를 두 번 보낸 후 `SIGQUIT`을 보냈을 때 어떤 일이 일어나는지 보여준다. 터미널에서 `Ctrl`을 입력하면 `^`로 표시된다는 점에 유의하라.

```
$ python sigint.py
24^C
SIGINT를 받았지만, 멈추지 않는다
26^C
SIGINT를 받았지만, 멈추지 않는다
30^\[1]    39913 quit       python sigint.py
```

`SIGINT`와 `SIGQUIT`은 보통 터미널 관련 요청과 관련이 있지만, 프로세스에 정상적으로 종료하도록 요청하는 더 일반적인 시그널은 `SIGTERM` 시그널이다.
이 시그널을 보내려면 `kill -TERM <PID>` 구문과 함께 [`kill`](https://www.man7.org/linux/man-pages/man1/kill.1.html) 명령어를 사용할 수 있다.

## 프로세스 일시 정지 및 백그라운드 실행 (Pausing and backgrounding processes)

시그널은 프로세스를 종료하는 것 외에 다른 일도 할 수 있다. 예를 들어 `SIGSTOP`은 프로세스를 일시 정지시킨다. 터미널에서 `Ctrl-Z`를 입력하면 쉘이 `SIGTSTP` 시그널을 보내도록 유도한다. 이는 Terminal Stop의 약자이다(즉, `SIGSTOP`의 터미널 버전이다).

일시 정지된 작업은 각각 [`fg`](https://www.man7.org/linux/man-pages/man1/fg.1p.html) 또는 [`bg`](https://man7.org/linux/man-pages/man1/bg.1p.html)를 사용하여 포그라운드(foreground) 또는 백그라운드(background)에서 계속 실행할 수 있다.

[`jobs`](https://www.man7.org/linux/man-pages/man1/jobs.1p.html) 명령어는 현재 터미널 세션과 관련된 완료되지 않은 작업들을 나열한다.
이러한 작업들을 참조할 때는 PID를 사용할 수 있다([`pgrep`](https://www.man7.org/linux/man-pages/man1/pgrep.1.html)을 사용하여 찾을 수 있다).
더 직관적인 방법은 퍼센트 기호 뒤에 (`jobs`에 표시된) 작업 번호를 붙여 참조하는 것이다. 마지막으로 백그라운드에서 실행된 작업을 참조하려면 `$!` 특수 매개변수를 사용할 수 있다.

한 가지 더 알아두어야 할 점은 명령어 끝에 `&` 접미사를 붙이면 명령어가 백그라운드에서 실행되어 프롬프트를 다시 사용할 수 있다는 것이다. 다만 여전히 쉘의 STDOUT을 사용하므로 번거로울 수 있다(이 경우 쉘 리다이렉션을 사용하라).

이미 실행 중인 프로그램을 백그라운드로 보내려면 `Ctrl-Z`를 누른 뒤 `bg`를 입력하면 된다.
백그라운드 프로세스는 여전히 터미널의 자식 프로세스이므로 터미널을 닫으면 종료된다는 점에 유의하라(이때 또 다른 시그널인 `SIGHUP`이 전송된다).
이를 방지하려면 프로그램을 [`nohup`](https://www.man7.org/linux/man-pages/man1/nohup.1.html)(`SIGHUP`을 무시하도록 하는 래퍼)으로 실행하거나, 프로세스가 이미 시작된 경우 `disown`을 사용하라.
또는 다음 섹션에서 살펴볼 터미널 멀티플렉서를 사용할 수도 있다.

아래는 이러한 개념 중 일부를 보여주는 샘플 세션이다.

```
$ sleep 1000
^Z
[1]  + 18653 suspended  sleep 1000

$ nohup sleep 2000 &
[2] 18745
appending output to nohup.out

$ jobs
[1]  + suspended  sleep 1000
[2]  - running    nohup sleep 2000

$ bg %1
[1]  - 18653 continued  sleep 1000

$ jobs
[1]  - running    sleep 1000
[2]  + running    nohup sleep 2000

$ kill -STOP %1
[1]  + 18653 suspended (signal)  sleep 1000

$ jobs
[1]  + suspended (signal)  sleep 1000
[2]  - running    nohup sleep 2000

$ kill -SIGHUP %1
[1]  + 18653 hangup     sleep 1000

$ jobs
[2]  + running    nohup sleep 2000

$ kill -SIGHUP %2

$ jobs
[2]  + running    nohup sleep 2000

$ kill %2
[2]  + 18745 terminated  nohup sleep 2000

$ jobs

```

특별한 시그널인 `SIGKILL`은 프로세스에 의해 캡처될 수 없으며 항상 즉시 프로세스를 종료시킨다. 하지만 고아(orphaned) 자식 프로세스를 남기는 것과 같은 나쁜 부작용이 있을 수 있다.

이러한 시그널과 다른 시그널들에 대해 더 자세히 알아보려면 [여기](https://en.wikipedia.org/wiki/Signal_(IPC))를 확인하거나 `man signal` 또는 `kill -l`을 입력하라.


# 터미널 멀티플렉서 (Terminal Multiplexers)

커맨드 라인 인터페이스(CLI)를 사용할 때 종종 두 가지 이상의 작업을 동시에 실행하고 싶을 때가 있다.
예를 들어 에디터와 프로그램을 나란히 실행하고 싶을 수 있다.
새 터미널 창을 열어서 이를 달성할 수도 있지만, 터미널 멀티플렉서를 사용하는 것이 더 다재다능한 솔루션이다.

[`tmux`](https://www.man7.org/linux/man-pages/man1/tmux.1.html)와 같은 터미널 멀티플렉서는 창(pane)과 탭을 사용하여 터미널 창을 멀티플렉싱(multiplexing)하여 여러 쉘 세션과 상호작용할 수 있게 해준다.
게다가 터미널 멀티플렉서를 사용하면 현재 터미널 세션을 분리(detach)하고 나중에 다시 연결(reattach)할 수 있다.
이는 `nohup`이나 유사한 트릭을 사용할 필요가 없게 해주므로 원격 머신에서 작업할 때 워크플로우를 훨씬 더 좋게 만들 수 있다.

요즘 가장 인기 있는 터미널 멀티플렉서는 [`tmux`](https://www.man7.org/linux/man-pages/man1/tmux.1.html)이다. `tmux`는 고도로 설정 가능하며 관련 키 바인딩을 사용하여 여러 탭과 창을 만들고 빠르게 탐색할 수 있다.

`tmux`는 키 바인딩을 알고 있어야 하며, 모든 키 바인딩은 `<C-b> x` 형태를 띤다. 이는 (1) `Ctrl+b`를 누르고, (2) `Ctrl+b`에서 손을 뗀 다음, (3) `x`를 누르는 것을 의미한다. `tmux`는 다음과 같은 객체 계층 구조를 가진다.
- **세션(Sessions)** - 세션은 하나 이상의 창을 가진 독립적인 작업 공간이다.
    + `tmux`는 새 세션을 시작한다.
    + `tmux new -s NAME`은 해당 이름으로 시작한다.
    + `tmux ls`는 현재 세션들을 나열한다.
    + `tmux` 내에서 `<C-b> d`를 입력하면 현재 세션을 분리한다.
    + `tmux a`는 마지막 세션에 다시 연결한다. `-t` 플래그를 사용하여 어떤 세션인지 지정할 수 있다.

- **창(Windows)** - 에디터나 브라우저의 탭과 동일하며, 동일한 세션 내에서 시각적으로 분리된 부분이다.
    + `<C-b> c`는 새 창을 만든다. 닫으려면 `<C-d>`를 입력하여 쉘을 종료하면 된다.
    + `<C-b> N`은 _N_ 번째 창으로 이동한다. 번호가 매겨져 있음에 유의하라.
    + `<C-b> p`는 이전 창으로 이동한다.
    + `<C-b> n`은 다음 창으로 이동한다.
    + `<C-b> ,`는 현재 창의 이름을 변경한다.
    + `<C-b> w`는 현재 창들을 나열한다.

- **분할창(Panes)** - vim의 분할(split)과 마찬가지로, 하나의 화면에 여러 쉘을 가질 수 있게 해준다.
    + `<C-b> "`는 현재 분할창을 가로로 나눈다.
    + `<C-b> %`는 현재 분할창을 세로로 나눈다.
    + `<C-b> <방향키>`는 지정된 _방향_의 분할창으로 이동한다.
    + `<C-b> z`는 현재 분할창의 확대를 켜고 끈다.
    + `<C-b> [`는 스크롤백(scrollback)을 시작한다. 그 후 `<space>`를 눌러 선택을 시작하고 `<enter>`를 눌러 선택 영역을 복사할 수 있다.
    + `<C-b> <space>`는 분할창 배열을 순환한다.

추가적인 학습을 위해, [여기](https://www.hamvocke.com/blog/a-quick-and-easy-guide-to-tmux/)는 `tmux`에 대한 빠른 튜토리얼이며, [이곳](https://linuxcommand.org/lc3_adv_termmux.php)에는 원래의 `screen` 명령어를 다루는 더 자세한 설명이 있다. 또한 대부분의 UNIX 시스템에 기본 설치되어 있는 [`screen`](https://www.man7.org/linux/man-pages/man1/screen.1.html)도 익혀두는 것이 좋다.

# 별칭 (Aliases)

많은 플래그나 장황한 옵션이 포함된 긴 명령어를 입력하는 것은 지루한 일이 될 수 있다.
이러한 이유로 대부분의 쉘은 **별칭(aliasing)**을 지원한다.
쉘 별칭은 쉘이 자동으로 대신 바꿔줄 다른 명령어의 짧은 형태이다.
예를 들어 bash의 별칭은 다음과 같은 구조를 가진다.

```bash
alias 별칭_이름="명령어_내용 인자1 인자2"
```

[`alias`](https://www.man7.org/linux/man-pages/man1/alias.1p.html)는 하나의 인자를 받는 쉘 명령어이므로 등호 `=` 주위에 공백이 없어야 한다는 점에 유의하라.

별칭에는 편리한 기능들이 많다.

```bash
# 자주 사용하는 플래그에 대한 단축키 만들기
alias ll="ls -lh"

# 자주 사용하는 명령어에 대한 타이핑 줄이기
alias gs="git status"
alias gc="git commit"
alias v="vim"

# 오타 방지
alias sl=ls

# 더 나은 기본값을 위해 기존 명령어 덮어쓰기
alias mv="mv -i"           # -i는 덮어쓰기 전 확인 메시지를 띄움
alias mkdir="mkdir -p"     # -p는 필요에 따라 부모 디렉토리를 만듦
alias df="df -h"           # -h는 사람이 읽기 쉬운 형식으로 출력

# 별칭 조합 가능
alias la="ls -A"
alias lla="la -l"

# 별칭을 무시하고 실행하려면 앞에 \를 붙임
\ls
# 또는 unalias로 별칭을 완전히 비활성화
unalias la

# 별칭 정의를 확인하려면 별칭 이름만 호출
alias ll
# ll='ls -lh'가 출력됨
```

별칭은 기본적으로 쉘 세션 간에 유지되지 않는다.
별칭을 영구적으로 유지하려면 다음 섹션에서 소개할 `.bashrc` 또는 `.zshrc`와 같은 쉘 시작 파일에 포함시켜야 한다.


# 도트파일 (Dotfiles)

많은 프로그램이 **도트파일(dotfiles)**이라고 불리는 일반 텍스트 파일을 사용하여 설정된다.
(파일 이름이 `.`으로 시작하기 때문에 이렇게 불리며, 예: `~/.vimrc`, `ls` 시 기본적으로 숨겨진다).

쉘은 이러한 파일로 설정되는 프로그램의 한 예이다. 시작할 때 쉘은 설정을 로드하기 위해 많은 파일을 읽는다.
로그인 쉘인지 대화형(interactive) 쉘인지에 따라 쉘마다 전체 프로세스가 상당히 복잡할 수 있다.
[여기](https://blog.flowblok.id.au/2013-02/shell-startup-scripts.html)는 이 주제에 대한 훌륭한 자료이다.

`bash`의 경우 대부분의 시스템에서 `.bashrc`나 `.bash_profile`을 수정하면 된다.
여기에 방금 설명한 별칭이나 `PATH` 환경 변수 수정과 같이 시작할 때 실행하고 싶은 명령어들을 포함할 수 있다.
사실 많은 프로그램이 바이너리를 찾을 수 있도록 `export PATH="$PATH:/path/to/program/bin"`과 같은 라인을 쉘 설정 파일에 포함하라고 요청할 것이다.

도트파일을 통해 설정할 수 있는 도구들의 다른 예시는 다음과 같다.

- `bash` - `~/.bashrc`, `~/.bash_profile`
- `git` - `~/.gitconfig`
- `vim` - `~/.vimrc` 및 `~/.vim` 폴더
- `ssh` - `~/.ssh/config`
- `tmux` - `~/.tmux.conf`

도트파일을 어떻게 관리해야 할까? 도트파일은 별도의 폴더에 넣어 버전 관리 시스템(Git 등)으로 관리하고, 스크립트를 사용하여 **심볼릭 링크(symlink)**로 연결해야 한다. 이는 다음과 같은 장점이 있다.

- **쉬운 설치**: 새 머신에 로그인했을 때, 설정을 적용하는 데 1분이면 충분하다.
- **이식성**: 도구들이 어디서나 동일하게 작동한다.
- **동기화**: 어디서든 도트파일을 업데이트하고 모두 동기화된 상태로 유지할 수 있다.
- **변경 사항 추적**: 프로그래밍 커리어를 쌓는 내내 도트파일을 관리하게 될 것이므로, 장기 프로젝트에서 버전 히스토리는 유용하다.

도트파일에 무엇을 넣어야 할까?
온라인 문서나 [man 페이지](https://en.wikipedia.org/wiki/Man_page)를 읽어 도구의 설정에 대해 배울 수 있다. 또 다른 좋은 방법은 특정 프로그램에 대한 블로그 포스트를 검색하는 것이다. 저자들이 선호하는 설정을 알려줄 것이다. 또 다른 방법은 다른 사람들의 도트파일을 살펴보는 것이다. GitHub에서 수많은 [도트파일 저장소](https://github.com/search?o=desc&q=dotfiles&s=stars&type=Repositories)를 찾을 수 있다. 가장 인기 있는 것은 [여기](https://github.com/mathiasbynens/dotfiles)에서 볼 수 있다 (무작정 설정을 복사하는 것은 권장하지 않는다).
[여기](https://dotfiles.github.io/)는 이 주제에 대한 또 다른 좋은 자료이다.

강의 강사들의 모든 도트파일은 GitHub에 공개되어 있다: [Anish](https://github.com/anishathalye/dotfiles),
[Jon](https://github.com/jonhoo/configs),
[Jose](https://github.com/jjgo/dotfiles).


## 이식성 (Portability)

도트파일의 흔한 어려움 중 하나는 운영체제나 쉘이 다른 여러 머신에서 작업할 때 설정이 작동하지 않을 수 있다는 점이다. 때로는 특정 설정이 특정 머신에서만 적용되기를 원할 수도 있다.

이를 쉽게 만들어주는 몇 가지 트릭이 있다.
설정 파일이 지원한다면, 머신별 설정을 적용하기 위해 if 문에 해당하는 기능을 사용하라. 예를 들어 쉘의 경우 다음과 같이 할 수 있다.

```bash
if [[ "$(uname)" == "Linux" ]]; then {do_something}; fi

# 쉘별 기능을 사용하기 전에 확인
if [[ "$SHELL" == "zsh" ]]; then {do_something}; fi

# 머신별로 다르게 설정할 수도 있음
if [[ "$(hostname)" == "myServer" ]]; then {do_something}; fi
```

설정 파일이 지원한다면 include 기능을 활용하라. 예를 들어 `~/.gitconfig`에 다음과 같은 설정을 넣을 수 있다.

```
[include]
    path = ~/.gitconfig_local
```

그리고 각 머신에서 `~/.gitconfig_local`에 머신별 설정을 포함하면 된다. 머신별 설정을 위해 별도의 저장소에서 관리할 수도 있다.

이 아이디어는 여러 프로그램이 일부 설정을 공유하고 싶을 때도 유용하다. 예를 들어 `bash`와 `zsh` 모두 동일한 별칭 세트를 공유하게 하려면 `.aliases` 파일에 별칭을 쓰고 두 쉘 모두에서 다음과 같은 블록을 사용하면 된다.

```bash
# ~/.aliases가 존재하는지 확인하고 로드
if [ -f ~/.aliases ]; then
    source ~/.aliases
fi
```

# 원격 머신 (Remote Machines)

개발자들이 일상적인 업무에서 원격 서버를 사용하는 것이 점점 더 보편화되었다. 백엔드 소프트웨어를 배포하거나 더 높은 연산 능력이 필요한 서버를 사용해야 한다면, 시큐어 쉘(Secure Shell, SSH)을 사용하게 될 것이다. 다루었던 대부분의 도구와 마찬가지로 SSH는 고도로 설정 가능하므로 배워둘 가치가 있다.

서버에 `ssh`로 접속하려면 다음과 같은 명령어를 실행한다.

```bash
ssh foo@bar.mit.edu
```

여기서는 `bar.mit.edu` 서버에 `foo`라는 사용자로 ssh 접속을 시도하고 있다.
서버는 URL(`bar.mit.edu` 등)이나 IP(`foobar@192.168.1.42` 등)로 지정할 수 있다. 나중에 SSH 설정 파일을 수정하면 `ssh bar`와 같이 간단히 접속할 수 있는 방법을 알아볼 것이다.

## 명령어 실행

종종 간과되는 `ssh`의 기능 중 하나는 명령어를 직접 실행하는 능력이다.
`ssh foobar@server ls`는 foobar의 홈 폴더에서 `ls`를 실행한다.
파이프와 함께 작동하므로, `ssh foobar@server ls | grep PATTERN`은 원격의 `ls` 출력을 로컬에서 grep하고, `ls | ssh foobar@server grep PATTERN`은 로컬의 `ls` 출력을 원격에서 grep한다.


## SSH 키 (SSH Keys)

키 기반 인증은 공개키 암호화(public-key cryptography)를 활용하여 클라이언트가 비밀인 개인키를 공개하지 않고도 소유하고 있음을 서버에 증명한다. 이 방식을 사용하면 매번 비밀번호를 다시 입력할 필요가 없다. 하지만 개인키(보통 `~/.ssh/id_rsa`, 최근에는 `~/.ssh/id_ed25519`)는 사실상 비밀번호와 같으므로 주의해서 다루어야 한다.

### 키 생성

키 쌍을 생성하려면 [`ssh-keygen`](https://www.man7.org/linux/man-pages/man1/ssh-keygen.1.html)을 실행한다.
```bash
ssh-keygen -a 100 -t ed25519 -f ~/.ssh/id_ed25519
```
누군가 개인키를 가졌을 때 인증된 서버에 접속하는 것을 방지하기 위해 암호(passphrase)를 설정해야 한다. 매번 암호를 입력하지 않으려면 [`ssh-agent`](https://www.man7.org/linux/man-pages/man1/ssh-agent.1.html)나 [`gpg-agent`](https://linux.die.net/man/1/gpg-agent)를 사용하라.

SSH 키를 사용하여 GitHub에 푸시하도록 설정한 적이 있다면 이미 유효한 키 쌍이 있을 것이다. 암호가 있는지 확인하고 검증하려면 `ssh-keygen -y -f /path/to/key`를 실행할 수 있다.

### 키 기반 인증

`ssh`는 `.ssh/authorized_keys` 파일을 살펴보고 어떤 클라이언트를 허용할지 결정한다. 공개키를 복사하려면 다음과 같이 할 수 있다.

```bash
cat .ssh/id_ed25519.pub | ssh foobar@remote 'cat >> ~/.ssh/authorized_keys'
```

더 간단한 방법은 `ssh-copy-id`를 사용하는 것이다.

```bash
ssh-copy-id -i .ssh/id_ed25519 foobar@remote
```

## SSH를 통한 파일 복사

SSH를 통해 파일을 복사하는 방법은 여러 가지가 있다.

- `ssh+tee`: 가장 간단한 방법은 `ssh` 명령어 실행과 STDIN 입력을 사용하는 것이다. `cat localfile | ssh remote_server tee serverfile`. [`tee`](https://www.man7.org/linux/man-pages/man1/tee.1.html)는 STDIN의 출력을 파일에 쓴다는 점을 기억하라.
- [`scp`](https://www.man7.org/linux/man-pages/man1/scp.1.html): 많은 양의 파일이나 디렉토리를 복사할 때는 경로를 쉽게 재귀적으로 처리할 수 있는 시큐어 카피(secure copy) `scp` 명령어가 더 편리하다. 구문은 `scp 경로/to/local_file 원격_호스트:경로/to/remote_file`이다.
- [`rsync`](https://www.man7.org/linux/man-pages/man1/rsync.1.html): 로컬과 원격의 동일한 파일을 감지하여 다시 복사하는 것을 방지함으로써 `scp`를 개선한 도구이다. 심볼릭 링크, 권한에 대해 더 세밀한 제어를 제공하며, 이전에 중단된 복사를 재개할 수 있는 `--partial` 플래그와 같은 추가 기능이 있다. `rsync`는 `scp`와 유사한 구문을 가진다.

## 포트 포워딩 (Port Forwarding)

많은 시나리오에서 머신의 특정 포트에서 대기(listen)하는 소프트웨어를 실행하게 된다. 로컬 머신에서는 `localhost:PORT`나 `127.0.0.1:PORT`를 입력하면 되지만, 네트워크/인터넷을 통해 포트를 직접 사용할 수 없는 원격 서버는 어떻게 해야 할까?

이를 **포트 포워딩(port forwarding)**이라고 하며 로컬 포트 포워딩과 원격 포트 포워딩 두 가지 방식이 있다. (자세한 내용은 이미지를 참조하라. 이미지 출처: [StackOverflow](https://unix.stackexchange.com/questions/115897/whats-ssh-port-forwarding-and-whats-the-difference-between-ssh-local-and-remot)).

**로컬 포트 포워딩 (Local Port Forwarding)**
![Local Port Forwarding](/static/media/images/local-port-forwarding.png)

**원격 포트 포워딩 (Remote Port Forwarding)**
![Remote Port Forwarding](/static/media/images/remote-port-forwarding.png)

가장 흔한 시나리오는 원격 머신의 서비스가 특정 포트에서 대기하고 있고, 로컬 머신의 포트를 원격 포트로 포워딩하여 연결하고 싶은 로컬 포트 포워딩이다. 예를 들어 원격 서버에서 `8888` 포트를 사용하는 `jupyter notebook`을 실행한 경우, 이를 로컬의 `9999` 포트로 포워딩하려면 `ssh -L 9999:localhost:8888 foobar@remote_server`를 실행한 다음 로컬 머신에서 `localhost:9999`로 접속하면 된다.


## SSH 설정 (SSH Configuration)

지금까지 많은 인자들을 살펴보았다. 대안으로 다음과 같은 쉘 별칭을 만들고 싶을 수 있다.
```bash
alias my_server="ssh -i ~/.id_ed25519 --port 2222 -L 9999:localhost:8888 foobar@remote_server"
```

하지만 `~/.ssh/config`를 사용하는 더 좋은 방법이 있다.

```bash
Host vm
    User foobar
    HostName 172.16.174.141
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
    LocalForward 9999 localhost:8888

# 와일드카드 사용 가능
Host *.mit.edu
    User foobaz
```

별칭 대신 `~/.ssh/config` 파일을 사용하는 추가적인 장점은 `scp`, `rsync`, `mosh` 등 다른 프로그램들도 이 파일을 읽어 해당 설정을 플래그로 변환할 수 있다는 것이다.

`~/.ssh/config` 파일도 도트파일로 간주될 수 있으며, 일반적으로 다른 도트파일들과 함께 관리해도 괜찮다. 하지만 이를 공개할 때는 낯선 사람에게 서버 주소, 사용자 이름, 열린 포트 등의 정보를 제공할 수 있다는 점을 생각하라. 이는 일부 공격을 용이하게 할 수 있으므로 SSH 설정을 공유할 때는 신중해야 한다.

서버 측 설정은 보통 `/etc/ssh/sshd_config`에 지정된다. 여기서 비밀번호 인증 비활성화, SSH 포트 변경, X11 포워딩 활성화 등의 변경을 할 수 있다. 사용자별로 설정할 수도 있다.

## 기타 사항

컴퓨터 종료, 절전 모드 전환, 또는 네트워크 변경으로 인한 연결 끊김은 원격 서버 연결 시 흔히 겪는 고충이다. 또한 지연 시간(lag)이 심한 연결에서 ssh를 사용하는 것은 매우 답답할 수 있다. [Mosh](https://mosh.org/)(mobile shell)는 ssh를 개선하여 로밍 연결, 간헐적 연결을 허용하고 지능적인 로컬 에코(echo)를 제공한다.

때로는 원격 폴더를 마운트하는 것이 편리할 때가 있다. [sshfs](https://github.com/libfuse/sshfs)는 원격 서버의 폴더를 로컬에 마운트할 수 있게 해주어 로컬 에디터를 사용할 수 있게 해준다.


# 쉘 및 프레임워크 (Shells & Frameworks)

도구 및 스크립팅 강의에서는 `bash` 쉘을 다루었는데, 이는 가장 널리 사용되고 대부분의 시스템에서 기본 옵션이기 때문이다. 하지만 `bash`가 유일한 선택지는 아니다.

예를 들어 `zsh` 쉘은 `bash`의 상위 집합(superset)이며 다음과 같은 편리한 기능들을 기본적으로 제공한다.

- 더 스마트한 글로빙(globbing), `**`
- 인라인 글로빙/와일드카드 확장
- 철자 교정
- 더 나은 탭 완성/선택
- 경로 확장 (`cd /u/lo/b` 입력 시 `/usr/local/bin`으로 확장)

**프레임워크** 역시 쉘을 개선할 수 있다. 인기 있는 일반 프레임워크로는 [prezto](https://github.com/sorin-ionescu/prezto)나 [oh-my-zsh](https://ohmyz.sh/)가 있고, [zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting)이나 [zsh-history-substring-search](https://github.com/zsh-users/zsh-history-substring-search)와 같이 특정 기능에 집중한 작은 프레임워크들도 있다. [fish](https://fishshell.com/)와 같은 쉘은 다음과 같은 사용자 친화적인 기능들을 기본적으로 포함하고 있다.

- 오른쪽 프롬프트
- 명령어 문법 하이라이팅
- 히스토리 부분 문자열 검색
- man 페이지 기반 플래그 완성
- 더 스마트한 자동 완성
- 프롬프트 테마

이러한 프레임워크를 사용할 때 주의할 점은, 실행되는 코드가 제대로 최적화되지 않았거나 너무 많을 경우 쉘이 느려질 수 있다는 것이다. 언제든지 프로파일링을 통해 자주 사용하지 않거나 속도보다 가치가 낮다고 판단되는 기능은 비활성화할 수 있다.

# 터미널 에뮬레이터 (Terminal Emulators)

쉘을 커스터마이징하는 것과 더불어 **터미널 에뮬레이터(terminal emulator)**와 그 설정을 살펴보는 것도 가치가 있다. 세상에는 수많은 터미널 에뮬레이터가 존재한다([비교 자료](https://anarc.at/blog/2018-04-12-terminal-emulators-1/) 참조).

터미널에서 수백에서 수천 시간을 보낼 수 있으므로 설정을 살펴보는 것이 좋다. 터미널에서 수정하고 싶을 만한 요소들은 다음과 같다.

- 글꼴(Font) 선택
- 색상 테마(Color Scheme)
- 키보드 단축키
- 탭/분할창 지원
- 스크롤백 설정
- 성능 (예: [Alacritty](https://github.com/jwilm/alacritty)나 [kitty](https://sw.kovidgoyal.net/kitty/)와 같은 최신 터미널은 GPU 가속을 제공한다).

# 연습 문제

## 작업 제어 (Job control)

1. 지금까지 보았듯이 `ps aux | grep` 명령어를 사용하여 작업의 PID를 얻고 종료할 수 있지만, 더 좋은 방법이 있다. 터미널에서 `sleep 10000` 작업을 시작하고 `Ctrl-Z`로 백그라운드로 보낸 뒤 `bg`로 실행을 계속하라. 이제 PID를 직접 입력하지 않고 [`pgrep`](https://www.man7.org/linux/man-pages/man1/pgrep.1.html)을 사용하여 PID를 찾고 [`pkill`](https://man7.org/linux/man-pages/man1/pgrep.1.html)로 종료하라. (힌트: `-af` 플래그를 사용하라).

1. 어떤 프로세스가 완료될 때까지 다른 프로세스를 시작하고 싶지 않다고 가정해 보자. 어떻게 해야 할까? 이 연습 문제에서 제한 프로세스는 항상 `sleep 60 &`이다.
한 가지 방법은 [`wait`](https://www.man7.org/linux/man-pages/man1/wait.1p.html) 명령어를 사용하는 것이다. sleep 명령어를 실행하고 백그라운드 프로세스가 끝날 때까지 `ls`가 기다리도록 해보라.

    하지만 이 전략은 `wait`가 자식 프로세스에 대해서만 작동하기 때문에 다른 bash 세션에서 시작하면 실패한다. 강의에서 논의하지 않은 기능 중 하나는 `kill` 명령어의 종료 상태가 성공 시 0이고 그렇지 않으면 0이 아니라는 것이다. `kill -0`은 시그널을 보내지 않지만 프로세스가 존재하지 않으면 0이 아닌 종료 상태를 반환한다.
    PID를 인자로 받아 해당 프로세스가 완료될 때까지 기다리는 `pidwait`라는 bash 함수를 작성하라. 불필요한 CPU 낭비를 피하기 위해 `sleep`을 사용해야 한다.

## 터미널 멀티플렉서 (Terminal multiplexer)

1. 이 `tmux` [튜토리얼](https://www.hamvocke.com/blog/a-quick-and-easy-guide-to-tmux/)을 따라 해보고 [다음 단계](https://www.hamvocke.com/blog/a-guide-to-customizing-your-tmux-conf/)를 통해 기본적인 커스터마이징 방법을 익혀보라.

## 별칭 (Aliases)

1. 오타를 냈을 때를 대비해 `cd`로 리졸브되는 `dc` 별칭을 만드라.

1. `history | awk '{$1="";print substr($0,2)}' | sort | uniq -c | sort -n | tail -n 10`을 실행하여 가장 많이 사용한 명령어 상위 10개를 확인하고, 이에 대해 짧은 별칭을 만드는 것을 고려해 보라. 참고: 이 명령어는 Bash용이다. ZSH를 사용한다면 `history` 대신 `history 1`을 사용하라.


## 도트파일 (Dotfiles)

도트파일을 시작해 보자.
1. 도트파일을 위한 폴더를 만들고 버전 관리를 설정하라.
1. 적어도 하나 이상의 프로그램(예: 쉘)에 대해 커스터마이징을 포함한 설정을 추가하라 (시작은 `$PS1` 설정을 통한 쉘 프롬프트 커스터마이징처럼 간단한 것도 좋다).
1. 새 머신에서 (수동 작업 없이) 도트파일을 빠르게 설치할 수 있는 방법을 설정하라. 각 파일에 대해 `ln -s`를 호출하는 간단한 쉘 스크립트일 수도 있고, [전용 유틸리티](https://dotfiles.github.io/utilities/)를 사용할 수도 있다.
1. 깨끗한 가상 머신에서 설치 스크립트를 테스트하라.
1. 현재 사용 중인 모든 도구 설정을 도트파일 저장소로 마이그레이션하라.
1. 도트파일을 GitHub에 공개하라.

## 원격 머신 (Remote Machines)

이 연습 문제를 위해 Linux 가상 머신을 설치(하거나 기존 것을 사용)하라. 가상 머신에 익숙하지 않다면 [이 튜토리얼](https://hibbard.eu/install-ubuntu-virtual-box/)을 참고하여 설치하라.

1. `~/.ssh/`로 이동하여 SSH 키 쌍이 있는지 확인하라. 없다면 `ssh-keygen -a 100 -t ed25519`로 생성하라. 비밀번호를 사용하고 `ssh-agent`를 사용하는 것을 권장한다. 자세한 정보는 [여기](https://www.ssh.com/ssh/agent)를 참조하라.
1. `.ssh/config`를 다음과 같이 수정하라.

    ```bash
    Host vm
        User 사용자이름_입력
        HostName IP_입력
        IdentityFile ~/.ssh/id_ed25519
        LocalForward 9999 localhost:8888
    ```
1. `ssh-copy-id vm`을 사용하여 SSH 키를 서버에 복사하라.
1. VM에서 `python -m http.server 8888`을 실행하여 웹 서버를 시작하라. 로컬 머신에서 `http://localhost:9999`로 접속하여 VM 웹 서버에 액세스하라.
1. `sudo vim /etc/ssh/sshd_config`를 실행하여 SSH 서버 설정을 수정하고, `PasswordAuthentication` 값을 수정하여 비밀번호 인증을 비활성화하라. `PermitRootLogin` 값을 수정하여 루트 로그인을 비활성화하라. `sudo service sshd restart`로 `ssh` 서비스를 재시작하라. 다시 ssh 접속을 시도해 보라.
1. (도전 과제) VM에 [`mosh`](https://mosh.org/)를 설치하고 연결을 설정하라. 그런 다음 서버/VM의 네트워크 어댑터 연결을 끊으라. mosh가 이를 제대로 복구할 수 있는가?
1. (도전 과제) `ssh`에서 `-N`과 `-f` 플래그가 무엇을 하는지 알아보고 백그라운드 포트 포워딩을 수행하는 명령어를 찾아보라.
EOF
