import React, { useState, useEffect } from 'react';
import { AppStatus, Question, QuizState } from './types';
import { generateQuestions } from './services/geminiService';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import { ListView } from './components/ListView';
import { Button } from './components/Button';
import { BrainCircuit, BookOpen, Clock, AlertTriangle } from 'lucide-react';

const INITIAL_STATE: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  isFinished: false,
  score: 0
};

export default function App() {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [quizState, setQuizState] = useState<QuizState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  
  // Timer state in seconds
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    // Only run timer if Quiz is Active and time is > 0
    if (status === AppStatus.QUIZ_ACTIVE && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time is up!
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [status, timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    setStatus(AppStatus.GENERATING);
    setError(null);
    try {
      // Generate 100 questions (internally split into batches)
      const questions = await generateQuestions(100);
      
      if (questions.length === 0) {
        throw new Error("No se pudieron generar preguntas. Verifica tu API Key o intenta de nuevo.");
      }

      setQuizState({
        ...INITIAL_STATE,
        questions: questions
      });
      
      // Set timer: 1 minute per question
      setTimeLeft(questions.length * 60);
      
      setStatus(AppStatus.QUIZ_ACTIVE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStatus(AppStatus.IDLE);
    }
  };

  // accepts number (index) or string (text answer)
  const handleSelectOption = (answer: number | string) => {
    setQuizState(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [prev.questions[prev.currentQuestionIndex].id]: answer
      }
    }));
  };

  const handleNext = () => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.questions.length - 1, prev.currentQuestionIndex + 1)
    }));
  };

  const handlePrev = () => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1)
    }));
  };

  const handleFinish = () => {
    setStatus(AppStatus.REVIEW);
  };

  const handleViewList = () => {
    setStatus(AppStatus.LIST_VIEW);
  };

  // --- Renders ---

  if (status === AppStatus.IDLE || status === AppStatus.GENERATING) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bio-50 to-white flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-bio-100">
          <div className="mx-auto w-24 h-24 bg-bio-100 rounded-full flex items-center justify-center mb-8">
            <BrainCircuit className="text-bio-600 w-12 h-12" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            BioGen <span className="text-bio-600">3º ESO</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
            Generador inteligente de exámenes sobre <span className="font-semibold text-bio-700">Alimentación y Nutrición</span>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <BookOpen className="text-bio-500 mb-2" />
              <h3 className="font-bold text-gray-800">100 Preguntas</h3>
              <p className="text-sm text-gray-500">1 minuto por pregunta. Tipos variados.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <BrainCircuit className="text-bio-500 mb-2" />
              <h3 className="font-bold text-gray-800">IA Avanzada</h3>
              <p className="text-sm text-gray-500">Preguntas contextualmente relevantes.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <Clock className="text-bio-500 mb-2" />
              <h3 className="font-bold text-gray-800">Con Tiempo</h3>
              <p className="text-sm text-gray-500">Cronómetro integrado para simular examen real.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-center gap-2">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <Button 
            size="lg" 
            onClick={handleGenerate} 
            isLoading={status === AppStatus.GENERATING}
            className="w-full md:w-auto min-w-[240px] shadow-lg shadow-bio-200/50"
          >
            {status === AppStatus.GENERATING ? 'Generando Contenido...' : 'Generar Examen (100 Preguntas)'}
          </Button>
          
          {status === AppStatus.GENERATING && (
             <p className="mt-4 text-sm text-gray-500 animate-pulse">
               Esto puede tardar unos segundos. Estamos creando 4 bloques variados...
             </p>
          )}
        </div>
      </div>
    );
  }

  if (status === AppStatus.QUIZ_ACTIVE) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex flex-col">
        <header className="px-6 mb-8 flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto w-full gap-4">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-bio-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
             <span className="font-bold text-gray-800">BioGen</span>
           </div>
           
           {/* Timer Display */}
           <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
             timeLeft < 300 
               ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
               : 'bg-white border-gray-200 text-bio-700'
             } shadow-sm font-mono text-xl font-bold transition-colors duration-300`}>
             <Clock size={20} className={timeLeft < 300 ? 'text-red-500' : 'text-bio-500'} />
             <span>{formatTime(timeLeft)}</span>
           </div>

           <Button variant="outline" size="sm" onClick={() => setStatus(AppStatus.LIST_VIEW)}>
             Ver Todo
           </Button>
        </header>
        
        <main className="flex-1 flex flex-col justify-center">
          <QuizView
            question={quizState.questions[quizState.currentQuestionIndex]}
            currentIndex={quizState.currentQuestionIndex}
            totalQuestions={quizState.questions.length}
            selectedOption={quizState.userAnswers[quizState.questions[quizState.currentQuestionIndex].id]}
            onSelectOption={handleSelectOption}
            onNext={handleNext}
            onPrev={handlePrev}
            onFinish={handleFinish}
          />
        </main>
      </div>
    );
  }

  if (status === AppStatus.REVIEW) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ResultsView 
          questions={quizState.questions}
          userAnswers={quizState.userAnswers}
          onRetry={() => setStatus(AppStatus.IDLE)}
          onViewList={handleViewList}
        />
      </div>
    );
  }

  if (status === AppStatus.LIST_VIEW) {
    return (
      <div className="min-h-screen bg-white">
        <ListView 
          questions={quizState.questions} 
          onBack={() => {
            if (Object.keys(quizState.userAnswers).length > 0) {
               setStatus(AppStatus.REVIEW);
            } else {
               setStatus(AppStatus.QUIZ_ACTIVE);
            }
          }}
        />
      </div>
    );
  }

  return null;
}