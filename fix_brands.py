import re

with open("src/data/exercises.ts", "r") as f:
    text = f.read()

# Brands to remove
brands = ["해머스트렝스", "Hammer Strength", "싸이벡스", "Cybex", "파나타", "Panatta", "아스널 스트렝스", "Arsenal Strength", "뉴텍", "NewTech", "테크노짐", "Technogym", "짐레코", "Gymleco", "라이프피트니스", "Life Fitness", "매트릭스", "Matrix", "아스날", "프리모션", "Precor", "프리코", "호이스트", "Hoist"]

def remove_brands(s):
    res = s
    for b in brands:
        res = re.sub(r'(?i)' + re.escape(b) + r'[\s\-]*', '', res)
        # also remove things like "플레이트 아이소 " "아이소래터럴" which are hammer strength specifics?
        # Maybe just the brands is enough.
    return res.strip()

# We need to replace "name": "...", "nameEn": "...", and remove "defaultBrand": "..."
# Since it's a huge file, let's just do line by line regex replacement for name and nameEn
# and completely remove defaultBrand lines.
lines = text.split('\n')
new_lines = []
for line in lines:
    if '"defaultBrand"' in line:
        continue # remove this line entirely
    
    # Check name and nameEn
    if '"name":' in line or '"nameEn":' in line:
        # extract the value
        m = re.search(r'("name(?:En)?":\s*")([^"]+)(".*)', line)
        if m:
            prefix = m.group(1)
            val = m.group(2)
            suffix = m.group(3)
            new_val = remove_brands(val)
            # fix double spaces if any
            new_val = re.sub(r'\s+', ' ', new_val)
            # fix leading/trailing spaces
            new_val = new_val.strip()
            line = line[:m.start()] + prefix + new_val + suffix
    new_lines.append(line)

with open("src/data/exercises.ts", "w") as f:
    f.write('\n'.join(new_lines))

print("Brand names removed.")
