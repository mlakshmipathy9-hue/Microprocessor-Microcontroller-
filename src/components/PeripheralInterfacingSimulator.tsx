import React, { useState, useEffect } from 'react';
import StepperSchematicDiagram from './StepperSchematicDiagram';
import StepperMotorTypesExplorer from './StepperMotorTypesExplorer';
import { 
  Play, 
  Pause, 
  RotateCw, 
  RotateCcw, 
  Lightbulb, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Code, 
  Activity,
  ArrowRight,
  Sparkles,
  Grid,
  Radio,
  Sliders,
  Timer,
  Copy,
  Check,
  Download,
  RefreshCw,
  SlidersHorizontal,
  Compass,
  Component
} from 'lucide-react';

interface PeripheralInterfacingSimulatorProps {
  initialTab?: 'schematic' | 'circuit' | 'stepper-types' | 'stepper' | 'stepper-code' | 'display-circuit' | 'display' | 'display-code' | 'keypad-circuit' | 'keypad' | 'keypad-code' | 'traffic' | 'traffic-code' | 'alp';
  mode?: 'schematic' | 'circuit' | 'stepper-types' | 'stepper' | 'stepper-code' | 'display-circuit' | 'display' | 'display-code' | 'keypad-circuit' | 'keypad' | 'keypad-code' | 'traffic' | 'traffic-code' | 'alp';
  showTabs?: boolean;
  allowedTabs?: ('schematic' | 'circuit' | 'stepper-types' | 'stepper' | 'stepper-code' | 'display-circuit' | 'display' | 'display-code' | 'keypad-circuit' | 'keypad' | 'keypad-code' | 'traffic' | 'traffic-code' | 'alp')[];
}

