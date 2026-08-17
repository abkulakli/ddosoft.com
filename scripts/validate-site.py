#!/usr/bin/env python3
"""Static checks for the DDOSoft site.

There is no build step and no test framework here, so this script is the whole
safety net. It runs on pull requests and before every deploy, and uses only the
standard library so it needs no install step.

Each check returns a list of problem strings. Any problem fails the run.

Run from the repository root:

    python3 scripts/validate-site.py
"""
import glob
import html
import html.parser
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

SITE = 'https://www.ddosoft.com'
LANGUAGES = ('en', 'tr')

# Attributes that hold a real URL. Written as a lookbehind so that
# data-lang-href — which holds a translation key, not a path — does not match.
URL_ATTR = re.compile(r'(?<![-\w])(?:href|src)="([^"]+)"')

VOID_ELEMENTS = {
    'meta', 'link', 'img', 'br', 'hr', 'input', 'source', 'area',
    'base', 'col', 'embed', 'param', 'track', 'wbr',
}


def html_files():
    return sorted(
        glob.glob('*.html')
        + glob.glob('components/*.html')
        + glob.glob('articles/*.html')
        + glob.glob('articles/*/*.html')
    )


def article_files():
    """Article pages: the ones that declare their own language."""
    return [f for f in html_files() if 'data-page-lang=' in read(f)]


def read(path):
    with open(path, encoding='utf-8') as handle:
        return handle.read()


