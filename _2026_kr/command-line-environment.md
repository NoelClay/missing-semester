---
layout: lecture
title: "명령줄 환경"
description: >
  명령줄 프로그램이 어떻게 작동하는지 배웁니다. 입출력 스트림, 환경 변수, SSH를 통한 원격 머신 사용 등을 다룹니다.
thumbnail: /static/assets/thumbnails/2026/lec2.png
date: 2026-01-13
ready: true
video:
  aspect: 56.25
  id: ccBGsPedE9Q
---

앞의 강의에서 다룬 바와 같이, 대부분의 셸은 단지 다른 프로그램을 시작하는 런처가 아니라, 실제로 일반적인 패턴과 추상화로 가득 찬 완전한 프로그래밍 언어를 제공합니다. 하지만 대부분의 프로그래밍 언어와 달리, 셸 스크립팅에서는 모든 것이 프로그램 실행과 그들이 서로 단순하고 효율적으로 통신하도록 하는 것 중심으로 설계되어 있습니다.

특히, 셸 스크립팅은 _관례_에 의해 엄격히 제한됩니다. 명령줄 인터페이스(CLI) 프로그램이 더 넓은 셸 환경 내에서 잘 작동하려면, 따라야 할 일반적인 패턴들이 있습니다. 우리는 이제 명령줄 프로그램이 어떻게 작동하는지 이해하는 데 필요한 많은 개념과 그들을 사용하고 구성하는 방법에 대한 널리 있는 관례들을 다룰 것입니다.

# 명령줄 인터페이스

대부분의 프로그래밍 언어에서 함수를 작성하는 것은 다음과 같습니다:

```
def add(x: int, y: int) -> int:
    return x + y
```

여기서 우리는 프로그램의 입력과 출력을 명시적으로 볼 수 있습니다. 반면에, 셸 스크립트는 처음 봤을 때 상당히 다르게 보일 수 있습니다.

```shell
#!/usr/bin/env bash

if [[ -f $1 ]]; then
    echo "Target file already exists"
    exit 1
else
    if $DEBUG; then
        grep 'error' - | tee $1
    else
        grep 'error' - > $1
    fi
    exit 0
fi
```

이와 같은 스크립트에서 무엇이 일어나는지를 제대로 이해하려면, 먼저 셸 프로그램이 서로 통신할 때나 셸 환경과 통신할 때 자주 나타나는 몇 가지 개념을 소개해야 합니다:

- 인수
- 스트림
- 환경 변수
- 반환 코드
- 신호

## 인수

셸 프로그램은 실행될 때 인수 목록을 받습니다. 인수는 셸에서 평문 문자열이며, 프로그램이 어떻게 해석할지는 프로그램에 달려 있습니다. 예를 들어, `ls -l folder/`를 할 때, 우리는 인수 `['-l', 'folder/']`와 함께 프로그램 `/bin/ls`를 실행합니다.

셸 스크립트 내에서, 우리는 특수 셸 문법을 통해 이들에 접근합니다. 첫 번째 인수에 접근하려면, 변수 `$1`에 접근하고, 두 번째 인수는 `$2`이고, 이렇게 `$9`까지 계속됩니다. 모든 인수를 목록으로 접근하려면 `$@`를 사용하고, 인수의 개수를 얻으려면 `$#`를 사용합니다. 또한 프로그램의 이름을 `$0`으로 접근할 수도 있습니다.

대부분의 프로그램의 경우, 인수는 _플래그_와 일반 문자열의 혼합으로 구성됩니다. 플래그는 대시(`-`) 또는 이중 대시(`--`)가 앞에 오므로 식별할 수 있습니다. 플래그는 보통 선택 사항이며, 그들의 역할은 프로그램의 동작을 수정하는 것입니다. 예를 들어, `ls -l`은 `ls`가 출력을 포맷하는 방식을 변경합니다.

당신은 `--all` 같은 긴 이름의 이중 대시 플래그와 대부분 단일 문자가 뒤에 오는 `-a` 같은 단일 대시 플래그를 볼 것입니다. 같은 옵션이 두 형식 모두로 지정될 수 있으며, `ls -a`와 `ls --all`은 동등합니다. 단일 대시 플래그는 종종 그룹화되므로, `ls -l -a`와 `ls -la`도 동등합니다. 플래그의 순서는 보통 중요하지 않으며, `ls -la`와 `ls -al`은 같은 결과를 생성합니다. 일부 플래그는 매우 흔하며, 셸 환경에 더 익숙해질수록, 당신은 본능적으로 그들을 사용할 것입니다. 예를 들어(`--help`, `--verbose`, `--version`).

> 플래그는 셸 관례의 좋은 첫 번째 예입니다. 셸 언어는 우리의 프로그램이 이 특정한 방식으로 `-` 또는 `--`를 사용하도록 요구하지 않습니다. `myprogram +myoption myfile` 같은 문법으로 프로그램을 작성하는 것을 막는 것이 없지만, 그것은 우리가 대시를 사용해야 한다는 기대이므로 혼동을 초래할 것입니다. 실제로, 대부분의 프로그래밍 언어는 CLI 플래그 파싱 라이브러리를 제공합니다(예: 대시 문법으로 인수를 파싱하기 위한 Python의 `argparse`).

CLI 프로그램의 또 다른 일반적인 관례는 프로그램이 같은 타입의 가변 개수의 인수를 받는 것입니다. 이 방식으로 주어진 인수들에, 명령은 각각에 대해 같은 작업을 수행합니다.

```shell
mkdir src
mkdir docs
# is equivalent to
mkdir src docs
```

이 문법 설탕은 처음엔 불필요해 보일 수 있지만, _글로빙_과 결합될 때 정말로 강력해집니다. 글로빙 또는 글롭은 셸이 프로그램을 호출하기 전에 확장할 특수한 패턴입니다.

현재 폴더에 있는 모든 .py 파일을 재귀 없이 삭제하고 싶다고 합시다. 앞의 강의에서 배운 것으로부터, 우리는 다음을 실행하여 이를 달성할 수 있습니다:

```shell
for file in $(ls | grep -P '\.py$'); do
    rm "$file"
done
```

하지만 우리는 단지 `rm *.py`로 그것을 바꿀 수 있습니다!

터미널에 `rm *.py`를 입력할 때, 셸은 `/bin/rm` 프로그램을 인수 `['*.py']`로 호출하지 않을 것입니다. 대신, 셸은 현재 폴더에서 패턴 `*.py`와 매칭하는 파일들을 검색할 것입니다. 여기서 `*`는 0개 이상의 모든 타입의 문자를 일치시킬 수 있습니다. 따라서 우리의 폴더에 `main.py`와 `utils.py`가 있다면, `rm` 프로그램은 인수 `['main.py', 'utils.py']`를 받을 것입니다.

