---
layout: lecture
title: "버전 관리와 Git"
description: >
  Git의 데이터 모델을 배우고 버전 관리와 협업에 Git을 사용하는 방법을 배웁니다.
thumbnail: /static/assets/thumbnails/2026/lec5.png
date: 2026-01-16
ready: true
video:
  aspect: 56.25
  id: 9K8lB61dl3Y
---

**버전 관리 시스템(VCS)**은 소스 코드나 다른 파일/폴더 컬렉션의 변경 사항을 추적하는 도구입니다. 이름이 암시하듯이 VCS는 변경 이력을 유지하고, 동시에 협업을 가능하게 합니다. 논리적으로 VCS는 폴더와 그 내용의 변경을 일련의 **스냅샷(snapshot)**으로 추적합니다. 각 스냅샷은 최상위 디렉터리 내 모든 파일/폴더의 전체 상태를 담습니다. VCS는 또한 누가 각 스냅샷을 만들었는지, 스냅샷과 관련된 메시지 등의 메타데이터를 유지합니다.

버전 관리가 유용한 이유는? 혼자 작업할 때도 프로젝트의 이전 스냅샷을 볼 수 있고, 특정 변경이 왜 이루어졌는지 기록할 수 있으며, 개발의 여러 분기(branch)에서 작업할 수 있고, 훨씬 더 많은 것들을 할 수 있습니다. 다른 사람과 협업할 때는 누가 어떤 변경을 했는지 추적하고, 동시 개발에서 발생하는 충돌을 해결하는 데 필수적입니다.

현대의 VCS는 또한 다음과 같은 질문에 쉽게(종종 자동으로) 답할 수 있게 합니다:

- 누가 이 모듈을 작성했는가?
- 이 파일의 특정 라인을 언제 누가 수정했으며, 왜 수정했는가?
- 지난 1000개의 리비전에서 특정 단위 테스트가 언제, 왜 작동을 멈췄는가?

