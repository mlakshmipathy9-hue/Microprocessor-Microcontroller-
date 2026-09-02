import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Table,
  Code2,
  Copy,
  Check,
  Search,
  SlidersHorizontal,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Terminal,
  Clock,
  Compass,
  Cpu,
  Monitor,
  CheckCircle2
} from 'lucide-react';

export interface LcdCommandItem {
  hex: string;
  binary: string;
  name: string;
  category: 'init' | 'display' | 'shift' | 'addressing' | 'cgram';
  categoryLabel: string;
  delay: string;
  description: string;
  rs: string;
  rw: string;
  appNote: string;
  alp8BitSnippet: string;
  alp4BitSnippet: string;
  cCodeSnippet: string;
  isStandardLabCommand?: boolean;
}

export const LCD_COMMAND_LIST: LcdCommandItem[] = [
  {
    hex: '01H',
    binary: '0000 0001',
    name: 'Clear Display Screen',
    category: 'display',
    categoryLabel: 'Display & Clear',
    delay: '1.64 ms - 2.0 ms',
    description: 'Clears all display data by writing ASCII space (20H) to all 80 bytes of DDRAM. Sets the Address Counter (AC) to 00H (home position). If display shift is active, it resets shift to original position.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Mandatory in Exp 12A & 12B initialization. Must be followed by a minimum 2.0 ms delay subroutine before sending further commands.',
    alp8BitSnippet: 'MOV A, #01H\nACALL LCD_CMD\nACALL DELAY_2MS',
    alp4BitSnippet: 'MOV A, #01H\nACALL LCD_CMD_4BIT\nACALL DELAY_2MS',
    cCodeSnippet: 'lcd_cmd(0x01);\ndelay_ms(2);',
    isStandardLabCommand: true
  },
  {
    hex: '02H',
    binary: '0000 0010',
    name: 'Return Cursor to Home (00H)',
    category: 'display',
    categoryLabel: 'Display & Clear',
    delay: '1.64 ms - 2.0 ms',
    description: 'Sets Address Counter (AC) to 00H and returns the cursor to the first character cell of Line 1. Unlike 01H, this command preserves all existing text in DDRAM without clearing it.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Useful when rewriting headers or updating cyclic real-time sensor values from the beginning of the display.',
    alp8BitSnippet: 'MOV A, #02H\nACALL LCD_CMD\nACALL DELAY_2MS',
    alp4BitSnippet: 'MOV A, #02H\nACALL LCD_CMD_4BIT\nACALL DELAY_2MS',
    cCodeSnippet: 'lcd_cmd(0x02);\ndelay_ms(2);'
  },
  {
    hex: '04H',
    binary: '0000 0100',
    name: 'Entry Mode: Auto-Decrement Cursor',
    category: 'display',
    categoryLabel: 'Entry Mode',
    delay: '40 µs',
    description: 'Configures entry mode with I/D=0 (decrement) and S=0 (no display shift). Cursor moves left after each character write (Right-to-Left writing).',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Used for Arabic/Hebrew script rendering or right-aligned numeric countdown displays.',
    alp8BitSnippet: 'MOV A, #04H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #04H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x04);'
  },
  {
    hex: '05H',
    binary: '0000 0101',
    name: 'Entry Mode: Auto-Decrement & Shift Display Right',
    category: 'display',
    categoryLabel: 'Entry Mode',
    delay: '40 µs',
    description: 'Configures I/D=0 and S=1. Shifts the entire display window to the right with each subsequent character write.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Special scrolling effect with rightward character displacement.',
    alp8BitSnippet: 'MOV A, #05H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #05H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x05);'
  },
  {
    hex: '06H',
    binary: '0000 0110',
    name: 'Entry Mode: Auto-Increment Cursor (Standard L-to-R)',
    category: 'display',
    categoryLabel: 'Entry Mode',
    delay: '40 µs',
    description: 'Sets I/D=1 (increment address counter) and S=0 (no display shift). The cursor automatically advances rightwards by 1 column after every byte written to DDRAM.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Standard operating mode for normal left-to-right English text rendering in Exp 12A and Exp 12B.',
    alp8BitSnippet: 'MOV A, #06H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #06H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x06);',
    isStandardLabCommand: true
  },
  {
    hex: '07H',
    binary: '0000 0111',
    name: 'Entry Mode: Auto-Increment & Shift Display Left',
    category: 'display',
    categoryLabel: 'Entry Mode',
    delay: '40 µs',
    description: 'Sets I/D=1 and S=1. As each character is written, the cursor stays fixed in place while the entire display shifts leftwards (ticker tape marquee effect).',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Used for news tickers, continuous text streams, and calculator-style right-entry numbers.',
    alp8BitSnippet: 'MOV A, #07H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #07H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x07);'
  },
  {
    hex: '08H',
    binary: '0000 1000',
    name: 'Display OFF, Cursor OFF, Blink OFF',
    category: 'display',
    categoryLabel: 'Display & Cursor Control',
    delay: '40 µs',
    description: 'Turns off display (D=0), cursor (C=0), and blinking (B=0). Data in DDRAM is completely retained in internal memory.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Used for low-power sleep modes or blanking screen during rapid background data updates.',
    alp8BitSnippet: 'MOV A, #08H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #08H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x08);'
  },
  {
    hex: '0AH',
    binary: '0000 1010',
    name: 'Display OFF, Cursor ON',
    category: 'display',
    categoryLabel: 'Display & Cursor Control',
    delay: '40 µs',
    description: 'Turns off character display (D=0) while keeping underline cursor active (C=1).',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Diagnostic test mode for verifying address pointer position without character distraction.',
    alp8BitSnippet: 'MOV A, #0AH\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #0AH\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x0A);'
  },
  {
    hex: '0CH',
    binary: '0000 1100',
    name: 'Display ON, Cursor OFF (Clean Screen Mode)',
    category: 'display',
    categoryLabel: 'Display & Cursor Control',
    delay: '40 µs',
    description: 'Turns display ON (D=1), hides the cursor underline (C=0), and disables blinking (B=0). Gives a clean, professional static text presentation.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Commonly selected in final embedded product firmware once user input is complete.',
    alp8BitSnippet: 'MOV A, #0CH\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #0CH\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x0C);',
    isStandardLabCommand: true
  },
  {
    hex: '0EH',
    binary: '0000 1110',
    name: 'Display ON, Cursor ON (Steady Underline)',
    category: 'display',
    categoryLabel: 'Display & Cursor Control',
    delay: '40 µs',
    description: 'Turns display ON (D=1) and enables the steady 8th-row underline cursor (C=1) without blinking (B=0).',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Standard initialization command in Anna University / JNTU / VTU lab syllabus for Exp 12.',
    alp8BitSnippet: 'MOV A, #0EH\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #0EH\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x0E);',
    isStandardLabCommand: true
  },
  {
    hex: '0FH',
    binary: '0000 1111',
    name: 'Display ON, Cursor ON & Blinking Matrix',
    category: 'display',
    categoryLabel: 'Display & Cursor Control',
    delay: '40 µs',
    description: 'Turns display ON (D=1), cursor ON (C=1), and activates full 5×7 character cell blinking block (B=1) at approximately 409 ms rate.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Used for interactive user prompts, PIN entry fields, and editable configuration menus.',
    alp8BitSnippet: 'MOV A, #0FH\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #0FH\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x0F);'
  },
  {
    hex: '10H',
    binary: '0001 0000',
    name: 'Shift Cursor Position to Left',
    category: 'shift',
    categoryLabel: 'Shifting & Scrolling',
    delay: '40 µs',
    description: 'Decrements the Address Counter (AC) by 1, shifting the cursor one character cell to the left without modifying DDRAM data.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Used for backspace operations, editing previous characters, or manual cursor repositioning.',
    alp8BitSnippet: 'MOV A, #10H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #10H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x10);'
  },
  {
    hex: '14H',
    binary: '0001 0100',
    name: 'Shift Cursor Position to Right',
    category: 'shift',
    categoryLabel: 'Shifting & Scrolling',
    delay: '40 µs',
    description: 'Increments the Address Counter (AC) by 1, moving the cursor one position to the right without writing any character byte.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Used for tab spacing or skipping over character cells without overwriting them with blank spaces.',
    alp8BitSnippet: 'MOV A, #14H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #14H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x14);'
  },
  {
    hex: '18H',
    binary: '0001 1000',
    name: 'Shift Entire Display to Left (Scroll Left)',
    category: 'shift',
    categoryLabel: 'Shifting & Scrolling',
    delay: '40 µs',
    description: 'Shifts all displayed characters across both lines to the left by 1 character cell. The cursor follows the display shift.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Used inside an iterative loop with ~200-300 ms delays to create smooth horizontal text scrolling banners.',
    alp8BitSnippet: 'MOV A, #18H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #18H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x18);'
  },
  {
    hex: '1CH',
    binary: '0001 1100',
    name: 'Shift Entire Display to Right (Scroll Right)',
    category: 'shift',
    categoryLabel: 'Shifting & Scrolling',
    delay: '40 µs',
    description: 'Shifts all characters across both lines to the right by 1 position. The cursor shifts along with the display.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Used for rightward scrolling animations and marquee effects.',
    alp8BitSnippet: 'MOV A, #1CH\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #1CH\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x1C);'
  },
  {
    hex: '20H',
    binary: '0010 0000',
    name: 'Function Set: 4-Bit Mode, 1 Line, 5×7 Font',
    category: 'init',
    categoryLabel: 'Function Set & Bus',
    delay: '40 µs',
    description: 'Selects 4-bit data bus mode (DL=0), 1 display line (N=0), and 5×7 dot character matrix font (F=0).',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Basic single-line 4-bit configuration.',
    alp8BitSnippet: 'MOV A, #20H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #20H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x20);'
  },
  {
    hex: '28H',
    binary: '0010 1000',
    name: 'Function Set: 4-Bit Mode, 2 Lines, 5×7 Font',
    category: 'init',
    categoryLabel: 'Function Set & Bus',
    delay: '40 µs',
    description: 'Sets DL=0 (4-bit interface), N=1 (2 display lines / 16×2 layout), and F=0 (5×7 dot font). Once set, all further data/commands require two 4-bit nibble transmissions.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'PRIMARY COMMAND for Exp 12B (4-bit LCD Interfacing). Conserves 4 microcontroller I/O pins (P1.0-P1.3 remain free).',
    alp8BitSnippet: '; Exp 12B Dual Nibble:\nMOV A, #28H\nACALL LCD_CMD_4BIT',
    alp4BitSnippet: 'MOV A, #28H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd_4bit(0x28);',
    isStandardLabCommand: true
  },
  {
    hex: '30H',
    binary: '0011 0000',
    name: 'Function Set: 8-Bit Mode, 1 Line, 5×7 Font / Reset Sync',
    category: 'init',
    categoryLabel: 'Function Set & Bus',
    delay: '4.1 ms / 40 µs',
    description: 'Sets DL=1 (8-bit bus), N=0 (1 line), and F=0 (5×7 font). Also used in the mandatory 3-stage hardware power-on reset synchronization algorithm (30H -> 30H -> 30H).',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Used as the initial reset wake-up pulse when LCD controller powers up in an unknown internal state.',
    alp8BitSnippet: 'MOV A, #30H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #30H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x30);'
  },
  {
    hex: '38H',
    binary: '0011 1000',
    name: 'Function Set: 8-Bit Mode, 2 Lines, 5×7 Font',
    category: 'init',
    categoryLabel: 'Function Set & Bus',
    delay: '40 µs',
    description: 'Sets DL=1 (8-bit data bus D0-D7), N=1 (2 display lines / 16×2 layout), and F=0 (5×7 dot matrix character format).',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'PRIMARY INITIALIZATION COMMAND for Exp 12A (8-bit LCD Interfacing). Connects full 8-bit bus on Port 1 (P1.0-P1.7).',
    alp8BitSnippet: 'MOV A, #38H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #38H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x38);',
    isStandardLabCommand: true
  },
  {
    hex: '33H',
    binary: '0011 0011',
    name: '4-Bit Software Reset Sequence (Stage 1)',
    category: 'init',
    categoryLabel: 'Function Set & Bus',
    delay: '5.0 ms',
    description: 'First stage of the industry-standard HD44780 4-bit initialization state machine. Sends two consecutive 3H nibbles to force hardware reset into known 8-bit mode.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Sent immediately after power-on delay (>15ms) in 4-bit mode programs (Exp 12B).',
    alp8BitSnippet: '; 4-bit init step 1:\nMOV A, #33H\nACALL LCD_CMD_4BIT',
    alp4BitSnippet: 'MOV A, #33H\nACALL LCD_CMD_4BIT\nACALL DELAY_5MS',
    cCodeSnippet: 'lcd_cmd_4bit(0x33);\ndelay_ms(5);',
    isStandardLabCommand: true
  },
  {
    hex: '32H',
    binary: '0011 0010',
    name: '4-Bit Software Switch Sequence (Stage 2)',
    category: 'init',
    categoryLabel: 'Function Set & Bus',
    delay: '1.0 ms',
    description: 'Second stage of 4-bit initialization. Sends 3H followed by 2H nibble to switch the HD44780 controller into 4-bit operational nibble mode.',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Follows 33H in Exp 12B. Locks the LCD controller into receiving high nibble first, followed by low nibble.',
    alp8BitSnippet: '; 4-bit init step 2:\nMOV A, #32H\nACALL LCD_CMD_4BIT',
    alp4BitSnippet: 'MOV A, #32H\nACALL LCD_CMD_4BIT\nACALL DELAY_1MS',
    cCodeSnippet: 'lcd_cmd_4bit(0x32);\ndelay_ms(1);',
    isStandardLabCommand: true
  },
  {
    hex: '80H',
    binary: '1000 0000',
    name: 'Force Cursor to Beginning of Line 1 (DDRAM 00H)',
    category: 'addressing',
    categoryLabel: 'DDRAM Addressing',
    delay: '40 µs',
    description: 'Sets DDRAM address to 00H (D7=1, Address=0000000B). Positions the cursor at Line 1, Column 1 (top-left character cell).',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Used in Exp 12A & 12B before streaming Line 1 string (e.g., "KUPPAM ENGG COLL" or "8051 INTERFACE").',
    alp8BitSnippet: 'MOV A, #80H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #80H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x80);',
    isStandardLabCommand: true
  },
  {
    hex: 'C0H',
    binary: '1100 0000',
    name: 'Force Cursor to Beginning of Line 2 (DDRAM 40H)',
    category: 'addressing',
    categoryLabel: 'DDRAM Addressing',
    delay: '40 µs',
    description: 'Sets DDRAM address to 40H (D7=1, Address=1000000B -> 80H + 40H = C0H). Positions the cursor at Line 2, Column 1 (bottom-left character cell).',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Used in Exp 12A & 12B to switch to the second row before rendering the bottom line string (e.g., "16x2 LCD DISPLAY").',
    alp8BitSnippet: 'MOV A, #0C0H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #0C0H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0xC0);',
    isStandardLabCommand: true
  },
  {
    hex: '80H + Col',
    binary: '1000 xxxx',
    name: 'Set Cursor Position on Line 1 (Col 1 to 16)',
    category: 'addressing',
    categoryLabel: 'DDRAM Addressing',
    delay: '40 µs',
    description: 'Directly addresses any column on Line 1. Valid range is 80H (Col 1) to 8FH (Col 16). Formula: Command = 80H + (Column - 1).',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'For example, Column 5 on Line 1 = 80H + 04H = 84H.',
    alp8BitSnippet: '; Jump to Line 1 Col 5:\nMOV A, #84H\nACALL LCD_CMD',
    alp4BitSnippet: '; Jump to Line 1 Col 5:\nMOV A, #84H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x80 + 4); // Line 1, Col 5'
  },
  {
    hex: 'C0H + Col',
    binary: '1100 xxxx',
    name: 'Set Cursor Position on Line 2 (Col 1 to 16)',
    category: 'addressing',
    categoryLabel: 'DDRAM Addressing',
    delay: '40 µs',
    description: 'Directly addresses any column on Line 2. Valid range is C0H (Col 1) to CFH (Col 16). Formula: Command = C0H + (Column - 1).',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'For example, Column 9 on Line 2 = C0H + 08H = C8H.',
    alp8BitSnippet: '; Jump to Line 2 Col 9:\nMOV A, #0C8H\nACALL LCD_CMD',
    alp4BitSnippet: '; Jump to Line 2 Col 9:\nMOV A, #0C8H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0xC0 + 8); // Line 2, Col 9'
  },
  {
    hex: '40H to 7FH',
    binary: '01xx xxxx',
    name: 'Set CGRAM Address (Custom Character Generation)',
    category: 'cgram',
    categoryLabel: 'CGRAM & Glyphs',
    delay: '40 µs',
    description: 'Sets the address pointer to Character Generator RAM (CGRAM). Allows users to define up to 8 custom 5×8 pixel glyphs (symbols, battery bars, Greek letters, logos).',
    rs: '0 (Command)',
    rw: '0 (Write)',
    appNote: 'Each custom character requires 8 consecutive bytes written to CGRAM starting at 40H + (CharNum × 8).',
    alp8BitSnippet: '; Custom Char 0 at CGRAM 40H:\nMOV A, #40H\nACALL LCD_CMD',
    alp4BitSnippet: 'MOV A, #40H\nACALL LCD_CMD_4BIT',
    cCodeSnippet: 'lcd_cmd(0x40); // CGRAM Char 0'
  }
];

