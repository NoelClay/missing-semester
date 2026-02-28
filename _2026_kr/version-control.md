---
layout: lecture
title: "버전 관리와 Git"
description: >
  Git의 데이터 모델을 배우고, 버전 관리와 협업에 Git을 사용하는 방법을 배웁니다.
thumbnail: /static/assets/thumbnails/2026/lec5.png
date: 2026-01-16
ready: true
video:
  aspect: 56.25
  id: 9K8lB61dl3Y
---

버전 관리 시스템(VCS)은 소스 코드(또는 파일과 폴더의 다른 컬렉션)의 변경 사항을 추적하는 데 사용되는 도구들입니다. 이름이 암시하듯이, 이러한 도구들은 변경 이력을 유지하는 데 도움이 됩니다. 더 나아가, 협업을 용이하게 합니다. 논리적으로, VCS는 폴더와 그 내용에 대한 변경 사항을 일련의 _스냅샷_으로 추적합니다. 각 스냅샷은 최상위 디렉터리 내의 파일/폴더 전체 상태를 캡슐화합니다. VCS는 또한 각 스냅샷을 누가 만들었는지, 각 스냅샷과 관련된 메시지 등의 메타데이터를 유지합니다.

버전 관리가 유용한 이유는 무엇일까요? 혼자 작업할 때도 프로젝트의 이전 스냅샷을 볼 수 있고, 특정 변경이 왜 이루어졌는지에 대한 로그를 유지할 수 있으며, 개발의 여러 분기에서 작업할 수 있고, 훨씬 더 많은 것들을 할 수 있습니다. 다른 사람과 협업할 때는, 다른 사람이 어떤 변경을 했는지 확인하고, 동시 개발의 충돌을 해결하는 데 매우 유용한 도구입니다.

현대의 VCS는 또한 다음과 같은 질문에 쉽게(종종 자동으로) 답할 수 있게 해줍니다:

- 누가 이 모듈을 작성했는가?
- 이 파일의 특정 라인을 언제 누가 수정했는가? 왜 수정했는가?
- 지난 1000개의 리비전 동안, 특정 단위 테스트가 언제 그리고 왜 작동을 멈췄는가?

