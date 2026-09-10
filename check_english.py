import json
import re

with open("src/data/exercises.ts", "r") as f:
    text = f.read()

start_idx = text.find("[\n  {\n")
end_idx = text.rfind("];")
json_text = text[start_idx:end_idx].strip()
if not json_text.endswith("]"): json_text += "\n]"

data = json.loads(json_text)
eng_count = 0

def is_english(s):
    if not isinstance(s, str): return False
    return not any('\uac00' <= char <= '\ud7a3' for char in s) and len(s) > 3

for item in data:
    for key in ["description", "instructions", "tips"]:
        val = item.get(key)
        if isinstance(val, str):
            if is_english(val): eng_count += 1
        elif isinstance(val, list):
            for v in val:
                if is_english(v): eng_count += 1

print(f"Remaining English strings: {eng_count}")
