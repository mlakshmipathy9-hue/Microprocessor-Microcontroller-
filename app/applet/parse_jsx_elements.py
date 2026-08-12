import re

with open('src/components/PinConfigurationSimulator.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

line = code.split('\n')[60]
print("Line 61 length:", len(line))
print("Col 41350-41450:")
print(repr(line[41350:41450]))
