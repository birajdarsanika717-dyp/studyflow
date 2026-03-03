import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardViewProps {
  flashcards: Flashcard[];
}

export function FlashcardView({ flashcards }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const currentCard = flashcards[currentIndex];

  if (!flashcards.length) return null;

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="relative w-full max-w-md h-64 perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + (isFlipped ? '-back' : '-front')}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <Card className="w-full h-full flex items-center justify-center p-8 text-center shadow-xl border-2 border-zinc-100">
              <CardContent className="p-0">
                <p className="text-xl font-medium text-zinc-800">
                  {isFlipped ? currentCard.answer : currentCard.question}
                </p>
                <p className="mt-4 text-xs text-zinc-400 uppercase tracking-widest font-semibold">
                  {isFlipped ? 'Answer' : 'Question'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-6">
        <Button variant="secondary" size="icon" onClick={prevCard}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="text-sm font-medium text-zinc-500">
          {currentIndex + 1} / {flashcards.length}
        </span>
        <Button variant="secondary" size="icon" onClick={nextCard}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(0); setIsFlipped(false); }}>
        <RotateCcw className="w-4 h-4 mr-2" />
        Restart Deck
      </Button>
    </div>
  );
}
