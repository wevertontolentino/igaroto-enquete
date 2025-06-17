import React, { useState, useEffect, useRef } from 'react';
import { Heart, Globe, MessageCircle, Share2, Twitter, Facebook, Instagram, Save, X, Settings, Copy, Loader2, LogOut, RefreshCw, Clock, Award } from 'lucide-react';

// Importações do Firebase (com autenticação)
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, increment, collection, addDoc, query, orderBy, serverTimestamp, getDoc, limit } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDJpIsFWLjNhkPlIDN9BDVSzu9bEpqMrjY",
  authDomain: "igaroto.firebaseapp.com",
  projectId: "igaroto",
  storageBucket: "igaroto.appspot.com",
  messagingSenderId: "1082437439803",
  appId: "1:1082437439803:web:66002420891974b7a8271e",
  measurementId: "G-FT7R4CZQKN"
};

// Inicializa o Firebase e os serviços
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Objeto de traduções completo
const translations = {
  pt: {
    title: "Qual modelo você quer ver amanhã no feed do IGAROTO?",
    vote: "Votar",
    comments: "Comentários",
    nickname: "Apelido (opcional)",
    commentPlaceholder: "Escreva seu comentário...",
    submitComment: "Comentar",
    adminPanel: "Painel Administrativo",
    adminTitle: "Gerenciamento de Conteúdo",
    model1Name: "Nome do Modelo 1:",
    model1Photo: "URL da Foto do Modelo 1:",
    model2Name: "Nome do Modelo 2:",
    model2Photo: "URL da Foto do Modelo 2:",
    enableCountdown: "Ativar Contagem Regressiva de 24h",
    saveChanges: "Salvar e Iniciar Nova Enquete",
    adminButton: "Admin",
    loading: "Carregando enquete...",
    loginTitle: "Acesso Administrativo",
    emailLabel: "Email",
    passwordLabel: "Senha",
    loginButton: "Entrar",
    logoutButton: "Sair",
    loginError: "Email ou senha incorretos.",
    socialShare: "Compartilhe a enquete!",
    shareOnInstagram: "Compartilhar no Instagram",
    instagramInstruction: "O Instagram não permite compartilhar direto nos Stories por um site. Tire um print da enquete e use o texto abaixo!",
    copyText: "Copiar Texto",
    copied: "Copiado!",
    resetPoll: "Zerar Votos da Enquete",
    resetConfirm: "Tem certeza que deseja zerar todos os votos desta enquete? Esta ação não pode ser desfeita.",
    confirmButton: "Sim, Zerar",
    cancelButton: "Cancelar",
    countdownTitle: "A VOTAÇÃO TERMINA EM",
    countdownEnded: "VOTAÇÃO ENCERRADA",
    pastWinnerTitle: "Vencedor do Dia",
    promoteWinner: "Promover Vencedor Atual",
    promoteConfirm: "Isso definirá o modelo com mais votos como o 'Vencedor do Dia'. Deseja continuar?",
    wonWith: "Venceu com",
    votes: "dos votos",
    pastPollsTitle: "Enquetes Anteriores",
  },
  en: { /* Traduções completas em Inglês */ },
  es: { /* Traduções completas em Espanhol */ },
};

// --- COMPONENTES ---

const HeartAnimation = ({ onEnd }) => {
  useEffect(() => { const timer = setTimeout(onEnd, 1500); return () => clearTimeout(timer); }, [onEnd]);
  return (<div className="absolute inset-0 flex items-center justify-center animate-like"><Heart className="text-pink-500" size={100} fill="currentColor" /></div>);
};

