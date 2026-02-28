---
layout: lecture
title: "패키징과 코드 배포"
description: >
  프로젝트 패키징, 환경 관리, 버전 관리, 라이브러리, 애플리케이션, 서비스 배포 방법을 배웁니다.
thumbnail: /static/assets/thumbnails/2026/lec6.png
date: 2026-01-20
ready: true
video:
  aspect: 56.25
  id: KBMiB-8P4Ns
---

코드가 의도대로 작동하는 것은 어렵습니다. 그 같은 코드가 자신의 컴퓨터와 다른 환경의 머신에서 실행되도록 하는 것은 더욱 어렵습니다.

코드를 배포한다는 것은 작성한 코드를 가져와서 다른 사람이 당신의 정확한 개발 환경 없이도 실행할 수 있는 형태로 변환하는 것을 의미합니다.
코드 배포는 다양한 형태를 띠며, 프로그래밍 언어, 시스템 라이브러리, 운영체제 등 여러 요인에 따라 달라집니다.
또한 무엇을 만드는지에 따라서도 달라집니다: 소프트웨어 라이브러리, 커맨드라인 도구, 웹 서비스는 각각 다른 요구사항과 배포 단계를 가집니다.
어떤 상황이든 모든 시나리오 사이에는 공통된 패턴이 있습니다: 배포물의 정의 --- 즉, _아티팩트(artifact)_ --- 와 그것이 환경에 대해 어떤 가정을 하는지를 정의해야 한다는 것입니다.

이 강의에서 다룰 내용:

