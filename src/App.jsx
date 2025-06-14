import React, { useState, useEffect, useRef } from 'react';
import { Heart, Globe, MessageCircle, Share2, Twitter, Facebook, Instagram, Save, X, Settings, Copy, Loader2, LogOut } from 'lucide-react';

// Importações do Firebase (com autenticação)
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, increment, collection, addDoc, query, orderBy } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';

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

// Objeto de traduções
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
    saveChanges: "Salvar",
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
  },
  en: {
    title: "Which model do you want to see on IGAROTO's feed tomorrow?",
    vote: "Vote",
    comments: "Comments",
    nickname: "Nickname (optional)",
    commentPlaceholder: "Write your comment...",
    submitComment: "Comment",
    adminPanel: "Admin Panel",
    adminTitle: "Content Management",
    model1Name: "Model 1 Name:",
    model1Photo: "Model 1 Photo URL:",
    model2Name: "Model 2 Name:",
    model2Photo: "Model 2 Photo URL:",
    saveChanges: "Save",
    adminButton: "Admin",
    loading: "Loading poll...",
    loginTitle: "Admin Access",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginButton: "Login",
    logoutButton: "Logout",
    loginError: "Incorrect email or password.",
    socialShare: "Share the poll!",
    shareOnInstagram: "Share on Instagram",
    instagramInstruction: "Instagram doesn't allow direct sharing to Stories from websites. Take a screenshot of the poll and use the text below!",
    copyText: "Copy Text",
    copied: "Copied!",
  },
  es: {
    title: "¿Qué modelo quieres ver mañana en el feed de IGAROTO?",
    vote: "Votar",
    comments: "Comentarios",
    nickname: "Apodo (opcional)",
    commentPlaceholder: "Escribe tu comentario...",
    submitComment: "Comentar",
    adminPanel: "Panel de Administración",
    adminTitle: "Gestión de Contenido",
    model1Name: "Nombre del Modelo 1:",
    model1Photo: "URL de la Foto del Modelo 1:",
    model2Name: "Nombre del Modelo 2:",
    model2Photo: "URL de la Foto del Modelo 2:",
    saveChanges: "Guardar",
    adminButton: "Admin",
    loading: "Cargando encuesta...",
    loginTitle: "Acceso Administrativo",
    emailLabel: "Email",
    passwordLabel: "Contraseña",
    loginButton: "Entrar",
    logoutButton: "Salir",
    loginError: "Email o contraseña incorrectos.",
    socialShare: "¡Comparte la encuesta!",
    shareOnInstagram: "Compartir en Instagram",
    instagramInstruction: "Instagram no permite compartir directamente en Stories desde sitios web. ¡Toma una captura de pantalla de la encuesta y usa el texto a continuación!",
    copyText: "Copiar Texto",
    copied: "¡Copiado!",
  },
};

// --- COMPONENTES ---

const HeartAnimation = ({ onEnd }) => {
  useEffect(() => { const timer = setTimeout(onEnd, 1500); return () => clearTimeout(timer); }, [onEnd]);
  return (<div className="absolute inset-0 flex items-center justify-center animate-like"><Heart className="text-pink-500" size={100} fill="currentColor" /></div>);
};

