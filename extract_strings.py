import json
import re

with open("src/data/exercises.ts", "r") as f:
    text = f.read()

start_idx = text.find("  {\n    \"id\":")
end_idx = text.rfind("];")
json_text = "[\n" + text[start_idx:end_idx]

data = json.loads(json_text)

english_strings = set()

def is_english(s):
    if not isinstance(s, str): return False
    return not any('\uac00' <= char <= '\ud7a3' for char in s) and len(s) > 0

for item in data:
    desc = item.get("description", "")
    if is_english(desc): english_strings.add(desc)
    
    for inst in item.get("instructions", []):
        if is_english(inst): english_strings.add(inst)
        
    for tip in item.get("tips", []):
        if is_english(tip): english_strings.add(tip)

print("Total strings:", len(english_strings))
