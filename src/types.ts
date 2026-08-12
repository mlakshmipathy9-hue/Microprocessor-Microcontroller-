export interface Slide {
  id: string;
  title: string;
  moduleTitle: string;
  moduleId: string;
  points?: string[];
  videoUrl?: string;
  videoTitle?: string;
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
  interactiveType?: 'evolution' | 'pins' | 'architecture' | 'flags' | 'memory-calc' | 'intro-interrupts' | 'interrupts' | 'timing' | 'modes' | 'min-mode-hardware' | 'quiz' | 'dev-pipeline' | 'addressing-modes' | 'instruction-decoder' | 'directive-sandbox' | 'assembler-playground' | 'assembler-passes' | 'assembler-outputs' | 'pipelining' | 'instruction-builder' | 'memory-interfacing' | 'ppi-8255' | 'peripheral-interfacing' | 'analog-interfacing' | 'interrupt-8259' | 'usart-8251' | 'dma-8237';
  quizQuestions?: QuizQuestion[];
  diagramLabel?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  isGateQuestion?: boolean;
  gateYear?: string;
}

export interface Module {
  id: string;
  title: string;
  slides: Slide[];
}
