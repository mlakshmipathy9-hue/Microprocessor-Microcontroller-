with open('dist/assets/index-RIlypKJO.js', 'r', encoding='utf-8') as f:
    content = f.read()

jw_start = content.find('jw={minimum:')
print("Around jw={minimum:")
print(content[jw_start - 200:jw_start + 200])
