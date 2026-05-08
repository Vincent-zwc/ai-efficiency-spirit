'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckSquare,
  Plus,
  Trash2,
  Wand2,
  ListTree,
  Filter,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore, type TodoPriority } from '@/lib/store';
import ReactMarkdown from 'react-markdown';

const PRIORITY_SYSTEM_PROMPT = '你是一个高效的任务管理助手。请根据用户提供的待办事项列表，按照重要性和紧急性进行优先级排序，并为每个任务分配优先级（高/中/低）和建议完成时间。请用JSON格式返回结果，格式为：[{"title": "任务标题", "priority": "高/中/低", "suggestedTime": "建议完成时间"}]';

const TASK_BREAKDOWN_PROMPT = '你是一个项目管理助手。请将用户提供的任务分解为具体的子任务，每个子任务应该清晰、可执行。请用中文回复，列出所有子任务，每行一个子任务，不要编号。';

const PRIORITY_COLORS: Record<TodoPriority, string> = {
  '高': 'bg-red-100 text-red-700 border-red-200',
  '中': 'bg-amber-100 text-amber-700 border-amber-200',
  '低': 'bg-green-100 text-green-700 border-green-200',
};

export default function TodoManager() {
  const {
    todos,
    todoFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodoPriority,
    setTodoSubtasks,
    replaceTodos,
    setTodoFilter,
  } = useAppStore();

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [sortingLoading, setSortingLoading] = useState(false);
  const [breakdownTodoId, setBreakdownTodoId] = useState<string | null>(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [breakdownResult, setBreakdownResult] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredTodos = todos.filter((todo) => {
    if (todoFilter === 'active') return !todo.completed;
    if (todoFilter === 'completed') return todo.completed;
    return true;
  });

  const handleAddTodo = () => {
    if (!newTitle.trim()) {
      toast.error('请输入任务标题');
      return;
    }
    addTodo(newTitle.trim(), newDesc.trim());
    setNewTitle('');
    setNewDesc('');
    toast.success('任务已添加');
  };

  const handleAISort = async () => {
    if (todos.length === 0) {
      toast.error('暂无待办事项可排序');
      return;
    }
    setSortingLoading(true);
    try {
      const todoList = todos.map((t) => t.title).join('\n');
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `请对以下待办事项进行优先级排序：\n${todoList}` }],
          systemPrompt: PRIORITY_SYSTEM_PROMPT,
        }),
      });
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      // Try to parse JSON from AI response
      const jsonMatch = data.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const updatedTodos = todos.map((todo) => {
          const match = parsed.find(
            (p: { title: string; priority: string }) => p.title === todo.title
          );
          if (match) {
            return { ...todo, priority: match.priority as TodoPriority };
          }
          return todo;
        });
        // Sort by priority
        const priorityOrder: Record<string, number> = { '高': 0, '中': 1, '低': 2 };
        updatedTodos.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
        replaceTodos(updatedTodos);
        toast.success('AI 智能排序完成');
      } else {
        toast.info('AI 已分析，但无法自动排序，请手动调整');
      }
    } catch {
      toast.error('排序失败，请重试');
    } finally {
      setSortingLoading(false);
    }
  };

  const handleBreakdown = async (todoId: string) => {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;
    setBreakdownTodoId(todoId);
    setBreakdownLoading(true);
    setBreakdownResult('');
    setDialogOpen(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: `请将以下任务分解为具体的子任务：\n${todo.title}${todo.description ? `\n描述：${todo.description}` : ''}` },
          ],
          systemPrompt: TASK_BREAKDOWN_PROMPT,
        }),
      });
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setBreakdownResult(data.content);
      const subtasks = data.content
        .split('\n')
        .map((s: string) => s.replace(/^[-*\d.)\s]+/, '').trim())
        .filter((s: string) => s.length > 0);
      setTodoSubtasks(todoId, subtasks);
    } catch {
      toast.error('分解失败，请重试');
    } finally {
      setBreakdownLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
          <CheckSquare className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">智能待办管家</h2>
          <p className="text-muted-foreground">AI 驱动的任务管理，智能排序与任务分解</p>
        </div>
      </div>

      {/* Add new todo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">添加新任务</CardTitle>
          <CardDescription>输入任务信息，快速创建待办事项</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Input
              placeholder="任务标题"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              className="flex-1"
            />
            <Button
              onClick={handleAddTodo}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4" />
              添加
            </Button>
          </div>
          <Textarea
            placeholder="任务描述（可选）"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="min-h-[60px] resize-y"
          />
        </CardContent>
      </Card>

      {/* Actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={todoFilter} onValueChange={(v) => setTodoFilter(v as 'all' | 'active' | 'completed')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部任务</SelectItem>
              <SelectItem value="active">进行中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline">{filteredTodos.length} 项</Badge>
        </div>
        <Button
          onClick={handleAISort}
          disabled={sortingLoading || todos.length === 0}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {sortingLoading ? (
            <Sparkles className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          AI智能排序
        </Button>
      </div>

      {/* Todo list */}
      {sortingLoading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">AI 排序中...</Badge>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filteredTodos.map((todo) => (
          <Card key={todo.id} className={`transition-all hover:shadow-md ${todo.completed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {todo.title}
                    </span>
                    <Badge className={PRIORITY_COLORS[todo.priority]} variant="outline">
                      {todo.priority}优先级
                    </Badge>
                  </div>
                  {todo.description && (
                    <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>
                  )}
                  {todo.subtasks && todo.subtasks.length > 0 && (
                    <div className="mt-2 pl-3 border-l-2 border-emerald-200">
                      <p className="text-xs text-muted-foreground mb-1">子任务：</p>
                      {todo.subtasks.map((sub, i) => (
                        <p key={i} className="text-sm text-muted-foreground">• {sub}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBreakdown(todo.id)}
                    title="AI分解任务"
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <ListTree className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    title="删除"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTodos.length === 0 && !sortingLoading && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>
              {todoFilter === 'all'
                ? '暂无待办事项，添加一个开始吧'
                : todoFilter === 'active'
                  ? '没有进行中的任务'
                  : '还没有已完成的任务'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Breakdown dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI 任务分解</DialogTitle>
            <DialogDescription>
              AI 正在将任务分解为可执行的子任务
            </DialogDescription>
          </DialogHeader>
          {breakdownLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{breakdownResult}</ReactMarkdown>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
