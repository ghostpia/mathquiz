
import React, { useState, useEffect } from 'react';
import { Question, QuizSession } from './types.ts';
import { generateQuestion, saveQuizSession } from './utils.ts';
import MathKeypad from './components/MathKeypad.tsx';
import HistoryView from './components/HistoryView.tsx';

type AppState = 'START' | 'QUIZ' | 'FEEDBACK' | 'SUMMARY' | 'HISTORY';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('START');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; correctAnswer: number; timeTaken: number } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  // 문제 시작 시 시간 기록
  useEffect(() => {
    if (state === 'QUIZ') {
      setStartTime(Date.now());
    }
  }, [state, currentIdx]);

  const startQuiz = () => {
    const newQuestions = Array.from({ length: 10 }, (_, i) => generateQuestion(`q-${Date.now()}-${i}`));
    setQuestions(newQuestions);
    setCurrentIdx(0);
    setUserInput('');
    setLastFeedback(null);
    setState('QUIZ');
  };

  const handleKeyPress = (key: string) => {
    if (userInput.length < 6) { 
      setUserInput(prev => prev + key);
    }
  };

  const handleClear = () => setUserInput('');
  const handleDelete = () => setUserInput(prev => prev.slice(0, -1));

  const handleSubmit = () => {
    if (userInput === '') return;
    
    const endTime = Date.now();
    const timeTaken = Math.round((endTime - startTime) / 1000 * 10) / 10; // 소수점 첫째자리까지 초 계산

    const currentQuestion = questions[currentIdx];
    const answerValue = parseInt(userInput);
    const isCorrect = answerValue === currentQuestion.answer;
    
    const updatedQuestions = [...questions];
    updatedQuestions[currentIdx] = {
      ...currentQuestion,
      userAnswer: answerValue,
      isCorrect,
      timeTaken
    };
    setQuestions(updatedQuestions);
    setLastFeedback({ isCorrect, correctAnswer: currentQuestion.answer, timeTaken });
    setState('FEEDBACK');
  };

  const nextQuestion = () => {
    if (currentIdx < 9) {
      setCurrentIdx(prev => prev + 1);
      setUserInput('');
      setLastFeedback(null);
      setState('QUIZ');
    } else {
      const correctCount = questions.filter(q => q.isCorrect).length;
      const score = correctCount * 10;
      const totalTime = questions.reduce((acc, q) => acc + (q.timeTaken || 0), 0);
      
      const session: QuizSession = {
        date: new Date().toISOString(),
        timestamp: Date.now(),
        questions: questions,
        score: score,
        totalTime: Math.round(totalTime * 10) / 10
      };
      saveQuizSession(session);
      setState('SUMMARY');
    }
  };

  if (state === 'START') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white fade-in">
        <div className="text-7xl mb-8 animate-bounce">✨🧮✨</div>
        <h1 className="text-5xl font-jua mb-4 tracking-tighter">수학 스파크!</h1>
        <p className="text-indigo-100 text-center mb-12 text-xl opacity-90 leading-relaxed font-bold">
          2자리 연산 10문제 도전!<br/>시간을 단축해 보세요.
        </p>
        <div className="w-full max-w-xs space-y-4">
          <button 
            onClick={startQuiz}
            className="w-full py-6 bg-white text-indigo-600 text-3xl font-black rounded-3xl shadow-2xl active:scale-95 transition-all border-b-8 border-indigo-200"
          >
            도전 시작!
          </button>
          <button 
            onClick={() => setState('HISTORY')}
            className="w-full py-4 bg-indigo-400/30 text-white border-2 border-indigo-200/50 text-xl font-bold rounded-3xl active:scale-95 transition-all"
          >
            나의 기록
          </button>
        </div>
      </div>
    );
  }

  if (state === 'QUIZ') {
    const q = questions[currentIdx];
    return (
      <div className="flex-1 flex flex-col bg-sky-50 fade-in">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-white px-4 py-1.5 rounded-full shadow-md font-black text-indigo-500 border-2 border-indigo-100 font-jua text-sm">
              {currentIdx + 1} / 10
            </div>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${i === currentIdx ? 'bg-indigo-500 ring-2 ring-indigo-200' : i < currentIdx ? (questions[i].isCorrect ? 'bg-green-400' : 'bg-red-400') : 'bg-slate-300'}`} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[32px] shadow-xl p-6 text-center border-b-4 border-slate-200 relative overflow-hidden">
            <div className="text-slate-400 text-sm font-bold mb-1 font-jua">
              {q.type === 'multiplication' ? '곱하기' : '나누기'}
            </div>
            <div className="text-5xl font-black text-slate-800 flex items-center justify-center gap-4 py-4 font-jua">
              <span>{q.num1}</span>
              <span className="text-indigo-500">{q.type === 'multiplication' ? '×' : '÷'}</span>
              <span>{q.num2}</span>
            </div>
            <div className="text-4xl font-black bg-slate-50 py-5 rounded-2xl border-2 border-dashed border-indigo-100 text-indigo-600 min-h-[80px] flex items-center justify-center shadow-inner">
              {userInput || '?'}
            </div>
          </div>
        </div>

        <div className="mt-auto pb-4">
          <MathKeypad onKeyPress={handleKeyPress} onClear={handleClear} onDelete={handleDelete} onSubmit={handleSubmit} />
        </div>
      </div>
    );
  }

  if (state === 'FEEDBACK') {
    const { isCorrect, correctAnswer, timeTaken } = lastFeedback!;
    const q = questions[currentIdx];
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 ${isCorrect ? 'animate-rainbow' : 'bg-red-500'}`}>
        <div className="bg-white/95 p-8 rounded-[40px] text-center w-full max-w-md shadow-2xl scale-in border-4 border-white">
          {isCorrect ? (
            <>
              <div className="text-7xl mb-4">🌟🌈</div>
              <h2 className="text-4xl font-black text-indigo-600 mb-2 font-jua sparkle-text">정답! {timeTaken}초 컷!</h2>
              <div className="text-2xl font-black bg-indigo-50 text-indigo-600 py-4 rounded-2xl mb-6 border-2 border-indigo-100 font-jua">
                {q.num1} {q.type === 'multiplication' ? '×' : '÷'} {q.num2} = {correctAnswer}
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">💪💫</div>
              <h2 className="text-3xl font-black text-red-600 mb-2 font-jua">다음엔 더 빨리!</h2>
              <p className="text-slate-500 text-lg mb-4 font-bold">정답은 <span className="text-red-600">{correctAnswer}</span> 이었어요.</p>
            </>
          )}

          <button 
            onClick={nextQuestion}
            className={`w-full py-5 text-2xl font-black rounded-3xl shadow-xl active:scale-95 transition-all border-b-6 ${isCorrect ? 'bg-indigo-600 text-white border-indigo-800' : 'bg-slate-800 text-white border-slate-950'}`}
          >
            {currentIdx < 9 ? '다음 문제!' : '결과 보기!'}
          </button>
        </div>
      </div>
    );
  }

  if (state === 'SUMMARY') {
    const correctCount = questions.filter(q => q.isCorrect).length;
    const score = correctCount * 10;
    const totalTime = questions.reduce((acc, q) => acc + (q.timeTaken || 0), 0).toFixed(1);
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-100 fade-in text-center">
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 border-b-8 border-slate-300">
          <div className="text-6xl mb-4">🏆🎖️</div>
          <h2 className="text-3xl font-jua text-slate-800 mb-1">도전 완료!</h2>
          <div className="text-7xl font-black text-indigo-600 mb-4 font-jua">{score}<span className="text-3xl ml-1">점</span></div>
          <p className="text-slate-500 font-bold mb-6 text-xl">총 소요 시간: <span className="text-indigo-500">{totalTime}초</span></p>
          <div className="flex flex-col gap-3">
            <button onClick={startQuiz} className="py-5 bg-indigo-500 text-white text-xl font-black rounded-3xl shadow-xl active:scale-95 border-b-6 border-indigo-700">한번 더!</button>
            <button onClick={() => setState('START')} className="py-4 bg-slate-200 text-slate-700 text-lg font-bold rounded-3xl active:scale-95">메인으로</button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'HISTORY') {
    return <HistoryView onBack={() => setState('START')} />;
  }

  return null;
};

export default App;
