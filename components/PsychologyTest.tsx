import React, { useState } from 'react';
import { CheckCircle, XCircle, Trophy, RefreshCw, ArrowRight, Brain, AlertTriangle, ArrowLeft } from 'lucide-react';

interface PsychologyTestProps {
  onBack: () => void;
  onRegister: () => void;
}

const QUESTIONS = [
  {
    question: "Saat harga mendekati Stop Loss (SL) Anda, apa yang Anda lakukan?",
    options: [
      { text: "Geser SL biar tidak kena, berharap harga berbalik.", score: 0 },
      { text: "Cemas dan langsung cut loss manual sebelum kena SL.", score: 1 },
      { text: "Biarkan saja. SL adalah bagian dari rencana trading.", score: 2 },
    ]
  },
  {
    question: "Anda baru saja mengalami 3 kali Loss beruntun. Tindakan Anda?",
    options: [
      { text: "Masuk pasar dengan lot lebih besar untuk balas dendam (Martingale).", score: 0 },
      { text: "Langsung cari setup baru dengan cepat.", score: 1 },
      { text: "Berhenti trading hari ini, evaluasi jurnal, dan istirahat.", score: 2 },
    ]
  },
  {
    question: "Berapa persen risiko modal yang Anda gunakan per transaksi?",
    options: [
      { text: "Lebih dari 10% atau Full Margin.", score: 0 },
      { text: "Sekitar 5-10%.", score: 1 },
      { text: "Konsisten 1-2%.", score: 2 },
    ]
  },
  {
    question: "Melihat candle bergerak cepat naik tinggi (Pump), apa reaksi Anda?",
    options: [
      { text: "Langsung Buy (FOMO) takut ketinggalan kereta.", score: 0 },
      { text: "Tunggu sedikit koreksi lalu masuk.", score: 1 },
      { text: "Cek trading plan. Jika tidak ada setup valid, saya jadi penonton.", score: 2 },
    ]
  },
  {
    question: "Apakah Anda memiliki Trading Plan tertulis sebelum pasar buka?",
    options: [
      { text: "Tidak, saya trading pakai feeling/insting saja.", score: 0 },
      { text: "Ada di kepala, tapi tidak dicatat.", score: 1 },
      { text: "Ya, tercatat lengkap (Entry, SL, TP, Alasan).", score: 2 },
    ]
  },
  {
    question: "Apa tujuan utama Anda dalam trading?",
    options: [
      { text: "Cepat kaya dan beli barang mewah bulan depan.", score: 0 },
      { text: "Menambah uang jajan tambahan.", score: 1 },
      { text: "Membangun kekayaan jangka panjang (Compounding).", score: 2 },
    ]
  },
  {
    question: "Bagaimana perasaan Anda saat profit besar?",
    options: [
      { text: "Merasa hebat dan tak terkalahkan (Overconfidence).", score: 0 },
      { text: "Senang dan langsung pamer di sosmed.", score: 1 },
      { text: "Biasa saja. Profit dan Loss adalah probabilitas.", score: 2 },
    ]
  },
  {
    question: "Anda mendengar berita 'Isu Perang' yang berdampak ke market. Anda...?",
    options: [
      { text: "Langsung open posisi tebak arah market.", score: 0 },
      { text: "Mencari berita lain untuk konfirmasi.", score: 1 },
      { text: "Menunggu volatilitas mereda atau trading sesuai teknikal yang valid.", score: 2 },
    ]
  },
  {
    question: "Apakah Anda mencatat jurnal trading Anda?",
    options: [
      { text: "Tidak pernah, buang waktu.", score: 0 },
      { text: "Kadang-kadang kalau ingat.", score: 1 },
      { text: "Selalu. Saya belajar dari data masa lalu.", score: 2 },
    ]
  },
  {
    question: "Sikap Anda terhadap uang yang digunakan untuk trading?",
    options: [
      { text: "Uang pinjaman / uang dapur yang harus balik modal cepat.", score: 0 },
      { text: "Tabungan yang sayang kalau hilang.", score: 1 },
      { text: "Uang dingin (Risk Capital). Saya siap jika uang ini hilang.", score: 2 },
    ]
  }
];

