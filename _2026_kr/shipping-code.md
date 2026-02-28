---
layout: lecture
title: "패키징과 코드 배포"
description: >
  프로젝트 패키징, 환경, 버저닝, 그리고 라이브러리, 애플리케이션, 그리고 서비스 배포에 대해 배웁니다.
thumbnail: /static/assets/thumbnails/2026/lec6.png
date: 2026-01-20
ready: true
video:
  aspect: 56.25
  id: KBMiB-8P4Ns
---

코드가 의도대로 작동하게 하기는 어렵습니다; 같은 코드가 당신 자신의 머신과 다른 머신에서 실행되게 하는 것은 종종 더 어렵습니다.

코드를 배포한다는 것은 작성한 코드를 가져와서 다른 사람이 당신의 컴퓨터의 정확한 설정 없이도 실행할 수 있는 사용 가능한 형태로 변환하는 것을 의미합니다.
코드를 배포하는 것은 많은 형태를 취하며 프로그래밍 언어, 시스템 라이브러리, 그리고 운영 체제의 선택들을 포함한 많은 다른 요소들에 따라 달라집니다.
또한 무엇을 구축하고 있는지에 따라 달라집니다: 소프트웨어 라이브러리, 명령어 라인 도구, 그리고 웹 서비스는 모두 다른 요구사항과 배포 단계를 가집니다.
어쨌든, 모든 이러한 시나리오들 사이에 공통 패턴이 있습니다: 우리는 배포 가능한 것이 무엇인지 정의할 필요가 있습니다 --- 일명 _아티팩트_ --- 그리고 그것이 그 주변의 환경에 대해 어떤 가정을 하는지.

이 강의에서 다루는 내용은 다음과 같습니다:

