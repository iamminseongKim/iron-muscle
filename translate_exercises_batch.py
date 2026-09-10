import re
import urllib.request
import urllib.parse
import json
import time
import sys

def translate_batch(texts):
    if not texts: return []
    # Join with a unique delimiter that translate won't mess up too badly, like double newlines or ' | '
    # Better yet, send as a single string separated by '\n---\n'
    combined = '\n###\n'.join(texts)
    
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=" + urllib.parse.quote(combined)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    for _ in range(3):
        try:
            response = urllib.request.urlopen(req)
            data = json.loads(response.read().decode('utf-8'))
            res_combined = ''.join(item[0] for item in data[0])
            # Google Translate sometimes adds spaces around ###
            res_combined = re.sub(r'\n\s*#\s*#\s*#\s*\n', '\n###\n', res_combined)
            res = res_combined.split('\n###\n')
            if len(res) == len(texts):
                return [r.strip() for r in res]
            else:
                # Fallback if split fails due to formatting issues
                print("Fallback to individual translation for batch due to length mismatch")
                return [translate_single(t) for t in texts]
        except Exception as e:
            time.sleep(1)
    return [translate_single(t) for t in texts]

def translate_single(text):
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=" + urllib.parse.quote(text)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        return ''.join(item[0] for item in data[0])
    except:
        return text

with open("src/data/exercises.ts", "r") as f:
    text = f.read()

matches = set(re.findall(r'"description":\s*"([^"]+)"', text))
matches.update(re.findall(r'"instructions":\s*\[\s*(.*?)\s*\]', text, flags=re.DOTALL))
matches.update(re.findall(r'"tips":\s*\[\s*(.*?)\s*\]', text, flags=re.DOTALL))

strings_to_translate = set()

for m in matches:
    if m.startswith('"'):
        for s in re.findall(r'"([^"]+)"', m):
            if not any('\uac00' <= char <= '\ud7a3' for char in s) and len(s) > 3:
                strings_to_translate.add(s)
    else:
        if not any('\uac00' <= char <= '\ud7a3' for char in m) and len(m) > 3:
            strings_to_translate.add(m)

str_list = list(strings_to_translate)
print(f"Found {len(str_list)} strings to translate.", flush=True)

trans_dict = {}
BATCH_SIZE = 20

for i in range(0, len(str_list), BATCH_SIZE):
    batch = str_list[i:i+BATCH_SIZE]
    results = translate_batch(batch)
    for j, s in enumerate(batch):
        trans_dict[s] = results[j].replace('"', "'")
    if i % 100 == 0:
        print(f"Translated {min(i+BATCH_SIZE, len(str_list))}/{len(str_list)}...", flush=True)

new_text = text
for eng, kor in trans_dict.items():
    new_text = new_text.replace(f'"{eng}"', f'"{kor}"')

with open("src/data/exercises.ts", "w") as f:
    f.write(new_text)

print("Translation completed and saved.", flush=True)
