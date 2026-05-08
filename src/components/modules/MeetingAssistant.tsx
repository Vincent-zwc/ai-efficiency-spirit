'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Users, ClipboardList, CheckSquare, CalendarClock, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

type ActionType = 'minutes' | 'todos' | 'followup';

const SYSTEM_PROMPT = '你是一个专业的会议助手。请根据用户提供的会议记录，生成结构化的会议纪要，包括：会议主题、参会人员、讨论要点、决策事项、行动项（含负责人和截止日期）、下次会议安排。请用中文回复。';

const ACTION_CONFIG: Record<ActionType, { label: string; icon: React.ReactNode; prompt: string }> = {
  minutes: {
    label: '生成会议纪要',
    icon: <ClipboardList className="h-4 w-4" />,
    prompt: '请根据以下会议记录，生成结构化的会议纪要，包括：会议主题、参会人员、讨论要点、决策事项、行动项：',
  },
  todos: {
    label: '提取待办事项',
    icon: <CheckSquare className="h-4 w-4" />,
    prompt: '请从以下会议记录中提取所有待办事项，每个待办事项应包含：任务描述、负责人（如有提及）、截止日期（如有提及），并以编号列表形式呈现：',
  },
  followup: {
    label: '生成跟进计划',
    icon: <CalendarClock className="h-4 w-4" />,
    prompt: '请根据以下会议记录生成跟进计划，包括：需要跟进的事项、负责人、预计完成时间、下次检查点，以及下次会议建议议题：',
  },
};

export default function MeetingAssistant() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);

  const handleAction = async (type: ActionType) => {
    if (!input.trim()) {
      toast.error('请先输入会议记录内容');
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
        <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">会议智能助手</h2>
          <p className="text-muted-foreground">智能生成会议纪要、提取待办事项、制定跟进计划</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">输入会议记录</CardTitle>
          <CardDescription>粘贴或输入会议的原始记录内容</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="请在此输入或粘贴会议记录内容..."
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
                  className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
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
              <Badge variant="secondary" className="bg-teal-100 text-teal-700">
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
              <Badge variant="secondary" className="bg-teal-100 text-teal-700">
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
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>输入会议记录并选择操作，AI 将为您智能整理</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
