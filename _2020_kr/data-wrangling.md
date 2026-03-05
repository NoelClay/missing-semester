---
layout: lecture
title: "데이터 정리 (Data Wrangling)"
description: >
  sed, awk, 정규 표현식(regular expressions)과 같은 커맨드 라인 도구를 사용하여 데이터를 조작하고 변환하는 방법을 배웁니다.
thumbnail: /static/assets/thumbnails/2020/lec4.png
date: 2020-01-16
ready: true
video:
  aspect: 56.25
  id: sz_dsktIjt4
---

데이터를 한 형식에서 다른 형식으로 바꾸고 싶었던 적이 있는가? 당연히 있을 것이다! 아주 일반적인 의미에서, 이번 강의의 주제가 바로 그것이다. 구체적으로는 텍스트나 바이너리 형식의 데이터를 여러분이 정확히 원하는 형태가 될 때까지 주무르는(massaging) 법을 배울 것이다.

우리는 이미 지난 강의에서 기본적인 데이터 정리를 살펴보았다. 사실 `|` 연산자를 사용하는 거의 모든 경우가 일종의 데이터 정리이다. `journalctl | grep -i intel`과 같은 명령어를 생각해 보라. 이 명령어는 시스템 로그 엔트리 중에서 Intel(대소문자 구분 없음)이 포함된 모든 항목을 찾는다. 이것을 데이터 정리라고 생각하지 않았을 수도 있지만, 하나의 형식(전체 시스템 로그)에서 여러분에게 더 유용한 형식(Intel 관련 로그 엔트리만)으로 바꾸는 과정이다. 대부분의 데이터 정리는 여러분이 어떤 도구를 사용할 수 있고, 그것들을 어떻게 조합하는지 아는 것에 달려 있다.

처음부터 시작해 보자. 데이터를 정리하려면 두 가지가 필요하다. 정리할 데이터와 그 데이터를 가지고 수행할 작업이다. 로그는 좋은 사용 사례가 된다. 로그에 대해 조사하고 싶은 경우가 많지만 전체를 다 읽는 것은 불가능하기 때문이다. 내 서버에 누가 로그인을 시도하는지 서버 로그를 통해 확인해 보자.

```bash
ssh myserver journalctl
```

내용이 너무 많다. ssh 관련 내용으로 제한해 보자.

```bash
ssh myserver journalctl | grep sshd
```

우리는 파이프를 사용하여 **원격** 파일을 로컬 컴퓨터의 `grep`으로 스트리밍하고 있다! `ssh`는 매우 강력하며, 다음 커맨드 라인 환경 강의에서 더 자세히 다룰 것이다. 하지만 여전히 우리가 원하는 것보다 내용이 너무 많고 읽기도 어렵다. 좀 더 개선해 보자.

```bash
ssh myserver 'journalctl | grep sshd | grep "Disconnected from"' | less
```

왜 추가적인 따옴표를 썼을까? 로그는 매우 클 수 있는데, 모든 내용을 로컬 컴퓨터로 스트리밍한 다음 필터링하는 것은 낭비이기 때문이다. 대신 원격 서버에서 필터링을 수행한 다음, 결과 데이터만 로컬에서 주무를 수 있다. `less`는 긴 출력 내용을 위아래로 스크롤하며 볼 수 있게 해주는 "페이저(pager)"를 제공한다. 명령어를 개발하는 동안 네트워크 트래픽을 아끼기 위해, 필터링된 로그를 파일에 저장해 두고 개발할 수도 있다.

```console
$ ssh myserver 'journalctl | grep sshd | grep "Disconnected from"' > ssh.log
$ less ssh.log
```

여전히 불필요한 정보가 많다. 이를 제거하는 방법은 **정말** 많지만, 가장 강력한 도구 중 하나인 `sed`를 살펴보자.

`sed`는 오래된 `ed` 에디터를 기반으로 만들어진 "스트림 에디터(stream editor)"이다. `sed`에서는 파일의 내용을 직접 조작하기보다는 파일 수정 방법에 대한 짧은 명령을 내린다(물론 직접 조작도 가능하다). 수많은 명령어가 있지만 가장 흔히 쓰이는 것은 `s`(substitution, 치환)이다. 예를 들어 다음과 같이 작성할 수 있다.

