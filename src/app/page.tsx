'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Home as HomeIcon, BookOpen, XCircle, CheckCircle, Target, SlidersHorizontal,
  Clock, RefreshCw, Trophy, Zap, BarChart2, ChevronRight,
  Lightbulb, RotateCcw, AlertCircle, Star, Layers
} from 'lucide-react';
import { questions, TOTAL_QUESTIONS } from '@/lib/questions';
import { getAttempts, saveSession, generateId, getIncorrectQuestionIds } from '@/lib/storage';
import { QuizAttempt } from '@/lib/types';

type Tab = 'home' | 'history' | 'incorrect' | 'correct';

function FloatingOrb({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      pointerEvents: 'none',
      ...style,
    }} />
  );
}

function StatCard({ icon, value, label, color }: {
  icon: React.ReactNode; value: string | number; label: string; color: string;
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '16px 12px',
      textAlign: 'center',
      border: '1.5px solid #F0EBF8',
      flex: 1,
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '12px',
        background: color, display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 8px',
      }}>
        {icon}
      </div>
      <div style={{ fontWeight: 900, fontSize: '22px', color: '#4A3F6B', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#A99CBF', fontWeight: 600, marginTop: '3px' }}>{label}</div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [numQuestions, setNumQuestions] = useState(10);
  const [allowRepeats, setAllowRepeats] = useState(true);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    setMounted(true);
    setAttempts(getAttempts());
  }, []);

  const incorrectIds = mounted ? getIncorrectQuestionIds() : new Set<number>();
  const incorrectQuestions = questions.filter(q => incorrectIds.has(q.id));

  const correctIds = new Set<number>();
  if (mounted) {
    for (const attempt of attempts) {
      for (const result of attempt.results) {
        if (result.isCorrect) correctIds.add(result.questionId);
      }
    }
  }
  const correctQuestions = questions.filter(q => correctIds.has(q.id));

  const startQuiz = () => {
    let pool = questions.map(q => q.id);
    if (!allowRepeats && attempts.length > 0) {
      const seenIds = new Set<number>();
      for (const attempt of attempts) {
        for (const result of attempt.results) seenIds.add(result.questionId);
      }
      const unseen = pool.filter(id => !seenIds.has(id));
      if (unseen.length >= numQuestions) pool = unseen;
    }
    const selected = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(numQuestions, pool.length));
    saveSession({ questionIds: selected, currentIndex: 0, answers: {}, startTime: Date.now(), hintShown: {}, questionTimeTaken: {} });
    router.push('/quiz');
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const formatDuration = (s: number) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  const tabs: { key: Tab; icon: React.ReactNode; label: string; count?: number }[] = [
    { key: 'home', icon: <HomeIcon size={14} />, label: 'Home' },
    { key: 'history', icon: <BarChart2 size={14} />, label: 'History' },
    { key: 'incorrect', icon: <XCircle size={14} />, label: 'Wrong', count: incorrectQuestions.length },
    { key: 'correct', icon: <CheckCircle size={14} />, label: 'Correct', count: correctQuestions.length },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 32px', maxWidth: '480px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <FloatingOrb style={{ width: 320, height: 320, top: -100, right: -80, background: 'radial-gradient(circle, rgba(200,180,232,0.22) 0%, transparent 70%)' }} />
      <FloatingOrb style={{ width: 240, height: 240, bottom: 200, left: -60, background: 'radial-gradient(circle, rgba(180,232,212,0.2) 0%, transparent 70%)' }} />

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '36px 20px 24px', animation: 'slide-up 0.5s ease-out' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFB7C5, #C8B4E8)',
            padding: '3px', animation: 'float 3s ease-in-out infinite',
            boxShadow: '0 12px 40px rgba(200,180,232,0.35)',
          }}>
            <Image src="/bunny.jpg" alt="Mascot" width={104} height={104}
              style={{ borderRadius: '50%', border: '3px solid white', display: 'block' }} />
          </div>
          <div style={{
            position: 'absolute', bottom: 0, right: -2,
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #C8B4E8, #FFB7C5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(200,180,232,0.5)', border: '2px solid white',
          }}>
            <Star size={14} color="white" fill="white" />
          </div>
        </div>

        <h1 style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '26px',
          background: 'linear-gradient(135deg, #9B7EC8, #E07A9A)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1.2, marginBottom: '4px',
        }}>
          Malkin's Psychology
        </h1>
        <h2 style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '18px',
          color: '#B89ACC', marginBottom: '6px',
        }}>
          NET Quiz
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#B89ACC' }}>
          <BookOpen size={13} />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Study smart, study cute</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div style={{
          display: 'flex', background: '#F5F0FF', borderRadius: '20px',
          padding: '4px', gap: '2px',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: '10px 6px', borderRadius: '16px', border: 'none',
                cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                fontSize: '12px', transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                background: activeTab === tab.key ? 'white' : 'transparent',
                color: activeTab === tab.key ? '#7B6A9E' : '#B89ACC',
                boxShadow: activeTab === tab.key ? '0 2px 12px rgba(140,110,180,0.15)' : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              }}
            >
              {tab.icon}
              <span>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span style={{
                    marginLeft: '3px', background: activeTab === tab.key ? '#C8B4E8' : '#D8CFF0',
                    color: 'white', borderRadius: '20px', padding: '1px 5px', fontSize: '10px',
                  }}>{tab.count}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── HOME TAB ── */}
        {activeTab === 'home' && (
          <div style={{ animation: 'slide-up 0.3s ease-out' }}>
            {/* Setup Card */}
            <div style={{
              background: 'white', borderRadius: '24px', padding: '24px',
              border: '1.5px solid #F0EBF8', marginBottom: '14px',
              boxShadow: '0 4px 24px rgba(180,150,220,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '12px',
                  background: 'linear-gradient(135deg, #C8B4E8, #FFB7C5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Target size={18} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '18px', color: '#4A3F6B' }}>Set Up Your Quiz</span>
              </div>

              {/* Slider */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} color="#A99CBF" />
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#7B6A9E' }}>Questions</span>
                  </div>
                  <span style={{
                    fontWeight: 900, fontSize: '22px',
                    background: 'linear-gradient(135deg, #9B7EC8, #E07A9A)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>{numQuestions}</span>
                </div>
                <input type="range" min={5} max={TOTAL_QUESTIONS} value={numQuestions}
                  onChange={e => setNumQuestions(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#C8B4E8', height: '6px', cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#C8C0D8', fontWeight: 600 }}>5</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#B89ACC' }}>
                    <Clock size={11} />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>{numQuestions * 2} min total</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#C8C0D8', fontWeight: 600 }}>{TOTAL_QUESTIONS}</span>
                </div>
              </div>

              {/* Quick select */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {[10, 20, 30, 61].map(n => (
                  <button key={n} onClick={() => setNumQuestions(n)} style={{
                    flex: 1, padding: '8px 4px', borderRadius: '14px', border: 'none',
                    cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                    fontSize: '13px', transition: 'all 0.2s',
                    background: numQuestions === n ? 'linear-gradient(135deg, #C8B4E8, #FFB7C5)' : '#F5F0FF',
                    color: numQuestions === n ? 'white' : '#9B87C0',
                    boxShadow: numQuestions === n ? '0 4px 14px rgba(200,180,232,0.45)' : 'none',
                  }}>
                    {n === 61 ? 'All' : `${n}`}
                  </button>
                ))}
              </div>

              {/* Toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', background: '#FAF7FF', borderRadius: '16px',
                border: '1.5px solid #EEE8F8', marginBottom: '22px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '10px',
                    background: allowRepeats ? '#EEE8F8' : '#F0F0F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <RefreshCw size={14} color={allowRepeats ? '#9B7EC8' : '#C8C0D8'} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#4A3F6B' }}>Allow repeats</div>
                    <div style={{ fontSize: '11px', color: '#B89ACC', marginTop: '1px' }}>Include previously seen questions</div>
                  </div>
                </div>
                <button onClick={() => setAllowRepeats(!allowRepeats)} style={{
                  width: 48, height: 26, borderRadius: '50px', border: 'none', cursor: 'pointer',
                  background: allowRepeats ? 'linear-gradient(135deg, #C8B4E8, #FFB7C5)' : '#E0D8F0',
                  position: 'relative', transition: 'all 0.25s', flexShrink: 0,
                }}>
                  <span style={{
                    position: 'absolute', top: '3px',
                    left: allowRepeats ? '24px' : '3px',
                    width: 20, height: 20, borderRadius: '50%', background: 'white',
                    transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  }} />
                </button>
              </div>

              {/* Start button */}
              <button onClick={startQuiz} style={{
                width: '100%', padding: '16px',
                background: 'linear-gradient(135deg, #C8B4E8 0%, #E07A9A 100%)',
                border: 'none', borderRadius: '18px', cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '17px',
                color: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '10px',
                boxShadow: '0 8px 28px rgba(200,140,180,0.4)',
                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={16} color="white" />
                </div>
                Start Quiz
              </button>
            </div>

            {/* Stats */}
            {attempts.length > 0 && (
              <div style={{
                background: 'white', borderRadius: '24px', padding: '20px',
                border: '1.5px solid #F0EBF8', boxShadow: '0 4px 24px rgba(180,150,220,0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <BarChart2 size={15} color="#A99CBF" />
                  <span style={{ fontWeight: 800, fontSize: '15px', color: '#4A3F6B' }}>Your Stats</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <StatCard icon={<BookOpen size={16} color="#9B7EC8" />} value={attempts.length} label="Attempts" color="#F0EBFF" />
                  <StatCard icon={<Trophy size={16} color="#E07A9A" />}
                    value={`${Math.max(...attempts.map(a => Math.round((a.score / a.totalQuestions) * 100)))}%`}
                    label="Best Score" color="#FFF0F5" />
                  <StatCard icon={<Layers size={16} color="#52B788" />} value={TOTAL_QUESTIONS} label="Questions" color="#F0FFF8" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div style={{ animation: 'slide-up 0.3s ease-out' }}>
            {attempts.length === 0 ? (
              <div style={{
                background: 'white', borderRadius: '24px', padding: '48px 24px',
                textAlign: 'center', border: '1.5px solid #F0EBF8',
              }}>
                <div style={{ width: 64, height: 64, borderRadius: '20px', background: '#F5F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <BarChart2 size={28} color="#C8B4E8" />
                </div>
                <p style={{ color: '#7B6A9E', fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>No attempts yet</p>
                <p style={{ color: '#B89ACC', fontWeight: 600, fontSize: '13px' }}>Start your first quiz to see history here</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {attempts.map((attempt, i) => {
                  const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  const isGood = pct >= 70, isMid = pct >= 50;
                  const accentColor = isGood ? '#52B788' : isMid ? '#E9A84C' : '#E07A9A';
                  const bgColor = isGood ? '#F0FFF8' : isMid ? '#FFFBF0' : '#FFF0F5';
                  return (
                    <div key={attempt.id} style={{
                      background: 'white', borderRadius: '20px', padding: '16px 18px',
                      border: '1.5px solid #F0EBF8', boxShadow: '0 2px 12px rgba(180,150,220,0.07)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '12px', color: '#A99CBF' }}>
                            Attempt #{attempts.length - i}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '12px', color: '#B89ACC', marginTop: '2px' }}>
                            {formatDate(attempt.date)}
                          </div>
                        </div>
                        <div style={{
                          background: bgColor, border: `1.5px solid ${accentColor}30`,
                          borderRadius: '12px', padding: '6px 14px',
                          fontWeight: 900, fontSize: '18px', color: accentColor,
                        }}>
                          {pct}%
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                        {[
                          { icon: <CheckCircle size={12} color="#52B788" />, label: `${attempt.score} correct` },
                          { icon: <Clock size={12} color="#A99CBF" />, label: formatDuration(attempt.duration) },
                          { icon: <Layers size={12} color="#A99CBF" />, label: `${attempt.totalQuestions} questions` },
                        ].map((item, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#7B6A9E', fontWeight: 600 }}>
                            {item.icon} {item.label}
                          </div>
                        ))}
                      </div>
                      <div style={{ height: 6, borderRadius: '999px', background: '#F0EBF8', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '999px', width: `${pct}%`, background: accentColor, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── INCORRECT TAB ── */}
        {activeTab === 'incorrect' && (
          <div style={{ animation: 'slide-up 0.3s ease-out' }}>
            {incorrectQuestions.length === 0 ? (
              <div style={{
                background: 'white', borderRadius: '24px', padding: '48px 24px',
                textAlign: 'center', border: '1.5px solid #F0EBF8',
              }}>
                <div style={{ width: 64, height: 64, borderRadius: '20px', background: '#F0FFF8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle size={28} color="#52B788" />
                </div>
                <p style={{ color: '#4A3F6B', fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>No wrong answers!</p>
                <p style={{ color: '#B89ACC', fontWeight: 600, fontSize: '13px' }}>Keep it up, Malkin!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  background: '#FFF8EE', borderRadius: '16px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px', border: '1.5px solid #FFE8C8',
                }}>
                  <AlertCircle size={16} color="#E9A84C" />
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#7B6A9E' }}>
                    Review these {incorrectQuestions.length} questions carefully
                  </span>
                </div>
                {incorrectQuestions.map(q => (
                  <div key={q.id} style={{
                    background: 'white', borderRadius: '20px', padding: '16px 18px',
                    border: '1.5px solid #FFE0E8', boxShadow: '0 2px 12px rgba(224,122,154,0.08)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{
                        background: '#FFF0F5', color: '#E07A9A', padding: '3px 10px',
                        borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                      }}>{q.qNum}</span>
                      <XCircle size={16} color="#E07A9A" />
                    </div>
                    <p style={{ fontSize: '13px', color: '#4A3F6B', fontWeight: 600, lineHeight: 1.55, marginBottom: '10px' }}>
                      {q.text.split('\n')[0]}
                    </p>
                    <div style={{
                      background: '#F0FFF8', borderRadius: '12px', padding: '10px 13px',
                      fontSize: '12px', color: '#2D6B52', fontWeight: 600,
                      display: 'flex', alignItems: 'flex-start', gap: '7px',
                      border: '1.5px solid #D6F5EA', marginBottom: '8px',
                    }}>
                      <CheckCircle size={13} color="#52B788" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <span><strong>Correct:</strong> {q.options[q.correctIndex]}</span>
                    </div>
                    <div style={{
                      background: '#FFFBF0', borderRadius: '12px', padding: '10px 13px',
                      fontSize: '12px', color: '#7B6A4A', fontWeight: 600,
                      display: 'flex', alignItems: 'flex-start', gap: '7px',
                      border: '1.5px solid #FFE8A3',
                    }}>
                      <Lightbulb size={13} color="#E9A84C" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <span>{q.hint}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CORRECT TAB ── */}
        {activeTab === 'correct' && (
          <div style={{ animation: 'slide-up 0.3s ease-out' }}>
            {correctQuestions.length === 0 ? (
              <div style={{
                background: 'white', borderRadius: '24px', padding: '48px 24px',
                textAlign: 'center', border: '1.5px solid #F0EBF8',
              }}>
                <div style={{ width: 64, height: 64, borderRadius: '20px', background: '#F5F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Star size={28} color="#C8B4E8" />
                </div>
                <p style={{ color: '#4A3F6B', fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>No correct answers yet</p>
                <p style={{ color: '#B89ACC', fontWeight: 600, fontSize: '13px' }}>Start a quiz to track your wins!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  background: '#F0FFF8', borderRadius: '16px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px', border: '1.5px solid #B4E8D4',
                }}>
                  <Trophy size={16} color="#52B788" />
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#2D6B52' }}>
                    {correctQuestions.length} questions mastered
                  </span>
                </div>
                {correctQuestions.map(q => (
                  <div key={q.id} style={{
                    background: 'white', borderRadius: '20px', padding: '16px 18px',
                    border: '1.5px solid #D6F5EA', boxShadow: '0 2px 12px rgba(82,183,136,0.08)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{
                        background: '#F0FFF8', color: '#52B788', padding: '3px 10px',
                        borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                      }}>{q.qNum}</span>
                      <CheckCircle size={16} color="#52B788" />
                    </div>
                    <p style={{ fontSize: '13px', color: '#4A3F6B', fontWeight: 600, lineHeight: 1.55, marginBottom: '10px' }}>
                      {q.text.split('\n')[0]}
                    </p>
                    <div style={{
                      background: '#F0FFF8', borderRadius: '12px', padding: '10px 13px',
                      fontSize: '12px', color: '#2D6B52', fontWeight: 600,
                      display: 'flex', alignItems: 'flex-start', gap: '7px',
                      border: '1.5px solid #D6F5EA',
                    }}>
                      <CheckCircle size={13} color="#52B788" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <span>{q.options[q.correctIndex]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '32px 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <span style={{ color: '#C8C0D8', fontSize: '12px', fontWeight: 600 }}>Made for Malkin's NET prep</span>
      </div>
    </div>
  );
}
