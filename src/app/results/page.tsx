'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { questions } from '@/lib/questions';
import { getAttempts } from '@/lib/storage';
import { QuizAttempt } from '@/lib/types';

function generatePDFContent(attempt: QuizAttempt): string {
  const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const date = new Date(attempt.date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  let html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
  h1 { color: #C8B4E8; text-align: center; }
  .header { text-align: center; margin-bottom: 30px; }
  .score { font-size: 48px; font-weight: bold; color: ${pct >= 70 ? '#4CAF50' : pct >= 50 ? '#FF9800' : '#F44336'}; }
  .question { border: 1px solid #E0D8F0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  .correct { border-color: #B4E8D4; background: #F0FFF8; }
  .incorrect { border-color: #FFB7C5; background: #FFF0F3; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
  .badge-correct { background: #B4E8D4; color: #2D6B52; }
  .badge-incorrect { background: #FFB7C5; color: #6B2D3F; }
  .hint { background: #FFF4CC; border: 1px solid #FFE8A3; border-radius: 8px; padding: 10px; margin-top: 8px; font-size: 13px; }
  .answer-text { font-weight: bold; color: #2D6B52; }
  .selected-wrong { font-weight: bold; color: #6B2D3F; text-decoration: line-through; }
</style>
</head>
<body>
<div class="header">
  <h1>🐰 Malkin's Psychology NET Quiz</h1>
  <p>Date: ${date}</p>
  <div class="score">${pct}%</div>
  <p>Score: <strong>${attempt.score} / ${attempt.totalQuestions}</strong></p>
  <p>Time taken: <strong>${Math.floor(attempt.duration / 60)}m ${attempt.duration % 60}s</strong></p>
</div>
`;

  for (const result of attempt.results) {
    const q = questions.find(q => q.id === result.questionId);
    if (!q) continue;
    
    const selectedOption = result.selectedIndex >= 0 ? q.options[result.selectedIndex] : 'No answer (time up)';
    const correctOption = q.options[q.correctIndex];
    
    html += `
<div class="question ${result.isCorrect ? 'correct' : 'incorrect'}">
  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
    <strong>${q.qNum}</strong>
    <span class="badge ${result.isCorrect ? 'badge-correct' : 'badge-incorrect'}">
      ${result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
    </span>
  </div>
  <p style="margin:0 0 10px; font-size:14px; line-height:1.6; white-space:pre-line;">${q.text}</p>
  ${!result.isCorrect ? `<p>Your answer: <span class="selected-wrong">${selectedOption}</span></p>` : ''}
  <p>Correct answer: <span class="answer-text">${correctOption}</span></p>
  ${!result.isCorrect ? `<div class="hint">💡 Hint: ${q.hint}</div>` : ''}
</div>`;
  }

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
