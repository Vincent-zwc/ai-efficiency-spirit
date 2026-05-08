'use client';

import { useAppStore, type ModuleType } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Users,
  CheckSquare,
  BarChart3,
  Sparkles,
  Menu,
  X,
  Home,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

import DocumentAssistant from '@/components/modules/DocumentAssistant';
import MeetingAssistant from '@/components/modules/MeetingAssistant';
import TodoManager from '@/components/modules/TodoManager';
import DataReport from '@/components/modules/DataReport';
import CreativeWorkshop from '@/components/modules/CreativeWorkshop';

const NAV_ITEMS: { id: ModuleType; label: string; icon: React.ReactNode; description: string; color: string }[] = [
  {
    id: 'document',
    label: '智能文档助手',
    icon: <FileText className="h-5 w-5" />,
    description: 'AI 文档处理，摘要、关键点、格式化',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'meeting',
    label: '会议智能助手',
    icon: <Users className="h-5 w-5" />,
    description: '智能生成会议纪要和跟进计划',
    color: 'bg-teal-100 text-teal-700',
  },
  {
    id: 'todo',
    label: '智能待办管家',
    icon: <CheckSquare className="h-5 w-5" />,
    description: 'AI 任务排序与智能分解',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'data',
    label: '数据报表助手',
    icon: <BarChart3 className="h-5 w-5" />,
    description: '数据可视化与 AI 智能分析',
    color: 'bg-rose-100 text-rose-700',
  },
  {
    id: 'creative',
    label: '创意工坊',
    icon: <Sparkles className="h-5 w-5" />,
    description: '幸运抽奖与百词斩',
    color: 'bg-purple-100 text-purple-700',
  },
];

function Dashboard({ onSelect }: { onSelect: (id: ModuleType) => void }) {
  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 mb-4">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">AI 赋能 · 效率至上</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">欢迎来到 AI 效率精灵</h1>
        <p className="text-muted-foreground text-lg">选择一个模块开始使用，让 AI 提升你的工作效率</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {NAV_ITEMS.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer card-hover border-2 hover:border-emerald-200 transition-colors"
            onClick={() => onSelect(item.id)}
          >
            <CardHeader>
              <div className={`p-3 rounded-xl w-fit ${item.color}`}>
                {item.icon}
              </div>
              <CardTitle className="text-lg mt-3">{item.label}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                进入使用 →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ModuleContent({ module }: { module: ModuleType }) {
  switch (module) {
    case 'document':
      return <DocumentAssistant />;
    case 'meeting':
      return <MeetingAssistant />;
    case 'todo':
      return <TodoManager />;
    case 'data':
      return <DataReport />;
    case 'creative':
      return <CreativeWorkshop />;
    case 'dashboard':
    default:
      return <Dashboard onSelect={(id) => useAppStore.getState().setActiveModule(id)} />;
  }
}

export default function HomePage() {
  const { activeModule, setActiveModule } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentNav = NAV_ITEMS.find((n) => n.id === activeModule);

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] sidebar-gradient text-white flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo / App name */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI 效率精灵</h1>
              <p className="text-sm text-slate-400">智能个人工作台</p>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => {
              setActiveModule('dashboard');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
              activeModule === 'dashboard'
                ? 'bg-emerald-600/20 text-emerald-400'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">工作台首页</span>
          </button>

          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeModule === item.id
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            AI 效率精灵 v1.0
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              {currentNav ? (
                <>
                  <div className={`p-1.5 rounded-lg ${currentNav.color}`}>
                    {currentNav.icon}
                  </div>
                  <h2 className="font-semibold text-lg">{currentNav.label}</h2>
                </>
              ) : (
                <>
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Home className="h-4 w-4" />
                  </div>
                  <h2 className="font-semibold text-lg">工作台首页</h2>
                </>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground hidden sm:block">
            AI 赋能 · 效率至上
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-5xl mx-auto animate-fade-in-up" key={activeModule}>
            <ModuleContent module={activeModule} />
          </div>
        </main>
      </div>
    </div>
  );
}
