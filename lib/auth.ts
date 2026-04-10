import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      // This provider handles email + password login
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // This function runs when someone tries to log in
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        await connectDB()

        // Find the user in MongoDB by email (cast to string to prevent NoSQL injection)
        const user = await User.findOne({ email: String(credentials.email).toLowerCase().trim() }).select('+password')

        if (!user) {
          throw new Error('Invalid email or password')
        }

        if (!user.password) {
          throw new Error('Please log in with Google')
        }

        // Compare the password they typed with the hashed one in the DB
        // bcrypt.compare returns true if they match
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) {
          throw new Error('Invalid email or password')
        }

        // Return the user object — NextAuth stores this in the session
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
    // This runs after login and adds extra data to the session token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.plan = (user as any).plan
      }
      return token
    },
    // This makes the extra data available in useSession()
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.plan = token.plan as string
      }
      return session
    },
  },

  pages: {
    signIn: '/auth/login', // redirect to our custom login page
    error: '/auth/login',  // redirect errors to login page too
  },

  session: {
    strategy: 'jwt', // store sessions in JWT tokens, not the database
  },

  secret: process.env.NEXTAUTH_SECRET,
})