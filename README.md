# Госпіталь ветеранів ім. Юрія Липи — концепт нового сайту

Статичний сайт (HTML/CSS/vanilla JS) на реальних даних з hospital-veterans.lviv.ua.

Опубліковано: https://i7aket.github.io/hospital-veterans-concept/ (концепт, не офіційний сайт; `noindex`).
Деплой — `.github/workflows/pages.yml` після мержу в `main`.

- `site/` — сам сайт. Локально: `cd site && python3 -m http.server 8909`.
- `site/data/*.json` — відділення, персонал, новини, ціни, документи; генеруються з WordPress.
- `tools/fetch.sh` — оновити сирі дані з живого сайту (REST API + кілька відрендерених сторінок).
- `tools/extract.py` — зібрати `site/data/*.json` з `tools/raw/`.
