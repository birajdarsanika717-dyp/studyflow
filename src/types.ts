export interface StudySession {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface PracticeTest {
  questions: {
    question: string;
    type: 'multiple-choice' | 'short-answer';
    options?: string[];
    correctAnswer: string;
  }[];
}

export interface StudyMaterial {
  id: string;
  session_id: string;
  type: 'flashcards' | 'quiz' | 'test';
  data: any;
  created_at: string;
}
