---
layout: lecture
permalink: /2020/kr/metaprogramming/
title: "메타프로그래밍 (Metaprogramming)"
description: >
  빌드 시스템(build systems), 의존성 관리(dependency management), 테스트(testing) 및 지속적 통합(continuous integration)에 대해 배웁니다.
thumbnail: /static/assets/thumbnails/2020/lec8.png
details: 빌드 시스템, 의존성 관리, 테스트, CI
date: 2020-01-27
ready: true
video:
  aspect: 56.25
  id: kr_lec8_2020
---

우리가 말하는 "메타프로그래밍"은 무엇을 의미할까? 사실, 코드를 작성하거나 효율적으로 일하는 것보다 **프로세스(process)**에 더 가까운 일련의 활동들을 일컫는 가장 적절한 용어로 우리가 선택한 것이다. 이번 강의에서는 코드를 빌드하고 테스트하는 시스템, 그리고 의존성을 관리하는 시스템을 살펴볼 것이다. 학생으로서의 일상에서는 이것이 크게 중요해 보이지 않을 수 있지만, 인턴십을 통해 더 큰 코드베이스를 접하거나 "현실 세계"에 발을 들이는 순간, 어디에서나 이것들을 마주하게 될 것이다. 참고로 "메타프로그래밍"은 원래 "[프로그램을 조작하는 프로그램](https://en.wikipedia.org/wiki/Metaprogramming)"을 의미하기도 하지만, 이번 강의의 목적에 맞는 정의는 아니다.

# 빌드 시스템 (Build systems)

LaTeX로 논문을 쓴다면, 논문을 생성하기 위해 어떤 명령어를 실행해야 할까? 벤치마크를 실행하고, 이를 그래프로 그린 뒤 논문에 삽입하려면 어떤 명령어들이 필요할까? 혹은 수강 중인 수업에서 제공된 코드를 컴파일하고 테스트를 실행하려면 어떻게 해야 할까?

코드가 포함되어 있든 아니든, 대부분의 프로젝트에는 "빌드 프로세스(build process)"가 존재한다. 즉, 입력(inputs)에서 출력(outputs)으로 가기 위해 수행해야 하는 일련의 작업 순서이다. 종종 이 프로세스는 수많은 단계와 분기(branches)를 가질 수 있다. 이 명령을 실행하여 그래프를 생성하고, 저 명령을 실행하여 결과를 도출하고, 또 다른 무언가를 실행하여 최종 논문을 만들어내는 식이다. 이 강의에서 다룬 많은 것들과 마찬가지로, 여러분이 이러한 번거로움을 처음 마주한 것은 아니며 다행히 이를 도와줄 수많은 도구들이 존재한다!

이러한 도구들을 보통 "빌드 시스템(build systems)"이라고 부르며, 그 종류는 매우 다양하다. 어떤 도구를 사용할지는 수행할 작업, 선호하는 언어, 그리고 프로젝트의 규모에 따라 달라진다. 하지만 핵심적으로는 모두 매우 유사하다. 여러분은 다수의 **의존성(dependencies)**, 다수의 **타겟(targets)**, 그리고 하나에서 다른 하나로 가는 **규칙(rules)**을 정의한다. 빌드 시스템에 특정 타겟을 원한다고 말하면, 타겟의 모든 전이적(transitive) 의존성을 찾아내고 규칙을 적용하여 최종 결과물이 나올 때까지 중간 타겟들을 생성해 내는 것이 빌드 시스템의 역할이다. 이상적으로 빌드 시스템은 의존성이 변경되지 않았거나 이전 빌드 결과가 이미 존재하는 타겟에 대해서는 규칙을 불필요하게 다시 실행하지 않는다.

`make`는 가장 흔히 사용되는 빌드 시스템 중 하나이며, 거의 모든 UNIX 기반 컴퓨터에 기본으로 설치되어 있다. 비록 몇 가지 단점은 있지만, 단순하거나 중간 규모의 프로젝트에서는 매우 훌륭하게 작동한다. `make`를 실행하면 현재 디렉토리에서 `Makefile`이라는 파일을 찾는다. 모든 타겟, 의존성, 그리고 규칙은 이 파일에 정의된다. 예시를 살펴보자.

