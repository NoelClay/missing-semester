---
layout: lecture
permalink: /2020/kr/security/
title: "보안 및 암호학 (Security and Cryptography)"
description: >
  해시(hashes)와 키 유도 함수(key derivation functions)와 같은 암호학적 기본 요소에 대해 배우고, Git과 SSH와 같은 도구들이 이를 어떻게 사용하는지 이해합니다.
thumbnail: /static/assets/thumbnails/2020/lec9.png
date: 2020-01-28
ready: true
video:
  aspect: 56.25
  id: kr_lec9_2020
---

지난해의 [보안 및 프라이버시 강의](/2019/security/)는 컴퓨터 **사용자**로서 어떻게 더 안전해질 수 있는지에 집중했다. 올해는 Git에서의 해시 함수 사용이나 SSH에서의 키 유도 함수 및 대칭/비대칭 암호 시스템 등, 이번 과정에서 다룬 도구들을 이해하는 데 필요한 보안 및 암호학 개념에 집중할 것이다.

이 강의가 컴퓨터 시스템 보안([6.858](https://css.csail.mit.edu/6.858/))이나 암호학([6.857](https://courses.csail.mit.edu/6.857/) 및 6.875)에 관한 더 엄격하고 완벽한 과정을 대체할 수는 없다. 공식적인 훈련 없이 보안 관련 업무를 직접 수행하지 말라. 전문가가 아니라면 [암호 알고리즘을 직접 만들지 말라(Don't roll your own crypto)](https://www.schneier.com/blog/archives/2015/05/amateurs_produc.html). 시스템 보안 역시 동일한 원칙이 적용된다.

이 강의에서는 기초 암호학 개념을 비형식적이지만 실용적으로 다룬다. 보안 시스템이나 암호 프로토콜을 **설계**하는 법을 가르쳐주기에는 부족하겠지만, 여러분이 이미 사용하고 있는 프로그램과 프로토콜을 전반적으로 이해하는 데에는 충분하길 바란다.

# 엔트로피 (Entropy)

[엔트로피(Entropy)](https://en.wikipedia.org/wiki/Entropy_(information_theory))는 무작위성(randomness)의 척도이다. 이는 예를 들어 비밀번호의 강도를 결정할 때 유용하다.

![XKCD 936: Password Strength](https://imgs.xkcd.com/comics/password_strength.png)

위의 [XKCD 만화](https://xkcd.com/936/)가 보여주듯, "correcthorsebatterystaple"과 같은 비밀번호가 "Tr0ub4dor&3"보다 더 안전하다. 그렇다면 이를 어떻게 수치화할 수 있을까?

엔트로피는 **비트(bits)** 단위로 측정된다. 가능한 결과들의 집합에서 균등하게 무작위로 선택할 때, 엔트로피는 `log_2(가능한 경우의 수)`와 같다. 공정한 동전 던지기는 1비트의 엔트로피를 갖는다. 6면체 주사위 굴리기는 약 2.58비트의 엔트로피를 갖는다.

공격자가 비밀번호의 **모델**은 알고 있지만, 특정 비밀번호를 선택하는 데 사용된 무작위성(예: [디바이스 웨어(Diceware)](https://en.wikipedia.org/wiki/Diceware)를 통한 주사위 굴리기)은 모른다고 가정해야 한다.

엔트로피는 몇 비트 정도면 충분할까? 이는 여러분의 위협 모델(threat model)에 따라 다르다. XKCD 만화에서 지적했듯이 온라인 추측의 경우 약 40비트 정도면 꽤 괜찮다. 하지만 오프라인 추측(해시 탈취 후 대조)에 견디려면 훨씬 더 강력한 비밀번호(예: 80비트 이상)가 필요하다.

# 해시 함수 (Hash functions)

[암호학적 해시 함수(Cryptographic hash function)](https://en.wikipedia.org/wiki/Cryptographic_hash_function)는 임의의 크기의 데이터를 고정된 크기로 매핑하며, 몇 가지 특별한 성질을 갖는다. 해시 함수의 대략적인 명세는 다음과 같다.

```
hash(value: array<byte>) -> vector<byte, N>  (특정 고정값 N에 대해)
```

해시 함수의 예로 Git에서 사용하는 [SHA1](https://en.wikipedia.org/wiki/SHA-1)이 있다. 이는 임의 크기의 입력을 160비트 출력(40자리의 16진수로 표현 가능)으로 매핑한다. `sha1sum` 명령어를 사용하여 입력에 대한 SHA1 해시를 확인할 수 있다.

```console
$ printf 'hello' | sha1sum
aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
$ printf 'hello' | sha1sum
aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
$ printf 'Hello' | sha1sum
f7ff9e8b7bb2e09b70935a5d785e0cc5d9d0abf0
```

높은 수준에서 보면, 해시 함수는 역전(invert)하기 어렵고 무작위처럼 보이는(하지만 결정론적인) 함수로 생각할 수 있다 (이것이 [해시 함수의 이상적인 모델](https://en.wikipedia.org/wiki/Random_oracle)이다). 해시 함수는 다음과 같은 성질을 갖는다.

- 결정론적(Deterministic): 동일한 입력은 항상 동일한 출력을 생성한다.
- 역전 불가능성(Non-invertible): 특정 출력값 `h`에 대해 `hash(m) = h`가 되는 입력값 `m`을 찾기 어렵다.
- 제2 역상 저항성(Target collision resistant): 입력값 `m_1`이 주어졌을 때, `hash(m_1) = hash(m_2)`를 만족하는 다른 입력값 `m_2`를 찾기 어렵다.
- 충돌 저항성(Collision resistant): `hash(m_1) = hash(m_2)`를 만족하는 서로 다른 두 입력값 `m_1`과 `m_2`를 찾기 어렵다 (이는 제2 역상 저항성보다 훨씬 더 강력한 성질이다).

참고: 특정 목적에는 여전히 쓰일 수 있지만, SHA-1은 [더 이상](https://web.archive.org/web/20260207211148/https://shattered.io/) 강력한 암호학적 해시 함수로 간주되지 않는다. [암호학적 해시 함수의 수명](https://valerieaurora.org/hash.html)에 관한 표를 참고해 보라. 다만 특정 해시 함수를 추천하는 것은 이 강의의 범위를 벗어난다. 이 문제가 중요한 업무를 수행한다면 공식적인 보안/암호학 훈련이 필요하다.

## 응용 사례 (Applications)

- Git에서 콘텐츠 주소 지정 저장소(content-addressed storage)를 위해 사용한다. [해시 함수(Hash function)](https://en.wikipedia.org/wiki/Hash_function)라는 아이디어는 더 일반적인 개념이다(비암호학적 해시 함수도 존재한다). 왜 Git은 암호학적 해시 함수를 사용할까?
- 파일 내용의 짧은 요약본으로 사용한다. 소프트웨어는 종종 (덜 신뢰할 수 있는) 미러 사이트에서 다운로드하게 되는데(예: Linux ISO 파일), 미러 사이트를 전적으로 믿지 않아도 된다면 좋을 것이다. 공식 사이트들은 보통 다운로드 링크 옆에 해시값을 게시하며, 사용자는 파일을 받은 후 해시값을 대조하여 파일이 변조되지 않았는지 확인할 수 있다.
- [약속 스킴(Commitment schemes)](https://en.wikipedia.org/wiki/Commitment_scheme). 특정 값을 나중에 공개하기로 약속하고 싶을 때 사용한다. 예를 들어, 두 사람이 볼 수 있는 신뢰할 수 있는 동전 없이 머릿속으로 "공정한 동전 던지기"를 하고 싶다고 가정해 보자. 내가 `r = random()` 값을 정하고 `h = sha256(r)`을 공유한다. 그다음 상대방이 앞면인지 뒷면인지 외친다(우리는 `r`이 짝수면 앞면, 홀수면 뒷면이라고 합의한다). 상대방이 외친 후 내가 `r` 값을 공개하면, 상대방은 `sha256(r)`이 이전에 공유한 해시와 일치하는지 확인함으로써 내가 속이지 않았음을 검증할 수 있다.

# 키 유도 함수 (Key derivation functions)

암호학적 해시와 관련된 개념인 [키 유도 함수(Key derivation functions, KDF)](https://en.wikipedia.org/wiki/Key_derivation_function)는 다른 암호 알고리즘에서 키로 사용할 고정 길이의 출력을 생성하는 등 여러 용도로 사용된다. 보통 KDF는 오프라인 무차별 대입 공격(brute-force attacks)을 늦추기 위해 의도적으로 느리게 설계된다.

## 응용 사례 (Applications)

- 암호 문구(passphrases)로부터 다른 암호 알고리즘(예: 아래에서 다룰 대칭 암호학)에서 사용할 키를 생성한다.
- 로그인 자격 증명을 저장한다. 비밀번호를 평문으로 저장하는 것은 매우 위험하다. 올바른 방법은 각 사용자마다 무작위 [솔트(salt)](https://en.wikipedia.org/wiki/Salt_(cryptography)) `salt = random()`를 생성하여 저장하고, `KDF(password + salt)` 값을 저장하는 것이다. 로그인 시도 시 입력된 비밀번호와 저장된 솔트로 KDF를 다시 계산하여 일치 여부를 확인한다.

# 대칭 암호학 (Symmetric cryptography)

메시지 내용을 숨기는 것은 암호학을 생각할 때 가장 먼저 떠오르는 개념일 것이다. 대칭 암호학은 다음과 같은 기능들을 통해 이를 달성한다.

```
keygen() -> key  (이 함수는 무작위로 생성됨)

encrypt(plaintext: array<byte>, key) -> array<byte>  (암호문)
decrypt(ciphertext: array<byte>, key) -> array<byte>  (평문)
```

암호화 함수는 결과물(암호문)만 보고는 키 없이 원래 입력(평문)을 알아내기 어렵다는 성질을 갖는다. 복호화 함수는 당연하게도 `decrypt(encrypt(m, k), k) = m`이라는 정확성을 보장해야 한다.

오늘날 널리 사용되는 대칭 암호 시스템의 예로 [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)가 있다.

## 응용 사례 (Applications)

- 신뢰할 수 없는 클라우드 서비스에 저장할 파일을 암호화한다. 이를 KDF와 결합하면 암호 문구로 파일을 암호화할 수 있다. `key = KDF(passphrase)`를 생성한 후 `encrypt(file, key)`를 저장하는 방식이다.

# 비대칭 암호학 (Asymmetric cryptography)

"비대칭"이라는 용어는 서로 다른 역할을 하는 두 개의 키가 존재함을 의미한다. 개인키(private key)는 이름 그대로 비밀로 유지되어야 하는 반면, 공개키(public key)는 공개적으로 공유되어도 보안에 영향을 주지 않는다 (대칭 암호 시스템에서 키를 공유하는 것과는 다르다). 비대칭 암호 시스템은 암호화/복호화 및 서명/검증을 위해 다음과 같은 기능들을 제공한다.

```
keygen() -> (공개키, 개인키)  (이 함수는 무작위로 생성됨)

encrypt(plaintext: array<byte>, 공개키) -> array<byte>  (암호문)
decrypt(ciphertext: array<byte>, 개인키) -> array<byte>  (평문)

sign(message: array<byte>, 개인키) -> array<byte>  (서명)
verify(message: array<byte>, signature: array<byte>, 공개키) -> bool  (서명 유효 여부)
```

암호화/복호화 함수는 대칭 암호 시스템의 함수와 유사한 성질을 갖는다. 메시지는 **공개키**를 사용하여 암호화될 수 있다. 결과물(암호문)이 주어졌을 때, **개인키** 없이는 입력(평문)을 알아내기 어렵다. 복호화 함수는 `decrypt(encrypt(m, 공개키), 개인키) = m`이라는 정확성을 보장한다.

대칭 및 비대칭 암호화는 물리적인 자물쇠에 비유할 수 있다. 대칭 암호 시스템은 문 자물쇠와 같다. 키를 가진 사람이라면 누구나 잠그고 열 수 있다. 비대칭 암호화는 열려 있는 자물쇠와 그에 맞는 키가 있는 것과 같다. 여러분은 열린 자물쇠(공개키)를 누구에게나 줄 수 있고, 그들은 메시지를 상자에 넣은 뒤 그 자물쇠로 잠글 수 있다. 하지만 그 상자를 열 수 있는 것은 오직 키(개인키)를 보관하고 있는 여러분뿐이다.

서명/검증 함수는 실제 서명이 갖기를 바라는 성질과 동일하게, 서명을 위조하기 어렵다는 성질을 갖는다. 메시지가 무엇이든 **개인키** 없이는 `verify(message, signature, 공개키)`가 true를 반환하게 만드는 서명을 생성하기 어렵다. 그리고 물론, 검증 함수는 `verify(message, sign(message, 개인키), 공개키) = true`라는 정확성을 보장한다.

## 응용 사례 (Applications)

- [PGP 이메일 암호화](https://en.wikipedia.org/wiki/Pretty_Good_Privacy). 사람들은 자신의 공개키를 온라인(예: PGP 키 서버나 [Keybase](https://keybase.io/))에 게시할 수 있다. 그러면 누구든지 그들에게 암호화된 이메일을 보낼 수 있다.
- 프라이빗 메시징. [Signal](https://signal.org/)이나 [Keybase](https://keybase.io/)와 같은 앱은 비대칭 키를 사용하여 개인 통신 채널을 구축한다.
- 소프트웨어 서명. Git은 GPG로 서명된 커밋과 태그를 가질 수 있다. 게시된 공개키를 통해 누구나 다운로드한 소프트웨어의 진위 여부를 확인할 수 있다.

## 키 배포 (Key distribution)

비대칭 키 암호학은 훌륭하지만, 공개키를 배포하거나 공개키를 실제 신원과 매핑하는 데 큰 어려움이 있다. 이 문제에 대한 여러 해결책이 있다. Signal은 단순한 방식을 택했다. 처음 사용할 때 신뢰하고(trust on first use), 채널 밖에서 공개키 교환을 지원한다(친구의 "안전 번호"를 직접 확인). PGP는 [신뢰의 망(web of trust)](https://en.wikipedia.org/wiki/Web_of_trust)이라는 다른 해결책을 사용한다. Keybase는 [사회적 증명(social proof)](https://keybase.io/blog/chat-apps-softer-than-tofu)이라는 방식을 사용한다. 각 모델은 장단점이 있으며, 우리(강사들)는 Keybase의 모델을 선호한다.

# 사례 연구 (Case studies)

## 비밀번호 관리자 (Password managers)

이는 모든 사람이 사용해야 할 필수적인 도구이다 (예: [KeePassXC](https://keepassxc.org/), [pass](https://git.zx2c4.com/password-store/about/), [1Password](https://1password.com)). 비밀번호 관리자는 모든 로그인에 대해 고유하고 무작위로 생성된 높은 엔트로피의 비밀번호를 편리하게 사용할 수 있게 해주며, 모든 비밀번호를 한곳에 저장한다. 이 데이터는 KDF를 통해 생성된 키로 대칭 암호화되어 안전하게 보호된다.

비밀번호 관리자를 사용하면 비밀번호 재사용을 피할 수 있고(사이트가 해킹당했을 때 피해 최소화), 높은 엔트로피의 비밀번호를 사용할 수 있으며(해킹 당할 확률 감소), 오직 하나의 강력한 마스터 비밀번호만 기억하면 된다.

## 2단계 인증 (Two-factor authentication)

[2단계 인증(2FA)](https://en.wikipedia.org/wiki/Multi-factor_authentication)은 도난당한 비밀번호나 [피싱(phishing)](https://en.wikipedia.org/wiki/Phishing) 공격으로부터 보호하기 위해, 암호 문구("알고 있는 것")와 함께 [YubiKey](https://www.yubico.com/)와 같은 2FA 인증기("가지고 있는 것")를 사용하도록 요구한다.

## 전체 디스크 암호화 (Full disk encryption)

노트북의 디스크 전체를 암호화해 두는 것은 노트북을 도난당했을 때 데이터를 보호하는 쉬운 방법이다. Linux에서는 [cryptsetup + LUKS](https://wiki.archlinux.org/index.php/Dm-crypt/Encrypting_a_non-root_file_system), Windows에서는 [BitLocker](https://fossbytes.com/enable-full-disk-encryption-windows-10/), macOS에서는 [FileVault](https://support.apple.com/en-us/HT204837)를 사용할 수 있다. 이는 디스크 전체를 대칭 암호로 암호화하며, 키는 암호 문구로 보호된다.

## 프라이빗 메시징 (Private messaging)

[Signal](https://signal.org/)이나 [Keybase](https://keybase.io/)를 사용하라. 종단간(End-to-end) 보안은 비대칭 키 암호화를 기반으로 시작된다. 여기서 핵심은 연락처의 공개키를 얻는 것이다. 높은 수준의 보안을 원한다면 Signal이나 Keybase를 통해 채널 밖에서 공개키를 인증하거나, Keybase의 사회적 증명을 신뢰해야 한다.

## SSH

우리는 [이전 강의](/2020/kr/command-line/#remote-machines)에서 SSH와 SSH 키 사용법을 다루었다. 이제 암호학적 관점에서 이를 살펴보자.

`ssh-keygen`을 실행하면 `public_key, private_key`라는 비대칭 키 쌍이 생성된다. 이는 운영체제에서 제공하는 엔트로피(하드웨어 이벤트 등으로부터 수집됨)를 사용하여 무작위로 생성된다. 공개키는 그대로 저장되지만(공개되어도 상관없으므로), 개인키는 디스크에 암호화된 상태로 저장되어야 한다. `ssh-keygen`은 사용자에게 암호 문구를 묻고, 이를 키 유도 함수(KDF)에 통과시켜 키를 생성한 뒤, 이 키로 개인키를 대칭 암호화한다.

사용 시, 서버가 클라이언트의 공개키(`.ssh/authorized_keys` 파일에 저장됨)를 알고 있으면, 접속하려는 클라이언트는 비대칭 서명을 사용하여 자신의 신원을 증명할 수 있다. 이는 [챌린지-응답(challenge-response)](https://en.wikipedia.org/wiki/Challenge%E2%80%93response_authentication) 인증을 통해 이루어진다. 높은 수준에서 설명하자면, 서버는 무작위 숫자를 뽑아 클라이언트에 보낸다. 클라이언트는 이 메시지에 서명하여 서버에 다시 보내고, 서버는 기록된 공개키와 대조하여 서명을 확인한다. 이는 클라이언트가 서버의 `.ssh/authorized_keys`에 있는 공개키에 대응하는 개인키를 실제로 소유하고 있음을 증명하며, 서버는 로그인을 허용한다.

# 리소스 (Resources)

- [지난해 강의 노트](/2019/security/): 컴퓨터 사용자로서의 보안과 프라이버시에 더 집중했던 시기의 자료이다.
- [Cryptographic Right Answers](https://latacora.micro.blog/2018/04/03/cryptographic-right-answers.html): 흔히 마주하는 암호학적 문제들에 대해 어떤 암호를 사용해야 할지 답변해 준다.

# 연습 문제 (Exercises)

1. **엔트로피.**
    1. 100,000개의 단어가 담긴 사전에서 4개의 소문자 단어를 무작위로 균등하게 선택하여 연결한 비밀번호가 있다고 가정하자. 예: `correcthorsebatterystaple`. 이 비밀번호의 엔트로피는 몇 비트인가?
    2. 대안으로 8자리의 무작위 영숫자(alphanumeric, 대소문자 포함)로 구성된 비밀번호를 가정하자. 예: `rg8Ql34g`. 이 비밀번호의 엔트로피는 몇 비트인가?
    3. 어느 쪽이 더 강력한 비밀번호인가?
    4. 공격자가 초당 10,000개의 비밀번호를 추측할 수 있다고 가정할 때, 각 비밀번호를 알아내는 데 평균적으로 얼마나 걸릴까?
2. **암호학적 해시 함수.** [미러 사이트](https://www.debian.org/CD/http-ftp/)(예: [아르헨티나 미러](http://debian.xfree.com.ar/debian-cd/current/amd64/iso-cd/))에서 Debian 이미지를 다운로드하라. 공식 Debian 사이트에서 제공하는 해시값(예: 아르헨티나 미러에서 받은 파일이라면 `debian.org`에 게시된 [이 파일](https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/SHA256SUMS))과 여러분이 다운로드한 파일의 해시(`sha256sum` 명령어 등 사용)를 대조해 보라.
3. **대칭 암호학.** [OpenSSL](https://www.openssl.org/)을 사용하여 파일을 AES로 암호화하라: `openssl aes-256-cbc -salt -in {입력 파일명} -out {출력 파일명}`. `cat`이나 `hexdump`로 파일 내용을 확인해 보라. `openssl aes-256-cbc -d -in {입력 파일명} -out {출력 파일명}`으로 복호화하고 `cmp` 명령어를 사용하여 원본 파일과 일치하는지 확인하라.
4. **비대칭 암호학.**
    1. 접근 가능한 컴퓨터에 [SSH 키](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2)를 설정하라 (Athena는 Kerberos와 SSH 키가 복잡하게 얽히므로 제외하라). 개인키가 암호 문구로 암호화되어 디스크에서 안전하게 보호되는지 확인하라.
    2. [GPG를 설정하라](https://www.digitalocean.com/community/tutorials/how-to-use-gpg-to-encrypt-and-sign-messages).
    3. Anish에게 암호화된 이메일을 보내보라 ([공개키](https://keybase.io/anish)).
    4. `git commit -S`로 Git 커밋에 서명하거나 `git tag -s`로 서명된 Git 태그를 생성하라. `git show --show-signature`로 커밋 서명을, `git tag -v`로 태그 서명을 검증해 보라.
EOF