```bash
ssh myserver journalctl
 | grep sshd
 | grep "Disconnected from"
 | sed 's/.*Disconnected from //'
```

방금 작성한 것은 간단한 **정규 표현식(regular expression)**이다. 정규 표현식은 텍스트를 패턴과 대조할 수 있게 해주는 강력한 구조이다. `s` 명령어는 `s/REGEX/SUBSTITUTION/` 형식을 띠는데, 여기서 `REGEX`는 찾고자 하는 정규 표현식이고 `SUBSTITUTION`은 일치하는 텍스트를 치환할 텍스트이다.

(이 문법은 Vim [강의 노트](/2020/editors/#advanced-vim)의 "검색 및 치환" 섹션에서 본 것과 비슷하다는 것을 눈치챘을 것이다! 실제로 Vim은 `sed`의 치환 명령어와 유사한 검색 및 치환 문법을 사용한다. 한 가지 도구를 배우면 종종 다른 도구에도 능숙해지는 데 도움이 된다.)

## 정규 표현식 (Regular expressions)

정규 표현식은 매우 흔하고 유용하므로 어떻게 작동하는지 이해하는 데 시간을 투자할 가치가 있다. 위에서 사용한 `/.*Disconnected from /`을 살펴보자. 정규 표현식은 대개(항상은 아니지만) `/`로 감싸져 있다. 대부분의 ASCII 문자는 일반적인 의미를 갖지만, 일부 문자는 "특별한" 매칭 동작을 수행한다. 어떤 문자가 어떤 역할을 하는지는 정규 표현식의 구현(implementation)마다 조금씩 다르며, 이는 종종 혼란을 야기한다. 매우 일반적인 패턴들은 다음과 같다.

 - `.`은 줄바꿈 문자를 제외한 "모든 단일 문자"를 의미한다.
 - `*`은 앞의 매치 내용이 0번 이상 반복됨을 의미한다.
 - `+`은 앞의 매치 내용이 1번 이상 반복됨을 의미한다.
 - `[abc]`는 `a`, `b`, `c` 중 어느 하나의 문자를 의미한다.
 - `(RX1|RX2)`는 `RX1` 또는 `RX2` 중 하나와 일치함을 의미한다.
 - `^`은 행의 시작을 의미한다.
 - `$`은 행의 끝을 의미한다.

`sed`의 정규 표현식은 약간 독특해서, 위 문자들의 특수한 의미를 사용하려면 대부분 그 앞에 `\`를 붙여야 한다. 아니면 `-E` 플래그를 전달할 수도 있다.

따라서 `/.*Disconnected from /`을 다시 보면, 임의의 개수의 문자로 시작하고 그 뒤에 문자열 "Disconnected from "이 오는 모든 텍스트와 일치한다. 이것이 우리가 원했던 것이다. 하지만 정규 표현식은 까다로우니 주의해야 한다. 만약 누군가 사용자 이름을 "Disconnected from"으로 해서 로그인을 시도한다면 어떻게 될까? 다음과 같은 로그가 남을 것이다.

```
Jan 17 03:13:00 thesquareplanet.com sshd[2631]: Disconnected from invalid user Disconnected from 46.97.239.16 port 55920 [preauth]
```

결과는 어떻게 될까? 기본적으로 `*`와 `+`는 "탐욕적(greedy)"이다. 즉, 가능한 한 많은 텍스트와 일치하려고 한다. 따라서 위 로그의 경우 다음과 같은 결과만 남게 될 것이다.

```
46.97.239.16 port 55920 [preauth]
```

이는 우리가 원했던 결과가 아닐 수 있다. 일부 정규 표현식 구현에서는 `*`나 `+` 뒤에 `?`를 붙여 탐욕적이지 않게(non-greedy) 만들 수 있지만, 안타깝게도 `sed`는 이를 지원하지 않는다. 다만 이 기능을 지원하는 perl의 커맨드 라인 모드로 전환하여 사용할 수는 있다.

```bash
perl -pe 's/.*?Disconnected from //'
```

하지만 이런 종류의 작업에 훨씬 더 흔히 쓰이는 도구인 `sed`를 계속 사용해 보겠다. `sed`는 특정 매치 뒤의 행을 출력하거나, 한 번의 실행으로 여러 치환을 수행하거나, 검색을 하는 등 다른 유용한 작업도 수행할 수 있다. 하지만 여기서는 너무 깊게 다루지 않겠다. `sed`는 그 자체로 하나의 방대한 주제이지만, 종종 더 나은 도구들이 존재하기 때문이다.

자, 이제 제거하고 싶은 접미사(suffix)도 있다. 어떻게 하면 될까? 사용자 이름 뒤에 오는 텍스트만 정확히 매칭하는 것은 조금 까다롭다. 특히 사용자 이름에 공백 등이 포함될 수 있다면 더욱 그렇다! 우리가 해야 할 일은 행 **전체**를 매칭하는 것이다.

```bash
 | sed -E 's/.*Disconnected from (invalid |authenticating )?user .* [^ ]+ port [0-9]+( \[preauth\])?$//'
```

[정규 표현식 디버거](https://regex101.com/r/qqbZqh/2)를 통해 어떤 일이 일어나는지 살펴보자. 시작 부분은 이전과 같다. 그다음, "user" 앞에 붙을 수 있는 접두사들(로그에 두 가지 종류가 있다) 중 하나와 매칭한다. 그다음 사용자 이름이 있는 위치의 모든 문자열과 매칭한다. 그다음 임의의 단일 단어(`[^ ]+`, 공백이 아닌 문자가 하나 이상 연속됨)와 매칭한다. 그다음 단어 "port"와 그 뒤에 오는 숫자 배열을 매칭한다. 그다음 접미사 `[preauth]`가 있을 수도 있고 없을 수도 있는 상황을 매칭하고, 행의 끝을 매칭한다.

이 기법을 사용하면 사용자 이름이 "Disconnected from"이어도 더 이상 혼란을 겪지 않게 된다. 왜 그런지 알 수 있겠는가?

하지만 한 가지 문제가 있다. 행 전체가 비어버리게 된다는 점이다. 우리는 결국 사용자 이름을 **유지**하고 싶다. 이를 위해 "캡처 그룹(capture groups)"을 사용할 수 있다. 괄호로 감싸진 정규 표현식에 매칭된 모든 텍스트는 번호가 매겨진 캡처 그룹에 저장된다. 이들은 치환 문구(일부 엔진에서는 패턴 자체 내에서도!)에서 `\1`, `\2`, `\3` 등으로 사용할 수 있다. 따라서 다음과 같이 쓸 수 있다.

```bash
 | sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/'
```

상상할 수 있듯이, **정말** 복잡한 정규 표현식을 만들 수도 있다. 예를 들어 [이메일 주소](https://www.regular-expressions.info/email.html)를 매칭하는 방법에 대한 글을 보라. 이것은 [결코 쉽지 않다](https://web.archive.org/web/20221223174323/http://emailregex.com/). [많은 논쟁](https://stackoverflow.com/questions/201323/how-to-validate-an-email-address-using-a-regular-expression/1917982)이 있고, 사람들이 [테스트](https://fightingforalostcause.net/content/misc/2006/compare-email-regex.php)를 작성했으며, [테스트 매트릭스](https://mathiasbynens.be/demo/url-regex)도 있다. 심지어 주어진 숫자가 [소수인지 판별](https://www.noulakaz.net/2007/03/18/a-regular-expression-to-check-for-prime-numbers/)하는 정규 표현식을 작성할 수도 있다.

정규 표현식은 올바르게 작성하기 어렵기로 악명이 높지만, 도구함에 넣어두면 매우 유용한 도구이다!

## 다시 데이터 정리로 (Back to data wrangling)

자, 이제 다음과 같은 명령어가 준비되었다.

```bash
ssh myserver journalctl
 | grep sshd
 | grep "Disconnected from"
 | sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/'
```

`sed`는 텍스트 삽입(`i` 명령어), 명시적 행 출력(`p` 명령어), 인덱스로 행 선택 등 온갖 재미있는 일들을 할 수 있다. `man sed`를 확인해 보라!

어쨌든, 현재 명령어는 로그인을 시도한 모든 사용자 이름 목록을 보여준다. 하지만 이것만으로는 별로 도움이 되지 않는다. 흔한 사용자 이름들을 찾아보자.

```bash
ssh myserver journalctl
 | grep sshd
 | grep "Disconnected from"
 | sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/'
 | sort | uniq -c
```

`sort`는 입력을 정렬한다. `uniq -c`는 연속된 동일한 행들을 하나의 행으로 합치고, 그 앞에 발생 횟수를 붙여준다. 이를 다시 정렬하여 가장 많이 나타난 사용자 이름들만 남겨보자.

```bash
ssh myserver journalctl
 | grep sshd
 | grep "Disconnected from"
 | sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/'
 | sort | uniq -c
 | sort -nk1,1 | tail -n10
```

`sort -n`은 (사전식 순서가 아닌) 숫자 순서대로 정렬한다. `-k1,1`은 "공백으로 구분된 첫 번째 열만 사용하여 정렬하라"는 의미이다. `,n` 부분은 "`n`번째 필드까지만 정렬하라"는 뜻이며 기본값은 행의 끝이다. 이 **특정** 예시에서는 행 전체로 정렬해도 결과는 같겠지만, 우리는 배우는 중이니까!

가장 **드문** 이름들을 원한다면 `tail` 대신 `head`를 사용할 수 있다. 역순으로 정렬하는 `sort -r`도 있다.

자, 꽤 멋지다. 그런데 설정 파일 같은 곳에 쓰기 위해 사용자 이름들을 행당 하나씩이 아니라 쉼표로 구분된 목록으로 추출하고 싶다면 어떻게 해야 할까?

```bash
ssh myserver journalctl
 | grep sshd
 | grep "Disconnected from"
 | sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/'
 | sort | uniq -c
 | sort -nk1,1 | tail -n10
 | awk '{print $2}' | paste -sd,
```

macOS를 사용 중이라면: 위 명령어는 macOS에 포함된 BSD `paste`에서는 작동하지 않을 수 있다. BSD와 GNU coreutils의 차이점 및 macOS에서 GNU coreutils를 설치하는 방법은 [쉘 도구 강의 연습 문제 4번](/2020/shell-tools/#exercises)을 참조하라.

`paste`부터 살펴보자. `-s`는 행들을 합치고, `-d`는 지정된 단일 문자 구분자(이 경우 `,`)를 사용하게 한다. 그런데 `awk`는 무엇을 하는 것일까?

## awk -- 또 다른 에디터 (awk -- another editor)

`awk`는 텍스트 스트림 처리에 아주 뛰어난 프로그래밍 언어이다. `awk`를 제대로 배우려면 할 말이 **정말** 많지만, 다른 도구들과 마찬가지로 여기서는 기본만 다루겠다.

먼저 `{print $2}`는 무엇을 할까? `awk` 프로그램은 선택적인 패턴과, 해당 패턴이 행과 일치할 때 수행할 작업을 담은 블록으로 구성된다. 기본 패턴(위에서 사용한 방식)은 모든 행과 일치한다. 블록 내부에서 `$0`은 행 전체의 내용을 의미하며, `$1`부터 `$n`까지는 `awk` 필드 구분자(기본값은 공백, `-F`로 변경 가능)로 구분된 해당 행의 `n`번째 **필드**를 의미한다. 이 경우, 우리는 모든 행에 대해 두 번째 필드의 내용을 출력하라고 명령한 것이며, 그것이 바로 사용자 이름이다!

좀 더 복잡한 것을 해보자. `c`로 시작하고 `e`로 끝나는 사용자 이름 중 딱 한 번만 나타난 것들의 개수를 계산해 보자.

```bash
 | awk '$1 == 1 && $2 ~ /^c[^ ]*e$/ { print $2 }' | wc -l
```

해석해 보자면, 먼저 패턴(`{...}` 앞에 오는 내용)이 생겼다. 패턴은 행의 첫 번째 필드가 1과 같아야 하고(`uniq -c`에서 나온 횟수), 두 번째 필드가 주어진 정규 표현식과 일치해야 함을 의미한다. 블록은 단순히 해당 사용자 이름을 출력한다. 그다음 `wc -l`을 사용하여 출력된 행의 개수를 센다.

하지만 `awk`는 프로그래밍 언어라고 하지 않았나?

```awk
BEGIN { rows = 0 }
$1 == 1 && $2 ~ /^c[^ ]*e$/ { rows += $1 }
END { print rows }
```

`BEGIN`은 입력의 시작 부분에서 일치하는 패턴이다(반대로 `END`는 끝부분에서 일치한다). 이제 각 행에 대한 블록은 단순히 첫 번째 필드의 횟수를 더하고(이 경우 항상 1이겠지만), 마지막에 그 합계를 출력한다. 사실 `awk`는 [이 모든 것들을 처리할 수 있기 때문에](https://web.archive.org/web/20251210045942/https://backreference.org/2010/02/10/idiomatic-awk/) `grep`과 `sed`를 완전히 없앨 수도 있지만, 그건 독자들의 연습 문제로 남겨두겠다.

## 데이터 분석 (Analyzing data)

STDIN에서 읽을 수 있는 계산기인 `bc`를 사용하여 쉘에서 직접 수학 계산을 할 수 있다! 예를 들어, 각 행의 숫자들을 `+`로 연결하여 모두 더할 수 있다.

```bash
 | paste -sd+ | bc -l
```

또는 더 복잡한 표현식을 만들 수도 있다.

```bash
echo "2*($(data | paste -sd+))" | bc -l
```

다양한 방법으로 통계치를 얻을 수 있다. [`st`](https://github.com/nferraz/st)도 꽤 훌륭하지만, 이미 [R](https://www.r-project.org/)이 설치되어 있다면 다음과 같이 할 수 있다.

```bash
ssh myserver journalctl
 | grep sshd
 | grep "Disconnected from"
 | sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/'
 | sort | uniq -c
 | awk '{print $1}' | R --no-echo -e 'x <- scan(file="stdin", quiet=TRUE); summary(x)'
```

R은 데이터 분석과 [시각화](https://ggplot2.tidyverse.org/)에 뛰어난 또 다른 (독특한) 프로그래밍 언어이다. 너무 자세히 다루지는 않겠지만, `summary`는 벡터에 대한 요약 통계를 출력하며, 우리는 입력 스트림의 숫자들을 포함하는 벡터를 만들었으므로 R이 우리가 원하는 통계치를 제공해 준다!

간단한 그래프를 그리고 싶다면 `gnuplot`이 유용하다.

```bash
ssh myserver journalctl
 | grep sshd
 | grep "Disconnected from"
 | sed -E 's/.*Disconnected from (invalid |authenticating )?user (.*) [^ ]+ port [0-9]+( \[preauth\])?$/\2/'
 | sort | uniq -c
 | sort -nk1,1 | tail -n10
 | gnuplot -p -e 'set boxwidth 0.5; plot "-" using 1:xtic(2) with boxes'
```

## 인자를 만들기 위한 데이터 정리 (Data wrangling to make arguments)

가끔 긴 목록을 기반으로 설치하거나 제거할 항목을 찾기 위해 데이터 정리를 하고 싶을 때가 있다. 지금까지 배운 데이터 정리 도구들과 `xargs`를 결합하면 강력한 조합이 된다.

예를 들어 강의에서 본 것처럼, 데이터 정리 도구를 사용하여 오래된 빌드 이름을 추출한 다음 `xargs`를 통해 언인스톨러에 전달함으로써 시스템에서 오래된 Rust nightly 빌드들을 삭제할 수 있다.

```bash
rustup toolchain list | grep nightly | grep -vE "nightly-x86" | sed 's/-x86.*//' | xargs rustup toolchain uninstall
```

## 바이너리 데이터 정리 (Wrangling binary data)

지금까지 주로 텍스트 데이터 정리에 대해 이야기했지만, 파이프는 바이너리 데이터에도 똑같이 유용하다. 예를 들어 ffmpeg를 사용하여 카메라에서 이미지를 캡처하고, 이를 흑백으로 변환하고, 압축하여 SSH를 통해 원격 머신으로 보낸 뒤, 거기서 압축을 풀고 복사본을 만든 다음 화면에 표시할 수 있다.

```bash
ffmpeg -loglevel panic -i /dev/video0 -frames 1 -f image2 -
 | convert - -colorspace gray -
 | gzip
 | ssh mymachine 'gzip -d | tee copy.jpg | env DISPLAY=:0 feh -'
```

# 연습 문제 (Exercises)

1. 이 [짧은 대화형 정규 표현식 튜토리얼](https://regexone.com/)을 따라 해보라.
2. `/usr/share/dict/words`에서 `a`가 적어도 세 번 포함되어 있고 `'s`로 끝나지 않는 단어의 개수를 찾아보라. 해당 단어들의 마지막 두 글자 중 가장 흔한 세 가지 조합은 무엇인가? `sed`의 `y` 명령어 또는 `tr` 프로그램이 대소문자 구분 문제를 해결하는 데 도움이 될 수 있다. 그 두 글자 조합은 각각 몇 번 나타나는가? (도전 과제) 나타나지 않는 조합은 무엇인가?
3. 제자리(in-place) 치환을 하기 위해 `sed s/REGEX/SUBSTITUTION/ input.txt > input.txt`와 같이 하고 싶은 유혹이 들겠지만, 이는 나쁜 생각이다. 왜 그럴까? 이것은 `sed`에만 해당하는 문제인가? `man sed`를 사용하여 이 작업을 올바르게 수행하는 방법을 찾아보라.
4. 최근 10번의 부팅에 대해 평균, 중앙값, 최대 시스템 부팅 시간을 구하라. Linux에서는 `journalctl`을, macOS에서는 `log show`를 사용하고 각 부팅의 시작과 끝 근처의 로그 타임스탬프를 확인하라. Linux에서는 다음과 같이 보일 수 있다.
   ```
   Logs begin at ...
   ```
   그리고
   ```
   systemd[577]: Startup finished in ...
   ```
   macOS에서는 [다음과 같은 내용을 찾아보라](https://eclecticlight.co/2018/03/21/macos-unified-log-3-finding-your-way/):
   ```
   === system boot:
   ```
   그리고
   ```
   Previous shutdown cause: 5
   ```
5. 최근 세 번의 리부팅 사이에 공유되지 않는 부팅 메시지를 찾아보라 (`journalctl`의 `-b` 플래그 참조). 이 작업을 여러 단계로 나누어 수행해 보라. 먼저, 최근 세 번의 부팅 로그만 가져오는 방법을 찾으라. 로그를 추출하는 도구에 적절한 플래그가 있을 수도 있고, `sed '0,/STRING/d'`를 사용하여 `STRING`과 일치하는 행 이전의 모든 행을 제거할 수도 있다. 그다음, 타임스탬프와 같이 항상 변하는 부분을 제거하라. 그다음 입력 행들을 중복 제거하고 각 행의 개수를 유지하라(`uniq`가 도움이 될 것이다). 마지막으로, 개수가 3인 행(모든 부팅에서 공유된 행)을 제거하라.
6. [여기](https://commons.wikimedia.org/wiki/Data:Wikipedia_statistics/data.tab)나 [여기](https://ucr.fbi.gov/crime-in-the-u.s/2016/crime-in-the-u.s.-2016/topic-pages/tables/table-1), 또는 [이곳](https://www.springboard.com/blog/data-science/free-public-data-sets-data-science-project/)에서 온라인 데이터 세트를 찾아보라. `curl`을 사용하여 데이터를 가져오고 숫자 데이터가 있는 두 개의 열만 추출하라. 만약 HTML 데이터를 가져온다면 [`pup`](https://github.com/EricChiang/pup)이 도움이 될 수 있다. JSON 데이터의 경우 [`jq`](https://stedolan.github.io/jq/)를 시도해 보라. 한 명령어로 한 열의 최솟값과 최댓값을 구하고, 다른 명령어로 각 열의 합계 차이를 구하라.
EOF
