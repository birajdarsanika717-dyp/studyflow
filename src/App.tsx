import { useState, useEffect } from 'react';
import { NoteUploader } from './components/NoteUploader';
import { SessionList } from './components/SessionList';
import { FlashcardView } from './components/FlashcardView';
import { QuizView } from './components/QuizView';
import { PracticeTestView } from './components/PracticeTestView';
import { Button } from './components/ui/Button';
import { Card, CardContent } from './components/ui/Card';
import { geminiService } from './services/gemini';
import { StudySession, StudyMaterial } from './types';
import { 
  Plus, 
  Brain, 
  LayoutDashboard, 
  FileText, 
  Layers, 
  CheckSquare, 
  GraduationCap,
  Loader2,
  Sparkles
} from 'lucide-react';
import Markdown from 'react-markdown';

export default function App() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz' | 'test'>('summary');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (activeSession) {
      fetchMaterials(activeSession.id);
      generateSummary(activeSession.content);
    }
  }, [activeSession]);

  const fetchSessions = async () => {
    const res = await fetch('/api/sessions');
    const data = await res.json();
    setSessions(data);
  };

  const fetchMaterials = async (sessionId: string) => {
    const res = await fetch(`/api/sessions/${sessionId}/materials`);
    const data = await res.json();
    setMaterials(data);
  };

  const generateSummary = async (content: string) => {
    setIsGenerating('summary');
    try {
      const text = await geminiService.summarizeNotes(content);
      setSummary(text || '');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleUpload = async (title: string, content: string) => {
    const id = crypto.randomUUID();
    const newSession = { id, title, content, created_at: new Date().toISOString() };
    
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession),
    });

    setSessions([newSession, ...sessions]);
    setActiveSession(newSession);
    setActiveTab('summary');
  };

  const handleDeleteSession = async (id: string) => {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
    setSessions(sessions.filter(s => s.id !== id));
    if (activeSession?.id === id) {
      setActiveSession(null);
    }
  };

  const generateMaterial = async (type: 'flashcards' | 'quiz' | 'test') => {
    if (!activeSession) return;
    setIsGenerating(type);
    
    try {
      let data;
      if (type === 'flashcards') data = await geminiService.generateFlashcards(activeSession.content);
      else if (type === 'quiz') data = await geminiService.generateQuiz(activeSession.content);
      else data = await geminiService.generatePracticeTest(activeSession.content);

      const materialId = crypto.randomUUID();
      const newMaterial = { 
        id: materialId, 
        session_id: activeSession.id, 
        type, 
        data, 
        created_at: new Date().toISOString() 
      };

      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });

      setMaterials([...materials, newMaterial]);
      setActiveTab(type);
    } finally {
      setIsGenerating(null);
    }
  };

  const getMaterial = (type: string) => materials.find(m => m.type === type);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className="w-80 border-r border-zinc-200 bg-white flex flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3 border-bottom border-zinc-100">
          <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center text-white">
            <Brain className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">StudyFlow AI</h1>
        </div>

        <div className="px-4 py-4">
          <Button 
            className="w-full justify-start gap-2" 
            onClick={() => setActiveSession(null)}
            variant={activeSession === null ? 'primary' : 'secondary'}
          >
            <Plus className="w-4 h-4" />
            New Session
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <SessionList 
            sessions={sessions} 
            onSelect={setActiveSession} 
            onDelete={handleDeleteSession}
            activeId={activeSession?.id}
          />
        </div>

        <div className="p-4 border-t border-zinc-100">
          <div className="bg-zinc-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">Demo Student</p>
              <p className="text-[10px] text-zinc-500 font-medium">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {!activeSession ? (
          <div className="max-w-4xl mx-auto py-20 px-6">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-5xl font-bold text-zinc-900 tracking-tight">Level up your learning.</h2>
              <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
                Upload your lecture notes, textbook snippets, or research papers and let AI create the perfect study guide for you.
              </p>
            </div>
            <NoteUploader onUpload={handleUpload} />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto py-12 px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                  <LayoutDashboard className="w-3 h-3" />
                  Study Dashboard
                </div>
                <h2 className="text-3xl font-bold text-zinc-900">{activeSession.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => generateSummary(activeSession.content)}>
                  <Sparkles className="w-4 h-4 mr-2 text-zinc-400" />
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-2xl mb-8 w-fit">
              {[
                { id: 'summary', label: 'Summary', icon: FileText },
                { id: 'flashcards', label: 'Flashcards', icon: Layers },
                { id: 'quiz', label: 'Quiz', icon: CheckSquare },
                { id: 'test', label: 'Practice Test', icon: GraduationCap },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-zinc-900 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'summary' && (
                <Card className="border-none shadow-none bg-transparent">
                  <CardContent className="p-0">
                    {isGenerating === 'summary' ? (
                      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="font-medium">Synthesizing your notes...</p>
                      </div>
                    ) : (
                      <div className="prose prose-zinc max-w-none bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                        <Markdown>{summary}</Markdown>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'flashcards' && (
                <div>
                  {getMaterial('flashcards') ? (
                    <FlashcardView flashcards={getMaterial('flashcards')!.data} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                      <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400">
                        <Layers className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-zinc-900">No Flashcards Yet</h3>
                        <p className="text-zinc-500 max-w-sm">Generate a set of interactive flashcards to test your memory on key concepts.</p>
                      </div>
                      <Button onClick={() => generateMaterial('flashcards')} disabled={isGenerating !== null}>
                        {isGenerating === 'flashcards' ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                          'Generate Flashcards'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div>
                  {getMaterial('quiz') ? (
                    <QuizView questions={getMaterial('quiz')!.data} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                      <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400">
                        <CheckSquare className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-zinc-900">Ready for a Quiz?</h3>
                        <p className="text-zinc-500 max-w-sm">Create a multiple-choice quiz to challenge your understanding of the material.</p>
                      </div>
                      <Button onClick={() => generateMaterial('quiz')} disabled={isGenerating !== null}>
                        {isGenerating === 'quiz' ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                          'Generate Quiz'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'test' && (
                <div>
                  {getMaterial('test') ? (
                    <PracticeTestView test={getMaterial('test')!.data} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                      <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-zinc-900">Final Assessment</h3>
                        <p className="text-zinc-500 max-w-sm">Generate a full practice test with mixed question types for complete mastery.</p>
                      </div>
                      <Button onClick={() => generateMaterial('test')} disabled={isGenerating !== null}>
                        {isGenerating === 'test' ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                          'Generate Practice Test'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