export default function PeripheralInterfacingSimulator({ 
  initialTab = 'circuit',
  mode,
  showTabs = false,
  allowedTabs
}: PeripheralInterfacingSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'schematic' | 'circuit' | 'stepper-types' | 'stepper' | 'stepper-code' | 'display-circuit' | 'display' | 'display-code' | 'keypad-circuit' | 'keypad' | 'keypad-code' | 'traffic' | 'traffic-code' | 'alp'>(mode || initialTab);

  useEffect(() => {
    if (mode) setActiveTab(mode);
    else if (initialTab) setActiveTab(initialTab);
  }, [mode, initialTab]);

  // 7-Segment Display state
  const [displayType, setDisplayType] = useState<'cathode' | 'anode'>('cathode');
  const [digitHex, setDigitHex] = useState<string>('0');

  // 7-Segment Interfacing Circuit & Multiplexing State
  const [segCircuitDigit, setSegCircuitDigit] = useState<string>('0');
  const [segCircuitMode, setSegCircuitMode] = useState<'single' | 'multiplexed'>('single');
  const [segMultiIndex, setSegMultiIndex] = useState<number>(0);
  const [segMultiDigits, setSegMultiDigits] = useState<string[]>(['8', '0', '8', '6']);
  const [segSignalsAnimating, setSegSignalsAnimating] = useState<boolean>(true);

  // 7-Segment Dynamic ALP Generator State
  const [segAlpPort, setSegAlpPort] = useState<'portA' | 'portB' | 'portC'>('portA');
  const [segAlpType, setSegAlpType] = useState<'cathode' | 'anode'>('cathode');
  const [segAlpMode, setSegAlpMode] = useState<'single_digit' | 'up_counter' | 'down_counter' | 'hex_counter' | 'xlat_lookup' | 'multiplexed'>('up_counter');
  const [segAlpDelay, setSegAlpDelay] = useState<'50ms' | '100ms' | '500ms' | '1s'>('500ms');
  const [copiedSegAlp, setCopiedSegAlp] = useState<boolean>(false);

  // Stepper Motor State & Dynamic Generator Configurator
  const [stepperPort, setStepperPort] = useState<'portA' | 'portB' | 'portC_lower' | 'portC_upper'>('portA');
  const [baseAddressHex, setBaseAddressHex] = useState<string>('80');
  const [stepSizeDeg, setStepSizeDeg] = useState<number>(1.8);
  const [targetRotationMode, setTargetRotationMode] = useState<'continuous' | 'full_rev' | 'half_rev' | 'quarter_rev' | 'custom_steps'>('continuous');
  const [customStepsCount, setCustomStepsCount] = useState<number>(200);
  const [driveMode, setDriveMode] = useState<'wave' | 'full' | 'half'>('full');
  const [direction, setDirection] = useState<'cw' | 'ccw'>('cw');
  const [delayPreset, setDelayPreset] = useState<'10ms' | '25ms' | '50ms' | '100ms'>('50ms');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [motorAngle, setMotorAngle] = useState<number>(0);
  const [stepDelayMs, setStepDelayMs] = useState<number>(450);

  // 4x4 Matrix Keypad Circuit Architecture & Live Signal State
  const [keypadCircuitKey, setKeypadCircuitKey] = useState<string>('5');
  const [keypadScanMode, setKeypadScanMode] = useState<'auto' | 'ground_all' | 'manual'>('auto');
  const [keypadManualRow, setKeypadManualRow] = useState<number>(1);
  const [keypadAutoRow, setKeypadAutoRow] = useState<number>(0);
  const [keypadSignalsAnimating, setKeypadSignalsAnimating] = useState<boolean>(true);
  const [keypadDebounceSim, setKeypadDebounceSim] = useState<'stable' | 'bouncing'>('stable');

  // Keypad Dynamic ALP Generator State
  const [keypadAlpPortOut, setKeypadAlpPortOut] = useState<'portA' | 'portC_lower'>('portA');
  const [keypadAlpPortIn, setKeypadAlpPortIn] = useState<'portB' | 'portC_upper'>('portB');
  const [keypadAlpMode, setKeypadAlpMode] = useState<'standard_scan' | 'with_7seg' | 'xlat_lookup' | 'key_counter'>('standard_scan');
  const [keypadAlpDebounce, setKeypadAlpDebounce] = useState<'10ms' | '20ms' | '50ms'>('20ms');
  const [copiedKeypadAlp, setCopiedKeypadAlp] = useState<boolean>(false);

  // Standard Keypad State for Simulator tab
  const [pressedKey, setPressedKey] = useState<string | null>('5');
  const [activeScanRow, setActiveScanRow] = useState<number>(1);

  // Traffic Light Controller State
  const [trafficRunning, setTrafficRunning] = useState<boolean>(false);
  const [trafficStateIndex, setTrafficStateIndex] = useState<number>(0);

  // Traffic Light Dynamic ALP Generator State
  const [trafficAlpPort, setTrafficAlpPort] = useState<'portA' | 'portB' | 'portC'>('portA');
  const [trafficAlpMode, setTrafficAlpMode] = useState<'standard_4phase' | 'with_pedestrian' | 'night_flash' | 'emergency_override'>('standard_4phase');
  const [trafficAlpTiming, setTrafficAlpTiming] = useState<'standard' | 'demo' | 'rapid'>('standard');
  const [copiedTrafficAlp, setCopiedTrafficAlp] = useState<boolean>(false);

  // Selected ALP Program Tab
  const [selectedAlp, setSelectedAlp] = useState<'stepper' | 'seven-seg' | 'keypad' | 'traffic'>('stepper');

  // 7-Segment Hex mapping for Common Cathode (a,b,c,d,e,f,g,dp)
  const segmentCodesCathode: Record<string, number> = {
    '0': 0x3F, '1': 0x06, '2': 0x5B, '3': 0x4F,
    '4': 0x66, '5': 0x6D, '6': 0x7D, '7': 0x07,
    '8': 0x7F, '9': 0x6F, 'A': 0x77, 'B': 0x7C,
    'C': 0x39, 'D': 0x5E, 'E': 0x79, 'F': 0x71
  };

  const rawCode = segmentCodesCathode[digitHex] || 0x3F;
  const activeCode = displayType === 'cathode' ? rawCode : (~rawCode & 0xFF);

  // Derived 8255 Addresses
  const baseInt = parseInt(baseAddressHex, 16) || 0x80;
  const portAAddr = (baseInt + 0).toString(16).toUpperCase().padStart(2, '0') + 'H';
  const portBAddr = (baseInt + 2).toString(16).toUpperCase().padStart(2, '0') + 'H';
  const portCAddr = (baseInt + 4).toString(16).toUpperCase().padStart(2, '0') + 'H';
  const controlRegAddr = (baseInt + 6).toString(16).toUpperCase().padStart(2, '0') + 'H';

  // Selected Port Configuration Map
  const portConfigMap = {
    portA: { name: 'Port A', fullName: 'Port A (PA0–PA3)', address: portAAddr, pins: 'PA0–PA3', isUpper: false, controlWord: '80H' },
    portB: { name: 'Port B', fullName: 'Port B (PB0–PB3)', address: portBAddr, pins: 'PB0–PB3', isUpper: false, controlWord: '80H' },
    portC_lower: { name: 'Port C Lower', fullName: 'Port C Lower (PC0–PC3)', address: portCAddr, pins: 'PC0–PC3', isUpper: false, controlWord: '80H' },
    portC_upper: { name: 'Port C Upper', fullName: 'Port C Upper (PC4–PC7)', address: portCAddr, pins: 'PC4–PC7', isUpper: true, controlWord: '80H' }
  };
  const activePortConfig = portConfigMap[stepperPort];

  // Excitation Sequence Generation based on mode & direction
  const isUpperNibble = activePortConfig.isUpper;
  const getSequenceBytes = (mode: 'wave' | 'full' | 'half', dir: 'cw' | 'ccw', upper: boolean): { hexArr: string[]; numArr: number[] } => {
    let raw: number[] = [];
    if (mode === 'wave') {
      raw = dir === 'cw' ? [0x01, 0x02, 0x04, 0x08] : [0x08, 0x04, 0x02, 0x01];
    } else if (mode === 'full') {
      raw = dir === 'cw' ? [0x03, 0x06, 0x0C, 0x09] : [0x09, 0x0C, 0x06, 0x03];
    } else {
      raw = dir === 'cw' 
        ? [0x01, 0x03, 0x02, 0x06, 0x04, 0x0C, 0x08, 0x09] 
        : [0x09, 0x08, 0x0C, 0x04, 0x06, 0x02, 0x03, 0x01];
    }
    const shifted = raw.map(b => upper ? ((b << 4) & 0xFF) : b);
    const hex = shifted.map(b => (b < 0x0A ? '0' : '') + b.toString(16).toUpperCase() + 'H');
    return { hexArr: hex, numArr: shifted };
  };

  const currentGenSequence = getSequenceBytes(driveMode, direction, isUpperNibble);

  // Effective Steps & Total Angle Calculation
  const effectiveSteps = targetRotationMode === 'continuous' 
    ? 'continuous'
    : targetRotationMode === 'full_rev' 
    ? Math.round(360 / stepSizeDeg)
    : targetRotationMode === 'half_rev'
    ? Math.round(180 / stepSizeDeg)
    : targetRotationMode === 'quarter_rev'
    ? Math.round(90 / stepSizeDeg)
    : customStepsCount;

  const totalCalculatedAngle = effectiveSteps === 'continuous' 
    ? 'Continuous Rotation (∞)' 
    : `${(Number(effectiveSteps) * stepSizeDeg).toFixed(1)}° (${(Number(effectiveSteps) * stepSizeDeg / 360).toFixed(2)} rev)`;

  const delayConfig = {
    '10ms': { ms: 10, hexCount: '3333H', comment: '~10 ms settling delay' },
    '25ms': { ms: 25, hexCount: '7FFFH', comment: '~25 ms settling delay' },
    '50ms': { ms: 50, hexCount: '0FFFFH', comment: '~50 ms settling delay' },
    '100ms': { ms: 100, hexCount: '1FFFFH', comment: '~100 ms settling delay' }
  }[delayPreset];

  // Helper to generate the exact complete Assembly Code string
  const generateAssemblyCode = () => {
    const seqString = currentGenSequence.hexArr.join(', ');
    const isContinuous = effectiveSteps === 'continuous';
    const stepsCountNum = typeof effectiveSteps === 'number' ? effectiveSteps : 200;
    const seqLength = currentGenSequence.hexArr.length;

    return `; =========================================================================
; 8086 ASSEMBLY LANGUAGE PROGRAM (ALP): DYNAMIC STEPPER MOTOR CONTROLLER
; =========================================================================
; GENERATED CONFIGURATION PARAMETERS:
;   - Target 8255 Port        : ${activePortConfig.fullName} [I/O Address: ${activePortConfig.address}]
;   - 8255 Control Word Reg   : Address ${controlRegAddr} | Mode 0 Control Word: ${activePortConfig.controlWord}
;   - Excitation Drive Mode   : ${driveMode.toUpperCase()} (${driveMode === 'full' ? '2-Phase ON / High Torque' : driveMode === 'wave' ? '1-Phase ON / Low Power' : 'Half-Step / Fine Resolution'})
;   - Motor Step Angle (β)    : ${stepSizeDeg}° per step (${Math.round(360 / stepSizeDeg)} steps/revolution)
;   - Rotation Direction      : ${direction === 'cw' ? 'Clockwise (CW ↻)' : 'Anti-Clockwise (CCW ↺)'}
;   - Target Rotation Extent  : ${isContinuous ? 'Continuous Smooth Rotation' : `${stepsCountNum} Steps (${totalCalculatedAngle})`}
;   - Inter-Step Delay Loop   : ${delayPreset} (${delayConfig.hexCount} iterations @ 5MHz CPU)
; =========================================================================

.MODEL SMALL                  ; Define small memory model (single code & data segments)
.STACK 64                     ; Allocate 64 bytes of stack frame memory for procedures
.DATA                         ; Begin initialized data segment
  ; Stepper Phase Excitation Sequence Table for ${direction.toUpperCase()} rotation
  STEP_SEQ DB ${seqString} ; Sequence byte array
  SEQ_LEN  DW ${seqLength}                     ; ${seqLength} excitation states per electrical cycle
${!isContinuous ? `  TOTAL_STEPS DW ${stepsCountNum}            ; Total step count (${totalCalculatedAngle})\n` : ''}
.CODE                         ; Begin code segment
MAIN PROC FAR                 ; Main program entry procedure
  MOV AX, @DATA               ; Load base address of Data Segment into AX accumulator
  MOV DS, AX                  ; Initialize DS register with Data Segment address

  ; --- STEP 1: INITIALIZE INTEL 8255 PPI IN MODE 0 ---
  MOV AL, ${activePortConfig.controlWord}                 ; Load Control Byte: Mode 0 (Basic I/O), Output Ports
  OUT ${controlRegAddr}, AL                 ; Send Control Word to 8255 Control Register (${controlRegAddr})

  ; --- STEP 2: CONFIGURE ROTATION LOOP & INDEX POINTERS ---
${isContinuous ? `ROTATE_LOOP:
  MOV SI, 0                   ; Reset Source Index (SI) pointer to start of step table
  MOV CX, ${seqLength}                   ; Set inner counter to sequence length (${seqLength} states)

STEP_CYCLE:
  MOV AL, STEP_SEQ[SI]        ; Fetch current phase excitation nibble from lookup table
  OUT ${activePortConfig.address}, AL                 ; Output pulse to 8255 ${activePortConfig.name} (${activePortConfig.address})
  CALL DELAY                  ; Call software delay subroutine for rotor mechanical settling
  INC SI                      ; Advance SI pointer to next excitation state
  LOOP STEP_CYCLE             ; Decrement CX and loop until all ${seqLength} steps executed

  JMP ROTATE_LOOP             ; Continuous loop: repeat rotation cycle indefinitely` : `  MOV BX, ${stepsCountNum}                 ; Load total step count counter into BX register
  MOV SI, 0                   ; Initialize Source Index (SI) pointing to step table start

STEP_LOOP:
  MOV AL, STEP_SEQ[SI]        ; Read excitation byte from memory lookup table
  OUT ${activePortConfig.address}, AL                 ; Write excitation pattern to 8255 ${activePortConfig.name} (${activePortConfig.address})
  CALL DELAY                  ; Execute delay loop to allow rotor mechanical settling (~${delayPreset})

  INC SI                      ; Move to next step code in lookup table
  CMP SI, ${seqLength}                   ; Check if table index reached end of sequence (${seqLength})
  JB  CONT_STEP               ; If SI < ${seqLength}, skip index reset
  MOV SI, 0                   ; If SI == ${seqLength}, wrap around to index 0

CONT_STEP:
  DEC BX                      ; Decrement total remaining step counter
  JNZ STEP_LOOP               ; If BX != 0, continue stepping towards target angle

  ; --- STEP 3: TERMINATE PROGRAM OR HOLD ROTOR ---
  MOV AH, 4CH                 ; DOS Function 4CH: Terminate program and exit
  INT 21H                     ; Call DOS software interrupt service`}

; -------------------------------------------------------------------------
; Software Nested Delay Subroutine (${delayConfig.comment})
; Provides necessary rotor angular acceleration & inertia settling time
; -------------------------------------------------------------------------
DELAY PROC NEAR
  PUSH CX                     ; Preserve CX register contents onto stack
  MOV CX, ${delayConfig.hexCount}              ; Load CX with calibrated loop iteration counter
D1:
  LOOP D1                     ; Decrement CX and branch if non-zero (~2 cycles/loop)
  POP CX                      ; Restore original CX value from stack
  RET                         ; Return control to calling instruction
DELAY ENDP

MAIN ENDP                     ; End main procedure definition
END MAIN                      ; End assembly with program entry point`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateAssemblyCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadAsm = () => {
    const element = document.createElement("a");
    const file = new Blob([generateAssemblyCode()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `stepper_8086_${stepperPort}_${driveMode}_${direction}.asm`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 7-Segment Hex Mapping Arrays
  const ccTableHex = ['3FH', '06H', '5BH', '4FH', '66H', '6DH', '7DH', '07H', '7FH', '6FH', '77H', '7CH', '39H', '5EH', '79H', '71H'];
  const caTableHex = ['0C0H', '0F9H', '0A4H', '0B0H', '99H', '92H', '82H', '0F8H', '80H', '90H', '88H', '83H', '0C6H', '0A1H', '86H', '8EH'];

  const activeSegTable = segAlpType === 'cathode' ? ccTableHex : caTableHex;
  const segPortAddress = segAlpPort === 'portA' ? portAAddr : (segAlpPort === 'portB' ? portBAddr : portCAddr);

  // 7-Segment Dynamic Assembly Code Generator with Line-by-Line Comments
  const generateSevenSegAssemblyCode = () => {
    const delayHex = {
      '50ms': '0FFFFH',
      '100ms': '1FFFFH',
      '500ms': '0FFFFH',
      '1s': '0FFFFH'
    }[segAlpDelay];

    const isCA = segAlpType === 'anode';
    const typeLabel = isCA ? 'COMMON ANODE (Active LOW: 0 = Segment ON)' : 'COMMON CATHODE (Active HIGH: 1 = Segment ON)';

    return `; =========================================================================
; 8086 ASSEMBLY LANGUAGE PROGRAM (ALP): 7-SEGMENT LED DISPLAY INTERFACING
; -------------------------------------------------------------------------
; Target Microprocessor : Intel 8086 (Minimum Mode, 5 MHz)
; Peripheral Interface  : Intel 8255 PPI (Programmable Peripheral Interface)
; Port Selected         : 8255 ${segAlpPort.toUpperCase()} (I/O Port Address: ${segPortAddress})
; Control Register      : 8255 Control Port (I/O Port Address: ${controlRegAddr})
; Display Configuration : ${typeLabel}
; Current Program Mode  : ${segAlpMode.toUpperCase().replace('_', ' ')}
; Current Delay Preset  : ~${segAlpDelay} (${delayHex} loop cycles)
; =========================================================================

.MODEL SMALL                  ; Small memory model (single code & data segment)
.STACK 64                     ; Allocate 64 bytes for CPU execution stack

.DATA
  ; 7-Segment Lookup Table for Digits 0 to F (${isCA ? 'Common Anode Inverted Logic' : 'Common Cathode Standard Logic'})
  ; Array Index:  0     1     2     3     4     5     6     7     8     9     A     B     C     D     E     F
  TABLE DB ${activeSegTable.slice(0, 10).join(', ')}
        DB ${activeSegTable.slice(10).join(', ')}

  PORT_DATA   EQU ${segPortAddress}        ; 8255 ${segAlpPort.toUpperCase()} Segment Output Data Port Address
  PORT_CTRL   EQU ${controlRegAddr}        ; 8255 Control Register Port Address
  CTRL_WORD   EQU 80H          ; Mode 0: All Ports (A, B, C) configured as Outputs

.CODE
MAIN PROC FAR
  ; --- STEP 1: INITIALIZE DATA SEGMENT (DS) ---
  MOV AX, @DATA               ; Load address of data segment into AX register
  MOV DS, AX                  ; Point DS register to data segment for variable access

  ; --- STEP 2: CONFIGURE 8255 PPI CONTROL REGISTER (MODE 0) ---
  MOV DX, PORT_CTRL           ; Load DX with 8255 Control Register address (${controlRegAddr})
  MOV AL, CTRL_WORD           ; Load AL with Control Word 80H (Mode 0, Ports A/B/C Output)
  OUT DX, AL                  ; Send initialization byte to 8255 PPI chip

  MOV DX, PORT_DATA           ; Point DX to 8255 Segment Output Port (${segPortAddress})

${segAlpMode === 'single_digit' ? `  ; --- STEP 3: OUTPUT SINGLE DIGIT TO 7-SEGMENT DISPLAY ---
  MOV AL, ${isCA ? '80H' : '7FH'}                 ; Load 7-segment bit pattern for digit '8' (all segments ON)
  OUT DX, AL                  ; Transmit byte to Port A pins (PA0-PA7 illuminate display)
HLT_LOOP:
  JMP HLT_LOOP                ; Retain steady output and halt further execution` : ''}${segAlpMode === 'up_counter' ? `  ; --- STEP 3: 0 TO 9 DECIMAL CYCLIC UP-COUNTER LOOP ---
REPEAT_UP:
  LEA SI, TABLE               ; Load SI pointer to the start of the 7-Segment lookup table
  MOV CX, 0AH                 ; Set CX loop counter to 10 (decimal digits 0 to 9)

COUNT_LOOP:
  MOV AL, [SI]                ; Fetch 7-segment pattern for current digit from TABLE
  OUT DX, AL                  ; Send byte to 8255 Port A -> Illuminates current digit
  CALL DELAY                  ; Call calibrated software delay routine (~${segAlpDelay})
  INC SI                      ; Advance SI pointer to the next digit code in table
  LOOP COUNT_LOOP             ; Decrement CX; continue loop until all 10 digits displayed
  JMP REPEAT_UP               ; Repeat continuous 0-to-9 counting sequence indefinitely` : ''}${segAlpMode === 'down_counter' ? `  ; --- STEP 3: 9 TO 0 DECIMAL CYCLIC DOWN-COUNTER LOOP ---
REPEAT_DOWN:
  LEA SI, TABLE + 9           ; Load SI pointer to point to digit '9' at end of decimal table
  MOV CX, 0AH                 ; Set CX loop counter to 10 (decimal digits 9 down to 0)

COUNT_DOWN_LOOP:
  MOV AL, [SI]                ; Fetch 7-segment pattern for current digit from TABLE
  OUT DX, AL                  ; Send byte to 8255 Port A -> Illuminates current digit
  CALL DELAY                  ; Call calibrated software delay routine (~${segAlpDelay})
  DEC SI                      ; Move SI pointer backwards to previous digit in table
  LOOP COUNT_DOWN_LOOP        ; Decrement CX; continue loop until digit 0 is reached
  JMP REPEAT_DOWN             ; Repeat continuous 9-to-0 countdown sequence indefinitely` : ''}${segAlpMode === 'hex_counter' ? `  ; --- STEP 3: 0 TO F (0-15) HEXADECIMAL CYCLIC UP-COUNTER LOOP ---
REPEAT_HEX:
  LEA SI, TABLE               ; Load SI pointer to the start of the 16-element HEX table
  MOV CX, 10H                 ; Set CX loop counter to 16 (hexadecimal digits 0 to F)

HEX_LOOP:
  MOV AL, [SI]                ; Fetch 7-segment pattern for current hex digit from TABLE
  OUT DX, AL                  ; Send byte to 8255 Port A -> Illuminates hex digit on display
  CALL DELAY                  ; Call calibrated software delay routine (~${segAlpDelay})
  INC SI                      ; Advance SI pointer to next hex character code
  LOOP HEX_LOOP               ; Decrement CX; repeat until all 16 hex digits displayed
  JMP REPEAT_HEX              ; Repeat continuous 0-to-F hexadecimal count sequence` : ''}${segAlpMode === 'xlat_lookup' ? `  ; --- STEP 3: BCD TO 7-SEGMENT CONVERSION USING 8086 XLAT INSTRUCTION ---
  ; The XLAT (Translate) instruction performs: AL = DS:[BX + AL]
  LEA BX, TABLE               ; Load Base Address of lookup TABLE into BX register
  
  MOV AL, 05H                 ; Sample BCD input digit (e.g. convert number 5)
  XLAT                        ; Fast hardware table lookup: AL <- TABLE[AL] (AL becomes ${isCA ? '92H' : '6DH'})
  OUT DX, AL                  ; Output translated 7-segment byte code to 8255 port
  CALL DELAY                  ; Hold display for viewing duration
HLT_XLAT:
  JMP HLT_XLAT                ; Hold final output on 7-segment display` : ''}${segAlpMode === 'multiplexed' ? `  ; --- STEP 3: 4-DIGIT MULTIPLEXED DISPLAY TIME-DIVISION SCAN ROUTINE ---
  PORT_DIGIT EQU ${portCAddr}       ; 8255 Port C controls Digit Enable Transistors (PC0-PC3)
  
SCAN_AGAIN:
  ; Digit 1 (Thousands): Display '8'
  MOV AL, ${isCA ? '80H' : '7FH'}                 ; Segment code for '8'
  OUT PORT_DATA, AL           ; Send segment data to Port A
  MOV AL, 01H                 ; Enable Digit 1 Transistor (PC0 = 1, PC1-PC3 = 0)
  OUT PORT_DIGIT, AL          ; Activate Digit 1 common pin
  CALL SHORT_DELAY            ; Hold for ~2.5 ms persistence-of-vision scan slot

  ; Digit 2 (Hundreds): Display '0'
  MOV AL, ${isCA ? '0C0H' : '3FH'}                ; Segment code for '0'
  OUT PORT_DATA, AL           ; Send segment data to Port A
  MOV AL, 02H                 ; Enable Digit 2 Transistor (PC1 = 1)
  OUT PORT_DIGIT, AL          ; Activate Digit 2 common pin
  CALL SHORT_DELAY            ; Hold for ~2.5 ms persistence-of-vision scan slot

  ; Digit 3 (Tens): Display '8'
  MOV AL, ${isCA ? '80H' : '7FH'}                 ; Segment code for '8'
  OUT PORT_DATA, AL           ; Send segment data to Port A
  MOV AL, 04H                 ; Enable Digit 3 Transistor (PC2 = 1)
  OUT PORT_DIGIT, AL          ; Activate Digit 3 common pin
  CALL SHORT_DELAY            ; Hold for ~2.5 ms persistence-of-vision scan slot

  ; Digit 4 (Units): Display '6'
  MOV AL, ${isCA ? '82H' : '7DH'}                 ; Segment code for '6'
  OUT PORT_DATA, AL           ; Send segment data to Port A
  MOV AL, 08H                 ; Enable Digit 4 Transistor (PC3 = 1)
  OUT PORT_DIGIT, AL          ; Activate Digit 4 common pin
  CALL SHORT_DELAY            ; Hold for ~2.5 ms persistence-of-vision scan slot

  JMP SCAN_AGAIN              ; Continuous refresh loop (Overall refresh frequency ≈ 100 Hz)` : ''}

; =========================================================================
; SUBROUTINE: SOFTWARE DELAY GENERATOR
; Function: Creates calibrated time interval to allow human eye perception
; =========================================================================
DELAY PROC NEAR
  PUSH CX                     ; Save current CX register state onto stack
  MOV CX, ${delayHex}             ; Load loop count for ~${segAlpDelay} delay interval
D_LOOP:
  NOP                         ; 3 clock cycles idle
  LOOP D_LOOP                 ; Decrement CX and branch if CX != 0 (~17 clock cycles)
  POP CX                      ; Restore CX register from stack
  RET                         ; Return control to calling instruction
DELAY ENDP

${segAlpMode === 'multiplexed' ? `SHORT_DELAY PROC NEAR
  PUSH CX                     ; Save CX state
  MOV CX, 0500H               ; Short ~2.5 ms time-slot delay for 100 Hz display scan
S_LOOP:
  NOP
  LOOP S_LOOP
  POP CX
  RET
SHORT_DELAY ENDP` : ''}

MAIN ENDP                     ; End main procedure
END MAIN                      ; End of source file with program entry point`;
  };

  const handleCopySegAlp = () => {
    navigator.clipboard.writeText(generateSevenSegAssemblyCode());
    setCopiedSegAlp(true);
    setTimeout(() => setCopiedSegAlp(false), 2000);
  };

  const handleDownloadSevenSegAsm = () => {
    const element = document.createElement("a");
    const file = new Blob([generateSevenSegAssemblyCode()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `seven_segment_8086_${segAlpPort}_${segAlpType}_${segAlpMode}.asm`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Multiplexing interval simulation
  useEffect(() => {
    let timer: any = null;
    if (segCircuitMode === 'multiplexed' && segSignalsAnimating) {
      timer = setInterval(() => {
        setSegMultiIndex((prev) => (prev + 1) % 4);
      }, 550);
    }
    return () => clearInterval(timer);
  }, [segCircuitMode, segSignalsAnimating]);

  // Stepper Sequences (Coils A, B, C, D)
  const sequences = {
    wave: [0x01, 0x02, 0x04, 0x08], // 11H, 22H, 44H, 88H nibble equivalent
    full: [0x03, 0x06, 0x0C, 0x09], // 33H, 66H, CCH, 99H nibble equivalent
    half: [0x01, 0x03, 0x02, 0x06, 0x04, 0x0C, 0x08, 0x09]
  };

  const currentSequence = sequences[driveMode];
  const coilStateByte = currentSequence[currentStepIndex % currentSequence.length];

  // Animation Loop for Stepper Motor
  useEffect(() => {
    let timer: any = null;
    if (isRunning) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const nextIdx = direction === 'cw' ? (prev + 1) : (prev - 1 + currentSequence.length);
          return nextIdx % currentSequence.length;
        });
        setMotorAngle((prev) => (direction === 'cw' ? (prev + 18) % 360 : (prev - 18 + 360) % 360));
      }, stepDelayMs);
    }
    return () => clearInterval(timer);
  }, [isRunning, direction, currentSequence, stepDelayMs]);

  // Traffic Light States: 
  const trafficStates = [
    { name: 'North-South GREEN / East-West RED', ns: 'green', ew: 'red', portA: '0x21H', duration: 3000 },
    { name: 'North-South YELLOW / East-West RED', ns: 'yellow', ew: 'red', portA: '0x11H', duration: 1200 },
    { name: 'North-South RED / East-West GREEN', ns: 'red', ew: 'green', portA: '0x0CH', duration: 3000 },
    { name: 'North-South RED / East-West YELLOW', ns: 'red', ew: 'yellow', portA: '0x0AH', duration: 1200 }
  ];

  useEffect(() => {
    let timer: any = null;
    if (trafficRunning) {
      const currentDuration = trafficStates[trafficStateIndex].duration;
      timer = setTimeout(() => {
        setTrafficStateIndex((prev) => (prev + 1) % trafficStates.length);
      }, currentDuration);
    }
    return () => clearTimeout(timer);
  }, [trafficRunning, trafficStateIndex]);

  // Keypad Matrix definition
  const keypadMatrix = [
    ['1', '2', '3', 'A'],
    ['4', '5', '6', 'B'],
    ['7', '8', '9', 'C'],
    ['*', '0', '#', 'D']
  ];

  // Auto-scan row cycling timer for circuit & scanner
  useEffect(() => {
    if (!keypadSignalsAnimating || keypadScanMode !== 'auto') return;
    const interval = setInterval(() => {
      setKeypadAutoRow((prev) => (prev + 1) % 4);
    }, 700);
    return () => clearInterval(interval);
  }, [keypadSignalsAnimating, keypadScanMode]);

  // Find target Row & Column coordinates for the selected/pressed key
  let targetRow = -1;
  let targetCol = -1;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (keypadMatrix[r][c] === keypadCircuitKey) {
        targetRow = r;
        targetCol = c;
      }
    }
  }

  // Active driving row during scan
  const activeDrivingRow = keypadScanMode === 'auto' 
    ? keypadAutoRow 
    : keypadScanMode === 'manual' 
    ? keypadManualRow 
    : -1; // -1 means ground all rows simultaneously

  // Port A Output Byte (Row drive)
  const keypadRowOutputByte = activeDrivingRow === -1 
    ? 0x00 // All 4 rows grounded for initial key-down detection
    : (0x0F & ~(1 << activeDrivingRow)); // Active row is LOW (0), others are HIGH (1)

  // Port B Input Byte (Column sense)
  const isKeyRowGrounded = activeDrivingRow === -1 || activeDrivingRow === targetRow;
  const isColDetected = isKeyRowGrounded && targetCol !== -1;
  const keypadColInputByte = isColDetected 
    ? (0x0F & ~(1 << targetCol)) // target column pulled to 0V through closed switch
    : 0x0F; // all columns pulled to +5V (1111b) by 10k pull-up resistors

  const handleKeyPress = (key: string, rowIdx: number) => {
    setPressedKey(key);
    setActiveScanRow(rowIdx);
    setKeypadCircuitKey(key);
  };

  // Helper to generate dynamic Keypad Assembly Code string
  const generateKeypadAssemblyCode = () => {
    const rowPort = keypadAlpPortOut === 'portA' ? portAAddr : portCAddr;
    const colPort = keypadAlpPortIn === 'portB' ? portBAddr : portCAddr;
    const controlWord = '82H'; // Port A=Out (Rows), Port B=In (Cols), Port C=Out
    const debounceCounts = {
      '10ms': { count: '3FFFH', label: '~10 ms settling delay' },
      '20ms': { count: '7FFFH', label: '~20 ms standard mechanical debounce' },
      '50ms': { count: '0FFFFH', label: '~50 ms extended debounce filter' },
    }[keypadAlpDebounce];

    return `; =========================================================================
; 8086 ASSEMBLY LANGUAGE PROGRAM (ALP): 4x4 MATRIX KEYPAD INTERFACING & SCAN
; =========================================================================
; GENERATED HARDWARE CONFIGURATION PARAMETERS:
;   - Row Drive Output Port   : ${keypadAlpPortOut === 'portA' ? 'Port A (PA0–PA3)' : 'Port C Lower (PC0–PC3)'} [I/O Address: ${rowPort}]
;   - Column Sense Input Port : ${keypadAlpPortIn === 'portB' ? 'Port B (PB0–PB3)' : 'Port C Upper (PC4–PC7)'} [I/O Address: ${colPort}]
;   - 8255 Control Word Reg   : Address ${controlRegAddr} | Control Word: ${controlWord} (Mode 0: Row OUT, Col IN)
;   - Pull-Up Resistor Array  : 4 x 10 kOhm on Column Lines tied to +5V VCC
;   - Mechanical Debounce     : ${keypadAlpDebounce} (${debounceCounts.count} loop iterations @ 5MHz CPU)
;   - Program Mode            : ${keypadAlpMode.toUpperCase()}
; =========================================================================

.MODEL SMALL                  ; Define small memory model (single CS & DS segments)
.STACK 64                     ; Allocate 64 bytes of stack space for CALL/RET
.DATA                         ; Begin initialized data segment
  ; 4x4 Keypad ASCII Translation Lookup Table (16 Keys)
  ; Rows: R0 (1,2,3,A), R1 (4,5,6,B), R2 (7,8,9,C), R3 (*,0,#,D)
  KEY_MAP   DB '1', '2', '3', 'A' ; Row 0 (R0 = PA0 grounded -> 0FEH)
            DB '4', '5', '6', 'B' ; Row 1 (R1 = PA1 grounded -> 0FDH)
            DB '7', '8', '9', 'C' ; Row 2 (R2 = PA2 grounded -> 0FBH)
            DB '*', '0', '#', 'D' ; Row 3 (R3 = PA3 grounded -> 0F7H)
  DETECTED  DB ?                  ; Storage variable for detected key ASCII code
${keypadAlpMode === 'with_7seg' ? `  ; 7-Segment Common Cathode Codes for Hex Digits 0..F
  SEG_TABLE DB 3FH, 06H, 5BH, 4FH, 66H, 6DH, 7DH, 07H
            DB 7FH, 6FH, 77H, 7CH, 39H, 5EH, 79H, 71H\n` : ''}
.CODE                         ; Begin code segment
MAIN PROC FAR                 ; Program entry procedure
  MOV AX, @DATA               ; Load base address of Data Segment into AX register
  MOV DS, AX                  ; Initialize DS segment register

  ; --- STEP 1: INITIALIZE INTEL 8255 PPI IN MODE 0 ---
  MOV AL, ${controlWord}                 ; Load Control Word: Mode 0, Port A=OUT (Rows), Port B=IN (Cols)
  OUT ${controlRegAddr}, AL                 ; Send Control Word to 8255 Control Register (${controlRegAddr})

  ; --- STEP 2: CHECK FOR COMPLETE KEY RELEASE (TWO-KEY LOCKOUT) ---
WAIT_RELEASE:
  MOV AL, 00H                 ; Drive all rows LOW (0V on PA0-PA3) to check any key press
  OUT ${rowPort}, AL                 ; Write 00H to Row Output Port (${rowPort})
  IN  AL, ${colPort}                 ; Read Column Sense Port (${colPort}) into AL
  AND AL, 0FH                 ; Mask upper 4 bits; inspect PB0-PB3
  CMP AL, 0FH                 ; Are all columns HIGH (1111b)?
  JNE WAIT_RELEASE            ; If not 0FH, key is still held down; wait for release

  ; --- STEP 3: WAIT FOR NEW KEYPRESS ---
WAIT_PRESS:
  MOV AL, 00H                 ; Ground all row lines (00H)
  OUT ${rowPort}, AL                 ; Write to Row Output Port (${rowPort})
  IN  AL, ${colPort}                 ; Read column pins
  AND AL, 0FH                 ; Mask upper nibble
  CMP AL, 0FH                 ; Check if any column is pulled LOW
  JE  WAIT_PRESS              ; If all HIGH (0FH), no key pressed yet; continue polling

  ; --- STEP 4: SOFTWARE DEBOUNCE DELAY (${keypadAlpDebounce}) ---
  CALL DEBOUNCE_DELAY         ; Wait ${keypadAlpDebounce} to bypass contact chatter/vibration
  IN  AL, ${colPort}                 ; Re-read column lines
  AND AL, 0FH                 ; Mask upper nibble
  CMP AL, 0FH                 ; Verify steady-state contact closure
  JE  WAIT_PRESS              ; If false trigger/transient noise, resume polling

  ; --- STEP 5: SEQUENTIAL ROW SCANNING & COLUMN IDENTIFICATION ---
  ; Scan Row 0 (PA0 = 0, PA1..PA3 = 1 -> 0FEH / 11111110b)
  MOV AL, 0FEH                ; Ground Row 0 only
  OUT ${rowPort}, AL                 ; Output to ${rowPort}
  IN  AL, ${colPort}                 ; Read Column inputs
  AND AL, 0FH                 ; Mask upper nibble
  CMP AL, 0FH                 ; Check if key is in Row 0
  JNE ROW0_FOUND              ; Key found in Row 0! Branch to decode column

  ; Scan Row 1 (PA1 = 0, others = 1 -> 0FDH / 11111101b)
  MOV AL, 0FDH                ; Ground Row 1 only
  OUT ${rowPort}, AL                 ; Output to ${rowPort}
  IN  AL, ${colPort}                 ; Read Column inputs
  AND AL, 0FH                 ; Mask upper nibble
  CMP AL, 0FH                 ; Check if key is in Row 1
  JNE ROW1_FOUND              ; Key found in Row 1! Branch to decode column

  ; Scan Row 2 (PA2 = 0, others = 1 -> 0FBH / 11111011b)
  MOV AL, 0FBH                ; Ground Row 2 only
  OUT ${rowPort}, AL                 ; Output to ${rowPort}
  IN  AL, ${colPort}                 ; Read Column inputs
  AND AL, 0FH                 ; Mask upper nibble
  CMP AL, 0FH                 ; Check if key is in Row 2
  JNE ROW2_FOUND              ; Key found in Row 2! Branch to decode column

  ; Scan Row 3 (PA3 = 0, others = 1 -> 0F7H / 11110111b)
  MOV AL, 0F7H                ; Ground Row 3 only
  OUT ${rowPort}, AL                 ; Output to ${rowPort}
  IN  AL, ${colPort}                 ; Read Column inputs
  AND AL, 0FH                 ; Mask upper nibble
  CMP AL, 0FH                 ; Check if key is in Row 3
  JNE ROW3_FOUND              ; Key found in Row 3! Branch to decode column

  JMP WAIT_RELEASE            ; Fallback: restart loop if signal lost

ROW0_FOUND:
  MOV BH, 0                   ; Row 0 Base Offset = 0
  JMP DECODE_COL

ROW1_FOUND:
  MOV BH, 4                   ; Row 1 Base Offset = 4
  JMP DECODE_COL

ROW2_FOUND:
  MOV BH, 8                   ; Row 2 Base Offset = 8
  JMP DECODE_COL

ROW3_FOUND:
  MOV BH, 12                  ; Row 3 Base Offset = 12

  ; --- STEP 6: IDENTIFY COLUMN POSITION VIA BIT ROTATION ---
DECODE_COL:
  MOV BL, 0                   ; Initialize column index counter (0..3)
COL_TEST:
  ROR AL, 1                   ; Rotate AL right into Carry Flag (CF)
  JNC COL_MATCH               ; If Carry Flag = 0, the active grounded column is found!
  INC BL                      ; Increment column index
  CMP BL, 4                   ; Check if all 4 columns tested
  JB  COL_TEST                ; Repeat test until CF = 0

COL_MATCH:
  ADD BL, BH                  ; Calculate Key Index = Row Offset (BH) + Col Index (BL)
  MOV BH, 0                   ; Clear BH for 16-bit table pointer offset
  MOV SI, BX                  ; Load computed index into Source Index (SI) register
  MOV AL, KEY_MAP[SI]         ; Fetch ASCII character code from KEY_MAP table
  MOV DETECTED, AL            ; Save ASCII character in memory variable

${keypadAlpMode === 'with_7seg' ? `  ; --- STEP 7: OUTPUT KEYCODE TO 7-SEGMENT DISPLAY ---
  MOV AL, BL                  ; Load numeric index into AL
  MOV BX, OFFSET SEG_TABLE    ; Base address of 7-segment table in BX
  XLAT                        ; Translate: AL = [BX + AL]
  OUT 84H, AL                 ; Write 7-segment pattern to Port C (${portCAddr})\n` : ''}
  ; --- STEP 8: RETURN TO WAIT RELEASE OR TERMINATE ---
  MOV AH, 4CH                 ; DOS Terminate Process interrupt function
  INT 21H                     ; Exit program and return to DOS prompt

; -------------------------------------------------------------------------
; Software Debounce Delay Subroutine (${debounceCounts.label})
; -------------------------------------------------------------------------
DEBOUNCE_DELAY PROC NEAR
  PUSH CX                     ; Preserve CX register contents onto stack
  MOV CX, ${debounceCounts.count}              ; Load calibrated debounce iteration count
D_LOOP:
  LOOP D_LOOP                 ; Decrement CX and branch if non-zero (~2 clock cycles/loop)
  POP CX                      ; Restore original CX value from stack
  RET                         ; Return control to calling instruction
DEBOUNCE_DELAY ENDP

MAIN ENDP                     ; End main procedure
END MAIN                      ; End of assembly program`;
  };

  const handleCopyKeypadAlp = () => {
    navigator.clipboard.writeText(generateKeypadAssemblyCode());
    setCopiedKeypadAlp(true);
    setTimeout(() => setCopiedKeypadAlp(false), 2000);
  };

  const handleDownloadKeypadAsm = () => {
    const code = generateKeypadAssemblyCode();
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `8086_Keypad_${keypadAlpMode}_8255.asm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Traffic Light Controller Assembly Code Generator with Line-by-Line Comments
  const generateTrafficAssemblyCode = () => {
    const portAddr = trafficAlpPort === 'portA' ? portAAddr : trafficAlpPort === 'portB' ? portBAddr : portCAddr;
    const isPedestrian = trafficAlpMode === 'with_pedestrian';
    const isNightFlash = trafficAlpMode === 'night_flash';
    const isEmergency = trafficAlpMode === 'emergency_override';

    const timingLabel = trafficAlpTiming === 'standard' 
      ? 'Standard Urban (~30s Green / 5s Yellow)' 
      : trafficAlpTiming === 'demo'
      ? 'Fast Demo (~5s Green / 2s Yellow)'
      : 'Rapid Lab Simulation (~2s Green / 1s Yellow)';

    const outerCountGreen = trafficAlpTiming === 'standard' ? '0FFFFH' : trafficAlpTiming === 'demo' ? '3FFFH' : '1FFFH';
    const innerCountGreen = trafficAlpTiming === 'standard' ? '00FFH' : trafficAlpTiming === 'demo' ? '0030H' : '0010H';
    const outerCountYellow = trafficAlpTiming === 'standard' ? '2FFFH' : trafficAlpTiming === 'demo' ? '0FFFH' : '07FFH';
    const innerCountYellow = trafficAlpTiming === 'standard' ? '0030H' : trafficAlpTiming === 'demo' ? '0010H' : '0008H';

    return `; =========================================================================
; 8086 ASSEMBLY LANGUAGE PROGRAM (ALP): 4-WAY TRAFFIC LIGHT CONTROLLER
; =========================================================================
; Target Microprocessor : Intel 8086 (Minimum Mode, 5 MHz Clock)
; Peripheral Interface  : Intel 8255 PPI (Programmable Peripheral Interface)
; Output Data Port      : 8255 ${trafficAlpPort.toUpperCase()} (I/O Port Address: ${portAddr})
; Control Register Port : 8255 Control Port (I/O Port Address: ${controlRegAddr})
; Operating Mode        : ${trafficAlpMode.toUpperCase().replace('_', ' ')}
; Timing Profile        : ${timingLabel}
; -------------------------------------------------------------------------
; 8255 PPI PORT BIT ASSIGNMENTS (${trafficAlpPort.toUpperCase()}):
;   PA0 = North-South RED Lamp     (Active HIGH, Pin 4)
;   PA1 = North-South YELLOW Lamp  (Active HIGH, Pin 3)
;   PA2 = North-South GREEN Lamp   (Active HIGH, Pin 2)
;   PA3 = East-West RED Lamp       (Active HIGH, Pin 1)
;   PA4 = East-West YELLOW Lamp    (Active HIGH, Pin 40)
;   PA5 = East-West GREEN Lamp     (Active HIGH, Pin 39)
;   PA6, PA7 = Unused / Grounded   (Pins 38, 37)
; =========================================================================

.MODEL SMALL                  ; Small memory model (single code and data segment)
.STACK 64                     ; Allocate 64 bytes of stack space for CALL / RET

.DATA                         ; Begin initialized data segment
  ; -----------------------------------------------------------------------
  ; 4-Phase Traffic Signal Bit Pattern Array:
  ;   Phase 1 (21H): NS Green (PA2=1) + EW Red (PA3=1) -> 00100001b = 21H
  ;   Phase 2 (11H): NS Yellow (PA1=1) + EW Red (PA3=1) -> 00010001b = 11H
  ;   Phase 3 (0CH): NS Red (PA0=1) + EW Green (PA5=1) -> 00001100b = 0CH
  ;   Phase 4 (0AH): NS Red (PA0=1) + EW Yellow (PA4=1) -> 00001010b = 0AH
  ; -----------------------------------------------------------------------
  PHASE_CODES DB 21H, 11H, 0CH, 0AH   ; 4-Phase sequencing byte lookup table
  NUM_PHASES  EQU 4                   ; 4 traffic phases per intersection cycle

  PORT_DATA   EQU ${portAddr}         ; 8255 ${trafficAlpPort.toUpperCase()} Lamp Driver Output Address
  PORT_CTRL   EQU ${controlRegAddr}   ; 8255 PPI Control Register Address
  ${isPedestrian ? `PORT_SENSE  EQU ${portCAddr}         ; Port C used for Pedestrian Push-Button Senses\n  CTRL_BYTE   EQU 89H                 ; Mode 0: Port A=OUT, Port B=OUT, Port C=IN` : `CTRL_BYTE   EQU 80H                 ; Mode 0: All Ports (A, B, C) configured as OUTPUT`}

.CODE                         ; Begin executable code segment
MAIN PROC FAR                 ; Main program entry procedure
  ; --- STEP 1: INITIALIZE DATA SEGMENT (DS) ---
  MOV AX, @DATA               ; Load address of data segment into AX register
  MOV DS, AX                  ; Point DS register to data segment base

  ; --- STEP 2: CONFIGURE 8255 PPI IN MODE 0 ---
  MOV DX, PORT_CTRL           ; Load DX with 8255 Control Port Address (${controlRegAddr})
  MOV AL, CTRL_BYTE           ; Load Control Word byte (${isPedestrian ? '89H' : '80H'})
  OUT DX, AL                  ; Send Control Word to 8255 Control Register

  MOV DX, PORT_DATA           ; Point DX to 8255 Lamp Output Port (${portAddr})

${isNightFlash ? `  ; --- NIGHT CAUTION MODE (CONTINUOUS YELLOW BLINK) ---
NIGHT_LOOP:
  MOV AL, 12H                 ; NS Yellow (PA1=1) + EW Yellow (PA4=1) -> 00010010b = 12H
  OUT DX, AL                  ; Illuminate both Yellow warning lamps
  CALL DELAY_YELLOW           ; Hold yellow lamps ON
  MOV AL, 00H                 ; Turn all lamps OFF
  OUT DX, AL                  ; Extinguish lamps
  CALL DELAY_YELLOW           ; Hold yellow lamps OFF
  JMP NIGHT_LOOP              ; Repeat flashing caution sequence indefinitely` : isEmergency ? `  ; --- EMERGENCY OVERRIDE CORRIDOR MODE ---
EMERGENCY_LOCK:
  MOV AL, 09H                 ; NS Red (PA0=1) + EW Red (PA3=1) -> All Stop: 00001001b = 09H
  OUT DX, AL                  ; Command all directions to halt immediately
  CALL DELAY_GREEN            ; Hold emergency all-red condition
  MOV AL, 21H                 ; Grant Priority Corridor: NS Green (PA2=1) + EW Red (PA3=1)
  OUT DX, AL                  ; Output Priority Green
  CALL DELAY_GREEN            ; Hold priority green window
  JMP EMERGENCY_LOCK          ; Loop emergency sequence` : `  ; --- STEP 3: MAIN 4-PHASE TRAFFIC SEQUENCER LOOP ---
TRAFFIC_CYCLE:
  ; === PHASE 1: NORTH-SOUTH GREEN & EAST-WEST RED ===
  MOV AL, 21H                 ; PA2=1 (NS Green), PA3=1 (EW Red) -> 21H
  OUT DX, AL                  ; Output to 8255 Port A -> Drive LED / Relay Drivers
${isPedestrian ? `  CALL CHECK_PEDESTRIAN       ; Poll Pedestrian Request Pin during green phase\n` : ''}  CALL DELAY_GREEN            ; Hold NS Green for calibrated window (~${trafficAlpTiming === 'standard' ? '30s' : '5s'})

  ; === PHASE 2: NORTH-SOUTH YELLOW & EAST-WEST RED ===
  MOV AL, 11H                 ; PA1=1 (NS Yellow), PA3=1 (EW Red) -> 11H
  OUT DX, AL                  ; Output transition yellow signal
  CALL DELAY_YELLOW           ; Hold NS Yellow for cautionary clearance (~${trafficAlpTiming === 'standard' ? '5s' : '2s'})

  ; === PHASE 3: NORTH-SOUTH RED & EAST-WEST GREEN ===
  MOV AL, 0CH                 ; PA0=1 (NS Red), PA5=1 (EW Green) -> 0CH
  OUT DX, AL                  ; Output EW Green signal
${isPedestrian ? `  CALL CHECK_PEDESTRIAN       ; Poll Pedestrian Request Pin during green phase\n` : ''}  CALL DELAY_GREEN            ; Hold EW Green for calibrated window (~${trafficAlpTiming === 'standard' ? '30s' : '5s'})

  ; === PHASE 4: NORTH-SOUTH RED & EAST-WEST YELLOW ===
  MOV AL, 0AH                 ; PA0=1 (NS Red), PA4=1 (EW Yellow) -> 0AH
  OUT DX, AL                  ; Output transition yellow signal
  CALL DELAY_YELLOW           ; Hold EW Yellow for cautionary clearance (~${trafficAlpTiming === 'standard' ? '5s' : '2s'})

  JMP TRAFFIC_CYCLE           ; Continuous cyclic state sequencing`}

; =========================================================================
; CALIBRATED SOFTWARE DELAY SUBROUTINES
; =========================================================================
DELAY_GREEN PROC NEAR
  PUSH CX                     ; Preserve outer loop CX register onto stack
  MOV CX, ${outerCountGreen}              ; Outer delay iteration counter
G_OUTER:
  PUSH CX                     ; Preserve outer counter
  MOV CX, ${innerCountGreen}               ; Inner loop multiplier counter
G_INNER:
  LOOP G_INNER                ; Decrement inner counter (~2 clock cycles per loop)
  POP CX                      ; Restore outer counter
  LOOP G_OUTER                ; Decrement outer counter
  POP CX                      ; Restore original CX from stack
  RET                         ; Return to calling procedure
DELAY_GREEN ENDP

DELAY_YELLOW PROC NEAR
  PUSH CX                     ; Preserve outer loop CX register onto stack
  MOV CX, ${outerCountYellow}              ; Outer delay iteration counter
Y_OUTER:
  PUSH CX                     ; Preserve outer counter
  MOV CX, ${innerCountYellow}               ; Inner loop multiplier counter
Y_INNER:
  LOOP Y_INNER                ; Decrement inner counter
  POP CX                      ; Restore outer counter
  LOOP Y_OUTER                ; Decrement outer counter
  POP CX                      ; Restore original CX from stack
  RET                         ; Return to calling procedure
DELAY_YELLOW ENDP

${isPedestrian ? `; -------------------------------------------------------------------------
; Pedestrian Walk Button Sense Subroutine (Port C PC0 Sense)
; -------------------------------------------------------------------------
CHECK_PEDESTRIAN PROC NEAR
  PUSH AX                     ; Save AX
  PUSH DX                     ; Save DX
  MOV DX, PORT_SENSE          ; Point DX to Port C input register
  IN AL, DX                   ; Read Port C pins (PC0 = Pedestrian Pushbutton)
  TEST AL, 01H                ; Check if PC0 is asserted HIGH
  JZ NO_PEDESTRIAN            ; If 0, no pedestrian request detected
  ; If pedestrian button pressed, execute safe transition
  MOV DX, PORT_DATA           ; Point to Lamp Port
  MOV AL, 09H                 ; NS Red + EW Red (All Stop for safe pedestrian crossing)
  OUT DX, AL                  ; Flash all Red lamps
  CALL DELAY_YELLOW           ; Hold pedestrian crossing interval
NO_PEDESTRIAN:
  POP DX                      ; Restore DX
  POP AX                      ; Restore AX
  RET                         ; Return to caller
CHECK_PEDESTRIAN ENDP\n` : ''}MAIN ENDP                     ; End main procedure
END MAIN                      ; End of assembly program`;
  };

  const handleCopyTrafficAlp = () => {
    navigator.clipboard.writeText(generateTrafficAssemblyCode());
    setCopiedTrafficAlp(true);
    setTimeout(() => setCopiedTrafficAlp(false), 2000);
  };

  const handleDownloadTrafficAsm = () => {
    const code = generateTrafficAssemblyCode();
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `8086_Traffic_Light_${trafficAlpMode}_8255.asm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Header content descriptors tailored to each peripheral
  const headers = {
    schematic: {
      icon: <Layers className="w-5 h-5" />,
      title: 'Circuit Diagram: 8086 and Stepper Motor Interfacing (Unipolar)',
      subtitle: 'Proteus / EDA Schematic: 8086 (U2) ↔ 74HC373 (U3) ↔ 8255A PPI (U4) ↔ ULN2003A Driver (U5) ↔ 12V Stepper Motor (B1)'
    },
    circuit: {
      icon: <Activity className="w-5 h-5" />,
      title: '8086 Interfacing Circuit Architecture & Bus Decoding',
      subtitle: '8086 CPU ↔ 74LS373 Latches ↔ 74LS138 Address Decoder (CS# = 80H) ↔ 8255 PPI ↔ ULN2003 Driver'
    },
    'stepper-types': {
      icon: <Component className="w-5 h-5" />,
      title: 'Types of Stepper Motors & Operating Principles',
      subtitle: 'Variable Reluctance (VR) • Permanent Magnet (PM) • Hybrid (VR+PM) • Unipolar vs. Bipolar Drive Topologies'
    },
    stepper: {
      icon: <RotateCw className="w-5 h-5" />,
      title: '8086 Stepper Motor Interfacing & Driver (ULN2003A)',
      subtitle: 'Excitation Wave / Full / Half Step Modes • Dynamic Rotor & Stator Simulation • Coil Sinking Signals'
    },
    'stepper-code': {
      icon: <Code className="w-5 h-5" />,
      title: '8086 Stepper Motor Assembly Language Program (ALP)',
      subtitle: 'Full-Step 2-Phase ON (03H, 06H, 0CH, 09H) • 8255 PPI Port A Interfacing & Delay Loop'
    },
    'display-circuit': {
      icon: <Activity className="w-5 h-5" />,
      title: '8086 Seven-Segment LED Display Interfacing Circuit & Architecture',
      subtitle: '8086 CPU ↔ 74LS373 Latch ↔ 74LS138 Decoder (CS# = 80H) ↔ 8255 PPI Port A ↔ 330Ω Resistors ↔ 7-Segment Display'
    },
    display: {
      icon: <Lightbulb className="w-5 h-5" />,
      title: '8086 Seven-Segment LED Display Simulator & Segment Decoder',
      subtitle: 'Common Cathode (Active HIGH) & Common Anode (Active LOW) • Live Segment Decoding Matrix • Multiplexed Scanning'
    },
    'display-code': {
      icon: <Code className="w-5 h-5" />,
      title: '8086 Seven-Segment Display Assembly Language Program (ALP)',
      subtitle: 'Lookup Table & XLAT Instruction • Up/Down BCD Counters • 8255 PPI Initialization (80H) & Delay Routine'
    },
    'keypad-circuit': {
      icon: <Activity className="w-5 h-5" />,
      title: '8086 4x4 Matrix Keypad Interfacing Circuit & Architecture',
      subtitle: '8086 CPU ↔ 74LS373 Latch ↔ 74LS138 Decoder (CS# = 80H) ↔ 8255 PPI (Port A Out: Rows, Port B In: Columns) ↔ 10kΩ Pull-Ups ↔ 4x4 Matrix'
    },
    keypad: {
      icon: <Grid className="w-5 h-5" />,
      title: '8086 4x4 Matrix Keypad Simulator & Scanner',
      subtitle: 'Active-LOW Row Scanning (Port A) • Column Sense (Port B) • Contact Bouncing Verification'
    },
    'keypad-code': {
      icon: <Code className="w-5 h-5" />,
      title: '8086 4x4 Matrix Keypad Assembly Language Program (ALP)',
      subtitle: '8255 PPI Mode 0 Initialization (82H) • Row Grounding (0EH,0DH,0BH,07H) • 20ms Debounce Loop • Table Lookup'
    },
    traffic: {
      icon: <Timer className="w-5 h-5" />,
      title: '8086 4-Way Traffic Light Controller Interfacing',
      subtitle: 'North-South & East-West Phase Sequencing • 8255 Port A Bit Assignments • State Machine Delays'
    },
    'traffic-code': {
      icon: <Code className="w-5 h-5" />,
      title: '8086 Traffic Light Controller Assembly Language Program (ALP)',
      subtitle: '4-Phase State Sequencer (21H, 11H, 0CH, 0AH) • 8255 Port A Bit Mapping • Nested Delay Subroutines'
    },
    alp: {
      icon: <Code className="w-5 h-5" />,
      title: '8086 Assembly Language Programs (ALP) for Peripherals',
      subtitle: '8255 PPI Initialization (80H) • Stepper Driver Loops • Lookup Table Indexing'
    }
  };

  const currentHeader = headers[activeTab] || headers.circuit;

  return (
    <div className="bg-white text-slate-800 p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs font-sans">
      {/* Dedicated Header for Current Peripheral without redundant tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-600 shadow-2xs">
            {currentHeader.icon}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">{currentHeader.title}</h3>
            <p className="text-[11px] text-slate-500">
              {currentHeader.subtitle}
            </p>
          </div>
        </div>

        {/* Tab Switcher for Multi-tab modes (e.g. Slide 1 combined Circuit & Stepper Motor, Slide 2 7-Segment, Slide 3 Keypad) */}
        {((allowedTabs && allowedTabs.length > 1) || showTabs) && (
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shadow-inner">
            {(allowedTabs || ['schematic', 'circuit', 'stepper', 'display', 'keypad', 'traffic', 'traffic-code', 'alp']).map((tabKey) => {
              const tabMeta: Record<string, { label: string; icon: React.ReactNode }> = {
                schematic: { label: 'Proteus Circuit Diagram (Unipolar)', icon: <Layers className="w-3.5 h-3.5" /> },
                circuit: { label: 'Circuit Blocks & Architecture', icon: <Activity className="w-3.5 h-3.5" /> },
                'stepper-types': { label: 'Types of Stepper Motor', icon: <Component className="w-3.5 h-3.5" /> },
                stepper: { label: 'Stepper Motor Simulator', icon: <RotateCw className="w-3.5 h-3.5" /> },
                'stepper-code': { label: 'Stepper Motor ALP (Code)', icon: <Code className="w-3.5 h-3.5" /> },
                'display-circuit': { label: 'Circuit Blocks & Architecture', icon: <Activity className="w-3.5 h-3.5" /> },
                display: { label: '7-Segment Simulator & Decoder', icon: <Lightbulb className="w-3.5 h-3.5" /> },
                'display-code': { label: '7-Segment ALP (Code)', icon: <Code className="w-3.5 h-3.5" /> },
                'keypad-circuit': { label: 'Circuit Blocks & Architecture', icon: <Activity className="w-3.5 h-3.5" /> },
                keypad: { label: 'Keypad Simulator & Scanner', icon: <Grid className="w-3.5 h-3.5" /> },
                'keypad-code': { label: 'Keypad ALP (Code)', icon: <Code className="w-3.5 h-3.5" /> },
                traffic: { label: 'Traffic Light Controller', icon: <Timer className="w-3.5 h-3.5" /> },
                'traffic-code': { label: 'Traffic Light ALP (Code)', icon: <Code className="w-3.5 h-3.5" /> },
                alp: { label: 'Assembly Program (ALP)', icon: <Code className="w-3.5 h-3.5" /> },
              };
              const isSelected = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-[11px] transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  {tabMeta[tabKey]?.icon}
                  <span>{tabMeta[tabKey]?.label || tabKey}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* TAB 0: PROTEUS SCHEMATIC CIRCUIT DIAGRAM (Unipolar Stepper Motor) */}
      {activeTab === 'schematic' && (
        <StepperSchematicDiagram 
          driveMode={driveMode} 
          direction={direction} 
          isExternalRunning={isRunning} 
        />
      )}

      {/* TAB 1: INTERFACING CIRCUIT SCHEMATIC (Full Light Background Diagram) */}
      {activeTab === 'circuit' && (
        <div className="space-y-4">
          {/* Top Info Banner */}
          <div className="bg-indigo-50/70 border border-indigo-150 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-lg font-mono text-[10px] font-bold">SCHEMATIC</span>
              <span className="font-semibold text-indigo-950 text-xs">
                8086 CPU ↔ 74LS138 Decoder ↔ 8255 PPI ↔ ULN2003 Driver ↔ Stepper Motor &amp; Peripherals
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-xs ${
                  isRunning ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isRunning ? 'Pause Circuit Signals' : 'Animate Circuit Signals'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Hardware Block Diagram Canvas (Clean Light SVG) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-x-auto shadow-inner">
            <div className="min-w-[760px] flex items-stretch justify-between gap-3 text-[11px]">
              
              {/* BLOCK 1: 8086 Microprocessor */}
              <div className="w-44 bg-white border-2 border-indigo-200 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-extrabold text-indigo-700 font-mono text-xs">8086 CPU</span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold">5 MHz</span>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">AD0–AD15</span>
                    <span className="text-indigo-600 font-bold">Mux Bus</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">A16–A19</span>
                    <span className="text-indigo-600 font-bold">Addr Hi</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">ALE</span>
                    <span className="text-emerald-600 font-bold">Latch En</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">M/IO#, RD#, WR#</span>
                    <span className="text-amber-600 font-bold">Control</span>
                  </div>
                </div>
                <div className="pt-1 text-[9px] text-slate-400 border-t border-slate-100 text-center font-mono">
                  Minimum Mode (+5V)
                </div>
              </div>

              {/* ARROW 1: Bus Demux */}
              <div className="flex flex-col items-center justify-center space-y-1 px-1">
                <span className="text-[9px] font-mono text-indigo-600 font-bold">ALE / Demux</span>
                <div className="w-8 h-0.5 bg-indigo-300 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500 absolute -right-2 -top-1.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">74LS373</span>
              </div>

              {/* BLOCK 2: 74HC373 / 74LS373 Address Latch (Demultiplexer) */}
              <div className="w-44 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-800 font-mono text-xs">74HC373</span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold">Octal Latch</span>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="text-slate-600 flex justify-between">
                    <span>Input:</span> <strong className="text-indigo-600">AD0–AD7</strong>
                  </div>
                  <div className="text-slate-600 flex justify-between">
                    <span>Control:</span> <strong className="text-emerald-600">LE ← ALE</strong>
                  </div>
                  <div className="py-1 px-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold flex justify-between">
                    <span>Outputs Q0, Q1:</span>
                    <span>A0, A1</span>
                  </div>
                  <div className="text-[9px] text-slate-500 bg-slate-50 p-1 rounded">
                    OE# = 0 (GND) | CS# = 0 (Always ON)
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 border-t border-slate-100 pt-1 text-center">
                  Single 8255 System (No Decoder)
                </div>
              </div>

              {/* ARROW 2: Latched Address & Data Bus */}
              <div className="flex flex-col items-center justify-center space-y-1 px-1">
                <span className="text-[9px] font-mono text-emerald-600 font-bold">A0, A1 &amp; CS#=0</span>
                <div className="w-8 h-0.5 bg-emerald-400 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 absolute -right-2 -top-1.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">D0–D7</span>
              </div>

              {/* BLOCK 3: Intel 8255 PPI */}
              <div className="w-48 bg-white border-2 border-indigo-300 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="font-extrabold text-indigo-800 font-mono text-xs">Intel 8255 PPI</span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold">24 I/O</span>
                </div>
                <div className="space-y-1.5 font-mono text-[10px]">
                  {/* Port A status */}
                  <div className="p-1.5 bg-indigo-50/60 rounded border border-indigo-100 flex items-center justify-between">
                    <span className="text-indigo-900 font-bold">Port A (PA0–PA3)</span>
                    <span className="text-emerald-700 font-bold">0x0{coilStateByte.toString(16).toUpperCase()}H</span>
                  </div>
                  {/* Port B status */}
                  <div className="p-1 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-slate-600">
                    <span>Port B (PB0–PB7)</span>
                    <span>7-Segment / Traffic</span>
                  </div>
                  {/* Port C status */}
                  <div className="p-1 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-slate-600">
                    <span>Port C (PC0–PC7)</span>
                    <span>Keypad Matrix</span>
                  </div>
                </div>
                <div className="text-[9px] text-indigo-600 font-bold text-center border-t border-slate-100 pt-1 font-mono">
                  Control Word: 80H (Mode 0 Out)
                </div>
              </div>

              {/* ARROW 3: Driver Lines */}
              <div className="flex flex-col items-center justify-center space-y-1 px-1">
                <span className="text-[9px] font-mono text-indigo-600 font-bold">PA0–PA3</span>
                <div className="w-8 h-0.5 bg-indigo-400 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 absolute -right-2 -top-1.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">Logic Levels</span>
              </div>

              {/* BLOCK 4: ULN2003A Driver */}
              <div className="w-44 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-800 font-mono text-xs">ULN2003A</span>
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-bold">Darlington</span>
                </div>
                <div className="space-y-1 font-mono text-[9px]">
                  {['1B (PA0) → 1C (A)', '2B (PA1) → 2C (B)', '3B (PA2) → 3C (C)', '4B (PA3) → 4C (D)'].map((coil, idx) => {
                    const isCoilActive = ((coilStateByte >> idx) & 1) === 1;
                    return (
                      <div 
                        key={idx} 
                        className={`p-1 rounded flex justify-between items-center transition-all ${
                          isCoilActive ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        <span>{coil}</span>
                        <span>{isCoilActive ? 'ON' : 'OFF'}</span>
                      </div>
                    );
                  })}
                  <div className="text-slate-500 text-[8.5px] pt-1">COM (Pin 9) → +12V DC</div>
                </div>
                <div className="text-[9px] text-amber-800 border-t border-slate-100 pt-1 text-center font-bold">
                  500mA Sink per Channel
                </div>
              </div>

              {/* ARROW 4: High Current Motor Coils */}
              <div className="flex flex-col items-center justify-center space-y-1 px-1">
                <span className="text-[9px] font-mono text-amber-600 font-bold">+12V Coils</span>
                <div className="w-8 h-0.5 bg-amber-400 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 absolute -right-2 -top-1.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">4-Phase</span>
              </div>

              {/* BLOCK 5: 4-Phase Stepper Motor Rotor */}
              <div className="w-48 bg-white border-2 border-emerald-300 rounded-xl p-3 shadow-xs flex flex-col justify-between items-center text-center space-y-2">
                <div className="w-full flex items-center justify-between border-b border-emerald-100 pb-1.5">
                  <span className="font-extrabold text-emerald-800 font-mono text-xs">Stepper Motor</span>
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold">1.8°/Step</span>
                </div>
                
                {/* Physical Rotor Visual */}
                <div 
                  className="w-20 h-20 rounded-full border-4 border-indigo-400 bg-slate-50 relative flex items-center justify-center shadow-inner transition-transform duration-300"
                  style={{ transform: `rotate(${motorAngle}deg)` }}
                >
                  <div className="w-1 h-8 bg-emerald-600 rounded-full absolute top-1.5 shadow-xs" />
                  <div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-white" />
                </div>

                <div className="text-[10px] font-mono text-slate-700">
                  Shaft Angle: <strong className="text-slate-900 font-bold">{motorAngle}°</strong>
                </div>
                <div className="text-[9px] text-slate-500 font-sans">
                  Phase Sequence: A → B → C → D
                </div>
              </div>

            </div>
          </div>

          {/* Detailed Functional Breakdown of Each Circuit Block */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-xs text-indigo-950 uppercase tracking-wider">
                Functional Breakdown of Interfacing Circuit Blocks
              </span>
              <span className="text-[10px] text-slate-500 font-mono">5 Master Hardware Stages</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* BLOCK 1 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    Block 1: 8086 Microprocessor (Controller / Master Unit)
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-indigo-100 text-indigo-700 rounded-md">CPU Core</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Function:</strong> Acts as the brain of the system. It executes the Assembly Language Program (ALP), generates digital timing pulses, and determines the rotation direction (CW/CCW), speed (via software delay loops), and total step count.
                </p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1 text-[10px]">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[9px]">Key Connections:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5 font-mono">
                    <li><strong className="text-indigo-700">AD0–AD15:</strong> Multiplexed Address/Data bus lines.</li>
                    <li><strong className="text-emerald-700">ALE:</strong> Pulses HIGH in T1 to latch address into 74LS373.</li>
                    <li><strong className="text-amber-700">M/IO#, RD#, WR#:</strong> Control bus signals for I/O write cycles.</li>
                  </ul>
                </div>
              </div>

              {/* BLOCK 2 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Block 2: 74HC373 / 74LS373 Octal Transparent D-Latch (Demultiplexer)
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-100 text-blue-700 rounded-md">Address Demux</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Function:</strong> Demultiplexes the 8086 address/data bus (<code className="font-mono text-indigo-700">AD0–AD7</code>). When <code className="font-mono text-emerald-700">ALE</code> pulses HIGH during clock cycle T1, the 74HC373 latches address bits <strong className="text-slate-900">A0 and A1</strong> into outputs Q0 and Q1.
                </p>
                <div className="space-y-1.5 text-[10px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="font-bold text-blue-900">Direct Port Addressing (A0, A1):</span>
                    <p className="text-slate-600">Q0 and Q1 connect directly to 8255 pins A0 (Pin 9) and A1 (Pin 8) to select Port A (00b), Port B (01b), Port C (10b), or Control Register (11b).</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="font-bold text-emerald-900">Single 8255 System (CS# = Ground / Logic 0):</span>
                    <p className="text-slate-600">When the 8255 is the sole peripheral, <code className="font-mono text-emerald-700">CS# (Pin 6)</code> and <code className="font-mono text-blue-700">OE# (Pin 1)</code> are tied directly to Ground (0V), making the 8255 always enabled without needing an extra 74LS138 decoder.</p>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700 flex justify-between flex-wrap gap-1">
                    <span>Port A (A1=0, A0=0)</span>
                    <span>Port B (A1=0, A0=1)</span>
                    <span>Port C (A1=1, A0=0)</span>
                    <span>Control Reg (A1=1, A0=1)</span>
                  </div>
                </div>
              </div>

              {/* BLOCK 3 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-purple-600" />
                    Block 3: Intel 8255 Programmable Peripheral Interface (PPI)
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-purple-100 text-purple-700 rounded-md">24 I/O Lines</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Function:</strong> Provides programmable parallel I/O ports to interface the CPU with the motor driver.
                </p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1 text-[10px]">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[9px]">Configuration &amp; Operation:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                    <li>Initialized in <strong>Mode 0 (Basic I/O)</strong> with Port A configured as an Output port by sending control byte <code className="bg-slate-100 px-1 rounded text-purple-700 font-mono">80H</code> (10000000b) to address 86H.</li>
                    <li>Pins <strong>PA0–PA3</strong> output 4-bit excitation nibbles (<strong>03H, 06H, 0CH, 09H</strong>) to energize motor phases in sequence.</li>
                  </ul>
                </div>
              </div>

              {/* BLOCK 4 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    Block 4: ULN2003A Darlington Transistor Driver IC
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-100 text-amber-800 rounded-md">High-Current Driver</span>
                </div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="font-bold text-amber-900">Why it is Required:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      <li><strong>Current Amplification:</strong> 8255 pins provide only ~1.6–2.5 mA (0V/5V logic), while motor coils require 200–500 mA at +12V DC.</li>
                      <li><strong>Inductive Back-EMF Suppression:</strong> Motor coils generate dangerous reverse voltage spikes (V = -L di/dt) when de-energized.</li>
                    </ul>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5 font-mono text-[9px] text-slate-700">
                    <div>Inputs (1B–4B): Connected to 8255 PA0–PA3</div>
                    <div>Outputs (1C–4C): Connected to Motor Coils Phase A, B, C, D</div>
                    <div>Pin 8 (GND): System Ground | Pin 9 (COM): +12V DC (Clamp Diodes)</div>
                  </div>
                </div>
              </div>

              {/* BLOCK 5 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <RotateCw className="w-4 h-4 text-emerald-600" />
                    Block 5: 4-Phase Stepper Motor (Actuator)
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded-md">Actuator Load</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Function:</strong> Electromechanical actuator that converts electrical input pulses into discrete mechanical angular displacements (steps).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="font-bold text-slate-800">Construction &amp; Operation:</span>
                    <p className="text-slate-600">4 stator phase windings (Phase A, B, C, D) with common terminal tied to +12V DC. When ULN2003 output goes LOW, current flows from +12V through that winding, pulling rotor teeth into alignment.</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="font-bold text-slate-800">Step Angle (β) &amp; Resolution:</span>
                    <p className="text-slate-600 font-mono">β = 360° / (Phases × Teeth) → 1.8° (200 steps/rev) or 7.5° (48 steps/rev). Rotation speed is governed by time delay between step pulses.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: TYPES OF STEPPER MOTORS (VR, PM, HYBRID, UNIPOLAR vs BIPOLAR) */}
      {activeTab === 'stepper-types' && (
        <StepperMotorTypesExplorer />
      )}

      {/* TAB 2: STEPPER MOTOR SIMULATOR */}
      {activeTab === 'stepper' && (
        <div className="space-y-3">
          {/* Active Interface Header Bar */}
          <div className="bg-indigo-50/80 border border-indigo-150 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-indigo-600 text-white rounded-md font-mono text-[10px] font-bold">PORT</span>
              <span className="text-slate-700">
                Interfaced via <strong>8255 {activePortConfig.fullName}</strong> ({activePortConfig.address}) → ULN2003A
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-mono">Step Angle: <strong>{stepSizeDeg}°</strong></span>
              <button
                type="button"
                onClick={() => setActiveTab('stepper-code')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
              >
                <Code className="w-3 h-3" />
                <span>View Generated ALP</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Left Column: Control Panel */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">
                  Excitation Drive Mode
                </label>
                <div className="grid grid-cols-3 gap-1.5 font-semibold">
                  <button
                    onClick={() => setDriveMode('wave')}
                    className={`py-1.5 rounded-lg border cursor-pointer transition-all ${
                      driveMode === 'wave' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Wave (1-Phase)
                  </button>
                  <button
                    onClick={() => setDriveMode('full')}
                    className={`py-1.5 rounded-lg border cursor-pointer transition-all ${
                      driveMode === 'full' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Full Step (2-Phase)
                  </button>
                  <button
                    onClick={() => setDriveMode('half')}
                    className={`py-1.5 rounded-lg border cursor-pointer transition-all ${
                      driveMode === 'half' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Half Step (Half Angle)
                  </button>
                </div>
              </div>

              {/* Speed / Delay Slider */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-600 mb-1 font-bold">
                  <span>STEP PULSE DELAY (SPEED)</span>
                  <span className="font-mono text-indigo-700">{stepDelayMs} ms / step</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="900"
                  step="50"
                  value={stepDelayMs}
                  onChange={(e) => setStepDelayMs(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                    isRunning ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Stop Motor' : 'Run Sequence'}
                </button>
                <button
                  onClick={() => setDirection(direction === 'cw' ? 'ccw' : 'cw')}
                  className="bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
                >
                  {direction === 'cw' ? <RotateCw className="w-4 h-4 text-indigo-600" /> : <RotateCcw className="w-4 h-4 text-indigo-600" />}
                  <span>{direction === 'cw' ? 'Clockwise (CW)' : 'Anti-Clockwise (CCW)'}</span>
                </button>
              </div>

              {/* ULN2003 Driver Coils Output */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                    ULN2003 Driver Output Lines ({activePortConfig.pins})
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    Port: {activePortConfig.address}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-center text-[10px]">
                  {[
                    `Coil A (${isUpperNibble ? 'PC4' : stepperPort === 'portB' ? 'PB0' : stepperPort === 'portC_lower' ? 'PC0' : 'PA0'})`,
                    `Coil B (${isUpperNibble ? 'PC5' : stepperPort === 'portB' ? 'PB1' : stepperPort === 'portC_lower' ? 'PC1' : 'PA1'})`,
                    `Coil C (${isUpperNibble ? 'PC6' : stepperPort === 'portB' ? 'PB2' : stepperPort === 'portC_lower' ? 'PC2' : 'PA2'})`,
                    `Coil D (${isUpperNibble ? 'PC7' : stepperPort === 'portB' ? 'PB3' : stepperPort === 'portC_lower' ? 'PC3' : 'PA3'})`
                  ].map((name, idx) => {
                    const active = ((coilStateByte >> idx) & 1) === 1;
                    return (
                      <div
                        key={name}
                        className={`py-2 rounded-lg font-bold border transition-all ${
                          active 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="text-[9px]">{name}</div>
                        <div className="text-[9px] mt-0.5">{active ? 'HIGH (+12V)' : 'LOW (0V)'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Physical Rotor View */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Physical Stepper Motor Rotor &amp; Stator Poles
              </span>
              
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* 4 Stator Coils Placed at Top, Right, Bottom, Left */}
                <div className={`absolute top-0 px-2 py-1 rounded text-[9px] font-mono font-bold border ${((coilStateByte >> 0) & 1) === 1 ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-white text-slate-500 border-slate-200'}`}>
                  Coil A (0°)
                </div>
                <div className={`absolute right-0 px-2 py-1 rounded text-[9px] font-mono font-bold border ${((coilStateByte >> 1) & 1) === 1 ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-white text-slate-500 border-slate-200'}`}>
                  Coil B (90°)
                </div>
                <div className={`absolute bottom-0 px-2 py-1 rounded text-[9px] font-mono font-bold border ${((coilStateByte >> 2) & 1) === 1 ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-white text-slate-500 border-slate-200'}`}>
                  Coil C (180°)
                </div>
                <div className={`absolute left-0 px-2 py-1 rounded text-[9px] font-mono font-bold border ${((coilStateByte >> 3) & 1) === 1 ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-white text-slate-500 border-slate-200'}`}>
                  Coil D (270°)
                </div>

                {/* Rotating Rotor */}
                <div
                  className="w-28 h-28 rounded-full border-4 border-indigo-500 bg-white relative flex items-center justify-center shadow-inner transition-transform duration-300"
                  style={{ transform: `rotate(${motorAngle}deg)` }}
                >
                  <div className="w-2 h-11 bg-emerald-500 rounded-full absolute top-2 shadow-xs" />
                  <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white text-[8px] font-bold font-mono">
                    N
                  </div>
                  <div className="w-2 h-11 bg-slate-300 rounded-full absolute bottom-2" />
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 w-full font-mono text-[11px] flex justify-between shadow-2xs">
                <span>Rotor Angle: <strong className="text-slate-900">{motorAngle}°</strong></span>
                <span>Active 8255 Output: <strong className="text-emerald-700 font-bold">{currentGenSequence.hexArr[currentStepIndex % currentGenSequence.hexArr.length]}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: STEPPER MOTOR CODE (ALP) & INTERACTIVE GENERATOR */}
      {activeTab === 'stepper-code' && (
        <div className="space-y-3.5">
          {/* Top Interactive Configuration Panel */}
          <div className="bg-slate-50 p-3.5 md:p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-2">
              <span className="font-bold text-xs text-indigo-950 uppercase flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                8255 Stepper Motor Interface &amp; ALP Code Generator
              </span>
              <span className="text-slate-500 text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 font-sans">
                Customize parameters below to automatically regenerate the 8086 Assembly Program
              </span>
            </div>

            {/* Configurator Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px]">
              {/* 1. 8255 Port Selector */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  1. 8255 Interface Port
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'portA', label: 'Port A (80H)', sub: 'PA0–PA3' },
                    { id: 'portB', label: 'Port B (82H)', sub: 'PB0–PB3' },
                    { id: 'portC_lower', label: 'Port C Low (84H)', sub: 'PC0–PC3' },
                    { id: 'portC_upper', label: 'Port C High (84H)', sub: 'PC4–PC7' },
                  ].map((p) => {
                    const isSelected = stepperPort === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setStepperPort(p.id as any)}
                        className={`p-1.5 rounded-lg text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-[11px] font-bold leading-tight">{p.label}</div>
                        <div className={`text-[9px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{p.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Step Angle (Step Size) */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  2. Motor Step Angle (Step Size)
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { deg: 1.8, label: '1.8° (200 st/rev)', sub: 'Standard Hybrid' },
                    { deg: 0.9, label: '0.9° (400 st/rev)', sub: 'High Precision' },
                    { deg: 7.5, label: '7.5° (48 st/rev)', sub: 'PM Stepper' },
                    { deg: 15.0, label: '15.0° (24 st/rev)', sub: 'Coarse Angle' },
                  ].map((s) => {
                    const isSelected = stepSizeDeg === s.deg;
                    return (
                      <button
                        key={s.deg}
                        type="button"
                        onClick={() => setStepSizeDeg(s.deg)}
                        className={`p-1.5 rounded-lg text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-[11px] font-bold leading-tight">{s.label}</div>
                        <div className={`text-[9px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{s.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Excitation Drive Mode */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  3. Excitation Drive Mode
                </label>
                <div className="space-y-1">
                  {[
                    { id: 'full', label: 'Full-Step (2-Phase ON)', sub: 'Max torque (03H, 06H, 0CH, 09H)' },
                    { id: 'wave', label: 'Wave Drive (1-Phase ON)', sub: 'Low power (01H, 02H, 04H, 08H)' },
                    { id: 'half', label: 'Half-Step (1&2 Phase)', sub: 'Smooth (01H, 03H, 02H, 06H...)' },
                  ].map((m) => {
                    const isSelected = driveMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setDriveMode(m.id as any)}
                        className={`w-full p-1.5 rounded-lg text-left border transition-all cursor-pointer flex justify-between items-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="text-[11px] font-bold leading-tight">{m.label}</div>
                          <div className={`text-[9px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{m.sub}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Rotation Direction */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  4. Rotation Direction
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDirection('cw')}
                    className={`py-2 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 text-[11px] cursor-pointer transition-all border ${
                      direction === 'cw'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Clockwise (CW)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('ccw')}
                    className={`py-2 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 text-[11px] cursor-pointer transition-all border ${
                      direction === 'ccw'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Anti-CW (CCW)</span>
                  </button>
                </div>
              </div>

              {/* 5. Target Steps & Rotation Extent */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block flex justify-between">
                  <span>5. Rotation Extent / Steps</span>
                  <span className="font-mono text-indigo-600 lowercase">{totalCalculatedAngle}</span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'continuous', label: 'Continuous' },
                    { id: 'full_rev', label: '360° (1 Rev)' },
                    { id: 'half_rev', label: '180° (½ Rev)' },
                    { id: 'quarter_rev', label: '90° (¼ Rev)' },
                    { id: 'custom_steps', label: 'Custom' },
                  ].map((r) => {
                    const isSelected = targetRotationMode === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setTargetRotationMode(r.id as any)}
                        className={`p-1 rounded-lg text-center border transition-all text-[10px] cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
                {targetRotationMode === 'custom_steps' && (
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold">Steps:</span>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={customStepsCount}
                      onChange={(e) => setCustomStepsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-2 py-0.5 rounded border border-slate-300 font-mono text-xs text-indigo-700 font-bold bg-slate-50"
                    />
                    <span className="text-[10px] text-slate-500">
                      = {(customStepsCount * stepSizeDeg).toFixed(1)}°
                    </span>
                  </div>
                )}
              </div>

              {/* 6. Inter-Step Delay (Speed) */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block flex justify-between">
                  <span>6. Pulse Delay (Speed)</span>
                  <span className="font-mono text-indigo-600">{delayConfig.hexCount}</span>
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: '10ms', label: '10 ms (~100 Hz)', sub: 'Fast Speed' },
                    { id: '25ms', label: '25 ms (~40 Hz)', sub: 'Medium Speed' },
                    { id: '50ms', label: '50 ms (~20 Hz)', sub: 'Standard Settling' },
                    { id: '100ms', label: '100 ms (~10 Hz)', sub: 'Slow Precision' },
                  ].map((d) => {
                    const isSelected = delayPreset === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDelayPreset(d.id as any)}
                        className={`p-1.5 rounded-lg text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-[11px] font-bold leading-tight">{d.label}</div>
                        <div className={`text-[9px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{d.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hardware & Port Summary Live Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="bg-indigo-50 border border-indigo-200/80 p-2.5 rounded-xl">
              <span className="text-indigo-900 font-bold block mb-0.5">8255 Target Port</span>
              <span className="font-mono text-indigo-700 font-bold text-xs">{activePortConfig.address} ({activePortConfig.name})</span>
              <p className="text-[9px] text-slate-500 mt-0.5">{activePortConfig.pins} → ULN2003</p>
            </div>
            <div className="bg-purple-50 border border-purple-200/80 p-2.5 rounded-xl">
              <span className="text-purple-900 font-bold block mb-0.5">Control Word Reg</span>
              <span className="font-mono text-purple-700 font-bold text-xs">{controlRegAddr} (CW = {activePortConfig.controlWord})</span>
              <p className="text-[9px] text-slate-500 mt-0.5">Mode 0, Output Config</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl">
              <span className="text-emerald-900 font-bold block mb-0.5">Active Excitation Code</span>
              <span className="font-mono text-emerald-700 font-bold text-xs truncate block">{currentGenSequence.hexArr.slice(0, 4).join(', ')}{currentGenSequence.hexArr.length > 4 ? '...' : ''}</span>
              <p className="text-[9px] text-slate-500 mt-0.5">{driveMode.toUpperCase()} | {direction.toUpperCase()} ({currentGenSequence.hexArr.length} states)</p>
            </div>
            <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl">
              <span className="text-amber-900 font-bold block mb-0.5">Target Rotation Span</span>
              <span className="font-mono text-amber-700 font-bold text-xs truncate block">
                {effectiveSteps === 'continuous' ? 'Continuous (∞)' : `${effectiveSteps} Steps (${(Number(effectiveSteps) * stepSizeDeg).toFixed(1)}°)`}
              </span>
              <p className="text-[9px] text-slate-500 mt-0.5">Step Angle β = {stepSizeDeg}°</p>
            </div>
          </div>

          {/* Stepper Motor Assembly Language Code View */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-2.5 shadow-xs">
            <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <Code className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="font-bold text-indigo-950 uppercase text-xs block">
                    Generated 8086 Assembly Program (ALP)
                  </span>
                  <span className="text-slate-500 text-[10px] font-sans">
                    Target: {activePortConfig.fullName} | {driveMode.toUpperCase()} | {direction.toUpperCase()} | Delay {delayPreset}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Copy & Download */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    copiedCode
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                  }`}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied Code!' : 'Copy ALP'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadAsm}
                  className="px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Download .ASM</span>
                </button>
              </div>
            </div>

            <pre className="text-slate-800 leading-relaxed overflow-x-auto whitespace-pre bg-white p-4 rounded-xl border border-slate-200/90 shadow-inner font-mono text-[11px] max-h-96 overflow-y-auto">
{generateAssemblyCode()}
            </pre>
          </div>

          {/* Educational Algorithm & Register Role Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[10px]">
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                1. 8255 Initialization Logic
              </span>
              <p className="text-slate-600 leading-relaxed">
                Writing <code className="font-mono font-bold text-indigo-700 bg-slate-100 px-1 rounded">{activePortConfig.controlWord}</code> to control register <code className="font-mono text-slate-800">{controlRegAddr}</code> initializes 8255 in Mode 0 (Basic I/O), setting <strong className="text-slate-900">{activePortConfig.name}</strong> as an active Output port driving ULN2003A inputs.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                2. Sequence Indexing &amp; Stepping Loop
              </span>
              <p className="text-slate-600 leading-relaxed">
                <code className="font-mono font-bold text-emerald-700 bg-slate-100 px-1 rounded">MOV AL, STEP_SEQ[SI]</code> fetches excitation states in sequence ({currentGenSequence.hexArr.slice(0, 4).join(', ')}). The byte is sent via <code className="font-mono font-bold text-indigo-700">OUT {activePortConfig.address}, AL</code> to actuate motor stator poles.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                3. Delay Subroutine ({delayPreset})
              </span>
              <p className="text-slate-600 leading-relaxed">
                The <code className="font-mono font-bold text-amber-700 bg-slate-100 px-1 rounded">DELAY</code> loop uses <code className="font-mono font-bold">{delayConfig.hexCount}</code> iterations to generate ~{delayPreset} interval between pulses, allowing rotor inertia to complete mechanical angular displacement without stalling.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: 7-SEGMENT DISPLAY INTERFACING CIRCUIT ARCHITECTURE */}
      {activeTab === 'display-circuit' && (
        <div className="space-y-4">
          {/* Interactive Hardware Signal Control Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Digit Selector */}
              <div>
                <label className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider mb-1">
                  Inject Hex Digit (0–F):
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={digitHex}
                    onChange={(e) => setDigitHex(e.target.value)}
                    className="bg-white border border-slate-300 text-indigo-950 font-mono text-xs px-2.5 py-1.5 rounded-lg focus:outline-hidden focus:border-indigo-500 font-bold cursor-pointer shadow-2xs"
                  >
                    {['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'].map((ch) => (
                      <option key={ch} value={ch} className="bg-white text-slate-800">
                        Digit '{ch}' (Code: 0x{(displayType === 'cathode' ? segmentCodesCathode[ch] : ((~segmentCodesCathode[ch]) & 0xFF)).toString(16).toUpperCase().padStart(2, '0')}H)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Display Type Toggle */}
              <div>
                <label className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider mb-1">
                  Display Polarity Type:
                </label>
                <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
                  <button
                    onClick={() => setDisplayType('cathode')}
                    className={`px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-all ${
                      displayType === 'cathode'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Common Cathode (Active HIGH)
                  </button>
                  <button
                    onClick={() => setDisplayType('anode')}
                    className={`px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-all ${
                      displayType === 'anode'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Common Anode (Active LOW)
                  </button>
                </div>
              </div>

              {/* Interface Mode */}
              <div>
                <label className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider mb-1">
                  Interfacing Setup:
                </label>
                <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
                  <button
                    onClick={() => setSegCircuitMode('single')}
                    className={`px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-all ${
                      segCircuitMode === 'single'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Single 7-Segment Digit
                  </button>
                  <button
                    onClick={() => setSegCircuitMode('multiplexed')}
                    className={`px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-all ${
                      segCircuitMode === 'multiplexed'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    4-Digit Multiplexed Array
                  </button>
                </div>
              </div>
            </div>

            {/* Animation Toggle & Active Output Code */}
            <div className="flex items-center gap-2">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] shadow-2xs flex items-center gap-2">
                <span className="text-slate-500">8255 Output:</span>
                <span className="text-emerald-700 font-extrabold text-xs">
                  0x{activeCode.toString(16).toUpperCase().padStart(2, '0')}H
                </span>
                <span className="text-slate-400 text-[10px]">({activeCode.toString(2).padStart(8, '0')}b)</span>
              </div>
              <button
                onClick={() => setSegSignalsAnimating(!segSignalsAnimating)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs text-[11px] transition-all ${
                  segSignalsAnimating
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {segSignalsAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{segSignalsAnimating ? 'Signals Active' : 'Signals Paused'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Hardware Block Diagram Canvas (Clean Light SVG) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-x-auto shadow-inner">
            <div className="min-w-[820px] flex items-stretch justify-between gap-2.5 text-[11px]">
              
              {/* BLOCK 1: 8086 Microprocessor */}
              <div className="w-44 bg-white border-2 border-indigo-200 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-extrabold text-indigo-700 font-mono text-xs">8086 CPU</span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold">5 MHz</span>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">AD0–AD15</span>
                    <span className="text-indigo-600 font-bold">Mux Bus</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">ALE</span>
                    <span className="text-emerald-600 font-bold">Latch En</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">M/IO#, WR#</span>
                    <span className="text-amber-600 font-bold">I/O Write</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-indigo-50/70 rounded">
                    <span className="text-indigo-900 font-bold">Instruction:</span>
                    <span className="text-indigo-700 font-bold">OUT 80H, AL</span>
                  </div>
                </div>
                <div className="pt-1 text-[9px] text-slate-400 border-t border-slate-100 text-center font-mono">
                  Minimum Mode (+5V)
                </div>
              </div>

              {/* ARROW 1: Bus Demux */}
              <div className="flex flex-col items-center justify-center space-y-1 px-1">
                <span className="text-[9px] font-mono text-indigo-600 font-bold">ALE / Demux</span>
                <div className="w-7 h-0.5 bg-indigo-300 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500 absolute -right-2 -top-1.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">74LS373</span>
              </div>

              {/* BLOCK 2: 74LS138 Address Decoder */}
              <div className="w-40 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-800 font-mono text-xs">74LS138</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">Decoder</span>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="text-slate-600">Inputs: <strong className="text-slate-800">A2, A3, A4</strong></div>
                  <div className="text-slate-600">Enables: <strong className="text-slate-800">M/IO#, G1</strong></div>
                  <div className="py-1 px-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold flex justify-between">
                    <span>Y0# (CS#)</span>
                    <span>0 (Active)</span>
                  </div>
                  <div className="text-slate-500 text-[9px]">A1=0, A0=0 → Port A</div>
                </div>
                <div className="text-[9px] text-slate-500 border-t border-slate-100 pt-1 text-center">
                  Base Port: 80H
                </div>
              </div>

              {/* ARROW 2: Chip Select & Bus */}
              <div className="flex flex-col items-center justify-center space-y-1 px-1">
                <span className="text-[9px] font-mono text-emerald-600 font-bold">CS#, A0, A1</span>
                <div className="w-7 h-0.5 bg-emerald-400 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 absolute -right-2 -top-1.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">D0–D7 Bus</span>
              </div>

              {/* BLOCK 3: Intel 8255 PPI */}
              <div className="w-48 bg-white border-2 border-indigo-300 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                  <span className="font-extrabold text-indigo-800 font-mono text-xs">Intel 8255 PPI</span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold">24 I/O</span>
                </div>
                <div className="space-y-1.5 font-mono text-[10px]">
                  {/* Port A status */}
                  <div className="p-1.5 bg-indigo-50/70 rounded border border-indigo-100 flex items-center justify-between">
                    <span className="text-indigo-900 font-bold">Port A (PA0–PA7)</span>
                    <span className="text-emerald-700 font-bold">0x{activeCode.toString(16).toUpperCase().padStart(2, '0')}H</span>
                  </div>
                  {/* Port C status (multiplexing digit enable) */}
                  <div className={`p-1 rounded border flex items-center justify-between ${
                    segCircuitMode === 'multiplexed' ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <span>Port C (PC0–PC3)</span>
                    <span>{segCircuitMode === 'multiplexed' ? `0x0${(1 << segMultiIndex).toString(16).toUpperCase()}H (D${segMultiIndex + 1})` : 'Digit En (1 Digit)'}</span>
                  </div>
                  <div className="p-1 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-slate-500 text-[9px]">
                    <span>Control Reg (86H)</span>
                    <span>CW: 80H (Mode 0)</span>
                  </div>
                </div>
                <div className="text-[9px] text-indigo-600 font-bold text-center border-t border-slate-100 pt-1 font-mono">
                  PA0=a ... PA6=g, PA7=dp
                </div>
              </div>

              {/* ARROW 3: Driver Lines */}
              <div className="flex flex-col items-center justify-center space-y-1 px-1">
                <span className="text-[9px] font-mono text-indigo-600 font-bold">PA0–PA7</span>
                <div className="w-7 h-0.5 bg-indigo-400 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 absolute -right-2 -top-1.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">8-Bit Data</span>
              </div>

              {/* BLOCK 4: Resistor Array (8 x 330Ω) */}
              <div className="w-48 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-800 font-mono text-xs">Resistor Array</span>
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-bold">8 × 330Ω</span>
                </div>
                <div className="space-y-1 font-mono text-[9px]">
                  <div className="grid grid-cols-4 gap-1 text-center">
                    {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'].map((seg, idx) => {
                      const bit = (activeCode >> idx) & 1;
                      const isSegActive = displayType === 'cathode' ? bit === 1 : bit === 0;
                      return (
                        <div
                          key={seg}
                          className={`p-0.5 rounded border text-[8.5px] transition-all ${
                            isSegActive ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <div>R_{seg}</div>
                          <div className="text-[7.5px]">{isSegActive ? '~10mA' : '0mA'}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-slate-500 text-[8.5px] pt-1 text-center font-mono">
                    VF ≈ 1.8V | VCC = +5V DC
                  </div>
                </div>
                <div className="text-[9px] text-amber-800 border-t border-slate-100 pt-1 text-center font-bold">
                  Limits Current to Safe 10mA
                </div>
              </div>

              {/* ARROW 4: Segment Anodes/Cathodes */}
              <div className="flex flex-col items-center justify-center space-y-1 px-1">
                <span className="text-[9px] font-mono text-amber-600 font-bold">Segments</span>
                <div className="w-7 h-0.5 bg-amber-400 relative">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 absolute -right-2 -top-1.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">a–g, dp</span>
              </div>

              {/* BLOCK 5: 7-Segment Display Unit */}
              <div className="w-52 bg-white border-2 border-emerald-300 rounded-xl p-3 shadow-xs flex flex-col justify-between items-center text-center space-y-2">
                <div className="w-full flex items-center justify-between border-b border-emerald-100 pb-1.5">
                  <span className="font-extrabold text-emerald-800 font-mono text-xs">7-Segment Unit</span>
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold">
                    {displayType === 'cathode' ? 'CC (GND)' : 'CA (+5V)'}
                  </span>
                </div>
                
                {/* Physical LED Display Visual (SVG Segment Rendering) */}
                {segCircuitMode === 'single' ? (
                  <div className="flex flex-col items-center space-y-1.5 py-1">
                    <div className="relative p-2 bg-slate-100 rounded-xl border border-slate-300 shadow-sm">
                      <svg viewBox="0 0 100 160" width="70" height="110" className="select-none">
                        {/* Background */}
                        <rect x="2" y="2" width="96" height="156" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                        {/* Segment a */}
                        <polygon 
                          points="22,18 78,18 70,26 30,26" 
                          fill={(((activeCode >> 0) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                          style={{ filter: (((activeCode >> 0) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 4px #ef4444)' : 'none' }}
                        />
                        {/* Segment b */}
                        <polygon 
                          points="80,20 88,28 84,74 76,68" 
                          fill={(((activeCode >> 1) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                          style={{ filter: (((activeCode >> 1) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 4px #ef4444)' : 'none' }}
                        />
                        {/* Segment c */}
                        <polygon 
                          points="76,86 84,80 80,126 72,134" 
                          fill={(((activeCode >> 2) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                          style={{ filter: (((activeCode >> 2) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 4px #ef4444)' : 'none' }}
                        />
                        {/* Segment d */}
                        <polygon 
                          points="30,128 70,128 78,136 22,136" 
                          fill={(((activeCode >> 3) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                          style={{ filter: (((activeCode >> 3) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 4px #ef4444)' : 'none' }}
                        />
                        {/* Segment e */}
                        <polygon 
                          points="24,86 16,80 20,126 28,134" 
                          fill={(((activeCode >> 4) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                          style={{ filter: (((activeCode >> 4) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 4px #ef4444)' : 'none' }}
                        />
                        {/* Segment f */}
                        <polygon 
                          points="20,20 28,28 24,74 16,68" 
                          fill={(((activeCode >> 5) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                          style={{ filter: (((activeCode >> 5) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 4px #ef4444)' : 'none' }}
                        />
                        {/* Segment g */}
                        <polygon 
                          points="24,77 76,77 80,80 76,83 24,83 20,80" 
                          fill={(((activeCode >> 6) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                          style={{ filter: (((activeCode >> 6) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 4px #ef4444)' : 'none' }}
                        />
                        {/* Segment dp */}
                        <circle 
                          cx="88" cy="134" r="4.5" 
                          fill={(((activeCode >> 7) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                          style={{ filter: (((activeCode >> 7) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 4px #ef4444)' : 'none' }}
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] font-mono text-slate-700 font-bold">
                      Displaying Digit '{digitHex}'
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-1 py-1">
                    {/* 4-Digit Array Visual */}
                    <div className="grid grid-cols-4 gap-1 p-1.5 bg-slate-100 rounded-xl border border-slate-300 shadow-sm">
                      {segMultiDigits.map((d, dIdx) => {
                        const isDigitActive = segMultiIndex === dIdx;
                        const dRawCode = segmentCodesCathode[d] || 0x3F;
                        const dActiveCode = displayType === 'cathode' ? dRawCode : ((~dRawCode) & 0xFF);
                        return (
                          <div key={dIdx} className={`p-1 rounded flex flex-col items-center ${isDigitActive ? 'bg-white ring-2 ring-emerald-500 shadow-xs' : 'opacity-40'}`}>
                            <span className="text-[8px] font-mono text-emerald-700 font-bold mb-0.5">D{dIdx + 1}</span>
                            <svg viewBox="0 0 100 160" width="28" height="44">
                              <rect x="2" y="2" width="96" height="156" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                              <polygon points="22,18 78,18 70,26 30,26" fill={isDigitActive && (((dActiveCode >> 0) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} />
                              <polygon points="80,20 88,28 84,74 76,68" fill={isDigitActive && (((dActiveCode >> 1) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} />
                              <polygon points="76,86 84,80 80,126 72,134" fill={isDigitActive && (((dActiveCode >> 2) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} />
                              <polygon points="30,128 70,128 78,136 22,136" fill={isDigitActive && (((dActiveCode >> 3) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} />
                              <polygon points="24,86 16,80 20,126 28,134" fill={isDigitActive && (((dActiveCode >> 4) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} />
                              <polygon points="20,20 28,28 24,74 16,68" fill={isDigitActive && (((dActiveCode >> 5) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} />
                              <polygon points="24,77 76,77 80,80 76,83 24,83 20,80" fill={isDigitActive && (((dActiveCode >> 6) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} />
                              <circle cx="88" cy="134" r="4.5" fill={isDigitActive && (((dActiveCode >> 7) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} />
                            </svg>
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-[9px] font-mono text-emerald-700 font-bold">
                      Active: Digit {segMultiIndex + 1} (PC{segMultiIndex}=HIGH)
                    </span>
                  </div>
                )}

                <div className="text-[9px] text-slate-500 font-sans">
                  Common Pin: {displayType === 'cathode' ? 'Cathodes tied to 0V (GND)' : 'Anodes tied to +5V (VCC)'}
                </div>
              </div>

            </div>
          </div>

          {/* 5 Comprehensive Hardware Interfacing Circuit Stage Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-[11px]">
            {/* Block 1 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs border-b border-slate-200 pb-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>1. 8086 CPU</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[10.5px]">
                Operates in <strong>Minimum Mode</strong> (+5V single phase clock). Translates numeric values using lookup tables via <code className="font-mono text-indigo-600 bg-white px-1 rounded">XLAT</code> or pointer indexing, and issues <code className="font-mono text-indigo-600 bg-white px-1 rounded">OUT 80H, AL</code> to transmit display patterns.
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-white p-1 rounded border border-slate-100">
                Pins: AD0-AD15, ALE, M/IO#, WR#
              </div>
            </div>

            {/* Block 2 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs border-b border-slate-200 pb-1">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>2. Demux & Decoder</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[10.5px]">
                <strong>74LS373</strong> transparent latch captures lower 16-bit address on falling edge of <code className="font-mono text-emerald-600 bg-white px-1 rounded">ALE</code>. <strong>74LS138</strong> decodes lines A2–A7 with M/IO#=LOW to generate active-low chip select <code className="font-mono text-emerald-700 bg-white px-1 rounded">CS# = 80H</code>.
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-white p-1 rounded border border-slate-100">
                Port A = 80H (A1=0, A0=0)
              </div>
            </div>

            {/* Block 3 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-xs border-b border-slate-200 pb-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>3. Intel 8255 PPI</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[10.5px]">
                Configured in <strong>Mode 0 (Basic I/O)</strong> by writing Control Word <code className="font-mono text-indigo-700 bg-white px-1 rounded">80H</code> to port 86H. <strong>Port A</strong> transmits 8-bit segment drive codes (PA0=a .. PA7=dp), while <strong>Port C</strong> switches digit enable lines for multiplexed scanning.
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-white p-1 rounded border border-slate-100">
                Mode 0 Output: Ports A, B & C
              </div>
            </div>

            {/* Block 4 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs border-b border-slate-200 pb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>4. 330Ω Resistor Array</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[10.5px]">
                Protects LED segments and 8255 port output drivers from burning out due to overcurrent:
                <br />
                <span className="font-mono text-amber-900 font-bold bg-amber-50 px-1 py-0.5 rounded text-[9.5px]">
                  R = (5.0V - 1.8V) / 10mA = 320Ω → 330Ω
                </span>
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-white p-1 rounded border border-slate-100">
                8 × 330Ω in series with PA0-PA7
              </div>
            </div>

            {/* Block 5 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs border-b border-slate-200 pb-1">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                <span>5. 7-Segment Display</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[10.5px]">
                <strong>Common Cathode (CC):</strong> All cathodes grounded (0V); segment illuminates on logic HIGH (+5V).
                <br />
                <strong>Common Anode (CA):</strong> All anodes tied to +5V; segment illuminates on logic LOW (0V).
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-white p-1 rounded border border-slate-100">
                Multi-Digit: BC547/BC557 drivers
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: 7-SEGMENT DISPLAY SIMULATOR & SEGMENT DECODER */}
      {activeTab === 'display' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Control & Configuration Panel (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 shadow-2xs">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">
                  Hardware Configuration &amp; Polarity
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDisplayType('cathode')}
                    className={`flex-1 py-2 rounded-lg border font-semibold cursor-pointer transition-all ${
                      displayType === 'cathode' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Common Cathode (Active HIGH: 1 = ON)
                  </button>
                  <button
                    onClick={() => setDisplayType('anode')}
                    className={`flex-1 py-2 rounded-lg border font-semibold cursor-pointer transition-all ${
                      displayType === 'anode' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Common Anode (Active LOW: 0 = ON)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">
                  Select Character to Display (0–F Hexadecimal)
                </label>
                <div className="grid grid-cols-8 gap-1.5">
                  {['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'].map((ch) => {
                    const isSelected = digitHex === ch;
                    const chRawCode = segmentCodesCathode[ch] || 0;
                    const chActiveCode = displayType === 'cathode' ? chRawCode : ((~chRawCode) & 0xFF);
                    return (
                      <button
                        key={ch}
                        onClick={() => setDigitHex(ch)}
                        className={`py-1.5 px-1 rounded-lg border font-mono font-bold text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300'
                        }`}
                        title={`Digit ${ch} -> 0x${chActiveCode.toString(16).toUpperCase().padStart(2, '0')}H`}
                      >
                        <div className="text-xs">{ch}</div>
                        <div className="text-[8px] opacity-80">{chActiveCode.toString(16).toUpperCase().padStart(2, '0')}H</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs flex flex-wrap justify-between items-center gap-2 shadow-2xs">
                <span className="text-slate-600 font-sans">8255 Output Data Code (Port A):</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-extrabold text-sm">
                    0x{activeCode.toString(16).toUpperCase().padStart(2, '0')}H
                  </span>
                  <span className="text-slate-400 text-xs">
                    ({activeCode.toString(2).padStart(8, '0')}b)
                  </span>
                </div>
              </div>

              {/* Segment bit breakdown */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 font-mono text-[10px] shadow-2xs">
                <span className="text-slate-500 block text-[9px] uppercase font-bold font-sans">
                  8255 Port A Pin-by-Pin Logic State (D7=dp ... D0=a):
                </span>
                <div className="grid grid-cols-8 gap-1.5 text-center font-bold">
                  {[
                    { seg: 'dp', pin: 'PA7', bit: (activeCode >> 7) & 1 },
                    { seg: 'g',  pin: 'PA6', bit: (activeCode >> 6) & 1 },
                    { seg: 'f',  pin: 'PA5', bit: (activeCode >> 5) & 1 },
                    { seg: 'e',  pin: 'PA4', bit: (activeCode >> 4) & 1 },
                    { seg: 'd',  pin: 'PA3', bit: (activeCode >> 3) & 1 },
                    { seg: 'c',  pin: 'PA2', bit: (activeCode >> 2) & 1 },
                    { seg: 'b',  pin: 'PA1', bit: (activeCode >> 1) & 1 },
                    { seg: 'a',  pin: 'PA0', bit: (activeCode >> 0) & 1 },
                  ].map(({ seg, pin, bit }) => {
                    const isIlluminated = displayType === 'cathode' ? bit === 1 : bit === 0;
                    return (
                      <div 
                        key={seg} 
                        className={`py-1.5 px-1 rounded-lg border transition-all ${
                          isIlluminated 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="text-[11px]">{seg}</div>
                        <div className="text-[8px] opacity-90">{pin}</div>
                        <div className="text-[9px] font-extrabold mt-0.5">{bit}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Visual 7-Segment Renderer Canvas (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-between space-y-3 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Live 7-Segment LED Display Matrix
              </span>

              {/* High-Fidelity SVG Segment Renderer */}
              <div className="relative p-5 bg-slate-100 rounded-2xl border-4 border-slate-300 shadow-sm flex items-center justify-center">
                <svg viewBox="0 0 100 160" width="110" height="176" className="select-none">
                  {/* Bezel Frame */}
                  <rect x="2" y="2" width="96" height="156" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                  
                  {/* Segment a (Top) */}
                  <polygon 
                    points="22,18 78,18 70,26 30,26" 
                    fill={(((activeCode >> 0) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                    stroke={(((activeCode >> 0) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#f87171' : '#cbd5e1'}
                    strokeWidth="0.5"
                    style={{ filter: (((activeCode >> 0) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 6px rgba(239,68,68,0.9))' : 'none' }}
                  />
                  {/* Segment b (Top-Right) */}
                  <polygon 
                    points="80,20 88,28 84,74 76,68" 
                    fill={(((activeCode >> 1) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                    stroke={(((activeCode >> 1) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#f87171' : '#cbd5e1'}
                    strokeWidth="0.5"
                    style={{ filter: (((activeCode >> 1) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 6px rgba(239,68,68,0.9))' : 'none' }}
                  />
                  {/* Segment c (Bottom-Right) */}
                  <polygon 
                    points="76,86 84,80 80,126 72,134" 
                    fill={(((activeCode >> 2) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                    stroke={(((activeCode >> 2) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#f87171' : '#cbd5e1'}
                    strokeWidth="0.5"
                    style={{ filter: (((activeCode >> 2) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 6px rgba(239,68,68,0.9))' : 'none' }}
                  />
                  {/* Segment d (Bottom) */}
                  <polygon 
                    points="30,128 70,128 78,136 22,136" 
                    fill={(((activeCode >> 3) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                    stroke={(((activeCode >> 3) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#f87171' : '#cbd5e1'}
                    strokeWidth="0.5"
                    style={{ filter: (((activeCode >> 3) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 6px rgba(239,68,68,0.9))' : 'none' }}
                  />
                  {/* Segment e (Bottom-Left) */}
                  <polygon 
                    points="24,86 16,80 20,126 28,134" 
                    fill={(((activeCode >> 4) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                    stroke={(((activeCode >> 4) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#f87171' : '#cbd5e1'}
                    strokeWidth="0.5"
                    style={{ filter: (((activeCode >> 4) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 6px rgba(239,68,68,0.9))' : 'none' }}
                  />
                  {/* Segment f (Top-Left) */}
                  <polygon 
                    points="20,20 28,28 24,74 16,68" 
                    fill={(((activeCode >> 5) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                    stroke={(((activeCode >> 5) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#f87171' : '#cbd5e1'}
                    strokeWidth="0.5"
                    style={{ filter: (((activeCode >> 5) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 6px rgba(239,68,68,0.9))' : 'none' }}
                  />
                  {/* Segment g (Middle) */}
                  <polygon 
                    points="24,77 76,77 80,80 76,83 24,83 20,80" 
                    fill={(((activeCode >> 6) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                    stroke={(((activeCode >> 6) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#f87171' : '#cbd5e1'}
                    strokeWidth="0.5"
                    style={{ filter: (((activeCode >> 6) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 6px rgba(239,68,68,0.9))' : 'none' }}
                  />
                  {/* Segment dp (Decimal Point) */}
                  <circle 
                    cx="88" cy="134" r="4.5" 
                    fill={(((activeCode >> 7) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#ef4444' : '#e2e8f0'} 
                    stroke={(((activeCode >> 7) & 1) === (displayType === 'cathode' ? 1 : 0)) ? '#f87171' : '#cbd5e1'}
                    strokeWidth="0.5"
                    style={{ filter: (((activeCode >> 7) & 1) === (displayType === 'cathode' ? 1 : 0)) ? 'drop-shadow(0 0 6px rgba(239,68,68,0.9))' : 'none' }}
                  />
                </svg>
              </div>

              <div className="text-center space-y-0.5">
                <div className="text-xs font-mono font-bold text-slate-800">
                  Active Glyph: <span className="text-indigo-600 text-sm">'{digitHex}'</span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  Port A: PA0=a, PA1=b, PA2=c, PA3=d, PA4=e, PA5=f, PA6=g, PA7=dp
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: 7-SEGMENT DISPLAY ASSEMBLY LANGUAGE PROGRAM (ALP) */}
      {activeTab === 'display-code' && (
        <div className="space-y-4">
          {/* Dynamic ALP Configuration Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
              
              {/* Select 8255 Port */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Target 8255 Port:
                </label>
                <select
                  value={segAlpPort}
                  onChange={(e) => setSegAlpPort(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold font-mono text-slate-800 focus:outline-hidden focus:border-indigo-500 shadow-2xs cursor-pointer"
                >
                  <option value="portA">Port A ({portAAddr}) — Segment Out</option>
                  <option value="portB">Port B ({portBAddr}) — Segment Out</option>
                  <option value="portC">Port C ({portCAddr}) — Segment Out</option>
                </select>
              </div>

              {/* Select Display Type */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Display Type:
                </label>
                <select
                  value={segAlpType}
                  onChange={(e) => setSegAlpType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold font-mono text-slate-800 focus:outline-hidden focus:border-indigo-500 shadow-2xs cursor-pointer"
                >
                  <option value="cathode">Common Cathode (Active HIGH: 1=ON)</option>
                  <option value="anode">Common Anode (Active LOW: 0=ON)</option>
                </select>
              </div>

              {/* Select Program Routine */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Program Objective:
                </label>
                <select
                  value={segAlpMode}
                  onChange={(e) => setSegAlpMode(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold font-mono text-slate-800 focus:outline-hidden focus:border-indigo-500 shadow-2xs cursor-pointer"
                >
                  <option value="up_counter">0 to 9 BCD Cyclic Up-Counter</option>
                  <option value="down_counter">9 to 0 BCD Cyclic Down-Counter</option>
                  <option value="hex_counter">0 to F Hexadecimal Up-Counter</option>
                  <option value="xlat_lookup">Table Lookup via XLAT Instruction</option>
                  <option value="single_digit">Single Character Display Output</option>
                  <option value="multiplexed">4-Digit Multiplexed Display Scanner</option>
                </select>
              </div>

              {/* Select Delay Preset */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Viewing Delay Duration:
                </label>
                <select
                  value={segAlpDelay}
                  onChange={(e) => setSegAlpDelay(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold font-mono text-slate-800 focus:outline-hidden focus:border-indigo-500 shadow-2xs cursor-pointer"
                >
                  <option value="50ms">50 ms Fast Refresh</option>
                  <option value="100ms">100 ms Standard Refresh</option>
                  <option value="500ms">500 ms Human Perception Delay</option>
                  <option value="1s">1.0 Second Slow Step</option>
                </select>
              </div>

            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-2.5">
              <div className="text-[11px] text-slate-600 font-mono flex items-center gap-2">
                <span className="font-bold text-indigo-700">Output Port: {segPortAddress}</span>
                <span className="text-slate-300">|</span>
                <span>Control Reg: {controlRegAddr} (80H)</span>
                <span className="text-slate-300">|</span>
                <span>Lookup Mode: {segAlpType.toUpperCase()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySegAlp}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-[11px] transition-all cursor-pointer shadow-2xs ${
                    copiedSegAlp 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  {copiedSegAlp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSegAlp ? 'ALP Copied!' : 'Copy ALP'}</span>
                </button>

                <button
                  onClick={handleDownloadSevenSegAsm}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 text-[11px] transition-all cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ASM</span>
                </button>
              </div>
            </div>
          </div>

          {/* Commented Assembly Language Source Code Viewer */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 shadow-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="font-mono text-xs text-slate-300 font-bold ml-2">
                  seven_segment_8086_{segAlpPort}_{segAlpType}_{segAlpMode}.asm
                </span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 font-mono text-[10px] rounded font-bold">
                MASM / TASM 8086
              </span>
            </div>

            <pre className="font-mono text-[11.5px] leading-relaxed text-slate-100 overflow-x-auto p-2 scrollbar-thin scrollbar-thumb-slate-700">
              {generateSevenSegAssemblyCode()}
            </pre>
          </div>

          {/* Educational Algorithm & Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[10px]">
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                1. 8255 PPI Initialization
              </span>
              <p className="text-slate-600 leading-relaxed">
                Writing <code className="font-mono font-bold text-indigo-700 bg-slate-100 px-1 rounded">80H</code> to Control Port <code className="font-mono text-slate-800">{controlRegAddr}</code> initializes 8255 in Mode 0 (Basic I/O), setting <strong className="text-slate-900">{segAlpPort.toUpperCase()}</strong> and Port C as active Output ports.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                2. XLAT &amp; Lookup Table Logic
              </span>
              <p className="text-slate-600 leading-relaxed">
                The 8086 <code className="font-mono font-bold text-emerald-700 bg-slate-100 px-1 rounded">XLAT</code> instruction replaces the byte in <code className="font-mono text-slate-800">AL</code> with <code className="font-mono text-slate-800">DS:[BX + AL]</code> in a single instruction, enabling ultra-fast hardware conversion of BCD digits to 7-segment codes.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                3. Delay &amp; Multiplexing Timing
              </span>
              <p className="text-slate-600 leading-relaxed">
                Single-digit counters use ~{segAlpDelay} delays for human readability. In 4-digit multiplexed arrays, each digit is flashed sequentially for ~2.5 ms (100 Hz overall scan) to leverage persistence of vision without flicker.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: 4x4 MATRIX KEYPAD INTERFACING CIRCUIT ARCHITECTURE */}
      {activeTab === 'keypad-circuit' && (
        <div className="space-y-4">
          {/* Interactive Hardware Signal Control Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Key Selector */}
              <div>
                <label className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider mb-1">
                  Inject Pressed Key (4×4):
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={keypadCircuitKey}
                    onChange={(e) => {
                      setKeypadCircuitKey(e.target.value);
                      setPressedKey(e.target.value);
                    }}
                    className="bg-white border border-slate-300 text-indigo-950 font-mono text-xs px-2.5 py-1.5 rounded-lg focus:outline-hidden focus:border-indigo-500 font-bold cursor-pointer shadow-2xs"
                  >
                    {['1','2','3','A','4','5','6','B','7','8','9','C','*','0','#','D'].map((k) => {
                      let r = 0;
                      let c = 0;
                      for (let row = 0; row < 4; row++) {
                        for (let col = 0; col < 4; col++) {
                          if (keypadMatrix[row][col] === k) { r = row; c = col; }
                        }
                      }
                      return (
                        <option key={k} value={k} className="bg-white text-slate-800">
                          Key '{k}' (Row {r} [PA{r}], Col {c} [PB{c}])
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Scanning Mode Switcher */}
              <div>
                <label className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider mb-1">
                  8086 Scanning Mode:
                </label>
                <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
                  <button
                    onClick={() => setKeypadScanMode('auto')}
                    className={`px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-all ${
                      keypadScanMode === 'auto'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Auto Sequential Scan (R0→R3)
                  </button>
                  <button
                    onClick={() => setKeypadScanMode('ground_all')}
                    className={`px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-all ${
                      keypadScanMode === 'ground_all'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Ground All Rows (00H Detect)
                  </button>
                  <button
                    onClick={() => setKeypadScanMode('manual')}
                    className={`px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-all ${
                      keypadScanMode === 'manual'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Manual Row
                  </button>
                </div>
              </div>

              {/* Manual Row Selector if manual mode */}
              {keypadScanMode === 'manual' && (
                <div>
                  <label className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider mb-1">
                    Ground Row:
                  </label>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((r) => (
                      <button
                        key={r}
                        onClick={() => setKeypadManualRow(r)}
                        className={`px-2 py-1 rounded border text-[10px] font-mono font-bold cursor-pointer transition-all ${
                          keypadManualRow === r
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        R{r} (PA{r})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Debounce Filter Simulation */}
              <div>
                <label className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider mb-1">
                  Contact State:
                </label>
                <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
                  <button
                    onClick={() => setKeypadDebounceSim('stable')}
                    className={`px-2 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-all ${
                      keypadDebounceSim === 'stable'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Stable (&gt;20ms)
                  </button>
                  <button
                    onClick={() => setKeypadDebounceSim('bouncing')}
                    className={`px-2 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-all ${
                      keypadDebounceSim === 'bouncing'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bouncing Chatter (0–20ms)
                  </button>
                </div>
              </div>
            </div>

            {/* Animation Toggle & Telemetry */}
            <div className="flex items-center gap-2">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] shadow-2xs flex items-center gap-2">
                <span className="text-slate-500">Port A (Rows):</span>
                <span className="text-indigo-700 font-extrabold text-xs">
                  0x{keypadRowOutputByte.toString(16).toUpperCase().padStart(2, '0')}H
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">Port B (Cols):</span>
                <span className={`font-extrabold text-xs ${isColDetected ? 'text-emerald-700' : 'text-slate-700'}`}>
                  0x{keypadColInputByte.toString(16).toUpperCase().padStart(2, '0')}H
                </span>
              </div>
              <button
                onClick={() => setKeypadSignalsAnimating(!keypadSignalsAnimating)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs text-[11px] transition-all ${
                  keypadSignalsAnimating
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {keypadSignalsAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{keypadSignalsAnimating ? 'Signals Active' : 'Signals Paused'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Hardware Block Diagram Canvas (Clean Light SVG) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-x-auto shadow-inner">
            <div className="min-w-[920px] flex items-stretch justify-between gap-2.5 text-[11px]">
              
              {/* BLOCK 1: 8086 Microprocessor */}
              <div className="w-44 bg-white border-2 border-indigo-200 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-extrabold text-indigo-700 font-mono text-xs">8086 CPU</span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold">5 MHz</span>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">AD0–AD15</span>
                    <span className="text-indigo-600 font-bold">Mux Bus</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">ALE</span>
                    <span className="text-emerald-600 font-bold">Latch En</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">M/IO#, RD#, WR#</span>
                    <span className="text-amber-600 font-bold">I/O Bus</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-indigo-50/70 rounded">
                    <span className="text-indigo-900 font-bold">Out (Row Drive):</span>
                    <span className="text-indigo-700 font-bold">OUT 80H, AL</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-emerald-50/70 rounded">
                    <span className="text-emerald-900 font-bold">In (Col Read):</span>
                    <span className="text-emerald-700 font-bold">IN AL, 82H</span>
                  </div>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-100 text-[9px] text-slate-500">
                  Runs scan loop &amp; 20ms debounce timing
                </div>
              </div>

              {/* ARROW 1: Multiplexed Bus */}
              <div className="flex flex-col items-center justify-center px-1 text-slate-400">
                <div className="font-mono text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 mb-1">
                  ALE + AD0-7
                </div>
                <div className="h-0.5 w-6 bg-indigo-300 relative">
                  {keypadSignalsAnimating && (
                    <div className="absolute top-[-2px] left-0 w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" />
                  )}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500 mt-0.5" />
              </div>

              {/* BLOCK 2: 74LS373 Latch & 74LS138 Address Decoder */}
              <div className="w-48 bg-white border-2 border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-extrabold text-slate-800 font-mono text-xs">74LS373 / 138</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">Demux / CS#</span>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">A2–A7 (Base)</span>
                    <span className="text-slate-900 font-bold">80H Match</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-emerald-50 rounded">
                    <span className="text-emerald-900 font-bold">CS# (Chip Sel)</span>
                    <span className="text-emerald-600 font-bold">0 (LOW)</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">A1, A0 (Port A/B)</span>
                    <span className="text-indigo-600 font-bold">80H / 82H</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 px-1 bg-slate-50 rounded">
                    <span className="text-slate-600">Control Reg</span>
                    <span className="text-purple-600 font-bold">86H (CW=82H)</span>
                  </div>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-100 text-[9px] text-slate-500">
                  Maps 8255 I/O port address space
                </div>
              </div>

              {/* ARROW 2: Control & Address lines */}
              <div className="flex flex-col items-center justify-center px-1 text-slate-400">
                <div className="font-mono text-[9px] text-slate-600 font-bold bg-slate-100 px-1 py-0.5 rounded border border-slate-200 mb-1">
                  CS#, A0, A1
                </div>
                <div className="h-0.5 w-6 bg-slate-300 relative">
                  {keypadSignalsAnimating && (
                    <div className="absolute top-[-2px] left-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  )}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
              </div>

              {/* BLOCK 3: Intel 8255 PPI */}
              <div className="w-52 bg-white border-2 border-indigo-300 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-extrabold text-indigo-900 font-mono text-xs">8255 PPI</span>
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-bold">Mode 0 (CW=82H)</span>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="p-1 bg-indigo-50/70 rounded border border-indigo-100 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-900 font-bold">Port A (80H) - OUT:</span>
                      <span className="font-bold text-indigo-700 font-mono">0x{keypadRowOutputByte.toString(16).toUpperCase().padStart(2, '0')}H</span>
                    </div>
                    <div className="grid grid-cols-4 gap-0.5 text-center text-[9px] pt-0.5">
                      {[0, 1, 2, 3].map((r) => {
                        const isGrounded = activeDrivingRow === -1 || activeDrivingRow === r;
                        return (
                          <div 
                            key={r}
                            className={`py-0.5 rounded ${
                              isGrounded 
                                ? 'bg-emerald-600 text-white font-bold' 
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            PA{r}:{isGrounded ? '0' : '1'}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-1 bg-emerald-50/70 rounded border border-emerald-100 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-900 font-bold">Port B (82H) - IN:</span>
                      <span className="font-bold text-emerald-700 font-mono">0x{keypadColInputByte.toString(16).toUpperCase().padStart(2, '0')}H</span>
                    </div>
                    <div className="grid grid-cols-4 gap-0.5 text-center text-[9px] pt-0.5">
                      {[0, 1, 2, 3].map((c) => {
                        const isColZero = isColDetected && targetCol === c;
                        return (
                          <div 
                            key={c}
                            className={`py-0.5 rounded ${
                              isColZero 
                                ? 'bg-emerald-600 text-white font-bold' 
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            PB{c}:{isColZero ? '0' : '1'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-100 text-[9px] text-slate-500">
                  PA0–PA3 drives Rows; PB0–PB3 reads Columns
                </div>
              </div>

              {/* ARROW 3: Bidirectional Interconnect Bus */}
              <div className="flex flex-col items-center justify-center px-1 text-slate-400">
                <div className="font-mono text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 mb-1">
                  Rows (Out) ➔
                </div>
                <div className="h-0.5 w-6 bg-indigo-400 relative">
                  {keypadSignalsAnimating && (
                    <div className="absolute top-[-2px] left-0 w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" />
                  )}
                </div>
                <div className="font-mono text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100 mt-1">
                  ⇠ Cols (In)
                </div>
              </div>

              {/* BLOCK 4: Pull-Up Resistor Network (4 x 10kΩ) */}
              <div className="w-44 bg-white border-2 border-amber-200 rounded-xl p-3 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-extrabold text-amber-900 font-mono text-xs">4 × 10kΩ Pull-Ups</span>
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-bold">+5V VCC</span>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  {[0, 1, 2, 3].map((c) => {
                    const isColZero = isColDetected && targetCol === c;
                    return (
                      <div 
                        key={c}
                        className={`flex justify-between items-center py-0.5 px-1 rounded ${
                          isColZero ? 'bg-emerald-50 text-emerald-900 font-bold' : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>R_pull{c} (PB{c})</span>
                        <span>{isColZero ? '0.0V (GND)' : '+5.0V (VCC)'}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-100 text-[9px] text-slate-500">
                  Holds column lines HIGH until pulled LOW by switch
                </div>
              </div>

              {/* ARROW 4: Matrix Cross Interconnect */}
              <div className="flex flex-col items-center justify-center px-1 text-slate-400">
                <div className="font-mono text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100 mb-1">
                  Sense Lines
                </div>
                <div className="h-0.5 w-6 bg-emerald-400 relative">
                  {keypadSignalsAnimating && (
                    <div className="absolute top-[-2px] right-0 w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping" />
                  )}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
              </div>

              {/* BLOCK 5: 4x4 Matrix Keypad Physical Switch Grid */}
              <div className="w-56 bg-white text-slate-900 rounded-xl p-3 shadow-sm flex flex-col justify-between space-y-2 border-2 border-indigo-300">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-extrabold text-indigo-900 font-mono text-xs">4×4 Keypad Grid</span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[9px] font-bold">
                    Key: '{keypadCircuitKey}'
                  </span>
                </div>

                {/* 4x4 Tactile Switch Grid representation */}
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  {keypadMatrix.map((row, rIdx) =>
                    row.map((k, cIdx) => {
                      const isTarget = keypadCircuitKey === k;
                      const isRowGrounded = activeDrivingRow === -1 || activeDrivingRow === rIdx;
                      const isContactClosedAndActive = isTarget && isRowGrounded;
                      
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            setKeypadCircuitKey(k);
                            setPressedKey(k);
                          }}
                          className={`h-8 rounded-md font-mono text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center border relative ${
                            isContactClosedAndActive
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-500/30 scale-105 font-extrabold'
                              : isTarget
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                              : isRowGrounded
                              ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                              : 'bg-slate-200/80 text-slate-400 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span>{k}</span>
                          {isTarget && (
                            <span className="text-[7px] leading-none text-white font-sans font-bold">
                              {isContactClosedAndActive ? 'CLOSED' : 'DOWN'}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Live Matrix Coordinate & Detection Status */}
                <div className="p-1.5 bg-slate-800/90 rounded border border-slate-700 text-[9px] flex justify-between items-center font-mono">
                  <span className="text-slate-300">Target (R{targetRow}, C{targetCol})</span>
                  <span className={`font-bold ${isColDetected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isColDetected ? '✓ SENSE MATCH' : 'SCANNING...'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* 5 Hardware Interfacing Circuit Stage Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-[10px]">
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="p-1 bg-indigo-50 text-indigo-600 rounded">
                  <Cpu className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-900">1. 8086 CPU Engine</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Operates in Minimum Mode with multiplexed <code className="font-mono text-indigo-600">AD0–AD15</code>. Emits row grounding bytes via <code className="font-mono text-indigo-600">OUT 80H, AL</code> and samples return column nibble with <code className="font-mono text-emerald-600">IN AL, 82H</code>.
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-slate-50 p-1 rounded">
                • 20ms Software Debounce<br />
                • Clock: 5 MHz (T-states)
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="p-1 bg-slate-100 text-slate-700 rounded">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-900">2. Demux &amp; Decoder</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                <strong className="text-slate-800">74LS373</strong> latches lower address on <code className="font-mono text-indigo-600">ALE</code> falling edge. <strong className="text-slate-800">74LS138</strong> decodes <code className="font-mono text-indigo-600">A2–A7</code> with <code className="font-mono text-indigo-600">M/IO#=0</code> to assert active-LOW <code className="font-mono text-emerald-600">CS#</code> at base <strong className="text-slate-800">80H</strong>.
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-slate-50 p-1 rounded">
                • Port A: 80H | Port B: 82H<br />
                • Control Register: 86H
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="p-1 bg-indigo-100 text-indigo-700 rounded">
                  <Sliders className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-900">3. Intel 8255 PPI</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Configured with Control Word <code className="font-mono font-bold text-indigo-700 bg-slate-100 px-1 rounded">82H</code> (Mode 0: Port A = Output for Rows, Port B = Input for Columns). Port A pins <code className="font-mono text-indigo-600">PA0–PA3</code> sink current to ground rows sequentially.
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-slate-50 p-1 rounded">
                • Mode 0 (Basic I/O)<br />
                • CW = 82H (10000010b)
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="p-1 bg-amber-50 text-amber-700 rounded">
                  <Zap className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-900">4. 10kΩ Pull-Ups</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Four <strong className="text-slate-800">10kΩ pull-up resistors</strong> tie <code className="font-mono text-indigo-600">PB0–PB3</code> to +5V VCC. When keys are open, columns float HIGH (<code className="font-mono text-slate-700">0FH</code>). When key is pressed and row grounded, column drops to <strong className="text-emerald-700">0.0V</strong>.
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-slate-50 p-1 rounded">
                • I_sink = 5V / 10kΩ = 0.5mA<br />
                • Logic 1 = 5V, Logic 0 = 0V
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="p-1 bg-emerald-50 text-emerald-700 rounded">
                  <Grid className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-900">5. 4×4 Matrix Grid</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Arranges 16 SPST momentary tactile switches at row/col cross-points, requiring only 8 I/O pins instead of 16 dedicated lines. Pressing $(R_i, C_j)$ creates an electrical short between row $i$ and column $j$.
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-slate-50 p-1 rounded">
                • 16 Keys: 0–9, A–D, *, #<br />
                • Two-Key Lockout Protection
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: 4x4 MATRIX KEYPAD SIMULATOR & STEP-BY-STEP SCANNER */}
      {activeTab === 'keypad' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Interactive 4x4 Keypad Visual Controller (Left Column) */}
            <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                  <span className="text-[11px] text-slate-900 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Grid className="w-4 h-4 text-indigo-600" />
                    4x4 Matrix Keypad Panel
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-mono font-bold">
                    Target Key: '{pressedKey}'
                  </span>
                </div>

                {/* Tactile Key Matrix Grid */}
                <div className="grid grid-cols-4 gap-2.5 p-2 bg-white rounded-xl border border-slate-200 shadow-inner">
                  {keypadMatrix.map((row, rIdx) => 
                    row.map((k) => {
                      const isSelected = pressedKey === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleKeyPress(k, rIdx)}
                          className={`py-3.5 rounded-xl font-mono text-base font-bold cursor-pointer transition-all border shadow-xs ${
                            isSelected 
                              ? 'bg-indigo-600 text-white border-indigo-700 scale-105 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-300' 
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {k}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Active Key Information Badge */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-sans">Active Key Pressed:</span>
                  <strong className="text-indigo-700 font-extrabold text-base bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    '{pressedKey}'
                  </strong>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Coordinates: Row {targetRow} (PA{targetRow}), Col {targetCol} (PB{targetCol})</span>
                  <span className="text-emerald-600 font-bold">Index: {targetRow * 4 + targetCol}</span>
                </div>
              </div>
            </div>

            {/* 6-Stage Algorithm & Signal Inspector (Right Column) */}
            <div className="lg:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider block border-b border-slate-200 pb-2">
                  8086 Matrix Scanning &amp; Debounce Sequence Pipeline
                </span>

                {/* 6 Sequential Steps Pipeline Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans text-[10px] pt-2">
                  <div className={`p-2.5 rounded-lg border transition-all ${activeDrivingRow === -1 ? 'bg-indigo-50 border-indigo-300 shadow-2xs' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-indigo-900 block mb-0.5">1. Ground All Rows (00H)</span>
                    <p className="text-slate-600">
                      <code className="font-mono text-indigo-700">OUT 80H, 00H</code> pulls all 4 rows LOW. CPU checks if <code className="font-mono text-slate-800">IN AL, 82H &amp; 0FH != 0FH</code>.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-white border-slate-200">
                    <span className="font-bold text-indigo-900 block mb-0.5">2. 20ms Debounce Delay</span>
                    <p className="text-slate-600">
                      Software loop waits ~20ms to allow mechanical switch spring bounce (10–20ms) to settle before re-reading.
                    </p>
                  </div>

                  <div className={`p-2.5 rounded-lg border transition-all ${activeDrivingRow !== -1 ? 'bg-indigo-50 border-indigo-300 shadow-2xs' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-indigo-900 block mb-0.5">3. Sequential Row Scan</span>
                    <p className="text-slate-600">
                      Grounds Row 0 (<code className="font-mono">0FEH</code>), Row 1 (<code className="font-mono">0FDH</code>), Row 2 (<code className="font-mono">0FBH</code>), Row 3 (<code className="font-mono">0F7H</code>) one by one.
                    </p>
                  </div>

                  <div className={`p-2.5 rounded-lg border transition-all ${isColDetected ? 'bg-emerald-50 border-emerald-300 shadow-2xs' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-emerald-900 block mb-0.5">4. Column Sense &amp; Bit Rotate</span>
                    <p className="text-slate-600">
                      Reads Port B into <code className="font-mono text-slate-800">AL</code> and uses <code className="font-mono text-indigo-700">ROR AL, 1</code> to identify which column bit is 0.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-white border-slate-200">
                    <span className="font-bold text-indigo-900 block mb-0.5">5. Table Lookup / Translation</span>
                    <p className="text-slate-600">
                      Key code = Row Offset + Col Index. Translated into ASCII char via <code className="font-mono text-indigo-700">KEY_MAP[SI]</code> or <code className="font-mono text-indigo-700">XLAT</code>.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-white border-slate-200">
                    <span className="font-bold text-indigo-900 block mb-0.5">6. Two-Key Lockout Release</span>
                    <p className="text-slate-600">
                      CPU continuously polls until Port B returns to <code className="font-mono text-slate-800">0FH</code> (all keys released) before accepting next keystroke.
                    </p>
                  </div>
                </div>
              </div>

              {/* Real-Time Bit Registers Monitor */}
              <div className="space-y-2 font-mono text-[10px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[9px]">
                    <span>Port A (Rows OUT - Active LOW Scan):</span>
                    <span className="text-indigo-600 font-mono">0x{keypadRowOutputByte.toString(16).toUpperCase().padStart(2, '0')}H</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center font-bold">
                    {['R0 (PA0)', 'R1 (PA1)', 'R2 (PA2)', 'R3 (PA3)'].map((r, idx) => {
                      const isGrounded = activeDrivingRow === -1 || activeDrivingRow === idx;
                      return (
                        <div 
                          key={r} 
                          className={`py-1.5 rounded-md border ${
                            isGrounded 
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs' 
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          {r}: {isGrounded ? '0 (LOW)' : '1 (HIGH)'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[9px]">
                    <span>Port B (Columns IN - 10kΩ Pull-Up Sensed):</span>
                    <span className="text-emerald-600 font-mono">0x{keypadColInputByte.toString(16).toUpperCase().padStart(2, '0')}H</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center font-bold">
                    {['C0 (PB0)', 'C1 (PB1)', 'C2 (PB2)', 'C3 (PB3)'].map((c, idx) => {
                      const isColZero = isColDetected && targetCol === idx;
                      return (
                        <div 
                          key={c} 
                          className={`py-1.5 rounded-md border ${
                            isColZero 
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs' 
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {c}: {isColZero ? '0 (KEY DOWN)' : '1 (IDLE 5V)'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: 4x4 MATRIX KEYPAD ASSEMBLY LANGUAGE PROGRAM (ALP) */}
      {activeTab === 'keypad-code' && (
        <div className="space-y-4">
          {/* Keypad ALP Dynamic Parameter Configurator Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                8086 Keypad Interfacing Parameter Configurator
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Base Address: {baseAddressHex}H | Control Reg: {controlRegAddr}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* 1. Row Output Port */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  1. Row Drive Port (OUT)
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'portA', label: 'Port A (80H)' },
                    { id: 'portC_lower', label: 'Port C Low (84H)' }
                  ].map((p) => {
                    const isSelected = keypadAlpPortOut === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setKeypadAlpPortOut(p.id as any)}
                        className={`p-1.5 rounded-lg text-center border transition-all text-[10px] cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Column Sense Port */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  2. Column Sense Port (IN)
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'portB', label: 'Port B (82H)' },
                    { id: 'portC_upper', label: 'Port C High (84H)' }
                  ].map((p) => {
                    const isSelected = keypadAlpPortIn === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setKeypadAlpPortIn(p.id as any)}
                        className={`p-1.5 rounded-lg text-center border transition-all text-[10px] cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Program Scanning Mode */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  3. Keypad Program Mode
                </label>
                <select
                  value={keypadAlpMode}
                  onChange={(e) => setKeypadAlpMode(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-[10px] font-bold px-2 py-1.5 rounded-lg cursor-pointer"
                >
                  <option value="standard_scan">Standard 4x4 Scan + Debounce</option>
                  <option value="with_7seg">Keypad + 7-Segment Output (Port C)</option>
                  <option value="xlat_lookup">XLAT Table Translation Mode</option>
                  <option value="key_counter">Continuous Polling Loop</option>
                </select>
              </div>

              {/* 4. Debounce Delay Routine */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  4. Debounce Delay Loop
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: '10ms', label: '10ms' },
                    { id: '20ms', label: '20ms' },
                    { id: '50ms', label: '50ms' }
                  ].map((d) => {
                    const isSelected = keypadAlpDebounce === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setKeypadAlpDebounce(d.id as any)}
                        className={`p-1.5 rounded-lg text-center border transition-all text-[10px] cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Keypad Assembly Language Code View */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-2.5 shadow-xs">
            <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <Code className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="font-bold text-indigo-950 uppercase text-xs block">
                    Generated 8086 Assembly Program (ALP)
                  </span>
                  <span className="text-slate-500 text-[10px] font-sans">
                    Target: Rows={keypadAlpPortOut === 'portA' ? 'Port A (80H)' : 'Port C Low (84H)'}, Cols={keypadAlpPortIn === 'portB' ? 'Port B (82H)' : 'Port C High (84H)'} | Debounce={keypadAlpDebounce}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Copy & Download */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyKeypadAlp}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    copiedKeypadAlp
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                  }`}
                >
                  {copiedKeypadAlp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKeypadAlp ? 'Copied Code!' : 'Copy ALP'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadKeypadAsm}
                  className="px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Download .ASM</span>
                </button>
              </div>
            </div>

            <pre className="text-slate-800 leading-relaxed overflow-x-auto whitespace-pre bg-white p-4 rounded-xl border border-slate-200/90 shadow-inner font-mono text-[11px] max-h-96 overflow-y-auto">
{generateKeypadAssemblyCode()}
            </pre>
          </div>

          {/* Educational Algorithm & Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[10px]">
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                1. 8255 PPI Initialization (CW = 82H)
              </span>
              <p className="text-slate-600 leading-relaxed">
                Writing <code className="font-mono font-bold text-indigo-700 bg-slate-100 px-1 rounded">82H</code> to Control Port <code className="font-mono text-slate-800">{controlRegAddr}</code> initializes 8255 in Mode 0 (Basic I/O), setting Port A as active Output (Rows) and Port B as active Input (Columns).
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                2. Sequential Row Grounding &amp; ROR Logic
              </span>
              <p className="text-slate-600 leading-relaxed">
                Rows are driven LOW one at a time (<code className="font-mono">0FEH</code>, <code className="font-mono">0FDH</code>, <code className="font-mono">0FBH</code>, <code className="font-mono">0F7H</code>). Upon finding a LOW column, the program uses <code className="font-mono font-bold text-emerald-700 bg-slate-100 px-1 rounded">ROR AL, 1</code> and tests the Carry Flag to pinpoint the exact column index.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                3. Contact Debounce &amp; Two-Key Lockout
              </span>
              <p className="text-slate-600 leading-relaxed">
                Mechanical contacts chatter for 10–20 ms upon impact. The <code className="font-mono font-bold text-amber-700 bg-slate-100 px-1 rounded">DEBOUNCE_DELAY</code> subroutine prevents false multiple triggers. Waiting for key release (<code className="font-mono text-slate-800">CMP AL, 0FH</code>) enforces reliable single-action keystrokes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TRAFFIC LIGHT CONTROLLER INTERFACING */}
      {activeTab === 'traffic' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Traffic Intersection Visual */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-between space-y-3">
              <div className="w-full flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider">
                  4-Way Traffic Intersection State
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded font-bold">
                  8255 Port A: {trafficStates[trafficStateIndex].portA}
                </span>
              </div>

              {/* Roadway graphic with live LEDs */}
              <div className="w-full max-w-[280px] aspect-square bg-slate-200 border-2 border-slate-300 rounded-2xl relative flex items-center justify-center p-3 shadow-inner">
                {/* Road layout lines */}
                <div className="absolute w-20 h-full bg-slate-100 border-x border-slate-300" />
                <div className="absolute h-20 w-full bg-slate-100 border-y border-slate-300" />

                {/* North-South Traffic Lights (Top & Bottom) */}
                <div className="absolute top-2 flex flex-col items-center bg-slate-800 p-1.5 rounded-lg border border-slate-700 space-y-1 shadow-md z-10">
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ns === 'red' ? 'bg-rose-500 shadow-md shadow-rose-500/80' : 'bg-rose-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ns === 'yellow' ? 'bg-amber-400 shadow-md shadow-amber-400/80' : 'bg-amber-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ns === 'green' ? 'bg-emerald-500 shadow-md shadow-emerald-500/80' : 'bg-emerald-950/40'}`} />
                  <span className="text-[7px] text-slate-300 font-mono font-bold">N/S</span>
                </div>

                <div className="absolute bottom-2 flex flex-col items-center bg-slate-800 p-1.5 rounded-lg border border-slate-700 space-y-1 shadow-md z-10">
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ns === 'red' ? 'bg-rose-500 shadow-md shadow-rose-500/80' : 'bg-rose-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ns === 'yellow' ? 'bg-amber-400 shadow-md shadow-amber-400/80' : 'bg-amber-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ns === 'green' ? 'bg-emerald-500 shadow-md shadow-emerald-500/80' : 'bg-emerald-950/40'}`} />
                  <span className="text-[7px] text-slate-300 font-mono font-bold">N/S</span>
                </div>

                {/* East-West Traffic Lights (Left & Right) */}
                <div className="absolute left-2 flex items-center bg-slate-800 p-1.5 rounded-lg border border-slate-700 space-x-1 shadow-md z-10">
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ew === 'red' ? 'bg-rose-500 shadow-md shadow-rose-500/80' : 'bg-rose-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ew === 'yellow' ? 'bg-amber-400 shadow-md shadow-amber-400/80' : 'bg-amber-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ew === 'green' ? 'bg-emerald-500 shadow-md shadow-emerald-500/80' : 'bg-emerald-950/40'}`} />
                  <span className="text-[7px] text-slate-300 font-mono font-bold">E/W</span>
                </div>

                <div className="absolute right-2 flex items-center bg-slate-800 p-1.5 rounded-lg border border-slate-700 space-x-1 shadow-md z-10">
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ew === 'red' ? 'bg-rose-500 shadow-md shadow-rose-500/80' : 'bg-rose-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ew === 'yellow' ? 'bg-amber-400 shadow-md shadow-amber-400/80' : 'bg-amber-950/40'}`} />
                  <div className={`w-3 h-3 rounded-full border border-white/40 ${trafficStates[trafficStateIndex].ew === 'green' ? 'bg-emerald-500 shadow-md shadow-emerald-500/80' : 'bg-emerald-950/40'}`} />
                  <span className="text-[7px] text-slate-300 font-mono font-bold">E/W</span>
                </div>
              </div>

              <button
                onClick={() => setTrafficRunning(!trafficRunning)}
                className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                  trafficRunning ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {trafficRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {trafficRunning ? 'Pause Traffic Sequencer' : 'Run Auto Traffic Sequencer'}
              </button>
            </div>

            {/* State Table & Signal Mapping */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider block">
                8255 Port A Pin Assignments (Active HIGH)
              </span>

              <div className="space-y-1.5 font-mono text-[10px]">
                {trafficStates.map((st, idx) => {
                  const isCurrent = trafficStateIndex === idx;
                  return (
                    <div 
                      key={idx}
                      onClick={() => setTrafficStateIndex(idx)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                        isCurrent 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>Phase {idx + 1}: {st.name}</span>
                        <span className="text-indigo-600 font-bold">{st.portA}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-sans mt-0.5">
                        Hold Duration: {st.duration / 1000}s software delay
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600">
                Port A bits: <strong className="text-slate-800">PA0=NS Red, PA1=NS Yellow, PA2=NS Green, PA3=EW Red, PA4=EW Yellow, PA5=EW Green</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: 8086 TRAFFIC LIGHT CONTROLLER ASSEMBLY LANGUAGE PROGRAM (ALP) */}
      {activeTab === 'traffic-code' && (
        <div className="space-y-4">
          {/* Traffic Light ALP Dynamic Parameter Configurator Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                8086 Traffic Light Controller Parameter Configurator
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Base Address: {baseAddressHex}H | Control Port: {controlRegAddr}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {/* 1. Lamp Output Port */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  1. 8255 Lamp Output Port
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'portA', label: 'Port A (80H)' },
                    { id: 'portB', label: 'Port B (82H)' },
                    { id: 'portC', label: 'Port C (84H)' }
                  ].map((p) => {
                    const isSelected = trafficAlpPort === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setTrafficAlpPort(p.id as any)}
                        className={`py-1 px-1.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Traffic Controller Routine */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  2. Traffic Controller Routine
                </label>
                <select
                  value={trafficAlpMode}
                  onChange={(e) => setTrafficAlpMode(e.target.value as any)}
                  className="w-full text-[11px] font-medium bg-slate-50 border border-slate-200 rounded p-1 text-slate-800 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="standard_4phase">Standard 4-Phase (21H, 11H, 0CH, 0AH)</option>
                  <option value="with_pedestrian">4-Phase with Pedestrian Walk Sense (Port C)</option>
                  <option value="night_flash">Night Caution (Flashing Yellow 12H / 00H)</option>
                  <option value="emergency_override">Emergency Priority Corridor (09H / 21H)</option>
                </select>
              </div>

              {/* 3. Phase Delay Profile */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  3. Phase Delay Calibration
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'standard', label: 'Standard' },
                    { id: 'demo', label: 'Demo (5s)' },
                    { id: 'rapid', label: 'Rapid (2s)' }
                  ].map((t) => {
                    const isSelected = trafficAlpTiming === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTrafficAlpTiming(t.id as any)}
                        className={`py-1 px-1.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic 8086 Assembly Language Source Code Box */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 font-mono text-[11px] shadow-sm relative space-y-2">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span className="font-bold text-slate-200 text-xs">
                  8086_Traffic_Light_{trafficAlpMode}_8255.asm
                </span>
                <span className="bg-slate-800 text-indigo-400 text-[10px] px-2 py-0.5 rounded border border-slate-700 font-semibold">
                  TASM / MASM Compatible
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTrafficAlp}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] border border-slate-700 font-sans transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Copy className="w-3 h-3 text-indigo-400" />
                  <span>{copiedTrafficAlp ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={handleDownloadTrafficAsm}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded text-[11px] font-sans font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .ASM</span>
                </button>
              </div>
            </div>

            {/* Code Body Container */}
            <div className="overflow-x-auto max-h-[440px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              <pre className="text-slate-200 leading-relaxed font-mono whitespace-pre selection:bg-indigo-900 selection:text-indigo-100 text-[11px]">
                {generateTrafficAssemblyCode()}
              </pre>
            </div>
          </div>

          {/* Detailed Engineering Notes & Hardware Theory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-sans text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="p-1 bg-indigo-50 text-indigo-700 rounded">
                  <Sliders className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-900">1. 8255 Mode 0 Config</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Control Word <code className="font-mono font-bold text-indigo-700 bg-slate-100 px-1 rounded">80H</code> (10000000b) sets all ports (A, B, C) in Mode 0 as simple outputs. The CPU writes directly to Port A (<code className="font-mono text-slate-800">80H</code>) to energize lamps.
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-slate-50 p-1 rounded">
                • D7=1 (Mode Set)<br />
                • Group A &amp; B in Mode 0<br />
                • Port A, B, C = OUTPUT
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="p-1 bg-emerald-50 text-emerald-700 rounded">
                  <Zap className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-900">2. 4-Phase Bitmasks</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                6 pins on Port A control both 3-aspect signal heads:
                <br />
                <code className="font-mono text-[10px] text-slate-800 font-bold">21H</code>: NS Green + EW Red<br />
                <code className="font-mono text-[10px] text-slate-800 font-bold">11H</code>: NS Yellow + EW Red<br />
                <code className="font-mono text-[10px] text-slate-800 font-bold">0CH</code>: NS Red + EW Green<br />
                <code className="font-mono text-[10px] text-slate-800 font-bold">0AH</code>: NS Red + EW Yellow
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-slate-50 p-1 rounded">
                • PA0–PA2: NS Signal Head<br />
                • PA3–PA5: EW Signal Head
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="p-1 bg-amber-50 text-amber-700 rounded">
                  <Cpu className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-900">3. Driver Transistors / Relays</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                8255 pins cannot supply high current (~2.5mA max source). Output pins drive NPN transistors (e.g. <strong className="text-slate-800">BC547 / 2N2222</strong>) or Darlington arrays (<strong className="text-slate-800">ULN2003A</strong>) or solid-state relays for 230V AC street lamps.
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-slate-50 p-1 rounded">
                • V_drop = 0.7V (V_BE)<br />
                • Current Gain (h_FE) &gt; 100<br />
                • Optical Isolation for AC Mains
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <span className="p-1 bg-purple-50 text-purple-700 rounded">
                  <Timer className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-900">4. Software Delay Loops</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Nested double-loop procedures (<code className="font-mono text-indigo-700">LOOP G_INNER</code>, <code className="font-mono text-indigo-700">LOOP G_OUTER</code>) count CPU clock states. At 5 MHz (<code className="font-mono text-slate-800">T = 0.2µs</code>), calibrating CX counts creates exact 30s green and 5s yellow windows.
              </p>
              <div className="font-mono text-[9px] text-slate-500 bg-slate-50 p-1 rounded">
                • LOOP = 17 or 5 clock cycles<br />
                • Total Cycles = Outer × Inner × Cycles<br />
                • Delay = Cycles × 0.2 µs
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: 8086 ASSEMBLY LANGUAGE PROGRAM (ALP) */}
      {activeTab === 'alp' && (
        <div className="space-y-3">
          {/* Sub-selector for different ALP routines */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {[
              { id: 'stepper', label: '1. Stepper Motor ALP (Full-Step CW/CCW)' },
              { id: 'seven-seg', label: '2. 7-Segment Display ALP (XLAT)' },
              { id: 'keypad', label: '3. 4x4 Matrix Keypad Scan ALP' },
              { id: 'traffic', label: '4. Traffic Light Controller ALP' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedAlp(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedAlp === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stepper Motor ALP */}
          {selectedAlp === 'stepper' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-indigo-900 uppercase">
                  Stepper Motor Interfacing ALP (Line-by-Line Commented)
                </span>
                <span className="text-slate-500 text-[10px] font-sans">Mode 0, Port A = 80H, Control Reg = 86H</span>
              </div>

              <pre className="text-slate-800 leading-relaxed overflow-x-auto whitespace-pre">
{`; =========================================================================
; 8086 ALP: Stepper Motor Continuous Rotation via Intel 8255 PPI
; Hardware Map: Port A = 80H (Drive), Port B = 82H, Control Word Reg = 86H
; Driver: ULN2003A Darlington Sink Inputs connected to PA0-PA3
; =========================================================================

.MODEL SMALL                  ; Specify small memory model (single CS and DS)
.STACK 64                     ; Reserve 64 bytes of stack space for CALL/RET
.DATA                         ; Begin data segment definition
  ; 4-Phase Full-Step (2-Phase ON) Excitation Lookup Table (4-bit PA0-PA3)
  STEP_CW  DB 03H, 06H, 0CH, 09H ; Clockwise: Coils AB (03H) -> BC (06H) -> CD (0CH) -> DA (09H)
  STEP_CCW DB 09H, 0CH, 06H, 03H ; Counter-Clockwise excitation sequence (reversed)

.CODE                         ; Begin code segment definition
MAIN PROC                     ; Program entry point
  MOV AX, @DATA               ; Load address of data segment into AX register
  MOV DS, AX                  ; Initialize Data Segment (DS) register with segment base

  ; --- STEP 1: INITIALIZE 8255 PPI IN MODE 0 ---
  MOV AL, 80H                 ; Load Control Word 80H (10000000b: Mode 0, Port A/B/C = Output)
  OUT 86H, AL                 ; Send Control Word to 8255 Control Register at I/O Port 86H

  ; --- STEP 2: CONTINUOUS STEPPING LOOP ---
ROTATE_LOOP:
  MOV SI, 0                   ; Reset Source Index (SI) pointer to start of step array
  MOV CX, 4                   ; Load step counter with 4 (4 excitation states per electrical cycle)

STEP_CYCLE:
  MOV AL, STEP_CW[SI]         ; Fetch current phase excitation byte from memory into AL
  OUT 80H, AL                 ; Write excitation byte to Port A (80H) -> ULN2003 In1-In4
  CALL DELAY                  ; Call software delay loop to allow rotor mechanical step settling
  INC SI                      ; Advance SI to point to next step code in lookup table
  LOOP STEP_CYCLE             ; Decrement CX; repeat STEP_CYCLE until all 4 steps complete

  JMP ROTATE_LOOP             ; Loop indefinitely for continuous smooth clockwise rotation

; -------------------------------------------------------------------------
; Software Nested Delay Subroutine (Generates ~50ms pulse interval)
; -------------------------------------------------------------------------
DELAY PROC                    ; Begin delay procedure
  PUSH CX                     ; Save outer loop counter (CX) onto stack
  MOV CX, 0FFFFH              ; Load CX with maximum 16-bit count (65535 loop iterations)
D1:                           ; Inner loop label
  LOOP D1                     ; Decrement CX and loop back until CX = 0 (~2 clock cycles/loop)
  POP CX                      ; Restore original outer loop counter from stack
  RET                         ; Return control to calling instruction in main procedure
DELAY ENDP                    ; End delay procedure

MAIN ENDP                     ; End main procedure
END MAIN                      ; End of program assembly with entry point`}
              </pre>
            </div>
          )}

          {/* 7-Segment Display ALP */}
          {selectedAlp === 'seven-seg' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-indigo-900 uppercase">
                  7-Segment LED Display ALP with Table Lookup (Line-by-Line Commented)
                </span>
                <span className="text-slate-500 text-[10px] font-sans">Common Cathode Configuration (Active HIGH)</span>
              </div>

              <pre className="text-slate-800 leading-relaxed overflow-x-auto whitespace-pre">
{`; =========================================================================
; 8086 ALP: Display Hex Digit on 7-Segment Display via 8255 Port A using XLAT
; Segment Wiring: PA0=a, PA1=b, PA2=c, PA3=d, PA4=e, PA5=f, PA6=g, PA7=dp
; =========================================================================

.MODEL SMALL                  ; Define small memory model
.STACK 64                     ; Allocate 64 bytes for stack storage
.DATA                         ; Begin data segment
  ; Common Cathode 7-Segment Lookup Table for Hex Digits 0 to F
  TABLE DB 3FH, 06H, 5BH, 4FH ; 0: 3FH, 1: 06H, 2: 5BH, 3: 4FH
        DB 66H, 6DH, 7DH, 07H ; 4: 66H, 5: 6DH, 6: 7DH, 7: 07H
        DB 7FH, 6FH, 77H, 7CH ; 8: 7FH, 9: 6FH, A: 77H, B: 7CH
        DB 39H, 5EH, 79H, 71H ; C: 39H, D: 5EH, E: 79H, F: 71H
  DIGIT DB 08H                ; Hex digit to be displayed (e.g., Digit 8)

.CODE                         ; Begin code segment
MAIN PROC                     ; Program entry point
  MOV AX, @DATA               ; Load address of data segment into AX
  MOV DS, AX                  ; Initialize DS register with data segment base

  ; Step 1: Initialize 8255 in Mode 0 (Port A as Output)
  MOV AL, 80H                 ; Control byte 80H (Mode 0, all ports output)
  OUT 86H, AL                 ; Write to 8255 control register at port 86H

  ; Step 2: Convert Hex Digit into 7-Segment Pattern using XLAT
  MOV BX, OFFSET TABLE        ; Load base address of 7-segment lookup table into BX register
  MOV AL, DIGIT               ; Load raw hexadecimal digit (00H - 0FH) into AL register
  XLAT                        ; Translate: AL = [BX + AL] -> fetches segment bit pattern

  ; Step 3: Output Pattern to 7-Segment Display
  OUT 80H, AL                 ; Send 7-segment byte code to 8255 Port A (port 80H)

  MOV AH, 4CH                 ; DOS terminate process function call
  INT 21H                     ; Return to operating system

MAIN ENDP                     ; End main procedure
END MAIN                      ; End program assembly`}
              </pre>
            </div>
          )}

          {/* 4x4 Keypad Scan ALP */}
          {selectedAlp === 'keypad' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-indigo-900 uppercase">
                  4x4 Matrix Keypad Scanning Subroutine (Line-by-Line Commented)
                </span>
                <span className="text-slate-500 text-[10px] font-sans">Port A = Rows (OUT), Port B = Cols (IN)</span>
              </div>

              <pre className="text-slate-800 leading-relaxed overflow-x-auto whitespace-pre">
{`; =========================================================================
; 8086 ALP: 4x4 Matrix Keypad Scanning with Hardware Debounce via 8255
; Port A (80H) = Rows OUT (Active-LOW Grounding), Port B (82H) = Columns IN
; Control Word = 82H (Port A Output, Port B Input)
; =========================================================================

.MODEL SMALL                  ; Define small memory model
.STACK 64                     ; Allocate stack memory
.DATA                         ; Begin data segment
  KEY_CODE DB ?               ; Variable to store detected key code

.CODE                         ; Begin code segment
MAIN PROC
  MOV AX, @DATA               ; Load data segment address into AX
  MOV DS, AX                  ; Initialize DS register

  ; Step 1: Configure 8255 (Port A = Output, Port B = Input)
  MOV AL, 82H                 ; Control byte 82H: Mode 0, Port A=OUT, Port B=IN
  OUT 86H, AL                 ; Write to 8255 control register (86H)

WAIT_KEY_PRESS:
  ; Step 2: Ground all rows to detect ANY key closure
  MOV AL, 00H                 ; Send LOW (0V) on all 4 row lines PA0-PA3
  OUT 80H, AL                 ; Output to Port A
  IN AL, 82H                  ; Read column lines PB0-PB3 from Port B
  AND AL, 0FH                 ; Mask upper 4 unused bits
  CMP AL, 0FH                 ; Compare with 0FH (1111b: all columns pulled HIGH)
  JZ WAIT_KEY_PRESS           ; If zero flag set (all HIGH), no key pressed; keep waiting

  ; Step 3: Software Debounce Delay (20ms)
  CALL DEBOUNCE_DELAY         ; Wait 20ms to allow mechanical switch contact bounce to settle

  ; Step 4: Row-by-Row Sequential Scan
  ; --- Scan Row 0 (PA0 = 0, PA1-PA3 = 1 -> 0FEH) ---
  MOV AL, 0FEH                ; Ground only Row 0
  OUT 80H, AL                 ; Output to Port A
  IN AL, 82H                  ; Read Port B column pins
  AND AL, 0FH                 ; Mask upper nibble
  CMP AL, 0FH                 ; Check if key is pressed in Row 0
  JNZ ROW0_DETECTED           ; If not 0FH, key is in Row 0! Jump to decode

  ; --- Scan Row 1 (PA1 = 0, PA0,PA2,PA3 = 1 -> 0FDH) ---
  MOV AL, 0FDH                ; Ground only Row 1
  OUT 80H, AL                 ; Output to Port A
  IN AL, 82H                  ; Read Port B
  AND AL, 0FH                 ; Mask upper nibble
  CMP AL, 0FH                 ; Check if key is in Row 1
  JNZ ROW1_DETECTED           ; If not 0FH, key is in Row 1! Jump to decode

ROW0_DETECTED:
  ; Identify column and store key
  MOV KEY_CODE, AL            ; Save column bitmask
  HLT                         ; Halt execution after detection

DEBOUNCE_DELAY PROC
  PUSH CX                     ; Save CX
  MOV CX, 07FFFH              ; Load loop count for ~20ms delay
D_LOOP:
  LOOP D_LOOP                 ; Decrement CX until 0
  POP CX                      ; Restore CX
  RET                         ; Return to caller
DEBOUNCE_DELAY ENDP

MAIN ENDP
END MAIN`}
              </pre>
            </div>
          )}

          {/* Traffic Light Controller ALP */}
          {selectedAlp === 'traffic' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-indigo-900 uppercase">
                  Traffic Light Controller 4-Phase Sequencer ALP (Line-by-Line Commented)
                </span>
                <span className="text-slate-500 text-[10px] font-sans">8255 Port A: PA0–PA5 driving LED indicators</span>
              </div>

              <pre className="text-slate-800 leading-relaxed overflow-x-auto whitespace-pre">
{`; =========================================================================
; 8086 ALP: 4-Way Traffic Light Controller Sequencer via 8255 Port A
; Pin Mapping: PA0=NS Red, PA1=NS Yellow, PA2=NS Green, PA3=EW Red, PA4=EW Yellow, PA5=EW Green
; =========================================================================

.MODEL SMALL                  ; Define small memory model
.STACK 64                     ; Allocate stack memory
.DATA                         ; Begin data segment
  ; 4 Traffic Phases: 
  ; Phase 1 (21H): NS Green (PA2=1) & EW Red (PA3=1) -> 00100001b = 21H
  ; Phase 2 (11H): NS Yellow (PA1=1) & EW Red (PA3=1) -> 00010001b = 11H
  ; Phase 3 (0CH): NS Red (PA0=1) & EW Green (PA5=1) -> 00001100b = 0CH
  ; Phase 4 (0AH): NS Red (PA0=1) & EW Yellow (PA4=1) -> 00001010b = 0AH
  PHASE_CODES DB 21H, 11H, 0CH, 0AH

.CODE                         ; Begin code segment
MAIN PROC
  MOV AX, @DATA               ; Load base address of data segment
  MOV DS, AX                  ; Initialize DS register

  ; Step 1: Configure 8255 in Mode 0 (Port A = Output)
  MOV AL, 80H                 ; Control byte 80H (Mode 0, all ports output)
  OUT 86H, AL                 ; Write to 8255 control port (86H)

TRAFFIC_CYCLE:
  MOV SI, 0                   ; Reset table pointer to Phase 1

PHASE_LOOP:
  MOV AL, PHASE_CODES[SI]     ; Load active traffic phase output code into AL
  OUT 80H, AL                 ; Send control signals to Port A (80H) driving LED drivers
  CALL EXTENDED_DELAY         ; Call extended timing delay (e.g. green/yellow duration)
  INC SI                      ; Advance to next traffic phase code
  CMP SI, 4                   ; Check if all 4 phases have executed
  JNZ PHASE_LOOP              ; If not 4, continue with next phase in cycle

  JMP TRAFFIC_CYCLE           ; Repeat traffic sequence continuously

EXTENDED_DELAY PROC
  PUSH CX                     ; Save CX
  MOV CX, 0FFFFH              ; Outer delay counter
L1:
  PUSH CX                     ; Save outer loop counter
  MOV CX, 0080H               ; Inner delay counter
L2:
  LOOP L2                     ; Inner loop
  POP CX                      ; Restore outer loop counter
  LOOP L1                     ; Decrement outer counter
  POP CX                      ; Restore original CX
  RET                         ; Return to sequencer loop
EXTENDED_DELAY ENDP

MAIN ENDP
END MAIN`}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
