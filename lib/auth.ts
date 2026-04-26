import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        await connectDB()

        const user = await User.findOne({ email: credentials.email })

        if (!user) {
          throw new Error('No account found with that email')
        }

        if (!user.password) {
          throw new Error('Please log in with Google')
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) {
          throw new Error('Incorrect password')
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          plan: user.plan,
        }
      },
    }),
  ],

  callbacks: {
    // Auto-create a MongoDB user on first Google sign-in
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectDB()
          const existing = await User.findOne({ email: profile?.email })
          if (!existing) {
            await User.create({
              name: profile?.name,
              email: profile?.email,
              // no password field — Google users log in via OAuth only
            })
          }
          return true
        } catch {
          return false
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      // On credentials login — user object has our MongoDB ID already
      if (user && account?.provider === 'credentials') {
        token.id = user.id
        token.plan = (user as any).plan
      }

      // On Google login — look up the MongoDB user by email to get our ID + plan
      if (account?.provider === 'google' && token.email) {
        try {
          await connectDB()
          const dbUser = await User.findOne({ email: token.email })
          if (dbUser) {
            token.id = dbUser._id.toString()
            token.plan = dbUser.plan
          }
        } catch { /* non-fatal */ }
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.plan = token.plan as string
      }
      return session
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
})
