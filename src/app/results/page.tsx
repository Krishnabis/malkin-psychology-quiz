'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { questions } from '@/lib/questions';
import { getAttempts } from '@/lib/storage';
import { QuizAttempt } from '@/lib/types';

function formatSecs(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function generatePDFContent(attempt: QuizAttempt): string {
  const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const date = new Date(attempt.date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const scoreColor = pct >= 70 ? '#2D6B52' : pct >= 50 ? '#8B6914' : '#6B2D3F';
  const scoreBg    = pct >= 70 ? '#D6F5EA' : pct >= 50 ? '#FFF4CC' : '#FFE8EC';

  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Malkin's Psychology NET Quiz — Result</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 850px; margin: 0 auto; padding: 24px 20px; background: #fafafa; }
  .header { text-align: center; margin-bottom: 28px; padding: 24px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(200,180,232,0.2); }
  .header h1 { font-size: 22px; color: #7B6A9E; margin-bottom: 4px; }
  .header .date { font-size: 13px; color: #999; margin-bottom: 16px; }
  .score-badge { display: inline-block; font-size: 52px; font-weight: 900; color: ${scoreColor}; background: ${scoreBg}; padding: 8px 32px; border-radius: 50px; margin-bottom: 12px; }
  .stats { display: flex; justify-content: center; gap: 32px; font-size: 14px; color: #555; }
  .stats span { font-weight: bold; color: #333; }
  .section-title { font-size: 16px; font-weight: 700; color: #7B6A9E; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #E8DEFF; }
  .q-card { background: white; border-radius: 12px; border-left: 4px solid #ccc; padding: 16px 18px; margin-bottom: 14px; box-shadow: 0 1px 6px rgba(0,0,0,0.06); page-break-inside: avoid; }
  .q-card.correct { border-left-color: #52B788; }
  .q-card.incorrect { border-left-color: #E07A8F; }
  .q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .q-num { font-size: 12px; font-weight: 700; color: #999; }
  .badge { font-size: 12px; font-weight: 700; padding: 3px 12px; border-radius: 20px; }
  .badge.correct { background: #D6F5EA; color: #2D6B52; }
  .badge.incorrect { background: #FFE8EC; color: #6B2D3F; }
  .q-text { font-size: 13.5px; line-height: 1.65; color: #333; white-space: pre-line; margin-bottom: 14px; }
  .q-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
  .q-field { background: #f7f5ff; border-radius: 8px; padding: 8px 12px; }
  .q-field.marked-wrong { background: #fff0f3; }
  .q-field.marked-correct { background: #f0fff8; }
  .q-field label { display: block; font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .q-field .value { font-size: 13px; font-weight: 600; color: #333; }
  .q-field .value.correct-ans { color: #2D6B52; }
  .q-field .value.wrong-ans { color: #6B2D3F; text-decoration: line-through; }
  .meta-row { display: flex; gap: 8px; margin-top: 8px; }
  .meta-pill { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
  .meta-time { background: #EEF5FF; color: #3A6BC8; }
  .meta-hint-yes { background: #FFF4CC; color: #8B6914; }
  .meta-hint-no { background: #F0F0F0; color: #888; }
  .hint-box { background: #FFF9E6; border: 1px solid #FFE8A3; border-radius: 8px; padding: 10px 12px; margin-top: 10px; font-size: 12.5px; color: #6B5A2D; line-height: 1.5; }
  @media print {
    body { padding: 16px; background: white; }
    .q-card { box-shadow: none; border-left-width: 3px; }
  }
</style>
</head>
<body>
<div class="header">
  <h1>🐰 Malkin's Psychology NET Quiz</h1>
  <div class="date">Attempted: ${date}</div>
  <div class="score-badge">${pct}%</div>
  <div class="stats">
    <div>✅ Correct: <span>${attempt.score}</span></div>
    <div>❌ Wrong: <span>${attempt.totalQuestions - attempt.score}</span></div>
    <div>📝 Total: <span>${attempt.totalQuestions}</span></div>
    <div>⏱️ Duration: <span>${formatSecs(attempt.duration)}</span></div>
  </div>
</div>

<div class="section-title">📋 Detailed Question Analysis</div>
`;

  attempt.results.forEach((result, i) => {
    const q = questions.find(q => q.id === result.questionId);
    if (!q) return;

    const markedOption  = result.selectedIndex >= 0 ? q.options[result.selectedIndex] : '— No answer (time up) —';
    const correctOption = q.options[q.correctIndex];
    const timeTaken     = formatSecs(result.timeTaken ?? 120);
    const hintTaken     = result.hintTaken === true;

    html += `
<div class="q-card ${result.isCorrect ? 'correct' : 'incorrect'}">
  <div class="q-header">
    <span class="q-num">Q${i + 1} &nbsp;•&nbsp; ${q.qNum}</span>
    <span class="badge ${result.isCorrect ? 'correct' : 'incorrect'}">${result.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
  </div>
  <div class="q-text">${q.text}</div>
  <div class="q-grid">
    <div class="q-field marked-correct">
      <label>✅ Correct Answer</label>
      <div class="value correct-ans">${correctOption}</div>
    </div>
    <div class="q-field ${!result.isCorrect ? 'marked-wrong' : 'marked-correct'}">
      <label>${result.isCorrect ? '✅' : '❌'} Answer Marked</label>
      <div class="value ${!result.isCorrect ? 'wrong-ans' : 'correct-ans'}">${markedOption}</div>
    </div>
  </div>
  <div class="meta-row">
    <span class="meta-pill meta-time">⏱️ Time: ${timeTaken}</span>
    <span class="meta-pill ${hintTaken ? 'meta-hint-yes' : 'meta-hint-no'}">${hintTaken ? '💡 Hint used' : '🚫 No hint used'}</span>
  </div>
  ${hintTaken ? `<div class="hint-box">💡 <strong>Hint:</strong> ${q.hint}</div>` : ''}
</div>`;
  });

  html += `</body></html>`;
  return html;
}


export default function ResultsPage() {
  const router = useRouter();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const attempts = getAttempts();
    if (attempts.length > 0) {
      setAttempt(attempts[0]); // Most recent
    } else {
      router.replace('/');
    }
  }, [router]);

  const downloadPDF = async () => {
    if (!attempt) return;
    setDownloading(true);
    
    try {
      // Use print-based PDF generation for mobile compatibility
      const html = generatePDFContent(attempt);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing (works on mobile too)
      const win = window.open(url, '_blank');
      if (win) {
        win.onload = () => {
          win.print();
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        };
      } else {
        // Fallback: download as HTML file
        const a = document.createElement('a');
        a.href = url;
        a.download = `Malkin_Psychology_Quiz_${new Date(attempt.date).toLocaleDateString('en-IN').replace(/\//g, '-')}.html`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      setDownloading(false);
    }
  };

  const shareResult = async () => {
    if (!attempt) return;
    const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
    const text = `🐰 Malkin's Psychology NET Quiz Result\n\n📊 Score: ${attempt.score}/${attempt.totalQuestions} (${pct}%)\n📝 Questions: ${attempt.totalQuestions}\n⏱️ Time: ${Math.floor(attempt.duration / 60)}m ${attempt.duration % 60}s\n\n${pct >= 70 ? '🌟 Amazing job!' : pct >= 50 ? '⭐ Good effort!' : '💪 Keep studying!'}\n\nAttempted on Malkin's Psychology NET Quiz ✨`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text, title: "Malkin's Psychology NET Quiz Result" });
      } catch (e) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard! 📋');
    }
  };

  if (!mounted || !attempt) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '48px', animation: 'wiggle 1s ease-in-out infinite' }}>🐰</div>
      </div>
    );
  }

  const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const resultColor = pct >= 70 ? '#B4E8D4' : pct >= 50 ? '#FFE8A3' : '#FFB7C5';
  const resultEmoji = pct >= 70 ? '🌟' : pct >= 50 ? '⭐' : '💪';
  const resultMsg = pct >= 70 ? "Brilliant work, Malkin! 🎉" : pct >= 50 ? "Good effort! Keep it up! ✨" : "Don't give up, you're getting there! 💕";

  return (
    <div style={{ minHeight: '100vh', padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        style={{
          background: '#F5F0FF',
          border: 'none',
          borderRadius: '50px',
          padding: '10px 20px',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '14px',
          color: '#7B6A9E',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        ← Back Home
      </button>

      {/* Score card */}
      <div className="card" style={{
        padding: '32px 24px',
        marginBottom: '16px',
        textAlign: 'center',
        animation: 'bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        background: `linear-gradient(135deg, white, ${resultColor}20)`,
        border: `2px solid ${resultColor}`,
      }}>
        <Image
          src="/bunny.jpg"
          alt="Bunny"
          width={80}
          height={80}
          style={{
            borderRadius: '50%',
            border: `3px solid ${resultColor}`,
            marginBottom: '12px',
            animation: 'float 3s ease-in-out infinite',
          }}
        />
        
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>{resultEmoji}</div>
        
        <div style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 900,
          fontSize: '60px',
          background: 'linear-gradient(135deg, #C8B4E8, #FFB7C5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
        }}>
          {pct}%
        </div>
        
        <p style={{ fontWeight: 800, fontSize: '18px', color: '#4A3F6B', margin: '8px 0 4px' }}>
          {attempt.score} / {attempt.totalQuestions} correct
        </p>
        <p style={{ fontWeight: 700, fontSize: '15px', color: '#7B6A9E' }}>{resultMsg}</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#4A3F6B' }}>⏱️ {Math.floor(attempt.duration / 60)}m {attempt.duration % 60}s</div>
            <div style={{ fontSize: '12px', color: '#A99CBF', fontWeight: 600 }}>Time Taken</div>
          </div>
          <div style={{ width: '1px', background: '#E8DEFF' }} />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#2D6B52' }}>✅ {attempt.score}</div>
            <div style={{ fontSize: '12px', color: '#A99CBF', fontWeight: 600 }}>Correct</div>
          </div>
          <div style={{ width: '1px', background: '#E8DEFF' }} />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#6B2D3F' }}>❌ {attempt.totalQuestions - attempt.score}</div>
            <div style={{ fontSize: '12px', color: '#A99CBF', fontWeight: 600 }}>Wrong</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className="btn-primary"
          onClick={shareResult}
          style={{ flex: 1, fontSize: '14px', padding: '14px' }}
        >
          📤 Share Result
        </button>
        <button
          onClick={downloadPDF}
          disabled={downloading}
          style={{
            flex: 1,
            background: 'white',
            border: '2px solid #C8B4E8',
            borderRadius: '50px',
            padding: '14px',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            color: '#7B6A9E',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {downloading ? '⏳ Generating...' : '📄 Download PDF'}
        </button>
      </div>

      <button
        className="btn-primary"
        onClick={() => router.push('/')}
        style={{ width: '100%', marginBottom: '20px', background: 'linear-gradient(135deg, #B4E8D4, #C8B4E8)', fontSize: '15px' }}
      >
        🔄 Try Again
      </button>

      {/* Question review */}
      <h3 style={{
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 800,
        fontSize: '18px',
        color: '#4A3F6B',
        marginBottom: '14px',
      }}>
        📋 Question Review
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {attempt.results.map((result, i) => {
          const q = questions.find(q => q.id === result.questionId);
          if (!q) return null;
          const selectedOption = result.selectedIndex >= 0 ? q.options[result.selectedIndex] : 'No answer';
          
          return (
            <div
              key={result.questionId}
              className="card"
              style={{
                padding: '16px',
                border: `1.5px solid ${result.isCorrect ? '#B4E8D4' : '#FFB7C5'}`,
                background: result.isCorrect ? '#F0FFF8' : '#FFF0F3',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{
                  fontWeight: 700,
                  fontSize: '12px',
                  color: '#7B6A9E',
                }}>
                  Q{i + 1} • {q.qNum}
                </span>
                <span style={{
                  background: result.isCorrect ? '#B4E8D4' : '#FFB7C5',
                  padding: '3px 10px',
                  borderRadius: '50px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#4A3F6B',
                }}>
                  {result.isCorrect ? '✅ Correct' : '❌ Wrong'}
                </span>
              </div>
              
              <p style={{
                fontSize: '13px',
                color: '#4A3F6B',
                fontWeight: 600,
                lineHeight: 1.5,
                marginBottom: '10px',
              }}>
                {q.text.split('\n')[0]}
              </p>

              {!result.isCorrect && (
                <div style={{ fontSize: '12px', color: '#6B2D3F', fontWeight: 600, marginBottom: '6px' }}>
                  Your answer: <span style={{ textDecoration: 'line-through' }}>{selectedOption}</span>
                </div>
              )}
              
              <div style={{
                background: 'white',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '12px',
                color: '#2D6B52',
                fontWeight: 700,
                border: '1.5px solid #B4E8D4',
              }}>
                ✅ {q.options[q.correctIndex]}
              </div>

              {!result.isCorrect && (
                <div style={{
                  background: '#FFF4CC',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#6B5A3F',
                  fontWeight: 600,
                  marginTop: '8px',
                  border: '1.5px solid #FFE8A3',
                }}>
                  💡 {q.hint}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', padding: '24px 0', color: '#A99CBF', fontSize: '12px', fontWeight: 600 }}>
        Made with 💕 for Malkin's NET prep 🐰✨
      </div>
    </div>
  );
}
