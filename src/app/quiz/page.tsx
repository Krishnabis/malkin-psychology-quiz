'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, Lightbulb, ChevronRight, ChevronLeft, Lock, Unlock, CheckCircle
} from 'lucide-react';
import { questions } from '@/lib/questions';
import { getSession, saveSession, clearSession, saveAttempt, generateId } from '@/lib/storage';
import { QuizSession, AttemptResult } from '@/lib/types';

const QUESTION_TIME = 120;

export default function QuizPage() {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const questionStartRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace('/'); return; }
    if (!s.questionTimeTaken) s.questionTimeTaken = {};
    if (!s.answers) s.answers = {};
    setSession(s);
    const totalTime = s.questionIds.length * QUESTION_TIME;
    const elapsed = Math.floor((Date.now() - s.startTime) / 1000);
    setTimeLeft(Math.max(0, totalTime - elapsed));
    questionStartRef.current = Date.now();
  }, [router]);

  const submitQuiz = useCallback((finalSession: QuizSession) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const results: AttemptResult[] = finalSession.questionIds.map(qId => {
      const q = questions.find(q => q.id === qId)!;
      const sel = finalSession.answers[qId] ?? -1;
      return { 
        questionId: qId, 
        selectedIndex: sel, 
        isCorrect: sel === q.correctIndex, 
        timeTaken: finalSession.questionTimeTaken[qId] ?? 0, 
        hintTaken: finalSession.hintShown[qId] === true 
      };
    });
    
    const totalQ = finalSession.questionIds.length;
    saveAttempt({ 
      id: generateId(), 
      date: new Date().toISOString(), 
      totalQuestions: totalQ, 
      score: results.filter(r => r.isCorrect).length, 
      results, 
      duration: Math.floor((Date.now() - finalSession.startTime) / 1000), 
      allowRepeats: true 
    });
    clearSession(); 
    router.push('/results');
  }, [router]);

  useEffect(() => {
    if (!session) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const totalTime = session.questionIds.length * QUESTION_TIME;
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      const remaining = Math.max(0, totalTime - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        // Auto submit when time runs out
        const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
        const currentQId = session.questionIds[session.currentIndex];
        const updatedTimeTaken = { ...(session.questionTimeTaken ?? {}), [currentQId]: ((session.questionTimeTaken?.[currentQId] || 0) + timeSpent) };
        submitQuiz({ ...session, questionTimeTaken: updatedTimeTaken });
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session, submitQuiz]);

  useEffect(() => {
    setHintUnlocked(false); setShowHint(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setHintUnlocked(true), 60000);
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [session?.currentIndex]);

  const currentQuestion = session ? questions.find(q => q.id === session.questionIds[session.currentIndex]) : null;
  const totalQuestions = session?.questionIds.length ?? 0;
  const currentIndex = session?.currentIndex ?? 0;
  const progress = (currentIndex / totalQuestions) * 100;
  const selectedOption = session && currentQuestion ? (session.answers[currentQuestion.id] ?? null) : null;

  const handleSelect = (optionIndex: number) => {
    if (!session || !currentQuestion) return;
    const updatedAnswers = { ...session.answers, [currentQuestion.id]: optionIndex };
    const updatedSession = { ...session, answers: updatedAnswers };
    saveSession(updatedSession);
    setSession(updatedSession);
  };

  const handleShowHint = () => {
    if (!hintUnlocked || !session || !currentQuestion) return;
    const updatedHintShown = { ...session.hintShown, [currentQuestion.id]: true };
    const updated = { ...session, hintShown: updatedHintShown };
    saveSession(updated); setSession(updated);
    setShowHint(!showHint);
  };

  const handleNavigate = (dir: 'prev' | 'next') => {
    if (!session || !currentQuestion) return;
    
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    const updatedTimeTaken = { ...(session.questionTimeTaken ?? {}), [currentQuestion.id]: ((session.questionTimeTaken?.[currentQuestion.id] || 0) + elapsed) };
    
    let nextIndex = currentIndex;
    if (dir === 'prev' && nextIndex > 0) nextIndex--;
    if (dir === 'next') nextIndex++;

    if (dir === 'next' && currentIndex === totalQuestions - 1) {
       submitQuiz({ ...session, questionTimeTaken: updatedTimeTaken });
       return;
    }

    const updatedSession = { ...session, currentIndex: nextIndex, questionTimeTaken: updatedTimeTaken };
    saveSession(updatedSession);
    setSession(updatedSession);
    questionStartRef.current = Date.now();
  };

  if (!session || !currentQuestion) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #C8B4E8', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const totalTimeForQuiz = totalQuestions * QUESTION_TIME;
  const timerPct = (timeLeft / totalTimeForQuiz) * 100;
  const timerColor = timeLeft > 120 ? '#52B788' : timeLeft > 60 ? '#E9A84C' : '#E07A9A';
  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, '0');

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      padding: '12px 14px',
      gap: '8px',
      maxWidth: 480,
      margin: '0 auto',
      boxSizing: 'border-box',
    }}>
      {/* ── TOP BAR (fixed height) ── */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => { if (confirm('Leave quiz? Progress will be saved.')) router.push('/'); }}
          style={{
            width: 38, height: 38, borderRadius: '12px',
            background: 'white', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(180,150,220,0.1)',
            border: '1.5px solid #F0EBF8',
          }}
        >
          <ArrowLeft size={16} color="#7B6A9E" />
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B89ACC' }}>
              {currentIndex + 1} / {totalQuestions}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B89ACC' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: 6, borderRadius: '999px', background: '#F0EBF8', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '999px',
              background: 'linear-gradient(90deg, #C8B4E8, #E07A9A)',
              width: `${progress}%`, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Timer pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'white', border: `1.5px solid ${timerColor}50`,
          borderRadius: '12px', padding: '7px 10px', flexShrink: 0,
        }}>
          <Clock size={12} color={timerColor} />
          <span style={{ fontWeight: 800, fontSize: '13px', color: timerColor, fontVariantNumeric: 'tabular-nums' }}>
            {mins}:{secs}
          </span>
        </div>
      </div>

      {/* Timer drain bar */}
      <div style={{ flexShrink: 0, height: 3, borderRadius: '999px', background: '#F0EBF8', overflow: 'hidden', marginBottom: '4px' }}>
        <div style={{
          height: '100%', borderRadius: '999px', background: timerColor,
          width: `${timerPct}%`, transition: 'width 1s linear, background 0.5s ease',
        }} />
      </div>

      {/* ── NAVIGATION (Prev / Next) ── */}
      <div style={{ flexShrink: 0, display: 'flex', gap: '8px' }}>
        <button
          onClick={() => handleNavigate('prev')}
          disabled={currentIndex === 0}
          style={{
            flex: 1, padding: '10px',
            background: currentIndex === 0 ? '#F9F8FC' : 'white',
            border: `1.5px solid ${currentIndex === 0 ? '#F0EBF8' : '#D8CFF0'}`,
            borderRadius: '12px', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13px',
            color: currentIndex === 0 ? '#C8C0D8' : '#7B6A9E', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
            boxShadow: currentIndex === 0 ? 'none' : '0 2px 8px rgba(180,150,220,0.08)',
          }}
        >
          <ChevronLeft size={16} color={currentIndex === 0 ? '#C8C0D8' : '#7B6A9E'} />
          Prev
        </button>
        <button
          onClick={() => handleNavigate('next')}
          style={{
            flex: 1, padding: '10px',
            background: isLastQuestion ? 'linear-gradient(135deg, #52B788, #3E946A)' : 'linear-gradient(135deg, #C8B4E8, #E07A9A)',
            border: 'none', borderRadius: '12px', cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '13px',
            color: 'white', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
            boxShadow: isLastQuestion ? '0 4px 12px rgba(82,183,136,0.3)' : '0 4px 12px rgba(200,140,180,0.3)',
          }}
        >
          {isLastQuestion ? (
            <>Submit <CheckCircle size={15} color="white" /></>
          ) : (
            <>Next <ChevronRight size={16} color="white" /></>
          )}
        </button>
      </div>

      {/* ── QUESTION CARD (flex:1 = fills remaining space, scrolls if long) ── */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        background: 'white',
        borderRadius: '20px',
        padding: '16px',
        border: '1.5px solid #F0EBF8',
        boxShadow: '0 2px 16px rgba(180,150,220,0.08)',
      }}>
        {/* Q label + hint */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #C8B4E8, #E07A9A)',
            color: 'white', padding: '3px 10px', borderRadius: '8px',
            fontSize: '11px', fontWeight: 800,
          }}>{currentQuestion.qNum}</span>

          <button onClick={handleShowHint} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '6px 11px', borderRadius: '10px',
            cursor: hintUnlocked ? 'pointer' : 'not-allowed',
            background: hintUnlocked ? (showHint ? '#FFF4CC' : '#FFFBF0') : '#F8F6FF',
            border: `1.5px solid ${hintUnlocked ? '#FFE8A3' : '#EEE8F8'}`,
          }}>
            {hintUnlocked ? <Unlock size={11} color="#E9A84C" /> : <Lock size={11} color="#C8C0D8" />}
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px', color: hintUnlocked ? '#8B6914' : '#C8C0D8' }}>
              {hintUnlocked ? 'Hint' : '1:00'}
            </span>
          </button>
        </div>

        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '14px', color: '#3D3460', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
          {currentQuestion.text}
        </p>

        {showHint && hintUnlocked && (
          <div style={{
            background: '#FFFBF0', borderRadius: '12px', padding: '10px 12px', marginTop: '12px',
            border: '1.5px solid #FFE8A3', display: 'flex', alignItems: 'flex-start', gap: '7px',
            animation: 'slide-up 0.25s ease-out',
          }}>
            <Lightbulb size={13} color="#E9A84C" style={{ marginTop: '1px', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: '#6B5A2D', fontWeight: 600, lineHeight: 1.5 }}>
              {currentQuestion.hint}
            </span>
          </div>
        )}
      </div>

      {/* ── OPTIONS (fixed, compact) ── */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {currentQuestion.options.map((option, i) => {
          const isThisSelected = selectedOption === i;
          const bg = isThisSelected ? '#F9F6FF' : 'white';
          const borderColor = isThisSelected ? '#C8B4E8' : '#F0EBF8';
          const textColor = isThisSelected ? '#4A3F6B' : '#3D3460';
          const badgeBg = isThisSelected ? '#C8B4E8' : '#F5F0FF';
          const badgeColor = isThisSelected ? 'white' : '#9B87C0';

          return (
            <button key={i} onClick={() => handleSelect(i)} style={{
              background: bg, border: `1.5px solid ${borderColor}`,
              borderRadius: '14px', padding: '10px 12px',
              textAlign: 'left', cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: isThisSelected ? '0 2px 10px rgba(200,180,232,0.15)' : 'none',
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '7px',
                background: badgeBg, color: badgeColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 800, flexShrink: 0,
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '13px', color: textColor, lineHeight: 1.4 }}>
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
