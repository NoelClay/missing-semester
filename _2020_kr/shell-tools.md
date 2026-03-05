---
layout: lecture
permalink: /2020/kr/shell-tools/
title: "쉘 도구 및 스크립팅 (Shell Tools and Scripting)"
description: >
  쉘 스크립트를 작성하는 방법과 강력한 커맨드 라인 도구들의 사용법을 배웁니다.
thumbnail: /static/assets/thumbnails/2020/lec2.png
date: 2020-01-14
ready: true
video:
  aspect: 56.25
  id: kr_lec2_2020
---

이번 강의에서는 bash를 스크립팅 언어로 사용하는 기초적인 방법과 함께, 커맨드 라인에서 끊임없이 수행하게 될 가장 일반적인 작업들을 처리하는 다양한 쉘 도구들을 소개한다.

# 쉘 스크립팅 (Shell Scripting)

지금까지 우리는 쉘에서 명령어를 실행하고 파이프로 연결하는 방법을 살펴보았다.
하지만 많은 경우, 일련의 명령어들을 실행하면서 조건문이나 루프와 같은 제어 흐름(control flow) 표현식을 사용하고 싶을 것이다.

쉘 스크립트는 그 다음 단계의 복잡성을 해결해 준다.
대부분의 쉘은 변수, 제어 흐름, 그리고 자신만의 문법을 가진 스크립팅 언어를 내장하고 있다.
쉘 스크립팅이 다른 스크립팅 프로그래밍 언어와 다른 점은 쉘 관련 작업을 수행하는 데 최적화되어 있다는 것이다.
따라서 명령어 파이프라인 생성, 결과를 파일로 저장, 표준 입력으로부터 읽기 등이 쉘 스크립팅의 기본 요소(primitives)로 포함되어 있어, 범용 스크립팅 언어보다 사용하기 쉽다.
이 섹션에서는 가장 일반적인 bash 스크립팅에 집중할 것이다.

bash에서 변수를 할당하려면 `foo=bar` 구문을 사용하고, 변수 값에 접근하려면 `$foo`를 사용한다.
`foo = bar`와 같이 쓰면 안 된다는 점에 유의하라. 이는 `foo` 프로그램을 `=`와 `bar`라는 인자와 함께 호출하는 것으로 해석되기 때문이다.
일반적으로 쉘 스크립트에서 공백 문자는 인자를 구분하는 역할을 한다. 이 동작은 처음에는 혼란스러울 수 있으므로 항상 확인하는 습관을 들여야 한다.

bash의 문자열은 `'`와 `"`로 정의할 수 있지만, 둘은 서로 다르다.
`'`로 감싸진 문자열은 리터럴(literal) 문자열로 변수 값이 치환되지 않지만, `"`로 감싸진 문자열은 변수 값이 치환된다.

```bash
foo=bar
echo "$foo"
# bar 출력
echo '$foo'
# $foo 출력
```

대부분의 프로그래밍 언어와 마찬가지로, bash는 `if`, `case`, `while`, `for`를 포함한 제어 흐름 기법을 지원한다.
또한 `bash`는 인자를 받아 처리할 수 있는 함수를 가질 수 있다. 다음은 디렉토리를 생성하고 그 안으로 이동(`cd`)하는 함수의 예시이다.


```bash
mcd () {
    mkdir -p "$1"
    cd "$1"
}
```

