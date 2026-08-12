#!/usr/bin/env bash
# Refresh the self-hosted webfonts from Google Fonts.
#
# Run this only when the typefaces or weights change. The files it writes are
# committed, and the app never talks to a font CDN at runtime.
#
# Google serves an HTML page rather than a font to user agents it does not
# recognise, so every download is checked for the woff2 magic number and a
# plausible size. A silent HTML file here looks exactly like a missing font on
# the page, which is a hard bug to spot from the outside.
set -euo pipefail
cd "$(dirname "$0")/.."

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
SPEC="family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap"

curl -sSf -A "$UA" "https://fonts.googleapis.com/css2?${SPEC}" -o /tmp/impactx-fonts.css

UA="$UA" python3 - <<'PY'
import hashlib, os, pathlib, re, subprocess, sys

ua = os.environ["UA"]
css = pathlib.Path("/tmp/impactx-fonts.css").read_text()
out = pathlib.Path("src/fonts")
out.mkdir(parents=True, exist_ok=True)
for old in out.glob("*.woff2"):
    old.unlink()

# Only the latin and latin-ext subsets: the app ships no copy in other scripts,
# and each extra subset is another file for every visitor to carry.
blocks = re.split(r"(?=/\*\s*[a-z-]+\s*\*/)", css)
keep = [b for b in blocks if re.match(r"/\*\s*(latin|latin-ext)\s*\*/", b.strip())]
if not keep:
    sys.exit("no latin subsets found in the stylesheet")

urls = {}
for block in keep:
    for url in re.findall(r"https://fonts\.gstatic\.com[^)]*", block):
        family = "fraunces" if "fraunces" in url else "inter"
        urls[url] = f"{family}-{hashlib.sha1(url.encode()).hexdigest()[:8]}.woff2"

for url, name in urls.items():
    target = out / name
    subprocess.run(["curl", "-sSf", "-A", ua, url, "-o", str(target)], check=True)
    head = target.read_bytes()[:4]
    size = target.stat().st_size
    if head != b"wOF2":
        sys.exit(f"{name} is not a woff2 file (starts with {head!r}) — check the user agent")
    if size < 5_000:
        sys.exit(f"{name} is only {size} bytes, which is too small to be a real font")
    print(f"  {name}  {size // 1024} KB")

local = "".join(keep)
for url, name in urls.items():
    local = local.replace(url, f"./fonts/{name}")

pathlib.Path("src/fonts.css").write_text(
    "/* Self-hosted Fraunces and Inter, latin and latin-ext only.\n"
    "   Bundled rather than fetched from a font CDN: one less third party, no\n"
    "   flash of fallback text, and nothing to block on a locked-down network.\n"
    "   Regenerate with scripts/fetch-fonts.sh. */\n" + local
)
print(f"wrote {len(urls)} font files")
PY