다른 VCS도 존재하지만, **Git**은 버전 관리의 사실상 표준입니다. 이 [XKCD 만화](https://xkcd.com/1597/)는 Git의 평판을 잘 보여줍니다:

![xkcd 1597](https://imgs.xkcd.com/comics/git.png)

Git의 인터페이스가 누수가 있는 추상화이기 때문에, Git을 하향식으로(인터페이스/명령줄 인터페이스부터 시작하여) 학습하면 많은 혼동이 발생할 수 있습니다. 몇 가지 명령을 외우고 그것들을 마법 주문처럼 생각한 다음, 뭔가 잘못되면 위의 만화처럼 따라하는 것이 가능합니다.

Git은 확실히 못생긴 인터페이스를 가지고 있지만, 그 기반이 되는 설계와 아이디어는 아름답습니다. 못생긴 인터페이스는 _암기해야_ 하지만, 아름다운 설계는 _이해할_ 수 있습니다. 이러한 이유로, 우리는 Git에 대한 상향식 설명을 제공하며, 데이터 모델부터 시작하여 나중에 명령줄 인터페이스를 다룹니다. 데이터 모델을 이해하면, 이들이 기본 데이터 모델을 어떻게 조작하는지 측면에서 명령들을 더 잘 이해할 수 있습니다.

# Git의 데이터 모델

Git의 독창성은 버전 관리의 모든 좋은 기능(이력 유지, 브랜치 지원, 협업 가능 등)을 가능하게 하는 잘 설계된 데이터 모델에 있습니다.

## 스냅샷

Git은 최상위 디렉터리 내의 파일과 폴더 컬렉션의 이력을 일련의 스냅샷으로 모델링합니다. Git 용어에서 파일을 "blob"이라고 하며, 그것은 단지 바이트의 덩어리입니다. 디렉터리를 "tree"라고 하며, 이것은 이름을 blob 또는 tree에 매핑합니다(따라서 디렉터리는 다른 디렉터리를 포함할 수 있습니다). 스냅샷은 추적되고 있는 최상위 tree입니다. 예를 들어, 우리는 다음과 같은 tree를 가질 수 있습니다:

```
<root> (tree)
|
+- foo (tree)
|  |
|  + bar.txt (blob, contents = "hello world")
|
+- baz.txt (blob, contents = "git is wonderful")
```

최상위 tree는 두 개의 요소를 포함합니다: tree "foo"(자체적으로 하나의 요소인 blob "bar.txt"를 포함함)와 blob "baz.txt".

## 이력 모델링: 스냅샷 연결하기

버전 관리 시스템은 어떻게 스냅샷을 연결할까요? 한 가지 간단한 모델은 선형 이력을 가지는 것입니다. 이력은 시간순 스냅샷의 목록이 될 것입니다. 여러 가지 이유로 Git은 이러한 단순한 모델을 사용하지 않습니다.

Git에서 이력은 스냅샷의 방향성 비순환 그래프(DAG)입니다. 이것이 멋진 수학 용어처럼 들릴 수 있지만, 겁먹지 마십시오. 이것이 의미하는 것은 Git의 각 스냅샷이 "부모" 스냅샷 집합(이전에 있었던 스냅샷)을 참조한다는 것입니다. 이것이 단일 부모(선형 이력의 경우)가 아니라 부모의 집합인 이유는 스냅샷이 여러 부모로부터 나올 수 있기 때문입니다. 예를 들어, 개발의 두 병렬 분기를 병합(merge)하기 때문입니다.

Git은 이러한 스냅샷들을 "commit"이라고 부릅니다. 커밋 이력을 시각화하면 다음과 같이 보일 수 있습니다:

```
o <-- o <-- o <-- o
            ^
             \
              --- o <-- o
```

위의 ASCII 아트에서, `o`들은 개별 커밋(스냅샷)에 해당합니다. 화살표는 각 커밋의 부모를 가리킵니다("이전에 온다"는 관계이지, "이후에 온다"는 아닙니다). 세 번째 커밋 이후, 이력은 두 개의 별개 분기로 나뉩니다. 이것은 예를 들어 두 개의 별개 기능이 서로 독립적으로 병렬로 개발되고 있는 경우에 해당할 수 있습니다. 미래에, 이러한 분기들은 병합되어 두 기능을 모두 포함하는 새로운 스냅샷을 만들 수 있으며, 다음과 같이 보이는 새로운 이력이 생성되며, 새로 만들어진 병합 커밋이 굵게 표시됩니다:

<pre class="highlight">
<code>
o <-- o <-- o <-- o <---- <strong>o</strong>
            ^            /
             \          v
              --- o <-- o
</code>
</pre>

Git의 커밋은 변경 불가능합니다. 이것이 실수를 수정할 수 없다는 의미는 아닙니다. 단지 커밋 이력에 대한 "편집"은 실제로 완전히 새로운 커밋을 생성하고, 참조(아래 참고)를 업데이트하여 새 커밋들을 가리킨다는 의미일 뿐입니다.

## 데이터 모델, 의사 코드로

Git의 데이터 모델을 의사 코드로 작성하면 도움이 될 수 있습니다:

```
// 파일은 바이트의 덩어리입니다
type blob = array<byte>

// 디렉터리는 이름이 붙은 파일과 디렉터리를 포함합니다
type tree = map<string, tree | blob>

// 커밋은 부모, 메타데이터, 최상위 tree를 가집니다
type commit = struct {
    parents: array<commit>
    author: string
    message: string
    snapshot: tree
}
```

이것은 깔끔하고 단순한 이력의 모델입니다.

## 객체와 콘텐츠 주소지정

"객체"는 blob, tree, 또는 commit입니다:

```
type object = blob | tree | commit
```

Git의 데이터 저장소에서, 모든 객체는 [SHA-1 해시](https://en.wikipedia.org/wiki/SHA-1)로 콘텐츠 주소지정됩니다.

```
objects = map<string, object>

def store(object):
    id = sha1(object)
    objects[id] = object

def load(id):
    return objects[id]
```

Blob, tree, 커밋은 이런 방식으로 통합됩니다: 모두 객체입니다. 다른 객체를 참조할 때, 실제로 디스크 상 표현에 _포함하지_ 않습니다. 대신 해시로 객체에 대한 참조를 갖습니다.

예를 들어, [위](#스냅샷)의 예제 디렉터리 구조를 위한 tree(`git cat-file -p 698281bc680d1995c5f4caaf3359721a5a58d48d`를 사용하여 시각화됨)는 다음과 같이 보입니다:

```
100644 blob 4448adbf7ecd394f42ae135bbeed9676e894af85    baz.txt
040000 tree c68d233a33c5c06e0340e4c224f0afca87c8ce87    foo
```

tree 자체는 그 내용에 대한 포인터를 포함합니다: `baz.txt`(blob)와 `foo`(tree). baz.txt에 해당하는 해시로 주소지정된 내용을 `git cat-file -p 4448adbf7ecd394f42ae135bbeed9676e894af85`로 보면, 다음을 얻습니다:

```
git is wonderful
```

## 참조

이제 모든 스냅샷을 SHA-1 해시로 식별할 수 있습니다. 이것은 불편합니다. 왜냐하면 인간은 40자의 16진수 문자열을 기억하는 데 좋지 않기 때문입니다.

Git이 이 문제에 대한 해결책은 SHA-1 해시에 대한 인간이 읽을 수 있는 이름("참조")입니다. 참조는 커밋에 대한 포인터입니다. 객체와 달리 불가변이지만, 참조는 가변입니다(새로운 커밋을 가리키도록 업데이트될 수 있습니다). 예를 들어, `master` 참조는 일반적으로 개발의 주 분기에서 최신 커밋을 가리킵니다.

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

이것으로, Git은 이력의 특정 스냅샷을 나타내기 위해 "master" 같은 인간이 읽을 수 있는 이름을 사용할 수 있으며, 긴 16진수 문자열 대신입니다.

한 가지 세부 사항은 우리가 종종 이력에서 "우리가 현재 어디에 있는가"라는 개념을 원한다는 것이므로, 새로운 스냅샷을 만들 때, 그것이 무엇과 관련이 있는지(커밋의 `parents` 필드를 어떻게 설정할지) 알 수 있습니다. Git에서, 이 "우리가 현재 어디에 있는가"는 "HEAD"라는 특수한 참조입니다.

## 저장소

마지막으로, 우리는 Git _저장소_가 (대략) 무엇인지 정의할 수 있습니다: 그것은 `objects`와 `references` 데이터입니다.

디스크에서, Git이 저장하는 모든 것은 객체와 참조입니다: 그것이 Git의 데이터 모델의 전부입니다. 모든 `git` 명령은 객체를 추가하고 참조를 추가/업데이트하여 커밋 DAG의 어떤 조작으로 매핑됩니다.

어떤 명령을 입력할 때든, 명령이 기본 그래프 데이터 구조에 어떤 조작을 하는지 생각해보세요. 반대로, 만약 당신이 커밋 DAG에 특정한 종류의 변경을 하고 싶다면(예: "미커밋된 변경을 버리고 'master' 참조를 커밋 `5d83f9e`를 가리키도록 만들기"), 아마도 그것을 하는 명령이 있을 겁니다(예: 이 경우, `git checkout master; git reset --hard 5d83f9e`).

# 스테이징 영역

이것은 데이터 모델과 직교하는 또 다른 개념이지만, 커밋을 생성하는 인터페이스의 일부입니다.

당신이 위에서 설명한 대로 스냅샷을 구현하는 방식을 상상하는 한 가지 방법은 "스냅샷 생성" 명령을 가지는 것이며, 이는 작업 디렉터리의 _현재 상태_에 기반하여 새로운 스냅샷을 생성합니다. 일부 버전 관리 도구는 이런 식으로 작동하지만, Git은 그렇지 않습니다. 우리는 깔끔한 스냅샷을 원하며, 현재 상태에서 스냅샷을 만드는 것이 항상 이상적이지는 않을 수 있습니다. 예를 들어, 두 개의 별개 기능을 구현했고, 첫 번째는 첫 번째 기능을 도입하고, 다음은 두 번째 기능을 도입하는 두 개의 별개 커밋을 생성하고 싶은 시나리오를 상상해 보세요. 또는 당신의 코드 전체에 디버깅 인쇄 문이 추가되어 있고, 버그 수정이 있는 시나리오를 상상해 보세요. 당신은 버그 수정을 커밋하면서 모든 인쇄 문을 버리고 싶습니다.

Git은 "스테이징 영역"이라는 메커니즘을 통해 다음 스냅샷에 어떤 수정 사항을 포함할지 지정할 수 있게 하여 이러한 시나리오를 수용합니다.

# Git 명령줄 인터페이스

정보 중복을 피하기 위해, 우리는 이 강의 노트에서 아래 명령들을 자세히 설명하지 않겠습니다. 매우 권장되는 [Pro Git](https://git-scm.com/book/en/v2)을 참조하거나, 강의 영상을 시청하세요.

## 기본

- `git help <command>`: git 명령에 대한 도움말 얻기
- `git init`: 새로운 git 저장소를 생성합니다. 데이터는 `.git` 디렉터리에 저장됩니다.
- `git status`: 무엇이 일어나고 있는지 알려줍니다.
- `git add <filename>`: 파일을 스테이징 영역에 추가합니다.
- `git commit`: 새로운 커밋을 생성합니다.
    - [좋은 커밋 메시지](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)를 작성하세요!
    - [좋은 커밋 메시지](https://chris.beams.io/posts/git-commit/)를 쓰는 더 많은 이유들!
- `git log`: 평탄한 이력의 로그를 표시합니다.
- `git log --all --graph --decorate`: DAG로 이력을 시각화합니다.
- `git diff <filename>`: 스테이징 영역과 비교하여 한 변경 사항을 표시합니다.
- `git diff <revision> <filename>`: 스냅샷 간 파일의 차이를 표시합니다.
- `git checkout <revision>`: HEAD를 업데이트합니다(브랜치를 체크아웃하는 경우 현재 브랜치도).

## 브랜칭과 병합

- `git branch`: 브랜치를 표시합니다.
- `git branch <name>`: 브랜치를 생성합니다.
- `git switch <name>`: 브랜치로 전환합니다.
- `git checkout -b <name>`: 브랜치를 생성하고 전환합니다.
    - `git branch <name>; git switch <name>`과 동일합니다.
- `git merge <revision>`: 현재 브랜치에 병합합니다.
- `git mergetool`: 병합 충돌을 해결하기 위해 멋진 도구를 사용합니다.
- `git rebase`: 패치 집합을 새로운 베이스에 리베이스합니다.

## 원격

- `git remote`: 원격을 나열합니다.
- `git remote add <name> <url>`: 원격을 추가합니다.
- `git push <remote> <local branch>:<remote branch>`: 원격으로 객체를 보내고 원격 참조를 업데이트합니다.
- `git branch --set-upstream-to=<remote>/<remote branch>`: 로컬 브랜치와 원격 브랜치 간 대응 관계를 설정합니다.
- `git fetch`: 원격에서 객체/참조를 가져옵니다.
- `git pull`: `git fetch; git merge`와 동일합니다.
- `git clone`: 원격에서 저장소를 다운로드합니다.

## 실행 취소

- `git commit --amend`: 커밋의 내용/메시지를 편집합니다.
- `git reset <file>`: 파일을 언스테이징합니다.
- `git restore`: 변경 사항을 버립니다.

# 고급 Git

- `git config`: Git은 [매우 커스터마이징 가능합니다](https://git-scm.com/docs/git-config).
- `git clone --depth=1`: 얕은 클론(전체 버전 이력 없음).
- `git add -p`: 대화형 스테이징.
- `git rebase -i`: 대화형 리베이싱.
- `git blame`: 마지막으로 각 라인을 수정한 사람을 표시합니다.
- `git stash`: 작업 디렉터리의 수정 사항을 임시로 제거합니다.
- `git bisect`: 이진 탐색 이력(예: 회귀에 대해).
- `git revert`: 이전 커밋의 효과를 뒤집는 새로운 커밋을 생성합니다.
- `git worktree`: 동시에 여러 브랜치를 체크아웃합니다.
- `.gitignore`: [의도적으로 추적되지 않는 파일을 무시하도록 지정](https://git-scm.com/docs/gitignore).

# 기타

- **GUI**: Git을 위한 많은 [GUI 클라이언트](https://git-scm.com/downloads/guis)들이 있습니다. 우리는 개인적으로 그것들을 사용하지 않고 명령줄 인터페이스를 대신 사용합니다.
- **셸 통합**: Git 상태를 셸 프롬프트의 일부로 가지는 것이 매우 편리합니다([zsh](https://github.com/olivierverdier/zsh-git-prompt), [bash](https://github.com/magicmonty/bash-git-prompt)). 종종 [Oh My Zsh](https://github.com/ohmyzsh/ohmyzsh)와 같은 프레임워크에 포함됩니다.
- **에디터 통합**: 위와 유사하게, 많은 기능을 가진 편리한 통합입니다. [fugitive.vim](https://github.com/tpope/vim-fugitive)은 Vim의 표준입니다.
- **워크플로우**: 우리는 데이터 모델과 몇 가지 기본 명령들을 알려드렸습니다. 큰 프로젝트에서 작업할 때 따라야 할 수련들은 알려드리지 않았습니다([많은](https://nvie.com/posts/a-successful-git-branching-model/) [다른](https://www.endoflineblog.com/gitflow-considered-harmful) [접근방식](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)들이 있습니다).
- **GitHub**: Git은 GitHub가 아닙니다. GitHub는 다른 프로젝트에 코드를 기여하는 특정한 방식인 [pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests)를 가지고 있습니다.
- **기타 Git 제공자**: GitHub는 특별하지 않습니다: [GitLab](https://about.gitlab.com/) 및 [BitBucket](https://bitbucket.org/)과 같은 많은 Git 저장소 호스트들이 있습니다.

# 자료

- [Pro Git](https://git-scm.com/book/en/v2)은 **매우 권장되는 읽을거리입니다**. 1-5장을 통해 진행하면 Git을 능숙하게 사용하는 데 필요한 대부분의 것을 배울 수 있습니다. 이제 데이터 모델을 이해했으니까요. 이후 장들은 흥미로운 고급 자료를 가지고 있습니다.
- [Oh Shit, Git!?!](https://ohshitgit.com/)는 일반적인 Git 실수에서 복구하는 방법에 대한 짧은 가이드입니다.
- [Git for Computer Scientists](https://eagain.net/articles/git-for-computer-scientists/)는 Git의 데이터 모델에 대한 짧은 설명입니다. 이 강의 노트보다 의사 코드가 적고 멋진 다이어그램이 더 많습니다.
- [Git from the Bottom Up](https://jwiegley.github.io/git-from-the-bottom-up/)는 호기심 있는 사람들을 위해 데이터 모델뿐만 아니라 Git의 구현 세부 사항에 대한 자세한 설명입니다.
- [How to explain git in simple words](https://smusamashah.github.io/blog/2017/10/14/explain-git-in-simple-words)
- [Learn Git Branching](https://learngitbranching.js.org/)는 Git을 가르치는 브라우저 기반 게임입니다.

# 연습

1. Git 경험이 없다면, [Pro Git](https://git-scm.com/book/en/v2)의 처음 몇 장을 읽거나 [Learn Git Branching](https://learngitbranching.js.org/)과 같은 튜토리얼을 진행해 보세요. 진행하면서 Git 명령들을 데이터 모델과 연결시켜 보세요.
1. [클래스 웹사이트의 저장소](https://github.com/missing-semester/missing-semester)를 클론하세요.
    1. 버전 이력을 그래프로 시각화하여 탐색합니다.
    1. `README.md`를 마지막으로 수정한 사람은 누구인가요? (힌트: `git log`를 인수와 함께 사용하세요).
    1. `_config.yml`의 `collections:` 라인을 마지막으로 수정한 커밋 메시지는 무엇인가요? (힌트: `git blame`과 `git show`를 사용하세요).
1. Git을 배울 때의 일반적인 실수는 Git으로 관리되어야 하지 않는 큰 파일을 커밋하거나 민감한 정보를 추가하는 것입니다. 저장소에 파일을 추가하고, 몇 가지 커밋을 한 다음, _이력_에서(최신 커밋만이 아니라) 그 파일을 삭제해 보세요. [이것](https://help.github.com/articles/removing-sensitive-data-from-a-repository/)을 보고 싶을 수도 있습니다.
1. GitHub에서 어떤 저장소를 클론하고, 기존 파일 중 하나를 수정하세요. `git stash`를 할 때 무엇이 일어나나요? `git log --all --oneline`을 실행할 때 뭘 보나요? `git stash pop`을 실행하여 `git stash`로 했던 것을 취소하세요. 어떤 시나리오에서 이것이 유용할까요?
1. 많은 명령줄 도구들처럼, Git은 `~/.gitconfig`라는 구성 파일(또는 dotfile)을 제공합니다. `git graph`를 실행할 때 `git log --all --graph --decorate --oneline`의 출력을 얻도록 `~/.gitconfig`에 별칭을 만드세요. 이것을 `~/.gitconfig` 파일을 직접 [편집](https://git-scm.com/docs/git-config#Documentation/git-config.txt-alias)하거나 `git config` 명령을 사용하여 별칭을 추가함으로써 할 수 있습니다. git 별칭에 대한 정보는 [여기](https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases)에서 찾을 수 있습니다.
1. `git config --global core.excludesfile ~/.gitignore_global`을 실행한 후 `~/.gitignore_global`에서 전역 무시 패턴을 정의할 수 있습니다. 이것은 Git이 사용할 전역 무시 파일의 위치를 설정하지만, 당신은 여전히 그 경로에 파일을 수동으로 만들어야 합니다. 전역 gitignore 파일을 설정하여 `.DS_Store`와 같은 OS 특화 또는 에디터 특화 임시 파일들을 무시하세요.
1. [클래스 웹사이트의 저장소](https://github.com/missing-semester/missing-semester)를 포크하고, 오타나 다른 개선 사항을 찾아서 GitHub에서 pull request를 제출하세요([이것](https://github.com/firstcontributions/first-contributions)을 보고 싶을 수도 있습니다). 유용한 PR만 제출해 주세요(스팸을 보내지 마세요!). 개선할 사항을 찾을 수 없다면, 이 연습을 건너뛸 수 있습니다.
1. 협업 시나리오를 시뮬레이션하여 병합 충돌 해결을 연습하세요:
    1. `git init`으로 새로운 저장소를 생성하고 몇 가지 라인을 포함한 `recipe.txt`라는 파일을 생성하세요(예: 간단한 레시피).
    1. 이것을 커밋한 다음 두 개의 브랜치를 생성하세요: `git branch salty`과 `git branch sweet`.
    1. `salty` 브랜치에서, 라인을 수정하고(예: "1 cup sugar"를 "1 cup salt"로 변경) 커밋하세요.
    1. `sweet` 브랜치에서, 같은 라인을 다르게 수정하고(예: "1 cup sugar"를 "2 cups sugar"로 변경) 커밋하세요.
    1. 이제 `master`로 전환하고 `git merge salty`를 시도한 다음, `git merge sweet`를 시도하세요. 무엇이 일어나나요? `recipe.txt`의 내용을 보세요 - `<<<<<<<`, `=======`, `>>>>>>>` 마크들이 의미하는 것은 무엇인가요?
    1. 파일을 편집하여 원하는 내용을 유지하고, 충돌 마크들을 제거하고, `git add`와 `git commit`(또는 `git merge --continue`)으로 병합을 완료함으로써 충돌을 해결하세요. 또는 `git mergetool`을 사용하여 그래픽 또는 터미널 기반 병합 도구로 충돌을 해결해 보세요.
    1. `git log --graph --oneline`을 사용하여 방금 생성한 병합 이력을 시각화하세요.
