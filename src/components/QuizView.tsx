import { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { QuizQuestion } from '../types';
import { cn } from '../lib/utils';

interface QuizViewProps {
  questions: QuizQuestion[];
}

export function QuizView({ questions }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Quiz Completed!</CardTitle>
          <CardDescription>Here's how you performed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="text-6xl font-bold text-zinc-900">
            {Math.round((score / questions.length) * 100)}%
          </div>
          <p className="text-zinc-500">
            You got {score} out of {questions.length} questions correct.
          </p>
          <Button onClick={restartQuiz} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-8">
      <div className="flex justify-between items-center text-sm text-zinc-500">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedOption;
            
            let variantClass = "border-zinc-200 hover:border-zinc-400";
            if (isSubmitted) {
              if (isCorrect) variantClass = "border-emerald-500 bg-emerald-50 text-emerald-700";
              else if (isSelected) variantClass = "border-red-500 bg-red-50 text-red-700";
              else variantClass = "opacity-50 border-zinc-200";
            } else if (isSelected) {
              variantClass = "border-zinc-900 bg-zinc-50";
            }

            return (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                disabled={isSubmitted}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                  variantClass
                )}
              >
                <span>{option}</span>
                {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </CardContent>
      </Card>

      {isSubmitted && (
        <Card className="bg-zinc-50 border-none">
          <CardContent className="p-4 text-sm text-zinc-600">
            <p className="font-semibold text-zinc-900 mb-1">Explanation:</p>
            {currentQuestion.explanation}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        {!isSubmitted ? (
          <Button onClick={handleSubmit} disabled={!selectedOption}>
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
