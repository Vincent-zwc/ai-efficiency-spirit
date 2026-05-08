'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Plus,
  Trash2,
  Trophy,
  RotateCcw,
  Dice1,
  History,
  BookOpen,
  CheckCircle2,
  XCircle,
  Brain,
  Star,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore, type WordQuestion } from '@/lib/store';

const WORD_QUIZ_PROMPT = '你是一个英语教学助手。请生成10个英语单词及其中文释义，同时为每个单词生成3个干扰选项。请用JSON格式返回：[{"word": "xxx", "meaning": "xxx", "options": ["A选项", "B选项", "C选项", "D选项"], "answer": 0}] 其中answer是正确选项的索引（0-3）。注意：只返回JSON数组，不要有其他文字。';

// Fallback word data if AI fails
const FALLBACK_WORDS: WordQuestion[] = [
  { word: 'ephemeral', meaning: '短暂的', options: ['短暂的', '永恒的', '巨大的', '微小的'], answer: 0 },
  { word: 'ubiquitous', meaning: '无处不在的', options: ['稀有的', '无处不在的', '隐秘的', '明显的'], answer: 1 },
  { word: 'pragmatic', meaning: '务实的', options: ['理想的', '悲观的', '务实的', '浪漫的'], answer: 2 },
  { word: 'eloquent', meaning: '雄辩的', options: ['沉默的', '雄辩的', '困惑的', '愤怒的'], answer: 1 },
  { word: 'resilient', meaning: '有弹性的', options: ['脆弱的', '僵硬的', '有弹性的', '迟钝的'], answer: 2 },
  { word: 'ambiguous', meaning: '模棱两可的', options: ['模棱两可的', '明确的', '简单的', '复杂的'], answer: 0 },
  { word: 'meticulous', meaning: '一丝不苟的', options: ['粗心的', '一丝不苟的', '随意的', '急躁的'], answer: 1 },
  { word: 'tenacious', meaning: '坚韧的', options: ['软弱的', '温柔的', '坚韧的', '犹豫的'], answer: 2 },
  { word: 'profound', meaning: '深刻的', options: ['肤浅的', '深刻的', '平凡的', '古怪的'], answer: 1 },
  { word: 'versatile', meaning: '多才多艺的', options: ['单一的', '固定的', '多才多艺的', '普通的'], answer: 2 },
];

