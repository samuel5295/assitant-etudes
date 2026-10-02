import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { api } from '../lib/api'
import type { NoteKind, StudyDocument, StudyNote } from '../lib/types'
import { Modal } from './Modal'

export function ActionDialog({ action, documents, initialDocumentId, onClose, onSuccess, onImport }: { action: NoteKind; documents: StudyDocument[]; initialDocumentId?: string; onClose: () => void; onSuccess: (note: StudyNote) => void; onImport: () => void }) {
  const [documentId, setDocumentId] = useState(initialDocumentId || '')
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const titles = { summary: 'L’essentiel, sans rien perdre.', exercise: 'Comprendre la méthode. Puis réussir.', explain: 'Transformons le flou en déclic.' }
  const descriptions = { summary: 'Une fiche structurée avec les notions clés, les formules et des exemples pour réviser efficacement.', exercise: 'Une piste pour commencer, puis une correction expliquée pas à pas. Importez un énoncé ou écrivez-le ici.', explain: 'Une explication simple, un exemple concret et une question pour vérifier que tout est clair.' }
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = await api<{ note: StudyNote }>('/ai', { method: 'POST', body: JSON.stringify({ action, documentId: documentId || null, question }) })
      onSuccess(result.note)
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'La demande a échoué.') }
    finally { setBusy(false) }
  }
  return <Modal title={titles[action]} onClose={busy ? () => {} : onClose}>
    <p className="modal-subtitle">{descriptions[action]}</p>
    <form className="stack-form" onSubmit={submit}>
      <label>{action === 'summary' ? 'Le cours à résumer' : 'Un document pour donner du contexte'}<select value={documentId} onChange={(event) => setDocumentId(event.target.value)} disabled={busy} required={action === 'summary'}><option value="">{action === 'summary' ? 'Choisir un document…' : 'Sans document · question libre'}</option>{documents.map((document) => <option value={document.id} key={document.id}>{document.subject} · {document.title}</option>)}</select></label>
      {!documents.length && <div className="inline-empty"><BookOpen size={20} /><span>Votre bibliothèque attend son premier document.</span><button type="button" className="text-button" onClick={onImport}>Importer</button></div>}
      <label>{action === 'summary' ? 'Une préférence ? (facultatif)' : action === 'exercise' ? 'Votre énoncé ou votre question' : 'Quelle notion vous pose problème ?'}<textarea value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={8000} rows={5} disabled={busy} required={action === 'explain' || (action === 'exercise' && !documentId)} placeholder={action === 'summary' ? 'Ex. Insiste sur les définitions et donne des exemples simples.' : action === 'exercise' ? 'Ex. Calculer l’intégrale de x·eˣ entre 0 et 1. Comment choisir la méthode ?' : 'Ex. Je ne comprends pas la différence entre une famille libre et une famille génératrice.'} /></label>
      {error && <div className="error-message" role="alert">{error}</div>}
      {busy && <div className="ai-processing" role="status"><Sparkles size={24} /><strong>Clair prépare votre déclic…</strong><span>Lecture, réflexion, explication. Cela peut prendre quelques instants.</span><div className="skeleton-line" /><div className="skeleton-line short" /></div>}
      <button className="button button-dark full-width" disabled={busy || (action === 'summary' && !documentId)}><Sparkles size={17} />{busy ? 'Préparation en cours…' : { summary: 'Créer ma fiche de révision', exercise: 'M’aider à résoudre', explain: 'Expliquer simplement' }[action]}{!busy && <ArrowRight size={16} />}</button>
      <p className="form-footnote">Votre résultat est enregistré dans vos fiches. L’IA peut faire des erreurs : vérifiez les informations importantes avec votre cours.</p>
    </form>
  </Modal>
}
