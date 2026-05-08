import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type ModuleType = 'dashboard' | 'document' | 'meeting' | 'todo' | 'data' | 'creative';

export type TodoPriority = '高' | '中' | '低';

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: number;
  subtasks?: string[];
}

export interface LotteryEntry {
  id: string;
  name: string;
}

export interface LotteryHistory {
  id: string;
  winner: string;
  participants: string[];
  timestamp: number;
}

export interface WordQuestion {
  word: string;
  meaning: string;
  options: string[];
  answer: number;
}

export interface AppState {
  // Active module
  activeModule: ModuleType;

  // Todos
  todos: TodoItem[];
  todoFilter: 'all' | 'active' | 'completed';

  // Lottery
  lotteryEntries: LotteryEntry[];
  lotteryHistory: LotteryHistory[];

  // Word quiz
  wordQuestions: WordQuestion[];
  currentQuestionIndex: number;
  wordScore: number;
  wordStreak: number;
  wrongWords: WordQuestion[];

  // Actions - Module
  setActiveModule: (module: ModuleType) => void;

  // Actions - Todos
  addTodo: (title: string, description: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodoPriority: (id: string, priority: TodoPriority) => void;
  setTodoSubtasks: (id: string, subtasks: string[]) => void;
  replaceTodos: (todos: TodoItem[]) => void;
  setTodoFilter: (filter: 'all' | 'active' | 'completed') => void;

  // Actions - Lottery
  addLotteryEntry: (name: string) => void;
  removeLotteryEntry: (id: string) => void;
  clearLotteryEntries: () => void;
  addLotteryHistory: (entry: LotteryHistory) => void;

  // Actions - Word quiz
  setWordQuestions: (questions: WordQuestion[]) => void;
  nextQuestion: () => void;
  incrementScore: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addWrongWord: (question: WordQuestion) => void;
  resetWordQuiz: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      activeModule: 'dashboard',
      todos: [],
      todoFilter: 'all',
      lotteryEntries: [],
      lotteryHistory: [],
      wordQuestions: [],
      currentQuestionIndex: 0,
      wordScore: 0,
      wordStreak: 0,
      wrongWords: [],

      // Module actions
      setActiveModule: (module) => set({ activeModule: module }),

      // Todo actions
      addTodo: (title, description) =>
        set((state) => ({
          todos: [
            {
              id: crypto.randomUUID(),
              title,
              description,
              completed: false,
              priority: '中' as TodoPriority,
              createdAt: Date.now(),
              subtasks: [],
            },
            ...state.todos,
          ],
        })),

      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        })),

      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),

      updateTodoPriority: (id, priority) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, priority } : todo
          ),
        })),

      setTodoSubtasks: (id, subtasks) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, subtasks } : todo
          ),
        })),

      replaceTodos: (todos) => set({ todos }),

      setTodoFilter: (filter) => set({ todoFilter: filter }),

      // Lottery actions
      addLotteryEntry: (name) =>
        set((state) => ({
          lotteryEntries: [
            ...state.lotteryEntries,
            { id: crypto.randomUUID(), name },
          ],
        })),

      removeLotteryEntry: (id) =>
        set((state) => ({
          lotteryEntries: state.lotteryEntries.filter((e) => e.id !== id),
        })),

      clearLotteryEntries: () => set({ lotteryEntries: [] }),

      addLotteryHistory: (entry) =>
        set((state) => ({
          lotteryHistory: [entry, ...state.lotteryHistory],
        })),

      // Word quiz actions
      setWordQuestions: (questions) =>
        set({ wordQuestions: questions, currentQuestionIndex: 0 }),

      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        })),

      incrementScore: () =>
        set((state) => ({ wordScore: state.wordScore + 1 })),

      incrementStreak: () =>
        set((state) => ({ wordStreak: state.wordStreak + 1 })),

      resetStreak: () => set({ wordStreak: 0 }),

      addWrongWord: (question) =>
        set((state) => ({
          wrongWords: [...state.wrongWords, question],
        })),

      resetWordQuiz: () =>
        set({
          wordQuestions: [],
          currentQuestionIndex: 0,
          wordScore: 0,
          wordStreak: 0,
        }),
    }),
    {
      name: 'ai-efficiency-store',
      partialize: (state) => ({
        todos: state.todos,
        todoFilter: state.todoFilter,
        lotteryEntries: state.lotteryEntries,
        lotteryHistory: state.lotteryHistory,
        wordScore: state.wordScore,
        wrongWords: state.wrongWords,
      }),
    }
  )
);