export default function CreativeWorkshop() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">创意工坊</h2>
          <p className="text-muted-foreground">幸运抽奖与百词斩，趣味与效率并存</p>
        </div>
      </div>

      <Tabs defaultValue="lottery" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lottery" className="gap-2">
            <Dice1 className="h-4 w-4" />
            幸运抽奖
          </TabsTrigger>
          <TabsTrigger value="wordquiz" className="gap-2">
            <BookOpen className="h-4 w-4" />
            百词斩
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lottery">
          <LotteryModule />
        </TabsContent>
        <TabsContent value="wordquiz">
          <WordQuizModule />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LotteryModule() {
  const { lotteryEntries, lotteryHistory, addLotteryEntry, removeLotteryEntry, clearLotteryEntries, addLotteryHistory } = useAppStore();
  const [newName, setNewName] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [displayText, setDisplayText] = useState('');

  const handleAddEntry = () => {
    if (!newName.trim()) {
      toast.error('请输入参与者姓名');
      return;
    }
    addLotteryEntry(newName.trim());
    setNewName('');
  };

  const handleSpin = useCallback(() => {
    if (lotteryEntries.length < 2) {
      toast.error('至少需要2位参与者才能抽奖');
      return;
    }
    setSpinning(true);
    setWinner(null);

    const totalSteps = 20 + Math.floor(Math.random() * 10);
    let step = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * lotteryEntries.length);
      setDisplayText(lotteryEntries[randomIndex].name);
      step++;
      if (step >= totalSteps) {
        clearInterval(interval);
        const winnerIndex = Math.floor(Math.random() * lotteryEntries.length);
        const winnerName = lotteryEntries[winnerIndex].name;
        setDisplayText(winnerName);
        setWinner(winnerName);
        setSpinning(false);
        addLotteryHistory({
          id: crypto.randomUUID(),
          winner: winnerName,
          participants: lotteryEntries.map((e) => e.name),
          timestamp: Date.now(),
        });
        toast.success(`🎉 恭喜 ${winnerName} 中奖！`);
      }
    }, 80 + step * 5);
  }, [lotteryEntries, addLotteryHistory]);

  const handleReset = () => {
    setWinner(null);
    setDisplayText('');
  };

  return (
    <div className="space-y-6">
      {/* Add participants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">添加参与者</CardTitle>
          <CardDescription>输入参与者姓名，至少添加2人</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="输入参与者姓名"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
              className="flex-1"
            />
            <Button onClick={handleAddEntry} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4" />
              添加
            </Button>
          </div>
          {lotteryEntries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lotteryEntries.map((entry) => (
                <Badge key={entry.id} variant="secondary" className="gap-1 px-3 py-1.5">
                  {entry.name}
                  <button
                    onClick={() => removeLotteryEntry(entry.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {lotteryEntries.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearLotteryEntries} className="text-destructive">
              清空所有
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Lottery wheel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">抽奖区</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8">
            <div
              className={`w-48 h-48 rounded-full flex items-center justify-center text-2xl font-bold border-4 transition-all duration-300 ${
                spinning
                  ? 'border-emerald-400 bg-emerald-50 animate-pulse scale-105'
                  : winner
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-105'
                    : 'border-muted bg-muted/30'
              }`}
            >
              {spinning ? (
                <span className="text-emerald-700 animate-bounce">{displayText || '...'}</span>
              ) : winner ? (
                <div className="text-center">
                  <Trophy className="h-8 w-8 mx-auto text-amber-500 mb-1" />
                  <span className="text-emerald-700 text-lg">{winner}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">等待抽奖</span>
              )}
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <Button
              onClick={handleSpin}
              disabled={spinning || lotteryEntries.length < 2}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8"
            >
              {spinning ? (
                <RotateCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Dice1 className="h-4 w-4" />
              )}
              {spinning ? '抽奖中...' : '开始抽奖'}
            </Button>
            {winner && (
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                重新抽奖
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {lotteryHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5" />
              抽奖记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lotteryHistory.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{h.winner}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(h.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WordQuizModule() {
  const {
    wordQuestions,
    currentQuestionIndex,
    wordScore,
    wordStreak,
    wrongWords,
    setWordQuestions,
    nextQuestion,
    incrementScore,
    incrementStreak,
    resetStreak,
    addWrongWord,
    resetWordQuiz,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const currentQuestion = wordQuestions[currentQuestionIndex];
  const isFinished = currentQuestionIndex >= wordQuestions.length && wordQuestions.length > 0;

  const handleGenerateQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: '请生成10个有一定难度的英语单词，用于词汇测试。' },
          ],
          systemPrompt: WORD_QUIZ_PROMPT,
        }),
      });

      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
        setWordQuestions(FALLBACK_WORDS);
        return;
      }

      try {
        const jsonMatch = data.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setWordQuestions(parsed);
        } else {
          setWordQuestions(FALLBACK_WORDS);
        }
      } catch {
        setWordQuestions(FALLBACK_WORDS);
      }
      toast.success('题目已生成，开始答题吧！');
    } catch {
      toast.error('生成失败，使用内置题库');
      setWordQuestions(FALLBACK_WORDS);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);

    if (index === currentQuestion.answer) {
      incrementScore();
      incrementStreak();
      toast.success('回答正确！', { duration: 1000 });
    } else {
      resetStreak();
      addWrongWord(currentQuestion);
      toast.error(`正确答案是：${currentQuestion.options[currentQuestion.answer]}`, { duration: 2000 });
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowResult(false);
    nextQuestion();
  };

  const handleRestart = () => {
    resetWordQuiz();
    setSelectedOption(null);
    setShowResult(false);
    setShowReview(false);
  };

  return (
    <div className="space-y-6">
      {/* Score panel */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold text-emerald-600">{wordScore}</p>
            <p className="text-xs text-muted-foreground">得分</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-5 w-5 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold text-teal-600">{wordStreak}</p>
            <p className="text-xs text-muted-foreground">连击</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-5 w-5 mx-auto text-rose-500 mb-1" />
            <p className="text-2xl font-bold text-rose-600">{wrongWords.length}</p>
            <p className="text-xs text-muted-foreground">错题</p>
          </CardContent>
        </Card>
      </div>

      {/* Generate / Quiz area */}
      {wordQuestions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-4">
            <BookOpen className="h-16 w-16 mx-auto text-emerald-300" />
            <h3 className="text-xl font-semibold">百词斩</h3>
            <p className="text-muted-foreground">AI 智能生成英语词汇测试题</p>
            <Button
              onClick={handleGenerateQuestions}
              disabled={loading}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8"
            >
              {loading ? (
                <Brain className="h-4 w-4 animate-pulse" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? '生成中...' : 'AI生成题目'}
            </Button>
          </CardContent>
        </Card>
      ) : isFinished ? (
        /* Quiz finished */
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <Trophy className="h-16 w-16 mx-auto text-amber-500" />
            <h3 className="text-2xl font-bold">答题完成！</h3>
            <div className="flex justify-center gap-8">
              <div>
                <p className="text-3xl font-bold text-emerald-600">{wordScore}</p>
                <p className="text-sm text-muted-foreground">正确</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-rose-600">{wordQuestions.length - wordScore}</p>
                <p className="text-sm text-muted-foreground">错误</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-teal-600">{Math.round((wordScore / wordQuestions.length) * 100)}%</p>
                <p className="text-sm text-muted-foreground">正确率</p>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={handleRestart} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <RotateCcw className="h-4 w-4" />
                重新开始
              </Button>
              {wrongWords.length > 0 && (
                <Button variant="outline" onClick={() => setShowReview(!showReview)} className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  {showReview ? '隐藏错题' : '复习错题'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Quiz in progress */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                第 {currentQuestionIndex + 1} / {wordQuestions.length} 题
              </CardTitle>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                {wordStreak > 0 ? `${wordStreak} 连击 🔥` : '开始答题'}
              </Badge>
            </div>
            <CardDescription>选择正确的中文释义</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-emerald-700 mb-1">{currentQuestion?.word}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion?.options.map((option, idx) => {
                let btnClass = 'border-2 transition-all h-auto py-3 text-left';
                if (showResult) {
                  if (idx === currentQuestion.answer) {
                    btnClass += ' border-emerald-500 bg-emerald-50 text-emerald-700';
                  } else if (idx === selectedOption) {
                    btnClass += ' border-rose-500 bg-rose-50 text-rose-700';
                  } else {
                    btnClass += ' border-muted opacity-50';
                  }
                } else {
                  btnClass += ' border-muted hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer';
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={showResult}
                    className={btnClass}
                  >
                    <div className="flex items-center gap-3 px-4">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="font-medium">{option}</span>
                      {showResult && idx === currentQuestion.answer && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 ml-auto" />
                      )}
                      {showResult && idx === selectedOption && idx !== currentQuestion.answer && (
                        <XCircle className="h-5 w-5 text-rose-600 ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {showResult && (
              <div className="flex justify-end">
                <Button onClick={handleNext} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  下一题
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {loading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">AI 生成题目中...</Badge>
            </div>
            <Skeleton className="h-8 w-32 mx-auto" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wrong words review */}
      {showReview && wrongWords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-500" />
              错题本
            </CardTitle>
            <CardDescription>这些是你答错的单词，记得复习</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {wrongWords.map((w, i) => (
                <div key={i} className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-700">{w.word}</span>
                    <span className="text-sm text-rose-600">{w.meaning}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
