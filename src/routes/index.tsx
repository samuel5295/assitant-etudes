import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { getUser, handleAuthCallback, logout, onAuthChange, updateUser } from '@netlify/identity'
import type { User } from '@netlify/identity'
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, Atom, BookOpen, Check,
  ChevronRight, CircleHelp, CodeXml, Copy, FileText, FolderOpen,
  GraduationCap, LayoutGrid, Lightbulb, ListChecks, LockKeyhole, LogOut, Menu,
  Plus, Search, ShieldCheck, Sigma, Sparkles, Star, Sun, Trash2, X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { api } from '../lib/api'
import { demoDocuments, demoNotes, fileSize, subjectTheme } from '../lib/demo'
import { kindLabels } from '../lib/types'
import type { DocumentKind, NoteKind, Page, StudyDocument, StudyNote, Workspace } from '../lib/types'
import { Modal } from '../components/Modal'
import { AuthDialog } from '../components/AuthDialog'
import type { AuthMode } from '../components/AuthDialog'
import { ImportDialog } from '../components/ImportDialog'
import { ActionDialog } from '../components/ActionDialog'
import { Markdown } from '../components/Markdown'
import { Tutor } from '../components/Tutor'

export const Route = createFileRoute('/')({ component: Home })

const navigation: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Vue d’ensemble', icon: LayoutGrid },
  { id: 'courses', label: 'Mes cours', icon: BookOpen },
  { id: 'exercises', label: 'TD & exercices', icon: ListChecks },
  { id: 'notes', label: 'Mes fiches', icon: FileText },
  { id: 'assistant', label: 'Assistant Clair', icon: Sparkles },
  { id: 'favorites', label: 'Mes favoris', icon: Star },
]

const noteLabels: Record<NoteKind, string> = { summary: 'Résumé', exercise: 'Correction', explain: 'Explication' }

function SubjectIcon({ subject, size = 20 }: { subject: string; size?: number }) {
  const text = subject.toLowerCase()
  const Icon = text.includes('info') ? CodeXml : text.includes('phys') || text.includes('chim') ? Atom : Sigma
  return <Icon size={size} strokeWidth={1.7} />
}

function StudyIllustration() {
  return <svg className="study-illustration" viewBox="0 0 390 238" fill="none" aria-hidden="true">
    <ellipse cx="218" cy="207" rx="138" ry="13" fill="#b6d8b0" fillOpacity=".45" />
    <g transform="rotate(-9 250 95)"><rect x="218" y="31" width="108" height="129" rx="8" fill="#739b7d" /><rect x="212" y="26" width="108" height="129" rx="8" fill="#fffbed" /><path d="M228 52h49m-49 13h74m-74 13h65" stroke="#c9d7c4" strokeWidth="3" strokeLinecap="round" /><rect x="227" y="93" width="78" height="46" rx="5" fill="#e7eed4" /><path d="m239 124 17-15 14 8 19-18" stroke="#6c946b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="254" cy="51" r=".01" fill="#718b5d" /></g>
    <g transform="rotate(9 194 156)"><path d="M89 111c43-13 73-9 103 9 27-17 59-20 97-9v78c-37-10-70-6-97 9-29-16-60-20-103-7v-80Z" fill="#578068" /><path d="M84 101c44-13 76-9 108 9 31-18 64-22 101-8v79c-39-11-71-7-101 10-33-17-65-21-108-9v-81Z" fill="#fffaf0" /><path d="M192 110v81" stroke="#d9d7bc" strokeWidth="2" /><path d="M100 120c29-6 49-3 70 5m-70 10c29-5 49-2 70 6m-70 9c29-4 49-1 70 7m-70 8c19-3 33-1 48 3m62-45c25-10 45-12 66-7m-66 22c25-9 45-11 66-6m-66 21c25-8 45-10 66-5m-66 20c17-5 32-7 47-5" stroke="#c7d0bc" strokeWidth="3" strokeLinecap="round" /><path d="m229 108 10-2v33l-6-3-4 5v-33Z" fill="#e6a679" /></g>
    <g transform="rotate(-24 305 170)"><rect x="298" y="127" width="10" height="71" rx="2" fill="#e8b470" /><path d="M298 198h10l-5 12-5-12Z" fill="#e6d0aa" /><path d="m301 206 2 4 2-4" fill="#3d5346" /><rect x="298" y="122" width="10" height="10" rx="2" fill="#f1d4bd" /><path d="M302 135v58" stroke="#d1934c" strokeWidth="2" /></g>
    <g transform="rotate(-12 96 73)"><rect x="59" y="38" width="70" height="61" rx="13" fill="#e3edb6" /><path d="m77 69 10 9 24-24" stroke="#608858" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></g>
    <path d="m340 50 3-10 3 10 10 3-10 3-3 10-3-10-10-3 10-3Z" fill="#719b66" /><path d="m61 161 2-6 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#739b6c" /><circle cx="168" cy="42" r="4" fill="#88ad78" /><circle cx="353" cy="153" r="3" fill="#a0bd89" />
  </svg>
}