가장 일반적인 글롭들은 와일드카드 `*`(0개 이상의 모든 것), `?`(정확히 1개의 모든 것), 그리고 중괄호입니다. 중괄호 `{}`는 쉼표로 분리된 패턴의 목록을 여러 인수로 확장합니다.

실제로, 글롭은 동기화된 예제로 가장 잘 이해됩니다.

```shell
touch folder/{a,b,c}.py
# Will expand to
touch folder/a.py folder/b.py folder/c.py

convert image.{png,jpg}
# Will expand to
convert image.png image.jpg

cp /path/to/project/{setup,build,deploy}.sh /newpath
# Will expand to
cp /path/to/project/setup.sh /path/to/project/build.sh /path/to/project/deploy.sh /newpath

# Globbing techniques can also be combined
mv *{.py,.sh} folder
# Will move all *.py and *.sh files
```

> 일부 셸(예: zsh)은 `**` 같은 훨씬 더 고급 글로빙 형식을 지원하며, 이는 재귀적 경로를 포함하도록 확장됩니다. 따라서 `rm **/*.py`는 모든 .py 파일을 재귀적으로 삭제합니다.

## 스트림

`cat myfile | grep -P '\d+' | uniq -c` 같은 프로그램 파이프라인을 실행할 때마다, 우리는 `grep` 프로그램이 `cat`과 `uniq` 프로그램 모두와 통신하고 있음을 봅니다.

여기서 중요한 관찰은 세 프로그램이 모두 한 번에 실행된다는 것입니다. 즉, 셸이 먼저 cat을 호출하고, 그 다음 grep을 호출하고, 그 다음 uniq을 호출하지 않습니다. 대신, 세 프로그램이 모두 시작되고, 셸이 cat의 출력을 grep의 입력과 연결하고, grep의 출력을 uniq의 입력에 연결합니다. 파이프 연산자 `|`를 사용할 때, 셸은 체인에서 한 프로그램에서 다음 프로그램으로 흐르는 데이터 스트림에서 작동합니다.

우리는 이 동시성을 보여줄 수 있습니다. 파이프라인의 모든 명령은 즉시 시작됩니다:

```console
$ (sleep 15 && cat numbers.txt) | grep -P '^\d$' | sort | uniq  &
[1] 12345
$ ps | grep -P '(sleep|cat|grep|sort|uniq)'
  32930 pts/1    00:00:00 sleep
  32931 pts/1    00:00:00 grep
  32932 pts/1    00:00:00 sort
  32933 pts/1    00:00:00 uniq
  32948 pts/1    00:00:00 grep
```

우리는 `cat`을 제외한 모든 프로세스가 즉시 실행 중임을 볼 수 있습니다. 셸은 모든 프로세스를 생성하고, 그들이 완료되기 전에 그들의 스트림을 연결합니다. `cat`은 sleep이 완료된 후에만 시작될 것이고, `cat`의 출력은 grep으로 보내질 것입니다.

모든 프로그램은 입력 스트림(stdin(표준 입력)이라고 레이블됨)을 가집니다. 파이핑할 때, stdin은 자동으로 연결됩니다. 스크립트 내에서, 많은 프로그램들은 `-`를 파일명으로 받아서 "stdin에서 읽기"를 의미합니다:

```shell
# These are equivalent when data comes from a pipe
echo "hello" | grep "hello"
echo "hello" | grep "hello" -
```

비슷하게, 모든 프로그램은 두 개의 출력 스트림을 가집니다: stdout과 stderr입니다. 표준 출력은 가장 일반적으로 만나는 것이며, 파이프라인의 다음 명령으로 프로그램의 출력을 파이핑하는 데 사용되는 것입니다. 표준 오류는 프로그램이 경고 및 다른 타입의 문제들을 보고하기 위한 대안 스트림이며, 그 출력이 체인의 다음 명령에 의해 파싱되지 않도록 하기 위한 것입니다.

```console
$ ls /nonexistent
ls: cannot access '/nonexistent': No such file or directory
$ ls /nonexistent | grep "pattern"
ls: cannot access '/nonexistent': No such file or directory
# The error message still appears because stderr is not piped
$ ls /nonexistent 2>/dev/null
# No output - stderr was redirected to /dev/null
```

셸은 이들 스트림을 리다이렉트하기 위한 문법을 제공합니다. 여기는 일부 예시적인 예제입니다.

```shell
# Redirect stdout to a file (overwrite)
echo "hello" > output.txt

# Redirect stdout to a file (append)
echo "world" >> output.txt

# Redirect stderr to a file
ls foobar 2> errors.txt

# Redirect both stdout and stderr to the same file
ls foobar &> all_output.txt

# Redirect stdin from a file
grep "pattern" < input.txt

# Discard output by redirecting to /dev/null
cmd > /dev/null 2>&1
```

