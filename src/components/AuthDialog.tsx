import { useState } from 'react'
import type { FormEvent } from 'react'
import { acceptInvite, getUser, login, signup, requestPasswordRecovery, updateUser, AuthError, MissingIdentityError } from '@netlify/identity'
import type { User } from '@netlify/identity'
import { ArrowRight, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { Modal } from './Modal'

export type AuthMode = 'login' | 'signup' | 'forgot' | 'reset' | 'invite'

export function AuthDialog({ initialMode, inviteToken, onClose, onSuccess }: { initialMode: AuthMode; inviteToken?: string; onClose: () => void; onSuccess: (user: User) => void }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  function switchMode(next: AuthMode) { setMode(next); setError(''); setNotice(''); setPassword('') }
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      if (mode === 'forgot') {
        await requestPasswordRecovery(email)
        setNotice('Si un compte existe avec cette adresse, un lien de réinitialisation vous a été envoyé. Consultez aussi vos courriers indésirables.')
      } else if (mode === 'signup') {
        await signup(email, password, { full_name: name.trim(), level: 'Licence 2' })
        const authenticated = await getUser()
        if (authenticated) onSuccess(authenticated)
        else setNotice('Votre compte est créé ! Confirmez votre adresse avec le lien reçu par e-mail, puis retrouvez votre espace ici.')
      } else if (mode === 'reset') {
        const updated = await updateUser({ password })
        onSuccess(updated)
      } else if (mode === 'invite') {
        if (!inviteToken) throw new Error('Le lien d’invitation est invalide.')
        onSuccess(await acceptInvite(inviteToken, password))
      } else onSuccess(await login(email, password))
    } catch (failure) {
      if (failure instanceof MissingIdentityError) setError('La connexion est disponible sur la version déployée du site.')
      else if (failure instanceof AuthError) {
        const message = failure.message.toLowerCase()
        if (message.includes('confirm')) setError('Confirmez votre adresse e-mail avant de vous connecter. Vérifiez votre boîte de réception.')
        else if (failure.status === 400 || failure.status === 401) setError('Adresse e-mail ou mot de passe incorrect, ou adresse non confirmée.')
        else if (failure.status === 422) setError('Vérifiez votre adresse e-mail et choisissez un mot de passe d’au moins 8 caractères.')
        else if (failure.status === 429) setError('Trop de tentatives. Patientez un instant avant de réessayer.')
        else setError('Cette opération n’a pas abouti. Vérifiez vos informations et réessayez.')
      } else setError('Une erreur est survenue. Réessayez dans un instant.')
    } finally { setBusy(false) }
  }
  const title = { login: 'Retrouvez votre espace.', signup: 'Vos prochains déclics commencent ici.', forgot: 'Un nouveau départ.', reset: 'Choisissez un nouveau mot de passe.', invite: 'Bienvenue dans Clair.' }[mode]
  return <Modal title={mode === 'login' ? 'Connexion' : mode === 'signup' ? 'Créer mon compte' : 'Votre compte'} onClose={busy ? () => {} : onClose}>
    <div className="auth-intro"><div className="auth-symbol"><Sparkles size={26} /></div><h3>{title}</h3><p>Un espace personnel pour vos cours, vos fiches et vos questions. Adapté à la licence 2.</p></div>
    <form onSubmit={submit} className="stack-form">
      {mode === 'signup' && <label>Votre prénom<input autoComplete="given-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} placeholder="Comment vous appeler ?" /></label>}
      {mode !== 'reset' && mode !== 'invite' && <label>Adresse e-mail<div className="input-with-icon"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="vous@universite.fr" /></div></label>}
      {mode !== 'forgot' && <label>Mot de passe<div className="input-with-icon"><LockKeyhole size={17} /><input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? 1 : 8} value={password} onChange={(event) => setPassword(event.target.value)} required placeholder={mode === 'login' ? 'Votre mot de passe' : '8 caractères minimum'} /></div></label>}
      {mode === 'login' && <button type="button" className="text-button align-right" onClick={() => switchMode('forgot')}>Mot de passe oublié ?</button>}
      {error && <div className="error-message" role="alert">{error}</div>}
      {notice && <div className="success-message" role="status">{notice}</div>}
      <button className="button button-dark full-width" disabled={busy}>{busy ? 'Un instant…' : { login: 'Me connecter', signup: 'Créer mon espace', forgot: 'Recevoir un lien', reset: 'Enregistrer le mot de passe', invite: 'Activer mon compte' }[mode]}{!busy && <ArrowRight size={17} />}</button>
    </form>
    {mode !== 'reset' && mode !== 'invite' && <p className="auth-footer">{mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'} <button className="text-button" disabled={busy} onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Rejoindre Clair' : 'Se connecter'}</button></p>}
    <p className="privacy-caption"><LockKeyhole size={12} /> Vos documents restent dans votre espace privé.</p>
  </Modal>
}
