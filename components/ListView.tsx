import React from 'react';
import { Question } from '../types';
import { Button } from './Button';
import { ArrowLeft, Printer } from 'lucide-react';

interface ListViewProps {
  questions: Question[];
  onBack: () => void;
}

export const ListView: React.FC<ListViewProps> = ({ questions, onBack }) => {
  const letters = ['a)', 'b)', 'c)', 'd)'];

  const handlePrint = () => {
    window.print();
  };

  const renderOptions = (q: Question) => {
    if (q.type === 'short_answer') {
      return (
        <div className="mt-4 mb-2">
           <div className="w-full max-w-sm border-b-2 border-gray-300 h-8"></div>
           <p className="text-xs text-gray-500 mt-1">(Respuesta breve)</p>
        </div>
      );
    }
    
    return (
      <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        {q.options?.map((opt, i) => (
          <div key={i} className="flex gap-2 items-start text-gray-700">
            <span className="font-medium text-sm pt-0.5">{letters[i]}</span>
            <span>{opt}</span>
          </div>
        ))}
      </div>
    );
  };

  const getCorrectAnswerText = (q: Question) => {
    if (q.type === 'short_answer') {
      return q.correctAnswer;
    }
    if (q.correctIndex !== undefined && q.options) {
      return letters[q.correctIndex].replace(')', '').toUpperCase();
    }
    return '?';
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft size={18} /> Volver
        </Button>
        <div className="flex gap-4">
           <Button variant="secondary" onClick={handlePrint} className="flex items-center gap-2">
            <Printer size={18} /> Imprimir / PDF
          </Button>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 shadow-sm print:shadow-none print:p-0">
        <div className="text-center mb-10 border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Examen de Biología y Geología</h1>
          <p className="text-xl text-gray-600">Tema: Alimentación y Nutrición - 3º ESO</p>
          <p className="text-gray-400 mt-2">Nombre: _________________________________________________ Fecha: _________</p>
        </div>

        <div className="space-y-8">
          {questions.map((q, idx) => (
            <div key={q.id} className="break-inside-avoid">
              <div className="flex gap-2 text-gray-900 font-medium mb-2">
                <span className="font-bold">{idx + 1}.</span>
                <span className="flex-1">{q.text}</span>
              </div>
              {renderOptions(q)}
            </div>
          ))}
        </div>

        {/* Correct Answers Key */}
        <div className="mt-12 pt-8 border-t border-gray-300 break-before-page">
          <h3 className="text-lg font-bold mb-4">Hoja de Respuestas Correctas</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-2 gap-x-8 text-sm">
            {questions.map((q, idx) => (
              <div key={q.id} className="flex gap-1 items-baseline">
                <span className="font-bold">{idx+1}:</span>
                <span className="truncate" title={q.type === 'short_answer' ? q.correctAnswer : ''}>
                  {getCorrectAnswerText(q)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};