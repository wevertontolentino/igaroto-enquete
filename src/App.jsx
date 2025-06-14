import React, { useState, useEffect, useRef } from 'react';
import { Heart, Globe, MessageCircle, Share2, Twitter, Facebook, Instagram, Save, X, Settings, Copy, Loader2 } from 'lucide-react';

// Importações do Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, increment, collection, addDoc, query, orderBy } from 'firebase/firestore';

// --- CONFIGURAÇÃO DO FIREBASE ---
// Suas chaves do Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyDJpIsFWLjNhkPlIDN9BDVSzu9bEpqMrjY",
  authDomain: "igaroto.firebaseapp.com",
  projectId: "igaroto",
  storageBucket: "igaroto.appspot.com",
  messagingSenderId: "1082437439803",
  appId: "1:1082437439803:web:66002420891974b7a8271e",
  measurementId: "G-FT7R4CZQKN"
};

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Objeto de traduções
const translations = {
  pt: {
    title: "Qual modelo você quer ver amanhã no feed do IGAROTO?",
    model1: "Modelo 1",
    model2: "Modelo 2",
    vote: "Votar",
    voted: "Votado",
    thankYou: "Obrigado por participar!",
    comments: "Comentários",
    nickname: "Apelido (opcional)",
    commentPlaceholder: "Escreva seu comentário...",
    submitComment: "Comentar",
    socialShare: "Compartilhe a enquete!",
    adminPanel: "Painel Administrativo",
    adminTitle: "Gerenciamento de Conteúdo",
    model1Name: "Nome do Modelo 1:",
    model1Photo: "URL da Foto do Modelo 1:",
    model2Name: "Nome do Modelo 2:",
    model2Photo: "URL da Foto do Modelo 2:",
    saveChanges: "Salvar",
    adminButton: "Admin",
    close: "Fechar",
    shareOnInstagram: "Compartilhar no Instagram",
    instagramInstruction: "O Instagram não permite compartilhar direto nos Stories por um site. Tire um print da enquete e use o texto abaixo!",
    copyText: "Copiar Texto",
    copied: "Copiado!",
    loading: "Carregando enquete...",
    saving: "Salvando alterações..."
  },
  en: {
    title: "Which model do you want to see on IGAROTO's feed tomorrow?",
    model1: "Model 1",
    model2: "Model 2",
    vote: "Vote",
    voted: "Voted",
    thankYou: "Thanks for participating!",
    comments: "Comments",
    nickname: "Nickname (optional)",
    commentPlaceholder: "Write your comment...",
    submitComment: "Comment",
    socialShare: "Share the poll!",
    adminPanel: "Admin Panel",
    adminTitle: "Content Management",
    model1Name: "Model 1 Name:",
    model1Photo: "Model 1 Photo URL:",
    model2Name: "Model 2 Name:",
    model2Photo: "Model 2 Photo URL:",
    saveChanges: "Save",
    adminButton: "Admin",
    close: "Close",
    shareOnInstagram: "Share on Instagram",
    instagramInstruction: "Instagram doesn't allow direct sharing to Stories from websites. Take a screenshot of the poll and use the text below!",
    copyText: "Copy Text",
    copied: "Copied!",
    loading: "Loading poll...",
    saving: "Saving changes..."
  },
  es: {
    title: "¿Qué modelo quieres ver mañana en el feed de IGAROTO?",
    model1: "Modelo 1",
    model2: "Modelo 2",
    vote: "Votar",
    voted: "Votado",
    thankYou: "¡Gracias por participar!",
    comments: "Comentarios",
    nickname: "Apodo (opcional)",
    commentPlaceholder: "Escribe tu comentario...",
    submitComment: "Comentar",
    socialShare: "¡Comparte la encuesta!",
    adminPanel: "Panel de Administración",
    adminTitle: "Gestión de Contenido",
    model1Name: "Nombre del Modelo 1:",
    model1Photo: "URL de la Foto del Modelo 1:",
    model2Name: "Nombre del Modelo 2:",
    model2Photo: "URL de la Foto del Modelo 2:",
    saveChanges: "Guardar",
    adminButton: "Admin",
    close: "Cerrar",
    shareOnInstagram: "Compartir en Instagram",
    instagramInstruction: "Instagram no permite compartir directamente en Stories desde sitios web. ¡Toma una captura de pantalla de la encuesta y usa el texto a continuación!",
    copyText: "Copiar Texto",
    copied: "¡Copiado!",
    loading: "Cargando encuesta...",
    saving: "Guardando cambios..."
  }
};

