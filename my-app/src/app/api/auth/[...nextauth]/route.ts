import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Your login logic here
        if (credentials?.email === 'user@example.com' && credentials?.password === 'password') {
          return { id: '1', email: 'user@example.com', name: 'User' }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})

export { handler as GET, handler as POST }