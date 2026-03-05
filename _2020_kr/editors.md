---
layout: lecture
permalink: /2020/kr/editors/
title: "에디터 (Vim)"
description: >
  효율적인 코드 편집을 위해 설계된 강력한 텍스트 에디터인 Vim의 사용법을 배웁니다.
thumbnail: /static/assets/thumbnails/2020/lec3.png
date: 2020-01-15
ready: true
video:
  aspect: 56.25
  id: kr_lec3_2020
---

영어 단어를 쓰는 것과 코드를 작성하는 것은 매우 다른 활동이다. 프로그래밍을 할 때 여러분은 긴 글을 쭉 써 내려가기보다는 파일을 전환하고, 코드를 읽고, 탐색하고, 편집하는 데 더 많은 시간을 보낸다. 따라서 일반적인 글쓰기용 프로그램(예: Microsoft Word)과 코드 작성용 프로그램(예: Visual Studio Code)이 서로 다른 것은 당연한 일이다.

프로그래머로서 우리는 대부분의 시간을 코드 편집에 할애하므로, 자신의 필요에 맞는 에디터를 익히는 데 시간을 투자할 가치가 있다. 새로운 에디터를 배우는 방법은 다음과 같다.

- 튜토리얼부터 시작하라 (예: 이 강의와 우리가 안내하는 리소스들)
- 초기에는 속도가 느려지더라도 모든 텍스트 편집 작업에 해당 에디터를 사용하라
- 작업을 하면서 필요한 내용을 찾아보라: 어떤 일을 하는 더 나은 방법이 있을 것 같다면, 실제로 있을 확률이 높다.

위의 방법을 따라 모든 텍스트 편집 작업에 새로운 프로그램을 완전히 몰입해서 사용한다면, 정교한 텍스트 에디터를 익히는 타임라인은 다음과 같을 것이다. 한두 시간 안에는 파일 열기 및 편집, 저장/종료, 버퍼 탐색과 같은 기본적인 에디터 기능을 배우게 된다. 20시간 정도 사용하면 이전 에디터를 썼을 때만큼 빨라질 것이다. 그 이후부터는 장점이 나타나기 시작한다. 충분한 지식과 근육 기억(muscle memory)이 쌓여 새로운 에디터를 사용하는 것이 시간을 절약해 줄 것이다. 현대적인 텍스트 에디터는 화려하고 강력한 도구이므로 학습에는 끝이 없다. 더 많이 배울수록 여러분은 더욱 빨라질 것이다.

# 어떤 에디터를 배워야 할까?

