'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, Lightbulb, Check, X, ChevronRight, Lock, Unlock
} from 'lucide-react';
import { questions } from '@/lib/questions';
import { getSession, saveSession, clearSession, saveAttempt, generateId } from '@/lib/storage';
import { QuizSession, AttemptResult } from '@/lib/types';

const QUESTION_TIME = 120;

function ConfettiPiece({ i }: { i: number }) {
  const colors = ['#FFB7C5', '#C8B4E8', '#B4E8D4', '#FFD4B2', '#FFE8A3', '#B4D4FF'];
  return (
    <div style={{
      position: 'absolute', left: `${(i / 20) * 100}%`, top: '-12px',
      width: 8, height: 8, borderRadius: i % 3 === 0 ? '50%' : '2px',
      background: colors[i % colors.length],
      animation: `fall ${1.2 + (i % 5) * 0.3}s linear ${(i % 8) * 0.1}s forwards`,
    }} />
  );
}

function HalfwayPopup({ onClose }: { onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 5500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(74,63,107,0.25)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 100, padding: '24px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: '28px', padding: '32px 24px',
        textAlign: 'center', maxWidth: '300px', width: '100%',
        animation: 'bounce-in 0.55s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 24px 64px rgba(180,140,220,0.3)',
        border: '2px solid #F0EBF8',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFB7C5, #C8B4E8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: '36px',
          boxShadow: '0 8px 24px rgba(200,180,232,0.4)',
          animation: 'float 2.5s ease-in-out infinite',
        }}>🐰</div>
        <div style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '24px',
          background: 'linear-gradient(135deg, #9B7EC8, #E07A9A)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px',
        }}>YAYY!!</div>
        <p style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '14px',
          color: '#5A4F7A', lineHeight: 1.6, marginBottom: '20px',
        }}>
          You are more than half way there my dear Malkin!<br />I know you can do it!!
        </p>
        <button onClick={onClose} style={{
          width: '100%', padding: '13px',
          background: 'linear-gradient(135deg, #C8B4E8, #E07A9A)',
          border: 'none', borderRadius: '14px', cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '14px',
          color: 'white', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '6px',
          boxShadow: '0 6px 20px rgba(200,140,180,0.4)',
        }}>
          <ChevronRight size={15} color="white" /> Keep going!
        </button>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(0); // Will be initialized correctly below
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [showHalfway, setShowHalfway] = useState(false);
  const [halfwayShown, setHalfwayShown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const questionStartRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace('/'); return; }
    if (!s.questionTimeTaken) s.questionTimeTaken = {};
    setSession(s);
    const totalTime = s.questionIds.length * QUESTION_TIME;
    const elapsed = Math.floor((Date.now() - s.startTime) / 1000);
    setTimeLeft(Math.max(0, totalTime - elapsed));
    questionStartRef.current = Date.now();
  }, [router]);

  useEffect(() => {
    if (!session || showResult) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const totalTime = session.questionIds.length * QUESTION_TIME;
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      const remaining = Math.max(0, totalTime - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        handleTimeUp();
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session?.currentIndex, showResult]);

  useEffect(() => {
    if (showResult) return;
    setHintUnlocked(false); setShowHint(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setHintUnlocked(true), 60000);
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [session?.currentIndex]);

  const handleTimeUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!session) return;
    
    // Auto-submit the whole quiz
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    const actualTimeTaken = Math.min(elapsed, QUESTION_TIME);
    const currentQId = session.questionIds[session.currentIndex];
    const actualSelected = selectedOption !== null ? selectedOption : -1;
    
    const updatedTimeTaken = { ...(session.questionTimeTaken ?? {}), [currentQId]: actualTimeTaken };
    const updatedAnswers = { ...session.answers, [currentQId]: actualSelected };
    
    const finalSession: QuizSession = { ...session, answers: updatedAnswers, questionTimeTaken: updatedTimeTaken };
    const results: AttemptResult[] = finalSession.questionIds.map(qId => {
      const q = questions.find(q => q.id === qId)!;
      const sel = finalSession.answers[qId] ?? -1;
      return { questionId: qId, selectedIndex: sel, isCorrect: sel === q.correctIndex, timeTaken: finalSession.questionTimeTaken[qId] ?? QUESTION_TIME, hintTaken: finalSession.hintShown[qId] === true };
    });
    
    const totalQ = session.questionIds.length;
    saveAttempt({ id: generateId(), date: new Date().toISOString(), totalQuestions: totalQ, score: results.filter(r => r.isCorrect).length, results, duration: Math.floor((Date.now() - session.startTime) / 1000), allowRepeats: true });
    clearSession(); 
    router.push('/results');
  }, [session, selectedOption, router]);

  const currentQuestion = session ? questions.find(q => q.id === session.questionIds[session.currentIndex]) : null;
  const totalQuestions = session?.questionIds.length ?? 0;
  const currentIndex = session?.currentIndex ?? 0;
  const progress = (currentIndex / totalQuestions) * 100;

  const handleSelect = (optionIndex: number) => {
    if (showResult || selectedOption !== null) return;
    setSelectedOption(optionIndex);
    if (timerRef.current) clearInterval(timerRef.current);
    if (optionIndex === currentQuestion?.correctIndex) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
    setShowResult(true);
  };

  const handleShowHint = () => {
    if (!hintUnlocked || !session || !currentQuestion) return;
    const updatedHintShown = { ...session.hintShown, [currentQuestion.id]: true };
    const updated = { ...session, hintShown: updatedHintShown };
    saveSession(updated); setSession(updated);
    setShowHint(!showHint);
  };

  const handleNext = () => {
    if (!session || !currentQuestion) return;
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    const actualTimeTaken = Math.min(elapsed, QUESTION_TIME);
    const actualSelected = selectedOption !== null ? selectedOption : -1;
    const updatedTimeTaken = { ...(session.questionTimeTaken ?? {}), [currentQuestion.id]: actualTimeTaken };
    const updatedAnswers = { ...session.answers, [currentQuestion.id]: actualSelected };
    const nextIndex = currentIndex + 1;

    const halfwayPoint = Math.floor(totalQuestions * 0.6);
    if (!halfwayShown && nextIndex >= halfwayPoint && nextIndex < totalQuestions) {
      setShowHalfway(true); setHalfwayShown(true);
    }

    if (nextIndex >= totalQuestions) {
      const finalSession: QuizSession = { ...session, answers: updatedAnswers, questionTimeTaken: updatedTimeTaken };
      const results: AttemptResult[] = finalSession.questionIds.map(qId => {
        const q = questions.find(q => q.id === qId)!;
        const sel = finalSession.answers[qId] ?? -1;
        return { questionId: qId, selectedIndex: sel, isCorrect: sel === q.correctIndex, timeTaken: finalSession.questionTimeTaken[qId] ?? QUESTION_TIME, hintTaken: finalSession.hintShown[qId] === true };
      });
      saveAttempt({ id: generateId(), date: new Date().toISOString(), totalQuestions, score: results.filter(r => r.isCorrect).length, results, duration: Math.floor((Date.now() - session.startTime) / 1000), allowRepeats: true });
      clearSession(); router.push('/results'); return;
    }

    const updatedSession: QuizSession = { ...session, currentIndex: nextIndex, answers: updatedAnswers, questionTimeTaken: updatedTimeTaken };
    saveSession(updatedSession); setSession(updatedSession);
    setSelectedOption(null); setShowResult(false); setShowHint(false);
    setHintUnlocked(false);
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

  const isCorrect = selectedOption === currentQuestion.correctIndex;
  const totalTimeForQuiz = totalQuestions * QUESTION_TIME;
  const timerPct = (timeLeft / totalTimeForQuiz) * 100;
  const timerColor = timeLeft > 120 ? '#52B788' : timeLeft > 60 ? '#E9A84C' : '#E07A9A';
  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, '0');

  return (
    // ── FULL VIEWPORT FLEX COLUMN — never overflows ──
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
      {/* Confetti */}
      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
          {Array.from({ length: 20 }).map((_, i) => <ConfettiPiece key={i} i={i} />)}
          <style>{`@keyframes fall { to { transform: translateY(105vh) rotate(540deg); opacity: 0; } }`}</style>
        </div>
      )}
      {showHalfway && <HalfwayPopup onClose={() => setShowHalfway(false)} />}

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
      <div style={{ flexShrink: 0, height: 3, borderRadius: '999px', background: '#F0EBF8', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '999px', background: timerColor,
          width: `${timerPct}%`, transition: 'width 1s linear, background 0.5s ease',
        }} />
      </div>

      {/* ── QUESTION CARD (flex:1 = fills remaining space, scrolls if long) ── */}
      <div style={{
        flex: 1,
        minHeight: 0, // critical: allows flex child to shrink below content size
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
          const isThisCorrect = i === currentQuestion.correctIndex;
          const isThisSelected = selectedOption === i;
          let bg = 'white', borderColor = '#F0EBF8', textColor = '#3D3460';
          let badgeBg = '#F5F0FF', badgeColor = '#9B87C0';
          let icon: React.ReactNode = null;

          if (showResult) {
            if (isThisCorrect) {
              bg = '#F0FFF8'; borderColor = '#B4E8D4'; textColor = '#2D4A3D';
              badgeBg = '#D6F5EA'; badgeColor = '#2D6B52'; icon = <Check size={12} color="#52B788" />;
            } else if (isThisSelected && !isCorrect) {
              bg = '#FFF0F5'; borderColor = '#FFB7C5'; textColor = '#6B2D3F';
              badgeBg = '#FFE0E8'; badgeColor = '#E07A9A'; icon = <X size={12} color="#E07A9A" />;
            } else {
              bg = '#FAFAFA'; borderColor = '#F5F2F9'; textColor = '#C0B8CC';
              badgeBg = '#F5F2F9'; badgeColor = '#D8D0E8';
            }
          } else if (isThisSelected) {
            borderColor = '#C8B4E8'; badgeBg = '#EEE8F8'; badgeColor = '#9B7EC8';
          }

          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={showResult} style={{
              background: bg, border: `1.5px solid ${borderColor}`,
              borderRadius: '14px', padding: '10px 12px',
              textAlign: 'left', cursor: showResult ? 'default' : 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '7px',
                background: badgeBg, color: badgeColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 800, flexShrink: 0,
              }}>
                {icon ?? String.fromCharCode(65 + i)}
              </span>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '13px', color: textColor, lineHeight: 1.4 }}>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── RESULT FEEDBACK + NEXT (fixed, slides in) ── */}
      {showResult && (
        <div style={{ flexShrink: 0, animation: 'slide-up 0.25s ease-out' }}>
          {/* Compact feedback strip */}
          <div style={{
            borderRadius: '14px', padding: '10px 14px', marginBottom: '8px',
            background: isCorrect ? '#F0FFF8' : '#FFF0F5',
            border: `1.5px solid ${isCorrect ? '#B4E8D4' : '#FFB7C5'}`,
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '10px', flexShrink: 0,
              background: isCorrect ? '#D6F5EA' : '#FFD6E0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selectedOption === null
                ? <Clock size={16} color="#E9A84C" />
                : isCorrect ? <Check size={16} color="#52B788" /> : <X size={16} color="#E07A9A" />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '13px', color: isCorrect ? '#2D4A3D' : '#4A2D3A' }}>
                {selectedOption === null ? "Time's up!" : isCorrect ? 'Correct!' : 'Not quite!'}
              </div>
              {!isCorrect && (
                <div style={{ fontSize: '12px', color: '#7B6A9E', fontWeight: 600, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Ans: <strong style={{ color: '#2D6B52' }}>{currentQuestion.options[currentQuestion.correctIndex]}</strong>
                </div>
              )}
            </div>
            {/* Hint icon shown inline when wrong */}
            {!isCorrect && (
              <div title={currentQuestion.hint} style={{
                width: 28, height: 28, borderRadius: '8px', background: '#FFFBF0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid #FFE8A3', flexShrink: 0, cursor: 'help',
              }}>
                <Lightbulb size={13} color="#E9A84C" />
              </div>
            )}
          </div>

          <button onClick={handleNext} style={{
            width: '100%', padding: '13px',
            background: 'linear-gradient(135deg, #C8B4E8, #E07A9A)',
            border: 'none', borderRadius: '16px', cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '15px',
            color: 'white', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '7px',
            boxShadow: '0 4px 16px rgba(200,140,180,0.35)',
          }}>
            {currentIndex + 1 >= totalQuestions ? 'See Results' : 'Next'}
            <ChevronRight size={16} color="white" />
          </button>
        </div>
      )}
    </div>
  );
}
