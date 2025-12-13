from pathlib import Path
import re

imports = set()
pattern = re.compile(r'^\s*(?:from|import)\s+([a-zA-Z0-9_\.]+)', re.MULTILINE)

EXCLUDE_DIRS = {"venv", ".venv", "__pycache__", "site-packages", "tests"}

for file in Path(".").rglob("*.py"):
    if any(part in EXCLUDE_DIRS for part in file.parts):
        continue
    try:
        text = file.read_text(encoding="utf-8")
    except Exception:
        continue
    for match in pattern.findall(text):
        imports.add(match.split(".")[0])

print("\nIMPORTS REALES DE TU PROYECTO:\n")
for imp in sorted(imports):
    print(imp)
