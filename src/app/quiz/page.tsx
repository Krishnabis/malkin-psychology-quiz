'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/lib/questions';
import { getSession, saveSession, clearSession, saveAttempt, generateId } from '@/lib/storage';
import { QuizSession, AttemptResult } from '@/lib/types';

const QUESTION_TIME = 120; // 2 minutes per question

// Cute celebration particles
function Confetti() {
  const colors = ['#FFB7C5', '#C8B4E8', '#B4E8D4', '#FFD4B2', '#FFE8A3', '#B4D4FF'];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: '-20px',
            width: '10px',
            height: '10px',
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            background: colors[Math.floor(Math.random() * colors.length)],
            animation: `fall ${1 + Math.random() * 2}s linear ${Math.random() * 0.5}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Halfwway popup
function HalfwayPopup({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(74,63,107,0.3)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}
    onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '32px',
          padding: '32px',
          textAlign: 'center',
          maxWidth: '340px',
          width: '100%',
          animation: 'bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: '0 20px 60px rgba(200,180,232,0.4)',
          border: '3px solid #FFB7C5',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: '64px', marginBottom: '12px', animation: 'wiggle 1s ease-in-out infinite' }}>🐰</div>
        <div style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 900,
          fontSize: '22px',
          background: 'linear-gradient(135deg, #C8B4E8, #FFB7C5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px',
        }}>
          YAYY!! 🎉
        </div>
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          color: '#4A3F6B',
          lineHeight: 1.5,
          marginBottom: '20px',
        }}>
          You are more than half way there my dear Malkin! I know you can do it!! 💕✨
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          {['🌸', '⭐', '💫', '🦋', '🌟', '💕'].map((e, i) => (
            <span key={i} style={{
              fontSize: '24px',
              animation: `sparkle ${1 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}>{e}</span>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #C8B4E8, #FFB7C5)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 28px',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Keep going! 🚀
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
  const questionStartRef = useRef<number>(Date.now()); // real wall-clock start per question
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace('/');
      return;
    }
    // Ensure new field exists for sessions started before this update
    if (!s.questionTimeTaken) s.questionTimeTaken = {};
    setSession(s);
    setTimeLeft(QUESTION_TIME);
    questionStartRef.current = Date.now();
  }, [router]);

  // Timer
  useEffect(() => {
    if (!session || showResult) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.currentIndex, showResult]);

  // Hint unlock after 1 minute
  useEffect(() => {
    if (showResult) return;
    setHintUnlocked(false);
    setShowHint(false);
    
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => {
      setHintUnlocked(true);
    }, 60000); // 1 minute

    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [session?.currentIndex]);

  const handleTimeUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowResult(true);
  }, []);

  const currentQuestion = session ? questions.find(q => q.id === session.questionIds[session.currentIndex]) : null;
  const totalQuestions = session?.questionIds.length ?? 0;
  const currentIndex = session?.currentIndex ?? 0;
  const progress = ((currentIndex) / totalQuestions) * 100;

  const handleSelect = (optionIndex: number) => {
    if (showResult || selectedOption !== null) return;
    setSelectedOption(optionIndex);
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = optionIndex === currentQuestion?.correctIndex;
    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    setShowResult(true);
  };

  const handleShowHint = () => {
    if (!hintUnlocked || !session || !currentQuestion) return;
    // Mark hint as taken in session
    const updatedHintShown = { ...session.hintShown, [currentQuestion.id]: true };
    const updatedSession = { ...session, hintShown: updatedHintShown };
    saveSession(updatedSession);
    setSession(updatedSession);
    setShowHint(!showHint);
  };

  const handleNext = () => {
    if (!session || !currentQuestion) return;

    // Compute actual wall-clock seconds spent on this question
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    const actualTimeTaken = Math.min(elapsed, QUESTION_TIME);
    const actualSelected = selectedOption !== null ? selectedOption : -1;

    // Persist per-question time in session
    const updatedTimeTaken = { ...(session.questionTimeTaken ?? {}), [currentQuestion.id]: actualTimeTaken };
    const updatedAnswers = { ...session.answers, [currentQuestion.id]: actualSelected };

    const nextIndex = currentIndex + 1;

    // Check halfway
    const halfwayPoint = Math.floor(totalQuestions * 0.6);
    if (!halfwayShown && nextIndex >= halfwayPoint && nextIndex < totalQuestions) {
      setShowHalfway(true);
      setHalfwayShown(true);
    }

    if (nextIndex >= totalQuestions) {
      // Quiz complete — build final session snapshot
      const finalSession: QuizSession = {
        ...session,
        answers: updatedAnswers,
        questionTimeTaken: updatedTimeTaken,
      };

      // Build AttemptResult for every question
      const results: AttemptResult[] = finalSession.questionIds.map(qId => {
        const q = questions.find(q => q.id === qId)!;
        const sel = finalSession.answers[qId] ?? -1;
        return {
          questionId: qId,
          selectedIndex: sel,
          isCorrect: sel === q.correctIndex,
          timeTaken: finalSession.questionTimeTaken[qId] ?? QUESTION_TIME,
          hintTaken: finalSession.hintShown[qId] === true,
        };
      });

      const score = results.filter(r => r.isCorrect).length;
      const duration = Math.floor((Date.now() - session.startTime) / 1000);

      saveAttempt({
        id: generateId(),
        date: new Date().toISOString(),
        totalQuestions,
        score,
        results,
        duration,
        allowRepeats: true,
      });

      clearSession();
      router.push('/results');
      return;
    }

    const updatedSession: QuizSession = {
      ...session,
      currentIndex: nextIndex,
      answers: updatedAnswers,
      questionTimeTaken: updatedTimeTaken,
    };
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
        <div style={{ fontSize: '48px', animation: 'wiggle 1s ease-in-out infinite' }}>🐰</div>
      </div>
    );
  }

  const timerPct = (timeLeft / QUESTION_TIME) * 100;
  const timerColor = timeLeft > 60 ? '#B4E8D4' : timeLeft > 30 ? '#FFE8A3' : '#FFB7C5';
  const isCorrect = selectedOption === currentQuestion.correctIndex;

  return (
    <div style={{ minHeight: '100vh', padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
      {showConfetti && <Confetti />}
      {showHalfway && <HalfwayPopup onClose={() => setShowHalfway(false)} />}

      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button
            onClick={() => {
              if (confirm('Leave quiz? Your progress will be saved.')) {
                router.push('/');
              }
            }}
            style={{
              background: '#F5F0FF',
              border: 'none',
              borderRadius: '50px',
              padding: '8px 16px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              color: '#7B6A9E',
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: '14px',
            color: '#7B6A9E',
            background: '#F5F0FF',
            padding: '8px 16px',
            borderRadius: '50px',
          }}>
            {currentIndex + 1} / {totalQuestions}
          </span>
          {/* Timer */}
          <div style={{
            background: timerColor,
            padding: '8px 14px',
            borderRadius: '50px',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: '14px',
            color: '#4A3F6B',
            transition: 'background 0.3s',
            minWidth: '72px',
            textAlign: 'center',
          }}>
            ⏰ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Timer bar */}
        <div style={{
          height: '6px',
          borderRadius: '999px',
          background: '#FFF0F3',
          marginTop: '6px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            borderRadius: '999px',
            background: timerColor,
            width: `${timerPct}%`,
            transition: 'width 1s linear, background 0.3s',
          }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="card" style={{
        padding: '20px',
        marginBottom: '14px',
        animation: 'slide-up 0.3s ease-out',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #C8B4E8, #FFB7C5)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: 800,
          }}>
            {currentQuestion.qNum}
          </span>
          
          {/* Hint button */}
          <button
            onClick={handleShowHint}
            style={{
              background: hintUnlocked ? (showHint ? '#FFE8A3' : '#FFF4CC') : '#F5F0FF',
              border: 'none',
              borderRadius: '50px',
              padding: '6px 14px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '12px',
              color: hintUnlocked ? '#4A3F6B' : '#C8C0D8',
              cursor: hintUnlocked ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            💡 {hintUnlocked ? 'Hint' : `Hint (1:00)`}
          </button>
        </div>

        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '15px',
          color: '#4A3F6B',
          lineHeight: 1.65,
          whiteSpace: 'pre-line',
        }}>
          {currentQuestion.text}
        </p>

        {/* Hint reveal */}
        {showHint && hintUnlocked && (
          <div style={{
            background: 'linear-gradient(135deg, #FFF4CC, #FFF8E8)',
            borderRadius: '14px',
            padding: '12px 14px',
            marginTop: '12px',
            fontSize: '13px',
            color: '#6B5A3F',
            fontWeight: 600,
            lineHeight: 1.5,
            border: '1.5px solid #FFE8A3',
            animation: 'slide-up 0.3s ease-out',
          }}>
            💡 <strong>Hint:</strong> {currentQuestion.hint}
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {currentQuestion.options.map((option, i) => {
          let bg = 'white';
          let border = '2px solid #E8DEFF';
          let color = '#4A3F6B';
          let emoji = '';

          if (showResult) {
            if (i === currentQuestion.correctIndex) {
              bg = '#D6F5EA';
              border = '2px solid #B4E8D4';
              emoji = ' ✅';
            } else if (i === selectedOption && !isCorrect) {
              bg = '#FFE8EC';
              border = '2px solid #FFB7C5';
              emoji = ' ❌';
            } else {
              bg = '#FAFAFA';
              color = '#C0B8D0';
            }
          } else if (selectedOption === i) {
            bg = '#F5F0FF';
            border = '2px solid #C8B4E8';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showResult}
              style={{
                background: bg,
                border,
                borderRadius: '16px',
                padding: '14px 16px',
                textAlign: 'left',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color,
                cursor: showResult ? 'default' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                lineHeight: 1.5,
                transform: (!showResult && selectedOption === i) ? 'scale(1.01)' : 'scale(1)',
                boxShadow: (!showResult) ? '0 2px 8px rgba(200,180,232,0.15)' : 'none',
              }}
            >
              <span style={{
                display: 'inline-flex',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: showResult && i === currentQuestion.correctIndex ? '#B4E8D4' :
                            showResult && i === selectedOption && !isCorrect ? '#FFB7C5' :
                            '#E8DEFF',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
                color: '#4A3F6B',
                marginRight: '10px',
                flexShrink: 0,
                float: 'left',
                marginTop: '1px',
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              {option}{emoji}
            </button>
          );
        })}
      </div>

      {/* Result feedback + Next button */}
      {showResult && (
        <div style={{ animation: 'slide-up 0.3s ease-out' }}>
          {/* Feedback */}
          <div style={{
            background: isCorrect ? 'linear-gradient(135deg, #D6F5EA, #F0FFF8)' : 'linear-gradient(135deg, #FFE8EC, #FFF0F3)',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '14px',
            textAlign: 'center',
            border: `1.5px solid ${isCorrect ? '#B4E8D4' : '#FFB7C5'}`,
          }}>
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>
              {selectedOption === -1 ? '⏰' : isCorrect ? '🎉' : '💪'}
            </div>
            <div style={{
              fontWeight: 800,
              fontSize: '16px',
              color: isCorrect ? '#2D6B52' : '#6B2D3F',
            }}>
              {selectedOption === -1 ? "Time's up!" : isCorrect ? 'Correct! You got it! 🌟' : 'Not quite, but you\'re learning! 💕'}
            </div>
            {!isCorrect && (
              <div style={{ fontSize: '13px', color: '#7B6A9E', marginTop: '6px', fontWeight: 600 }}>
                Correct: <strong>{currentQuestion.options[currentQuestion.correctIndex]}</strong>
              </div>
            )}
          </div>

          {/* Hint shown on wrong */}
          {(!isCorrect || selectedOption === -1) && (
            <div style={{
              background: 'linear-gradient(135deg, #FFF4CC, #FFF8E8)',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '14px',
              fontSize: '13px',
              color: '#6B5A3F',
              fontWeight: 600,
              lineHeight: 1.5,
              border: '1.5px solid #FFE8A3',
            }}>
              💡 <strong>Remember:</strong> {currentQuestion.hint}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleNext}
            style={{ width: '100%', fontSize: '16px', padding: '14px' }}
          >
            {currentIndex + 1 >= totalQuestions ? '🏆 See Results!' : 'Next Question →'}
          </button>
        </div>
      )}
    </div>
  );
}
