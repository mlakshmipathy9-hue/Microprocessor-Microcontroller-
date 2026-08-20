import { Module } from '../types';

export const courseData: Module[] = [
  {
    id: 'm1',
    title: 'Module 1: Evolution of Microprocessors',
    slides: [
      {
        id: 'm1-s1',
        title: '1. Welcome to Microprocessors & Microcontrollers!',
        moduleTitle: 'Module 1: Evolution of Microprocessors',
        moduleId: 'm1',
        points: [
          'Designed specifically for B.Tech beginners starting their hardware engineering journey.',
          'Microprocessor: A multipurpose, programmable, clock-driven, register-based electronic device.',
          'It reads binary instructions from a storage device (Memory), accepts binary data as input, processes data according to instructions, and provides results as output.',
          'The 8086 is a monumental 16-bit microprocessor launched by Intel in 1978, establishing the classic x86 architecture.'
        ]
      },
      {
        id: 'm1-s3', // Must be m1-s3 so SlidePresenter triggers the "vs" tab by default
        title: '2. Microprocessor vs Microcontroller',
        moduleTitle: 'Module 1: Evolution of Microprocessors',
        moduleId: 'm1',
        points: [
          'Microprocessor (MPU) is a Dependent System: Contains CPU only and depends on external memory (RAM/ROM), I/O ports, and timing ICs to function.',
          'Microcontroller (MCU) is an Independent System: Complete standalone system-on-chip with built-in CPU, RAM, ROM, I/O ports, and timers on a single silicon die.',
          'MPU offers Independent Component Flexibility: External RAM, ROM, and I/O can be expanded or upgraded independently according to system demands.',
          'MCU features Fixed Dependent Integration: On-chip memory capacity and peripheral interfaces are fixed on-die for cost-effective embedded applications.'
        ],
        interactiveType: 'evolution'
      },
      {
        id: 'm1-s2',
        title: '3. Evolution of Microprocessors',
        moduleTitle: 'Module 1: Evolution of Microprocessors',
        moduleId: 'm1',
        points: [
          '1st Generation (1971): 4-bit processors (Intel 4004) - designed for calculator logic.',
          '2nd Generation (1974): 8-bit processors (Intel 8080 / 8085) - birth of home computers.',
          '3rd Generation (1978): 16-bit processors (Intel 8086 / 8088) - massive memory mapping up to 1 MB.',
          '4th Generation (1985): 32-bit processors (Intel 80386 / 80486) - introduced paging and multitasking.',
          '5th Generation (1993-Present): 64-bit superscalar processors (Pentium, Core i7, Xeon).'
        ],
        interactiveType: 'evolution'
      },
      {
        id: 'm1-s5',
        title: '4. Evolution to Pentium Series',
        moduleTitle: 'Module 1: Evolution of Microprocessors',
        moduleId: 'm1',
        points: [
          '80386 (1985): Intel\'s first true 32-bit x86 processor. Introduced virtual memory paging, supporting up to 4 GB of RAM.',
          '80486 (1989): Integrated a floating-point unit (FPU/math coprocessor) and 8 KB of L1 cache onto the CPU core.',
          'Pentium (1993): Launched superscalar execution (two independent execution pipelines, U and V), allowing it to process two instructions per clock cycle.'
        ]
      },
      {
        id: 'm1-s6',
        title: '5. Features & Key Parameters of Intel 8086',
        moduleTitle: 'Module 1: Evolution of Microprocessors',
        moduleId: 'm1',
        points: [
          'It is a 16-bit MPU: It possesses a 16-bit ALU, 16-bit internal registers, and a 16-bit Data Bus.',
          '20-Bit Address Bus: Can access up to 1,048,576 bytes (1 MB) of physical memory space.',
          'Pipelined Architecture: Divided into Bus Interface Unit (BIU) and Execution Unit (EU) operating in parallel.',
          'Applications of 8086: High-precision calculators, simple industrial robotics control, traffic light sequencers, and early personal computing.'
        ]
      },
      {
        id: 'm1-quiz',
        title: 'Module 1 Recap Quiz',
        moduleTitle: 'Module 1: Evolution of Microprocessors',
        moduleId: 'm1',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: '1. What is a microprocessor?',
            options: [
              'A software program used to translate assembly language',
              'A multipurpose, clock-driven, register-based IC that reads binary instructions from memory',
              'An analog sensor that measures temperature and voltage',
              'A dedicated memory bank used exclusively for storing boot code'
            ],
            correctAnswer: 1,
            explanation: 'A microprocessor is a multipurpose, programmable, clock-driven, register-based electronic device that reads binary instructions from memory, processes data, and outputs results.'
          },
          {
            question: '2. What is the word length (data path size) of the Intel 8086 microprocessor?',
            options: ['4-bit', '8-bit', '16-bit', '32-bit'],
            correctAnswer: 2,
            explanation: 'The Intel 8086 is a 16-bit microprocessor because its internal registers, ALU, and internal/external data paths are all 16 bits wide.'
          },
          {
            question: '3. What is the primary difference between a Microprocessor (MPU) and a Microcontroller (MCU)?',
            options: [
              'MPUs run on battery power while MCUs require AC mains power',
              'MCUs integrate CPU, RAM, ROM, and I/O peripherals on a single chip, whereas MPUs use external memory and peripherals',
              'MPUs do not use system buses to communicate with external components',
              'MCUs do not contain a Central Processing Unit (CPU)'
            ],
            correctAnswer: 1,
            explanation: 'A Microcontroller (MCU) integrates the CPU, RAM, ROM, timers, and I/O ports onto a single silicon chip, whereas a Microprocessor (MPU) contains only the CPU and requires external chips for memory and I/O.'
          },
          {
            question: '4. What is the address bus width of the Intel 8086, and how much physical memory can it address?',
            options: [
              '16-bit address bus, addressing up to 64 KB',
              '20-bit address bus, addressing up to 1 MB',
              '24-bit address bus, addressing up to 16 MB',
              '32-bit address bus, addressing up to 4 GB'
            ],
            correctAnswer: 1,
            explanation: 'The 8086 has a 20-bit address bus (A0-A19), allowing it to address 2^20 = 1,048,576 bytes (1 MB) of physical memory.'
          },
          {
            question: '5. What is the width of the external data bus in the Intel 8086 microprocessor?',
            options: ['8 bits', '16 bits', '20 bits', '32 bits'],
            correctAnswer: 1,
            explanation: 'The 8086 features a 16-bit data bus (D0-D15), enabling it to read or write a full 16-bit word in a single memory cycle.'
          },
          {
            question: '6. To which generation of microprocessors does the Intel 8086 belong?',
            options: ['1st Generation (4-bit)', '2nd Generation (8-bit)', '3rd Generation (16-bit)', '4th Generation (32-bit)'],
            correctAnswer: 2,
            explanation: 'The 16-bit processors (such as the Intel 8086, 8088, and Z8000) belong to the 3rd Generation of microprocessors introduced in the late 1970s.'
          },
          {
            question: '7. What is the primary physical difference between the Intel 8086 and Intel 8088 microprocessors?',
            options: [
              'The 8088 has a 32-bit ALU while the 8086 has a 16-bit ALU',
              'The 8088 has an 8-bit external data bus, whereas the 8086 has a 16-bit external data bus',
              'The 8086 does not support memory segmentation',
              'The 8088 cannot run assembly language programs'
            ],
            correctAnswer: 1,
            explanation: 'Internally, the 8086 and 8088 are identical 16-bit CPUs. Externally, the 8088 uses an 8-bit data bus to interface with cheaper, standard 8-bit support circuits.'
          },
          {
            question: '8. Which was the first commercially available 4-bit microprocessor, introduced by Intel in 1971?',
            options: ['Intel 4004', 'Intel 8008', 'Intel 8080', 'Intel 8085'],
            correctAnswer: 0,
            explanation: 'The Intel 4004, launched in 1971, was the world’s first single-chip commercial 4-bit microprocessor, designed originally for electronic calculators.'
          },
          {
            question: '9. Which 2nd Generation 8-bit microprocessor introduced by Intel in 1976 was widely used in educational training kits?',
            options: ['Intel 4004', 'Intel 8085', 'Intel 80386', 'Intel Pentium'],
            correctAnswer: 1,
            explanation: 'The Intel 8085 was an 8-bit 2nd Generation microprocessor featuring single +5V power supply operation and multiplexed address/data lines, widely used in educational training kits.'
          },
          {
            question: '10. Which Intel processor was the first true 32-bit x86 processor to introduce virtual memory paging?',
            options: ['Intel 8086', 'Intel 80286', 'Intel 80386', 'Intel Pentium'],
            correctAnswer: 2,
            explanation: 'The Intel 80386 (1985) introduced a 32-bit data path, 32-bit address bus (4 GB memory space), and virtual memory paging.'
          },
          {
            question: '11. What major hardware component was integrated directly onto the CPU die in the Intel 80486?',
            options: [
              'Wi-Fi controller',
              'Floating-Point Unit (FPU / Math Coprocessor) and 8 KB L1 Cache',
              'Dual core GPU graphics accelerator',
              'Ethernet MAC chip'
            ],
            correctAnswer: 1,
            explanation: 'The Intel 80486 (1989) integrated a hardware math coprocessor (FPU) and an on-chip 8 KB L1 cache directly into the processor die.'
          },
          {
            question: '12. What does "superscalar execution" mean in the Intel Pentium processor?',
            options: [
              'The CPU uses an external 128-bit address bus',
              'The CPU has dual independent execution pipelines (U and V) that can execute two instructions per clock cycle',
              'The CPU runs strictly without an internal clock signal',
              'The CPU converts all instructions into analog signals'
            ],
            correctAnswer: 1,
            explanation: 'Superscalar architecture (introduced in Pentium, 1993) uses parallel execution pipelines (U and V) to run up to two instructions simultaneously per clock cycle.'
          },
          {
            question: '13. How are memory (RAM/ROM) and peripheral devices connected to a Microprocessor (MPU)?',
            options: [
              'Embedded inside the CPU instruction queue',
              'Connected externally to the CPU via address, data, and control system buses',
              'Directly soldered to the ALU logic gates',
              'Linked via wireless optical sensors'
            ],
            correctAnswer: 1,
            explanation: 'In an MPU-based system, RAM, ROM, and I/O devices are external ICs connected to the CPU through system buses (Address Bus, Data Bus, and Control Bus).'
          },
          {
            question: '14. Which two major functional units operate in parallel to form the pipelined architecture of the 8086?',
            options: [
              'Bus Interface Unit (BIU) and Execution Unit (EU)',
              'Floating Point Unit (FPU) and Memory Management Unit (MMU)',
              'Direct Memory Access (DMA) and Interrupt Controller',
              'Serial Input Unit and Serial Output Unit'
            ],
            correctAnswer: 0,
            explanation: 'The 8086 architecture is divided into the Bus Interface Unit (BIU), which fetches instructions and interfaces with memory, and the Execution Unit (EU), which decodes and executes instructions.'
          },
          {
            question: '15. How many total unique physical memory locations can be accessed by a 20-bit address bus?',
            options: ['65,536 locations (64 KB)', '1,048,576 locations (1 MB)', '4,294,967,296 locations (4 GB)', '16,777,216 locations (16 MB)'],
            correctAnswer: 1,
            explanation: 'A 20-bit address bus can generate 2^20 unique binary address combinations, corresponding to 1,048,576 bytes or 1 Megabyte (1 MB).'
          }
        ]
      }
    ]
  },
  {
    id: 'm2',
    title: 'Module 2: 8086 Internal Architecture & Execution Unit',
    slides: [
      {
        id: 'm2-s1',
        title: '1. Internal Architecture Overview',
        moduleTitle: 'Module 2: 8086 Internal Architecture & Execution Unit',
        moduleId: 'm2',
        points: [
          'Bus Interface Unit (BIU) fetches instructions, generates physical addresses, reads/writes memory, stores bytes in the prefetch queue, and handles bus operations.',
          'Execution Unit (EU) takes bytes from the prefetch queue, decodes instructions, executes instructions, performs ALU operations, and updates registers/flags.'
        ]
      },
      {
        id: 'm2-s2',
        title: '2. Execution Unit (EU) & Registers',
        moduleTitle: 'Module 2: 8086 Internal Architecture & Execution Unit',
        moduleId: 'm2',
        points: [
          'The EU executes instruction bytes popped from the BIU instruction queue.',
          'Main Components: Arithmetic Logic Unit (ALU), Control Circuitry, Instruction Decoder, and register array.',
          'General Purpose Registers (EU): AX, BX, CX, DX (Can be split into 8-bit high/low halves).',
          'Pointer & Index Registers (EU): SP (Stack Pointer), BP (Base Pointer), SI (Source Index), DI (Destination Index).'
        ],
        interactiveType: 'architecture'
      },
      {
        id: 'm2-pipelining',
        title: '3. Instruction Pipelining & Prefetch Queue',
        moduleTitle: 'Module 2: 8086 Internal Architecture & Execution Unit',
        moduleId: 'm2',
        points: [
          'Two MOV Instructions Pipelining Example: Consider sequential instructions MOV AX, 1234H (B8 34 12), MOV BX, 5678H (BB 78 56), and MOV CX, 9ABCH (B9 BC 9A).',
          'Phase 1 (Fetch Instruction 1): The Bus Interface Unit (BIU) fetches the 3 bytes for MOV AX, 1234H from memory into the 6-byte FIFO Prefetch Queue (Clocks C1–C3).',
          'Phase 2 (Parallel Overlap): While the Execution Unit (EU) decodes and executes MOV AX, 1234H (Clocks C4–C6), the BIU concurrently prefetches the 3 bytes for MOV BX, 5678H from memory into the queue.',
          'Phase 3 (Zero Delay Execution): When MOV AX finishes, MOV BX is already sitting in the queue. The EU executes it immediately with zero memory fetch delay.',
          'Graphical Waveform Analysis: Digital timing waveforms illustrate simultaneous BIU Fetch and EU Execute activity across clock cycles, demonstrating a 33.3% throughput increase over non-pipelined execution.'
        ],
        interactiveType: 'pipelining'
      },
      {
        id: 'm2-s3',
        title: '4. Register Organization & Flag Register Details 📋',
        moduleTitle: 'Module 2: 8086 Internal Architecture & Execution Unit',
        moduleId: 'm2',
        points: [
          '8086 Register Organization Overview: The 8086 contains fourteen 16-bit internal registers categorized into 4 main register types: General Purpose Data Registers, Segment Registers, Pointer & Index Registers, and Special / Flag Register.',
          '1. General Purpose Data Registers (AX, BX, CX, DX): 16-bit EU registers used for arithmetic, logic, and data manipulation. Each can be split into two 8-bit high/low registers (AH/AL, BH/BL, CH/CL, DH/DL). AX = Accumulator, BX = Base, CX = Count, DX = Data.',
          '2. Segment Registers (CS, DS, SS, ES): 16-bit BIU registers holding 16-bit base addresses for Code Segment (CS), Data Segment (DS), Stack Segment (SS), and Extra Segment (ES) in the 1 MB physical memory space.',
          '3. Pointer & Index Registers (IP, SP, BP, SI, DI): 16-bit registers holding memory offsets. IP = Instruction Pointer (next instruction offset), SP = Stack Pointer (top of stack offset), BP = Base Pointer (stack parameter offset), SI = Source Index, DI = Destination Index.',
          '4. Special / Flag Register (16-Bit Status & Control Flags): 16-bit register containing 9 active flags (6 Status & 3 Control Flags).'
        ],
        interactiveType: 'flags'
      },
      {
        id: 'm2-quiz',
        title: 'Module 2 Recap Quiz',
        moduleTitle: 'Module 2: 8086 Internal Architecture & Execution Unit',
        moduleId: 'm2',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'How is the general-purpose 16-bit AX register split into 8-bit registers?',
            options: ['AH (High byte) and AL (Low byte)', 'AS (Sign byte) and AC (Carry byte)', 'AP (Pointer) and AD (Data)', 'AX cannot be split'],
            correctAnswer: 0,
            explanation: 'The 16-bit AX register consists of two independent 8-bit registers: AH (Accumulator High) and AL (Accumulator Low).'
          },
          {
            question: 'Which status flag is set to 1 if the output of an arithmetic or logical operation is exactly zero?',
            options: ['Carry Flag (CF)', 'Sign Flag (SF)', 'Zero Flag (ZF)', 'Overflow Flag (OF)'],
            correctAnswer: 2,
            explanation: 'The Zero Flag (ZF) is automatically set to 1 by the ALU if the result of the executed instruction is zero; otherwise, it is cleared to 0.'
          },
          {
            question: 'Which 16-bit general register is automatically utilized as a count register by loop and shift instructions?',
            options: ['AX (Accumulator)', 'BX (Base Register)', 'CX (Count Register)', 'DX (Data Register)'],
            correctAnswer: 2,
            explanation: 'CX is the designated Count register. Loop instructions (LOOP) and shift/rotate instructions automatically decrement CX or use CL as the iteration counter.'
          },
          {
            question: 'Which of the following represent the three control flags in the 8086 Flag Register?',
            options: ['CF, ZF, SF', 'DF, IF, TF', 'OF, PF, AF', 'SP, BP, IP'],
            correctAnswer: 1,
            explanation: 'The three control flags are DF (Direction Flag), IF (Interrupt Enable Flag), and TF (Trap/Single-Step Flag).'
          },
          {
            question: 'What is the function of the Auxiliary Carry (AF) flag in the 8086 microprocessor?',
            options: ['To signal overflow in signed operations', 'To track carry/borrow out of bit 3 (lower nibble) to support BCD (Binary Coded Decimal) arithmetic', 'To enable hardware interrupts', 'To reverse the direction of string operations'],
            correctAnswer: 1,
            explanation: 'The AF flag is set if there is a carry out of bit 3 (the lowest 4 bits or nibble) during addition, or a borrow during subtraction. This is used by BCD adjustment instructions like AAA or DAA.'
          },
          {
            question: 'Which 16-bit register in the Execution Unit holds the offset of the top of the stack relative to the Stack Segment (SS) register?',
            options: ['Base Pointer (BP)', 'Source Index (SI)', 'Stack Pointer (SP)', 'Instruction Pointer (IP)'],
            correctAnswer: 2,
            explanation: 'The Stack Pointer (SP) register always holds the 16-bit offset of the current top of the stack within the Stack Segment (SS).'
          },
          {
            question: 'What happens to the 8086 prefetch queue when a branch instruction (like JMP or JZ) is executed?',
            options: [
              'The queue continues fetching from the next sequential address without changes',
              'The queue is flushed (emptied), and the BIU begins fetching from the new target address',
              'The BIU freezes and triggers a hardware interrupt',
              'The Execution Unit takes over prefetching directly from memory'
            ],
            correctAnswer: 1,
            explanation: 'When a branch instruction is executed, the pre-fetched sequential instruction bytes are no longer valid. The BIU flushes (empties) the 6-byte queue and starts fetching from the branch\'s target address, introducing a small delay called branch penalty.'
          },
          {
            question: 'Which functional unit within the 8086 microprocessor is responsible for decoding and executing fetched instructions?',
            options: ['Bus Interface Unit (BIU)', 'Execution Unit (EU)', 'Interrupt Vector Table (IVT)', 'Address Latch Enable (ALE)'],
            correctAnswer: 1,
            explanation: 'The Execution Unit (EU) contains the instruction decoder, ALU, and control circuitry that decodes instructions popped from the queue and executes them.'
          },
          {
            question: 'Which of the following registers are general-purpose 16-bit registers that reside inside the Execution Unit (EU)?',
            options: ['CS, DS, SS, ES', 'AX, BX, CX, DX', 'SP, BP, SI, DI', 'IP, Flags, Queue, Latch'],
            correctAnswer: 1,
            explanation: 'AX, BX, CX, DX are general-purpose registers located in the EU. They can be accessed as 16-bit registers or as 8-bit register halves.'
          }
        ]
      }
    ]
  },
  {
    id: 'm3',
    title: 'Module 3: Memory Segmentation',
    slides: [
      {
        id: 'm3-s2',
        title: '1. What is Memory Segmentation & Need?',
        moduleTitle: 'Module 3: Memory Segmentation',
        moduleId: 'm3',
        points: [
          '• Definition of Memory Segmentation: Memory Segmentation is a technique where the 1 MB physical address space (00000H to FFFFFH) is logically divided into smaller memory blocks called Segments, each up to 64 KB (65,536 bytes) in size.',
          '• Why Segmentation is Essential: Since internal 8086 registers (IP, SP, BX, SI, DI) are only 16 bits wide (addressing max 64 KB), segmentation allows a 16-bit processor to address 1 MB of physical RAM by pairing a 16-bit Segment Base Register with a 16-bit Offset Register.',
          '• Primary Architectural Advantages: Provides dynamic program relocation (programs load anywhere in RAM on-the-fly), modular separation of code/data/stack, memory access protection, and efficient multitasking execution.'
        ],
        interactiveType: 'memory-calc'
      },
      {
        id: 'm3-s3',
        title: '2. Overlapping vs. Non-Overlapping Segmentation',
        moduleTitle: 'Module 3: Memory Segmentation',
        moduleId: 'm3',
        points: [
          '• Four Active Logical Segments: At any given instant, the CPU actively references 4 main segments mapped by 16-bit registers in the BIU: Code Segment (CS), Data Segment (DS), Stack Segment (SS), and Extra Segment (ES).',
          '• Paragraph Boundary & Addressing Formula: Segment base addresses must start at a 16-byte Paragraph Boundary (ending in 0H). The 20-bit Physical Address = (Segment Register × 10H) + Offset Register.',
          '• Non-Overlapping Segmentation: Each active segment (CS, DS, SS, ES) occupies a completely distinct, isolated 64 KB memory block without sharing physical RAM addresses. This provides maximum security and prevents accidental stack overflow or data corruption.',
          '• Overlapping Segmentation: Two or more segments share physical RAM addresses partially or fully because segment bases can begin at any 16-byte Paragraph boundary. This conserves physical RAM in memory-constrained systems and lets segments share common data structures.'
        ],
        interactiveType: 'memory-calc'
      },
      {
        id: 'm3-s4',
        title: '3. 8086 Memory Banking (Even & Odd Banks)',
        moduleTitle: 'Module 3: Memory Segmentation',
        moduleId: 'm3',
        points: [
          '• Why Physical Memory is Divided into Even & Odd Banks: The 8086 CPU features a 16-bit data bus (D0–D15), but physical memory is byte-addressable (8-bit wide). Partitioning 1 MB physical RAM into two parallel 512 KB banks (Even Bank on D0–D7 & Odd Bank on D8–D15) allows the processor to read/write a single 8-bit byte from either bank independently in 1 cycle, or fetch a full 16-bit word from both banks concurrently in 1 single bus cycle.',
          '• Even Bank (Lower Bank - 512 KB): Contains all even physical memory addresses (00000H, 00002H, ..., FFFFEH). Connected to data bus lines D0–D7 and enabled when address bit A0 = 0.',
          '• Odd Bank (Upper Bank - 512 KB): Contains all odd physical memory addresses (00001H, 00003H, ..., FFFFFH). Connected to data bus lines D8–D15 and enabled when Bus High Enable BHE# = 0.',
          '• Memory Access Signal Control Table (BHE# & A0):',
          '  - BHE# = 0, A0 = 0 → 16-Bit Word Transfer at Even Address (1 cycle across D0–D15).',
          '  - BHE# = 1, A0 = 0 → 8-Bit Byte Transfer at Even Address (1 cycle across D0–D7).',
          '  - BHE# = 0, A0 = 1 → 8-Bit Byte Transfer at Odd Address (1 cycle across D8–D15).',
          '  - BHE# = 0, A0 = 1 (Misaligned 16-Bit Word at Odd Address) → Requires 2 memory cycles (Cycle 1: Odd byte on D8–D15; Cycle 2: Even byte on D0–D7).'
        ],
        interactiveType: 'memory-calc'
      },
      {
        id: 'm3-quiz',
        title: 'Module 3 Recap Quiz',
        moduleTitle: 'Module 3: Memory Segmentation',
        moduleId: 'm3',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'In an 8086 microprocessor, the current Code Segment (CS) register contains 3456H and the Instruction Pointer (IP) register contains abcH. What is the physical memory address of the instruction to be fetched?',
            options: ['34560H', '3E120H', '3501CH', '3501BH'],
            correctAnswer: 2,
            explanation: 'Using the 8086 address segmentation formula: Physical Address = (CS * 10H) + IP. Since CS = 3456H, CS * 10H = 34560H. Adding IP offset (abcH): 34560H + 0abcH = 3501CH.'
          },
          {
            question: 'Where in the 8086 1 MB physical memory address space do user logical segments (CS, DS, SS, ES) reside?',
            options: [
              'Inside the Interrupt Vector Table (00000H - 003FFH)',
              'Inside the System ROM BIOS (F0000H - FFFFFH)',
              'Inside the Transient Program Area / User RAM (00500H - 9FFFFH)',
              'Inside Video Buffer RAM (A0000H - BFFFFH)'
            ],
            correctAnswer: 2,
            explanation: 'Logical user segments (CS, DS, SS, ES) and programs are loaded dynamically into the Transient Program Area (TPA / User RAM), spanning 00500H to 9FFFFH (~638 KB).'
          },
          {
            question: 'What is the physical memory address range occupied by the Interrupt Vector Table (IVT) in the 8086?',
            options: ['00000H - 003FFH (1 KB)', '00400H - 004FFH (256 B)', 'A0000H - BFFFFH (128 KB)', 'F0000H - FFFFFH (64 KB)'],
            correctAnswer: 0,
            explanation: 'The Interrupt Vector Table (IVT) occupies the bottom 1 KB of physical memory (00000H to 003FFH) to store 256 ISR far pointers (4 bytes each).'
          },
          {
            question: 'What is the maximum size of a single memory segment in the 8086?',
            options: ['16 KB', '64 KB', '256 KB', '1 MB'],
            correctAnswer: 1,
            explanation: 'Since segment offsets are stored in 16-bit registers (2¹⁶ = 65,536 bytes), the maximum addressable boundary of any segment is exactly 64 KB.'
          },
          {
            question: 'What physical memory address does the 8086 CPU jump to immediately upon system reset or power-on?',
            options: ['00000H (IVT Vector 0)', '00400H (BIOS Data Area)', 'FFFF0H (System ROM BIOS Boot Vector)', 'A0000H (Video RAM Base)'],
            correctAnswer: 2,
            explanation: 'Upon power-on or hardware reset, CS is loaded with FFFFH and IP with 0000H, forming physical address FFFF0H located in System ROM BIOS (F0000H - FFFFFH).'
          },
          {
            question: 'What are the four segment registers in the 8086 Bus Interface Unit?',
            options: ['AX, BX, CX, DX', 'SP, BP, SI, DI', 'CS, DS, SS, ES', 'IP, flags, ALU, decoder'],
            correctAnswer: 2,
            explanation: 'The 8086 BIU defines four 16-bit segment registers: Code Segment (CS), Data Segment (DS), Stack Segment (SS), and Extra Segment (ES).'
          },
          {
            question: 'Why does the 8086 use memory segmentation?',
            options: ['To increase the physical memory capacity beyond 1 MB', 'To allow writing modular, relocatable programs within 64 KB segments and fit 16-bit registers', 'To run programs without a clock generator', 'To isolate software from hardware interrupts'],
            correctAnswer: 1,
            explanation: 'Memory segmentation allows the 16-bit internal architecture of 8086 to reference a larger 20-bit physical space using relocatable segments, where code, data, and stack are neatly separated.'
          }
        ]
      }
    ]
  },
  {
    id: 'm4',
    title: 'Module 4: 8086 Pin Configuration & Operating Modes',
    slides: [
      {
        id: 'm4-s1',
        title: '1. Pin Configuration Overview',
        moduleTitle: 'Module 4: 8086 Pin Configuration & Operating Modes',
        moduleId: 'm4',
        points: [
          'The Intel 8086 is housed in a 40-Pin Dual In-line Package (DIP) operating on a single +5V power supply.',
          'It contains multiplexed buses to save pin count (AD0-AD15 share Address and Data).',
          'Multiplexing: Pins transmit Address during the T1 clock state, and transition to transmit Data during T2, T3, and T4 states.',
          'Power Supply: Vcc (Pin 40, +5V DC) and GND (Pins 1 & 20).'
        ]
      },
      {
        id: 'm4-s2',
        title: '2. 8086 Pin Groupings & Functional Categories',
        moduleTitle: 'Module 4: 8086 Pin Configuration & Operating Modes',
        moduleId: 'm4',
        points: [
          'Broad Signal Classification: The 40 pins of the Intel 8086 IC are broadly categorized into 3 Major Operational Groups: (1) Common Signals (32 Pins), (2) Minimum Mode Signals (8 Pins), and (3) Maximum Mode Signals (8 Pins).',
          'Group 1: Common Signals (32 Pins): Pins 1–23 & 32–40 perform identical functions in both MIN & MAX modes. Includes AD0–AD15 (Pins 2–16, 39), A16/S3–A19/S6 (Pins 35–38), BHĒ/S7 (Pin 34), RD̄ (Pin 32), READY (22), RESET (21), CLK (19), INTR (18), NMI (17), TEST̄ (23), MN/MX̄ (33), VCC (40), and GND (1 & 20).',
          'Group 2: Minimum Mode Signals (8 Pins): Active on Pins 24–31 when MN/MX̄ = +5V (Single CPU mode). CPU outputs direct control strobes: INTĀ (24), ALE (25), DEN̄ (26), DT/R̄ (27), M/IŌ (28), WR̄ (29), HLDA (30), and HOLD (31).',
          'Group 3: Maximum Mode Signals (8 Pins): Active on Pins 24–31 when MN/MX̄ = 0V (Multiprocessor mode). Pins reconfigured for status lines S̄₀, S̄₁, S̄₂ (26–28 decoded by 8288 Bus Controller), Queue Status QS0, QS1 (24–25), LOCK̄ (29), and RQ̄/GT1̄, RQ̄/GT0̄ (30–31).',
          'Functional Sub-Groupings: Within these broad categories, pins are sub-grouped into Address/Data Bus (21 pins), Control (9/4 pins), Status (5/10 pins), System Control (6 pins), and Power Supply/CLK (4 pins).'
        ],
        interactiveType: 'pins'
      },
      {
        id: 'm4-s3',
        title: '3. Minimum Mode vs. Maximum Mode Environments',
        moduleTitle: 'Module 4: 8086 Pin Configuration & Operating Modes',
        moduleId: 'm4',
        points: [
          'MN/MX Pin Strapping: MN/MX (Pin 33) tied to +5V enables Minimum Mode; tied to GND (0V) enables Maximum Mode.',
          'Single CPU vs. Multi-Processor: Minimum Mode runs a single standalone CPU. Maximum Mode supports parallel co-processors (Intel 8087 Math NDP & 8089 I/O Processor).',
          'Bus Control Generation: Minimum Mode CPU generates control lines (ALE, DEN, DT/R, M/IO, RD, WR) directly. Maximum Mode requires an external Intel 8288 Bus Controller to decode CPU status bits (S0, S1, S2).',
          'Memory vs. I/O Addressing: Minimum Mode uses a single M/IO pin with RD/WR. Maximum Mode uses separate 8288 command lines: MRDC/MWTC for Memory and IORC/IOWC for I/O.'
        ],
        interactiveType: 'min-mode-hardware'
      },
      {
        id: 'm4-s4',
        title: '4. Key Differences: Minimum vs. Maximum Mode Summary',
        moduleTitle: 'Module 4: 8086 Pin Configuration & Operating Modes',
        moduleId: 'm4',
        points: [
          '1. Pin 33 (MN/MX): Tied to +5V for Minimum Mode; Tied to GND (0V) for Maximum Mode.',
          '2. Hardware Complexity: Minimum Mode needs NO external bus controller. Maximum Mode MANDATES the Intel 8288 Bus Controller chip.',
          '3. Dual-Function Pins (24–31): Minimum Mode provides INTA, ALE, DEN, DT/R, M/IO, WR, HLDA, HOLD. Maximum Mode reconfigures them to QS1, QS0, S0, S1, S2, LOCK, RQ/GT1, RQ/GT0.',
          '4. Bus Request & Arbitration: Minimum Mode uses simple HOLD/HLDA DMA lines. Maximum Mode uses bidirectional RQ/GT0 & RQ/GT1 Request/Grant lines plus LOCK signal.'
        ],
        interactiveType: 'modes'
      },
      {
        id: 'm4-quiz',
        title: 'Module 4 Recap Quiz',
        moduleTitle: 'Module 4: 8086 Pin Configuration & Operating Modes',
        moduleId: 'm4',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which pin on the Intel 8086 is used to switch between Minimum and Maximum operating modes?',
            options: ['ALE (Pin 25)', 'RESET (Pin 21)', 'MN/MX (Pin 33)', 'READY (Pin 22)'],
            correctAnswer: 2,
            explanation: 'The MN/MX (Minimum/Maximum) pin is connected to +5V for Minimum Mode or connected to Ground (0V) for Maximum Mode.'
          },
          {
            question: 'Why does the 8086 multiplex its address and data buses?',
            options: ['To speed up memory access operations', 'To reduce the physical pin count of the processor package, allowing a compact 40-pin layout', 'To bypass the need for an external clock', 'To allow the use of only 8-bit segment registers'],
            correctAnswer: 1,
            explanation: 'By multiplexing the lower 16 address lines with the 16 data lines (AD0 - AD15), the 8086 saves 16 pins, keeping the chip size in a standard 40-pin DIP layout.'
          },
          {
            question: 'What is the physical package configuration of the Intel 8086 microprocessor?',
            options: ['100-pin Flat Pack', '40-pin Dual In-line Package (DIP)', '68-pin Pin Grid Array (PGA)', '28-pin Small Outline Integrated Circuit (SOIC)'],
            correctAnswer: 1,
            explanation: 'The Intel 8086 is housed in a standard 40-pin Dual In-line Package (DIP) with 20 pins on each side.'
          },
          {
            question: 'What signal does the 8086 output to indicate that multiplexed pins AD0-AD15 contain a valid memory address?',
            options: ['DEN (Data Enable)', 'DT/R (Data Transmit/Receive)', 'ALE (Address Latch Enable)', 'INTR (Interrupt Request)'],
            correctAnswer: 2,
            explanation: 'The ALE (Address Latch Enable) signal goes high during the T1 state of a bus cycle, signaling external latches (e.g., 8282) to capture and hold the address.'
          },
          {
            question: 'Which chip is required in 8086 Maximum Mode to decode CPU status lines and generate bus controls?',
            options: ['Intel 8284 Clock Generator', 'Intel 8282 Address Latch', 'Intel 8288 Bus Controller', 'Intel 8255 PPI'],
            correctAnswer: 2,
            explanation: 'In Maximum Mode, status pins S0, S1, S2 are wired to an external Intel 8288 Bus Controller, which decodes the state and outputs clean bus control signals.'
          },
          {
            question: 'Which of the following status signal encodings represents an active Instruction Fetch bus cycle in Maximum Mode?',
            options: ['S2, S1, S0 = 100', 'S2, S1, S0 = 011', 'S2, S1, S0 = 111 (Passive)', 'S2, S1, S0 = 101'],
            correctAnswer: 1,
            explanation: 'In Maximum Mode, the status code S2, S1, S0 = 011 indicates a "Read Code Segment" or instruction fetch bus cycle.'
          },
          {
            question: 'What is the purpose of the LOCK signal in Maximum Mode?',
            options: ['To freeze the processor clock', 'To prevent other bus master controllers from gaining bus control during critical instructions', 'To lock the keyboard input', 'To secure memory segmentation boundaries'],
            correctAnswer: 1,
            explanation: 'The LOCK prefix instruction activates the active-low LOCK signal, preventing other processors or DMA controllers from taking over the system bus.'
          },
          {
            question: 'What do the Queue Status pins (QS0 and QS1) represent in Maximum Mode?',
            options: ['The speed of instruction fetching', 'The status of the BIU\'s instruction queue (Empty, Fetch first byte, Subsequent byte, or No operation)', 'The number of active memory segments', 'The priority of hardware interrupts'],
            correctAnswer: 1,
            explanation: 'QS0 and QS1 allow external coprocessors (like the 8087) to monitor the internal 8086 instruction queue and track when instructions are executed.'
          },
          {
            question: 'Which pin on the 8086 is used to synchronize slow memory or peripheral devices with the processor clock by inserting Wait states?',
            options: ['NMI (Non-Maskable Interrupt)', 'RESET', 'READY', 'ALE'],
            correctAnswer: 2,
            explanation: 'The READY pin allows slow memory or I/O devices to request additional time. If READY is pulled low, the 8086 inserts Wait states (Tw) to hold the bus until the device is ready.'
          }
        ]
      }
    ]
  },
  {
    id: 'm5',
    title: 'Module 5: System Timing & Bus Cycles',
    slides: [
      {
        id: 'm5-s1',
        title: '1. Understanding System Timing & Bus Cycles',
        moduleTitle: 'Module 5: System Timing & Bus Cycles',
        moduleId: 'm5',
        points: [
          'Minimum Mode Bus Timing: In Minimum Mode (MN/MX = +5V), the 8086 CPU directly generates control signals (ALE, DEN, DT/R, M/IO, RD, WR) across a 4 T-state bus cycle.',
          'Clock Cycle (T-state): The basic unit of time equal to one period of the system CLK oscillator input.',
          'Standard Bus Cycle (Machine Cycle): Time taken to perform one external access (Read/Write to Memory or I/O). Comprises 4 T-states (T1, T2, T3, T4).',
          'T1 (Address Phase): CPU places 20-bit physical address on multiplexed bus (AD0-AD15) and pulses ALE HIGH to latch address into external 8282 latches.',
          'T2 (Bus Turnaround): ALE drops LOW. RD/WR control lines transition LOW. DT/R selects data direction and DEN enables 8286 transceivers.',
          'T3 (Data Phase): Data transfer occurs over D0-D15. Slow devices pull READY line LOW to insert Wait States (Tw) between T3 and T4.',
          'T4 (Cycle Completion): RD/WR and DEN return HIGH, disabling transceivers and releasing the bus for the next cycle.',
          'Note on Maximum Mode: In Maximum Mode (MN/MX = GND), an external 8288 Bus Controller chip decodes the CPU status lines (S0, S1, S2) to output bus commands like MRDC (Memory Read), MWTC (Memory Write), IORC (I/O Read), and IOWC (I/O Write) instead.'
        ]
      },
      {
        id: 'm5-s2',
        title: '2. Interactive Waveform Timing Explorer (Memory & I/O Read/Write)',
        moduleTitle: 'Module 5: System Timing & Bus Cycles',
        moduleId: 'm5',
        points: [
          'Interactive Timing Waveforms: Visualizes CPU bus signal transitions across clock states (T1–T4) for Memory Read, Memory Write, I/O Read, and I/O Write bus cycles.',
          'Memory Operations (M/IO# = HIGH): Accesses RAM/ROM using 20-bit physical addresses. Active control signals are RD# (Memory Read) or WR# (Memory Write).',
          'I/O Operations (M/IO# = LOW): Accesses peripheral ports using 16-bit port addresses (IN / OUT instructions). Active control signals are RD# (I/O Read) or WR# (I/O Write).',
          'Address Latch Enable (ALE): Pulses HIGH during T1 to trigger external 8282 latches to capture multiplexed address lines (AD0–AD15) before data phase.',
          'Transceiver Control (DT/R# & DEN#): DT/R# sets data direction (0 for Read, 1 for Write) and DEN# enables 8286 transceivers during T2–T3.',
          'Maximum Mode Equivalents: Uses external 8288 Bus Controller to output MRDC# (Mem Read), MWTC# (Mem Write), IORC# (I/O Read), and IOWC# (I/O Write).'
        ],
        interactiveType: 'timing'
      },
      {
        id: 'm5-quiz',
        title: 'Module 5 Recap Quiz',
        moduleTitle: 'Module 5: System Timing & Bus Cycles',
        moduleId: 'm5',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'How many clock cycles (T-states) make up a standard 8086 machine bus cycle?',
            options: ['1', '2', '4', '8'],
            correctAnswer: 2,
            explanation: 'A basic 8086 bus cycle consists of 4 clock cycles (designated T1, T2, T3, and T4).'
          },
          {
            question: 'What signal goes high in the T1 cycle to tell external latches to hold the multiplexed address?',
            options: ['RD (Read)', 'ALE (Address Latch Enable)', 'DEN (Data Enable)', 'READY'],
            correctAnswer: 1,
            explanation: 'ALE (Address Latch Enable) pulses high during T1, signaling external latch ICs (like 8282) to latch and hold the 20-bit address.'
          },
          {
            question: 'During which clock state (T-state) of a bus cycle do the Read (RD) or Write (WR) signals transition to active-low?',
            options: ['T1', 'T2', 'T3', 'T4'],
            correctAnswer: 1,
            explanation: 'In the T2 clock state, control signals (RD/WR) go low, and data bus direction is established.'
          },
          {
            question: 'What are the status lines S3 and S4 encoded to represent during a bus cycle?',
            options: ['The interrupt vector type being serviced', 'The active segment register being accessed (CS, DS, SS, ES)', 'The speed of the external RAM chips', 'The number of instruction bytes in the queue'],
            correctAnswer: 1,
            explanation: 'Status pins S3 and S4 encode which segment register was used to generate the current physical address: 00=ES, 01=SS, 10=CS, 11=DS.'
          },
          {
            question: 'What is the purpose of the DEN (Data Enable) signal in 8086 timing?',
            options: ['To enable the address latch', 'To enable external bidirectional data transceivers (like the 8286)', 'To select memory or I/O', 'To request bus lock'],
            correctAnswer: 1,
            explanation: 'DEN is an active-low signal used to activate external transceivers to safely buffer and pass data onto the system bus without collision.'
          },
          {
            question: 'If the memory device is too slow to provide data during a read, in which clock state can "Wait" states (Tw) be inserted?',
            options: ['Between T1 and T2', 'Between T2 and T3', 'Between T3 and T4', 'After T4'],
            correctAnswer: 2,
            explanation: 'If the READY line is low at the start of T3, the MPU will insert one or more Wait states (Tw) between T3 and T4 to allow memory to settle.'
          }
        ]
      }
    ]
  },
  {
    id: 'm6',
    title: 'Module 6: 8086 Interrupts & Response',
    slides: [
      {
        id: 'm6-s1',
        title: '1. Introduction to 8086 Interrupts',
        moduleTitle: 'Module 6: 8086 Interrupts & Response',
        moduleId: 'm6',
        points: [
          'An interrupt is a hardware or software signal that halts current CPU program execution to perform a specialized service (ISR).',
          'Interrupt Service Routine (ISR): A custom program written to handle the specific interrupt event.',
          'Hardware Interrupts: NMI (Non-Maskable, Pin 17), INTR (Maskable, Pin 18).',
          'Software Interrupts: Triggered by executing INT instructions (e.g., INT 21H, INT 3).'
        ],
        interactiveType: 'intro-interrupts'
      },
      {
        id: 'm6-s2',
        title: '2. Interrupt Vector Table (IVT) & Response',
        moduleTitle: 'Module 6: 8086 Interrupts & Response',
        moduleId: 'm6',
        points: [
          'The first 1 KB of physical RAM (00000H - 003FFH) stores the 256 vector pointers.',
          'When an interrupt occurs: Flags are saved, IF & TF are cleared, Return CS and IP are saved to stack, and CS:IP loads new values from IVT.',
          'Formula: Vector RAM address = Interrupt Type * 4.'
        ],
        interactiveType: 'interrupts'
      },
      {
        id: 'm6-quiz',
        title: 'Module 6 Recap Quiz',
        moduleTitle: 'Module 6: 8086 Interrupts & Response',
        moduleId: 'm6',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Where is the Interrupt Vector Table (IVT) located in the 8086 memory map?',
            options: ['At the very end of memory (FFFF0H - FFFFFH)', 'In the middle segment (50000H - 503FFH)', 'At the very beginning (00000H - 003FFH)', 'Inside the CPU cache'],
            correctAnswer: 2,
            explanation: 'The IVT is hard-coded to reside in the lowest 1 KB of RAM, from physical addresses 00000H to 003FFH.'
          },
          {
            question: 'If the CPU receives a software INT 3, what IVT physical address does it read to fetch the ISR vector?',
            options: ['00003H', '0000CH (12)', '00008H', '00012H'],
            correctAnswer: 1,
            explanation: 'Since each interrupt type requires a 4-byte pointer, the address is Type * 4. Thus: Type 3 * 4 = 12 = 0000CH.'
          },
          {
            question: 'Which hardware pin on the 8086 is used for maskable external interrupt requests?',
            options: ['NMI (Pin 17)', 'INTR (Pin 18)', 'RESET (Pin 21)', 'READY (Pin 22)'],
            correctAnswer: 1,
            explanation: 'INTR is the Maskable Interrupt Request pin. It can be ignored if the software clears the Interrupt Flag (IF = 0).'
          },
          {
            question: 'What is the size in bytes of a single interrupt vector stored in the Interrupt Vector Table (IVT)?',
            options: ['1 byte', '2 bytes', '4 bytes', '8 bytes'],
            correctAnswer: 2,
            explanation: 'Each interrupt vector contains a 2-byte CS segment address and a 2-byte IP offset address, totaling exactly 4 bytes.'
          },
          {
            question: 'What is the maximum number of interrupt vectors supported by the 8086 microprocessor?',
            options: ['16', '64', '128', '256'],
            correctAnswer: 3,
            explanation: 'The 8086 architecture supports up to 256 distinct interrupt vectors (Types 0 through 255), filling the entire 1 KB IVT.'
          },
          {
            question: 'Which instruction is executed at the end of an Interrupt Service Routine (ISR) to return control back to the main program?',
            options: ['RET', 'RETI', 'IRET', 'HLT'],
            correctAnswer: 2,
            explanation: 'The IRET (Interrupt Return) instruction pops the IP, CS, and the Flag register back from the stack to resume original execution.'
          }
        ]
      }
    ]
  },
  {
    id: 'm7',
    title: 'Module 7: GATE Microprocessor Solved Exam Practice',
    slides: [
      {
        id: 'm7-s1',
        title: '1. GATE Microprocessor Exam Preparation',
        moduleTitle: 'Module 7: GATE Exam Practice',
        moduleId: 'm7',
        points: [
          'The Graduate Aptitude Test in Engineering (GATE) is a premium national-level competitive exam in India, testing in-depth conceptual and practical knowledge of microprocessors.',
          'Core 8086 syllabus areas tested in GATE include: Segmented-memory Physical Address calculations, Arithmetic overflows & status flags, Interrupt Vector Table (IVT) mapping, and memory system hardware interfacing.',
          'Memory Bank Interfacing (BHE and A0 pins) and bus cycles/timing parameters (T-states and Tw Wait states) are heavily featured in 1-mark and 2-mark GATE questions.',
          'This dedicated exam prep module aggregates authentic, past GATE microprocessor questions with comprehensive step-by-step mathematical solutions to boost academic performance.'
        ]
      },
      {
        id: 'm7-quiz',
        title: 'GATE Solved Practice Quiz',
        moduleTitle: 'Module 7: GATE Exam Practice',
        moduleId: 'm7',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'In an 8086 microprocessor, the current Code Segment (CS) register contains 3456H and the Instruction Pointer (IP) register contains 0ABCH. What is the computed physical memory address of the next instruction byte to be fetched?',
            options: ['34560H', '3E120H', '3501CH', '3501BH'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2005',
            explanation: 'To find the physical address, shift the CS value by 4 bits (multiply by 10H) and add the IP offset: CS * 10H = 34560H. Physical Address = 34560H + 0ABCH = 3501CH.'
          },
          {
            question: 'In an 8086 microprocessor, how many machine bus cycles are required to read a 16-bit word from an ODD physical memory address?',
            options: ['One bus cycle', 'Two bus cycles', 'Three bus cycles', 'Four bus cycles'],
            correctAnswer: 1,
            isGateQuestion: true,
            gateYear: 'GATE 2012',
            explanation: 'The 8086 memory is partitioned into Even (Lower) and Odd (Upper) byte banks. A 16-bit word starting at an odd address spans across a 16-bit boundary, meaning its lower byte resides in the odd bank and its upper byte resides in the next even address. The 8086 must perform two consecutive 8-bit bus cycles (one for each bank) to assemble the full 16-bit word.'
          },
          {
            question: 'Consider the execution of the instructions "MOV AL, 7FH" and "ADD AL, 01H" in an 8086 microprocessor. What are the resulting values of the Carry Flag (CF) and the Overflow Flag (OF)?',
            options: ['CF = 0, OF = 0', 'CF = 0, OF = 1', 'CF = 1, OF = 0', 'CF = 1, OF = 1'],
            correctAnswer: 1,
            isGateQuestion: true,
            gateYear: 'GATE 2004',
            explanation: '7FH (01111111B) represents +127 as an 8-bit signed integer. Adding 01H results in 80H (10000000B), which represents -128 in signed 8-bit notation. There is no unsigned carry out of the MSB, so CF = 0. However, adding two positive numbers (+127 and +1) produced a negative result (-128), which is a signed arithmetic overflow. Thus, OF = 1.'
          },
          {
            question: 'In an 8086 microprocessor system, the physical memory address space allocated for the complete Interrupt Vector Table (IVT) is:',
            options: ['00000H to 000FFH', '00000H to 003FFH', 'F0000H to FFFFFH', 'FFF00H to FFFFFH'],
            correctAnswer: 1,
            isGateQuestion: true,
            gateYear: 'GATE 2006',
            explanation: 'The 8086 supports 256 interrupts (Types 0 to 255). Since each interrupt vector consists of a 4-byte pointer (2 bytes for CS, 2 bytes for IP), the total memory required is 256 * 4 = 1024 bytes (1 KB). This table is hard-coded to reside at the beginning of memory, from physical addresses 00000H to 003FFH.'
          },
          {
            question: 'During a memory read cycle, if the READY pin of the 8086 is sampled low during T2 and T3, how are the "Wait" states (Tw) inserted by the microprocessor?',
            options: ['Prior to the T1 clock state', 'Between T2 and T3', 'Between T3 and T4', 'Immediately after T4'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2008',
            explanation: 'The 8086 samples the status of the READY pin during clock cycles T2 and T3. If the memory or external peripheral pulls READY low (indicating it is too slow to provide data), the microprocessor inserts extra "Wait states" (Tw) into the machine cycle between T3 and T4, delaying data transfer until the device can respond.'
          },
          {
            question: 'To interface an 8-bit EPROM memory chip to the lower bank of the 8086 memory system, which combination of signals must be decoded for the chip-select input?',
            options: ['A0 = 0 and BHE = 1', 'A0 = 0 and BHE = 0', 'A0 = 1 and BHE = 0', 'A0 = 1 and BHE = 1'],
            correctAnswer: 0,
            isGateQuestion: true,
            gateYear: 'GATE 2015',
            explanation: 'In the 8086, the lower byte bank contains all even addresses and is selected when A0 is active low (A0 = 0). The upper byte bank contains odd addresses and is selected when BHE is active low (BHE = 0). Therefore, to interface an 8-bit memory chip to the lower bank, we decode A0 = 0, and the upper bank is disabled, which means BHE = 1.'
          },
          {
            question: 'Which of the following 8086 registers can be used as pointer or index registers for indirect memory addressing (offset pointer calculation) within the Data Segment (DS) by default?',
            options: ['AX, BX, CX, DX', 'SP, BP, IP, FR', 'BX, SI, DI', 'CS, DS, SS, ES'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2011',
            explanation: 'In the 8086 microprocessor, general indirect memory addressing is restricted to the base register BX and the index registers SI and DI when addressing the Data Segment (DS) by default. The Base Pointer (BP) is also a pointer register, but it addresses the Stack Segment (SS) by default.'
          },
          {
            question: 'In the 8086 microprocessor, which segment register is associated with the Base Pointer (BP) by default when calculating the 20-bit physical address for an instruction such as "MOV AX, [BP + 08H]"?',
            options: ['Code Segment (CS)', 'Data Segment (DS)', 'Stack Segment (SS)', 'Extra Segment (ES)'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2009',
            explanation: 'By default, any memory addressing referencing the Base Pointer (BP) or Stack Pointer (SP) automatically uses the Stack Segment (SS) register to resolve the 20-bit physical address. In contrast, memory references using BX, SI, or DI target the Data Segment (DS) register by default.'
          },
          {
            question: 'Which of the following 16-bit registers in the 8086 microprocessor is automatically decremented or incremented by 2 during PUSH and POP execution cycles respectively?',
            options: ['Base Pointer (BP)', 'Stack Pointer (SP)', 'Source Index (SI)', 'Instruction Pointer (IP)'],
            correctAnswer: 1,
            isGateQuestion: true,
            gateYear: 'GATE 2013',
            explanation: 'The Stack Pointer (SP) register tracks the offset of the stack top within the Stack Segment (SS). During a PUSH instruction, SP is decremented by 2 to allocate space for a 16-bit word (since the stack grows downward). During a POP instruction, SP is incremented by 2 after retrieving the word.'
          },
          {
            question: 'In the Intel 8086 microprocessor, the size of the instruction prefetch queue is ____ bytes, while in the 8088 microprocessor, it is ____ bytes.',
            options: ['4, 6', '6, 4', '8, 6', '6, 8'],
            correctAnswer: 1,
            isGateQuestion: true,
            gateYear: 'GATE 2004',
            explanation: 'The 8086 has a 16-bit external data bus and features a 6-byte instruction prefetch queue. The 8088 has an 8-bit external data bus and features a smaller 4-byte instruction prefetch queue to coordinate with its narrower external bus.'
          }
        ]
      }
    ]
  },
  {
    id: 'm8',
    title: 'Module 8: Program Development Steps & Tools',
    slides: [
      {
        id: 'm8-s1',
        title: '8086 Program Development Steps',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        points: [
          '1. Specification & Design: Define the problem statement, write down inputs/outputs, and outline the core algorithm and flowchart.',
          '2. Assembly Coding: Translate the flowchart blocks into 8086 assembly instructions using a plain text editor (resulting in a file like program.asm).',
          '3. Assembling: Pass the .ASM source code through an assembler (MASM or TASM). It reads instructions, checks syntax, and produces an Object file (program.obj) along with a Listing file (program.lst) showing addresses and machine codes.',
          '4. Linking: Run a linker (LINK or TLINK) to merge multiple object files and resolve library dependencies, generating a final relocatable executable (program.exe).',
          '5. Execution & Debugging: Load the program into physical RAM or run it inside an emulator (DEBUG, emu8086) to monitor registers, flags, and memory to trace and fix any logical bugs.'
        ]
      },
      {
        id: 'm8-s2',
        title: 'Interactive 8086 Development Steps Lab',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        points: [
          'Visualise the complete compilation, linking, and execution pipeline of an 8086 assembly program.',
          'Step through the pipeline: Text Editor -> Assembler (MASM) -> Linker (LINK) -> Debugger/Emulator.',
          'Learn the intermediate file formats: see how .ASM generates .OBJ & .LST, which then link into .EXE.',
          'Use the Interactive Pipeline Simulator on the right to understand how each software tool prepares code for the CPU.'
        ],
        interactiveType: 'dev-pipeline'
      },
      {
        id: 'm8-s3',
        title: 'One-Pass vs Two-Pass Assemblers',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        points: [
          'Two-Pass Assembler: The standard design for assemblers like MASM or TASM. It scans the source code exactly twice to resolve forward references.',
          'Pass 1 (Symbol Table construction): The assembler scans the source file to build a "Symbol Table". It identifies all user-defined labels (like START, LOOP, NUM1) and assigns them relative offset addresses based on instruction sizes.',
          'Pass 2 (Machine Code Translation): The assembler re-scans the file from the top. Using the Symbol Table, it substitutes mnemonics with binary opcodes, translates labels into numeric offsets, and creates the Object file (.OBJ) and Listing file (.LST).',
          'One-Pass Assembler: Scans code once and translates directly. If it encounters a "forward reference" (a jump to a label defined later in the file), it must leave a blank placeholder and patch it later, making it less elegant for complex structures.'
        ],
        interactiveType: 'assembler-passes'
      },
      {
        id: 'm8-s3b',
        title: 'Assembler Outputs: .OBJ vs .LST Files',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        interactiveType: 'assembler-outputs',
        points: [
          'Object (.OBJ) File - Machine-Readable Output: The main binary file produced by the assembler containing translated machine instructions. It is NOT directly executable yet.',
          'What .OBJ Contains: (1) Translated binary machine code and constants. (2) Relocation Information (for segment linking). (3) Symbol Names (lists of external and public variables/labels to be resolved by the Linker). (4) Segment structures and sizing records.',
          'Listing (.LST) File - Human-Readable Log: An optional, highly detailed plain-text document created during assembly. It is extremely useful for debugging logical errors and verifying offset calculations.',
          'What .LST Contains: (1) Full Source Code printed side-by-side with computed offset addresses and translated Hex codes. (2) Symbol Table listing every variable, segment, label, and macro with its offset. (3) Warnings and syntax error messages with exact line numbers.'
        ]
      },
      {
        id: 'm8-s4',
        title: 'The Linker and Loader Roles',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        points: [
          'The Linker (LINK.EXE / TLINK.EXE): Merges separate Object (.OBJ) files into a single, relocatable Executable (.EXE). It resolves cross-module references and links library files (.LIB) containing pre-written subroutines.',
          'Relocation Dictionary: The Linker builds an EXE header containing a "Relocation Table". Because the starting address in RAM is unknown at link-time, addresses are kept relocatable.',
          'The Loader: A component of the Operating System (or DOS) that active-loads programs from disk into physical memory before run time.',
          'Loading & Relocation: The Loader finds free space in RAM, copies the program, and uses the Relocation Table to patch all segment-dependent addresses (CS, DS, SS) to map to their actual, physical memory positions.'
        ]
      },
      {
        id: 'm8-s5',
        title: 'DOS DEBUG Utility & Commands',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        points: [
          'DEBUG.EXE: The classic 8086 interactive software test utility used to execute, trace, and troubleshoot compiled executable and COM files directly on the processor.',
          'Core Inspection Commands: Use R (Registers) to dump or edit current general and segment registers, and D (Dump) / E (Enter) to view or write raw hex values in memory segments.',
          'Execution Commands: Use T (Trace) to single-step execution instruction-by-instruction (inspecting register updates after every step), and G (Go) to run code to a specific breakpoint or till completion.',
          'Utility Commands: Use A (Assemble) to write inline assembly instructions directly into memory, and U (Unassemble) to disassemble hex machine code back to readable assembly mnemonics.'
        ]
      },
      {
        id: 'm8-quiz',
        title: 'Module 8 Recap Quiz',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which of the following files is produced by the assembler and contains the translated binary code, but is not yet fully linked or directly executable?',
            options: ['program.asm', 'program.lst', 'program.obj', 'program.exe'],
            correctAnswer: 2,
            explanation: 'The assembler (MASM/TASM) translates source code into machine language and stores it in an Object file (.OBJ). However, this file is not yet executable because external references and starting memory offsets have not been resolved by the linker.'
          },
          {
            question: 'What is the primary function of a Linker (LINK / TLINK) in the 8086 software development process?',
            options: ['To compile plain text assembly instructions into binary codes', 'To combine multiple object (.OBJ) files and libraries into a single executable (.EXE) file', 'To execute the program and display error warnings', 'To format and print the source code listing'],
            correctAnswer: 1,
            explanation: 'The Linker takes one or more object files (.OBJ) and merges them, resolving memory starting points and subroutines, to produce a final, executable binary program (.EXE).'
          },
          {
            question: 'Which development file contains a complete side-by-side view of the original assembly code, translated hexadecimal machine codes, and memory offsets?',
            options: ['.ASM file', '.EXE file', '.OBJ file', '.LST (Listing) file'],
            correctAnswer: 3,
            explanation: 'The Listing file (.LST) is optionally created by the assembler to assist programmers. It shows the source code lines alongside their generated binary codes and memory segment offsets.'
          },
          {
            question: 'In the 8086 development workflow, which software tool is used to execute the code instruction-by-instruction, inspect register values, and modify memory content live for troubleshooting?',
            options: ['Text Editor', 'Assembler', 'Linker', 'Debugger / Emulator (like DEBUG or emu8086)'],
            correctAnswer: 3,
            explanation: 'The Debugger or Emulator allows developers to step through program execution one instruction at a time, checking register states (AX, BX, IP) and memory segments to track down logical bugs.'
          },
          {
            question: 'During the assembling phase using MASM, what is the primary objective of "Pass 1" of a Two-Pass Assembler?',
            options: [
              'To translate mnemonics into hexadecimal machine codes',
              'To build the Symbol Table by resolving the offsets of all user-defined variables and labels',
              'To link external library subroutines into the object file',
              'To load the relocatable binary directly into physical RAM'
            ],
            correctAnswer: 1,
            explanation: 'In a Two-Pass Assembler, Pass 1 is dedicated to scanning the source file to build the Symbol Table, identifying the size of each instruction, and determining the relative offset address of every label and variable.'
          },
          {
            question: 'Which software component is responsible for reading the relocation table header of a .EXE file, copying the code into free physical RAM, and updating the CS, DS, and SS segments dynamically?',
            options: ['The Text Editor', 'The Linker', 'The Loader', 'The Assembler'],
            correctAnswer: 2,
            explanation: 'The Loader (part of the OS runtime) is responsible for loading the relocatable executable from disk into a free region of physical RAM and dynamically adjusting segment register references (relocation) to point to actual memory bases.'
          },
          {
            question: 'In the classic DOS DEBUG interactive program, which command is used to single-step execution instruction-by-instruction to inspect registers and status flags live?',
            options: ['D (Dump)', 'T (Trace)', 'A (Assemble)', 'G (Go)'],
            correctAnswer: 1,
            explanation: 'The T (Trace) command in the DEBUG utility performs single-step execution, executing exactly one instruction, updating the Instruction Pointer (IP), and outputting the exact state of all MPU registers and status flags.'
          }
        ]
      }
    ]
  },
  {
    id: 'm9',
    title: 'Module 9: 8086 Addressing Modes',
    slides: [
      {
        id: 'm9-s1',
        title: 'Understanding 8086 Addressing Modes',
        moduleTitle: 'Module 9: 8086 Addressing Modes',
        moduleId: 'm9',
        points: [
          'Addressing Mode: The method by which an instruction specifies where its operand(s) are located (registers, memory, or immediate constants).',
          'Immediate Addressing: The operand is a constant value embedded directly inside the instruction byte stream (e.g., MOV AX, 1234H). Highly efficient.',
          'Register Addressing: Operands reside entirely in 16-bit or 8-bit general registers (e.g., MOV AX, BX). No memory bus access is required.',
          'Memory Addressing Modes: Accesses physical RAM by computing a 16-bit offset called Effective Address (EA). Examples include Direct, Indirect, Based, Indexed, Based-Indexed, and Relative Based-Indexed.',
          'Dynamic Memory Access: Combining base (BX, BP) and index (SI, DI) registers with constant displacements is critical for traversing arrays, matrices, and parameters on the stack.'
        ]
      },
      {
        id: 'm9-s2',
        title: 'Effective Address Calculation Lab',
        moduleTitle: 'Module 9: 8086 Addressing Modes',
        moduleId: 'm9',
        points: [
          'Effective Address (EA): The net 16-bit logical offset generated inside the instruction (EA = Base + Index + Displacement).',
          'Default Segment Selection: Memory calculations using base registers BX, SI, or DI target the Data Segment (DS) by default. References using BP target the Stack Segment (SS) by default.',
          'Segment Override Prefix: Forces the processor to use a specified segment rather than the default (e.g., MOV AL, ES:[BX] overrides DS with ES).',
          'Physical Address Translation: The BIU takes the selected 16-bit segment base, shifts it by 4 bits, and adds the computed 16-bit EA.',
          'Use the Interactive Addressing Mode Lab on the right to simulate calculations and see the physical mapping of memory addresses.'
        ],
        interactiveType: 'addressing-modes'
      },
      {
        id: 'm9-quiz',
        title: 'Module 9 Recap Quiz',
        moduleTitle: 'Module 9: 8086 Addressing Modes',
        moduleId: 'm9',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'By default, which segment register is used to calculate the 20-bit physical address for the memory operand in the instruction "MOV AL, [BP + SI + 05H]"?',
            options: ['Code Segment (CS)', 'Data Segment (DS)', 'Stack Segment (SS)', 'Extra Segment (ES)'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2009',
            explanation: 'Any instruction referencing the Base Pointer (BP) as part of its memory offset calculation targets the Stack Segment (SS) by default. In contrast, memory offsets using BX, SI, or DI target the Data Segment (DS) by default.'
          },
          {
            question: 'What is the Addressing Mode of the source operand in the instruction "MOV DX, [SI]"?',
            options: ['Direct Addressing', 'Register Addressing', 'Register Indirect Addressing', 'Indexed Addressing'],
            correctAnswer: 2,
            explanation: 'In "MOV DX, [SI]", the operand is in memory, and its 16-bit offset is contained inside the index register SI. This is called Register Indirect addressing.'
          },
          {
            question: 'What is the Effective Address (EA) of the memory operand in the instruction "MOV AX, [BX + DI + 2000H]" if BX = 1000H, DI = 0500H, and DS = 3000H?',
            options: ['1500H', '3500H', '33500H', '3500H (with DS override)'],
            correctAnswer: 1,
            explanation: 'The Effective Address (EA) is the 16-bit logical offset. EA = BX + DI + Displacement = 1000H + 0500H + 2000H = 3500H. Note that the segment register DS is used for the Physical Address calculation, but is not part of the logical EA.'
          },
          {
            question: 'In the instruction "MOV CL, ES:[BX]", what is the purpose of "ES:"?',
            options: ['It is an immediate operand', 'It represents an Extra Segment override prefix, directing the CPU to read from ES instead of the default DS segment', 'It is a register indirect operand pointing to the stack segment', 'It triggers a software interrupt vector'],
            correctAnswer: 1,
            explanation: 'By default, references to memory using BX target the Data Segment (DS). The "ES:" syntax is a Segment Override Prefix which explicitly directs the processor to calculate the physical address using the Extra Segment (ES) register instead.'
          }
        ]
      }
    ]
  },
  {
    id: 'm10',
    title: 'Module 10: 8086 Instruction Set',
    slides: [
      {
        id: 'm10-s1',
        title: '1. Introduction 📖',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'Understand the 8086 instruction set and instruction structure.',
          'Instruction: A command given to the microprocessor to perform a specific task or operation (e.g., addition, data movement, logic analysis).',
          'Instruction Set: The complete list of instructions that a microprocessor is designed to recognize and execute. The 8086 supports more than 20,000 instruction variations!',
          'Execution Flow: The 8086 decodes instruction bytes in its Execution Unit (EU) after the Bus Interface Unit (BIU) fetches them from memory into the prefetch queue.'
        ]
      },
      {
        id: 'm10-s2',
        title: '2. General 8086 Machine Instruction Format & Builder 🧩',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        interactiveType: 'instruction-builder',
        points: [
          '8. General 8086 Machine Instruction Format: An 8086 instruction may contain different fields depending on the instruction. Not every instruction contains every field. Length varies from 1 to 6 bytes.',
          'Format Layout: [ Prefix ] | [ Opcode ] | [ MOD ] | [ REG ] | [ R/M ] | [ Displacement ] | [ Immediate Data ]',
          'Prefix (Optional): Repeat (REP) or segment override prefix (e.g. CS:, ES:).',
          'Opcode (Required): Specifies the operation to perform (6-bit opcode + D & W status bits).',
          'MOD (Addressing Mode): 2-bit field specifying register mode or displacement length (0, 1, or 2 bytes).',
          'REG (Register): 3-bit field specifying a 16-bit or 8-bit register operand.',
          'R/M (Register/Memory): 3-bit field specifying target register or base/index displacement combination.',
          'Displacement (Optional): 8-bit or 16-bit memory address offset.',
          'Immediate Data (Optional): 8-bit or 16-bit constant data value embedded in machine code.',
          '9. Interactive Instruction Builder 🧩: Use the interactive tool on the right to select operations (MOV, ADD, SUB, INC, CMP), destination/source registers, or immediate values, dynamically construct assembly instructions, and run the 4-step CPU Decode pipeline (FETCH → DECODE OPCODE → IDENTIFY OPERANDS → EXECUTE).',
          '10. Quick Comparison: Opcode (What operation to perform), Operand (Data or location involved), Destination (Where result goes), Source (Where data comes from), Addressing Mode (How operand is accessed), Machine Code (CPU binary/hex representation).',
          '11. Remember 🧠: OPCODE = WHAT TO DO | OPERAND = ON WHAT TO DO | ADDRESSING MODE = HOW TO FIND OPERAND.',
          'Execution Flow: Assembly Language → Opcode + Operand(s) → Machine Code → 8086 Executes.',
          'Key Facts: 8086 instructions are variable length (1 to 6 bytes). Not every instruction contains all fields. The 8086 uses Little-Endian storage for multi-byte data.'
        ]
      },
      {
        id: 'm10-s3',
        title: '3. 8086 Instruction Set Architecture & Decoder Laboratory 🔬',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'Instruction Set Architecture: Microprocessor operations defined by opcode fields, operand specifications, and machine code layouts.',
          'Instruction Logic & General Syntax: Standard format [ OPCODE ] [ Destination ], [ Source ]. Specifies operation type, operand locations (registers, memory, immediate constants), and transfer directions in the 8086 Execution Unit.',
          'Execution & Operand Breakdown: Evaluates operands (register values, effective memory addresses, or immediate data), calculates results via the ALU or Bus Interface Unit (BIU), and updates destination locations.',
          'Status & Control Flags Affected: Operational flags (CF, ZF, SF, OF, AF, PF) automatically update based on execution outcomes (zero result, carry/borrow, sign bit, parity), while Control flags (IF, DF, TF) govern system interrupts and string operations.',
          'Format & Execution Comparison — NOT vs NEG: 1) Format: Both are single-operand unary instructions (NOT dest / NEG dest). 2) Mathematical Logic: NOT performs 1\'s complement (bitwise invert: ~x), whereas NEG performs 2\'s complement arithmetic negation (0 - x or ~x + 1). 3) Flags Execution: NOT does NOT affect any 8086 status flags (CF, ZF, SF, OF, AF, PF remain unchanged). In contrast, NEG updates all status flags (CF is set to 1 for any non-zero operand; OF is set if negating 80H / 8000H).',
          '8086 Instruction Grouping Architecture (9 Core Categories): 1) Data Copy / Transfer (`MOV`, `XCHG`, `XLAT`, `LEA`, `LDS/LES`, `PUSH`, `POP`), 2) Arithmetic (`ADD`, `SUB`, `MUL`, `DIV`, `INC`, `DEC`, `CMP`, `AAA`, `AAS`, `AAM`, `AAD`, `DAA`, `DAS`, `CBW`, `CWD`), 3) Logical (`AND`, `OR`, `NOT`, `NEG`, `XOR`, `TEST`), 4) Branch (`JMP`, `Jcc`, `CALL`, `RET`), 5) Loop (`LOOP`, `LOOPE`, `LOOPNE`, `JCXZ`), 6) Machine Control (`HLT`, `LOCK`, `NOP`, `ESC`, `WAIT`), 7) Flag Manipulation (`STC`, `CLC`, `CMC`, `STD`, `CLD`, `STI`, `CLI`, `LAHF`, `SAHF`), 8) Shift & Rotate (`SHL`, `SAL`, `SHR`, `SAR`, `ROL`, `ROR`, `RCL`, `RCR`), 9) String & Port (`MOVS`, `LODS`, `STOS`, `CMPS`, `SCAS`, `REP`, `IN`, `OUT`). Note: BCD & ASCII adjust opcodes are architecturally part of Category 2 (Arithmetic), but featured in a dedicated 10th tab in the simulator for lab practice.',
          'Key Assembly & Architectural Rules: 1) Both operands cannot be memory locations simultaneously (e.g., MOV [BX], [DI] is illegal). 2) Operand sizes must strictly match (8-bit with 8-bit, 16-bit with 16-bit). 3) Segment registers (CS, DS, SS, ES) cannot receive immediate values directly. 4) Code Segment (CS) cannot be a destination register in MOV instructions.',
          'Interactive Bitwise & Hardware Trace: Simulates 8086 EU operations, dynamic addressing mode evaluation, bit-level shifts/rotations (SHL, SHR, SAR, ROL, ROR, RCL, RCR), and live register file updates.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-s4',
        title: '4. 8086 Instruction Groups Breakdown 📚',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'The 8086/8088 instructions are structured into 9 core functional categories:',
          '1. **Data Copy / Transfer**: `MOV Destination, Source` | `XCHG Destination, Source` | `XLAT` | `LEA Destination, Source` | `LDS/LES Destination, Source` | `PUSH Source` | `POP Destination`',
          '2. **Arithmetic**: `ADD Destination, Source` | `ADC Destination, Source` | `SUB Destination, Source` | `SBB Destination, Source` | `MUL Source` | `IMUL Source` | `DIV Source` | `IDIV Source` | `INC Destination` | `DEC Destination` | `CMP Destination, Source` | `AAA` | `AAS` | `AAM` | `AAD` | `DAA` | `DAS` | `CBW` | `CWD`',
          '3. **Logical**: `AND Destination, Source` | `OR Destination, Source` | `NOT Destination` | `NEG Destination` | `XOR Destination, Source` | `TEST Destination, Source`',
          '4. **Branch Instructions (See Full Summary Table Below)**: `JMP`, `CALL` (NEAR & FAR), `RET` (`RETN` & `RETF`), `INT/IRET`, Unsigned Jumps (`JA`/`JNBE`, `JAE`/`JNB`/`JNC`, `JB`/`JNAE`/`JC`, `JBE`/`JNA`), Signed Jumps (`JG`/`JNLE`, `JGE`/`JNL`, `JL`/`JNGE`, `JLE`/`JNG`), Single Flag (`JE`/`JZ`, `JNE`/`JNZ`, `JS`/`JNS`, `JO`/`JNO`, `JP`/`JPE`, `JNP`/`JPO`), & Loop (`LOOP`, `LOOPE`, `LOOPNE`, `JCXZ`).',
          'Subroutine Transfer Opcodes — NEAR CALL vs FAR CALL Mechanics: 1) NEAR CALL (Intra-Segment Transfer): Target opcode resides within the current 64KB Code Segment (CS). CPU pushes ONLY the 16-bit Return Offset (IP) onto stack RAM (SP ← SP - 2); CS is unchanged. Paired with 2-byte return opcode RET / RETN (C3H). 2) FAR CALL (Inter-Segment Transfer): Target opcode resides in a different 64KB Code Segment (CS). CPU pushes BOTH 16-bit CS and 16-bit IP onto stack RAM (SP ← SP - 4); CS is reloaded with new target segment base. Paired with 4-byte return opcode RETF (CBH).',
          '5. **Loop**: `LOOP Target` | `LOOPE Target` | `LOOPNE Target` | `JCXZ Target`',
          '6. **Machine Control**: `HLT` | `LOCK` | `NOP` | `ESC External Opcode, Source` | `WAIT`',
          '7. **Flag Manipulation**: `STC` | `CLC` | `CMC` | `STD` | `CLD` | `STI` | `CLI` | `LAHF` | `SAHF`',
          '8. **Shift & Rotate**: `SHL Destination, Count` | `SAL Destination, Count` | `SHR Destination, Count` | `SAR Destination, Count` | `ROL Destination, Count` | `ROR Destination, Count` | `RCL Destination, Count` | `RCR Destination, Count`',
          '9. **String & Port**: `MOVS/MOVSB/MOVSW` | `LODS` | `STOS` | `CMPS` | `SCAS` | `REP` | `IN Accumulator, Port` | `OUT Port, Accumulator`',
          'Note on Interactive Simulator Tabs: The 8086 CPU architecture formally defines 9 core groups (with BCD/ASCII adjust opcodes integrated into Group 2 Arithmetic). For interactive laboratory experimentation, the simulator displays BCD & ASCII as a 10th dedicated category tab.',
          'Interactive Groups Explorer: Review each instruction group\'s key opcodes, primary functions, flag effects, and assembly usage.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-quiz',
        title: 'Module 10 Recap Quiz',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which of the following instructions is physically illegal in the 8086 microprocessor architecture?',
            options: ['MOV AX, [BX]', 'MOV [BX], [DI]', 'MOV DS, AX', 'MOV AL, [SI + 02H]'],
            correctAnswer: 1,
            explanation: 'The 8086 does not support memory-to-memory data transfers directly. "MOV [BX], [DI]" is illegal because both operands cannot refer to memory locations in a single instruction. You must first load the source value into a register, then store it.'
          },
          {
            question: 'What happens to the Carry Flag (CF) when the "INC CX" instruction is executed in an 8086 processor?',
            options: ['CF is set to 1 if CX overflows from FFFFH to 0000H', 'CF is unaffected because INC and DEC instructions do not alter the Carry Flag', 'CF is always cleared to 0', 'CF is set to the value of the auxiliary carry flag'],
            correctAnswer: 1,
            explanation: 'In the 8086 instruction set, the INC (Increment) and DEC (Decrement) instructions do NOT affect the Carry Flag (CF). They do affect other status flags like ZF, SF, OF, PF, and AF, but the Carry Flag is explicitly preserved.'
          },
          {
            question: 'Which of the following shift instructions preserves the sign bit (most significant bit) of the operand, allowing for signed division?',
            options: ['SHL (Shift Left)', 'SHR (Shift Right)', 'SAR (Shift Arithmetic Right)', 'ROL (Rotate Left)'],
            correctAnswer: 2,
            explanation: 'SAR (Shift Arithmetic Right) shifts bits to the right, but instead of inserting a 0 at the MSB (like SHR does), it duplicates the current sign bit (MSB). This preserves the arithmetic sign of signed numbers.'
          },
          {
            question: 'What are the default segment registers used by the source index (SI) and destination index (DI) in string instructions (like MOVSB)?',
            options: ['SI uses DS; DI uses ES', 'SI uses DS; DI uses SS', 'SI uses CS; DI uses ES', 'SI uses ES; DI uses DS'],
            correctAnswer: 0,
            explanation: 'In 8086 string operations, the source operand is always pointed to by SI and is located in the Data Segment (DS) by default. The destination operand is always pointed to by DI and is strictly located in the Extra Segment (ES).'
          },
          {
            question: 'Which instruction clears the Direction Flag (DF) to ensure that SI and DI increment automatically during string operations?',
            options: ['STD', 'CLD', 'CLI', 'CLC'],
            correctAnswer: 1,
            explanation: 'CLD (Clear Direction Flag) sets DF = 0, which directs the 8086 string execution logic to automatically increment SI and DI after each step. STD sets DF = 1, which causes them to decrement.'
          },
          {
            question: 'What occurs when the CPU attempts to execute a "DIV CX" instruction but the divisor in CX is 0000H?',
            options: ['The instruction is ignored and the program continues', 'The division result is set to FFFFH and Carry is set', 'The CPU instantly triggers a Type 0 (Divide by Zero) hardware interrupt exception', 'The CPU halts execution permanently'],
            correctAnswer: 2,
            explanation: 'When a division by zero is attempted on the 8086, the processor automatically suspends normal execution and executes a Type 0 (Divide by Zero) interrupt exception handler to safely deal with the mathematical error.'
          },
          {
            question: 'Which physical address formula does the 8086 CPU use to fetch the translated byte during the execution of the "XLAT" instruction?',
            options: ['DS:[BX + AL]', 'ES:[SI + AL]', 'DS:[BP + AL]', 'SS:[SP + AL]'],
            correctAnswer: 0,
            explanation: 'The XLAT instruction calculates the lookup address by adding the unsigned index in AL to the base offset in BX, accessing the Data Segment (DS) by default. Therefore, the physical memory location accessed is DS:[BX + AL].'
          },
          {
            question: 'In the 8086 microprocessor stack architecture, what micro-steps occur when the instruction "PUSH AX" is executed?',
            options: ['SP is incremented by 2, then AX is written to SS:[SP]', 'SP is decremented by 2, then the 16-bit word in AX is written to SS:[SP]', 'AX is written to memory, then SP is set to 0000H', 'SP is decremented by 1, then AL is written'],
            correctAnswer: 1,
            explanation: 'The 8086 stack grows DOWNWARDS towards lower memory addresses. Executing PUSH AX first decrements SP by 2 (SP ← SP - 2), and then writes the 16-bit word from AX into memory at location SS:[SP].'
          },
          {
            question: 'Where is the Base of the Stack (BOS) located relative to the Top of the Stack (TOS) in the 8086 memory architecture as items are pushed?',
            options: ['Base of Stack is at a LOWER memory address than Top of Stack', 'Base of Stack is at a HIGHER memory address than Top of Stack because the stack grows downward', 'Base of Stack and Top of Stack are always at the exact same address', 'Base of Stack resides in the Extra Segment (ES) while TOS resides in Code Segment (CS)'],
            correctAnswer: 1,
            explanation: 'Because the 8086 stack grows downward from high offsets to low offsets, the Base of the Stack (initial maximum SP) sits at a HIGHER memory address, while the Top of the Stack (current SP) moves to LOWER memory addresses as data is pushed.'
          }
        ]
      }
    ]
  },
  {
    id: 'm11',
    title: 'Module 11: Assembler Directives',
    slides: [
      {
        id: 'm11-s1',
        title: 'Definition of Assembler Directives',
        moduleTitle: 'Module 11: Assembler Directives',
        moduleId: 'm11',
        points: [
          'What are Assembler Directives?: Also called pseudo-instructions, these are special commands embedded in the source code meant solely for the assembler (MASM/TASM).',
          'Purpose & Role: They guide the compiler during translation, controlling segment allocation, memory layout, symbol definitions, and assembly processes.',
          'No Machine Code Generation: Unlike CPU instructions (e.g., MOV, ADD), assembler directives do NOT produce executable binary CPU opcodes or runtime machine instructions.',
          'Assembly vs Directives: Instructions tell the 8086 processor what operations to execute at runtime, whereas directives tell the assembler software how to assemble the program at compile-time.'
        ]
      },
      {
        id: 'm11-s2',
        title: 'Types of Assembly Programming Styles',
        moduleTitle: 'Module 11: Assembler Directives',
        moduleId: 'm11',
        points: [
          '8086 Program Formats: 8086 assembly source code can be written in three distinct programming styles: 1) Standard Segment-Ends Style, 2) Simplified Dot-Model Style, and 3) Tiny .COM Program Style.',
          '1. Standard Segment Style (EXE): Explicitly frames memory sections using logical "SEGMENT" and "ENDS" boundary identifiers. Requires the compile-time "ASSUME" directive to validate register bounds and manual runtime DS register loading via: MOV AX, DATA_SEG followed by MOV DS, AX.',
          '2. Simplified Dot-Model Style (EXE): Replaces verbose wrappers with modern shortcuts (.MODEL, .STACK, .DATA, .CODE). Automatically pre-configures segment mappings based on the chosen memory model size directive.',
          '3. Tiny .COM Style (Single Segment): Utilizes ".MODEL TINY" to merge the code, data, and stack into a single unified 64KB physical memory segment. The OS automatically sets CS = DS = SS = ES upon loading.'
        ],
        interactiveType: 'directive-sandbox'
      },
      {
        id: 'm11-s2b',
        title: '8086 Memory Models (.MODEL Directive) 🧠',
        moduleTitle: 'Module 11: Assembler Directives',
        moduleId: 'm11',
        points: [
          'The .MODEL Directive: Specifies memory layout, segment counts, and address space limits for code and data segments in simplified dot-model programs (Syntax: .MODEL <Size>).',
          '1. TINY Model: Code + Data + Stack all share ONE unified 64KB segment. Generates lightweight DOS .COM executables where CS = DS = SS = ES.',
          '2. SMALL Model: One dedicated 64KB Code Segment + One dedicated 64KB Data Segment (128KB total program limit). Standard default for 8086 programs.',
          '3. MEDIUM Model: Code spans MULTIPLE segments (>64KB total code), while Data is restricted to ONE single 64KB segment.',
          '4. COMPACT Model: Code is restricted to ONE single 64KB segment, while Data spans MULTIPLE segments (>64KB total data).',
          '5. LARGE Model: Both Code and Data span MULTIPLE 64KB segments. Individual data arrays are capped at 64KB each.',
          '6. HUGE Model: Multiple Code and Data segments, AND single data structures or arrays CAN exceed 64KB by performing segment arithmetic.',
          'Interactive Simulator: Use the "Memory Models" tab in our Directive Sandbox on the right to compare visual memory model layouts and segment structures!'
        ],
        interactiveType: 'directive-sandbox'
      },
      {
        id: 'm11-s2c',
        title: 'Comparison of NEAR & FAR Subroutine Calls (PROC & PTR Directives) 📞',
        moduleTitle: 'Module 11: Assembler Directives',
        moduleId: 'm11',
        points: [
          'Subroutine Scope & Boundary: PROC NEAR defines an intra-segment subroutine within the current 64KB Code Segment. PROC FAR defines an inter-segment subroutine located in a separate 64KB Code Segment.',
          'Stack Frame Push Comparison: A NEAR call pushes 2 bytes (16-bit IP offset) onto stack RAM. A FAR call pushes 4 bytes (16-bit CS segment address first, followed by 16-bit IP offset).',
          'Target Address Structure: NEAR calls require only a 16-bit offset destination (IP). FAR calls require a full 32-bit pointer destination (CS:IP segment:offset).',
          'Return Execution (RETN vs RETF): NEAR RET pops 2 bytes back into IP and increments SP by 2. FAR RET pops 4 bytes back into IP and CS and increments SP by 4.',
          'Type Coercion Operator (PTR): "CALL NEAR PTR Label" forces a 16-bit intra-segment jump opcode; "CALL FAR PTR Label" forces a 32-bit inter-segment jump opcode.',
          'Memory Model Defaults: Subroutines default to NEAR under .MODEL TINY, SMALL, and COMPACT. Subroutines default to FAR under .MODEL MEDIUM, LARGE, and HUGE.',
          'Performance & Memory Trade-offs: NEAR calls execute faster and consume half the stack overhead (2 vs 4 bytes), whereas FAR calls allow modular code organization across multiple 64KB code segments.'
        ],
        interactiveType: 'directive-sandbox'
      },
      {
        id: 'm11-quiz',
        title: 'Module 11 Recap Quiz',
        moduleTitle: 'Module 11: Assembler Directives',
        moduleId: 'm11',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'What is the primary difference between an 8086 CPU instruction (like MOV or ADD) and an Assembler Directive?',
            options: [
              'Instructions guide the assembler at compile time, while directives execute in the ALU at runtime',
              'Directives are pseudo-instructions that guide the assembler during compilation and do NOT produce CPU machine code, whereas instructions produce executable opcodes',
              'Directives are executed by the 8087 math co-processor',
              'There is no difference between instructions and directives'
            ],
            correctAnswer: 1,
            explanation: 'Assembler directives (pseudo-instructions) are directives for the assembler software (e.g. MASM/TASM) during translation and produce no executable CPU machine code, whereas CPU instructions are translated directly into binary opcodes.'
          },
          {
            question: 'Which 8086 memory model restricts code to a single 64KB segment, but allows data to span MULTIPLE segments using FAR pointers?',
            options: ['SMALL Model', 'MEDIUM Model', 'COMPACT Model', 'TINY Model'],
            correctAnswer: 2,
            explanation: 'In the COMPACT memory model, code is restricted to one 64KB segment (using NEAR calls), while data can span multiple data segments using 32-bit FAR pointers.'
          },
          {
            question: 'In which 8086 memory model can a single large array or data structure exceed the 64KB segment size boundary?',
            options: ['LARGE Model', 'MEDIUM Model', 'HUGE Model', 'SMALL Model'],
            correctAnswer: 2,
            explanation: 'The HUGE memory model allows both multiple code/data segments AND permits single arrays to exceed 64KB by automatically handling segment arithmetic.'
          },
          {
            question: 'Which of the following programming styles merges code, data, and stack into a single 64KB physical segment where CS = DS = SS = ES?',
            options: ['Standard Segment Style (explicit SEGMENT/ENDS)', 'Simplified Dot-Model Style (.MODEL SMALL)', 'Tiny .COM Style (.MODEL TINY)', 'None of the above'],
            correctAnswer: 2,
            explanation: 'In Tiny .COM style (.MODEL TINY), code, data, and stack all share a single unified 64KB physical segment, and the operating system automatically sets CS, DS, SS, and ES to the same base address upon loading.'
          },
          {
            question: 'What are the three primary assembly programming styles in 8086 software development?',
            options: [
              'RISC Style, CISC Style, and Microcode Style',
              'Standard Segment-Ends Style, Simplified Dot-Model Style, and Tiny .COM Program Style',
              'Direct Style, Indirect Style, and Relative Style',
              'High-Level Style, Low-Level Style, and Machine Style'
            ],
            correctAnswer: 1,
            explanation: 'The three programming styles for 8086 programs are Standard Segment-Ends Style (explicit SEGMENT/ENDS), Simplified Dot-Model Style (.MODEL shortcuts), and Tiny .COM Program Style (.MODEL TINY).'
          },
          {
            question: 'During the execution of a FAR CALL instruction in the 8086 CPU, what values are pushed onto the Stack?',
            options: [
              'Only the 16-bit Instruction Pointer (IP)',
              'Only the 16-bit Code Segment (CS)',
              'Both the 16-bit CS register and the 16-bit IP register (4 bytes total)',
              'Both AX and BX registers'
            ],
            correctAnswer: 2,
            explanation: 'A FAR call is an inter-segment call to a subroutine in a different code segment. Therefore, the 8086 CPU must save both the current Code Segment (CS) and Instruction Pointer (IP) onto the stack so it can return back to the caller segment.'
          },
          {
            question: 'How many bytes are popped from the stack when a procedure declared as "PROC NEAR" completes execution via a RET instruction?',
            options: ['1 Byte', '2 Bytes (16-bit IP)', '4 Bytes (32-bit CS:IP)', '8 Bytes'],
            correctAnswer: 1,
            explanation: 'A NEAR procedure resides in the same 64KB code segment. When it completes, the RET instruction pops only the saved 16-bit Instruction Pointer (IP) from the stack, which consumes 2 bytes.'
          }
        ]
      }
    ]
  },
  {
    id: 'm12',
    title: 'Module 12: Writing Simple Programs',
    slides: [
      {
        id: 'm12-s1',
        title: 'Simple Arithmetic Programs (Addition, Subtraction, Multiplication & Division)',
        moduleTitle: 'Module 12: Writing Simple Programs',
        moduleId: 'm12',
        points: [
          '8086 arithmetic programming is register-intensive and follows systematic load, process, and store execution cycles using physical memory.',
          'Program 1: 16-Bit Unsigned Addition: Loads two 16-bit operands into AX and BX using MOV, executes ADD AX, BX, updates status flags (ZF, CF, SF), and stores the result to memory at location 1004H.',
          'Program 2: 16-Bit Unsigned Subtraction: Loads minuend and subtrahend into AX and BX, executes SUB AX, BX, sets the borrow flag (CF=1) if underflow occurs, and stores the 16-bit difference to memory.',
          'Program 3: 16-Bit Unsigned Multiplication: Loads multiplicand into AX and multiplier into BX, executes MUL BX (AX × BX), generating a 32-bit product stored across DX (High Word) and AX (Low Word).',
          'Program 4: 16-Bit Unsigned Division: Clears high word DX (XOR DX, DX), loads dividend into AX and divisor into BX, executes DIV BX (DX:AX ÷ BX), resulting in quotient in AX and remainder in DX.'
        ]
      },
      {
        id: 'm12-s2',
        title: '8086 Assembly Emulator & Debugger',
        moduleTitle: 'Module 12: Writing Simple Programs',
        moduleId: 'm12',
        points: [
          'An Emulator mimics the 8086 hardware, allowing execution of instructions without physical IC hardware.',
          'Single Step Debugging: Runs exactly one instruction cycle, letting you inspect registers (AX, BX, CX, DX) and pointers (IP) after each step.',
          'Register Monitoring: Track variables stored inside 16-bit general registers or their 8-bit split halves.',
          'Flag Status: Zero Flag (ZF), Carry Flag (CF), and Sign Flag (SF) update interactively after each arithmetic instruction.',
          'Explore our Live 8086 Assembly Playground on the right! Select a template, run instructions step-by-step, and see register changes.'
        ],
        interactiveType: 'assembler-playground'
      },
      {
        id: 'm12-quiz',
        title: 'Module 12 Recap Quiz',
        moduleTitle: 'Module 12: Writing Simple Programs',
        moduleId: 'm12',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which register is automatically decremented by 1 when the "LOOP label" instruction is executed in 8086 assembly language?',
            options: ['AX', 'BX', 'CX', 'DX'],
            correctAnswer: 2,
            explanation: 'The LOOP instruction uses the CX register (Count register) as its counter. Each time LOOP executes, the CPU automatically decrements CX by 1. If CX is not 0, it jumps to the target label; otherwise, it falls through.'
          },
          {
            question: 'In string copy instructions such as MOVSB, which register pair is used to hold the starting addresses of the Source and Destination strings respectively?',
            options: ['BX and DX', 'SP and BP', 'SI (Source Index) and DI (Destination Index)', 'AX and CX'],
            correctAnswer: 2,
            explanation: '8086 string instructions require SI (Source Index) to point to the source string relative to the Data Segment (DS), and DI (Destination Index) to point to the destination relative to the Extra Segment (ES).'
          },
          {
            question: 'Which instruction should be executed before string operations to ensure that the SI and DI index registers automatically INCREMENT (step forward) during string operations?',
            options: ['STD (Set Direction Flag)', 'CLD (Clear Direction Flag)', 'STI (Set Interrupt Flag)', 'CLI (Clear Interrupt Flag)'],
            correctAnswer: 1,
            explanation: 'CLD (Clear Direction Flag) clears DF to 0, which directs string instructions (like MOVSB/MOVSW) to automatically increment SI and DI after processing. In contrast, STD sets DF to 1, causing SI and DI to decrement.'
          },
          {
            question: 'What is the primary advantage of single-step execution in an 8086 software emulator or debugger when running assembly programs?',
            options: [
              'It automatically fixes syntax errors in the source code',
              'It executes one instruction at a time, allowing developers to inspect register values (AX, BX, SP) and flag states after each step',
              'It converts assembly code directly into high-level C++ source code',
              'It doubles the hardware clock speed of the physical processor'
            ],
            correctAnswer: 1,
            explanation: 'Single-step execution executes exactly one machine instruction at a time, enabling developers to observe real-time register updates, memory writes, and status flag changes step by step.'
          }
        ]
      }
    ]
  },
  {
    id: 'm13',
    title: 'Module 13: Semiconductor Memory Interfacing (RAM & ROM)',
    slides: [
      {
        id: 'm13-s1',
        title: '1. Memory Hierarchy & System Storage Pyramid 🏗️',
        moduleTitle: 'Module 13: Semiconductor Memory Interfacing (RAM & ROM)',
        moduleId: 'm13',
        interactiveType: 'memory-interfacing',
        points: [
          'Memory Hierarchy Structure: System memory is organized hierarchically based on speed, capacity, and cost per bit: CPU Internal Registers → Cache Memory (L1/L2 SRAM) → Main Memory (RAM/ROM) → Secondary Storage (Flash/Disk).',
          'Speed vs Capacity vs Cost Trade-off: Moving down the hierarchy, access latency increases (from <1ns for internal CPU registers to ~10-50ns for RAM and ms for disks), storage capacity expands exponentially, and cost per bit drops.',
          'Volatile vs Non-Volatile Memory: Volatile memory (RAM) loses stored contents instantly when system power is switched off. Non-Volatile memory (ROM, PROM, EPROM, Flash) retains firmware, boot code, and interrupt vectors permanently.',
          'Locality of Reference: Temporal locality (recently accessed data is likely accessed again soon) and Spatial locality (nearby memory addresses are accessed sequentially) optimize hierarchical memory performance.',
          'Role in 8086 Microprocessor Systems: Internal 8086 registers (AX, BX, CS, IP, SP) provide zero-wait-state data manipulation, while external 1 MB physical memory (RAM + ROM) holds system software and data structures.'
        ]
      },
      {
        id: 'm13-s2',
        title: '2. Types of Semiconductor Memories: RAM, ROM & Flash ⚡',
        moduleTitle: 'Module 13: Semiconductor Memory Interfacing (RAM & ROM)',
        moduleId: 'm13',
        interactiveType: 'memory-interfacing',
        points: [
          'Static RAM (SRAM): Built using 6-transistor flip-flop cells. SRAM is extremely fast (~10ns), requires no refresh cycles, but has lower storage density and higher power consumption. Used for cache and high-speed system RAM.',
          'Dynamic RAM (DRAM): Uses 1 transistor + 1 storage capacitor per bit. Highly dense and low-cost, but leaky capacitors require periodic refresh cycles (~every 2ms-64ms) handled by a DRAM controller. Used for main system memory.',
          'Read-Only Memory (ROM & PROM): Mask ROM is permanently programmed during chip fabrication. Programmable ROM (PROM) is field-programmed once by blowing tiny internal fusible links using high voltage pulses.',
          'Erasable PROMs (EPROM & EEPROM): EPROM (e.g. 2764) is erased by exposing its silicon wafer to ultraviolet (UV) light through a quartz window. EEPROM allows byte-level electrical erasing and in-circuit reprogramming.',
          'Flash Memory: High-density non-volatile memory erased and rewritten in sector blocks. Combines the electrical erase flexibility of EEPROM with the high integration density of DRAM. Standard for modern BIOS/firmware.'
        ]
      },
      {
        id: 'm13-s3',
        title: '3. 8086 Semiconductor Memory Interfacing & Bus Connections 💾',
        moduleTitle: 'Module 13: Semiconductor Memory Interfacing (RAM & ROM)',
        moduleId: 'm13',
        interactiveType: 'memory-interfacing',
        points: [
          'Memory Interfacing Fundamentals: Primary memory interfacing involves connecting RAM (SRAM/DRAM for data, stack, variables) and ROM (EPROM/Flash for BIOS firmware) to 8086 address, data, and control buses.',
          '8086 Memory Address Space: The 8086 features a 20-bit address bus (A0-A19), allowing it to address up to 1 MB (1,048,576 bytes) of physical memory spanning from 00000H to FFFFFH.',
          'Address Decoding Circuits: Higher-order address lines (e.g. A17-A19 or A14-A19) are decoded using 3-to-8 decoders (such as IC 74LS138) to generate active-low Chip Select (CS# / CE#) signals for memory chips.',
          'Control Signal Matching: Microprocessor control signals MEMR# / RD# (Read) and MEMW# / WR# (Write) connect to memory chip enable pins (OE# Output Enable, WE# Write Enable) to control bus direction.',
          'Bus Demultiplexing & Buffering: Demultiplexing AD0-AD15 using 74LS373 octal latches (controlled by ALE) and buffering data with 74LS245 transceivers ensures clean, stable electrical drive for memory arrays.'
        ]
      },
      {
        id: 'm13-s4',
        title: '4. Memory Map Design & Address Decoding 📐',
        moduleTitle: 'Module 13: Semiconductor Memory Interfacing (RAM & ROM)',
        moduleId: 'm13',
        interactiveType: 'memory-interfacing',
        points: [
          'Memory Mapping Concept: A memory map defines the exact start and end physical addresses assigned to each RAM and ROM chip within the 1 MB address space.',
          'Even and Odd Memory Banks: To achieve 16-bit wide data transfers, 1 MB memory is organized into two 512 KB banks: Even Bank (connected to D0-D7, selected by A0=0) and Odd Bank (connected to D8-D15, selected by BHE#=0).',
          'Calculating Memory Address Range: For a 64 KB memory chip (2^16 bytes), 16 address lines (A0-A15) connect directly to chip address pins, while the remaining 4 high address lines (A16-A19) connect to the decoder.',
          'ROM Address Mapping in 8086: Because 8086 automatically starts execution from FFFF0H upon RESET, system boot EPROM/ROM must be mapped to the top of memory space (ending at FFFFFH).',
          'RAM Address Mapping in 8086: System RAM is mapped at lower memory addresses starting at 00000H because the Interrupt Vector Table (IVT) occupies addresses 00000H to 003FFH.'
        ]
      },
      {
        id: 'm13-s5',
        title: '5. Complete 8086 Memory Interfacing Circuit Schematic & Bank Logic 🔌💾📐',
        moduleTitle: 'Module 13: Semiconductor Memory Interfacing (RAM & ROM)',
        moduleId: 'm13',
        interactiveType: 'memory-interfacing',
        points: [
          'Design Problem 1 (32 KB RAM Interfacing with Absolute Decoding):\n• Problem: Interface 32 KB of RAM to 8086 using absolute decoding with suitable address (00000H–07FFFH).\n• Step 1 (Capacity): 32 KB total -> Even Bank (16 KB, D0–D7) & Odd Bank (16 KB, D8–D15) -> 2 ICs of 16 KB RAM.\n• Step 2 (Address Lines): 16 KB = 2^14 -> 14 address lines (A1–A14 to chip A0–A13); A0 & BHE# for bank select; 5 high lines (A15–A19) for absolute decoding.\n• Step 3 (Decoding Table): Binary address range 00000H to 07FFFH with A19..A15 = 00000b.\n• Step 4 (Chip Select Logic): CS# = NOT(NOT A19 • NOT A18 • NOT A17 • NOT A16 • NOT A15 • M/IO#). Even Bank CE1# = CS# OR A0; Odd Bank CE2# = CS# OR BHE#.\n• Step 5 (Schematic): 8086 MPU (Min Mode) + 3× 74LS373 Latches + Absolute NAND/OR Decoder + 2× 74LS245 Transceivers + 2× 16 KB SRAM chips.',
          'Block 1: Intel 8086 Microprocessor (Minimum Mode Bus Master)\n• Operation: Configured in Minimum Mode by connecting Pin 33 (MN/MX#) to +5V VCC, generating bus strobes directly without an external 8288 controller.\n• Key Signals:\n  - AD0–AD15: Time-multiplexed 16-bit Address (T1) and Data (T2–T4) bus.\n  - A16/S3–A19/S6 & BHE#/S7: Time-multiplexed upper address and status bits.\n  - ALE (Pin 25): Address Latch Enable strobe pulsing HIGH in T1.\n  - M/IO# (Pin 28): HIGH for memory cycles; RD# (Pin 32) & WR# (Pin 29) for read/write strobes.\n  - DEN# (Pin 26) & DT/R# (Pin 27): Drive external 74LS245 transceivers.',
          'Block 2: 74LS373 Octal Transparent D-Latches (Address Demultiplexing Stage)\n• Why Demultiplexing is Required: To reduce pin count, the 8086 shares pins for address and data. Address is valid ONLY during clock cycle T1.\n• Latch Configuration:\n  - 3 × 74LS373 latches capture address on the falling edge of ALE (Pin 25 connected to LE Pin 11).\n  - U2A latches AD0–AD7 -> A0–A7; U2B latches AD8–AD15 -> A8–A15; U2C latches A16–A19 & BHE# -> A16–A19 & BHE#.\n  - Latched addresses remain rock-solid throughout T2, T3, and T4 states while AD0–AD15 lines carry data.',
          'Block 3: 74LS138 3-to-8 Line Address Decoder (Chip Select Generator)\n• Operation: Decodes high-order address bits A17, A18, A19 to partition the 1 MB address space into 128 KB blocks.\n• Decoder Wiring:\n  - Select inputs A, B, C wired to latched A17, A18, A19.\n  - Enable G1 wired to M/IO# (HIGH for memory); G2A# and G2B# tied to GND (0V).\n  - Y0# (Pin 15) asserts LOW for 00000H–1FFFFH to select SRAM Bank.\n  - Y7# (Pin 7) asserts LOW for E0000H–FFFFFH to select Boot EPROM Bank.',
          'Block 4: 74LS245 Octal Bidirectional Bus Transceivers (Data Buffers)\n• Function: Isolates CPU from capacitive bus loading and provides clean bidirectional data drive.\n• Control Wiring:\n  - U4A buffers Lower Data Bus (D0–D7); U4B buffers Upper Data Bus (D8–D15).\n  - DIR (Pin 1) driven by 8086 DT/R# (1 = Transmit / Write, 0 = Receive / Read).\n  - OE# (Pin 19) driven by 8086 DEN# (asserted LOW during data phase T2–T4).',
          'Block 5: Even & Odd Memory Banks (2 × SRAM 62256 & 2 × EPROM 27256)\n• 16-Bit Memory Architecture: 1 MB space is split into Even Bank (D0–D7, selected by A0=0) and Odd Bank (D8–D15, selected by BHE#=0).\n• Gating Logic:\n  - Even Bank CE# = CS# OR A0 (Active LOW only when chip selected AND address is even).\n  - Odd Bank CE# = CS# OR BHE# (Active LOW only when chip selected AND odd byte/word accessed).\n• Address Connection: Memory chips connect latched A1–A15 to chip address inputs A0–A14 (address shifted by 1 bit because A0 is used for bank enable).\n• Control Pins: OE# connects to 8086 RD#; WE# connects to 8086 WR# (EPROMs have no WE# pin).'
        ]
      },
      {
        id: 'm13-s6',
        title: '6. Interfacing RAM and ROM Together (32 KB RAM + 32 KB ROM) 🔌💾⚡',
        moduleTitle: 'Module 13: Semiconductor Memory Interfacing (RAM & ROM)',
        moduleId: 'm13',
        interactiveType: 'memory-interfacing',
        points: [
          'Design Problem 2 (Combined RAM + ROM Interfacing Design):\n• Problem Statement: Interface 32 KB of RAM (00000H–07FFFH) and 32 KB of ROM/EPROM (F8000H–FFFFFH) to the 8086 microprocessor using 16 KB memory ICs and suitable address decoding.',
          'Step 1: Memory Budgeting & Bank Division:\n• Total Memory: 64 KB (32 KB RAM + 32 KB ROM).\n• RAM Organization: 32 KB / 2 = 2 ICs of 16 KB SRAM (62128) -> RAM 1 Even Bank (D0–D7) & RAM 2 Odd Bank (D8–D15).\n• ROM Organization: 32 KB / 2 = 2 ICs of 16 KB EPROM (27128) -> ROM 1 Even Bank (D0–D7) & ROM 2 Odd Bank (D8–D15).\n• Total IC Count: 4 Memory Chips (2× RAM + 2× ROM).',
          'Step 2: Address Line Budget & Pin Allocation:\n• Individual 16 KB Chip: 16 KB = 2^14 bytes -> 14 address lines on each chip (A0–A13).\n• Memory to 8086 Wiring: Connect chip A0–A13 to 8086 latched address lines A1–A14 (address shifted by 1 bit for bank selection).\n• Bank Enables: A0 = 0 enables Even Banks (RAM 1 & ROM 1); BHE# = 0 enables Odd Banks (RAM 2 & ROM 2).\n• High Decoding Lines: 20 - 15 = 5 address lines (A15, A16, A17, A18, A19) connect to address decoders.',
          'Step 3: Binary Decoding Map & Address Ranges:\n• 32 KB RAM (00000H–07FFFH): A19..A15 = 00000b, A14..A1 = 00000000000000b to 11111111111111b.\n• 32 KB ROM (F8000H–FFFFFH): A19..A15 = 11111b, A14..A1 = 00000000000000b to 11111111111111b.\n• Reset Vector: 8086 jumps to FFFF0H upon power-on, which falls inside ROM 1 & ROM 2.\n• Unmapped Space: Addresses 08000H to F7FFFH leave decoders inactive (CS# = 1, High-Z bus).',
          'Step 4: Decoder & Chip Select Logic:\n• Master RAM CS#: CS_RAM# = NOT( NOT A19 • NOT A18 • NOT A17 • NOT A16 • NOT A15 • M/IO# ).\n• Master ROM CS#: CS_ROM# = NOT( A19 • A18 • A17 • A16 • A15 • M/IO# ).\n• 4-Way Bank OR Gates (74LS32):\n  - CE_RAM1# = CS_RAM# OR A0 (RAM 1 Even Bank)\n  - CE_RAM2# = CS_RAM# OR BHE# (RAM 2 Odd Bank)\n  - CE_ROM1# = CS_ROM# OR A0 (ROM 1 Even Bank)\n  - CE_ROM2# = CS_ROM# OR BHE# (ROM 2 Odd Bank)',
          'Step 5 & 6: Complete 8086 Dual-Memory Circuit Wiring:\n• Demultiplexing: 3× 74LS373 latches capture AD0–AD15 & A16–A19/BHE# on ALE falling edge.\n• Data Buffering: 2× 74LS245 transceivers drive D0–D7 (U4A) and D8–D15 (U4B) enabled by DEN# and directed by DT/R#.\n• Control Strobes: 8086 RD# connects to OE# of all 4 chips. 8086 WR# connects to WE# of RAM 1 & RAM 2 ONLY (ROM chips have NO WE# pin, preventing accidental overwrites of boot firmware).'
        ]
      },
      {
        id: 'm13-quiz',
        title: 'Module 13 Recap Quiz',
        moduleTitle: 'Module 13: Semiconductor Memory Interfacing (RAM & ROM)',
        moduleId: 'm13',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which type of RAM requires periodic refresh cycles because its memory cells store charge on leaky capacitors?',
            options: [
              'Static RAM (SRAM)',
              'Dynamic RAM (DRAM)',
              'EPROM',
              'Flash Memory'
            ],
            correctAnswer: 1,
            explanation: 'Dynamic RAM (DRAM) uses 1 transistor and 1 capacitor per bit. Capacitors slowly lose charge over time, so DRAM requires periodic refresh cycles (every few milliseconds) to retain stored data.'
          },
          {
            question: 'Why is the 1 MB physical memory of the 8086 microprocessor divided into two 512 KB banks (Even Bank and Odd Bank)?',
            options: [
              'To allow simultaneous access to two independent programs',
              'To enable 16-bit word transfers in a single bus cycle using 8-bit memory chips',
              'To separate user data from operating system code',
              'To reduce total power consumption during instruction fetching'
            ],
            correctAnswer: 1,
            explanation: 'The 8086 data bus is 16 bits wide. Dividing memory into Even Bank (D0-D7, selected by A0=0) and Odd Bank (D8-D15, selected by BHE#=0) allows the 8086 to fetch either an 8-bit byte or a full 16-bit word in a single memory cycle.'
          },
          {
            question: 'Where must system ROM (EPROM/Flash) containing boot code be mapped in the 8086 memory address space?',
            options: [
              'At address 00000H because IVT starts there',
              'At address 80000H in the middle of memory',
              'At the top of memory near FFFF0H because 8086 jumps to FFFF0H upon RESET',
              'Anywhere in memory as long as CS# is connected to A0'
            ],
            correctAnswer: 2,
            explanation: 'Upon hardware RESET, the 8086 automatically sets CS = FFFFH and IP = 0000H, yielding physical address FFFF0H. Boot code/ROM must reside at FFFF0H to execute startup code.'
          },
          {
            question: 'How is an EPROM (Erasable Programmable Read-Only Memory) chip erased for reprogramming?',
            options: [
              'By applying a 12V electrical pulse to the RESET pin',
              'By exposing the chip silicon wafer to intense Ultraviolet (UV) light through a quartz window',
              'By executing a software CLC instruction in assembly',
              'By grounding the Chip Select (CS#) line for 5 seconds'
            ],
            correctAnswer: 1,
            explanation: 'EPROMs feature a transparent quartz window over the silicon die. Exposing the die to high-intensity UV light discharges the floating gates, erasing all stored bytes back to FFH.'
          }
        ]
      }
    ]
  },
  {
    id: 'm14',
    title: 'Module 14: Intel 8255 Programmable Peripheral Interface',
    slides: [
      {
        id: 'm14-s1',
        title: '1. Intel 8255 PPI Architecture & Port Configuration 🔌',
        moduleTitle: 'Module 14: Intel 8255 Programmable Peripheral Interface',
        moduleId: 'm14',
        interactiveType: 'ppi-8255',
        points: [
          '3 Ports in 8255 from User\'s Point of View:\n• Port A, Port B, and Port C.\n• Port C is composed of two independent 4-bit ports: PC7–4 (PC Upper) and PC3–0 (PC Lower).',
          'Address Lines A1, A0 (Internal Port Selection):\n• A1 = 0, A0 = 0 ➔ Selected Port: Port A\n• A1 = 0, A0 = 1 ➔ Selected Port: Port B\n• A1 = 1, A0 = 0 ➔ Selected Port: Port C\n• A1 = 1, A0 = 1 ➔ Selected Port: Control Port (Control Register)',
          'CS (Chip Select): Chip Select (Active LOW) enables or disables the 8255 IC for communication with the microprocessor.',
          'Internal Port Structure: Features 24 programmable I/O pins organized into three 8-bit ports (Port A: PA0–PA7, Port B: PB0–PB7, Port C: PC0–PC7).',
          'Group A and Group B Controls: Group A controls Port A and Port C Upper; Group B controls Port B and Port C Lower.'
        ]
      },
      {
        id: 'm14-s2',
        title: '2. 8255 Operating Modes & Control Word Format ⚙️',
        moduleTitle: 'Module 14: Intel 8255 Programmable Peripheral Interface',
        moduleId: 'm14',
        interactiveType: 'ppi-8255',
        points: [
          'Mode 0 (Basic I/O): All ports (A, B, C) operate as simple input or output ports without handshaking. Data is written or read directly.',
          'Mode 1 (Strobed I/O): Ports A and B use Port C lines as handshake signals (STB#, IBF, ACK#, OBF#, INTR) to synchronize data transfer with peripheral devices.',
          'Mode 2 (Strobed Bi-directional Bus I/O): Port A functions as a 8-bit bi-directional data bus with Port C supplying 5 handshake control lines. (Port B can operate in Mode 0 or 1).',
          'I/O Mode Set Control Word: Written to Control Register when D7 = 1. Configures mode selection for Group A (D6,D5) and Group B (D2), and port directions (D4 for Port A, D3 for Port C Upper, D1 for Port B, D0 for Port C Lower).',
          'BSR Mode (Bit Set/Reset): Activated when D7 = 0. Allows individual setting (1) or resetting (0) of any single bit in Port C without affecting other bits.'
        ]
      },
      {
        id: 'm14-quiz',
        title: 'Module 14 Recap Quiz',
        moduleTitle: 'Module 14: Intel 8255 Programmable Peripheral Interface',
        moduleId: 'm14',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'How many total programmable I/O pins are available on the Intel 8255 PPI chip?',
            options: ['16 pins', '24 pins', '32 pins', '40 pins'],
            correctAnswer: 1,
            explanation: 'The 8255 PPI has 24 programmable I/O pins divided into Port A (8 bits), Port B (8 bits), and Port C (8 bits).'
          },
          {
            question: 'Which 8255 mode enables Port A to act as a Strobed Bi-directional I/O bus using Port C pins for handshaking?',
            options: ['Mode 0', 'Mode 1', 'Mode 2', 'BSR Mode'],
            correctAnswer: 2,
            explanation: 'Mode 2 is the Strobed Bi-directional Bus I/O mode, available exclusively on Port A of the 8255 PPI.'
          },
          {
            question: 'What is the control byte value to configure Port A as Input, Port B as Output, and Port C as Output in Mode 0?',
            options: ['90H', '80H', '82H', '92H'],
            correctAnswer: 0,
            explanation: 'D7=1 (I/O mode), D6D5=00 (Mode 0 for Group A), D4=1 (Port A Input), D3=0 (Port C Upper Output), D2=0 (Mode 0 for Group B), D1=0 (Port B Output), D0=0 (Port C Lower Output) -> Binary 10010000 = 90H.'
          }
        ]
      }
    ]
  },
  {
    id: 'm15',
    title: 'Module 15: Peripheral Interfacing (LEDs, Displays & Stepper Motor)',
    slides: [
      {
        id: 'm15-s1',
        title: '1. Stepper Motor Interfacing: Circuit Blocks, Simulator & ALP Code 🔌🔄💻',
        moduleTitle: 'Module 15: Peripheral Interfacing (LEDs, Displays & Stepper Motor)',
        moduleId: 'm15',
        interactiveType: 'peripheral-interfacing',
        points: [
          'Types of Stepper Motors (Construction & Operating Principles):\n• 1. Variable Reluctance (VR) Stepper Motor:\n  - Rotor Construction: Non-magnetic, multi-toothed soft iron rotor with no permanent magnet; wound stator poles.\n  - Operating Principle: Rotor teeth pull into alignment with the energized stator pole to minimize the magnetic path reluctance (resistance to magnetic flux).\n  - Characteristics: Zero detent torque (rotor turns freely when unpowered), high stepping rate, low rotor inertia, typical step angle: 7.5°, 15°, or 30°.\n• 2. Permanent Magnet (PM) Stepper Motor:\n  - Rotor Construction: Cylindrical permanent magnet rotor with alternating North and South magnetic poles along circumference; wound stator poles (tin-can / can-stack construction).\n  - Operating Principle: Magnetic attraction between energized stator electromagnets and rotor permanent magnetic poles.\n  - Characteristics: Noticeable detent torque (residual holding torque when coils unpowered), higher torque-to-size ratio, typical step angle: 7.5° (48 steps/rev) or 15° (24 steps/rev).\n• 3. Hybrid Stepper Motor (VR + PM Combined):\n  - Rotor Construction: Combines VR and PM principles. Features an axial permanent magnet sandwiched between two toothed soft-iron end caps offset by half a tooth pitch (3.6°).\n  - Operating Principle: Magnetic flux travels axially through PM core and radially across toothed air gaps for ultra-precise reluctance alignment.\n  - Characteristics: Highest torque output, finest step angle (1.8° / 200 steps/rev or 0.9° / 400 steps/rev), exceptional holding torque; standard for 3D printers, CNC machines, and robotics (NEMA 17/23).\n• 4. Unipolar vs. Bipolar Stepper Motors & Driver Topologies:\n  - Unipolar (5/6-wire): Center-tapped windings connected to +12V DC. Current flows in only one direction per half-coil; driven simply using low-side transistor arrays (ULN2003A).\n  - Bipolar (4-wire): Windings without center taps. Current flows bidirectionally through entire coil; requires full H-Bridge drivers (L293D / L298N / A4988); utilizes 100% of copper volume for ~30–40% higher torque.',
          'Block 1: 8086 Microprocessor (Controller / Master Unit)\n• Function: Acts as the brain of the system. It executes the Assembly Language Program (ALP), generates digital timing pulses, and determines the rotation direction (CW/CCW), speed (via software delay loops), and total step count.\n• Key Connections:\n  - AD0–AD15: Multiplexed Address/Data bus lines.\n  - ALE: Pulses HIGH in T1 to latch the address into the 74LS373.\n  - M/IO#, RD#, WR#: System control bus signals specifying an I/O write cycle.',
          'Block 2: 74HC373 / 74LS373 Octal Transparent D-Latch (Demultiplexer Stage)\n• Function: Solves the multiplexed bus requirement of the 8086. Address lines AD0–AD7 only carry address during clock cycle T1. When ALE (Address Latch Enable, Pin 25) pulses HIGH into LE (Pin 11), the 74HC373 captures and holds the stable address lines (A0–A1).\n• Direct Port Selection:\n  - Latched outputs Q0 and Q1 connect directly to 8255 pins A0 (Pin 9) and A1 (Pin 8) to select Port A (00b), Port B (01b), Port C (10b), or Control Register (11b).\n• Single-Chip System (No Decoder Required):\n  - Since the 8255 is the only peripheral connected to the CPU with no other I/O devices or memory conflicts, Chip Select CS# (Pin 6) and Latch OE# (Pin 1) are tied directly to Ground (Logic LOW / 0V), keeping the 8255 always enabled without needing a 74LS138 decoder.\n  - Note: In multi-peripheral systems with memory/timers, a 74LS138 decoder would decode upper address lines (A2–A7) to generate CS# at a specific base address (e.g. 80H).',
          'Block 3: Intel 8255 Programmable Peripheral Interface (PPI)\n• Function: Provides programmable parallel I/O ports to interface the CPU with the motor driver.\n• Configuration:\n  - Initialized in Mode 0 (Basic I/O) with Port A configured as an Output port by sending control byte 80H (10000000b) to the Control Register at address 86H.\n  - Pins PA0–PA3 output the 4-bit excitation nibble (03H, 06H, 0CH, 09H) to energize the motor phases in sequence.',
          'Block 4: ULN2003A Darlington Transistor Driver IC\n• Why it is Required:\n  - Current Amplification: The 8255 I/O pins can only provide ~1.6 mA to 2.5 mA of current (logic levels 0V/5V), whereas each stepper motor coil requires 200 mA to 500 mA at +12V DC.\n  - Inductive Back-EMF Suppression: Motor coils are inductors. When current to a coil is suddenly shut off, a dangerous reverse voltage spike (V = -L di/dt) is generated.\n• Internal Structure & Connections:\n  - Contains 7 open-collector Darlington pairs with integral suppression diodes.\n  - Inputs (1B–4B / In1–In4): Connected to 8255 pins PA0–PA3.\n  - Outputs (1C–4C / Out1–Out4): Connected to Motor Coils Phase A, B, C, D.\n  - Pin 8 (GND): Connected to common system ground.\n  - Pin 9 (COM): Connected to +12V DC to connect internal freewheeling clamp diodes across the coils.',
          'Block 5: 4-Phase Stepper Motor (Actuator) & Excitation Modes\n• Operating Principle: Electromechanical transducer converting digital excitation pulses into discrete mechanical angular displacement. Step Angle (β) = 360° / (Number of Stator Phases × Rotor Teeth); 4 phases with 50 teeth yields 1.8°/step (200 steps/rev).\n• Wave Drive (1-Phase ON): Single coil energized at a time (01H -> 02H -> 04H -> 08H); lowest power consumption, 1.8° step angle.\n• Full-Step Drive (2-Phase ON): Two adjacent coils energized simultaneously (03H -> 06H -> 0CH -> 09H); produces ~1.414× maximum holding torque.\n• Half-Step Drive (Alternating 1 & 2 Phase ON): Alternates 1-phase and 2-phase excitation (01H -> 03H -> 02H -> 06H -> 04H -> 0CH -> 08H -> 09H); doubles angular resolution to 0.9°/step (400 steps/rev).',
          '8086 Assembly Program (ALP) Tab:\n• Code Structure: Complete line-by-line commented assembly program implementing 8255 PPI initialization (80H to port 86H), 2-phase ON excitation lookup table (03H, 06H, 0CH, 09H), and software settling delay subroutine (~50 ms) accessible directly via the dedicated "Stepper Motor ALP (Code)" tab.'
        ]
      },
      {
        id: 'm15-s2',
        title: '2. Seven-Segment LED Display Interfacing: Circuit Blocks, Simulator & ALP 💡🔢',
        moduleTitle: 'Module 15: Peripheral Interfacing (LEDs, Displays & Stepper Motor)',
        moduleId: 'm15',
        interactiveType: 'peripheral-interfacing',
        points: [
          'Block 1: 8086 Microprocessor (Master Controller)\n• Function: Executes conversion algorithms (e.g. BCD to 7-segment lookup via `XLAT`), writes display patterns to 8255 I/O ports via `OUT 80H, AL`, and manages multiplexing scan timing (~50 Hz refresh rate).\n• Key Connections: Multiplexed AD0–AD15 lines, ALE (Address Latch Enable), and I/O control signals (M/IO#, RD#, WR#).',
          'Block 2: Demultiplexer (74LS373) & Address Decoder (74LS138)\n• 74LS373 Latch: Holds lower 16-bit address stable during T2–T4 clock cycles when ALE goes LOW.\n• 74LS138 Decoder: Decodes A2–A7 and M/IO# (active LOW for I/O) to generate active-low CS# (Chip Select) at base address 80H.\n• Port Map: Port A = 80H (Segment Data), Port B = 82H, Port C = 84H (Digit Select), Control Register = 86H (CW = 80H).',
          'Block 3: Intel 8255 Programmable Peripheral Interface (PPI)\n• Configuration: Mode 0 (Basic I/O), Port A & Port C initialized as Output ports (Control Word 80H).\n• Pin Mapping: PA0=a, PA1=b, PA2=c, PA3=d, PA4=e, PA5=f, PA6=g, PA7=dp. For multi-digit multiplexing, PC0–PC3 switch digit enable lines.',
          'Block 4: Current-Limiting Resistor Array (8 × 330Ω) & Buffer Stage\n• Why Required: Protects LEDs and 8255 output pins from excessive current. Forward voltage drop VF ≈ 1.8V to 2.0V; R = (5V - VF) / IF = (5V - 1.8V) / 10mA ≈ 320Ω → standard 330Ω.\n• Buffer: 74LS244 octal buffer or transistor array can provide additional current drive capability for larger displays.',
          'Block 5: 7-Segment LED Display Unit (Common Cathode vs. Common Anode)\n• Common Cathode: All LED cathodes tied to GND (0V). Segment is illuminated by driving anode pin HIGH (+5V). Digit 0 = 3FH (00111111b), 1 = 06H, 8 = 7FH.\n• Common Anode: All LED anodes tied to +5V VCC. Segment is illuminated by driving cathode pin LOW (0V). Digit 0 = C0H (11000000b), 1 = F9H, 8 = 80H.\n• Multiplexed Display: Digit common pins connected through switching transistors (BC547 NPN for CC, BC557 PNP for CA) driven by Port C pins.'
        ]
      },
      {
        id: 'm15-s3',
        title: '3. 4x4 Matrix Keypad Interfacing & Debouncing ⌨️',
        moduleTitle: 'Module 15: Peripheral Interfacing (LEDs, Displays & Stepper Motor)',
        moduleId: 'm15',
        interactiveType: 'peripheral-interfacing',
        points: [
          'Block 1: 8086 Microprocessor (Master Controller)\n• Function: Executes matrix scanning algorithms, transmits active-LOW row grounding bytes (`OUT 80H, AL`), reads column sense inputs (`IN AL, 82H`), and executes 20 ms software debounce routines.\n• Key Connections: Multiplexed AD0–AD15 lines, ALE (Address Latch Enable), M/IO# (LOW for I/O port cycles), RD#, and WR#.',
          'Block 2: Demultiplexer (74LS373) & Address Decoder (74LS138)\n• 74LS373 Latch: Captures lower 16-bit address on ALE falling edge during clock cycle T1.\n• 74LS138 Decoder: Decodes A2–A7 with M/IO#=LOW to assert active-low CS# (Chip Select) at base address 80H.\n• Port Map: Port A = 80H (Row Outputs R0–R3), Port B = 82H (Column Inputs C0–C3), Control Register = 86H (Control Word = 82H).',
          'Block 3: Intel 8255 Programmable Peripheral Interface (PPI)\n• Configuration: Mode 0 (Basic I/O), Control Word = 82H (10000010b) setting Port A as Output (Rows) and Port B as Input (Columns).\n• Pin Mapping: PA0=R0, PA1=R1, PA2=R2, PA3=R3 (driven LOW one at a time); PB0=C0, PB1=C1, PB2=C2, PB3=C3 (sensed by CPU).',
          'Block 4: Pull-Up Resistor Array (4 × 10kΩ) & Debouncing Stage\n• Pull-Up Network: 4 × 10kΩ resistors tie PB0–PB3 to +5V VCC, guaranteeing a solid logic HIGH (\'1\') when all keys are open.\n• Contact Bounce: Mechanical switches vibrate for 10–20 ms upon contact closure; software delay loops (~20 ms) verify steady-state signals before registering valid keypresses.',
          'Block 5: 4×4 Matrix Keypad Switch Grid & Scanning Algorithm\n• Hardware Grid: 16 SPST momentary push-buttons arranged at the cross-points of 4 rows and 4 columns, saving I/O pins (8 lines vs. 16 dedicated wires).\n• Scanning Logic: Ground all rows (`00H`) to detect any press → Wait 20 ms debounce → Ground rows sequentially (`0EH`, `0DH`, `0BH`, `07H`) → Read Port B column nibble → Translate (Row, Col) into key code via `XLAT` lookup table.'
        ]
      },
      {
        id: 'm15-s4',
        title: '4. Traffic Light Controller Interfacing 🚦',
        moduleTitle: 'Module 15: Peripheral Interfacing (LEDs, Displays & Stepper Motor)',
        moduleId: 'm15',
        interactiveType: 'peripheral-interfacing',
        points: [
          'Traffic Controller Architecture: Controls a 4-way road intersection (North-South and East-West corridors) using 8255 parallel I/O lines driving Red, Yellow, and Green LED arrays.',
          'Port Line Mapping: 8255 Port A pins mapped as PA0=NS Red, PA1=NS Yellow, PA2=NS Green, PA3=EW Red, PA4=EW Yellow, PA5=EW Green.',
          'State Sequencing Machine: Phase 1: NS Green & EW Red (Code 21H) -> Phase 2: NS Yellow & EW Red (Code 11H) -> Phase 3: NS Red & EW Green (Code 0CH) -> Phase 4: NS Red & EW Yellow (Code 0AH).',
          'Software Timing Delays: 8086 uses nested software delay loops or programmable timer (8253/8254) interrupts to hold green signals for extended durations (~30s) and yellow signals for brief transitions (~3-5s).',
          'Pedestrian & Sensor Extension: Port C lines can be configured as inputs to accept pedestrian crosswalk push-buttons and inductive vehicle loop sensors.'
        ]
      },
      {
        id: 'm15-s5',
        title: '5. 8086 Assembly Programs (ALP) for Peripherals 💻',
        moduleTitle: 'Module 15: Peripheral Interfacing (LEDs, Displays & Stepper Motor)',
        moduleId: 'm15',
        interactiveType: 'peripheral-interfacing',
        points: [
          'Complete 8086 Stepper Motor ALP (Line-by-Line Commented):\n' +
          '; --- 8086 Stepper Motor Control Program via 8255 PPI ---\n' +
          '.MODEL SMALL                  ; Specify small memory model\n' +
          '.STACK 64                     ; Allocate 64 bytes for stack operations\n' +
          '.DATA                         ; Begin data segment\n' +
          '  STEP_CW DB 03H,06H,0CH,09H ; 4-phase 2-phase ON clockwise excitation sequence (PA0-PA3)\n' +
          '.CODE                         ; Begin code segment\n' +
          'MAIN PROC                     ; Program entry point\n' +
          '  MOV AX, @DATA               ; Load address of data segment into AX\n' +
          '  MOV DS, AX                  ; Initialize DS with data segment base\n' +
          '  MOV AL, 80H                 ; Control Word 80H: Mode 0, Port A/B/C as outputs\n' +
          '  OUT 86H, AL                 ; Write control word to 8255 control register (port 86H)\n' +
          'ROTATE:                       ; Continuous rotation label\n' +
          '  MOV SI, 0                   ; Reset lookup table pointer to first step\n' +
          '  MOV CX, 4                   ; Load CX with 4 (4 steps per full electrical cycle)\n' +
          'STEP_LOOP:                    ; Single step sequence loop\n' +
          '  MOV AL, STEP_CW[SI]         ; Load current excitation code from memory into AL\n' +
          '  OUT 80H, AL                 ; Output 4-bit nibble to Port A (80H) -> ULN2003 driver\n' +
          '  CALL DELAY                  ; Wait for rotor to align with stator field\n' +
          '  INC SI                      ; Point SI to next excitation code\n' +
          '  LOOP STEP_LOOP              ; Decrement CX; repeat while CX != 0\n' +
          '  JMP ROTATE                  ; Repeat full rotation sequence indefinitely\n' +
          'DELAY PROC                    ; Software delay subroutine\n' +
          '  PUSH CX                     ; Preserve outer loop counter on stack\n' +
          '  MOV CX, 0FFFFH              ; Load delay counter (65535 loop iterations)\n' +
          'D1: LOOP D1                   ; Decrement CX until 0 (software delay ~50ms)\n' +
          '  POP CX                      ; Restore CX register from stack\n' +
          '  RET                         ; Return to caller\n' +
          'DELAY ENDP                    ; End of delay subroutine\n' +
          'MAIN ENDP                     ; End of main procedure\n' +
          'END MAIN                      ; Program end marker',
          '7-Segment Display ALP with Line-by-Line Comments:\n' +
          '; --- Display Hex Digits 0-F on 7-Segment via 8255 Port A ---\n' +
          'MOV AL, 80H                   ; Control Word 80H (Mode 0, all ports output)\n' +
          'OUT 86H, AL                   ; Configure 8255 PPI at port 86H\n' +
          'MOV BX, OFFSET TABLE          ; Load base address of 7-segment lookup table into BX\n' +
          'MOV AL, 05H                   ; Value to display (Hex digit 5)\n' +
          'XLAT                          ; Translate AL = TABLE[AL] -> returns 6DH for digit 5\n' +
          'OUT 80H, AL                   ; Output segment code 6DH to Port A (80H)\n' +
          'HLT                           ; Halt 8086 execution',
          '4x4 Keypad Scanning ALP with Line-by-Line Comments:\n' +
          '; --- 4x4 Keypad Row-Scan Subroutine ---\n' +
          'MOV AL, 82H                   ; CW: Port A=Output (rows), Port B=Input (columns)\n' +
          'OUT 86H, AL                   ; Initialize 8255 control port (86H)\n' +
          'MOV AL, 0FEH                  ; Ground Row 0 (PA0=0, PA1-PA3=1)\n' +
          'OUT 80H, AL                   ; Send row scan ground mask to Port A (80H)\n' +
          'IN AL, 82H                    ; Read column response lines from Port B (82H)\n' +
          'AND AL, 0FH                   ; Mask upper nibble to isolate 4 column bits\n' +
          'CMP AL, 0FH                   ; Compare with 0FH (all HIGH = no key in Row 0)\n' +
          'JNZ KEY_FOUND                 ; If not 0FH, key is pressed in Row 0! Branch.'
        ]
      },
      {
        id: 'm15-quiz',
        title: 'Module 15 Recap Quiz',
        moduleTitle: 'Module 15: Peripheral Interfacing (LEDs, Displays & Stepper Motor)',
        moduleId: 'm15',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'In a Common Anode 7-segment display, what logic level must be applied to an individual segment pin (e.g. segment "a") to turn it ON?',
            options: [
              'Logic HIGH (1 or +5V)',
              'Logic LOW (0 or 0V)',
              'High impedance state',
              'Pulsed 1 kHz square wave'
            ],
            correctAnswer: 1,
            explanation: 'In Common Anode displays, all anodes share +5V. To complete the circuit current path through an LED segment, the corresponding cathode pin must be pulled LOW (Logic 0).'
          },
          {
            question: 'Why is a high-current driver IC like ULN2003 required between 8255 PPI ports and a stepper motor coil?',
            options: [
              'To invert the step control pulse frequency',
              'Because 8255 I/O port pins cannot sink/source the high currents (hundreds of mA) required by stepper motor coils',
              'To decode 3-bit step codes into 8-bit binary codes',
              'To store the step position in non-volatile memory'
            ],
            correctAnswer: 1,
            explanation: '8255 I/O pins provide max ~1.6 mA current, whereas stepper motor coils draw 100 mA to 1 A. ULN2003 Darlington array provides high current amplification and back-EMF diode protection.'
          },
          {
            question: 'How many total full steps are required for a stepper motor with a 1.8° step angle to execute one complete 360° revolution?',
            options: ['100 steps', '180 steps', '200 steps', '360 steps'],
            correctAnswer: 2,
            explanation: 'Total steps per revolution = 360° / Step Angle = 360° / 1.8° = 200 steps.'
          }
        ]
      }
    ]
  },
  {
    id: 'm16',
    title: 'Module 16: Analog Interfacing (A/D & D/A Converters)',
    slides: [
      {
        id: 'm16-s1',
        title: '1. Analog-to-Digital Converter (ADC 0808/0809) Interfacing 📊',
        moduleTitle: 'Module 16: Analog Interfacing (A/D & D/A Converters)',
        moduleId: 'm16',
        interactiveType: 'analog-interfacing',
        points: [
          'Need for A/D Conversion: Real-world sensors (temperature, pressure, light) produce continuous analog signals; ADCs convert these into digital binary values for 8086 processing.',
          'ADC 0808 Features: 8-bit successive-approximation ADC with an internal 8-channel analog multiplexer, requiring no external zero/full-scale adjustment.',
          'Control Signals for ADC 0808: ADD A, B, C (Channel Select), ALE (Address Latch Enable), START / SOC (Start of Conversion pulse), EOC (End of Conversion status signal), and OE (Output Enable to release tri-state outputs).',
          'Conversion Steps in 8086 Program: 1. Output channel address and pulse ALE & START HIGH. 2. Monitor EOC pin until it goes HIGH (conversion complete). 3. Assert OE HIGH to read 8-bit digital output via 8255 Port A.',
          'Resolution Calculation: Resolution = Vref / 2^n. For Vref = 5V and 8-bit ADC, resolution = 5V / 256 = 19.53 mV per LSB step.'
        ]
      },
      {
        id: 'm16-s2',
        title: '2. Digital-to-Analog Converter (DAC 0800) & Waveform Generation 📈',
        moduleTitle: 'Module 16: Analog Interfacing (A/D & D/A Converters)',
        moduleId: 'm16',
        interactiveType: 'analog-interfacing',
        points: [
          'Need for D/A Conversion: Microprocessors produce digital outputs; DACs convert binary values into continuous analog voltages/currents to drive actuators, speakers, and motors.',
          'DAC 0800 Architecture: High-speed 8-bit multiplying DAC utilizing an R-2R resistor ladder network to output proportional analog current (Iout).',
          'Current-to-Voltage Op-Amp Stage: An external Operational Amplifier (e.g. LM741) in transimpedance configuration converts DAC output current into output voltage Vout = Vref × (Digital Data / 256).',
          'Square Wave Generation: 8086 outputs 00H to 8255 Port A, delays, then outputs FFH, creating a square wave.',
          'Sawtooth & Triangular Wave Generation: Sawtooth is generated by continuously incrementing port value from 00H to FFH in a loop; Triangular wave increments from 00H to FFH and then decrements back to 00H.'
        ]
      },
      {
        id: 'm16-quiz',
        title: 'Module 16 Recap Quiz',
        moduleTitle: 'Module 16: Analog Interfacing (A/D & D/A Converters)',
        moduleId: 'm16',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'What is the function of the EOC (End of Conversion) pin on the ADC 0808 chip during interfacing?',
            options: [
              'It signals the 8086 processor that digital conversion is finished and data is ready',
              'It turns off the internal clock generator',
              'It selects channel 0 on the 8-channel multiplexer',
              'It resets the internal registers to 00H'
            ],
            correctAnswer: 0,
            explanation: 'The EOC pin goes LOW when conversion begins and transitions HIGH when conversion completes, signaling the 8086/8255 that valid digital data is ready to be read.'
          },
          {
            question: 'What is the voltage resolution of an 8-bit DAC with a reference voltage (Vref) of +5.0 Volts?',
            options: ['1.0 V', '19.53 mV', '50.0 mV', '0.195 V'],
            correctAnswer: 1,
            explanation: 'Resolution = Vref / 2^8 = 5.0 V / 256 ≈ 0.01953 V = 19.53 mV.'
          },
          {
            question: 'Which operational amplifier configuration is connected to the output pins of a DAC 0800 IC to produce a voltage output?',
            options: [
              'Non-inverting Voltage Amplifier',
              'Transimpedance Current-to-Voltage Converter',
              'Differential Voltage Comparator',
              'Voltage Follower Buffer'
            ],
            correctAnswer: 1,
            explanation: 'The DAC 0800 provides a complementary current output (Iout). An op-amp connected as a current-to-voltage converter converts Iout into a scaled output voltage.'
          }
        ]
      }
    ]
  },
  {
    id: 'm17',
    title: 'Module 17: Interrupt Systems & Intel 8259 Programmable Interrupt Controller',
    slides: [
      {
        id: 'm17-s1',
        title: '1. Software & Hardware Interrupt Applications in 8086 ⚡',
        moduleTitle: 'Module 17: Interrupt Systems & Intel 8259 Programmable Interrupt Controller',
        moduleId: 'm17',
        interactiveType: 'interrupt-8259',
        points: [
          'Interrupt Concept: An interrupt suspends normal program execution, forcing MPU to jump to a specific Interrupt Service Routine (ISR), and returns via IRET instruction.',
          'Hardware Interrupt Pins: NMI (Non-Maskable Interrupt, edge-triggered, Type 2, highest hardware priority) and INTR (Maskable Interrupt, level-triggered, controlled by Interrupt Flag IF).',
          'Software Interrupts: Triggered by instructions like INT n (e.g. INT 21H for DOS system calls), INTO (Interrupt on Overflow), and INT 3 (Breakpoint debugging).',
          'Interrupt Vector Table (IVT): Occupies physical memory 00000H to 003FFH (1 KB). Stores 256 4-byte vectors containing CS:IP ISR entry addresses. Vector Address = Type Number × 4.',
          'Dedicated Interrupt Types: Type 0 (Divide-by-zero), Type 1 (Single Step / Trap), Type 2 (NMI), Type 3 (Breakpoint INT 3), Type 4 (Overflow INTO).'
        ]
      },
      {
        id: 'm17-s2',
        title: '2. Need for 8259 PIC & Internal Architecture 🧠',
        moduleTitle: 'Module 17: Interrupt Systems & Intel 8259 Programmable Interrupt Controller',
        moduleId: 'm17',
        interactiveType: 'interrupt-8259',
        points: [
          'Need for 8259 PIC: 8086 has only ONE hardware INTR pin. The 8259 PIC expands this single pin to manage up to 8 vectored hardware interrupt requests (IR0-IR7) with programmable priorities.',
          'Cascading Capability: Master and Slave 8259 controllers can be cascaded via CAS0-CAS2 lines to manage up to 64 hardware interrupt requests.',
          'Interrupt Request Register (IRR): Stores all incoming interrupt levels (IR0-IR7) requesting service.',
          'In-Service Register (ISR): Stores the interrupt levels currently being serviced by the 8086 CPU.',
          'Interrupt Mask Register (IMR): 8-bit register that stores mask bits; setting bit n to 1 disables/masks interrupt request IRn.',
          'Priority Resolver (PR): Determines the highest priority request among unmasked bits in IRR and passes it to MPU.'
        ]
      },
      {
        id: 'm17-s3',
        title: '3. 8259 Command Words (ICWs & OCWs) 📜',
        moduleTitle: 'Module 17: Interrupt Systems & Intel 8259 Programmable Interrupt Controller',
        moduleId: 'm17',
        interactiveType: 'interrupt-8259',
        points: [
          'Initialization Command Words (ICW1 - ICW4): Sent sequentially after hardware reset to configure fundamental 8259 operating parameters.',
          'ICW1: Defines single/cascade mode, edge/level trigger mode, and indicates if ICW4 is needed.',
          'ICW2: Sets the base Interrupt Vector Type (e.g. 08H for IR0-IR7 mapping to INT 08H - INT 0FH).',
          'ICW3: Master/Slave cascade pin connection mapping (only needed if cascade mode selected in ICW1).',
          'ICW4: Specifies 8086/8088 mode, Auto/Normal End of Interrupt (EOI), and buffered mode.',
          'Operation Command Words (OCWs): Written during normal execution to dynamically control interrupt operation. OCW1 (sets IMR mask bits), OCW2 (sends EOI commands and priority rotation), OCW3 (reads IRR/ISR status).'
        ]
      },
      {
        id: 'm17-quiz',
        title: 'Module 17 Recap Quiz',
        moduleTitle: 'Module 17: Interrupt Systems & Intel 8259 Programmable Interrupt Controller',
        moduleId: 'm17',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'What is the physical starting memory address in the Interrupt Vector Table (IVT) for software interrupt INT 21H?',
            options: ['00021H', '00084H', '00210H', '00400H'],
            correctAnswer: 1,
            explanation: 'IVT vector physical address = Type Number × 4 = 21H × 4 = 15H × 4 = 84 decimal = 00084H.'
          },
          {
            question: 'Which internal register in the Intel 8259 PIC holds the hardware interrupt levels that are currently requesting service but not yet serviced?',
            options: [
              'Interrupt Request Register (IRR)',
              'In-Service Register (ISR)',
              'Interrupt Mask Register (IMR)',
              'Priority Resolver (PR)'
            ],
            correctAnswer: 0,
            explanation: 'The IRR (Interrupt Request Register) stores bits for all interrupt request lines (IR0-IR7) currently asserting a request.'
          },
          {
            question: 'What is the maximum number of hardware interrupt request lines that can be managed by cascading 8259 PIC controllers?',
            options: ['8 lines', '16 lines', '32 lines', '64 lines'],
            correctAnswer: 3,
            explanation: '1 Master 8259 connected to 8 Slave 8259 controllers yields 8 × 8 = 64 total hardware interrupt request lines.'
          }
        ]
      }
    ]
  },
  {
    id: 'm18',
    title: 'Module 18: Serial Communication & Intel 8251 USART',
    slides: [
      {
        id: 'm18-s1',
        title: '1. Serial Communication Fundamentals & 8251 Architecture 📡',
        moduleTitle: 'Module 18: Serial Communication & Intel 8251 USART',
        moduleId: 'm18',
        interactiveType: 'usart-8251',
        points: [
          'Parallel vs Serial Data Transfer: Parallel transfers entire 8/16-bit words simultaneously over short distances; Serial transmits bits sequentially over a single pair of wires over long distances.',
          'Synchronous vs Asynchronous Serial Transmission: Asynchronous uses Start/Stop framing bits without a shared clock; Synchronous uses transmitter/receiver clock synchronization with sync characters.',
          'Baud Rate Definition: Number of signal state changes or bits transmitted per second (e.g. 9600 Baud).',
          'Overview of 8251 USART: Universal Synchronous Asynchronous Receiver Transmitter chip that converts MPU parallel data into serial format for transmission, and incoming serial data into parallel format.',
          'Functional Blocks of 8251: Transmitter Buffer & Register, Receiver Buffer & Register, Data Bus Buffer, Read/Write Control Logic, Modem Control (RTS#, CTS#, DTR#, DSR#).'
        ]
      },
      {
        id: 'm18-s2',
        title: '2. 8251 USART Programming & Control Register ⚙️',
        moduleTitle: 'Module 18: Serial Communication & Intel 8251 USART',
        moduleId: 'm18',
        interactiveType: 'usart-8251',
        points: [
          '8251 Control Logic & C/D# Pin: C/D# = 0 accesses Data Buffer; C/D# = 1 accesses Control/Status Register.',
          'Mode Instruction Format: Sent first after RESET to select Asynchronous/Synchronous mode, baud rate factor (x1, x16, x64), character length (5-8 bits), parity enable/type, and stop bit count (1, 1.5, 2).',
          'Command Instruction Format: Controls operational functions such as Transmit Enable (TXEN), Receive Enable (RXE), Error Reset (ER), and Internal Reset (IR).',
          'Status Read Register: Reading 8251 with C/D# = 1 provides status flags: TxRDY (Transmitter Ready), RxRDY (Receiver Ready), TxEMPTY, Framing Error (FE), Overrun Error (OE), Parity Error (PE).',
          'RS-232C Voltage Level Shifting: MPU TTL voltage levels (0V/5V) are converted to RS-232C bipolar standards (-12V / +12V) using line driver ICs like MAX232.'
        ]
      },
      {
        id: 'm18-quiz',
        title: 'Module 18 Recap Quiz',
        moduleTitle: 'Module 18: Serial Communication & Intel 8251 USART',
        moduleId: 'm18',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'In asynchronous serial data transmission, what is the purpose of adding Start and Stop bits around each character frame?',
            options: [
              'To increase bit transfer speed by 50%',
              'To synchronize receiver bit-timing without requiring a shared continuous clock line',
              'To encrypt data against bus snooping',
              'To enable multi-master bus arbitration'
            ],
            correctAnswer: 1,
            explanation: 'Asynchronous serial transmission uses a Start bit (logic 0) to signal character arrival and Stop bit(s) (logic 1) to mark frame end, allowing receiver clock resynchronization.'
          },
          {
            question: 'Which status flag in the 8251 USART status register indicates that received serial data is ready in the Rx buffer to be read by the MPU?',
            options: ['TxRDY', 'RxRDY', 'TxEMPTY', 'DSR'],
            correctAnswer: 1,
            explanation: 'RxRDY (Receiver Ready) goes HIGH when 8251 has assembled a complete serial character into the internal receive buffer and is ready for MPU read.'
          },
          {
            question: 'Which driver IC is standardly used to convert 0V/5V TTL logic levels to ±12V RS-232C serial communication signal levels?',
            options: ['MAX232', 'ULN2003', '74LS373', '8259 PIC'],
            correctAnswer: 0,
            explanation: 'The MAX232 IC features internal charge pump capacitors to convert 5V TTL levels to ±10V/12V RS-232 signal levels.'
          }
        ]
      }
    ]
  },
  {
    id: 'm19',
    title: 'Module 19: Direct Memory Access & Intel 8237A DMA Controller',
    slides: [
      {
        id: 'm19-s1',
        title: '1. Direct Memory Access (DMA) & 8237A Architecture 🚀',
        moduleTitle: 'Module 19: Direct Memory Access & Intel 8237A DMA Controller',
        moduleId: 'm19',
        interactiveType: 'dma-8237',
        points: [
          'DMA Concept: Direct Memory Access transfers high-speed data directly between I/O peripherals and RAM without CPU intervention, bypassing MPU register fetch-execute cycles.',
          'Bus Master Concept: During DMA, the DMA Controller takes control of the address, data, and control buses from the 8086 microprocessor.',
          'Handshake Signals: HRQ (Hold Request sent by 8237 to 8086 HOLD pin) and HLDA (Hold Acknowledge sent by 8086 HLDA pin to 8237, signaling bus tri-stating).',
          'Overview of 8237A DMAC: High-performance programmable DMA controller containing 4 independent DMA channels (Channel 0 - Channel 3).',
          'Internal Channel Registers: Each channel contains a 16-bit Base Address Register, 16-bit Current Address Register, 16-bit Base Count Register, and 16-bit Current Count Register.'
        ]
      },
      {
        id: 'm19-s2',
        title: '2. 8237A DMA Modes & Bus Transfer Types 🔄',
        moduleTitle: 'Module 19: Direct Memory Access & Intel 8237A DMA Controller',
        moduleId: 'm19',
        interactiveType: 'dma-8237',
        points: [
          'DMA Operating Modes: Single Transfer Mode (releases bus after 1 byte), Block Transfer Mode (transfers entire block until count reaches zero), Demand Transfer Mode (transfers continuously as long as DRQ remains active), Cascade Mode.',
          'DMA Transfer Types: Memory-to-I/O Read, I/O-to-Memory Write, and Memory-to-Memory Transfer (using Channel 0 and Channel 1).',
          'Peripheral Handshake Signals: DRQ0-DRQ3 (DMA Request inputs from peripherals) and DACK0-DACK3 (DMA Acknowledge outputs to peripherals).',
          'Auto-initialization Feature: Automatically reloads base address and count values into current registers after block completion without CPU intervention.',
          'Performance Impact: DMA increases data transfer speeds from ~100 KB/s (CPU-driven string loops) to multi-megabytes per second.'
        ]
      },
      {
        id: 'm19-quiz',
        title: 'Module 19 Recap Quiz',
        moduleTitle: 'Module 19: Direct Memory Access & Intel 8237A DMA Controller',
        moduleId: 'm19',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'What happens to the 8086 microprocessor system buses (address, data, control) when it asserts the HLDA (Hold Acknowledge) signal to the DMA controller?',
            options: [
              'The buses are forced to 0V ground',
              'The buses are placed in high-impedance (tri-state) condition so the DMAC can drive them',
              'The buses execute an internal memory refresh cycle',
              'The buses latch the current instruction pointer IP'
            ],
            correctAnswer: 1,
            explanation: 'In response to HOLD from 8237, the 8086 asserts HLDA and releases its address, data, and control lines into high-impedance (tri-state) so the 8237 can master the system bus.'
          },
          {
            question: 'How many independent DMA channels are available on a single Intel 8237A DMA Controller IC?',
            options: ['2 channels', '4 channels', '8 channels', '16 channels'],
            correctAnswer: 1,
            explanation: 'The Intel 8237A provides 4 independent DMA channels (Channel 0 to Channel 3).'
          },
          {
            question: 'Which 8237A DMA transfer mode transfers data bytes continuously until the terminal count register reaches zero or EOP# is asserted?',
            options: [
              'Single Transfer Mode',
              'Block Transfer Mode',
              'Cycle Stealing Mode',
              'Software Interrupt Mode'
            ],
            correctAnswer: 1,
            explanation: 'In Block Transfer mode, once DRQ triggers the DMAC, data is transferred continuously until the Word Count register decrements to zero (Terminal Count).'
          }
        ]
      }
    ]
  },
  {
    id: 'm20',
    title: 'Module 20: Lab Resources & Experiments Manual 🧪',
    slides: [
      {
        id: 'm20-s1',
        title: 'Exp 1A: Multi-precision Addition & Subtraction (32-bit / 64-bit) ➕➖',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        interactiveType: 'directive-sandbox',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 Assembly Language Program (ALP) to perform multi-precision (32-bit / 64-bit) addition and subtraction of multi-byte hexadecimal numbers using ADC and SBB instructions.',
          '💡 THEORY & CONCEPT: Unsigned 32-bit and 64-bit operands exceed the 16-bit register capacity of the 8086 CPU. Multi-byte values are stored in contiguous memory locations in Little-Endian format (least significant byte at lowest address). Addition and subtraction are executed sequentially in 16-bit word or 8-bit byte iterations using ADC (Add with Carry) and SBB (Subtract with Borrow) to automatically propagate carry or borrow status across byte/word boundaries.'
        ]
      },
      {
        id: 'm20-s2',
        title: 'Exp 1B: Multiplication & Division of Signed & Unsigned Hex Numbers ✖️➗',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to perform multiplication and division of signed and unsigned hexadecimal numbers using MUL, IMUL, DIV, and IDIV instructions.',
          '💡 THEORY & MATHEMATICAL CONCEPT:',
          '  • Unsigned Multiplication (MUL): Multiplies 8-bit/16-bit unsigned numbers. For 16-bit (MUL SRC), AX × SRC yields a 32-bit product stored in the DX:AX register pair (DX = High Word, AX = Low Word). CF and OF flags are set if DX ≠ 0.',
          '  • Signed Multiplication (IMUL): Operates on 2\'s complement signed numbers (-32768 to +32767). The product sign is governed by algebraic sign rules (+×+=+, +×-=-). DX:AX contains the signed 32-bit result.',
          '  • Unsigned Division (DIV): For 32-bit dividend DX:AX divided by 16-bit divisor (DIV SRC), Quotient is stored in AX and Remainder in DX. DX must be zeroed (XOR DX, DX) prior to division to avoid Type 0 Divide Overflow Error.',
          '  • Signed Division (IDIV): Divides signed 32-bit dividend in DX:AX by signed 16-bit divisor. Before division, the 16-bit dividend in AX MUST be sign-extended into DX using CWD (Convert Word to Doubleword) so that Bit 15 of AX is replicated across all bits of DX.'
        ]
      },
      {
        id: 'm20-s3',
        title: 'Exp 1C: Square, Cube & Factorial of a Hexadecimal Number 🔢',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to calculate the square, cube, and factorial of a given hexadecimal byte value.',
          '💡 THEORY & MATHEMATICAL CONCEPT:',
          '  • Square (N²): Computed by loading number N into AX and operand register BX, then executing 16-bit unsigned multiplication MUL BX. The 16-bit product N² resides in AX (DX=0 for N ≤ 255).',
          '  • Cube (N³): Derived by taking the computed Square (N²) in AX, keeping N in BX, and multiplying again via MUL BX. Result N³ is stored in DX:AX for values where N³ exceeds 16 bits (N ≥ 41).',
          '  • Factorial (N! = N × (N-1) × ... × 1): Computed iteratively using a decremental loop with counter CX = N and accumulator AX = 1. In each iteration, AX = AX × CX (MUL CX) followed by LOOP instruction, which automatically decrements CX and repeats until CX = 0.',
          '  • Range & Overflow Constraints: 8086 16-bit registers hold values up to 65,535 (FFFFH). Factorial values up to 8! (40,320 = 9D80H) fit in AX. For N ≥ 9 (9! = 362,880), the product spans DX:AX, requiring 32-bit register pair management.'
        ]
      },
      {
        id: 'm20-s4',
        title: 'Exp 2A: Positive or Negative Data Check ➕/➖',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to check whether a given byte or word data is positive or negative by testing the Most Significant Bit (MSB/Sign Bit).',
          '💡 THEORY & CONCEPT: In signed 8086 binary notation, the Most Significant Bit (MSB, Bit 7 for bytes or Bit 15 for words) serves as the sign indicator (0 = Positive, 1 = Negative). The TEST AL, 80H instruction performs a non-destructive logical AND to isolate the MSB and set the Sign Flag (SF), enabling JS (Jump on Sign) or JNS conditional branching.'
        ]
      },
      {
        id: 'm20-s5',
        title: 'Exp 2B: Odd or Even Data Check 🔢',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to determine whether a given data byte is odd or even by testing the Least Significant Bit (LSB/Parity Bit).',
          '💡 THEORY & CONCEPT: An integer’s parity is determined by its Least Significant Bit (LSB, Bit 0): an LSB of 0 indicates an Even number, while an LSB of 1 indicates an Odd number. The TEST AL, 01H instruction masks Bit 0 and updates the Zero Flag (ZF), allowing JZ (Jump if Zero/Even) or JNZ (Jump if Not Zero/Odd) branching.'
        ]
      },
      {
        id: 'm20-s6',
        title: 'Exp 2C: Count Logical Ones and Zeros in a Data Byte 0️⃣1️⃣',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to count the total number of logical 1s and logical 0s in a given data byte.',
          '💡 THEORY & CONCEPT: Individual bits of a data byte are inspected sequentially using logical right shift instructions (SHR AL, 1). Each shift pushes the LSB into the Carry Flag (CF). A conditional JC (Jump if Carry) branch increments the 1s counter (BL) if CF=1, or the 0s counter (BH) if CF=0, repeating across an 8-iteration CX loop.'
        ]
      },
      {
        id: 'm20-s7',
        title: 'Exp 3A: Addition & Subtraction of N Numbers Array 📊',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to calculate the cumulative sum and progressive difference of an array containing N hexadecimal numbers.',
          '💡 THEORY & CONCEPT: Processing an array of N numbers involves initializing an index pointer register (SI or DI) to the starting RAM address and a loop counter (CX = N). Accumulation takes place in AL or AX via ADD AL, [SI] or SUB AL, [SI] commands, with SI incremented (INC SI) on each loop pass.'
        ]
      },
      {
        id: 'm20-s8',
        title: 'Exp 3B: Find Largest & Smallest Number in an Array 🔝🔻',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to find the largest (maximum) and smallest (minimum) numbers from an array of N hexadecimal elements.',
          '💡 THEORY & CONCEPT: Array extrema are determined by initializing AL with the candidate Maximum ([SI]) and AH with the candidate Minimum ([SI]). Iterating through the remaining N-1 elements with CMP AL, [SI+1] triggers conditional jumps (JA/JAE for unsigned max, JB/JBE for unsigned min) to selectively update the extrema candidate registers.'
        ]
      },
      {
        id: 'm20-s9',
        title: 'Exp 3C: Sort Array in Ascending & Descending Order 🔄',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to sort an array of N numbers in ascending and descending order using the Bubble Sort algorithm.',
          '💡 THEORY & CONCEPT: Sorting an array of N elements is implemented via the Bubble Sort algorithm using nested loops (Outer counter DX = N-1, Inner counter CX = DX). Adjacent bytes ([SI] and [SI+1]) are compared using CMP. If out of order, memory values are swapped using XCHG or register AH, bubbling the largest/smallest element to the end.'
        ]
      },
      {
        id: 'm20-s10',
        title: 'Exp 4A: String Length Calculation 🔤',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to calculate the total length of a given character string using string manipulation instructions.',
          '💡 THEORY & CONCEPT: String length is calculated using the SCASB (Scan String Byte) instruction with the REPNE (Repeat while Not Equal) prefix. With AL initialized to the string terminator ("$"), DI set to the string offset, and CX set to FFFFH, REPNE SCASB decrements CX on every byte scan. Applying NOT CX followed by DEC CX yields the exact character length.'
        ]
      },
      {
        id: 'm20-s11',
        title: 'Exp 4B: Display String on Console 🖥️',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to display a character string on the console screen using MS-DOS Interrupt 21H Function 09H.',
          '💡 THEORY & CONCEPT: Text rendering in MS-DOS is handled via MS-DOS Function Request INT 21H with Service 09H (Display String). The starting memory offset of the string must be loaded into register DX (LEA DX, STRING), and the string in Data Segment RAM must conclude with the ASCII "$" character terminator.'
        ]
      },
      {
        id: 'm20-s12',
        title: 'Exp 4C: String Comparison ⚖️',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to compare two character strings for equality using the CMPSB string instruction.',
          '💡 THEORY & CONCEPT: Two character strings are compared byte-by-byte using the CMPSB instruction paired with the REPE (Repeat while Equal) prefix. Pointing SI to String 1, DI to String 2, and loading CX with string length, REPE CMPSB decrements CX while characters match. If ZF=1 upon loop completion, the strings are identical.'
        ]
      },
      {
        id: 'm20-s13',
        title: 'Exp 4D: Reverse String & Palindrome Check 🔄',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to reverse a character string and verify whether the string is a palindrome.',
          '💡 THEORY & CONCEPT: A string is reversed by copying characters from the source end pointer (SI = end) to a target buffer (DI = start) in a decremental loop. Palindrome validation is then executed by comparing the original string with the reversed buffer using REPE CMPSB; equal strings satisfy the palindrome symmetry condition (ZF=1).'
        ]
      },
      {
        id: 'm20-s14',
        title: 'Exp 5: Block Data Transfer (Memory Copy & Management) 📦',
        moduleTitle: 'Module 20: Lab Resources & Experiments Manual',
        moduleId: 'm20',
        points: [
          '🎯 AIM & OBJECTIVE: Write an 8086 ALP to perform block data transfer of N bytes from a source memory offset to a destination memory offset.',
          '💡 THEORY & CONCEPT: High-speed block memory replication is performed using the MOVSB (Move String Byte) instruction with the REP prefix. Setting SI to the source offset, DI to the destination offset, CX to byte count, and clearing DF (CLD), REP MOVSB automatically transfers memory bytes from DS:SI to ES:DI in a single hardware cycle per byte.'
        ]
      }
    ]
  },
  {
    id: 'm21',
    title: 'Module 21: 8051 Microcontroller Architecture',
    slides: [
      {
        id: 'm21-s1',
        title: '1. Introduction to Microcontrollers & 8051 Overview',
        moduleTitle: 'Module 21: 8051 Microcontroller Architecture',
        moduleId: 'm21',
        points: [
          'Microprocessor vs. Microcontroller: A Microprocessor (like 8086) contains only CPU core components (ALU, Registers) and requires external RAM, ROM, Timers, and I/O chips on the motherboard. A Microcontroller (like 8051) integrates CPU, RAM, ROM, Timers, Serial Port, and Parallel I/O ports on a single silicon die.',
          'Intel 8051 Core Features: 8-bit CPU optimized for control applications, Harvard Architecture (separate 64 KB Program ROM and 64 KB Data RAM address spaces).',
          'On-Chip Resources: 128 Bytes Internal RAM, 4 KB On-Chip Flash/EPROM ROM, Two 16-bit Timers/Counters (Timer 0 & Timer 1), Full-Duplex Serial UART Port, Four 8-bit Parallel I/O Ports (32 I/O lines), and 5-source Interrupt Controller with 2 priority levels.',
          'Oscillator & Clock: On-chip oscillator circuit driven by an external quartz crystal (typically 11.0592 MHz or 12 MHz). 1 Machine Cycle = 12 Clock Cycles (1 μs period at 12 MHz).'
        ]
      },
      {
        id: 'm21-s2',
        title: '2. 8051 Hardware Block Diagram & Core Units',
        moduleTitle: 'Module 21: 8051 Microcontroller Architecture',
        moduleId: 'm21',
        points: [
          'Interactive 8051 Block Diagram: Click any internal hardware block to inspect functional capabilities, registers, and interconnect buses.',
          'Arithmetic Logic Unit (ALU): Performs 8-bit addition, subtraction, multiplication (MUL AB), division (DIV AB), BCD adjustment (DA A), and bitwise logic operations.',
          'Accumulator (A / ACC) & B Register: Primary 8-bit registers residing at SFR addresses E0H and F0H.',
          'Program Counter (PC) & Data Pointer (DPTR): PC is a 16-bit register holding the ROM instruction address. DPTR is a 16-bit register (split into DPH at 83H and DPL at 82H) used for external memory data transfer.'
        ],
        interactiveType: 'mcu-8051'
      },
      {
        id: 'm21-quiz',
        title: 'Module 21 Recap Quiz',
        moduleTitle: 'Module 21: 8051 Microcontroller Architecture',
        moduleId: 'm21',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'How much internal data RAM and on-chip program ROM does the standard Intel 8051 microcontroller contain?',
            options: ['64 KB RAM, 64 KB ROM', '128 Bytes RAM, 4 KB ROM', '1 KB RAM, 16 KB ROM', '256 Bytes RAM, 8 KB ROM'],
            correctAnswer: 1,
            explanation: 'The standard 8051 contains 128 Bytes of internal RAM and 4 KB of on-chip program ROM.'
          },
          {
            question: 'How many clock oscillator cycles make up exactly one 8051 machine cycle?',
            options: ['1', '4', '6', '12'],
            correctAnswer: 3,
            explanation: 'An 8051 machine cycle consists of 12 clock oscillator periods (states S1P1 through S6P2).'
          },
          {
            question: 'Which 16-bit register in the 8051 is used as a memory pointer for accessing external RAM (MOVX) or program ROM tables (MOVC)?',
            options: ['Program Counter (PC)', 'Data Pointer (DPTR)', 'Stack Pointer (SP)', 'Accumulator (ACC)'],
            correctAnswer: 1,
            explanation: 'The 16-bit Data Pointer (DPTR = DPH:DPL) serves as the primary pointer for external memory accesses.'
          }
        ]
      }
    ]
  },
  {
    id: 'm22',
    title: 'Module 22: Special Function Registers (SFRs) & Memory',
    slides: [
      {
        id: 'm22-s1',
        title: '1. 8051 Internal RAM & ROM Memory Organization',
        moduleTitle: 'Module 22: Special Function Registers (SFRs) & Memory',
        moduleId: 'm22',
        points: [
          'Internal RAM Structure (00H to 7FH - 128 Bytes): Divided into 3 distinct zones:',
          '1) Register Banks 0–3 (00H–1FH): 32 bytes arranged into 4 switchable banks, each containing registers R0 through R7.',
          '2) Bit Addressable RAM (20H–2FH): 16 bytes containing 128 individually addressable bits (bit addresses 00H through 7FH). Allows Boolean operations without affecting adjacent bits.',
          '3) General Purpose Scratchpad RAM (30H–7FH): 80 bytes for general variables and the internal hardware stack.',
          'Upper 128 Bytes RAM Space (80H–FFH): Dedicated to Special Function Registers (SFRs).'
        ]
      },
      {
        id: 'm22-s2',
        title: '2. Special Function Registers (SFRs) Map & Bit Addressability',
        moduleTitle: 'Module 22: Special Function Registers (SFRs) & Memory',
        moduleId: 'm22',
        points: [
          'SFR Memory Map (80H to FFH): Control and status registers for CPU core, timers, serial port, I/O ports, and interrupts.',
          'Bit Addressable SFRs: SFRs whose hexadecimal addresses end in 0H or 8H (e.g. ACC @ E0H, B @ F0H, PSW @ D0H, P0 @ 80H, P1 @ 90H, P2 @ A0H, P3 @ B0H, TCON @ 88H, SCON @ 98H, IE @ A8H, IP @ B8H) are individually bit-addressable!',
          'Byte-Only SFRs: SP (81H), DPTR (DPH=83H, DPL=82H), TMOD (89H), TH0/TL0 (8CH/8AH), TH1/TL1 (8DH/8BH), SBUF (99H), PCON (87H).'
        ],
        interactiveType: 'sfr-memory'
      },
      {
        id: 'm22-s3',
        title: '3. Program Status Word (PSW) & Register Bank Switching',
        moduleTitle: 'Module 22: Special Function Registers (SFRs) & Memory',
        moduleId: 'm22',
        points: [
          'Program Status Word (PSW @ D0H): 8-bit flag register holding CPU status flags:',
          'PSW.7 (CY): Carry flag set on unsigned arithmetic carry or borrow.',
          'PSW.6 (AC): Auxiliary Carry flag set on carry out of bit 3 (used for BCD DA A).',
          'PSW.5 (F0): General purpose user flag bit 0.',
          'PSW.4 & PSW.3 (RS1 & RS0): Register Bank Selector bits (00 = Bank 0 at 00H, 01 = Bank 1 at 08H, 10 = Bank 2 at 10H, 11 = Bank 3 at 18H).',
          'PSW.2 (OV): Overflow flag set on signed two\'s complement arithmetic overflow.',
          'PSW.1: Reserved for user/future expansion.',
          'PSW.0 (P): Parity flag automatically updated by hardware (1 if Accumulator has odd number of 1s).'
        ]
      },
      {
        id: 'm22-quiz',
        title: 'Module 22 Recap Quiz',
        moduleTitle: 'Module 22: Special Function Registers (SFRs) & Memory',
        moduleId: 'm22',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which bits in the Program Status Word (PSW) register select the active register bank (Banks 0–3)?',
            options: ['CY and AC', 'RS1 and RS0', 'OV and P', 'F0 and F1'],
            correctAnswer: 1,
            explanation: 'RS1 (PSW.4) and RS0 (PSW.3) select the active working register bank (00 = Bank 0, 01 = Bank 1, 10 = Bank 2, 11 = Bank 3).'
          },
          {
            question: 'What is the default RAM stack location loaded into the Stack Pointer (SP @ 81H) upon hardware reset?',
            options: ['00H', '07H', '20H', '80H'],
            correctAnswer: 1,
            explanation: 'Upon reset, SP is loaded with 07H, meaning the first PUSH instruction increments SP to 08H (start of Register Bank 1).'
          },
          {
            question: 'Which range of internal RAM addresses contains 128 individually addressable bits (bit addresses 00H–7FH)?',
            options: ['00H to 0FH', '20H to 2FH', '30H to 7FH', '80H to FFH'],
            correctAnswer: 1,
            explanation: 'Addresses 20H through 2FH (16 bytes) form the bit-addressable RAM space in the 8051.'
          }
        ]
      }
    ]
  },
  {
    id: 'm23',
    title: 'Module 23: 8051 I/O Pins, Ports & Circuits',
    slides: [
      {
        id: 'm23-s1',
        title: '1. 8051 40-Pin DIP Package & Power/Oscillator Pins',
        moduleTitle: 'Module 23: 8051 I/O Pins, Ports & Circuits',
        moduleId: 'm23',
        points: [
          '40-Pin Dual In-line Package (DIP): 32 pins dedicated to 4 parallel I/O ports, plus 8 control and power supply pins.',
          'VCC (Pin 40) & GND (Pin 20): +5V DC regulated power supply and ground return.',
          'XTAL1 (Pin 19) & XTAL2 (Pin 18): On-chip oscillator input/output connected to external quartz crystal and two 30 pF capacitors.',
          'RESET (Pin 9): Active HIGH reset input requiring at least 2 machine cycles (24 clock periods) HIGH to reset processor.',
          'EA# / VPP (Pin 31 - External Access): Tied HIGH (+5V) for internal 4KB ROM execution; tied LOW (0V) for external ROM (0000H–FFFFH).'
        ]
      },
      {
        id: 'm23-s2',
        title: '2. Parallel I/O Ports Structure (P0, P1, P2, P3) & Circuits',
        moduleTitle: 'Module 23: 8051 I/O Pins, Ports & Circuits',
        moduleId: 'm23',
        points: [
          'Four 8-bit Parallel Ports (32 Bidirectional Lines): Port 0 (Pins 32–39), Port 1 (Pins 1–8), Port 2 (Pins 21–28), Port 3 (Pins 10–17).',
          'Port 0 Circuit: True Open-Drain bidirectional port without internal pull-up resistors. Requires external 10kΩ pull-up resistor array for general digital I/O. Functions as multiplexed low-order address/data bus (AD0–AD7) during external memory expansion.',
          'Ports 1, 2, 3 Circuits: Quasi-bidirectional ports with internal FET pull-up resistors. Must write 1s to port latches before reading external inputs.',
          'Port 2 Circuit: Outputs high-order address byte (A8–A15) when interfacing with external ROM/RAM.'
        ],
        interactiveType: 'mcu-pins'
      },
      {
        id: 'm23-s3',
        title: '3. Port 3 Alternate Functions & Bus Control Signals',
        moduleTitle: 'Module 23: 8051 I/O Pins, Ports & Circuits',
        moduleId: 'm23',
        points: [
          'Port 3 Multi-Functional Lines:',
          '• P3.0 (RXD) & P3.1 (TXD): Serial data input / output pins for 8251/UART communication.',
          '• P3.2 (INT0#) & P3.3 (INT1#): External hardware interrupt inputs 0 and 1.',
          '• P3.4 (T0) & P3.5 (T1): External timer/counter clock inputs.',
          '• P3.6 (WR#) & P3.7 (RD#): Active-low write and read strobe lines for external RAM (MOVX).',
          'ALE / PROG# (Pin 30): Address Latch Enable pulses HIGH to latch Port 0 address (A0–A7) into external 74LS373 latch.',
          'PSEN# (Pin 29): Program Store Enable output strobe for fetching instructions from external EPROM.'
        ]
      },
      {
        id: 'm23-quiz',
        title: 'Module 23 Recap Quiz',
        moduleTitle: 'Module 23: 8051 I/O Pins, Ports & Circuits',
        moduleId: 'm23',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which 8051 I/O port has open-drain outputs and requires external pull-up resistors when used as general-purpose digital I/O?',
            options: ['Port 0', 'Port 1', 'Port 2', 'Port 3'],
            correctAnswer: 0,
            explanation: 'Port 0 is an open-drain port without internal pull-ups, requiring an external pull-up resistor network for standalone I/O.'
          },
          {
            question: 'What is the function of the PSEN# (Pin 29) signal on the 8051 microcontroller?',
            options: [
              'Power supply enable for standby mode',
              'Active-low output enable strobe for reading code from external ROM',
              'Parallel printer strobe signal',
              'Analog reference voltage input'
            ],
            correctAnswer: 1,
            explanation: 'PSEN# (Program Store Enable) is an active-low output signal connected to the Output Enable (OE#) pin of external program EPROMs.'
          },
          {
            question: 'Which pin on Port 3 serves as the active-low External Interrupt 0 input (INT0#)?',
            options: ['P3.0', 'P3.2', 'P3.4', 'P3.6'],
            correctAnswer: 1,
            explanation: 'Pin P3.2 serves as the External Interrupt 0 input (INT0#).'
          }
        ]
      }
    ]
  },
  {
    id: 'm24',
    title: 'Module 24: 8051 Addressing Modes & Instruction Set',
    slides: [
      {
        id: 'm24-s1',
        title: '1. 8051 Addressing Modes Overview',
        moduleTitle: 'Module 24: 8051 Addressing Modes & Instruction Set',
        moduleId: 'm24',
        points: [
          'Addressing Modes: Methods used by 8051 instructions to specify operand memory locations or constant values.',
          '1) Immediate Addressing: Operand is a constant data value preceded by "#" (e.g. MOV A, #55H / MOV DPTR, #1234H).',
          '2) Register Addressing: Operands are held in working registers R0–R7, A, B, DPTR, or C (e.g. MOV A, R3 / ADD A, R0).',
          '3) Direct Addressing: Operands specified by 8-bit RAM memory or SFR hexadecimal address (e.g. MOV A, 30H / MOV 90H, A).',
          '4) Register-Indirect Addressing: Memory location pointed to by R0 or R1 using "@" prefix (e.g. MOV A, @R0 / MOVX A, @DPTR).',
          '5) Indexed Addressing: Program ROM table lookup using DPTR or PC as base and A as offset (e.g. MOVC A, @A+DPTR).'
        ]
      },
      {
        id: 'm24-s2',
        title: '2. 8051 Instruction Set Groups & Opcode Explorer',
        moduleTitle: 'Module 24: 8051 Addressing Modes & Instruction Set',
        moduleId: 'm24',
        points: [
          '8051 Instruction Classification (5 Categories):',
          '• Data Transfer Instructions: MOV, MOVX, MOVC, PUSH, POP, XCHG, XCHD.',
          '• Arithmetic Instructions: ADD, ADDC, SUBB, INC, DEC, MUL AB, DIV AB, DA A.',
          '• Logical Instructions: ANL, ORL, XRL, CLR A, CPL A, RL, RLC, RR, RRC, SWAP A.',
          '• Bit / Boolean Instructions: CLR bit, SETB bit, CPL bit, ANL C, bit, ORL C, bit, MOV C, bit.',
          '• Program Branching Instructions: LJMP, AJMP, SJMP, JZ, JNZ, CJNE, DJNZ, LCALL, ACALL, RET, RETI.'
        ],
        interactiveType: 'mcu-instructions'
      },
      {
        id: 'm24-s3',
        title: '3. Special Instructions & Boolean Feature Set',
        moduleTitle: 'Module 24: 8051 Addressing Modes & Instruction Set',
        moduleId: 'm24',
        points: [
          'Boolean Processor Capabilities: The 8051 includes a complete single-bit Boolean processor with the Carry Flag (CY) acting as a 1-bit accumulator!',
          'Single-Bit Logic Commands: SETB C, CLR P1.0, CPL ACC.7, ANL C, P3.2 enable instant bit manipulation without read-modify-write masking overhead.',
          'Compare and Jump if Not Equal (CJNE): Compares 2 bytes and branches if not equal; sets Carry Flag if Destination < Source.',
          'Decrement and Jump if Not Zero (DJNZ): Decrements register/RAM byte by 1 and branches if non-zero in a single 2-byte instruction (ideal for hardware delay loops!).'
        ]
      },
      {
        id: 'm24-quiz',
        title: 'Module 24 Recap Quiz',
        moduleTitle: 'Module 24: 8051 Addressing Modes & Instruction Set',
        moduleId: 'm24',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which addressing mode is used in the instruction MOV A, @R0?',
            options: ['Immediate Addressing', 'Direct Addressing', 'Register-Indirect Addressing', 'Indexed Addressing'],
            correctAnswer: 2,
            explanation: 'The "@" symbol indicates Register-Indirect addressing, where R0 holds the internal RAM memory pointer.'
          },
          {
            question: 'What does the instruction DJNZ R2, LOOP do during execution?',
            options: [
              'Increments R2 and jumps if zero',
              'Decrements R2 by 1 and jumps to LOOP if R2 is NOT zero',
              'Divides R2 by 2 and branches unconditionally',
              'Compares R2 with Zero and sets the Zero Flag'
            ],
            correctAnswer: 1,
            explanation: 'DJNZ (Decrement and Jump if Not Zero) decrements R2 and branches to LOOP if R2 != 0.'
          },
          {
            question: 'Which instruction reads a constant data byte from Program ROM into the Accumulator using indexed addressing?',
            options: ['MOV A, 30H', 'MOVX A, @DPTR', 'MOVC A, @A+DPTR', 'PUSH 0E0H'],
            correctAnswer: 2,
            explanation: 'MOVC A, @A+DPTR reads a byte from Code/Program ROM using the sum of A and DPTR as the 16-bit ROM address.'
          }
        ]
      }
    ]
  },
  {
    id: 'm25',
    title: 'Module 25: 8051 Assembly Language Programming',
    slides: [
      {
        id: 'm25-s1',
        title: '1. 8051 Assembly Syntax, Directives & Structure',
        moduleTitle: 'Module 25: 8051 Assembly Language Programming',
        moduleId: 'm25',
        points: [
          'Assembly Program Structure: Written using mnemonics, labels, operands, and assembler directives.',
          'Core Directives:',
          '• ORG (Origin): Sets starting memory address for machine code (e.g. ORG 0000H).',
          '• EQU (Equate): Assigns a symbolic label to a constant address or value (e.g. LED EQU P1.0).',
          '• END: Mandatory termination directive for the assembler.',
          '• DB (Define Byte) & DW (Define Word): Reserves byte or 16-bit word data tables in ROM memory.'
        ]
      },
      {
        id: 'm25-s2',
        title: '2. Interactive 8051 ALP Execution Engine & LED Port Simulator',
        moduleTitle: 'Module 25: 8051 Assembly Language Programming',
        moduleId: 'm25',
        points: [
          'Interactive 8051 Assembly Simulator: Step through 8051 programs, monitor register files (A, B, R0–R7, DPTR, SP, PC), and watch real-time Port 1 LED outputs update!',
          'Programming Examples Included: Accumulator operations, loop counters with DJNZ, port toggling, and bit manipulation.'
        ],
        interactiveType: 'mcu-alp'
      },
      {
        id: 'm25-quiz',
        title: 'Module 25 Recap Quiz',
        moduleTitle: 'Module 25: 8051 Assembly Language Programming',
        moduleId: 'm25',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which assembler directive sets the starting program counter origin address in 8051 code memory?',
            options: ['EQU', 'ORG', 'END', 'DB'],
            correctAnswer: 1,
            explanation: 'The ORG (Origin) directive specifies the exact starting ROM memory address for subsequent machine code instructions.'
          },
          {
            question: 'What is the effect of executing CPL P1.0 in an 8051 assembly loop driving an LED?',
            options: [
              'Clears Port 1 pin 0 to 0V permanently',
              'Complements (toggles) the logic state of Port 1 pin 0 between 0 and 1',
              'Sets Port 1 pin 0 to +5V high impedance',
              'Resets the entire microcontroller'
            ],
            correctAnswer: 1,
            explanation: 'CPL P1.0 complements (inverts) the logical state of pin P1.0, toggling an attached LED on or off.'
          }
        ]
      }
    ]
  },
  {
    id: 'm26',
    title: 'Module 26: 8051 Timers & Serial Port Programming',
    slides: [
      {
        id: 's26-1',
        title: '8051 Hardware Timers / Counters (Timer 0 & Timer 1)',
        moduleTitle: 'Module 26: 8051 Timers & Serial Port Programming',
        moduleId: 'm26',
        points: [
          'The 8051 microcontroller contains two 16-bit Timer/Counter hardware modules: Timer 0 (TH0, TL0) and Timer 1 (TH1, TL1).',
          'Operating Modes: In Timer mode, the register counts internal machine cycles (XTAL frequency ÷ 12). In Counter mode, it counts negative-edge transitions on external pins T0 (P3.4) or T1 (P3.5).',
          'TMOD Register (89H): 8-bit non-bit-addressable register that configures the operating mode (Mode 0, 1, 2, 3) and source (C/T# bit) for Timer 0 and Timer 1.',
          'TCON Register (88H): Bit-addressable control register containing TR0/TR1 (timer run flags) and TF0/TF1 (timer overflow flags).'
        ]
      },
      {
        id: 's26-2',
        title: 'Timer Operating Modes & Baud Rate Generation',
        moduleTitle: 'Module 26: 8051 Timers & Serial Port Programming',
        moduleId: 'm26',
        points: [
          'Mode 0: 13-bit timer mode (8-bit THx + 5-bit prescaler TLx). Counts from 0000H to 1FFFH.',
          'Mode 1: 16-bit timer mode (8-bit THx + 8-bit TLx). Counts from 0000H to FFFFH (65,536 cycles max).',
          'Mode 2: 8-bit auto-reload mode. TLx acts as the active 8-bit counter while THx holds the reload value. On overflow, TLx is reloaded from THx automatically (ideal for UART baud rate generation).',
          'Baud Rate Calculation for 8051 UART Mode 1:',
          'Baud Rate = (2^SMOD ÷ 32) × (Crystal Frequency ÷ (12 × (256 - TH1)))',
          'With 11.0592 MHz crystal and SMOD=0: TH1 = 256 - (11,059,200 ÷ (384 × Baud Rate)). For 9600 Baud, TH1 = 256 - 3 = 253 = 0xFD.'
        ]
      },
      {
        id: 's26-3',
        title: 'Interactive 8051 Timers & Serial Port Configurator',
        moduleTitle: 'Module 26: 8051 Timers & Serial Port Programming',
        moduleId: 'm26',
        interactiveType: 'mcu-timers-serial'
      },
      {
        id: 's26-4',
        title: 'Module 26 Assessment: Timers & Serial Communication',
        moduleTitle: 'Module 26: 8051 Timers & Serial Port Programming',
        moduleId: 'm26',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'In 8051 Timer Mode 2 (8-bit auto-reload), what happens when TLx overflows from FFH to 00H?',
            options: [
              'The timer stops running permanently until a hardware reset occurs',
              'TLx is automatically reloaded with the value stored in THx and TFx is set',
              'THx is cleared to 00H and the program halts',
              'The timer switches automatically to 16-bit Mode 1'
            ],
            correctAnswer: 1,
            explanation: 'In Mode 2, TLx acts as the 8-bit counter. Upon overflow, the content of THx is loaded into TLx automatically, and the overflow flag TFx is set to 1.'
          },
          {
            question: 'What initial value must be loaded into TH1 to achieve a 9600 baud rate with an 11.0592 MHz crystal (SMOD = 0)?',
            options: [
              '0xFF (-1)',
              '0xFD (-3)',
              '0xF4 (-12)',
              '0xE8 (-24)'
            ],
            correctAnswer: 1,
            explanation: 'For 9600 baud rate at 11.0592 MHz with SMOD=0, TH1 = 256 - (11,059,200 / (384 * 9600)) = 256 - 3 = 253 = 0xFD.'
          }
        ]
      }
    ]
  },
  {
    id: 'm27',
    title: 'Module 27: 8051 Interrupts, LCD & Keypad Interfacing',
    slides: [
      {
        id: 's27-1',
        title: '8051 Interrupt Structure & Priority Control',
        moduleTitle: 'Module 27: 8051 Interrupts, LCD & Keypad Interfacing',
        moduleId: 'm27',
        points: [
          'The 8051 microcontroller supports 5 hardware interrupt sources + Reset vector:',
          '1. Reset (0000H) - Highest priority hardware reset vector.',
          '2. External Interrupt 0 (INT0# @ 0003H) - Triggered via pin P3.2 (low level or falling edge).',
          '3. Timer 0 Interrupt (TF0 @ 000BH) - Triggered on Timer 0 overflow.',
          '4. External Interrupt 1 (INT1# @ 0013H) - Triggered via pin P3.3.',
          '5. Timer 1 Interrupt (TF1 @ 001BH) - Triggered on Timer 1 overflow.',
          '6. Serial Port Interrupt (RI/TI @ 0023H) - Triggered when a byte is received or transmitted.',
          'Interrupt Enable (IE @ A8H) & Interrupt Priority (IP @ B8H) registers govern global/individual enable flags and 2-level priority schemes.'
        ]
      },
      {
        id: 's27-2',
        title: 'HD44780 16x2 LCD & Matrix Keypad Interfacing',
        moduleTitle: 'Module 27: 8051 Interrupts, LCD & Keypad Interfacing',
        moduleId: 'm27',
        points: [
          '16x2 Character LCD Interfacing (HD44780):',
          'Data Lines (D0–D7 connected to P0 or P2), Control Lines: RS (Register Select: 0=Command, 1=Data), RW (Read/Write: 0=Write), EN (Enable pulse high-to-low transition).',
          'Key Initialization Commands: 38H (2 lines, 5x7 matrix), 0EH (Display ON, cursor ON), 01H (Clear display screen), 80H (Force cursor to line 1 start).',
          '4x4 Matrix Keypad Scanning:',
          'Rows (P1.0–P1.3) are configured as outputs and driven LOW one at a time. Columns (P1.4–P1.7) with internal pull-ups are read as inputs. A LOW on any column indicates a key press at the row-column intersection.'
        ]
      },
      {
        id: 's27-3',
        title: 'Interactive Interrupts, LCD & Keypad Simulator',
        moduleTitle: 'Module 27: 8051 Interrupts, LCD & Keypad Interfacing',
        moduleId: 'm27',
        interactiveType: 'mcu-interrupts-lcd'
      },
      {
        id: 's27-4',
        title: 'Module 27 Assessment: Interrupts & Display Interfaces',
        moduleTitle: 'Module 27: 8051 Interrupts, LCD & Keypad Interfacing',
        moduleId: 'm27',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'What is the vector address for External Interrupt 0 (INT0#) in the 8051 microcontroller?',
            options: [
              '0000H',
              '0003H',
              '000BH',
              '0013H'
            ],
            correctAnswer: 1,
            explanation: 'External Interrupt 0 (INT0#) branches to vector address 0003H when triggered.'
          },
          {
            question: 'In HD44780 LCD interfacing, what logic state must RS (Register Select) be set to when sending display ASCII characters?',
            options: [
              'RS = 0 (Command Register)',
              'RS = 1 (Data Register)',
              'RS = High Impedance',
              'RS does not matter'
            ],
            correctAnswer: 1,
            explanation: 'Setting RS = 1 selects the LCD Data Register, allowing incoming byte data to be written directly onto the LCD display matrix.'
          }
        ]
      }
    ]
  },
  {
    id: 'm28',
    title: 'Module 28: ADC, DAC, Sensor & External Memory Interfacing',
    slides: [
      {
        id: 's28-1',
        title: 'ADC0804 & LM35 Analog Sensor Interfacing',
        moduleTitle: 'Module 28: ADC, DAC, Sensor & External Memory Interfacing',
        moduleId: 'm28',
        points: [
          'LM35 Precision Temperature Sensor: Analog output voltage scaled at 10 mV/°C (e.g., 250 mV at 25°C).',
          'ADC0804 8-Bit Analog-to-Digital Converter: Successive Approximation ADC with 8-bit output (resolution = Vref/2 / 128 = ~19.5 mV/step).',
          'Interfacing Protocol: 8051 pulses CS# & WR# LOW to start conversion. ADC asserts INTR# LOW when conversion finishes. 8051 reads 8-bit digital output DB0–DB7 via Port 0 by pulsing RD# LOW.'
        ]
      },
      {
        id: 's28-2',
        title: 'DAC0808 & External Memory Bus (64KB RAM/ROM)',
        moduleTitle: 'Module 28: ADC, DAC, Sensor & External Memory Interfacing',
        moduleId: 'm28',
        points: [
          'DAC0808 8-Bit Digital-to-Analog Converter: Converts 8-bit digital data on DB0–DB7 into proportional analog output current (Iout = Iref × (D/256)), converted to voltage using an Operational Amplifier.',
          'External Memory Expansion (up to 64KB Program ROM & 64KB Data RAM):',
          'Port 0 serves as multiplexed low-order address/data bus (A0–A7 / D0–D7).',
          'ALE (Address Latch Enable) pulses HIGH to latch low address bits into a 74HC373 latch.',
          'Port 2 outputs high-order address bits A8–A15.',
          'Control Signals: PSEN# (Program Store Enable) reads external EPROM/Flash ROM. RD# (P3.7) and WR# (P3.6) read/write external SRAM.'
        ]
      },
      {
        id: 's28-3',
        title: 'Interactive ADC, DAC & Sensor Interfacing Explorer',
        moduleTitle: 'Module 28: ADC, DAC, Sensor & External Memory Interfacing',
        moduleId: 'm28',
        interactiveType: 'mcu-adc-dac'
      },
      {
        id: 's28-4',
        title: 'Module 28 Assessment: Sensors & Data Converters',
        moduleTitle: 'Module 28: ADC, DAC, Sensor & External Memory Interfacing',
        moduleId: 'm28',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which signal from the 8051 microcontroller is used as the active-LOW read strobe for external Program ROM code fetches?',
            options: [
              'ALE (Address Latch Enable)',
              'PSEN# (Program Store Enable)',
              'RD# (P3.7)',
              'WR# (P3.6)'
            ],
            correctAnswer: 1,
            explanation: 'PSEN# (Program Store Enable) is the dedicated read control signal used exclusively when fetching instructions from external Program ROM.'
          },
          {
            question: 'What is the voltage output of an LM35 temperature sensor at 30°C given its 10 mV/°C scale factor?',
            options: [
              '30 mV',
              '300 mV (0.30 V)',
              '3.0 V',
              '30 V'
            ],
            correctAnswer: 1,
            explanation: 'Since the LM35 produces 10 mV per degree Celsius, at 30°C the output voltage is 30 * 10 mV = 300 mV (0.3 V).'
          }
        ]
      }
    ]
  },
  {
    id: 'm29',
    title: 'Module 29: Stepper Motor & Waveform Generation',
    slides: [
      {
        id: 's29-1',
        title: 'Stepper Motor Control Principles & Driver Circuits',
        moduleTitle: 'Module 29: Stepper Motor & Waveform Generation',
        moduleId: 'm29',
        points: [
          'Stepper Motor Construction: Brushless DC electric motor that divides a full rotation into discrete equal steps (e.g., 1.8° step angle = 200 steps/rev).',
          'Interfacing Drivers: 8051 I/O pins cannot drive inductive motor coils directly due to current limits (~10mA). ULN2003 (Darlington transistor array) or L293D (H-Bridge) drivers are required.',
          'Excitation Step Sequences:',
          '1. Wave Drive (Single Phase): Energizes 1 coil at a time (1000 -> 0100 -> 0010 -> 0001). Lowest power.',
          '2. Full-Step Drive (Two Phase): Energizes 2 coils simultaneously (1100 -> 0110 -> 0011 -> 1001). Maximum torque.',
          '3. Half-Step Drive: Alternates single and dual coils (1000 -> 1100 -> 0100 -> 0110...). Twice the angular resolution.'
        ]
      },
      {
        id: 's29-2',
        title: 'Analog Waveform Generation using DAC0808',
        moduleTitle: 'Module 29: Stepper Motor & Waveform Generation',
        moduleId: 'm29',
        points: [
          'Square Wave Generation: Repeatedly output 00H and FFH to DAC with timer delay loops.',
          'Ramp / Sawtooth Wave Generation: Increment digital output byte from 00H to FFH sequentially (MOV A, #00H -> OUT -> INC A).',
          'Triangular Wave Generation: Increment byte from 00H to FFH, then decrement from FFH back to 00H in a continuous loop.',
          'Sine Wave Generation: Store pre-calculated sine values (e.g., 36 samples for 0°–360°) in 8051 Program ROM and cycle through using look-up table pointer (MOVC A, @A+DPTR).'
        ]
      },
      {
        id: 's29-3',
        title: 'Interactive Stepper Motor & Waveform Generator',
        moduleTitle: 'Module 29: Stepper Motor & Waveform Generation',
        moduleId: 'm29',
        interactiveType: 'mcu-stepper-wave'
      },
      {
        id: 's29-4',
        title: 'Module 29 Assessment: Motors & Signal Generation',
        moduleTitle: 'Module 29: Stepper Motor & Waveform Generation',
        moduleId: 'm29',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Why is a driver IC like ULN2003 or L293D necessary between an 8051 microcontroller port and a stepper motor?',
            options: [
              '8051 port pins operate in analog mode and cannot send digital signals',
              '8051 I/O pins cannot source/sink the high currents (~500mA) and inductive back-EMF required by motor coils',
              'Stepper motors require AC voltages',
              'The driver IC reduces the step angle of the motor'
            ],
            correctAnswer: 1,
            explanation: 'Microcontroller pins can only safely output ~10-20mA at 5V, whereas stepper motor coils demand several hundred milliamps and require inductive back-EMF flyback diode protection.'
          },
          {
            question: 'How many total steps are required for a stepper motor with a 1.8° step angle to complete one full 360° revolution?',
            options: [
              '100 steps',
              '180 steps',
              '200 steps',
              '360 steps'
            ],
            correctAnswer: 2,
            explanation: 'Total steps = 360° / 1.8° = 200 steps per full revolution.'
          }
        ]
      }
    ]
  },
  {
    id: 'm30',
    title: 'Module 30: Comparison of Microprocessor, Microcontroller, PIC & ARM Processors',
    slides: [
      {
        id: 's30-1',
        title: 'Architectural Comparison: Microprocessor vs. Microcontroller',
        moduleTitle: 'Module 30: Comparison of Microprocessor, Microcontroller, PIC & ARM Processors',
        moduleId: 'm30',
        points: [
          'Microprocessor (e.g., Intel 8086 / x86): Contains CPU core only (ALU, Registers, Control Unit). RAM, ROM, Timers, and I/O ports must be connected externally via system buses. High computational power, expensive, high power consumption.',
          'Microcontroller (e.g., Intel 8051): Integrated System-on-Chip (SoC) combining CPU core, RAM, Flash ROM, Timers, Serial UART, and Parallel I/O ports on a single silicon die. Low cost, low power, ideal for embedded control.'
        ]
      },
      {
        id: 's30-2',
        title: 'PIC vs. ARM Processor Architectures',
        moduleTitle: 'Module 30: Comparison of Microprocessor, Microcontroller, PIC & ARM Processors',
        moduleId: 'm30',
        points: [
          'PIC Microcontrollers (Microchip): 8-bit / 16-bit RISC architecture (Harvard structure). Uses simple 35-instruction set, single-word execution, internal EEPROM, and high noise immunity for industrial systems.',
          'ARM Processors (Advanced RISC Machine / Cortex-M & Cortex-A): 32-bit / 64-bit high-performance RISC architecture. Features load-store architecture, Thumb-2 instruction set, multi-stage hardware pipeline, low power per watt, and powers smartphones, automotive, and robotics.'
        ]
      },
      {
        id: 's30-3',
        title: 'Interactive MPU, MCU, PIC & ARM Comparison Matrix',
        moduleTitle: 'Module 30: Comparison of Microprocessor, Microcontroller, PIC & ARM Processors',
        moduleId: 'm30',
        interactiveType: 'processor-comparison'
      },
      {
        id: 's30-4',
        title: 'Module 30 Assessment: Processor Architectures',
        moduleTitle: 'Module 30: Comparison of Microprocessor, Microcontroller, PIC & ARM Processors',
        moduleId: 'm30',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'What is a fundamental architectural distinction between a Microprocessor (like 8086) and a Microcontroller (like 8051)?',
            options: [
              'A microprocessor contains RAM and ROM on chip, whereas a microcontroller does not',
              'A microcontroller integrates CPU, RAM, ROM, Timers, and I/O on a single chip, whereas a microprocessor contains CPU only',
              'Microprocessors do not use system buses',
              'Microcontrollers cannot execute assembly language instructions'
            ],
            correctAnswer: 1,
            explanation: 'A microcontroller is a complete single-chip computer system with on-die RAM, ROM, timers, and I/O, whereas a microprocessor is solely a central processing unit requiring external peripheral chips.'
          },
          {
            question: 'Which processor architecture family dominates modern mobile devices, IoT edge systems, and high-performance embedded systems due to its high power efficiency and 32/64-bit RISC pipeline?',
            options: [
              'Intel 8086',
              'Intel 8051',
              'ARM Cortex Processors',
              'Zilog Z80'
            ],
            correctAnswer: 2,
            explanation: 'ARM processors (Cortex-M, Cortex-R, Cortex-A) dominate mobile, embedded, and IoT computing due to their high performance-per-watt 32/64-bit RISC architecture.'
          }
        ]
      }
    ]
  }
];


