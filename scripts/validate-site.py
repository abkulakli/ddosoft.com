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
    )


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
    """Resolve 'products.zekky.title' against parsed JSON, or None."""
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


def url_to_path(url):
    """Map a site URL back to the file that serves it."""
    return url.replace(SITE + '/', '').split('?')[0]


def static_canonical(path):
    """Canonical URL written in a page's static <head>, or None."""
    found = re.search(r'rel="canonical"\s+href="([^"]+)"', read(path))
    return found.group(1) if found else None


def check_sitemap():
    problems = []
    try:
        root = ET.parse('sitemap.xml').getroot()
    except (OSError, ET.ParseError) as error:
        return [f'sitemap.xml: {error}']

    namespace = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    locations = {element.text for element in root.iter(f'{namespace}loc')}

    for path in sorted(glob.glob('*.html')):
        canonical = static_canonical(path)
        if canonical and canonical not in locations:
            problems.append(f'sitemap.xml: missing {canonical} (from {path})')

    # A page that was removed must not linger in the sitemap.
    for location in sorted(locations):
        if location.startswith(SITE + '/') and not os.path.exists(url_to_path(location) or 'index.html'):
            problems.append(f'sitemap.xml: {location} has no file behind it')

    return problems


# A percentage in either language's convention: English writes "20-30%",
# Turkish writes "%20-30". Missing the prefix form let a Turkish claim through
# the first version of this check.
PERCENTAGE = r'(?:%\s*\d+(?:\s*[-–]\s*\d+)?|\d+(?:\s*[-–]\s*\d+)?\s*%)'

# "power saving" and "güç tasarrufu" are the names of a mode, not a claim about
# savings, and both appear next to the threshold percentages the site
# legitimately discuss. Exclude them so only a real benefit claim matches.
BATTERY_WORDS = (
    r'(?:batter\w*|pil(?:\s+ömr\w*)?'
    r'|(?<!power )(?<!power-)(?<!güç )(?:saving\w*|tasarruf\w*))'
)
COVERAGE_WORDS = r'(?:coverage|kapsam\w*)'


def _near(first, second, distance=70):
    """Match either order, within one sentence-ish span."""
    return f'(?:{first}[^.<>]{{0,{distance}}}?{second}|{second}[^.<>]{{0,{distance}}}?{first})'


# Claims that were removed because nothing measures them. Each pattern stays
# narrow on purpose: the legitimate figures on this site must keep passing —
# the 0.70/0.30 hysteresis values the package actually installs, Portfonio's 83%
# query reduction (documented as 6+ queries down to 1), the 2,316 TEFAS funds,
# and the example thresholds discussed on the site.
FORBIDDEN_CLAIMS = (
    (
        re.compile(_near(BATTERY_WORDS, PERCENTAGE), re.I),
        'battery-savings percentage — no measurement in the ddogreen repo backs one',
    ),
    (
        # Allows intervening adjectives: "170 kapsamlı otomatik test".
        re.compile(r'\d[\d,.]*\s+(?:\w+\s+){0,3}tests?\b', re.I),
        'hard-coded test count — drifts with every commit; keep it qualitative',
    ),
    (
        re.compile(_near(COVERAGE_WORDS, PERCENTAGE, 20), re.I),
        'coverage percentage — drifts with every commit; keep it qualitative',
    ),
)


def check_no_unsubstantiated_claims():
    """Fail if a removed quantitative claim reappears in visitor-facing text.

    These were audited against the product repositories and removed because no
    measurement supported them. The check exists so they cannot drift back in
    through a copy edit — the site is the one place they would look plausible.
    """
    problems = []
    targets = html_files() + [f'lang/{language}.json' for language in LANGUAGES] + [
        'js/main.js', 'js/structured-data-manager.js'
    ]
    for path in targets:
        if not os.path.exists(path):
            continue
        for line_number, line in enumerate(read(path).splitlines(), 1):
            for pattern, reason in FORBIDDEN_CLAIMS:
                found = pattern.search(line)
                if found:
                    problems.append(
                        f'{path}:{line_number}: "{found.group().strip()}" — {reason}'
                    )
    return problems


GA_MEASUREMENT_ID = 'G-R6E0SJZXT0'


def check_analytics_tag():
    """Every page (components excluded) carries the Google tag exactly once, in <head>.

    The tag is pasted per page because there is no build step and a shared
    script would delay it; a page added later without it would silently drop
    out of the analytics.
    """
    problems = []
    loader = f'https://www.googletagmanager.com/gtag/js?id={GA_MEASUREMENT_ID}'
    config = f"gtag('config', '{GA_MEASUREMENT_ID}')"
    for path in html_files():
        if path.startswith('components/'):
            continue
        source = read(path)
        head = re.search(r'<head>(.*?)</head>', source, re.S)
        if not head:
            problems.append(f'{path}: no <head> found')
            continue
        for label, needle in (('gtag.js loader', loader), ('gtag config call', config)):
            count = head.group(1).count(needle)
            if count != 1:
                problems.append(f'{path}: {count} occurrences of the {label} in <head> (expected 1)')
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
        ('relative links and assets resolve', check_relative_links),
        ('no unsubstantiated quantitative claims', check_no_unsubstantiated_claims),
        ('sitemap covers every top-level page and lists no missing file', check_sitemap),
        ('Google tag present once in every page <head>', check_analytics_tag),
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
