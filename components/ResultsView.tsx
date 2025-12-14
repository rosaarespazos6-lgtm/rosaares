import React, { useMemo, useState } from 'react';
import { Question } from '../types';
import { Button } from './Button';
import { Trophy, RefreshCw, FileText, Check, X, AlertCircle } from 'lucide-react';

interface ResultsViewProps {
  questions: Question[];
  userAnswers: Record<number, number | string>;
  onRetry: () => void;
  onViewList: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ 
  questions, 
  userAnswers, 
  onRetry,
  onViewList
}) => {
  const [showReview, setShowReview] = useState(false);
  const letters = ['A', 'B', 'C', 'D'];

  const checkAnswer = (q: Question, answer: number | string | undefined): 'correct' | 'incorrect' | 'unanswered' => {
    if (answer === undefined) return 'unanswered';
    
    if (q.type === 'short_answer') {
      const userStr = String(answer).trim().toLowerCase();
      const correctStr = (q.correctAnswer || '').trim().toLowerCase();
      // Simple normalization check
      return userStr === correctStr ? 'correct' : 'incorrect';
    }
    
    // For MC and True/False
    return answer === q.correctIndex ? 'correct' : 'incorrect';
  };

  const stats = useMemo(() => {
    let correct = 0;
    let unanswered = 0;
    
    questions.forEach(q => {
      const status = checkAnswer(q, userAnswers[q.id]);
      if (status === 'correct') correct++;
      else if (status === 'unanswered') unanswered++;
    });

    return {
      correct,
      incorrect: questions.length - correct - unanswered,
      unanswered,
      score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0
    };
  }, [questions, userAnswers]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-bio-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMessage = (score: number) => {
    if (score >= 90) return '¡Excelente trabajo! Dominas el tema.';
    if (score >= 70) return '¡Muy bien! Tienes buenos conocimientos.';
    if (score >= 50) return 'Aprobado, pero conviene repasar algunos conceptos.';
    return 'Necesitas estudiar más este tema.';
  };

  if (showReview) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Revisión de Respuestas</h2>
          <Button variant="secondary" onClick={() => setShowReview(false)}>
             Volver al Resumen
          </Button>
        </div>
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const userAnswer = userAnswers[q.id];
            const status = checkAnswer(q, userAnswer);
            
            return (
              <div key={q.id} className={`p-6 rounded-xl border-l-4 shadow-sm bg-white ${status === 'correct' ? 'border-emerald-500' : status === 'unanswered' ? 'border-gray-400' : 'border-red-500'}`}>
                <div className="flex gap-3 mb-3">
                  <span className="font-bold text-gray-500">#{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {q.type === 'short_answer' ? 'Respuesta Corta' : q.type === 'true_false' ? 'Verdadero/Falso' : 'Opción Múltiple'}
                      </span>
                      <p className="text-xs text-gray-500">{q.category}</p>
                    </div>
                    <p className="font-medium text-lg text-gray-900">{q.text}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {status === 'correct' && <Check className="text-emerald-500" />}
                    {status === 'incorrect' && <X className="text-red-500" />}
                    {status === 'unanswered' && <AlertCircle className="text-gray-400" />}
                  </div>
                </div>

                <div className="pl-8 space-y-2">
                  {/* Logic for Short Answer Review */}
                  {q.type === 'short_answer' ? (
                    <div className="mt-2 space-y-2">
                      <div className={`p-3 rounded-lg border flex justify-between items-center ${status === 'correct' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                         <span>
                           <span className="font-bold text-xs uppercase mr-2">Tu respuesta:</span> 
                           {userAnswer ? String(userAnswer) : <span className="italic opacity-50">Sin contestar</span>}
                         </span>
                      </div>
                      {status !== 'correct' && (
                        <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800">
                          <span className="font-bold text-xs uppercase mr-2">Respuesta Correcta:</span> 
                          {q.correctAnswer}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Logic for Multiple Choice and True/False Review */
                    <div className="space-y-2">
                      {q.options?.map((opt, i) => {
                        const isSelected = userAnswer === i;
                        const isTheCorrectOne = q.correctIndex === i;
                        
                        let rowClass = "p-2 rounded border border-transparent";
                        if (isTheCorrectOne) rowClass = "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium";
                        else if (isSelected && !isTheCorrectOne) rowClass = "bg-red-50 border-red-200 text-red-800";
                        else rowClass = "text-gray-600";

                        return (
                          <div key={i} className={`flex gap-2 ${rowClass}`}>
                             <span className="w-6 font-mono">{letters[i]}</span>
                             <span>{opt}</span>
                             {isTheCorrectOne && <span className="ml-auto text-xs font-bold uppercase tracking-wide text-emerald-600">Correcta</span>}
                             {isSelected && !isTheCorrectOne && <span className="ml-auto text-xs font-bold uppercase tracking-wide text-red-600">Tu respuesta</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {q.explanation && (
                  <div className="mt-4 ml-8 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
                    <strong>Explicación:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full px-4 py-12 text-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="text-yellow-600" size={40} />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Resultados</h2>
        <p className={`text-5xl font-extrabold my-6 ${getScoreColor(stats.score)}`}>
          {stats.score}%
        </p>
        <p className="text-gray-600 mb-8 text-lg font-medium">{getMessage(stats.score)}</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-emerald-50 p-3 rounded-lg">
            <div className="text-emerald-600 font-bold text-xl">{stats.correct}</div>
            <div className="text-emerald-800 text-xs uppercase">Correctas</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-red-600 font-bold text-xl">{stats.incorrect}</div>
            <div className="text-red-800 text-xs uppercase">Incorrectas</div>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="text-gray-600 font-bold text-xl">{stats.unanswered}</div>
            <div className="text-gray-800 text-xs uppercase">Sin contestar</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => setShowReview(true)} variant="outline" className="w-full">
            Revisar Respuestas
          </Button>
          <Button onClick={onViewList} variant="secondary" className="w-full flex justify-center items-center gap-2">
            <FileText size={18} /> Ver Lista Completa (PDF)
          </Button>
          <Button onClick={onRetry} variant="primary" className="w-full flex justify-center items-center gap-2">
            <RefreshCw size={18} /> Generar Nuevo Test
          </Button>
        </div>
      </div>
    </div>
  );
};