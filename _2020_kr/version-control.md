---
layout: lecture
permalink: /2020/kr/version-control/
title: "버전 관리 (Git)"
description: >
  Git의 데이터 모델과 버전 관리 및 협업을 위해 Git을 사용하는 방법을 배웁니다.
thumbnail: /static/assets/thumbnails/2020/lec6.png
date: 2020-01-22
ready: true
video:
  aspect: 56.25
  id: kr_lec6_2020
---

버전 관리 시스템(Version Control Systems, VCS)은 소스 코드(또는 다른 파일 및 폴더 모음)의 변경 사항을 추적하는 데 사용되는 도구이다. 이름에서 알 수 있듯이, 이러한 도구는 변경 이력을 유지하는 데 도움을 주며 더 나아가 협업을 원활하게 해준다. VCS는 폴더와 그 내용을 일련의 스냅샷(snapshots)으로 추적하며, 각 스냅샷은 최상위 디렉토리 내의 파일/폴더의 전체 상태를 캡슐화한다. 또한 VCS는 누가 각 스냅샷을 생성했는지, 스냅샷과 관련된 메시지 등과 같은 메타데이터도 함께 관리한다.

버전 관리는 왜 유용할까? 혼자 작업할 때도 프로젝트의 과거 스냅샷을 살펴보고, 특정 변경이 왜 이루어졌는지 로그를 유지하며, 병렬적으로 개발 브랜치를 운영하는 등 많은 일을 할 수 있게 해준다. 다른 사람과 함께 작업할 때는 다른 사람이 무엇을 변경했는지 확인하고 동시 개발 중에 발생하는 충돌(conflicts)을 해결하는 데 없어서는 안 될 도구이다.

현대적인 VCS를 사용하면 다음과 같은 질문에 쉽고 (종종 자동으로) 답할 수 있다.

- 이 모듈은 누가 작성했는가?
- 이 파일의 특정 라인은 언제, 누구에 의해, 왜 수정되었는가?
- 지난 1000번의 리비전 중에서 특정 유닛 테스트가 언제, 왜 실패하기 시작했는가?

