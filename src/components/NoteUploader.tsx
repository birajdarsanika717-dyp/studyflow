import { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Input } from './ui/Input';
import { FileText, Upload, Loader2 } from 'lucide-react';

interface NoteUploaderProps {
  onUpload: (title: string, content: string) => Promise<void>;
}

export function NoteUploader({ onUpload }: NoteUploaderProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsUploading(true);
    try {
      await onUpload(title, content);
      setTitle('');
      setContent('');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-zinc-900" />
          New Study Session
        </CardTitle>
        <CardDescription>
          Paste your notes below to generate personalized study materials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Session Title</label>
            <Input
              placeholder="e.g., Biology - Photosynthesis"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Your Notes</label>
            <Textarea
              placeholder="Paste your notes, lecture transcript, or textbook snippets here..."
              className="min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Notes...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Generate Study Materials
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
