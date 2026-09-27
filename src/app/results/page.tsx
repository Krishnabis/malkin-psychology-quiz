'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft, Share2, Download, RotateCcw, CheckCircle, XCircle,
  Clock, Lightbulb, Trophy, Star, Zap, ClipboardList, Check, X
} from 'lucide-react';
import { questions } from '@/lib/questions';
import { getAttempts } from '@/lib/storage';
import { QuizAttempt } from '@/lib/types';
import { downloadRealPDF } from '@/lib/pdf';

function formatSecs(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}



export default function ResultsPage() {
  const router = useRouter();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const attempts = getAttempts();
    if (attempts.length > 0) setAttempt(attempts[0]);
    else router.replace('/');
  }, [router]);

  const downloadPDF = async () => {
    if (!attempt) return;
    setDownloading(true);
    try {
      downloadRealPDF(attempt);
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const shareResult = async () => {
    if (!attempt) return;
    const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
    const text = `Malkin's Psychology NET Quiz Result\n\nScore: ${attempt.score}/${attempt.totalQuestions} (${pct}%)\nQuestions: ${attempt.totalQuestions}\nTime: ${formatSecs(attempt.duration)}\n\n${pct >= 70 ? 'Amazing job!' : pct >= 50 ? 'Good effort!' : 'Keep studying!'}`;
    if (navigator.share) {
      try { await navigator.share({ text, title: "Malkin's Psychology NET Quiz Result" }); }
      catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  };

  if (!mounted || !attempt) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #C8B4E8', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const isGreat = pct >= 70, isGood = pct >= 50;
  const accentColor = isGreat ? '#52B788' : isGood ? '#E9A84C' : '#E07A9A';
  const accentBg    = isGreat ? '#F0FFF8' : isGood ? '#FFFBF0' : '#FFF0F5';
  const accentBorder = isGreat ? '#B4E8D4' : isGood ? '#FFE8A3' : '#FFB7C5';

  const ScoreIcon = isGreat ? Trophy : isGood ? Star : Zap;
  const resultMsg = isGreat ? 'Brilliant work, Malkin!' : isGood ? 'Good effort! Keep going!' : "Don't give up — you're getting there!";

  return (
    <div style={{ minHeight: '100vh', padding: '16px 16px 40px', maxWidth: '480px', margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => router.push('/')}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'white', border: '1.5px solid #F0EBF8',
          borderRadius: '14px', padding: '10px 14px', cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13px',
          color: '#7B6A9E', marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(180,150,220,0.1)',
        }}
      >
        <ArrowLeft size={15} color="#7B6A9E" /> Home
      </button>

      {/* Score card */}
      <div style={{
        background: 'white', borderRadius: '28px', padding: '32px 24px',
        textAlign: 'center', marginBottom: '14px',
        border: `1.5px solid ${accentBorder}`,
        boxShadow: '0 8px 32px rgba(180,150,220,0.12)',
        animation: 'bounce-in 0.55s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFB7C5, #C8B4E8)',
          padding: '3px', margin: '0 auto 20px',
          boxShadow: '0 8px 28px rgba(200,180,232,0.35)',
          animation: 'float 3s ease-in-out infinite',
        }}>
          <Image src="/bunny.jpg" alt="Bunny" width={84} height={84}
            style={{ borderRadius: '50%', border: '3px solid white', display: 'block' }} />
        </div>

        <div style={{
          width: 56, height: 56, borderRadius: '18px', background: accentBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <ScoreIcon size={26} color={accentColor} />
        </div>

        <div style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '64px',
          color: accentColor, lineHeight: 1, marginBottom: '6px',
        }}>
          {pct}%
        </div>
        <div style={{ fontWeight: 700, fontSize: '16px', color: '#5A4F7A', marginBottom: '4px' }}>
          {attempt.score} / {attempt.totalQuestions} correct
        </div>
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#A99CBF', marginBottom: '24px' }}>
          {resultMsg}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0', background: '#F8F5FF', borderRadius: '18px', overflow: 'hidden' }}>
          {[
            { icon: <CheckCircle size={16} color="#52B788" />, value: attempt.score, label: 'Correct', color: '#F0FFF8' },
            { icon: <XCircle size={16} color="#E07A9A" />, value: attempt.totalQuestions - attempt.score, label: 'Wrong', color: '#FFF0F5' },
            { icon: <Clock size={16} color="#9B87C0" />, value: formatSecs(attempt.duration), label: 'Time', color: '#F5F0FF' },
          ].map((item, i, arr) => (
            <div key={i} style={{
              flex: 1, padding: '14px 8px', textAlign: 'center',
              background: item.color,
              borderRight: i < arr.length - 1 ? '1px solid #F0EBF8' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px' }}>{item.icon}</div>
              <div style={{ fontWeight: 900, fontSize: '20px', color: '#4A3F6B' }}>{item.value}</div>
              <div style={{ fontSize: '11px', color: '#A99CBF', fontWeight: 600 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <button onClick={shareResult} style={{
          padding: '14px', background: 'linear-gradient(135deg, #C8B4E8, #E07A9A)',
          border: 'none', borderRadius: '18px', cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '14px',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          boxShadow: '0 6px 20px rgba(200,140,180,0.35)',
        }}>
          <Share2 size={16} color="white" /> Share
        </button>
        <button onClick={downloadPDF} disabled={downloading} style={{
          padding: '14px', background: 'white',
          border: '1.5px solid #E0D8F0', borderRadius: '18px', cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '14px',
          color: '#7B6A9E', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          boxShadow: '0 2px 12px rgba(180,150,220,0.1)',
          opacity: downloading ? 0.7 : 1,
        }}>
          <Download size={16} color="#9B87C0" /> {downloading ? 'Loading…' : 'Download'}
        </button>
      </div>

      <button onClick={() => router.push('/')} style={{
        width: '100%', padding: '14px',
        background: 'white', border: '1.5px solid #E0D8F0',
        borderRadius: '18px', cursor: 'pointer',
        fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '14px',
        color: '#7B6A9E', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
        marginBottom: '24px', boxShadow: '0 2px 12px rgba(180,150,220,0.08)',
      }}>
        <RotateCcw size={15} color="#9B87C0" /> Try Again
      </button>

      {/* Question Review */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <div style={{ width: 34, height: 34, borderRadius: '11px', background: '#F5F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ClipboardList size={17} color="#9B87C0" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '17px', color: '#4A3F6B' }}>Question Review</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {attempt.results.map((result, i) => {
          const q = questions.find(q => q.id === result.questionId);
          if (!q) return null;
          const markedOpt = result.selectedIndex >= 0 ? q.options[result.selectedIndex] : 'No answer';
          const timeTaken = formatSecs(result.timeTaken ?? 120);

          return (
            <div key={result.questionId} style={{
              background: 'white', borderRadius: '20px', padding: '16px 18px',
              border: `1.5px solid ${result.isCorrect ? '#D6F5EA' : '#FFD6E0'}`,
              boxShadow: '0 2px 12px rgba(180,150,220,0.07)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{
                    background: result.isCorrect ? '#F0FFF8' : '#FFF0F5',
                    color: result.isCorrect ? '#52B788' : '#E07A9A',
                    padding: '3px 9px', borderRadius: '8px', fontSize: '11px', fontWeight: 800,
                  }}>
                    Q{i + 1}
                  </span>
                  <span style={{ fontSize: '11px', color: '#B89ACC', fontWeight: 600 }}>{q.qNum}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {result.isCorrect
                    ? <CheckCircle size={16} color="#52B788" />
                    : <XCircle size={16} color="#E07A9A" />
                  }
                </div>
              </div>

              {/* Question text */}
              <p style={{ fontSize: '13px', color: '#4A3F6B', fontWeight: 600, lineHeight: 1.55, marginBottom: '12px' }}>
                {q.text.split('\n')[0]}
              </p>

              {/* Answer grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div style={{ background: '#F0FFF8', borderRadius: '12px', padding: '9px 11px', border: '1.5px solid #D6F5EA' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                    <Check size={11} color="#52B788" />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Correct</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#2D4A3D', fontWeight: 700, lineHeight: 1.4 }}>{q.options[q.correctIndex]}</div>
                </div>
                <div style={{
                  background: result.isCorrect ? '#F0FFF8' : '#FFF0F5',
                  borderRadius: '12px', padding: '9px 11px',
                  border: `1.5px solid ${result.isCorrect ? '#D6F5EA' : '#FFD6E0'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                    {result.isCorrect
                      ? <Check size={11} color="#52B788" />
                      : <X size={11} color="#E07A9A" />
                    }
                    <span style={{ fontSize: '10px', fontWeight: 700, color: result.isCorrect ? '#52B788' : '#E07A9A', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Marked</span>
                  </div>
                  <div style={{
                    fontSize: '12px', color: result.isCorrect ? '#2D4A3D' : '#6B2D3F',
                    fontWeight: 700, lineHeight: 1.4,
                    textDecoration: result.isCorrect ? 'none' : 'line-through',
                  }}>{markedOpt}</div>
                </div>
              </div>

              {/* Meta row */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: '#EEF5FF', borderRadius: '8px', padding: '5px 10px',
                }}>
                  <Clock size={11} color="#3A6BC8" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#3A6BC8' }}>{timeTaken}</span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: result.hintTaken ? '#FFFBF0' : '#F5F5F5',
                  borderRadius: '8px', padding: '5px 10px',
                }}>
                  <Lightbulb size={11} color={result.hintTaken ? '#E9A84C' : '#C0BCC8'} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: result.hintTaken ? '#8B6914' : '#999' }}>
                    {result.hintTaken ? 'Hint used' : 'No hint'}
                  </span>
                </div>
              </div>

              {/* Show hint text if wrong */}
              {!result.isCorrect && (
                <div style={{
                  background: '#FFFBF0', borderRadius: '12px', padding: '10px 12px',
                  marginTop: '10px', border: '1.5px solid #FFE8A3',
                  display: 'flex', alignItems: 'flex-start', gap: '7px',
                }}>
                  <Lightbulb size={13} color="#E9A84C" style={{ marginTop: '1px', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#6B5A2D', fontWeight: 600, lineHeight: 1.5 }}>{q.hint}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', padding: '28px 0 8px', fontSize: '12px', color: '#C8C0D8', fontWeight: 600 }}>
        Made for Malkin's NET prep
      </div>
    </div>
  );
}