- [의존성과 환경](#의존성과-환경)
- [아티팩트와 패키징](#아티팩트와-패키징)
- [릴리스와 버저닝](#릴리스와-버저닝)
- [재현성](#재현성)
- [VM과 컨테이너](#vm과-컨테이너)
- [구성](#구성)
- [서비스와 오케스트레이션](#서비스와-오케스트레이션)
- [배포](#배포)

우리는 Python 생태계의 예시들을 통해 이러한 개념들을 설명할 것입니다. 구체적인 예들은 이해하는 데 도움이 되기 때문입니다. 도구들이 다른 프로그래밍 언어 생태계에 대해서는 다르지만, 개념들은 대부분 동일할 것입니다.

# 의존성과 환경

현대 소프트웨어 개발에서, 추상화의 계층들은 유재합니다.
프로그램들은 자연스럽게 다른 라이브러리나 서비스로 로직을 오프로드합니다.
하지만, 이것은 당신의 프로그램과 그것이 기능하기 위해 필요로 하는 라이브러리들 사이의 _의존성_ 관계를 소개합니다.
예를 들어, Python에서 웹사이트의 내용을 가져오기 위해 우리는 종종 다음을 수행합니다:

```python
import requests

response = requests.get("https://missing.csail.mit.edu")
```

하지만 `requests` 라이브러리는 Python 런타임과 함께 번들되어 오지 않으므로, `requests`를 설치한 후 이 코드를 실행하려고 하면 Python은 오류를 발생시킵니다:

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

환경을 자신의 설치된 패키지 집합을 가진 언어 런타임의 전체 독립 버전으로 생각할 수 있습니다.
이 가상 환경 또는 venv는 설치된 의존성들을 전역 Python 설치로부터 격리합니다.
각 프로젝트에 대해 자신이 필요로 하는 의존성들을 포함하는 가상 환경을 가지는 것이 좋은 관행입니다.

> 많은 최신 운영 체제들이 Python과 같은 프로그래밍 언어 런타임들의 설치와 함께 제공되지만, OS가 자신의 기능을 위해 이 설치들을 의존할 수도 있기 때문에 이 설치들을 수정하는 것은 현명하지 않습니다. 대신 분리된 환경들을 사용하는 것을 선호하세요.

어떤 언어들에서, 설치 프로토콜은 도구로 정의되지 않고 명세로 정의됩니다.
Python에서 [PEP 517](https://peps.python.org/pep-0517/)은 빌드 시스템 인터페이스를 정의하고 [PEP 621](https://peps.python.org/pep-0621/)은 프로젝트 메타데이터가 `pyproject.toml`에 어떻게 저장되는지를 명시합니다.
이것은 개발자들이 `pip`를 개선하고 `uv`와 같은 최적화된 도구들을 생산할 수 있게 했습니다. `uv`를 설치하려면 단지 `pip install uv`를 수행하면 됩니다.

`pip` 대신 `uv`를 사용하는 것은 같은 인터페이스를 따르지만 상당히 더 빠릅니다:

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

> 우리는 가능할 때마다 `uv pip` 대신 `pip`를 사용할 것을 강력히 권장합니다. 왜냐하면 설치 시간을 극적으로 줄이기 때문입니다.

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

소프트웨어 개발에서 우리는 소스 코드와 아티팩트 사이를 구분합니다. 개발자들은 소스 코드를 작성하고 읽지만, 아티팩트들은 소스 코드로부터 생성된 패키징되고, 배포 가능한 출력들입니다 --- 설치되거나 배포될 준비가 되어 있습니다.
아티팩트는 우리가 실행하는 코드 파일만큼 단순할 수 있고, 애플리케이션의 필요한 모든 비트와 범프들을 포함하는 전체 Virtual Machine만큼 복잡할 수 있습니다.
현재 디렉터리에 Python 파일 `greet.py`를 가진 이 예를 생각해 보세요:

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

Python이 특정 위치들에서만 모듈들을 검색하기 때문에 우리가 다른 디렉터리로 이동하면 import가 실패합니다(현재 디렉터리, 설치된 패키지들, 그리고 `PYTHONPATH`의 경로들). 패키징은 이 문제를 해결하여 코드를 알려진 위치에 설치합니다.

Python에서, 라이브러리 패키징은 `pip`나 `uv`와 같은 패키지 설치 프로그램들이 관련 파일들을 설치하는 데 사용할 수 있는 아티팩트를 생성하는 것을 포함합니다.
Python 아티팩트들은 _휠_이라고 불리고 패키지를 설치하기 위한 필요한 모든 정보를 포함합니다: 코드 파일들, 패키지에 대한 메타데이터(이름, 버전, 의존성), 그리고 환경에 파일들을 어디에 배치할지에 대한 지침들입니다.
아티팩트 빌드는 프로젝트의 세부 사항, 필요한 의존성, 패키지의 버전, 그리고 다른 정보들을 명시하는 프로젝트 파일(또한 종종 매니페스트로도 알려짐)을 작성해야 합니다. Python에서는 이를 위해 `pyproject.toml`을 사용합니다.

> `pyproject.toml`은 현대적이고 권장되는 방법입니다. 과거의 `requirements.txt`나 `setup.py` 같은 이전 패키징 방법들은 여전히 지원되지만, 가능할 때마다 `pyproject.toml`을 선호해야 합니다.

라이브러리뿐만 아니라 명령어 라인 도구도 제공하는 라이브러리를 위한 최소한의 `pyproject.toml`은 다음과 같습니다:

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

`typer` 라이브러리는 최소한의 보일러플레이트로 명령어 라인 인터페이스들을 만들기 위한 인기 있는 Python 패키지입니다.

그리고 대응하는 `greeting.py`:

```python
import typer


def greet(name: str) -> str:
    return f"Hello, {name}!"


def main(name: str):
    print(greet(name))


if __name__ == "__main__":
    typer.run(main)
```

이 파일로, 우리는 이제 휠을 빌드할 수 있습니다:

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

`.whl` 파일은 휠입니다(특정 구조를 가진 zip 아카이브), 그리고 `.tar.gz`은 소스로 빌드해야 하는 시스템들을 위한 소스 배포입니다.

휠의 내용들을 검사하여 무엇이 패키징되는지 볼 수 있습니다:

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

이제 누군가 다른 사람이 이 휠을 제공받으면, 다음을 실행하여 그것을 설치할 수 있습니다:

```console
$ uv pip install ./greeting-0.1.0-py3-none-any.whl
$ greet Alice
Hello, Alice!
```

이것은 우리가 앞서 빌드한 라이브러리를 그들의 환경에 설치할 것이며, `greet` cli 도구를 포함합니다.

이 접근법에는 한계들이 있습니다. 특히, 만약 우리의 라이브러리가 GPU 가속을 위한 CUDA와 같은 플랫폼별 라이브러리들에 따라 다르다면, 우리의 아티팩트는 그 특정 라이브러리들이 설치된 시스템에서만 작동하며, 우리는 다양한 플랫폼들(Linux, macOS, Windows) 그리고 아키텍처들(x86, ARM)에 대해 분리된 휠들을 빌드해야 할 수도 있습니다.


소프트웨어를 설치할 때, 소스에서 설치하는 것과 미리 빌드된 바이너리를 설치하는 것 사이에는 중요한 구분이 있습니다. 소스에서 설치하는 것은 원본 코드를 다운로드하고 당신의 머신에서 컴파일하는 것을 의미합니다 --- 이것은 컴파일러와 빌드 도구들이 설치되어 있어야 하고, 큰 프로젝트들의 경우 상당한 시간이 걸릴 수 있습니다.

미리 빌드된 바이너리를 설치하는 것은 이미 누군가 다른 사람에 의해 컴파일된 아티팩트를 다운로드하는 것을 의미합니다 --- 더 빠르고 단순하지만, 바이너리는 당신의 플랫폼과 아키텍처와 일치해야 합니다.
예를 들어, [ripgrep의 릴리스 페이지](https://github.com/BurntSushi/ripgrep/releases)는 Linux(x86_64, ARM), macOS(Intel, Apple Silicon), 그리고 Windows에 대한 미리 빌드된 바이너리들을 보여줍니다.


# 릴리스와 버저닝

코드는 연속적인 과정에서 빌드되지만, 이산적인 기반으로 릴리스됩니다.
소프트웨어 개발에서 개발과 생산 환경들 사이에는 명확한 구분이 있습니다.
코드는 프로덕션으로 _배포_되기 전에 개발 환경에서 작동함을 증명해야 합니다.
릴리스 프로세스는 테스팅, 의존성 관리, 버저닝, 구성, 배포, 그리고 배포를 포함하는 많은 단계들을 포함합니다.


소프트웨어 라이브러리들은 정적이 아니고 시간이 지남에 따라 진화하며 수정 사항들과 새로운 기능들을 얻습니다.
우리는 특정 시점에서 라이브러리의 상태에 해당하는 이산적인 버전 식별자들로 이 진화를 추적합니다.
라이브러리의 동작의 변화들은 비중요 기능을 수정하는 패치들부터, 기능을 확장하는 새로운 기능들부터, 뒤로 호환성을 깨뜨리는 변경들까지 범위가 있을 수 있습니다.
변경로그들은 버전이 소개하는 변경들을 문서화합니다 --- 이것들은 소프트웨어 개발자들이 새로운 릴리스와 관련된 변경들을 전달하는 데 사용하는 문서들입니다.

하지만, 각각의 모든 의존성의 진행 중인 변경들을 추적하는 것은 비실용적이며, 이행적 의존성들 --- 우리의 의존성들의 의존성들을 고려할 때 더욱 그렇습니다.

> 프로젝트의 전체 의존성 트리를 `uv tree`와 함께 시각화할 수 있으며, 이것은 모든 패키지들과 그들의 이행적 의존성들을 트리 형식으로 보여줍니다.

이 문제를 단순화하기 위해 소프트웨어를 어떻게 버저닝할지에 대한 관례가 있으며, 가장 광범위하게 사용되는 것 중 하나는 [Semantic Versioning](https://semver.org/) 또는 SemVer입니다.
Semantic Versioning에서, 버전은 MAJOR.MINOR.PATCH 형식의 식별자를 가지며 각각의 값들은 정수 값을 취합니다. 짧은 버전은 업그레이딩입니다:

- PATCH(예: 1.2.3 → 1.2.4)는 오직 버그 수정만 포함해야 하고 완전히 뒤로 호환 가능합니다.
- MINOR(예: 1.2.3 → 1.3.0)는 뒤로 호환 가능한 방식으로 새로운 기능을 추가합니다.
- MAJOR(예: 1.2.3 → 2.0.0)는 코드 수정이 필요할 수 있는 깨진 변경들을 나타냅니다.

> 이것은 단순화이며 우리는 예를 들어 0.1.3에서 0.2.0으로 가는 것이 깨진 변경들을 유발할 수 있거나 1.0.0-rc.1이 의미하는 바를 이해하기 위해 전체 SemVer 명세를 읽도록 권장합니다.
Python 패키징은 semantic 버저닝을 원래부터 지원하므로, 우리가 의존성들의 버전들을 명시할 때 다양한 명세자들을 사용할 수 있습니다:

`pyproject.toml`에서 우리는 호환 버전들의 범위를 제약하는 다양한 방법들을 가지고 있습니다:

```toml
[project]
dependencies = [
    "requests==2.32.3",  # Exact version - only this specific version
    "click>=8.0",        # Minimum version - 8.0 or newer
    "numpy>=1.24,<2.0",  # Range - at least 1.24 but less than 2.0
    "pandas~=2.1.0",     # Compatible release - >=2.1.0 and <2.2.0
]
```

버전 명세자들은 많은 패키지 관리자들에 걸쳐 존재합니다(npm, cargo, 등)는 다양한 정확한 의미론들을 가집니다. `~=` 연산자는 Python의 "호환 릴리스" 연산자입니다 --- `~=2.1.0`은 "2.1.0과 호환되는 어떤 버전"을 의미하며, 이것은 `>=2.1.0`과 `<2.2.0`으로 변환됩니다. 이것은 대략 npm과 cargo의 캐럿(`^`) 연산자와 동등하며, SemVer의 호환성 개념을 따릅니다.

모든 소프트웨어가 semantic 버저닝을 사용하지는 않습니다. 일반적인 대안은 Calendar Versioning(CalVer)이며, 버전들이 의미론적 의미보다는 릴리스 날짜를 기반으로 합니다. 예를 들어, Ubuntu는 `24.04`(April 2024)와 `24.10`(October 2024) 같은 버전들을 사용합니다. CalVer는 릴리스가 얼마나 오래되었는지 보기 쉽게 만들지만, 호환성에 대해 아무것도 전달하지 않습니다. 마지막으로, semantic 버저닝은 실패하지 않으며, 때로는 유지 관리자들이 실수로 마이너 또는 패치 릴리스에서 깨진 변경들을 소개합니다.


# 재현성

현대 소프트웨어 개발에서 당신이 작성하는 코드는 추상화의 상당한 개수의 계층들 위에 존재합니다.
이것은 프로그래밍 언어 런타임, 제3자 라이브러리, 운영 체제, 또는 심지어 하드웨어 자체와 같은 것들을 포함합니다.
이러한 계층들 중 어떤 것에서의 어떤 차이도 당신의 코드의 동작을 변경하거나 그것이 의도대로 작동하지 못하게 할 수도 있습니다.
더욱이, 기저 하드웨어의 차이들도 당신이 소프트웨어를 배포하는 당신의 능력에 영향을 미칩니다.

라이브러리를 고정한다는 것은 범위 대신 정확한 버전을 명시하는 것을 의미합니다. 예: `requests==2.32.3` 대신 `requests>=2.0`.

패키지 관리자의 일부 업무는 의존성들에 의해 제공된 모든 제약들을 고려하는 것입니다 --- 그리고 이행적 의존성들 --- 그리고 그 다음 모든 제약들을 만족할 버전들의 유효한 목록을 생성합니다.
특정 버전 목록은 그 다음 재현성 목적들을 위해 파일에 저장될 수 있습니다; 이 파일들은 _로크 파일_이라고 언급됩니다.

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

의존성 버저닝과 재현성을 처리할 때 중요한 구분은 라이브러리들과 애플리케이션/서비스들 사이의 구분입니다.
라이브러리는 다른 코드에 의해 임포트되고 사용되는 것을 의도하고 있으며, 이는 자신의 의존성을 가질 수도 있으므로, 과도하게 엄격한 버전 제약들을 명시하면 사용자의 다른 의존성들과 충돌이 발생할 수 있습니다.
대조적으로, 애플리케이션들이나 서비스들은 소프트웨어의 최종 소비자들이고 일반적으로 프로그래밍 인터페이스를 통해서가 아닌 사용자 인터페이스나 API를 통해 자신의 기능을 노출합니다.
라이브러리들의 경우, 더 넓은 패키지 생태계와의 호환성을 최대화하기 위해 버전 범위들을 명시하는 것이 좋은 관행입니다. 애플리케이션들의 경우, 정확한 버전을 고정하면 재현성을 보장합니다 --- 애플리케이션을 실행하는 모든 사람이 정확히 같은 의존성들을 사용합니다.


최대 재현성이 필요한 프로젝트들을 위해, [Nix](https://nixos.org/)와 [Bazel](https://bazel.build/)과 같은 도구들은 _불변의_ 빌드들을 제공합니다 --- 컴파일러, 시스템 라이브러리, 그리고 심지어 빌드 환경 자체를 포함하는 모든 입력이 고정되고 내용 주소지정됩니다. 이것은 빌드가 언제 또는 어디서 실행되든 비트-온-비트 동일한 출력들을 보장합니다.

> 당신은 심지어 NixOS를 당신의 전체 컴퓨터 설치를 관리하는 데 사용할 수 있으므로 당신의 컴퓨터 설정의 새로운 복사본들을 쉽게 회전할 수 있고 버전 관리되는 구성 파일들을 통해 전체 구성을 관리할 수 있습니다.

소프트웨어 개발의 끝없는 긴장은 새로운 소프트웨어 버전들이 의도적으로 또는 의도치 않게 깨운것을 소개하는 한편, 다른 한편으로는 오래된 소프트웨어 버전들이 시간이 지남에 따라 보안 취약점들로 손상된다는 것입니다.
우리는 이것을 우리의 애플리케이션을 새 소프트웨어 버전들에 대해 테스트하는 지속적 통합 파이프라인들(우리는 [Code Quality and CI](/2026/code-quality/) 강의에서 더 많이 볼 것입니다)을 사용하여 그리고 새 버전들의 의존성들이 릴리스될 때를 탐지하기 위한 [Dependabot](https://github.com/dependabot)과 같은 자동화를 가짐으로써 처리할 수 있습니다.

CI 테스팅이 동작할 때도, 문제들은 여전히 소프트웨어 버전들을 업그레이드할 때 발생합니다. 종종 개발과 생산 환경들 사이의 불가피한 불일치 때문입니다.
그 상황들에서 최선의 조치 과정은 _롤백_ 계획을 가지는 것이며, 버전 업그레이드는 되돌려지고 알려진 좋은 버전이 대신 다시 배포됩니다.

# VM과 컨테이너

더 복잡한 의존성들을 의존하기 시작할 때, 코드의 의존성들은 패키지 관리자가 처리할 수 있는 것의 경계를 넘을 가능성이 높습니다.
흔한 이유 중 하나는 특정 시스템 라이브러리들이나 하드웨어 드라이버들과 상호작용해야 한다는 것입니다.
예를 들어, 과학 컴퓨팅과 AI에서, 프로그램들은 종종 GPU 하드웨어를 활용하기 위해 전문화된 라이브러리들과 드라이버들을 필요로 합니다.
많은 시스템 수준의 의존성들(GPU 드라이버, 특정 컴파일러 버전, OpenSSL과 같은 공유 라이브러리들)은 여전히 시스템 전체 설치를 필요로 합니다.

전통적으로 이 더 넓은 의존성 문제는 Virtual Machines(VM)을 통해 해결되었습니다.
VM들은 전체 컴퓨터를 추상화하고 자신의 전담 운영 체제를 가진 완전히 격리된 환경을 제공합니다.
더 현대적인 접근법은 컨테이너들이며, 이것은 애플리케이션을 의존성들, 라이브러리들, 그리고 파일시스템과 함께 패키징하지만, 전체 컴퓨터를 가상화하는 대신 호스트의 운영 체제 커널을 공유합니다.
컨테이너들은 커널을 공유하기 때문에 VM보다 더 가볍고, 더 빠르게 시작하고 더 효율적으로 실행합니다.

가장 인기 있는 컨테이너 플랫폼은 [Docker](https://www.docker.com/)입니다. Docker는 컨테이너들을 빌드하고, 배포하고, 실행하는 표준화된 방법을 소개했습니다. 언더 더 후드에서, Docker는 containerd를 컨테이너 런타임으로 사용합니다 --- Kubernetes와 같은 다른 도구들도 사용하는 산업 표준입니다.

컨테이너를 실행하는 것은 간단합니다. 예를 들어, 컨테이너 내에서 Python 인터프리터를 실행하려면 `docker run`을 사용합니다(-it 플래그들은 컨테이너를 대화형 및 터미널로 만듭니다. 당신이 종료할 때, 컨테이너가 멈춥니다.).

```console
$ docker run -it python:3.12 python
Python 3.12.7 (main, Nov  5 2024, 02:53:25) [GCC 12.2.0] on linux
>>> print("Hello from inside a container!")
Hello from inside a container!
```

실제로 프로그램은 전체 파일 시스템에 따라 다를 수도 있습니다.
이것을 극복하기 위해, 우리는 애플리케이션의 전체 파일시스템을 배포하는 컨테이너 이미지들을 사용할 수 있습니다.
컨테이너 이미지들은 프로그래밍적으로 만들어집니다. docker와 함께, 우리는 Dockerfile 문법을 사용하여 정확히 이미지의 의존성들, 시스템 라이브러리들, 그리고 구성을 명시합니다:

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

중요한 구분: Docker **이미지**는 패키징된 아티팩트입니다(템플릿처럼), **컨테이너**는 그 이미지의 실행 중인 인스턴스입니다. 같은 이미지에서 여러 컨테이너들을 실행할 수 있습니다. 이미지들은 계층들에서 빌드되며, Dockerfile의 각 명령(`FROM`, `RUN`, `COPY`, 등)이 새로운 계층을 만듭니다. Docker는 이 계층들을 캐시하므로, 당신이 Dockerfile의 라인을 변경하면, 오직 그 계층과 그 다음 계층들만 다시 빌드될 필요가 있습니다.

이전의 Dockerfile은 여러 문제들을 가지고 있습니다: 완전한 Python 이미지를 사용하는 대신 제한된 변형, 불필요한 계층들을 생성하는 분리된 `RUN` 명령들을 실행, 버전들이 고정되지 않음, 그리고 패키지 관리자 캐시들을 청소하지 않으며 불필요한 파일들을 배포합니다. 다른 빈번한 실수들은 안전하지 않게 root로 컨테이너들을 실행하고 실수로 계층들에 비밀들을 내장하는 것을 포함합니다.

여기는 개선된 버전입니다.

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

이전의 예에서 우리는 소스에서 `uv`를 설치하는 대신, 우리는 `ghcr.io/astral-sh/uv:latest` 이미지에서 미리 빌드된 바이너리를 복사하고 있습니다. 이것은 _빌더_ 패턴으로 알려져 있습니다. 이 패턴과 함께, 우리는 우리의 코드를 컴파일하기 위해 필요한 모든 도구들을 배포할 필요가 없습니다, 단지 애플리케이션을 실행하기 위해 필요한 최종 바이너리(이 경우 `uv`).

Docker에는 인식해야 할 중요한 한계들이 있습니다. 먼저, 컨테이너 이미지들은 종종 플랫폼별입니다 --- `linux/amd64`에 대해 빌드된 이미지는 에뮬레이션 없이 `linux/arm64`(Apple Silicon Macs) 위에서 원래부터 실행되지 않으며, 이것은 느립니다. 둘째, Docker 컨테이너들은 Linux 커널을 필요로 하므로, macOS와 Windows 위에서, Docker는 실제로 언더 더 후드에서 가벼운 Linux VM을 실행하며, 오버헤드를 추가합니다. 셋째, Docker의 격리는 VM보다 약합니다 --- 컨테이너들은 호스트 커널을 공유하며, 이것은 다중 테넌트 환경에서 보안 관심사입니다.

> 이 날들에, 더 많은 프로젝트들은 또한 [nix 플레이크](https://serokell.io/blog/practical-nix-flakes)를 통해 프로젝트당 "시스템 전체" 라이브러리들과 애플리케이션들을 관리하기 위해 nix를 사용하고 있습니다.

# 구성

소프트웨어는 본질적으로 구성 가능합니다. [명령어 라인 환경](/2026/command-line-environment/) 강의에서 우리는 플래그들, 환경 변수들 또는 구성 파일들 일명 dotfiles를 통해 옵션들을 받는 프로그램들을 보았습니다. 이것은 더 복잡한 애플리케이션들도 마찬가지입니다. 규모에서 구성을 관리하기 위한 확립된 패턴들이 있습니다.
소프트웨어 구성은 코드에 내장되어서는 안 되며, 런타임에 제공되어야 합니다.
일반적인 것들의 몇 가지는 환경 변수들과 구성 파일들입니다.

다음은 환경 변수들을 통해 구성되는 애플리케이션의 예입니다:

```python
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///local.db")
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
API_KEY = os.environ["API_KEY"]  # Required - will raise if not set
```

애플리케이션은 또한 구성 파일(예: `yaml.load`를 통해 구성을 로드하는 Python 프로그램)을 통해 구성될 수도 있습니다, `config.yaml`:

```yaml
database:
  url: "postgresql://localhost/myapp"
  pool_size: 5
server:
  host: "0.0.0.0"
  port: 8080
  debug: false
```

구성에 대해 생각하는 좋은 우측 규칙은 같은 코드베이스가 다양한 환경들(개발, 스테이징, 생산)에 배포 가능해야 한다는 것입니다. 코드 변경이 없이, 오직 구성 변경들과 함께입니다.

많은 구성 옵션들 사이에서, API 키와 같은 민감한 데이터가 종종 있습니다.
비밀들은 실수로 그들을 노출하는 것을 방지하기 위해 주의 깊게 처리되어야 하며, 버전 관리에 포함되어서는 안 됩니다.


# 서비스와 오케스트레이션

현대 애플리케이션들은 격리에서 거의 존재하지 않습니다. 전형적인 웹 애플리케이션은 영구 저장소를 위한 데이터베이스, 성능을 위한 캐시, 백그라운드 작업들을 위한 메시지 큐, 그리고 다양한 다른 지원 서비스들을 필요로 할 수도 있습니다. 모든 것을 단일의 모놀리식 애플리케이션에 번들하는 대신, 현대 아키텍처들은 종종 기능을 독립적으로 개발되고, 배포되고, 확장될 수 있는 분리된 서비스들로 분해합니다.

예로서, 우리의 애플리케이션이 캐시를 사용하여 이로움을 받을 수 있다고 결정하면, 우리는 자신의 것을 굴리는 대신 [Redis](https://redis.io/)나 [Memcached](https://memcached.org/)와 같은 기존 전투 테스트된 솔루션들을 활용할 수 있습니다.
우리는 Redis를 애플리케이션 의존성들의 일부로 빌드하여 컨테이너에 내장할 수 있습니다. 하지만, 그것은 Redis와 우리의 애플리케이션 사이의 모든 의존성들을 조화롭게 만드는 것을 의미하며, 이것은 도전적이거나 심지어 불가능할 수도 있습니다.
대신 우리가 할 수 있는 것은 각 애플리케이션을 자신의 컨테이너에서 분리되게 배포하는 것입니다.
이것은 보통 각 컴포넌트가 네트워크를 통해 통신하는 독립 서비스로 실행되는 마이크로서비스 아키텍처로 언급됩니다. 일반적으로 HTTP API들을 통해입니다.

[Docker Compose](https://docs.docker.com/compose/)는 다중 컨테이너 애플리케이션들을 정의하고 실행하기 위한 도구입니다. 컨테이너들을 개별적으로 관리하는 대신, 당신은 모든 서비스들을 단일 YAML 파일에서 선언하고 그들을 함께 오케스트레이션합니다. 이제 우리의 전체 애플리케이션은 하나 이상의 컨테이너를 포함합니다:

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

`docker compose up`과 함께, 두 서비스들이 함께 시작하고, 웹 애플리케이션은 호스트명 `cache`를 사용하여 Redis에 연결할 수 있습니다(Docker의 내부 DNS는 자동으로 서비스 이름들을 해결합니다).
Docker Compose은 우리가 하나 이상의 서비스들을 배포하고 싶은 방법을 선언하고, 그들을 함께 시작하는 오케스트레이션, 그들 사이의 네트워킹을 설정, 그리고 데이터 지속성을 위한 공유 볼륨들을 관리하는 것을 처리합니다.

생산 배포들을 위해, 당신은 종종 부팅 시 docker compose 서비스들이 자동으로 시작되고 실패 시 재시작하기를 원합니다. 일반적인 접근법은 systemd를 docker compose 배포를 관리하는 데 사용하는 것입니다:

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

이 systemd 단위 파일은 당신의 애플리케이션이 시스템이 부팅할 때 시작하도록(Docker가 준비된 후) 보장하고, `systemctl start myapp`, `systemctl stop myapp`, 그리고 `systemctl status myapp` 같은 표준 제어들을 제공합니다.

배포 요구사항들이 더 복잡해질 때 --- 여러 머신에 걸쳐 확장성을 필요로 할 때, 서비스들이 충돌할 때 고장 관용성, 그리고 고가용성 보장 --- 조직들은 기계들의 클러스터들에 걸쳐 수천 개의 컨테이너들을 관리할 수 있는 Kubernetes(k8s)와 같은 정교한 컨테이너 오케스트레이션 플랫폼들로 전환합니다. 즉, Kubernetes는 가파른 학습 곡선과 상당한 운영 오버헤드를 가지고 있으므로, 더 작은 프로젝트들에 대해 종종 과할 수도 있습니다.

이 다중 컨테이너 설정은 부분적으로 가능합니다. 현대 서비스들이 표준화된 API들을 통해 서로 통신하므로, HTTP REST API들과 함께합니다. 예를 들어, OpenAI나 Anthropic과 같은 LLM 제공자와 상호작용할 때마다, 언더 더 후드에서 그들의 서버들로 HTTP 요청을 전송하고 응답을 파싱하는 것입니다:

```console
$ curl https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "content-type: application/json" \
    -H "anthropic-version: 2023-06-01" \
    -d '{"model": "claude-sonnet-4-20250514", "max_tokens": 256,
         "messages": [{"role": "user", "content": "Explain containers vs VMs in one sentence."}]}'
```

# 배포

당신이 코드를 작동하는 것을 보여주었으면, 당신은 다른 사람들이 다운로드하고 설치할 수 있도록 그것을 배포하는 데 관심이 있을 수도 있습니다.
배포는 많은 형태들을 취하고 프로그래밍 언어와 환경들과 본질적으로 연결됩니다. 당신이 운영합니다.

배포의 가장 단순한 형식은 사람들이 다운로드하고 로컬로 설치할 수 있도록 아티팩트들을 업로드하는 것입니다.
이것은 여전히 일반적이고, 당신은 [Ubuntu의 패키지 아카이브](http://archive.ubuntu.com/ubuntu/pool/main/)와 같은 곳들에서 그것을 찾을 수 있으며, 본질적으로 `.deb` 파일들의 HTTP 디렉터리 목록입니다.

이 날들에, GitHub는 소스 코드와 아티팩트들을 배포하기 위한 사실상의 플랫폼이 되었습니다.
소스 코드는 종종 공개적으로 이용 가능하지만, GitHub Releases는 유지 관리자들이 미리 빌드된 바이너리들과 다른 아티팩트들을 태그된 버전들에 연결하도록 허용합니다.


패키지 관리자들은 때로는 GitHub에서 직접 설치를 지원하며, 소스에서 또는 미리 빌드된 휠에서:

```console
# Install from source (will clone and build)
$ pip install git+https://github.com/psf/requests.git

# Install from a specific tag/branch
$ pip install git+https://github.com/psf/requests.git@v2.32.3

# Install a wheel directly from a GitHub release
$ pip install https://github.com/user/repo/releases/download/v1.0/package-1.0-py3-none-any.whl
```

사실, Go와 같은 어떤 언어들은 중앙의 패키지 저장소보다는 분산된 배포 모델을 사용합니다 --- Go 모듈들이 소스 코드 저장소들로부터 직접 배포되며.
`github.com/gorilla/mux`과 같은 모듈 경로들은 코드가 어디에 존재하는지를 나타내고, `go get`은 거기에서 직접 가져옵니다. 하지만, `pip`, `cargo`, 또는 `brew`와 같은 대부분의 패키지 관리자들이 배포의 용이함과 설치를 위한 사전 패키징된 프로젝트들의 중앙 인덱스들을 가집니다. 만약 우리가 실행한다면

```console
$ uv pip install requests --verbose --no-cache 2>&1 | grep -F '.whl'
DEBUG Selecting: requests==2.32.5 [compatible] (requests-2.32.5-py3-none-any.whl)
DEBUG No cache entry for: https://files.pythonhosted.org/packages/1e/db/4254e3eabe8020b458f1a747140d32277ec7a271daf1d235b70dc0b4e6e3/requests-2.32.5-py3-none-any.whl.metadata
DEBUG No cache entry for: https://files.pythonhosted.org/packages/1e/db/4254e3eabe8020b458f1a747140d32277ec7a271daf1d235b70dc0b4e6e3/requests-2.32.5-py3-none-any.whl
```

우리는 `requests` 휠을 어디에서 가져오는지를 봅니다. 파일명에서 `py3-none-any`를 주목하세요 --- 이것은 휠이 어떤 Python 3 버전에서든, 어떤 OS에서든, 어떤 아키텍처에서든 작동한다는 의미입니다. 컴파일된 코드를 가진 패키지들의 경우, 휠은 플랫폼별입니다:

```console
$ uv pip install numpy --verbose --no-cache 2>&1 | grep -F '.whl'
DEBUG Selecting: numpy==2.2.1 [compatible] (numpy-2.2.1-cp312-cp312-macosx_14_0_arm64.whl)
```

여기 `cp312-cp312-macosx_14_0_arm64`는 이 휠이 CPython 3.12 상 macOS 14+ ARM64(Apple Silicon)에 특정적임을 나타냅니다. 당신이 다른 플랫폼에 있다면, `pip`는 다른 휠을 다운로드하거나 소스에서 빌드할 것입니다.

역으로, 우리가 만든 패키지를 찾을 수 있도록 하려면, 우리는 이러한 레지스트리들 중 하나에 그것을 배포해야 합니다.
Python에서, 주요 레지스트리는 [Python Package Index (PyPI)](https://pypi.org)입니다.
설치처럼, 패키지들을 배포하는 여러 방법들이 있습니다. `uv publish` 명령은 PyPI로 패키지들을 업로드하기 위한 현대적 인터페이스를 제공합니다:

```console
$ uv publish --publish-url https://test.pypi.org/legacy/
Publishing greeting-0.1.0.tar.gz
Publishing greeting-0.1.0-py3-none-any.whl
```

여기 우리는 [TestPyPI](https://test.pypi.org)를 사용하고 있습니다 --- 실제 PyPI를 오염시키지 않고 배포 워크플로우를 테스트하도록 의도된 분리된 패키지 레지스트리입니다. 업로드되면, 당신은 TestPyPI에서 설치할 수 있습니다:

```console
$ uv pip install --index-url https://test.pypi.org/simple/ greeting
```

소프트웨어를 배포할 때 중요한 고려 사항은 신뢰입니다. 사용자들이 패키지가 실제로 당신으로부터 오고 변조되지 않았음을 어떻게 검증합니까? 패키지 레지스트리들은 완전성을 검증하기 위해 체크섬을 사용하고, 어떤 생태계들은 작성 증명의 암호화 증명을 제공하기 위해 패키지 서명을 지원합니다.

다양한 언어들은 자신의 고유한 패키지 레지스트리들을 가집니다: Rust를 위한 [crates.io](https://crates.io), JavaScript를 위한 [npm](https://www.npmjs.com), Ruby를 위한 [RubyGems](https://rubygems.org), 그리고 컨테이너 이미지들을 위한 [Docker Hub](https://hub.docker.com). 한편, 비공개 또는 내부 패키지들의 경우, 조직들은 종종 비공개 PyPI 서버나 비공개 Docker 레지스트리와 같은 자신의 고유한 패키지 저장소들을 배포하거나 클라우드 제공자들로부터의 관리된 솔루션들을 사용합니다.

웹 서비스를 인터넷에 배포하는 것은 추가 인프라를 포함합니다: 도메인 이름 등록, 당신의 도메인을 당신의 서버로 가리키기 위한 DNS 구성, 그리고 종종 HTTPS를 처리하고 트래픽을 라우트하기 위해 nginx와 같은 역방향 프록시입니다. 문서나 정적 사이트와 같은 더 단순한 사용 사례들의 경우, [GitHub Pages](https://pages.github.com/)는 저장소에서 직접 무료 호스팅을 제공합니다.

<!--
## Documentation

So far we have emphasized the deliverable _artifact_ as the main output of packaging and shipping code.
In addition to the artifact, we need to document for users the code's functionality, installation instructions, and usage examples.

Tools like [Sphinx](https://www.sphinx-doc.org/) (Python) and [MkDocs](https://www.mkdocs.org/) can automatically generate browsable documentation from docstrings and markdown files, often hosted on services like [Read the Docs](https://readthedocs.org/).
For HTTP-based APIs, the [OpenAPI specification](https://www.openapis.org/) (formerly Swagger) provides a standard format for describing API endpoints, which tools can use to generate interactive documentation and client libraries automatically. -->


# 연습

1. `printenv`로 당신의 환경을 저장하여 파일로, venv를 만들고, 활성화하고, `printenv`를 다른 파일로 하고 `diff before.txt after.txt`를 수행합니다. 환경에서 무엇이 변경되었습니까? 왜 셸이 venv를 선호합니까? (힌트: 활성화 전후로 `$PATH`를 보세요.) `which deactivate`를 실행하고 deactivate bash 함수가 하는 것에 대해 추론해 보세요.
1. `pyproject.toml`을 가진 Python 패키지를 만들고 가상 환경에 설치합니다. 로크 파일을 만들고 검사합니다.
1. Docker를 설치하고 docker compose를 사용하여 Missing Semester 클래스 웹사이트를 로컬로 빌드합니다.
1. 간단한 Python 애플리케이션을 위한 Dockerfile을 작성합니다. 그 다음 애플리케이션을 Redis 캐시와 함께 실행하는 `docker-compose.yml`을 작성합니다.
1. Python 패키지를 TestPyPI로 배포합니다(실제 PyPI에 공개하지 마세요. 공유할 가치가 있는 경우가 아니면). 그 다음 말한 패키지를 가진 Docker 이미지를 빌드하고 `ghcr.io`로 푸시합니다.
1. [GitHub Pages](https://docs.github.com/en/pages/quickstart)를 사용하여 웹사이트를 만듭니다. 여분: 커스텀 도메인으로 구성합니다.