여기서 `$1`은 스크립트나 함수에 전달된 첫 번째 인자를 의미한다.
다른 스크립팅 언어와 달리, bash는 인자, 에러 코드 및 기타 관련 변수들을 참조하기 위해 다양한 특수 변수들을 사용한다. 다음은 그중 일부의 목록이다. 더 자세한 목록은 [여기](https://tldp.org/LDP/abs/html/special-chars.html)에서 찾을 수 있다.
- `$0` - 스크립트의 이름
- `$1` ~ `$9` - 스크립트에 전달된 인자들. `$1`은 첫 번째 인자이며 나머지도 마찬가지이다.
- `$@` - 모든 인자들
- `$#` - 인자의 개수
- `$?` - 직전 명령어의 리턴 코드 (반환 값)
- `$$` - 현재 스크립트의 프로세스 식별 번호 (PID)
- `!!` - 인자를 포함한 직전 명령어 전체. 흔한 패턴 중 하나는 권한 부족으로 실패한 명령어를 `sudo !!`를 통해 빠르게 다시 실행하는 것이다.
- `$_` - 직전 명령어의 마지막 인자. 대화형 쉘을 사용 중이라면 `Esc`를 누른 뒤 `.`을 입력하거나 `Alt+.`을 눌러 이 값을 빠르게 가져올 수 있다.

명령어들은 종종 `STDOUT`을 통해 출력을 반환하고, `STDERR`을 통해 에러를 반환하며, 스크립트에서 활용하기 좋은 방식으로 에러를 보고하기 위해 리턴 코드를 사용한다.
리턴 코드 또는 종료 상태(exit status)는 스크립트나 명령어가 실행 결과를 전달하는 방식이다.
값이 0이면 보통 아무 문제 없이 완료되었음을 의미하며, 0이 아닌 값은 에러가 발생했음을 의미한다.

종료 코드는 `&&`(AND 연산자)와 `||`(OR 연산자)를 사용하여 명령어를 조건부로 실행하는 데 사용될 수 있다. 둘 다 [단락 평가(short-circuiting)](https://en.wikipedia.org/wiki/Short-circuit_evaluation) 연산자이다. 명령어들은 세미콜론 `;`을 사용하여 같은 라인 내에서 구분될 수도 있다.
`true` 프로그램은 항상 0 리턴 코드를 가지며, `false` 명령어는 항상 1 리턴 코드를 가진다.
예시를 살펴보자.

```bash
false || echo "Oops, fail"
# Oops, fail 출력

true || echo "Will not be printed"
# 출력 없음

true && echo "Things went well"
# Things went well 출력

false && echo "Will not be printed"
# 출력 없음

true ; echo "This will always run"
# This will always run 출력

false ; echo "This will always run"
# This will always run 출력
```

또 다른 흔한 패턴은 명령어의 출력을 변수로 가져오는 것이다. 이는 **명령어 치환(command substitution)**을 통해 가능하다.
`$( CMD )`를 배치하면 `CMD`를 실행하고 그 출력을 가져와서 해당 위치에 치환한다.
예를 들어 `for file in $(ls)`라고 하면, 쉘은 먼저 `ls`를 호출한 뒤 그 결과 값들을 순회한다.
덜 알려졌지만 비슷한 기능으로 **프로세스 치환(process substitution)**이 있다. `<( CMD )`는 `CMD`를 실행하고 그 출력을 임시 파일에 저장한 뒤, `<()` 부분을 해당 파일의 이름으로 치환한다. 이는 명령어들이 값을 STDIN이 아닌 파일 형태로 받기를 기대할 때 유용하다. 예를 들어 `diff <(ls foo) <(ls bar)`는 `foo`와 `bar` 디렉토리 내의 파일 차이점을 보여준다.


정보가 너무 많았으므로, 이러한 기능들을 보여주는 예제를 살펴보자. 이 스크립트는 우리가 제공한 인자들을 순회하며 `foobar`라는 문자열을 `grep`으로 찾고, 만약 찾지 못했다면 해당 파일 끝에 주석으로 추가한다.

```bash
#!/bin/bash

echo "프로그램 시작 시간: $(date)" # date 결과가 치환됨

echo "실행 중인 프로그램: $0, 인자 개수: $#개, PID: $$"

for file in "$@"; do
    grep foobar "$file" > /dev/null 2> /dev/null
    # 패턴을 찾지 못했을 때 grep은 종료 상태 1을 반환함
    # 우리는 출력 내용에 관심이 없으므로 STDOUT과 STDERR을 null 레지스터로 리다이렉션함
    if [[ $? -ne 0 ]]; then
        echo "$file 파일에 foobar가 없으므로 추가함"
        echo "# foobar" >> "$file"
    fi
done
```

비교문에서 우리는 `$?`가 0과 같지 않은지(`-ne`) 테스트했다.
bash는 이러한 종류의 많은 비교 연산자들을 구현하고 있다. 상세 목록은 [`test`](https://www.man7.org/linux/man-pages/man1/test.1.html) 매뉴얼 페이지에서 찾을 수 있다.
bash에서 비교를 수행할 때는 단순 대괄호 `[ ]` 대신 이중 대괄호 `[[ ]]`를 사용하는 것이 좋다. 비록 `sh`로의 이식성은 떨어지지만 실수할 확률이 낮아지기 때문이다. 더 자세한 설명은 [여기](https://mywiki.wooledge.org/BashFAQ/031)를 참조하라.

스크립트를 실행할 때 비슷한 인자들을 제공하고 싶은 경우가 많을 것이다. bash는 파일명 확장(filename expansion)을 수행하여 표현식을 확장함으로써 이를 쉽게 만들어준다. 이러한 기법들을 쉘 **글로빙(globbing)**이라고 부른다.
- 와일드카드(Wildcards) - 와일드카드 매칭을 수행하고 싶을 때, `?`는 문자 하나를, `*`는 임의의 개수의 문자를 매칭하는 데 사용한다. 예를 들어 `foo`, `foo1`, `foo2`, `foo10`, `bar`라는 파일들이 있을 때, `rm foo?` 명령어는 `foo1`과 `foo2`를 삭제하고, `rm foo*` 명령어는 `bar`를 제외한 모든 파일을 삭제한다.
- 중괄호(Curly braces) `{}` - 일련의 명령어들에서 공통된 부분 문자열이 있을 때 중괄호를 사용하여 bash가 이를 자동으로 확장하게 할 수 있다. 이는 파일을 이동하거나 변환할 때 매우 유용하다.

```bash
convert image.{png,jpg}
# 다음과 같이 확장됨
convert image.png image.jpg

cp /path/to/project/{foo,bar,baz}.sh /newpath
# 다음과 같이 확장됨
cp /path/to/project/foo.sh /path/to/project/bar.sh /path/to/project/baz.sh /newpath

# 글로빙 기법들은 조합 가능함
mv *{.py,.sh} folder
# 모든 *.py와 *.sh 파일을 이동함


mkdir foo bar
# foo/a, foo/b, ... foo/h 및 bar/a, bar/b, ... bar/h 파일 생성
touch {foo,bar}/{a..h}
touch foo/x bar/y
# foo와 bar 디렉토리 내의 파일 차이점 표시
diff <(ls foo) <(ls bar)
# 출력 결과:
# < x
# ---
# > y
```

<!-- 마지막으로 파이프 `|`는 스크립팅의 핵심 기능이다. 파이프는 한 프로그램의 출력을 다음 프로그램의 입력으로 연결한다. 이에 대해서는 데이터 정리 강의에서 더 자세히 다룰 것이다. -->

`bash` 스크립트를 작성하는 것은 까다롭고 비직관적일 수 있다. [shellcheck](https://github.com/koalaman/shellcheck)와 같은 도구들은 sh/bash 스크립트에서 에러를 찾는 데 도움을 줄 것이다.

터미널에서 호출된다고 해서 스크립트를 반드시 bash로 작성해야 하는 것은 아니다. 예를 들어, 인자들을 역순으로 출력하는 간단한 Python 스크립트는 다음과 같다.

```python
#!/usr/local/bin/python
import sys
for arg in reversed(sys.argv[1:]):
    print(arg)
```

커널은 스크립트 최상단에 포함된 **쉬뱅(shebang)** 라인을 보고 쉘 명령어가 아닌 Python 인터프리터로 이 스크립트를 실행해야 함을 인지한다.
명령어가 시스템의 어디에 위치하든 찾아낼 수 있도록 [`env`](https://www.man7.org/linux/man-pages/man1/env.1.html) 명령어를 사용하여 쉬뱅 라인을 작성하는 것이 좋다. 이는 스크립트의 이식성을 높여준다. 위치를 결정하기 위해 `env`는 첫 번째 강의에서 소개한 `PATH` 환경 변수를 사용한다.
이 예제의 경우 쉬뱅 라인은 `#!/usr/bin/env python`과 같이 작성될 것이다.

쉘 함수와 스크립트 사이의 몇 가지 차이점을 기억해 두어야 한다.
- 함수는 반드시 쉘과 동일한 언어로 작성되어야 하지만, 스크립트는 어떤 언어로든 작성될 수 있다. 이것이 스크립트에서 쉬뱅을 포함하는 것이 중요한 이유이다.
- 함수는 정의가 읽힐 때 한 번 로드된다. 스크립트는 실행될 때마다 매번 로드된다. 이 때문에 함수가 로딩 속도는 약간 더 빠르지만, 내용을 변경할 때마다 정의를 다시 로드해야 한다.
- 함수는 현재 쉘 환경에서 실행되지만, 스크립트는 자신만의 프로세스에서 실행된다. 따라서 함수는 현재 디렉토리를 변경하는 등 환경 변수를 수정할 수 있지만, 스크립트는 그럴 수 없다. [`export`](https://www.man7.org/linux/man-pages/man1/export.1p.html)를 사용하여 익스포트된 환경 변수들은 스크립트에 값으로 전달된다.
- 여느 프로그래밍 언어와 마찬가지로, 함수는 모듈화, 코드 재사용, 쉘 코드의 가독성을 달성하기 위한 강력한 구조이다. 종종 쉘 스크립트 내에 자체적인 함수 정의를 포함시키기도 한다.

# 쉘 도구 (Shell Tools)

## 명령어 사용법 찾기 (Finding how to use commands)

이 시점에서 별칭 섹션에 나온 `ls -l`, `mv -i`, `mkdir -p`와 같은 명령어들의 플래그를 어떻게 찾는지 궁금할 것이다.
더 일반적으로, 특정 명령어가 주어졌을 때 그 기능과 다양한 옵션들을 어떻게 알아낼 수 있을까?
구글링을 시작할 수도 있겠지만, UNIX는 StackOverflow보다 먼저 생겨났기 때문에 이러한 정보를 얻기 위한 내장된 방법들이 존재한다.

쉘 강의에서 보았듯이, 첫 번째 방법은 해당 명령어를 `-h`나 `--help` 플래그와 함께 호출하는 것이다. 더 상세한 방법은 `man` 명령어를 사용하는 것이다.
매뉴얼(Manual)의 약자인 [`man`](https://www.man7.org/linux/man-pages/man1/man.1.html)은 지정한 명령어에 대한 매뉴얼 페이지(manpage)를 제공한다.
예를 들어 `man rm`은 앞에서 보여준 `-i` 플래그를 포함하여 `rm` 명령어의 동작과 사용 가능한 플래그들을 출력한다.
사실 내가 지금까지 각 명령어에 대해 링크를 걸어둔 것은 해당 명령어들의 Linux 매뉴얼 페이지 온라인 버전이다.
개발자가 설치 과정의 일부로 매뉴얼 페이지 엔트리를 작성하여 포함시켰다면, 설치한 외부 명령어들도 매뉴얼 페이지를 가질 것이다.
ncurses 기반의 대화형 도구들의 경우, 프로그램 내에서 `:help` 명령어를 사용하거나 `?`를 입력하여 도움말에 접근할 수 있는 경우가 많다.

때로 매뉴얼 페이지는 명령어에 대해 너무 상세한 설명을 제공하여 일반적인 사용 사례에 어떤 플래그나 문법을 사용해야 할지 파악하기 어렵게 만들기도 한다.
[TLDR 페이지](https://tldr.sh/)는 명령어의 핵심 사용 사례 예시를 제공하는 데 집중하여 어떤 옵션을 써야 할지 빠르게 파악하게 해주는 훌륭한 보완책이다.
예를 들어, 나는 매뉴얼 페이지보다 [`tar`](https://tldr.inbrowser.app/pages/common/tar)나 [`ffmpeg`](https://tldr.inbrowser.app/pages/common/ffmpeg)의 tldr 페이지를 훨씬 더 자주 찾아보게 된다.


## 파일 찾기 (Finding files)

모든 프로그래머가 직면하는 가장 흔하고 반복적인 작업 중 하나는 파일이나 디렉토리를 찾는 것이다.
모든 UNIX 계열 시스템에는 파일을 찾기 위한 훌륭한 쉘 도구인 [`find`](https://www.man7.org/linux/man-pages/man1/find.1.html)가 포함되어 있다. `find`는 기준에 맞는 파일을 재귀적으로 검색한다. 예시를 살펴보자.

```bash
# 이름이 src인 모든 디렉토리 찾기
find . -name src -type d
# 경로에 test라는 폴더가 포함된 모든 python 파일 찾기
find . -path '*/test/*.py' -type f
# 최근 하루 동안 수정된 모든 파일 찾기
find . -mtime -1
# 크기가 500k에서 10M 사이인 모든 zip 파일 찾기
find . -size +500k -size -10M -name '*.tar.gz'
```
파일을 나열하는 것 외에도, `find`는 쿼리에 일치하는 파일들에 대해 특정 동작을 수행할 수 있다.
이 기능은 단조로운 작업들을 단순화하는 데 엄청난 도움이 된다.
```bash
# .tmp 확장자를 가진 모든 파일 삭제
find . -name '*.tmp' -exec rm {} \;

# 모든 PNG 파일을 찾아 JPG로 변환
find . -name '*.png' -exec magick {} {}.jpg \;
```

`find`는 어디에나 있지만, 그 문법은 때때로 기억하기 어려울 수 있다.
예를 들어 단순히 패턴 `PATTERN`과 일치하는 파일을 찾으려면 `find -name '*PATTERN*'`(대소문자를 구분하지 않으려면 `-iname`)을 실행해야 한다.
이러한 상황들을 위해 별칭을 만들 수도 있겠지만, 쉘 철학 중 하나는 대안을 탐색해 보는 것이 좋다는 점이다.
쉘의 가장 큰 장점 중 하나는 단지 프로그램들을 호출하는 것이므로, 일부를 대체할 수 있는 다른 프로그램을 찾거나 직접 만들 수도 있다는 점을 기억하라.
예를 들어 [`fd`](https://github.com/sharkdp/fd)는 `find`에 대한 간단하고 빠르며 사용자 친화적인 대안이다.
컬러 출력, 기본 정규 표현식 매칭, 유니코드 지원과 같은 좋은 기본값들을 제공한다. 또한 내 생각에 문법이 훨씬 더 직관적이다.
예를 들어 패턴 `PATTERN`을 찾는 문법은 단순히 `fd PATTERN`이다.

대부분 `find`나 `fd`가 좋다는 데 동의하겠지만, 매번 파일을 검색하는 것보다 인덱스나 데이터베이스를 구축하여 빠르게 검색하는 효율성에 대해 궁금해하는 사람도 있을 것이다.
그것이 바로 [`locate`](https://www.man7.org/linux/man-pages/man1/locate.1.html)가 하는 일이다.
`locate`는 [`updatedb`](https://www.man7.org/linux/man-pages/man1/updatedb.1.html)를 통해 업데이트되는 데이터베이스를 사용한다.
대부분의 시스템에서 `updatedb`는 [`cron`](https://www.man7.org/linux/man-pages/man8/cron.8.html)을 통해 매일 업데이트된다.
따라서 두 방식의 트레이드오프는 속도 대 최신성(freshness)이다.
또한 `find`와 유사한 도구들은 파일 크기, 수정 시간, 권한 등의 속성을 사용하여 파일을 찾을 수 있지만, `locate`는 파일 이름만 사용한다.
더 상세한 비교는 [여기](https://unix.stackexchange.com/questions/60205/locate-vs-find-usage-pros-and-cons-of-each-other)에서 찾을 수 있다.

## 코드 찾기 (Finding code)

이름으로 파일을 찾는 것도 유용하지만, 파일의 **내용**을 기반으로 검색하고 싶은 경우가 아주 많다.
일반적인 시나리오는 특정 패턴을 포함하는 모든 파일과, 그 파일의 어느 위치에 해당 패턴이 나타나는지 찾고 싶은 경우이다.
이를 위해 대부분의 UNIX 계열 시스템은 입력 텍스트에서 패턴을 매칭하는 범용 도구인 [`grep`](https://www.man7.org/linux/man-pages/man1/grep.1.html)을 제공한다.
`grep`은 데이터 정리 강의에서 더 자세히 다룰 매우 가치 있는 쉘 도구이다.

지금은 `grep`이 매우 다재다능한 도구가 될 수 있게 해주는 많은 플래그들을 가지고 있다는 점만 알아두라.
내가 자주 사용하는 것들은 매칭된 라인 주변의 문맥(**C**ontext)을 보여주는 `-C`와, 매칭을 반전시켜 패턴과 일치하지 **않는** 모든 라인을 출력하는 `-v`이다. 예를 들어 `grep -C 5`는 매치된 행 앞뒤로 5개 행을 더 출력한다.
많은 파일들을 빠르게 검색하고 싶을 때는 디렉토리 안으로 재귀적으로(**R**ecursively) 들어가 일치하는 문자열을 찾는 `-R` 플래그를 사용하고 싶을 것이다.

하지만 `grep -R`은 `.git` 폴더 무시, 멀티 CPU 지원 등 여러 면에서 개선될 수 있다.
[ack](https://github.com/beyondgrep/ack3), [ag](https://github.com/ggreer/the_silver_searcher), [rg](https://github.com/BurntSushi/ripgrep) 등 많은 `grep` 대안들이 개발되었다.
이들은 모두 훌륭하며 거의 동일한 기능을 제공한다.
현재 나는 매우 빠르고 직관적인 ripgrep(`rg`)을 주로 사용하고 있다. 예시를 살펴보자.
```bash
# requests 라이브러리를 사용한 모든 python 파일 찾기
rg -t py 'import requests'
# 쉬뱅(shebang) 라인이 없는 모든 파일(숨김 파일 포함) 찾기
rg -u --files-without-match "^#\!"
# foo가 매칭된 모든 항목과 그 뒤의 5개 행 출력
rg foo -A 5
# 매칭 통계 출력 (일치하는 행 및 파일 개수)
rg --stats PATTERN
```

`find`/`fd`와 마찬가지로, 구체적으로 어떤 도구를 쓰느냐보다 이러한 문제들이 이 도구들 중 하나를 사용하여 빠르게 해결될 수 있다는 점을 아는 것이 중요하다.

## 쉘 명령어 찾기 (Finding shell commands)

지금까지 파일과 코드를 찾는 법을 보았지만, 쉘에서 더 많은 시간을 보내게 됨에 따라 이전에 입력했던 특정 명령어를 찾고 싶을 때가 있을 것이다.
가장 먼저 알아야 할 것은 위쪽 화살표 키를 누르면 이전 명령어를 가져올 수 있고, 계속 누르면 쉘 히스토리를 천천히 훑어볼 수 있다는 점이다.

`history` 명령어는 쉘 히스토리에 프로그래밍 방식으로 접근할 수 있게 해준다.
이 명령어는 쉘 히스토리를 표준 출력으로 보여준다.
그 안에서 검색하고 싶다면 결과를 `grep`으로 넘겨 패턴을 찾을 수 있다.
`history | grep find`는 "find"라는 문자열을 포함하는 명령어들을 출력할 것이다.

대부분의 쉘에서 `Ctrl+R`을 사용하여 히스토리 역방향 검색(backwards search)을 수행할 수 있다.
`Ctrl+R`을 누른 후, 히스토리에서 매칭하고 싶은 문자열을 입력하면 된다.
계속 누르면 히스토리 내의 매치 항목들을 순회한다.
이는 [zsh](https://github.com/zsh-users/zsh-history-substring-search)에서 위/아래 화살표 키를 통해서도 활성화될 수 있다.
`Ctrl+R`에 더해 [fzf](https://github.com/junegunn/fzf/wiki/Configuring-shell-key-bindings#ctrl-r) 바인딩을 사용하면 더욱 좋다.
`fzf`는 많은 명령어와 함께 사용될 수 있는 범용 퍼지 파인더(fuzzy finder)이다.
여기서는 히스토리에서 퍼지 매칭을 수행하고 결과를 편리하고 시각적으로 보기 좋게 제시하는 데 사용된다.

내가 정말 좋아하는 또 다른 히스토리 관련 기능은 **히스토리 기반 자동 제안(history-based autosuggestions)**이다.
[fish](https://fishshell.com/) 쉘에서 처음 도입된 이 기능은, 현재 입력 중인 명령어와 동일한 접두사를 가진 가장 최근의 명령어로 자동 완성 제안을 동적으로 보여준다.
[zsh](https://github.com/zsh-users/zsh-autosuggestions)에서도 활성화할 수 있으며, 쉘 사용 경험을 크게 높여주는 기능이다.

명령어 앞에 공백을 넣으면 히스토리에 포함되지 않게 하는 등 쉘의 히스토리 동작을 수정할 수 있다. 이는 비밀번호나 다른 민감한 정보가 포함된 명령어를 입력할 때 유용하다.
이를 위해 `.bashrc`에 `HISTCONTROL=ignorespace`를 추가하거나 `.zshrc`에 `setopt HIST_IGNORE_SPACE`를 추가하라.
만약 앞에 공백을 넣는 것을 잊었다면, 언제든지 `.bash_history`나 `.zsh_history`를 직접 편집하여 해당 항목을 제거할 수 있다.

## 디렉토리 내비게이션 (Directory Navigation)

지금까지 우리는 여러분이 이러한 작업들을 수행하기 위해 이미 필요한 위치에 있다고 가정했다. 하지만 어떻게 하면 디렉토리 사이를 빠르게 이동할 수 있을까?
쉘 별칭을 작성하거나 [ln -s](https://www.man7.org/linux/man-pages/man1/ln.1.html)로 심볼릭 링크를 만드는 등 간단한 방법들이 많지만, 개발자들은 이미 상당히 영리하고 정교한 해결책들을 찾아냈다.

이 강의의 주제와 마찬가지로, 여러분은 자주 발생하는 사례에 대해 최적화하고 싶을 것이다.
자주 방문하거나 최근에 방문한 파일 및 디렉토리를 찾는 일은 [`fasd`](https://github.com/clvv/fasd)나 [`autojump`](https://github.com/wting/autojump)와 같은 도구들을 통해 가능하다.
Fasd는 파일과 디렉토리의 **프리센시(frecency)**, 즉 빈도(**frequency**)와 최신성(**recency**)을 모두 고려하여 순위를 매긴다.
기본적으로 `fasd`는 `z` 명령어를 추가하여 "프리센트(frecent)"한 디렉토리의 부분 문자열만으로 빠르게 `cd`할 수 있게 해준다. 예를 들어 `/home/user/files/cool_project`에 자주 간다면 단순히 `z cool`을 입력하여 그곳으로 이동할 수 있다. autojump를 사용한다면 동일한 디렉토리 이동을 `j cool`로 수행할 수 있다.

디렉토리 구조의 개요를 빠르게 파악하기 위한 더 복잡한 도구들도 존재한다: [`tree`](https://linux.die.net/man/1/tree), [`broot`](https://github.com/Canop/broot) 또는 [`nnn`](https://github.com/jarun/nnn), [`ranger`](https://github.com/ranger/ranger)와 같은 본격적인 파일 매니저들이 있다.

# 연습 문제 (Exercises)

1. [`man ls`](https://www.man7.org/linux/man-pages/man1/ls.1.html)를 읽고 다음과 같은 방식으로 파일을 나열하는 `ls` 명령어를 작성하라.

    - 숨김 파일을 포함한 모든 파일을 포함할 것
    - 크기는 사람이 읽기 쉬운 형식으로 표시할 것 (예: 454279954 대신 454M)
    - 최신순으로 정렬할 것
    - 출력에 색상을 입힐 것

    샘플 출력은 다음과 같을 것이다.

    ```
    -rw-r--r--   1 user group 1.1M Jan 14 09:53 baz
    drwxr-xr-x   5 user group  160 Jan 14 09:53 .
    -rw-r--r--   1 user group  514 Jan 14 06:42 bar
    -rw-r--r--   1 user group 106M Jan 13 12:12 foo
    drwx------+ 47 user group 1.5K Jan 12 18:08 ..
    ```

{% comment %}
ls -lath --color=auto
{% endcomment %}

1. 다음과 같은 동작을 하는 bash 함수 `marco`와 `polo`를 작성하라.
`marco`를 실행할 때마다 현재 작업 디렉토리가 어떤 방식으로든 저장되어야 하고, 그 후 어떤 디렉토리에 있든 `polo`를 실행하면 `marco`를 실행했던 디렉토리로 `cd`하여 돌아와야 한다.
디버깅을 쉽게 하기 위해 코드를 `marco.sh` 파일에 작성하고 `source marco.sh`를 실행하여 쉘에 정의를 로드(또는 재로드)할 수 있다.

{% comment %}
marco() {
    export MARCO=$(pwd)
}

polo() {
    cd "$MARCO"
}
{% endcomment %}

1. 드물게 실패하는 명령어가 있다고 가정해 보자. 이를 디버깅하기 위해 출력을 캡처해야 하지만, 실패할 때까지 반복해서 실행하는 것은 시간이 많이 걸릴 수 있다.
실패할 때까지 다음 스크립트를 실행하고, 표준 출력과 표준 에러 스트림을 파일로 캡처하며 마지막에 모든 내용을 출력하는 bash 스크립트를 작성하라.
실패할 때까지 몇 번이나 실행되었는지 보고할 수 있다면 가산점이 있다.

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

{% comment %}
#!/usr/bin/env bash

count=0
until [[ "$?" -ne 0 ]];
do
  count=$((count+1))
  ./random.sh &> out.txt
done

echo "found error after $count runs"
cat out.txt
{% endcomment %}

1. 강의에서 다루었듯이 `find`의 `-exec`는 검색 중인 파일들에 대해 연산을 수행하는 데 매우 강력할 수 있다.
하지만 zip 파일을 만드는 것과 같이 **모든** 파일에 대해 무언가를 하고 싶다면 어떻게 해야 할까?
지금까지 보았듯이 명령어들은 인자와 STDIN 모두로부터 입력을 받는다.
명령어들을 파이프로 연결할 때 우리는 STDOUT을 STDIN으로 연결하지만, `tar`와 같은 일부 명령어들은 인자로부터 입력을 받는다.
이러한 불일치를 해결하기 위해 STDIN을 인자로 사용하여 명령어를 실행해 주는 [`xargs`](https://www.man7.org/linux/man-pages/man1/xargs.1.html) 명령어가 존재한다.
예를 들어 `ls | xargs rm`은 현재 디렉토리의 파일들을 삭제한다.

    여러분의 과제는 폴더 내의 모든 HTML 파일을 재귀적으로 찾아서 zip 파일로 만드는 명령어를 작성하는 것이다. 파일 이름에 공백이 포함되어 있어도 명령어가 작동해야 한다는 점에 유의하라 (힌트: `xargs`의 `-d` 플래그를 확인하라).
    {% comment %}
    find . -type f -name "*.html" | xargs -d '\n'  tar -cvzf archive.tar.gz
    {% endcomment %}

    만약 macOS를 사용 중이라면, 기본 BSD `find`는 [GNU coreutils](https://en.wikipedia.org/wiki/List_of_GNU_Core_Utilities_commands)에 포함된 것과 다르다는 점에 유의하라. `find`에서 `-print0`를 사용하고 `xargs`에서 `-0` 플래그를 사용할 수 있다. macOS 사용자로서, macOS에 포함된 커맨드 라인 유틸리티들이 GNU 버전과 다를 수 있음을 인지해야 한다. 원한다면 [brew를 사용하여](https://formulae.brew.sh/formula/coreutils) GNU 버전을 설치할 수 있다.

1. (고급) 디렉토리 내에서 가장 최근에 수정된 파일을 재귀적으로 찾는 명령어 또는 스크립트를 작성하라. 더 나아가, 모든 파일을 최신순으로 나열할 수 있는가?
EOF