다른 VCS들도 존재하지만, 현재 **Git**은 버전 관리의 사실상 표준(de facto standard)이다. 이 [XKCD 만화](https://xkcd.com/1597/)는 Git의 평판을 잘 보여준다.

![xkcd 1597](https://imgs.xkcd.com/comics/git.png)

Git의 인터페이스는 추상화가 완벽하지 않아서(leaky abstraction), Git을 하향식(top-down, 인터페이스/CLI부터 시작)으로 배우면 많은 혼란을 겪을 수 있다. 몇 가지 명령어를 암기하여 마법의 주문처럼 생각하고, 무언가 잘못될 때마다 위 만화와 같은 방식을 따를 수도 있을 것이다.

Git의 인터페이스가 다소 투박하다는 점은 인정하지만, 그 이면에 깔린 설계와 아이디어는 매우 아름답다. 투박한 인터페이스는 **암기**해야 하지만, 아름다운 설계는 **이해**할 수 있다. 이러한 이유로 우리는 Git의 데이터 모델부터 시작하여 나중에 커맨드 라인 인터페이스를 다루는 상향식(bottom-up) 설명을 제공할 것이다. 데이터 모델을 이해하고 나면, 명령어들이 기반 데이터 모델을 어떻게 조작하는지의 관점에서 훨씬 더 잘 이해될 것이다.

# Git의 데이터 모델 (Git's data model)

버전 관리를 위해 취할 수 있는 여러 임시방편적인 접근법들이 있겠지만, Git은 이력 유지, 브랜치 지원, 협업 가능 등 버전 관리의 모든 멋진 기능들을 가능하게 하는 잘 짜인 모델을 가지고 있다.

## 스냅샷 (Snapshots)

Git은 특정 최상위 디렉토리 내의 파일 및 폴더 모음의 이력을 일련의 스냅샷으로 모델링한다. Git 용어로 파일은 **블롭(blob)**이라고 불리며, 이는 단순히 바이트 덩어리이다. 디렉토리는 **트리(tree)**라고 불리며, 이름과 블롭 또는 다른 트리를 매핑한다(따라서 디렉토리는 다른 디렉토리를 포함할 수 있다). 스냅샷은 추적 중인 최상위 트리이다. 예를 들어 다음과 같은 구조의 트리가 있을 수 있다.

```
<root> (tree)
|
+- foo (tree)
|  |
|  + bar.txt (blob, contents = "hello world")
|
+- baz.txt (blob, contents = "git is wonderful")
```

최상위 트리는 "foo"라는 트리(그 안에 "bar.txt"라는 블롭을 포함함)와 "baz.txt"라는 블롭, 두 요소를 포함한다.

## 이력 모델링: 스냅샷 간의 관계 (Modeling history: relating snapshots)

버전 관리 시스템은 스냅샷들을 어떻게 연결해야 할까? 한 가지 간단한 모델은 선형적인 이력을 갖는 것이다. 이력은 시간 순서대로 정렬된 스냅샷 목록이 될 것이다. 하지만 여러 이유로 Git은 이와 같이 단순한 모델을 사용하지 않는다.

Git에서 이력은 스냅샷들의 **유향 비순환 그래프(Directed Acyclic Graph, DAG)**이다. 수학 용어처럼 들리겠지만 겁먹을 필요 없다. 이는 단순히 Git의 각 스냅샷이 자신보다 먼저 존재했던 스냅샷들인 일련의 "부모(parents)"를 참조한다는 의미일 뿐이다. (선형 이력처럼) 단일 부모가 아니라 부모의 **집합**인 이유는, 예를 들어 두 개의 병렬 개발 브랜치를 합치는(merging) 등의 이유로 하나의 스냅샷이 여러 부모로부터 내려올 수 있기 때문이다.

Git은 이러한 스냅샷들을 **커밋(commit)**이라고 부른다. 커밋 이력을 시각화하면 다음과 같을 것이다.

```
o <-- o <-- o <-- o
            ^
             \
              --- o <-- o
```

위의 ASCII 아트에서 `o`는 개별 커밋(스냅샷)에 해당한다. 화살표는 각 커밋의 부모를 가리킨다 (이후가 아닌 이전을 가리키는 관계임에 유의하라). 세 번째 커밋 이후 이력은 두 개의 개별 브랜치로 나뉜다. 이는 예를 들어 서로 독립적으로 병렬 개발되는 두 개의 개별 기능을 나타낼 수 있다. 나중에 이 브랜치들은 두 기능을 모두 포함하는 새로운 스냅샷을 만들기 위해 머지(merge)될 수 있으며, 새로 생성된 머지 커밋을 굵게 표시하면 다음과 같은 이력이 만들어진다.

<pre class="highlight">
<code>
o <-- o <-- o <-- o <---- <strong>o</strong>
            ^            /
             \          v
              --- o <-- o
</code>
</pre>

Git의 커밋은 불변(immutable)이다. 그렇다고 실수를 수정할 수 없다는 뜻은 아니다. 커밋 이력을 "수정"한다는 것은 사실 완전히 새로운 커밋을 생성하고, 참조(아래 참조)가 새 커밋을 가리키도록 업데이트하는 과정을 의미한다.

## 의사코드로 본 데이터 모델 (Data model, as pseudocode)

Git의 데이터 모델을 의사코드로 작성해 보는 것이 도움이 될 수 있다.

```
// 파일은 바이트 배열이다
type blob = array<byte>

// 디렉토리는 이름이 있는 파일과 디렉토리를 포함한다
type tree = map<string, tree | blob>

// 커밋은 부모들, 메타데이터, 그리고 최상위 트리를 갖는다
type commit = struct {
    parents: array<commit>
    author: string
    message: string
    snapshot: tree
}
```

이것이 이력을 모델링하는 깨끗하고 단순한 모델이다.

## 객체와 콘텐츠 주소 지정 (Objects and content-addressing)

"객체(object)"는 블롭, 트리, 또는 커밋이다.

```
type object = blob | tree | commit
```

Git 데이터 저장소에서 모든 객체는 자신의 [SHA-1 해시(hash)](https://en.wikipedia.org/wiki/SHA-1)값으로 콘텐츠 주소가 지정(content-addressed)된다.

```
objects = map<string, object>

def store(object):
    id = sha1(object)
    objects[id] = object

def load(id):
    return objects[id]
```

블롭, 트리, 커밋은 이런 방식으로 통합된다. 즉, 모두 객체이다. 다른 객체를 참조할 때 디스크 상의 표현에 실제로 객체를 **포함**하는 것이 아니라, 해시값을 통해 참조를 갖는다.

예를 들어 위에서 보았던 [예시 디렉토리 구조](#snapshots)의 트리(`git cat-file -p 698281bc680d1995c5f4caaf3359721a5a58d48d`로 시각화)는 다음과 같다.

```
100644 blob 4448adbf7ecd394f42ae135bbeed9676e894af85    baz.txt
040000 tree c68d233a33c5c06e0340e4c224f0afca87c8ce87    foo
```

트리 자체는 그 내용물인 `baz.txt`(블롭)와 `foo`(트리)에 대한 포인터를 포함하고 있다. `git cat-file -p 4448adbf7ecd394f42ae135bbeed9676e894af85` 명령어로 `baz.txt`에 해당하는 해시 주소의 내용을 확인하면 다음과 같은 결과를 얻는다.

```
git is wonderful
```

## 참조 (References)

이제 모든 스냅샷은 SHA-1 해시값으로 식별될 수 있다. 하지만 인간은 40자리의 16진수 문자열을 기억하는 데 서툴기 때문에 이는 불편하다.

이 문제에 대한 Git의 해결책은 SHA-1 해시에 대해 인간이 읽을 수 있는 이름인 **참조(references)**를 사용하는 것이다. 참조는 커밋을 가리키는 포인터이다. 불변인 객체와 달리 참조는 가변(mutable)이다(새로운 커밋을 가리키도록 업데이트될 수 있다). 예를 들어 `master` 참조는 보통 주 개발 브랜치의 최신 커밋을 가리킨다.

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

이를 통해 Git은 긴 16진수 문자열 대신 "master"와 같이 인간이 읽을 수 있는 이름을 사용하여 이력 내의 특정 스냅샷을 참조할 수 있다.

한 가지 세부 사항은 우리가 종종 이력 내에서 "현재 우리가 어디에 있는지"에 대한 개념을 원한다는 점이다. 그래야 새로운 스냅샷을 찍을 때 그것이 무엇을 기준으로 하는지(커밋의 `parents` 필드를 어떻게 설정할지) 알 수 있기 때문이다. Git에서 "현재 우리가 있는 곳"은 **HEAD**라고 불리는 특수한 참조이다.

## 저장소 (Repositories)

마지막으로 Git **저장소(repository)**가 (대략적으로) 무엇인지 정의할 수 있다. 저장소는 데이터인 `objects`와 `references`의 모음이다.

디스크 상에서 Git이 저장하는 전부는 객체와 참조이다. 이것이 Git 데이터 모델의 전부이다. 모든 `git` 명령어는 객체를 추가하고 참조를 추가/업데이트함으로써 커밋 DAG를 조작하는 행위로 매핑된다.

어떤 명령어를 입력하든, 해당 명령어가 기반이 되는 그래프 데이터 구조를 어떻게 조작하는지 생각해 보라. 반대로 커밋 DAG에 특정 종류의 변경을 가하고 싶다면(예: "커밋되지 않은 변경 사항을 버리고 'master' 참조가 `5d83f9e` 커밋을 가리키게 하라"), 이를 수행하는 명령어가 분명 존재할 것이다 (이 경우 `git checkout master; git reset --hard 5d83f9e`).

# 스테이징 영역 (Staging area)

이는 데이터 모델과는 독립적인 개념이지만, 커밋을 생성하기 위한 인터페이스의 일부이다.

위에서 설명한 스냅샷 기능을 구현하는 한 가지 방법으로 작업 디렉토리의 **현재 상태**를 기반으로 새로운 스냅샷을 생성하는 "스냅샷 생성" 명령어를 상상해 볼 수 있다. 일부 버전 관리 도구들은 이렇게 작동하지만, Git은 그렇지 않다. 우리는 깨끗한 스냅샷을 원하며, 현재 상태에서 스냅샷을 찍는 것이 항상 이상적이지는 않기 때문이다. 예를 들어 두 개의 개별 기능을 구현했고 두 개의 개별 커밋으로 나누어 생성하고 싶은 상황을 가정해 보자. 혹은 버그 수정 코드와 함께 코드 곳곳에 디버깅용 print 문을 추가한 상황을 가정해 보자. 여러분은 print 문은 버리고 버그 수정 사항만 커밋하고 싶을 것이다.

Git은 **스테이징 영역(staging area)**이라는 메커니즘을 통해 다음 스냅샷에 포함될 수정 사항들을 지정할 수 있게 함으로써 이러한 시나리오들을 지원한다.

# Git 커맨드 라인 인터페이스 (Git command-line interface)

정보의 중복을 피하기 위해 아래 명령어들에 대해 자세히 설명하지는 않겠다. 더 많은 정보를 원한다면 강력히 추천하는 [Pro Git](https://git-scm.com/book/en/v2)을 읽어보거나 강의 비디오를 시청하라.

## 기초 (Basics)

- `git help <command>`: git 명령어에 대한 도움말 확인
- `git init`: 새로운 git 저장소 생성, 데이터는 `.git` 디렉토리에 저장됨
- `git status`: 현재 상태 확인
- `git add <filename>`: 파일을 스테이징 영역에 추가
- `git commit`: 새로운 커밋 생성
    - [좋은 커밋 메시지](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)를 작성하라!
    - 좋은 커밋 메시지를 작성해야 하는 [더 많은 이유](https://chris.beams.io/posts/git-commit/)들!
- `git log`: 평면화된 이력 로그 표시
- `git log --all --graph --decorate`: 이력을 DAG 형태로 시각화
- `git diff <filename>`: 스테이징 영역과 비교하여 변경 사항 표시
- `git diff <revision> <filename>`: 두 스냅샷 간의 파일 차이점 표시
- `git checkout <revision>`: HEAD 및 현재 브랜치 업데이트

## 브랜치 및 머지 (Branching and merging)

- `git branch`: 브랜치 목록 표시
- `git branch <name>`: 브랜치 생성
- `git checkout -b <name>`: 브랜치 생성 및 해당 브랜치로 전환
    - `git branch <name>; git checkout <name>`과 동일
- `git merge <revision>`: 현재 브랜치에 머지
- `git mergetool`: 머지 충돌 해결을 돕는 도구 사용
- `git rebase`: 일련의 패치들을 새로운 베이스(base) 위로 재배치

## 원격 저장소 (Remotes)

- `git remote`: 원격 저장소 목록 표시
- `git remote add <name> <url>`: 원격 저장소 추가
- `git push <remote> <local branch>:<remote branch>`: 객체들을 원격으로 보내고 원격 참조 업데이트
- `git branch --set-upstream-to=<remote>/<remote branch>`: 로컬 브랜치와 원격 브랜치 간의 대응 관계 설정
- `git fetch`: 원격 저장소로부터 객체/참조 가져오기
- `git pull`: `git fetch; git merge`와 동일
- `git clone`: 원격 저장소 다운로드

## 되돌리기 (Undo)

- `git commit --amend`: 커밋 내용/메시지 수정
- `git reset HEAD <file>`: 파일 스테이징 취소
- `git checkout -- <file>`: 변경 사항 폐기

# 고급 Git (Advanced Git)

- `git config`: Git은 [고도로 커스터마이징 가능함](https://git-scm.com/docs/git-config)
- `git clone --depth=1`: 전체 이력 없이 얕은 복제(shallow clone) 수행
- `git add -p`: 대화형 스테이징
- `git rebase -i`: 대화형 리베이스
- `git blame`: 각 라인을 마지막으로 수정한 사람이 누구인지 표시
- `git stash`: 작업 디렉토리의 변경 사항을 임시로 저장
- `git bisect`: 이력을 이진 탐색하여 버그가 발생한 지점 찾기
- `.gitignore`: 의도적으로 추적하지 않을 파일들을 [지정](https://git-scm.com/docs/gitignore)

# 기타 사항 (Miscellaneous)

- **GUI**: Git을 위한 많은 [GUI 클라이언트](https://git-scm.com/downloads/guis)가 존재한다. 우리는 개인적으로 사용하지 않으며 커맨드 라인 인터페이스를 사용한다.
- **쉘 통합**: 쉘 프롬프트의 일부로 Git 상태를 표시하는 것은 매우 편리하다 ([zsh](https://github.com/olivierverdier/zsh-git-prompt), [bash](https://github.com/magicmonty/bash-git-prompt)). [Oh My Zsh](https://github.com/ohmyzsh/ohmyzsh)와 같은 프레임워크에 자주 포함되어 있다.
- **에디터 통합**: 위와 마찬가지로 편리한 기능들이 많다. Vim의 경우 [fugitive.vim](https://github.com/tpope/vim-fugitive)이 표준이다.
- **워크플로우**: 우리는 데이터 모델과 기초 명령어를 가르쳤을 뿐, 큰 프로젝트에서 작업할 때 따라야 할 관행에 대해서는 말하지 않았다 (거기에는 [많은](https://nvie.com/posts/a-successful-git-branching-model/) [서로 다른](https://www.endoflineblog.com/gitflow-considered-harmful) [접근법](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)들이 있다).
- **GitHub**: Git은 GitHub이 아니다. GitHub은 다른 프로젝트에 코드를 기여하기 위한 [풀 리퀘스트(pull requests)](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests)라는 특정한 방식을 가지고 있다.
- **다른 Git 제공자**: GitHub만 특별한 것은 아니다. [GitLab](https://about.gitlab.com/)이나 [BitBucket](https://bitbucket.org/)과 같이 많은 Git 저장소 호스트들이 있다.

# 리소스 (Resources)

- [Pro Git](https://git-scm.com/book/en/v2)은 **강력히 추천하는 필독서**이다. 1장부터 5장까지 읽으면 데이터 모델을 이해한 상태에서 Git을 숙련되게 사용하는 데 필요한 대부분의 내용을 배울 수 있다. 뒷부분의 장들은 흥미로운 고급 주제들을 다룬다.
- [Oh Shit, Git!?!](https://ohshitgit.com/)은 흔한 Git 실수들을 복구하는 법에 대한 짧은 가이드이다.
- [Git for Computer Scientists](https://eagain.net/articles/git-for-computer-scientists/)는 Git 데이터 모델에 대한 짧은 설명으로, 본 강의 노트보다 의사코드는 적고 화려한 다이어그램이 더 많다.
- [Git from the Bottom Up](https://jwiegley.github.io/git-from-the-bottom-up/)은 궁금한 이들을 위해 데이터 모델을 넘어선 Git의 구현 세부 사항을 상세히 설명한다.
- [How to explain git in simple words](https://smusamashah.github.io/blog/2017/10/14/explain-git-in-simple-words)
- [Learn Git Branching](https://learngitbranching.js.org/)은 Git을 배우기 위한 브라우저 기반 게임이다.

# 연습 문제 (Exercises)

1. Git 사용 경험이 없다면 [Pro Git](https://git-scm.com/book/en/v2)의 앞부분 몇 개 장을 읽어보거나 [Learn Git Branching](https://learngitbranching.js.org/)과 같은 튜토리얼을 따라 해보라. 진행하면서 Git 명령어들이 데이터 모델과 어떻게 연결되는지 생각하라.
1. [클래스 웹사이트 저장소](https://github.com/missing-semester/missing-semester)를 복제하라.
    1. 이력을 그래프 형태로 시각화하여 살펴보라.
    2. `README.md`를 마지막으로 수정한 사람은 누구인가? (힌트: 인자와 함께 `git log`를 사용하라).
    3. `_config.yml`의 `collections:` 라인을 마지막으로 수정한 것과 관련된 커밋 메시지는 무엇인가? (힌트: `git blame`과 `git show`를 사용하라).
1. Git을 배울 때 흔히 하는 실수 중 하나는 Git이 관리해서는 안 될 큰 파일을 커밋하거나 민감한 정보를 추가하는 것이다. 저장소에 파일을 추가하고 몇 번의 커밋을 한 뒤, 해당 파일을 이력에서 완전히 삭제해 보라 ([이 자료](https://help.github.com/articles/removing-sensitive-data-from-a-repository/)를 참고할 수 있다).
1. GitHub에서 아무 저장소나 복제하고 기존 파일 중 하나를 수정해 보라. `git stash`를 수행하면 어떤 일이 일어나는가? `git log --all --oneline`을 실행하면 무엇이 보이는가? `git stash pop`을 실행하여 `git stash`로 했던 작업을 되돌리라. 어떤 시나리오에서 이 기능이 유용할까?
1. 많은 커맨드 라인 도구들과 마찬가지로 Git은 `~/.gitconfig`라는 설정 파일(도트파일)을 제공한다. `git graph`를 실행했을 때 `git log --all --graph --decorate --oneline`의 출력이 나오도록 `~/.gitconfig`에 별칭(alias)을 생성하라. `~/.gitconfig` 파일을 직접 [편집](https://git-scm.com/docs/git-config#Documentation/git-config.txt-alias)하거나 `git config` 명령어를 사용하여 별칭을 추가할 수 있다. Git 별칭에 대한 정보는 [여기](https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases)에서 찾을 수 있다.
1. `git config --global core.excludesfile ~/.gitignore_global` 명령어를 실행한 뒤 `~/.gitignore_global`에 전역 무시 패턴을 정의할 수 있다. 이는 Git이 사용할 전역 무시 파일의 위치를 설정하는 것이지만, 해당 경로에 파일을 직접 생성해야 한다. `.DS_Store`와 같이 OS나 에디터에서 생성하는 임시 파일들을 무시하도록 전역 gitignore 파일을 설정하라.
1. [클래스 웹사이트 저장소](https://github.com/missing-semester/missing-semester)를 포크(fork)하고, 오타를 찾거나 개선할 점을 찾아 GitHub에서 풀 리퀘스트(PR)를 제출해 보라 ([이 자료](https://github.com/firstcontributions/first-contributions)를 참고할 수 있다). 유용한 PR만 제출해 주길 바란다. 개선할 점을 찾지 못했다면 이 연습 문제는 건너뛰어도 좋다.
EOF
