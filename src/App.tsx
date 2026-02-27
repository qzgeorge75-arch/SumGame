/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Clock, 
  Zap, 
  Pause, 
  Home,
  ChevronRight,
  AlertCircle,
  Languages
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { 
  Block, 
  GameMode, 
  GRID_COLS, 
  GRID_ROWS, 
  INITIAL_ROWS, 
  MAX_VALUE, 
  TIME_LIMIT 
} from './types';

// --- Translations ---

const translations = {
  zh: {
    title: "数字消消乐",
    subtitle: "掌握数学，消除方块",
    classicMode: "经典模式",
    classicDesc: "每次消除后新增一行。挑战生存极限。",
    timeMode: "计时模式",
    timeDesc: "在时间耗尽前完成匹配，否则新增一行。",
    bestScore: "最高分",
    score: "得分",
    target: "目标",
    time: "时间",
    sum: "当前和",
    paused: "已暂停",
    resume: "继续游戏",
    gameOver: "你输了",
    reachedTop: "方块触顶了！",
    finalScore: "最终得分",
    tryAgain: "再试一次",
    mainMenu: "主菜单",
    classicFooter: "经典模式：消除后新增一行",
    timeFooter: "计时模式：每10秒新增一行",
    dangerZone: "危险区域",
  },
  en: {
    title: "SUM BLAST",
    subtitle: "Master the math, clear the grid.",
    classicMode: "Classic Mode",
    classicDesc: "Add rows after every match. Survive as long as you can.",
    timeMode: "Time Mode",
    timeDesc: "Match before the clock runs out or a new row appears.",
    bestScore: "Best Score",
    score: "Score",
    target: "Target",
    time: "Time",
    sum: "Sum",
    paused: "PAUSED",
    resume: "RESUME",
    gameOver: "YOU LOST",
    reachedTop: "The numbers reached the top!",
    finalScore: "Final Score",
    tryAgain: "TRY AGAIN",
    mainMenu: "MAIN MENU",
    classicFooter: "Classic Mode: Rows add after matches",
    timeFooter: "Time Mode: Rows add every 10 seconds",
    dangerZone: "DANGER ZONE",
  }
};

type Language = 'zh' | 'en';

// --- Helper Functions ---

const generateId = () => Math.random().toString(36).substring(2, 9);

const createBlock = (row: number, col: number, isNew = false): Block => ({
  id: generateId(),
  value: Math.floor(Math.random() * MAX_VALUE) + 1,
  row,
  col,
  isNew
});

const createInitialGrid = (): (Block | null)[][] => {
  const grid: (Block | null)[][] = Array.from({ length: GRID_ROWS }, () => 
    Array.from({ length: GRID_COLS }, () => null)
  );

  for (let r = GRID_ROWS - INITIAL_ROWS; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      grid[r][c] = createBlock(r, c);
    }
  }
  return grid;
};

const getRandomTarget = () => Math.floor(Math.random() * 15) + 10;

// --- Components ---