const LoginPage = ({ t }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.hash = ''; // Redireciona para a página principal
        } catch (err) {
            setError(t.loginError);
            console.error("Erro de login:", err);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-pink-600">{t.loginTitle}</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">{t.emailLabel}</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">{t.passwordLabel}</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md" required />
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <button type="submit" className="w-full py-3 px-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg">{t.loginButton}</button>
                </form>
            </div>
        </div>
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
    const pollDocRef = doc(db, 'polls', 'currentPoll');
    const unsubscribePoll = onSnapshot(pollDocRef, (docSnap) => {
      if (docSnap.exists()) setPollData(docSnap.data());
      else {
        const defaultPoll = {
            model1: { name: 'Modelo 1', votes: 0, photo: 'https://placehold.co/600x800/f9fafb/374151?text=Modelo+1' },
            model2: { name: 'Modelo 2', votes: 0, photo: 'https://placehold.co/600x800/f9fafb/374151?text=Modelo+2' },
        };
        setDoc(pollDocRef, defaultPoll);
      }
      setLoading(false);
    });

    const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
    const unsubscribeComments = onSnapshot(commentsQuery, (querySnapshot) => {
        setComments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    if (localStorage.getItem('votedPoll')) setVoted(true);

    return () => { unsubscribePoll(); unsubscribeComments(); };
  }, []);

  const handleVote = async (modelKey) => {
    if (voted) return;
    const pollDocRef = doc(db, 'polls', 'currentPoll');
    await updateDoc(pollDocRef, { [`${modelKey}.votes`]: increment(1) });
    setVoted(true);
    setShowHeart(modelKey);
    localStorage.setItem('votedPoll', 'true');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.text.trim()) return;
    const finalNickname = newComment.nickname.trim() || 'Anônimo';
    await addDoc(collection(db, 'comments'), { nickname: finalNickname, text: newComment.text, timestamp: new Date() });
    setNewComment({ nickname: '', text: '' });
  };
  
  const handleAdminSave = async (e) => {
    e.preventDefault();
    setSavingAdmin(true);
    const formData = new FormData(e.target);
    const pollDocRef = doc(db, 'polls', 'currentPoll');
    try {
      await updateDoc(pollDocRef, {
        'model1.name': formData.get('model1Name'),
        'model1.photo': formData.get('model1PhotoURL'),
        'model2.name': formData.get('model2Name'),
        'model2.photo': formData.get('model2PhotoURL'),
      });
    } catch (error) { console.error("Erro ao salvar alterações:", error); } 
    finally { setSavingAdmin(false); setShowAdmin(false); }
  };

  const handleLogout = async () => { await signOut(auth); window.location.hash = ''; };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-50 text-gray-800 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-600" size={48} />
        <p className="ml-4 text-xl">{t.loading}</p>
      </div>
    );
  }
  
  const totalVotes = (pollData?.model1.votes || 0) + (pollData?.model2.votes || 0);
  const model1Percentage = totalVotes > 0 ? (((pollData?.model1.votes || 0) / totalVotes) * 100).toFixed(1) : 0;
  const model2Percentage = totalVotes > 0 ? (((pollData?.model2.votes || 0) / totalVotes) * 100).toFixed(1) : 0;
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href.split('#')[0]) : '';
  
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen font-sans">
      {showAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
            <div className="flex justify-between items-center p-4 border-b"><h2 className="text-xl font-bold text-pink-600">{t.adminTitle}</h2><button onClick={() => setShowAdmin(false)}><X size={24}/></button></div>
            <div className="overflow-y-auto max-h-[80vh] p-6">
              <form onSubmit={handleAdminSave} className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">{t.model1Name}</h3>
                  <input name="model1Name" defaultValue={pollData?.model1.name} className="mt-1 w-full p-2 border rounded" required/>
                  <h3 className="text-lg font-semibold border-b pb-2 pt-2">{t.model1Photo}</h3>
                  <input name="model1PhotoURL" defaultValue={pollData?.model1.photo} className="mt-1 w-full p-2 border rounded" required/>
                  
                  <h3 className="text-lg font-semibold border-b pb-2 pt-4">{t.model2Name}</h3>
                  <input name="model2Name" defaultValue={pollData?.model2.name} className="mt-1 w-full p-2 border rounded" required/>
                  <h3 className="text-lg font-semibold border-b pb-2 pt-2">{t.model2Photo}</h3>
                  <input name="model2PhotoURL" defaultValue={pollData?.model2.photo} className="mt-1 w-full p-2 border rounded" required/>

                  <button type="submit" disabled={savingAdmin} className="mt-6 w-full bg-pink-600 text-white p-3 rounded-lg flex items-center justify-center">
                      {savingAdmin ? <Loader2 className="animate-spin" /> : t.saveChanges}
                  </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showInstaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white text-gray-800 rounded-lg p-6 w-full max-w-sm text-center relative shadow-xl">
                <button onClick={() => setShowInstaModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                <h3 className="text-lg font-bold mb-3 text-pink-600">{t.shareOnInstagram}</h3>
                <p className="text-sm text-gray-600 mb-4">{t.instagramInstruction}</p>
                <div className="bg-gray-100 p-3 rounded-md mb-4 text-left text-gray-700 text-sm">{t.title}</div>
                <button onClick={() => copyToClipboard(t.title)} className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                    <Copy size={16}/> {copied ? t.copied : t.copyText}
                </button>
            </div>
        </div>
      )}
      
      <header className="flex items-center justify-between p-4 border-b bg-white/70 backdrop-blur-lg sticky top-0 z-10">
        <h1 className="text-3xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-400">IGAROTO</h1>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Globe size={20} className="text-gray-500" />
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent border-none text-gray-700 focus:outline-none">
                <option value="pt">PT</option><option value="en">EN</option><option value="es">ES</option>
                </select>
            </div>
            {user && (
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600">
                    <LogOut size={16} /> {t.logoutButton}
                </button>
            )}
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        <section className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-light mb-8 text-gray-700">{t.title}</h2>
            {/* LINHA MODIFICADA ABAIXO */}
            <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
                {pollData && ['model1', 'model2'].map(modelKey => (
                <div key={modelKey} className="bg-white rounded-lg shadow-lg">
                    <div className="relative"><img src={pollData[modelKey].photo} alt={pollData[modelKey].name} className="w-full h-64 sm:h-80 md:h-96 object-cover" />
                    {showHeart === modelKey && <HeartAnimation onEnd={() => setShowHeart(null)} />}
                    {voted && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-5xl font-bold text-white">{modelKey === 'model1' ? model1Percentage : model2Percentage}%</div>}
                    </div>
                    <div className="p-4 md:p-6">
                    <h3 className="text-xl md:text-2xl font-semibold mb-4">{pollData[modelKey].name}</h3>
                    {!voted ? (<button onClick={() => handleVote(modelKey)} className="w-full text-white font-bold p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500">{t.vote}</button>) 
                           : (<div className="w-full bg-gray-200 h-4 rounded-full"><div className="bg-gradient-to-r from-pink-500 to-rose-500 h-4 rounded-full" style={{width: `${modelKey === 'model1' ? model1Percentage : model2Percentage}%`}}></div></div>)
                    }
                    </div>
                </div>
                ))}
            </div>
        </section>
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
                {comments.map((comment) => (<div key={comment.id} className="bg-white/80 p-4 rounded-lg shadow-sm"><p className="font-bold text-pink-600">{comment.nickname}</p><p className="text-gray-600">{comment.text}</p></div>))}
            </div>
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
          {user && (
            <button onClick={() => setShowAdmin(true)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">
              <Settings size={16} className="inline mr-2"/> {t.adminButton}
            </button>
          )}
      </footer>
    </div>
  );
};


export default function App() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('');
    const [language, setLanguage] = useState('pt');
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        
        const handleHashChange = () => { setPage(window.location.hash); };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        return () => {
            unsubscribe();
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);
    
    const t = translations[language] || translations.pt;

    if (page === '#login' && !user) {
        return <LoginPage t={t} />;
    }

    return <PollSite user={user} t={t} language={language} setLanguage={setLanguage} />;
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes like-animation {
  0% { transform: scale(0.5); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1.1) translateY(-30px); opacity: 0; }
}
.animate-like { animation: like-animation 1.5s ease-out forwards; }
`;
document.head.appendChild(style);
