---
layout: page
title: "2026 강의 (한국어)"
description: >
  MIT IAP 2026 Missing Semester 강의 노트 및 영상 (한국어 번역)
permalink: /2026_kr/
phony: true
---

<ul class="double-spaced">
  {% assign lectures = site['2026_kr'] | sort: 'date' %}
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
