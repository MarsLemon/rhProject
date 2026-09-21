import re, sys
with open('/tmp/trending.html','r',encoding='utf-8') as f:
    html = f.read()
articles = re.findall(r'<article[^>]*class="Box-row"[^>]*>(.*?)</article>', html, re.S)
print('articles:', len(articles))
for a in articles:
    repo = re.search(r'<h2[^>]*>\s*<a[^>]*href="([^"]+)"', a)
    desc = re.search(r'<p class="col-9[^"]*">(.*?)</p>', a, re.S)
    stars_today = re.search(r'(\d+(?:,\d+)*)\s+stars today', a)
    total = re.search(r'/stargazers"[^>]*>\s*<svg[^>]*></svg>\s*([\d,]+)', a, re.S)
    if not total:
        total = re.search(r'/stargazers"[^>]*>\s*([\d,]+)', a)
    lang = re.search(r'itemprop="programmingLanguage">([^<]+)</span>', a)
    repo_path = repo.group(1).strip() if repo else '?'
    desc_text = re.sub(r'<[^>]+>','',desc.group(1)).strip() if desc else ''
    print('---')
    print(repo_path)
    print('DESC:', desc_text)
    print('TODAY:', stars_today.group(1) if stars_today else '?')
    print('TOTAL:', total.group(1) if total else '?')
    print('LANG:', lang.group(1).strip() if lang else '?')