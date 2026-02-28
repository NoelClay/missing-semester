---
layout: lecture
title: "강의 개요 + 셸 입문"
description: >
  이 수업의 취지를 소개하고, 셸 사용법을 배웁니다.
thumbnail: /static/assets/thumbnails/2026/lec1.png
date: 2026-01-12
ready: true
video:
  aspect: 56.25
  id: MSgoeuMqUmU
---

# 강사 소개

이 수업은 [Anish](https://anish.io/), [Jon](https://thesquareplanet.com/), [Jose](http://josejg.com/)가 공동으로 진행합니다. 저희는 모두 MIT 출신으로, 재학 시절에 이 MIT IAP 수업을 시작했습니다. 공동 연락처는 [missing-semester@mit.edu](mailto:missing-semester@mit.edu)입니다.

이 수업은 급여를 받고 진행하거나 수익화하지 않습니다. [강의 자료](https://missing.csail.mit.edu/)와 [강의 녹화본](https://www.youtube.com/@MissingSemester) 모두 온라인에 무료로 공개되어 있습니다. 저희의 활동을 지지하고 싶다면 가장 좋은 방법은 이 수업을 주변에 알리는 것입니다. 기업, 대학, 또는 단체에서 더 많은 인원을 대상으로 이 콘텐츠를 활용하신다면, 이메일로 경험담이나 후기를 보내주시면 감사히 읽겠습니다 :)

# 수업의 동기

컴퓨터 과학자로서 우리는 컴퓨터가 반복적인 작업을 처리하는 데 탁월하다는 것을 알고 있습니다. 그런데 우리는 너무 자주, 이 원칙이 우리가 만드는 프로그램만이 아니라 _우리 자신의 컴퓨터 사용 방식에도_ 똑같이 적용된다는 사실을 잊곤 합니다. 손끝에는 어떤 컴퓨터 관련 작업에서든 생산성을 높이고 더 복잡한 문제를 해결할 수 있게 해주는 방대한 도구들이 있습니다. 하지만 대부분의 사람들은 그 도구들의 극히 일부만 활용합니다. 막히면 인터넷에서 주문처럼 명령어를 복사·붙여넣기하며 간신히 버티는 수준에 그칩니다.

이 수업은 [그런 상황을 바꾸기 위한](/about/) 시도입니다.

우리는 여러분이 이미 알고 있는 도구를 최대한 활용하는 법을 가르치고, 새로운 도구를 도구상자에 추가하며, 나아가 스스로 더 많은 도구를 탐구하고 만들어볼 수 있는 자신감을 심어주고 싶습니다. 이것이 바로 대부분의 컴퓨터 과학 교육과정에서 빠져 있는 학기라고 저희는 생각합니다.

# 수업 구성

이 비학점 수업은 각각 특정 [주제](/2026/)를 다루는 9개의 1시간짜리 강의로 구성됩니다. 각 강의는 대체로 독립적이지만, 학기가 진행될수록 앞선 강의 내용을 알고 있다고 가정합니다. 강의 노트는 온라인에 있지만, 수업 중 데모 형식으로 다루는 내용은 노트에 없을 수도 있습니다. 지난 해와 마찬가지로 강의를 녹화해 [온라인](https://www.youtube.com/@MissingSemester)에 공개할 예정입니다.

불과 몇 시간짜리 강의에서 많은 내용을 다루는 만큼, 강의의 밀도가 꽤 높습니다. 각자의 속도로 내용을 익힐 수 있도록, 각 강의에는 핵심 개념을 직접 탐구할 수 있는 연습 문제가 포함되어 있습니다. 별도의 오피스 아워는 운영하지 않지만, [OSSU Discord](https://ossu.dev/#community)의 `#missing-semester-forum` 채널이나 [missing-semester@mit.edu](mailto:missing-semester@mit.edu)로 질문을 보내주시기 바랍니다.

시간의 한계로 인해 모든 도구를 풀 강의 수준으로 깊게 다루지는 못합니다. 가능한 경우 심화 학습을 위한 자료를 안내해 드리겠습니다. 특별히 흥미로운 주제가 있다면 저희에게 직접 연락해서 더 좋은 참고 자료를 물어보세요!

수업에 대한 피드백은 [missing-semester@mit.edu](mailto:missing-semester@mit.edu)로 보내주시면 감사하겠습니다.

# 주제 1: 셸

{% comment %}
lecturer: Jon
{% endcomment %}

## 셸이란?

오늘날 컴퓨터에는 다양한 명령 인터페이스가 있습니다. 화려한 그래픽 사용자 인터페이스(GUI), 음성 인터페이스, AR/VR, 그리고 최근에는 LLM까지 등장했죠. 이러한 인터페이스들은 80%의 사용 사례에서는 훌륭하지만, 근본적으로 할 수 있는 일이 제한되어 있습니다. 존재하지 않는 버튼은 누를 수 없고, 프로그래밍되지 않은 음성 명령은 내릴 수 없으니까요. 컴퓨터가 제공하는 도구들을 완전히 활용하려면 텍스트 인터페이스, 즉 **셸(Shell)**로 돌아가야 합니다.

거의 모든 플랫폼에는 어떤 형태로든 셸이 있으며, 대부분 여러 종류의 셸 중에서 선택할 수 있습니다. 세부적인 차이는 있지만, 핵심적으로는 모두 비슷합니다. 프로그램을 실행하고, 입력을 제공하고, 출력을 반구조적인 방식으로 확인할 수 있게 해줍니다.

셸 _프롬프트_ (명령을 입력하는 곳)를 열려면 먼저 _터미널_이 필요합니다. 터미널은 셸을 시각적으로 감싸는 인터페이스입니다. 대부분의 장치에는 이미 설치되어 있거나, 쉽게 설치할 수 있습니다.

- **Linux:**
  `Ctrl + Alt + T`를 누르거나 (대부분의 배포판에서 동작), 응용 프로그램 메뉴에서 "Terminal"을 검색합니다.
- **Windows:**
  `Win + R`을 눌러 `cmd` 또는 `powershell`을 입력하고 Enter를 누릅니다. 또는 시작 메뉴에서 "Terminal" 또는 "Command Prompt"를 검색합니다.
- **macOS:**
  `Cmd + Space`로 Spotlight를 열고, "Terminal"을 입력한 뒤 Enter를 누릅니다. 또는 응용 프로그램 → 유틸리티 → Terminal에서 찾을 수 있습니다.

Linux와 macOS에서는 보통 Bourne Again SHell, 즉 "bash"가 열립니다. bash는 가장 널리 사용되는 셸 중 하나로, 그 문법은 다른 많은 셸에서도 비슷하게 쓰입니다. Windows에서는 실행한 명령에 따라 "batch" 또는 "powershell" 셸이 열립니다. 이 두 셸은 Windows 전용이며, 이 수업에서 다루는 내용과는 다르지만 유사한 기능들이 있습니다. Windows 사용자라면 [Linux용 Windows 하위 시스템(WSL)](https://docs.microsoft.com/en-us/windows/wsl/)이나 Linux 가상 머신을 사용하는 것을 권장합니다.

bash 외에도 더 편리한 기능을 갖춘 셸들이 있습니다. fish와 zsh가 가장 인기 있는 것들입니다. 이 셸들은 매우 유용하지만(강사들도 모두 사용합니다), bash만큼 보편적이지는 않고 비슷한 개념을 공유하므로, 이 강의에서는 bash에 집중합니다.

## 셸을 왜 써야 할까?

셸은 보통 "클릭으로 하는 것"보다 훨씬 빠를 뿐 아니라, 어떤 그래픽 프로그램에서도 쉽게 찾아볼 수 없는 표현력을 갖추고 있습니다. 앞으로 보게 될 것처럼, 셸은 여러 프로그램을 창의적으로 _조합_하여 거의 모든 작업을 자동화할 수 있는 능력을 줍니다.

셸 사용법을 아는 것은 오픈 소스 소프트웨어의 세계를 헤쳐나가는 데도 매우 유용합니다(오픈 소스 소프트웨어는 대개 셸이 필요한 설치 지침을 제공하므로). 또한 소프트웨어 프로젝트의 지속적 통합(CI)을 구축하는 데도 도움이 됩니다([코드 품질 강의](/2026/code-quality/)에서 다룹니다). 그리고 다른 프로그램에 문제가 생겼을 때 오류를 디버깅하는 데도 꼭 필요합니다.

## 셸 탐색하기

터미널을 실행하면 대략 이런 모양의 _프롬프트_가 보입니다.

```console
missing:~$
```

이것이 셸의 주요 텍스트 인터페이스입니다. 여러분이 `missing`이라는 컴퓨터를 사용하고 있고, 현재 작업 디렉터리(현재 위치)가 `~`(홈 디렉터리의 단축 표현)임을 나타냅니다. `$` 기호는 여러분이 루트(root) 사용자가 아님을 의미합니다(이에 대해서는 나중에 다룹니다). 이 프롬프트에서 _명령_을 입력하면 셸이 해석하여 실행합니다. 가장 기본적인 명령은 프로그램을 실행하는 것입니다.

```console
missing:~$ date
Fri 10 Jan 2020 11:49:31 AM EST
missing:~$
```

여기서 `date` 프로그램을 실행했는데, (당연하게도) 현재 날짜와 시간을 출력합니다. 그런 다음 셸은 다음 명령을 기다립니다. _인수(argument)_를 함께 전달해서 명령을 실행할 수도 있습니다.

```console
missing:~$ echo hello
hello
```

이 경우, 셸에게 `echo` 프로그램을 `hello`라는 인수와 함께 실행하라고 지시했습니다. `echo` 프로그램은 단순히 인수를 그대로 출력합니다. 셸은 명령을 공백으로 분리하여 파싱한 뒤, 첫 번째 단어로 지정된 프로그램을 실행하고 이후 단어들을 인수로 전달합니다. 공백이나 특수 문자를 포함한 인수를 전달하려면(예: "My Photos"라는 디렉터리 이름), `'`나 `"`로 묶거나(`"My Photos"`), `\`로 해당 문자를 이스케이프할 수 있습니다(`My\ Photos`).

처음 배울 때 가장 중요한 명령 중 하나는 `man`("manual"의 줄임말)입니다. `man` 프로그램은 시스템의 모든 명령에 대한 정보를 조회할 수 있게 해줍니다. 예를 들어 `man date`를 실행하면 `date`가 무엇인지, 동작을 변경하는 다양한 인수들이 무엇인지 설명해줍니다. 대부분의 명령에서 `--help`를 인수로 전달해도 간략한 도움말을 볼 수 있습니다.

> [`tldr`](https://tldr.sh/) 설치도 고려해보세요. `man`과 함께 사용하면 터미널에서 바로 일반적인 사용 예제를 확인할 수 있습니다. LLM도 명령어 작동 방식을 설명하거나 원하는 작업을 수행하는 방법을 알려주는 데 매우 유용합니다.

`man` 다음으로 중요한 명령은 `cd`("change directory"의 줄임말)입니다. 이 명령은 사실 셸에 내장되어 있어 별도의 프로그램이 아닙니다(`which cd`를 실행하면 "no cd found"라고 나옵니다). 경로를 전달하면 그 경로가 현재 작업 디렉터리가 됩니다. 변경된 작업 디렉터리는 셸 프롬프트에도 반영됩니다.

```console
missing:~$ cd /bin
missing:/bin$ cd /
missing:/$ cd ~
missing:~$
```

> 셸에는 자동 완성 기능이 있어서, `<TAB>`을 눌러 경로를 더 빠르게 완성할 수 있습니다!

대부분의 명령은 별도로 지정하지 않으면 현재 작업 디렉터리에서 동작합니다. 현재 위치가 어딘지 확실하지 않다면 `pwd`를 실행하거나 `$PWD` 환경 변수를 출력(`echo $PWD`)하면 현재 작업 디렉터리를 확인할 수 있습니다.

현재 작업 디렉터리를 알면 _상대 경로_를 쓸 수 있어서 편리합니다. 지금까지 살펴본 경로들은 모두 _절대 경로_였습니다. 절대 경로는 `/`로 시작하며, 파일 시스템의 루트(`/`)에서 어떤 위치까지 가는 전체 디렉터리 목록을 나타냅니다. 실제로는 상대 경로를 더 자주 쓰게 됩니다. 상대 경로는 현재 작업 디렉터리를 기준으로 한 경로입니다. 상대 경로(`/`로 시작하지 않는 경로)에서는 첫 번째 경로 구성 요소가 현재 작업 디렉터리에서 조회되고, 이후 구성 요소들은 순서대로 탐색됩니다. 예시:

```console
missing:~$ cd /
missing:/$ cd bin
missing:/bin$
```

모든 디렉터리에는 특별한 두 가지 구성 요소 `.`과 `..`이 존재합니다. `.`은 "현재 디렉터리", `..`은 "부모 디렉터리"를 의미합니다. 예시:

```console
missing:~$ cd /
missing:/$ cd bin/../bin/../bin/././../bin/..
missing:/$
```

어떤 명령의 인수로든 절대 경로와 상대 경로를 혼용할 수 있습니다. 단, 상대 경로를 쓸 때는 현재 작업 디렉터리가 어디인지 항상 염두에 두세요!

> [`zoxide`](https://github.com/ajeetdsouza/zoxide) 설치도 고려해보세요. `z` 명령을 사용하면 자주 방문하는 경로를 기억해두었다가 타이핑을 최소화해서 바로 이동할 수 있습니다.

## 셸에서 사용 가능한 것들

그렇다면 셸은 `date`나 `echo`같은 프로그램을 어떻게 찾을까요? 셸은 명령을 실행하라는 요청을 받으면 `$PATH`라는 _환경 변수_를 참조합니다. `$PATH`에는 셸이 명령을 찾을 때 검색하는 디렉터리 목록이 담겨 있습니다.

```console
missing:~$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
missing:~$ which echo
/bin/echo
missing:~$ /bin/echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

`echo` 명령을 실행하면 셸은 `echo` 프로그램을 찾아야 한다고 판단하고, `$PATH`의 `:`로 구분된 디렉터리 목록에서 해당 이름의 파일을 검색합니다. 파일을 찾으면 실행합니다(단, 파일이 _실행 가능_ 상태여야 합니다. 이에 대해서는 나중에 다룹니다). 특정 프로그램 이름에 대해 어떤 파일이 실행되는지 알아볼 때는 `which` 프로그램을 사용합니다. `$PATH`를 완전히 우회하려면 실행할 파일의 _경로_를 직접 입력하면 됩니다.

셸에서 실행 가능한 모든 프로그램을 알아보려면 `$PATH`에 있는 모든 디렉터리의 내용을 나열하면 됩니다. 파일 목록을 보여주는 `ls` 프로그램에 디렉터리 경로를 전달하면 됩니다.

```console
missing:~$ ls /bin
```

> 더 사람 친화적인 `ls`를 원한다면 [`eza`](https://eza.rocks/) 설치를 고려해보세요.

대부분의 컴퓨터에서 이 명령은 _매우 많은_ 프로그램 목록을 출력하지만, 여기서는 가장 중요한 것들에만 집중합니다. 먼저 간단한 것들입니다.

- `cat file`: `file`의 내용을 출력합니다.
- `sort file`: `file`의 행들을 정렬하여 출력합니다.
- `uniq file`: `file`에서 연속으로 반복되는 행을 제거합니다.
- `head file`과 `tail file`: `file`의 처음 몇 줄과 마지막 몇 줄을 각각 출력합니다.

> 구문 강조와 스크롤 기능을 원한다면 `cat` 대신 [`bat`](https://github.com/sharkdp/bat) 설치를 고려해보세요.

또한 `grep pattern file`이 있습니다. `file`에서 `pattern`에 일치하는 행을 찾아줍니다. 매우 유용하고 예상보다 훨씬 다양한 기능을 갖추고 있어 특별히 주목할 만합니다. `pattern`은 사실 매우 복잡한 패턴을 표현할 수 있는 _정규 표현식(regular expression)_입니다. 이에 대해서는 [코드 품질 강의](/2026/code-quality/#regular-expressions)에서 다루겠습니다. 파일 대신 디렉터리를 지정하거나(또는 생략하면 `.`을 사용), `-r`을 전달해 디렉터리의 모든 파일을 재귀적으로 검색할 수도 있습니다.

> 더 빠르고 사람 친화적인(하지만 이식성은 낮은) `grep` 대안으로 [`ripgrep`](https://github.com/BurntSushi/ripgrep) 설치를 고려해보세요. `ripgrep`은 기본적으로 현재 작업 디렉터리를 재귀적으로 검색합니다!

인터페이스가 조금 더 복잡하지만 매우 유용한 도구들도 있습니다. 그 중 첫 번째는 `sed`입니다. 파일을 프로그래밍 방식으로 편집하는 도구로, 자체적인 프로그래밍 언어를 갖추고 있습니다. 하지만 가장 흔히 쓰이는 방식은 다음과 같습니다.

```console
missing:~$ sed -i 's/pattern/replacement/g' file
```

`file`에서 `pattern`의 모든 인스턴스를 `replacement`로 교체합니다. `-i`는 치환이 파일에 직접 적용됨을 의미합니다. `s/`는 sed 언어에서 치환(substitution)을 나타내고, `/`는 패턴과 교체 텍스트를 구분하며, 뒤의 `/g`는 각 행에서 첫 번째 인스턴스뿐만 아니라 모든 인스턴스를 교체하겠다는 의미입니다. `grep`과 마찬가지로 `pattern`은 정규 표현식으로 강력한 표현력을 제공합니다. 정규 표현식 치환에서는 `replacement`가 매치된 패턴의 일부를 역참조할 수도 있습니다. 잠시 후에 예제를 보여드리겠습니다.

다음으로 `find`가 있습니다. 특정 조건에 맞는 파일을 (재귀적으로) 찾아줍니다. 예시:

```console
missing:~$ find ~/Downloads -type f -name "*.zip" -mtime +30
```

다운로드 디렉터리에서 30일이 넘은 ZIP 파일을 찾습니다.

```console
missing:~$ find ~ -type f -size +100M -exec ls -lh {} \;
```

홈 디렉터리에서 100MB가 넘는 파일을 찾아 목록을 표시합니다. `-exec`는 독립적인 `;`(공백처럼 이스케이프 필요)으로 종료되는 _명령_을 인수로 받고, `{}`는 find가 찾은 각 파일 경로로 대체됩니다.

```console
missing:~$ find . -name "*.py" -exec grep -l "TODO" {} \;
```

TODO 항목이 있는 `.py` 파일을 찾습니다.

`find`의 문법이 다소 어려워 보일 수 있지만, 얼마나 유용한지는 충분히 느끼셨을 겁니다!

> 더 사람 친화적인(하지만 이식성은 낮은) `find` 대안으로 [`fd`](https://github.com/sharkdp/fd) 설치를 고려해보세요.

다음으로 소개할 `awk`도 `sed`처럼 자체 프로그래밍 언어를 갖추고 있습니다. `sed`가 파일을 편집하는 데 특화되어 있다면, `awk`는 파싱에 특화되어 있습니다. `awk`의 가장 일반적인 사용 사례는 CSV 파일처럼 규칙적인 형식을 가진 데이터 파일에서 특정 부분(즉, 열)만 추출하는 것입니다.

```console
missing:~$ awk '{print $2}' file
```

`file`의 각 줄에서 공백으로 구분된 두 번째 열을 출력합니다. `-F,`를 추가하면 쉼표로 구분된 두 번째 열을 출력합니다. `awk`는 행 필터링, 집계 계산 등 훨씬 더 많은 기능을 제공합니다. 연습 문제에서 맛보기로 확인해보세요.

이 도구들을 조합하면 다음과 같은 멋진 작업을 할 수 있습니다.

```console
missing:~$ ssh myserver 'journalctl -u sshd -b-1 | grep "Disconnected from"' \
  | sed -E 's/.*Disconnected from .* user (.*) [^ ]+ port.*/\1/' \
  | sort | uniq -c \
  | sort -nk1,1 | tail -n10 \
  | awk '{print $2}' | paste -sd,
postgres,mysql,oracle,dell,ubuntu,inspur,test,admin,user,root
```

이 명령은 원격 서버에서 SSH 로그를 가져오고(SSH에 대해서는 다음 강의에서 다룹니다), 연결 해제 메시지를 검색하고, 각 메시지에서 사용자 이름을 추출한 뒤, 상위 10개 사용자 이름을 쉼표로 구분하여 출력합니다. 이 모든 작업을 단 하나의 명령으로! 각 단계를 분석하는 것은 연습 문제로 남겨두겠습니다.

## 셸 언어 (bash)

앞의 예제에서 새로운 개념인 파이프(`|`)가 등장했습니다. 파이프는 한 프로그램의 출력을 다른 프로그램의 입력으로 연결합니다. 이것이 가능한 이유는 대부분의 커맨드라인 프로그램이 `file` 인수가 없으면 "표준 입력"(키보드 입력이 들어오는 곳)에서 작동하기 때문입니다. `|`는 `|` 앞 프로그램의 "표준 출력"(보통 터미널에 출력되는 것)을 `|` 뒤 프로그램의 표준 입력으로 만들어줍니다. 이를 통해 셸 프로그램들을 _조합_할 수 있으며, 이것이 셸을 생산적인 환경으로 만드는 핵심입니다!

실제로 대부분의 셸은 Python이나 Ruby처럼 완전한 프로그래밍 언어(bash 등)를 구현하고 있습니다. 변수, 조건문, 반복문, 함수 모두 있습니다. 셸에서 명령을 실행하면 사실 셸이 해석하는 작은 코드 조각을 작성하는 것과 같습니다. 오늘 bash 전체를 가르치지는 않겠지만, 특히 유용한 몇 가지를 소개합니다.

먼저, 리다이렉션입니다. `>file`은 프로그램의 표준 출력을 터미널이 아닌 `file`에 씁니다. 나중에 분석하기 더 편리합니다. `>>file`은 덮어쓰지 않고 `file`에 추가합니다. `<file`은 셸에게 키보드 대신 `file`을 프로그램의 표준 입력으로 읽으라고 지시합니다.

> 이 시점에서 `tee` 프로그램을 언급할 만합니다. `tee`는 표준 입력을 표준 출력으로 그대로 출력하면서(`cat`처럼!), 동시에 파일에도 씁니다. 따라서 `verbose cmd | tee verbose.log | grep CRITICAL`은 전체 상세 로그를 파일에 보존하면서 터미널은 깔끔하게 유지합니다!

다음으로, 조건문입니다. `if command1; then command2; command3; fi`는 `command1`을 실행하고, 오류가 없으면 `command2`와 `command3`을 실행합니다. 원하면 `else` 분기를 추가할 수도 있습니다. `command1`으로 가장 많이 쓰이는 명령은 `test`(간단히 `[`로도 씁니다)입니다. "파일이 존재하는가"(`test -f file` / `[ -f file ]`)나 "문자열이 같은가"(`[ "$var" = "string" ]`) 같은 조건을 평가합니다. bash에는 따옴표 처리에서 이상한 동작이 없는 더 안전한 내장 버전 `[[ ]]`도 있습니다.

bash에는 `while`과 `for` 두 가지 반복문이 있습니다. `while command1; do command2; command3; done`은 `command1`이 오류를 내지 않는 한 계속 반복됩니다. `for varname in a b c d; do command; done`은 `$varname`을 `a`, `b`, `c`, `d`로 차례로 설정하며 `command`를 네 번 실행합니다. 항목을 직접 나열하는 대신 "명령 치환"을 자주 사용합니다.

```bash
for i in $(seq 1 10); do
```

이는 `seq 1 10` 명령(1부터 10까지 숫자를 출력)을 실행하고, 전체 `$()`를 그 명령의 출력으로 대체하여 10번 반복하는 for 루프를 만듭니다. 오래된 코드에서는 ``for i in `seq 1 10`; do``처럼 역따옴표(backtick)를 사용하는 것을 볼 수 있지만, 중첩이 가능한 `$()`를 강력히 권장합니다.

긴 셸 스크립트를 프롬프트에서 직접 작성할 수도 있지만, 보통은 `.sh` 파일에 작성하는 것이 좋습니다. 예를 들어, 다음은 프로그램을 실패할 때까지 반복 실행하면서 실패한 실행의 출력만 출력하고, 동시에 CPU에 부하를 주는 스크립트입니다(간헐적으로 실패하는 테스트를 재현하는 데 유용합니다).

```bash
#!/bin/bash
set -euo pipefail

# 백그라운드에서 CPU 부하 시작
stress --cpu 8 &
STRESS_PID=$!

# 로그 파일 설정
LOGFILE="test_runs_$(date +%s).log"
echo "Logging to $LOGFILE"

# 테스트가 실패할 때까지 반복
RUN=1
while cargo test my_test > "$LOGFILE" 2>&1; do
    echo "Run $RUN passed"
    ((RUN++))
done

# 정리 및 결과 보고
kill $STRESS_PID
echo "Test failed on run $RUN"
echo "Last 20 lines of output:"
tail -n 20 "$LOGFILE"
echo "Full log: $LOGFILE"
```

여기에는 살펴볼 만한 새로운 내용들이 있습니다. 프로그램을 동시에 실행하기 위한 백그라운드 잡(`&`), [셸 리다이렉션](https://www.gnu.org/software/bash/manual/html_node/Redirections.html), [산술 확장](https://www.gnu.org/software/bash/manual/html_node/Arithmetic-Expansion.html) 등이 포함되어 있으니 직접 탐구해보길 권장합니다.

처음 두 줄을 잠깐 살펴보겠습니다. 첫 번째 줄은 "셔뱅(shebang)"입니다. 셸 스크립트뿐만 아니라 다른 파일에서도 볼 수 있습니다. `#!/path`라는 마법 같은 줄로 시작하는 파일이 실행되면, 셸은 `/path`에 있는 프로그램을 실행하고 파일 내용을 입력으로 전달합니다. 셸 스크립트의 경우 스크립트 내용을 `/bin/bash`에 전달하는 것이지만, `/usr/bin/python` 셔뱅 줄을 사용해서 Python 스크립트를 작성할 수도 있습니다!

두 번째 줄은 bash를 "더 엄격하게" 만들어 셸 스크립트 작성 시 발생하기 쉬운 실수들을 줄이는 방법입니다. `set`은 다양한 인수를 받지만, 간단히 설명하면: `-e`는 명령이 실패하면 스크립트를 바로 종료하고, `-u`는 정의되지 않은 변수를 사용하면 빈 문자열 대신 스크립트를 종료하며, `-o pipefail`은 `|` 시퀀스의 프로그램이 실패하면 셸 스크립트 전체도 조기 종료합니다.

> 셸 프로그래밍은 어떤 프로그래밍 언어와 마찬가지로 깊은 주제입니다. 그런데 bash에는 [여러](https://tldp.org/LDP/abs/html/gotchas.html) [사이트](https://mywiki.wooledge.org/BashPitfalls)가 전용으로 다룰 만큼 특이한 함정이 많습니다. 셸 스크립트를 작성할 때는 [shellcheck](https://www.shellcheck.net/)을 적극 활용하길 강력히 권장합니다. LLM도 셸 스크립트 작성과 디버깅에 탁월하며, bash가 감당하기 힘들 만큼 커졌을 때(100줄 이상) Python 같은 "진짜" 프로그래밍 언어로 변환하는 것도 잘합니다.

# 다음 단계

이제 기본적인 작업을 수행하기에 충분한 셸 지식을 갖추었습니다. 관심 있는 파일을 찾아 탐색하고 대부분의 프로그램의 기본 기능을 사용할 수 있을 것입니다. 다음 강의에서는 셸과 수많은 편리한 커맨드라인 프로그램을 활용해 더 복잡한 작업을 수행하고 자동화하는 방법을 배웁니다.

# 연습 문제

이 수업의 모든 강의에는 연습 문제가 딸려 있습니다. 어떤 것은 구체적인 과제를 주고, 어떤 것은 "X와 Y 프로그램을 사용해보기"처럼 개방형입니다. 꼭 시도해보기 바랍니다.

연습 문제에 대한 정답은 별도로 제공하지 않습니다. 막히는 부분이 있다면 [Discord](https://ossu.dev/#community)의 `#missing-semester-forum`에 게시하거나, 지금까지 시도해본 것을 설명하는 이메일을 보내주시면 도움을 드리겠습니다. LLM과의 대화에서 이 연습 문제를 시작점으로 삼아 주제를 깊이 파고들어도 효과적입니다. 이 연습 문제들의 진정한 가치는 답을 찾는 여정에 있습니다. 답 자체보다 탐구하면서 "왜?"를 질문하길 권장합니다.

1. 이 수업을 들으려면 bash나 ZSH 같은 Unix 셸이 필요합니다. Linux나 macOS를 사용한다면 특별한 준비가 필요 없습니다. Windows 사용자라면 cmd.exe나 PowerShell을 사용하지 않도록 해야 합니다. [Windows 하위 시스템(WSL)](https://docs.microsoft.com/en-us/windows/wsl/)이나 Linux 가상 머신을 사용하면 Unix 스타일의 커맨드라인 도구를 쓸 수 있습니다. 적절한 셸을 실행하고 있는지 확인하려면 `echo $SHELL` 명령을 실행해보세요. `/bin/bash`나 `/usr/bin/zsh` 같은 결과가 나오면 맞습니다.

1. `ls`의 `-l` 플래그는 무엇을 합니까? `ls -l /`를 실행하고 출력을 살펴보세요. 각 행의 첫 10개 문자는 무엇을 의미합니까? (힌트: `man ls`)

1. `find ~/Downloads -type f -name "*.zip" -mtime +30` 명령에서 `*.zip`은 "글로브(glob)"입니다. 글로브란 무엇입니까? 테스트 디렉터리를 만들고 파일들을 생성한 뒤 `ls *.txt`, `ls file?.txt`, `ls {a,b,c}.txt` 같은 패턴을 실험해보세요. Bash 매뉴얼의 [Pattern Matching](https://www.gnu.org/software/bash/manual/html_node/Pattern-Matching.html)을 참고하세요.

1. `'작은따옴표'`, `"큰따옴표"`, `$'ANSI 따옴표'`의 차이는 무엇입니까? 리터럴 `$`, `!`, 개행 문자를 포함한 문자열을 echo하는 명령을 작성해보세요. [Quoting](https://www.gnu.org/software/bash/manual/html_node/Quoting.html)을 참고하세요.

1. 셸에는 stdin(0), stdout(1), stderr(2) 세 개의 표준 스트림이 있습니다. `ls /nonexistent /tmp`를 실행해서 stdout을 한 파일로, stderr를 다른 파일로 리다이렉트해보세요. 두 스트림을 같은 파일로 리다이렉트하려면 어떻게 해야 합니까? [Redirections](https://www.gnu.org/software/bash/manual/html_node/Redirections.html)을 참고하세요.

1. `$?`는 마지막 명령의 종료 상태(0 = 성공)를 저장합니다. `&&`는 이전 명령이 성공했을 때만 다음 명령을 실행하고, `||`는 실패했을 때만 실행합니다. `/tmp/mydir`가 없을 때만 생성하는 한 줄짜리 명령을 작성해보세요. [Exit Status](https://www.gnu.org/software/bash/manual/html_node/Exit-Status.html)를 참고하세요.

1. `cd`는 왜 독립된 프로그램이 아닌 셸에 내장되어 있어야 할까요? (힌트: 자식 프로세스가 부모 프로세스에 영향을 미칠 수 있는 것과 없는 것을 생각해보세요.)

1. 파일 이름을 인수(`$1`)로 받아 `test -f` 또는 `[ -f ... ]`를 사용해 파일 존재 여부를 확인하는 스크립트를 작성해보세요. 파일 존재 여부에 따라 다른 메시지를 출력해야 합니다. [Bash Conditional Expressions](https://www.gnu.org/software/bash/manual/html_node/Bash-Conditional-Expressions.html)을 참고하세요.

1. 이전 연습의 스크립트를 파일(예: `check.sh`)에 저장하세요. `./check.sh somefile`로 실행하면 어떻게 됩니까? 이제 `chmod +x check.sh`를 실행하고 다시 시도해보세요. 이 단계가 왜 필요합니까? (힌트: `chmod` 전후에 `ls -l check.sh` 출력을 살펴보세요.)

1. 스크립트의 `set` 플래그에 `-x`를 추가하면 어떻게 됩니까? 간단한 스크립트로 시도하고 출력을 관찰해보세요. [The Set Builtin](https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html)을 참고하세요.

1. 파일 이름에 오늘 날짜를 포함한 백업을 만드는 명령을 작성해보세요(예: `notes.txt` → `notes_2026-01-12.txt`). (힌트: `$(date +%Y-%m-%d)`). [Command Substitution](https://www.gnu.org/software/bash/manual/html_node/Command-Substitution.html)을 참고하세요.

1. 강의에서 소개한 간헐적 실패 테스트 스크립트를 수정하여 `cargo test my_test`를 하드코딩하는 대신 테스트 명령을 인수로 받도록 만들어보세요. (힌트: `$1` 또는 `$@`). [Special Parameters](https://www.gnu.org/software/bash/manual/html_node/Special-Parameters.html)을 참고하세요.

1. 파이프를 사용해 홈 디렉터리에서 가장 많이 사용되는 파일 확장자 5개를 찾아보세요. (힌트: `find`, `grep`이나 `sed` 또는 `awk`, `sort`, `uniq -c`, `head`를 조합하세요.)

1. `xargs`는 stdin에서 받은 줄들을 명령의 인수로 변환합니다. `find -exec`를 사용하지 않고 `find`와 `xargs`를 함께 사용해서 디렉터리의 모든 `.sh` 파일을 찾고 `wc -l`로 각 파일의 줄 수를 세어보세요. 보너스: 공백이 포함된 파일 이름도 처리할 수 있게 만들어보세요. (힌트: `-print0`와 `-0`). `man xargs`를 참고하세요.

1. `curl`로 강의 웹사이트(`https://missing.csail.mit.edu/`)의 HTML을 가져와서 `grep`으로 파이프하여 강의가 몇 개 나열되어 있는지 세어보세요. (힌트: 강의마다 한 번씩 나타나는 패턴을 찾아보세요. `curl -s`로 진행률 출력을 숨길 수 있습니다.)

1. [`jq`](https://jqlang.github.io/jq/)는 JSON 데이터를 처리하는 강력한 도구입니다. `curl`로 `https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json`의 샘플 데이터를 가져와서 `jq`로 버전이 6보다 큰 사람들의 이름만 추출해보세요. (힌트: 먼저 `jq .`로 구조를 파악하고, 그 다음 `jq '.[] | select(...) | .name'`을 시도해보세요.)

1. `awk`는 열 값을 기준으로 행을 필터링하고 출력을 조작할 수 있습니다. 예를 들어 `awk '$3 ~ /pattern/ {$4=""; print}'`은 세 번째 열이 `pattern`과 일치하는 행만 출력하면서 네 번째 열은 생략합니다. 두 번째 열이 100보다 큰 행만 출력하고 첫 번째와 세 번째 열을 바꾸는 `awk` 명령을 작성해보세요. 테스트: `printf 'a 50 x\nb 150 y\nc 200 z\n'`

1. 강의에서 소개한 SSH 로그 파이프라인을 분석해보세요. 각 단계는 무엇을 합니까? 그런 다음 `~/.bash_history` (또는 `~/.zsh_history`)에서 가장 많이 사용한 셸 명령을 찾는 비슷한 파이프라인을 직접 만들어보세요.