// --- COMPONENTES AUXILIARES ---
const HeartAnimation = ({ onEnd }) => {
  useEffect(() => { const timer = setTimeout(onEnd, 1500); return () => clearTimeout(timer); }, [onEnd]);
  return (<div className="absolute inset-0 flex items-center justify-center animate-like"><Heart className="text-pink-500" size={100} fill="currentColor" /></div>);
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [language, setLanguage] = useState('pt');
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

  const t = translations[language] || translations.pt; // Fallback para português

  // Efeito para buscar os dados do Firebase em tempo real
  useEffect(() => {
    const pollDocRef = doc(db, 'polls', 'currentPoll');
    const unsubscribePoll = onSnapshot(pollDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setPollData(docSnap.data());
      } else {
        const defaultPoll = {
            model1: { name: 'Modelo 1', votes: 0, photo: 'https://placehold.co/600x800/f9fafb/374151?text=Modelo+1' },
            model2: { name: 'Modelo 2', votes: 0, photo: 'https://placehold.co/600x800/f9fafb/374151?text=Modelo+2' },
        };
        setDoc(pollDocRef, defaultPoll);
        setPollData(defaultPoll);
      }
      setLoading(false);
    });

    const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
    const unsubscribeComments = onSnapshot(commentsQuery, (querySnapshot) => {
        setComments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    if (localStorage.getItem('votedPoll')) setVoted(true);

    return () => {
      unsubscribePoll();
      unsubscribeComments();
    };
  }, []);

  const handleVote = async (modelKey) => {
    if (voted) return;
    const pollDocRef = doc(db, 'polls', 'currentPoll');
    try {
        await updateDoc(pollDocRef, { [`${modelKey}.votes`]: increment(1) });
        setVoted(true);
        setShowHeart(modelKey);
        localStorage.setItem('votedPoll', 'true');
    } catch (error) { console.error("Erro ao votar:", error); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.text.trim()) return;
    const finalNickname = newComment.nickname.trim() || 'Anônimo';
    try {
        await addDoc(collection(db, 'comments'), {
            nickname: finalNickname, text: newComment.text, timestamp: new Date()
        });
        setNewComment({ nickname: '', text: '' });
    } catch (error) { console.error("Erro ao adicionar comentário:", error); }
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
    } catch (error) {
        console.error("Erro ao salvar alterações:", error);
        alert("Ocorreu um erro ao salvar.");
    } finally {
        setSavingAdmin(false);
        setShowAdmin(false);
    }
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
  
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';


  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen font-sans">
      {showAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-pink-600">{t.adminTitle}</h2>
              <button onClick={() => setShowAdmin(false)}><X size={24}/></button>
            </div>
            <div className="overflow-y-auto max-h-[80vh] p-6">
              <form onSubmit={handleAdminSave} className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">{t.model1}</h3>
                  <div>
                    <label className="block text-sm font-medium">{t.model1Name}</label>
                    <input type="text" name="model1Name" defaultValue={pollData?.model1.name} className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2" required/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">{t.model1Photo}</label>
                    <input type="url" name="model1PhotoURL" defaultValue={pollData?.model1.photo} className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2" placeholder="https://imgur.com/link-da-imagem.jpg" required/>
                  </div>
                  
                  <h3 className="text-lg font-semibold border-b pb-2 pt-4">{t.model2}</h3>
                   <div>
                    <label className="block text-sm font-medium">{t.model2Name}</label>
                    <input type="text" name="model2Name" defaultValue={pollData?.model2.name} className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2" required/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">{t.model2Photo}</label>
                    <input type="url" name="model2PhotoURL" defaultValue={pollData?.model2.photo} className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2" placeholder="https://imgur.com/link-da-outra-imagem.jpg" required/>
                  </div>

                  <button type="submit" disabled={savingAdmin} className="mt-6 w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-pink-300">
                      {savingAdmin ? <><Loader2 className="animate-spin" /> {t.saving}</> : <><Save size={20}/> {t.saveChanges}</>}
                  </button>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <header className="flex items-center justify-between p-4 border-b bg-white/70 backdrop-blur-lg sticky top-0 z-10">
        <h1 className="text-3xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-400">IGAROTO</h1>
        <div className="flex items-center gap-2">
            <Globe size={20} className="text-gray-500" />
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent border-none text-gray-700 focus:outline-none">
              <option value="pt">PT</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        <section className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-light mb-8 text-gray-700">{t.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pollData && ['model1', 'model2'].map(modelKey => (
              <div key={modelKey} className="bg-white rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <img src={pollData[modelKey].photo} alt={pollData[modelKey].name} className="w-full h-96 object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x960/f9fafb/374151?text=Imagem+inválida'; }} />
                  {showHeart === modelKey && <HeartAnimation onEnd={() => setShowHeart(null)} />}
                  {voted && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <span className="text-5xl font-bold text-white">{(modelKey === 'model1' ? model1Percentage : model2Percentage)}%</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-4">{pollData[modelKey].name}</h3>
                  {!voted ? (
                      <button onClick={() => handleVote(modelKey)} className="w-full text-white font-bold py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 shadow-md">
                          {t.vote}
                      </button>
                  ) : (
                      <div className="w-full bg-gray-200 rounded-full h-4">
                         <div className="h-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" style={{ width: `${modelKey === 'model1' ? model1Percentage : model2Percentage}%` }}></div>
                      </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {voted && <p className="mt-8 text-2xl text-green-500 animate-pulse">{t.thankYou}</p>}
        </section>

        <section className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-700"><MessageCircle /> {t.comments}</h2>
            <div className="bg-white rounded-lg p-4 mb-6 shadow">
                <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
                    <input type="text" value={newComment.nickname} onChange={e => setNewComment({...newComment, nickname: e.target.value})} placeholder={t.nickname} className="w-full border-gray-300 rounded-md p-2"/>
                    <textarea value={newComment.text} onChange={e => setNewComment({...newComment, text: e.target.value})} placeholder={t.commentPlaceholder} rows="3" className="w-full border-gray-300 rounded-md p-2"></textarea>
                    <button type="submit" className="self-end bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg">{t.submitComment}</button>
                </form>
            </div>
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="bg-white/80 p-4 rounded-lg shadow-sm">
                        <p className="font-bold text-pink-600">{comment.nickname}</p>
                        <p className="text-gray-600">{comment.text}</p>
                    </div>
                ))}
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
          <button onClick={() => setShowAdmin(true)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 mx-auto">
              <Settings size={16}/> {t.adminButton}
          </button>
      </footer>
    </div>
  );
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
