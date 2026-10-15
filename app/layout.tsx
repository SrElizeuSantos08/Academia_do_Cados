import type { Metadata } from 'next';
export const metadata:Metadata={title:'Academia do Caos',description:'Formação em cibersegurança, cursos e comunidade.',icons:{icon:'/assets/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
