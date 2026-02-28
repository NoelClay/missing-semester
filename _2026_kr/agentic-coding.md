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

코딩 에이전트는 파일 읽기/쓰기, 웹 검색, 쉘 명령 실행 등의 도구에 접근할 수 있는 대화형 AI 모델입니다. 이들은 IDE 내부 또는 독립 커맨드라인 또는 GUI 도구에서 실행됩니다. 코딩 에이전트는 매우 자율적이고 강력한 도구이며, 다양한 사용 사례를 가능하게 합니다.

이 강의는 [개발 환경과 도구](/2026/development-environment/) 강의의 AI 기반 개발 자료를 기반으로 합니다. 간단한 데모로, [AI 기반 개발](/2026/development-environment/#ai-powered-development) 섹션의 예제를 계속 진행해봅시다:

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

코딩 에이전트에 다음 작업을 프롬프트로 시도할 수 있습니다:

```
Turn this into a proper command-line program, with argparse for argument parsing. Add type annotations, and make sure the program passes type checking.
```

에이전트는 파일을 읽어 그것을 이해한 후, 일부 편집을 수행하고, 마지막으로 타입 체커를 실행하여 타입 주석이 올바른지 확인할 것입니다. 타입 검사를 실패시키는 실수를 하면, 아마도 반복할 것입니다. 다만 이것은 간단한 작업이므로 그럴 가능성은 낮습니다. 코딩 에이전트는 해로울 수 있는 도구에 접근할 수 있으므로, 기본적으로 에이전트 하네스는 사용자에게 도구 호출을 확인하도록 프롬프트합니다.

> 코딩 에이전트가 실수를 하면 --- 예를 들어, `mypy` 바이너리가 `$PATH`에서 직접 사용 가능하지만 에이전트가 `python -m mypy`를 호출하려고 하는 경우 --- 텍스트 피드백을 제공하여 코스를 수정하도록 도와줄 수 있습니다.

코딩 에이전트는 다중 턴 상호작용을 지원하므로, 에이전트와의 왕복 대화를 통해 작업을 반복할 수 있습니다. 에이전트가 잘못된 방향으로 가고 있으면 중단할 수도 있습니다. 한 가지 도움이 되는 정신 모델은 인턴의 관리자라는 개념입니다: 인턴은 세세한 일을 처리하지만, 지도가 필요하고, 가끔 잘못된 일을 하여 수정이 필요합니다.

> 더 설명적인 데모로, 결과 스크립트를 실행하도록 에이전트에 후속 질문으로 요청하세요. 출력을 관찰하고, 변경을 요청하도록 해보세요(예: 절대 URL만 포함하도록 요청).

# AI 모델과 에이전트의 작동 원리

현대 [대규모 언어 모델(LLMs)](https://en.wikipedia.org/wiki/Large_language_model)과 에이전트 하네스와 같은 인프라의 내부 작동 메커니즘을 완전히 설명하는 것은 이 과정의 범위를 벗어납니다. 그러나 주요 개념들의 높은 수준의 이해는 이 최첨단 기술을 효과적으로 _사용하기_ 위해, 그리고 그 한계를 이해하기 위해 유용합니다.

LLM은 프롬프트 문자열(입력)이 주어졌을 때 완성 문자열(출력)의 확률 분포를 모델링하는 것으로 볼 수 있습니다. LLM 추론(예를 들어, 대화형 채팅 앱에 쿼리를 제공할 때 일어나는 것)은 이 확률 분포에서 _샘플링_ 합니다. LLM은 고정된 _컨텍스트 윈도우(context window)_ 를 가지고 있으며, 이는 입력과 출력 문자열의 최대 길이입니다.

대화형 채팅과 코딩 에이전트와 같은 AI 도구는 이 기본 단위 위에 구축됩니다. 다중 턴 상호작용의 경우, 채팅 앱과 에이전트는 턴 마커를 사용하고 새 사용자 프롬프트가 있을 때마다 전체 대화 기록을 프롬프트 문자열로 제공하며, 사용자 프롬프트당 한 번씩 LLM 추론을 호출합니다. 도구 호출 에이전트의 경우, 하네스는 특정 LLM 출력을 도구 호출 요청으로 해석하고, 하네스는 도구 호출의 결과를 프롬프트 문자열의 일부로 모델에 제공합니다(따라서 도구 호출/응답이 있을 때마다 LLM 추론이 다시 실행됩니다). 도구 호출 에이전트의 핵심 개념은 [200줄의 코드로 구현](https://www.mihaileric.com/The-Emperor-Has-No-Clothes/)할 수 있습니다.

## 개인정보 보호

대부분의 AI 코딩 도구는 표준 구성에서 많은 데이터를 클라우드로 전송합니다. 때로는 하네스가 로컬에서 실행되는 동안 LLM 추론이 클라우드에서 실행되고, 다른 경우에는 더 많은 소프트웨어가 클라우드에서 실행됩니다(그리고, 예를 들어, 서비스 제공자가 전체 저장소 및 AI 도구와의 모든 상호작용의 사본을 효과적으로 얻을 수도 있습니다).

좋은 오픈 소스 AI 코딩 도구와 오픈 소스 LLM이 있습니다(독점 모델만큼 좋지는 않지만). 그러나 현재로서는 대부분의 사용자에게 로컬에서 최첨단 오픈 LLM을 실행하는 것은 하드웨어 한계로 인해 불가능합니다.

# 사용 사례

코딩 에이전트는 다양한 작업에 유용할 수 있습니다. 몇 가지 예:

- **새 기능 구현.** 위의 예제처럼, 코딩 에이전트에 기능을 구현하도록 요청할 수 있습니다. 좋은 명세를 제공하는 것은 현재 과학보다는 예술에 가깝습니다. 에이전트에 대한 입력이 에이전트가 원하는 대로 수행하도록 충분히 설명적이어야 합니다(최소한 올바른 방향으로 가서 반복할 수 있도록), 하지만 너무 설명적이어서 자신이 너무 많은 일을 하지는 않도록 해야 합니다. 테스트 주도 개발이 특히 효과적일 수 있습니다: 테스트를 작성하고(또는 코딩 에이전트를 사용하여 테스트 작성 도움 받기), 테스트를 감시하여 원하는 것을 포착하는지 확인한 후, 코딩 에이전트에 기능을 구현하도록 요청합니다. 모델들이 계속 개선되고 있으므로, 모델이 무엇을 할 수 있는지에 대한 직관을 최신으로 유지해야 합니다.
    > Claude Code를 사용하여 이 [Tufte 스타일 사이드노트들을 구현했습니다](https://github.com/missing-semester/missing-semester/pull/345).

- **오류 수정.** 컴파일러, 린터, 타입 체커 또는 테스트에서 오류가 있으면, 에이전트에 오류를 수정하도록 요청할 수 있습니다. 예를 들어 "fix the issues with mypy"와 같은 프롬프트로요. 코딩 모델은 피드백 루프에 들어갈 수 있을 때 특히 효과적이므로, 모델이 실패하는 검사를 직접 실행할 수 있도록 설정하려고 하세요. 이렇게 하면 모델이 자율적으로 반복할 수 있습니다. 이것이 불가능하면, 수동으로 모델에 피드백을 제공할 수 있습니다.
    > Missing Semester 저장소의 커밋 [f552b55](https://github.com/missing-semester/missing-semester/commit/f552b5523462b22b8893a8404d2110c4e59613dd)에서, Claude Code에 "Review the agentic coding lecture for typos and grammatical issues"를 프롬프트했고 이후 발견한 문제들을 수정하도록 요청했으며, 이는 커밋 [f1e1c41](https://github.com/missing-semester/missing-semester/commit/f1e1c417adba6b4149f7eef91ff5624de40dc637)에서 커밋되었습니다.

- **리팩토링.** 코딩 에이전트를 사용하여 다양한 방식으로 코드를 리팩토링할 수 있습니다. 메서드 이름 바꾸기(이 종류의 리팩토링은 [코드 인텔리전스](/2026/development-environment/#code-intelligence-and-language-servers)에서도 지원됨)와 같은 간단한 작업부터, 기능을 별도 모듈로 분해하는 것과 같은 더 복잡한 작업까지.
    > Claude Code를 사용하여 에이전틱 코딩을 자신의 [강의로 분리했습니다](https://github.com/missing-semester/missing-semester/pull/344).

- **코드 리뷰.** 코딩 에이전트에 코드를 검토하도록 요청할 수 있습니다. "review my latest changes that are not yet committed"와 같은 기본 지도를 제공할 수 있습니다. 풀 리퀘스트를 검토하고 싶고 코딩 에이전트가 웹 페치를 지원하거나 [GitHub CLI](https://cli.github.com/)와 같은 커맨드라인 도구를 설치했으면, 코딩 에이전트에 "Review the pull request {link}"를 요청할 수 있을 것입니다.

- **코드 이해.** 코딩 에이전트에 코드베이스에 대한 질문을 할 수 있으며, 이는 온보딩에 특히 유용할 수 있습니다.

- **쉘로 사용.** 코딩 에이전트에 특정 도구를 사용하여 작업을 해결하도록 요청할 수 있습니다. 따라서 "use the find command to find all files older than 30 days" 또는 "use mogrify to resize all the jpgs to 50% of their original size"와 같은 자연 언어로 쉘 명령을 호출할 수 있습니다.

- **Vibe 코딩.** 에이전트는 본인이 한 줄의 코드도 작성하지 않고 일부 애플리케이션을 구현할 수 있을 정도로 강력합니다.
    > [다음은](https://github.com/cleanlab/office-presence-dashboard) 강사 중 한 명이 vibe 코딩한 실제 프로젝트의 예입니다.

# 고급 에이전트

여기서는 코딩 에이전트의 더 고급스러운 사용 패턴과 능력에 대한 간단한 개요를 제공합니다.

- **재사용 가능한 프롬프트.** 재사용 가능한 프롬프트나 템플릿을 만듭니다. 예를 들어, 특정 방식으로 코드 리뷰를 수행하는 상세한 프롬프트를 작성하고 이를 재사용 가능한 프롬프트로 저장할 수 있습니다.
    > 에이전트 도구는 빠르게 진화합니다. 일부 도구에서 재사용 가능한 프롬프트는 독립 기능으로 더 이상 사용되지 않습니다. 예를 들어, Codex와 Claude Code에서 이들은 [Skills](https://code.claude.com/docs/en/skills)에 [포함됩니다](https://developers.openai.com/codex/custom-prompts).

- **병렬 에이전트.** 코딩 에이전트는 느릴 수 있습니다: 에이전트를 프롬프트할 수 있고, 수십 분 동안 문제에 대해 작업할 수 있습니다. 동일한 작업(LLM은 확률적이므로 동일한 작업을 여러 번 실행하고 최선의 솔루션을 취하는 것이 도움이 됨) 또는 다른 작업(예: 겹치지 않는 두 기능을 동시에 구현)을 하는 여러 에이전트 복사본을 동시에 실행할 수 있습니다. 다른 에이전트의 변경이 서로 방해하는 것을 방지하려면, [git worktrees](https://git-scm.com/docs/git-worktree)를 사용할 수 있습니다. 이는 [버전 제어](/2026/version-control/) 강의에서 다룹니다.

- **MCP.** MCP는 _Model Context Protocol_ 의 약자이며, 코딩 에이전트를 도구와 연결하는 데 사용할 수 있는 오픈 프로토콜입니다. 예를 들어, 이 [Notion MCP 서버](https://github.com/makenotion/notion-mcp-server)는 에이전트가 Notion 문서를 읽고/쓸 수 있게 하여 "{Notion doc에 연결된 명세 읽기, Notion에서 새 페이지로 구현 계획 초안 작성, 프로토타입 구현"과 같은 사용 사례를 가능하게 합니다. MCP 발견을 위해, [Pulse](https://www.pulsemcp.com/servers)와 [Glama](https://glama.ai/mcp/servers)와 같은 디렉토리를 사용할 수 있습니다.

- **컨텍스트 관리.** 우리가 [위에서](#how-ai-models-and-agents-work) 언급했듯이, 코딩 에이전트를 지원하는 LLM은 제한된 _컨텍스트 윈도우(context window)_ 를 가집니다. 코딩 에이전트의 효과적인 사용은 컨텍스트를 잘 활용해야 합니다. 에이전트가 필요한 정보에 접근할 수 있는지 확인하고 싶지만, 불필요한 컨텍스트를 피하여 컨텍스트 윈도우를 넘치지 않거나 모델의 성능을 저하시키지 않도록 하세요(이는 컨텍스트 윈도우를 넘치지 않아도 컨텍스트 크기가 증가함에 따라 발생하는 경향이 있습니다). 에이전트 하네스는 자동으로 컨텍스트를 제공하고 일정 정도까지 관리하지만, 많은 제어는 사용자에게 남겨집니다.
    - **컨텍스트 윈도우 지우기.** 가장 기본적인 제어는 코딩 에이전트가 컨텍스트 윈도우를 지우는(새 대화 시작) 것을 지원합니다. 이는 관련 없는 쿼리에 대해 수행해야 합니다.
    - **대화 되감기.** 일부 코딩 에이전트는 대화 기록의 단계를 실행 취소하는 것을 지원합니다. 에이전트를 다른 방향으로 조종하는 후속 메시지를 제공하는 대신, "undo"가 더 합리적인 상황에서, 이는 더 효과적으로 컨텍스트를 관리합니다.
    - **컴팩션.** 무한 길이의 대화를 가능하게 하기 위해, 코딩 에이전트는 컨텍스트 _컴팩션(compaction)_ 을 지원합니다: 대화 기록이 너무 길어지면, LLM을 호출하여 대화의 접두사를 요약하고 대화 기록을 요약으로 바꿉니다. 일부 에이전트는 사용자에게 원하는 경우에 컴팩션을 호출하는 제어를 제공합니다.
    - **llms.txt.** `/llms.txt` 파일은 LLM이 추론 시간에 사용하기 위한 문서를 위한 제안된 [표준](https://llmstxt.org/) 위치입니다. 제품(예: [cursor.com/llms.txt](https://cursor.com/llms.txt)), 소프트웨어 라이브러리(예: [ai.pydantic.dev/llms.txt](https://ai.pydantic.dev/llms.txt)), API(예: [apify.com/llms.txt](https://apify.com/llms.txt))는 개발에 편리한 `llms.txt` 파일을 가질 수 있습니다. 이러한 문서는 토큰 당 더 많은 정보가 밀집되어 있어서, HTML 페이지를 코딩 에이전트에 페치하고 읽도록 요청하는 것보다 더 컨텍스트 효율적입니다. 외부 문서는 코딩 에이전트가 사용하려는 의존성에 대한 내장 지식이 없을 때 유용합니다(예: LLM의 지식 범위 이후에 발행된 경우).
    - **AGENTS.md.** 대부분의 코딩 에이전트는 [AGENTS.md](https://agents.md/) 또는 유사한 것(예: Claude Code는 `CLAUDE.md`를 찾음)을 코딩 에이전트를 위한 README로 지원합니다. 에이전트가 시작되면, 전체 `AGENTS.md` 내용으로 컨텍스트를 미리 채웁니다. 이를 사용하여 세션 간에 공통적인 에이전트에 조언을 제공할 수 있습니다(예: 코드 변경 후 항상 타입 체커를 실행하도록 지시, 단위 테스트를 실행하는 방법 설명, 또는 에이전트가 탐색할 수 있는 써드파티 문서로의 링크 제공). 일부 코딩 에이전트는 이 파일을 자동으로 생성할 수 있습니다(예: Claude Code의 `/init` 명령). [여기](https://github.com/pydantic/pydantic-ai/blob/main/CLAUDE.md)에서 `AGENTS.md`의 실제 예제를 보세요.
    - **Skills.** `AGENTS.md`의 내용은 항상 에이전트의 컨텍스트 윈도우에 전체적으로 로드됩니다. _Skills_ 는 컨텍스트 블로트를 피하기 위해 한 단계의 간접을 추가합니다: 에이전트에 설명과 함께 skill 목록을 제공할 수 있고, 에이전트는 원하는 대로 skill을 "열 수 있습니다"(컨텍스트 윈도우에 로드).
    - **Subagents.** 일부 코딩 에이전트는 subagent를 정의하게 하는데, 이는 작업 특정 워크플로우를 위한 에이전트입니다. 상위 수준 코딩 에이전트는 특정 작업을 완료하기 위해 하위 에이전트를 호출할 수 있으며, 이는 상위 수준 에이전트와 하위 에이전트 모두 컨텍스트를 더 효과적으로 관리하게 합니다. 상위 수준 에이전트의 컨텍스트는 하위 에이전트가 보는 모든 것으로 채워지지 않고, 하위 에이전트는 작업에 필요한 컨텍스트만 얻습니다. 한 예로, 일부 코딩 에이전트는 웹 리서치를 하위 에이전트로 구현합니다: 상위 수준 에이전트가 하위 에이전트에 쿼리를 제시하면, 하위 에이전트는 웹 검색을 실행하고, 개별 웹 페이지를 검색하고, 분석하고, 답변을 상위 수준 에이전트에 제공합니다. 이렇게 하면, 상위 수준 에이전트의 컨텍스트는 검색된 모든 웹 페이지의 전체 내용으로 채워지지 않고, 하위 에이전트는 상위 수준 에이전트의 대화 기록의 나머지를 컨텍스트에 가지지 않습니다.

프롬프트를 작성해야 하는 많은 고급 기능(예: skill 또는 subagent)의 경우, LLM을 사용하여 시작할 수 있습니다. 일부 코딩 에이전트는 이를 수행하기 위한 내장 지원을 갖추고 있습니다. 예를 들어, Claude Code는 짧은 프롬프트에서 subagent를 생성할 수 있습니다(`/agents`를 호출하고 새 에이전트를 만듭니다). 다음 프롬프트로 subagent를 만들어 보세요:

```
A Python code checking agent that uses `mypy` and `ruff` to type-check, lint, and format *check* any files that have been modified from the last git commit.
```

그런 다음, 상위 수준 에이전트를 사용하여 "use the code checker subagent"와 같은 메시지로 명시적으로 subagent를 호출할 수 있습니다. 예를 들어, 모든 Python 파일을 수정한 후에 상위 수준 에이전트가 자동으로 subagent를 호출하도록 할 수도 있을 것입니다.

# 주의할 점

AI 도구는 실수를 할 수 있습니다. 이들은 LLM을 기반으로 하는데, 이들은 단지 확률적 다음 토큰 예측 모델입니다. 이들은 인간과 같은 방식으로 "지능형"이 아닙니다. AI 출력을 정확성과 보안 버그에 대해 검토하세요. 때때로 코드를 검증하는 것이 코드를 작성하는 것보다 더 어려울 수 있습니다. 중요한 코드의 경우, 손으로 작성하는 것을 고려하세요. AI는 토끼 굴로 빠져 당신을 가스라이팅하려고 할 수 있습니다. 디버깅 나선을 인식하세요. AI를 지팡이로 사용하지 마세요. 과도한 의존이나 얕은 이해를 조심하세요. 여전히 AI가 할 수 없는 거대한 프로그래밍 작업 클래스가 있습니다. 계산 사고는 여전히 가치있습니다.

# 추천 소프트웨어

많은 IDE / AI 코딩 확장은 코딩 에이전트를 포함합니다([개발 환경 강의](/2026/development-environment/)의 권장사항 참조). 다른 인기 있는 코딩 에이전트는 Anthropic의 [Claude Code](https://www.claude.com/product/claude-code), OpenAI의 [Codex](https://openai.com/codex/), 그리고 [opencode](https://github.com/anomalyco/opencode)와 같은 오픈 소스 에이전트를 포함합니다.

# 연습 문제

1. 손 코딩, AI 자동완성, 인라인 채팅, 에이전트를 사용하는 경험을 동일한 프로그래밍 작업을 네 번 수행하여 비교합니다. 최선의 후보는 이미 진행 중인 프로젝트의 작은 기능입니다. 다른 아이디어를 찾고 있으면, GitHub의 "good first issue" 스타일 작업을 완료하거나, [Advent of Code](https://adventofcode.com/) 또는 [LeetCode](https://leetcode.com/) 문제를 고려할 수 있습니다.
1. 실제로 관심 있는 프로젝트의 맥락에서 익숙하지 않은 코드베이스를 탐색하려면 AI 코딩 에이전트를 사용하세요. 디버그하거나 새 기능을 추가하려고 할 때 가장 좋습니다. 생각나는 것이 없으면, AI 에이전트를 사용하여 [opencode](https://github.com/anomalyco/opencode) 에이전트에서 보안 관련 기능이 어떻게 작동하는지 이해해 보세요.
1. 처음부터 작은 앱을 vibe 코딩합니다. 손으로 한 줄의 코드도 작성하지 마세요.
1. 선택하신 코딩 에이전트에 대해, `AGENTS.md`(또는 `CLAUDE.md`와 같은 에이전트 선택에 해당하는 것), skill(예: [Claude Code의 skill](https://code.claude.com/docs/en/skills) 또는 [Codex의 skill](https://developers.openai.com/codex/skills/)), 그리고 subagent(예: [Claude Code의 subagent](https://code.claude.com/docs/en/sub-agents))를 만들고 테스트합니다. 이들 중 하나를 다른 것보다 사용하고 싶을 때를 생각해보세요. 선택하신 코딩 에이전트가 이들 기능 중 일부를 지원하지 않을 수 있습니다. 건너뛰거나 지원하는 다른 코딩 에이전트를 시도할 수 있습니다.
1. [코드 품질 강의](/2026/code-quality/)의 마크다운 글머리 기호 정규식 연습과 동일한 목표를 달성하는 데 코딩 에이전트를 사용합니다. 직접 파일 편집을 통해 작업을 완료합니까? 에이전트가 파일을 직접 편집하여 작업을 완료하는 것의 단점과 한계는 무엇입니까? 에이전트가 직접 파일 편집을 통해 작업을 완료하지 않도록 프롬프트하는 방법을 알아냅시다. 힌트: [첫 번째 강의](/2026/course-shell/)에서 언급한 커맨드라인 도구 중 하나를 사용하도록 에이전트에 요청합니다.
1. 대부분의 코딩 에이전트는 일종의 "yolo mode"를 지원합니다(예: Claude Code에서 `--dangerously-skip-permissions`). 이 모드를 직접 사용하는 것은 안전하지 않지만, 가상 머신이나 컨테이너와 같은 격리된 환경에서 코딩 에이전트를 실행한 후 자율적 작동을 활성화하는 것은 수용할 수 있습니다. 머신에서 이 설정을 실행하세요. [Claude Code devcontainers](https://code.claude.com/docs/en/devcontainer) 또는 [Docker Sandboxes / Claude Code](https://docs.docker.com/ai/sandboxes/agents/claude-code/)와 같은 문서가 도움이 될 수 있습니다. 이를 설정하는 방법은 하나 이상입니다.
