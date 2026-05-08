'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, ListChecks, AlignLeft, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

type ActionType = 'summary' | 'keypoints' | 'format';

const SYSTEM_PROMPT = '你是一个专业的文档处理助手。请根据用户的需求，对提供的文档内容进行处理。你可以生成摘要、提取关键点、或进行格式化整理。请用中文回复，保持专业和准确。';

const ACTION_CONFIG: Record<ActionType, { label: string; icon: React.ReactNode; prompt: string }> = {
  summary: {
    label: '生成摘要',
    icon: <Sparkles className="h-4 w-4" />,
    prompt: '请对以下文档内容生成一段简洁的摘要，突出核心观点和重要信息：',
  },
  keypoints: {
    label: '提取关键点',
    icon: <ListChecks className="h-4 w-4" />,
    prompt: '请从以下文档内容中提取关键要点，以编号列表的形式呈现：',
  },
  format: {
    label: '格式化整理',
    icon: <AlignLeft className="h-4 w-4" />,
    prompt: '请对以下文档内容进行格式化整理，使其结构清晰、层次分明，使用Markdown格式：',
  },
};

export default function DocumentAssistant() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);

  const handleAction = async (type: ActionType) => {
    if (!input.trim()) {
      toast.error('请先输入文档内容');
      return;
    }
    setLoading(true);
    setActiveAction(type);
    setResult('');

    try {
      const config = ACTION_CONFIG[type];
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `${config.prompt}\n\n${input}` }],
          systemPrompt: SYSTEM_PROMPT,
        }),
      });

      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setResult(data.content);
    } catch {
      toast.error('请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">智能文档助手</h2>
          <p className="text-muted-foreground">AI 驱动的文档处理，一键生成摘要、提取关键点、格式化整理</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">输入文档内容</CardTitle>
          <CardDescription>粘贴或输入需要处理的文档文本</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="请在此输入或粘贴文档内容..."
            className="min-h-[200px] resize-y"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            {(Object.keys(ACTION_CONFIG) as ActionType[]).map((type) => {
              const config = ACTION_CONFIG[type];
              return (
                <Button
                  key={type}
                  onClick={() => handleAction(type)}
                  disabled={loading}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {config.icon}
                  {config.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                {activeAction && ACTION_CONFIG[activeAction].label}处理中...
              </Badge>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[85%]" />
              <Skeleton className="h-4 w-[70%]" />
            </div>
          </CardContent>
        </Card>
      )}

      {result && !loading && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">处理结果</CardTitle>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                {activeAction && ACTION_CONFIG[activeAction].label}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {!result && !loading && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>输入文档内容并选择操作，AI 将为您智能处理</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
