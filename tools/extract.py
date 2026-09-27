"""Turn the WordPress REST dumps in tools/raw/ into the JSON the static site reads (site/data/).

Run: cd tools && python3 extract.py
Refresh the dumps first with tools/fetch.sh when the live site changes.
"""
import base64
import glob
import html
import json
import re
import urllib.parse

RAW, OUT = "raw/", "../site/data/"


def unb64(h):
    # WPBakery "raw html" blocks are base64(urlencoded html)
    def dec(m):
        try:
            return urllib.parse.unquote(base64.b64decode(m.group(0)).decode())
        except Exception:
            return m.group(0)
    return re.sub(r'JT[A-Za-z0-9+/=]{16,}', dec, h)


def clean(s):
    s = html.unescape(re.sub(r'<[^>]+>', ' ', s))
    s = re.sub(r'\[/?vc_[^\]]*\]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def paragraphs(h):
    """Readable text blocks, in order, without stats/staff/shortcode noise."""
    h = unb64(h)
    h = re.sub(r'<(script|style)\b.*?</\1>', '', h, flags=re.S)
    h = re.sub(r'<div class="tm-fid.*?<!-- .tm-fld-contents -->', '', h, flags=re.S)       # counters
    h = re.sub(r'<div class="thememount-team-wrapper.*', '', h, flags=re.S)                 # staff grid (always last)
    h = re.sub(r'\[vc_cta[^\]]*h2="([^"]*)"[^\]]*\]', r'<h2>\1</h2>', html.unescape(h))    # CTA headings
    out = []
    for tag, body in re.findall(r'<(h[1-6]|p|li)\b[^>]*>(.*?)</\1>', h, flags=re.S):
        t = clean(body)
        if len(t) < 2 or t.startswith('[') or 'vc_custom' in t:
            continue
        kind = 'h' if tag[0] == 'h' else ('li' if tag == 'li' else 'p')
        out += [[kind, part] for part in (split_long(t) if kind == 'p' else [t])]
    # drop consecutive duplicates (theme repeats headings)
    return [x for i, x in enumerate(out) if i == 0 or x != out[i - 1]]


def stats(h):
    return [[int(v), clean(l)] for v, l in re.findall(
        r'data-to="(\d+)".*?</h4>\s*<h3>(.*?)</h3>', h, flags=re.S)]


def staff(h):
    people = []
    for box in h.split('<div class="thememount-team-box">')[1:]:
        img = re.search(r'<img[^>]+src="([^"]+)"', box)
        name = re.search(r'thememount-team-title">(.*?)</h3>', box, flags=re.S)
        role = re.search(r'thememount-team-position">(.*?)</h4>', box, flags=re.S)
        if name:
            people.append({'name': clean(name.group(1)), 'role': clean(role.group(1)) if role else '',
                           'photo': img.group(1) if img else ''})
    return people


MEDIA = {}
for m in json.load(open(RAW + 'media.json')):
    sizes = (m.get('media_details') or {}).get('sizes') or {}
    MEDIA[str(m['id'])] = (sizes.get('large') or sizes.get('full') or {}).get('source_url', m['source_url'])


def images(h):
    """Content photos, not staff portraits: <img> tags plus WPBakery image shortcodes (by media id)."""
    h = html.unescape(re.sub(r'<div class="thememount-team-wrapper.*', '', h, flags=re.S))
    urls = [u for u in re.findall(r'<img[^>]+src="([^"]+)"', h) if '/uploads/' in u]
    for ids in re.findall(r'\[vc_(?:single_image|images_carousel)[^\]]*?(?:image|images)=["”″]([\d,]+)', h):
        urls += [MEDIA[i] for i in ids.split(',') if i in MEDIA]
    return list(dict.fromkeys(urls))


def split_long(text, limit=520):
    """Break walls of text into paragraphs of a few sentences."""
    if len(text) <= limit:
        return [text]
    out, cur = [], ''
    for sent in re.split(r'(?<=[.!?])\s+(?=[А-ЯІЇЄҐA-Z])', text):
        if cur and len(cur) + len(sent) > limit:
            out.append(cur.strip())
            cur = ''
        cur += sent + ' '
    return out + [cur.strip()] if cur.strip() else out


def phones(h):
    seen = []
    for t in re.findall(r'href="tel:([^"]+)"', unb64(h)):
        t = re.sub(r'[^\d+]', '', t)
        if t not in seen:
            seen.append(t)
    return seen


# which section of the catalog a department belongs to
GROUPS = [
    ('Невідкладна допомога', r'ekstrenoyi|anesteziolog'),
    ('Поліклініка', r'poliklinika|poliklin'),
    ('Реабілітація', r'reabilit|fizychnoyi'),
    ('Хірургія', r'hirurg|ortoped|kistkovo|termichnoyi|golovy|artrolog'),
    ('Діагностика', r'rentgen|endoskop|laborator|intervencz'),
    ('Терапія та неврологія', r'terapevt|endokryn|cardio|kardio|nevrolog|insult|psyhosomat'),
]
NOT_DEPARTMENTS = {'platni-poslugy', 'platni-poslugy-kardioczentr', 'publichna-informacziya', 'publichna-oferta',
                   'novyny', 'kontakty', 'front-page', 'zapys-na-poslugy-za-programoyu-pmg',
                   'programa-interreg-next-polshha-ukrayina-2021-2027', 'administracziya-gospitalyu',
                   'kardiologichnyj-czentr'}

pages = {p['slug']: p for p in json.load(open(RAW + 'pages-full.json'))}

departments = []
for slug, p in pages.items():
    if slug in NOT_DEPARTMENTS:
        continue
    h = p['content']['rendered']
    group = next((g for g, rx in GROUPS if re.search(rx, slug)), 'Інше')
    departments.append({
        'slug': slug, 'name': clean(p['title']['rendered']), 'group': group,
        'stats': stats(h), 'text': paragraphs(h), 'staff': staff(h),
        'photos': images(h), 'phones': phones(h),
    })
departments.sort(key=lambda d: (d['group'], d['name']))

admin = staff(pages['administracziya-gospitalyu']['content']['rendered'])

special = {s: {'title': clean(pages[s]['title']['rendered']), 'text': paragraphs(pages[s]['content']['rendered']),
               'photos': images(pages[s]['content']['rendered']), 'phones': phones(pages[s]['content']['rendered']),
               'links': sorted(set(re.findall(r'href="(https?://[^"]+)"', unb64(pages[s]['content']['rendered']))))}
           for s in ['kardiologichnyj-czentr', 'kontakty', 'zapys-na-poslugy-za-programoyu-pmg', 'platni-poslugy',
                     'platni-poslugy-kardioczentr', 'publichna-informacziya',
                     'programa-interreg-next-polshha-ukrayina-2021-2027']}

posts = []
for f in sorted(glob.glob(RAW + 'posts-*.json')):
    posts += json.load(open(f))
news = []
for x in posts:
    media = (x.get('_embedded') or {}).get('wp:featuredmedia') or [{}]
    m = media[0] if media else {}
    sizes = (m.get('media_details') or {}).get('sizes') or {}
    news.append({
        'slug': x['slug'], 'date': x['date'][:10], 'title': clean(x['title']['rendered']),
        'excerpt': clean(x['excerpt']['rendered']).replace('Читати далі', '').strip(),
        'image': m.get('source_url', ''),
        'thumb': (sizes.get('medium_large') or sizes.get('large') or {}).get('source_url', m.get('source_url', '')),
        'text': paragraphs(x['content']['rendered']), 'photos': images(x['content']['rendered']),
    })
news.sort(key=lambda n: n['date'], reverse=True)

for name, data in [('departments', departments), ('admin', admin), ('pages', special), ('news', news)]:
    json.dump(data, open(OUT + name + '.json', 'w'), ensure_ascii=False, indent=1)
    print(name, len(data))


# ---- rendered-page extras (tools/raw/html-*.html, fetched by tools/fetch.sh) ----

def tx(x):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', x))).strip()


def price_tabs(fn):
    """TablePress tabs: [{title, phone, rows: [[service, price] | [subheading]]}]"""
    s = open(RAW + fn).read()
    body = s[s.find('повний перелік'):]
    titles = [tx(t) for t in re.findall(r'vc_tta-title-text">(.*?)</span>', body, flags=re.S)]
    titles = titles[len(titles) // 2:]           # tab strip + accordion repeat the same titles
    tables = re.findall(r'<table\b.*?</table>', body, flags=re.S)
    phones = re.findall(r'posluhy_title.*?href="tel:([^"]+)"', body, flags=re.S)
    tabs = []
    for i, t in enumerate(tables):
        rows = [[tx(c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, flags=re.S)]
                for r in re.findall(r'<tr[^>]*>(.*?)</tr>', t, flags=re.S)]
        rows = [r for r in rows[1:] if any(r)]   # drop the "Послуга | Вартість" header
        tabs.append({'title': titles[i] if i < len(titles) else '', 'phone': phones[i] if i < len(phones) else '',
                     'rows': [[r[0], r[1].replace('.', ',')] if len(r) > 1 and r[1] else [r[0]] for r in rows]})
    return tabs


prices = {'hospital': price_tabs('html-platni-poslugy.html'), 'cardio': price_tabs('html-platni-poslugy-kardioczentr.html')}
json.dump(prices, open(OUT + 'prices.json', 'w'), ensure_ascii=False, indent=1)
print('prices', sum(len(t['rows']) for v in prices.values() for t in v), 'rows')

s = open(RAW + 'html-publichna-informacziya.html').read()
s = s[s.find('entry-content'):s.find('<footer')]
docs = [{'title': tx(t), 'url': html.unescape(u)} for u, t in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', s, flags=re.S)
        if tx(t) and not u.startswith('#') and 'tel:' not in u]
json.dump(docs, open(OUT + 'docs.json', 'w'), ensure_ascii=False, indent=1)
print('docs', len(docs))
