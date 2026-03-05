---
layout: page
title: "2020 강의"
description: >
  Missing Semester, MIT IAP 2020 강의 노트 및 비디오 (한국어 번역본)
permalink: /2020/kr/
phony: true
---

<ul class="double-spaced">
  {% assign lectures = site['2020_kr'] | sort: 'date' %}
  {% for lecture in lectures %}
    {% if lecture.phony != true %}
      <li>
        <strong>{{ lecture.date | date: '%-m/%d' }}</strong>:
        {% if lecture.ready %}
          <a href="{{ lecture.url }}">{{ lecture.title }}</a>
        {% elsif lecture.noclass %}
          {{ lecture.title }} [수업 없음]
        {% else %}
          {{ lecture.title }} [준비 중]
        {% endif %}
        {% if lecture.details %}
          <br>
          ({{ lecture.details }})
        {% endif %}
      </li>
    {% endif %}
  {% endfor %}
</ul>

강의 녹화본은 [YouTube](https://www.youtube.com/playlist?list=PLyzOVJj3bHQuloKGG59rS43e29ro7I57J)에서 시청할 수 있습니다.

# MIT를 넘어서 (Beyond MIT)

우리는 MIT 외부에서도 많은 분들이 이 리소스를 활용할 수 있도록 이 강의를 공유해 왔습니다. 다음 사이트들에서 관련 포스트와 토론을 찾아볼 수 있습니다.

 - [Hacker News](https://news.ycombinator.com/item?id=22226380)
 - [Lobsters](https://lobste.rs/s/ti1k98/missing_semester_your_cs_education_mit)
 - [/r/learnprogramming](https://www.reddit.com/r/learnprogramming/comments/eyagda/the_missing_semester_of_your_cs_education_mit/)
 - [/r/programming](https://www.reddit.com/r/programming/comments/eyagcd/the_missing_semester_of_your_cs_education_mit/)
 - [Twitter](https://twitter.com/jonhoo/status/1224383452591509507)
 - [YouTube](https://www.youtube.com/playlist?list=PLyzOVJj3bHQuloKGG59rS43e29ro7I57J)

# 감사 인사 (Acknowledgments)

강의 비디오 촬영을 가능하게 해주신 Elaine Mello, Jim Cain, 그리고 [MIT Open Learning](https://openlearning.mit.edu/)에 감사드립니다. 오디오/비디오 장비를 지원해주신 Anthony Zolnik과 [MIT AeroAstro](https://aeroastro.mit.edu/), 그리고 본 강의를 후원해주신 Brandi Adams와 [MIT EECS](https://www.eecs.mit.edu/)에도 깊은 감사를 표합니다.
EOF
