import re
import urllib.request
import urllib.parse
import json
import time

def translate(text):
    if not text.strip(): return text
    if any('\uac00' <= char <= '\ud7a3' for char in text): return text
    if len(text) < 3: return text
    
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=" + urllib.parse.quote(text)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    for _ in range(3):
        try:
            response = urllib.request.urlopen(req)
            data = json.loads(response.read().decode('utf-8'))
            return ''.join(item[0] for item in data[0])
        except Exception as e:
            time.sleep(1)
    return text

with open("src/data/exercises.ts", "r") as f:
    text = f.read()

# We need to find strings inside "description": "...", "instructions": ["..."], "tips": ["..."]
# A safer way is to use regex to find English sentences.
# Let's find all strings enclosed in double quotes that look like English sentences.
# Pattern: "([A-Z][a-z]+ [^"]+)"
# Wait, this might match keys or random things. Let's strictly match:
# "description": "..."
# "instructions": [\n "...", \n "..." \n ]
# "tips": [\n "..." \n ]

# Let's extract all string values for these specific keys
# Since the JSON is formatted with indentation, we can match:
# `"description": "(.+?)"`
matches = set(re.findall(r'"description":\s*"([^"]+)"', text))
# instructions and tips can have multiple elements
matches.update(re.findall(r'"instructions":\s*\[\s*(.*?)\s*\]', text, flags=re.DOTALL))
matches.update(re.findall(r'"tips":\s*\[\s*(.*?)\s*\]', text, flags=re.DOTALL))

strings_to_translate = set()

for m in matches:
    if m.startswith('"'):
        # It's an array of strings, split by comma and extract
        for s in re.findall(r'"([^"]+)"', m):
            if not any('\uac00' <= char <= '\ud7a3' for char in s) and len(s) > 3:
                strings_to_translate.add(s)
    else:
        # It's a description string
        if not any('\uac00' <= char <= '\ud7a3' for char in m) and len(m) > 3:
            strings_to_translate.add(m)

print(f"Found {len(strings_to_translate)} strings to translate.")

# We will build a translation dictionary
trans_dict = {}
count = 0
for s in strings_to_translate:
    trans_dict[s] = translate(s).replace('"', "'")  # replace double quotes to avoid breaking JSON
    count += 1
    if count % 100 == 0:
        print(f"Translated {count}/{len(strings_to_translate)}...")

# Now replace in the original text
new_text = text
for eng, kor in trans_dict.items():
    new_text = new_text.replace(f'"{eng}"', f'"{kor}"')

with open("src/data/exercises.ts", "w") as f:
    f.write(new_text)

print("Translation completed and saved.")