interface LcdCommandListSubTabProps {
  expId: string;
}

export const LcdCommandListSubTab: React.FC<LcdCommandListSubTabProps> = ({ expId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCommand, setSelectedCommand] = useState<LcdCommandItem>(LCD_COMMAND_LIST[0]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Interactive 16x2 Position Calculator
  const [selectedRow, setSelectedRow] = useState<1 | 2>(1);
  const [selectedCol, setSelectedCol] = useState<number>(1);

  const is4Bit = expId === 'exp_8051_lcd_4bit';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCommands = LCD_COMMAND_LIST.filter((cmd) => {
    const matchesCat = selectedCategory === 'all' || cmd.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    return (
      matchesCat &&
      (cmd.hex.toLowerCase().includes(q) ||
        cmd.binary.toLowerCase().includes(q) ||
        cmd.name.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.appNote.toLowerCase().includes(q))
    );
  });

  // Calculate DDRAM address and hex command for selected 16x2 position
  const calcDdramAddr = selectedRow === 1 ? selectedCol - 1 : 0x40 + (selectedCol - 1);
  const calcHexCommand = (0x80 | calcDdramAddr).toString(16).toUpperCase() + 'H';
  const calcBinCommand = (0x80 | calcDdramAddr).toString(2).padStart(8, '0');
  const calcAlpCode = is4Bit
    ? `MOV A, #${calcHexCommand.length === 3 ? '0' + calcHexCommand : calcHexCommand}\nACALL LCD_CMD_4BIT`
    : `MOV A, #${calcHexCommand.length === 3 ? '0' + calcHexCommand : calcHexCommand}\nACALL LCD_CMD`;
  const calcCCode = is4Bit
    ? `lcd_cmd_4bit(0x${(0x80 | calcDdramAddr).toString(16).toUpperCase()});`
    : `lcd_cmd(0x${(0x80 | calcDdramAddr).toString(16).toUpperCase()});`;

  return (
    <div className="space-y-4">
      {/* Top Banner: Academic Introduction & Control Line Protocol */}
      <div className="bg-gradient-to-r from-[#163A5F] to-[#1E40AF] rounded-2xl p-4 text-white shadow-sm space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Table className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                <span>Hitachi HD44780 LCD Command Reference & Instruction Set</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/30">
                  {is4Bit ? 'Experiment 12B (4-Bit Mode)' : 'Experiment 12A (8-Bit Mode)'}
                </span>
              </h3>
              <p className="text-xs text-blue-100/90 font-mono">
                Command Bytes (Hex / Binary), Execution Delays, Register Select (RS=0), and Hardware State Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-blue-100">Standard Delay: 40 µs | Clear/Home: 2.0 ms</span>
          </div>
        </div>

        {/* Protocol Control Bar Rule Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/15 text-xs font-mono">
          <div className="bg-white/10 p-2 rounded-xl border border-white/10">
            <div className="text-cyan-300 font-bold flex items-center gap-1">
              <span>RS = 0 (Instruction Register)</span>
            </div>
            <p className="text-[11px] text-blue-100/80 leading-snug mt-0.5">
              Directs the transmitted byte into the internal Command Register for initialization & cursor addressing.
            </p>
          </div>
          <div className="bg-white/10 p-2 rounded-xl border border-white/10">
            <div className="text-emerald-300 font-bold flex items-center gap-1">
              <span>R/W = 0 (Write Operation)</span>
            </div>
            <p className="text-[11px] text-blue-100/80 leading-snug mt-0.5">
              Permanently grounded or driven LOW to latch data/commands from 8051 to LCD.
            </p>
          </div>
          <div className="bg-white/10 p-2 rounded-xl border border-white/10">
            <div className="text-amber-300 font-bold flex items-center gap-1">
              <span>EN Pulse (High-to-Low Strobe)</span>
            </div>
            <p className="text-[11px] text-blue-100/80 leading-snug mt-0.5">
              Commands latch on the falling edge (1 → 0). The HIGH pulse width must be ≥ 450 ns.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive 16x2 Position & Command Calculator */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#B8D4E8] shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B8D4E8]/60 pb-2">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-[#2563EB]" />
            <h4 className="text-xs sm:text-sm font-bold text-[#163A5F] font-mono uppercase tracking-wide">
              Interactive 16×2 DDRAM Address & Command Calculator
            </h4>
          </div>
          <span className="text-[11px] font-mono text-[#475569] bg-[#EAF4FB] px-2 py-0.5 rounded border border-[#B8D4E8]">
            Click any character cell below to generate its command code
          </span>
        </div>

        {/* Visual 16x2 LCD Screen Representation */}
        <div className="bg-[#1E3A5F] p-3 rounded-xl border-2 border-[#0F172A] shadow-inner space-y-2 font-mono">
          {/* Row 1 (80H - 8FH) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold px-1">
              <span>LINE 1 (DDRAM 00H - 0FH) ➔ Base Command: 80H</span>
              <span className="text-slate-300">Columns 1 to 16</span>
            </div>
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
              {Array.from({ length: 16 }, (_, i) => {
                const colNum = i + 1;
                const hexVal = (0x80 + i).toString(16).toUpperCase();
                const isSelected = selectedRow === 1 && selectedCol === colNum;
                return (
                  <button
                    key={`r1-${colNum}`}
                    onClick={() => {
                      setSelectedRow(1);
                      setSelectedCol(colNum);
                    }}
                    className={`py-1.5 px-0.5 rounded text-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black border-white shadow-xs scale-105 ring-2 ring-amber-300'
                        : 'bg-[#0B1E36] hover:bg-[#163A5F] text-cyan-200 border-cyan-800/60'
                    }`}
                  >
                    <div className="text-[9px] text-slate-400 font-semibold">C{colNum}</div>
                    <div className="text-[11px] font-bold">{hexVal}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2 (C0H - CFH) */}
          <div className="space-y-1 pt-1 border-t border-cyan-900/60">
            <div className="flex items-center justify-between text-[10px] text-emerald-300 font-bold px-1">
              <span>LINE 2 (DDRAM 40H - 4FH) ➔ Base Command: C0H</span>
              <span className="text-slate-300">Columns 1 to 16</span>
            </div>
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
              {Array.from({ length: 16 }, (_, i) => {
                const colNum = i + 1;
                const hexVal = (0xC0 + i).toString(16).toUpperCase();
                const isSelected = selectedRow === 2 && selectedCol === colNum;
                return (
                  <button
                    key={`r2-${colNum}`}
                    onClick={() => {
                      setSelectedRow(2);
                      setSelectedCol(colNum);
                    }}
                    className={`py-1.5 px-0.5 rounded text-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black border-white shadow-xs scale-105 ring-2 ring-amber-300'
                        : 'bg-[#0B1E36] hover:bg-[#163A5F] text-emerald-200 border-emerald-800/60'
                    }`}
                  >
                    <div className="text-[9px] text-slate-400 font-semibold">C{colNum}</div>
                    <div className="text-[11px] font-bold">{hexVal}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Computed Result Box */}
        <div className="bg-[#EAF4FB] p-3 rounded-xl border border-[#B8D4E8] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#163A5F] text-white px-2.5 py-1 rounded-lg font-bold">
              Target: Line {selectedRow}, Column {selectedCol}
            </span>
            <span className="bg-white border border-[#B8D4E8] text-[#163A5F] px-2.5 py-1 rounded-lg font-bold">
              Command Byte: <span className="text-[#2563EB] font-black text-sm">{calcHexCommand}</span>
            </span>
            <span className="bg-white border border-[#B8D4E8] text-[#475569] px-2 py-1 rounded-lg text-[11px]">
              Binary: {calcBinCommand}
            </span>
            <span className="bg-white border border-[#B8D4E8] text-[#475569] px-2 py-1 rounded-lg text-[11px]">
              DDRAM Offset: {calcDdramAddr.toString(16).toUpperCase().padStart(2, '0')}H
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(calcAlpCode, 'calc-alp')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-blue-50 text-[#2563EB] border border-[#B8D4E8] font-bold transition-all shadow-2xs cursor-pointer text-xs"
            >
              {copiedCode === 'calc-alp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'calc-alp' ? 'Copied ALP!' : 'Copy ALP Code'}</span>
            </button>
            <button
              onClick={() => handleCopy(calcCCode, 'calc-c')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-[#B8D4E8] font-bold transition-all shadow-2xs cursor-pointer text-xs"
            >
              {copiedCode === 'calc-c' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code2 className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'calc-c' ? 'Copied C!' : 'Copy Keil C'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#E3F1FA] p-2.5 rounded-2xl border border-[#B8D4E8]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono font-bold text-[#163A5F] uppercase flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Filter:</span>
          </span>
          {[
            { id: 'all', label: 'All Commands (22)' },
            { id: 'init', label: 'Init & Bus Modes' },
            { id: 'display', label: 'Display & Cursor' },
            { id: 'shift', label: 'Shifting & Scrolling' },
            { id: 'addressing', label: 'DDRAM Addressing' },
            { id: 'cgram', label: 'CGRAM Custom Glyphs' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-2xs'
                  : 'bg-white text-[#163A5F] hover:bg-[#DCEFFA] border-[#B8D4E8]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search hex code (01H, 38H, 80H...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#B8D4E8] rounded-xl text-xs font-mono text-[#163A5F] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>
      </div>

      {/* Main Command List Table */}
      <div className="bg-white rounded-2xl border border-[#B8D4E8] overflow-hidden shadow-2xs">
        <div className="bg-[#E3F1FA] px-4 py-2 border-b border-[#B8D4E8] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#163A5F] uppercase">
            <Table className="w-4 h-4 text-[#2563EB]" />
            <span>Hitachi HD44780 Alphanumeric LCD Command Master Table</span>
          </div>
          <span className="text-[11px] font-mono text-[#475569]">
            Showing {filteredCommands.length} of {LCD_COMMAND_LIST.length} commands
          </span>
        </div>

        <div className="overflow-x-auto max-h-[480px] scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#F1F7FB] border-b border-[#B8D4E8] text-[#163A5F] font-bold text-[11px] uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <th className="p-2.5 text-center w-16">Hex Code</th>
                <th className="p-2.5 w-24">Binary (D7-D0)</th>
                <th className="p-2.5">Command Name & Function</th>
                <th className="p-2.5 w-28">Exec Delay</th>
                <th className="p-2.5 w-32">Control Lines</th>
                <th className="p-2.5">Lab Application & Role</th>
                <th className="p-2.5 text-center w-28">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1F2937]">
              {filteredCommands.map((cmd, idx) => {
                const isSelected = selectedCommand.hex === cmd.hex;
                return (
                  <tr
                    key={cmd.hex + idx}
                    onClick={() => setSelectedCommand(cmd)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF4FB] text-[#163A5F] font-medium'
                        : cmd.isStandardLabCommand
                        ? 'bg-blue-50/40 hover:bg-[#EAF4FB]/70'
                        : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {/* Hex Code Badge */}
                    <td className="p-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-lg text-xs font-bold font-mono shadow-2xs border ${
                          cmd.isStandardLabCommand
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-white text-[#163A5F] border-[#B8D4E8]'
                        }`}
                      >
                        {cmd.hex}
                      </span>
                    </td>

                    {/* Binary */}
                    <td className="p-2.5 text-[11px] text-[#475569] whitespace-nowrap">
                      <code>{cmd.binary}</code>
                    </td>

                    {/* Name & Category */}
                    <td className="p-2.5 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#163A5F] text-xs">{cmd.name}</span>
                        {cmd.isStandardLabCommand && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                            ★ Lab Core
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B] font-sans line-clamp-1">{cmd.description}</p>
                    </td>

                    {/* Delay */}
                    <td className="p-2.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          cmd.delay.includes('ms')
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {cmd.delay}
                      </span>
                    </td>

                    {/* Control Lines */}
                    <td className="p-2.5 text-[10px] text-[#475569] space-y-0.5 whitespace-nowrap">
                      <div>RS={cmd.rs.split(' ')[0]}, RW={cmd.rw.split(' ')[0]}</div>
                      <div className="text-[9px] text-[#2563EB]">EN Falling Edge</div>
                    </td>

                    {/* Lab Application */}
                    <td className="p-2.5 text-[11px] text-[#1F2937] font-sans">
                      {cmd.appNote}
                    </td>

                    {/* Quick Action Button */}
                    <td className="p-2.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(
                            is4Bit ? cmd.alp4BitSnippet : cmd.alp8BitSnippet,
                            `cmd-${cmd.hex}`
                          );
                        }}
                        className="flex items-center justify-center gap-1 w-full px-2 py-1 rounded-lg bg-white hover:bg-blue-50 text-[#2563EB] border border-[#B8D4E8] font-bold text-[10px] transition-all shadow-2xs cursor-pointer"
                      >
                        {copiedCode === `cmd-${cmd.hex}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy ALP</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Command Deep-Dive Card */}
      {selectedCommand && (
        <div className="bg-white rounded-2xl p-4 border border-[#B8D4E8] shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B8D4E8]/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#2563EB] text-white font-mono text-sm font-bold shadow-2xs">
                {selectedCommand.hex}
              </span>
              <div>
                <h4 className="text-sm font-bold text-[#163A5F]">{selectedCommand.name}</h4>
                <p className="text-[11px] font-mono text-[#64748B]">
                  Binary: {selectedCommand.binary} | Category: {selectedCommand.categoryLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg">
                Execution Time: {selectedCommand.delay}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#1F2937] leading-relaxed">
            {selectedCommand.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
            {/* 8051 8-Bit Assembly */}
            <div className="bg-[#0F172A] text-cyan-300 p-3 rounded-xl font-mono text-xs space-y-1 border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-sans border-b border-slate-700 pb-1 mb-1.5">
                  <span>8051 8-Bit ALP (Exp 12A)</span>
                  <Terminal className="w-3 h-3 text-cyan-400" />
                </div>
                <pre className="whitespace-pre overflow-x-auto text-[11px]">{selectedCommand.alp8BitSnippet}</pre>
              </div>
              <button
                onClick={() => handleCopy(selectedCommand.alp8BitSnippet, 'alp-8bit-detail')}
                className="mt-2 flex items-center justify-center gap-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] border border-slate-600 transition-all cursor-pointer"
              >
                {copiedCode === 'alp-8bit-detail' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'alp-8bit-detail' ? 'Copied!' : 'Copy 8-Bit ALP'}</span>
              </button>
            </div>

            {/* 8051 4-Bit Assembly */}
            <div className="bg-[#0F172A] text-emerald-300 p-3 rounded-xl font-mono text-xs space-y-1 border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-sans border-b border-slate-700 pb-1 mb-1.5">
                  <span>8051 4-Bit ALP (Exp 12B)</span>
                  <Code2 className="w-3 h-3 text-emerald-400" />
                </div>
                <pre className="whitespace-pre overflow-x-auto text-[11px]">{selectedCommand.alp4BitSnippet}</pre>
              </div>
              <button
                onClick={() => handleCopy(selectedCommand.alp4BitSnippet, 'alp-4bit-detail')}
                className="mt-2 flex items-center justify-center gap-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] border border-slate-600 transition-all cursor-pointer"
              >
                {copiedCode === 'alp-4bit-detail' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'alp-4bit-detail' ? 'Copied!' : 'Copy 4-Bit ALP'}</span>
              </button>
            </div>

            {/* Embedded C (Keil C51) */}
            <div className="bg-[#0F172A] text-purple-300 p-3 rounded-xl font-mono text-xs space-y-1 border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-sans border-b border-slate-700 pb-1 mb-1.5">
                  <span>Keil C51 (Embedded C)</span>
                  <Cpu className="w-3 h-3 text-purple-400" />
                </div>
                <pre className="whitespace-pre overflow-x-auto text-[11px]">{selectedCommand.cCodeSnippet}</pre>
              </div>
              <button
                onClick={() => handleCopy(selectedCommand.cCodeSnippet, 'c-detail')}
                className="mt-2 flex items-center justify-center gap-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] border border-slate-600 transition-all cursor-pointer"
              >
                {copiedCode === 'c-detail' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'c-detail' ? 'Copied!' : 'Copy Keil C'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Guide: 8-Bit vs 4-Bit Initialization Sequences */}
      <div className="bg-white rounded-2xl p-4 border border-[#B8D4E8] shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-[#163A5F] font-mono text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Step-by-Step Initialization Sequences: 8-Bit (Exp 12A) vs 4-Bit (Exp 12B)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 8-Bit Initialization Sequence */}
          <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#B8D4E8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#163A5F] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
                <span>8-Bit Mode Initialization (Exp 12A)</span>
              </span>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold border border-blue-200">
                P1.0 - P1.7 (8 Pins)
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {[
                { step: '1', cmd: 'Power ON Delay', desc: 'Wait >15 ms after VDD reaches 4.5V' },
                { step: '2', cmd: '38H', desc: 'Function Set: 8-bit bus, 2 display lines, 5×7 font' },
                { step: '3', cmd: '0EH (or 0CH)', desc: 'Display Control: Display ON, cursor ON steady' },
                { step: '4', cmd: '01H', desc: 'Clear Display Screen & reset DDRAM (Wait ≥ 2.0 ms)' },
                { step: '5', cmd: '06H', desc: 'Entry Mode: Auto-increment cursor position rightwards' },
                { step: '6', cmd: '80H / C0H', desc: 'Set starting DDRAM address for Line 1 / Line 2' }
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-[#E2E8F0]">
                  <span className="w-5 h-5 rounded-md bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {s.step}
                  </span>
                  <code className="text-[#2563EB] font-bold w-20 shrink-0">{s.cmd}</code>
                  <span className="text-[#475569] text-[11px]">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Bit Initialization Sequence */}
          <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#B8D4E8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#163A5F] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>4-Bit Mode Initialization (Exp 12B)</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                P1.4 - P1.7 (4 Pins Saved)
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {[
                { step: '1', cmd: 'Power ON Delay', desc: 'Wait >15 ms after VDD stabilizes' },
                { step: '2', cmd: '33H', desc: 'Software Reset Sync (Forces known state)' },
                { step: '3', cmd: '32H', desc: 'Switch controller into 4-bit operational mode' },
                { step: '4', cmd: '28H', desc: 'Function Set: 4-bit bus, 2 lines, 5×7 font matrix' },
                { step: '5', cmd: '0EH (or 0CH)', desc: 'Display ON, cursor ON (Sent in 2 dual nibbles)' },
                { step: '6', cmd: '01H', desc: 'Clear Screen (Dual nibble + 2.0 ms execution delay)' },
                { step: '7', cmd: '06H', desc: 'Entry Mode: Auto-increment cursor' }
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-[#E2E8F0]">
                  <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {s.step}
                  </span>
                  <code className="text-emerald-700 font-bold w-20 shrink-0">{s.cmd}</code>
                  <span className="text-[#475569] text-[11px]">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
