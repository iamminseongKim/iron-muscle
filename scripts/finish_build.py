import json
import os
import sys

sys.path.append(os.path.abspath('scripts'))
from build_db import exercises

header = "import { Exercise } from '../types/workout';\n\nexport const EXERCISES_DATABASE: Exercise[] = "
content = header + json.dumps(exercises, indent=2, ensure_ascii=False) + ";\n"

with open('src/data/exercises.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Generated {len(exercises)} exercises into src/data/exercises.ts successfully!")
