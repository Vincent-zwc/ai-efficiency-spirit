'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Brain, TrendingUp, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const SYSTEM_PROMPT = '你是一个数据分析助手。请分析提供的数据，给出关键洞察、趋势分析和建议。请用中文回复，结构清晰。';

// Sample monthly sales data
const salesData = [
  { month: '1月', 销售额: 42000, 利润: 12600, 客户数: 320, 订单数: 450 },
  { month: '2月', 销售额: 38000, 利润: 10640, 客户数: 290, 订单数: 410 },
  { month: '3月', 销售额: 51000, 利润: 16320, 客户数: 380, 订单数: 530 },
  { month: '4月', 销售额: 47000, 利润: 14100, 客户数: 350, 订单数: 490 },
  { month: '5月', 销售额: 55000, 利润: 18700, 客户数: 410, 订单数: 580 },
  { month: '6月', 销售额: 62000, 利润: 21700, 客户数: 460, 订单数: 650 },
  { month: '7月', 销售额: 58000, 利润: 19720, 客户数: 430, 订单数: 610 },
  { month: '8月', 销售额: 67000, 利润: 24120, 客户数: 500, 订单数: 720 },
  { month: '9月', 销售额: 63000, 利润: 22050, 客户数: 470, 订单数: 680 },
  { month: '10月', 销售额: 71000, 利润: 26270, 客户数: 530, 订单数: 770 },
  { month: '11月', 销售额: 78000, 利润: 29640, 客户数: 580, 订单数: 850 },
  { month: '12月', 销售额: 85000, 利润: 34000, 客户数: 640, 订单数: 920 },
];

export default function DataReport() {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAIAnalysis = async () => {
    setLoading(true);
    setAnalysis('');

    try {
      const dataStr = salesData
        .map((d) => `${d.month}: 销售额${d.销售额}元, 利润${d.利润}元, 客户数${d.客户数}, 订单数${d.订单数}`)
        .join('\n');

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `请分析以下年度月度销售数据，给出关键洞察、趋势分析和改进建议：\n${dataStr}`,
            },
          ],
          systemPrompt: SYSTEM_PROMPT,
        }),
      });

      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setAnalysis(data.content);
    } catch {
      toast.error('分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(analysis);
    setCopied(true);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  };

  // Summary stats
  const totalSales = salesData.reduce((sum, d) => sum + d.销售额, 0);
  const totalProfit = salesData.reduce((sum, d) => sum + d.利润, 0);
  const avgCustomers = Math.round(salesData.reduce((sum, d) => sum + d.客户数, 0) / salesData.length);
  const totalOrders = salesData.reduce((sum, d) => sum + d.订单数, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">数据报表助手</h2>
          <p className="text-muted-foreground">可视化数据展示，AI 智能分析与洞察</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">总销售额</p>
            <p className="text-2xl font-bold text-emerald-600">¥{(totalSales / 10000).toFixed(1)}万</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">总利润</p>
            <p className="text-2xl font-bold text-teal-600">¥{(totalProfit / 10000).toFixed(1)}万</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">平均客户数</p>
            <p className="text-2xl font-bold text-amber-600">{avgCustomers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">总订单数</p>
            <p className="text-2xl font-bold text-rose-600">{totalOrders}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">月度销售额与利润</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="销售额" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="利润" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">客户数与订单数趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="客户数" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="订单数" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">详细数据表</CardTitle>
            <CardDescription>年度月度销售明细数据</CardDescription>
          </div>
          <Button
            onClick={handleAIAnalysis}
            disabled={loading}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? (
              <TrendingUp className="h-4 w-4 animate-pulse" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            AI智能分析
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>月份</TableHead>
                  <TableHead className="text-right">销售额</TableHead>
                  <TableHead className="text-right">利润</TableHead>
                  <TableHead className="text-right">客户数</TableHead>
                  <TableHead className="text-right">订单数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell className="text-right">¥{row.销售额.toLocaleString()}</TableCell>
                    <TableCell className="text-right">¥{row.利润.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{row.客户数}</TableCell>
                    <TableCell className="text-right">{row.订单数}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis result */}
      {loading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">AI 分析中...</Badge>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && !loading && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">AI 分析结果</CardTitle>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                <Brain className="h-3 w-3 mr-1" />
                智能洞察
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
