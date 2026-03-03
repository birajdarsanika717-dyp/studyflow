import { StudySession } from '../types';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Clock, BookOpen, Trash2 } from 'lucide-react';

interface SessionListProps {
  sessions: StudySession[];
  onSelect: (session: StudySession) => void;
  onDelete: (id: string) => void;
  activeId?: string;
}

export function SessionList({ sessions, onSelect, onDelete, activeId }: SessionListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">Recent Sessions</h3>
      {sessions.length === 0 ? (
        <p className="text-sm text-zinc-500 px-2 italic">No sessions yet. Start by adding your notes!</p>
      ) : (
        sessions.map((session) => (
          <div key={session.id} className="group relative">
            <button
              onClick={() => onSelect(session)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                activeId === session.id
                  ? 'border-zinc-900 bg-zinc-50 shadow-sm'
                  : 'border-zinc-100 hover:border-zinc-200 bg-white'
              }`}
            >
              <div className={`p-2 rounded-xl ${activeId === session.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{session.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