const Countdown = ({ endDate, t }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft = {};
        if (difference > 0) { timeLeft = { Dias: Math.floor(difference / (1000 * 60 * 60 * 24)), Horas: Math.floor((difference / (1000 * 60 * 60)) % 24), Min: Math.floor((difference / 1000 / 60) % 60), Seg: Math.floor((difference / 1000) % 60),};}
        return timeLeft;
    };
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    useEffect(() => {
        const timer = setTimeout(() => { setTimeLeft(calculateTimeLeft()); }, 1000);
        return () => clearTimeout(timer);
    });
    const timerComponents = Object.keys(timeLeft).map((interval) => {
        if (timeLeft[interval] < 0) return null;
        return (<div key={interval} className="text-center p-2"><span className="text-4xl md:text-6xl font-black tracking-tighter">{String(timeLeft[interval]).padStart(2, '0')}</span><span className="block text-xs uppercase text-pink-300">{interval}</span></div>);
    });
    return (
        <div className="my-12 p-6 bg-gray-800 text-white rounded-2xl shadow-2xl max-w-2xl mx-auto animate-fade-in">
            <h3 className="text-center text-md uppercase tracking-widest text-gray-400 mb-4 flex items-center justify-center gap-2"><Clock size={16}/> {t.countdownTitle}</h3>
            {timerComponents.length ? (<div className="flex justify-center divide-x divide-gray-700">{timerComponents}</div>) : (<p className="text-center text-4xl font-bold text-red-500 py-4">{t.countdownEnded}</p>)}
        </div>
    );
};

const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const valueRef = useRef(0);
    useEffect(() => {
        const targetValue = parseFloat(value);
        if (isNaN(targetValue)) return;
        const duration = 800; 
        const frameRate = 60;
        const totalFrames = duration / (1000 / frameRate);
        const increment = (targetValue - valueRef.current) / totalFrames;
        let currentFrame = 0;
        const timer = setInterval(() => {
            currentFrame++;
            valueRef.current += increment;
            if (currentFrame >= totalFrames) {
                valueRef.current = targetValue;
                clearInterval(timer);
            }
            setDisplayValue(valueRef.current.toFixed(1));
        }, 1000 / frameRate);
        return () => { clearInterval(timer); valueRef.current = targetValue; };
    }, [value]);
    return <span>{displayValue}%</span>;
};

const LoginPage = ({ t }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault(); setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.hash = '';
        } catch (err) { setError(t.loginError); }
    };
    return (<div className="bg-gray-50 min-h-screen flex items-center justify-center p-4"><div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg"><h1 className="text-3xl font-bold text-center text-pink-600">{t.loginTitle}</h1><form onSubmit={handleLogin} className="space-y-6"><div><label htmlFor="email" className="text-sm font-medium text-gray-700">{t.emailLabel}</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md" required /></div><div><label htmlFor="password" className="text-sm font-medium text-gray-700">{t.passwordLabel}</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md" required /></div>{error && <p className="text-sm text-red-600 text-center">{error}</p>}<button type="submit" className="w-full py-3 px-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg">{t.loginButton}</button></form></div></div>);
};

const FeaturedWinner = ({ t }) => {
    const [winner, setWinner] = useState(null);
    useEffect(() => {
        const winnerRef = doc(db, 'site_config', 'featuredWinner');
        const unsubscribe = onSnapshot(winnerRef, (docSnap) => {
            if (docSnap.exists()) setWinner(docSnap.data());
            else setWinner(null);
        });
        return () => unsubscribe();
    }, []);
    if (!winner || !winner.name) return null;
    const winnerDate = winner.promotedAt?.toDate ? winner.promotedAt.toDate().toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
    return (
        <section className="max-w-xl mx-auto my-12 animate-fade-in">
            <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl text-center relative overflow-hidden">
                 <div className="absolute inset-0 shiny-border-animation rounded-2xl"></div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-4 flex items-center justify-center gap-2 relative z-10"><Award size={18}/> {t.pastWinnerTitle}</h2>
                <div className="relative inline-block p-1 rounded-full">
                    <img src={winner.photo} alt={winner.name} className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-gray-800" />
                </div>
                <h3 className="mt-4 text-3xl font-bold text-white relative z-10">{winner.name}</h3>
                <p className="text-amber-300 relative z-10">{`${t.wonWith} ${winner.percentage}% ${t.votes}`}</p>
                <p className="text-xs text-gray-500 mt-1 relative z-10">{winnerDate}</p>
            </div>
        </section>
    );
};

