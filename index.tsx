
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// --- Types ---
type QuestionType = 'multiplication' | 'division';
interface Question {
  id: string;
  type: QuestionType;
  num1: number;
  num2: number;
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  timeTaken?: number; // 초 단위 소요 시간
}
interface QuizSession {
  date: string;
  timestamp: number;
  questions: Question[];
  score: number;
  totalTime: number; // 전체 소요 시간
}

// --- Utils ---
const generateQuestion = (id: string): Question => {
  const type: QuestionType = Math.random() > 0.5 ? 'multiplication' : 'division';
  let num1, num2, answer;
  if (type === 'multiplication') {
    num1 = Math.floor(Math.random() * 90) + 10;
    num2 = Math.floor(Math.random() * 8) + 2;
    answer = num1 * num2;
  } else {
    const quotient = Math.floor(Math.random() * 90) + 10;
    num2 = Math.floor(Math.random() * 8) + 2;
    num1 = quotient * num2;
    answer = quotient;
  }
  return { id, type, num1, num2, answer };
};

const saveQuizSession = (session: QuizSession) => {
  const existing = localStorage.getItem('math_quiz_history');
  const history = existing ? JSON.parse(existing) : [];
  localStorage.setItem('math_quiz_history', JSON.stringify([...history, session].slice(-50)));
};

const getHistory = (): QuizSession[] => {
  const existing = localStorage.getItem('math_quiz_history');
  return existing ? JSON.parse(existing) : [];
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// --- Components ---
const MathKeypad = ({ onKeyPress, onClear, onDelete, onSubmit }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto p-4 bg-white/40 rounded-[32px] shadow-inner">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => key === 'C' ? onClear() : key === '⌫' ? onDelete() : onKeyPress(key)}
          className={`h-16 sm:h-20 text-3xl font-bold rounded-2xl active:scale-90 flex items-center justify-center transition-all ${
            key === 'C' ? 'bg-orange-100 text-orange-600 shadow-sm' : 
            key === '⌫' ? 'bg-red-100 text-red-600 shadow-sm' : 
            'bg-white text-slate-700 shadow-md border-b-4 border-slate-200'
          }`}
        >
          {key}
        </button>
      ))}
      <button 
        onClick={onSubmit} 
        className="col-span-3 h-16 sm:h-20 bg-indigo-500 text-white text-2xl font-black rounded-2xl shadow-lg border-b-6 border-indigo-700 active:scale-95 transition-all mt-2"
      >
        정답 확인!
      </button>
    </div>
  );
};

