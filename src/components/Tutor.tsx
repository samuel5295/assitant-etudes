import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUp, BookOpen, CornerDownLeft, Sparkles, Trash2 } from 'lucide-react'
import type { ChatMessage, StudyDocument } from '../lib/types'
import { api } from '../lib/api'
import { Markdown } from './Markdown'

export function Tutor({ documents, authenticated, onLogin }: { documents: StudyDocument[]; authenticated: boolean; onLogin: () => void }) {
  const [documentId, setDocumentId] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [clearConfirm, setClearConfirm] = useState(false)
  const [clearBusy, setClearBusy] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    let active = true
    setMessages([]); setError(''); setClearConfirm(false)
    if (!authenticated) return
    setLoading(true)
    api<{ messages: ChatMessage[] }>(`/messages${documentId ? `?documentId=${encodeURIComponent(documentId)}` : ''}`)
      .then((data) => { if (active) setMessages(data.messages) })
      .catch((failure) => { if (active) setError(failure.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [authenticated, documentId])
  useEffect(() => { if (messages.length || busy) bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [messages, busy])
  async function send(event?: FormEvent) {
    event?.preventDefault()
    if (!authenticated) { onLogin(); return }
    if (!question.trim() || busy || loading || clearBusy) return
    setBusy(true); setError('')
    try {
      const data = await api<{ messages: ChatMessage[] }>('/ai', { method: 'POST', body: JSON.stringify({ action: 'chat', documentId: documentId || null, question }) })
      setMessages((previous) => [...previous, ...data.messages]); setQuestion('')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Le message n’a pas pu être envoyé.') }
    finally { setBusy(false); input.current?.focus() }
  }
  async function clear() {
    setClearBusy(true); setError('')
    try { await api(`/messages${documentId ? `?documentId=${encodeURIComponent(documentId)}` : ''}`, { method: 'DELETE' }); setMessages([]); setClearConfirm(false) }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'La suppression a échoué.') }
    finally { setClearBusy(false) }
  }
  return <section className="tutor-workspace">
    <div className="tutor-toolbar"><div><span className="small-icon mint"><BookOpen size={17} /></span><label htmlFor="chat-document">Contexte</label><select id="chat-document" value={documentId} onChange={(event) => setDocumentId(event.target.value)} disabled={busy || clearBusy}><option value="">Discussion générale</option>{documents.map((document) => <option value={document.id} key={document.id}>{document.title}</option>)}</select></div>{authenticated && messages.length > 0 && <button className="icon-button" title="Effacer la conversation" aria-label="Effacer la conversation" disabled={busy || clearBusy} onClick={() => setClearConfirm(true)}><Trash2 size={18} /></button>}</div>
    {clearConfirm && <div className="clear-confirm"><span>Effacer cette conversation ?</span><button className="text-button danger-text" disabled={clearBusy} onClick={clear}>Effacer</button><button className="text-button" disabled={clearBusy} onClick={() => setClearConfirm(false)}>Annuler</button></div>}
    <div className="chat-messages" aria-live="polite">
      {loading ? <div className="chat-skeleton"><div className="skeleton-line" /><div className="skeleton-line short" /><div className="skeleton-line" /></div> : !messages.length && <div className="tutor-welcome"><div className="tutor-orbit"><Sparkles size={32} /></div><span className="eyebrow">VOTRE PARTENAIRE DE COMPRÉHENSION</span><h2>Il n’y a pas de<br />petite question.</h2><p>Une notion un peu floue ? Un exercice qui résiste ?<br />On prend le temps de comprendre, ensemble.</p><div className="prompt-grid">{['Explique-moi une notion simplement', 'Comment bien réviser un chapitre ?', 'Aide-moi à choisir une méthode'].map((prompt) => <button key={prompt} onClick={() => { setQuestion(prompt); input.current?.focus() }}>{prompt}<CornerDownLeft size={15} /></button>)}</div></div>}
      {messages.map((message) => <article className={`chat-message ${message.role}`} key={message.id}>{message.role === 'assistant' && <div className="assistant-avatar"><Sparkles size={16} /></div>}<div><span className="message-author">{message.role === 'user' ? 'Vous' : 'Clair'}</span><Markdown>{message.content}</Markdown></div></article>)}
      {busy && <div className="thinking-bubble" role="status"><Sparkles size={17} /><span>Clair réfléchit</span><span className="thinking-dots">•••</span></div>}
      <div ref={bottom} />
    </div>
    <div className="chat-compose-area">{error && <div className="error-message" role="alert">{error}</div>}
      <form className="chat-compose" onSubmit={send}><textarea ref={input} aria-label="Votre question pour Clair" placeholder="Posez votre question, on y va étape par étape…" rows={2} value={question} maxLength={8000} disabled={busy || loading || clearBusy} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send() } }} /><button className="send-button" type="submit" aria-label="Envoyer ma question" disabled={busy || loading || clearBusy || !question.trim()}><ArrowUp size={21} /></button></form>
      <p className="form-footnote">{authenticated ? 'Historique privé · 30 demandes IA par jour · ' : 'Connectez-vous pour discuter avec Clair. ' }L’IA peut se tromper. Gardez votre esprit critique.</p>
    </div>
  </section>
}
