import re

brands = ["해머스트렝스", "Hammer Strength", "싸이벡스", "Cybex", "파나타", "Panatta", "아스널 스트렝스", "Arsenal Strength", "뉴텍", "NewTech", "테크노짐", "Technogym", "짐레코", "Gymleco", "라이프피트니스", "Life Fitness", "매트릭스", "Matrix", "아스날", "프리모션", "Precor", "프리코", "호이스트", "Hoist"]

def remove_brands(s):
    res = s
    for b in brands:
        res = re.sub(r'(?i)' + re.escape(b) + r'[\s\-]*', '', res)
    return res.strip()

for filename in ["scripts/build_db.py", "scripts/add_more_machines.py"]:
    with open(filename, "r") as f:
        lines = f.read().split('\n')
    
    new_lines = []
    for line in lines:
        if "'defaultBrand':" in line or "defaultBrand:" in line:
            continue
        
        m1 = re.search(r"('name(?:En)?':\s*')([^']+)('.*)", line)
        m2 = re.search(r"(name(?:En)?:\s*)([a-zA-Z가-힣\s\-]+)(,.*)", line)
        if m1:
            val = m1.group(2)
            new_val = remove_brands(val)
            new_val = re.sub(r'\s+', ' ', new_val).strip()
            line = line[:m1.start()] + m1.group(1) + new_val + m1.group(3)
        elif m2 and 'def ' not in line and 'import ' not in line:
            val = m2.group(2)
            new_val = remove_brands(val)
            new_val = re.sub(r'\s+', ' ', new_val).strip()
            line = line[:m2.start()] + m2.group(1) + new_val + m2.group(3)
            
        new_lines.append(line)
        
    with open(filename, "w") as f:
        f.write('\n'.join(new_lines))

print("Brand names removed from python scripts.")
