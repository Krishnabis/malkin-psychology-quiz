import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuizAttempt } from '@/lib/types';
import { questions } from '@/lib/questions';

function formatSecs(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function downloadRealPDF(attempt: QuizAttempt) {
  const doc = new jsPDF();
  
  const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const dateStr = new Date(attempt.date).toLocaleString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Title
  doc.setFontSize(22);
  doc.setTextColor(123, 106, 158); // #7B6A9E
  doc.text("Malkin's Psychology NET Quiz", 14, 22);

  // Meta info
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Attempted: ${dateStr}`, 14, 30);
  doc.text(`Score: ${attempt.score} / ${attempt.totalQuestions} (${pct}%)`, 14, 36);
  doc.text(`Duration: ${formatSecs(attempt.duration)}`, 14, 42);

  let yOffset = 52;

  attempt.results.forEach((result, i) => {
    const q = questions.find(q => q.id === result.questionId);
    if (!q) return;

    const markedOption = result.selectedIndex >= 0 ? q.options[result.selectedIndex] : 'No answer (Time up)';
    const correctOption = q.options[q.correctIndex];
    const timeTaken = formatSecs(result.timeTaken ?? 120);
    const hintUsed = result.hintTaken ? 'Yes' : 'No';

    // Question Header
    if (yOffset > 270) {
      doc.addPage();
      yOffset = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(result.isCorrect ? 45 : 107, result.isCorrect ? 107 : 45, result.isCorrect ? 82 : 63); // green or red
    doc.text(`Q${i + 1} (${q.qNum}) - ${result.isCorrect ? 'Correct' : 'Incorrect'}`, 14, yOffset);
    yOffset += 7;

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    
    // Split long question text
    const textLines = doc.splitTextToSize(q.text.replace(/\n/g, ' '), 180);
    doc.text(textLines, 14, yOffset);
    yOffset += (textLines.length * 5) + 4;

    // Table for answers
    autoTable(doc, {
      startY: yOffset,
      margin: { left: 14 },
      theme: 'grid',
      headStyles: { fillColor: [240, 235, 248], textColor: [123, 106, 158] },
      bodyStyles: { textColor: [50, 50, 50] },
      head: [['Correct Answer', 'Your Answer', 'Time Taken', 'Hint Used']],
      body: [
        [correctOption, markedOption, timeTaken, hintUsed]
      ],
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          if (result.isCorrect) {
            doc.setTextColor(45, 107, 82); // Green
          } else {
            doc.setTextColor(107, 45, 63); // Red
          }
        }
      }
    });

    yOffset = (doc as any).lastAutoTable.finalY + 12;
  });

  doc.save(`Malkin_Psychology_Quiz_${dateStr.replace(/[: ,]/g, '_')}.pdf`);
}
