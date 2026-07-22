from pathlib import Path
import json
import re

src = Path("engine/fullMoons.js")   # <-- verify capitalization

text = src.read_text(encoding="utf-8")

# Find the beginning of the object
start = text.find("export const FULL_MOONS =")
if start == -1:
    raise RuntimeError("Couldn't find FULL_MOONS")

text = text[start:]
text = text.replace("export const FULL_MOONS =", "", 1).strip()

if text.endswith(";"):
    text = text[:-1].strip()

data = json.loads(text)

for year, moons in data.items():
    for moon in moons:
        moon.pop("number", None)
        moon.pop("name", None)

output = (
    "//==========================================================\n"
    "//\n"
    "// RAW ASTRONOMICAL FULL MOONS\n"
    "// Generated automatically.\n"
    "// DO NOT EDIT.\n"
    "//==========================================================\n\n"
    "export const FULL_MOONS = "
    + json.dumps(data, indent=4)
    + ";\n"
)

src.write_text(output, encoding="utf-8")

print("Done.")