function DocumentRow({ document, demo, onOpen, onFavorite }: { document: StudyDocument; demo: boolean; onOpen: () => void; onFavorite: () => void }) {
  return <div className="document-row">
    <button className="document-main" onClick={onOpen}><span className={`document-icon ${subjectTheme(document.subject)}`}><SubjectIcon subject={document.subject} /></span><span className="document-description"><strong>{document.title}</strong><span>{document.subject}<i />{document.filename.split('.').pop()?.toUpperCase()}<i />{fileSize(document.size)}</span></span></button>
    <span className={`type-badge ${document.kind === 'course' ? '' : 'type-td'}`}>{kindLabels[document.kind]}</span>
    <button className={`icon-button favorite-button ${document.favorite ? 'is-favorite' : ''}`} onClick={onFavorite} aria-label={document.favorite ? `Retirer ${document.title} des favoris` : `Ajouter ${document.title} aux favoris`} title={demo ? 'Connectez-vous pour gérer vos favoris' : document.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}><Star size={17} fill={document.favorite ? 'currentColor' : 'none'} /></button>
    <button className="icon-button document-arrow" onClick={onOpen} aria-label={`Ouvrir ${document.title}`}><ChevronRight size={17} /></button>
  </div>
}

function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [workspace, setWorkspace] = useState<Workspace>({ documents: [], notes: [] })
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [reload, setReload] = useState(0)
  const [page, setPage] = useState<Page>('home')
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('all')
  const [filter, setFilter] = useState<'all' | DocumentKind>('all')
  const [sort, setSort] = useState('recent')
  const [mobileNav, setMobileNav] = useState(false)
  const [modal, setModal] = useState<'auth' | 'upload' | 'action' | 'document' | 'note' | 'delete' | 'help' | 'profile' | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('signup')
  const [inviteToken, setInviteToken] = useState<string>()
  const [uploadKind, setUploadKind] = useState<DocumentKind>('course')
  const [action, setAction] = useState<NoteKind>('summary')
  const [selectedDocument, setSelectedDocument] = useState<StudyDocument | null>(null)
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null)
  const [noteError, setNoteError] = useState('')
  const [noteReload, setNoteReload] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'document' | 'note'; id: string; title: string } | null>(null)
  const [mutationBusy, setMutationBusy] = useState(false)
  const [mutationError, setMutationError] = useState('')
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [profileName, setProfileName] = useState('')
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    const unsubscribe = onAuthChange((event, currentUser) => {
      if (!active) return
      setUser(currentUser)
      if (event === 'logout') {
        setWorkspace({ documents: [], notes: [] }); setSelectedDocument(null); setSelectedNote(null); setModal(null); setPage('home')
      }
    })
    async function initialize() {
      try {
        const callback = await handleAuthCallback()
        if (!active) return
        if (callback?.type === 'recovery') { setAuthMode('reset'); setModal('auth') }
        if (callback?.type === 'invite') { setInviteToken(callback.token); setAuthMode('invite'); setModal('auth') }
        setUser(callback?.user || await getUser())
      } catch { if (active) { setToast('Le lien de confirmation est invalide ou a expiré. Connectez-vous ou demandez un nouveau lien.'); setAuthMode('login'); setModal('auth') } }
      finally { if (active) setAuthReady(true) }
    }
    void initialize()
    return () => { active = false; unsubscribe(); if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [])

  useEffect(() => {
    let active = true
    setWorkspace({ documents: [], notes: [] }); setLoadError('')
    if (!user) { setLoading(false); return }
    setLoading(true)
    api<Workspace>('').then((data) => { if (active) setWorkspace(data) }).catch((error) => { if (active) setLoadError(error.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user?.id, reload])

  useEffect(() => {
    if (modal !== 'note' || !user || !selectedNote?.isPreview) return
    let active = true
    setNoteError('')
    api<{ note: StudyNote }>(`/notes/${selectedNote.id}`)
      .then((data) => { if (active) setSelectedNote(data.note) })
      .catch((failure) => { if (active) setNoteError(failure.message) })
    return () => { active = false }
  }, [modal, selectedNote?.id, user?.id, noteReload])

  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') { event.preventDefault(); searchInput.current?.focus() }
      if (event.key === 'Escape') setMobileNav(false)
    }
    window.addEventListener('keydown', keyboard)
    return () => window.removeEventListener('keydown', keyboard)
  }, [])

  const demo = !user
  const documents = user ? workspace.documents : demoDocuments
  const notes = user ? workspace.notes : demoNotes
  const subjects = [...new Set(documents.map((document) => document.subject))].sort((first, second) => first.localeCompare(second, 'fr'))
  const currentNav = navigation.find((item) => item.id === page)!
  const firstName = user?.name?.trim().split(' ')[0] || 'esprit curieux'
  const initials = user?.name ? user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() : 'É'
  const summaries = notes.filter((note) => note.kind === 'summary')
  const corrections = notes.filter((note) => note.kind === 'exercise')

  function notify(message: string) {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 6000)
  }
  function openAuth(mode: AuthMode = 'signup') { setAuthMode(mode); setMobileNav(false); setModal('auth') }
  function goTo(next: Page) { setPage(next); setSearch(''); setSubject('all'); setFilter('all'); setMobileNav(false) }
  function openImport(kind: DocumentKind = 'course') {
    if (!user) { openAuth(); return }
    setUploadKind(kind); setModal('upload')
  }
  function openAction(kind: NoteKind, document?: StudyDocument) {
    if (!user) { openAuth(); return }
    setSelectedDocument(document || null); setAction(kind); setModal('action')
  }
  function openDocument(document: StudyDocument) {
    setSelectedDocument(document); setEditTitle(document.title); setEditSubject(document.subject); setEditing(false); setMutationError(''); setModal('document')
  }
  function openNote(note: StudyNote) { setSelectedNote(note); setNoteError(''); setModal('note') }

  async function copyNote(note: StudyNote) {
    try { await navigator.clipboard.writeText(note.content); notify('Fiche copiée.') }
    catch { notify('La copie n’est pas disponible dans ce navigateur. Téléchargez la fiche.') }
  }
  function updateDocument(document: StudyDocument) {
    setWorkspace((previous) => ({ ...previous, documents: previous.documents.map((item) => item.id === document.id ? document : item) }))
    if (selectedDocument?.id === document.id) setSelectedDocument(document)
  }
  async function favorite(document: StudyDocument) {
    if (!user) { openAuth(); return }
    try { const data = await api<{ document: StudyDocument }>(`/documents/${document.id}`, { method: 'PATCH', body: JSON.stringify({ favorite: !document.favorite }) }); updateDocument(data.document) }
    catch (error) { notify(error instanceof Error ? error.message : 'La modification a échoué.') }
  }
  async function saveDocument(event: FormEvent) {
    event.preventDefault()
    if (!selectedDocument || !user) return
    setMutationBusy(true); setMutationError('')
    try {
      const data = await api<{ document: StudyDocument }>(`/documents/${selectedDocument.id}`, { method: 'PATCH', body: JSON.stringify({ title: editTitle, subject: editSubject }) })
      updateDocument(data.document); setEditing(false); notify('Document mis à jour.')
    } catch (error) { setMutationError(error instanceof Error ? error.message : 'La modification a échoué.') }
    finally { setMutationBusy(false) }
  }
  function askDelete(kind: 'document' | 'note', id: string, title: string) { setDeleteTarget({ kind, id, title }); setMutationError(''); setModal('delete') }
  async function deleteItem() {
    if (!deleteTarget) return
    setMutationBusy(true); setMutationError('')
    try {
      await api(`/${deleteTarget.kind === 'document' ? 'documents' : 'notes'}/${deleteTarget.id}`, { method: 'DELETE' })
      setWorkspace((previous) => ({ documents: deleteTarget.kind === 'document' ? previous.documents.filter((item) => item.id !== deleteTarget.id) : previous.documents, notes: previous.notes.filter((item) => deleteTarget.kind === 'note' ? item.id !== deleteTarget.id : item.documentId !== deleteTarget.id) }))
      setModal(null); setDeleteTarget(null); notify('Suppression effectuée.')
    } catch (error) { setMutationError(error instanceof Error ? error.message : 'La suppression a échoué.') }
    finally { setMutationBusy(false) }
  }
  async function signOut() {
    setMutationBusy(true)
    try { await logout(); setUser(null); setModal(null); setWorkspace({ documents: [], notes: [] }); goTo('home'); notify('Vous êtes déconnecté. À bientôt !') }
    catch { notify('La déconnexion n’a pas abouti. Réessayez.') }
    finally { setMutationBusy(false) }
  }
  async function saveProfile(event: FormEvent) {
    event.preventDefault(); setMutationBusy(true); setMutationError('')
    try { const updated = await updateUser({ data: { full_name: profileName.trim() } }); setUser(updated); setModal(null); notify('Votre prénom est mis à jour.') }
    catch { setMutationError('La modification n’a pas abouti. Réessayez.') }
    finally { setMutationBusy(false) }
  }
  function exportNote(note: StudyNote) {
    const downloadUrl = URL.createObjectURL(new Blob([`# ${note.title}\n\n${note.content}\n\n---\nFiche créée avec Clair. Vérifiez les informations importantes avec votre cours.\n`], { type: 'text/markdown;charset=utf-8' }))
    const link = document.createElement('a'); link.href = downloadUrl; link.download = `${note.title.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '').slice(0, 100)}.md`; link.click(); setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
  }

  const query = search.toLocaleLowerCase('fr').trim()
  const filteredDocuments = documents.filter((document) => {
    if (page === 'courses' && document.kind !== 'course') return false
    if (page === 'exercises' && document.kind === 'course') return false
    if (page === 'favorites' && !document.favorite) return false
    if (subject !== 'all' && document.subject !== subject) return false
    if (filter !== 'all' && document.kind !== filter) return false
    return !query || `${document.title} ${document.subject} ${document.filename}`.toLocaleLowerCase('fr').includes(query)
  }).sort((first, second) => sort === 'alphabetical' ? first.title.localeCompare(second.title, 'fr') : new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
  const filteredNotes = notes.filter((note) => !query || `${note.title} ${note.content}`.toLocaleLowerCase('fr').includes(query))
  const headerTitles: Record<Page, string> = { home: `Bonjour, ${firstName}.`, courses: 'Du cours au déclic.', exercises: 'La pratique fait la différence.', notes: 'L’essentiel, à portée de main.', assistant: 'Tout devient plus clair.', favorites: 'Vos indispensables, réunis.' }
  const headerDescriptions: Record<Page, string> = { home: 'Un espace pour apprendre, comprendre et avancer à votre rythme.', courses: 'Tous vos cours, bien rangés. Toute votre attention, sur l’essentiel.', exercises: 'Vos TD et exercices, avec des méthodes expliquées pas à pas.', notes: 'Retrouvez vos résumés, corrections et explications au même endroit.', assistant: 'Un partenaire patient pour toutes les questions que vous n’osez pas poser.', favorites: 'Retrouvez rapidement les documents qui comptent pour vous.' }

  function renderDocuments(items: StudyDocument[]) {
    if (loading || !authReady) return <div className="document-skeleton">{[1, 2, 3].map((item) => <div key={item}><span /><div><i /><i /></div></div>)}</div>
    if (!items.length) return <div className="empty-state"><span className="empty-icon"><FolderOpen size={30} /></span><h3>{query || subject !== 'all' ? 'Aucun document trouvé.' : page === 'favorites' ? 'Gardez vos essentiels tout près.' : 'Votre premier déclic commence ici.'}</h3><p>{query || subject !== 'all' ? 'Essayez un autre mot-clé ou une autre matière.' : page === 'favorites' ? 'Cliquez sur l’étoile d’un document pour le retrouver ici.' : 'Ajoutez un cours, un TD ou une photo. On s’occupe du reste, ensemble.'}</p>{!query && subject === 'all' && page !== 'favorites' && <button className="button button-dark" onClick={() => openImport(page === 'exercises' ? 'td' : 'course')}><Plus size={17} />Importer mon premier document</button>}</div>
    return <div className="document-list">{items.map((document) => <DocumentRow key={document.id} document={document} demo={demo} onOpen={() => openDocument(document)} onFavorite={() => void favorite(document)} />)}</div>
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Aller au contenu</a>
    {mobileNav && <button className="sidebar-overlay" onClick={() => setMobileNav(false)} aria-label="Fermer la navigation" />}
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <button className="brand" onClick={() => goTo('home')} aria-label="Clair, accueil"><span className="brand-mark"><Sun size={26} strokeWidth={1.7} /></span><span>clair<span className="brand-dot">.</span></span></button>
      <div className="workspace-selector"><span className="workspace-icon"><GraduationCap size={19} /></span><div><strong>Mon espace étudiant</strong><span>Licence 2</span></div><span className="workspace-status" title="Espace personnel" /></div>
      <span className="nav-caption">MON APPRENTISSAGE</span>
      <nav aria-label="Navigation principale">{navigation.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} aria-current={page === id ? 'page' : undefined} onClick={() => goTo(id)}><Icon size={19} strokeWidth={1.7} /><span>{label}</span>{id === 'assistant' ? <span className="ai-badge">IA</span> : id === 'courses' ? <span className="nav-count">{documents.filter((document) => document.kind === 'course').length}</span> : null}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><span className="small-icon"><Lightbulb size={18} /></span><strong>Un pas après l’autre.</strong><p>Comprendre vaut mieux<br />qu’apprendre par cœur.</p><button onClick={() => goTo('assistant')}>Un coup de pouce ?<ArrowUpRight size={15} /></button></div><button className="sidebar-help" onClick={() => setModal('help')}><CircleHelp size={17} />À propos de Clair<ArrowUpRight size={14} /></button><button className="sidebar-profile" onClick={() => { if (user) { setProfileName(user.name || ''); setMutationError(''); setModal('profile') } else openAuth('login') }}><span className="avatar">{initials}</span><span><strong>{user?.name || 'Votre espace personnel'}</strong><small>{user ? 'Étudiant · Licence 2' : 'Connectez-vous pour commencer'}</small></span><ChevronRight size={16} /></button></div>
    </aside>

    <div className="main-wrapper"><header className="topbar"><div className="topbar-location"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Ouvrir la navigation"><Menu size={22} /></button><span className="breadcrumb-home">Mon espace</span><ChevronRight size={14} /><strong>{currentNav.label}</strong></div><div className="topbar-actions"><div className="global-search"><Search size={17} /><input ref={searchInput} aria-label="Rechercher dans mes documents et fiches" placeholder="Rechercher un document…" value={search} onChange={(event) => { setSearch(event.target.value); if (page === 'assistant') setPage('courses') }} /><kbd>⌘ K</kbd>{search && <button className="search-clear" onClick={() => setSearch('')} aria-label="Effacer la recherche"><X size={14} /></button>}</div><button className="icon-button topbar-help" onClick={() => setModal('help')} aria-label="Aide et fonctionnement"><CircleHelp size={20} /></button>{user ? <button className="avatar topbar-avatar" onClick={() => { setProfileName(user.name || ''); setMutationError(''); setModal('profile') }} aria-label="Mon compte">{initials}</button> : <button className="login-button" onClick={() => openAuth('login')}>Se connecter<ArrowUpRight size={14} /></button>}</div></header>

      <main id="main-content" className="main-content"><div className="page-heading"><div><div className="heading-eyebrow"><span />{page === 'home' ? 'UNE BELLE JOURNÉE POUR COMPRENDRE' : currentNav.label.toUpperCase()}</div><h1>{headerTitles[page]}{page === 'home' && <span className="greeting-sun"><Sun size={27} strokeWidth={1.4} /></span>}</h1><p>{headerDescriptions[page]}</p></div>{page !== 'assistant' && <button className="button button-dark import-main" onClick={() => openImport(page === 'exercises' ? 'td' : 'course')}><Plus size={18} />Importer un document</button>}</div>

      {demo && <div className="demo-banner"><span><span className="demo-dot" /><strong>Découvrez votre futur espace.</strong><span> Les documents présentés sont des exemples.</span></span><button onClick={() => openAuth()}>Créer mon espace<ArrowRight size={14} /></button></div>}
      {loadError && <div className="error-message load-error" role="alert"><span>{loadError}</span><button className="text-button" onClick={() => setReload((previous) => previous + 1)}>Réessayer</button></div>}

      {page === 'home' && <>
        {!query && <><section className="welcome-banner"><div className="welcome-copy"><span className="hero-label"><Sparkles size={14} />APPRENDRE. COMPRENDRE. PROGRESSER.</span><h2>Les grands progrès<br />commencent par <span>un déclic.</span></h2><p>Un cours dense, un exercice compliqué ?<br />Faisons simple, une notion à la fois.</p><button className="button hero-button" onClick={() => goTo('assistant')}>Faire le point avec Clair<ArrowUpRight size={17} /></button></div><StudyIllustration /><span className="hero-corner-label">LA CLARTÉ CHANGE TOUT.</span></section>
        <div className="stats-grid"><div className="stat-card"><div><span className="stat-label">Mes documents</span><strong>{String(documents.length).padStart(2, '0')}<small>cours & supports</small></strong></div><span className="stat-icon mint"><BookOpen size={22} strokeWidth={1.6} /></span><div className="stat-caption"><span className="tiny-dot mint-dot" />Tout votre savoir, au même endroit</div></div><div className="stat-card"><div><span className="stat-label">Mes résumés</span><strong>{String(summaries.length).padStart(2, '0')}<small>fiches de révision</small></strong></div><span className="stat-icon lavender"><FileText size={22} strokeWidth={1.6} /></span><div className="stat-caption"><span className="tiny-dot lavender-dot" />L’essentiel pour mieux mémoriser</div></div><div className="stat-card"><div><span className="stat-label">Mes corrections</span><strong>{String(corrections.length).padStart(2, '0')}<small>exercices expliqués</small></strong></div><span className="stat-icon peach"><ListChecks size={22} strokeWidth={1.6} /></span><div className="stat-caption"><span className="tiny-dot peach-dot" />Comprendre la méthode, pas à pas</div></div></div>
        <section className="quick-actions-section"><div className="section-heading"><h2>De quoi avez-vous besoin ?</h2><span>Chaque question est un bon début.</span></div><div className="quick-actions"><button className="quick-action" onClick={() => openAction('summary')}><span className="quick-icon mint"><FileText size={21} /></span><div><strong>Résumer un cours</strong><span>L’essentiel, en une fiche claire.</span></div><ArrowUpRight size={18} /></button><button className="quick-action" onClick={() => openAction('exercise')}><span className="quick-icon peach"><ListChecks size={21} /></span><div><strong>Résoudre un exercice</strong><span>La méthode, étape par étape.</span></div><ArrowUpRight size={18} /></button><button className="quick-action" onClick={() => openAction('explain')}><span className="quick-icon lavender"><Lightbulb size={21} /></span><div><strong>Comprendre une notion</strong><span>Des explications qui font tilt.</span></div><ArrowUpRight size={18} /></button></div></section></>}
        <div className="dashboard-bottom"><section className="panel recent-documents"><div className="panel-heading"><div><span className="small-icon neutral"><FolderOpen size={17} /></span><h2>{query ? 'Résultats de recherche' : 'Vos derniers documents'}</h2></div><button className="text-button" onClick={() => goTo('courses')}>Tout voir<ArrowRight size={15} /></button></div>{renderDocuments(filteredDocuments.slice(0, query ? 100 : 4))}<button className="add-document-row" onClick={() => openImport()}><Plus size={16} />Ajouter un document à ma bibliothèque</button></section><aside className="dashboard-rail"><section className="assistant-card"><div className="assistant-card-top"><span className="assistant-logo"><Sparkles size={21} /></span><span className="available-label"><span />À votre rythme</span></div><h2>Une question ?<br />On éclaircit ça.</h2><p>Clair vous aide à comprendre,<br />sans jugement et sans pression.</p><button onClick={() => goTo('assistant')}>Discuter avec Clair<ArrowRight size={16} /></button><div className="assistant-watermark" aria-hidden="true"><Sun size={112} strokeWidth={.65} /></div></section><div className="study-tip"><span className="tip-icon"><Lightbulb size={20} /></span><div><strong>Le petit conseil de Clair</strong><p>Après chaque cours, expliquez une notion avec vos propres mots. Si c’est simple, c’est compris.</p></div></div></aside></div>
        {query && filteredNotes.length > 0 && <section className="search-notes"><div className="section-heading"><h2>Fiches correspondantes</h2></div><div className="notes-grid">{filteredNotes.map((note) => <button className="note-card" key={note.id} onClick={() => openNote(note)}><span className="note-label"><FileText size={16} />{noteLabels[note.kind]}</span><h3>{note.title}</h3><span>Ouvrir la fiche<ArrowUpRight size={16} /></span></button>)}</div></section>}
      </>}

      {(page === 'courses' || page === 'exercises' || page === 'favorites') && <>
        {page === 'exercises' && <div className="practice-callout"><span className="quick-icon peach"><ListChecks size={23} /></span><div><strong>Un énoncé, plusieurs façons de comprendre.</strong><p>Importez votre TD ou écrivez un exercice pour obtenir une méthode expliquée.</p></div><button className="button button-outline" onClick={() => openAction('exercise')}>Travailler un exercice<ArrowUpRight size={16} /></button></div>}
        <section className="panel library-panel"><div className="library-toolbar"><div className="library-title"><FolderOpen size={19} /><h2>{page === 'courses' ? 'Ma bibliothèque de cours' : page === 'exercises' ? 'Mes supports de pratique' : 'Mes documents favoris'}</h2><span className="count-pill">{filteredDocuments.length}</span></div><div className="library-filters"><select aria-label="Filtrer par matière" value={subject} onChange={(event) => setSubject(event.target.value)}><option value="all">Toutes les matières</option>{subjects.map((item) => <option key={item} value={item}>{item}</option>)}</select><select aria-label="Trier les documents" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recent">Plus récents</option><option value="alphabetical">A → Z</option></select></div></div>{page === 'exercises' && <div className="filter-tabs">{(['all', 'td', 'exercise'] as const).map((value) => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{value === 'all' ? 'Tous les supports' : kindLabels[value]}</button>)}</div>}{renderDocuments(filteredDocuments)}</section>
        <div className="library-footnote"><ShieldCheck size={15} />{demo ? 'Documents d’exemple · Créez un compte pour importer les vôtres.' : 'Vos fichiers sont privés et accessibles uniquement depuis votre compte.'}</div>
      </>}

      {page === 'notes' && <><div className="section-heading notes-section-heading"><span>{filteredNotes.length} fiche{filteredNotes.length > 1 ? 's' : ''} dans votre espace</span><button className="button button-outline" onClick={() => openAction('summary')}><Plus size={16} />Créer une fiche</button></div>{loading ? <div className="notes-grid">{[1, 2, 3].map((item) => <div className="note-card note-skeleton" key={item}><div className="skeleton-line short" /><div className="skeleton-line" /><div className="skeleton-line" /></div>)}</div> : filteredNotes.length ? <div className="notes-grid">{filteredNotes.map((note) => <button className="note-card" key={note.id} onClick={() => openNote(note)}><span className={`note-label ${note.kind === 'exercise' ? 'peach' : note.kind === 'explain' ? 'lavender' : 'mint'}`}><FileText size={16} />{noteLabels[note.kind]}{demo && <small>EXEMPLE</small>}</span><h3>{note.title.replace(/^(Résumé|Correction|Explication) · /, '')}</h3><p>{note.content.replace(/[#*$\\]/g, '').slice(0, 120)}…</p><div className="note-card-footer"><span>{demo ? 'Fiche de démonstration' : new Date(note.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span><ArrowUpRight size={17} /></div></button>)}</div> : <section className="panel"><div className="empty-state"><span className="empty-icon"><FileText size={30} /></span><h3>{query ? 'Aucune fiche trouvée.' : 'Faites de la place aux idées claires.'}</h3><p>{query ? 'Essayez un autre mot-clé.' : 'Vos résumés, corrections et explications sont enregistrés ici automatiquement.'}</p>{!query && <button className="button button-dark" onClick={() => openAction('summary')}><Sparkles size={17} />Créer ma première fiche</button>}</div></section>}</>}

      {page === 'assistant' && <Tutor key={user?.id || 'visitor'} documents={user ? documents : []} authenticated={!!user} onLogin={() => openAuth()} />}
      <footer className="page-footer"><span>Un peu plus clair, chaque jour.</span><span>Fait pour apprendre, pas pour apprendre à votre place.<span className="footer-spark"><Sparkles size={12} /></span></span></footer>
      </main>
    </div>

    {modal === 'auth' && <AuthDialog key={`${authMode}-${inviteToken ? 'invite' : 'standard'}`} initialMode={authMode} inviteToken={inviteToken} onClose={() => setModal(null)} onSuccess={(authenticated) => { setUser(authenticated); setModal(null); setInviteToken(undefined); notify(`Bienvenue ${authenticated.name?.split(' ')[0] || 'dans votre espace'} !`) }} />}
    {modal === 'upload' && <ImportDialog initialKind={uploadKind} subjects={subjects} onClose={() => setModal(null)} onSuccess={(document) => { setWorkspace((previous) => ({ ...previous, documents: [document, ...previous.documents] })); openDocument(document); notify('Votre document est prêt. À vous les déclics !') }} />}
    {modal === 'action' && <ActionDialog action={action} documents={user ? documents : []} initialDocumentId={selectedDocument?.id} onClose={() => setModal(null)} onImport={() => openImport(action === 'exercise' ? 'td' : 'course')} onSuccess={(note) => { setWorkspace((previous) => ({ ...previous, notes: [note, ...previous.notes] })); openNote(note); notify('Votre fiche est enregistrée dans votre espace.') }} />}
    {modal === 'document' && selectedDocument && <Modal title={editing ? 'Modifier le document' : selectedDocument.title} onClose={mutationBusy ? () => {} : () => setModal(null)}>
      {editing ? <form className="stack-form" onSubmit={saveDocument}><label>Titre<input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={150} required /></label><label>Matière<input value={editSubject} onChange={(event) => setEditSubject(event.target.value)} maxLength={80} required /></label>{mutationError && <div className="error-message" role="alert">{mutationError}</div>}<div className="dialog-actions"><button type="button" className="button button-outline" onClick={() => setEditing(false)} disabled={mutationBusy}>Annuler</button><button className="button button-dark" disabled={mutationBusy}>{mutationBusy ? 'Enregistrement…' : 'Enregistrer'}</button></div></form> : <>
      <div className="document-detail-head"><span className={`document-icon large ${subjectTheme(selectedDocument.subject)}`}><SubjectIcon subject={selectedDocument.subject} size={29} /></span><div><strong>{selectedDocument.subject}</strong><p>{kindLabels[selectedDocument.kind]} · {selectedDocument.filename.split('.').pop()?.toUpperCase()} · {fileSize(selectedDocument.size)}</p></div><button className={`icon-button favorite-button ${selectedDocument.favorite ? 'is-favorite' : ''}`} onClick={() => void favorite(selectedDocument)} aria-label="Modifier le favori"><Star size={20} fill={selectedDocument.favorite ? 'currentColor' : 'none'} /></button></div>
      {demo && <div className="example-notice"><Lightbulb size={18} /><p>Ce document illustre votre futur espace. Créez un compte pour importer vos propres cours et utiliser l’assistant.</p></div>}
      <h3 className="dialog-section-title">On commence par quoi ?</h3><div className="document-actions"><button onClick={() => openAction('summary', selectedDocument)}><span className="quick-icon mint"><FileText size={20} /></span><div><strong>Créer un résumé</strong><span>Les notions clés et les exemples à retenir.</span></div><ChevronRight size={17} /></button><button onClick={() => openAction('exercise', selectedDocument)}><span className="quick-icon peach"><ListChecks size={20} /></span><div><strong>Travailler les exercices</strong><span>Une méthode, une correction, une vérification.</span></div><ChevronRight size={17} /></button><button onClick={() => openAction('explain', selectedDocument)}><span className="quick-icon lavender"><Lightbulb size={20} /></span><div><strong>Éclaircir une notion</strong><span>Une explication adaptée à votre cours.</span></div><ChevronRight size={17} /></button></div>
      {notes.some((note) => note.documentId === selectedDocument.id) && <><h3 className="dialog-section-title">Fiches liées à ce document</h3><div className="linked-notes">{notes.filter((note) => note.documentId === selectedDocument.id).map((note) => <button key={note.id} onClick={() => openNote(note)}><FileText size={16} /><span>{note.title}</span><ArrowUpRight size={15} /></button>)}</div></>}
      {!demo && <div className="document-management"><a className="text-button" href={`/api/study/documents/${selectedDocument.id}/file`} download><ArrowDownToLine size={15} />Télécharger l’original</a><button className="text-button" onClick={() => setEditing(true)}>Modifier</button><button className="icon-button danger-text" aria-label="Supprimer le document" onClick={() => askDelete('document', selectedDocument.id, selectedDocument.title)}><Trash2 size={17} /></button></div>}</>}
    </Modal>}
    {modal === 'note' && selectedNote && <Modal title={selectedNote.title} wide onClose={() => setModal(null)}><div className="note-modal-meta"><span className="type-badge">{noteLabels[selectedNote.kind]}</span><span>{demo ? 'Fiche d’exemple' : 'Enregistrée dans votre espace privé'}</span></div>{selectedNote.isPreview ? noteError ? <div className="error-message" role="alert">{noteError}<button className="text-button" onClick={() => setNoteReload((previous) => previous + 1)}>Réessayer</button></div> : <div className="chat-skeleton" role="status" aria-label="Chargement de la fiche"><div className="skeleton-line" /><div className="skeleton-line short" /><div className="skeleton-line" /></div> : <Markdown>{selectedNote.content}</Markdown>}<div className="note-disclaimer"><ShieldCheck size={16} />L’IA peut faire des erreurs. Vérifiez les points importants avec votre cours.</div><div className="note-modal-actions"><button className="button button-outline" disabled={selectedNote.isPreview} onClick={() => void copyNote(selectedNote)}><Copy size={15} />Copier</button><button className="button button-dark" disabled={selectedNote.isPreview} onClick={() => exportNote(selectedNote)}><ArrowDownToLine size={15} />Télécharger la fiche</button>{!demo && <button className="icon-button danger-text" aria-label="Supprimer cette fiche" onClick={() => askDelete('note', selectedNote.id, selectedNote.title)}><Trash2 size={17} /></button>}</div></Modal>}
    {modal === 'delete' && deleteTarget && <Modal title="Supprimer cet élément ?" onClose={mutationBusy ? () => {} : () => setModal(null)}><p className="modal-subtitle"><strong>{deleteTarget.title}</strong></p><p className="delete-warning">{deleteTarget.kind === 'document' ? 'Le fichier, ses fiches liées et sa conversation seront définitivement supprimés.' : 'Cette fiche sera définitivement supprimée. Le document original reste dans votre bibliothèque.'} Cette action est irréversible.</p>{mutationError && <div className="error-message" role="alert">{mutationError}</div>}<div className="dialog-actions"><button className="button button-outline" disabled={mutationBusy} onClick={() => setModal(null)}>Annuler</button><button className="button button-danger" disabled={mutationBusy} onClick={deleteItem}><Trash2 size={16} />{mutationBusy ? 'Suppression…' : 'Supprimer'}</button></div></Modal>}
    {modal === 'help' && <Modal title="Un compagnon, pas un raccourci." onClose={() => setModal(null)}><div className="help-intro"><span className="auth-symbol"><Sun size={29} /></span><p>Clair rassemble vos supports de cours et vous aide à transformer les notions complexes en idées simples.</p></div><ol className="help-steps"><li><span>01</span><div><strong>Ajoutez vos supports</strong><p>PDF, Word (.docx), texte ou photos JPG, PNG et WebP. Jusqu’à 4 Mo par fichier et 100 documents par compte.</p></div></li><li><span>02</span><div><strong>Choisissez votre déclic</strong><p>Un résumé du cours, une correction expliquée ou une notion à éclaircir. Vos fiches sont enregistrées automatiquement.</p></div></li><li><span>03</span><div><strong>Posez toutes vos questions</strong><p>Discutez avec l’assistant, avec ou sans document. Votre historique reste dans votre espace. 30 demandes IA par jour, renouvelées à minuit UTC.</p></div></li></ol><div className="privacy-notice"><ShieldCheck size={21} /><div><strong>Personnel, privé, pédagogique.</strong><p>Chaque étudiant possède son propre espace. Le document sélectionné et vos messages sont transmis au service IA pour fournir une réponse. N’importez pas de données sensibles. Vérifiez les réponses : l’IA n’est pas infaillible.</p></div></div></Modal>}
    {modal === 'profile' && user && <Modal title="Mon espace personnel" onClose={mutationBusy ? () => {} : () => setModal(null)}><div className="profile-head"><span className="avatar large-avatar">{initials}</span><div><strong>{user.name || 'Étudiant'}</strong><p>{user.email}</p><span className="type-badge">Licence 2</span></div></div><form className="stack-form" onSubmit={saveProfile}><label>Votre prénom<input value={profileName} onChange={(event) => setProfileName(event.target.value)} maxLength={80} required disabled={mutationBusy} /></label>{mutationError && <div className="error-message" role="alert">{mutationError}</div>}<button className="button button-dark" disabled={mutationBusy}><Check size={16} />Enregistrer</button></form><div className="profile-privacy"><LockKeyhole size={16} />Vos cours, fiches et conversations sont privés.</div><button className="button button-outline full-width" disabled={mutationBusy} onClick={() => void signOut()}><LogOut size={16} />Me déconnecter</button></Modal>}
    {toast && <div className="toast" role="status"><span className="toast-icon"><Check size={16} /></span><span>{toast}</span><button onClick={() => setToast('')} aria-label="Fermer le message"><X size={15} /></button></div>}
  </div>
}
