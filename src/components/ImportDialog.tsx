import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { FileText, UploadCloud, X, ArrowRight } from 'lucide-react'
import { api } from '../lib/api'
import { FILE_ACCEPT, MAX_FILE_SIZE } from '../lib/types'
import type { DocumentKind, StudyDocument } from '../lib/types'
import { fileSize } from '../lib/demo'
import { Modal } from './Modal'

export function ImportDialog({ initialKind = 'course', subjects, onClose, onSuccess }: { initialKind?: DocumentKind; subjects: string[]; onClose: () => void; onSuccess: (document: StudyDocument) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [kind, setKind] = useState<DocumentKind>(initialKind)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  function selectFile(selected: File | undefined) {
    setError('')
    if (!selected) return
    if (!selected.size || selected.size > MAX_FILE_SIZE) { setError('Choisissez un fichier non vide de 4 Mo maximum.'); return }
    if (!/\.(pdf|png|jpe?g|webp|docx|txt|md)$/i.test(selected.name)) { setError('Ce format n’est pas pris en charge. Utilisez un PDF, DOCX, TXT ou une photo JPG, PNG ou WebP.'); return }
    setFile(selected); setTitle(selected.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ').slice(0, 150))
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!file) { setError('Ajoutez d’abord votre document.'); return }
    setBusy(true); setError('')
    const form = new FormData()
    form.set('file', file); form.set('title', title); form.set('subject', subject); form.set('kind', kind)
    try { const result = await api<{ document: StudyDocument }>('/documents', { method: 'POST', body: form }); onSuccess(result.document) }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'L’import a échoué.') }
    finally { setBusy(false) }
  }
  return <Modal title="Un document, plein de possibilités." onClose={busy ? () => {} : onClose}>
    <p className="modal-subtitle">Importez votre cours, votre TD ou une photo d’exercice. Clair vous aide à en tirer l’essentiel.</p>
    <form onSubmit={submit} className="stack-form">
      <input ref={input} className="visually-hidden" type="file" accept={FILE_ACCEPT} tabIndex={-1} onChange={(event) => selectFile(event.target.files?.[0])} disabled={busy} />
      <button type="button" className={`dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`} disabled={busy} onClick={() => input.current?.click()} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); if (!busy) selectFile(event.dataTransfer.files[0]) }}>
        {file ? <FileText size={30} /> : <UploadCloud size={32} />}
        <strong>{file ? file.name : 'Glissez votre document ici'}</strong><span>{file ? `${fileSize(file.size)} · Cliquez pour changer de fichier` : 'ou cliquez pour choisir un fichier'}</span>
        {!file && <small>PDF, Word (.docx), TXT, Markdown, JPG, PNG, WebP · 4 Mo max.</small>}
      </button>
      {file && <button type="button" className="text-button remove-file" disabled={busy} onClick={() => { setFile(null); if (input.current) input.current.value = '' }}><X size={13} /> Retirer le fichier</button>}
      <label>Titre du document<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={150} required placeholder="Ex. Chapitre 3 · Suites numériques" disabled={busy} /></label>
      <div className="form-columns"><label>Matière<input value={subject} onChange={(event) => setSubject(event.target.value)} list="subject-options" maxLength={80} required placeholder="Ex. Analyse" disabled={busy} /><datalist id="subject-options">{subjects.map((item) => <option key={item} value={item} />)}</datalist></label><label>Type de document<select value={kind} onChange={(event) => setKind(event.target.value as DocumentKind)} disabled={busy}><option value="course">Cours</option><option value="td">Travaux dirigés</option><option value="exercise">Exercice</option></select></label></div>
      {error && <div className="error-message" role="alert">{error}</div>}
      {busy && <div className="processing-indicator" role="status"><span />Import et sauvegarde du document…</div>}
      <button className="button button-dark full-width" disabled={busy || !file}>{busy ? 'Import en cours…' : 'Ajouter à mon espace'}<ArrowRight size={17} /></button>
    </form>
  </Modal>
}
