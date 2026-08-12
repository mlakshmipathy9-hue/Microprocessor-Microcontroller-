with open("src/components/PinConfigurationSimulator.tsx", "r", encoding="utf-8") as f:
    code = f.read()

lines = code.split("\n")
print("Line 61 ends with:", repr(lines[60][-10:]))
if lines[60].endswith("`'"):
    lines[60] = lines[60][:-1]
    print("Fixed line 61 end!")

code = "\n".join(lines)
with open("src/components/PinConfigurationSimulator.tsx", "w", encoding="utf-8") as f:
    f.write(code)