```make
paper.pdf: paper.tex plot-data.png
	pdflatex paper.tex

plot-%.png: %.dat plot.py
	./plot.py -i $*.dat -o $@
```

이 파일의 각 지시문(directive)은 오른쪽(dependencies)을 사용하여 왼쪽(target)을 생성하는 방법에 대한 규칙이다. 다르게 표현하자면, 오른쪽에 나열된 항목들은 의존성이고 왼쪽은 타겟이다. 들여쓰기 된 블록은 해당 의존성들로부터 타겟을 생성하기 위한 일련의 프로그램 실행 순서이다. `make`에서 첫 번째 지시문은 기본 목표(default goal)를 정의하기도 한다. 아무 인자 없이 `make`를 실행하면 이 타겟을 빌드한다. 또는 `make plot-data.png`와 같이 특정 타겟을 지정하여 실행할 수도 있다.

규칙에서 `%`는 "패턴(pattern)"으로, 왼쪽과 오른쪽에서 동일한 문자열과 매칭된다. 예를 들어 타겟 `plot-foo.png`가 요청되면, `make`는 의존성으로 `foo.dat`와 `plot.py`를 찾을 것이다. 이제 소스 디렉토리가 비어 있는 상태에서 `make`를 실행하면 어떤 일이 일어나는지 보자.

```console
$ make
make: *** No rule to make target 'paper.tex', needed by 'paper.pdf'.  Stop.
```

`make`는 `paper.pdf`를 빌드하기 위해 `paper.tex`가 필요한데, 해당 파일을 만드는 방법을 알려주는 규칙이 없다고 친절하게 알려준다. 파일을 만들어 보자!

```console
$ touch paper.tex
$ make
make: *** No rule to make target 'plot-data.png', needed by 'paper.pdf'.  Stop.
```

흠, 흥미롭다. `plot-data.png`를 만드는 규칙은 존재하지만, 이는 패턴 규칙이다. 소스 파일(`data.dat`)이 존재하지 않기 때문에 `make`는 단순히 해당 파일을 만들 수 없다고 보고한다. 모든 파일들을 생성해 보자.

```console
$ cat paper.tex
\documentclass{article}
\usepackage{graphicx}
\begin{document}
\includegraphics[scale=0.65]{plot-data.png}
\end{document}
$ cat plot.py
#!/usr/bin/env python
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('-i', type=argparse.FileType('r'))
parser.add_argument('-o')
args = parser.parse_args()

data = np.loadtxt(args.i)
plt.plot(data[:, 0], data[:, 1])
plt.savefig(args.o)
$ cat data.dat
1 1
2 2
3 3
4 4
5 8
```

이제 `make`를 실행하면 어떻게 될까?

```console
$ make
./plot.py -i data.dat -o plot-data.png
pdflatex paper.tex
... 수많은 출력 ...
```

보라, PDF가 생성되었다!
`make`를 다시 실행하면 어떻게 될까?

```console
$ make
make: 'paper.pdf' is up to date.
```

아무 작업도 수행하지 않는다! 왜 그럴까? 그럴 필요가 없기 때문이다. 이전에 빌드된 모든 타겟이 나열된 의존성에 비해 여전히 최신 상태인지 확인했기 때문이다. `paper.tex`를 수정하고 다시 `make`를 실행하여 테스트해 볼 수 있다.

```console
$ vim paper.tex
$ make
pdflatex paper.tex
...
```

`make`가 `plot.py`를 다시 실행하지 않았음에 주목하라. `plot-data.png`의 의존성 중 변경된 것이 없으므로 그럴 필요가 없었기 때문이다!

# 의존성 관리 (Dependency management)

