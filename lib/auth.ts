import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "./mongodb"
import bcrypt from "bcryptjs"
import { MongoClient } from "mongodb"

const getUsersCollection = async () => {
  const client = (await clientPromise) as MongoClient
  const db = client.db(process.env.MONGODB_DB)
  return db.collection("users")
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const users = await getUsersCollection()
        const user = await users.findOne<{ _id: any; name?: string; email: string; password: string; role?: string }>({
          email: credentials.email.toLowerCase(),
        })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return {
          id: String(user._id),
          name: user.name || user.email,
          email: user.email,
          role: user.role || "patient",
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).role = (user as any).role || "patient"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = (token as any).role || "patient"
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
