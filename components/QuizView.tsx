import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { Button } from './Button';
import { CheckCircle, ChevronRight, ChevronLeft, Type } from 'lucide-react';

interface QuizViewProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedOption: number | string | undefined;
  onSelectOption: (answer: number | string) => void;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onNext,
  onPrev,
  onFinish
}) => {
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const letters = ['A', 'B', 'C', 'D'];
  const inputRef = useRef<HTMLInputElement>(null);

  // For Short Answer: Local state to handle input before "saving" to parent on blur/change
  const [textAnswer, setTextAnswer] = useState('');

  // Reset text input when question changes
  useEffect(() => {
    if (question.type === 'short_answer') {
      setTextAnswer(typeof selectedOption === 'string' ? selectedOption : '');
      // Focus input on new question
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [question, selectedOption]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTextAnswer(val);
    onSelectOption(val);
  };

  const renderContent = () => {
    if (question.type === 'short_answer') {
      return (
        <div className="mt-6">
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Escribe tu respuesta (una sola palabra):
           </label>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Type className="h-5 w-5 text-gray-400" />
             </div>
             <input
                ref={inputRef}
                type="text"
                value={textAnswer}
                onChange={handleTextChange}
                placeholder="Escribe aquí..."
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bio-500 focus:border-bio-500 sm:text-lg shadow-sm"
             />
           </div>
           <p className="mt-2 text-sm text-gray-500 italic">
             No te preocupes por las mayúsculas o tildes, intentaremos entenderlo.
           </p>
        </div>
      );
    }

    // Multiple Choice & True/False
    return (
      <div className={`space-y-4 ${question.type === 'true_false' ? 'grid grid-cols-2 gap-4 space-y-0 mt-4' : ''}`}>
        {question.options?.map((option, idx) => {
          const isSelected = selectedOption === idx;
          
          return (
            <button
              key={idx}
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center group
                ${isSelected 
                  ? 'border-bio-500 bg-bio-50 ring-1 ring-bio-500' 
                  : 'border-gray-200 hover:border-bio-300 hover:bg-gray-50'
                }
                ${question.type === 'true_false' ? 'justify-center text-center flex-col py-6' : 'items-start'}
              `}
            >
              {question.type !== 'true_false' && (
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 border transition-colors
                  ${isSelected ? 'bg-bio-500 text-white border-bio-500' : 'bg-white text-gray-500 border-gray-300 group-hover:border-bio-400'}
                `}>
                  {letters[idx]}
                </div>
              )}
              
              <span className={`text-base md:text-lg ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                {option}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4">
      {/* Progress Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <span className="text-sm font-semibold text-bio-600 uppercase tracking-wider">
            Pregunta {currentIndex + 1} de {totalQuestions}
          </span>
          <div className="flex gap-2 items-center mt-1">
             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase border border-gray-200">
               {question.type === 'short_answer' ? 'Completar' : question.type === 'true_false' ? 'V / F' : 'Test'}
             </span>
             <h2 className="text-gray-500 text-xs truncate max-w-[200px] md:max-w-md">{question.category}</h2>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-500">
          {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div 
          className="bg-bio-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
            {question.text}
          </h3>

          {renderContent()}

        </div>

        {/* Footer Controls */}
        <div className="bg-gray-50 p-4 md:p-6 border-t border-gray-100 flex justify-between items-center">
          <Button 
            variant="secondary" 
            onClick={onPrev} 
            disabled={currentIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={18} /> Anterior
          </Button>

          {isLastQuestion ? (
            <Button 
              variant="primary" 
              onClick={onFinish}
              className="flex items-center gap-2"
            >
              Finalizar Test <CheckCircle size={18} />
            </Button>
          ) : (
             <Button 
              variant="primary" 
              onClick={onNext}
              className="flex items-center gap-2"
            >
              Siguiente <ChevronRight size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};