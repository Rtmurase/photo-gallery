---
layout: default
title: Photos
permalink: /rm/
---

<div class="home-page">
  <div class="container">
    <header class="page-header">
      <h1 class="page-title">Photos</h1>
      <p class="page-subtitle">A collection of moments captured around the world</p>
    </header>

    <div class="albums-container">
      {% assign sorted_albums = site.albums | sort: 'date' | reverse %}
      {% for album in sorted_albums %}
        {% include album-card.html album=album %}
      {% endfor %}
    </div>
  </div>
</div> 