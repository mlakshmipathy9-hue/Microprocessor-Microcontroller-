with open('dist/assets/index-RIlypKJO.js', 'r', encoding='utf-8') as f:
    content = f.read()

start = max(0, 870961 - 500)
end = min(len(content), 870961 + 1000)
print(content[start:end])
