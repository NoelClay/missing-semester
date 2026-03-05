---
layout: lecture
permalink: /2020/kr/potpourri/
title: "포푸리 (Potpourri)"
description: >
  키보드 리매핑(keyboard remapping), 데몬(daemons), 백업(backups), API 등 다양하고 유용한 주제들에 대해 배웁니다.
thumbnail: /static/assets/thumbnails/2020/lec10.png
date: 2020-01-29
ready: true
video:
  aspect: 56.25
  id: kr_lec10_2020
---

## 목차

- [키보드 리매핑 (Keyboard remapping)](#키보드-리매핑-keyboard-remapping)
- [데몬 (Daemons)](#데몬-daemons)
- [FUSE](#fuse)
- [백업 (Backups)](#백업-backups)
- [API (APIs)](#api-apis)
- [일반적인 커맨드 라인 플래그 및 패턴 (Common command-line flags/patterns)](#일반적인-커맨드-라인-플래그-및-패턴-common-command-line-flagspatterns)
- [윈도우 매니저 (Window managers)](#윈도우-매니저-window-managers)
- [VPN](#vpn-vpns)
- [마크다운 (Markdown)](#마크다운-markdown)
- [Hammerspoon (macOS 데스크탑 자동화)](#hammerspoon-macos-데스크탑-자동화)
- [부팅 + 라이브 USB (Booting + Live USBs)](#부팅--라이브-usb-booting--live-usbs)
- [Docker, Vagrant, VM, 클라우드, OpenStack](#docker-vagrant-vm-클라우드-openstack)
- [노트북 프로그래밍 (Notebook programming)](#노트북-프로그래밍-notebook-programming)
- [GitHub](#github)

## 키보드 리매핑 (Keyboard remapping)

프로그래머로서 키보드는 여러분의 가장 주요한 입력 수단이다. 컴퓨터의 거의 모든 것과 마찬가지로, 키보드 역시 설정 가능하며(그럴 가치가 있다).

가장 기본적인 변경은 키를 리매핑(remapping)하는 것이다.
이는 보통 특정 키가 눌렸을 때 이를 가로채서 다른 키에 해당하는 이벤트로 교체해 주는 소프트웨어를 사용한다. 몇 가지 예시는 다음과 같다.
- Caps Lock을 Ctrl이나 Escape으로 리매핑하기. 우리(강사들)는 이 설정을 강력히 추천한다. Caps Lock은 매우 누르기 좋은 위치에 있지만 거의 사용되지 않기 때문이다.
- PrtSc 키를 음악 재생/일시정지로 리매핑하기. 대부분의 OS는 재생/일시정지 키를 지원한다.
- Ctrl 키와 Meta(Windows 또는 Command) 키를 서로 바꾸기.

또한 키를 여러분이 원하는 임의의 명령어에 매핑할 수도 있다. 이는 자주 수행하는 작업에 유용하다. 특정 키 조합을 감지하여 스크립트를 실행하는 소프트웨어를 사용하면 된다.
- 새 터미널이나 브라우저 창 열기.
- 긴 이메일 주소나 학번 등 특정 텍스트 입력하기.
- 컴퓨터나 디스플레이를 절전 모드로 전환하기.

더 복잡한 수정도 가능하다.
- 키 시퀀스 리매핑: 예를 들어 Shift를 다섯 번 누르면 Caps Lock이 켜지게 하기.
- 짧게 누르기(tap) vs 길게 누르기(hold) 구분: 예를 들어 Caps Lock을 짧게 탭하면 Esc로 작동하고, 길게 누르면서 조합 키로 사용하면 Ctrl로 작동하게 하기.
- 특정 키보드나 특정 소프트웨어에서만 리매핑이 적용되도록 설정하기.

관련 소프트웨어 리소스:
- macOS - [karabiner-elements](https://karabiner-elements.pqrs.org/), [skhd](https://github.com/koekeishiya/skhd) 또는 [BetterTouchTool](https://folivora.ai/)
- Linux - [xmodmap](https://wiki.archlinux.org/index.php/Xmodmap) 또는 [Autokey](https://github.com/autokey/autokey)
- Windows - 제어판 내장 기능, [AutoHotkey](https://www.autohotkey.com/) 또는 [SharpKeys](https://www.randyrants.com/category/sharpkeys/)
- QMK - 키보드가 커스텀 펌웨어를 지원한다면 [QMK](https://docs.qmk.fm/)를 사용하여 하드웨어 자체를 설정할 수 있다. 이렇게 하면 어떤 머신에 연결하더라도 리매핑된 설정이 그대로 유지된다.

## 데몬 (Daemons)

"데몬(daemons)"이라는 단어가 생소하더라도 그 개념은 이미 익숙할 것이다.
대부분의 컴퓨터에는 사용자가 직접 실행하고 상호작용하기를 기다리는 대신, 백그라운드에서 항상 실행되고 있는 일련의 프로세스들이 있다.
이러한 프로세스들을 데몬이라고 부르며, 데몬으로 실행되는 프로그램들은 종종 이름이 `d`로 끝난다.
예를 들어 `sshd`(SSH 데몬)는 들어오는 SSH 요청을 기다리고 원격 사용자의 로그인 자격 증명을 확인하는 역할을 한다.

Linux에서 `systemd`(시스템 데몬)는 데몬 프로세스를 실행하고 설정하는 가장 일반적인 솔루션이다.
`systemctl status`를 실행하면 현재 실행 중인 데몬 목록을 볼 수 있다. 대부분 익숙하지 않겠지만, 이들은 네트워크 관리, DNS 쿼리 해결, 그래픽 인터페이스 표시 등 시스템의 핵심 부분을 담당하고 있다.
`systemctl` 명령어를 통해 서비스의 `enable`(활성화), `disable`(비활성화), `start`(시작), `stop`(중단), `restart`(재시작) 또는 `status`(상태 확인)를 제어할 수 있다.

더 흥미로운 점은 `systemd`가 새로운 데몬(또는 서비스)을 설정하고 활성화하기 위한 꽤 접근하기 쉬운 인터페이스를 제공한다는 것이다.
아래는 간단한 Python 앱을 실행하기 위한 데몬 설정 예시이다.
상세한 내용은 다루지 않겠지만, 각 필드가 어떤 역할을 하는지 직관적으로 이해할 수 있을 것이다.

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Custom App
After=network.target

[Service]
User=foo
Group=foo
WorkingDirectory=/home/foo/projects/mydaemon
ExecStart=/usr/bin/local/python3.7 app.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

또한, 단순히 어떤 프로그램을 일정 주기마다 실행하고 싶다면 커스텀 데몬을 만들 필요 없이 [`cron`](https://www.man7.org/linux/man-pages/man8/cron.8.html)을 사용하면 된다. 이는 예약된 작업을 수행하기 위해 시스템이 이미 실행하고 있는 데몬이다.

## FUSE

현대적인 소프트웨어 시스템은 보통 작고 결합 가능한 빌딩 블록들로 구성된다.
운영체제는 파일 시스템이 지원하는 작업들에 대한 공통 언어가 있기 때문에 다양한 파일 시스템 백엔드 사용을 지원한다.
예를 들어, 여러분이 `touch`를 실행하여 파일을 생성하면 `touch`는 커널에 파일을 생성하라는 시스템 콜(system call)을 수행하고, 커널은 해당 파일 시스템 호출을 수행하여 파일을 만든다.
전통적으로 UNIX 파일 시스템은 커널 모듈로 구현되어 커널만이 파일 시스템 호출을 수행할 수 있었다.

[FUSE](https://en.wikipedia.org/wiki/Filesystem_in_Userspace) (Filesystem in User Space)는 사용자 프로그램에 의해 파일 시스템이 구현될 수 있도록 허용한다. FUSE는 사용자가 파일 시스템 호출을 위해 사용자 공간(user space) 코드를 실행할 수 있게 하고, 필요한 호출을 커널 인터페이스에 연결해 준다.
실제로는 사용자가 파일 시스템 호출에 대해 임의의 기능을 구현할 수 있음을 의미한다.

예를 들어, 가상 파일 시스템에서 작업을 수행할 때마다 해당 작업을 SSH를 통해 원격 머신으로 전달하여 그곳에서 실행하고 결과를 돌려받도록 FUSE를 사용할 수 있다.
이렇게 하면 로컬 프로그램은 파일이 마치 내 컴퓨터에 있는 것처럼 보이지만, 실제로는 원격 서버에 있는 것이다.
이것이 바로 `sshfs`가 하는 일이다.

흥미로운 FUSE 파일 시스템 예시들:
- [sshfs](https://github.com/libfuse/sshfs) - SSH 연결을 통해 원격 파일/폴더를 로컬에서 열기.
- [rclone](https://rclone.org/commands/rclone_mount/) - Dropbox, GDrive, Amazon S3, Google Cloud Storage와 같은 클라우드 저장소 서비스를 마운트하여 데이터를 로컬에서 열기.
- [gocryptfs](https://nuetzlich.net/gocryptfs/) - 암호화 오버레이 시스템. 파일은 암호화된 상태로 저장되지만 파일 시스템이 마운트되면 마운트 지점에서 평문으로 보인다.
- [kbfs](https://keybase.io/docs/kbfs) - 종단간 암호화를 지원하는 분산 파일 시스템. 개인용, 공유용, 공용 폴더를 가질 수 있다.
- [borgbackup](https://borgbackup.readthedocs.io/en/stable/usage/mount.html) - 중복 제거, 압축, 암호화된 백업을 쉽게 탐색할 수 있도록 마운트하기.

## 백업 (Backups)

백업하지 않은 모든 데이터는 언제든 영원히 사라질 수 있는 데이터이다.
데이터를 복사하는 것은 쉽지만, 안정적으로 백업하는 것은 어렵다.
다음은 백업의 기본 원칙과 몇 가지 접근 방식의 함정들이다.

첫째, 같은 디스크에 복사본을 두는 것은 백업이 아니다. 디스크 자체가 모든 데이터의 단일 장애점(single point of failure)이기 때문이다. 마찬가지로 집에 있는 외장 드라이브도 화재나 도난 등의 위험이 있으므로 취약한 백업 솔루션이다. 대신 외부(off-site) 백업을 두는 것이 권장되는 관행이다.

동기화 솔루션은 백업이 아니다. 예를 들어 Dropbox나 GDrive는 편리하지만, 데이터가 삭제되거나 변조되면 그 변경 사항을 즉시 전파한다. 같은 이유로 RAID와 같은 디스크 미러링 솔루션도 백업이 아니다. 데이터가 실수로 삭제되거나, 손상되거나, 랜섬웨어에 의해 암호화되는 상황에서는 도움이 되지 않는다.

좋은 백업 솔루션의 핵심 기능은 버전 관리(versioning), 중복 제거(deduplication), 그리고 보안이다.
버전 관리가 되는 백업은 변경 이력에 접근하고 파일을 효율적으로 복구할 수 있게 해준다.
효율적인 백업 솔루션은 데이터 중복 제거를 사용하여 증분 변경 사항만 저장함으로써 저장소 오버헤드를 줄인다.
보안 측면에서는 누군가 여러분의 모든 데이터와 백업을 읽거나 삭제하기 위해 무엇을 알고/가지고 있어야 하는지 스스로 질문해 보아야 한다.
마지막으로, 백업을 맹신하는 것은 위험하며 주기적으로 데이터를 복구할 수 있는지 검증해야 한다.

백업은 컴퓨터의 로컬 파일에만 국한되지 않는다.
웹 애플리케이션이 크게 성장함에 따라 방대한 양의 데이터가 클라우드에만 저장되고 있다.
예를 들어 웹메일, 소셜 미디어 사진, 스트리밍 서비스의 음악 플레이리스트, 온라인 문서 등은 해당 계정에 대한 접근 권한을 잃으면 사라진다.
이러한 정보의 오프라인 복사본을 만들어 두는 것이 좋으며, 데이터를 가져와서 저장해 주는 온라인 도구들을 찾아볼 수 있다.

더 자세한 설명은 2019년의 [백업 강의 노트](/2019/backups)를 참조하라.


## API (APIs)

이 강의에서는 로컬 작업을 효율적으로 처리하기 위해 컴퓨터를 사용하는 방법을 많이 다루었지만, 이러한 교훈들 중 많은 부분이 더 넓은 인터넷 세계로 확장된다. 대부분의 온라인 서비스는 프로그래밍 방식으로 해당 데이터에 접근할 수 있게 해주는 "API"를 제공한다. 예를 들어 미국 정부는 기상 예보를 얻을 수 있는 API를 제공하며, 이를 사용하면 쉘에서 쉽게 날씨 정보를 가져올 수 있다.

대부분의 API는 비슷한 형식을 갖는다. 보통 `api.service.com`을 루트로 하는 구조화된 URL이며, 경로와 쿼리 매개변수는 읽고 싶은 데이터나 수행하고 싶은 동작을 나타낸다. 예를 들어 미국 날씨 데이터의 경우, 특정 위치의 예보를 얻으려면 https://api.weather.gov/points/42.3604,-71.094 로 GET 요청(예: `curl` 사용)을 보낸다. 응답 내용에는 해당 지역의 상세 예보를 얻을 수 있는 다른 URL들이 포함되어 있다. 대개 응답은 JSON 형식이며, 이를 [`jq`](https://stedolan.github.io/jq/)와 같은 도구로 파이핑하여 필요한 정보만 추출할 수 있다.

일부 API는 인증이 필요하며, 이는 보통 요청에 포함해야 하는 일종의 비밀 **토큰(token)** 형태를 띤다. 사용하려는 특정 서비스의 문서를 읽어보아야 하겠지만, "[OAuth](https://www.oauth.com/)"라는 프로토콜을 자주 보게 될 것이다. 핵심적으로 OAuth는 특정 서비스에서 "여러분을 대신해 행동"할 수 있는 토큰을 부여하는 방식이며, 특정 용도로만 사용되도록 제한될 수 있다. 이러한 토큰은 **비밀**이므로, 토큰을 얻은 누구라도 여러분의 계정으로 허용된 권한 내에서 무엇이든 할 수 있다는 점을 명심하라!

[IFTTT](https://ifttt.com/)는 API 개념을 중심으로 한 웹사이트이자 서비스이다. 수많은 서비스와의 연동을 제공하며, 이들로부터 발생하는 이벤트를 거의 모든 방식으로 연결할 수 있게 해준다. 한번 살펴보라!

## 일반적인 커맨드 라인 플래그 및 패턴 (Common command-line flags/patterns)

커맨드 라인 도구들은 매우 다양하므로 사용 전에 `man` 페이지를 확인하는 것이 좋다. 하지만 많은 도구들이 공유하는 공통적인 기능들이 있으니 알아두면 유용하다.

 - 대부분의 도구는 사용법을 간략히 보여주는 `--help` 플래그를 지원한다.
 - 되돌릴 수 없는 변경을 일으킬 수 있는 많은 도구들은 "드라이 런(dry run)" 옵션을 지원한다. 실제 변경을 수행하지 않고 무엇을 **수행했을지**만 출력한다. 마찬가지로, 파괴적인 작업마다 사용자에게 묻는 "인터랙티브(interactive)" 플래그를 가진 경우도 많다.
 - 보통 `--version` 또는 `-V`를 사용하여 프로그램의 버전을 출력할 수 있다 (버그 리포트 시 유용하다!).
 - 거의 모든 도구는 더 상세한 출력을 생성하는 `--verbose` 또는 `-v` 플래그를 가지고 있다. 플래그를 여러 번 사용하여(`-vvv`) **더욱** 상세한 출력을 얻을 수 있는 경우가 많으며, 이는 디버깅에 편리하다. 반대로 에러 발생 시에만 출력을 내보내는 `--quiet` 플래그를 가진 도구들도 많다.
 - 많은 도구에서 파일 이름 대신 `-`를 사용하면 인자에 따라 "표준 입력" 또는 "표준 출력"을 의미한다.
 - 파괴적일 수 있는 도구들은 대개 기본적으로 재귀적으로 동작하지 않지만, 재귀적 동작을 위한 플래그(보통 `-r`)를 지원한다.
 - 때로는 플래그처럼 **보이는** 것을 일반 인자로 전달하고 싶을 때가 있다. 예를 들어 이름이 `-r`인 파일을 삭제하고 싶다고 가정해 보자. 혹은 `ssh machine foo`와 같이 한 프로그램을 다른 프로그램을 "통해" 실행하면서 "내부" 프로그램(`foo`)에 플래그를 전달하고 싶은 경우이다. 특수 인자 `--`는 프로그램이 그 이후에 오는 플래그와 옵션(`-`로 시작하는 것들)의 처리를 **중단**하도록 만든다. 이를 통해 플래그처럼 보이는 것들이 그렇게 해석되지 않게 전달할 수 있다: `rm -- -r` 또는 `ssh machine --for-ssh -- foo --for-foo`.

## 윈도우 매니저 (Window managers)

여러분 대부분은 Windows, macOS, Ubuntu 등에 기본으로 포함된 "드래그 앤 드롭" 방식의 윈도우 매니저 사용에 익숙할 것이다. 화면에 창들이 떠 있고, 드래그하여 옮기거나 크기를 조절하고 서로 겹치게 할 수도 있다. 하지만 이는 윈도우 매니저의 한 종류일 뿐이며, 흔히 "플로팅(floating)" 윈도우 매니저라고 불린다. 특히 Linux에는 수많은 다른 종류가 있다. 특히 흔한 대안은 "타일링(tiling)" 윈도우 매니저이다. 타일링 윈도우 매니저에서는 창들이 절대 겹치지 않으며, 마치 tmux의 분할창처럼 화면에 타일 형태로 배치된다. 타일링 윈도우 매니저를 쓰면 화면은 항상 열려 있는 창들로 가득 차며 특정 레이아웃에 따라 정렬된다. 창이 하나뿐이라면 화면 전체를 차지한다. 다른 창을 하나 더 열면 원래 창이 줄어들면서 자리를 내준다 (보통 2/3와 1/3 같은 식). 세 번째 창을 열면 기존 창들이 다시 줄어들어 새 창을 수용한다. tmux 분할창과 마찬가지로, 마우스에 손대지 않고 키보드만으로 이 타일형 창들 사이를 이동하고 크기를 조절하거나 옮길 수 있다. 탐구해 볼 가치가 충분하다!


## VPN (VPNs)

요즘 VPN이 유행이지만, [그만한 가치가 있는지](https://web.archive.org/web/20230710155258/https://gist.github.com/joepie91/5a9909939e6ce7d09e29)는 확실하지 않다. VPN이 제공하는 것과 그렇지 않은 것을 잘 알고 있어야 한다. 가장 좋은 경우에도 VPN은 사실 인터넷 입장에서 여러분의 인터넷 서비스 제공자(ISP)를 바꾸는 수단일 뿐이다. 모든 트래픽은 여러분의 "실제" 위치가 아닌 VPN 제공업체로부터 오는 것처럼 보이며, 연결된 네트워크는 암호화된 트래픽만 보게 된다.

매력적으로 들릴 수 있지만, VPN을 사용할 때 실제로는 신뢰의 대상을 현재 ISP에서 VPN 호스팅 업체로 옮기는 것뿐이라는 점을 기억하라. ISP가 볼 수 있었던 모든 것을 이제 VPN 제공업체가 **대신** 보게 된다. 만약 그들을 ISP보다 더 신뢰한다면 이득이겠지만, 그렇지 않다면 얻는 것이 많지 않다. 공항의 보안이 의심스러운 개방형 공용 Wi-Fi를 쓰고 있다면 연결을 신뢰하기 어렵겠지만, 집에서는 그 트레이드오프가 명확하지 않다.

또한 요즘은 대부분의 민감한 트래픽이 HTTPS나 TLS를 통해 **이미** 암호화되어 있다는 점도 알아야 한다. 이 경우 "나쁜" 네트워크에 있더라도 큰 상관이 없는 경우가 많다. 네트워크 운영자는 여러분이 어떤 서버와 통신하는지만 알 수 있을 뿐, 교환되는 데이터 내용은 알 수 없기 때문이다.

위에서 "가장 좋은 경우"라고 말한 것에 주목하라. VPN 업체가 실수로 소프트웨어를 잘못 설정하여 암호화가 약해지거나 완전히 비활성화되는 일도 드물지 않다. 일부 악의적인 (또는 기회주의적인) VPN 제공업체는 모든 트래픽을 로그로 남기고 그 정보를 제3자에게 팔 수도 있다. 나쁜 VPN 업체를 선택하는 것은 아예 안 쓰는 것보다 못한 경우가 많다.

급한 경우 MIT는 학생들을 위해 [VPN을 운영](https://ist.mit.edu/vpn)하고 있으니 참고하라. 또한 직접 구축하고 싶다면 [WireGuard](https://www.wireguard.com/)를 살펴보라.

## 마크다운 (Markdown)

커리어를 쌓으면서 글을 쓸 기회는 매우 많을 것이다. 그리고 종종 그 글을 간단한 방식으로 꾸미고 싶을 것이다. 텍스트를 굵게 하거나 기울이고 싶을 수도 있고, 헤더, 링크, 코드 조각을 추가하고 싶을 수도 있다. Word나 LaTeX 같은 무거운 도구를 꺼내는 대신, 가벼운 마크업 언어인 [마크다운(Markdown)](https://commonmark.org/help/) 사용을 고려해 보라.

이미 마크다운을 보았거나 그 변종을 접해 보았을 것이다. 마크다운이라는 이름이 아니더라도 그 부분집합이 거의 모든 곳에서 사용되고 지원된다. 핵심적으로 마크다운은 사람들이 일반 텍스트 문서를 작성할 때 이미 흔히 사용하던 표기 방식들을 체계화하려는 시도이다. 강조(*이탤릭*)는 단어를 `*`로 감싸서 표현한다. 강한 강조(**굵게**)는 `**`를 사용한다. `#`으로 시작하는 라인은 헤더이다 (`#`의 개수가 헤더의 수준을 나타낸다). `-`로 시작하면 글머리 기호 목록이고, 숫자 + `.`으로 시작하면 번호 매기기 목록이다. 백틱(`)은 `코드 폰트`를 위해 사용되며, 코드 블록은 라인을 네 개의 공백으로 들여쓰거나 세 개의 백틱으로 감싸서 작성할 수 있다.

    ```
    코드는 여기에
    ```

링크를 추가하려면 대괄호 안에 링크 텍스트를 넣고, 그 바로 뒤 소괄호 안에 URL을 넣는다: `[이름](url)`. 마크다운은 시작하기 매우 쉽고 거의 모든 곳에서 사용할 수 있다. 사실 이 강의 노트를 포함한 모든 강의 노트는 마크다운으로 작성되었으며, [여기](https://raw.githubusercontent.com/missing-semester/missing-semester/master/_2020/potpourri.md)에서 원본 마크다운을 확인할 수 있다.



## Hammerspoon (macOS 데스크탑 자동화)

[Hammerspoon](https://www.hammerspoon.org/)은 macOS용 데스크탑 자동화 프레임워크이다. 운영체제 기능에 연결되는 Lua 스크립트를 작성하여 키보드/마우스, 창, 디스플레이, 파일 시스템 등과 상호작용할 수 있게 해준다.

Hammerspoon으로 할 수 있는 일의 예시:

- 창을 특정 위치로 이동시키는 단축키 지정
- 창들을 특정 레이아웃으로 자동 배치하는 메뉴바 버튼 생성
- 연구실에 도착하면 (Wi-Fi 네트워크 감지) 스피커 음소거하기
- 실수로 친구의 전원 어댑터를 챙겼을 때 경고 띄워주기

높은 수준에서 Hammerspoon은 메뉴 버튼, 키 입력 또는 이벤트에 연결된 임의의 Lua 코드를 실행할 수 있게 해주며, 시스템 상호작용을 위한 방대한 라이브러리를 제공하므로 할 수 있는 일에는 거의 제한이 없다. 많은 사람들이 자신의 Hammerspoon 설정을 공개해 두었으므로 인터넷 검색을 통해 필요한 것을 찾을 수 있고, 처음부터 직접 코드를 작성할 수도 있다.

### 리소스

- [Hammerspoon 시작하기](https://www.hammerspoon.org/go/)
- [샘플 설정들](https://github.com/Hammerspoon/hammerspoon/wiki/Sample-Configurations)
- [Anish의 Hammerspoon 설정](https://github.com/anishathalye/dotfiles-local/tree/mac/hammerspoon)

## 부팅 + 라이브 USB (Booting + Live USBs)

컴퓨터가 켜질 때 운영체제가 로드되기 전, [BIOS](https://en.wikipedia.org/wiki/BIOS)/[UEFI](https://en.wikipedia.org/wiki/Unified_Extensible_Firmware_Interface)가 시스템을 초기화한다. 이 과정에서 특정 키 조합을 눌러 이 소프트웨어 레이어를 설정할 수 있다. 예를 들어 부팅 중에 "Press F9 to configure BIOS. Press F12 to enter boot menu."와 같은 메시지가 나올 수 있다. BIOS 메뉴에서는 온갖 하드웨어 관련 설정을 할 수 있다. 또한 부팅 메뉴에 진입하여 하드 드라이브 대신 다른 장치로 부팅할 수도 있다.

[라이브 USB(Live USB)](https://en.wikipedia.org/wiki/Live_USB)는 운영체제를 포함하고 있는 USB 플래시 드라이브이다. 운영체제(예: Linux 배포판)를 다운로드하여 플래시 드라이브에 구워서 만들 수 있다. 이 과정은 단순히 `.iso` 파일을 디스크에 복사하는 것보다 약간 더 복잡하다. 라이브 USB 제작을 돕는 [UNetbootin](https://unetbootin.github.io/)과 같은 도구들이 있다.

라이브 USB는 다양한 용도로 유용하다. 특히 기존 운영체제 설치가 망가져서 부팅이 되지 않을 때, 라이브 USB를 사용하여 데이터를 복구하거나 운영체제를 수리할 수 있다.

## Docker, Vagrant, VM, 클라우드, OpenStack

[가상 머신(Virtual machines)](https://en.wikipedia.org/wiki/Virtual_machine)이나 컨테이너와 같은 도구들은 운영체제를 포함한 전체 컴퓨터 시스템을 에뮬레이션할 수 있게 해준다. 이는 테스트, 개발 또는 탐색(예: 잠재적으로 위험한 코드 실행)을 위한 격리된 환경을 만드는 데 유용하다.

[Vagrant](https://www.vagrantup.com/)는 머신 설정(운영체제, 서비스, 패키지 등)을 코드로 기술하고 `vagrant up` 한 번으로 VM을 생성할 수 있게 해주는 도구이다. [Docker](https://www.docker.com/)는 개념적으로 비슷하지만 컨테이너를 사용한다.

클라우드에서 가상 머신을 빌릴 수도 있는데, 이는 다음과 같은 자원에 즉각 접근할 수 있는 좋은 방법이다.
- 서비스를 호스팅하기 위한, 공인 IP를 가진 저렴한 상시 가동 머신
- 많은 CPU, 디스크, RAM 또는 GPU를 가진 고성능 머신
- 물리적으로 소유한 것보다 훨씬 많은 수의 머신 (보통 초 단위로 과금되므로, 짧은 시간 동안 대량의 연산이 필요하다면 수천 대의 컴퓨터를 몇 분 동안 빌리는 것이 가능하다)

인기 있는 서비스로는 [Amazon AWS](https://aws.amazon.com/), [Google Cloud](https://cloud.google.com/),[ Microsoft Azure](https://azure.microsoft.com/), [DigitalOcean](https://www.digitalocean.com/) 등이 있다.

MIT CSAIL 멤버라면 [CSAIL OpenStack 인스턴스](https://tig.csail.mit.edu/shared-computing/open-stack/)를 통해 연구용 무료 VM을 얻을 수 있다.

## 노트북 프로그래밍 (Notebook programming)

[노트북 프로그래밍 환경](https://en.wikipedia.org/wiki/Notebook_interface)은 특정 유형의 대화형 또는 탐색적 개발을 수행할 때 매우 편리하다. 현재 가장 인기 있는 노트북 환경은 Python(및 다른 여러 언어)을 위한 [Jupyter](https://jupyter.org/)일 것이다. [Wolfram Mathematica](https://www.wolfram.com/mathematica/)는 수학 중심의 프로그래밍에 아주 훌륭한 또 다른 노트북 환경이다.

## GitHub

[GitHub](https://github.com/)은 오픈 소스 소프트웨어 개발을 위한 가장 인기 있는 플랫폼 중 하나이다. [Vim](https://github.com/vim/vim)부터 [Hammerspoon](https://github.com/Hammerspoon/hammerspoon)에 이르기까지 우리가 이 강의에서 다룬 많은 도구들이 GitHub에 호스팅되어 있다. 매일 사용하는 도구들을 개선하기 위해 오픈 소스에 기여하는 일은 쉽게 시작할 수 있다.

GitHub 프로젝트에 기여하는 두 가지 주요 방법은 다음과 같다.

- [이슈(issue)](https://help.github.com/en/github/managing-your-work-on-github/creating-an-issue) 생성하기. 버그를 보고하거나 새로운 기능을 요청하는 데 사용된다. 코드를 읽거나 쓸 필요가 없으므로 꽤 가볍게 할 수 있는 일이다. 양질의 버그 리포트는 개발자들에게 매우 가치 있는 자산이다. 기존 논의에 댓글을 다는 것도 도움이 된다.
- [풀 리퀘스트(pull request)](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests)를 통해 코드 기여하기. 이는 보통 이슈 생성보다 더 많은 노력이 필요하다. GitHub에서 저장소를 [포크(fork)](https://help.github.com/en/github/getting-started-with-github/fork-a-repo)하고, 포크한 저장소를 클론한 뒤 새 브랜치를 만들고, 변경 사항(버그 수정이나 기능 구현 등)을 만든 후 브랜치를 푸시하고 **풀 리퀘스트를 생성**한다. 그 후 프로젝트 유지보수자와 의견을 주고받으며 패치에 대한 피드백을 받게 된다. 모든 것이 잘 진행되면 패치가 상위(upstream) 저장소에 머지된다. 규모가 큰 프로젝트는 기여 가이드를 갖추고 있거나, 초보자에게 적합한 이슈에 태그를 달아두기도 하며, 첫 기여자가 프로젝트에 익숙해지도록 돕는 멘토링 프로그램을 운영하기도 한다.
EOF