- [의존성과 환경](#의존성과-환경)
- [아티팩트와 패키징](#아티팩트와-패키징)
- [릴리스와 버전 관리](#릴리스와-버전-관리)
- [재현성](#재현성)
- [가상 머신과 컨테이너](#가상-머신과-컨테이너)
- [설정](#설정)
- [서비스와 오케스트레이션](#서비스와-오케스트레이션)
- [배포](#배포)

Python 생태계의 구체적인 예시를 통해 이 개념들을 설명하겠습니다. 구체적인 예제는 이해에 도움이 되기 때문입니다. 다른 프로그래밍 언어 생태계를 위한 도구들은 다르지만, 개념들은 대체로 동일할 것입니다.

# 의존성과 환경

현대 소프트웨어 개발에서는 추상화 계층이 어디나 있습니다.
프로그램은 자연스럽게 논리를 다른 라이브러리나 서비스에 위탁합니다.
하지만 이것은 프로그램과 그것이 작동하기 위해 필요한 라이브러리 사이에 _의존성(dependency)_ 관계를 만듭니다.
예를 들어, Python에서 웹사이트의 내용을 가져오려면 보통 다음과 같이 합니다:

```python
import requests

response = requests.get("https://missing.csail.mit.edu")
```

하지만 `requests` 라이브러리는 Python 런타임과 함께 번들로 제공되지 않으므로, `requests`를 설치하지 않고 이 코드를 실행하려고 하면 Python은 오류를 발생시킵니다:

```console
$ python fetch.py
Traceback (most recent call last):
  File "fetch.py", line 1, in <module>
    import requests
ModuleNotFoundError: No module named 'requests'
```

이 라이브러리를 사용 가능하게 만들기 위해 먼저 `pip install requests`를 실행해야 합니다.
`pip`는 Python 프로그래밍 언어가 패키지 설치를 위해 제공하는 명령어 라인 도구입니다.
`pip install requests`를 실행하면 다음과 같은 일련의 작업이 생성됩니다:

1. Python Package Index([PyPI](https://pypi.org/))에서 requests를 검색합니다.
1. 우리가 실행 중인 플랫폼에 대해 적절한 아티팩트를 검색합니다.
1. 의존성을 해결합니다 --- `requests` 라이브러리 자체는 다른 패키지들에 따라 다르므로, 설치 프로그램은 모든 이행적 의존성의 호환되는 버전을 찾아 먼저 설치해야 합니다.
1. 아티팩트들을 다운로드한 다음 파일 시스템의 올바른 위치에 압축 해제하고 복사합니다.

```console
$ pip install requests
Collecting requests
  Downloading requests-2.32.3-py3-none-any.whl (64 kB)
Collecting charset-normalizer<4,>=2
  Downloading charset_normalizer-3.4.0-cp311-cp311-manylinux_x86_64.whl (142 kB)
Collecting idna<4,>=2.5
  Downloading idna-3.10-py3-none-any.whl (70 kB)
Collecting urllib3<3,>=1.21.1
  Downloading urllib3-2.2.3-py3-none-any.whl (126 kB)
Collecting certifi>=2017.4.17
  Downloading certifi-2024.8.30-py3-none-any.whl (167 kB)
Installing collected packages: urllib3, idna, charset-normalizer, certifi, requests
Successfully installed certifi-2024.8.30 charset-normalizer-3.4.0 idna-3.10 requests-2.32.3 urllib3-2.2.3
```

여기서 우리는 `requests`가 `certifi`나 `charset-normalizer`와 같은 자신의 의존성을 가지고 있고, 그들이 `requests`가 설치되기 전에 설치되어야 한다는 것을 볼 수 있습니다.
설치되면, Python 런타임은 그것을 import할 때 이 라이브러리를 찾을 수 있습니다.

```console
$ python -c 'import requests; print(requests.__path__)'
['/usr/local/lib/python3.11/dist-packages/requests']

$ pip list | grep requests
requests        2.32.3
```

프로그래밍 언어들은 라이브러리들을 설치하고 배포하기 위한 다양한 도구, 관례, 그리고 관행들을 가집니다.
Rust와 같은 어떤 언어들에서는, 도구 체인이 통합되어 있습니다 --- `cargo`는 빌드, 테스팅, 의존성 관리, 그리고 배포를 처리합니다.
Python과 같은 다른 언어들에서는, 통합이 명세 수준에서 일어납니다 --- 단일 도구보다는, 패키징이 어떻게 작동하는지 정의하는 표준화된 명세들이 있으며, 각 작업마다 여러 경쟁 도구들을 허용합니다(`pip` 대 [`uv`](https://docs.astral.sh/uv/), `setuptools` 대 [`hatch`](https://hatch.pypa.io/) 대 [`poetry`](https://python-poetry.org/)).
LaTeX과 같은 어떤 생태계들에서는, TeX Live나 MacTeX 같은 배포판들이 이미 설치된 수천 개의 패키지들과 함께 제공됩니다.

의존성들을 소개하는 것은 또한 의존성 충돌을 소개합니다.
충돌들은 프로그램들이 같은 의존성의 호환되지 않는 버전들을 필요로 할 때 일어납니다.
예를 들어, `tensorflow==2.3.0`이 `numpy>=1.16.0,<1.19.0`을 필요로 하고 `pandas==1.2.0`이 `numpy>=1.16.5`를 필요로 한다면, `numpy>=1.16.5,<1.19.0`을 만족하는 어떤 버전이든 유효할 것입니다.
하지만 프로젝트의 다른 패키지가 `numpy>=1.19`를 필요로 한다면, 모든 제약들을 만족하는 유효한 버전이 없는 충돌이 있습니다.

이 상황 --- 여러 패키지들이 공유 의존성의 상호 호환되지 않는 버전들을 필요로 하는 --- 은 보통 _의존성 지옥_으로 언급됩니다.
충돌을 처리하는 한 가지 방법은 각 프로그램의 의존성들을 자신의 _환경_으로 격리하는 것입니다.
Python에서는 다음을 실행하여 가상 환경을 만듭니다:

```console
$ which python
/usr/bin/python
$ pwd
/home/missingsemester
$ python -m venv venv
$ source venv/bin/activate
$ which python
/home/missingsemester/venv/bin/python
$ which pip
/home/missingsemester/venv/bin/pip
$ python -c 'import requests; print(requests.__path__)'
['/home/missingsemester/venv/lib/python3.11/site-packages/requests']

$ pip list
Package Version
------- -------
pip     24.0
```

환경을 생각해보면, 자신만의 설치된 패키지 세트를 가진 전체 독립 런타임 버전입니다.
이 가상 환경 또는 venv는 설치된 의존성을 전역 Python 설치에서 격리합니다.
각 프로젝트마다 필요한 의존성을 포함한 가상 환경을 가지는 것이 좋은 실천 방법입니다.

> 많은 현대 운영체제가 Python과 같은 프로그래밍 언어 런타임 설치와 함께 제공되지만, OS가 자신의 기능을 위해 이 설치를 사용할 수 있으므로 이를 수정하는 것은 현명하지 않습니다. 대신 별도의 환경을 사용하는 것이 좋습니다.

일부 언어에서는 설치 프로토콜이 도구가 아닌 명세로 정의됩니다.
Python에서는 [PEP 517](https://peps.python.org/pep-0517/)이 빌드 시스템 인터페이스를 정의하고 [PEP 621](https://peps.python.org/pep-0621/)은 프로젝트 메타데이터가 `pyproject.toml`에 어떻게 저장되는지 명시합니다.
이것은 개발자들이 `pip`을 개선하고 `uv`와 같은 더 최적화된 도구를 만들 수 있게 했습니다. `uv`를 설치하려면 `pip install uv`를 하면 됩니다.

`pip` 대신 `uv`를 사용하면 동일한 인터페이스를 따르지만 훨씬 빠릅니다:

```console
$ uv pip install requests
Resolved 5 packages in 12ms
Prepared 5 packages in 0.45ms
Installed 5 packages in 8ms
 + certifi==2024.8.30
 + charset-normalizer==3.4.0
 + idna==3.10
 + requests==2.32.3
 + urllib3==2.2.3
```

> 가능할 때마다 `pip` 대신 `uv pip`를 사용할 것을 강력히 권장합니다. 설치 시간을 극적으로 줄일 수 있기 때문입니다.

의존성 격리를 넘어, 환경들은 또한 당신이 프로그래밍 언어 런타임의 다양한 버전들을 가질 수 있도록 허용합니다.

```console
$ uv venv --python 3.12 venv312
Using CPython 3.12.7
Creating virtual environment at: venv312

$ source venv312/bin/activate && python --version
Python 3.12.7

$ uv venv --python 3.11 venv311
Using CPython 3.11.10
Creating virtual environment at: venv311

$ source venv311/bin/activate && python --version
Python 3.11.10
```

이것은 여러 Python 버전에 걸쳐 코드를 테스트해야 할 때나 프로젝트가 특정 버전을 필요로 할 때 도움이 됩니다.

> 어떤 프로그래밍 언어들에서, 각 프로젝트는 자신의 의존성을 위해 자동으로 자신의 환경을 얻으므로 당신이 수동으로 그것을 만들 필요가 없습니다. 하지만 원리는 같습니다. 대부분의 언어들은 또한 단일 시스템에서 언어의 여러 버전을 관리하기 위한 메커니즘과 개별 프로젝트들에 어떤 버전을 사용할지 명시하는 메커니즘을 가지고 있습니다.

# 아티팩트와 패키징

소프트웨어 개발에서 우리는 소스 코드와 아티팩트를 구분합니다. 개발자는 소스 코드를 작성하고 읽지만, 아티팩트는 그 소스 코드에서 생산되는 패키지된, 배포 가능한 출력물입니다 --- 설치하거나 배포할 준비가 되어 있습니다.
아티팩트는 실행하는 단순한 코드 파일만큼 간단할 수도 있고, 애플리케이션의 모든 필요한 비트를 포함한 전체 가상 머신만큼 복잡할 수도 있습니다.
현재 디렉토리에 Python 파일 `greet.py`가 있는 이 예를 생각해봅시다:

```console
$ cat greet.py
def greet(name):
    return f"Hello, {name}!"

$ python -c "from greet import greet; print(greet('World'))"
Hello, World!

$ cd /tmp
$ python -c "from greet import greet; print(greet('World'))"
ModuleNotFoundError: No module named 'greet'
```

다른 디렉토리로 이동하면 임포트가 실패합니다. Python은 특정 위치들(현재 디렉토리, 설치된 패키지, `PYTHONPATH`의 경로)에서만 모듈을 검색하기 때문입니다. 패키징은 코드를 알려진 위치에 설치함으로써 이를 해결합니다.

Python에서 라이브러리를 패키징하는 것은 `pip`이나 `uv`와 같은 패키지 설치 프로그램이 사용할 수 있는 아티팩트를 생산하는 것을 포함합니다.
Python 아티팩트는 _wheel(휠)_ 이라고 불리며, 패키지를 설치하는 데 필요한 모든 정보를 포함합니다: 코드 파일, 패키지에 대한 메타데이터(이름, 버전, 의존성), 파일을 환경의 어디에 배치할지에 대한 지시입니다.
아티팩트를 빌드하려면 프로젝트의 특성, 필요한 의존성, 패키지의 버전, 그리고 다른 정보를 세부적으로 설명하는 프로젝트 파일(보통 매니페스트라고도 함)을 작성해야 합니다. Python에서 우리는 이 목적으로 `pyproject.toml`을 사용합니다.

> `pyproject.toml`은 현대적이고 권장되는 방법입니다. `requirements.txt`나 `setup.py` 같은 이전 패키징 방법들이 여전히 지원되지만, 가능할 때마다 `pyproject.toml`을 선호해야 합니다.

다음은 커맨드라인 도구도 제공하는 라이브러리를 위한 최소 `pyproject.toml`입니다:

```toml
[project]
name = "greeting"
version = "0.1.0"
description = "A simple greeting library"
dependencies = ["typer>=0.9"]

[project.scripts]
greet = "greeting:main"

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"
```

`typer` 라이브러리는 최소한의 보일러플레이트로 커맨드라인 인터페이스를 만드는 인기 있는 Python 패키지입니다.

그리고 해당하는 `greeting.py`:

```python
import typer


def greet(name: str) -> str:
    return f"Hello, {name}!"


def main(name: str):
    print(greet(name))


if __name__ == "__main__":
    typer.run(main)
```

이 파일로, 우리는 이제 wheel을 빌드할 수 있습니다:

```console
$ uv build
Building source distribution...
Building wheel from source distribution...
Successfully built dist/greeting-0.1.0.tar.gz
Successfully built dist/greeting-0.1.0-py3-none-any.whl

$ ls dist/
greeting-0.1.0-py3-none-any.whl
greeting-0.1.0.tar.gz
```

`.whl` 파일은 wheel(특정 구조를 가진 zip 아카이브)이고, `.tar.gz`은 소스에서 빌드해야 하는 시스템을 위한 소스 배포판입니다.

wheel의 내용을 검사하여 무엇이 패키징되는지 볼 수 있습니다:

```console
$ unzip -l dist/greeting-0.1.0-py3-none-any.whl
Archive:  dist/greeting-0.1.0-py3-none-any.whl
  Length      Date    Time    Name
---------  ---------- -----   ----
      150  2024-01-15 10:30   greeting.py
      312  2024-01-15 10:30   greeting-0.1.0.dist-info/METADATA
       92  2024-01-15 10:30   greeting-0.1.0.dist-info/WHEEL
        9  2024-01-15 10:30   greeting-0.1.0.dist-info/top_level.txt
      435  2024-01-15 10:30   greeting-0.1.0.dist-info/RECORD
---------                     -------
      998                     5 files
```

이제 이 wheel을 다른 사람에게 주면, 그들은 다음을 실행하여 설치할 수 있습니다:

```console
$ uv pip install ./greeting-0.1.0-py3-none-any.whl
$ greet Alice
Hello, Alice!
```

이것은 우리가 앞서 빌드한 라이브러리를 그들의 환경에 설치하는데, `greet` CLI 도구를 포함합니다.

이 접근 방식에는 제한이 있습니다. 특히 라이브러리가 CUDA 같은 플랫폼별 라이브러리에 의존한다면, 우리의 아티팩트는 그런 특정 라이브러리가 설치된 시스템에서만 작동하고, 다른 플랫폼(Linux, macOS, Windows) 및 아키텍처(x86, ARM)에 대해 별도의 wheel을 빌드해야 할 수 있습니다.


소프트웨어를 설치할 때 소스에서 설치하는 것과 미리 빌드된 바이너리를 설치하는 것 사이에 중요한 구분이 있습니다. 소스에서 설치하는 것은 원본 코드를 다운로드하고 머신에서 컴파일하는 것을 의미합니다 --- 컴파일러와 빌드 도구가 설치되어 있어야 하고, 큰 프로젝트의 경우 상당한 시간이 걸릴 수 있습니다.

미리 빌드된 바이너리를 설치하는 것은 누군가 다른 사람이 이미 컴파일한 아티팩트를 다운로드하는 것을 의미합니다 --- 더 빠르고 간단하지만, 바이너리가 플랫폼과 아키텍처와 일치해야 합니다.
예를 들어, [ripgrep의 릴리스 페이지](https://github.com/BurntSushi/ripgrep/releases)에는 Linux(x86_64, ARM), macOS(Intel, Apple Silicon), Windows용 미리 빌드된 바이너리가 있습니다.


# 릴리스와 버전 관리

코드는 지속적인 프로세스로 빌드되지만 이산적인 기반으로 릴리스됩니다.
소프트웨어 개발에서 개발 환경과 프로덕션 환경 사이에는 명확한 구분이 있습니다.
코드는 프로덕션으로 _배포되기_ 전에 개발 환경에서 작동함이 증명되어야 합니다.
릴리스 프로세스는 테스트, 의존성 관리, 버전 관리, 설정, 배포, 배포 등 많은 단계를 포함합니다.


소프트웨어 라이브러리는 정적이 아니며 시간에 따라 진화하며 수정 사항과 새로운 기능을 얻습니다.
우리는 이 진화를 시간 경과에 따른 라이브러리의 상태에 해당하는 이산 버전 식별자로 추적합니다.
라이브러리의 동작 변화는 치명적이지 않은 기능을 수정하는 패치에서부터 그것의 기능을 확장하는 새로운 기능까지, 역호환성을 깨뜨리는 변화까지 다양할 수 있습니다.
변경 로그는 버전이 도입하는 변화를 문서화합니다 --- 이것은 소프트웨어 개발자들이 새로운 릴리스와 관련된 변화를 전달하기 위해 사용하는 문서입니다.

하지만 각각의 의존성에서의 지속적인 변화를 추적하는 것은 비현실적입니다. 전이 의존성 --- 즉, 우리의 의존성의 의존성을 고려할 때 더욱 그렇습니다.

> 프로젝트의 전체 의존성 트리를 `uv tree`와 함께 시각화할 수 있으며, 이것은 모든 패키지들과 그들의 이행적 의존성들을 트리 형식으로 보여줍니다.

이 문제를 단순화하기 위해 소프트웨어를 버전 관리하는 방법에 대한 규칙이 있으며, 가장 널리 사용되는 것 중 하나는 [의미 있는 버전 관리](https://semver.org/)(Semantic Versioning) 또는 SemVer입니다.
의미 있는 버전 관리에서 버전은 MAJOR.MINOR.PATCH 형식의 식별자를 가지며 각각의 값은 정수 값을 취합니다. 짧은 버전은 업그레이드하면 다음과 같습니다:

- PATCH (예: 1.2.3 → 1.2.4)는 버그 수정만 포함해야 하고 완전히 역호환 가능해야 합니다.
- MINOR (예: 1.2.3 → 1.3.0)은 역호환 방식으로 새로운 기능을 추가합니다.
- MAJOR (예: 1.2.3 → 2.0.0)는 코드 수정이 필요할 수 있는 호환성 깨지는 변화를 나타냅니다.

> 이것은 단순화된 것이며, 예를 들어 0.1.3에서 0.2.0으로 이동하면 호환성이 깨질 수 있는 이유나 1.0.0-rc.1의 의미가 무엇인지 이해하기 위해 전체 SemVer 명세를 읽을 것을 권장합니다.
Python 패키징은 의미 있는 버전 관리를 기본 지원하므로, 의존성의 버전을 명시할 때 다양한 명세를 사용할 수 있습니다:

`pyproject.toml`에서 의존성의 호환 버전 범위를 제약하는 여러 방법이 있습니다:

```toml
[project]
dependencies = [
    "requests==2.32.3",  # 정확한 버전 - 이 특정 버전만
    "click>=8.0",        # 최소 버전 - 8.0 이상
    "numpy>=1.24,<2.0",  # 범위 - 최소 1.24이지만 2.0 미만
    "pandas~=2.1.0",     # 호환 릴리스 - >=2.1.0이고 <2.2.0
]
```

버전 명세는 많은 패키지 관리자(npm, cargo 등)에 걸쳐 존재하며 정확한 의미는 다양합니다. `~=` 연산자는 Python의 "호환 릴리스" 연산자입니다 --- `~=2.1.0`은 "2.1.0과 호환되는 모든 버전"을 의미하며, 이것은 `>=2.1.0` 및 `<2.2.0`으로 변환됩니다. 이것은 대략 npm과 cargo의 캐럿(`^`) 연산자와 동등하며, SemVer의 호환성 개념을 따릅니다.

모든 소프트웨어가 의미 있는 버전 관리를 사용하는 것은 아닙니다. 일반적인 대안은 달력 버전 관리(Calendar Versioning, CalVer)입니다. 이것은 의미론적 의미보다는 릴리스 날짜에 기반한 버전입니다. 예를 들어, Ubuntu는 `24.04`(2024년 4월) 및 `24.10`(2024년 10월)과 같은 버전을 사용합니다. CalVer는 릴리스가 얼마나 오래되었는지 쉽게 알 수 있게 하지만, 호환성에 대해서는 아무것도 전달하지 않습니다. 마지막으로, 의미 있는 버전 관리가 완벽한 것은 아니며, 때때로 유지 관리자들은 실수로 마이너 또는 패치 릴리스에서 호환성 깨지는 변화를 도입합니다.


# 재현성

현대 소프트웨어 개발에서 작성한 코드는 상당한 수의 추상화 계층 위에 있습니다.
여기에는 프로그래밍 언어 런타임, 써드파티 라이브러리, 운영체제, 심지어 하드웨어 자체 같은 것들이 포함됩니다.
이 계층들 중 어느 하나라도의 차이는 코드의 동작을 변경하거나 의도대로 작동하는 것을 방지할 수 있습니다.
더욱이, 기본 하드웨어의 차이도 소프트웨어 배포 능력에 영향을 미칩니다.

라이브러리를 핀(pin)한다는 것은 범위보다는 정확한 버전을 명시하는 것을 의미합니다. 예: `requests==2.32.3` 대신 `requests>=2.0`.

패키지 관리자의 작업의 일부는 의존성 --- 및 전이 의존성 --- 에서 제공한 모든 제약을 고려하고, 모든 제약을 만족할 유효한 버전 목록을 생산하는 것입니다.
구체적인 버전 목록은 재현성 목적으로 파일에 저장할 수 있습니다. 이 파일들을 _lock 파일(lock files)_ 이라고 부릅니다.

```console
$ uv lock
Resolved 12 packages in 45ms

$ cat uv.lock | head -20
version = 1
requires-python = ">=3.11"

[[package]]
name = "certifi"
version = "2024.8.30"
source = { registry = "https://pypi.org/simple" }
sdist = { url = "https://files.pythonhosted.org/...", hash = "sha256:..." }
wheels = [
    { url = "https://files.pythonhosted.org/...", hash = "sha256:..." },
]
...
```

의존성 버전 관리와 재현성을 다룰 때 중요한 구분은 라이브러리와 애플리케이션/서비스 사이의 차이입니다.
라이브러리는 다른 코드에 의해 임포트되어 사용될 목적이므로 너무 엄격한 버전 제약을 명시하면 사용자의 다른 의존성과 충돌할 수 있습니다.
반대로 애플리케이션이나 서비스는 소프트웨어의 최종 소비자이며 보통 프로그래밍 인터페이스가 아닌 사용자 인터페이스나 API를 통해 그들의 기능을 노출합니다.
라이브러리의 경우, 더 넓은 패키지 생태계와의 호환성을 최대화하려면 버전 범위를 명시하는 것이 좋은 실천 방법입니다. 애플리케이션의 경우, 정확한 버전을 핀하면 재현성이 보장됩니다 --- 애플리케이션을 실행하는 모든 사람은 동일한 의존성을 사용합니다.


최대 재현성이 필요한 프로젝트의 경우, [Nix](https://nixos.org/) 및 [Bazel](https://bazel.build/)과 같은 도구는 _hermetic(밀폐형)_ 빌드를 제공합니다 --- 컴파일러, 시스템 라이브러리, 심지어 빌드 환경 자체를 포함한 모든 입력이 핀되고 내용으로 주소 지정됩니다. 이것은 빌드가 언제 또는 어디서 실행되든 비트 단위로 동일한 출력을 보장합니다.

> NixOS를 사용하여 전체 컴퓨터 설치를 관리할 수도 있으므로 컴퓨터 설정의 새로운 복사본을 쉽게 스핀업할 수 있고, 버전 제어된 설정 파일을 통해 완전한 구성을 관리할 수 있습니다.

소프트웨어 개발의 끝이 없는 긴장은 새로운 소프트웨어 버전이 의도적으로든 의도하지 않게든 손상을 도입하는 반면, 반대로 이전 소프트웨어 버전은 시간에 따라 보안 취약점에 의해 손상된다는 것입니다.
우리는 새로운 소프트웨어 버전에 대해 애플리케이션을 테스트하는 지속적 통합 파이프라인([코드 품질과 CI](/2026/code-quality/) 강의에서 더 보겠습니다)을 사용하고, [Dependabot](https://github.com/dependabot)과 같은 의존성의 새로운 버전이 릴리스될 때 감지하는 자동화를 준비하여 이를 해결할 수 있습니다.

CI 테스트가 제자리에 있어도, 소프트웨어 버전을 업그레이드할 때 문제가 여전히 발생하는데, 종종 개발 환경과 프로덕션 환경 사이의 불가피한 불일치 때문입니다.
그런 상황에서 가장 좋은 조치는 _롤백(rollback)_ 계획을 가지는 것입니다. 이곳에서 버전 업그레이드는 되돌려지고 알려진 좋은 버전이 다시 배포됩니다.

# 가상 머신과 컨테이너

더 복잡한 의존성에 의존하기 시작하면서, 코드의 의존성이 패키지 관리자가 처리할 수 있는 경계를 넘어설 가능성이 높습니다.
일반적인 이유 중 하나는 특정 시스템 라이브러리나 하드웨어 드라이버와 인터페이스해야 하기 때문입니다.
예를 들어, 과학 컴퓨팅과 AI에서 프로그램은 종종 GPU 하드웨어를 활용하기 위해 전문 라이브러리와 드라이버가 필요합니다.
많은 시스템 수준 의존성(GPU 드라이버, 특정 컴파일러 버전, OpenSSL 같은 공유 라이브러리)은 여전히 시스템 차원의 설치가 필요합니다.

전통적으로 이 더 넓은 의존성 문제는 가상 머신(Virtual Machines, VMs)으로 해결되었습니다.
VM은 전체 컴퓨터를 추상화하고 자신의 전용 운영체제를 가진 완전히 격리된 환경을 제공합니다.
더 현대적인 접근법은 컨테이너입니다. 컨테이너는 애플리케이션을 그 의존성, 라이브러리, 파일시스템과 함께 패키징하지만, 전체 컴퓨터를 가상화하는 것 대신 호스트의 운영체제 커널을 공유합니다.
컨테이너는 커널을 공유하기 때문에 VM보다 가볍고, 시작이 더 빠르고 더 효율적으로 실행됩니다.

가장 인기 있는 컨테이너 플랫폼은 [Docker](https://www.docker.com/)입니다. Docker는 컨테이너를 빌드, 배포, 실행하는 표준화된 방법을 도입했습니다. 내부적으로 Docker는 containerd를 컨테이너 런타임으로 사용합니다 --- Kubernetes 같은 다른 도구들도 사용하는 산업 표준입니다.

컨테이너를 실행하는 것은 간단합니다. 예를 들어, 컨테이너 안에서 Python 인터프리터를 실행하려면 `docker run`을 사용합니다 (`-it` 플래그는 컨테이너를 터미널이 있는 대화형으로 만듭니다. 종료하면 컨테이너가 중단됩니다.).

```console
$ docker run -it python:3.12 python
Python 3.12.7 (main, Nov  5 2024, 02:53:25) [GCC 12.2.0] on linux
>>> print("Hello from inside a container!")
Hello from inside a container!
```

실제로 프로그램은 전체 파일시스템에 의존할 수 있습니다.
이를 극복하기 위해, 애플리케이션의 전체 파일시스템을 배포하는 컨테이너 이미지를 사용할 수 있습니다.
컨테이너 이미지는 프로그래밍 방식으로 생성됩니다. Docker에서 우리는 Dockerfile 문법을 사용하여 이미지의 의존성, 시스템 라이브러리, 설정을 명시합니다:

```dockerfile
FROM python:3.12
RUN apt-get update
RUN apt-get install -y gcc
RUN apt-get install -y libpq-dev
RUN pip install numpy
RUN pip install pandas
COPY . /app
WORKDIR /app
RUN pip install .
```

중요한 구분: Docker **이미지**는 패키징된 아티팩트(템플릿처럼)이고, **컨테이너**는 그 이미지의 실행 인스턴스입니다. 같은 이미지에서 여러 컨테이너를 실행할 수 있습니다. 이미지는 레이어로 빌드되며, Dockerfile의 각 지시(`FROM`, `RUN`, `COPY` 등)는 새로운 레이어를 만듭니다. Docker는 이 레이어들을 캐시하므로, Dockerfile의 한 줄을 변경하면 그 레이어와 다음 레이어들만 다시 빌드하면 됩니다.

앞의 Dockerfile에는 몇 가지 문제가 있습니다: slim 변형 대신 전체 Python 이미지를 사용하고, 불필요한 레이어를 만드는 별도의 `RUN` 명령을 실행하고, 버전이 핀되지 않았고, 패키지 관리자 캐시를 정리하지 않아 불필요한 파일을 배포합니다. 다른 빈번한 실수는 컨테이너를 root로 안전하지 않게 실행하고 우발적으로 레이어에 비밀을 포함하는 것입니다.

다음은 개선된 버전입니다:

```dockerfile
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*
COPY pyproject.toml uv.lock ./
RUN uv pip install --system -r uv.lock
COPY . /app
```

이전 예에서 우리는 소스에서 `uv`를 설치하는 대신, `ghcr.io/astral-sh/uv:latest` 이미지에서 미리 빌드된 바이너리를 복사하는 것을 봅니다. 이것을 _빌더 패턴(builder pattern)_ 이라고 합니다. 이 패턴을 사용하면 코드를 컴파일하는 데 필요한 모든 도구를 배포할 필요가 없고, 애플리케이션을 실행하는 데 필요한 최종 바이너리(`uv`의 경우)만 배포하면 됩니다.

Docker에는 알아야 할 중요한 제한 사항이 있습니다. 첫째, 컨테이너 이미지는 종종 플랫폼별입니다 --- `linux/amd64`용으로 빌드된 이미지는 에뮬레이션 없이 `linux/arm64`(Apple Silicon Macs)에서 기본 실행되지 않습니다. 에뮬레이션은 느립니다. 둘째, Docker 컨테이너는 Linux 커널을 요구하므로, macOS와 Windows에서 Docker는 실제로 내부적으로 경량 Linux VM을 실행하여 오버헤드를 추가합니다. 셋째, Docker의 격리는 VM보다 약합니다 --- 컨테이너는 호스트 커널을 공유하는데, 이는 멀티 테넌트 환경에서 보안 문제입니다.

> 요즘에는 더 많은 프로젝트들이 [nix flakes](https://serokell.io/blog/practical-nix-flakes)를 통해 심지어 "시스템 차원의" 라이브러리 및 애플리케이션을 프로젝트별로 관리하기 위해 nix를 활용하고 있습니다.

# 설정

소프트웨어는 본질적으로 설정 가능합니다. [커맨드라인 환경](/2026/command-line-environment/) 강의에서 우리는 플래그, 환경 변수, 심지어 설정 파일(a.k.a. dotfiles)을 통해 옵션을 받는 프로그램들을 봤습니다. 이것은 더 복잡한 애플리케이션의 경우에도 마찬가지입니다. 그리고 대규모로 설정을 관리하는 확립된 패턴이 있습니다.
소프트웨어 설정은 코드에 포함되지 않아야 하고, 런타임에 제공되어야 합니다.
일반적인 것들 몇 가지는 환경 변수와 설정 파일입니다.

다음은 환경 변수로 설정된 애플리케이션의 예입니다:

```python
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///local.db")
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
API_KEY = os.environ["API_KEY"]  # 필수 - 설정되지 않으면 발생할 것
```

애플리케이션은 또한 설정 파일을 통해 설정될 수도 있습니다(예: 설정을 `yaml.load`를 통해 로드하는 Python 프로그램), `config.yaml`:

```yaml
database:
  url: "postgresql://localhost/myapp"
  pool_size: 5
server:
  host: "0.0.0.0"
  port: 8080
  debug: false
```

설정에 대해 생각할 때 좋은 경험칙은 같은 코드베이스가 설정 변경만으로 다른 환경(개발, 스테이징, 프로덕션)에 배포되어야 하며, 코드 변경은 안 된다는 것입니다.

많은 설정 옵션 중에는 API 키와 같은 민감한 데이터가 종종 있습니다.
비밀은 우발적으로 노출을 피하기 위해 주의해서 처리되어야 하며, 버전 제어에 포함되면 안 됩니다.


# 서비스와 오케스트레이션

현대 애플리케이션은 거의 격리된 상태로 존재하지 않습니다. 일반적인 웹 애플리케이션은 지속적 스토리지를 위한 데이터베이스, 성능을 위한 캐시, 백그라운드 작업을 위한 메시지 큐, 그리고 다양한 다른 지원 서비스가 필요할 수 있습니다. 모든 것을 단일 거대한 애플리케이션으로 번들하지 않는 대신, 현대 아키텍처는 종종 기능을 독립적으로 개발, 배포, 확장할 수 있는 별도의 서비스로 분해합니다.

예를 들어, 애플리케이션이 캐시를 사용하면 도움이 될 것 같다면, 우리는 자신의 것을 만드는 대신 [Redis](https://redis.io/)나 [Memcached](https://memcached.org/)와 같은 기존의 검증된 솔루션을 활용할 수 있습니다.
우리는 컨테이너의 일부로 빌드하여 Redis를 애플리케이션 의존성에 포함하려 할 수도 있지만, 그것은 Redis와 애플리케이션 사이의 모든 의존성을 조화시켜야 한다는 뜻인데, 이것은 어려울 수도 있고 심지어 불가능할 수도 있습니다.
대신 우리가 할 수 있는 것은 각 애플리케이션을 자신의 컨테이너로 별도로 배포하는 것입니다.
이것을 보통 마이크로서비스 아키텍처라고 부르는데, 각 컴포넌트가 독립적인 서비스로 실행되어 보통 HTTP API를 통해 네트워크를 통해 통신합니다.

[Docker Compose](https://docs.docker.com/compose/)는 멀티 컨테이너 애플리케이션을 정의하고 실행하는 도구입니다. 컨테이너를 개별적으로 관리하는 대신, 모든 서비스를 하나의 YAML 파일에 선언하고 함께 오케스트레이션합니다. 이제 전체 애플리케이션이 하나 이상의 컨테이너를 포함합니다:

```yaml
# docker-compose.yml
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
```

`docker compose up`을 실행하면, 두 서비스가 함께 시작되고, 웹 애플리케이션은 호스트명 `cache`를 사용하여 Redis에 연결할 수 있습니다(Docker의 내부 DNS는 서비스 이름을 자동으로 해결합니다).
Docker Compose는 우리가 하나 이상의 서비스를 어떻게 배포하고 싶은지 선언하게 하고, 함께 시작하고, 그 사이에 네트워킹을 설정하고, 데이터 지속성을 위한 공유 볼륨을 관리하는 것의 오케스트레이션을 처리합니다.

프로덕션 배포의 경우, 종종 docker compose 서비스가 부팅할 때 자동으로 시작되고 장애에 대해 다시 시작되기를 원합니다. 일반적인 접근법은 systemd를 사용하여 docker compose 배포를 관리하는 것입니다:

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target
```

이 systemd 유닛 파일은 애플리케이션이 시스템이 부팅할 때(Docker가 준비된 후에) 시작되도록 보장하고, `systemctl start myapp`, `systemctl stop myapp`, `systemctl status myapp` 같은 표준 제어를 제공합니다.

배포 요구사항이 더 복잡해지면서 --- 여러 머신에 걸친 확장이 필요하고, 서비스가 충돌할 때 장애 허용 능력이 필요하고, 높은 가용성 보장이 필요하면 --- 조직들은 수천 개의 컨테이너를 기계들의 클러스터 전체에서 관리할 수 있는 Kubernetes(k8s)와 같은 정교한 컨테이너 오케스트레이션 플랫폼으로 전환합니다. 그렇긴 하지만, Kubernetes는 가파른 학습 곡선과 상당한 운영 오버헤드를 가지고 있으므로, 더 작은 프로젝트의 경우 종종 과하다는 것입니다.

이 멀티 컨테이너 설정이 어느 정도 가능한 이유는 현대 서비스들이 표준화된 API, HTTP REST API를 통해 서로 통신하기 때문입니다. 예를 들어, 프로그램이 OpenAI나 Anthropic 같은 LLM 제공자와 상호작용할 때, 내부적으로 그들의 서버에 HTTP 요청을 보내고 응답을 파싱하고 있습니다:

```console
$ curl https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "content-type: application/json" \
    -H "anthropic-version: 2023-06-01" \
    -d '{"model": "claude-sonnet-4-20250514", "max_tokens": 256,
         "messages": [{"role": "user", "content": "Explain containers vs VMs in one sentence."}]}'
```

# 배포

코드가 작동함을 보인 후, 다른 사람들이 다운로드하고 설치할 수 있도록 배포하는 데 관심이 있을 수 있습니다.
배포는 다양한 형태를 띠며 작동하는 프로그래밍 언어와 환경에 본질적으로 연결되어 있습니다.

배포의 가장 간단한 형태는 사람들이 다운로드하고 로컬로 설치할 수 있도록 아티팩트를 업로드하는 것입니다.
이것은 여전히 일반적이며 [Ubuntu의 패키지 아카이브](http://archive.ubuntu.com/ubuntu/pool/main/)와 같은 곳에서 찾을 수 있습니다. 이것은 본질적으로 `.deb` 파일들의 HTTP 디렉토리 목록입니다.

요즘에는 GitHub이 소스 코드와 아티팩트 배포의 사실상의 플랫폼이 되었습니다.
소스 코드는 종종 공개적으로 사용 가능하지만, GitHub 릴리스는 유지 관리자들이 미리 빌드된 바이너리 및 기타 아티팩트를 태그된 버전에 첨부할 수 있게 합니다.


패키지 관리자는 때때로 GitHub에서 직접 설치를 지원합니다. 소스에서 또는 미리 빌드된 wheel에서:

```console
# 소스에서 설치 (복제하고 빌드함)
$ pip install git+https://github.com/psf/requests.git

# 특정 태그/브랜치에서 설치
$ pip install git+https://github.com/psf/requests.git@v2.32.3

# GitHub 릴리스에서 wheel을 직접 설치
$ pip install https://github.com/user/repo/releases/download/v1.0/package-1.0-py3-none-any.whl
```

사실, Go와 같은 일부 언어는 분산 배포 모델을 사용합니다 --- 중앙 패키지 저장소 대신, Go 모듈들은 소스 코드 저장소에서 직접 배포됩니다.
`github.com/gorilla/mux`과 같은 모듈 경로는 코드가 있는 곳을 나타내고, `go get`은 그곳에서 직접 가져옵니다. 그런데 `pip`, `cargo`, `brew`와 같은 대부분의 패키지 관리자는 배포와 설치의 용이성을 위해 미리 패키징된 프로젝트의 중앙 색인을 가지고 있습니다. 만약 우리가 실행한다면

```console
$ uv pip install requests --verbose --no-cache 2>&1 | grep -F '.whl'
DEBUG Selecting: requests==2.32.5 [compatible] (requests-2.32.5-py3-none-any.whl)
DEBUG No cache entry for: https://files.pythonhosted.org/packages/1e/db/4254e3eabe8020b458f1a747140d32277ec7a271daf1d235b70dc0b4e6e3/requests-2.32.5-py3-none-any.whl.metadata
DEBUG No cache entry for: https://files.pythonhosted.org/packages/1e/db/4254e3eabe8020b458f1a747140d32277ec7a271daf1d235b70dc0b4e6e3/requests-2.32.5-py3-none-any.whl
```

우리는 `requests` wheel을 가져오는 곳을 볼 수 있습니다. 파일 이름의 `py3-none-any`를 주목하세요 --- 이것은 wheel이 모든 Python 3 버전, 모든 OS, 모든 아키텍처에서 작동함을 의미합니다. 컴파일된 코드를 가진 패키지의 경우, wheel은 플랫폼별입니다:

```console
$ uv pip install numpy --verbose --no-cache 2>&1 | grep -F '.whl'
DEBUG Selecting: numpy==2.2.1 [compatible] (numpy-2.2.1-cp312-cp312-macosx_14_0_arm64.whl)
```

여기서 `cp312-cp312-macosx_14_0_arm64`는 이 wheel이 macOS 14+에서 ARM64(Apple Silicon)를 위한 CPython 3.12용임을 나타냅니다. 다른 플랫폼에 있으면, `pip`은 다른 wheel을 다운로드하거나 소스에서 빌드합니다.

반대로, 우리가 만든 패키지를 사람들이 찾을 수 있도록 하려면, 이런 저장소 중 하나에 배포해야 합니다.
Python에서 주요 저장소는 [Python 패키지 저장소(PyPI)](https://pypi.org)입니다.
설치처럼, 패키지를 배포하는 여러 방법이 있습니다. `uv publish` 명령은 PyPI에 패키지를 업로드하기 위한 현대적 인터페이스를 제공합니다:

```console
$ uv publish --publish-url https://test.pypi.org/legacy/
Publishing greeting-0.1.0.tar.gz
Publishing greeting-0.1.0-py3-none-any.whl
```

여기서 우리는 [TestPyPI](https://test.pypi.org)를 사용하고 있습니다 --- 실제 PyPI를 오염시키지 않고 배포 워크플로우를 테스트하기 위한 별도의 패키지 저장소입니다. 업로드되면, TestPyPI에서 설치할 수 있습니다:

```console
$ uv pip install --index-url https://test.pypi.org/simple/ greeting
```

소프트웨어를 배포할 때 고려해야 할 핵심 사항은 신뢰입니다. 사용자들이 다운로드한 패키지가 실제로 당신에게서 온 것이고 변조되지 않았는지 어떻게 확인할까요? 패키지 저장소는 체크섬을 사용하여 무결성을 확인하고, 일부 생태계는 저작권의 암호학적 증명을 제공하기 위해 패키지 서명을 지원합니다.

다른 언어들은 자신의 패키지 저장소를 가지고 있습니다: Rust의 [crates.io](https://crates.io), JavaScript의 [npm](https://www.npmjs.com), Ruby의 [RubyGems](https://rubygems.org), 컨테이너 이미지의 [Docker Hub](https://hub.docker.com). 한편, 개인 또는 내부 패키지의 경우, 조직들은 종종 자신의 패키지 저장소(예: 개인 PyPI 서버 또는 개인 Docker 저장소)를 배포하거나 클라우드 제공자의 관리 솔루션을 사용합니다.

웹 서비스를 인터넷에 배포하려면 추가적 인프라가 필요합니다: 도메인 이름 등록, 도메인을 서버로 가리키도록 DNS 구성, 그리고 종종 HTTPS를 처리하고 트래픽을 라우팅하는 nginx와 같은 역방향 프록시가 필요합니다. 문서 또는 정적 사이트와 같은 더 간단한 사용 사례의 경우, [GitHub Pages](https://pages.github.com/)는 저장소에서 직접 무료 호스팅을 제공합니다.

<!--
## Documentation

So far we have emphasized the deliverable _artifact_ as the main output of packaging and shipping code.
In addition to the artifact, we need to document for users the code's functionality, installation instructions, and usage examples.

Tools like [Sphinx](https://www.sphinx-doc.org/) (Python) and [MkDocs](https://www.mkdocs.org/) can automatically generate browsable documentation from docstrings and markdown files, often hosted on services like [Read the Docs](https://readthedocs.org/).
For HTTP-based APIs, the [OpenAPI specification](https://www.openapis.org/) (formerly Swagger) provides a standard format for describing API endpoints, which tools can use to generate interactive documentation and client libraries automatically. -->


# 연습 문제

1. `printenv`로 환경을 파일에 저장하고, venv를 생성하고, 활성화한 다음, `printenv`를 다른 파일에 저장하고 `diff before.txt after.txt`를 하세요. 환경에서 무엇이 바뀌었나요? 왜 쉘이 venv를 선호하나요? (`$PATH` 변경 전후를 보세요.) `which deactivate`를 실행하고 deactivate bash 함수가 무엇을 하는지 생각해보세요.
1. `pyproject.toml`을 사용하여 Python 패키지를 생성하고 가상 환경에 설치하세요. lock 파일을 생성하고 검사하세요.
1. Docker를 설치하고 docker compose를 사용하여 Missing Semester 클래스 웹사이트를 로컬에서 빌드하세요.
1. 간단한 Python 애플리케이션을 위한 Dockerfile을 작성하세요. 그 다음 애플리케이션과 Redis 캐시를 함께 실행하는 `docker-compose.yml`을 작성하세요.
1. Python 패키지를 TestPyPI에 배포하세요(실제 PyPI에 배포하지 마세요. 공유할 가치가 있는 것이 아니라면!). 그 다음 해당 패키지를 사용하여 Docker 이미지를 빌드하고 `ghcr.io`에 푸시하세요.
1. [GitHub Pages](https://docs.github.com/en/pages/quickstart)를 사용하여 웹사이트를 만드세요. 추가(비필수) 크레딧: 사용자 정의 도메인으로 구성하세요.