const PastPolls = ({ t }) => {
    const [history, setHistory] = useState([]);
    useEffect(() => {
        const historyQuery = query(collection(db, "poll_history"), orderBy("savedAt", "desc"), limit(5));
        const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
            setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);
    if (history.length === 0) return null;
    return (
        <section className="max-w-4xl mx-auto mb-12 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-700">{t.pastPollsTitle}</h2>
            <div className="flex overflow-x-auto space-x-4 p-2 -mx-2">
                {history.map(poll => {
                    const totalVotes = (poll.model1.votes || 0) + (poll.model2.votes || 0);
                    const winner = (poll.model1.votes || 0) >= (poll.model2.votes || 0) ? 'model1' : 'model2';
                    return (
                        <div key={poll.id} className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md p-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className={`relative ${winner === 'model1' ? 'border-2 border-amber-400 rounded-lg p-1' : ''}`}>
                                    {winner === 'model1' && <Award className="absolute -top-3 -left-3 text-amber-400 bg-white rounded-full p-1" size={24} />}
                                    <img src={poll.model1.photo} className="w-full h-32 object-cover rounded-md" />
                                    <p className="text-xs font-bold mt-1 truncate">{poll.model1.name}</p>
                                    <p className="text-xs text-gray-500">{totalVotes > 0 ? ((poll.model1.votes / totalVotes) * 100).toFixed(1) : '0.0'}%</p>
                                </div>
                                <div className={`relative ${winner === 'model2' ? 'border-2 border-amber-400 rounded-lg p-1' : ''}`}>
                                     {winner === 'model2' && <Award className="absolute -top-3 -left-3 text-amber-400 bg-white rounded-full p-1" size={24} />}
                                    <img src={poll.model2.photo} className="w-full h-32 object-cover rounded-md" />
                                    <p className="text-xs font-bold mt-1 truncate">{poll.model2.name}</p>
                                    <p className="text-xs text-gray-500">{totalVotes > 0 ? ((poll.model2.votes / totalVotes) * 100).toFixed(1) : '0.0'}%</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    );
};

const PollSite = ({ user, t, language, setLanguage }) => {
  const [pollData, setPollData] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(null);
  const [showHeart, setShowHeart] = useState(null);
  const [newComment, setNewComment] = useState({ nickname: '', text: '' });
  const [showAdmin, setShowAdmin] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [showInstaModal, setShowInstaModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const getPollId = (data) => data && data.model1 ? `poll_${data.model1.name}_${data.model2.name}`.replace(/\s+/g, '') : 'default';
    const pollDocRef = doc(db, 'polls', 'currentPoll');
    const unsubscribePoll = onSnapshot(pollDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPollData(data);
        if (localStorage.getItem('votedPollId') === getPollId(data)) setVoted(true); else setVoted(false);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const defaultPoll = {
            model1: { name: 'Modelo 1', votes: 0, photo: 'https://placehold.co/600x800/f9fafb/374151?text=Modelo+1' },
            model2: { name: 'Modelo 2', votes: 0, photo: 'https://placehold.co/600x800/f9fafb/374151?text=Modelo+2' },
            endDate: tomorrow.toISOString(),
            countdownEnabled: true,
        };
        setDoc(pollDocRef, defaultPoll);
      }
      setLoading(false);
    });
    
    const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
    const unsubscribeComments = onSnapshot(commentsQuery, (querySnapshot) => setComments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    return () => { unsubscribePoll(); unsubscribeComments(); };
  }, []);

  const handleAdminSave = async (e) => {
    e.preventDefault(); setSavingAdmin(true);
    const formData = new FormData(e.target);
    const pollDocRef = doc(db, 'polls', 'currentPoll');
    try {
      const currentPollSnap = await getDoc(pollDocRef);
      if (currentPollSnap.exists()) {
        const currentPollData = currentPollSnap.data();
        if ((currentPollData.model1.votes > 0 || currentPollData.model2.votes > 0) && currentPollData.model1.name !== formData.get('model1Name')) {
             await addDoc(collection(db, 'poll_history'), { ...currentPollData, savedAt: serverTimestamp() });
        }
      }

      const newEndDate = new Date();
      newEndDate.setHours(newEndDate.getHours() + 24);
      await setDoc(pollDocRef, {
        model1: { name: formData.get('model1Name'), photo: formData.get('model1PhotoURL'), votes: 0 },
        model2: { name: formData.get('model2Name'), photo: formData.get('model2PhotoURL'), votes: 0 },
        endDate: newEndDate.toISOString(),
        countdownEnabled: formData.get('countdownEnabled') === 'on',
      });

      localStorage.removeItem('votedPollId'); setVoted(false);
    } catch (error) { console.error("Erro ao salvar:", error); } 
    finally { setSavingAdmin(false); setShowAdmin(false); }
  };
  
  const handleVote = async (modelKey) => {
    if (voted || (pollData.countdownEnabled && pollData.endDate && new Date(pollData.endDate) < new Date())) return;
    const getPollId = (data) => `poll_${data.model1.name}_${data.model2.name}`.replace(/\s+/g, '');
    const pollDocRef = doc(db, 'polls', 'currentPoll');
    await updateDoc(pollDocRef, { [`${modelKey}.votes`]: increment(1) });
    setVoted(true); setShowHeart(modelKey);
    localStorage.setItem('votedPollId', getPollId(pollData));
  };
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.text.trim()) return;
    const finalNickname = newComment.nickname.trim() || 'Anônimo';
    await addDoc(collection(db, 'comments'), { nickname: finalNickname, text: newComment.text, timestamp: new Date(), reactions: { '❤️': 0, '🔥': 0, '😂': 0, '👍': 0, '😍': 0 } });
    setNewComment({ nickname: '', text: '' });
  };
  
  const handleReaction = async (e, commentId, reaction) => {
    const reactionKey = `reacted_${commentId}`;
    if (localStorage.getItem(reactionKey)) return; 
    const button = e.currentTarget;
    const flyingEmoji = document.createElement('span');
    flyingEmoji.innerHTML = reaction;
    flyingEmoji.className = 'reaction-fly-up';
    button.appendChild(flyingEmoji);
    setTimeout(() => { if (flyingEmoji.parentNode === button) button.removeChild(flyingEmoji); }, 1000);
    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, { [`reactions.${reaction}`]: increment(1) });
    localStorage.setItem(reactionKey, 'true');
    localStorage.setItem(`reacted_emoji_${commentId}`, reaction);
  };
  
  const handlePromoteWinner = async () => {
      const confirm = window.confirm(t.promoteConfirm);
      if(confirm && pollData){
        const totalVotes = (pollData.model1.votes || 0) + (pollData.model2.votes || 0);
        if(totalVotes === 0) { alert("Ninguém votou ainda!"); return; }
        const winnerData = (pollData.model1.votes || 0) >= (pollData.model2.votes || 0) ? pollData.model1 : pollData.model2;
        const winnerPercentage = ((winnerData.votes / totalVotes) * 100).toFixed(1);
        const winnerDocRef = doc(db, 'site_config', 'featuredWinner');
        await setDoc(winnerDocRef, { 
            name: winnerData.name, 
            photo: winnerData.photo, 
            percentage: winnerPercentage,
            promotedAt: serverTimestamp() 
        });
        alert(`${winnerData.name} foi promovido a Vencedor do Dia!`);
      }
  };

  const handleLogout = async () => { await signOut(auth); window.location.hash = ''; };
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };

  if (loading) return (<div className="bg-gray-50 min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pink-600" size={48} /><p className="ml-4 text-xl">{t.loading}</p></div>);
  
  const totalVotes = (pollData?.model1.votes || 0) + (pollData?.model2.votes || 0);
  const pollEnded = pollData?.countdownEnabled && pollData?.endDate && new Date(pollData.endDate) < new Date();
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href.split('#')[0]) : '';
  
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen font-sans">
      {showAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
            <div className="flex justify-between items-center p-4 border-b"><h2 className="text-xl font-bold text-pink-600">{t.adminTitle}</h2><button onClick={() => setShowAdmin(false)}><X size={24}/></button></div>
            <div className="overflow-y-auto max-h-[80vh] p-6">
              <form onSubmit={handleAdminSave} className="space-y-4">
                  <div><label className="block text-sm font-medium">{t.model1Name}</label><input name="model1Name" defaultValue={pollData?.model1.name} className="mt-1 w-full p-2 border rounded" required/></div>
                  <div><label className="block text-sm font-medium">{t.model1Photo}</label><input name="model1PhotoURL" defaultValue={pollData?.model1.photo} className="mt-1 w-full p-2 border rounded" required/></div>
                  <div><label className="block text-sm font-medium">{t.model2Name}</label><input name="model2Name" defaultValue={pollData?.model2.name} className="mt-1 w-full p-2 border rounded" required/></div>
                  <div><label className="block text-sm font-medium">{t.model2Photo}</label><input name="model2PhotoURL" defaultValue={pollData?.model2.photo} className="mt-1 w-full p-2 border rounded" required/></div>
                  <div className="flex items-center gap-2 pt-2"><input type="checkbox" id="countdownEnabled" name="countdownEnabled" defaultChecked={pollData?.countdownEnabled} className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500" /><label htmlFor="countdownEnabled" className="text-sm font-medium">{t.enableCountdown}</label></div>
                  <button type="submit" disabled={savingAdmin} className="mt-4 w-full bg-pink-600 text-white p-3 rounded-lg flex items-center justify-center">{savingAdmin ? <Loader2 className="animate-spin" /> : t.saveChanges}</button>
              </form>
              <div className="mt-6 border-t pt-6 space-y-3">
                  <button onClick={handlePromoteWinner} className="w-full bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-lg flex items-center justify-center gap-2"><Award size={16} /> {t.promoteWinner}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showInstaModal && ( <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"> <div className="bg-white text-gray-800 rounded-lg p-6 w-full max-w-sm text-center relative shadow-xl"> <button onClick={() => setShowInstaModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X size={20}/></button> <h3 className="text-lg font-bold mb-3 text-pink-600">{t.shareOnInstagram}</h3> <p className="text-sm text-gray-600 mb-4">{t.instagramInstruction}</p> <div className="bg-gray-100 p-3 rounded-md mb-4 text-left text-gray-700 text-sm">{t.title}</div> <button onClick={() => copyToClipboard(t.title)} className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"> <Copy size={16}/> {copied ? t.copied : t.copyText} </button> </div> </div> )}
      
      <header className="flex items-center justify-between p-4 border-b bg-white/70 backdrop-blur-lg sticky top-0 z-10">
        <h1 className="text-3xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-400 animate-background-pan">IGAROTO</h1>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><Globe size={20} className="text-gray-500" /><select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent border-none text-gray-700 focus:outline-none"><option value="pt">PT</option><option value="en">EN</option><option value="es">ES</option></select></div>
            {user && (<button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600"><LogOut size={16} /> {t.logoutButton}</button>)}
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        <section className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-light mb-8 text-gray-700">{t.title}</h2>
            <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
                {pollData && ['model1', 'model2'].map(modelKey => (<div key={modelKey} className="bg-white rounded-lg shadow-lg"><div className="relative"><img src={pollData[modelKey].photo} alt={pollData[modelKey].name} className="w-full h-64 sm:h-80 md:h-96 object-cover" />{showHeart === modelKey && <HeartAnimation onEnd={() => setShowHeart(null)} />} { (voted || pollEnded) && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-5xl font-bold text-white"><AnimatedNumber value={totalVotes > 0 ? (pollData[modelKey].votes / totalVotes * 100) : 0} /></div>}</div><div className="p-4 md:p-6"><h3 className="text-xl md:text-2xl font-semibold mb-4">{pollData[modelKey].name}</h3>{!(voted || pollEnded) ? (<button onClick={() => handleVote(modelKey)} className="w-full text-white font-bold p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500">{t.vote}</button>) : (<div className="w-full bg-gray-200 h-4 rounded-full"><div className="bg-gradient-to-r from-pink-500 to-rose-500 h-4 rounded-full" style={{width: `${totalVotes > 0 ? (pollData[modelKey].votes / totalVotes * 100) : 0}%`}}></div></div>)}</div></div>))}
            </div>
        </section>

        <FeaturedWinner t={t} />
        <PastPolls t={t} />

        <section className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-700"><MessageCircle /> {t.comments}</h2>
            <div className="bg-white rounded-lg p-4 mb-6 shadow">
                <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
                    <input value={newComment.nickname} onChange={e => setNewComment({...newComment, nickname: e.target.value})} placeholder={t.nickname} className="w-full p-2 border rounded"/>
                    <textarea value={newComment.text} onChange={e => setNewComment({...newComment, text: e.target.value})} placeholder={t.commentPlaceholder} rows="3" className="w-full p-2 border rounded"></textarea>
                    <button type="submit" className="self-end bg-pink-600 text-white font-bold py-2 px-6 rounded-lg">{t.submitComment}</button>
                </form>
            </div>
            <div className="space-y-4">
                {comments.map((comment) => (<div key={comment.id} className="bg-white/80 p-4 rounded-lg shadow-sm transition-all duration-500 animate-fade-in"><p className="font-bold text-pink-600">{comment.nickname}</p><p className="text-gray-600 whitespace-pre-wrap">{comment.text}</p><div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 bg-gray-100/50 -mx-4 -mb-4 px-4 py-2 rounded-b-lg">
                    {['❤️', '🔥', '😂', '👍', '😍'].map(emoji => {
                        const hasReacted = !!localStorage.getItem(`reacted_${comment.id}`);
                        const reactedEmoji = localStorage.getItem(`reacted_emoji_${comment.id}`);
                        const isThisReacted = hasReacted && reactedEmoji === emoji;
                        return (
                            <button key={emoji} onClick={(e) => handleReaction(e, comment.id, emoji)} className={`relative flex items-center gap-1.5 px-2 py-1 rounded-full transition-all duration-200 ${hasReacted ? 'cursor-default' : 'hover:bg-gray-200'} ${isThisReacted ? 'bg-pink-100 text-pink-600' : 'bg-transparent text-gray-500'}`} disabled={hasReacted}>
                                <span className="text-lg">{emoji}</span>
                                <span className="text-xs font-semibold">{comment.reactions?.[emoji] || 0}</span>
                            </button>
                        )
                    })}
                </div></div>))}
            </div>
            {pollData?.countdownEnabled && pollData?.endDate && <Countdown endDate={pollData.endDate} t={t} />}
        </section>
      </main>

       <footer className="text-center p-8 mt-12 border-t bg-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{t.socialShare}</h3>
           <div className="flex justify-center gap-6 mb-6">
              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(t.title + ' Vote agora!')} ${shareUrl}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500"><Share2 size={24}/></a>
              <button onClick={() => setShowInstaModal(true)} className="text-gray-400 hover:text-pink-500"><Instagram size={24}/></button>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${encodeURIComponent(t.title)}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600"><Facebook size={24}/></a>
              <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(t.title)}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500"><Twitter size={24}/></a>
          </div>
          {user && (<button onClick={() => setShowAdmin(true)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg"><Settings size={16} className="inline mr-2"/> {t.adminButton}</button>)}
      </footer>
    </div>
  );
};


export default function App() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('');
    const [language, setLanguage] = useState('pt');
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); });
        const handleHashChange = () => { setPage(window.location.hash); };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
        return () => { unsubscribe(); window.removeEventListener('hashchange', handleHashChange); };
    }, []);
    
    const t = translations[language] || translations.pt;
    if (page === '#login' && !user) { return <LoginPage t={t} />; }
    return <PollSite user={user} t={t} language={language} setLanguage={setLanguage} />;
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes like-animation { from { transform: scale(0.5); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 1; } to { transform: scale(1.1) translateY(-30px); opacity: 0; } }
.animate-like { animation: like-animation 1.5s ease-out forwards; }
@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
@keyframes background-pan { from { background-position: 0% center; } to { background-position: -200% center; } }
.animate-background-pan { background-size: 200%; animation: background-pan 3s linear infinite; }
.reaction-button:active { transform: scale(1.2); transition: transform 0.1s; }
@keyframes reaction-fly-up {
  0% { transform: translateY(0) scale(0.5); opacity: 1; }
  50% { transform: translateY(-30px) scale(1.5); opacity: 0.8; }
  100% { transform: translateY(-60px) scale(0.5); opacity: 0; }
}
.reaction-fly-up {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  animation: reaction-fly-up 0.8s ease-out forwards;
  pointer-events: none;
}
@keyframes shiny-effect {
  0% { transform: translateX(-100%) skewX(-20deg); }
  100% { transform: translateX(200%) skewX(-20deg); }
}
.shiny-border::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
  animation: shiny-effect 2.5s linear infinite;
  z-index: 1;
}
`;
document.head.appendChild(style);