const KittenTitle = ({ text }: { text: string }) => (
  <motion.div 
    initial={{ opacity: 0.01, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="relative inline-block mb-8 md:mb-12 z-10"
  >
    {/* Ears */}
    <motion.div 
      animate={{ rotate: [-12, -15, -12] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-4 md:-top-8 left-4 md:left-6 w-8 h-8 md:w-12 md:h-12 bg-rose-400 rounded-tr-[1.5rem] md:rounded-tr-[2rem] shadow-lg" 
    />
    <motion.div 
      animate={{ rotate: [12, 15, 12] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      className="absolute -top-4 md:-top-8 right-4 md:right-6 w-8 h-8 md:w-12 md:h-12 bg-rose-400 rounded-tl-[1.5rem] md:rounded-tl-[2rem] shadow-lg" 
    />
    
    {/* Main Body (Head) */}
    <div className="relative bg-rose-400 px-6 py-4 md:px-12 md:py-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-rose-300/50 border-2 md:border-4 border-white/20 min-w-[240px] md:min-w-[400px]">
      <h1 className="text-3xl md:text-7xl font-black tracking-tighter drop-shadow-md font-serif italic whitespace-nowrap">
        <span className="bg-gradient-to-r from-yellow-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent [-webkit-background-clip:text] [background-clip:text] selection:bg-rose-200">
          {text}
        </span>
      </h1>
      
      {/* Whiskers Left */}
      <div className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 space-y-2 md:space-y-3">
        <div className="w-4 md:w-8 h-1 md:h-1.5 bg-rose-200/60 rounded-full transform -rotate-12" />
        <div className="w-6 md:w-10 h-1 md:h-1.5 bg-rose-200/60 rounded-full" />
        <div className="w-4 md:w-8 h-1 md:h-1.5 bg-rose-200/60 rounded-full transform rotate-12" />
      </div>
      
      {/* Whiskers Right */}
      <div className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 space-y-2 md:space-y-3">
        <div className="w-4 md:w-8 h-1 md:h-1.5 bg-rose-200/60 rounded-full transform rotate-12" />
        <div className="w-6 md:w-10 h-1 md:h-1.5 bg-rose-200/60 rounded-full" />
        <div className="w-4 md:w-8 h-1 md:h-1.5 bg-rose-200/60 rounded-full transform -rotate-12" />
      </div>

      {/* Eyes (Simple dots) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-6 md:gap-12 opacity-20">
        <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full" />
        <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full" />
      </div>
    </div>

    {/* Tail */}
    <motion.div 
      animate={{ rotate: [0, 10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -right-6 md:-right-10 -bottom-2 md:-bottom-4 w-10 h-4 md:w-16 md:h-6 bg-rose-300 rounded-full origin-left -z-10 shadow-md"
    />
  </motion.div>
);

const NumberBlock = ({ 
  block, 
  isSelected, 
  onClick 
}: { 
  block: Block; 
  isSelected: boolean; 
  onClick: (block: Block) => void 
}) => {
  // Vibrant colors based on value
  const colors: Record<number, string> = {
    1: 'bg-blue-400',
    2: 'bg-emerald-400',
    3: 'bg-amber-400',
    4: 'bg-rose-400',
    5: 'bg-violet-400',
    6: 'bg-cyan-400',
    7: 'bg-orange-400',
    8: 'bg-fuchsia-400',
    9: 'bg-indigo-400',
  };

  return (
    <motion.div
      layout
      initial={block.isNew ? { scale: 0, opacity: 0, y: 50 } : false}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={() => onClick(block)}
      className={cn(
        "relative w-full h-full flex items-center justify-center rounded-lg md:rounded-xl cursor-pointer select-none text-white font-black text-lg md:text-3xl shadow-lg transition-all border-b-2 md:border-b-4 border-black/10",
        colors[block.value] || 'bg-gray-400',
        isSelected && "ring-2 md:ring-4 ring-white ring-offset-1 md:ring-offset-2 ring-offset-rose-100 scale-90 brightness-110 z-10 border-b-0 translate-y-1",
        !isSelected && "hover:scale-105 active:scale-95"
      )}
    >
      {block.value}
      {isSelected && (
        <motion.div 
          layoutId="selection-glow"
          className="absolute inset-0 bg-white/30 rounded-lg md:rounded-xl"
        />
      )}
    </motion.div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [mode, setMode] = useState<GameMode>('classic');
  const [grid, setGrid] = useState<(Block | null)[][]>([]);
  const [target, setTarget] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const t = translations[lang];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game
  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setGrid(createInitialGrid());
    setTarget(getRandomTarget());
    setScore(0);
    setSelectedIds([]);
    setTimeLeft(TIME_LIMIT);
    setGameState('playing');
    setIsPaused(false);
  };

  const checkGameOver = useCallback((currentGrid: (Block | null)[][]) => {
    for (let c = 0; c < GRID_COLS; c++) {
      if (currentGrid[0][c] !== null) return true;
    }
    return false;
  }, []);

  const addNewRow = useCallback(() => {
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      
      // Shift everything up
      for (let r = 0; r < GRID_ROWS - 1; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const block = newGrid[r + 1][c];
          if (block) {
            newGrid[r][c] = { ...block, row: r };
          } else {
            newGrid[r][c] = null;
          }
        }
      }

      // Add new row at bottom
      for (let c = 0; c < GRID_COLS; c++) {
        newGrid[GRID_ROWS - 1][c] = createBlock(GRID_ROWS - 1, c, true);
      }

      if (checkGameOver(newGrid)) {
        setGameState('gameover');
      }

      return newGrid;
    });
  }, [checkGameOver]);

  // Handle block selection
  const handleBlockClick = (block: Block) => {
    if (isPaused) return;

    setSelectedIds(prev => {
      if (prev.includes(block.id)) {
        return prev.filter(id => id !== block.id);
      }
      return [...prev, block.id];
    });
  };

  // Calculate current sum
  const currentSum = grid.flat().filter(b => b && selectedIds.includes(b.id)).reduce((acc, b) => acc + (b?.value || 0), 0);

  // Check sum
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;
    
    // Only check if user has actually selected something
    if (selectedIds.length === 0) return;

    if (currentSum === target) {
      const selectedBlocks = grid.flat().filter(b => b && selectedIds.includes(b.id)) as Block[];
      setScore(prev => prev + selectedBlocks.length * 10);
      
      setGrid(prev => {
        const newGrid = prev.map(row => row.map(b => (b && selectedIds.includes(b.id) ? null : b)));
        
        // Apply gravity
        for (let c = 0; c < GRID_COLS; c++) {
          let emptyRow = GRID_ROWS - 1;
          for (let r = GRID_ROWS - 1; r >= 0; r--) {
            if (newGrid[r][c]) {
              const block = newGrid[r][c]!;
              newGrid[r][c] = null;
              newGrid[emptyRow][c] = { ...block, row: emptyRow };
              emptyRow--;
            }
          }
        }
        return newGrid;
      });

      setSelectedIds([]);
      setTarget(getRandomTarget());
      
      if (mode === 'classic') {
        addNewRow();
      } else {
        setTimeLeft(TIME_LIMIT);
      }

      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
      });

    } else if (currentSum > target) {
      setSelectedIds([]);
    }
  }, [currentSum, target, grid, selectedIds, mode, addNewRow, gameState, isPaused]);

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing' && mode === 'time' && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            addNewRow();
            return TIME_LIMIT;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, mode, isPaused, addNewRow]);

  // High score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  const toggleLang = () => setLang(prev => prev === 'zh' ? 'en' : 'zh');

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-rose-50 text-slate-800 flex flex-col items-center justify-center p-6 font-sans">
        <button 
          onClick={toggleLang}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-rose-100 hover:bg-rose-100 transition-colors font-bold text-rose-500 z-50"
        >
          <Languages className="w-4 h-4" />
          {lang === 'zh' ? 'English' : '中文'}
        </button>

        <div className="max-w-md w-full text-center space-y-8">
          <KittenTitle text={t.title} />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-rose-400 font-bold text-lg"
          >
            {t.subtitle}
          </motion.p>

          <div className="grid gap-4">
            <button 
              onClick={() => startGame('classic')}
              className="group relative flex items-center justify-between p-6 bg-white border-2 border-rose-100 rounded-3xl hover:border-rose-400 transition-all text-left shadow-xl shadow-rose-200/50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-black text-2xl text-rose-600">
                  <Zap className="w-6 h-6 fill-rose-500" />
                  {t.classicMode}
                </div>
                <p className="text-sm text-slate-400 font-medium">{t.classicDesc}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-rose-200 group-hover:text-rose-500 transition-colors" />
            </button>

            <button 
              onClick={() => startGame('time')}
              className="group relative flex items-center justify-between p-6 bg-white border-2 border-rose-100 rounded-3xl hover:border-emerald-400 transition-all text-left shadow-xl shadow-rose-200/50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-black text-2xl text-emerald-600">
                  <Clock className="w-6 h-6 fill-emerald-500" />
                  {t.timeMode}
                </div>
                <p className="text-sm text-slate-400 font-medium">{t.timeDesc}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-rose-200 group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>

          {highScore > 0 && (
            <div className="flex items-center justify-center gap-2 text-rose-400 font-black">
              <Trophy className="w-5 h-5 text-amber-400 fill-amber-400" />
              {t.bestScore}: {highScore}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50 text-slate-800 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="p-4 md:p-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setGameState('menu')}
            className="p-3 hover:bg-rose-50 rounded-2xl transition-colors text-rose-500"
          >
            <Home className="w-6 h-6" />
          </button>
          <div className="space-y-0">
            <div className="text-[10px] font-black text-rose-300 uppercase tracking-widest leading-none">{t.score}</div>
            <div className="text-2xl font-black tabular-nums text-slate-700">{score}</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-0.5 leading-none">{t.target}</div>
          <motion.div 
            key={target}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black text-rose-500"
          >
            {target}
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          {mode === 'time' && (
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-black text-rose-300 uppercase tracking-widest leading-none">{t.time}</div>
              <div className={cn(
                "text-2xl font-black tabular-nums",
                timeLeft <= 3 ? "text-rose-500 animate-pulse" : "text-emerald-500"
              )}>
                {timeLeft}s
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl transition-colors shadow-lg shadow-rose-200"
          >
            {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden">
        <div className="w-full max-w-[450px] flex-1 flex flex-col max-h-[85vh] relative">
          <div className="flex-1 relative">
            {/* Grid Background */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-10 gap-1 md:gap-2 p-2 md:p-3 bg-white/50 rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 border-white shadow-inner overflow-hidden">
              {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => {
                const row = Math.floor(i / GRID_COLS);
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "rounded-lg md:rounded-xl",
                      row === 0 ? "bg-rose-500/10" : "bg-rose-100/30"
                    )} 
                  />
                );
              })}
              
              {/* Danger Zone Label */}
              <div className="absolute top-2 md:top-3 left-2 md:left-3 right-2 md:right-3 h-[calc(10%-4px)] md:h-[calc(10%-8px)] flex items-center justify-center pointer-events-none">
                <span className="text-[8px] md:text-[10px] font-black text-rose-500/40 uppercase tracking-[0.2em] md:tracking-[0.3em] animate-pulse">
                  {t.dangerZone}
                </span>
              </div>
            </div>

            {/* Blocks */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-10 gap-1 md:gap-2 p-2 md:p-3">
              <AnimatePresence mode="popLayout">
                {grid.flat().map((block) => block && (
                  <motion.div 
                    key={block.id}
                    layout
                    style={{ 
                      gridRow: block.row + 1, 
                      gridColumn: block.col + 1 
                    }}
                    className="w-full h-full"
                  >
                    <NumberBlock 
                      block={block}
                      isSelected={selectedIds.includes(block.id)}
                      onClick={handleBlockClick}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Current Selection Indicator */}
          <div className="h-16 md:h-20 flex items-center justify-center">
            <div className={cn(
              "px-4 md:px-8 py-2 md:py-3 rounded-full font-black text-base md:text-xl flex items-center gap-2 md:gap-4 transition-all",
              selectedIds.length > 0 ? "bg-white border-2 border-rose-100 opacity-100 scale-100 shadow-xl" : "opacity-0 scale-90"
            )}>
              <span className="text-rose-300">{t.sum}:</span>
              <span className={cn(
                "text-xl md:text-3xl font-black",
                currentSum > target ? "text-rose-500" : "text-slate-700"
              )}>
                {currentSum}
              </span>
              <span className="text-rose-100">/</span>
              <span className="text-rose-500">{target}</span>
            </div>
          </div>
        </div>

        {/* Pause Overlay */}
        <AnimatePresence>
          {isPaused && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-rose-50/80 backdrop-blur-md flex items-center justify-center p-6"
            >
              <div className="text-center space-y-6">
                <h2 className="text-5xl font-black text-rose-500">{t.paused}</h2>
                <button 
                  onClick={() => setIsPaused(false)}
                  className="w-full py-5 px-12 bg-rose-500 hover:bg-rose-600 text-white rounded-3xl font-black text-2xl transition-all shadow-xl shadow-rose-200"
                >
                  {t.resume}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameState === 'gameover' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-[60] bg-rose-50/95 flex items-center justify-center p-6"
            >
              <div className="max-w-sm w-full text-center space-y-8">
                <div className="space-y-2">
                  <div className="inline-flex p-6 bg-rose-500/10 rounded-full text-rose-500 mb-4">
                    <AlertCircle className="w-16 h-16" />
                  </div>
                  <h2 className="text-5xl font-black text-rose-500">{t.gameOver}</h2>
                  <p className="text-rose-400 font-bold text-xl">{t.reachedTop}</p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 space-y-6 border-2 border-rose-100 shadow-2xl shadow-rose-200">
                  <div className="flex justify-between items-center">
                    <span className="text-rose-300 font-black uppercase tracking-widest">{t.finalScore}</span>
                    <span className="text-4xl font-black text-slate-700">{score}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-rose-300 font-black uppercase tracking-widest">{t.bestScore}</span>
                    <span className="text-2xl font-black text-amber-500">{highScore}</span>
                  </div>
                </div>

                <div className="grid gap-4">
                  <button 
                    onClick={() => startGame(mode)}
                    className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-3xl font-black text-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-200"
                  >
                    <RotateCcw className="w-6 h-6" />
                    {t.tryAgain}
                  </button>
                  <button 
                    onClick={() => setGameState('menu')}
                    className="w-full py-5 bg-white hover:bg-rose-50 text-rose-500 border-2 border-rose-100 rounded-3xl font-black text-2xl transition-all shadow-lg shadow-rose-100"
                  >
                    {t.mainMenu}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="p-6 text-center text-xs text-rose-300 font-black uppercase tracking-[0.2em]">
        {mode === 'classic' ? t.classicFooter : t.timeFooter}
      </footer>
    </div>
  );
}
