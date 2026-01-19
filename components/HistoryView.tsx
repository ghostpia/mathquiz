
import React from 'react';
import { QuizSession } from '../types.ts';
import { getHistory, formatDate } from '../utils.ts';

const HistoryView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const history = [...getHistory()].reverse();

  return (
    <div className="flex-1 bg-sky-50 p-6 flex flex-col fade-in overflow-hidden h-full">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="p-2 bg-white rounded-full shadow-sm mr-4"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-slate-800 font-jua">나의 도전 기록</h1>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pb-10">
        {history.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p>기록이 없어요!</p>
          </div>
        ) : (
          history.map((session, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border-l-8 border-indigo-400">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-bold text-slate-500">{formatDate(session.date)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${session.score >= 80 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  {session.score}점
                </span>
              </div>
              <div className="text-xs font-bold text-indigo-400 mb-3">
                기록: {session.totalTime}초
              </div>
              <div className="grid grid-cols-10 gap-1">
                {session.questions.map((q, qIdx) => (
                  <div 
                    key={qIdx} 
                    className={`h-2 rounded-full ${q.isCorrect ? 'bg-green-400' : 'bg-red-300'}`}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;
