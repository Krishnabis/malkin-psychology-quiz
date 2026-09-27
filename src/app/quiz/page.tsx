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
      position: 'absolute',
      left: `${(i / 20) * 100}%`,
      top: '-12px',
      width: 9,
      height: 9,
      borderRadius: i % 3 === 0 ? '50%' : '2px',
      background: colors[i % colors.length],
      animation: `fall ${1.2 + (i % 5) * 0.3}s linear ${(i % 8) * 0.1}s forwards`,
    }} />
  );
}

function HalfwayPopup({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(74,63,107,0.25)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '24px',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '28px', padding: '36px 28px',
          textAlign: 'center', maxWidth: '320px', width: '100%',
          animation: 'bounce-in 0.55s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: '0 24px 64px rgba(180,140,220,0.3)',
          border: '2px solid #F0EBF8',
        }}
      >
        {/* Bunny icon ring */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFB7C5, #C8B4E8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 24px rgba(200,180,232,0.4)',
          animation: 'float 2.5s ease-in-out infinite',
          fontSize: '40px',
        }}>
          🐰
        </div>

        <div style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '26px',
          background: 'linear-gradient(135deg, #9B7EC8, #E07A9A)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
        }}>
          YAYY!!
        </div>

        <p style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '15px',
          color: '#5A4F7A', lineHeight: 1.6, marginBottom: '24px',
        }}>
          You are more than half way there my dear Malkin!<br />
          I know you can do it!!
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: `hsl(${280 + i * 20}, 60%, 75%)`,
              animation: `sparkle ${0.8 + i * 0.15}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>

        <button onClick={onClose} style={{
          width: '100%', padding: '14px',
          background: 'linear-gradient(135deg, #C8B4E8, #E07A9A)',
          border: 'none', borderRadius: '16px', cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '15px',
          color: 'white', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '8px',
          boxShadow: '0 6px 20px rgba(200,140,180,0.4)',
        }}>
          <ChevronRight size={16} color="white" />
          Keep going!
        </button>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
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
    setTimeLeft(QUESTION_TIME);
    questionStartRef.current = Date.now();
  }, [router]);

  useEffect(() => {
    if (!session || showResult) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleTimeUp(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session?.currentIndex, showResult]);

  useEffect(() => {
    if (showResult) return;
    setHintUnlocked(false);
    setShowHint(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setHintUnlocked(true), 60000);
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [session?.currentIndex]);

  const handleTimeUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowResult(true);
  }, []);

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
    saveSession(updated);
    setSession(updated);
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
      setShowHalfway(true);
      setHalfwayShown(true);
    }

    if (nextIndex >= totalQuestions) {
      const finalSession: QuizSession = { ...session, answers: updatedAnswers, questionTimeTaken: updatedTimeTaken };
      const results: AttemptResult[] = finalSession.questionIds.map(qId => {
        const q = questions.find(q => q.id === qId)!;
        const sel = finalSession.answers[qId] ?? -1;
        return {
          questionId: qId, selectedIndex: sel,
          isCorrect: sel === q.correctIndex,
          timeTaken: finalSession.questionTimeTaken[qId] ?? QUESTION_TIME,
          hintTaken: finalSession.hintShown[qId] === true,
        };
      });
      saveAttempt({
        id: generateId(), date: new Date().toISOString(),
        totalQuestions, score: results.filter(r => r.isCorrect).length,
        results, duration: Math.floor((Date.now() - session.startTime) / 1000),
        allowRepeats: true,
      });
      clearSession();
      router.push('/results');
      return;
    }

    const updatedSession: QuizSession = { ...session, currentIndex: nextIndex, answers: updatedAnswers, questionTimeTaken: updatedTimeTaken };
    saveSession(updatedSession);
    setSession(updatedSession);
    setSelectedOption(null);
    setShowResult(false);
    setShowHint(false);
    setHintUnlocked(false);
    setTimeLeft(QUESTION_TIME);
    questionStartRef.current = Date.now();
  };

  if (!session || !currentQuestion) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #C8B4E8', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isCorrect = selectedOption === currentQuestion.correctIndex;
  const timerPct = (timeLeft / QUESTION_TIME) * 100;
  const timerColor = timeLeft > 60 ? '#52B788' : timeLeft > 30 ? '#E9A84C' : '#E07A9A';
  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, '0');

  return (
    <div style={{ minHeight: '100vh', padding: '16px 16px 32px', maxWidth: '480px', margin: '0 auto' }}>
      {/* Confetti */}
      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
          {Array.from({ length: 20 }).map((_, i) => <ConfettiPiece key={i} i={i} />)}
          <style>{`@keyframes fall { to { transform: translateY(105vh) rotate(540deg); opacity: 0; } }`}</style>
        </div>
      )}
      {showHalfway && <HalfwayPopup onClose={() => setShowHalfway(false)} />}

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <button
          onClick={() => { if (confirm('Leave quiz? Progress will be saved.')) router.push('/'); }}
          style={{
            width: 40, height: 40, borderRadius: '14px',
            background: 'white', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(180,150,220,0.12)',
            border: '1.5px solid #F0EBF8',
          } as React.CSSProperties}
        >
          <ArrowLeft size={18} color="#7B6A9E" />
        </button>

        {/* Progress */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#A99CBF' }}>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#A99CBF' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: 7, borderRadius: '999px', background: '#F0EBF8', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '999px',
              background: 'linear-gradient(90deg, #C8B4E8, #E07A9A)',
              width: `${progress}%`, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Timer pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'white', border: `1.5px solid ${timerColor}40`,
          borderRadius: '14px', padding: '8px 12px',
          boxShadow: '0 2px 10px rgba(180,150,220,0.1)',
          minWidth: '72px', justifyContent: 'center',
        }}>
          <Clock size={13} color={timerColor} />
          <span style={{ fontWeight: 800, fontSize: '14px', color: timerColor, fontVariantNumeric: 'tabular-nums' }}>
            {mins}:{secs}
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div style={{ height: 4, borderRadius: '999px', background: '#F0EBF8', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '999px', background: timerColor,
          width: `${timerPct}%`, transition: 'width 1s linear, background 0.5s ease',
        }} />
      </div>

      {/* Question card */}
      <div style={{
        background: 'white', borderRadius: '24px', padding: '20px',
        border: '1.5px solid #F0EBF8', marginBottom: '14px',
        boxShadow: '0 4px 24px rgba(180,150,220,0.1)',
        animation: 'slide-up 0.3s ease-out',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #C8B4E8, #E07A9A)',
            color: 'white', padding: '4px 12px', borderRadius: '10px',
            fontSize: '11px', fontWeight: 800, letterSpacing: '0.4px',
          }}>
            {currentQuestion.qNum}
          </span>

          {/* Hint button */}
          <button onClick={handleShowHint} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 13px', borderRadius: '12px',
            cursor: hintUnlocked ? 'pointer' : 'not-allowed',
            background: hintUnlocked ? (showHint ? '#FFF4CC' : '#FFFBF0') : '#F8F6FF',
            transition: 'all 0.2s',
            border: `1.5px solid ${hintUnlocked ? '#FFE8A3' : '#EEE8F8'}`,
          } as React.CSSProperties}>
            {hintUnlocked
              ? <Unlock size={12} color="#E9A84C" />
              : <Lock size={12} color="#C8C0D8" />
            }
            <span style={{
              fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px',
              color: hintUnlocked ? '#8B6914' : '#C8C0D8',
            }}>
              {hintUnlocked ? 'Hint' : `1:00`}
            </span>
            {!hintUnlocked && (
              <span style={{ fontSize: '10px', color: '#C8C0D8', fontWeight: 600 }}>
                <Lightbulb size={10} color="#C8C0D8" />
              </span>
            )}
          </button>
        </div>

        <p style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '14.5px',
          color: '#3D3460', lineHeight: 1.7, whiteSpace: 'pre-line',
        }}>
          {currentQuestion.text}
        </p>

        {showHint && hintUnlocked && (
          <div style={{
            background: 'linear-gradient(135deg, #FFFBF0, #FFF8E0)',
            borderRadius: '14px', padding: '12px 14px', marginTop: '14px',
            border: '1.5px solid #FFE8A3', animation: 'slide-up 0.25s ease-out',
            display: 'flex', alignItems: 'flex-start', gap: '8px',
          }}>
            <Lightbulb size={14} color="#E9A84C" style={{ marginTop: '1px', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#6B5A2D', fontWeight: 600, lineHeight: 1.55 }}>
              {currentQuestion.hint}
            </span>
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '16px' }}>
        {currentQuestion.options.map((option, i) => {
          const isThisCorrect = i === currentQuestion.correctIndex;
          const isThisSelected = selectedOption === i;

          let bg = 'white';
          let borderColor = '#F0EBF8';
          let textColor = '#3D3460';
          let badgeBg = '#F5F0FF';
          let badgeColor = '#9B87C0';
          let icon: React.ReactNode = null;

          if (showResult) {
            if (isThisCorrect) {
              bg = '#F0FFF8'; borderColor = '#B4E8D4'; textColor = '#2D4A3D';
              badgeBg = '#D6F5EA'; badgeColor = '#2D6B52';
              icon = <Check size={13} color="#52B788" />;
            } else if (isThisSelected && !isCorrect) {
              bg = '#FFF0F5'; borderColor = '#FFB7C5'; textColor = '#6B2D3F';
              badgeBg = '#FFE0E8'; badgeColor = '#E07A9A';
              icon = <X size={13} color="#E07A9A" />;
            } else {
              bg = '#FAFAFA'; borderColor = '#F0EBF8'; textColor = '#B8B0CC';
              badgeBg = '#F5F2F9'; badgeColor = '#D8D0E8';
            }
          } else if (isThisSelected) {
            borderColor = '#C8B4E8'; badgeBg = '#EEE8F8'; badgeColor = '#9B7EC8';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showResult}
              style={{
                background: bg, border: `1.5px solid ${borderColor}`,
                borderRadius: '16px', padding: '13px 14px',
                textAlign: 'left', cursor: showResult ? 'default' : 'pointer',
                transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                display: 'flex', alignItems: 'flex-start', gap: '11px',
                boxShadow: !showResult ? '0 2px 10px rgba(180,150,220,0.07)' : 'none',
                transform: !showResult ? 'scale(1)' : 'scale(1)',
              }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: '8px',
                background: badgeBg, color: badgeColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800, flexShrink: 0, marginTop: '1px',
              }}>
                {icon ?? String.fromCharCode(65 + i)}
              </span>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '14px', color: textColor, lineHeight: 1.5 }}>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Result + Next */}
      {showResult && (
        <div style={{ animation: 'slide-up 0.3s ease-out' }}>
          {/* Feedback card */}
          <div style={{
            borderRadius: '18px', padding: '16px',
            background: isCorrect
              ? 'linear-gradient(135deg, #F0FFF8, #E8FFF4)'
              : 'linear-gradient(135deg, #FFF0F5, #FFE8EC)',
            border: `1.5px solid ${isCorrect ? '#B4E8D4' : '#FFB7C5'}`,
            marginBottom: '12px',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '14px', flexShrink: 0,
              background: isCorrect ? '#D6F5EA' : '#FFD6E0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selectedOption === null
                ? <Clock size={20} color="#E9A84C" />
                : isCorrect
                  ? <Check size={20} color="#52B788" />
                  : <X size={20} color="#E07A9A" />
              }
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: isCorrect ? '#2D4A3D' : '#4A2D3A', marginBottom: '3px' }}>
                {selectedOption === null ? "Time's up!" : isCorrect ? 'Correct answer!' : 'Not quite!'}
              </div>
              {!isCorrect && (
                <div style={{ fontSize: '13px', color: '#7B6A9E', fontWeight: 600 }}>
                  Correct: <strong style={{ color: '#2D6B52' }}>{currentQuestion.options[currentQuestion.correctIndex]}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Hint on wrong */}
          {(!isCorrect || selectedOption === null) && (
            <div style={{
              background: '#FFFBF0', borderRadius: '16px', padding: '13px 15px',
              marginBottom: '12px', border: '1.5px solid #FFE8A3',
              display: 'flex', alignItems: 'flex-start', gap: '9px',
              animation: 'slide-up 0.25s ease-out',
            }}>
              <Lightbulb size={15} color="#E9A84C" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#6B5A2D', fontWeight: 600, lineHeight: 1.55 }}>
                {currentQuestion.hint}
              </span>
            </div>
          )}

          <button
            onClick={handleNext}
            style={{
              width: '100%', padding: '15px',
              background: 'linear-gradient(135deg, #C8B4E8, #E07A9A)',
              border: 'none', borderRadius: '18px', cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '16px',
              color: 'white', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
              boxShadow: '0 6px 20px rgba(200,140,180,0.35)',
            }}
          >
            {currentIndex + 1 >= totalQuestions ? 'See Results' : 'Next Question'}
            <ChevronRight size={18} color="white" />
          </button>
        </div>
      )}
    </div>
  );
}
