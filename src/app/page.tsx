'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Home as HomeIcon, BookOpen, XCircle, CheckCircle, Target,
  Clock, RefreshCw, Trophy, BarChart2, ChevronRight,
  Lightbulb, AlertCircle, Star, Layers
} from 'lucide-react';
import { questions, TOTAL_QUESTIONS } from '@/lib/questions';
import { getAttempts, saveSession, getIncorrectQuestionIds } from '@/lib/storage';
import { QuizAttempt } from '@/lib/types';

type Tab = 'home' | 'history' | 'incorrect' | 'correct';

export default function Home() {
  const router = useRouter();
  const [numQuestions, setNumQuestions] = useState(10);
  const [allowRepeats, setAllowRepeats] = useState(true);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => { setMounted(true); setAttempts(getAttempts()); }, []);

  const incorrectIds = mounted ? getIncorrectQuestionIds() : new Set<number>();
  const incorrectQuestions = questions.filter(q => incorrectIds.has(q.id));
  const correctIds = new Set<number>();
  if (mounted) for (const a of attempts) for (const r of a.results) if (r.isCorrect) correctIds.add(r.questionId);
  const correctQuestions = questions.filter(q => correctIds.has(q.id));

  const startQuiz = () => {
    let pool = questions.map(q => q.id);
    if (!allowRepeats && attempts.length > 0) {
      const seen = new Set<number>();
      for (const a of attempts) for (const r of a.results) seen.add(r.questionId);
      const unseen = pool.filter(id => !seen.has(id));
      if (unseen.length >= numQuestions) pool = unseen;
    }
    const selected = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(numQuestions, pool.length));
    saveSession({ questionIds: selected, currentIndex: 0, answers: {}, startTime: Date.now(), hintShown: {}, questionTimeTaken: {} });
    router.push('/quiz');
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const fmtDur = (s: number) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  const tabs: { key: Tab; icon: React.ReactNode; label: string; count?: number }[] = [
    { key: 'home',      icon: <HomeIcon size={13} />,    label: 'Home' },
    { key: 'history',   icon: <BarChart2 size={13} />,   label: 'History' },
    { key: 'incorrect', icon: <XCircle size={13} />,     label: 'Wrong',   count: incorrectQuestions.length },
    { key: 'correct',   icon: <CheckCircle size={13} />, label: 'Correct', count: correctQuestions.length },
  ];

  const EmptyState = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ width: 56, height: 56, borderRadius: '18px', background: '#F5F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        {icon}
      </div>
      <p style={{ fontWeight: 700, fontSize: '15px', color: '#4A3F6B', marginBottom: '4px' }}>{title}</p>
      <p style={{ fontWeight: 600, fontSize: '12px', color: '#B89ACC' }}>{sub}</p>
    </div>
  );

  return (
    // ── FULL VIEWPORT FLEX COLUMN ──
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', maxWidth: 480, margin: '0 auto', boxSizing: 'border-box',
    }}>
      {/* ── HEADER (compact, fixed) ── */}
      <div style={{ flexShrink: 0, textAlign: 'center', padding: '16px 16px 10px', position: 'relative' }}>
        {/* Soft background blob */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 180, height: 180,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,180,232,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #FFB7C5, #C8B4E8)',
            padding: '2px', animation: 'float 3s ease-in-out infinite',
            boxShadow: '0 6px 20px rgba(200,180,232,0.3)',
          }}>
            <Image src="/bunny.jpg" alt="Mascot" width={56} height={56}
              style={{ borderRadius: '50%', border: '2px solid white', display: 'block' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{
              fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '18px',
              background: 'linear-gradient(135deg, #9B7EC8, #E07A9A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1.2, margin: 0,
            }}>Malkin's Psychology</h1>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#B89ACC', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={11} color="#B89ACC" /> NET Quiz
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR (fixed) ── */}
      <div style={{ flexShrink: 0, padding: '0 14px 10px' }}>
        <div style={{ display: 'flex', background: '#F5F0FF', borderRadius: '18px', padding: '3px', gap: '2px' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: 1, padding: '9px 4px', borderRadius: '15px', border: 'none',
              cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
              fontSize: '11px', transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              background: activeTab === tab.key ? 'white' : 'transparent',
              color: activeTab === tab.key ? '#7B6A9E' : '#B89ACC',
              boxShadow: activeTab === tab.key ? '0 2px 8px rgba(140,110,180,0.12)' : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            }}>
              {tab.icon}
              <span>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span style={{
                    marginLeft: '3px', background: activeTab === tab.key ? '#C8B4E8' : '#D8CFF0',
                    color: 'white', borderRadius: '20px', padding: '0px 4px', fontSize: '9px',
                  }}>{tab.count}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT (flex:1 = fills remaining, scrolls internally) ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 14px 16px' }}>

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'slide-up 0.25s ease-out' }}>
            {/* Setup card */}
            <div style={{ background: 'white', borderRadius: '22px', padding: '18px', border: '1.5px solid #F0EBF8', boxShadow: '0 3px 18px rgba(180,150,220,0.09)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '16px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '11px', background: 'linear-gradient(135deg, #C8B4E8, #FFB7C5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={16} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '16px', color: '#4A3F6B' }}>Set Up Your Quiz</span>
              </div>

              {/* Slider */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Layers size={13} color="#A99CBF" />
                    <span style={{ fontWeight: 700, fontSize: '12px', color: '#7B6A9E' }}>Questions</span>
                  </div>
                  <span style={{
                    fontWeight: 900, fontSize: '20px',
                    background: 'linear-gradient(135deg, #9B7EC8, #E07A9A)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>{numQuestions}</span>
                </div>
                <input type="range" min={5} max={TOTAL_QUESTIONS} value={numQuestions}
                  onChange={e => setNumQuestions(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#C8B4E8', height: '5px', cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#C8C0D8', fontWeight: 600 }}>5</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#B89ACC' }}>
                    <Clock size={10} />
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>{numQuestions * 2} min total</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#C8C0D8', fontWeight: 600 }}>{TOTAL_QUESTIONS}</span>
                </div>
              </div>

              {/* Quick select */}
              <div style={{ display: 'flex', gap: '7px', marginBottom: '14px' }}>
                {[10, 20, 30, 61].map(n => (
                  <button key={n} onClick={() => setNumQuestions(n)} style={{
                    flex: 1, padding: '7px 4px', borderRadius: '12px', border: 'none',
                    cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                    fontSize: '12px', transition: 'all 0.2s',
                    background: numQuestions === n ? 'linear-gradient(135deg, #C8B4E8, #FFB7C5)' : '#F5F0FF',
                    color: numQuestions === n ? 'white' : '#9B87C0',
                    boxShadow: numQuestions === n ? '0 3px 10px rgba(200,180,232,0.4)' : 'none',
                  }}>
                    {n === 61 ? 'All' : n}
                  </button>
                ))}
              </div>

              {/* Repeat toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px', background: '#FAF7FF', borderRadius: '14px',
                border: '1.5px solid #EEE8F8', marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '9px', background: allowRepeats ? '#EEE8F8' : '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RefreshCw size={13} color={allowRepeats ? '#9B7EC8' : '#C8C0D8'} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#4A3F6B' }}>Allow repeats</div>
                    <div style={{ fontSize: '10px', color: '#B89ACC' }}>Include previously seen</div>
                  </div>
                </div>
                <button onClick={() => setAllowRepeats(!allowRepeats)} style={{
                  width: 44, height: 24, borderRadius: '50px', border: 'none', cursor: 'pointer',
                  background: allowRepeats ? 'linear-gradient(135deg, #C8B4E8, #FFB7C5)' : '#E0D8F0',
                  position: 'relative', transition: 'all 0.25s', flexShrink: 0,
                }}>
                  <span style={{
                    position: 'absolute', top: '2px', left: allowRepeats ? '22px' : '2px',
                    width: 20, height: 20, borderRadius: '50%', background: 'white',
                    transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', display: 'block',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  }} />
                </button>
              </div>

              {/* Start */}
              <button onClick={startQuiz} style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, #C8B4E8 0%, #E07A9A 100%)',
                border: 'none', borderRadius: '16px', cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '16px',
                color: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                boxShadow: '0 6px 22px rgba(200,140,180,0.38)',
              }}>
                <ChevronRight size={18} color="white" /> Start Quiz
              </button>
            </div>

            {/* Stats (only if data exists) */}
            {attempts.length > 0 && (
              <div style={{ background: 'white', borderRadius: '20px', padding: '16px', border: '1.5px solid #F0EBF8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                  <BarChart2 size={14} color="#A99CBF" />
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#4A3F6B' }}>Your Stats</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { icon: <BookOpen size={14} color="#9B7EC8" />, val: attempts.length, label: 'Attempts', bg: '#F0EBFF' },
                    { icon: <Trophy size={14} color="#E07A9A" />, val: `${Math.max(...attempts.map(a => Math.round((a.score / a.totalQuestions) * 100)))}%`, label: 'Best', bg: '#FFF0F5' },
                    { icon: <Layers size={14} color="#52B788" />, val: TOTAL_QUESTIONS, label: 'Total Qs', bg: '#F0FFF8' },
                  ].map((s, i) => (
                    <div key={i} style={{ flex: 1, background: 'white', borderRadius: '14px', padding: '10px 8px', textAlign: 'center', border: '1.5px solid #F0EBF8' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                        {s.icon}
                      </div>
                      <div style={{ fontWeight: 900, fontSize: '18px', color: '#4A3F6B' }}>{s.val}</div>
                      <div style={{ fontSize: '10px', color: '#A99CBF', fontWeight: 600 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div style={{ animation: 'slide-up 0.25s ease-out' }}>
            {attempts.length === 0
              ? <EmptyState icon={<BarChart2 size={24} color="#C8B4E8" />} title="No attempts yet" sub="Start your first quiz to see history here" />
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {attempts.map((attempt, i) => {
                  const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  const isGood = pct >= 70, isMid = pct >= 50;
                  const ac = isGood ? '#52B788' : isMid ? '#E9A84C' : '#E07A9A';
                  const ab = isGood ? '#F0FFF8' : isMid ? '#FFFBF0' : '#FFF0F5';
                  return (
                    <div key={attempt.id} style={{ background: 'white', borderRadius: '18px', padding: '14px 16px', border: '1.5px solid #F0EBF8' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '11px', color: '#A99CBF' }}>Attempt #{attempts.length - i}</div>
                          <div style={{ fontSize: '11px', color: '#B89ACC', marginTop: '1px' }}>{fmtDate(attempt.date)}</div>
                        </div>
                        <div style={{ background: ab, border: `1.5px solid ${ac}30`, borderRadius: '10px', padding: '5px 12px', fontWeight: 900, fontSize: '16px', color: ac }}>
                          {pct}%
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                        {[
                          { icon: <CheckCircle size={11} color="#52B788" />, text: `${attempt.score} correct` },
                          { icon: <Clock size={11} color="#A99CBF" />, text: fmtDur(attempt.duration) },
                          { icon: <Layers size={11} color="#A99CBF" />, text: `${attempt.totalQuestions} Qs` },
                        ].map((item, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#7B6A9E', fontWeight: 600 }}>
                            {item.icon} {item.text}
                          </div>
                        ))}
                      </div>
                      <div style={{ height: 5, borderRadius: '999px', background: '#F0EBF8', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '999px', width: `${pct}%`, background: ac }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            }
          </div>
        )}

        {/* INCORRECT TAB */}
        {activeTab === 'incorrect' && (
          <div style={{ animation: 'slide-up 0.25s ease-out' }}>
            {incorrectQuestions.length === 0
              ? <EmptyState icon={<CheckCircle size={24} color="#52B788" />} title="No wrong answers!" sub="Keep it up, Malkin!" />
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div style={{ background: '#FFF8EE', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px solid #FFE8C8' }}>
                  <AlertCircle size={14} color="#E9A84C" />
                  <span style={{ fontWeight: 700, fontSize: '12px', color: '#7B6A9E' }}>Review these {incorrectQuestions.length} questions</span>
                </div>
                {incorrectQuestions.map(q => (
                  <div key={q.id} style={{ background: 'white', borderRadius: '18px', padding: '14px 16px', border: '1.5px solid #FFE0E8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: '#FFF0F5', color: '#E07A9A', padding: '2px 8px', borderRadius: '7px', fontSize: '11px', fontWeight: 700 }}>{q.qNum}</span>
                      <XCircle size={14} color="#E07A9A" />
                    </div>
                    <p style={{ fontSize: '12px', color: '#4A3F6B', fontWeight: 600, lineHeight: 1.5, marginBottom: '9px' }}>{q.text.split('\n')[0]}</p>
                    <div style={{ background: '#F0FFF8', borderRadius: '10px', padding: '9px 11px', fontSize: '12px', color: '#2D6B52', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '6px', border: '1.5px solid #D6F5EA', marginBottom: '7px' }}>
                      <CheckCircle size={12} color="#52B788" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <span>{q.options[q.correctIndex]}</span>
                    </div>
                    <div style={{ background: '#FFFBF0', borderRadius: '10px', padding: '9px 11px', fontSize: '12px', color: '#7B6A4A', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '6px', border: '1.5px solid #FFE8A3' }}>
                      <Lightbulb size={12} color="#E9A84C" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <span>{q.hint}</span>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* CORRECT TAB */}
        {activeTab === 'correct' && (
          <div style={{ animation: 'slide-up 0.25s ease-out' }}>
            {correctQuestions.length === 0
              ? <EmptyState icon={<Star size={24} color="#C8B4E8" />} title="No correct answers yet" sub="Start a quiz to track your wins!" />
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div style={{ background: '#F0FFF8', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px solid #B4E8D4' }}>
                  <Trophy size={14} color="#52B788" />
                  <span style={{ fontWeight: 700, fontSize: '12px', color: '#2D6B52' }}>{correctQuestions.length} questions mastered</span>
                </div>
                {correctQuestions.map(q => (
                  <div key={q.id} style={{ background: 'white', borderRadius: '18px', padding: '14px 16px', border: '1.5px solid #D6F5EA' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: '#F0FFF8', color: '#52B788', padding: '2px 8px', borderRadius: '7px', fontSize: '11px', fontWeight: 700 }}>{q.qNum}</span>
                      <CheckCircle size={14} color="#52B788" />
                    </div>
                    <p style={{ fontSize: '12px', color: '#4A3F6B', fontWeight: 600, lineHeight: 1.5, marginBottom: '9px' }}>{q.text.split('\n')[0]}</p>
                    <div style={{ background: '#F0FFF8', borderRadius: '10px', padding: '9px 11px', fontSize: '12px', color: '#2D6B52', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '6px', border: '1.5px solid #D6F5EA' }}>
                      <CheckCircle size={12} color="#52B788" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <span>{q.options[q.correctIndex]}</span>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, textAlign: 'center', padding: '6px 0 10px', fontSize: '11px', color: '#C8C0D8', fontWeight: 600 }}>
        Made for Malkin's NET prep
      </div>
    </div>
  );
}