더 거시적인 수준에서, 여러분의 소프트웨어 프로젝트는 그 자체가 프로젝트인 의존성들을 가질 가능성이 높다. 여러분은 설치된 프로그램(`python` 등), 시스템 패키지(`openssl` 등), 또는 프로그래밍 언어 내의 라이브러리(`matplotlib` 등)에 의존할 수 있다. 요즘 대부분의 의존성은 수많은 의존성을 한곳에 호스팅하고 설치하기 편리한 메커니즘을 제공하는 **저장소(repository)**를 통해 제공된다. 몇 가지 예로 Ubuntu 시스템 패키지를 위한 Ubuntu 패키지 저장소(`apt` 도구 사용), Ruby 라이브러리를 위한 RubyGems, Python 라이브러리를 위한 PyPI, 또는 Arch Linux 사용자 기여 패키지를 위한 Arch User Repository가 있다.

이러한 저장소와 상호작용하는 구체적인 방식은 저장소와 도구마다 매우 다르기 때문에, 이번 강의에서 특정 도구의 세부 사항을 깊이 다루지는 않겠다. 대신 그들이 공통적으로 사용하는 용어들을 살펴볼 것이다. 그중 첫 번째는 **버전 관리(versioning)**이다. 다른 프로젝트가 의존하는 대부분의 프로젝트는 매 릴리스마다 **버전 번호(version number)**를 부여한다. 보통 8.1.3 이나 64.1.20192004와 같은 형태이다. 대개 숫자 형태이지만 항상 그런 것은 아니다. 버전 번호는 여러 용도로 쓰이며, 가장 중요한 것 중 하나는 소프트웨어가 계속 작동하도록 보장하는 것이다. 예를 들어, 내가 내 라이브러리에서 특정 함수의 이름을 변경한 새 버전을 출시했다고 가정해 보자. 누군가 내 라이브러리에 의존하는 소프트웨어를 내가 업데이트를 출시한 후에 빌드하려고 한다면, 더 이상 존재하지 않는 함수를 호출하기 때문에 빌드가 실패할 것이다! 버전 관리는 프로젝트가 다른 프로젝트의 특정 버전 또는 버전 범위에 의존한다고 명시할 수 있게 함으로써 이 문제를 해결하려 한다. 그렇게 하면 기반 라이브러리가 변경되더라도 의존하는 소프트웨어는 내 라이브러리의 이전 버전을 사용하여 빌드를 계속할 수 있다.

