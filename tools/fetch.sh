#!/bin/sh
# Refresh the dumps used by tools/extract.py. Run from the project root, then: cd tools && python3 extract.py
set -e
B=https://hospital-veterans.lviv.ua/wp-json/wp/v2
UA="Mozilla/5.0 Chrome/140"
curl -s -A "$UA" "$B/pages?per_page=100&_fields=id,slug,title,content,featured_media,link" -o tools/raw/pages-full.json
for i in 1 2 3 4 5 6 7 8 9 10; do
  curl -s -A "$UA" "$B/posts?per_page=10&page=$i&_embed=wp:featuredmedia&_fields=id,slug,title,date,link,excerpt,content,_links,_embedded" -o tools/raw/posts-$i.json
done
# rendered pages: TablePress price tables and document links are not in the REST content
for s in platni-poslugy platni-poslugy-kardioczentr publichna-informacziya; do
  curl -sL -A "$UA" "https://hospital-veterans.lviv.ua/$s/" -o "tools/raw/html-$s.html"
done
# photos referenced by [vc_single_image]/[vc_images_carousel] shortcodes (media ids -> urls)
python3 - <<'PY'
import html, json, re, subprocess
ids = sorted({i for p in json.load(open('tools/raw/pages-full.json'))
              for a in re.findall(r'(?:image|images)=["”″]([\d,]+)', html.unescape(p['content']['rendered']))
              for i in a.split(',')}, key=int)
out = []
for k in range(0, len(ids), 100):
    url = 'https://hospital-veterans.lviv.ua/wp-json/wp/v2/media?per_page=100&_fields=id,source_url,media_details&include=' + ','.join(ids[k:k + 100])
    out += json.loads(subprocess.check_output(['curl', '-s', '-A', 'Mozilla/5.0 Chrome/140', url]))
json.dump(out, open('tools/raw/media.json', 'w'), ensure_ascii=False)
PY
