import { useState, useRef, useEffect, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const PHASE = { INTRO: 0, SOCRATIC: 1, FEYNMAN: 2, DONE: 3 };
const PHASE_LABELS = ["문제 읽기", "소크라테스 대화", "파인만 설명", "완료"];

// ─── ACTUAL MIT 2026 EXERCISES ───────────────────────────────────────────────
const LECTURES = [
  {
    id: 1,
    title: "Course Overview + Introduction to the Shell",
    date: "1/12/26",
    accent: "#39ff14",
    icon: "$",
    desc: "셸의 기초: 글로브, 따옴표, 스트림, 종료코드, 스크립팅, 파이프, jq, awk",
    url: "https://missing.csail.mit.edu/2026/course-shell/",
    exercises: [
      {
        id: "1-1",
        title: "Unix 셸 확인 (echo $SHELL)",
        problem: `이 수업을 들으려면 bash나 ZSH 같은 Unix 셸이 필요합니다. Linux나 macOS를 사용한다면 특별한 준비가 필요 없습니다. Windows 사용자라면 cmd.exe나 PowerShell을 사용하지 않도록 해야 합니다. [Windows 하위 시스템(WSL)](https://docs.microsoft.com/en-us/windows/wsl/)이나 Linux 가상 머신을 사용하면 Unix 스타일의 커맨드라인 도구를 쓸 수 있습니다. 적절한 셸을 실행하고 있는지 확인하려면 \`echo $SHELL\` 명령을 실행해보세요. \`/bin/bash\`나 \`/usr/bin/zsh\` 같은 결과가 나오면 맞습니다.`,
        hints: ["$SHELL은 현재 셸의 경로를 담은 환경 변수입니다", "echo는 인수를 그대로 출력합니다", "/bin/sh이면 bash가 아닐 수 있습니다"],
        socraticStarter: "`echo $SHELL`을 실행했을 때 무엇이 출력됐나요? `$`가 붙은 SHELL을 echo에 전달하면 어떤 일이 벌어지는지 설명해볼 수 있나요?",
        feynmanPrompt: "환경 변수가 뭔지, $SHELL이 어떤 정보를 담고 있는지, bash와 zsh의 차이가 뭔지 — 처음 배우는 친구에게 설명하듯 써보세요.",
        systemPrompt: "학생이 Unix 셸 환경 확인(echo $SHELL)을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 환경 변수의 개념, $ 기호의 의미(변수 확장), bash vs zsh 차이. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-2",
        title: "ls -l 플래그와 파일 권한",
        problem: `\`ls\`의 \`-l\` 플래그는 무엇을 합니까? \`ls -l /\`를 실행하고 출력을 살펴보세요. 각 행의 첫 10개 문자는 무엇을 의미합니까? (힌트: \`man ls\`)`,
        hints: ["첫 글자는 파일 종류 (d=디렉터리, -=일반파일, l=링크)", "나머지 9글자는 3개씩 rwx로 나뉩니다", "r=읽기, w=쓰기, x=실행 / 세 그룹: 소유자, 그룹, 기타"],
        socraticStarter: "`ls -l /`의 출력에서 `drwxr-xr-x`를 보셨나요? 이 10글자가 각각 무엇을 나타내는지 추측해볼 수 있나요?",
        feynmanPrompt: "`ls -l` 출력의 첫 10자리 권한 표시가 무엇인지, `drwxr-xr-x`를 예로 들어 한 글자씩 설명해보세요. 왜 권한 시스템이 이렇게 설계됐는지도요.",
        systemPrompt: "학생이 ls -l과 파일 권한(permission bits)을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: -l 플래그의 역할, 10자리 권한(d/rwx 3세트), 소유자/그룹/기타 개념. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-3",
        title: "글로브(Glob) 패턴",
        problem: `\`find ~/Downloads -type f -name "*.zip" -mtime +30\` 명령에서 \`*.zip\`은 "글로브(glob)"입니다. 글로브란 무엇입니까? 테스트 디렉터리를 만들고 파일들을 생성한 뒤 \`ls *.txt\`, \`ls file?.txt\`, \`ls {a,b,c}.txt\` 같은 패턴을 실험해보세요. Bash 매뉴얼의 [Pattern Matching](https://www.gnu.org/software/bash/manual/html_node/Pattern-Matching.html)을 참고하세요.`,
        hints: ["*는 0개 이상의 임의 문자와 매칭됩니다", "?는 정확히 1개의 임의 문자와 매칭됩니다", "{a,b,c}는 brace expansion으로 여러 패턴을 나열합니다"],
        socraticStarter: "`*.txt`와 `file?.txt`의 차이가 뭘까요? `*`와 `?`가 각각 어떤 문자와 매칭된다고 생각하나요?",
        feynmanPrompt: "글로브 패턴이 뭔지, `*`, `?`, `{}` 각각이 어떻게 동작하는지, 정규표현식과는 어떻게 다른지 설명해보세요.",
        systemPrompt: "학생이 bash 글로브(glob) 패턴을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: glob의 정의, *(임의 여러 문자), ?(임의 한 문자), {a,b}(brace expansion), 셸이 프로그램 실행 전 패턴을 확장하는 원리, 정규표현식과의 차이. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-4",
        title: "따옴표의 종류 (단일·이중·ANSI)",
        problem: `\`'작은따옴표'\`, \`"큰따옴표"\`, \`$'ANSI 따옴표'\`의 차이는 무엇입니까? 리터럴 \`$\`, \`!\`, 개행 문자를 포함한 문자열을 echo하는 명령을 작성해보세요. [Quoting](https://www.gnu.org/software/bash/manual/html_node/Quoting.html)을 참고하세요.`,
        hints: ["작은따옴표는 모든 특수문자를 리터럴로 처리합니다", "큰따옴표 안에서는 $와 백틱은 여전히 확장됩니다", "$'...'는 \\n, \\t 같은 이스케이프 시퀀스를 처리합니다"],
        socraticStarter: "`echo '$USER'`와 `echo \"$USER\"`의 출력이 다릅니다. 왜 그럴까요? 각 따옴표가 특수문자를 어떻게 다룬다고 생각하나요?",
        feynmanPrompt: "bash에서 따옴표 3종류(작은, 큰, $'')의 차이를, 각각 언제 써야 하는지 예를 들어 설명해보세요.",
        systemPrompt: "학생이 bash quoting을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 작은따옴표(모든 문자 리터럴), 큰따옴표($ 와 백틱은 확장), $'...'(이스케이프 처리), !의 특수 의미(history expansion). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-5",
        title: "표준 스트림과 리다이렉션",
        problem: `셸에는 stdin(0), stdout(1), stderr(2) 세 개의 표준 스트림이 있습니다. \`ls /nonexistent /tmp\`를 실행해서 stdout을 한 파일로, stderr를 다른 파일로 리다이렉트해보세요. 두 스트림을 같은 파일로 리다이렉트하려면 어떻게 해야 합니까? [Redirections](https://www.gnu.org/software/bash/manual/html_node/Redirections.html)을 참고하세요.`,
        hints: ["`ls /nonexistent`는 오류, `/tmp`는 성공 → 두 스트림이 분리됩니다", "2>&1은 stderr를 stdout이 가리키는 곳으로 보냅니다", "&>file은 둘 다 같은 파일로 (bash 4+)"],
        socraticStarter: "프로그램이 출력하는 내용에는 두 종류가 있습니다 — 정상 결과와 오류 메시지. 왜 이 둘을 별도의 스트림으로 분리했을까요?",
        feynmanPrompt: "stdin/stdout/stderr가 뭔지, 리다이렉션(>, 2>, &>)이 어떻게 동작하는지, 실제로 어떤 상황에서 유용한지 설명해보세요.",
        systemPrompt: "학생이 표준 스트림과 리다이렉션을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 3개 스트림(stdin/stdout/stderr), >(1>), 2>, &>, 2>&1의 순서 중요성, /dev/null로 버리기. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-6",
        title: "종료 상태와 &&, ||",
        problem: `\`$?\`는 마지막 명령의 종료 상태(0 = 성공)를 저장합니다. \`&&\`는 이전 명령이 성공했을 때만 다음 명령을 실행하고, \`||\`는 실패했을 때만 실행합니다. \`/tmp/mydir\`가 없을 때만 생성하는 한 줄짜리 명령을 작성해보세요. [Exit Status](https://www.gnu.org/software/bash/manual/html_node/Exit-Status.html)를 참고하세요.`,
        hints: ["0 = 성공, 1 이상 = 실패 (Unix 관례)", "[ -d dir ]은 디렉터리 존재 여부 검사입니다", "&& 와 ||를 조합해 간단한 조건 로직을 만들 수 있습니다"],
        socraticStarter: "명령이 성공했는지 실패했는지를 숫자로 표현하는 이유가 뭘까요? `0 = 성공`인 이유가 직관적이지 않게 느껴지지 않나요?",
        feynmanPrompt: "종료 상태($?), &&, ||가 어떻게 작동하는지, 실제로 어떤 패턴에서 쓰이는지 설명해보세요. `[ -d dir ] || mkdir dir` 한 줄이 하는 일도요.",
        systemPrompt: "학생이 bash 종료 상태와 조건 연산자를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 종료 상태(0=성공), $? 변수, &&(단락 평가), ||(실패 시 실행), [ ] 조건 표현식, true/false 프로그램. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-7",
        title: "cd는 왜 셸 내장 명령인가?",
        problem: `\`cd\`는 왜 독립된 프로그램이 아닌 셸에 내장되어 있어야 할까요? (힌트: 자식 프로세스가 부모 프로세스에 영향을 미칠 수 있는 것과 없는 것을 생각해보세요.)`,
        hints: ["`which cd`를 실행하면 어떤 결과가 나오는지 확인해보세요", "프로세스는 자신의 환경만 변경할 수 있습니다", "cd가 별도 프로그램이면 변경된 디렉터리가 부모 셸에 반영되지 않습니다"],
        socraticStarter: "만약 `cd`가 `/bin/cd`라는 독립 프로그램이었다면, `cd /tmp`를 실행한 후 터미널 프롬프트의 위치는 어떻게 될까요?",
        feynmanPrompt: "cd가 왜 셸 내장 명령(builtin)이어야 하는지, 자식 프로세스와 부모 프로세스의 관계에서 어떤 제약이 있는지 설명해보세요.",
        systemPrompt: "학생이 cd가 왜 셸 내장 명령(builtin)인지를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 프로세스 격리(자식은 부모 환경 변경 불가), 작업 디렉터리는 프로세스별로 존재, builtin만이 셸 자체 상태를 변경 가능. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-8",
        title: "파일 존재 확인 스크립트 작성",
        problem: `파일 이름을 인수(\`$1\`)로 받아 \`test -f\` 또는 \`[ -f ... ]\`를 사용해 파일 존재 여부를 확인하는 스크립트를 작성해보세요. 파일 존재 여부에 따라 다른 메시지를 출력해야 합니다. [Bash Conditional Expressions](https://www.gnu.org/software/bash/manual/html_node/Bash-Conditional-Expressions.html)을 참고하세요.`,
        hints: ["$1은 첫 번째 인수입니다", "[ -f file ]은 일반 파일 존재 여부를 확인합니다", "if/then/else/fi 구조를 사용하세요"],
        socraticStarter: "스크립트에서 `\"$1\"`처럼 변수를 따옴표로 감싸는 이유가 있을까요? 파일 이름에 공백이 있다면 어떤 일이 생길지 생각해보세요.",
        feynmanPrompt: "bash 스크립트에서 인수($1)를 받는 방법, [ -f ] 같은 조건 표현식이 어떻게 작동하는지, 따옴표가 왜 중요한지 설명해보세요.",
        systemPrompt: "학생이 bash 스크립트 작성(파일 존재 확인)을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: $1 인수, [ -f ]/-d/-e 조건 표현식, 변수 따옴표의 중요성(공백 처리), if/then/else/fi 구조. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-9",
        title: "chmod +x와 실행 권한",
        problem: `이전 연습의 스크립트를 파일(예: \`check.sh\`)에 저장하세요. \`./check.sh somefile\`로 실행하면 어떻게 됩니까? 이제 \`chmod +x check.sh\`를 실행하고 다시 시도해보세요. 이 단계가 왜 필요합니까? (힌트: \`chmod\` 전후에 \`ls -l check.sh\` 출력을 살펴보세요.)`,
        hints: ["chmod +x는 실행 권한 비트(x)를 추가합니다", "ls -l에서 x가 있는 위치를 확인하세요", "셸 스크립트도 실행 파일이므로 x 비트가 필요합니다"],
        socraticStarter: "`chmod +x` 전후로 `ls -l check.sh`의 출력이 어떻게 달라지나요? 권한 표시에서 어떤 문자가 바뀌었나요?",
        feynmanPrompt: "chmod +x가 무엇을 하는지, 왜 스크립트를 실행하려면 이 작업이 필요한지, 파일 권한이 보안에 어떤 역할을 하는지 설명해보세요.",
        systemPrompt: "학생이 chmod와 실행 권한을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 실행 비트(x)의 의미, chmod +x vs chmod 755, ./로 실행 시 커널의 권한 확인 과정. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-10",
        title: "set -x 디버깅 플래그",
        problem: `스크립트의 \`set\` 플래그에 \`-x\`를 추가하면 어떻게 됩니까? 간단한 스크립트로 시도하고 출력을 관찰해보세요. [The Set Builtin](https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html)을 참고하세요.`,
        hints: ["-x는 실행 전에 각 명령을 + 와 함께 출력합니다", "-e는 오류 시 즉시 종료, -u는 미정의 변수 오류", "`set -euo pipefail`이 안전한 스크립트의 관용구입니다"],
        socraticStarter: "`set -x`를 추가한 스크립트를 실행하면 `+`로 시작하는 줄들이 보입니다. 이게 무엇을 보여주는 걸까요? 디버깅에 어떻게 도움이 될까요?",
        feynmanPrompt: "set -x가 무엇을 하는지, -e/-u/-o pipefail 옵션이 각각 뭘 하는지, 왜 스크립트 첫 줄에 `set -euo pipefail`을 쓰는 게 좋은지 설명해보세요.",
        systemPrompt: "학생이 bash set 옵션을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: set -x(트레이싱), set -e(오류 시 종료), set -u(미정의 변수 오류), set -o pipefail(파이프 오류 전파). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-11",
        title: "날짜가 포함된 백업 파일 생성",
        problem: `파일 이름에 오늘 날짜를 포함한 백업을 만드는 명령을 작성해보세요(예: \`notes.txt\` → \`notes_2026-01-12.txt\`). (힌트: \`$(date +%Y-%m-%d)\`). [Command Substitution](https://www.gnu.org/software/bash/manual/html_node/Command-Substitution.html)을 참고하세요.`,
        hints: ["$(cmd)는 명령 실행 결과로 대체됩니다", "date +%Y-%m-%d는 연-월-일 형식으로 출력합니다", "따옴표 안에서도 $()는 확장됩니다"],
        socraticStarter: "`cp notes.txt notes_$(date +%Y-%m-%d).txt`에서 `$(date +%Y-%m-%d)` 부분은 실행될 때 어떤 값으로 바뀔까요? 셸이 이 명령을 어떤 순서로 처리할까요?",
        feynmanPrompt: "명령 치환($())이 뭔지, 언제 유용한지, date 포맷 지정자(%Y-%m-%d)가 어떻게 작동하는지 설명해보세요.",
        systemPrompt: "학생이 bash 명령 치환을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: $() 명령 치환, date 명령의 포맷 지정자, 따옴표 안에서의 확장. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-12",
        title: "flaky test 스크립트 인수 처리",
        problem: `강의에서 소개한 간헐적 실패 테스트 스크립트를 수정하여 \`cargo test my_test\`를 하드코딩하는 대신 테스트 명령을 인수로 받도록 만들어보세요. (힌트: \`$1\` 또는 \`$@\`). [Special Parameters](https://www.gnu.org/software/bash/manual/html_node/Special-Parameters.html)을 참고하세요.`,
        hints: ["$@ 은 모든 인수를 개별 단어로 보존합니다", "$1은 첫 번째 인수, $*는 모든 인수를 하나의 문자열로 합칩니다", "파일 이름에 공백이 있을 때 $@와 $*의 차이가 드러납니다"],
        socraticStarter: "`$@`와 `$*`의 차이가 뭘까요? 파일 이름에 공백이 있을 때 두 방식이 어떻게 다르게 동작할지 생각해보세요.",
        feynmanPrompt: "bash 스크립트에서 $1, $@, $*, $# 각각의 역할을, 인수에 공백이 있을 때의 동작 차이를 포함해서 설명해보세요.",
        systemPrompt: "학생이 bash 특수 변수($1, $@, $* 등)를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: $0(스크립트명), $1~$9(위치 인수), $@(개별 보존), $*(합쳐짐), $#(개수), 큰따옴표 안에서의 차이. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-13",
        title: "파이프로 파일 확장자 분석",
        problem: `파이프를 사용해 홈 디렉터리에서 가장 많이 사용되는 파일 확장자 5개를 찾아보세요. (힌트: \`find\`, \`grep\`이나 \`sed\` 또는 \`awk\`, \`sort\`, \`uniq -c\`, \`head\`를 조합하세요.)`,
        hints: ["find ~ -type f 로 모든 파일을 찾습니다", "grep -oE '\\.[^./]+$' 로 확장자만 추출합니다", "sort | uniq -c 로 중복 횟수를 셉니다, 그 다음 sort -rn | head -5"],
        socraticStarter: "이 파이프라인에서 각 명령은 어떤 역할을 할까요? `sort | uniq -c`를 왜 그 순서로 써야 할까요? 반대로 하면 어떻게 될까요?",
        feynmanPrompt: "Unix 파이프라인 철학(작은 도구를 조합)을 설명하고, 파일 확장자 분석 파이프라인의 각 단계가 무엇을 하는지 순서대로 설명해보세요.",
        systemPrompt: "학생이 파이프라인 조합을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: Unix 철학(작은 도구 조합), find의 결과를 파이프로 처리, grep -o(매칭 부분만 출력), sort+uniq-c(빈도 계산), sort -rn(역순 숫자 정렬). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-14",
        title: "find + xargs로 .sh 파일 분석",
        problem: `\`xargs\`는 stdin에서 받은 줄들을 명령의 인수로 변환합니다. \`find -exec\`를 사용하지 않고 \`find\`와 \`xargs\`를 함께 사용해서 디렉터리의 모든 \`.sh\` 파일을 찾고 \`wc -l\`로 각 파일의 줄 수를 세어보세요. 보너스: 공백이 포함된 파일 이름도 처리할 수 있게 만들어보세요. (힌트: \`-print0\`와 \`-0\`). \`man xargs\`를 참고하세요.

\`\`\`bash
# 기본
find . -name '*.sh' | xargs wc -l

# Handles filenames with spaces
find . -name '*.sh' -print0 | xargs -0 wc -l
\`\`\``,
        hints: ["xargs는 stdin의 줄을 명령의 인수로 변환합니다", "-print0과 -0은 널 문자로 구분 (공백 안전)", "find -exec와 달리 xargs는 한 번에 여러 파일을 처리합니다"],
        socraticStarter: "`find . -name '*.sh' | wc -l`과 `find . -name '*.sh' | xargs wc -l`의 결과가 다릅니다. 왜 그럴까요?",
        feynmanPrompt: "xargs가 무엇을 하는지, 왜 단순 파이프만으로는 안 되는 경우가 있는지, -print0과 -0이 왜 필요한지 설명해보세요.",
        systemPrompt: "학생이 xargs를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: xargs의 역할(stdin→인수 변환), find -exec와의 차이, -print0/-0(null 구분자로 공백 처리), 배치 처리 효율. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-15",
        title: "curl + grep으로 강의 수 세기",
        problem: `\`curl\`로 강의 웹사이트(\`https://missing.csail.mit.edu/\`)의 HTML을 가져와서 \`grep\`으로 파이프하여 강의가 몇 개 나열되어 있는지 세어보세요. (힌트: 강의마다 한 번씩 나타나는 패턴을 찾아보세요. \`curl -s\`로 진행률 출력을 숨길 수 있습니다.)`,
        hints: ["curl -s는 silent 모드 (progress bar 숨김)", "grep -c는 매칭된 줄 수를 셉니다", "HTML 구조에서 강의마다 한 번씩 나타나는 패턴을 찾아야 합니다"],
        socraticStarter: "`curl https://missing.csail.mit.edu/`와 `curl -s https://missing.csail.mit.edu/`의 차이가 뭔가요? -s가 없으면 어떤 추가 출력이 생길까요?",
        feynmanPrompt: "curl이 무엇을 하는지, HTTP 응답을 파이프로 처리하는 방식이 왜 강력한지, grep -c가 어떻게 동작하는지 설명해보세요.",
        systemPrompt: "학생이 curl과 grep을 조합하는 방법을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: curl의 역할(HTTP 클라이언트), -s 옵션, HTML을 텍스트로 처리하는 패러다임, grep -c(줄 수 세기). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-16",
        title: "jq로 JSON 처리",
        problem: `[\`jq\`](https://jqlang.github.io/jq/)는 JSON 데이터를 처리하는 강력한 도구입니다. \`curl\`로 \`https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json\`의 샘플 데이터를 가져와서 \`jq\`로 버전이 6보다 큰 사람들의 이름만 추출해보세요. (힌트: 먼저 \`jq .\`로 구조를 파악하고, 그 다음 \`jq '.[] | select(...) | .name'\`을 시도해보세요.)

\`\`\`bash
curl -s 'https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json' \\
  | jq '.[] | select(.version > 6) | .name'
\`\`\``,
        hints: ["`jq .`은 JSON을 예쁘게 출력합니다 (구조 파악용)", "`jq '.[]'`는 배열의 각 요소를 순회합니다", "`select(.field > value)`로 조건 필터링합니다"],
        socraticStarter: "`jq '.'`와 `jq '.[]'`의 출력이 다릅니다. 어떻게 다를까요? 배열과 개별 요소 처리의 차이가 뭔지 설명해볼 수 있나요?",
        feynmanPrompt: "jq가 무엇인지, .[], select(), .name 같은 jq 필터가 어떻게 작동하는지, 커맨드라인에서 JSON을 처리하는 게 왜 유용한지 설명해보세요.",
        systemPrompt: "학생이 jq를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: jq의 역할(JSON 처리 도구), . .[] .field 기본 필터, select() 조건 필터, | 파이프 체이닝, curl과 조합하는 패턴. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-17",
        title: "awk로 열 필터링과 재배열",
        problem: `\`awk\`는 열 값을 기준으로 행을 필터링하고 출력을 조작할 수 있습니다. 예를 들어 \`awk '$3 ~ /pattern/ {$4=""; print}'\`은 세 번째 열이 \`pattern\`과 일치하는 행만 출력하면서 네 번째 열은 생략합니다. 두 번째 열이 100보다 큰 행만 출력하고 첫 번째와 세 번째 열을 바꾸는 \`awk\` 명령을 작성해보세요. 테스트:

\`\`\`bash
printf 'a 50 x\\nb 150 y\\nc 200 z\\n' | awk '$2 > 100 {print $3, $2, $1}'
\`\`\`

Expected output:
\`\`\`
y 150 b
z 200 c
\`\`\``,
        hints: ["awk는 각 줄을 공백으로 분리해 $1, $2, $3으로 접근합니다", "$2 > 100은 조건 필터 (패턴)입니다", "{print $3, $2, $1}은 액션 블록입니다"],
        socraticStarter: "`awk '$2 > 100 {print $3, $2, $1}'`에서 `$2 > 100` 부분과 `{print $3, $2, $1}` 부분의 역할이 각각 뭘까요? awk의 '패턴-액션' 구조를 느꼈나요?",
        feynmanPrompt: "awk가 무엇인지, 패턴-액션 구조가 어떻게 작동하는지, $1/$2/$3 같은 필드 변수가 어떻게 결정되는지, sed와 어떻게 다른지 설명해보세요.",
        systemPrompt: "학생이 awk를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: awk 패턴-액션 구조, 필드 변수($1, $2...), FS(구분자), 조건 필터($2 > 100), 출력 재배열. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "1-18",
        title: "SSH 로그 파이프라인 해부 + bash_history 분석",
        problem: `강의에서 소개한 SSH 로그 파이프라인을 분석해보세요. 각 단계는 무엇을 합니까? 그런 다음 \`~/.bash_history\` (또는 \`~/.zsh_history\`)에서 가장 많이 사용한 셸 명령을 찾는 비슷한 파이프라인을 직접 만들어보세요.

SSH 로그 파이프라인:
\`\`\`bash
ssh myserver 'journalctl -u sshd | grep "Disconnected"' \\
  | sed -E 's/.*user (.*) port.*/\\1/' \\
  | sort | uniq -c | sort -nk1,1 | tail -n10 \\
  | awk '{print $2}' | paste -sd,
\`\`\`

Build a history analysis command:
\`\`\`bash
history | awk '{$1=""; print substr($0,2)}' \\
  | sort | uniq -c | sort -n | tail -n 10
\`\`\``,
        hints: ["journalctl은 systemd 로그 조회 명령입니다", "sed -E 's/.*/\\1/'는 캡처 그룹으로 일부만 추출합니다", "paste -sd,는 여러 줄을 쉼표로 이어 붙입니다"],
        socraticStarter: "SSH 파이프라인의 8단계를 하나씩 분리해서 실행하면 각 단계에서 데이터가 어떻게 변환되는지 추적해봤나요? 첫 번째 grep의 역할은 무엇일까요?",
        feynmanPrompt: "SSH 로그 파이프라인의 각 단계(ssh, journalctl, grep, sed, sort, uniq -c, awk, paste)가 무엇을 하는지 순서대로 설명하고, bash_history 분석 파이프라인도 각 단계별로 설명해보세요.",
        systemPrompt: "학생이 복잡한 파이프라인 분석을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: ssh 원격 실행, journalctl(systemd 로그), sed 정규식 치환과 캡처 그룹(\\1), sort+uniq-c 빈도 계산, paste -sd,(줄 합치기), history 명령. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      }
    ]
  },
  {
    id: 2,
    title: "Command-line Environment",
    date: "1/13/26",
    accent: "#00d4ff",
    icon: "%",
    desc: "인수·글로브, 환경 변수, 리턴 코드, 시그널, job control, tmux, dotfiles, SSH",
    url: "https://missing.csail.mit.edu/2026/command-line-environment/",
    exercises: [
      // ── ARGUMENTS & GLOBS ──────────────────────────────────────────────────
      {
        id: "2-1",
        title: "-- 구분자와 -로 시작하는 파일",
        problem: `\`cmd --flag -- --notaflag\` 같은 명령을 볼 수 있습니다. \`--\`는 프로그램이 플래그 파싱을 멈추도록 알려주는 특수 인수입니다. \`--\` 이후의 모든 것은 위치 인수로 취급됩니다. 왜 유용할까요? \`touch -- -myfile\`을 실행한 후, \`--\` 없이 삭제해 보세요.`,
        hints: ["rm -myfile은 -myfile을 플래그로 해석하려 합니다", "-- 이후의 인수는 모두 위치 인수로 취급됩니다", "glob: rm ./-myfile 처럼 경로를 명시해도 됩니다"],
        socraticStarter: "`rm -myfile`을 실행하면 어떤 오류가 나올까요? 셸이 `-myfile`을 어떻게 해석하려 할까요?",
        feynmanPrompt: "`--` 구분자가 왜 존재하는지, `-`로 시작하는 파일을 어떻게 다뤄야 하는지, 실생활에서 어떤 상황에서 이게 필요한지 설명해보세요.",
        systemPrompt: "학생이 -- 구분자와 특수 파일명을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 옵션 파싱의 원리(getopt), -- 이후 위치 인수 취급, -로 시작하는 파일명의 위험성, 대안(./prefix). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-2",
        title: "ls 고급 옵션 조합",
        problem: `[\`man ls\`](https://www.man7.org/linux/man-pages/man1/ls.1.html)를 읽고 다음과 같이 파일을 나열하는 \`ls\` 명령을 작성하세요:
- 숨겨진 파일을 포함한 **모든 파일** 포함
- 파일 크기가 **읽기 쉬운 형식**으로 표시 (예: 454M 대신 454279954)
- Files are ordered by **recency** (most recently modified first)
- Output is **colorized**

A sample output would look like this:
\`\`\`
-rw-r--r--   1 user group 1.1M Jan 14 09:53 baz
drwxr-xr-x   5 user group  160 Jan 14 09:53 .
-rw-r--r--   1 user group  514 Jan 14 06:42 bar
-rw-r--r--   1 user group 106M Jan 13 12:12 foo
drwx------+ 47 user group 1.5K Jan 12 18:08 ..
\`\`\``,
        hints: ["-a 는 hidden files 포함", "-h 는 human-readable 크기", "-t 는 시간순 정렬, --color=auto 는 색상"],
        socraticStarter: "`man ls`에서 숨김 파일, 사람이 읽기 쉬운 크기, 시간순 정렬을 각각 활성화하는 플래그를 찾아봤나요? 어떤 조합이 필요할까요?",
        feynmanPrompt: "man 페이지를 읽는 방법, ls의 주요 플래그들이 각각 무엇을 하는지, 여러 플래그를 조합하는 방법을 설명해보세요.",
        systemPrompt: "학생이 ls 고급 옵션을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: -a(all), -l(long), -h(human-readable), -t(time sort), -r(reverse), --color=auto, man 페이지 읽기 방법. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-3",
        title: "프로세스 치환 <() — printenv vs export",
        problem: `프로세스 치환 \`<(command)\`는 명령의 출력을 파일처럼 사용할 수 있게 합니다. \`diff\`를 프로세스 치환과 함께 사용하여 \`printenv\`와 \`export\`의 출력을 비교하세요. 왜 그들이 다른가요? (힌트: \`diff <(printenv | sort) <(export | sort)\`를 시도해 보세요).
\`\`\`bash
printenv | head -5
export | head -5
\`\`\`

Why does \`diff\` take files as arguments? What does \`<(cmd)\` actually create?`,
        hints: ["`<(cmd)`는 cmd의 출력을 /dev/fd/숫자 형태의 가상 파일로 만듭니다", "printenv는 이름=값 형식, export는 declare -x 형식으로 출력합니다", "diff는 파일 두 개를 인수로 받는데, <()는 파일처럼 동작합니다"],
        socraticStarter: "`diff`는 파일 두 개를 비교합니다. 그런데 `printenv`는 파일이 아닌 stdout으로 출력합니다. `<(printenv | sort)`는 이 문제를 어떻게 해결하나요?",
        feynmanPrompt: "프로세스 치환(<())이 무엇인지, 어떻게 명령 출력을 파일처럼 다룰 수 있는지, printenv와 export의 출력이 왜 다른지 설명해보세요.",
        systemPrompt: "학생이 프로세스 치환을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: <() 프로세스 치환(named pipe/fd), diff의 파일 인수, printenv(환경변수 목록) vs export(declare -x 형식), 언제 파이프 대신 <()를 써야 하는지. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      // ── ENVIRONMENT VARIABLES ──────────────────────────────────────────────
      {
        id: "2-4",
        title: "marco / polo 함수 — 디렉터리 북마크",
        problem: `bash 함수 \`marco\`와 \`polo\`를 작성하세요. 다음과 같이 작동해야 합니다:
- \`marco\`를 실행하면 현재 디렉터리를 저장합니다.
- \`polo\`를 실행하면, 어느 디렉터리에 있든 \`marco\`를 실행했던 디렉터리로 돌아갑니다.

코드는 \`marco.sh\` 파일에 작성하고 \`source marco.sh\`로 셸에 로드할 수 있습니다.

\`\`\`bash
# marco.sh
marco() {
    # TODO: 현재 디렉터리 저장
}

polo() {
    # TODO: marco에서 저장한 디렉터리로 이동
}
\`\`\``,
        hints: ["`pwd`는 현재 디렉터리를 출력합니다", "변수에 저장: MARCO=$(pwd) — 또는 export로 전역 변수화", "source marco.sh 또는 . marco.sh 로 함수를 셸에 로드합니다"],
        socraticStarter: "`marco`가 저장한 디렉터리를 `polo`에서 접근하려면 어떤 방식으로 값을 전달해야 할까요? 일반 변수와 export된 변수의 차이가 여기서 중요할까요?",
        feynmanPrompt: "bash 함수를 정의하는 방법, export vs 일반 변수의 차이, source 명령이 하는 일, 그리고 이 marco/polo 함수가 왜 유용한지 설명해보세요.",
        systemPrompt: "학생이 bash 함수와 환경 변수를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 함수 정의(function foo(){} vs foo(){}), export(자식 프로세스에 전파), source/dot(현재 셸에서 실행), cd가 함수 내에서 작동하는 이유(builtin). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      // ── RETURN CODES ──────────────────────────────────────────────────────
      {
        id: "2-5",
        title: "간헐적 실패 스크립트 포착기",
        problem: `가끔씩 실패하는 명령을 디버그해야 한다고 합시다. 실패할 때까지 계속 실행하고 그때의 표준 출력과 표준 오류를 파일로 저장한 후 마지막에 모두 출력하는 bash 스크립트를 작성하세요. 보너스: 실패하기까지 몇 번 실행했는지도 보고하세요.

\`\`\`bash
#!/usr/bin/env bash
# random.sh — 랜덤하게 실패하는 스크립트

n=$(( RANDOM % 100 ))

if [[ n -eq 42 ]]; then
   echo "Something went wrong"
   >&2 echo "The error was using magic numbers"
   exit 1
fi

echo "Everything went according to plan"
\`\`\`

래퍼 스크립트를 작성하세요:
1. \`random.sh\`를 루프에서 실패할 때까지 실행합니다
2. stdout과 stderr를 파일로 캡처합니다
3. 내용과 실행 횟수를 마지막에 출력합니다`,
        hints: ["`$?`는 마지막 명령의 종료 상태를 담습니다", "`./random.sh &> out.txt`로 stdout과 stderr를 같은 파일로 리다이렉트합니다", "`until [[ \"$?\" -ne 0 ]]; do ...done` 패턴을 고려해보세요"],
        socraticStarter: "스크립트가 실패할 때까지 반복 실행하려면 어떤 루프 구조가 필요할까요? `while`과 `until`의 차이는 뭔가요?",
        feynmanPrompt: "종료 상태($?)를 이용해 루프를 제어하는 방법, stdout과 stderr를 파일로 캡처하는 방법, `until` 루프가 어떻게 작동하는지 설명해보세요.",
        systemPrompt: "학생이 bash 루프와 에러 핸들링을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: $? 종료 상태, while vs until, &>로 stdout+stderr 리다이렉트, [[ ]]와 [ ]의 차이, RANDOM 변수. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      // ── SIGNALS & JOB CONTROL ─────────────────────────────────────────────
      {
        id: "2-6",
        title: "pgrep / pkill로 프로세스 제어",
        problem: `터미널에서 \`sleep 10000\`을 시작하고, \`Ctrl-Z\`로 일시 중지한 후, \`bg\`로 백그라운드 실행하세요. 그 다음 [\`pgrep\`](https://www.man7.org/linux/man-pages/man1/pgrep.1.html)으로 PID를 찾고, [\`pkill\`](https://man7.org/linux/man-pages/man1/pgrep.1.html)으로 직접 PID를 입력하지 않고 종료하세요. (힌트: \`-af\` 플래그 사용)

\`\`\`bash
sleep 10000       # 실행
# Ctrl-Z → 일시 중단
bg                # 백그라운드에서 계속 실행
jobs              # 현재 job 목록 확인
pgrep -af sleep   # PID 찾기
pkill -f sleep    # 이름으로 종료
\`\`\``,
        hints: ["Ctrl-Z는 SIGTSTP를 보내 프로세스를 일시 중단합니다", "bg는 일시 중단된 프로세스를 백그라운드에서 계속 실행합니다", "pgrep -af: a=인수 포함, f=전체 명령줄로 매칭"],
        socraticStarter: "`Ctrl-Z`와 `Ctrl-C`는 둘 다 실행 중인 프로세스에 영향을 줍니다. 어떻게 다를까요? Ctrl-Z 이후에 `fg`와 `bg`의 차이는 뭔가요?",
        feynmanPrompt: "SIGTSTP(Ctrl-Z), SIGCONT(fg/bg), SIGKILL, SIGTERM의 차이와 역할, 그리고 pgrep/pkill이 kill PID보다 편리한 이유를 설명해보세요.",
        systemPrompt: "학생이 Unix 시그널과 job control을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: SIGTSTP(일시 중단) vs SIGINT(인터럽트), bg/fg, jobs 명령, pgrep -af(이름으로 PID 검색), pkill(이름으로 종료). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-7",
        title: "wait 명령으로 프로세스 동기화",
        problem: `한 프로세스가 완료될 때까지 다른 프로세스를 시작하지 않으려면 어떻게 할까요? 이 연습에서 제한 프로세스는 \`sleep 60 &\`입니다. [\`wait\`](https://www.man7.org/linux/man-pages/man1/wait.1p.html) 명령을 사용하여 sleep을 시작하고 백그라운드 프로세스가 완료될 때까지 대기한 후 \`ls\`를 실행하세요.

\`\`\`bash
sleep 60 &
wait     # 모든 백그라운드 자식이 끝날 때까지 대기
ls
\`\`\`

하지만 다른 bash 세션에서는 \`wait\`이 작동하지 않습니다. \`wait\`은 자식 프로세스에만 작동하기 때문입니다. 대안이 있을까요?`,
        hints: ["`wait`는 현재 셸의 자식 프로세스에만 작동합니다", "새 터미널에서는 sleep이 현재 셸의 자식이 아닙니다", "다음 연습문제(pidwait)가 이 문제의 해결책입니다"],
        socraticStarter: "`sleep 60 &`를 실행하고 새 터미널을 열어서 `wait`를 실행하면 왜 기다리지 않을까요? '자식 프로세스'라는 개념이 여기서 핵심입니다.",
        feynmanPrompt: "job control에서 &(백그라운드 실행), wait 명령, 자식/부모 프로세스 관계를 설명하고, 왜 새 셸 세션에서는 wait가 작동하지 않는지 설명해보세요.",
        systemPrompt: "학생이 bash job control과 wait 명령을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: &(백그라운드 실행), wait(자식 대기), 프로세스 계층(부모-자식), 세션과 프로세스 그룹, wait의 한계. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-8",
        title: "pidwait 함수 — kill -0 폴링",
        problem: `주의: \`kill\` 명령은 성공하면 0, 실패하면 0이 아닌 종료 상태를 반환합니다. \`kill -0\`은 신호를 보내지 않지만 프로세스가 없으면 0이 아닌 상태를 반환합니다.

PID를 받아 주어진 프로세스가 완료될 때까지 대기하는 \`pidwait\` bash 함수를 작성하세요. 불필요한 CPU 소비를 피하려면 \`sleep\`을 사용하세요.

\`\`\`bash
pidwait() {
    # $1: 기다릴 PID
    while kill -0 "$1" 2>/dev/null; do
        sleep 1
    done
    echo "Process $1 has finished"
}

# 사용 예:
sleep 30 &
PID=$!
pidwait $PID
\`\`\``,
        hints: ["`kill -0 <PID>`는 시그널을 보내지 않고 프로세스 존재만 확인합니다", "`$!`는 마지막 백그라운드 프로세스의 PID를 담습니다", "`2>/dev/null`로 오류 메시지를 숨깁니다"],
        socraticStarter: "`kill -0 <PID>`는 신호를 보내지 않는데 왜 '프로세스 존재 확인'에 쓸 수 있을까요? 종료 상태를 어떻게 활용하나요?",
        feynmanPrompt: "pidwait 함수가 어떻게 작동하는지, kill -0의 특별한 역할, sleep으로 CPU 폴링 낭비를 줄이는 이유, $!가 무엇인지 설명해보세요.",
        systemPrompt: "학생이 bash 함수와 kill -0 트릭을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: kill -0(존재 확인), $!(마지막 백그라운드 PID), while 폴링 루프, sleep으로 CPU 낭비 방지, 2>/dev/null(오류 숨기기). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      // ── FILES & PERMISSIONS ───────────────────────────────────────────────
      {
        id: "2-9",
        title: "(심화) 최근 수정 파일 재귀 탐색",
        problem: `(고급) 재귀적으로 디렉토리에서 가장 최근에 수정된 파일을 찾으세요. 더 일반적으로, 모든 파일을 수정 시간 순서로 나열할 수 있을까요?

\`\`\`bash
# 가장 최근 수정된 파일 하나 찾기
find . -type f -printf '%T@ %p\\n' | sort -n | tail -1 | awk '{print $2}'

# 최근 수정 순으로 모든 파일 나열
find . -type f -printf '%T@ %p\\n' | sort -rn | awk '{print $2}'

# 더 간단한 방법 (GNU find):
find . -type f -newer /tmp/reference | head -10
\`\`\`

\`-printf\`에서 \`%T@\`는 무엇을 의미하나요? 파일명을 추출하기 전에 정렬해야 하는 이유는 뭔가요?`,
        hints: ["`-printf '%T@ %p\\n'`에서 %T@는 Unix 타임스탬프, %p는 파일 경로입니다", "sort -n은 숫자 오름차순, -r은 역순(최신이 위로)"],
        socraticStarter: "`find . -type f | sort`와 `find . -type f -printf '%T@ %p\\n' | sort -n`의 차이가 뭔가요? 왜 첫 번째 방법으로는 시간순 정렬이 안 될까요?",
        feynmanPrompt: "find의 -printf 옵션이 무엇인지, Unix 타임스탬프(%T@)가 무엇인지, 왜 파이프라인에서 숫자 정렬 후 파일명을 추출하는지 설명해보세요.",
        systemPrompt: "학생이 find 고급 옵션을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: find -printf의 포맷 지정자(%T@=타임스탬프, %p=경로), sort -n(숫자 정렬), Unix epoch time, -newer 플래그. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      // ── TERMINAL MULTIPLEXERS ─────────────────────────────────────────────
      {
        id: "2-10",
        title: "tmux 튜토리얼 및 커스터마이징",
        problem: `이 [\`tmux\` 튜토리얼](https://www.hamvocke.com/blog/a-quick-and-easy-guide-to-tmux/)을 따르고, [이 가이드](https://www.hamvocke.com/blog/a-guide-to-customizing-your-tmux-conf/)로 기본적인 커스터마이징을 배우세요.

배워야 할 주요 개념:
\`\`\`
# 세션 관리
tmux new -s mysession     # 이름 있는 세션 생성
tmux attach -t mysession  # 세션에 재연결
tmux ls                   # 세션 목록

# 기본 단축키 (Ctrl-b prefix)
Ctrl-b c   새 창(window)
Ctrl-b "   가로 분할 (pane)
Ctrl-b %   세로 분할
Ctrl-b d   세션에서 분리(detach)
\`\`\``,
        hints: ["tmux는 터미널 멀티플렉서로 하나의 터미널에서 여러 창을 관리합니다", "SSH 세션이 끊겨도 tmux 세션은 계속 살아있습니다", "~/.tmux.conf에서 prefix 키, 색상 등을 커스터마이징할 수 있습니다"],
        socraticStarter: "tmux에서 session, window, pane은 어떻게 다를까요? 계층 구조로 설명해보세요. 왜 이 세 가지 개념이 모두 필요할까요?",
        feynmanPrompt: "tmux가 무엇인지, session/window/pane의 계층 구조, SSH 세션이 끊겼을 때 tmux가 왜 유용한지, nohup과는 어떻게 다른지 설명해보세요.",
        systemPrompt: "학생이 tmux를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: tmux의 역할(터미널 멀티플렉서), session>window>pane 계층, detach/attach(SSH 끊겨도 유지), prefix 키 개념, nohup과의 차이. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      // ── ALIASES & DOTFILES ─────────────────────────────────────────────────
      {
        id: "2-11",
        title: "alias dc=cd 생성",
        problem: `\`cd\` 오타를 자동으로 고쳐주는 \`dc\` 별칭을 만드세요.

\`\`\`bash
alias dc=cd           # 현재 세션에서만 유효
echo 'alias dc=cd' >> ~/.bashrc   # 영구 적용
source ~/.bashrc      # 즉시 반영
\`\`\`

테스트:
\`\`\`bash
dc /tmp && pwd   # 정상 동작?
\`\`\`

\`dc\`가 실제로는 다른 명령(계산기)인데 왜 이렇게 작동할까요?`,
        hints: ["alias는 현재 셸 세션에서만 살아있습니다", ".bashrc에 추가해야 새 터미널에서도 작동합니다", "alias는 이미 존재하는 명령(dc)을 덮어씁니다 — type dc로 확인"],
        socraticStarter: "`alias dc=cd`를 실행하고 새 터미널을 열면 이 별칭이 사라집니다. 왜 그럴까요? 어디에 저장해야 영구적으로 유지될까요?",
        feynmanPrompt: "bash alias가 무엇인지, 현재 세션과 새 세션의 차이, .bashrc와 .bash_profile이 각각 언제 읽히는지 설명해보세요.",
        systemPrompt: "학생이 bash alias를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: alias의 작동 원리(이름 대체), 세션 범위(현재 셸만), .bashrc(인터랙티브 셸), .bash_profile(로그인 셸), source/dot 명령. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-12",
        title: "history 분석으로 나만의 alias 설계",
        problem: `다음 명령을 실행해 가장 자주 사용하는 명령 10개를 확인하고, 이들을 위한 단축 별칭을 만들어 보세요.

\`\`\`bash
# Bash:
history | awk '{$1=""; print substr($0,2)}' | sort | uniq -c | sort -n | tail -n 10

# ZSH:
history 1 | awk '{$1=""; print substr($0,2)}' | sort | uniq -c | sort -n | tail -n 10
\`\`\`

가장 자주 사용하는 명령을 확인한 후, 자주 쓰지만 길이가 긴 명령들을 위해 최소 2개의 별칭을 만드세요. 예시:
\`\`\`bash
alias gst='git status'
alias ll='ls -lah --color=auto'
alias ..='cd ..'
\`\`\``,
        hints: ["`history`는 명령 번호를 포함해 출력합니다", "`awk '{$1=\"\"; print substr($0,2)}'`로 번호를 제거합니다", "sort | uniq -c | sort -n으로 빈도 정렬"],
        socraticStarter: "history 파이프라인에서 `awk '{$1=\"\"; print substr($0,2)}'` 부분은 무엇을 하는 걸까요? $1이 뭔지, substr($0,2)가 왜 필요한지 설명해볼 수 있나요?",
        feynmanPrompt: "history 명령의 출력 형식, awk로 필드를 제거하는 방법, sort+uniq -c로 빈도를 세는 파이프라인 원리를 설명해보세요.",
        systemPrompt: "학생이 history 분석 파이프라인을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: history 출력 형식(번호+명령), awk 필드 처리($1을 지우기, substr), sort+uniq-c(빈도 계산), alias 설계 원칙. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-13",
        title: "dotfiles 폴더와 버전 관리",
        problem: `dotfile들을 관리할 폴더를 만들고 버전 제어를 설정하세요.

\`\`\`bash
mkdir ~/dotfiles
cd ~/dotfiles
git init
git add .
git commit -m "Initial dotfiles"
\`\`\`

최소한 하나의 프로그램(예: 셸)에 대한 설정을 추가하세요. 시작은 \`$PS1\`을 설정해 프롬프트를 커스터마이징하는 정도면 충분합니다:

\`\`\`bash
# ~/.bashrc에 추가
export PS1='\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '
\`\`\``,
        hints: ["dotfiles는 .bashrc, .vimrc, .gitconfig 같은 설정 파일들입니다", "git init으로 dotfiles 폴더를 git 저장소로 만듭니다", "PS1은 bash 프롬프트 모양을 정의하는 변수입니다"],
        socraticStarter: "dotfiles를 ~/dotfiles 폴더에 두고 싶은데, 실제로 ~/.bashrc는 홈 디렉터리에 있어야 합니다. 이 문제를 어떻게 해결할 수 있을까요?",
        feynmanPrompt: "dotfiles가 무엇인지, 왜 버전 관리가 필요한지, PS1 변수로 프롬프트를 커스터마이징하는 방법을 설명해보세요.",
        systemPrompt: "학생이 dotfiles 관리를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: dotfiles의 개념, git으로 버전 관리, PS1 프롬프트 커스터마이징, 홈 디렉터리와 dotfiles 폴더 간의 위치 문제. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-14",
        title: "dotfiles 설치 스크립트 — ln -s",
        problem: `새로운 머신에서 빠르고 자동으로 dotfile들을 설치하는 방법을 만드세요. 각 파일마다 \`ln -s\`를 호출하는 셸 스크립트를 만들거나, [전문 유틸리티](https://dotfiles.github.io/utilities/)를 사용할 수 있습니다.

\`\`\`bash
#!/usr/bin/env bash
# install.sh — dotfiles 설치 스크립트

DOTFILES_DIR="$(cd "$(dirname "$0")" && pwd)"

# 심볼릭 링크 생성
ln -sf "$DOTFILES_DIR/.bashrc" "$HOME/.bashrc"
ln -sf "$DOTFILES_DIR/.vimrc" "$HOME/.vimrc"
ln -sf "$DOTFILES_DIR/.gitconfig" "$HOME/.gitconfig"

echo "Dotfiles installed!"
\`\`\`

위의 패턴에 따라 설치 스크립트를 구현하세요.`,
        hints: ["ln -s는 심볼릭 링크를 생성합니다 (원본을 복사하지 않음)", "-f 플래그는 기존 링크/파일을 덮어씁니다", "$(cd \"$(dirname \"$0\")\" && pwd)는 스크립트 위치를 구합니다"],
        socraticStarter: "파일을 cp로 복사하는 것과 ln -s로 심볼릭 링크를 만드는 것의 차이가 뭔가요? 설정 파일 관리에서 왜 심볼릭 링크가 더 편리할까요?",
        feynmanPrompt: "심볼릭 링크(ln -s)가 무엇인지, 왜 복사 대신 링크를 쓰는지, dotfiles 설치 스크립트가 새 컴퓨터 셋업을 어떻게 자동화하는지 설명해보세요.",
        systemPrompt: "학생이 dotfiles 설치 자동화를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: ln -s(심볼릭 링크 vs 하드 링크 vs 복사), -f 플래그(강제 덮어쓰기), 스크립트 위치 구하기($0, dirname), GitHub으로 어느 기기에서든 설치. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-15",
        title: "가상 머신에서 설치 스크립트 테스트",
        problem: `깨끗한 가상 머신에서 설치 스크립트를 테스트하세요. 이렇게 하면 기존 설정이 없는 깨끗한 시스템에서 스크립트가 제대로 작동하는지 확인할 수 있습니다.

\`\`\`bash
# 새 VM에서:
cd ~/dotfiles
./install.sh        # 설치 스크립트 실행
ls -la ~/.bashrc    # 심볼릭 링크 확인
cat ~/.bashrc       # 내용이 ~/dotfiles/.bashrc와 같은지 확인
\`\`\`

스크립트가 올바르게 작동하나요? 모든 dotfile이 제대로 링크되었나요? 문제가 있으면 스크립트를 디버깅하고 개선하세요.`,
        hints: ["새 VM에서는 dotfiles 저장소를 먼저 클론해야 합니다", "install.sh의 권한 확인: chmod +x install.sh", "심볼릭 링크 확인: ls -l ~/.bashrc (l로 시작하는 줄이 나와야 함)"],
        socraticStarter: "새 가상 머신에서 설치 스크립트를 실행해보세요. 어디서 오류가 날 수 있을까요? 스크립트의 어느 부분을 가장 먼저 테스트하겠어요?",
        feynmanPrompt: "왜 새 가상 머신에서 테스트하는 것이 중요한지, 테스트 중 발생할 수 있는 문제들과 해결 방법을 설명해보세요.",
        systemPrompt: "학생이 dotfiles 설치 스크립트 테스트를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 깨끗한 환경에서의 테스트 필요성, 심볼릭 링크 검증(ls -l), 스크립트 권한(chmod +x), 경로 문제 디버깅. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-16",
        title: "모든 설정 파일을 dotfiles 저장소로 마이그레이션",
        problem: `현재 도구 설정들을 모두 dotfile 저장소로 옮기세요. 셸 설정, 에디터 설정, git 설정, 그리고 기타 커스터마이징한 모든 dotfile을 포함합니다.

\`\`\`bash
# 예시:
cp ~/.bashrc ~/dotfiles/.bashrc
cp ~/.vimrc ~/dotfiles/.vimrc
cp ~/.gitconfig ~/dotfiles/.gitconfig

# git으로 변경사항 추적
cd ~/dotfiles
git add .
git commit -m "Migrate existing dotfiles"
\`\`\`

가장 중요한 설정은 어떤 것들일까요? API 키나 토큰 같은 민감한 파일은 제외해야 할까요?`,
        hints: ["민감한 정보는 .gitignore에 추가하거나 환경 변수로 분리하세요", "~/.ssh/config 같은 민감한 파일은 수동으로 관리할 수 있습니다", "git add 전에 diff로 변경사항을 확인하세요"],
        socraticStarter: "지금까지 사용해온 모든 설정 파일을 dotfiles로 옮기는 이유가 뭘까요? 새 컴퓨터에서 한 번에 모든 설정을 적용하는 것이 얼마나 편할까요?",
        feynmanPrompt: "dotfiles로 마이그레이션하는 과정, 민감한 정보(API 키, 개인 설정)를 어떻게 처리할지, 왜 버전 관리가 중요한지 설명해보세요.",
        systemPrompt: "학생이 dotfiles 마이그레이션을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 기존 설정 파일 이동, .gitignore(민감한 파일 제외), git으로 버전 관리, 변경사항 검토(git diff). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-17",
        title: "GitHub에 dotfiles 저장소 공개",
        problem: `dotfiles를 위한 공개 GitHub 저장소를 만들고 설정을 거기에 푸시하세요. 이렇게 하면 어떤 머신에서든 자신의 개인화된 환경에 접근할 수 있습니다.

\`\`\`bash
# GitHub에서 새 저장소 생성 후:
cd ~/dotfiles
git remote add origin https://github.com/YOUR_USERNAME/dotfiles.git
git branch -M main
git push -u origin main
\`\`\`

README.md에 다음 내용을 포함하도록 하세요:
1. 포함된 dotfile들이 무엇인지
2. 설치 스크립트를 사용하는 방법
3. 필요한 특별한 설정 지침

예시:
\`\`\`markdown
# My Dotfiles

새 머신에 빠르게 설정하기 위한 개인화된 셸, 에디터, 도구 설정입니다.

## 설치

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/dotfiles.git
cd dotfiles
./install.sh
\`\`\`
\`\`\``,
        hints: ["민감한 정보는 공개하지 않으세요 (API 키, 개인 설정)", "README.md는 다른 사람도 이해할 수 있도록 명확하게 작성하세요", "MIT 또는 다른 오픈소스 라이선스를 추가하는 것을 고려하세요"],
        socraticStarter: "자신의 dotfiles를 공개 저장소에 올리는 것이 불안할 수 있습니다. 어떤 파일은 공개해도 되고 어떤 파일은 안 될까요? 보안과 공유 사이의 균형을 어떻게 맞출까요?",
        feynmanPrompt: "공개 dotfiles 저장소의 장점, 민감한 정보 보호 방법, README를 통한 효과적인 문서화 방법을 설명해보세요.",
        systemPrompt: "학생이 dotfiles를 GitHub에 공개하는 방법을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: GitHub 저장소 생성, git remote add, git push, README 작성(설치 방법), 민감 정보 제외(.gitignore), 오픈소스 라이선스. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      // ── SSH ──────────────────────────────────────────────────────────────
      {
        id: "2-18",
        title: "SSH 키 생성 — ed25519",
        problem: `Linux 가상 머신을 설치하거나 기존 것을 사용하세요. \`~/.ssh/\`로 이동해 SSH 키 쌍이 있는지 확인하세요. 없으면 \`ssh-keygen -a 100 -t ed25519\`로 생성하세요. 암호 문구를 사용하고 \`ssh-agent\`를 사용하기를 권장합니다. [여기](https://www.ssh.com/ssh/agent)를 참고하세요.

\`\`\`bash
ls ~/.ssh/             # 키 확인
ssh-keygen -a 100 -t ed25519 -C "my@email.com"
# → ~/.ssh/id_ed25519 (개인키)
# → ~/.ssh/id_ed25519.pub (공개키)

cat ~/.ssh/id_ed25519.pub   # 공개키 내용 확인
\`\`\`

\`-a 100\`은 무엇을 의미하나요? ed25519가 RSA보다 나은 이유는 뭔가요?`,
        hints: ["ed25519는 타원 곡선 방식으로 RSA보다 짧지만 보안이 강합니다", "-a 100은 키 유도 함수를 100번 반복해 암호화를 강화합니다", "개인키는 절대 공유하지 않고, 공개키만 서버에 등록합니다"],
        socraticStarter: "공개키와 개인키는 어떤 관계일까요? 공개키를 서버에 올리는 것이 왜 안전한지 수학적으로 설명할 수 있나요?",
        feynmanPrompt: "비대칭 키 암호화가 어떻게 작동하는지, 공개키/개인키의 역할, ed25519가 RSA보다 선호되는 이유, ssh-agent가 무엇인지 설명해보세요.",
        systemPrompt: "학생이 SSH 키 인증을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 비대칭 암호화(공개키/개인키), ed25519 vs RSA, -a 옵션(KDF 반복 횟수), ssh-agent(개인키 메모리 보관), 공개키 지문. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-19",
        title: "~/.ssh/config 설정",
        problem: `\`.ssh/config\`를 다음과 같이 편집하세요:

\`\`\`bash
Host vm
    User username_goes_here
    HostName ip_goes_here
    IdentityFile ~/.ssh/id_ed25519
    LocalForward 9999 localhost:8888
\`\`\`

이제 다음과 같이 간단히 연결할 수 있습니다:
\`\`\`bash
ssh vm   # 긴 옵션들을 매번 입력하지 않아도 됩니다
\`\`\`

config의 각 줄은 무엇을 하나요? \`LocalForward\`는 어디에 쓰이나요?`,
        hints: ["Host는 이 설정 블록의 별칭입니다 — 실제 hostname이 아닙니다", "IdentityFile은 이 호스트에 사용할 개인키를 지정합니다", "LocalForward 9999 localhost:8888은 로컬 9999 → 원격 8888 터널입니다"],
        socraticStarter: "`ssh -i ~/.ssh/id_ed25519 -L 9999:localhost:8888 user@192.168.x.x`와 `ssh vm`은 같은 일을 합니다. config 파일이 이 복잡한 명령을 어떻게 단순화하나요?",
        feynmanPrompt: "~/.ssh/config의 역할, Host/User/HostName/IdentityFile/LocalForward 각 지시어가 무엇을 하는지, SSH 터널링이 어떻게 동작하는지 설명해보세요.",
        systemPrompt: "학생이 SSH config 파일을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: ~/.ssh/config 구조(Host 블록), IdentityFile(키 선택), LocalForward(로컬 포트 → 원격 포트 터널), SSH config로 복잡한 옵션 단순화. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-20",
        title: "ssh-copy-id — 공개키를 서버에 등록",
        problem: `\`ssh-copy-id vm\`으로 공개 SSH 키를 서버에 복사하세요. 이를 통해 암호를 입력하지 않고도 키 기반 인증이 가능합니다.

\`\`\`bash
ssh-copy-id vm
# 또는 수동으로:
cat ~/.ssh/id_ed25519.pub | ssh vm 'cat >> ~/.ssh/authorized_keys'
\`\`\`

키가 성공적으로 추가되었는지 확인하세요:
\`\`\`bash
ssh vm 'cat ~/.ssh/authorized_keys'
\`\`\`

\`ssh-copy-id\`는 실제로 무엇을 했나요? 서버의 \`~/.ssh/authorized_keys\` 파일을 확인해보세요.`,
        hints: ["ssh-copy-id는 공개키를 서버의 ~/.ssh/authorized_keys에 추가합니다", "authorized_keys 파일은 서버가 신뢰하는 공개키들의 목록입니다", "이후 ssh vm으로 암호 입력 없이 접속할 수 있습니다"],
        socraticStarter: "ssh-copy-id를 실행한 후, 서버의 ~/.ssh/authorized_keys 파일에 어떤 변화가 생길까요? 왜 '인증'이라는 과정이 필요할까요?",
        feynmanPrompt: "ssh-copy-id가 하는 일, authorized_keys 파일의 역할, 공개키 인증이 비밀번호 인증보다 안전한 이유를 설명해보세요.",
        systemPrompt: "학생이 ssh-copy-id와 공개키 인증을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: ssh-copy-id 명령, authorized_keys 파일, 공개키 등록 과정, 이후 암호 없이 접속 가능. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-21",
        title: "SSH 로컬 포트 포워딩 — 웹서버 접근",
        problem: `VM에서 실행 중인 서비스에 로컬 머신에서 접근하도록 로컬 포트 포워딩을 설정하세요.

VM에서 \`python -m http.server 8888\`을 실행해 웹 서버를 시작하세요. 그 다음 SSH 로컬 포트 포워딩을 사용하여 마치 로컬 머신에서 실행 중인 것처럼 접근하세요.

\`\`\`bash
# VM에서:
python -m http.server 8888

# 로컬 머신에서 (다른 터미널):
ssh -N -L 9999:localhost:8888 vm
# 브라우저에서 http://localhost:9999 접속
\`\`\`

터널은 로컬 포트 9999를 VM의 포트 8888로 포워딩합니다. 이것이 왜 유용할까요? VM이 방화벽 뒤에 있다면 어떻게 될까요?`,
        hints: ["로컬 포트 9999로 오는 트래픽 → SSH 터널 → 원격 localhost:8888", "-N 플래그는 원격 명령 실행 없이 포트 포워딩만 수행합니다", "ssh -L를 사용하면 VM 내부의 서비스에도 접근할 수 있습니다"],
        socraticStarter: "VM의 웹서버는 8888 포트에서 실행되지만, 로컬 브라우저에서 localhost:9999로 접속합니다. 이것이 어떻게 가능한가요? 데이터 흐름을 추적해보세요.",
        feynmanPrompt: "SSH 포트 포워딩의 개념, 로컬 포트 포워딩의 동작 원리, 방화벽 뒤의 서비스에 접근하는 데 어떻게 활용되는지 설명해보세요.",
        systemPrompt: "학생이 SSH 로컬 포트 포워딩을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: -L 플래그(로컬→원격 포워딩), -N 플래그(터널 전용), localhost vs 원격 호스트, 방화벽 우회. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-22",
        title: "sshd_config — 패스워드 인증 비활성화",
        problem: `\`sudo vim /etc/ssh/sshd_config\`으로 SSH 서버 설정을 편집하고:
1. \`PasswordAuthentication\`의 값을 편집해 패스워드 인증을 비활성화하세요
2. \`PermitRootLogin\`의 값을 편집해 root 로그인을 비활성화하세요
3. \`sudo service sshd restart\`로 \`ssh\` 서비스를 재시작하세요

\`\`\`bash
# /etc/ssh/sshd_config
PasswordAuthentication no
PermitRootLogin no
\`\`\`

다시 ssh로 접속해보세요. 당신의 키를 갖지 않은 머신에서 접속을 시도하면 어떻게 될까요?`,
        hints: ["PasswordAuthentication no는 패스워드 로그인을 완전히 비활성화합니다", "sudo service sshd restart 또는 sudo systemctl restart ssh로 반영합니다", "사전에 반드시 키 기반 인증이 작동하는지 확인하세요 — 안 그러면 잠길 수 있습니다"],
        socraticStarter: "패스워드 인증을 비활성화하기 **전에** 반드시 해야 할 것이 있습니다. 무엇일까요? 순서를 잘못 밟으면 어떤 일이 생길까요?",
        feynmanPrompt: "SSH 서버 설정에서 패스워드 인증을 비활성화하는 것이 왜 보안을 강화하는지, PermitRootLogin을 비활성화하는 이유, sshd_config의 주요 설정들을 설명해보세요.",
        systemPrompt: "학생이 SSH 서버 보안 설정을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: PasswordAuthentication no(패스워드 로그인 차단), PermitRootLogin no(root 직접 로그인 차단), sshd 재시작, 잠김 방지(키 인증 먼저 확인). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-23",
        title: "(심화) mosh — 모바일 셸",
        problem: `(도전) VM에 [\`mosh\`](https://mosh.org/)를 설치하고 연결을 설정하세요. 그 다음 서버/VM의 네트워크 어댑터를 분리하세요. mosh가 제대로 복구될까요?

\`\`\`bash
# VM에 mosh 설치
sudo apt install mosh

# 로컬에서 mosh로 연결
mosh vm

# 연결 상태에서 네트워크 끊기 → 재연결 시 세션 복구?
\`\`\`

mosh가 SSH보다 네트워크 중단에 잘 대처하는 이유가 뭘까요? 어떤 프로토콜을 사용하나요?`,
        hints: ["mosh는 UDP 기반이라 네트워크 주소가 바뀌어도 세션이 유지됩니다", "SSH는 TCP 기반이라 연결이 끊기면 세션이 종료됩니다", "mosh는 서버 측에서도 mosh-server가 실행되어야 합니다"],
        socraticStarter: "SSH 세션 중에 Wi-Fi가 바뀌면 연결이 끊기는 이유가 뭘까요? mosh는 이 문제를 어떻게 해결했나요?",
        feynmanPrompt: "TCP vs UDP의 차이, SSH와 mosh가 각각 어떤 프로토콜을 쓰는지, 그리고 mosh가 네트워크 전환(Wi-Fi → LTE)에도 세션을 유지하는 원리를 설명해보세요.",
        systemPrompt: "학생이 mosh를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: TCP(연결 지향, IP 주소 변경 시 끊김) vs UDP(비연결), mosh의 SSP 프로토콜, 로밍(IP 변경 시 세션 유지), tmux와의 조합. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "2-24",
        title: "(심화) SSH -N, -f 플래그와 백그라운드 포트 포워딩",
        problem: `(도전) \`ssh\`의 \`-N\`과 \`-f\` 플래그가 무엇인지 알아보고, 백그라운드 포트 포워딩을 수행하는 명령을 찾으세요.

\`\`\`bash
# 각 플래그의 의미:
ssh -N vm      # 명령 실행 없이 포워딩만
ssh -f vm ...  # 백그라운드로 실행

# 백그라운드 포트 포워딩:
ssh -fN -L 9999:localhost:8888 vm

# 확인:
ps aux | grep ssh
\`\`\`

백그라운드 SSH 터널을 어떻게 종료하나요? 같은 명령을 두 번 실행하면 어떻게 될까요?`,
        hints: ["-N: 원격 명령 실행하지 않음 (포워딩 전용)", "-f: 백그라운드로 실행 (데몬처럼)", "pkill -f 'ssh -fN' 또는 kill <PID>로 종료"],
        socraticStarter: "`ssh -L 9999:localhost:8888 vm`을 실행하면 터미널이 블록됩니다. `-N`과 `-f`를 조합하면 이 문제가 어떻게 해결될까요?",
        feynmanPrompt: "ssh -N과 -f 플래그가 각각 무엇을 하는지, 백그라운드 SSH 터널이 어떤 상황에서 유용한지, 백그라운드 터널을 어떻게 찾아서 종료하는지 설명해보세요.",
        systemPrompt: "학생이 SSH 고급 플래그를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: -N(원격 명령 없음), -f(백그라운드), -L(로컬 포트 포워딩), -R(원격 포트 포워딩), 백그라운드 프로세스 관리(ps, pkill). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      }
    ]
  },
  {
    id: 3,
    title: "Development Environment and Tools",
    date: "1/14/26",
    accent: "#ff6b35",
    icon: "~",
    desc: "텍스트 편집기, IDE, Vim, LSP, 린터, 포매터, AI 개발 도구",
    url: "https://missing.csail.mit.edu/2026/development-environment/",
    exercises: [
      {
        id: "3-1",
        title: "Vim 모드 활성화 및 한 달 사용",
        problem: `Vim 모드를 지원하는 모든 소프트웨어(에디터, 셸 등)에서 Vim 모드를 활성화하고, 다음 한 달 동안 모든 텍스트 편집에 Vim 모드를 사용하세요. 비효율적으로 보이거나 "더 좋은 방법이 있을 텐데"라고 생각할 때마다 검색해보세요. 아마도 더 좋은 방법이 있을 겁니다.`,
        hints: ["VS Code: Vim 확장 설치, bash: set -o vi, readline: ~/.inputrc에 set editing-mode vi", "hjkl로 이동, i로 입력 모드, Esc로 일반 모드", "일단 vimtutor를 먼저 완료하는 것을 권장합니다"],
        socraticStarter: "왜 강의에서 한 달 동안 Vim 모드만 쓰라고 할까요? 처음에 느린 게 단점이 아닐까요? 장기적으로 어떤 이점이 있을까요?",
        feynmanPrompt: "Vim의 모달 편집(모드 전환) 개념이 기존 편집기와 어떻게 다른지, 왜 이 방식이 강력한지 설명해보세요.",
        systemPrompt: "학생이 Vim 모달 편집을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: Normal/Insert/Visual/Command 모드의 차이와 이유, 모달 편집의 철학, hjkl 이동의 논리, 왜 마우스 없이도 효율적인지. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "3-2",
        title: "VimGolf 도전",
        problem: `[VimGolf](https://www.vimgolf.com/)의 챌린지를 완료하세요.

VimGolf 챌린지는 시작 텍스트와 목표 텍스트를 제시하고, Vim을 사용하여 가능한 한 적은 키스트로크로 하나를 다른 것으로 변환하도록 합니다. 이는 Vim의 이동, 편집, 고급 명령에 대한 지식을 테스트합니다.`,
        hints: ["기록을 줄이려면 반복자(3dw, 5j 등)와 텍스트 오브젝트(ci\", da( 등)를 활용하세요", ":%s/old/new/g 로 전체 치환이 가능합니다", "매크로(qa...q, @a)로 반복 작업을 자동화할 수 있습니다"],
        socraticStarter: "VimGolf에서 키 입력을 줄이기 위해 어떤 전략을 썼나요? '최적' 해법을 찾는 과정에서 어떤 Vim 기능을 새로 발견했나요?",
        feynmanPrompt: "Vim의 텍스트 오브젝트(ci\", da(, yi[ 등)가 어떻게 작동하는지, 왜 이런 개념이 편집을 빠르게 만드는지 설명해보세요.",
        systemPrompt: "학생이 Vim 고급 기능을 VimGolf로 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 텍스트 오브젝트(ci\", da(), 반복자(3dw), 치환(:%s/), 매크로(q@), Vim의 언어적 구성(동사+명사). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "3-3",
        title: "IDE 확장과 언어 서버 설정",
        problem: `진행 중인 프로젝트에 IDE 확장과 언어 서버를 설정하세요. 라이브러리 함수의 정의로 이동 같은 모든 예상 기능이 올바르게 작동하는지 확인하세요. 사용할 수 있는 코드가 없으면, GitHub의 일부 오픈 소스 프로젝트([이것](https://github.com/spf13/cobra) 같은)를 사용할 수 있습니다.`,
        hints: ["VS Code의 경우: 언어별 확장 설치 후 자동으로 LSP가 활성화됩니다", "jump-to-definition: F12 또는 Ctrl+클릭", "LSP는 자동완성, 오류 표시, 정의로 이동 등을 제공합니다"],
        socraticStarter: "언어 서버(Language Server)가 없던 시절에는 각 에디터마다 언어별 플러그인을 따로 만들어야 했습니다. LSP는 이 문제를 어떻게 해결했을까요?",
        feynmanPrompt: "Language Server Protocol(LSP)이 무엇인지, IDE 확장이 어떻게 코드 이해 기능(자동완성, 정의로 이동)을 제공하는지 설명해보세요.",
        systemPrompt: "학생이 IDE와 LSP를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: LSP의 역할(에디터↔언어 서버 통신), jump-to-definition 작동 방식, 린터와 포매터의 차이(Pylance vs Ruff). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "3-4",
        title: "유용한 IDE 확장 탐색 및 설치",
        problem: `IDE 확장 목록을 탐색해보고 유용해 보이는 것 하나를 설치하세요.

탐색할 몇 가지 카테고리: 린터(shell 스크립트용 shellcheck, Python용 ruff), 포매터(black, prettier), AI 어시스턴트(GitHub Copilot, Cursor), 생산성 도구(GitLens, Todo Tree), 언어별 디버거.`,
        hints: ["VS Code Marketplace나 JetBrains Plugins에서 탐색할 수 있습니다", "shellcheck는 shell 스크립트의 버그를 찾아줍니다", "설치 후 설정이 필요한 경우가 많으니 README를 읽어보세요"],
        socraticStarter: "린터(linter)와 포매터(formatter)는 어떻게 다른가요? 둘 다 코드를 '고치는' 것 같은데, 실제로 하는 일이 다른가요?",
        feynmanPrompt: "린터와 포매터의 차이, AI 코드 도우미의 작동 방식과 한계점, 그리고 선택한 확장이 어떤 문제를 해결하는지 설명해보세요.",
        systemPrompt: "학생이 IDE 확장과 개발 도구를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 린터(오류 감지) vs 포매터(스타일 통일), LSP 기반 확장의 작동 원리, AI 자동완성의 한계(환각). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      }
    ]
  },
  {
    id: 4,
    title: "Debugging and Profiling",
    date: "1/15/26",
    accent: "#ff4757",
    icon: "!",
    desc: "디버거, rr 역방향 디버깅, AddressSanitizer, strace, LLM 디버깅, perf, hyperfine, htop",
    url: "https://missing.csail.mit.edu/2026/debugging-profiling/",
    exercises: [
      // ── DEBUGGING ──────────────────────────────────────────────────────────
      {
        id: "4-1",
        title: "머지 소트 버그 — 디버거로 찾기",
        problem: `**정렬 알고리즘 디버그**: 다음 의사 코드는 병합 정렬을 구현하지만 버그를 포함합니다. 당신이 선택한 언어로 그것을 구현하고, 디버거(\`gdb\`, \`lldb\`, \`pdb\`, 또는 당신의 IDE의 디버거)를 사용하여 버그를 찾고 수정하세요.

\`\`\`
function merge_sort(arr):
    if length(arr) <= 1:
        return arr
    mid = length(arr) / 2
    left = merge_sort(arr[0..mid])
    right = merge_sort(arr[mid..end])
    return merge(left, right)

function merge(left, right):
    result = []
    i = 0, j = 0
    while i < length(left) AND j < length(right):
        if left[i] <= right[j]:
            append result, left[i]
            i = i + 1
        else:
            append result, right[i]   ← 여기에 버그가 있습니다
            j = j + 1
    append remaining elements from left and right
    return result
\`\`\`

테스트 벡터: \`merge_sort([3, 1, 4, 1, 5, 9, 2, 6])\`은 \`[1, 1, 2, 3, 4, 5, 6, 9]\`를 반환해야 합니다.

**병합 함수에 단계별로 진행하고 잘못된 요소가 선택되는 곳을 찾기 위해 브레이크포인트를 사용하세요.**

Python으로 구현한 뒤 pdb로 디버깅하는 예:
\`\`\`bash
python -m pdb merge_sort.py
(Pdb) b merge          # merge 함수에 브레이크포인트
(Pdb) c                # breakpoint까지 실행
(Pdb) p left, right    # 변수 확인
(Pdb) n                # 한 줄 실행
\`\`\``,
        hints: ["`i`는 left 배열의 인덱스, `j`는 right 배열의 인덱스입니다", "else 브랜치에서 right 배열의 원소를 추가할 때 어떤 인덱스를 써야 할까요?", "pdb 명령: b(break), c(continue), n(next), s(step), p(print), l(list)"],
        socraticStarter: "pseudocode의 `else: append result, right[i]` 줄에서 `i`는 무엇의 인덱스인가요? `j`와 `i`가 각각 어떤 배열을 추적하는지 생각해보세요.",
        feynmanPrompt: "이 머지 소트의 버그가 정확히 무엇인지, 디버거로 어떻게 찾았는지(브레이크포인트→스텝 실행→변수 검사), 그리고 print 디버깅 vs 디버거의 차이를 설명해보세요.",
        systemPrompt: "학생이 디버거(pdb/gdb)로 알고리즘 버그를 찾는 방법을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: i(left 인덱스) vs j(right 인덱스), 버그: right[i]→right[j], pdb 기본 명령(b/c/n/s/p), 브레이크포인트와 스텝 실행의 원리. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "4-2",
        title: "rr로 역방향 디버깅 — 메모리 손상 추적",
        problem: `[\`rr\`](https://rr-project.org/)을 설치하고, 역 디버깅을 사용하여 손상 버그를 찾으세요. 이 프로그램을 \`corruption.c\`로 저장하세요:

\`\`\`c
#include <stdio.h>

typedef struct {
    int id;
    int scores[3];
} Student;

Student students[2];

void init() {
    students[0].id = 1001;
    students[0].scores[0] = 85;
    students[0].scores[1] = 92;
    students[0].scores[2] = 78;

    students[1].id = 1002;
    students[1].scores[0] = 90;
    students[1].scores[1] = 88;
    students[1].scores[2] = 95;
}

void curve_scores(int student_idx, int curve) {
    for (int i = 0; i < 4; i++) {   ← 버그: scores[3]인데 i < 4까지 반복
        students[student_idx].scores[i] += curve;
    }
}

int main() {
    init();
    curve_scores(0, 5);

    if (students[1].id != 1002) {
        printf("ERROR: Student 1's ID was corrupted! Got %d\\n",
               students[1].id);
        return 1;
    }
    return 0;
}
\`\`\`

\`\`\`bash
gcc -g corruption.c -o corruption
./corruption    # 에러 발생

rr record ./corruption
rr replay
# GDB에서:
(gdb) watch students[1].id        # watchpoint 설정
(gdb) c                           # 실행
(gdb) reverse-continue            # 역방향으로 실행 → 손상 지점 찾기
\`\`\`

\`gcc -g corruption.c -o corruption\`로 컴파일하고, 실행하세요. 학생 1의 ID가 손상되지만, 손상은 학생 0에만 접촉하는 함수에서 일어납니다. \`rr record ./corruption\`과 \`rr replay\`를 사용하여 범인을 찾으세요. \`students[1].id\`에 watchpoint를 설정하고, 손상 후 \`reverse-continue\`를 사용하여 정확히 어떤 코드 라인이 그것을 덮어씌웠는지 찾으세요.`,
        hints: ["scores 배열은 크기가 3이지만 루프는 i < 4 까지 돕니다 (off-by-one)", "students[0].scores[3]은 메모리 상 students[1].id 위치를 침범합니다", "rr replay에서 watch + reverse-continue로 정확한 손상 줄을 찾습니다"],
        socraticStarter: "`curve_scores`는 student 0의 데이터만 건드리는 것처럼 보입니다. 그런데 왜 student 1의 ID가 손상될까요? `scores[3]`이 메모리 상 어디에 있을지 생각해보세요.",
        feynmanPrompt: "off-by-one 버그가 왜 다른 구조체 멤버를 손상시킬 수 있는지, rr의 record-replay 디버깅이 기존 디버거와 어떻게 다른지, watchpoint + reverse-continue가 왜 강력한지 설명해보세요.",
        systemPrompt: "학생이 rr record-replay 디버깅을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: off-by-one 버그(i<4 vs i<3), 메모리 레이아웃(구조체 배열 연속 배치), rr의 결정론적 재현, watch 명령, reverse-continue로 손상 지점 역추적. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "4-3",
        title: "AddressSanitizer로 Use-After-Free 탐지",
        problem: `AddressSanitizer로 메모리 오류를 디버그하세요. 이를 \`uaf.c\`로 저장하세요:

\`\`\`c
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

int main() {
    char *greeting = malloc(32);
    strcpy(greeting, "Hello, world!");
    printf("%s\\n", greeting);

    free(greeting);

    greeting[0] = 'J';        ← free 이후 접근!
    printf("%s\\n", greeting);

    return 0;
}
\`\`\`

\`\`\`bash
# 1단계: 일반 컴파일 — 아무 문제 없어 보임
gcc uaf.c -o uaf && ./uaf

# 2단계: ASan으로 컴파일
gcc -fsanitize=address -g uaf.c -o uaf && ./uaf
\`\`\`

먼저 sanitizer 없이 컴파일하고 실행하세요: \`gcc uaf.c -o uaf && ./uaf\`. 그것이 작동하는 것처럼 보일 수 있습니다. 이제 AddressSanitizer로 컴파일하세요: \`gcc -fsanitize=address -g uaf.c -o uaf && ./uaf\`. 오류 보고를 읽으세요. ASan이 어떤 버그를 찾습니까? 그것이 식별하는 문제를 수정하세요.`,
        hints: ["Use-After-Free: free() 이후에 포인터를 통해 메모리 접근", "ASan 리포트는 할당 위치(malloc), 해제 위치(free), 재접근 위치를 모두 알려줍니다", "수정: 접근하거나 포인터를 NULL로 설정하거나 free 시점을 옮기세요"],
        socraticStarter: "`gcc uaf.c -o uaf && ./uaf`를 실행하면 정상 작동하는 것처럼 보입니다. 그런데 `free()` 이후에 메모리에 접근하는 것은 왜 위험한가요? '우연히 작동'하는 것은 왜 더 무서운 걸까요?",
        feynmanPrompt: "Use-After-Free 버그가 무엇인지, 왜 sanitizer 없이는 발견하기 어려운지, AddressSanitizer가 어떻게 메모리 접근을 감지하는지(shadow memory) 설명해보세요.",
        systemPrompt: "학생이 메모리 오류와 AddressSanitizer를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: Use-After-Free(UAF), malloc/free 원리, ASan의 shadow memory 기법, -fsanitize=address 플래그, 정의되지 않은 동작(UB)이 왜 위험한지. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "4-4",
        title: "strace / dtruss로 시스템 콜 추적",
        problem: `\`strace\`(Linux) 또는 \`dtruss\`(macOS)를 사용하여 \`ls -l\` 같은 명령으로 만들어지는 시스템 호출들을 추적하세요. 그것이 어떤 시스템 호출들을 만들고 있습니까? 더 복잡한 프로그램을 추적하고 그것이 어떤 파일들을 열고 있는지 보세요.

\`\`\`bash
# ls -l이 어떤 시스템 콜을 하는지 추적
strace ls -l 2>&1 | head -30

# 특정 시스템 콜만 필터링 (-e trace=)
strace -e trace=openat,read,write ls -l 2>&1 | head -20

# 더 복잡한 프로그램 추적
strace python -c "import os; os.listdir('.')" 2>&1 | grep openat

# 이미 실행 중인 프로세스에 attach
strace -p <PID>
\`\`\`

What files does \`ls\` open? What about \`python\`? Can you see it reading its libraries?`,
        hints: ["strace 출력은 stderr로 나옵니다 — 2>&1으로 stdout에 합쳐야 grep 가능", "openat() 콜을 보면 어떤 파일을 여는지 알 수 있습니다", "mmap, brk는 메모리 관련, read/write는 IO, execve는 프로그램 실행"],
        socraticStarter: "`strace ls -l`의 출력에서 `openat`, `read`, `write` 시스템 콜들이 보입니다. 이 중 ls가 실제로 디렉터리를 나열하기 위해 핵심적으로 필요한 콜은 어떤 것들일까요?",
        feynmanPrompt: "시스템 콜이 무엇인지(유저 공간 vs 커널 공간), strace가 어떻게 시스템 콜을 가로채는지(ptrace), ls 명령이 디렉터리를 나열하기 위해 어떤 콜 시퀀스를 사용하는지 설명해보세요.",
        systemPrompt: "학생이 strace와 시스템 콜을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 시스템 콜(user→kernel 경계), strace의 ptrace 메커니즘, openat/read/write/mmap 주요 콜, strace 출력이 stderr로 나오는 이유. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "4-5",
        title: "LLM으로 난해한 에러 메시지 디버깅",
        problem: `암호화된 오류 메시지를 디버그하는 데 도움을 주기 위해 LLM을 사용하세요.

다음 시나리오들을 시도해보세요:
1. **C++ 템플릿 에러**: 복잡한 C++ 템플릿 오류를 LLM에 붙여넣고 설명과 수정을 요청하세요
2. **Rust 컴파일 에러**: borrow checker 오류를 LLM에 설명 요청
3. **strace 출력 해석**: 이전 연습의 strace 출력 일부를 LLM에 붙여넣어 해석 요청
4. **ASan 리포트 분석**: AddressSanitizer 에러 리포트를 LLM에 붙여넣어 근본 원인 분석 요청

\`\`\`bash
# C++ 템플릿 에러 예시 생성
cat > example.cpp << 'EOF'
#include <vector>
#include <algorithm>
int main() {
    std::vector<int> v = {3, 1, 4};
    std::sort(v);  // 의도적 버그
}
EOF
g++ example.cpp 2>&1  # 에러 메시지를 LLM에 붙여넣기
\`\`\`

LLM이 이 작업에 특히 유용한 이유는 무엇인가요? LLM의 한계는 무엇인가요?`,
        hints: ["LLM은 특히 길고 난해한 에러 메시지를 '번역'하는 데 탁월합니다", "strace나 ASan 출력의 일부(처음 몇 줄)만 붙여넣어도 유용합니다", "LLM이 틀릴 수 있으니 항상 제안된 수정을 이해하고 검증하세요"],
        socraticStarter: "LLM에게 에러 메시지를 설명해달라고 할 때, 단순히 '이 에러가 뭐야?'보다 더 좋은 방법이 있을까요? 어떤 컨텍스트를 함께 제공하면 더 정확한 도움을 받을 수 있을까요?",
        feynmanPrompt: "LLM이 에러 메시지 해석에 특히 유용한 이유(패턴 인식, 방대한 학습 데이터), 언제 LLM의 도움을 받아야 하는지, 그리고 LLM의 한계와 위험(hallucination)을 설명해보세요.",
        systemPrompt: "학생이 LLM을 디버깅 도구로 활용하는 방법을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: LLM의 강점(복잡한 에러 해석), 효과적인 프롬프트 작성(컨텍스트 제공), LLM의 한계(hallucination, 최신 정보 부재), 검증의 중요성. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      // ── PROFILING ──────────────────────────────────────────────────────────
      {
        id: "4-6",
        title: "perf stat으로 성능 카운터 측정",
        problem: `\`perf stat\`을 사용하여 당신이 선택한 프로그램에 대한 기본 성능 통계를 얻으세요. 다양한 카운터들이 의미하는 것은 무엇입니까?

\`\`\`bash
# 기본 통계
perf stat ls -la /usr/bin

# 더 많은 카운터
perf stat -d ls -la /usr/bin

# 자주 실행해서 평균 내기
perf stat -r 5 ls -la /usr/bin
\`\`\`

주요 카운터의 의미:
- **task-clock**: CPU가 실제로 사용된 시간(ms)
- **context-switches**: 스케줄러가 프로세스를 전환한 횟수
- **cache-misses**: CPU 캐시 미스 횟수
- **instructions**: 실행된 CPU 명령 수
- **cycles**: CPU 사이클 수 → IPC = instructions/cycles

계산 집약적인 프로그램과 IO 집약적인 프로그램에 \`perf stat\`을 실행해보세요. 어떤 차이가 나타날까요?`,
        hints: ["높은 cache-miss 비율은 메모리 접근 패턴이 비효율적임을 나타냅니다", "IPC(Instructions Per Cycle)가 낮으면 메모리 병목이 의심됩니다", "context-switch가 많으면 프로세스가 자주 IO 대기 상태에 빠짐"],
        socraticStarter: "`perf stat` 출력에서 'instructions'과 'cycles'의 비율(IPC)이 0.5라면 무엇을 의미할까요? 높은 IPC와 낮은 IPC 중 어느 게 더 좋은 건가요?",
        feynmanPrompt: "perf stat의 주요 카운터(task-clock, cache-misses, IPC, context-switches)가 각각 무엇을 측정하는지, 그리고 이 수치들로 프로그램의 어떤 특성을 파악할 수 있는지 설명해보세요.",
        systemPrompt: "학생이 perf stat 성능 분석을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: Hardware Performance Counter(HPC), IPC(명령/사이클 비율), cache locality, context switch, CPU-bound vs IO-bound 프로그램의 perf stat 차이. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "4-7",
        title: "perf record로 핫스팟 프로파일링",
        problem: `\`perf record\`로 프로파일하세요. 이를 \`slow.c\`로 저장하세요:

\`\`\`c
#include <math.h>
#include <stdio.h>

double slow_computation(int n) {
    double result = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < 1000; j++) {
            result += sin(i * j) * cos(i + j);
        }
    }
    return result;
}

int main() {
    double r = 0;
    for (int i = 0; i < 100; i++) {
        r += slow_computation(1000);
    }
    printf("Result: %f\\n", r);
    return 0;
}
\`\`\`

\`\`\`bash
gcc -g -O2 slow.c -o slow -lm
perf record -g ./slow       # 콜 그래프 포함 기록
perf report                 # 결과 보기
\`\`\`

디버그 기호들로 컴파일하세요: \`gcc -g -O2 slow.c -o slow -lm\`. \`perf record -g ./slow\`을 실행하고, 그 다음 \`perf report\`를 실행하여 시간이 어디에 보내지는지를 봅니다. flamegraph 스크립트를 사용하여 플레임 그래프를 생성해 보세요.`,
        hints: ["perf report에서 어떤 함수가 가장 많은 샘플(%)을 차지하는지 확인하세요", "flamegraph: perf script | ./stackcollapse-perf.pl | ./flamegraph.pl > perf.svg", "sin/cos 같은 수학 함수는 CPU 사이클을 많이 소비합니다"],
        socraticStarter: "`perf report`에서 CPU 시간의 대부분이 어느 함수에서 소비되나요? slow_computation 자체인가요, 아니면 그 안에서 호출하는 라이브러리 함수인가요?",
        feynmanPrompt: "sampling profiler가 어떻게 작동하는지(정기적 샘플링), perf report의 call graph 출력을 읽는 방법, 그리고 flame graph가 무엇인지, 어떻게 핫스팟을 시각화하는지 설명해보세요.",
        systemPrompt: "학생이 perf record 프로파일링을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: sampling profiler의 원리(주기적 PC 샘플), perf report의 %CPU와 call graph, flame graph(x=시간 비율, y=호출 스택), 최적화 전 프로파일링의 중요성. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "4-8",
        title: "hyperfine으로 두 구현 벤치마크 비교",
        problem: `\`hyperfine\`을 사용하여 같은 작업의 두 개의 다양한 구현을 벤치마크하세요(예: \`find\` vs \`fd\`, \`grep\` vs \`ripgrep\`, 또는 당신 자신의 코드의 두 버전들).

\`\`\`bash
# find vs fd 비교
hyperfine 'find /usr -name "*.py"' 'fd -e py . /usr'

# grep vs ripgrep 비교
hyperfine 'grep -r "TODO" /usr/share/doc' 'rg "TODO" /usr/share/doc'

# 워밍업 포함, 내보내기
hyperfine --warmup 3 \
  'grep -r "import" ~/projects' \
  'rg "import" ~/projects' \
  --export-markdown results.md
\`\`\`

hyperfine은 왜 명령을 여러 번 실행할까요? mean 시간과 min 시간의 차이는 무엇일까요? "warmup"은 무엇일까요?`,
        hints: ["hyperfine은 자동으로 여러 번 실행해 통계적으로 유의미한 결과를 냅니다", "파일시스템 캐시 때문에 첫 실행이 느릴 수 있습니다 — warmup이 이를 고려합니다", "--export-markdown, --export-json으로 결과를 저장할 수 있습니다"],
        socraticStarter: "프로그램 실행 시간을 측정할 때 `time ./program`을 한 번 실행하는 것으로 충분할까요? 왜 hyperfine은 같은 프로그램을 여러 번 실행할까요?",
        feynmanPrompt: "벤치마킹에서 통계적 유의성이 왜 중요한지, 파일시스템 캐시가 측정에 어떤 영향을 주는지, warmup이 왜 필요한지, 그리고 mean time vs min time 중 어느 게 더 의미 있는지 설명해보세요.",
        systemPrompt: "학생이 hyperfine 벤치마킹을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 통계적 벤치마킹(mean/stddev), 파일시스템 캐시 효과(warm vs cold), warmup 실행, min vs mean time의 의미, 측정 노이즈 원인. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "4-9",
        title: "htop + taskset — CPU affinity와 스케줄링",
        problem: `자원 집약적인 프로그램을 실행하는 동안 \`htop\`을 사용하여 당신의 시스템을 모니터하세요. \`taskset\`을 사용하여 프로세스가 사용할 수 있는 CPU들을 제한해 보세요:

\`\`\`bash
# stress 설치 (없다면)
sudo apt install stress htop

# 3개 스레드를 CPU 0, 2 두 개에만 제한
taskset --cpu-list 0,2 stress -c 3

# htop에서 관찰: F2(Setup) → Display Options → Tree view 켜기
# CPU 열 확인: 어느 코어에서 실행되는지?
\`\`\`

**\`stress\`가 3개의 CPU들을 사용하지 않는 이유는 무엇인가요?** (허용된 CPU는 2개인데, 스레드는 3개)

htop에서 주요 항목:
- **Load average**: 실행 큐의 평균 프로세스 수 (1/5/15분)
- **MEM**: 물리 메모리 사용량
- **VIRT/RES/SHR**: 가상/거주/공유 메모리
- **CPU%**: 코어별 사용률`,
        hints: ["taskset --cpu-list 0,2 는 CPU 0번과 2번만 허용합니다 (2개 코어)", "3개 스레드가 2개 CPU로 제한되면 스케줄러가 시분할로 처리합니다", "htop에서 F5(Tree)로 프로세스 트리 보기, F6으로 정렬"],
        socraticStarter: "3개 스레드를 2개 CPU에 제한하면 htop에서 어떤 현상이 나타날까요? 각 CPU가 100%를 넘을 수 있나요? 스레드 3개는 어떻게 2개 코어에 나눠질까요?",
        feynmanPrompt: "CPU affinity(taskset)가 무엇인지, 스케줄러가 CPU 제한을 어떻게 처리하는지, htop의 주요 지표(load average, CPU%, RES)를 해석하는 방법을 설명해보세요.",
        systemPrompt: "학생이 htop과 CPU affinity를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: taskset(CPU 친화성 설정), 스레드 스케줄링(타임슬라이싱), htop 지표(load average, CPU per core, RES vs VIRT), 왜 stress가 3개 CPU를 못 쓰는지(2개로 제한). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "4-10",
        title: "포트 충돌 프로세스 찾기 — ss와 kill",
        problem: `일반적인 문제는 당신이 리스닝하고 싶은 포트가 이미 다른 프로세스에 의해 차지되었다는 것입니다. 그 프로세스를 발견하는 방법을 배우세요:

\`\`\`bash
# 1단계: 포트 4444에 웹서버 시작
python -m http.server 4444

# 2단계: 다른 터미널에서 사용 중인 프로세스 찾기
ss -tlnp | grep 4444

# 3단계: PID로 종료
kill <PID>

# 대안 방법들:
lsof -i :4444           # lsof로 찾기
fuser 4444/tcp          # fuser로 찾기
fuser -k 4444/tcp       # fuser로 직접 종료
\`\`\`

"주소가 이미 사용 중"이라는 오류가 발생하는 경우는 언제일까요? \`ss\`와 \`netstat\`의 차이는 무엇일까요?`,
        hints: ["ss는 netstat의 현대적 대체제입니다 (-tlnp: TCP, listening, numeric, process)", "lsof -i :PORT는 특정 포트를 사용하는 프로세스를 보여줍니다", "TIME_WAIT 상태의 소켓은 포트를 잠시 점유하므로 바로 재시작이 안 될 수 있습니다"],
        socraticStarter: "`python -m http.server 4444`를 두 번 실행하면 두 번째 실행이 실패합니다. 에러 메시지는 무엇이고, OS가 왜 같은 포트를 두 프로세스가 사용하도록 허용하지 않을까요?",
        feynmanPrompt: "소켓 바인딩이 무엇인지, 왜 한 포트에 한 프로세스만 listen할 수 있는지, ss 명령의 주요 플래그(-tlnp), 그리고 `kill`과 `fuser -k`의 차이를 설명해보세요.",
        systemPrompt: "학생이 네트워크 포트 관리를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 소켓 바인딩(포트 독점), ss -tlnp 출력 해석, lsof -i, kill PID, TIME_WAIT 상태. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      }
    ]
  },
  {
    id: 5,
    title: "Version Control and Git",
    date: "1/16/26",
    accent: "#a29bfe",
    icon: "@",
    desc: "Git 데이터 모델, 브랜치, 머지, 원격 저장소, 고급 Git 명령",
    url: "https://missing.csail.mit.edu/2026/version-control/",
    exercises: [
      {
        id: "5-1",
        title: "Pro Git 읽기 또는 Learn Git Branching",
        problem: `Git을 처음 배우신다면, [Pro Git](https://git-scm.com/book/en/v2)의 처음 몇 장을 읽거나 [Learn Git Branching](https://learngitbranching.js.org/) 같은 튜토리얼을 진행해보세요. 진행하면서 Git 명령들을 데이터 모델과 연결시켜 보세요.

Git의 데이터 모델:
- **blob**: 파일(바이트 배열)
- **tree**: 디렉터리(이름을 blob이나 tree에 매핑)
- **commit**: 부모, 작성자, 메시지, 최상위 tree가 있는 스냅샷
- **reference**: 커밋을 가리키는 가변 포인터(브랜치, HEAD)`,
        hints: ["commit = 스냅샷 + 부모 + 메타데이터", "브랜치는 특정 커밋을 가리키는 가변 포인터입니다", "HEAD는 현재 체크아웃된 위치를 나타냅니다"],
        socraticStarter: "Git에서 파일을 '저장'하면 실제로 어떤 일이 벌어질까요? commit은 단순히 변경사항(diff)을 저장하는 건가요, 아니면 전체 스냅샷을 저장하는 건가요?",
        feynmanPrompt: "Git의 데이터 모델(blob/tree/commit/reference)을 설명하고, `git commit`을 실행했을 때 내부적으로 어떤 객체들이 생성되는지 설명해보세요.",
        systemPrompt: "학생이 Git의 데이터 모델을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: blob(파일)/tree(디렉터리)/commit(스냅샷)/reference(브랜치/HEAD), content-addressing(SHA-1), DAG(방향 비순환 그래프). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "5-2",
        title: "클래스 웹사이트 저장소 탐색",
        problem: `[클래스 웹사이트 저장소](https://github.com/missing-semester/missing-semester)를 clone하세요.

1. 버전 이력을 그래프로 시각화하여 탐색해보세요: \`git log --all --graph --decorate --oneline\`
2. \`README.md\`를 마지막으로 수정한 사람은 누구인가요? (힌트: \`git log\`를 인수와 함께 사용)
3. \`_config.yml\`의 \`collections:\` 라인을 마지막으로 수정한 커밋 메시지는 무엇인가요? (힌트: \`git blame\`과 \`git show\` 사용)`,
        hints: ["`git log --all --graph --decorate --oneline`으로 DAG 시각화", "`git log -- README.md`로 특정 파일 이력 확인", "`git blame _config.yml`로 각 줄을 마지막 수정한 커밋 확인, 그 다음 `git show <hash>`"],
        socraticStarter: "`git blame _config.yml`의 출력에서 각 줄 앞에 있는 해시값과 날짜가 뭘 의미하는지 설명해보세요. 어떻게 `collections:` 줄을 찾을 수 있을까요?",
        feynmanPrompt: "git log, git blame, git show 각각이 무엇을 보여주는지, 그리고 이 도구들을 조합해서 코드 변경 이력을 추적하는 방법을 설명해보세요.",
        systemPrompt: "학생이 git log/blame/show를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: git log(이력 탐색), git log -- file(파일별 이력), git blame(줄별 마지막 수정), git show <hash>(커밋 내용). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "5-3",
        title: "대용량 파일 이력에서 삭제",
        problem: `Git을 배울 때 흔한 실수는 Git으로 관리되어야 하지 않는 큰 파일을 커밋하거나 민감한 정보를 추가하는 것입니다. 저장소에 파일을 추가하고, 몇 가지 커밋을 한 후, 최신 커밋만이 아니라 **이력에서** 그 파일을 완전히 제거해보세요.

You may want to look at [this guide](https://help.github.com/articles/removing-sensitive-data-from-a-repository/) (using \`git filter-repo\` or BFG).`,
        hints: ["`git rm file`은 워킹 트리에서만 삭제됩니다 — 이력에는 남아있습니다", "`git filter-repo --path file --invert-paths`로 이력에서 완전히 삭제", "이미 원격에 push된 경우 force push가 필요합니다 (`git push --force`)"],
        socraticStarter: "`git rm sensitive.txt && git commit`을 했을 때 파일이 이력에서 완전히 사라질까요? 이전 커밋을 checkout하면 어떻게 될까요?",
        feynmanPrompt: "Git이 변경 불가능한 객체(immutable objects)를 사용하기 때문에 이력 삭제가 왜 어려운지, git filter-repo가 내부적으로 무엇을 하는지 설명해보세요.",
        systemPrompt: "학생이 Git 이력 수정을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: git rm vs 이력 삭제, commits의 불변성(immutability), git filter-repo, 이미 push된 경우의 force push 위험성. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "5-4",
        title: "git stash 이해하기",
        problem: `GitHub에서 어떤 저장소를 clone하고 기존 파일 중 하나를 수정하세요. \`git stash\`를 했을 때 무엇이 일어나나요? \`git log --all --oneline\`을 실행했을 때 뭐가 보이나요? \`git stash pop\`을 실행해서 \`git stash\`의 효과를 취소해보세요.

어떤 시나리오에서 이것이 유용할까요?`,
        hints: ["git stash는 작업 중인 변경사항을 임시로 저장합니다", "`git log --all --oneline`에서 stash 항목을 볼 수 있습니다", "git stash pop은 저장된 변경사항을 복원합니다"],
        socraticStarter: "`git stash`를 실행하면 워킹 디렉터리의 변경사항이 어디로 가는 걸까요? `git log --all --oneline`에서 무엇을 볼 수 있나요?",
        feynmanPrompt: "git stash가 무엇을 하는지, 언제 유용한지(예: 긴급 버그 수정이 필요할 때), stash와 브랜치의 차이를 설명해보세요.",
        systemPrompt: "학생이 git stash를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: stash의 역할(WIP 임시 저장), stash stack, git stash pop vs apply, 실제 사용 시나리오(브랜치 전환 전 변경사항 보관). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "5-5",
        title: "git graph 별칭 설정",
        problem: `많은 커맨드라인 도구들처럼 Git도 \`~/.gitconfig\`라는 구성 파일을 제공합니다. \`git graph\`를 실행했을 때 \`git log --all --graph --decorate --oneline\`의 출력을 얻도록 \`~/.gitconfig\`에 별칭을 만들어보세요.

You can do this by directly editing the \`~/.gitconfig\` file, or you can use the \`git config\` command:
\`\`\`bash
git config --global alias.graph "log --all --graph --decorate --oneline"
\`\`\``,
        hints: ["~/.gitconfig 파일의 [alias] 섹션에 추가합니다", "`git config --global`은 전역 설정에 적용됩니다", "alias 설정 후 `git graph`를 실행하면 됩니다"],
        socraticStarter: "`git log --all --graph --decorate --oneline`의 각 플래그가 무엇을 하는지 설명해보세요. 왜 이 조합이 유용한가요?",
        feynmanPrompt: "git alias가 무엇인지, ~/.gitconfig의 구조, 그리고 `git log --all --graph --decorate --oneline`의 각 플래그가 무엇을 보여주는지 설명해보세요.",
        systemPrompt: "학생이 git alias와 gitconfig를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: ~/.gitconfig 구조([alias] 섹션), git config --global, log 플래그(--all: 모든 브랜치, --graph: ASCII 그래프, --decorate: 참조 이름, --oneline: 한줄 출력). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "5-6",
        title: "전역 gitignore 설정",
        problem: `\`git config --global core.excludesfile ~/.gitignore_global\`을 실행한 후 \`~/.gitignore_global\`에서 전역 무시 패턴을 정의할 수 있습니다. 이것은 Git이 사용할 전역 무시 파일의 위치를 설정하지만, 당신은 여전히 그 경로에 파일을 수동으로 만들어야 합니다. 전역 gitignore 파일을 설정해서 \`.DS_Store\` 같은 OS 특화 또는 에디터 특화 임시 파일들을 무시하도록 해보세요.`,
        hints: ["~/.gitignore_global 파일을 직접 생성해야 합니다", ".DS_Store는 macOS가 생성하는 파일입니다", ".gitignore에 일반적으로 포함하는 패턴: *.pyc, __pycache__/, .DS_Store, Thumbs.db, .env"],
        socraticStarter: "`.gitignore`와 `~/.gitignore_global`의 차이가 뭔가요? 어떤 파일은 프로젝트별 .gitignore에, 어떤 건 전역 gitignore에 넣어야 할까요?",
        feynmanPrompt: ".gitignore가 어떻게 작동하는지, 전역 gitignore가 왜 필요한지, .DS_Store 같은 파일들을 왜 Git이 추적하면 안 되는지 설명해보세요.",
        systemPrompt: "학생이 .gitignore를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: .gitignore 패턴 매칭, 프로젝트별 vs 전역 gitignore, OS/에디터별 임시 파일(.DS_Store, *.pyc), core.excludesfile 설정. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "5-7",
        title: "Pull Request로 오픈소스 기여",
        problem: `[클래스 웹사이트 저장소](https://github.com/missing-semester/missing-semester)를 fork하고, 오타나 다른 개선 사항을 찾아서 GitHub에서 pull request를 제출해보세요. [이 가이드](https://github.com/firstcontributions/first-contributions)가 도움될 것입니다.

유용한 PR만 제출해주세요(스팸은 금지!). 개선할 사항을 찾을 수 없다면 이 연습을 건너뛰어도 됩니다.`,
        hints: ["Fork → 내 계정에 복사본 생성", "브랜치 생성 → 수정 → 커밋 → push → PR 생성", "PR 제목과 설명을 명확하게 작성하세요"],
        socraticStarter: "GitHub의 Fork와 Clone의 차이가 뭔가요? 왜 직접 원본 저장소에 push하지 않고 Fork를 사용하나요?",
        feynmanPrompt: "GitHub의 Pull Request 워크플로우(Fork → Branch → Commit → PR)가 왜 오픈소스 협업에 효과적인지, fork와 원본 저장소의 관계를 설명해보세요.",
        systemPrompt: "학생이 GitHub PR 워크플로우를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: Fork vs Clone, branch 전략, git push origin branch, GitHub PR 생성 과정, upstream 동기화(fetch + merge). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "5-8",
        title: "머지 충돌 해결 실습",
        problem: `협업 시나리오를 시뮬레이션해서 병합 충돌 해결을 연습해보세요:

1. \`git init\`으로 새로운 저장소를 만들고 몇 줄을 포함한 \`recipe.txt\` 파일을 만드세요(예: 간단한 레시피). 이를 커밋하세요.
2. 두 개의 분기를 만드세요: \`git branch salty\`와 \`git branch sweet\`.
3. \`salty\` 분기에서 라인을 수정하세요(예: "1 cup sugar"를 "1 cup salt"로) 그리고 커밋하세요.
4. \`sweet\` 분기에서 같은 라인을 다르게 수정하세요(예: "1 cup sugar"를 "2 cups sugar"로) 그리고 커밋하세요.
5. 이제 \`master\`로 전환하고 \`git merge salty\`를 시도한 후 \`git merge sweet\`를 시도해보세요. 무엇이 일어나나요?`,
        hints: ["같은 줄이 두 브랜치에서 다르게 수정되면 충돌이 발생합니다", "충돌 표시: <<<<<<< HEAD, =======, >>>>>>> branch-name", "충돌 해결 후 git add + git commit으로 마무리합니다"],
        socraticStarter: "머지 충돌이 발생했을 때 파일 안에 나타나는 `<<<<<<<`, `=======`, `>>>>>>>` 표시가 각각 무엇을 의미하는지 설명해보세요.",
        feynmanPrompt: "Git이 머지 충돌을 어떻게 감지하는지, 충돌을 해결하는 과정(파일 편집 → git add → git commit), 그리고 3-way merge가 무엇인지 설명해보세요.",
        systemPrompt: "학생이 Git 머지 충돌 해결을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 머지 충돌 발생 조건(같은 줄 다른 수정), 충돌 마커(<<<, ===, >>>), 해결 과정(수동 편집→add→commit), 3-way merge vs fast-forward. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════════
  //  LECTURE 6 — Packaging and Shipping Code
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 6,
    title: "패키징과 코드 배포",
    date: "1/20/26",
    accent: "#fd9644",
    icon: "⬡",
    desc: "의존성 관리, 가상환경, 패키징, 버전 관리, Docker, 컨테이너, PyPI 배포",
    url: "https://missing.csail.mit.edu/2026/shipping-code/",
    exercises: [
      {
        id: "6-1",
        title: "venv 활성화 전후 환경 비교",
        problem: `\`printenv\`로 환경을 파일에 저장하고, venv를 생성하고, 활성화한 다음, \`printenv\`를 다른 파일에 저장하고 \`diff before.txt after.txt\`를 하세요. 환경에서 무엇이 바뀌었나요? 왜 쉘이 venv를 선호하나요? (\`$PATH\` 변경 전후를 보세요.) \`which deactivate\`를 실행하고 deactivate bash 함수가 무엇을 하는지 생각해보세요.

\`\`\`bash
printenv > before.txt

python -m venv venv
source venv/bin/activate

printenv > after.txt
diff before.txt after.txt

which deactivate   # 결과는? 왜?
type deactivate    # 함수의 실제 내용 보기
\`\`\``,
        hints: ["`$PATH`의 변화를 주목하세요 — venv의 bin 디렉터리가 맨 앞에 추가됩니다", "`deactivate`는 파일이 아닌 쉘 함수입니다 — 그래서 `which`가 찾지 못합니다", "`VIRTUAL_ENV` 환경 변수가 새로 생기는 것을 확인하세요"],
        socraticStarter: "`diff before.txt after.txt`를 실행했을 때 `PATH` 변수가 어떻게 바뀌었나요? venv가 Python 명령을 '가로채는' 원리가 무엇인지 추측해보세요.",
        feynmanPrompt: "Python venv가 어떻게 작동하는지(PATH 조작), deactivate가 왜 일반 프로그램이 아닌 쉘 함수인지, 그리고 가상환경이 왜 '의존성 지옥'을 해결하는지 설명해보세요.",
        systemPrompt: "학생이 Python 가상환경(venv)의 작동 원리를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: PATH 수정으로 python/pip 명령을 가로채는 원리, VIRTUAL_ENV 환경 변수, deactivate가 쉘 함수인 이유(자식 프로세스는 부모 환경 변경 불가), 의존성 격리. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "6-2",
        title: "pyproject.toml로 Python 패키지 생성 및 설치",
        problem: `\`pyproject.toml\`을 사용하여 Python 패키지를 생성하고 가상 환경에 설치하세요. lock 파일을 생성하고 검사하세요.

\`\`\`bash
# 1. 프로젝트 구조 생성
mkdir mypackage && cd mypackage
mkdir src/mypackage -p
touch src/mypackage/__init__.py
touch src/mypackage/greet.py
\`\`\`

\`pyproject.toml\` 예시:
\`\`\`toml
[project]
name = "mypackage"
version = "0.1.0"
description = "My first package"
requires-python = ">=3.11"
dependencies = ["requests"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
\`\`\`

\`\`\`bash
# 2. 가상환경 생성 및 설치
python -m venv venv && source venv/bin/activate
pip install -e .          # editable install

# 3. lock 파일 생성 (uv 사용)
pip install uv
uv pip compile pyproject.toml -o requirements.lock
cat requirements.lock     # 검사
\`\`\``,
        hints: ["`pip install -e .`은 'editable install'로 소스를 복사하지 않고 직접 참조합니다", "`pyproject.toml`의 `dependencies`는 느슨한 제약(>=)을 지정하고, lock 파일은 정확한 버전을 고정합니다", "`uv pip compile`은 모든 의존성의 해결된 정확한 버전을 lock 파일에 기록합니다"],
        socraticStarter: "`pip install -e .`의 `-e` 플래그는 무엇을 의미할까요? 일반 `pip install .`과 어떻게 다른지, 개발 중에 왜 editable install이 유용한지 생각해보세요.",
        feynmanPrompt: "`pyproject.toml`의 역할(메타데이터 + 빌드 시스템 명세), editable install의 원리(소스 직접 참조), 그리고 lock 파일이 왜 재현성을 보장하는지 설명해보세요.",
        systemPrompt: "학생이 Python 패키지 생성과 pyproject.toml을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: pyproject.toml(PEP 621 메타데이터 표준), editable install(-e, 소스 직접 참조), 느슨한 제약 vs lock 파일, uv pip compile로 재현 가능한 환경 고정. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "6-3",
        title: "Docker로 Missing Semester 웹사이트 로컬 빌드",
        problem: `Docker를 설치하고 docker compose를 사용하여 Missing Semester 클래스 웹사이트를 로컬에서 빌드하세요.

\`\`\`bash
# 1. Missing Semester 저장소 클론
git clone https://github.com/missing-semester/missing-semester
cd missing-semester

# 2. 저장소에 있는 docker-compose 파일 확인
cat docker-compose.yml   # 또는 Dockerfile 확인

# 3. Docker로 빌드 및 실행
docker compose up --build

# 또는 Dockerfile이 있다면:
docker build -t missing-semester .
docker run -p 4000:4000 missing-semester
\`\`\`

브라우저에서 \`http://localhost:4000\`을 열어 사이트가 로컬에서 작동하는지 확인하세요.`,
        hints: ["Docker Desktop이 설치되어 있어야 합니다 (docker.com에서 다운로드)", "`docker compose up --build`는 이미지를 빌드하고 컨테이너를 시작합니다", "`docker ps`로 실행 중인 컨테이너를 확인하고, `docker logs <container-id>`로 로그를 볼 수 있습니다"],
        socraticStarter: "`docker compose up`과 `docker build + docker run`의 차이가 무엇인지 생각해보세요. Dockerfile이 무엇을 정의하고, docker-compose.yml은 무엇을 추가로 정의하나요?",
        feynmanPrompt: "Docker 이미지와 컨테이너의 차이(이미지=설계도, 컨테이너=실행 인스턴스), Dockerfile이 하는 일(환경 레이어 쌓기), 그리고 '내 컴퓨터에서는 됩니다' 문제를 Docker가 어떻게 해결하는지 설명해보세요.",
        systemPrompt: "학생이 Docker와 컨테이너를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 이미지 vs 컨테이너, Dockerfile 레이어 구조, docker-compose(멀티 컨테이너 오케스트레이션), 컨테이너가 VM과 다른 점(커널 공유). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "6-4",
        title: "간단한 앱을 위한 Dockerfile + docker-compose.yml (Redis 포함)",
        problem: `간단한 Python 애플리케이션을 위한 Dockerfile을 작성하세요. 그 다음 애플리케이션과 Redis 캐시를 함께 실행하는 \`docker-compose.yml\`을 작성하세요.

**Dockerfile** 예시:
\`\`\`dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install -e .
COPY src/ src/
CMD ["python", "-m", "mypackage"]
\`\`\`

**docker-compose.yml** 예시:
\`\`\`yaml
services:
  web:
    build: .
    ports:
      - "8080:8080"
    environment:
      - REDIS_URL=redis://cache:6379
    depends_on:
      - cache

  cache:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  redis_data:
\`\`\`

\`docker compose up\`을 실행하고, \`web\` 서비스에서 \`cache\` 호스트명으로 Redis에 연결되는지 확인하세요.`,
        hints: ["`depends_on: - cache`는 cache 서비스가 먼저 시작되도록 보장합니다", "Docker Compose의 내부 DNS가 서비스 이름(`cache`)을 자동으로 IP로 해석합니다", "`redis:7-alpine`의 alpine은 최소화된 Linux 이미지로 이미지 크기를 줄입니다"],
        socraticStarter: "`docker compose up`을 실행하면 두 컨테이너가 어떻게 서로를 찾을까요? 웹 컨테이너에서 `REDIS_URL=redis://cache:6379`의 `cache`는 어떻게 IP 주소로 변환될까요?",
        feynmanPrompt: "마이크로서비스 아키텍처가 무엇인지, Docker Compose가 멀티 컨테이너 환경에서 네트워킹과 서비스 디스커버리를 어떻게 처리하는지(내부 DNS), 그리고 volumes이 왜 필요한지 설명해보세요.",
        systemPrompt: "학생이 Docker Compose로 멀티 컨테이너 앱을 구성하는 방법을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 서비스 간 통신(Docker 내부 DNS), depends_on, named volumes(데이터 영속성), environment 변수로 설정 주입, alpine 이미지의 이점. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "6-5",
        title: "TestPyPI 배포 + Docker 이미지를 ghcr.io에 푸시",
        problem: `Python 패키지를 TestPyPI에 배포하세요(실제 PyPI에 배포하지 마세요. 공유할 가치가 있는 것이 아니라면!). 그 다음 해당 패키지를 사용하여 Docker 이미지를 빌드하고 \`ghcr.io\`에 푸시하세요.

\`\`\`bash
# 1. 빌드 아티팩트 생성
pip install build
python -m build      # dist/ 디렉터리에 .tar.gz와 .whl 생성

# 2. TestPyPI에 배포
pip install twine
# 또는 uv 사용:
uv publish --publish-url https://test.pypi.org/legacy/

# 3. TestPyPI에서 설치 확인
pip install --index-url https://test.pypi.org/simple/ mypackage

# 4. Docker 이미지 빌드 및 ghcr.io 푸시
docker build -t ghcr.io/<YOUR_GITHUB_USERNAME>/mypackage:latest .
echo \$GITHUB_TOKEN | docker login ghcr.io -u <USERNAME> --password-stdin
docker push ghcr.io/<YOUR_GITHUB_USERNAME>/mypackage:latest
\`\`\``,
        hints: ["TestPyPI 계정을 test.pypi.org에서 먼저 생성하고 API 토큰을 발급받아야 합니다", "`python -m build`는 소스 배포(.tar.gz)와 wheel(.whl) 두 아티팩트를 생성합니다", "ghcr.io에 push하려면 GitHub Personal Access Token(ghcr:read, ghcr:write 권한)이 필요합니다"],
        socraticStarter: "`python -m build`가 생성하는 `.tar.gz`와 `.whl` 파일의 차이가 무엇인지 설명해보세요. 왜 PyPI는 두 형식 모두를 제공하나요?",
        feynmanPrompt: "소스 배포(sdist)와 빌드된 배포(wheel)의 차이, PyPI가 패키지 신뢰성을 체크섬으로 보장하는 방법, 그리고 컨테이너 레지스트리(ghcr.io)가 패키지 저장소(PyPI)와 어떻게 유사한지 설명해보세요.",
        systemPrompt: "학생이 Python 패키지 배포(TestPyPI)와 컨테이너 이미지 배포(ghcr.io)를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: sdist vs wheel, TestPyPI vs PyPI, `python -m build` 빌드 과정, 컨테이너 레지스트리(ghcr.io) 인증 방식. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "6-6",
        title: "GitHub Pages로 웹사이트 만들기",
        problem: `[GitHub Pages](https://docs.github.com/en/pages/quickstart)를 사용하여 웹사이트를 만드세요. 추가(비필수) 크레딧: 사용자 정의 도메인으로 구성하세요.

\`\`\`bash
# 기본 설정:
# 1. GitHub에서 새 저장소 생성: <username>.github.io
# 2. index.html 파일 생성 및 커밋
# 3. Settings → Pages → Source: main branch 설정
# 4. https://<username>.github.io 에서 확인

# Jekyll 정적 사이트 생성기 사용 (선택사항):
gem install bundler jekyll
jekyll new my-site
cd my-site
bundle exec jekyll serve   # 로컬 미리보기

# 사용자 정의 도메인 (선택사항):
# 1. DNS 공급자에서 CNAME 레코드 설정: www → <username>.github.io
# 2. 저장소 루트에 CNAME 파일 생성: www.yourdomain.com
# 3. Settings → Pages → Custom domain 설정
\`\`\``,
        hints: ["저장소 이름이 `<username>.github.io`이면 자동으로 기본 도메인이 됩니다", "`main` 브랜치의 루트 또는 `/docs` 폴더를 소스로 설정할 수 있습니다", "HTTPS는 GitHub Pages에서 무료로 자동 처리됩니다 (Let's Encrypt 사용)"],
        socraticStarter: "GitHub Pages는 어떻게 정적 웹사이트를 제공할까요? '정적(static)' 사이트와 '동적(dynamic)' 서버의 차이가 무엇이고, 어떤 경우에 정적 사이트로 충분할까요?",
        feynmanPrompt: "정적 사이트 호스팅이 무엇인지(서버 로직 없이 파일 그대로 제공), GitHub Pages가 CI/CD와 어떻게 연결되는지(push → 자동 빌드 배포), 그리고 사용자 정의 도메인에서 DNS와 HTTPS 설정이 어떻게 작동하는지 설명해보세요.",
        systemPrompt: "학생이 GitHub Pages와 정적 사이트 배포를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 정적 vs 동적 사이트, GitHub Pages의 자동 배포(push → build → deploy), Jekyll 정적 생성기, DNS CNAME 설정, HTTPS 자동 인증서(Let's Encrypt). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════════
  //  LECTURE 7 — AI 코딩 에이전트
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 7,
    title: "AI 코딩 에이전트",
    date: "1/21/26",
    accent: "#74b9ff",
    icon: "◎",
    desc: "AI 코딩 에이전트 활용법, 사용 사례, 고급 패턴, 컨텍스트 관리, 주의할 점",
    url: "https://missing.csail.mit.edu/2026/agentic-coding/",
    exercises: [
      {
        id: "7-1",
        title: "4가지 코딩 방식 비교 실험",
        problem: `손 코딩, AI 자동완성, 인라인 채팅, 에이전트를 사용하는 경험을 비교하세요. 같은 프로그래밍 작업을 네 가지 방식으로 해봅시다. 가장 좋은 예제는 이미 진행 중인 프로젝트의 작은 기능입니다. 다른 아이디어가 필요하면 GitHub의 "good first issue" 작업, [Advent of Code](https://adventofcode.com/), 또는 [LeetCode](https://leetcode.com/)를 시도해보세요.

**네 가지 방식:**
1. **손 코딩**: AI 없이 직접 작성
2. **AI 자동완성**: Copilot, Cursor 등의 인라인 제안만 사용
3. **인라인 채팅**: IDE 내 채팅으로 코드 생성 요청
4. **에이전트**: Claude Code, Codex 등 에이전트가 파일 읽기/쓰기/실행까지 자율 수행

각 방식마다 기록하세요:
- 소요 시간
- 결과 코드 품질 (정확성, 가독성)
- 자신이 얼마나 이해했는지
- 어떤 상황에 적합한지`,
        hints: ["같은 작업을 네 번 하므로 처음 1-2개 방식 이후에는 문제 이해도가 올라갑니다 — 이 효과를 고려하세요", "에이전트 방식에서는 요구사항 작성(프롬프트)에 얼마나 시간이 들었는지도 기록하세요", "어떤 방식이 '더 좋다'는 정답은 없습니다 — 상황에 따라 다릅니다"],
        socraticStarter: "손 코딩과 에이전트 방식의 결과 코드를 비교했을 때 어떤 차이를 느꼈나요? 각 방식에서 자신이 '실제로 배운 것'의 양이 달랐나요?",
        feynmanPrompt: "네 가지 코딩 방식의 trade-off를 설명하세요 — 속도, 이해도, 코드 품질, 적합한 상황. '좋은 프로그래머'가 언제 어떤 도구를 선택해야 하는지 자신의 기준을 설명해보세요.",
        systemPrompt: "학생이 AI 코딩 도구들의 다양한 사용 방식을 비교 실험하고 있습니다. 소크라테스식으로 질문하세요. 핵심: 각 방식의 trade-off(속도 vs 이해도), 에이전트가 '인턴 관리자' 역할인 이유, AI를 지팡이처럼 의존하는 위험성, 상황에 맞는 도구 선택. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "7-2",
        title: "AI 에이전트로 낯선 코드베이스 탐색",
        problem: `AI 코딩 에이전트로 낯선 코드베이스를 탐색해보세요. 실제로 관심 있는 프로젝트를 디버그하거나 새 기능을 추가할 때 가장 좋습니다. 없으면 [opencode](https://github.com/anomalyco/opencode) 에이전트의 보안 기능이 어떻게 작동하는지 이해해보세요.

예시 질문 목록:
\`\`\`
"이 프로젝트의 전체 아키텍처를 설명해줘"
"인증 흐름이 어디서 처리되는지 보여줘"
"데이터베이스 스키마가 어떻게 정의되어 있어?"
"이 버그가 왜 발생하는지 코드를 추적해서 설명해줘"
"X 기능을 추가하려면 어떤 파일을 수정해야 해?"
\`\`\`

에이전트 없이 동일한 질문을 탐색했다면 얼마나 오래 걸렸을지 비교해보세요.`,
        hints: ["에이전트에게 먼저 README와 핵심 파일 구조를 요약하도록 요청하세요", "에이전트가 '모른다'고 하면 더 구체적인 파일이나 함수를 지정해서 질문하세요", "에이전트의 설명이 맞는지 실제 코드를 열어 검증하는 습관을 들이세요"],
        socraticStarter: "에이전트가 코드베이스를 탐색할 때 어떤 도구들을 사용했나요?(파일 읽기, 검색 등) 에이전트가 제공한 설명 중 틀리거나 불완전한 부분이 있었나요?",
        feynmanPrompt: "AI 에이전트로 코드베이스를 탐색하는 것이 왜 효과적인지(컨텍스트 윈도우에 많은 파일을 동시에 볼 수 있음), 그리고 에이전트의 한계(할루시네이션, 컨텍스트 윈도우 제한)를 어떻게 인식하고 검증해야 하는지 설명해보세요.",
        systemPrompt: "학생이 AI 에이전트로 낯선 코드베이스를 탐색하는 방법을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 에이전트가 파일 읽기/검색 도구를 사용하는 방식, 코드 탐색에서 에이전트의 장점(빠른 파악), 할루시네이션 위험성과 검증 필요성, 컨텍스트 윈도우 한계. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "7-3",
        title: "Vibe 코딩: 손으로 한 줄도 쓰지 않고 앱 만들기",
        problem: `처음부터 작은 앱을 vibe 코딩하세요. **손으로 한 줄도 작성하지 마세요.**

아이디어 예시:
- CLI 도구: 파일 이름을 날짜 기반으로 일괄 변경
- 웹 스크레이퍼: 특정 사이트에서 데이터 추출
- 간단한 웹 앱: TODO 리스트, 날씨 앱
- 데이터 분석: CSV 파일을 읽고 시각화

과정을 기록하세요:
1. 요구사항을 에이전트에게 어떻게 전달했는가
2. 에이전트가 어떤 단계를 밟았는가
3. 어떤 부분에서 수정이 필요했는가 (텍스트 피드백으로)
4. 최종 결과물의 품질은?`,
        hints: ["요구사항이 명확할수록 좋습니다 — TDD처럼 먼저 테스트나 기대 동작을 정의하세요", "에이전트가 잘못된 방향으로 가면 즉시 중단하고 피드백을 주세요", "코드를 직접 쓰지 않더라도 결과물을 이해하고 설명할 수 있어야 합니다"],
        socraticStarter: "vibe 코딩에서 가장 어려운 부분이 무엇이었나요? 좋은 요구사항(프롬프트)을 작성하는 것이 직접 코드를 쓰는 것과 어떻게 다른 기술인지 생각해보세요.",
        feynmanPrompt: "vibe 코딩이 가능해진 이유(에이전트가 파일 읽기/쓰기/실행 가능), 그 한계(코드를 이해하지 못하면 유지보수 불가능), 그리고 좋은 요구사항 작성이 왜 '코딩보다 어려울 수 있는' 기술인지 설명해보세요.",
        systemPrompt: "학생이 vibe 코딩(에이전트로 전체 앱 구현)을 실습하고 있습니다. 소크라테스식으로 질문하세요. 핵심: 에이전트의 자율성(파일 읽기/쓰기/실행), 요구사항 작성의 어려움(과학보다 예술), TDD와 에이전트의 시너지, vibe 코딩의 위험성(이해 없는 코드). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "7-4",
        title: "AGENTS.md / skill / subagent 만들고 테스트하기",
        problem: `선택한 코딩 에이전트로 다음을 만들고 테스트해보세요: \`AGENTS.md\` (또는 해당 에이전트의 equivalent), skill, subagent. 각각 언제 사용할지 생각해보세요. 에이전트가 모두 지원하지 않을 수도 있으니, 생략하거나 다른 에이전트를 시도해도 됩니다.

**AGENTS.md 예시:**
\`\`\`markdown
# Project: My Python App

## Always run after changes:
- Type check: \`mypy src/\`
- Lint: \`ruff check src/\`
- Tests: \`pytest tests/\`

## Code style:
- Use type annotations everywhere
- Prefer dataclasses over plain dicts
\`\`\`

**Subagent 프롬프트 예시 (Claude Code):**
\`\`\`
A Python code checking agent that uses mypy and ruff to 
type-check, lint, and format *check* any files that have 
been modified from the last git commit.
\`\`\``,
        hints: ["`AGENTS.md`는 세션마다 자동으로 컨텍스트에 로드됩니다 — 너무 길면 컨텍스트를 낭비합니다", "skill은 자주 쓰는 프롬프트를 저장하되, 필요할 때만 로드하는 방식입니다", "subagent는 독립적인 컨텍스트를 가지므로 주 에이전트의 컨텍스트를 오염시키지 않습니다"],
        socraticStarter: "`AGENTS.md`에 모든 지시사항을 넣으면 되는데 왜 skill과 subagent라는 추가 개념이 필요할까요? 컨텍스트 윈도우의 크기 제한과 어떤 관계가 있을까요?",
        feynmanPrompt: "AGENTS.md(항상 로드되는 세션 설정), skill(선택적으로 로드되는 재사용 프롬프트), subagent(독립적 컨텍스트의 전문화 에이전트) 세 가지를 언제 사용하는지 각각의 trade-off와 함께 설명해보세요.",
        systemPrompt: "학생이 AI 에이전트 고급 기능(AGENTS.md, skill, subagent)을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: AGENTS.md의 역할(세션 공통 지시사항), skill의 간접 계층(컨텍스트 절약), subagent의 독립 컨텍스트, 컨텍스트 윈도우 관리의 중요성. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "7-5",
        title: "에이전트로 정규식 작업 달성 (직접 편집 없이)",
        problem: `[코드 품질](/2026/code-quality/) 강의의 마크다운 글머리 정규식 연습과 같은 목표를 에이전트로 달성해보세요. 에이전트가 직접 파일을 편집해서 해결할까요? 직접 편집의 단점은 무엇일까요? 에이전트가 직접 편집 **없이** 작업하도록 프롬프트하세요. 힌트: 첫 번째 강의의 커맨드라인 도구를 사용하도록 요청하세요.

**목표**: Markdown 파일에서 \`-\` 글머리 마커를 \`*\` 글머리 마커로 변경하기.

**에이전트에게 요청 예시:**
\`\`\`
Without directly editing the file, use command-line tools 
(sed, grep, awk, or similar) to replace all markdown bullet 
markers "-" with "*" in lecture.md. Make sure you only 
replace actual bullet markers, not all occurrences of "-".
\`\`\`

직접 편집 방식과 CLI 도구 방식을 비교해보세요.`,
        hints: ["에이전트가 파일을 직접 수정하면 변경 이력 추적이 어렵고 실수 복구가 어렵습니다", "`sed 's/^- /\\* /g' file.md`는 줄 시작의 `- ` 패턴만 바꿉니다 — 모든 `-`를 바꾸는 것과 다릅니다", "CLI 도구 방식은 명령 자체가 '문서화'가 됩니다 — 무엇을 어떻게 했는지 기록이 남습니다"],
        socraticStarter: "에이전트에게 '파일을 직접 편집하지 말고 CLI 도구를 사용하라'고 제약을 주면 어떤 이점이 있을까요? 에이전트가 직접 파일을 수정하는 것의 위험성이 무엇인지 생각해보세요.",
        feynmanPrompt: "에이전트가 파일을 직접 수정하는 방식 vs CLI 도구(sed, awk 등)를 사용하는 방식의 차이를 설명하세요. 'AI가 도구를 사용하게 하는 것'이 왜 중요한지, 그리고 이 연습이 에이전트의 작동 방식을 이해하는 데 어떻게 도움이 되는지 설명해보세요.",
        systemPrompt: "학생이 에이전트를 올바르게 활용하는 방법(직접 편집 vs 도구 사용)을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 에이전트의 도구 사용 패턴, 직접 파일 수정의 위험성(이력 손실, 실수), CLI 도구를 사용하면 재현 가능하고 검증 가능, 프롬프팅으로 에이전트 행동 제어. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "7-6",
        title: "Yolo 모드: 격리된 환경에서 권한 없이 실행",
        problem: `대부분의 코딩 에이전트는 "yolo mode"를 지원합니다(Claude Code의 \`--dangerously-skip-permissions\`). 직접 사용하는 것은 안전하지 않지만, 가상머신이나 컨테이너 같은 격리된 환경에서는 괜찮습니다. 당신의 머신에서 이를 설정하세요. [Claude Code devcontainers](https://code.claude.com/docs/en/devcontainer)나 [Docker Sandboxes](https://docs.docker.com/ai/sandboxes/agents/claude-code/)가 도움될 겁니다.

\`\`\`bash
# Docker 컨테이너 안에서 Claude Code 실행 예시:
docker run -it --rm \\
  -v $(pwd):/workspace \\
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \\
  node:22 bash

# 컨테이너 안에서:
npm install -g @anthropic-ai/claude-code
cd /workspace
claude --dangerously-skip-permissions
\`\`\`

격리 환경에서 yolo 모드로 에이전트에게 복잡한 작업을 맡겨보고, 에이전트가 어떤 도구를 사용하는지 관찰하세요.`,
        hints: ["컨테이너는 호스트 파일시스템을 보호합니다 — 컨테이너 내에서 무슨 일이 일어나도 호스트에 영향 없음", "`--dangerously-skip-permissions`는 매번 권한 확인을 건너뛰어 에이전트가 완전 자율적으로 실행됩니다", "격리 환경에서 yolo 모드는 CI/CD 파이프라인에서도 유용하게 활용됩니다"],
        socraticStarter: "왜 yolo 모드를 직접 컴퓨터에서 실행하면 위험할까요? 컨테이너 격리가 어떻게 이 위험을 줄이는지, 그리고 에이전트에게 '완전한 권한'을 주면 어떤 일이 가능해지는지 생각해보세요.",
        feynmanPrompt: "AI 에이전트의 권한 모델(왜 기본적으로 사용자 확인을 요구하는지), 컨테이너 격리가 보안 샌드박스로 작동하는 방식, 그리고 yolo 모드가 실제로 유용한 시나리오(자동화된 CI, 반복 작업)를 설명해보세요.",
        systemPrompt: "학생이 AI 에이전트의 권한 모델과 격리된 환경에서의 자율 실행을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 기본 권한 확인의 이유(안전성), 컨테이너 격리의 보안 경계, --dangerously-skip-permissions의 용도, CI/CD에서의 yolo 모드 활용. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════════
  //  LECTURE 8 — 코드 너머의 것들
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 8,
    title: "코드 너머의 것들",
    date: "1/22/26",
    accent: "#a29bfe",
    icon: "✦",
    desc: "코드 주석, README, commit message, 오픈소스 기여, 코드 리뷰, 질문하는 법, AI 에티켓",
    url: "https://missing.csail.mit.edu/2026/beyond-code/",
    exercises: [
      {
        id: "8-1",
        title: "오픈소스 코드에서 좋은 주석 유형 찾기",
        problem: `잘 알려진 프로젝트의 source code를 둘러보세요 (예: [Redis](https://github.com/redis/redis) 또는 [curl](https://github.com/curl/curl)). Lecture에서 언급한 comment type들의 예시를 찾으세요:

강의에서 언급한 주석 유형:
- **TODO**: 미완성 코드 표시 + 충분한 맥락
- **References**: 알고리즘 출처, 논문, 스펙 링크
- **Correctness arguments**: 왜 이 코드가 올바른지 설명
- **Hard-learned lessons**: 30분+ 디버깅 끝에 찾은 버그
- **Magic numbers의 의미**: 1492는 왜? 16비트는 왜?
- **Load-bearing choices**: "BTreeSet이어야만 하는 이유"
- **"Why not"s**: 더 직관적인 방법을 피한 이유

그 comment가 없었다면 무엇이 손실되었을까요?`,
        hints: ["Redis의 `src/server.c`나 curl의 `lib/url.c`같은 핵심 파일에 좋은 주석이 많습니다", "GitHub에서 파일을 열고 Ctrl+F로 `TODO`, `NOTE`, `FIXME`, `HACK` 등을 검색하세요", "주석의 가치를 평가할 때 '이 주석이 없다면 이것을 이해하는 데 얼마나 걸릴까?'라고 자문하세요"],
        socraticStarter: "찾은 주석 중에서 '코드만 봐도 알 수 있는 것'을 설명하는 나쁜 주석과 '코드만으로는 알 수 없는 것'을 설명하는 좋은 주석의 예시를 각각 하나씩 찾았나요?",
        feynmanPrompt: "좋은 코드 주석의 핵심 원칙('무엇'이 아닌 '왜')을 설명하고, 강의에서 언급한 7가지 주석 유형 중 가장 자주 누락되는 것이 무엇인지와 왜 그게 중요한지 설명해보세요.",
        systemPrompt: "학생이 오픈소스 프로젝트에서 좋은 코드 주석 패턴을 찾고 있습니다. 소크라테스식으로 질문하세요. 핵심: 주석의 목적(why not what), 7가지 주석 유형의 차이, 나쁜 주석(코드 반복)의 해악, hard-learned lessons의 가치(미래 디버깅 시간 절약). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "8-2",
        title: "Commit message 품질 평가와 개선",
        problem: `당신이 관심 있는 open source 프로젝트를 선택하고 최근 commit history를 보세요 (\`git log\`). 변경이 **왜** 만들어졌는지 설명하는 좋은 message를 가진 commit 하나와, 변경된 **것만** 설명하는 weak message를 가진 commit 하나를 찾으세요. Weak one을 위해, diff를 보고 (\`git show <hash>\`), Problem → Solution → Implications 구조를 따르는 더 나은 commit message를 작성해 보세요.

\`\`\`bash
# 최근 커밋 이력 보기
git log --oneline -20

# 특정 커밋의 전체 내용 보기
git show <hash>

# 특정 파일의 이력 보기
git log --follow -p -- path/to/file
\`\`\`

얼마나 많은 작업이 필요했는지 주목하세요. 사실 후에 필요한 context를 다시 조립하기 위해서 말입니다!`,
        hints: ["좋은 커밋 메시지는 제목만 봐도 '왜' 변경이 필요했는지 알 수 있습니다", "`git log --oneline`에서 'Fix bug', 'Update code', 'WIP' 같은 메시지는 weak message의 신호입니다", "Problem → Solution → Implications: 어떤 제약이 있었는가 → 무엇을 바꿨는가 → 어떤 영향이 있는가"],
        socraticStarter: "찾은 weak commit message를 개선하는 데 실제로 얼마나 시간이 걸렸나요? 그 context를 '복원'하기 위해 diff와 코드를 어떻게 추적해야 했나요?",
        feynmanPrompt: "좋은 commit message가 왜 '코드베이스의 역사 기록' 역할을 하는지, Problem → Solution → Implications 구조가 왜 효과적인지, 그리고 LLM으로 commit message를 작성할 때 왜 단순히 'write a commit message'라고 하면 안 되는지 설명해보세요.",
        systemPrompt: "학생이 commit message의 품질 평가와 개선을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 좋은 commit message의 기준('왜' 설명), Problem→Solution→Implications 구조, git blame과 commit message의 연결(미래 디버깅), LLM에게 'why'를 추출하도록 프롬프팅하는 방법. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "8-3",
        title: "오픈소스 README 3개 비교 분석",
        problem: `1000+ star를 가진 세 GitHub project의 README를 비교하세요. 그들 모두 같은 정도로 유용한가요? Noise로 대부분 나오는 것들을 찾아보세요. 당신이 직접 작성하는 README들을 위한 lesson으로요.

강의에서 제시한 좋은 README의 4가지 질문:
1. **무엇을 하나요?** (한 줄 요약 + 시각적 데모)
2. **왜 관심 가져야 하나요?** (차별점)
3. **어떻게 쓰나요?** (사용 예시 — 설치 전에!)
4. **어떻게 설치하나요?** (마지막에)

각 README에 대해 기록하세요:
- 4가지 질문에 바로 답하는가?
- 읽는 데 몇 초면 '내 문제를 해결하는가' 판단 가능한가?
- 불필요한 노이즈(배지 남발, 과도한 설치 지침, 기여 가이드 먼저 등)가 있는가?`,
        hints: ["배지(badge)가 너무 많으면 실제 내용이 화면 밖으로 밀려납니다", "설치 방법보다 사용 예시를 먼저 보여주는 README가 훨씬 설득력 있습니다", "깔때기(funnel) 구조: 맨 위에 한 줄 요약 → 점점 자세한 내용 순서"],
        socraticStarter: "분석한 README 중 '이 도구가 내 문제를 해결하는가'를 5초 안에 판단할 수 있는 것이 있었나요? 어떤 요소가 그것을 가능하게 했나요?",
        feynmanPrompt: "좋은 README의 '깔때기 구조'가 무엇인지, 사용 예시를 설치 방법보다 먼저 보여줘야 하는 이유, 그리고 '독자를 존중하는 문서'와 '과도하게 설명하는 문서'의 차이를 설명해보세요.",
        systemPrompt: "학생이 오픈소스 프로젝트 README를 분석하고 있습니다. 소크라테스식으로 질문하세요. 핵심: 깔때기 구조(요약→사용예→설치), 사용 예시 우선(설치 전), 노이즈(배지 남발) vs 신호, 독자가 5초 안에 판단 가능해야 함. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "8-4",
        title: "실제 오픈소스 이슈 평가",
        problem: `당신이 사용하는 프로젝트에서 open issue를 찾으세요 ("good first issue" 또는 "help wanted" label이 있다면 확인해보세요). Issue를 lecture의 criteria에 대해 평가하세요: 유지보수자의 시간을 소중히 여기고 debug하는 데 필요한 모든 정보를 포함하는 것처럼 보이나요? 또는 유지보수자가 submitter와 문제의 root까지 도달하기 위해 여러 라운드의 질문을 거쳐야 할 수도 있을까요?

좋은 bug report의 체크리스트:
- [ ] **Environment**: OS, 버전 번호, 관련 설정
- [ ] **Expected vs Actual**: 예상한 결과 vs 실제 결과
- [ ] **Reproduce steps**: 구체적인 재현 단계
- [ ] **What you've tried**: 이미 시도한 것들
- [ ] **Minimal Reproducible Example**: 불필요한 것 모두 제거

강의에서 특히 강조한 것: **Minimal Reproducible Example**은 "bug 수정의 가장 어려운 부분이 재현인 경우가 많다"`,
        hints: ["'나도 같은 문제 있어요'만 있는 댓글은 signal이 아니라 noise입니다", "재현 단계가 너무 모호한 이슈는 유지보수자가 먼저 재현 환경을 구성해야 해서 시간을 많이 씁니다", "이슈를 평가할 때 '내가 유지보수자라면 이 정보로 debug를 시작할 수 있는가?'라고 자문하세요"],
        socraticStarter: "찾은 이슈에서 유지보수자가 첫 번째 답변으로 무엇을 물어볼 것 같나요? 그 질문들이 이슈 원문에 이미 포함되어 있었다면 얼마나 시간이 절약됐을까요?",
        feynmanPrompt: "좋은 버그 리포트의 각 요소(Environment, Expected vs Actual, Reproduce steps, What you tried, MRE)가 왜 필요한지, Minimal Reproducible Example이 특히 왜 중요한지(재현이 디버깅의 절반), 그리고 이 기준을 LLM과의 소통에도 적용할 수 있는 이유를 설명해보세요.",
        systemPrompt: "학생이 좋은 버그 리포트의 기준을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 유지보수자의 시간 비용, MRE(Minimal Reproducible Example)의 가치, 5가지 버그 리포트 요소, 보안 취약점은 비공개 공개 원칙, 이 기준이 LLM 프롬프팅에도 동일하게 적용됨. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "8-5",
        title: "최소 재현 가능 예제(MRE) 만들기",
        problem: `Software에서 encounter한 bug를 생각해보세요 (또는 issue tracker에서 찾으세요). Minimal reproducible example을 만드는 것을 연습하세요: bug와 unrelated 모든 것을 제거하세요. 당신이 제거한 것과 왜를 write up 하세요.

MRE 만드는 과정:
1. 버그를 재현하는 최소한의 코드 작성
2. 하나씩 코드를 제거하면서 버그가 여전히 발생하는지 확인
3. 더 이상 제거할 수 없을 때까지 반복
4. 제거한 것과 이유를 기록

예시: 데이터베이스 연결 버그라면 → 실제 DB 없이 SQLite 인메모리로, 실제 데이터 없이 1개 행으로, 복잡한 쿼리 없이 단순 SELECT로 축소`,
        hints: ["버그를 격리하는 과정에서 종종 버그의 원인을 직접 발견하게 됩니다", "이진 탐색처럼 접근하세요: 코드의 절반을 제거하고, 버그가 남아있으면 그 절반에 원인이 있습니다", "MRE가 완성되면 실제로 이슈에 올려보세요 — 커뮤니티에 기여하는 좋은 방법입니다"],
        socraticStarter: "MRE를 만드는 과정에서 버그의 원인을 직접 발견한 적이 있었나요? 왜 불필요한 코드를 제거하는 과정이 디버깅에 도움이 될까요?",
        feynmanPrompt: "MRE가 왜 버그 리포트에서 가장 가치 있는 요소인지(재현이 디버깅의 절반), MRE를 만드는 이진 탐색 접근법, 그리고 MRE 만들기가 단순히 '도움을 요청하는 방법'을 넘어서 디버깅 스킬 자체를 향상시키는 이유를 설명해보세요.",
        systemPrompt: "학생이 Minimal Reproducible Example 만들기를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: MRE의 정의(bug와 관련없는 모든 것 제거), 이진 탐색 접근법, 격리 과정에서 원인 발견의 빈도, MRE가 커뮤니티 기여이기도 한 이유. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "8-6",
        title: "PR 코드 리뷰 분석 + AI 에티켓",
        problem: `Merged pull request를 당신이 친숙한 프로젝트에서 찾으세요. Substantive review comment들이 있는 것("LGTM"만 아니라). Review를 읽어보세요. 모든 comment가 같은 정도로 productive 했나요? 당신이 PR author라면, 그 모든 comment들을 받는 경험이 어땠을까요?

강의에서 제시한 좋은 코드 리뷰의 원칙:
- "이 함수는 혼동스러움" (O) vs "당신이 혼동스러운 코드를 작성했음" (X)
- "X가 null일 때 어떻게 되나요?" (O) vs "null case를 처리하세요" (X)
- blocking issue와 suggestion을 명확히 구분
- 좋은 것도 인정하기

그리고 **AI 에티켓**:
- AI가 의미있게 기여했다면 공개하기
- 설명할 수 없는 AI 생성 코드를 PR에 제출하지 않기
- 팀/프로젝트의 AI 사용 규범 따르기`,
        hints: ["리뷰 댓글의 '톤'과 '내용' 두 가지를 분리해서 평가해보세요", "blocking comment('이걸 고치지 않으면 merge 불가')와 suggestion('이렇게 해도 좋을 것 같아요')의 구분이 명확한지 확인하세요", "AI 생성 코드를 PR에 제출할 때 '이 코드를 직접 설명할 수 있는가?'가 핵심 기준입니다"],
        socraticStarter: "분석한 PR의 리뷰 댓글 중에서 '작성자를 방어적으로 만들었을 것 같은' 댓글과 '건설적인 토론을 이끌어냈을 것 같은' 댓글을 각각 찾았나요? 어떤 차이가 있었나요?",
        feynmanPrompt: "좋은 코드 리뷰의 핵심 원칙들(코드 vs 사람 구분, 질문 형식, blocking vs suggestion)을 설명하고, AI 에티켓에서 '공개 의무'와 '이해 의무'가 왜 중요한지(유지보수자의 부담, 팀 신뢰) 설명해보세요.",
        systemPrompt: "학생이 코드 리뷰 원칙과 AI 에티켓을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 코드 리뷰 7원칙(코드/사람 구분, 실행가능한 댓글, 질문형식, why설명, blocking/suggestion구분, 좋은 것 인정, 멈출 때 알기), AI 에티켓(공개, 이해, 팀 규범). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "8-7",
        title: "Stack Overflow: 좋은 질문 vs 닫힌 질문 비교",
        problem: `Stack Overflow에 가서 당신이 아는 technology에서 question을 찾으세요. Highly-voted answer를 가진 것을 찾으세요. 그 다음 closed 또는 heavily downvoted 된 것을 찾으세요. Lecture의 조언과 비교해보세요; 어느 question이 더 나은 답변을 받을 것인지 예측할 수 있었을까요?

비교할 때 체크할 항목들:
- **제목**: "왜 X가 작동 안 하나요?" (나쁨) vs "Python requests로 SSL 인증서 오류 발생 시 우회 방법" (좋음)
- **맥락**: 환경, 버전, 이미 시도한 것들 포함 여부
- **MRE**: 재현 가능한 최소 코드 예시 포함 여부
- **Expected vs Actual**: 예상 결과와 실제 결과 명확히 기술 여부
- **오류 메시지**: 정확한 오류 텍스트 포함 여부

\`\`\`
# Stack Overflow 검색 팁:
# - [python] 태그로 필터링
# - 질문 목록에서 "Newest" → "Closed" 탭으로 닫힌 질문 확인
# - 높은 vote 질문: 통상 구체적, 재현 가능, 스스로 시도한 흔적
# - 닫힌 질문: "too broad", "unclear", "no debugging effort"
\`\`\`

두 질문의 차이를 분석한 뒤, 당신이 실제로 질문을 올려야 한다면 어떻게 작성할지 초안을 만들어보세요.`,
        hints: ["닫힌 이유(close reason)를 꼭 확인하세요 — 'needs more focus', 'not reproducible' 등 카테고리가 있습니다", "vote 수와 답변 수가 항상 비례하지 않습니다 — 명확한 질문은 빠르게 좋은 답변을 받습니다", "강의에서 강조한 것: 질문하기 전에 먼저 스스로 리서치하고 시도한 것을 보여줘야 합니다"],
        socraticStarter: "비교한 두 질문에서 높은 vote를 받은 질문과 닫힌 질문의 가장 결정적인 차이가 무엇이었나요? 제목만 봐도 어느 쪽이 더 나은 답변을 받을지 예측할 수 있었나요?",
        feynmanPrompt: "좋은 기술 질문의 구성 요소(제목, 맥락, MRE, Expected vs Actual, 오류 메시지)를 설명하고, Stack Overflow의 'rubber duck debugging' 효과(질문을 작성하는 과정에서 스스로 답을 찾는 경우)가 왜 발생하는지, 그리고 이 원칙이 AI(LLM)에게 질문할 때도 동일하게 적용되는 이유를 설명해보세요.",
        systemPrompt: "학생이 좋은 기술 질문의 기준을 Stack Overflow 분석으로 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 좋은 질문의 5요소(제목/맥락/MRE/Expected vs Actual/오류메시지), close reason 카테고리(too broad/unclear/no effort), rubber duck debugging 효과, 이 원칙이 LLM 프롬프팅에도 동일 적용됨. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════════
  //  LECTURE 9 — 코드 품질
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 9,
    title: "코드 품질",
    date: "1/23/26",
    accent: "#55efc4",
    icon: "⬟",
    desc: "포매팅, 린팅, 테스팅, pre-commit 훅, CI/CD, 명령어 러너, 정규표현식",
    url: "https://missing.csail.mit.edu/2026/code-quality/",
    exercises: [
      {
        id: "9-1",
        title: "포매터 + 린터 + pre-commit 훅 구성",
        problem: `당신이 작업하고 있는 프로젝트를 위해 포매터, 린터, 그리고 pre-commit 훅을 구성하세요. 많은 오류가 있다면: 자동 포매팅은 형식 오류를 처리해야 합니다. 린터 오류의 경우, [AI 에이전트](/2026/agentic-coding/)를 사용하여 모든 린터 오류를 고치려고 시도하세요. AI 에이전트가 린터를 실행하고 결과를 관찰할 수 있도록 하세요. 그렇게 하면 모든 문제를 고치기 위해 반복적인 루프로 실행할 수 있습니다. AI가 코드를 깨뜨리지 않았는지 확인하기 위해 결과를 주의 깊게 확인하세요!

**Python 예시 (Ruff 사용):**
\`\`\`bash
pip install ruff pre-commit

# 포매팅 확인
ruff format --check .
# 포매팅 적용
ruff format .

# 린팅
ruff check .
# 자동 수정 가능한 것 수정
ruff check --fix .
\`\`\`

**pre-commit 설정 (.pre-commit-config.yaml):**
\`\`\`yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks:
      - id: ruff        # 린터
      - id: ruff-format # 포매터
\`\`\`

\`\`\`bash
pre-commit install     # 훅 설치
pre-commit run --all-files  # 모든 파일에 실행
\`\`\``,
        hints: ["포매터(ruff format)는 스타일 문제만 고치고, 린터(ruff check)는 논리적 안티패턴을 잡습니다", "pre-commit 훅은 `git commit` 실행 시 자동으로 실행됩니다 — 실패하면 commit이 차단됩니다", "AI 에이전트가 린터를 반복적으로 실행하도록 '피드백 루프'를 설정하면 자동으로 모든 문제를 고칠 수 있습니다"],
        socraticStarter: "포매터와 린터의 차이가 무엇인가요? `ruff format`이 수정하는 것과 `ruff check`가 잡아내는 것이 어떻게 다른지, 예시를 들어 설명해보세요.",
        feynmanPrompt: "포매터(표면적 스타일 자동화), 린터(정적 분석으로 안티패턴 감지), pre-commit 훅(commit 전 자동 실행)이 각각 어떤 역할을 하는지, 그리고 AI 에이전트를 '피드백 루프'에 넣으면 왜 효과적인지 설명해보세요.",
        systemPrompt: "학생이 Python 포매터/린터/pre-commit 훅 구성을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 포매터(ruff format, 스타일) vs 린터(ruff check, 안티패턴), pre-commit 훅의 자동 실행 원리, False Positive와 규칙 비활성화, AI 에이전트 피드백 루프. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "9-2",
        title: "단위 테스트 작성 + 코드 커버리지 측정",
        problem: `당신이 아는 언어에 대해 테스팅 라이브러리를 배우고 당신이 작업하고 있는 프로젝트를 위해 단위 테스트를 작성하세요. 코드 커버리지 도구를 실행하고, HTML로 포매팅된 커버리지 리포트를 생성하고, 결과를 관찰하세요. 커버된 라인들을 찾을 수 있습니까? 당신의 코드 커버리지는 아마도 매우 낮을 것입니다. 커버리지를 개선하기 위해 수동으로 몇 가지 테스트를 작성하려고 시도하세요. AI 에이전트를 사용하여 커버리지를 개선하려고 시도하세요; 코딩 에이전트가 테스트를 커버리지와 함께 실행하고 라인별 커버리지 리포트를 생성할 수 있도록 하세요. AI가 생성한 테스트들이 실제로 좋습니까?

**Python 예시 (pytest + coverage):**
\`\`\`python
# tests/test_greet.py
def test_greet_returns_hello():
    from mypackage.greet import greet
    assert greet("World") == "Hello, World!"

def test_greet_with_empty_string():
    from mypackage.greet import greet
    assert greet("") == "Hello, !"
\`\`\`

\`\`\`bash
pip install pytest pytest-cov
pytest --cov=src --cov-report=html
# htmlcov/index.html 열기
open htmlcov/index.html
\`\`\``,
        hints: ["커버리지 100%가 목표가 아닙니다 — 중요한 경로(엣지 케이스, 오류 처리)를 커버하는 것이 목표입니다", "AI가 생성한 테스트가 '실행은 되지만 의미없는' 어설션을 가지는지 주의 깊게 확인하세요", "HTML 커버리지 리포트에서 빨간 줄(커버되지 않은 줄)을 찾아 어떤 조건/경로가 테스트되지 않았는지 파악하세요"],
        socraticStarter: "코드 커버리지 리포트에서 빨간 줄(커버되지 않은 코드)을 봤을 때, 그 줄들이 실제로 중요한 코드인가요, 아니면 테스트하기 어려운 엣지 케이스인가요? 커버리지 숫자를 높이는 것과 '좋은 테스트 작성'이 왜 다른지 설명해보세요.",
        feynmanPrompt: "단위 테스트, 통합 테스트, 기능 테스트의 차이와 언제 각각을 쓰는지, 코드 커버리지가 완벽한 메트릭이 아닌 이유(커버는 되지만 잘못 검증하는 경우), 그리고 AI가 생성한 테스트의 품질을 어떻게 평가하는지 설명해보세요.",
        systemPrompt: "학생이 단위 테스트 작성과 코드 커버리지를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: 단위/통합/기능 테스트의 차이, pytest 기본 구조, coverage.py HTML 리포트, 커버리지의 한계(실행했다고 올바른 것 아님), AI 생성 테스트의 품질 검증. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "9-3",
        title: "GitHub Actions CI 설정",
        problem: `당신이 작업하고 있는 프로젝트에 대해 모든 푸시에서 실행되는 지속적 통합을 설정하세요. CI에서 포매팅, 린팅, 그리고 테스트를 실행하세요. 의도적으로 코드를 깨뜨리고(예: 린터 위반을 도입하고), CI가 이를 잡는지 확인하세요.

**.github/workflows/ci.yml** 예시:
\`\`\`yaml
name: CI

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install ruff pytest pytest-cov
      - run: ruff format --check .
      - run: ruff check .
      - run: pytest --cov=src
\`\`\`

이 파일을 커밋하고 GitHub에 푸시하면 Actions 탭에서 실행 결과를 확인할 수 있습니다.`,
        hints: ["CI는 개발자 머신이 아닌 깨끗한 환경에서 실행됩니다 — '내 컴퓨터에서는 됩니다' 문제를 잡습니다", "`ruff format --check`는 파일을 수정하지 않고 형식 위반만 보고합니다 — CI에서는 항상 check-only 모드를 사용하세요", "의도적으로 깨뜨리는 연습: 함수에 미사용 import 추가 → push → CI 실패 확인"],
        socraticStarter: "CI가 통과된다고 해서 코드가 항상 올바른 걸까요? CI에서 잡을 수 있는 문제와 잡을 수 없는 문제(예: 성능 회귀, 비즈니스 로직 오류)를 구분해보세요.",
        feynmanPrompt: "CI(지속적 통합)가 왜 개발자 머신에서 직접 실행하는 것보다 더 신뢰할 수 있는지(깨끗한 환경), GitHub Actions의 워크플로우 구조(trigger → jobs → steps), 그리고 CI를 'check-only 모드'로 실행해야 하는 이유를 설명해보세요.",
        systemPrompt: "학생이 GitHub Actions CI 설정을 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: CI의 깨끗한 환경의 이점, 트리거(push/PR/schedule), check-only vs fix 모드의 차이, 매트릭스 테스트(다중 OS/Python 버전), 지속적 배포(CD)와의 차이. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "9-4",
        title: "정규식으로 위험 코드 패턴 찾기 vs semgrep",
        problem: `정규표현식 패턴을 작성하고, 코드에서 \`subprocess.Popen(..., shell=True)\`의 발생 지점을 찾기 위해 \`grep\` 명령어 라인 도구를 사용해 보세요. 이제 정규표현식 패턴을 "깨뜨려" 보세요. [semgrep](#린팅)은 여전히 grep 호출을 트립하는 위험한 코드를 성공적으로 매칭합니까?

\`\`\`bash
# 1. grep으로 패턴 찾기
grep -rn "shell=True" .
grep -rn "subprocess.Popen.*shell=True" .

# 2. 패턴 "깨뜨리기" - grep이 못 잡는 경우:
# subprocess.Popen(cmd,
#     shell=True)  # 줄 바꿈
# subprocess.Popen(cmd, shell = True)  # 공백
# kwargs = {"shell": True}
# subprocess.Popen(cmd, **kwargs)  # 변수 사용

# 3. semgrep으로 AST 수준 탐지
semgrep -l python -e "subprocess.Popen(..., shell=True, ...)"
\`\`\`

grep이 못 잡는 경우를 최소 3가지 이상 만들어보세요.`,
        hints: ["grep은 텍스트 패턴 매칭 — 줄 바꿈, 공백, 변수 사용 등을 구분 못합니다", "semgrep은 AST(추상 구문 트리) 수준에서 작동 — 실제 Python 코드 구조를 이해합니다", "`...` (ellipsis)는 semgrep에서 '임의의 인수'를 의미하는 특수 패턴입니다"],
        socraticStarter: "grep으로 `subprocess.Popen.*shell=True`를 찾다가 '깨뜨리는' 방법을 만들었나요? 텍스트 기반 검색과 코드 구조 이해 기반 검색의 근본적 차이가 무엇인지 설명해보세요.",
        feynmanPrompt: "grep(텍스트 패턴 매칭)과 semgrep(AST 기반 의미론적 패턴 매칭)의 차이를, subprocess.Popen shell=True 패턴을 예시로 설명하세요. 정규표현식이 HTML 파싱에 적합하지 않은 이유와 연결지어 설명해보세요.",
        systemPrompt: "학생이 grep 정규식과 semgrep의 차이를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: grep(텍스트) vs semgrep(AST), 정규표현식의 한계(줄 바꿈/공백/변수), semgrep의 `...` 패턴(임의 인수), 보안 린팅에서 텍스트 매칭의 위험성(False Negative). 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "9-5",
        title: "IDE에서 정규식 검색-및-바꾸기 (- → * 글머리 마커)",
        problem: `IDE 또는 텍스트 에디터에서 정규표현식 검색-및-바꾸기를 연습하세요. 이를 위해 \`-\` [Markdown 글머리 마커](https://spec.commonmark.org/0.31.2/#bullet-list-marker)를 \`*\` 글머리 마커로 바꾸세요. [이 강의 노트](https://raw.githubusercontent.com/missing-semester/missing-semester/refs/heads/master/_2026/code-quality.md)를 참고하세요. 파일에서 모든 "-" 문자들을 바꾸는 것만은 잘못된 것입니다. 해당 문자에 대한 많은 다른 사용들이 글머리 마커가 아니기 때문입니다.

**잘못된 방법:** 모든 \`-\`를 \`*\`로 바꾸기
**올바른 방법:** 줄 시작의 \`- \` 패턴만 바꾸기

VS Code에서:
1. Ctrl+H (Find and Replace) 열기
2. 정규식 모드 활성화 (.*  아이콘 클릭)
3. Find: \`^- \` (줄 시작의 \`- \` 패턴)
4. Replace: \`* \`

CLI에서:
\`\`\`bash
# sed를 사용한 방법
sed 's/^- /* /g' code-quality.md > fixed.md
# 또는 in-place:
sed -i 's/^- /* /g' code-quality.md
\`\`\``,
        hints: ["정규식에서 `^`는 '줄의 시작'을 의미합니다 — `^- `는 줄 시작의 `- `만 매칭합니다", "`- ` 패턴은 글머리 마커 뒤에 공백이 있다고 가정합니다 — 중첩 목록(`  - item`)도 처리하려면 `^\\s*- `를 사용하세요", "변환 전후 diff를 확인해서 의도하지 않은 변경이 없는지 검증하세요"],
        socraticStarter: "모든 `-`를 `*`로 단순 치환하면 어떤 문제가 생길까요? 코드 블록의 Python 코드에서 `x - y`나 날짜 표시 `2026-01-14` 같은 곳은 어떻게 될까요?",
        feynmanPrompt: "정규식에서 `^` 앵커가 왜 이 문제의 핵심인지, 그리고 '모든 `-` 대체'와 '글머리 마커만 대체'의 차이를 설명하세요. 또한 IDE와 CLI(sed)에서 정규식 검색-치환이 어떻게 다르게 작동하는지 설명해보세요.",
        systemPrompt: "학생이 IDE와 CLI에서 정규식 검색-및-바꾸기를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: `^` 줄 시작 앵커, 단순 문자 대체의 위험성(의도하지 않은 변경), 중첩 목록 처리(`\\s*`), IDE vs sed 정규식 문법 차이, 변환 전후 diff 검증. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      },
      {
        id: "9-6",
        title: "JSON에서 이름 캡처하는 정규식 + JSON 파서 비교",
        problem: `\`{"name": "Alyssa P. Hacker", "college": "MIT"}\` 형식의 JSON 구조들에서 이름(이 예에서는 \`Alyssa P. Hacker\`)을 캡처하기 위해 정규표현식을 작성하세요. 힌트: 첫 번째 시도에서, 당신은 \`Alyssa P. Hacker", "college": "MIT\`를 추출하는 정규표현식을 작성할 수도 있습니다. 그것을 고치는 방법을 알아내기 위해 [Python 정규표현식 문서](https://docs.python.org/3/library/re.html)에서 탐욕적인 수량사에 대해 읽으세요.

**단계 1: 기본 정규식**
\`\`\`python
import re
text = '{"name": "Alyssa P. Hacker", "college": "MIT"}'
# 탐욕적(greedy): 너무 많이 매칭!
re.search(r'"name": "(.*)"', text).group(1)
# 비탐욕적(non-greedy): 정확한 매칭
re.search(r'"name": "(.*?)"', text).group(1)
\`\`\`

**단계 2: 이름에 이스케이프된 따옴표가 포함된 경우**
\`\`\`python
text2 = '{"name": "O\\'Brien", "college": "MIT"}'
# 이 경우를 처리하는 정규식은?
\`\`\`

**단계 3: JSON 파서 사용 (권장)**
\`\`\`python
import json, sys
data = json.loads(sys.stdin.read())
print(data["name"])
\`\`\`

우리는 실제로 정교한 파싱 문제들에 대해 정규표현식을 사용하지 말 것을 **권하지 않습니다**.`,
        hints: ["`.`은 임의 문자, `*`는 0회 이상 반복 — `.*`는 기본적으로 탐욕적(greedy)으로 가능한 한 많이 매칭합니다", "`.*?`의 `?`를 수량사 뒤에 붙이면 비탐욕적(non-greedy)이 됩니다 — 가능한 한 적게 매칭합니다", "JSON에는 이미 완벽한 파서가 있습니다(`json.loads`) — 정규식으로 JSON 파싱을 시도하는 것은 안티패턴입니다"],
        socraticStarter: "`.*`와 `.*?`의 차이를 실험했을 때 어떤 결과가 나왔나요? '탐욕적(greedy)'이라는 이름이 왜 붙었는지 실제 매칭 동작으로 설명해보세요.",
        feynmanPrompt: "탐욕적(greedy) vs 비탐욕적(non-greedy) 수량사의 차이를 설명하고, 이름에 이스케이프된 따옴표가 있을 때 정규식이 왜 실패하는지, 그리고 이것이 '정규표현식으로 HTML/JSON 파싱을 하면 안 되는 이유'와 어떻게 연결되는지 설명해보세요.",
        systemPrompt: "학생이 정규표현식의 탐욕적/비탐욕적 수량사와 파싱 한계를 공부 중입니다. 소크라테스식으로 질문하세요. 핵심: greedy(`.*`) vs non-greedy(`.*?`), 캡처 그룹 `(...)`, 정규 언어의 표현 한계(HTML/JSON 파싱 불가), `json.loads`가 정규식보다 나은 이유, 이스케이프된 따옴표 처리의 복잡성. 한국어로, 2-3문장으로 짧게 답하세요. 직접 답 금지."
      }
    ]
  }
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function parseText(text, accent) {
  const parts = text.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const code = part.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
      return (
        <pre key={i} style={{
          background: "#0a140a", border: "1px solid #2a3a2a",
          borderLeft: "3px solid " + accent,
          padding: "12px 14px", fontSize: "11.5px",
          fontFamily: "'IBM Plex Mono', monospace", color: "#c0ecb0",
          lineHeight: "1.65", overflowX: "auto", margin: "10px 0",
          whiteSpace: "pre", borderRadius: "2px"
        }}>{code}</pre>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} style={{
          color: accent, background: accent + "18",
          padding: "1px 5px", borderRadius: "2px",
          fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace"
        }}>{part.slice(1, -1)}</code>
      );
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={i + "-" + j}>{line}{j < arr.length - 1 && <br />}</span>
    ));
  });
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function Cursor({ color = "#39ff14" }) {
  return <span style={{
    display: "inline-block", width: "8px", height: "14px",
    background: color, verticalAlign: "text-bottom",
    animation: "blink 1.1s step-end infinite", marginLeft: "2px"
  }} />;
}

function PhaseBar({ phase, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {PHASE_LABELS.map((label, i) => {
        const done = i < phase, active = i === phase;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
              <div style={{
                width: "20px", height: "20px",
                background: done ? accent : "transparent",
                border: "1px solid " + (done || active ? accent : "#1a1a1a"),
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "9px", color: done ? "#000" : active ? accent : "#1a1a1a",
                fontWeight: "bold", fontFamily: "monospace"
              }}>{done ? "✓" : i + 1}</div>
              <span style={{
                fontSize: "8px", color: active ? accent : done ? accent + "88" : "#1a1a1a",
                whiteSpace: "nowrap", fontFamily: "'IBM Plex Mono', monospace"
              }}>{label}</span>
            </div>
            {i < PHASE_LABELS.length - 1 && (
              <div style={{ width: "24px", height: "1px", background: done ? accent : "#111", marginBottom: "14px", margin: "0 2px 14px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SOCRATIC VIEW ───────────────────────────────────────────────────────────
function SocraticView({ ex, accent, onDone }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", text: ex.socraticStarter }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState(0);
  const [finished, setFinished] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, loading]);

  const send = useCallback(async () => {
    const t = input.trim();
    if (!t || loading || finished) return;
    const nextMsgs = [...msgs, { role: "user", text: t }];
    setMsgs(nextMsgs);
    setInput("");
    setLoading(true);
    const newTurn = turn + 1;
    setTurn(newTurn);
    try {
      const apiMsgs = nextMsgs.map(m => ({ role: m.role, content: m.text }));
      const wrap = newTurn >= 5;
      const system = `[연습문제 원문]\n${ex.problem}\n\n[Socratic tutor 지침]\n${ex.systemPrompt}` + (
        wrap ? "\n\n학생이 충분히 탐구했습니다. 따뜻하게 칭찬하고 핵심 인사이트를 1-2문장 요약한 뒤, 파인만 테스트로 넘어갈 준비가 됐는지 물어보세요." : ""
      );
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, system, messages: apiMsgs })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "(응답 오류)";
      setMsgs(prev => [...prev, { role: "assistant", text: reply }]);
      if (wrap) { setFinished(true); setTimeout(onDone, 2000); }
    } catch { setMsgs(prev => [...prev, { role: "assistant", text: "API 오류. 건너뛰기 버튼을 누르세요." }]); }
    finally { setLoading(false); }
  }, [input, msgs, loading, turn, finished, ex, onDone]);

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "8px 16px", background: "#030303", borderBottom: "1px solid #0e0e0e", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: "9px", color: "#666666", fontFamily: "monospace", letterSpacing: "0.08em" }}>// SOCRATIC METHOD — 질문으로 탐구하세요</span>
        <span style={{ fontSize: "9px", color: accent, fontFamily: "monospace" }}>turn {turn}/5</span>
      </div>
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {msgs.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: "10px" }}>
              {!isUser && <div style={{ width: "22px", height: "22px", flexShrink: 0, background: "#050505", border: "1px solid " + accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: accent, fontFamily: "monospace", marginRight: "8px", marginTop: "2px" }}>AI</div>}
              <div style={{ maxWidth: "80%", background: isUser ? "#0a1a0a" : "#070707", border: "1px solid " + (isUser ? accent + "44" : "#151515"), padding: "9px 13px", color: isUser ? "#a0e0a0" : "#6a7a6a", fontSize: "12.5px", lineHeight: "1.65", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "pre-wrap" }}>{m.text}</div>
              {isUser && <div style={{ width: "22px", height: "22px", flexShrink: 0, background: accent + "20", border: "1px solid " + accent + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: accent, fontFamily: "monospace", marginLeft: "8px", marginTop: "2px" }}>ME</div>}
            </div>
          );
        })}
        {loading && <div style={{ color: "#666666", fontSize: "11px", fontFamily: "monospace", padding: "4px 30px" }}>생각 중 <Cursor color="#333" /></div>}
      </div>
      <div style={{ padding: "10px 14px", borderTop: "1px solid #0e0e0e", display: "flex", gap: "8px", alignItems: "flex-end", flexShrink: 0 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="답변 입력... (Enter 전송, Shift+Enter 줄바꿈)" disabled={loading || finished} rows={2}
          style={{ flex: 1, background: "#030303", border: "1px solid " + (input ? accent + "55" : "#111"), color: "#b0bab0", padding: "9px 11px", fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace", resize: "none", outline: "none", minHeight: "42px", transition: "border-color 0.2s" }} />
        <button onClick={send} disabled={loading || !input.trim() || finished}
          style={{ background: (!loading && input.trim() && !finished) ? accent : "#0a0a0a", color: (!loading && input.trim() && !finished) ? "#000" : "#666666", border: "1px solid " + ((!loading && input.trim() && !finished) ? accent : "#111"), padding: "0 16px", height: "42px", cursor: (!loading && input.trim() && !finished) ? "pointer" : "default", fontFamily: "monospace", fontSize: "12px", fontWeight: "bold", transition: "all 0.15s", flexShrink: 0 }}>SEND</button>
      </div>
      <button onClick={onDone} style={{ margin: "0 14px 10px", background: "transparent", border: "1px solid #111", color: "#666666", padding: "7px", cursor: "pointer", fontSize: "10px", fontFamily: "monospace", flexShrink: 0 }}>파인만 테스트로 건너뛰기 →</button>
    </div>
  );
}

// ─── FEYNMAN VIEW ────────────────────────────────────────────────────────────
function FeynmanView({ ex, accent, onDone }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const submit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `[MIT Missing Semester 연습문제]\n${ex.problem}\n\n학생이 파인만 기법으로 이 연습문제의 개념을 설명했습니다. 평가해주세요. 한국어로:\n\n✓ 잘 이해한 점: (구체적으로)\n△ 보완할 점: (놓친 핵심 개념)\n💡 핵심 인사이트: (이 연습문제가 가르치려는 것의 본질 1-2문장)\n\n따뜻하고 격려하는 톤으로. 300자 이내.`,
          messages: [{ role: "user", content: "학생 설명:\n" + text }]
        })
      });
      const data = await res.json();
      setFeedback(data.content?.[0]?.text || "(피드백 오류)");
    } catch { setFeedback("API 오류. 다음 연습문제로 넘어가세요."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "18px 22px", overflow: "hidden" }}>
      <div style={{ background: "#050505", borderLeft: "3px solid " + accent, border: "1px solid " + accent + "33", padding: "14px", marginBottom: "14px", flexShrink: 0 }}>
        <div style={{ fontSize: "9px", color: accent, fontFamily: "monospace", marginBottom: "7px", letterSpacing: "0.1em" }}>// FEYNMAN TECHNIQUE</div>
        <div style={{ color: "#909090", fontSize: "13px", fontFamily: "'IBM Plex Mono', monospace", lineHeight: "1.65" }}>{ex.feynmanPrompt}</div>
      </div>
      {!feedback ? (
        <>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="내 말로 설명하기... 전문 용어 없이도 괜찮아요. 모르는 부분도 솔직하게 적으세요."
            style={{ flex: 1, background: "#030303", border: "1px solid " + (text ? accent + "44" : "#111"), color: "#a0b0a0", padding: "14px", fontSize: "13px", fontFamily: "'IBM Plex Mono', monospace", resize: "none", outline: "none", lineHeight: "1.75", marginBottom: "12px", transition: "border-color 0.2s", minHeight: "120px" }} />
          <button onClick={submit} disabled={!text.trim() || loading}
            style={{ background: (text.trim() && !loading) ? accent : "#0a0a0a", color: (text.trim() && !loading) ? "#000" : "#1a1a1a", border: "1px solid " + ((text.trim() && !loading) ? accent : "#111"), padding: "13px", cursor: (text.trim() && !loading) ? "pointer" : "default", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", fontWeight: "700", letterSpacing: "0.05em", transition: "all 0.15s", flexShrink: 0 }}>
            {loading ? "평가 중..." : "설명 제출 →"}
          </button>
        </>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", overflow: "hidden", minHeight: 0 }}>
          <div style={{ background: "#030303", border: "1px solid #111", padding: "10px 12px", color: "#707070", fontSize: "11px", fontFamily: "monospace", maxHeight: "80px", overflowY: "auto", flexShrink: 0 }}>
            <span style={{ color: "#505050" }}>내 설명: </span>{text}
          </div>
          <div style={{ flex: 1, background: "#030a03", border: "1px solid " + accent + "33", padding: "16px", color: "#7a9a7a", fontSize: "13px", fontFamily: "'IBM Plex Mono', monospace", lineHeight: "1.75", whiteSpace: "pre-wrap", overflowY: "auto", minHeight: 0 }}>{feedback}</div>
          <button onClick={onDone} style={{ background: accent, color: "#000", border: "none", padding: "13px", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", fontWeight: "700", flexShrink: 0 }}>다음 연습문제 →</button>
        </div>
      )}
    </div>
  );
}

// ─── EXERCISE VIEW ───────────────────────────────────────────────────────────
function ExerciseView({ lec, ex, phase, setPhase }) {
  const accent = lec.accent;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 22px 12px", borderBottom: "1px solid #0d0d0d", background: "#010101", flexShrink: 0 }}>
        <div style={{ fontSize: "8px", color: "#505050", letterSpacing: "0.12em", marginBottom: "3px" }}>
          LEC {lec.id} — {lec.date}
        </div>
        <h2 style={{ margin: "0 0 2px", fontSize: "16px", color: accent, fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700" }}>{ex.title}</h2>
        <div style={{ marginTop: "10px" }}><PhaseBar phase={phase} accent={accent} /></div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        {phase === PHASE.INTRO && (
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            <div style={{ background: "#050505", border: "1px solid #151515", padding: "18px", marginBottom: "16px" }}>
              <div style={{ fontSize: "9px", color: "#666666", fontFamily: "monospace", marginBottom: "12px", letterSpacing: "0.12em" }}>// ORIGINAL MIT EXERCISE</div>
              <div style={{ fontSize: "13px", fontFamily: "'IBM Plex Mono', monospace", color: "#a0a8a0", lineHeight: "1.85" }}>
                {parseText(ex.problem, accent)}
              </div>
            </div>
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontSize: "9px", color: "#666666", fontFamily: "monospace", marginBottom: "8px", letterSpacing: "0.12em" }}>// HINTS</div>
              {ex.hints.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", padding: "7px 10px", marginBottom: "3px", borderLeft: "2px solid " + accent + "44" }}>
                  <span style={{ color: accent + "66", fontSize: "10px", fontFamily: "monospace", flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ color: "#777777", fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace", lineHeight: "1.5" }}>{h}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setPhase(PHASE.SOCRATIC)}
              style={{ width: "100%", background: "transparent", border: "1px solid " + accent, color: accent, fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", fontWeight: "600", padding: "13px", cursor: "pointer", letterSpacing: "0.05em", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = "#000"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = accent; }}>
              소크라테스 대화 시작 →
            </button>
          </div>
        )}
        {phase === PHASE.SOCRATIC && <SocraticView key={ex.id + "-s"} ex={ex} accent={accent} onDone={() => setPhase(PHASE.FEYNMAN)} />}
        {phase === PHASE.FEYNMAN && <FeynmanView key={ex.id + "-f"} ex={ex} accent={accent} onDone={() => setPhase(PHASE.DONE)} />}
        {phase === PHASE.DONE && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", gap: "14px" }}>
            <div style={{ width: "60px", height: "60px", border: "2px solid " + accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", color: accent, animation: "pulse 2s ease infinite" }}>✓</div>
            <div style={{ color: accent, fontSize: "15px", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700" }}>완료</div>
            <div style={{ color: "#666666", fontSize: "11px", fontFamily: "monospace", textAlign: "center" }}>{ex.title}</div>
            <button onClick={() => setPhase(PHASE.INTRO)} style={{ background: "transparent", border: "1px solid #1a1a1a", color: "#666666", padding: "7px 20px", cursor: "pointer", fontFamily: "monospace", fontSize: "11px" }}>↺ 다시 풀기</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LECTURE PAGE ─────────────────────────────────────────────────────────────
function LecturePage({ lec, phases, setPhases, onSelectEx, onBack }) {
  const accent = lec.accent;
  const allExIds = lec.exercises.map(e => e.id);
  const doneCount = allExIds.filter(id => (phases[id] || 0) === PHASE.DONE).length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 22px", borderBottom: "1px solid #0d0d0d", background: "#010101", flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "1px solid #111", color: "#666666", padding: "4px 10px", cursor: "pointer", fontSize: "10px", fontFamily: "monospace", marginBottom: "12px" }}>← 목록으로</button>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", border: "1px solid " + accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: accent, fontFamily: "monospace", flexShrink: 0 }}>{lec.icon}</div>
          <div>
            <div style={{ fontSize: "8px", color: "#505050", letterSpacing: "0.12em", marginBottom: "2px" }}>{lec.date}</div>
            <h2 style={{ margin: 0, fontSize: "15px", color: accent, fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700" }}>{lec.title}</h2>
            <div style={{ fontSize: "10px", color: "#666666", marginTop: "2px", fontFamily: "monospace" }}>{lec.desc}</div>
          </div>
        </div>
        <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flex: 1, height: "2px", background: "#0a0a0a" }}>
            <div style={{ height: "100%", width: (doneCount / allExIds.length * 100) + "%", background: accent, transition: "width 0.4s" }} />
          </div>
          <span style={{ fontSize: "10px", color: "#666666", fontFamily: "monospace" }}>{doneCount}/{allExIds.length}</span>
        </div>
      </div>
      {/* Exercise list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        <div style={{ fontSize: "9px", color: "#505050", fontFamily: "monospace", marginBottom: "10px", letterSpacing: "0.1em" }}>
          // MIT 2026 ORIGINAL EXERCISES — source: <span style={{ color: accent + "66" }}>{lec.url}</span>
        </div>
        {lec.exercises.map((ex, i) => {
          const ph = phases[ex.id] || 0;
          const done = ph === PHASE.DONE;
          const inprog = ph > PHASE.INTRO && !done;
          return (
            <button key={ex.id} onClick={() => onSelectEx(ex.id)}
              style={{ width: "100%", background: "#050505", border: "1px solid " + (done ? accent + "55" : inprog ? accent + "33" : "#0e0e0e"), borderRadius: "2px", padding: "14px 16px", cursor: "pointer", textAlign: "left", marginBottom: "6px", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = accent + "55"}
              onMouseLeave={e => e.currentTarget.style.borderColor = done ? accent + "55" : inprog ? accent + "33" : "#0e0e0e"}>
              <div style={{ width: "28px", height: "28px", flexShrink: 0, border: "1px solid " + (done ? accent : "#1a1a1a"), background: done ? accent + "20" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: done ? accent : "#2a2a2a", fontWeight: "bold", fontFamily: "monospace" }}>
                {done ? "✓" : String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", color: done ? "#3a5a3a" : inprog ? accent + "aa" : "#3a3a3a", fontWeight: "600", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.title}</div>
                <div style={{ fontSize: "10px", color: "#505050", marginTop: "2px", fontFamily: "monospace" }}>
                  {done ? "완료" : inprog ? "진행 중 — " + PHASE_LABELS[ph] : "미시작"}
                </div>
              </div>
              {inprog && <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: accent, animation: "pulse 2s ease infinite", flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── INDEX PAGE ───────────────────────────────────────────────────────────────
function IndexPage({ phases, onSelect }) {
  const totalEx = LECTURES.reduce((sum, l) => sum + l.exercises.length, 0);
  const totalDone = LECTURES.reduce((sum, l) => sum + l.exercises.filter(e => (phases[e.id] || 0) === PHASE.DONE).length, 0);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "9px", color: "#39ff14", letterSpacing: "0.15em", marginBottom: "4px" }}>MIT MISSING SEMESTER 2026</div>
        <div style={{ fontSize: "18px", color: "#3a5a3a", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700", marginBottom: "6px" }}>전체 진행률</div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "3px", background: "#0a0a0a" }}>
            <div style={{ height: "100%", width: (totalDone / totalEx * 100) + "%", background: "#39ff14", transition: "width 0.5s" }} />
          </div>
          <span style={{ fontSize: "12px", color: "#2a4a2a", fontFamily: "monospace" }}>{totalDone} / {totalEx}</span>
        </div>
        <div style={{ fontSize: "9px", color: "#484848", marginTop: "6px", fontFamily: "monospace" }}>
          소크라테스 + 파인만 학습법 // 연습문제 원본: missing.csail.mit.edu/2026
        </div>
      </div>
      {LECTURES.map((lec) => {
        const exIds = lec.exercises.map(e => e.id);
        const done = exIds.filter(id => (phases[id] || 0) === PHASE.DONE).length;
        const pct = Math.round(done / exIds.length * 100);
        return (
          <button key={lec.id} onClick={() => onSelect(lec.id)}
            style={{ width: "100%", background: "#030303", border: "1px solid #0d0d0d", borderRadius: "2px", padding: "18px", cursor: "pointer", textAlign: "left", marginBottom: "8px", transition: "all 0.15s", display: "block" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = lec.accent + "55"; e.currentTarget.style.background = "#060606"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#0d0d0d"; e.currentTarget.style.background = "#030303"; }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{ width: "34px", height: "34px", border: "1px solid " + lec.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: lec.accent, fontFamily: "monospace", flexShrink: 0 }}>{lec.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "8px", color: "#505050", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: "2px" }}>{lec.date}</div>
                <div style={{ fontSize: "13px", color: lec.accent, fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700", marginBottom: "4px" }}>{lec.title}</div>
                <div style={{ fontSize: "10px", color: "#666666", fontFamily: "monospace", marginBottom: "10px" }}>{lec.desc}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ flex: 1, height: "2px", background: "#0a0a0a" }}>
                    <div style={{ height: "100%", width: pct + "%", background: lec.accent, transition: "width 0.4s" }} />
                  </div>
                  <span style={{ fontSize: "9px", color: "#666666", fontFamily: "monospace", minWidth: "50px" }}>{done}/{exIds.length} ({pct}%)</span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// ERROR HANDLING & UTILITY FUNCTIONS
// ============================================

const recoverFromCorruptedData = (rawData) => {
  const recovered = {};

  Object.entries(rawData).forEach(([key, exercise]) => {
    try {
      if (typeof exercise.phase !== 'number' || exercise.phase > 3) {
        throw new Error(`Invalid phase: ${exercise.phase}`);
      }
      if (!Array.isArray(exercise.isPhaseAttempted) ||
          exercise.isPhaseAttempted.length !== 4) {
        throw new Error(`Invalid isPhaseAttempted`);
      }
      if (exercise.conversationHistory &&
          typeof exercise.conversationHistory !== 'object') {
        throw new Error(`Invalid conversationHistory`);
      }

      recovered[key] = exercise;
    } catch (error) {
      console.error("[CORRUPTED_EXERCISE]", { key, error: error.message });
    }
  });

  return recovered;
};

const validateCurrentState = (exercisesState, lecId, exId, phase) => {
  const key = `${lecId}-${exId}`;
  const exercise = exercisesState[key];

  if (!exercise) {
    console.error("[STATE_INCONSISTENCY]", "EXERCISE_NOT_FOUND", { lecId, exId });
    return { valid: true, correctedPhase: 0 };
  }

  const maxAttempted = exercise.isPhaseAttempted.findIndex(v => !v);
  if (phase > maxAttempted + 1 && maxAttempted !== -1) {
    console.error("[STATE_INCONSISTENCY]", "PHASE_OUT_OF_BOUNDS", {
      requested: phase,
      max: maxAttempted + 1
    });
    return { valid: true, correctedPhase: Math.min(phase, maxAttempted) };
  }

  return { valid: true };
};

const exponentialBackoffRetry = async (fn, maxRetries = 3, context = "") => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();
      if (attempt > 0) {
        console.log(`[RETRY_SUCCESS] ${context} succeeded on attempt ${attempt + 1}`);
      }
      return { success: true, data: result };
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;

      if (isLastAttempt) {
        console.error(`[RETRY_EXHAUSTED] ${context} failed after ${maxRetries} attempts`);
        return { success: false, error: error.message };
      }

      const delayMs = Math.pow(2, attempt) * 1000;
      console.warn(`[RETRY_ATTEMPT] ${context} attempt ${attempt + 1}/${maxRetries}, retrying in ${delayMs}ms`);

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};

const clearOldSessionData = () => {
  try {
    const stateJson = sessionStorage.getItem('ms2026-exercises');
    if (!stateJson) {
      return { removed: 0, kept: 0 };
    }

    const state = JSON.parse(stateJson);
    const entries = Object.entries(state);
    const sorted = entries.sort((a, b) => {
      const timeA = a[1].lastVisited || 0;
      const timeB = b[1].lastVisited || 0;
      return timeA - timeB;
    });

    const keepCount = Math.ceil(sorted.length * 0.75);
    const toRemoveCount = sorted.length - keepCount;

    const cleaned = {};
    sorted.slice(-keepCount).forEach(([key, value]) => {
      cleaned[key] = value;
    });

    sessionStorage.setItem('ms2026-exercises', JSON.stringify(cleaned));

    console.log("[CLEAR_DATA]", {
      removed: toRemoveCount,
      kept: keepCount,
      totalBefore: sorted.length
    });

    return { removed: toRemoveCount, kept: keepCount };
  } catch (error) {
    console.error("[CLEAR_DATA_ERROR]", error.message);
    return { removed: 0, kept: 0, error: error.message };
  }
};

const validateExerciseExists = (lecId, exId) => {
  const lecture = LECTURES.find(l => l.id === lecId);
  if (!lecture) {
    return { exists: false, reason: 'LECTURE_NOT_FOUND' };
  }

  const exercise = lecture.exercises.find(e => e.id === exId);
  if (!exercise) {
    return { exists: false, reason: 'EXERCISE_NOT_FOUND' };
  }

  return { exists: true, exercise };
};

const getAvailablePhases = (exercise, isReviewMode) => {
  if (isReviewMode) {
    return [true, true, true, true];
  }

  if (!exercise) {
    return [true, false, false, false];
  }

  return [
    true,
    exercise.isPhaseAttempted[0],
    exercise.isPhaseAttempted[1],
    exercise.isPhaseAttempted[2]
  ];
};

const findNextExercise = (currentLecId, currentExId) => {
  const currentLecIndex = LECTURES.findIndex(l => l.id === currentLecId);
  if (currentLecIndex === -1) return null;

  const currentLec = LECTURES[currentLecIndex];
  const currentExIndex = currentLec.exercises.findIndex(e => e.id === currentExId);

  if (currentExIndex < currentLec.exercises.length - 1) {
    return {
      lecId: currentLecId,
      exId: currentLec.exercises[currentExIndex + 1].id
    };
  }

  if (currentLecIndex < LECTURES.length - 1) {
    const nextLec = LECTURES[currentLecIndex + 1];
    return {
      lecId: nextLec.id,
      exId: nextLec.exercises[0].id
    };
  }

  return null;
};

const getSegmentColor = (phase) => {
  switch(phase) {
    case 0: return '#cbd5e0';
    case 1: return '#fcd34d';
    case 2: return '#fbbf24';
    case 3: return '#48bb78';
    default: return '#cbd5e0';
  }
};

const PHASE_COLORS = {
  0: {
    bg: '#e8f0ff',
    border: '#4299e1',
    text: '#1a1a2e',
    textSecondary: '#1a365d'
  },
  1: {
    bg: '#fff5e6',
    border: '#ed8936',
    text: '#7c2d12',
    textSecondary: '#7c2d12'
  },
  2: {
    bg: '#e6f7ff',
    border: '#00b4d8',
    text: '#03045e',
    textSecondary: '#03045e'
  },
  3: {
    bg: '#e8f5e9',
    border: '#48bb78',
    text: '#1b5e20',
    textSecondary: '#1b5e20'
  }
};

// ============================================
// COMPONENTS
// ============================================

const ProgressBar = ({ exercisesState, currentLecId, currentExId, onNavigate }) => {
  const getProgressSummary = () => {
    return LECTURES.map(lecture => ({
      lecId: lecture.id,
      lecTitle: lecture.title,
      exercises: lecture.exercises.map(ex => ({
        exId: ex.id,
        exTitle: ex.title,
        phase: exercisesState[`${lecture.id}-${ex.id}`]?.phase || 0
      }))
    }));
  };

  const summary = getProgressSummary();

  return (
    <div style={{
      borderTop: '2px solid #e2e8f0',
      padding: '16px',
      backgroundColor: '#f8f9fa'
    }}>
      {summary.map(lecture => (
        <div key={lecture.lecId} style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#1a1a2e'
          }}>
            Lecture {lecture.lecId}: {lecture.lecTitle}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {lecture.exercises.map(ex => {
              const isCurrentEx = currentLecId === lecture.lecId &&
                                 currentExId === ex.exId;
              const [isHovered, setIsHovered] = React.useState(false);

              return (
                <button
                  key={`${lecture.lecId}-${ex.exId}`}
                  onClick={() => onNavigate(lecture.lecId, ex.exId)}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: isCurrentEx ? '3px solid #2d3748' : '1px solid #cbd5e0',
                    backgroundColor: getSegmentColor(ex.phase),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: isHovered ? '0 0 8px rgba(66, 153, 225, 0.5)' : 'none'
                  }}
                  title={`${lecture.lecId}-${ex.exId}: ${ex.exTitle}`}
                  aria-label={`Exercise ${lecture.lecId}-${ex.exId}: ${ex.exTitle}`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const PhaseSelector = ({
  exercisesState,
  currentLecId,
  currentExId,
  currentPhase,
  isReviewMode,
  onPhaseChange
}) => {
  const key = `${currentLecId}-${currentExId}`;
  const exercise = exercisesState[key];

  if (!exercise) return null;

  const available = getAvailablePhases(exercise, isReviewMode);
  const LABELS = ['INTRO', 'SOCRATIC', 'FEYNMAN', 'DONE'];

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      padding: '12px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      flexWrap: 'wrap'
    }}>
      {[0, 1, 2, 3].map(phaseNum => (
        <button
          key={phaseNum}
          onClick={() => available[phaseNum] && onPhaseChange(phaseNum)}
          disabled={!available[phaseNum]}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: currentPhase === phaseNum ? '2px solid #2d3748' : '1px solid #cbd5e0',
            backgroundColor: currentPhase === phaseNum ? '#4299e1' : '#ffffff',
            color: currentPhase === phaseNum ? '#ffffff' : '#1a1a2e',
            cursor: available[phaseNum] ? 'pointer' : 'not-allowed',
            opacity: available[phaseNum] ? 1 : 0.5,
            fontWeight: currentPhase === phaseNum ? 'bold' : 'normal',
            transition: 'all 0.2s ease'
          }}
        >
          {phaseNum}: {LABELS[phaseNum]}
          {exercise.isPhaseAttempted[phaseNum] && ' ✓'}
        </button>
      ))}
    </div>
  );
};

const ActionButtons = ({
  currentPhase,
  isReviewMode,
  onContinue,
  onNext,
  onReview
}) => {
  if (isReviewMode) {
    return null;
  }

  if (currentPhase < 3) {
    return (
      <div style={{ margin: '16px 0' }}>
        <button
          onClick={onContinue}
          style={{
            backgroundColor: '#4299e1',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#2463a4';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#4299e1';
          }}
        >
          계속하기 →
        </button>
      </div>
    );
  } else {
    return (
      <div style={{ display: 'flex', gap: '12px', margin: '16px 0' }}>
        <button
          onClick={onNext}
          style={{
            backgroundColor: '#48bb78',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            flex: 1
          }}
        >
          다음 연습 ↓
        </button>
        <button
          onClick={onReview}
          style={{
            backgroundColor: '#ed8936',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            flex: 1
          }}
        >
          복습하기
        </button>
      </div>
    );
  }
};

const ErrorNotification = ({ notification, onDismiss }) => {
  if (!notification) return null;

  const getIcon = (type) => {
    switch(type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '💬';
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'error': return '#dc2626';
      case 'warning': return '#ea580c';
      case 'info': return '#2563eb';
      case 'success': return '#16a34a';
      default: return '#6366f1';
    }
  };

  const color = getColor(notification.type);

  return (
    <div style={{
      backgroundColor: `${color}15`,
      border: `2px solid ${color}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      color: color,
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    }}>
      <div style={{ fontSize: '20px', marginTop: '2px' }}>
        {getIcon(notification.type)}
      </div>

      <div style={{ flex: 1 }}>
        {notification.title && (
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {notification.title}
          </div>
        )}
        <div>{notification.message}</div>

        {notification.action && (
          <button
            onClick={notification.action.onClick}
            style={{
              marginTop: '12px',
              backgroundColor: color,
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {notification.action.label}
          </button>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: color,
            padding: 0
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // ============================================
  // UNIFIED STATE MANAGEMENT
  // ============================================
  const [exercisesState, setExercisesState] = useState(() => {
    try {
      const stored = sessionStorage.getItem("ms2026-exercises");
      if (!stored) {
        console.log("[STATE_INIT] Fresh session - no previous data");
        return {};
      }

      const parsed = JSON.parse(stored);
      const recovered = recoverFromCorruptedData(parsed);

      if (Object.keys(recovered).length < Object.keys(parsed).length) {
        console.warn("[STATE_INIT] Recovered", Object.keys(recovered).length,
                     "of", Object.keys(parsed).length, "exercises");
      }

      return recovered;
    } catch (error) {
      console.error("[STATE_INIT_ERROR]", error.message);
      return {};
    }
  });

  const [currentLecId, setCurrentLecId] = useState("1");
  const [currentExId, setCurrentExId] = useState("1");
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentConversationHistory, setCurrentConversationHistory] = useState([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [notification, setNotification] = useState(null);

  // ============================================
  // LEGACY STATE (호환성 유지)
  // ============================================
  const [page, setPage] = useState("index"); // "index" | "lecture" | "exercise"
  const [lecId, setLecId] = useState(null);
  const [exId, setExId] = useState(null);
  const [phases, setPhases] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ms2026-phases") || "{}"); } catch { return {}; }
  });

  const savePhase = useCallback((eid, ph) => {
    setPhases(prev => {
      const next = { ...prev, [eid]: ph };
      try { localStorage.setItem("ms2026-phases", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // ============================================
  // PERSISTENCE: Auto-save to sessionStorage
  // ============================================
  useEffect(() => {
    try {
      sessionStorage.setItem('ms2026-exercises', JSON.stringify(exercisesState));
      console.log("[PERSIST] State saved to sessionStorage");
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error("[STORAGE_QUOTA_EXCEEDED]");
        const result = clearOldSessionData();
        showNotification(
          'warning',
          '저장소 공간 부족',
          `${result.removed}개의 오래된 연습을 삭제했습니다.`
        );
      } else {
        console.error("[STORAGE_ERROR]", error.message);
      }
    }
  }, [exercisesState]);

  const showNotification = (type, title, message, action = null) => {
    setNotification({ type, title, message, action });
    if (type !== 'error') {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // ============================================
  // HANDLER FUNCTIONS (Tasks 8-12)
  // ============================================

  const handleNavigateToExercise = useCallback((lecId, exId) => {
    const validation = validateExerciseExists(lecId, exId);
    if (!validation.exists) {
      console.error("[NAVIGATE_ERROR]", validation.reason, { lecId, exId });
      return;
    }

    const key = `${lecId}-${exId}`;

    if (!exercisesState[key]) {
      setExercisesState(prev => ({
        ...prev,
        [key]: {
          phase: 0,
          isPhaseAttempted: [false, false, false, false],
          conversationHistory: { 0: [], 1: [], 2: [], 3: [] },
          attempts: 0,
          isCompleted: false,
          lastVisited: Date.now()
        }
      }));
    } else {
      setExercisesState(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          lastVisited: Date.now()
        }
      }));
    }

    setCurrentLecId(lecId);
    setCurrentExId(exId);
    setCurrentPhase(0);
    setCurrentConversationHistory([]);
    setIsReviewMode(false);

    console.log("[NAVIGATE]", { from: `${currentLecId}-${currentExId}`, to: key });
  }, [exercisesState, currentLecId, currentExId]);

  const handlePhaseChange = useCallback((newPhase) => {
    const key = `${currentLecId}-${currentExId}`;
    const exercise = exercisesState[key];

    if (!exercise) {
      console.error("[PHASE_CHANGE_ERROR]", "EXERCISE_NOT_FOUND", { key });
      return;
    }

    const available = getAvailablePhases(exercise, isReviewMode);
    if (!available[newPhase]) {
      console.error("[PHASE_LOCKED]", { requested: newPhase, available });
      return;
    }

    setExercisesState(prev => {
      const attempts = [...(prev[key].isPhaseAttempted || [false, false, false, false])];
      attempts[newPhase] = true;

      return {
        ...prev,
        [key]: {
          ...prev[key],
          isPhaseAttempted: attempts
        }
      };
    });

    setCurrentPhase(newPhase);

    const history = exercise.conversationHistory?.[newPhase] || [];
    setCurrentConversationHistory(history);

    console.log("[PHASE_CHANGE]", { from: currentPhase, to: newPhase, exercise: key });
  }, [currentLecId, currentExId, currentPhase, exercisesState, isReviewMode]);

  const handleContinuePhase = useCallback(() => {
    const nextPhase = currentPhase + 1;

    if (nextPhase > 3) {
      console.warn("[CONTINUE_PHASE]", "Already at final phase");
      return;
    }

    handlePhaseChange(nextPhase);

    console.log("[CONTINUE_PHASE]", { from: currentPhase, to: nextPhase });
  }, [currentPhase, handlePhaseChange]);

  const handleNextExercise = useCallback(() => {
    const key = `${currentLecId}-${currentExId}`;

    setExercisesState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        phase: 3,
        isCompleted: true,
        lastCompletionTime: Date.now()
      }
    }));

    const next = findNextExercise(currentLecId, currentExId);

    if (!next) {
      console.log("[NEXT_EXERCISE]", "Course completed!");
      setCurrentLecId("COMPLETED");
      return;
    }

    handleNavigateToExercise(next.lecId, next.exId);

    console.log("[NEXT_EXERCISE]", { from: key, to: `${next.lecId}-${next.exId}` });
  }, [currentLecId, currentExId, exercisesState, handleNavigateToExercise]);

  const handleReview = useCallback(() => {
    const key = `${currentLecId}-${currentExId}`;

    setExercisesState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        phase: 3,
        isCompleted: true,
        lastCompletionTime: Date.now()
      }
    }));

    setIsReviewMode(true);
    setCurrentPhase(3);

    console.log("[REVIEW_MODE]", { exercise: key, enabled: true });
  }, [currentLecId, currentExId, exercisesState]);

  const exitReviewMode = useCallback(() => {
    setIsReviewMode(false);
    setCurrentPhase(0);
    setCurrentConversationHistory([]);
    console.log("[REVIEW_MODE]", { enabled: false });
  }, []);

  // ============================================
  // AI RESPONSE HANDLING (Task 13)
  // ============================================

  const generateAIResponse = async (userMessage, phase, conversationHistory) => {
    const apiCall = async () => {
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          phase: phase,
          history: conversationHistory
        }),
        timeout: 15000
      });

      if (!response.ok) {
        const error = new Error(`API Error ${response.status}`);
        error.statusCode = response.status;
        throw error;
      }

      const data = await response.json();
      return data.content;
    };

    return exponentialBackoffRetry(
      apiCall,
      3,
      `[AI_RESPONSE] phase ${phase}`
    );
  };

  const handleSendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;

    const newHistory = [
      ...currentConversationHistory,
      { role: 'user', content: userMessage }
    ];

    setCurrentConversationHistory(newHistory);

    showNotification('info', null, '응답 생성 중...');

    const result = await generateAIResponse(
      userMessage,
      currentPhase,
      newHistory
    );

    if (!result.success) {
      showNotification(
        'error',
        'AI 응답 생성 실패',
        result.error || '알 수 없는 오류가 발생했습니다.',
        {
          label: '다시 시도',
          onClick: () => handleSendMessage(userMessage)
        }
      );
      return;
    }

    const finalHistory = [
      ...newHistory,
      { role: 'assistant', content: result.data }
    ];

    const key = `${currentLecId}-${currentExId}`;
    setExercisesState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        conversationHistory: {
          ...prev[key].conversationHistory,
          [currentPhase]: finalHistory
        }
      }
    }));

    setCurrentConversationHistory(finalHistory);

    showNotification('success', null, '응답이 생성되었습니다.');
  };

  const lec = LECTURES.find(l => l.id === lecId);
  const ex = lec?.exercises.find(e => e.id === exId);
  const accent = lec?.accent || "#39ff14";

  // Auto-advance to next exercise after DONE
  const handleExDone = useCallback(() => {
    savePhase(exId, PHASE.DONE);
    if (lec) {
      const idx = lec.exercises.findIndex(e => e.id === exId);
      if (idx < lec.exercises.length - 1) {
        setTimeout(() => { setExId(lec.exercises[idx + 1].id); savePhase(lec.exercises[idx + 1].id, 0); }, 600);
      }
    }
  }, [exId, lec, savePhase]);

  const totalEx = LECTURES.reduce((s, l) => s + l.exercises.length, 0);
  const totalDone = LECTURES.reduce((s, l) => s + l.exercises.filter(e => (phases[e.id] || 0) === PHASE.DONE).length, 0);

  // ============================================
  // HELPER FUNCTIONS FOR RENDERING (Task 14)
  // ============================================

  const getCurrentExerciseTitle = () => {
    const lecture = LECTURES.find(l => l.id === currentLecId);
    if (!lecture) return "Unknown";

    const exercise = lecture.exercises.find(e => e.id === currentExId);
    return exercise ? exercise.title : "Unknown";
  };

  const renderPhaseContent = () => {
    const colors = PHASE_COLORS[currentPhase];
    if (!colors) return null;

    const containerStyle = {
      backgroundColor: colors.bg,
      border: `2px solid ${colors.border}`,
      color: colors.text,
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '16px',
      minHeight: '300px'
    };

    const PHASE_LABELS = ['INTRO', 'SOCRATIC', 'FEYNMAN', 'DONE'];

    return (
      <div style={containerStyle}>
        <h3>{PHASE_LABELS[currentPhase]} - 학습 단계</h3>
        <p>This phase content will be populated from the existing exercise data.</p>
        {isReviewMode && (
          <p style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '12px' }}>
            복습 모드: 다른 단계를 자유롭게 탐색할 수 있습니다.
          </p>
        )}
      </div>
    );
  };

  const renderCourseCompletedPage = () => {
    return (
      <div style={{
        backgroundColor: '#e8f5e9',
        border: '2px solid #48bb78',
        padding: '40px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#1b5e20', marginBottom: '16px' }}>
          🎉 Missing Semester 완료!
        </h1>
        <p style={{ color: '#2d6a4f', fontSize: '18px', marginBottom: '24px' }}>
          모든 강의와 연습을 성공적으로 완료했습니다.
        </p>
        <button
          onClick={() => {
            setPage("index");
            setCurrentLecId("1");
            setCurrentExId("1");
          }}
          style={{
            backgroundColor: '#48bb78',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#020202", fontFamily: "'IBM Plex Mono', monospace", color: "#5a5a5a", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; }
        textarea { font-family: inherit; }
        textarea:focus { outline: none; }
        button { font-family: inherit; }
      `}</style>

      {/* CRT scanline */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, background: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 2px)" }} />

      {/* ERROR NOTIFICATION (NEW SYSTEM) */}
      <div style={{ position: "fixed", top: "50px", left: "220px", right: 0, zIndex: 1000, pointerEvents: "auto" }}>
        <ErrorNotification
          notification={notification}
          onDismiss={() => setNotification(null)}
        />
      </div>

      {/* SIDEBAR */}
      <div style={{ width: "200px", minWidth: "200px", borderRight: "1px solid #0e0e0e", background: "#010101", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "14px 12px", borderBottom: "1px solid #0e0e0e", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#39ff14", boxShadow: "0 0 6px #39ff14" }} />
            <span style={{ fontSize: "9px", color: "#39ff14", letterSpacing: "0.12em" }}>MISSING SEMESTER</span>
          </div>
          <div style={{ fontSize: "8px", color: "#505050" }}>MIT IAP 2026</div>
          <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ flex: 1, height: "2px", background: "#0a0a0a" }}>
              <div style={{ height: "100%", width: (totalDone / totalEx * 100) + "%", background: "#39ff14", transition: "width 0.5s" }} />
            </div>
            <span style={{ fontSize: "8px", color: "#666666", fontFamily: "monospace" }}>{totalDone}/{totalEx}</span>
          </div>
        </div>
        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          <button onClick={() => { setPage("index"); setLecId(null); setExId(null); }}
            style={{ width: "100%", background: page === "index" ? "#070707" : "transparent", border: "1px solid " + (page === "index" ? "#39ff14" + "33" : "transparent"), padding: "8px 10px", cursor: "pointer", textAlign: "left", marginBottom: "4px", fontSize: "10px", color: page === "index" ? "#39ff14" : "#2a2a2a" }}>
            ⌂ 전체 강의 목록
          </button>
          {LECTURES.map(l => {
            const exIds = l.exercises.map(e => e.id);
            const done = exIds.filter(id => (phases[id] || 0) === PHASE.DONE).length;
            const isActive = lecId === l.id;
            return (
              <div key={l.id}>
                <button onClick={() => { setLecId(l.id); setExId(null); setPage("lecture"); }}
                  style={{ width: "100%", background: isActive ? "#070707" : "transparent", border: "1px solid " + (isActive ? l.accent + "33" : "transparent"), padding: "7px 10px", cursor: "pointer", textAlign: "left", marginBottom: "2px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "10px", color: l.accent, fontFamily: "monospace", width: "12px", flexShrink: 0 }}>{l.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "9px", color: isActive ? l.accent : "#2a2a2a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Lec {l.id}</div>
                    <div style={{ fontSize: "8px", color: "#484848" }}>{done}/{exIds.length}</div>
                  </div>
                </button>
                {isActive && page === "exercise" && lec && lec.exercises.map(e => {
                  const ph = phases[e.id] || 0;
                  const isEx = e.id === exId;
                  return (
                    <button key={e.id} onClick={() => { setExId(e.id); setPage("exercise"); }}
                      style={{ width: "100%", background: isEx ? "#050505" : "transparent", border: "none", padding: "5px 10px 5px 22px", cursor: "pointer", textAlign: "left", marginBottom: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "8px", color: ph === PHASE.DONE ? lec.accent : isEx ? lec.accent + "aa" : "#1a1a1a", fontFamily: "monospace" }}>{ph === PHASE.DONE ? "✓" : "·"}</span>
                      <span style={{ fontSize: "9px", color: isEx ? lec.accent : ph === PHASE.DONE ? "#3a3a3a" : "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        {/* Footer */}
        <div style={{ padding: "10px 12px", borderTop: "1px solid #0d0d0d", fontSize: "8px", color: "#484848", lineHeight: "1.7", flexShrink: 0 }}>
          Socratic + Feynman Method<br />
          원본 연습문제 © MIT
        </div>
      </div>

      {/* MAIN PANEL */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ height: "36px", background: "#010101", borderBottom: "1px solid #0d0d0d", display: "flex", alignItems: "center", padding: "0 14px", gap: "10px", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "5px" }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => <div key={i} style={{ width: "9px", height: "9px", borderRadius: "50%", background: c + "80" }} />)}
          </div>
          <div style={{ color: "#505050", fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {page === "index" ? "missing-semester/2026" : page === "lecture" ? `lec-${lecId}/${lec?.title}` : `lec-${lecId}/${ex?.title}`}
          </div>
          <div style={{ marginLeft: "auto" }}><Cursor color={accent} /></div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          {page === "index" && <IndexPage phases={phases} onSelect={id => { setLecId(id); setPage("lecture"); }} />}
          {page === "lecture" && lec && (
            <LecturePage lec={lec} phases={phases} setPhases={setPhases}
              onSelectEx={eid => { setExId(eid); setPage("exercise"); }}
              onBack={() => { setPage("index"); setLecId(null); }} />
          )}
          {page === "exercise" && lec && ex && (
            <ExerciseView lec={lec} ex={ex}
              phase={phases[ex.id] || PHASE.INTRO}
              setPhase={ph => { savePhase(ex.id, ph); if (ph === PHASE.DONE) handleExDone(); }} />
          )}
        </div>
      </div>

      {/* PROGRESS BAR (NEW SYSTEM - Bottom) */}
      {page === "exercise" && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, backgroundColor: "#010101", borderTop: "1px solid #0d0d0d" }}>
          <ProgressBar
            exercisesState={exercisesState}
            currentLecId={currentLecId}
            currentExId={currentExId}
            onNavigate={handleNavigateToExercise}
          />
        </div>
      )}
    </div>
  );
}