프로그래머들은 텍스트 에디터에 대해 [확고한 의견](https://en.wikipedia.org/wiki/Editor_war)을 가지고 있는 경우가 많다.

오늘날 어떤 에디터들이 인기 있을까? [Stack Overflow 설문 조사](https://insights.stackoverflow.com/survey/2019/#development-environments-and-tools)를 참고해 보라 (Stack Overflow 사용자가 프로그래머 전체를 대변하지는 않을 수 있으므로 편향이 있을 수 있다). [Visual Studio Code](https://code.visualstudio.com/)가 가장 인기 있는 에디터이며, [Vim](https://www.vim.org/)은 가장 인기 있는 커맨드 라인 기반 에디터이다.

## Vim

이 강의의 모든 강사들은 Vim을 주 에디터로 사용한다. Vim은 풍부한 역사를 가지고 있다. 1976년 Vi 에디터에서 시작되었으며 현재까지도 계속 발전하고 있다. Vim은 매우 훌륭한 아이디어들을 담고 있으며, 이 때문에 많은 도구들이 Vim 에뮬레이션 모드를 지원한다 (예를 들어, [VS Code용 Vim 에뮬레이션](https://github.com/VSCodeVim/Vim)은 140만 명 이상이 설치했다). 결국 다른 텍스트 에디터로 바꾸게 되더라도 Vim은 배울 가치가 충분하다.

50분 만에 Vim의 모든 기능을 가르치는 것은 불가능하다. 따라서 우리는 Vim의 철학을 설명하고, 기초를 가르치며, 몇 가지 고급 기능을 보여준 뒤 도구를 마스터하기 위한 리소스를 제공하는 데 집중할 것이다.

# Vim의 철학 (Philosophy of Vim)

프로그래밍을 할 때 여러분은 글을 쓰는 시간보다 코드를 읽고 편집하는 데 더 많은 시간을 보낸다. 이러한 이유로 Vim은 **모달(modal)** 에디터이다. 즉, 텍스트를 입력하는 모드와 조작하는 모드가 분리되어 있다. Vim은 프로그래밍이 가능하며(Vimscript 및 Python 등 다른 언어 사용), Vim의 인터페이스 그 자체가 하나의 프로그래밍 언어와 같다. 키 입력(기억하기 쉬운 이름의 조합)이 곧 명령어이며, 이 명령어들은 서로 조합(composable) 가능하다. Vim은 마우스 사용을 피한다. 마우스는 너무 느리기 때문이다. 심지어 화살표 키 사용도 피하는데, 이는 손의 움직임이 너무 많기 때문이다.

그 결과, Vim은 여러분이 생각하는 속도에 맞춰 동작할 수 있는 에디터가 된다.

# 모달 편집 (Modal editing)

Vim의 디자인은 프로그래머가 긴 텍스트를 쭉 써 내려가기보다는 읽고, 탐색하고, 작은 수정을 가하는 데 많은 시간을 쓴다는 생각에 기반한다. 이러한 이유로 Vim은 여러 가지 운영 모드를 가지고 있다.

- **Normal**(일반): 파일 안을 이동하고 편집을 수행하는 모드
- **Insert**(입력): 텍스트를 입력하는 모드
- **Replace**(교체): 텍스트를 교체하는 모드
- **Visual**(비주얼: 일반, 행, 블록): 텍스트 블록을 선택하는 모드
- **Command-line**(명령행): 명령어를 실행하는 모드

키 입력은 모드에 따라 서로 다른 의미를 갖는다. 예를 들어, Insert 모드에서 글자 `x`를 누르면 문자 'x'가 입력되지만, Normal 모드에서는 커서 아래의 문자를 삭제하고, Visual 모드에서는 선택 영역을 삭제한다.

기본 설정에서 Vim은 현재 모드를 왼쪽 하단에 표시한다. 초기/기본 모드는 Normal 모드이다. 여러분은 보통 대부분의 시간을 Normal 모드와 Insert 모드를 오가며 보내게 될 것이다.

어떤 모드에서든 `<ESC>`(이스케이프 키)를 누르면 Normal 모드로 돌아간다. Normal 모드에서 `i`를 누르면 Insert 모드, `R`은 Replace 모드, `v`는 Visual 모드, `V`는 Visual Line 모드, `<C-v>` (Ctrl-V)는 Visual Block 모드, 그리고 `:`은 Command-line 모드로 진입한다.

Vim을 사용하다 보면 `<ESC>` 키를 매우 자주 사용하게 된다. Caps Lock 키를 Escape 키로 리매핑하거나 ([macOS 안내](https://vim.fandom.com/wiki/Map_caps_lock_to_escape_in_macOS)), 간단한 키 조합으로 `<ESC>` 기능을 하도록 [대체 매핑](https://vim.fandom.com/wiki/Avoid_the_escape_key#Mappings)을 만드는 것을 고려해 보라.

# 기초 (Basics)

## 텍스트 입력하기 (Inserting text)

Normal 모드에서 `i`를 눌러 Insert 모드로 들어간다. 이제 Vim은 `<ESC>`를 눌러 Normal 모드로 돌아가기 전까지 다른 텍스트 에디터와 똑같이 동작한다. 이것과 위에서 설명한 기초만 알면 Vim으로 파일 편집을 시작할 수 있다 (비록 모든 편집을 Insert 모드에서만 한다면 그리 효율적이지는 않겠지만 말이다).

## 버퍼, 탭, 그리고 창 (Buffers, tabs, and windows)

Vim은 열려 있는 파일들의 집합을 "버퍼(buffers)"라고 부르며 관리한다. 하나의 Vim 세션은 여러 개의 탭을 가질 수 있고, 각 탭은 여러 개의 창(split panes)을 가질 수 있다. 각 창은 하나의 버퍼를 보여준다. 웹 브라우저와 같이 익숙한 다른 프로그램들과 달리, Vim에서는 버퍼와 창이 1:1로 대응하지 않는다. 창은 그저 "뷰(view)"일 뿐이다. 하나의 버퍼가 같은 탭 안에서도 **여러 개**의 창에 열려 있을 수 있다. 이는 파일의 서로 다른 두 부분을 동시에 보고 싶을 때 매우 유용하다.

기본적으로 Vim은 하나의 창을 포함하는 하나의 탭으로 시작한다.

## 명령행 (Command-line)

Normal 모드에서 `:`을 입력하여 Command 모드로 들어갈 수 있다. `:`을 누르면 커서가 화면 하단의 명령행으로 이동한다. 이 모드에서는 파일 열기, 저장, 닫기, 그리고 [Vim 종료](https://twitter.com/iamdevloper/status/435555976687923200) 등 다양한 기능을 수행할 수 있다.

- `:q` 종료 (창 닫기)
- `:w` 저장 ("write")
- `:wq` 저장 후 종료
- `:e {파일명}` 편집을 위해 파일 열기
- `:ls` 열려 있는 버퍼 목록 표시
- `:help {주제}` 도움말 열기
    - `:help :w`는 `:w` 명령어에 대한 도움말을 연다.
    - `:help w`는 `w` 이동 명령어에 대한 도움말을 연다.

# Vim의 인터페이스는 프로그래밍 언어이다

Vim에서 가장 중요한 아이디어는 Vim의 인터페이스 자체가 하나의 프로그래밍 언어라는 점이다. 키 입력(기억하기 쉬운 이름)은 명령어이며, 이 명령어들은 서로 **조합**된다. 이를 통해 효율적인 이동과 편집이 가능해지며, 특히 명령어가 근육 기억이 되면 그 효과는 더욱 커진다.

## 이동 (Movement)

대부분의 시간을 Normal 모드에서 보내며, 이동 명령어를 사용해 버퍼를 탐색해야 한다. Vim에서 이동 명령어는 텍스트 덩어리를 참조하기 때문에 "명사(nouns)"라고도 불린다.

- 기본 이동: `hjkl` (왼쪽, 아래, 위, 오른쪽)
- 단어 단위: `w` (다음 단어), `b` (단어 시작), `e` (단어 끝)
- 행 단위: `0` (행 시작), `^` (공백이 아닌 첫 글자), `$` (행 끝)
- 화면 단위: `H` (화면 상단), `M` (화면 중간), `L` (화면 하단)
- 스크롤: `Ctrl-u` (위로), `Ctrl-d` (아래로)
- 파일 단위: `gg` (파일 시작), `G` (파일 끝)
- 행 번호: `:{번호}<CR>` 또는 `{번호}G` ({번호}번째 행으로 이동)
- 기타: `%` (짝이 맞는 괄호 등 해당 항목으로 이동)
- 찾기: `f{문자}`, `t{문자}`, `F{문자}`, `T{문자}`
    - 현재 행에서 {문자}를 정방향/역방향으로 찾기/직전까지 이동
    - `,` / `;` 로 다음/이전 매치 탐색
- 검색: `/{정규표현식}`, `n` / `N` 으로 매치 탐색

## 선택 (Selection)

비주얼 모드:

- 일반 비주얼: `v`
- 행 비주얼: `V`
- 블록 비주얼: `Ctrl-v`

이동 키를 사용하여 선택 영역을 지정할 수 있다.

## 편집 (Edits)

예전에 마우스로 했던 모든 작업을 이제는 이동 명령어와 조합되는 편집 명령어를 통해 키보드로 수행한다. 여기서부터 Vim의 인터페이스가 프로그래밍 언어처럼 보이기 시작한다. Vim의 편집 명령어는 명사에 작용하기 때문에 "동사(verbs)"라고도 불린다.

- `i` Insert 모드 진입
    - 하지만 텍스트를 조작하거나 삭제할 때는 백스페이스보다 더 효율적인 명령어를 사용하고 싶을 것이다.
- `o` / `O` 아래에 / 위에 새 행 삽입
- `d{이동}` {이동}만큼 삭제
    - 예: `dw`는 단어 삭제, `d$`는 행 끝까지 삭제, `d0`은 행 시작까지 삭제
- `c{이동}` {이동}만큼 변경(삭제 후 입력)
    - 예: `cw`는 단어 변경
    - `d{이동}`을 수행한 뒤 `i`를 누른 것과 같다.
- `x` 문자 삭제 (`dl`과 동일)
- `s` 문자 교체 (`cl`과 동일)
- 비주얼 모드 + 조작
    - 텍스트 선택 후, `d`로 삭제하거나 `c`로 변경
- `u` 실행 취소(undo), `<C-r>` 다시 실행(redo)
- `y` 복사 / "yank" (삭제 명령어인 `d` 등도 복사 기능을 포함한다)
- `p` 붙여넣기
- 더 많은 기능: 예: `~`는 문자의 대소문자를 바꾼다.

## 횟수 (Counts)

명사와 동사를 횟수와 결합하여 특정 동작을 여러 번 수행할 수 있다.

- `3w` 3단어 앞으로 이동
- `5j` 5행 아래로 이동
- `7dw` 7단어 삭제

## 수식어 (Modifiers)

수식어를 사용하여 명사의 의미를 바꿀 수 있다. 대표적인 수식어로는 "inner" 또는 "inside"를 의미하는 `i`와, "around"를 의미하는 `a`가 있다.

- `ci(` 현재 괄호 `()` 안의 내용을 변경
- `ci[` 현재 대괄호 `[]` 안의 내용을 변경
- `da'` 작은따옴표로 감싸진 문자열을 따옴표를 포함하여 삭제

# 데모 (Demo)

다음은 버그가 있는 [fizz buzz](https://en.wikipedia.org/wiki/Fizz_buzz) 구현체이다.

```python
def fizz_buzz(limit):
    for i in range(limit):
        if i % 3 == 0:
            print('fizz')
        if i % 5 == 0:
            print('fizz')
        if i % 3 and i % 5:
            print(i)

def main():
    fizz_buzz(10)
```

우리는 다음 문제들을 수정할 것이다.

- main 함수가 호출되지 않음
- 1이 아닌 0부터 시작함
- 15의 배수일 때 "fizz"와 "buzz"를 별도의 행에 출력함
- 5의 배수일 때 "fizz"를 출력함 (원래는 "buzz"여야 함)
- 10이라는 하드코딩된 값 대신 커맨드 라인 인자를 사용함

실습 시연은 강의 비디오를 참조하라. 위의 변경 사항들이 Vim을 사용했을 때와 다른 프로그램을 사용했을 때 어떻게 다른지 비교해 보라. Vim에서는 매우 적은 키 입력만으로도 여러분이 생각하는 속도에 맞춰 편집할 수 있음을 알게 될 것이다.

# Vim 커스터마이징 (Customizing Vim)

Vim은 `~/.vimrc`라는 일반 텍스트 설정 파일(Vimscript 명령어 포함)을 통해 커스터마이징된다. 아마도 여러분이 켜고 싶은 기본적인 설정들이 아주 많을 것이다.

우리는 시작점으로 사용할 수 있는 주석이 잘 달린 기본 설정을 제공한다. Vim의 독특한 기본 동작 중 일부를 수정해 주므로 이를 사용하는 것을 권장한다. **[여기](/2020/kr/files/vimrc)에서 설정을 다운로드하여 `~/.vimrc`에 저장하라.**

Vim은 고도로 커스터마이징 가능하며, 다양한 설정 옵션을 탐색해 볼 가치가 있다. GitHub에서 다른 사람들의 도트파일(dotfiles)을 보고 영감을 얻을 수 있다. 예: 강사들의 Vim 설정 ([Anish](https://github.com/anishathalye/dotfiles/blob/master/vimrc), [Jon](https://github.com/jonhoo/configs/blob/master/editor/.config/nvim/init.lua) (Neovim 사용), [Jose](https://github.com/JJGO/dotfiles/blob/master/vim/.vimrc)). 이 주제에 대한 좋은 블로그 포스트들도 많다. 다른 사람의 설정을 통째로 복사해서 붙여넣기보다는 읽어보고 이해한 뒤 필요한 것만 가져오도록 하라.

# Vim 확장하기 (Extending Vim)

Vim을 확장하기 위한 수많은 플러그인이 있다. 인터넷의 낡은 조언들과 달리, (Vim 8.0 이후로는) 별도의 플러그인 매니저를 사용할 필요가 없다. 대신 내장된 패키지 관리 시스템을 사용할 수 있다. 단순히 `~/.vim/pack/vendor/start/` 디렉토리를 만들고 그 안에 플러그인을 넣으면 된다 (예: `git clone` 사용).

우리가 즐겨 사용하는 플러그인들은 다음과 같다.

- [ctrlp.vim](https://github.com/ctrlpvim/ctrlp.vim): 퍼지 파일 찾기
- [ack.vim](https://github.com/mileszs/ack.vim): 코드 검색
- [nerdtree](https://github.com/scrooloose/nerdtree): 파일 탐색기
- [vim-easymotion](https://github.com/easymotion/vim-easymotion): 마법 같은 이동 기능

너무 많은 플러그인 목록을 나열하지는 않겠다. 강사들의 도트파일 ([Anish](https://github.com/anishathalye/dotfiles), [Jon](https://github.com/jonhoo/configs), [Jose](https://github.com/JJGO/dotfiles))을 확인하여 우리가 어떤 플러그인을 사용하는지 참고하라. 더 멋진 플러그인을 찾으려면 [Vim Awesome](https://vimawesome.com/)을 확인해 보라. "best Vim plugins"라고 검색해도 수많은 블로그 포스트를 찾을 수 있다.

# 다른 프로그램에서의 Vim 모드

많은 도구가 Vim 에뮬레이션을 지원한다. 품질은 도구마다 다르며 고급 기능을 지원하지 않을 수도 있지만, 대부분 기본적인 기능은 훌륭하게 제공한다.

## 쉘 (Shell)

Bash 사용자라면 `set -o vi`를 사용하라. Zsh는 `bindkey -v`, Fish는 `fish_vi_key_bindings`를 사용하면 된다. 또한 어떤 쉘을 사용하든 `export EDITOR=vim`을 설정할 수 있다. 이 환경 변수는 프로그램이 에디터를 실행하고 싶을 때 어떤 에디터를 띄울지 결정하는 데 사용된다. 예를 들어, `git`은 커밋 메시지 작성을 위해 이 에디터를 사용한다.

## Readline

많은 프로그램이 커맨드 라인 인터페이스를 위해 [GNU Readline](https://tiswww.case.edu/php/chet/readline/rltop.html) 라이브러리를 사용한다. Readline 역시 (기본적인) Vim 에뮬레이션을 지원하며, `~/.inputrc` 파일에 다음 라인을 추가하여 활성화할 수 있다.

```
set editing-mode vi
```

이 설정을 하면 예를 들어 Python REPL에서도 Vim 바인딩을 사용할 수 있게 된다.

## 기타

웹 **브라우저**를 위한 Vim 키바인딩 확장 프로그램도 있다. Google Chrome용 [Vimium](https://chrome.google.com/webstore/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb?hl=en)과 Firefox용 [Tridactyl](https://github.com/tridactyl/tridactyl)이 대표적이다. 심지어 [Jupyter 노트북](https://github.com/jupyterlab-contrib/jupyterlab-vim)에서도 Vim 바인딩을 사용할 수 있다.
Vim 스타일로 동작하는 소프트웨어들의 [방대한 목록](https://reversed.top/2016-08-13/big-list-of-vim-like-software)도 확인해 보라.

# 고급 Vim (Advanced Vim)

Vim의 강력함을 보여주는 몇 가지 예시이다. 이 모든 것들을 지금 다 가르칠 수는 없지만, 사용하면서 하나씩 배우게 될 것이다. 좋은 휴리스틱(heuristic)은 에디터를 사용하다가 "이걸 하는 더 나은 방법이 분명 있을 텐데"라는 생각이 들 때마다 인터넷을 찾아보는 것이다. 분명 더 나은 방법이 있을 것이다.

## 검색 및 치환 (Search and replace)

`:s` (substitute) 명령어 ([문서](https://vim.fandom.com/wiki/Search_and_replace) 참조).

- `%s/foo/bar/g`
    - 파일 전체에서 foo를 bar로 치환
- `%s/\[.*\](\(.*\))/\1/g`
    - 이름이 포함된 Markdown 링크를 순수 URL로 치환

## 다중 창 (Multiple windows)

- `:sp` / `:vsp` 로 창 분할
- 동일한 버퍼에 대해 여러 개의 뷰를 가질 수 있다.

## 매크로 (Macros)

- `q{문자}` 로 `{문자}` 레지스터에 매크로 기록 시작
- `q` 로 기록 중지
- `@{문자}` 로 매크로 실행
- 에러 발생 시 매크로 실행 중단
- `{번호}@{문자}` 로 매크로를 `{번호}`번 반복 실행
- 매크로는 재귀적일 수 있다
    - 먼저 `q{문자}q` 로 레지스터를 비운다
    - 매크로를 기록하면서, 중간에 `@{문자}`를 넣어 자기 자신을 호출한다 (기록이 끝나기 전까지는 아무 동작도 안 함)
- 예시: XML을 JSON으로 변환 ([파일](/2020/kr/files/example-data.xml))
    - "name" / "email" 키를 갖는 객체 배열로 변환
    - Python 프로그램을 쓴다?
    - sed / 정규표현식을 쓴다
        - `g/people/d`
        - `%s/<person>/{/g`
        - `%s/<name>\(.*\)<\/name>/"name": "\1",/g`
        - ...
    - Vim 명령어 / 매크로를 쓴다
        - `Gdd`, `ggdd` 로 첫 줄과 마지막 줄 삭제
        - 단일 요소 포맷팅을 위한 매크로 (레지스터 `e`)
            - `<name>`이 있는 줄로 이동
            - `qe^r"f>s": "<ESC>f<C"<ESC>q`
        - 한 사람의 정보를 포맷팅하는 매크로
            - `<person>`이 있는 줄로 이동
            - `qpS{<ESC>j@eA,<ESC>j@ejS},<ESC>q`
        - 한 사람을 포맷팅하고 다음 사람으로 이동하는 매크로
            - `<person>`이 있는 줄로 이동
            - `qq@pjq`
        - 파일 끝까지 매크로 실행
            - `999@q`
        - 마지막 `,`를 수동으로 제거하고 `[` 와 `]` 기호 추가

# 리소스 (Resources)

- `vimtutor`는 Vim과 함께 설치되는 튜토리얼이다. Vim이 설치되어 있다면 쉘에서 `vimtutor`를 실행해 보라.
- [Vim Adventures](https://vim-adventures.com/)는 Vim을 배우기 위한 게임이다.
- [Vim Tips Wiki](https://vim.fandom.com/wiki/Vim_Tips_Wiki)
- [Vim Advent Calendar](https://vimways.org/2019/)에는 다양한 Vim 팁이 있다.
- [Vim Golf](https://www.vimgolf.com/)는 Vim 인터페이스가 곧 프로그래밍 언어가 되는 [코드 골프(code golf)](https://en.wikipedia.org/wiki/Code_golf)이다.
- [Vi/Vim Stack Exchange](https://vi.stackexchange.com/)
- [Vim Screencasts](http://vimcasts.org/)
- [Practical Vim](https://pragprog.com/titles/dnvim2/) (서적)

# 연습 문제 (Exercises)

1. `vimtutor`를 완료하라. 참고: [80x24](https://en.wikipedia.org/wiki/VT100) 터미널 창에서 가장 보기 좋다.
1. 우리의 [기본 vimrc](/2020/kr/files/vimrc)를 다운로드하여 `~/.vimrc`에 저장하라. 주석이 잘 달린 파일을 (Vim으로!) 읽어보고, 새로운 설정으로 Vim의 외관과 동작이 어떻게 바뀌었는지 확인하라.
1. 플러그인을 설치하고 설정해 보라: [ctrlp.vim](https://github.com/ctrlpvim/ctrlp.vim).
   1. `mkdir -p ~/.vim/pack/vendor/start` 명령어로 플러그인 디렉토리를 만든다.
   1. 플러그인 다운로드: `cd ~/.vim/pack/vendor/start; git clone https://github.com/ctrlpvim/ctrlp.vim`
   1. 플러그인 [문서](https://github.com/ctrlpvim/ctrlp.vim/blob/master/readme.md)를 읽어본다. 프로젝트 디렉토리로 이동해 Vim을 열고 명령행에서 `:CtrlP`를 실행해 파일을 찾아본다.
   1. `~/.vimrc`에 [설정](https://github.com/ctrlpvim/ctrlp.vim/blob/master/readme.md#basic-options)을 추가하여 Ctrl-P 키를 눌러 CtrlP를 열 수 있도록 커스터마이징한다.
1. Vim 사용 연습을 위해, 강의 중 진행한 [데모](#demo)를 여러분의 머신에서 직접 따라 해보라.
1. 앞으로 한 달 동안 **모든** 텍스트 편집 작업에 Vim을 사용하라. 비효율적으로 느껴지는 작업이 있거나 "더 나은 방법"이 있을 것 같을 때마다 구글링을 해보라. 분명 더 나은 방법이 있을 것이다. 막히는 부분이 있다면 오피스 아워에 방문하거나 이메일을 보내달라.
1. 다른 도구들도 Vim 바인딩을 사용하도록 설정하라 (위의 안내 참조).
1. `~/.vimrc`를 더 커스터마이징하고 더 많은 플러그인을 설치해 보라.
1. (고급) Vim 매크로를 사용해 XML을 JSON으로 변환해 보라 ([예제 파일](/2020/kr/files/example-data.xml)). 스스로 해보되, 막히면 위의 [매크로](#macros) 섹션을 참고하라.
EOF
