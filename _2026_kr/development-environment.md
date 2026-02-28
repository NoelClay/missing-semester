---
layout: lecture
title: "개발 환경과 도구"
description: >
  IDE, Vim, 언어 서버, AI 기반 개발 도구를 배웁니다.
thumbnail: /static/assets/thumbnails/2026/lec3.png
date: 2026-01-14
ready: true
video:
  aspect: 56.25
  id: QnM1nVzrkx8
---

_개발 환경_은 소프트웨어를 개발하기 위한 도구들의 집합입니다. 개발 환경의 핵심은 텍스트 편집 기능과, 구문 강조, 타입 체크, 코드 포맷팅, 자동 완성 같은 수반 기능들입니다. _통합 개발 환경_(IDE)인 [VS Code][vs-code] 같은 것들은 모든 이 기능들을 하나의 애플리케이션으로 가져옵니다. 터미널 기반 개발 워크플로우는 [tmux](https://github.com/tmux/tmux)(터미널 멀티플렉서), [Vim](https://www.vim.org/)(텍스트 에디터), [Zsh](https://www.zsh.org/)(셸), 그리고 [Ruff](https://docs.astral.sh/ruff/)(Python linter와 코드 포매터) 및 [Mypy](https://mypy-lang.org/)(Python 타입 체커) 같은 언어별 명령줄 도구들을 결합합니다.

IDE와 터미널 기반 워크플로우는 각각의 장점과 단점이 있습니다. 예를 들어, 그래픽 IDE는 배우기 쉬울 수 있으며, 오늘날의 IDE는 일반적으로 AI 자동 완성 같은 더 나은 즉시 사용 가능한 AI 통합을 가지고 있습니다. 반면, 터미널 기반 워크플로우는 경량이며, GUI가 없거나 소프트웨어를 설치할 수 없는 환경에서는 유일한 옵션일 수 있습니다. 우리는 둘 다 기본적인 친숙함을 개발하고 최소한 하나를 숙달하기를 권장합니다. 선호하는 IDE가 없으면, [VS Code][vs-code]부터 시작하기를 권장합니다.

이 강의에서는 다음을 다룹니다:

- [텍스트 편집과 Vim](#텍스트-편집과-vim)
- [코드 인텔리전스와 언어 서버](#코드-인텔리전스와-언어-서버)
- [AI 기반 개발](#ai-기반-개발)
- [확장 기능과 기타 IDE 기능](#확장-기능과-기타-ide-기능)

[vs-code]: https://code.visualstudio.com/

# 텍스트 편집과 Vim

프로그래밍할 때, 당신은 긴 스트림을 쓰거나 파일을 처음부터 끝까지 읽는 것보다는, 코드를 통해 네비게이트하고, 코드 스니펫을 읽고, 코드를 편집하는 데 시간의 대부분을 보냅니다. [Vim]은 이러한 작업의 분포에 최적화된 텍스트 에디터입니다.

**Vim의 철학.** Vim은 기반으로 아름다운 아이디어를 가지고 있습니다: 그 인터페이스는 텍스트를 네비게이트하고 편집하도록 설계된 프로그래밍 언어 자체입니다. 키스트로크(니모닉 이름이 붙음)는 명령이며, 이들 명령은 조합 가능합니다. Vim은 마우스 사용을 피합니다. 왜냐하면 너무 느리기 때문입니다. Vim은 화살표 키의 사용도 피합니다. 왜냐하면 너무 많은 이동을 요구하기 때문입니다. 결과: 뇌-컴퓨터 인터페이스처럼 느껴지고 당신이 생각하는 속도와 일치하는 에디터.

**다른 소프트웨어에서 Vim 지원.** [Vim]을 직접 사용하지 않아도 그 핵심의 아이디어로부터 이익을 얻을 수 있습니다. 텍스트 편집을 포함하는 많은 프로그램들은 내장 기능이나 플러그인으로 "Vim 모드"를 지원합니다. 예를 들어, VS Code는 [VSCodeVim](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim) 플러그인을 가지고 있고, Zsh는 Vim 에뮬레이션을 위해 [내장 지원](https://zsh.sourceforge.io/Guide/zshguide04.html)을 가지고 있으며, 심지어 Claude Code도 [내장 지원](https://code.claude.com/docs/en/interactive-mode#vim-editor-mode)을 Vim 에디터 모드를 위해 가지고 있습니다. 당신이 사용하는 텍스트 편집을 포함하는 거의 모든 도구는 어떤 방식으로든 Vim 모드를 지원할 가능성이 있습니다.

## 모달 편집

Vim은 _모달 에디터_입니다: 다양한 작업 클래스를 위해 다양한 작동 모드를 가지고 있습니다.

- **일반(Normal)**: 파일 이동과 편집을 위해
- **삽입(Insert)**: 텍스트 삽입을 위해
- **바꾸기(Replace)**: 텍스트 바꾸기를 위해
- **비주얼(Visual)** (순수, 라인, 또는 블록): 텍스트의 블록 선택을 위해
- **명령줄(Command-line)**: 명령 실행을 위해

키스트로크는 다양한 작동 모드에서 다양한 의미를 가집니다. 예를 들어, 삽입 모드에서 문자 `x`는 단지 리터럴 문자 "x"를 삽입하기만 하지만, 일반 모드에서는 커서 아래의 문자를 삭제하고, 비주얼 모드에서는 선택을 삭제합니다.

기본 구성에서, Vim은 왼쪽 아래에 현재 모드를 표시합니다. 초기/기본 모드는 일반 모드입니다. 일반적으로 일반 모드와 삽입 모드 사이에서 시간의 대부분을 보낼 것입니다.

`<ESC>`(이스케이프 키)를 눌러 모드를 모두 일반 모드로 전환합니다. 일반 모드에서, `i`로 삽입 모드로 진입하고, `R`로 바꾸기 모드로, `v`로 비주얼 모드로, `V`로 비주얼 라인 모드로, `<C-v>`(Ctrl-V, 때때로 `^V`로도 쓰임)로 비주얼 블록 모드로, `:`로 명령줄 모드로 진입합니다.

Vim을 사용할 때 `<ESC>` 키를 많이 사용합니다: Caps Lock을 Escape로 재매핑하거나([macOS 지시사항](https://vim.fandom.com/wiki/Map_caps_lock_to_escape_in_macOS)) `<ESC>`에 대한 [대체 매핑](https://vim.fandom.com/wiki/Avoid_the_escape_key#Mappings)을 간단한 키 시퀀스로 생성하는 것을 고려하세요.

## 기본: 텍스트 삽입

일반 모드에서, `i`를 눌러 삽입 모드로 진입하세요. 이제 Vim은 `<ESC>`를 눌러 일반 모드로 돌아갈 때까지 다른 텍스트 에디터처럼 작동합니다. 이것은 위에서 설명한 기본과 함께, Vim을 사용하여 파일을 편집하기 시작하는 데 필요한 모든 것입니다(삽입 모드에서만 시간을 보낸다면 특별히 효율적이지는 않지만).

## Vim의 인터페이스는 프로그래밍 언어

Vim의 인터페이스는 프로그래밍 언어입니다. 키스트로크(니모닉 이름이 붙음)는 명령이며, 이들 명령은 _조합_됩니다. 이것은 효율적인 이동과 편집을 가능하게 하며, 특히 명령들이 근육 기억이 된 후에는, 키보드 레이아웃을 배운 후에 입력이 매우 효율적이 되는 것처럼.

### 이동

일반 모드에서 대부분의 시간을 보내야 하며, 파일을 네비게이트하기 위해 이동 명령을 사용합니다. Vim의 이동은 또한 "명사"라고 불립니다. 왜냐하면 텍스트의 청크를 참조하기 때문입니다.

- 기본 이동: `hjkl` (왼쪽, 아래, 위, 오른쪽)
- 단어: `w` (다음 단어), `b` (단어의 시작), `e` (단어의 끝)
- 라인: `0` (라인의 시작), `^` (첫 번째 공백이 아닌 문자), `$` (라인의 끝)
- 화면: `H` (화면의 맨 위), `M` (화면의 중앙), `L` (화면의 맨 아래)
- 스크롤: `Ctrl-u` (위), `Ctrl-d` (아래)
- 파일: `gg` (파일의 시작), `G` (파일의 끝)
- 라인 번호: `:{number}<CR>` 또는 `{number}G` (라인 {number})
    - `<CR>`은 캐리지 리턴/엔터 키를 참조합니다
- 기타: `%` (매칭 항목, 괄호나 중괄호 같은)
- 찾기: `f{character}`, `t{character}`, `F{character}`, `T{character}`
    - 현재 라인에서 {character}를 앞으로/뒤로 찾기/이동
    - `,` / `;`로 매치 네비게이트
- 검색: `/{regex}`, `n` / `N`로 매치 네비게이트

### 선택

비주얼 모드:

- 비주얼: `v`
- 비주얼 라인: `V`
- 비주얼 블록: `Ctrl-v`

선택을 하기 위해 이동 키를 사용할 수 있습니다.

### 편집

당신이 마우스로 했던 모든 것들을, 이제 이동 명령과 조합되는 편집 명령을 사용하여 키보드로 합니다. 여기가 Vim의 인터페이스가 프로그래밍 언어처럼 보이기 시작하는 곳입니다. Vim의 편집 명령은 또한 "동사"라고 불립니다. 왜냐하면 동사는 명사에 작용하기 때문입니다.

- `i` 삽입 모드 진입
    - 하지만 텍스트를 조작/삭제하려면, 백스페이스보다 더 많은 것을 사용하고 싶습니다
- `o` / `O` 아래/위에 라인 삽입
- `d{motion}` {motion} 삭제
    - 예: `dw`는 단어 삭제, `d$`는 라인의 끝까지 삭제, `d0`는 라인의 시작까지 삭제
- `c{motion}` {motion} 변경
    - 예: `cw`는 단어 변경
    - `d{motion}` 다음에 `i`를 한 것과 같습니다
- `x` 문자 삭제 (`dl`과 동일)
- `s` 문자 대체 (`cl`과 동일)
- 비주얼 모드 + 조작
    - 텍스트를 선택하고, `d`로 삭제하거나 `c`로 변경
- `u` 실행 취소, `<C-r>` 다시 실행
- `y` 복사/`yank` (다른 명령들 같은 `d`도 복사)
- `p` 붙여넣기
- 배울 것이 더 많습니다: 예를 들어, `~`는 문자의 대소문자를 뒤집고, `J`는 라인들을 함께 조인합니다

### 개수

명사와 동사를 개수와 결합할 수 있으며, 이것은 주어진 작업을 여러 번 수행합니다.

- `3w` 3 단어 앞으로 이동
- `5j` 5 라인 아래로 이동
- `7dw` 7 단어 삭제

### 수정자

명사의 의미를 변경하기 위해 수정자를 사용할 수 있습니다. 일부 수정자는 "내부" 또는 "안쪽"을 의미하는 `i`이고, "주변"을 의미하는 `a`입니다.

- `ci(` 현재 괄호 쌍 내부의 내용 변경
- `ci[` 현재 대괄호 쌍 내부의 내용 변경
- `da'` 주변의 단일 따옴표를 포함하여 단일 따옴표로 감싼 문자열 삭제

## 모두 함께

여기는 깨진 [fizz buzz](https://en.wikipedia.org/wiki/Fizz_buzz) 구현입니다:

```python
def fizz_buzz(limit):
    for i in range(limit):
        if i % 3 == 0:
            print("fizz", end="")
        if i % 5 == 0:
            print("fizz", end="")
        if i % 3 and i % 5:
            print(i, end="")
        print()

def main():
    fizz_buzz(20)
```

우리는 일반 모드에서 시작하여 다음의 명령 시퀀스를 사용하여 문제들을 수정합니다:

- Main은 절대 불려지지 않습니다
    - `G`로 파일의 끝으로 점프
    - `o`로 아래에 새로운 라인 **o**펜
    - `if __name__ == "__main__": main()`을 입력
        - 에디터에 Python 언어 지원이 있다면, 삽입 모드에서 일부 자동 들여쓰기를 해줄 수 있습니다
    - `<ESC>`로 일반 모드로 돌아가기
- 1이 아닌 0에서 시작
    - `/` 다음에 `range`와 `<CR>`로 "range" 검색
    - `ww`로 두 **w**단어 앞으로 이동(또한 `2w`를 사용할 수 있지만, 실제로는 작은 개수에 대해 개수 기능을 사용하는 대신 키를 반복하는 것이 일반적)
    - `i`로 **i**nsert 모드로 전환하고, `1,` 추가
    - `<ESC>`로 일반 모드로 돌아가기
    - `e`로 다음 단어의 **e**nd로 점프
    - `a`로 시작 **a**ppending 텍스트, `+ 1` 추가
    - `<ESC>`로 일반 모드로 돌아가기
- 5의 배수에 대해 "fizz" 인쇄
    - `:6<CR>`로 라인 6으로 이동
    - `ci"`로 `"`내부를 **c**hange하고, `"buzz"`로 변경
    - `<ESC>`로 일반 모드로 돌아가기

## Vim 배우기

Vim을 배우는 가장 좋은 방법은 기본(우리가 지금까지 다룬 것)을 배우고, 모든 소프트웨어에서 Vim 모드를 활성화하고, 실제로 사용하기 시작하는 것입니다. 마우스나 화살표 키를 사용하려는 유혹을 피하세요. 일부 에디터에서는 화살표 키를 언바인드하여 좋은 습관을 들이도록 강제할 수 있습니다.

### 추가 자료

- 이 클래스의 이전 반복에서의 [Vim 강의](/2020/editors/) --- 우리는 거기서 Vim을 더 깊게 다루었습니다
- `vimtutor`는 Vim과 함께 설치되는 튜토리얼입니다 --- Vim이 설치되어 있다면, 셸에서 `vimtutor`를 실행할 수 있어야 합니다
- [Vim Adventures](https://vim-adventures.com/)는 Vim을 배우기 위한 게임입니다
- [Vim Tips Wiki](https://vim.fandom.com/wiki/Vim_Tips_Wiki)
- [Vim Advent Calendar](https://vimways.org/2019/)는 다양한 Vim 팁을 가지고 있습니다
- [VimGolf](https://www.vimgolf.com/)는 [code golf](https://en.wikipedia.org/wiki/Code_golf)이지만, 프로그래밍 언어는 Vim의 UI입니다
- [Vi/Vim Stack Exchange](https://vi.stackexchange.com/)
- [Vim Screencasts](http://vimcasts.org/)
- [Practical Vim](https://pragprog.com/titles/dnvim2/) (책)

[Vim]: https://www.vim.org/

# 코드 인텔리전스와 언어 서버

IDE는 일반적으로 _언어 서버_에 연결하는 IDE 확장을 통해 코드의 의미론적 이해를 필요로 하는 언어별 지원을 제공하며, [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)을 구현합니다. 예를 들어, [VS Code용 Python 확장](https://marketplace.visualstudio.com/items?itemName=ms-python.python)은 [Pylance](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance)에 의존하고, [VS Code용 Go 확장](https://marketplace.visualstudio.com/items?itemName=golang.go)은 첫 방 [gopls](https://go.dev/gopls/)에 의존합니다. 당신이 작업하는 언어를 위해 확장과 언어 서버를 설치함으로써, 당신의 IDE에서 많은 언어별 기능을 활성화할 수 있습니다:

- **코드 완성.** 더 나은 자동 완성과 자동 제안, `object.` 뒤에 객체의 필드와 메서드를 볼 수 있는 것과 같은.
- **인라인 문서.** 마우스를 올렸을 때와 자동 제안에서 문서를 봅니다.
- **정의로 점프.** 사용 지점에서 정의로 점프합니다. `object.field` 필드 참조에서 필드의 정의로 이동할 수 있는 것과 같은.
- **참조 찾기.** 위의 역입니다. 필드나 타입과 같은 특정 항목이 참조되는 모든 지점을 찾습니다.
- **임포트 도움말.** 임포트를 정렬하고, 사용되지 않는 임포트를 제거하고, 누락된 임포트를 플래그합니다.
- **코드 품질.** 이들 도구는 독립적으로 사용될 수 있지만, 이 기능은 종종 언어 서버에 의해 제공되기도 합니다. 코드 포매팅은 자동 들여쓰기와 자동 포맷팅을 하고, 타입 체커와 linter는 당신이 입력할 때 코드의 오류를 찾습니다. 우리는 [코드 품질](/2026/code-quality/) 강의에서 이 기능 클래스를 더 깊게 다룰 것입니다.

## 언어 서버 구성

일부 언어의 경우, 확장과 언어 서버를 설치하는 것이 전부이며, 당신은 모두 설정될 것입니다. 다른 것들의 경우, 언어 서버로부터 최대 이점을 얻으려면, IDE에 당신의 환경을 알려야 합니다. 예를 들어, VS Code를 [Python 환경](https://code.visualstudio.com/docs/python/environments)으로 가리키면 언어 서버가 당신의 설치된 패키지들을 볼 수 있게 합니다. 환경은 우리의 [패키징과 코드 배포](/2026/shipping-code/) 강의에서 더 깊게 다룹니다.

언어에 따라, 당신의 언어 서버에 대해 설정할 수 있는 일부 설정들이 있을 수 있습니다. 예를 들어, VS Code에서 Python 지원을 사용하면, Python의 옵션 타입 주석을 활용하지 않는 프로젝트에 대해 정적 타입 체크를 비활성화할 수 있습니다.

# AI 기반 개발

[GitHub Copilot][github-copilot]이 OpenAI의 [Codex 모델](https://openai.com/index/openai-codex/)을 사용하여 2021년 중반에 도입된 이후, [LLM](https://en.wikipedia.org/wiki/Large_language_model)은 소프트웨어 엔지니어링에서 광범위하게 채택되었습니다. 현재 사용 중인 세 가지 주요 형태는: 자동 완성, 인라인 채팅, 코딩 에이전트입니다.

[github-copilot]: https://github.com/features/copilot/ai-code-editor

## 자동 완성

AI 기반 자동 완성은 당신의 IDE의 기존 자동 완성과 동일한 형태이며, 당신이 입력할 때 커서 위치에서 완성을 제안합니다. 때때로, 그것은 "그냥 작동"하는 수동 기능으로 사용됩니다. 그 이상으로, AI 자동 완성은 일반적으로 코드 주석을 사용하여 [프롬프트됩니다](https://en.wikipedia.org/wiki/Prompt_engineering).

예를 들어, 이들 강의 노트의 내용을 다운로드하고 모든 링크를 추출하는 스크립트를 작성해봅시다. 우리는 다음으로 시작할 수 있습니다:

```python
import requests

def download_contents(url: str) -> str:
```

모델은 함수의 본문을 자동 완성할 것입니다:

```python
    response = requests.get(url)
    return response.text
```

우리는 주석을 사용하여 완성을 더 가이드할 수 있습니다. 예를 들어, 모든 마크다운 링크를 추출하는 함수를 작성하기 시작하지만 특별히 설명적인 이름이 없는 경우:

```python
def extract(contents: str) -> list[str]:
```

모델은 다음과 같은 것을 자동 완성할 것입니다:

```python
    lines = contents.splitlines()
    return [line for line in lines if line.strip()]
```

우리는 코드 주석을 통해 완성을 가이드할 수 있습니다:

```python
def extract(content: str) -> list[str]:
    # extract all Markdown links from the content
```

이번에는, 모델이 더 나은 완성을 제공합니다:

```python
    import re
    pattern = r'\[.*?\]\((.*?)\)'
    return re.findall(pattern, content)
```

여기서, 우리는 이 AI 코딩 도구의 한 가지 단점을 봅니다: 커서에서만 완성을 제공할 수 있습니다. 이 경우, `import re`를 함수 내부가 아닌 모듈 수준에 배치하는 것이 더 나은 실제입니다.

위의 예제는 코드 완성이 주석을 사용하여 어떻게 조종될 수 있는지를 보여주기 위해 잘못 이름이 붙은 함수를 사용했습니다. 실제로, 당신은 `extract_links` 같은 더 설명적으로 이름이 붙은 함수를 가지고 코드를 작성하고 싶을 것이고, 당신은 docstring을 작성하고 싶을 것입니다(그리고 이를 기반으로, 모델은 위의 것과 유사한 완성을 생성해야 합니다).

데모 목적으로, 우리는 스크립트를 완성할 수 있습니다:

```python
print(extract(download_contents("https://raw.githubusercontent.com/missing-semester/missing-semester/refs/heads/master/_2026/development-environment.md")))
```

## 인라인 채팅

인라인 채팅은 라인 또는 블록을 선택한 다음 직접 AI 모델에 프롬프트하여 편집을 제안할 수 있게 해줍니다. 이 상호작용 모드에서, 모델은 기존 코드를 변경할 수 있습니다(커서 너머의 코드만을 완성하는 자동 완성과는 다름).

위의 예제에서 계속하여, 우리가 타사 `requests` 라이브러리를 사용하지 않기로 결정했다고 가정합시다. 우리는 관련된 세 라인의 코드를 선택하고, 인라인 채팅을 호출하고, 다음과 같은 말을 할 수 있습니다:

```
use built-in libraries instead
```

모델이 제안합니다:

```python
from urllib.request import urlopen

def download_contents(url: str) -> str:
    with urlopen(url) as response:
        return response.read().decode('utf-8')
```

## 코딩 에이전트

코딩 에이전트는 [Agentic Coding](/2026/agentic-coding/) 강의에서 깊게 다룹니다.

## 권장 소프트웨어

인기 있는 AI IDE들은 [GitHub Copilot][github-copilot] 확장을 가진 [VS Code][vs-code]와 [Cursor](https://cursor.com/)입니다. GitHub Copilot은 현재 [학생들을 위해 무료](https://github.com/education/students)이며, 교사와 인기 있는 오픈소스 프로젝트의 유지보수자들도 가능합니다. 이것은 빠르게 진화하는 공간입니다. 많은 선도적인 제품들은 대체로 동등한 기능을 가지고 있습니다.

# 확장 기능과 기타 IDE 기능

IDE는 강력한 도구이며, _확장 기능_으로 더욱 강력해집니다. 우리는 이러한 기능들을 모두 하나의 강의에서 다룰 수는 없지만, 여기서 우리는 인기 있는 몇 가지 확장 기능에 대한 몇 가지 포인터를 제공합니다. 우리는 당신이 이 공간을 당신 자신으로 탐색하도록 권장합니다. Vim 플러그인을 위한 [Vim Awesome](https://vimawesome.com/)과 [VS Code 확장 인기도별 정렬](https://marketplace.visualstudio.com/search?target=VSCode&category=All%20categories&sortBy=Installs)과 같은 인기 IDE 확장의 많은 목록들이 온라인에서 가능합니다.

- [개발 컨테이너](https://containers.dev/): 인기 있는 IDE들에 의해 지원됩니다([VS Code에 의해 지원됨](https://code.visualstudio.com/docs/devcontainers/containers)), dev 컨테이너는 당신이 컨테이너를 사용하여 개발 도구를 실행할 수 있게 해줍니다. 이것은 이식성이나 격리에 도움이 될 수 있습니다. [패키징과 코드 배포](/2026/shipping-code/) 강의는 컨테이너를 더 깊게 다룹니다.
- 원격 개발: SSH를 사용하여 원격 머신에서 개발합니다([VS Code용 원격 SSH 플러그인](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh)). 예를 들어, 클라우드의 강력한 GPU 머신에서 코드를 개발하고 실행하려는 경우 유용할 수 있습니다.
- 협업 편집: Google Docs 스타일로 동일한 파일을 편집합니다([VS Code용 Live Share 플러그인](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare)).

# 연습

1. Vim 모드를 지원하는 모든 소프트웨어(에디터 및 셸 같은)에서 Vim 모드를 활성화하고, 다음 한 달 동안 모든 텍스트 편집을 위해 Vim 모드를 사용하세요. 뭔가 비효율적으로 보이거나 "더 나은 방법이 있을 것이다"라고 생각할 때마다, 구글에서 검색해보세요. 아마도 더 나은 방법이 있을 겁니다.
1. [VimGolf](https://www.vimgolf.com/)의 도전 과제를 완료하세요.
1. 당신이 작업 중인 프로젝트에 대해 IDE 확장과 언어 서버를 구성하세요. 라이브러리 종속 항목의 정의로 점프와 같은 모든 예상 기능이 예상대로 작동하는지 확인하세요. 사용할 수 있는 코드가 없으면, GitHub의 일부 오픈 소스 프로젝트([이것](https://github.com/spf13/cobra) 같은)를 사용할 수 있습니다.
1. IDE 확장 목록을 탐색하고 당신에게 유용해 보이는 하나를 설치하세요.
