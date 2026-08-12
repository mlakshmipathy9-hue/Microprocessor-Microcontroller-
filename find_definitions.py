with open('dist/assets/index-RIlypKJO.js', 'r', encoding='utf-8') as f:
    content = f.read()

vars_to_find = ['Cp', 'Dn', 'Ep', 'Gr', 'Jd', 'Mn', 'Uv', 'Wd', 'Yd', 'Zd', '_p', 'dl', 'es', 'gt', 'il', 'mt', 'no', 'vs']

for var in vars_to_find:
    # Look for "function var(" or "const var =" or "var ="
    # Let's search for definitions
    import re
    matches = list(re.finditer(r'\bfunction\s+' + var + r'\b|\bconst\s+' + var + r'\b', content))
    print(f"Variable: {var}")
    for m in matches:
        print(f"  Found definition at {m.start()}:")
        print("  " + content[m.start():m.start() + 200])
        print("-" * 30)
