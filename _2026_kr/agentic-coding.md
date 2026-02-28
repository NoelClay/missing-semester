---
layout: lecture
title: "AI 코딩 에이전트"
description: >
  소프트웨어 개발 작업을 위해 AI 코딩 에이전트를 효과적으로 사용하는 방법을 배웁니다.
thumbnail: /static/assets/thumbnails/2026/lec7.png
date: 2026-01-21
ready: true
video:
  aspect: 56.25
  id: sTdz6PZoAnw
---

**코딩 에이전트**는 파일 읽기/쓰기, 웹 검색, 셸 명령 실행 등 다양한 도구에 접근할 수 있는 대화형 AI 모델입니다. IDE 내에서 실행되거나 독립 커맨드라인/GUI 도구로 제공됩니다. 코딩 에이전트는 매우 자율적이고 강력하며, 다양한 사용 사례를 가능하게 합니다.

이 강의는 [개발 환경](/2026/development-environment/) 강의의 AI 기반 개발 내용을 바탕으로 합니다. 간단한 예제로 [AI 기반 개발](/2026/development-environment/#ai-powered-development) 섹션의 코드를 계속 진행해봅시다:

```python
from urllib.request import urlopen

def download_contents(url: str) -> str:
    with urlopen(url) as response:
        return response.read().decode('utf-8')

def extract(content: str) -> list[str]:
    import re
    pattern = r'\[.*?\]\((.*?)\)'
    return re.findall(pattern, content)

print(extract(download_contents("https://raw.githubusercontent.com/missing-semester/missing-semester/refs/heads/master/_2026/development-environment.md")))
```

이 코드에 대해 코딩 에이전트에게 다음과 같이 요청할 수 있습니다:

```
Turn this into a proper command-line program, with argparse for argument parsing. Add type annotations, and make sure the program passes type checking.
```

에이전트는 먼저 파일을 읽어 이해한 후, 수정사항을 반영하고, 마지막으로 타입 체커를 실행해 타입 주석이 올바른지 검증합니다. 실수해서 타입 검사에 실패하더라도 보통 자동으로 재시도합니다(다만 이 간단한 작업은 그럴 가능성이 낮습니다). 코딩 에이전트는 위험한 도구에 접근할 수 있기 때문에, 기본적으로 사용자에게 도구 실행을 확인받습니다.

> 에이전트가 실수하면(예: `mypy`가 `$PATH`에 있지만 에이전트가 `python -m mypy`를 시도하는 경우), 텍스트 피드백으로 올바른 방향으로 유도할 수 있습니다.

코딩 에이전트는 **다중 턴 대화**를 지원하므로 에이전트와 왕복하며 작업을 반복할 수 있습니다. 에이전트가 잘못된 방향으로 가면 중단할 수도 있습니다. 좋은 비유는 **인턴 관리자**의 역할입니다: 인턴이 세세한 일을 처리하지만 지도가 필요하고, 때때로 실수해서 수정이 필요합니다.

> 더 실질적인 예제로, 결과 스크립트를 실행하도록 에이전트에 후속 요청을 해보세요. 출력을 보고, 변경을 요청해보세요(예: 절대 URL만 포함하도록).

# AI 모델과 에이전트의 작동 원리

현대 [대규모 언어 모델(LLM)](https://en.wikipedia.org/wiki/Large_language_model)과 에이전트 프레임워크의 내부 동작을 완전히 설명하는 것은 이 강의의 범위를 벗어납니다. 하지만 핵심 개념을 높은 수준에서 이해하는 것은 이 최신 기술을 **효과적으로 사용**하고 **한계를 이해**하는 데 도움됩니다.

LLM은 **프롬프트(입력)가 주어졌을 때 완성(출력)의 확률 분포를 모델링**하는 것으로 볼 수 있습니다. LLM 추론(채팅 앱에 질문을 입력했을 때 일어나는 과정)은 이 확률 분포에서 **샘플링**합니다. LLM은 **고정된 컨텍스트 윈도우**를 가지는데, 이는 입력과 출력의 최대 길이입니다.

대화 채팅과 코딩 에이전트 같은 AI 도구는 이 기본 개념 위에 만들어집니다. 다중 턴 상호작용에서 채팅 앱과 에이전트는 턴 마커를 사용하고, 새 사용자 입력이 올 때마다 **전체 대화 기록을 프롬프트에 포함**시켜 LLM 추론을 한 번 실행합니다. 도구 호출 에이전트의 경우, 프레임워크는 특정 LLM 출력을 **도구 호출 요청**으로 해석하고, 도구 결과를 프롬프트에 포함시켜 다시 LLM 추론을 실행합니다. 도구 호출 에이전트의 핵심은 [200줄의 코드로 구현](https://www.mihaileric.com/The-Emperor-Has-No-Clothes/)할 수 있을 정도로 간단합니다.

## 개인정보 보호

대부분의 AI 코딩 도구는 기본 설정에서 **많은 데이터를 클라우드로 전송합니다.** 어떤 경우는 도구는 로컬에서 실행되지만 LLM 추론은 클라우드에서 이루어집니다. 어떤 경우는 도구 전체가 클라우드에서 실행되며, 서비스 제공자가 당신의 저장소와 AI와의 모든 상호작용 기록을 사실상 받게 됩니다.

좋은 오픈소스 AI 코딩 도구와 오픈소스 LLM도 있습니다(비공개 모델만큼 좋지는 않지만). 다만 현재로서는 최신 오픈소스 LLM을 로컬에서 실행하는 것이 하드웨어 제약으로 대부분의 사용자에게 불가능합니다.

# 사용 사례

코딩 에이전트는 다양한 작업에 유용합니다:

- **새 기능 구현.** 위의 예처럼 코딩 에이전트에게 기능을 구현하도록 요청할 수 있습니다. 좋은 요구사항을 작성하는 것은 과학보다 **예술**에 가깝습니다. 에이전트가 당신이 원하는 것을 올바르게 이해할 수 있도록 충분히 명확하면서도(최소한 올바른 방향으로 가서 반복할 수 있게), 동시에 당신이 너무 많은 일을 하지 않도록 해야 합니다. **테스트 주도 개발(TDD)**이 특히 효과적입니다: 테스트를 작성한 후(에이전트의 도움을 받아도 됨), 테스트가 원하는 것을 정확히 검증하는지 확인하고, 그 다음 에이전트에게 구현을 요청하세요. 모델은 계속 진화하므로 "모델이 뭘 할 수 있는가"에 대한 감각을 항상 업데이트해야 합니다.
    > Claude Code로 이 [Tufte 스타일 사이드노트들을 구현](https://github.com/missing-semester/missing-semester/pull/345)했습니다.

- **오류 수정.** 컴파일러, 린터, 타입 체커, 또는 테스트에서 오류가 나면 에이전트에게 "fix the issues with mypy" 같은 요청을 할 수 있습니다. 코딩 모델은 **피드백 루프가 잘 설정되었을 때** 특히 효과적입니다. 모델이 실패하는 검사를 직접 실행할 수 있도록 설정하면 자동으로 반복합니다. 불가능하면 수동으로 피드백을 제공할 수 있습니다.
    > Missing Semester 저장소의 커밋 [f552b55](https://github.com/missing-semester/missing-semester/commit/f552b5523462b22b8893a8404d2110c4e59613dd)에서 Claude Code에게 "Review the agentic coding lecture for typos and grammatical issues"를 요청한 후 발견한 문제들을 수정하도록 했고, 이는 커밋 [f1e1c41](https://github.com/missing-semester/missing-semester/commit/f1e1c417adba6b4149f7eef91ff5624de40dc637)에서 커밋되었습니다.

- **리팩토링.** 코딩 에이전트로 다양한 방식의 리팩토링이 가능합니다. 메서드 이름 바꾸기(이는 [코드 인텔리전스](/2026/development-environment/#code-intelligence-and-language-servers)에서도 지원함)처럼 간단한 작업부터, 기능을 별도 모듈로 분리하는 것처럼 복잡한 작업까지요.
    > Claude Code로 [에이전틱 코딩을 별도 강의로 분리](https://github.com/missing-semester/missing-semester/pull/344)했습니다.

- **코드 리뷰.** 에이전트에게 코드를 검토하도록 요청할 수 있습니다. "review my latest changes that are not yet committed" 같은 기본 지시를 줄 수 있고, 웹 접근이 가능하거나 [GitHub CLI](https://cli.github.com/)를 설치했다면 "Review the pull request {link}"라고 요청할 수도 있습니다.

- **코드 이해.** 에이전트에게 코드베이스에 대해 질문하면 특히 **새로운 프로젝트에 합류할 때** 유용합니다.

- **셸 명령어 생성.** 에이전트에게 "use the find command to find all files older than 30 days"나 "use mogrify to resize all the jpgs to 50% of their original size" 같은 자연어로 셸 작업을 요청할 수 있습니다.

- **Vibe 코딩.** 에이전트가 강력해서 **직접 코드를 한 줄도 쓰지 않고** 전체 애플리케이션을 구현할 수 있습니다.
    > [이것은](https://github.com/cleanlab/office-presence-dashboard) 강사 중 한 명이 vibe 코딩으로 만든 실제 프로젝트의 예입니다.

# 고급 에이전트

더 고급스러운 사용 패턴과 기능들을 살펴봅시다.

- **재사용 가능한 프롬프트.** 특정 방식으로 코드 리뷰를 하는 상세한 프롬프트를 작성한 후 **재사용 가능한 프롬프트로 저장**할 수 있습니다.
    > 에이전트 도구는 빠르게 진화합니다. 일부에서 재사용 가능한 프롬프트가 [Skills](https://code.claude.com/docs/en/skills)로 [통합](https://developers.openai.com/codex/custom-prompts)되었습니다.

- **병렬 에이전트.** 코딩 에이전트는 느릴 수 있습니다(수십 분 소요 가능). **동시에 여러 에이전트를 실행**할 수 있습니다: 같은 작업을 여러 번 실행해서 최선의 결과를 선택하거나, 관계없는 여러 기능을 동시에 구현합니다. 에이전트들의 변경이 서로 간섭하지 않도록 [git worktrees](https://git-scm.com/docs/git-worktree)를 사용할 수 있습니다([버전 관리](/2026/version-control/) 강의에서 다룹니다).

- **MCP(Model Context Protocol).** MCP는 코딩 에이전트를 도구와 연결하는 **개방형 프로토콜**입니다. 예를 들어 [Notion MCP 서버](https://github.com/makenotion/notion-mcp-server)로 "Notion doc의 명세 읽기 → 구현 계획을 Notion에 작성 → 프로토타입 구현"이라는 워크플로우가 가능합니다. MCP를 찾으려면 [Pulse](https://www.pulsemcp.com/servers)나 [Glama](https://glama.ai/mcp/servers) 같은 디렉토리를 참고하세요.

- **컨텍스트 관리.** 앞서 언급했듯이 LLM은 **제한된 컨텍스트 윈도우**를 가집니다. 에이전트를 효과적으로 사용하려면 컨텍스트를 **잘 관리**해야 합니다. 필요한 정보는 제공하되, 불필요한 정보는 피해 컨텍스트 윈도우를 낭비하지 않아야 합니다. 에이전트 프레임워크가 자동으로 관리하지만 사용자가 할 수 있는 것도 있습니다:

    - **컨텍스트 초기화.** 가장 기본적인 기능으로, **관련 없는 새 작업을 시작할 때 대화를 초기화**하세요.

    - **대화 되돌리기.** 일부 에이전트는 **대화 기록의 단계를 되돌릴** 수 있습니다. 에이전트를 다른 방향으로 유도하는 새 메시지를 보내는 것보다 더 효율적입니다.

    - **컨텍스트 압축.** 대화가 너무 길어지면 에이전트가 **대화 역사의 시작 부분을 LLM으로 요약**해서 컨텍스트를 관리합니다. 일부 에이전트는 사용자가 수동으로 압축을 요청할 수 있게 합니다.

    - **llms.txt.** `/llms.txt` 파일은 LLM이 추론할 때 참고하는 문서입니다([표준 제안](https://llmstxt.org/)). 제품([cursor.com/llms.txt](https://cursor.com/llms.txt)), 라이브러리([ai.pydantic.dev/llms.txt](https://ai.pydantic.dev/llms.txt)), API([apify.com/llms.txt](https://apify.com/llms.txt))들이 이 파일을 제공합니다. HTML 페이지를 에이전트에게 읽도록 하는 것보다 토큰 효율이 좋습니다. LLM의 학습 데이터보다 최신인 라이브러리를 사용할 때 유용합니다.

    - **AGENTS.md.** 대부분의 코딩 에이전트는 [AGENTS.md](https://agents.md/) (또는 Claude Code의 `CLAUDE.md`)를 **에이전트를 위한 README**로 인식합니다. 에이전트 시작 시 이 파일 전체를 컨텍스트에 미리 로드합니다. 여기에 **세션 간 공통적인 지시사항**(항상 타입 체커 실행, 단위 테스트 실행 방법, 외부 문서 링크 등)을 작성할 수 있습니다. 일부 에이전트는 이 파일을 자동 생성하기도 합니다(Claude Code의 `/init` 명령). [실제 예제](https://github.com/pydantic/pydantic-ai/blob/main/CLAUDE.md)를 참고하세요.

    - **Skills.** `AGENTS.md`의 내용은 항상 컨텍스트에 전체 로드됩니다. **Skills**는 컨텍스트 낭비를 막기 위해 간접 계층을 추가합니다. 에이전트에게 skill 목록과 설명을 제공하고, 필요할 때 skill을 "열도록" 합니다.

    - **Subagents.** 일부 에이전트는 **작업 특화 에이전트(Subagent)**를 지원합니다. 상위 에이전트가 특정 작업을 위해 하위 에이전트를 호출할 수 있어서 두 에이전트 모두 컨텍스트를 효율적으로 관리합니다. 예를 들어, 웹 리서치를 하위 에이전트로 구현하면, 상위 에이전트는 구체적인 웹 페이지 내용으로 오염되지 않고, 하위 에이전트는 상위 에이전트의 전체 대화 기록을 볼 필요 없습니다.

프롬프트를 작성하는 고급 기능(skill, subagent 등)의 경우 **LLM을 활용해서 시작**할 수 있습니다. 일부 에이전트는 이를 자동화합니다. Claude Code의 경우 `/agents`를 호출해서 새 에이전트를 만들면 됩니다. 이 프롬프트로 시도해보세요:

```
A Python code checking agent that uses `mypy` and `ruff` to type-check, lint, and format *check* any files that have been modified from the last git commit.
```

그 다음 상위 에이전트에서 "use the code checker subagent"라고 요청하면 됩니다. 모든 Python 파일 수정 후 자동으로 subagent를 호출하도록 설정할 수도 있습니다.

# 주의할 점

AI 도구는 **실수할 수 있습니다.** LLM은 단순히 **확률적 다음 토큰 예측 모델**일 뿐이고, 인간처럼 "지능적"이지 않습니다. AI 결과물을 **정확성과 보안을 검토**하세요. 때때로 코드 검증이 처음부터 작성하는 것보다 어렵습니다. 중요한 코드는 직접 작성하는 것을 고려하세요. AI는 **토끼 굴에 빠질** 수 있고, **당신을 속일** 수도 있습니다. **디버깅 나선**을 주의하세요. AI를 **지팡이처럼 사용하지 마세요.** 과도한 의존성이나 얕은 이해를 조심하세요. 여전히 AI가 **할 수 없는 프로그래밍 작업들**이 많습니다. **계산 사고력은 여전히 가치 있습니다.**

# 추천 소프트웨어

많은 IDE와 AI 코딩 확장이 코딩 에이전트를 포함합니다([개발 환경](/2026/development-environment/) 강의의 권장사항 참고). 다른 인기 있는 선택은 Anthropic의 [Claude Code](https://www.claude.com/product/claude-code), OpenAI의 [Codex](https://openai.com/codex/), 그리고 [opencode](https://github.com/anomalyco/opencode) 같은 오픈소스 옵션들입니다.

# 연습 문제

1. 손 코딩, AI 자동완성, 인라인 채팅, 에이전트를 사용하는 경험을 비교하세요. 같은 프로그래밍 작업을 네 가지 방식으로 해봅시다. 가장 좋은 예제는 이미 진행 중인 프로젝트의 작은 기능입니다. 다른 아이디어가 필요하면 GitHub의 "good first issue" 작업, [Advent of Code](https://adventofcode.com/), 또는 [LeetCode](https://leetcode.com/)를 시도해보세요.

1. AI 코딩 에이전트로 낯선 코드베이스를 탐색해보세요. 실제로 관심 있는 프로젝트를 디버그하거나 새 기능을 추가할 때 가장 좋습니다. 없으면 [opencode](https://github.com/anomalyco/opencode) 에이전트의 보안 기능이 어떻게 작동하는지 이해해보세요.

1. 처음부터 작은 앱을 vibe 코딩하세요. **손으로 한 줄도 작성하지 마세요.**

1. 선택한 코딩 에이전트로 다음을 만들고 테스트해보세요: `AGENTS.md` (또는 해당 에이전트의 equivalent), skill, subagent. 각각 언제 사용할지 생각해보세요. 에이전트가 모두 지원하지 않을 수도 있으니, 생략하거나 다른 에이전트를 시도해도 됩니다.

1. [코드 품질](/2026/code-quality/) 강의의 마크다운 글머리 정규식 연습과 같은 목표를 에이전트로 달성해보세요. 에이전트가 직접 파일을 편집해서 해결할까요? 직접 편집의 단점은 무엇일까요? 에이전트가 직접 편집 **없이** 작업하도록 프롬프트하세요. 힌트: [첫 번째 강의](/2026/course-shell/)의 커맨드라인 도구를 사용하도록 요청하세요.

1. 대부분의 코딩 에이전트는 "yolo mode"를 지원합니다(Claude Code의 `--dangerously-skip-permissions`). 직접 사용하는 것은 안전하지 않지만, 가상머신이나 컨테이너 같은 격리된 환경에서는 괜찮습니다. 당신의 머신에서 이를 설정하세요. [Claude Code devcontainers](https://code.claude.com/docs/en/devcontainer)나 [Docker Sandboxes](https://docs.docker.com/ai/sandboxes/agents/claude-code/)가 도움될 겁니다.