export const PsychologyTest: React.FC<PsychologyTestProps> = ({ onBack, onRegister }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleAnswer = (points: number) => {
    setSelectedOption(points); // Visual feedback only
    setTimeout(() => {
        const newScore = score + points;
        if (currentIndex < QUESTIONS.length - 1) {
            setScore(newScore);
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
        } else {
            setScore(newScore);
            setIsFinished(true);
        }
    }, 400);
  };

  const resetTest = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedOption(null);
  };

  // --- RESULT PAGE ---
  if (isFinished) {
    const maxScore = QUESTIONS.length * 2;
    const percentage = (score / maxScore) * 100;
    
    // Logic tampilan hasil
    let resultType = 'LOW'; // LOW, MID, HIGH
    if (percentage >= 80) resultType = 'HIGH';
    else if (percentage >= 50) resultType = 'MID';

    // Tampilan Khusus High Score (Honor Page)
    if (resultType === 'HIGH') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/40 via-black to-black z-0"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 z-0 animate-pulse-slow"></div>
                
                <div className="relative z-10 text-center animate-fade-in-up max-w-2xl">
                    <div className="inline-flex items-center justify-center p-6 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full mb-8 shadow-[0_0_50px_rgba(234,179,8,0.5)] transform hover:scale-110 transition-transform duration-500">
                        <Trophy className="w-16 h-16 text-black drop-shadow-md" />
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 mb-4 tracking-tight">
                        PROFESSIONAL TRADER MINDSET
                    </h1>
                    
                    <p className="text-xl text-yellow-100/80 italic mb-8 font-serif">
                        "Trading is not about being right, it's about being profitable. And you have the discipline to achieve it."
                    </p>

                    <div className="bg-white/10 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-8 mb-8">
                        <div className="text-sm text-yellow-500 font-bold tracking-widest uppercase mb-2">Skor Psikologi Anda</div>
                        <div className="text-6xl font-black text-white mb-2">{score} <span className="text-2xl text-white/50">/ {maxScore}</span></div>
                        <div className="h-2 w-full bg-gray-800 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-yellow-500 w-full shadow-[0_0_20px_rgba(234,179,8,1)]"></div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={onRegister}
                            className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            Mulai Jurnal Sekarang <ArrowRight className="w-5 h-5"/>
                        </button>
                        <button 
                            onClick={onBack}
                            className="px-8 py-4 bg-transparent border border-gray-700 hover:border-white text-gray-400 hover:text-white font-medium text-lg rounded-xl transition-all"
                        >
                            Kembali ke Home
                        </button>
                    </div>
                    
                    <div className="mt-12 text-xs text-gray-600">
                        Penghormatan ini diberikan oleh sistem Jurnal Trading Pro.
                    </div>
                </div>
            </div>
        );
    }

    // Tampilan Mid/Low Score
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-6 font-sans">
             <div className="max-w-xl w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-zinc-800 text-center animate-fade-in-up">
                
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${resultType === 'MID' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {resultType === 'MID' ? <Brain className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
                </div>

                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                    {resultType === 'MID' ? 'Potensi Trader Bagus' : 'Waspada: Mental Judi'}
                </h2>
                
                <p className="text-slate-600 dark:text-zinc-400 mb-8 leading-relaxed">
                    {resultType === 'MID' 
                        ? "Anda memiliki dasar yang baik, namun masih ada celah emosi yang perlu diperbaiki. Disiplin adalah kunci untuk naik ke level selanjutnya."
                        : "Skor Anda menunjukkan kecenderungan emosional yang tinggi. Trading dengan mindset ini sangat berisiko menghabiskan modal Anda."
                    }
                </p>

                <div className="bg-gray-100 dark:bg-zinc-950 rounded-xl p-6 mb-8">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-500">Skor Anda</span>
                        <span className={`text-3xl font-bold ${resultType === 'MID' ? 'text-blue-600' : 'text-red-500'}`}>{score} <span className="text-sm text-slate-400">/ {maxScore}</span></span>
                     </div>
                     <div className="w-full bg-gray-200 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${resultType === 'MID' ? 'bg-blue-500' : 'bg-red-500'}`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                     </div>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={onRegister}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Buat Akun & Perbaiki Disiplin
                    </button>
                    <button 
                        onClick={resetTest}
                        className="w-full py-4 bg-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300 font-medium flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4"/> Ulangi Tes
                    </button>
                    <button onClick={onBack} className="text-sm text-slate-400 hover:underline">
                        Kembali ke Home
                    </button>
                </div>
             </div>
        </div>
    );
  }

  // --- QUIZ INTERFACE ---
  const currentQ = QUESTIONS[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-slate-800 dark:text-zinc-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Progress Bar Top */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 dark:bg-zinc-900">
            <div 
                className="h-full bg-primary transition-all duration-300 ease-out" 
                style={{ width: `${((currentIndex) / QUESTIONS.length) * 100}%` }}
            ></div>
        </div>

        <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-white dark:bg-zinc-900 rounded-full shadow-sm hover:shadow-md transition">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>

        <div className="max-w-2xl w-full animate-fade-in-up">
            <div className="mb-8">
                <span className="text-primary font-bold tracking-wider text-sm uppercase">Pertanyaan {currentIndex + 1} dari {QUESTIONS.length}</span>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 leading-tight text-slate-900 dark:text-white">
                    {currentQ.question}
                </h2>
            </div>

            <div className="space-y-4">
                {currentQ.options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(opt.score)}
                        className="w-full text-left p-6 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-transparent hover:border-primary/50 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-all duration-200 shadow-sm group relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-lg font-medium text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white">
                                {opt.text}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};