'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { questions, TOTAL_QUESTIONS } from '@/lib/questions';
import { getAttempts, saveSession, generateId, getIncorrectQuestionIds } from '@/lib/storage';
import { QuizAttempt } from '@/lib/types';

const SPARKLES = ['✨', '⭐', '🌸', '💫', '🌟', '🍀', '🦋', '🌺'];

function FloatingSparkle({ emoji, style }: { emoji: string; style: React.CSSProperties }) {
  return (
    <span
      style={{
        position: 'absolute',
        fontSize: '20px',
        animation: `float ${2 + Math.random() * 2}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 2}s`,
        pointerEvents: 'none',
        ...style,
      }}
    >
      {emoji}
    </span>
  );
}

export default function Home() {
  const router = useRouter();
  const [numQuestions, setNumQuestions] = useState(10);
  const [allowRepeats, setAllowRepeats] = useState(true);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'incorrect' | 'correct' | 'history'>('home');

  useEffect(() => {
    setMounted(true);
    setAttempts(getAttempts());
  }, []);

  const incorrectIds = mounted ? getIncorrectQuestionIds() : new Set<number>();
  const incorrectQuestions = questions.filter(q => incorrectIds.has(q.id));
  
  // Get correct questions (answered correctly in most recent attempt they appeared)
  const correctIds = new Set<number>();
  if (mounted) {
    for (const attempt of attempts) {
      for (const result of attempt.results) {
        if (result.isCorrect) correctIds.add(result.questionId);
      }
    }
    // Remove ones that were later incorrect
    for (const attempt of attempts) {
      for (const result of attempt.results) {
        if (!result.isCorrect && correctIds.has(result.questionId)) {
          // Keep it — show all ever correctly answered
        }
      }
    }
  }
  const correctQuestions = questions.filter(q => correctIds.has(q.id));

  const startQuiz = () => {
    let pool = questions.map(q => q.id);
    
    if (!allowRepeats && attempts.length > 0) {
      const seenIds = new Set<number>();
      for (const attempt of attempts) {
        for (const result of attempt.results) {
          seenIds.add(result.questionId);
        }
      }
      const unseen = pool.filter(id => !seenIds.has(id));
      if (unseen.length >= numQuestions) {
        pool = unseen;
      }
      // If not enough unseen questions, fall back to full pool
    }

    // Shuffle and pick
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));

    saveSession({
      questionIds: selected,
      currentIndex: 0,
      answers: {},
      startTime: Date.now(),
      hintShown: {},
    });

    router.push('/quiz');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const tabStyle = (tab: typeof activeTab): React.CSSProperties => ({
    padding: '10px 18px',
    borderRadius: '50px',
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 700,
    fontSize: '14px',
    transition: 'all 0.2s',
    background: activeTab === tab ? 'linear-gradient(135deg, #C8B4E8, #FFB7C5)' : 'white',
    color: activeTab === tab ? 'white' : '#7B6A9E',
    boxShadow: activeTab === tab ? '0 4px 15px rgba(200,180,232,0.4)' : 'none',
    border: activeTab !== tab ? '2px solid #E8DEFF' : 'none',
  } as React.CSSProperties);

  return (
    <div style={{ minHeight: '100vh', padding: '20px 16px', maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
      {/* Floating decorations */}
      {mounted && (
        <>
          <FloatingSparkle emoji="🌸" style={{ top: '5%', left: '5%' }} />
          <FloatingSparkle emoji="✨" style={{ top: '10%', right: '8%' }} />
          <FloatingSparkle emoji="⭐" style={{ top: '20%', left: '3%' }} />
          <FloatingSparkle emoji="🦋" style={{ top: '35%', right: '4%' }} />
        </>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', animation: 'slide-up 0.5s ease-out' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Image
            src="/bunny.jpg"
            alt="Quiz Bunny Mascot"
            width={120}
            height={120}
            style={{
              borderRadius: '50%',
              border: '4px solid #FFB7C5',
              boxShadow: '0 8px 30px rgba(255,183,197,0.4)',
              animation: 'float 3s ease-in-out infinite',
            }}
          />
          <span style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            fontSize: '28px',
            animation: 'wiggle 1.5s ease-in-out infinite',
          }}>🎓</span>
        </div>
        
        <h1 style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 900,
          fontSize: '26px',
          background: 'linear-gradient(135deg, #C8B4E8, #FFB7C5, #FFD4B2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginTop: '12px',
          lineHeight: 1.2,
        }}>
          Malkin's Psychology
        </h1>
        <h2 style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 900,
          fontSize: '20px',
          background: 'linear-gradient(135deg, #FFB7C5, #C8B4E8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginTop: '2px',
        }}>
          NET Quiz ✨
        </h2>
        <p style={{ color: '#A99CBF', fontSize: '14px', marginTop: '6px', fontWeight: 600 }}>
          🐰 Study smart, study cute!
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '20px',
        overflowX: 'auto',
        padding: '4px',
        scrollbarWidth: 'none',
      }}>
        {(['home', 'history', 'incorrect', 'correct'] as const).map(tab => (
          <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>
            {tab === 'home' ? '🏠 Home' :
             tab === 'history' ? '📚 History' :
             tab === 'incorrect' ? `❌ Wrong (${incorrectQuestions.length})` :
             `✅ Correct (${correctQuestions.length})`}
          </button>
        ))}
      </div>

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <div style={{ animation: 'slide-up 0.3s ease-out' }}>
          {/* Quiz Setup Card */}
          <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
            <h3 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: '18px',
              color: '#4A3F6B',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              🎯 Set Up Your Quiz
            </h3>

            {/* Number of Questions */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                fontWeight: 700, 
                fontSize: '14px', 
                color: '#7B6A9E', 
                display: 'block', 
                marginBottom: '10px' 
              }}>
                📝 Number of Questions: <span style={{
                  background: 'linear-gradient(135deg, #C8B4E8, #FFB7C5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                  fontSize: '18px',
                }}>{numQuestions}</span>
              </label>
              <input
                type="range"
                min={5}
                max={TOTAL_QUESTIONS}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#C8B4E8',
                  height: '6px',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: '#A99CBF', fontWeight: 600 }}>5</span>
                <span style={{ fontSize: '12px', color: '#A99CBF', fontWeight: 600 }}>
                  ⏰ {numQuestions * 2} min total
                </span>
                <span style={{ fontSize: '12px', color: '#A99CBF', fontWeight: 600 }}>{TOTAL_QUESTIONS}</span>
              </div>
            </div>

            {/* Quick select buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[10, 20, 30, 61].map(n => (
                <button
                  key={n}
                  onClick={() => setNumQuestions(n)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '50px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: '13px',
                    transition: 'all 0.2s',
                    background: numQuestions === n ? 'linear-gradient(135deg, #C8B4E8, #FFB7C5)' : '#F5F0FF',
                    color: numQuestions === n ? 'white' : '#7B6A9E',
                    boxShadow: numQuestions === n ? '0 3px 12px rgba(200,180,232,0.4)' : 'none',
                  }}
                >
                  {n === 61 ? 'All 🌟' : `${n} Qs`}
                </button>
              ))}
            </div>

            {/* Allow Repeats Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: '#F5F0FF',
              borderRadius: '16px',
              marginBottom: '24px',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#4A3F6B' }}>
                  🔄 Allow Previously Attempted
                </div>
                <div style={{ fontSize: '12px', color: '#A99CBF', marginTop: '2px' }}>
                  Include questions you've seen before
                </div>
              </div>
              <button
                onClick={() => setAllowRepeats(!allowRepeats)}
                style={{
                  width: '52px',
                  height: '28px',
                  borderRadius: '50px',
                  border: 'none',
                  cursor: 'pointer',
                  background: allowRepeats ? 'linear-gradient(135deg, #C8B4E8, #FFB7C5)' : '#D8D0E8',
                  position: 'relative',
                  transition: 'all 0.25s',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '3px',
                  left: allowRepeats ? '26px' : '3px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'white',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  display: 'block',
                }} />
              </button>
            </div>

            {/* Start Button */}
            <button
              className="btn-primary"
              onClick={startQuiz}
              style={{ width: '100%', fontSize: '18px', padding: '16px' }}
            >
              🐰 Start Quiz! ✨
            </button>
          </div>

          {/* Stats Card */}
          {attempts.length > 0 && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '16px', color: '#4A3F6B', marginBottom: '14px' }}>
                📊 Your Stats
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Attempts', value: attempts.length, emoji: '📝' },
                  { label: 'Best Score', value: `${Math.max(...attempts.map(a => Math.round((a.score / a.totalQuestions) * 100)))}%`, emoji: '🏆' },
                  { label: 'Questions', value: TOTAL_QUESTIONS, emoji: '❓' },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: '#F5F0FF',
                    borderRadius: '16px',
                    padding: '12px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '22px' }}>{stat.emoji}</div>
                    <div style={{ fontWeight: 900, fontSize: '20px', color: '#4A3F6B' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#A99CBF', fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div style={{ animation: 'slide-up 0.3s ease-out' }}>
          {attempts.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '60px', marginBottom: '16px' }}>📚</div>
              <p style={{ color: '#A99CBF', fontWeight: 600, fontSize: '16px' }}>
                No attempts yet!<br />
                <span style={{ fontSize: '14px' }}>Start your first quiz to see history here~ 🌸</span>
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {attempts.map((attempt, i) => {
                const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                const color = pct >= 70 ? '#B4E8D4' : pct >= 50 ? '#FFE8A3' : '#FFB7C5';
                return (
                  <div key={attempt.id} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#A99CBF' }}>
                        #{attempts.length - i} • {formatDate(attempt.date)}
                      </span>
                      <span style={{
                        background: color,
                        padding: '4px 12px',
                        borderRadius: '50px',
                        fontWeight: 800,
                        fontSize: '14px',
                        color: '#4A3F6B',
                      }}>
                        {pct >= 70 ? '🌟' : pct >= 50 ? '⭐' : '💪'} {pct}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#7B6A9E', fontWeight: 600 }}>
                      <span>✅ {attempt.score}/{attempt.totalQuestions}</span>
                      <span>⏱️ {formatDuration(attempt.duration)}</span>
                      <span>📝 {attempt.totalQuestions} Qs</span>
                    </div>
                    <div className="progress-bar" style={{ marginTop: '10px' }}>
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* INCORRECT TAB */}
      {activeTab === 'incorrect' && (
        <div style={{ animation: 'slide-up 0.3s ease-out' }}>
          {incorrectQuestions.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</div>
              <p style={{ color: '#A99CBF', fontWeight: 600, fontSize: '16px' }}>
                No incorrect answers yet!<br />
                <span style={{ fontSize: '14px' }}>Keep it up, Malkin! 🌸</span>
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: '#FFE8A3',
                borderRadius: '16px',
                padding: '14px 16px',
                fontWeight: 700,
                fontSize: '14px',
                color: '#4A3F6B',
                marginBottom: '4px',
              }}>
                💡 Review these {incorrectQuestions.length} questions carefully!
              </div>
              {incorrectQuestions.map(q => (
                <div key={q.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      background: '#FFB7C5',
                      padding: '3px 10px',
                      borderRadius: '50px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#4A3F6B',
                    }}>{q.qNum}</span>
                    <span style={{ fontSize: '18px' }}>❌</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#4A3F6B', fontWeight: 600, marginBottom: '10px', lineHeight: 1.5 }}>
                    {q.text.split('\n')[0]}
                  </p>
                  <div style={{
                    background: '#F5F0FF',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#7B6A9E',
                    fontWeight: 600,
                  }}>
                    ✅ <strong>Correct:</strong> {q.options[q.correctIndex]}
                  </div>
                  <div style={{
                    background: '#FFF0F3',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#7B6A9E',
                    fontWeight: 600,
                  }}>
                    💡 {q.hint}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CORRECT TAB */}
      {activeTab === 'correct' && (
        <div style={{ animation: 'slide-up 0.3s ease-out' }}>
          {correctQuestions.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '60px', marginBottom: '16px' }}>🌟</div>
              <p style={{ color: '#A99CBF', fontWeight: 600, fontSize: '16px' }}>
                No correct answers yet!<br />
                <span style={{ fontSize: '14px' }}>Start a quiz to track your wins~ 🌸</span>
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: '#B4E8D4',
                borderRadius: '16px',
                padding: '14px 16px',
                fontWeight: 700,
                fontSize: '14px',
                color: '#4A3F6B',
                marginBottom: '4px',
              }}>
                🌟 You got {correctQuestions.length} questions right!
              </div>
              {correctQuestions.map(q => (
                <div key={q.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      background: '#B4E8D4',
                      padding: '3px 10px',
                      borderRadius: '50px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#4A3F6B',
                    }}>{q.qNum}</span>
                    <span style={{ fontSize: '18px' }}>✅</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#4A3F6B', fontWeight: 600, marginBottom: '8px', lineHeight: 1.5 }}>
                    {q.text.split('\n')[0]}
                  </p>
                  <div style={{
                    background: '#D6F5EA',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#4A6B5A',
                    fontWeight: 600,
                  }}>
                    ✅ {q.options[q.correctIndex]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 0 12px', color: '#A99CBF', fontSize: '12px', fontWeight: 600 }}>
        Made with 💕 for Malkin's NET prep 🐰✨
      </div>
    </div>
  );
}
