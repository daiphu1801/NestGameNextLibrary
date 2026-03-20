file_path = r'f:\NestGameNextLibrary\frontend\src\components\admin\layout\AdminSidebar.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(r'\n', '\n')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Fixed literal newlines in AdminSidebar.tsx")