다른 VCS도 존재하지만, **Git**이 버전 관리의 사실상 표준입니다. 이 [XKCD 만화](https://xkcd.com/1597/)는 Git의 평판을 완벽히 포착합니다:

![xkcd 1597](https://imgs.xkcd.com/comics/git.png)

Git의 인터페이스는 **누수가 있는 추상화**이기 때문에, Git을 하향식으로(인터페이스/커맨드라인부터 시작하여) 학습하면 많은 혼동이 생깁니다. 몇 가지 명령을 외워서 마법처럼 생각하고, 뭔가 잘못되면 위 만화처럼 대응하기 쉽습니다.

하지만 Git의 인터페이스가 못생겼어도, 그 기반이 되는 설계와 아이디어는 아름답습니다. 못생긴 인터페이스는 **외워야** 하지만, 아름다운 설계는 **이해할** 수 있습니다. 이 때문에 우리는 Git을 상향식으로 설명합니다. 데이터 모델부터 시작해서 나중에 커맨드라인 인터페이스를 다룹니다. 데이터 모델을 이해하면, 명령들이 기본 데이터 구조를 어떻게 조작하는지 훨씬 더 잘 이해할 수 있습니다.

# Git의 데이터 모델

Git의 진정한 우수성은 버전 관리의 모든 훌륭한 기능(이력 유지, 분기 지원, 협업 가능)을 실현하는 **잘 설계된 데이터 모델**에 있습니다.

## 스냅샷

Git은 최상위 디렉터리 내의 파일과 폴더 컬렉션의 이력을 일련의 스냅샷으로 모델링합니다. Git 용어에서:
- **파일**을 "**blob**"이라 하며, 이는 단순히 **바이트의 집합**입니다.
- **디렉터리**를 "**tree**"라 하며, 이는 **이름을 blob이나 tree에 매핑**합니다(따라서 디렉터리는 다른 디렉터리를 포함할 수 있습니다).
- **스냅샷**은 추적되는 **최상위 tree**입니다.

예를 들어, 다음과 같은 tree 구조를 생각해봅시다:

```
<root> (tree)
|
+- foo (tree)
|  |
|  + bar.txt (blob, contents = "hello world")
|
+- baz.txt (blob, contents = "git is wonderful")
```

최상위 tree는 두 개의 요소를 포함합니다: tree "foo"(자체적으로 blob "bar.txt" 하나를 포함)와 blob "baz.txt".

## 이력 모델링: 스냅샷 연결하기

VCS가 스냅샷을 어떻게 연결할까요? 단순한 방법은 선형 이력입니다. 이력이 시간 순서의 스냅샷 목록이 되는 것이죠. 하지만 여러 이유로 Git은 이렇게 단순하지 않습니다.

Git에서 이력은 스냅샷의 **방향성 비순환 그래프(DAG: Directed Acyclic Graph)**입니다. 수학 용어처럼 들릴 수 있지만 걱정하지 마세요. 의미는 단순합니다: Git의 각 스냅샷은 **"부모"라는 스냅샷 집합**을 가집니다(이전에 있던 스냅샷들). 단일 부모가 아니라 **부모의 집합**인 이유는, 한 스냅샷이 여러 부모로부터 올 수 있기 때문입니다(예: 두 개의 병렬 개발 분기를 병합할 때).

Git은 이런 스냅샷을 "**commit**"이라 부릅니다. 커밋 이력을 시각화하면 이렇게 보입니다:

```
o <-- o <-- o <-- o
            ^
             \
              --- o <-- o
```

위의 ASCII 아트에서 `o`는 개별 커밋(스냅샷)이고, 화살표는 각 커밋의 부모를 가리킵니다("이전에 왔다"는 관계). 세 번째 커밋 이후 이력은 두 개의 별도 분기로 나뉩니다. 예를 들어 두 개의 독립적인 기능이 병렬로 개발되는 것일 수 있습니다. 미래에 이 분기들을 병합(merge)해서 두 기능을 모두 포함하는 새로운 스냅샷을 만들 수 있으며, 그러면 이력이 다음과 같이 보입니다(새로 생성된 병합 커밋은 굵게 표시):

<pre class="highlight">
<code>
o <-- o <-- o <-- o <---- <strong>o</strong>
            ^            /
             \          v
              --- o <-- o
</code>
</pre>

Git의 커밋은 **불변(immutable)**입니다. 이것이 실수를 수정할 수 없다는 뜻은 아닙니다. 단지 커밋 이력에 대한 "편집"은 실제로는 **완전히 새로운 커밋을 생성**하고 참조를 새 커밋들을 가리키도록 업데이트하는 것일 뿐입니다.

## 데이터 모델, 의사 코드로

Git의 데이터 모델을 의사 코드로 표현하면:

```
// 파일은 바이트의 집합
type blob = array<byte>

// 디렉터리는 이름이 지정된 파일과 디렉터리를 포함
type tree = map<string, tree | blob>

// 커밋은 부모들, 메타데이터, 그리고 최상위 tree를 가짐
type commit = struct {
    parents: array<commit>
    author: string
    message: string
    snapshot: tree
}
```

이것이 이력의 깔끔하고 단순한 모델입니다.

## 객체와 콘텐츠 주소지정

"**객체**"는 blob, tree, 또는 commit입니다:

```
type object = blob | tree | commit
```

Git의 데이터 저장소에서 모든 객체는 그들의 [SHA-1 해시](https://en.wikipedia.org/wiki/SHA-1)로 **콘텐츠 주소지정**됩니다:

```
objects = map<string, object>

def store(object):
    id = sha1(object)
    objects[id] = object

def load(id):
    return objects[id]
```

Blob, tree, commit은 이런 식으로 통합됩니다: 모두 객체입니다. 다른 객체를 참조할 때, 그들을 실제로 **포함하지 않으면서** 그들의 해시로 **참조**합니다.

예를 들어, [위](#스냅샷)의 예제 디렉터리 구조를 위한 tree(`git cat-file -p 698281bc680d1995c5f4caaf3359721a5a58d48d`로 표시)는 다음처럼 보입니다:

```
100644 blob 4448adbf7ecd394f42ae135bbeed9676e894af85    baz.txt
040000 tree c68d233a33c5c06e0340e4c224f0afca87c8ce87    foo
```

이 tree는 그 내용을 가리키는 포인터를 포함합니다: blob "baz.txt"와 tree "foo". baz.txt의 해시(`git cat-file -p 4448adbf7ecd394f42ae135bbeed9676e894af85`)로 조회하면:

```
git is wonderful
```

## 참조

모든 스냅샷을 SHA-1 해시로 식별할 수 있습니다. 하지만 이건 불편합니다. 인간은 40자의 16진수 문자열을 기억하기 어렵거든요.

Git의 해결책은 SHA-1 해시에 **사람이 읽을 수 있는 이름**을 붙이는 것입니다. 이것을 "**참조(reference)**"라 합니다. 참조는 커밋을 가리키는 포인터입니다. 객체와 달리 불변인 것이 아니라, **참조는 변경 가능(mutable)**해서 새로운 커밋을 가리키도록 업데이트될 수 있습니다. 예를 들어 `master` 참조는 보통 개발 주 분기의 최신 커밋을 가리킵니다:

```
references = map<string, string>

def update_reference(name, id):
    references[name] = id

def read_reference(name):
    return references[name]

def load_reference(name_or_id):
    if name_or_id in references:
        return load(references[name_or_id])
    else:
        return load(name_or_id)
```

이제 Git은 긴 16진수 문자열 대신 "master" 같은 사람이 읽을 수 있는 이름으로 이력의 특정 스냅샷을 참조할 수 있습니다.

한 가지 중요한 세부사항은 우리가 종종 이력에서 "우리가 현재 어디 있는가"를 알아야 한다는 것입니다. 그래야 새로운 스냅샷을 만들 때 그것이 무엇과 관련이 있는지(커밋의 `parents` 필드를 어떻게 설정할지) 알 수 있습니다. Git에서 이 "현재 위치"는 "**HEAD**"라는 특수한 참조입니다.

## 저장소

마지막으로, Git **저장소**가 (대략) 무엇인지 정의할 수 있습니다: 그것은 `objects`와 `references` 데이터입니다.

디스크에서 Git이 저장하는 모든 것은 객체와 참조입니다. 이것이 Git 데이터 모델의 전부입니다. 모든 `git` 명령은 객체를 추가하고 참조를 추가/업데이트하는 방식으로 커밋 DAG를 어떻게든 조작합니다.

커맨드를 입력할 때마다, 그 명령이 기본 그래프 데이터 구조에 어떤 조작을 하는지 생각해보세요. 반대로, 커밋 DAG에 특정한 종류의 변경을 하고 싶다면(예: "미커밋 변경을 버리고 'master' 참조가 커밋 `5d83f9e`를 가리키도록 만들기"), 아마 그것을 할 명령이 있을 것입니다(예: `git checkout master; git reset --hard 5d83f9e`).

# 스테이징 영역

이것은 데이터 모델과는 직교하는 또 다른 개념이지만, 커밋을 생성하는 인터페이스의 일부입니다.

위에서 설명한 대로 스냅샷을 구현하는 한 가지 방법을 상상해봅시다. "스냅샷 생성" 명령이 있어서 **작업 디렉터리의 현재 상태**에 기반해 새로운 스냅샷을 만드는 것입니다. 일부 VCS가 이렇게 작동하지만, Git은 아닙니다. 우리는 깔끔한 스냅샷을 원하며, 현재 상태에서 스냅샷을 만드는 것이 항상 이상적이지는 않습니다.

예를 들어봅시다:
- 두 개의 별도 기능을 구현했고, 각각을 별도의 커밋으로 만들고 싶습니다. 첫 번째 커밋은 첫 번째 기능을, 두 번째는 두 번째 기능을 소개합니다.
- 또는 코드 전체에 디버깅 print 문을 추가했고, 동시에 버그 수정도 했습니다. 버그 수정만 커밋하고 print 문은 버리고 싶습니다.

Git은 "**스테이징 영역**"이라는 메커니즘으로 이런 시나리오를 지원합니다. 스테이징 영역을 통해 다음 스냅샷에 어떤 수정 사항을 포함할지 지정할 수 있습니다.

# Git 커맨드라인 인터페이스

정보 중복을 피하기 위해 여기서는 아래 명령들을 자세히 설명하지 않습니다. 매우 권장되는 [Pro Git](https://git-scm.com/book/en/v2)을 참조하거나 강의 영상을 시청하세요.

## 기본

- `git help <command>`: git 명령에 대한 도움 얻기
- `git init`: 새로운 git 저장소를 만듭니다. 데이터는 `.git` 디렉터리에 저장됩니다.
- `git status`: 현재 상태를 알려줍니다.
- `git add <filename>`: 파일을 스테이징 영역에 추가합니다.
- `git commit`: 새로운 커밋을 생성합니다.
    - [좋은 커밋 메시지](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)를 작성하세요!
    - [좋은 커밋 메시지를 작성하는 더 많은 이유](https://chris.beams.io/posts/git-commit/)!
- `git log`: 평탄한 형태의 이력 로그를 표시합니다.
- `git log --all --graph --decorate`: DAG로 이력을 시각화합니다.
- `git diff <filename>`: 스테이징 영역과 비교해 변경 사항을 표시합니다.
- `git diff <revision> <filename>`: 스냅샷들 사이의 파일 차이를 표시합니다.
- `git checkout <revision>`: HEAD를 업데이트합니다(분기를 checkout하는 경우 현재 분기도 함께).

## 분기와 병합

- `git branch`: 분기를 표시합니다.
- `git branch <name>`: 분기를 생성합니다.
- `git switch <name>`: 분기로 전환합니다.
- `git checkout -b <name>`: 분기를 생성하고 전환합니다.
    - `git branch <name>; git switch <name>`과 같습니다.
- `git merge <revision>`: 현재 분기로 병합합니다.
- `git mergetool`: 병합 충돌 해결을 위해 멋진 도구를 사용합니다.
- `git rebase`: 패치 집합을 새로운 base에 리베이스합니다.

## 원격

- `git remote`: 원격들을 나열합니다.
- `git remote add <name> <url>`: 원격을 추가합니다.
- `git push <remote> <local branch>:<remote branch>`: 객체를 원격으로 보내고 원격 참조를 업데이트합니다.
- `git branch --set-upstream-to=<remote>/<remote branch>`: 로컬 분기와 원격 분기 사이의 대응을 설정합니다.
- `git fetch`: 원격에서 객체/참조를 가져옵니다.
- `git pull`: `git fetch; git merge`와 동일합니다.
- `git clone`: 원격에서 저장소를 다운로드합니다.

## 취소

- `git commit --amend`: 커밋의 내용/메시지를 편집합니다.
- `git reset <file>`: 파일을 unstage합니다.
- `git restore`: 변경 사항을 버립니다.

# 고급 Git

- `git config`: Git은 [매우 커스터마이징 가능합니다](https://git-scm.com/docs/git-config)
- `git clone --depth=1`: shallow clone(전체 버전 이력 없음)
- `git add -p`: 대화형 스테이징
- `git rebase -i`: 대화형 리베이싱
- `git blame`: 각 라인을 마지막으로 수정한 사람을 표시합니다.
- `git stash`: 작업 디렉터리의 수정 사항을 임시로 제거합니다.
- `git bisect`: 이진 탐색으로 이력을 검색합니다(예: regression 찾기)
- `git revert`: 이전 커밋의 효과를 뒤집는 새로운 커밋을 생성합니다.
- `git worktree`: 동시에 여러 분기를 checkout합니다.
- `.gitignore`: [의도적으로 추적되지 않는 파일들을 지정](https://git-scm.com/docs/gitignore)합니다.

# 기타

- **GUI**: Git을 위한 많은 [GUI 클라이언트](https://git-scm.com/downloads/guis)가 있습니다. 우리는 개인적으로 커맨드라인 인터페이스를 대신 사용합니다.
- **셸 통합**: Git 상태를 셸 프롬프트의 일부로 갖는 것이 매우 편리합니다([zsh](https://github.com/olivierverdier/zsh-git-prompt), [bash](https://github.com/magicmonty/bash-git-prompt)). 종종 [Oh My Zsh](https://github.com/ohmyzsh/ohmyzsh) 같은 프레임워크에 포함됩니다.
- **에디터 통합**: 마찬가지로 많은 기능을 가진 편리한 통합들이 있습니다. [fugitive.vim](https://github.com/tpope/vim-fugitive)은 Vim의 표준입니다.
- **워크플로우**: 우리는 데이터 모델과 기본 명령들을 설명했지만, 대규모 프로젝트에서 따를 실무 관행은 설명하지 않았습니다. 여러 [다른](https://nvie.com/posts/a-successful-git-branching-model/) [접근](https://www.endoflineblog.com/gitflow-considered-harmful) [방식](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)들이 존재합니다.
- **GitHub**: Git은 GitHub가 아닙니다. GitHub는 다른 프로젝트에 코드를 기여하기 위한 특정 방식인 [pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests)를 가집니다.
- **다른 Git 제공자**: GitHub가 특별한 것은 아닙니다. [GitLab](https://about.gitlab.com/)이나 [BitBucket](https://bitbucket.org/) 같은 많은 Git 저장소 호스트들이 있습니다.

# 자료

- [Pro Git](https://git-scm.com/book/en/v2)은 **매우 권장되는 읽을거리입니다**. 1-5장을 읽으면 Git을 능숙하게 사용하는 데 필요한 대부분의 것을 배울 수 있습니다. 이제 데이터 모델을 이해했으니까요. 이후 장들은 흥미로운 고급 내용을 담고 있습니다.
- [Oh Shit, Git!?!](https://ohshitgit.com/)는 일반적인 Git 실수에서 복구하는 방법에 대한 짧은 가이드입니다.
- [Git for Computer Scientists](https://eagain.net/articles/git-for-computer-scientists/)는 Git의 데이터 모델에 대한 짧은 설명입니다. 이 강의 노트보다 의사 코드가 적고 멋진 다이어그램이 더 많습니다.
- [Git from the Bottom Up](https://jwiegley.github.io/git-from-the-bottom-up/)는 호기심 많은 사람들을 위한 Git 구현 세부 사항에 대한 상세 설명입니다. 데이터 모델뿐만 아니라 더 깊은 내용들을 다룹니다.
- [How to explain git in simple words](https://smusamashah.github.io/blog/2017/10/14/explain-git-in-simple-words)
- [Learn Git Branching](https://learngitbranching.js.org/)는 Git을 가르치는 브라우저 기반 게임입니다.

# 연습 문제

1. Git을 처음 배우신다면, [Pro Git](https://git-scm.com/book/en/v2)의 처음 몇 장을 읽거나 [Learn Git Branching](https://learngitbranching.js.org/) 같은 튜토리얼을 진행해보세요. 진행하면서 Git 명령들을 데이터 모델과 연결시켜 보세요.

2. [클래스 웹사이트 저장소](https://github.com/missing-semester/missing-semester)를 clone하세요.
    1. 버전 이력을 그래프로 시각화하여 탐색해보세요.
    2. `README.md`를 마지막으로 수정한 사람은 누구인가요? (힌트: `git log`를 인수와 함께 사용)
    3. `_config.yml`의 `collections:` 라인을 마지막으로 수정한 커밋 메시지는 무엇인가요? (힌트: `git blame`과 `git show` 사용)

3. Git을 배울 때 흔한 실수는 Git으로 관리되어야 하지 않는 큰 파일을 커밋하거나 민감한 정보를 추가하는 것입니다. 저장소에 파일을 추가하고, 몇 가지 커밋을 한 후, 최신 커밋만이 아니라 **이력에서** 그 파일을 완전히 제거해보세요. [이 가이드](https://help.github.com/articles/removing-sensitive-data-from-a-repository/)가 도움될 것입니다.

4. GitHub에서 어떤 저장소를 clone하고 기존 파일 중 하나를 수정하세요. `git stash`를 했을 때 무엇이 일어나나요? `git log --all --oneline`을 실행했을 때 뭐가 보이나요? `git stash pop`을 실행해서 `git stash`의 효과를 취소해보세요. 어떤 시나리오에서 이것이 유용할까요?

5. 많은 커맨드라인 도구들처럼 Git도 `~/.gitconfig`라는 구성 파일을 제공합니다. `git graph`를 실행했을 때 `git log --all --graph --decorate --oneline`의 출력을 얻도록 `~/.gitconfig`에 별칭을 만들어보세요. `~/.gitconfig` 파일을 직접 [편집](https://git-scm.com/docs/git-config#Documentation/git-config.txt-alias)하거나 `git config` 명령으로 별칭을 추가할 수 있습니다. Git 별칭에 대한 정보는 [여기](https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases)에서 찾을 수 있습니다.

6. `git config --global core.excludesfile ~/.gitignore_global`을 실행한 후 `~/.gitignore_global`에서 전역 무시 패턴을 정의할 수 있습니다. 이것은 Git이 사용할 전역 무시 파일의 위치를 설정하지만, 당신은 여전히 그 경로에 파일을 수동으로 만들어야 합니다. 전역 gitignore 파일을 설정해서 `.DS_Store` 같은 OS 특화 또는 에디터 특화 임시 파일들을 무시하도록 해보세요.

7. [클래스 웹사이트 저장소](https://github.com/missing-semester/missing-semester)를 fork하고, 오타나 다른 개선 사항을 찾아서 GitHub에서 pull request를 제출해보세요. [이 가이드](https://github.com/firstcontributions/first-contributions)가 도움될 것입니다. 유용한 PR만 제출해주세요(스팸은 금지!). 개선할 사항을 찾을 수 없다면 이 연습을 건너뛰어도 됩니다.

8. 협업 시나리오를 시뮬레이션해서 병합 충돌 해결을 연습해보세요:
    1. `git init`으로 새로운 저장소를 만들고 몇 줄을 포함한 `recipe.txt` 파일을 만드세요(예: 간단한 레시피).
    2. 이를 커밋한 후 두 개의 분기를 만드세요: `git branch salty`와 `git branch sweet`.
    3. `salty` 분기에서 라인을 수정하세요(예: "1 cup sugar"를 "1 cup salt"로) 그리고 커밋하세요.
    4. `sweet` 분기에서 같은 라인을 다르게 수정하세요(예: "1 cup sugar"를 "2 cups sugar"로) 그리고 커밋하세요.
    5. 이제 `master`로 전환하고 `git merge salty`를 시도한 후 `git merge sweet`를 시도해보세요. 무엇이 일어나나요? `recipe.txt`의 내용을 보세요 - `<<<<<<<`, `=======`, `>>>>>>>` 마커가 의미하는 것은 무엇인가요?
    6. 파일을 편집해서 원하는 내용을 유지하고, 충돌 마커를 제거한 후, `git add`와 `git commit`(또는 `git merge --continue`)으로 병합을 완료해서 충돌을 해결하세요. 또는 `git mergetool`을 사용해서 그래픽 또는 터미널 기반 병합 도구로 충돌을 해결해보세요.
    7. `git log --graph --oneline`을 사용해서 방금 생성한 병합 이력을 시각화하세요.