class NestingChecker(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.problems = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID_ELEMENTS:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID_ELEMENTS:
            return
        if not self.stack:
            self.problems.append(f'stray closing </{tag}>')
        elif self.stack[-1] != tag:
            self.problems.append(f'</{tag}> closes while <{self.stack[-1]}> is open')
        else:
            self.stack.pop()


def check_html_nesting():
    problems = []
    for path in html_files():
        checker = NestingChecker()
        checker.feed(read(path))
        for problem in checker.problems:
            problems.append(f'{path}: {problem}')
        if checker.stack:
            problems.append(f'{path}: unclosed tags {checker.stack}')
    return problems


def load_languages():
    """Parse both language files, reporting rather than raising on bad JSON."""
    data, problems = {}, []
    for language in LANGUAGES:
        path = f'lang/{language}.json'
        try:
            data[language] = json.loads(read(path))
        except (OSError, json.JSONDecodeError) as error:
            problems.append(f'{path}: {error}')
    return data, problems


def lookup(tree, dotted_key):
    """Resolve 'articles.recent.0.link' against parsed JSON, or None."""
    current = tree
    for part in dotted_key.split('.'):
        if isinstance(current, list):
            try:
                current = current[int(part)]
            except (ValueError, IndexError):
                return None
        elif isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return None
    return current


def check_translation_keys(languages):
    """Every key used in markup must exist in BOTH language files.

    A key present in one language only renders as empty text for the other,
    which is invisible in review and obvious to a visitor.
    """
    problems = []
    for path in html_files():
        source = read(path)
        for attribute in ('data-lang-key', 'data-lang-href'):
            for key in re.findall(attribute + r'="([^"]+)"', source):
                for language, tree in languages.items():
                    if lookup(tree, key) is None:
                        problems.append(
                            f'{path}: {attribute}="{key}" missing from lang/{language}.json'
                        )
    return problems


def check_article_links(languages):
    """articles.recent[].link must point at a file that exists."""
    problems = []
    for language, tree in languages.items():
        for index, entry in enumerate(lookup(tree, 'articles.recent') or []):
            link = entry.get('link')
            if not link:
                problems.append(f'lang/{language}.json: articles.recent.{index} has no link')
            elif not os.path.exists(link):
                problems.append(
                    f'lang/{language}.json: articles.recent.{index}.link → {link} does not exist'
                )
    return problems


def check_relative_links():
    problems = []
    for path in html_files():
        # Component fragments are injected into pages at other depths, so their
        # links are authored root-relative and component-loader.js rewrites them
        # for the host page. Resolve them against the root, not components/.
        directory = '.' if path.startswith('components/') else (os.path.dirname(path) or '.')
        for url in URL_ATTR.findall(read(path)):
            if url.startswith(('http://', 'https://', 'mailto:', '#', 'data:')):
                continue
            bare = url.split('#')[0].split('?')[0]
            if not bare:
                continue
            target = bare.lstrip('/') if url.startswith('/') else os.path.normpath(
                os.path.join(directory, bare)
            )
            if not os.path.exists(target):
                problems.append(f'{path}: {url} → {target} does not exist')
    return problems


def article_metadata(path):
    """Canonical URL, hreflang alternates and JSON-LD types of an article page."""
    source = read(path)
    canonical = re.search(r'rel="canonical"\s+href="([^"]+)"', source)
    alternates = dict(
        (language, url) for language, url in
        re.findall(r'rel="alternate"\s+hreflang="([a-z-]+)"\s+href="([^"]+)"', source)
    )
    schema_types, schema_errors = [], []
    for block in re.findall(r'type="application/ld\+json">(.*?)</script>', source, re.S):
        try:
            schema_types.append(json.loads(block).get('@type'))
        except json.JSONDecodeError as error:
            schema_errors.append(str(error))
    return {
        'canonical': canonical.group(1) if canonical else None,
        'alternates': alternates,
        'schema_types': schema_types,
        'schema_errors': schema_errors,
        'source': source,
    }


def url_to_path(url):
    """Map a site URL back to the file that serves it."""
    return url.replace(SITE + '/', '').split('?')[0]


def check_article_seo():
    """Article pages own their SEO meta, so each must carry a complete set.

    language-manager.js deliberately leaves these alone when data-page-lang is
    present — nothing fills in a missing one at runtime.
    """
    problems = []
    articles = {}

    for path in article_files():
        meta = article_metadata(path)
        articles[path] = meta

        if not meta['canonical']:
            problems.append(f'{path}: no canonical link')
        elif url_to_path(meta['canonical']) != path:
            problems.append(
                f'{path}: canonical is {meta["canonical"]}, which is not this page'
            )

        for language in LANGUAGES + ('x-default',):
            if language not in meta['alternates']:
                problems.append(f'{path}: no hreflang="{language}" alternate')

        for url in meta['alternates'].values():
            if not url.startswith(SITE):
                problems.append(f'{path}: hreflang href is not absolute: {url}')

        if meta['schema_errors']:
            problems.append(f'{path}: invalid JSON-LD: {"; ".join(meta["schema_errors"])}')
        article_schemas = meta['schema_types'].count('Article')
        if article_schemas != 1:
            problems.append(f'{path}: expected exactly one Article schema, found {article_schemas}')

        if 'og:title' not in meta['source']:
            problems.append(f'{path}: no og:title')

    # Each side of a language pair must name the other.
    for path, meta in articles.items():
        canonical = meta['canonical']
        for language, url in meta['alternates'].items():
            if language == 'x-default' or url == canonical:
                continue
            sibling = url_to_path(url)
            sibling_meta = articles.get(sibling)
            if sibling_meta is None:
                problems.append(f'{path}: hreflang="{language}" → {sibling} is not an article page')
            elif canonical not in sibling_meta['alternates'].values():
                problems.append(f'{path}: {sibling} does not link back (hreflang not reciprocal)')

    return problems


def check_sitemap():
    problems = []
    try:
        root = ET.parse('sitemap.xml').getroot()
    except (OSError, ET.ParseError) as error:
        return [f'sitemap.xml: {error}']

    namespace = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    locations = {element.text for element in root.iter(f'{namespace}loc')}

    for path in article_files():
        canonical = article_metadata(path)['canonical']
        if canonical and canonical not in locations:
            problems.append(f'sitemap.xml: missing {canonical} (from {path})')

    return problems


def check_article_body_is_static():
    """Article prose must be in the HTML, not injected by JavaScript.

    This is the entire reason article pages differ from the rest of the site:
    crawlers that don't run JS — link previews in particular — have to see the
    text. A page that lost its body to a refactor would still look fine in a
    browser, so assert on the served bytes.
    """
    problems = []
    for path in article_files():
        body = re.search(r'article__body(.*?)</div>\s*<footer', read(path), re.S)
        if not body:
            problems.append(f'{path}: no article__body block found')
            continue
        words = len(html.unescape(re.sub(r'<[^>]+>', ' ', body.group(1))).split())
        if words < 400:
            problems.append(f'{path}: only {words} words of static prose (expected 400+)')
    return problems


def main():
    if not os.path.exists('index.html'):
        print('error: run this from the repository root', file=sys.stderr)
        return 2

    languages, language_problems = load_languages()

    checks = [
        ('language files parse', lambda: language_problems),
        ('HTML nesting', check_html_nesting),
        ('translation keys present in both languages', lambda: check_translation_keys(languages)),
        ('article links in language files resolve', lambda: check_article_links(languages)),
        ('relative links and assets resolve', check_relative_links),
        ('article SEO metadata complete and reciprocal', check_article_seo),
        ('article prose is in the HTML', check_article_body_is_static),
        ('sitemap covers every article', check_sitemap),
    ]

    failed = 0
    for label, check in checks:
        problems = check()
        print(f'{"FAIL" if problems else "ok  "}  {label}')
        for problem in problems:
            print(f'        {problem}')
        failed += len(problems)

    print()
    if failed:
        print(f'{failed} problem(s) found')
        return 1
    print('all checks passed')
    return 0


if __name__ == '__main__':
    sys.exit(main())
