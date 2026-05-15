import os
import json
import re

docs_dir = 'docs'
chapters = [d for d in os.listdir(docs_dir) if os.path.isdir(os.path.join(docs_dir, d)) and d.startswith('cap')]

for chapter in chapters:
    category_path = os.path.join(docs_dir, chapter, '_category_.json')
    
    if os.path.exists(category_path):
        with open(category_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Remove "Cap. X — " or "Cap. X — " from the label
        # Example: "Cap. 27 — Valores en la Frontera" -> "Valores en la Frontera"
        label = data.get('label', '')
        new_label = re.sub(r'^Cap\.\s*\d+\s*—\s*', '', label)
        
        # If the regex didn't match (maybe different dash or format), try a simpler one
        if new_label == label:
            new_label = re.sub(r'^Capitulo\s*\d+[:\s]*', '', label, flags=re.IGNORECASE)
            
        data['label'] = new_label
        
        with open(category_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Updated {len(chapters)} category files to remove 'Cap.' prefix from sidebar.")
