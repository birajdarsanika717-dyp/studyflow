import { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { PracticeTest } from '../types';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface PracticeTestViewProps {
  test: PracticeTest;
}

export function PracticeTestView({ test }: PracticeTestViewProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<{ score: number; total: number } | null>(null);

  const handleAnswerChange = (index: number, value: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    let score = 0;
    test.questions.forEach((q, i) => {
      const userAnswer = answers[i]?.toLowerCase().trim();
      const correctAnswer = q.correctAnswer.toLowerCase().trim();
      if (userAnswer === correctAnswer) {
        score++;
      }
    });
    setResults({ score, total: test.questions.length });
    setIsSubmitted(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 py-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-zinc-900">Practice Test</h2>
        <p className="text-zinc-500">Test your knowledge with a mix of question types.</p>
      </div>

      {isSubmitted && results && (
        <Card className="bg-zinc-900 text-white border-none">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Final Score</p>
              <h3 className="text-4xl font-bold">{results.score} / {results.total}</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold">{Math.round((results.score / results.total) * 100)}%</p>
              <p className="text-zinc-400 text-sm">Accuracy</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {test.questions.map((q, i) => {
          const isCorrect = answers[i]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
          
          return (
            <Card key={i} className={isSubmitted ? (isCorrect ? 'border-emerald-200' : 'border-red-200') : ''}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Question {i + 1}</span>
                    <CardTitle className="text-lg">{q.question}</CardTitle>
                  </div>
                  {isSubmitted && (
                    isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {q.type === 'multiple-choice' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswerChange(i, option)}
                        disabled={isSubmitted}
                        className={`text-left p-3 rounded-xl border-2 transition-all text-sm ${
                          answers[i] === option 
                            ? 'border-zinc-900 bg-zinc-50' 
                            : 'border-zinc-100 hover:border-zinc-200'
                        } ${isSubmitted && option === q.correctAnswer ? 'border-emerald-500 bg-emerald-50' : ''}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Input
                    placeholder="Type your answer here..."
                    value={answers[i] || ''}
                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                    disabled={isSubmitted}
                    className={isSubmitted && !isCorrect ? 'border-red-300 focus:ring-red-500' : ''}
                  />
                )}

                {isSubmitted && !isCorrect && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-800 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Correct Answer:</p>
                      <p>{q.correctAnswer}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isSubmitted && (
        <Button onClick={handleSubmit} className="w-full h-14 text-lg">
          Submit Test
        </Button>
      )}
    </div>
  );
}
