with open('src/components/PinConfigurationSimulator.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

lines = code.split('\n')
for idx, line in enumerate(lines, 1):
    if len(line) > 1000:
        for pos in range(0, len(line), 5000):
            prefix = line[:pos]
            parens = 0
            braces = 0
            brackets = 0
            in_string = None
            for i, char in enumerate(prefix):
                if in_string:
                    if char == in_string and (i == 0 or prefix[i-1] != '\\'):
                        in_string = None
                else:
                    if char in ('"', "'", '`'):
                        in_string = char
                    elif char == '(':
                        parens += 1
                    elif char == ')':
                        parens -= 1
                    elif char == '{':
                        braces += 1
                    elif char == '}':
                        braces -= 1
                    elif char == '[':
                        brackets += 1
                    elif char == ']':
                        brackets -= 1
            print(f"Line {idx} Pos {pos}: string={in_string}, parens={parens}, braces={braces}, brackets={brackets}")