하지만 이것 역시 완벽하지는 않다! 만약 내가 라이브러리의 공개 인터페이스(API)는 변경하지 않으면서, 이전 버전에 의존하는 모든 프로젝트가 즉시 사용해야 하는 보안 업데이트를 출시했다면 어떻게 될까? 여기서 버전 번호 내의 서로 다른 숫자 그룹이 의미를 갖게 된다. 정확한 의미는 프로젝트마다 다르지만, 비교적 흔한 표준 중 하나는 [**유의적 버전(Semantic Versioning)**](https://semver.org/lang/ko/)이다. 유의적 버전에서 모든 버전 번호는 `주(major).부(minor).수(patch)` 형식을 갖는다. 규칙은 다음과 같다.

 - 새로운 릴리스가 API를 변경하지 않는다면, 수(patch) 버전을 올린다.
 - API에 하위 호환되는 방식으로 기능을 **추가**한다면, 부(minor) 버전을 올린다.
 - 하위 호환되지 않는 방식으로 API를 변경한다면, 주(major) 버전을 올린다.

이 방식은 이미 큰 장점을 제공한다. 이제 내 프로젝트가 여러분의 프로젝트에 의존한다면, 내가 개발할 당시에 빌드했던 버전과 주 버전이 같고 부 버전이 당시와 같거나 더 높기만 하다면 최신 릴리스를 사용해도 안전해야 한다. 다시 말해, 내가 버전 `1.3.7`인 여러분의 라이브러리에 의존한다면, 이를 `1.3.8`, `1.6.1` 또는 심지어 `1.3.0`으로 빌드해도 괜찮아야 한다. 버전 `2.2.4`는 주 버전이 올라갔으므로 아마 괜찮지 않을 것이다. Python의 버전 번호에서 유의적 버전의 예를 볼 수 있다. 많은 이들이 알고 있듯 Python 2와 Python 3 코드는 잘 섞이지 않으며, 이것이 주 버전이 올라간 이유이다. 마찬가지로 Python 3.5를 위해 작성된 코드는 Python 3.7에서는 잘 돌아가겠지만, 3.4에서는 그렇지 않을 수 있다.

의존성 관리 시스템을 사용하다 보면 **잠금 파일(lock files)**이라는 개념을 접할 수도 있다. 잠금 파일은 각 의존성에 대해 **현재** 의존하고 있는 정확한 버전을 나열한 파일일 뿐이다. 보통 의존성을 더 새 버전으로 업그레이드하려면 명시적으로 업데이트 프로그램을 실행해야 한다. 이는 불필요한 재컴파일 방지, 재현 가능한 빌드(reproducible builds) 보장, 또는 (버그가 있을 수 있는) 최신 버전으로의 자동 업데이트 방지 등 여러 이유 때문이다. 이러한 의존성 고정의 극단적인 형태는 **벤더링(vendoring)**으로, 모든 의존성 코드를 자신의 프로젝트 내부로 복사해 오는 방식이다. 이는 변경 사항에 대한 완벽한 통제권을 주며 직접 수정도 가능하게 하지만, 시간이 지남에 따라 상위 유지보수자(upstream maintainers)의 업데이트를 명시적으로 가져와야 함을 의미한다.

# 지속적 통합 시스템 (Continuous integration systems)

더 큰 프로젝트에서 작업하다 보면, 무언가를 변경할 때마다 추가로 수행해야 하는 작업들이 생기곤 한다. 새로운 버전의 문서를 업로드하거나, 컴파일된 버전을 어딘가로 올리거나, 코드를 PyPI에 출시하거나, 테스트 슈트를 실행하는 등 온갖 일들이 있을 수 있다. 누군가 GitHub에서 풀 리퀘스트(pull request)를 보낼 때마다 그들의 코드가 스타일 체크를 통과하는지 확인하고 벤치마크를 실행하고 싶을 수도 있다. 이러한 니즈가 발생할 때가 바로 지속적 통합을 살펴볼 때이다.

지속적 통합(Continuous Integration, CI)은 "코드가 변경될 때마다 실행되는 일련의 작업들"을 일컫는 포괄적인 용어이며, 다양한 유형의 CI를 제공하는 많은 회사들이 있다 (오픈 소스 프로젝트에는 무료로 제공하는 경우가 많다). 대표적인 서비스로 Travis CI, Azure Pipelines, GitHub Actions 등이 있다. 이들은 모두 대략 비슷한 방식으로 작동한다. 여러분은 저장소에 특정 이벤트가 발생했을 때 무엇이 실행되어야 하는지 정의하는 파일을 추가한다. 가장 흔한 규칙은 "누군가 코드를 푸시하면 테스트 슈트를 실행하라"는 것이다. 이벤트가 발생하면 CI 제공업체는 가상 머신(또는 그 이상)을 띄우고, 정의된 "레시피(recipe)"에 따라 명령어들을 실행한 뒤 그 결과를 어딘가에 기록한다. 테스트 슈트가 실패하면 알림을 받게 하거나, 테스트가 통과하는 동안 저장소에 작은 배지(badge)가 나타나게 설정할 수도 있다.

CI 시스템의 예로, 이 클래스 웹사이트는 GitHub Pages를 사용하여 설정되어 있다. Pages는 `master` 브랜치에 푸시가 발생할 때마다 Jekyll 블로그 소프트웨어를 실행하고 빌드된 사이트를 특정 GitHub 도메인에서 사용할 수 있게 해주는 CI 액션이다. 덕분에 우리는 웹사이트를 매우 쉽게 업데이트할 수 있다! 로컬에서 변경하고, git으로 커밋한 뒤 푸시하기만 하면 된다. 나머지는 CI가 알아서 처리한다.

## 테스트에 관한 짧은 여담 (A brief aside on testing)

대부분의 큰 소프트웨어 프로젝트는 "테스트 슈트(test suite)"와 함께 제공된다. 테스트의 일반적인 개념은 이미 알고 있겠지만, 실제 현장에서 마주하게 될 몇 가지 테스트 방식과 용어들을 짧게 언급하고자 한다.

 - 테스트 슈트(Test suite): 모든 테스트를 통칭하는 용어
 - 유닛 테스트(Unit test): 특정 기능을 격리하여 테스트하는 "마이크로 테스트"
 - 통합 테스트(Integration test): 시스템의 더 큰 부분을 실행하여 서로 다른 기능이나 컴포넌트가 **함께** 잘 작동하는지 확인하는 "매크로 테스트"
 - 회귀 테스트(Regression test): **이전에** 버그를 일으켰던 특정 패턴을 구현하여 동일한 버그가 다시 발생하지 않는지 확인하는 테스트
 - 모킹(Mocking): 관련 없는 기능의 테스트를 피하기 위해 함수, 모듈 또는 타입을 가짜 구현체로 교체하는 것. 예를 들어 "네트워크 모킹"이나 "디스크 모킹" 등이 있다.

# 연습 문제 (Exercises)

 1. 대부분의 Makefile은 `clean`이라는 타겟을 제공한다. 이는 `clean`이라는 파일을 생성하려는 것이 아니라, make를 통해 다시 빌드할 수 있는 모든 파일들을 삭제하기 위한 것이다. 모든 빌드 단계를 "취소"하는 방법이라고 생각하면 된다. 위의 `paper.pdf`용 `Makefile`에 `clean` 타겟을 구현하라. 타겟을 [가짜(phony)](https://www.gnu.org/software/make/manual/html_node/Phony-Targets.html)로 설정해야 한다. [`git ls-files`](https://git-scm.com/docs/git-ls-files) 서브 명령어가 도움이 될 수 있다. 다른 매우 흔한 make 타겟들이 [이곳](https://www.gnu.org/software/make/manual/html_node/Standard-Targets.html#Standard-Targets)에 나열되어 있다.
 2. [Rust의 빌드 시스템](https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html)에서 의존성 버전을 명시하는 다양한 방법들을 살펴보라. 대부분의 패키지 저장소들은 유사한 문법을 지원한다. 각 방식(캐럿, 틸드, 와일드카드, 비교, 다중 지정)에 대해 해당 방식이 적절한 사용 사례를 생각해 보라.
 3. Git 그 자체로도 간단한 CI 시스템 역할을 할 수 있다. 모든 git 저장소 내부의 `.git/hooks` 디렉토리에는 특정 액션이 발생할 때 실행되는 (현재는 비활성화된) 파일들이 있다. `make paper.pdf`를 실행하고 만약 실패한다면 커밋을 거부하는 [`pre-commit`](https://git-scm.com/docs/githooks#_pre_commit) 훅을 작성하라. 이는 빌드되지 않는 버전의 논문이 커밋되는 것을 방지해 줄 것이다.
 4. [GitHub Pages](https://pages.github.com/)를 사용하여 자동으로 게시되는 간단한 페이지를 설정하라. 해당 저장소에 [GitHub Action](https://github.com/features/actions)을 추가하여 저장소 내의 모든 쉘 파일에 대해 `shellcheck`를 실행하도록 설정하라 ([이런 방식](https://github.com/marketplace/actions/shellcheck)으로 할 수 있다). 잘 작동하는지 확인해 보라!
 5. 저장소 내의 모든 `.md` 파일에 대해 [`proselint`](https://github.com/amperser/proselint) 또는 [`write-good`](https://github.com/btford/write-good)을 실행하는 [자신만의 GitHub Action을 만드라](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/building-actions). 이를 저장소에 활성화하고, 오타가 포함된 풀 리퀘스트를 제출하여 잘 작동하는지 확인해 보라.
EOF