Unix 철학을 예시하는 또 다른 강력한 도구는 [`fzf`](https://github.com/junegunn/fzf)입니다. 이것은 퍼지 파인더입니다. 이것은 stdin에서 라인을 읽고, 필터링과 선택을 위한 대화형 인터페이스를 제공합니다:

```console
$ ls | fzf
$ cat ~/.bash_history | fzf
```

`fzf`는 많은 셸 작업과 통합될 수 있습니다. 우리는 셸 커스터마이제이션을 논의할 때 더 많은 사용 사례를 볼 것입니다.

## 환경 변수

bash에서 변수를 할당하려면 문법 `foo=bar`를 사용하고, 그 다음 문법 `$foo`로 변수의 값에 접근합니다. `foo = bar`는 유효하지 않은 문법임을 주의하십시오. 왜냐하면 셸은 그것을 인수 `['=', 'bar']`를 가진 프로그램 `foo`를 호출하는 것으로 파싱할 것이기 때문입니다. 셸 스크립팅에서 공간 문자의 역할은 인수 분할을 수행하는 것입니다. 이 동작은 혼동이 될 수 있고, 익숙해지기 까다로우므로, 이를 염두에 두세요.

셸 변수는 타입이 없으며, 모두 문자열입니다. 셸에서 문자열 표현을 작성할 때, 단일 따옴표와 이중 따옴표는 상호 교환 가능하지 않음을 주의하십시오. `'`로 구분된 문자열은 리터럴 문자열이며 변수를 확장하거나, 명령 치환을 수행하거나, 이스케이프 시퀀스를 처리하지 않는 반면, `"`로 구분된 문자열은 그럴 것입니다.

```shell
foo=bar
echo "$foo"
# prints bar
echo '$foo'
# prints $foo
```

명령의 출력을 변수로 캡처하려면, 우리는 _명령 치환_을 사용합니다. 우리가 실행할 때,
```shell
files=$(ls)
echo "$files" | grep README
echo "$files" | grep ".py"
```
ls의 출력(구체적으로 stdout)은 변수 `$files`에 배치되며, 나중에 접근할 수 있습니다. `$files` 변수의 내용은 ls 출력의 개행을 포함하며, 이것이 `grep` 같은 프로그램들이 각 항목을 독립적으로 작동하는 방법입니다.

덜 알려진 유사한 기능은 _프로세스 치환_입니다. `<( CMD )`는 `CMD`를 실행하고, 출력을 임시 파일에 배치하고, `<()`를 그 파일의 이름으로 치환합니다. 이것은 명령이 STDIN 대신 파일로 값을 전달받기를 기대할 때 유용합니다. 예를 들어, `diff <(ls src) <(ls docs)`는 디렉터리 `src`와 `docs`의 파일들 사이의 차이를 표시할 것입니다.

셸 프로그램이 다른 프로그램을 호출할 때마다, 그것은 종종 _환경 변수_라고 불리는 변수 집합을 전달합니다. 셸 내에서, 우리는 `printenv`를 실행하여 현재 환경 변수를 찾을 수 있습니다. 명시적으로 환경 변수를 전달하려면, 우리는 변수 할당으로 명령을 앞에 붙일 수 있습니다.

> 환경 변수는 관례적으로 ALL_CAPS(예: `HOME`, `PATH`, `DEBUG`)로 작성됩니다. 이것은 관례이지, 기술적 요구 사항이 아니지만, 이를 따르면 일반적으로 소문자인 로컬 셸 변수들로부터 환경 변수를 구별하는 데 도움이 됩니다.

```shell
TZ=Asia/Tokyo date  # prints the current time in Tokyo
echo $TZ  # this will be empty, since TZ was only set for the child command
```

대안으로, 우리는 `export` 내장 함수를 사용할 수 있습니다. 이것은 우리의 현재 환경을 수정할 것이며, 따라서 모든 자식 프로세스가 변수를 상속할 것입니다:

```shell
export DEBUG=1
# All programs from this point onwards will have DEBUG=1 in their environment
bash -c 'echo $DEBUG'
# prints 1
```

변수를 삭제하려면 `unset` 내장 명령을 사용하세요. 예: `unset DEBUG`.

> 환경 변수는 또 다른 셸 관례입니다. 그들은 명시적으로 대신에 많은 프로그램들의 동작을 암묵적으로 수정하는 데 사용될 수 있습니다. 예를 들어, 셸은 `$HOME` 환경 변수를 현재 사용자의 홈 폴더의 경로로 설정합니다. 그 다음 프로그램들은 명시적인 `--home /home/alice`를 요구하는 대신, 이 변수에 접근하여 이 정보를 얻을 수 있습니다. 또 다른 일반적인 예는 `$TZ`이며, 많은 프로그램들이 지정된 타임존에 따라 날짜와 시간을 포맷하는 데 사용합니다.

## 반환 코드

앞서 봤듯이, 셸 프로그램의 주요 출력은 stdout/stderr 스트림과 파일 시스템 부작용을 통해 전달됩니다.

기본적으로 셸 스크립트는 종료 코드 0을 반환할 것입니다. 관례는 0이 모든 것이 잘 진행되었다는 것을 의미하고 0이 아닌 것이 일부 문제가 발생했다는 것을 의미합니다. 0이 아닌 종료 코드를 반환하려면, 우리는 `exit NUM` 셸 내장을 사용해야 합니다. 우리는 특수 변수 `$?`에 접근하여 마지막으로 실행된 명령의 반환 코드에 접근할 수 있습니다.

셸은 각각 AND와 OR 작업을 수행하기 위해 부울 연산자 `&&`와 `||`를 가집니다. 일반 프로그래밍 언어에서 만나는 것들과 달리, 셸의 것들은 프로그램의 반환 코드에서 작동합니다. 둘 다 [단락 회로](https://en.wikipedia.org/wiki/Short-circuit_evaluation) 연산자입니다. 이것은 그들이 이전 명령의 성공이나 실패를 기반으로 조건부로 명령을 실행하는 데 사용될 수 있다는 의미입니다. 성공은 반환 코드가 0인지 여부를 기반으로 결정됩니다. 일부 예제들:

```shell
# echo will only run if grep succeeds (finds a match)
grep -q "pattern" file.txt && echo "Pattern found"

# echo will only run if grep fails (no match)
grep -q "pattern" file.txt || echo "Pattern not found"

# true is a shell program that always succeeds
true && echo "This will always print"

# and false is a shell program that always fails
false || echo "This will always print"
```

같은 원칙이 `if`와 `while` 문들에 적용되고, 그들은 모두 반환 코드를 사용하여 결정을 내립니다:

```shell
# if uses the return code of the condition command (0 = true, nonzero = false)
if grep -q "pattern" file.txt; then
    echo "Found"
fi

# while loops continue as long as the command returns 0
while read line; do
    echo "$line"
done < file.txt
```

## 신호

경우에 따라, 프로그램이 실행 중인 동안 그것을 중단해야 할 것입니다. 예를 들어, 명령이 완료하는 데 너무 오래 걸릴 경우입니다. 프로그램을 중단하는 가장 간단한 방법은 `Ctrl-C`를 누르는 것이고, 명령이 아마도 중단될 것입니다. 하지만 이것이 실제로 어떻게 작동하고 왜 때때로 프로세스를 중단하지 못할까요?

```console
$ sleep 100
^C
$
```

> 주의: 여기 `^C`는 터미널에 입력할 때 `Ctrl`이 표시되는 방식입니다.

내면적으로, 여기서 일어난 것은 다음입니다:

1. 우리는 `Ctrl-C`를 눌렀습니다.
2. 셸은 특수한 문자 조합을 식별했습니다.
3. 셸 프로세스는 `sleep` 프로세스로 SIGINT 신호를 보냈습니다.
4. 신호는 `sleep` 프로세스의 실행을 중단했습니다.

신호들은 특수한 통신 메커니즘입니다. 프로세스가 신호를 받을 때, 그것은 그 실행을 중단하고, 신호를 처리하고, 신호가 전달한 정보를 기반으로 실행 흐름을 잠재적으로 변경합니다. 이러한 이유로, 신호는 _소프트웨어 중단_입니다.

우리의 경우, `Ctrl-C`를 입력할 때, 이것은 셸이 프로세스로 `SIGINT` 신호를 전달하도록 프롬프트합니다. 여기는 `SIGINT`를 캡처하고 무시하는 최소한의 Python 프로그램의 예입니다. 이제 대신 `SIGQUIT` 신호를 사용하여 `Ctrl-\`를 입력함으로써 이 프로그램을 종료할 수 있습니다.

```python
#!/usr/bin/env python
import signal, time

def handler(signum, time):
    print("\nI got a SIGINT, but I am not stopping")

signal.signal(signal.SIGINT, handler)
i = 0
while True:
    time.sleep(.1)
    print("\r{}".format(i), end="")
    i += 1
```

이 프로그램으로 `SIGINT`를 두 번 보낸 다음 `SIGQUIT`을 보낼 때 무엇이 일어나는지입니다. 주의: `^`는 터미널에 입력할 때 `Ctrl`이 표시되는 방식입니다.

```console
$ python sigint.py
24^C
I got a SIGINT, but I am not stopping
26^C
I got a SIGINT, but I am not stopping
30^\[1]    39913 quit       python sigint.py
```

`SIGINT`와 `SIGQUIT` 모두 보통 터미널 관련 요청과 연관되어 있는 반면, 프로세스에 우아하게 종료하도록 요청하기 위한 더 일반적인 신호는 `SIGTERM` 신호입니다. 이 신호를 보내려면, 우리는 [`kill`](https://www.man7.org/linux/man-pages/man1/kill.1.html) 명령을 사용할 수 있습니다. 문법은 `kill -TERM <PID>`입니다.

신호는 프로세스를 종료하는 것 이상의 작업을 할 수 있습니다. 예를 들어, `SIGSTOP`은 프로세스를 일시 중지합니다. 터미널에서, `Ctrl-Z`를 입력하면 셸이 `SIGTSTP` 신호(터미널 중지의 약자, 즉 터미널 버전의 `SIGSTOP`)를 보내도록 프롬프트할 것입니다.

우리는 그 다음 [`fg`](https://www.man7.org/linux/man-pages/man1/fg.1p.html) 또는 [`bg`](https://man7.org/linux/man-pages/man1/bg.1p.html)를 사용하여 일시 중지된 작업을 각각 포그라운드 또는 백그라운드에서 계속할 수 있습니다.

[`jobs`](https://www.man7.org/linux/man-pages/man1/jobs.1p.html) 명령은 현재 터미널 세션과 연관된 미완료 작업들을 나열합니다. 당신은 그들의 pid를 사용하여 그 작업들을 참조할 수 있습니다([`pgrep`](https://www.man7.org/linux/man-pages/man1/pgrep.1.html)을 사용하여 그것을 찾을 수 있음). 더 직관적으로, 당신은 또한 퍼센트 기호를 사용하여 프로세스를 참조할 수 있습니다. 후에 작업 번호(`jobs`로 표시됨)를 참조할 수 있습니다. 마지막으로 백그라운드된 작업을 참조하려면, 당신은 특수 파라미터 `$!`를 사용할 수 있습니다.

한 가지 더 알아야 할 것은 명령 뒤에 `&` 접미사가 그 명령을 백그라운드에서 실행하고, 당신에게 프롬프트를 되돌릴 것입니다. 비록 그것이 여전히 셸의 STDOUT을 사용할 것이지만, 그것이 성가실 수 있습니다(그 경우 셸 리다이렉트를 사용하세요). 동등하게, 이미 실행 중인 프로그램을 백그라운드하려면, 당신은 `Ctrl-Z` 다음에 `bg`를 할 수 있습니다.

백그라운드된 프로세스들은 여전히 당신의 터미널의 자식 프로세스임을 주의하십시오. 그리고 당신이 터미널을 닫으면 종료될 것입니다(이것은 또 다른 신호인 `SIGHUP`을 보낼 것입니다). 이것이 일어나지 않도록 방지하려면, 당신은 [`nohup`](https://www.man7.org/linux/man-pages/man1/nohup.1.html)으로 프로그램을 실행할 수 있습니다(`SIGHUP`을 무시하기 위한 래퍼). 또는 프로세스가 이미 시작되었다면 `disown`을 사용하세요. 대안으로, 다음 섹션에서 보겠듯이 터미널 멀티플렉서를 사용할 수 있습니다.

이들 개념들 중 일부를 보여주는 샘플 세션입니다.

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

$ kill -SIGHUP %1
[1]  + 18653 hangup     sleep 1000

$ kill -SIGHUP %2   # nohup protects from SIGHUP

$ jobs
[2]  + running    nohup sleep 2000

$ kill %2
[2]  + 18745 terminated  nohup sleep 2000
```

특수한 신호는 `SIGKILL`입니다. 이것은 프로세스에 의해 캡처될 수 없으며 항상 즉시 종료시킵니다. 하지만 고아 자식 프로세스를 남길 수 있습니다.

이들과 다른 신호들에 대해 더 배우려면 [여기](https://en.wikipedia.org/wiki/Signal_(IPC))에서 찾거나, [`man signal`](https://www.man7.org/linux/man-pages/man7/signal.7.html)를 읽거나 `kill -l`을 입력하세요.

셸 스크립트 내에서 신호를 받을 때 명령을 실행하려면 `trap` 내장을 사용할 수 있습니다. 이것은 정리 작업에 유용합니다:

```shell
#!/usr/bin/env bash
cleanup() {
    echo "Cleaning up temporary files..."
    rm -f /tmp/mytemp.*
}
trap cleanup EXIT  # Run cleanup when script exits
trap cleanup SIGINT SIGTERM  # Also on Ctrl-C or kill
```

# 원격 머신

프로그래머들이 일상 작업에서 원격 서버와 작업하는 것이 점점 더 일반적이 되었습니다. 이 작업을 위한 가장 일반적인 도구는 SSH(Secure Shell)입니다. SSH는 원격 서버에 연결하고 친숙한 셸 인터페이스를 제공합니다. 다음과 같은 명령으로 서버에 연결합니다:

```bash
ssh alice@server.mit.edu
```

여기서는 사용자 `alice`로 서버 `server.mit.edu`에 연결합니다.

`ssh`의 종종 간과되는 기능은 명령을 비대화식으로 실행할 수 있다는 것입니다. `ssh`는 명령의 stdin과 stdout을 올바르게 처리하므로 다른 명령들과 결합할 수 있습니다.

```shell
# here ls runs in the remote, and wc runs locally
ssh alice@server ls | wc -l

# here both ls and wc run in the server
ssh alice@server 'ls | wc -l'
```

> 연결이 끊어지거나 네트워크가 변경되는 등의 상황을 더 잘 처리할 수 있는 SSH 대체 도구로 [`Mosh`](https://mosh.org/)를 고려해보세요.

`ssh`로 원격 서버에서 명령을 실행하려면 먼저 인증을 받아야 합니다. 비밀번호 또는 SSH 키를 사용할 수 있습니다. 키 기반 인증은 공개 키 암호화를 활용하여 서버에 개인 키를 소유하고 있음을 증명합니다. 키 기반 인증은 더 편리하고 안전하므로 선호하는 것이 좋습니다. 개인 키(종종 `~/.ssh/id_rsa`이고 더 최근에는 `~/.ssh/id_ed25519`)는 사실상 비밀번호이므로, 주의해서 관리하고 절대 그 내용을 공유하지 마세요.

한 쌍을 생성하려면 [`ssh-keygen`](https://www.man7.org/linux/man-pages/man1/ssh-keygen.1.html)을 실행하면 됩니다.
```bash
ssh-keygen -a 100 -t ed25519 -f ~/.ssh/id_ed25519
```

GitHub에 SSH 키를 사용하여 푸시하도록 구성했다면, 아마 [여기](https://help.github.com/articles/connecting-to-github-with-ssh/)의 단계를 이미 따랐을 것이고 유효한 키 쌍이 있을 것입니다. 키에 암호문이 설정되었는지 확인하고 유효성을 검사하려면 `ssh-keygen -y -f /path/to/key`를 실행하면 됩니다.

서버 측에서 `ssh`는 `.ssh/authorized_keys`를 읽어 어떤 클라이언트를 허용할지 결정합니다. 공개 키를 복사하려면 다음 방법을 사용합니다:

```bash
cat .ssh/id_ed25519.pub | ssh alice@remote 'cat >> ~/.ssh/authorized_keys'

# or more simply (if ssh-copy-id is available)

ssh-copy-id -i .ssh/id_ed25519 alice@remote
```

명령 실행 외에도 SSH 연결을 통해 파일을 안전하게 전송할 수 있습니다. [`scp`](https://www.man7.org/linux/man-pages/man1/scp.1.html)는 가장 일반적인 도구이며, 문법은 `scp path/to/local_file remote_host:path/to/remote_file`입니다. [`rsync`](https://www.man7.org/linux/man-pages/man1/rsync.1.html)는 로컬과 원격 간의 같은 파일을 감지하여 불필요한 재복사를 방지함으로써 `scp`를 개선합니다. 또한 심볼릭 링크와 권한을 더 세밀하게 제어할 수 있으며, `--partial` 플래그와 같은 추가 기능을 제공합니다. `--partial`을 사용하면 이전에 중단된 복사를 재개할 수 있습니다. `rsync`는 `scp`와 유사한 문법을 가집니다.

SSH 클라이언트 구성은 `~/.ssh/config`에 위치하며, 여기서 호스트를 선언하고 각 호스트에 대한 기본 설정을 지정할 수 있습니다. 이 파일은 `ssh`뿐만 아니라 `scp`, `rsync`, `mosh` 같은 다른 프로그램들도 읽습니다.

```bash
Host vm
    User alice
    HostName 172.16.174.141
    Port 2222
    IdentityFile ~/.ssh/id_ed25519

# Configs can also take wildcards
Host *.mit.edu
    User alice
```

# 터미널 멀티플렉서

명령줄 인터페이스를 사용할 때 한 번에 여러 개를 실행하고 싶을 때가 많습니다. 예를 들어, 에디터와 프로그램을 동시에 실행하고 싶을 수 있습니다. 새로운 터미널 창을 열어서 이를 할 수도 있지만, 터미널 멀티플렉서를 사용하는 것이 훨씬 유연합니다.

[`tmux`](https://www.man7.org/linux/man-pages/man1/tmux.1.html) 같은 터미널 멀티플렉서는 여러 셸 세션을 창과 분할창으로 구성하여 효율적으로 관리할 수 있게 합니다. 또한 현재 터미널 세션을 분리했다가 나중에 다시 연결할 수 있습니다. 이러한 특징이 있어서 터미널 멀티플렉서는 원격 머신과 작업할 때 특히 유용합니다. 이것은 `nohup`과 유사한 트릭을 사용할 필요를 피합니다.

요즘 가장 인기 있는 터미널 멀티플렉서는 [`tmux`](https://www.man7.org/linux/man-pages/man1/tmux.1.html)입니다. `tmux`는 매우 커스터마이징 가능하며, 키바인딩을 사용하여 여러 창과 분할창을 빠르게 전환할 수 있습니다.

`tmux`를 효율적으로 사용하려면 기본 키바인딩을 알아야 합니다. 모든 키바인딩은 `<C-b> x` 형태입니다. 여기서 이것은 (1) `Ctrl+b`를 누르고, (2) `Ctrl+b`를 놓고, 그 다음 (3) `x`를 누르는 것을 의미합니다. `tmux`는 객체의 다음 계층 구조를 가집니다:
- **세션** - 세션은 하나 이상의 창이 있는 독립적인 작업 공간입니다
    + `tmux`는 새로운 세션을 시작합니다.
    + `tmux new -s NAME`은 그 이름으로 시작합니다.
    + `tmux ls`는 현재 세션들을 나열합니다.
    + `tmux` 내에서, `<C-b> d`를 입력하면 현재 세션을 분리합니다.
    + `tmux a`는 마지막 세션에 연결합니다. 특정 세션을 연결하려면 `-t` 플래그를 사용하면 됩니다.

- **창** - 편집자나 브라우저의 탭과 동등하며, 같은 세션 내의 시각적으로 분리된 영역입니다.
    + `<C-b> c`는 새로운 창을 생성합니다. 닫으려면 `<C-d>`로 셸을 종료하면 됩니다.
    + `<C-b> N`은 _N_번째 창으로 이동합니다. 주의: 창들은 0부터 번호가 매겨집니다.
    + `<C-b> p`는 이전 창으로 이동합니다.
    + `<C-b> n`은 다음 창으로 이동합니다.
    + `<C-b> ,`은 현재 창의 이름을 바꿉니다.
    + `<C-b> w`는 현재 창들을 나열합니다.

- **분할창** - vim 분할처럼 같은 창 내에서 여러 셸을 나란히 실행할 수 있게 합니다.
    + `<C-b> "`는 현재 창을 수평으로 분할합니다.
    + `<C-b> %`는 현재 창을 수직으로 분할합니다.
    + `<C-b> <direction>`은 지정된 _방향_의 창으로 이동합니다. 방향은 화살표 키를 의미합니다.
    + `<C-b> z`는 현재 창에 대해 줌을 전환합니다.
    + `<C-b> [`는 스크롤백 모드를 시작합니다. 그 다음 `<space>`를 눌러 선택을 시작하고 `<enter>`로 선택 내용을 복사할 수 있습니다.
    + `<C-b> <space>`는 창 배열 사이를 순환합니다.

> tmux에 대해 더 배우려면, [이것](https://www.hamvocke.com/blog/a-quick-and-easy-guide-to-tmux/) 빠른 튜토리얼을 읽는 것과 [이것](https://linuxcommand.org/lc3_adv_termmux.php) 더 자세한 설명을 고려하세요.

tmux와 SSH를 갖추고 나면, 어느 머신에서든 일관된 환경을 갖추고 싶을 것입니다. 바로 여기서 셸 커스터마이징이 필요합니다.

# 셸 커스터마이징

많은 명령줄 프로그램은 dotfile이라는 일반 텍스트 설정 파일을 사용합니다. Dotfile은 파일명이 `.`으로 시작하기 때문에(예: `~/.vimrc`) 기본적으로 `ls`로 나열할 때 숨겨집니다.

> Dotfile도 셸의 관례 중 하나입니다. 점으로 시작하는 이름은 그 파일들을 목록에서 숨기기 위한 것입니다.

셸도 dotfile로 설정되는 프로그램의 예입니다. 셸이 시작될 때 여러 설정 파일을 읽습니다. 셸의 종류와 로그인 세션 또는 대화형 세션 여부에 따라 이 과정은 복잡할 수 있습니다. [이 글](https://blog.flowblok.id.au/2013-02/shell-startup-scripts.html)에서 자세히 설명합니다.

`bash`를 사용한다면 `.bashrc` 또는 `.bash_profile`을 편집하는 것이 대부분의 시스템에서 잘 작동합니다. dotfile로 설정할 수 있는 다른 도구들의 예는:

- `bash` - `~/.bashrc`, `~/.bash_profile`
- `git` - `~/.gitconfig`
- `vim` - `~/.vimrc`와 `~/.vim` 디렉토리
- `ssh` - `~/.ssh/config`
- `tmux` - `~/.tmux.conf`

흔한 설정 변경은 셸이 프로그램들을 찾을 수 있는 새로운 경로를 추가하는 것입니다. 소프트웨어를 설치할 때 다음 패턴을 자주 봅니다:

```shell
export PATH="$PATH:path/to/append"
```

이는 $PATH 변수에 새로운 경로를 추가하고, 모든 자식 프로세스가 이 업데이트된 PATH를 상속하도록 합니다. 그러면 자식 프로세스들이 `path/to/append` 아래의 프로그램을 찾을 수 있게 됩니다.

셸을 커스터마이징하려면 보통 새로운 명령줄 도구들을 설치해야 합니다. 패키지 매니저가 이를 간단하게 만들어줍니다. 소프트웨어 다운로드, 설치, 업데이트를 자동화하기 때문입니다. 운영 체제마다 다른 패키지 매니저를 사용합니다: macOS는 [Homebrew](https://brew.sh/), Ubuntu/Debian은 `apt`, Fedora는 `dnf`, Arch는 `pacman`을 씁니다. 패키지 매니저에 대해서는 shipping code 강의에서 더 자세히 다룹니다.

Homebrew를 사용해 유용한 도구를 설치하는 예입니다:

```shell
# ripgrep: 더 빠르고 기본 설정이 좋은 grep
brew install ripgrep

# fd: 더 빠르고 사용하기 쉬운 find
brew install fd
```

이렇게 설치하면 `grep` 대신 `rg`를, `find` 대신 `fd`를 사용할 수 있습니다.

> **`curl | bash` 경고**: `curl -fsSL https://example.com/install.sh | bash`처럼 스크립트를 다운로드한 후 바로 실행하는 방식을 자주 봅니다. 편리하지만 위험합니다. 검사하지 않은 코드를 실행하기 때문입니다. 더 안전한 방법은 먼저 다운로드하고, 검토한 후 실행하는 것입니다:
> ```shell
> curl -fsSL https://example.com/install.sh -o install.sh
> less install.sh  # 스크립트 확인
> bash install.sh
> ```
> 일부 설치 프로그램은 조금 더 안전한 방식을 사용합니다: `/bin/bash -c "$(curl -fsSL https://url)"`. 이 방식은 최소한 현재 셸이 아닌 bash가 스크립트를 실행하도록 보장합니다.

설치되지 않은 명령을 실행하면 셸이 `command not found` 오류를 표시합니다. [command-not-found.com](https://command-not-found.com)은 명령어를 검색하고 다양한 패키지 매니저와 배포판에서 설치하는 방법을 찾을 수 있는 유용한 웹사이트입니다.

또 다른 유용한 도구는 [`tldr`](https://tldr.sh/)입니다. 긴 문서 대신 간단하고 예제 기반의 man 페이지를 제공합니다. 흔한 사용 패턴을 빠르게 확인할 수 있습니다:

```console
$ tldr fd
  An alternative to find.
  Aims to be faster and easier to use than find.

  Recursively find files matching a pattern in the current directory:
      fd "pattern"

  Find files that begin with "foo":
      fd "^foo"

  Find files with a specific extension:
      fd --extension txt
```

때로는 특정 플래그를 항상 붙이는 기존 명령에 새로운 단축명이 필요할 수 있습니다. 이때 별칭(alias)을 사용합니다.

`alias` 셸 내장 명령을 사용하여 자신만의 별칭을 만들 수 있습니다. 셸 별칭은 셸이 명령을 평가하기 전에 자동으로 치환되는 명령의 단축형입니다. bash에서 별칭의 구조는:

```bash
alias alias_name="command_to_alias arg1 arg2"
```

> `=` 주위에 공백이 없어야 합니다. [`alias`](https://www.man7.org/linux/man-pages/man1/alias.1p.html)는 단일 인수를 받는 셸 명령이기 때문입니다.

별칭은 여러 유용한 기능들을 제공합니다:

```bash
# Make shorthands for common flags
alias ll="ls -lh"

# Save a lot of typing for common commands
alias gs="git status"
alias gc="git commit"

# Save you from mistyping
alias sl=ls

# Overwrite existing commands for better defaults
alias mv="mv -i"           # -i prompts before overwrite
alias mkdir="mkdir -p"     # -p make parent dirs as needed
alias df="df -h"           # -h prints human readable format

# Alias can be composed
alias la="ls -A"
alias lla="la -l"

# To ignore an alias run it prepended with \
\ls
# Or disable an alias altogether with unalias
unalias la

# To get an alias definition just call it with alias
alias ll
# Will print ll='ls -lh'
```

별칭에는 제한이 있습니다. 명령의 중간에 인수를 삽입할 수 없습니다. 더 복잡한 동작이 필요하면 셸 함수를 사용해야 합니다.

대부분의 셸에서 `Ctrl-R`로 역방향 이력 검색을 할 수 있습니다. `Ctrl-R`을 누르면 이전 명령들을 검색할 수 있습니다. 앞에서 소개한 퍼지 파인더 `fzf`를 셸과 통합하면 `Ctrl-R`이 전체 이력에서 대화형 퍼지 검색을 하게 되어 기본 기능보다 훨씬 강력합니다.

dotfile들을 어떻게 관리해야 할까요? 별도의 폴더에서 버전 제어하고, 스크립트를 사용하여 홈 디렉토리에 **심볼 링크**를 만들어야 합니다. 이렇게 하면 다음과 같은 이점이 있습니다:

- **쉬운 설치**: 새로운 머신에 로그인하면 1분 안에 설정을 적용할 수 있습니다.
- **이식성**: 어디서든 도구들이 같은 방식으로 동작합니다.
- **동기화**: 어디서든 dotfile들을 업데이트하고 모든 장치에서 동기화 상태를 유지할 수 있습니다.
- **변경 추적**: 프로그래밍 경력 전체에 걸쳐 dotfile들을 관리하게 되므로 버전 이력이 있으면 유용합니다.

dotfile에 무엇을 넣을까요? 온라인 문서나 [man 페이지](https://en.wikipedia.org/wiki/Man_page)를 읽어 각 도구의 설정을 배울 수 있습니다. 또 다른 좋은 방법은 특정 프로그램에 관한 블로그 포스트를 검색하는 것입니다. 저자들이 선호하는 설정들을 공유합니다. 다른 사람의 dotfile들을 살펴보는 것도 도움이 됩니다. GitHub에서 [dotfile 저장소](https://github.com/search?o=desc&q=dotfiles&s=stars&type=Repositories)를 수많이 찾을 수 있습니다. [가장 인기 있는 저장소](https://github.com/mathiasbynens/dotfiles)를 참고하되, 맹목적으로 설정을 복사하지 않도록 주의하세요. [이 글](https://dotfiles.github.io/)도 좋은 자료입니다.

이 강의의 강사들도 GitHub에서 자신의 dotfile들을 공개합니다: [Anish](https://github.com/anishathalye/dotfiles), [Jon](https://github.com/jonhoo/configs), [Jose](https://github.com/jjgo/dotfiles).

**프레임워크와 플러그인**도 셸을 개선할 수 있습니다. 인기 있는 프레임워크로는 [prezto](https://github.com/sorin-ionescu/prezto)나 [oh-my-zsh](https://ohmyz.sh/) 같은 것이 있고, 특정 기능에만 초점을 맞춘 작은 플러그인들도 있습니다:

- [zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting) - 입력하는 동안 유효/무효한 명령을 색칠합니다
- [zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions) - 입력하는 동안 이력에서 명령을 제안합니다
- [zsh-completions](https://github.com/zsh-users/zsh-completions) - 추가 완성 정의들
- [zsh-history-substring-search](https://github.com/zsh-users/zsh-history-substring-search) - fish처럼 동작하는 이력 검색
- [powerlevel10k](https://github.com/romkatv/powerlevel10k) - 빠르고 커스터마이징 가능한 프롬프트 테마

[fish](https://fishshell.com/)와 같은 셸들은 많은 기능을 기본 제공합니다.

> 이러한 기능들을 얻으려고 oh-my-zsh 같은 거대한 프레임워크를 꼭 설치할 필요는 없습니다. 필요한 플러그인만 개별 설치하는 것이 더 빠르고 제어하기도 쉽습니다. 큰 프레임워크는 셸 시작 시간을 크게 늘릴 수 있으므로 실제로 사용할 것들만 설치하는 것을 권장합니다.

# 셸과 AI

셸에서 AI 도구를 통합하는 많은 방법이 있습니다. 몇 가지 예시입니다:

**명령 생성**: [`simonw/llm`](https://github.com/simonw/llm) 같은 도구들은 자연어 설명으로 셸 명령을 생성하는 데 도움이 됩니다:

```console
$ llm cmd "find all python files modified in the last week"
find . -name "*.py" -mtime -7
```

**파이프라인 통합**: LLM을 셸 파이프라인에 통합해 데이터를 처리하고 변환할 수 있습니다. 특히 정규식으로 처리하기 어려운 불규칙한 형식에서 정보를 추출할 때 유용합니다:

```console
$ cat users.txt
Contact: john.doe@example.com
User 'alice_smith' logged in at 3pm
Posted by: @bob_jones on Twitter
Author: Jane Doe (jdoe)
Message from mike_wilson yesterday
Submitted by user: sarah.connor
$ INSTRUCTIONS="Extract just the username from each line, one per line, nothing else"
$ llm "$INSTRUCTIONS" < users.txt
john.doe
alice_smith
bob_jones
jdoe
mike_wilson
sarah.connor
```

`"$INSTRUCTIONS"`를 따옴표로 감싼 이유는 변수에 공백이 포함되어 있기 때문입니다. `< users.txt`는 파일 내용을 stdin으로 리다이렉트합니다.

**AI 셸**: [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 같은 도구들은 영어 명령을 받아 셸 작업, 파일 편집, 복잡한 다중 단계 작업 등으로 변환하는 메타 셸처럼 동작합니다.

# 터미널 에뮬레이터

셸을 커스터마이징하는 것만큼 **터미널 에뮬레이터** 선택과 설정도 중요합니다. 터미널 에뮬레이터는 셸이 실행되는 텍스트 기반 인터페이스를 제공하는 GUI 프로그램입니다. 여러 종류가 있습니다.

터미널에서 수백 시간에서 수천 시간을 보내므로 설정을 세심하게 조정할 가치가 있습니다. 터미널에서 커스터마이징할 수 있는 항목들:

- 폰트 선택
- 색 구성표
- 키보드 단축키
- 탭/창 지원
- 스크롤백 설정
- 성능([Alacritty](https://github.com/alacritty/alacritty)나 [Ghostty](https://ghostty.org/) 같은 새로운 터미널은 GPU 가속을 지원합니다).

# 연습

## 인수와 글롭

1. `cmd --flag -- --notaflag` 같은 명령을 볼 수 있습니다. `--`는 프로그램이 플래그 파싱을 멈추도록 알려주는 특수 인수입니다. `--` 이후의 모든 것은 위치 인수로 취급됩니다. 왜 유용할까요? `touch -- -myfile`을 실행한 후, `--` 없이 삭제해 보세요.

1. [`man ls`](https://www.man7.org/linux/man-pages/man1/ls.1.html)를 읽고 다음과 같이 파일을 나열하는 `ls` 명령을 작성하세요:
    - 숨김 파일을 포함한 모든 파일을 표시합니다
    - 파일 크기를 인간 읽을 수 있는 형식으로 표시합니다(예: 454279954 대신 454M)
    - 파일을 수정 시간 순서로 정렬합니다
    - 출력을 색칠합니다

    샘플 출력:

    ```
    -rw-r--r--   1 user group 1.1M Jan 14 09:53 baz
    drwxr-xr-x   5 user group  160 Jan 14 09:53 .
    -rw-r--r--   1 user group  514 Jan 14 06:42 bar
    -rw-r--r--   1 user group 106M Jan 13 12:12 foo
    drwx------+ 47 user group 1.5K Jan 12 18:08 ..
    ```

1. 프로세스 치환 `<(command)`는 명령의 출력을 파일처럼 사용할 수 있게 합니다. `diff`를 프로세스 치환과 함께 사용하여 `printenv`와 `export`의 출력을 비교하세요. 왜 그들이 다른가요? (힌트: `diff <(printenv | sort) <(export | sort)`를 시도해 보세요).

## 환경 변수

1. bash 함수 `marco`와 `polo`를 작성하세요. `marco`를 실행하면 현재 디렉토리를 저장하고, 나중에 어느 디렉토리에 있든 `polo`를 실행하면 `marco`를 실행했던 디렉토리로 돌아갑니다. 코드는 `marco.sh` 파일에 작성하고, `source marco.sh`로 셸에 로드할 수 있습니다.

## 반환 코드

1. 가끔씩 실패하는 명령을 디버그해야 한다고 합시다. 실패할 때까지 계속 실행하고 그때의 표준 출력과 표준 오류를 파일로 저장한 후 마지막에 모두 출력하는 bash 스크립트를 작성하세요. 보너스: 실패하기까지 몇 번 실행했는지도 보고하세요.

    ```bash
    #!/usr/bin/env bash

    n=$(( RANDOM % 100 ))

    if [[ n -eq 42 ]]; then
       echo "Something went wrong"
       >&2 echo "The error was using magic numbers"
       exit 1
    fi

    echo "Everything went according to plan"
    ```

## 신호와 작업 제어

1. 터미널에서 `sleep 10000`을 시작하고, `Ctrl-Z`로 일시 중지한 후, `bg`로 백그라운드 실행하세요. 그 다음 [`pgrep`](https://www.man7.org/linux/man-pages/man1/pgrep.1.html)으로 PID를 찾고, [`pkill`](https://man7.org/linux/man-pages/man1/pgrep.1.html)으로 직접 PID를 입력하지 않고 종료하세요. (힌트: `-af` 플래그 사용)

1. 한 프로세스가 완료될 때까지 다른 프로세스를 시작하지 않으려면 어떻게 할까요? 이 연습에서 제한 프로세스는 `sleep 60 &`입니다. [`wait`](https://www.man7.org/linux/man-pages/man1/wait.1p.html) 명령을 사용하여 sleep을 시작하고 백그라운드 프로세스가 완료될 때까지 대기한 후 `ls`를 실행하세요.

    하지만 다른 bash 세션에서는 `wait`이 작동하지 않습니다. `wait`은 자식 프로세스에만 작동하기 때문입니다. 주의: `kill` 명령은 성공하면 0, 실패하면 0이 아닌 종료 상태를 반환합니다. `kill -0`은 신호를 보내지 않지만 프로세스가 없으면 0이 아닌 상태를 반환합니다. PID를 받아 주어진 프로세스가 완료될 때까지 대기하는 `pidwait` bash 함수를 작성하세요. 불필요한 CPU 소비를 피하려면 `sleep`을 사용하세요.

## 파일과 권한

1. (고급) 재귀적으로 디렉토리에서 가장 최근에 수정된 파일을 찾으세요. 더 일반적으로, 모든 파일을 수정 시간 순서로 나열할 수 있을까요?

## 터미널 멀티플렉서

1. 이 `tmux` [튜토리얼](https://www.hamvocke.com/blog/a-quick-and-easy-guide-to-tmux/)을 따르고, [이 가이드](https://www.hamvocke.com/blog/a-guide-to-customizing-your-tmux-conf/)로 기본적인 커스터마이징을 배우세요.

## 별칭과 Dotfile

1. `cd` 오타를 자동으로 고쳐주는 `dc` 별칭을 만드세요.

1. `history | awk '{$1="";print substr($0,2)}' | sort | uniq -c | sort -n | tail -n 10`을 실행해 가장 자주 사용하는 명령 10개를 확인하고, 이들을 위한 단축 별칭을 만들어 보세요. 참고: Bash 용입니다. ZSH 사용자는 `history` 대신 `history 1`을 사용하세요.

1. dotfile들을 관리할 폴더를 만들고 버전 제어를 설정하세요.

1. 최소한 하나의 프로그램(예: 셸)에 대한 설정을 추가하세요. 시작은 `$PS1`을 설정해 프롬프트를 커스터마이징하는 정도면 충분합니다.

1. 새로운 머신에서 빠르고 자동으로 dotfile들을 설치하는 방법을 만드세요. 각 파일마다 `ln -s`를 호출하는 셸 스크립트를 만들거나, [전문 유틸리티](https://dotfiles.github.io/utilities/)를 사용할 수 있습니다.

1. 깨끗한 가상 머신에서 설치 스크립트를 테스트하세요.

1. 현재 도구 설정들을 모두 dotfile 저장소로 옮기세요.

1. GitHub에 dotfile들을 공개하세요.

## 원격 머신(SSH)

이 연습을 위해 Linux 가상 머신을 설치하거나 기존 것을 사용하세요. 가상 머신이 처음이라면 [이 튜토리얼](https://hibbard.eu/install-ubuntu-virtual-box/)을 확인하세요.

1. `~/.ssh/`로 이동해 SSH 키 쌍이 있는지 확인하세요. 없으면 `ssh-keygen -a 100 -t ed25519`로 생성하세요. 암호 문구를 사용하고 `ssh-agent`를 사용하기를 권장합니다. [여기](https://www.ssh.com/ssh/agent)를 참고하세요.

1. `.ssh/config`을 다음과 같이 편집하세요:

    ```bash
    Host vm
        User username_goes_here
        HostName ip_goes_here
        IdentityFile ~/.ssh/id_ed25519
        LocalForward 9999 localhost:8888
    ```

1. `ssh-copy-id vm`으로 SSH 키를 서버에 복사하세요.

1. VM에서 `python -m http.server 8888`을 실행해 웹 서버를 시작하세요. 당신의 머신에서 `http://localhost:9999`로 접속해 VM 웹 서버에 접근하세요.

1. `sudo vim /etc/ssh/sshd_config`로 SSH 서버 설정을 편집하세요. `PasswordAuthentication`을 비활성화하고, `PermitRootLogin`도 비활성화하세요. `sudo service sshd restart`로 SSH 서비스를 재시작한 후 다시 접속하세요.

1. (도전) VM에 [`mosh`](https://mosh.org/)를 설치하고 연결하세요. 그 다음 서버/VM의 네트워크 어댑터를 분리하세요. mosh가 제대로 복구될까요?

1. (도전) `ssh`의 `-N`과 `-f` 플래그가 무엇인지 알아보고, 백그라운드 포트 포워딩을 수행하는 명령을 찾으세요.
