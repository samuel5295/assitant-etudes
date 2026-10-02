import type { StudyDocument, StudyNote } from './types'

export const demoDocuments: StudyDocument[] = [
  { id: 'demo-1', title: 'Suites et séries numériques', subject: 'Analyse', kind: 'course', filename: 'chapitre-3-suites.pdf', mimeType: 'application/pdf', size: 1250000, favorite: true, createdAt: '2026-10-01T14:00:00Z' },
  { id: 'demo-2', title: 'Espaces vectoriels et applications', subject: 'Algèbre', kind: 'course', filename: 'espaces-vectoriels.pdf', mimeType: 'application/pdf', size: 830000, favorite: false, createdAt: '2026-10-01T10:00:00Z' },
  { id: 'demo-3', title: 'TD 4 · Calcul intégral', subject: 'Analyse', kind: 'td', filename: 'td-4-integrales.pdf', mimeType: 'application/pdf', size: 460000, favorite: true, createdAt: '2026-09-30T13:00:00Z' },
  { id: 'demo-4', title: 'Les bases de la thermodynamique', subject: 'Physique', kind: 'course', filename: 'thermodynamique.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1950000, favorite: false, createdAt: '2026-09-29T11:00:00Z' },
  { id: 'demo-5', title: 'Structures de données', subject: 'Informatique', kind: 'course', filename: 'structures-de-donnees.pdf', mimeType: 'application/pdf', size: 740000, favorite: false, createdAt: '2026-09-28T15:00:00Z' },
  { id: 'demo-6', title: 'TD 2 · Variables aléatoires', subject: 'Probabilités', kind: 'td', filename: 'td-2-probabilites.jpg', mimeType: 'image/jpeg', size: 1100000, favorite: false, createdAt: '2026-09-27T09:00:00Z' },
]

export const demoNotes: StudyNote[] = [
  { id: 'example-note-1', documentId: 'demo-1', title: 'Résumé · Suites et séries numériques', kind: 'summary', prompt: null, createdAt: '2026-10-01T15:00:00Z', content: '## Une suite, une série : quelle différence ?\nUne **suite** est une liste ordonnée de nombres $(u_n)$. Une **série** s’intéresse à la somme de ces nombres.\n\n### La notion essentielle\nLa série $\\sum u_n$ converge si la suite des sommes partielles $S_n = \\sum_{k=0}^{n} u_k$ admet une limite finie.\n\n### Un exemple concret\nLa série géométrique $\\sum_{n=0}^{\\infty} (1/2)^n$ converge vers **2**. Chaque terme est deux fois plus petit que le précédent.\n\n### Le piège à éviter\n$u_n \\to 0$ est une condition nécessaire, mais **pas suffisante** pour que la série converge. La série harmonique $\\sum_{n=1}^{\\infty} 1/n$ en est le contre-exemple.\n\n### À vous de jouer\nPourquoi une série dont les termes ne tendent pas vers zéro ne peut-elle pas converger ?\n\n*Cette fiche est un exemple de présentation, pas l’analyse d’un document importé.*' },
  { id: 'example-note-2', documentId: 'demo-2', title: 'Résumé · Espaces vectoriels', kind: 'summary', prompt: null, createdAt: '2026-09-30T15:00:00Z', content: '## Comprendre un espace vectoriel\nUn espace vectoriel est un ensemble dans lequel on peut **additionner des vecteurs** et les **multiplier par un scalaire**, en respectant les axiomes habituels.\n\n### L’idée à retenir\nUne **base** est une famille libre qui engendre l’espace : chaque vecteur s’écrit de façon unique comme combinaison linéaire des vecteurs de la base.\n\n### Un exemple\nDans $\\mathbb{R}^2$, les vecteurs $(1,0)$ et $(0,1)$ forment la base canonique. Ainsi $(3,2) = 3(1,0) + 2(0,1)$.\n\n*Cette fiche est un exemple de présentation.*' },
]

export function subjectTheme(subject: string): string {
  const text = subject.toLowerCase()
  if (text.includes('anal') || text.includes('math')) return 'mint'
  if (text.includes('alg') || text.includes('info')) return 'lavender'
  if (text.includes('phys') || text.includes('chim')) return 'peach'
  if (text.includes('prob') || text.includes('éco')) return 'blue'
  const sum = [...text].reduce((total, character) => total + character.charCodeAt(0), 0)
  return ['mint', 'lavender', 'peach', 'blue'][sum % 4]
}

export function fileSize(size: number): string {
  return size >= 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo` : `${Math.max(1, Math.round(size / 1024))} Ko`
}