const HistoryView = ({ onBack }) => {
  const history = [...getHistory()].reverse();
  return (
    <div className="flex-1 bg-sky-50 p-6 flex flex-col fade-in overflow-hidden h-full">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-3 bg-white rounded-full shadow-md mr-4 active:scale-90 transition-transform">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-slate-800 font-jua">나의 도전 기록</h1>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto pb-10 pr-1">
        {history.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-bold">아직 기록이 없어요. 첫 도전을 시작해보세요!</div>
        ) : (
          history.map((session, idx) => (
            <div key={idx} className="bg-white p-5 rounded-[24px] shadow-sm border-l-8 border-indigo-400 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-black text-slate-600">{formatDate(session.date)}</div>
                  <div className="text-xs font-bold text-indigo-400">총 소요 시간: {session.totalTime}초</div>
                </div>
                <div className={`px-4 py-1 rounded-full text-sm font-black ${session.score >= 80 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  {session.score}점
                </div>
              </div>
              <div className="grid grid-cols-10 gap-1.5 mt-3">
                {session.questions.map((q, qIdx) => (
                  <div key={qIdx} className={`h-2.5 rounded-full ${q.isCorrect ? 'bg-green-400' : 'bg-red-300'}`} title={`${q.timeTaken}초`} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [state, setState] = useState('START');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [lastFeedback, setLastFeedback] = useState<{isCorrect: boolean, correctAnswer: number, timeTaken: number} | null>(null);
  const [startTime, setStartTime] = useState(0);

  // 문제 시작 시 타이머 리셋
  useEffect(() => {
    if (state === 'QUIZ') {
      setStartTime(Date.now());
    }
  }, [state, currentIdx]);

  const startQuiz = () => {
    const qList = Array.from({ length: 10 }, (_, i) => generateQuestion(`q-${Date.now()}-${i}`));
    setQuestions(qList);
    setCurrentIdx(0);
    setUserInput('');
    setLastFeedback(null);
    setState('QUIZ');
  };

  const handleSubmit = () => {
    if (userInput === '') return;
    const endTime = Date.now();
    const timeTaken = Math.round((endTime - startTime) / 100) / 10; // 소수점 첫째자리

    const q = questions[currentIdx];
    const userAnsNum = parseInt(userInput);
    const isCorrect = userAnsNum === q.answer;
    
    const updated = [...questions];
    updated[currentIdx] = { ...q, userAnswer: userAnsNum, isCorrect, timeTaken };
    setQuestions(updated);
    setLastFeedback({ isCorrect, correctAnswer: q.answer, timeTaken });
    setState('FEEDBACK');
  };

  if (state === 'START') return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white fade-in text-center">
      <div className="text-8xl mb-6 animate-bounce">✨🧮✨</div>
      <h1 className="text-5xl font-jua mb-4 tracking-tighter">수학 스파크!</h1>
      <p className="text-indigo-100 mb-12 text-xl font-bold leading-relaxed">
        2자리 곱셈/나눗셈 10문제!<br/>기록을 단축해보세요!
      </p>
      <div className="w-full max-w-xs space-y-4">
        <button onClick={startQuiz} className="w-full py-6 bg-white text-indigo-600 text-3xl font-black rounded-[32px] shadow-2xl active:scale-95 border-b-8 border-indigo-200 transition-all">도전 시작!</button>
        <button onClick={() => setState('HISTORY')} className="w-full py-4 bg-indigo-400/30 text-white border-2 border-indigo-200/50 text-xl font-bold rounded-[24px] active:scale-95">기록 보기</button>
      </div>
    </div>
  );

  if (state === 'QUIZ') {
    const q = questions[currentIdx];
    return (
      <div className="flex-1 flex flex-col bg-sky-50 fade-in h-full">
        <div className="p-4 flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <span className="bg-white px-5 py-2 rounded-full shadow-md font-black text-indigo-500 border-2 border-indigo-50 font-jua text-lg">
              {currentIdx + 1} / 10
            </span>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i === currentIdx ? 'bg-indigo-500 ring-4 ring-indigo-200' : i < currentIdx ? (questions[i].isCorrect ? 'bg-green-400' : 'bg-red-400') : 'bg-slate-300'}`} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-[40px] shadow-xl p-8 text-center border-b-8 border-slate-200 flex-1 flex flex-col justify-center min-h-[300px]">
            <div className="text-slate-400 text-lg font-black uppercase font-jua mb-2 tracking-widest">{q.type === 'multiplication' ? '곱하기' : '나누기'}</div>
            <div className="text-6xl font-black text-slate-800 py-6 font-jua flex items-center justify-center gap-4">
              <span>{q.num1}</span>
              <span className="text-indigo-500">{q.type === 'multiplication' ? '×' : '÷'}</span>
              <span>{q.num2}</span>
            </div>
            <div className="text-5xl font-black bg-slate-50 py-6 rounded-3xl border-4 border-dashed border-indigo-100 text-indigo-600 flex items-center justify-center min-h-[100px] shadow-inner font-jua">
              {userInput || '?'}
            </div>
          </div>
        </div>
        <div className="pb-8 px-4 mt-auto">
          <MathKeypad 
            onKeyPress={v => setUserInput(p => (p.length < 5 ? p + v : p))} 
            onClear={() => setUserInput('')} 
            onDelete={() => setUserInput(p => p.slice(0, -1))} 
            onSubmit={handleSubmit} 
          />
        </div>
      </div>
    );
  }

  if (state === 'FEEDBACK') {
    const { isCorrect, correctAnswer, timeTaken } = lastFeedback!;
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 ${isCorrect ? 'animate-rainbow' : 'bg-red-500'}`}>
        <div className="bg-white/95 p-10 rounded-[48px] text-center w-full max-w-md shadow-2xl border-4 border-white scale-in">
          {isCorrect ? (
            <>
              <div className="text-8xl mb-6">🌟🌈</div>
              <h2 className="text-5xl font-black text-indigo-600 mb-2 font-jua sparkle-text">정답! {timeTaken}초!</h2>
              <p className="text-slate-500 text-xl font-bold">정말 대단한 실력이에요!</p>
            </>
          ) : (
            <>
              <div className="text-8xl mb-6">💪💫</div>
              <h2 className="text-4xl font-black text-red-600 mb-3 font-jua leading-tight">조금만 더 힘내요!</h2>
              <p className="text-slate-500 text-xl mb-4 font-bold leading-tight">정답은 <span className="text-red-600 text-3xl">{correctAnswer}</span> 였어요.</p>
              <p className="text-slate-400 font-bold italic">다음에 다시 도전하면 맞출 수 있어요!</p>
            </>
          )}
          <button 
            onClick={() => {
              if (currentIdx < 9) { 
                setCurrentIdx(p => p + 1); 
                setUserInput(''); 
                setLastFeedback(null); 
                setState('QUIZ'); 
              } else { 
                const sc = questions.filter(q => q.isCorrect).length * 10; 
                const total = Math.round(questions.reduce((acc, q) => acc + (q.timeTaken || 0), 0) * 10) / 10;
                saveQuizSession({ 
                  date: new Date().toISOString(), 
                  timestamp: Date.now(), 
                  questions, 
                  score: sc,
                  totalTime: total
                }); 
                setState('SUMMARY'); 
              }
            }} 
            className="w-full py-6 mt-8 bg-indigo-600 text-white text-3xl font-black rounded-[32px] shadow-xl border-b-8 border-indigo-800 active:scale-95 transition-all"
          >
            {currentIdx < 9 ? '다음 문제!' : '결과 보기!'}
          </button>
        </div>
      </div>
    );
  }

  if (state === 'SUMMARY') {
    const sc = questions.filter(q => q.isCorrect).length * 10;
    const totalTime = questions.reduce((acc, q) => acc + (q.timeTaken || 0), 0).toFixed(1);
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-100 fade-in text-center">
        <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl p-10 border-b-8 border-slate-300">
          <div className="text-7xl mb-6">🏆🎖️</div>
          <h2 className="text-3xl font-jua text-slate-800 mb-2">도전 완료!</h2>
          <div className="text-8xl font-black text-indigo-600 mb-4 font-jua tracking-tighter">{sc}<span className="text-4xl ml-2">점</span></div>
          <div className="text-xl font-black text-slate-500 mb-8 bg-slate-50 py-3 rounded-2xl border-2 border-slate-100">
            총 소요 시간: <span className="text-indigo-500">{totalTime}초</span>
          </div>
          <div className="space-y-4">
            <button onClick={startQuiz} className="w-full py-6 bg-indigo-500 text-white text-2xl font-black rounded-[32px] shadow-xl border-b-8 border-indigo-700 active:scale-95 transition-all">한번 더 도전!</button>
            <button onClick={() => setState('START')} className="w-full py-4 bg-slate-200 text-slate-700 text-xl font-bold rounded-[24px] active:scale-95 transition-all">메인 화면으로</button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'HISTORY') return <HistoryView onBack={() => setState('START')} />;
  return null;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
