import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

// Demo login: one shared demo account so people can try Strux without Google.
// On by default only in local development; on a deployed site it stays off unless DEMO_LOGIN_ENABLED=true.
export const demoLoginEnabled =
  process.env.NODE_ENV !== "production" || process.env.DEMO_LOGIN_ENABLED === "true"
const DEMO_EMAIL = process.env.DEMO_LOGIN_EMAIL || "demo@strux.app"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    ...(demoLoginEnabled
      ? [
          Credentials({
            id: "demo",
            name: "Demo",
            credentials: {},
            // no password: everyone who uses it lands in the same demo workspace (never a real user's data,
            // because a user's data is keyed by their own email)
            authorize: async () => ({ id: "demo", name: "Demo User", email: DEMO_EMAIL }),
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.email) {
        token.sub = btoa(user.email)
          .replace(/[^a-zA-Z0-9]/g, "")
          .substring(0, 36)
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return `${baseUrl}/dashboard`
    }
  }
})

export const { GET, POST } = handlers
