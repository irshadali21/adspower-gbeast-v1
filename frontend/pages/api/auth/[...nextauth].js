import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const user = res.data;

          if (user) {
            console.log(user);
            return {
              id: user.id,    // Ensure the user ID is included
              name: user.name, // Ensure name is included
              email: user.email, // Ensure email is included
              role: user.role,  // Ensure role is included
            };
          }
          return null;
        } catch (error) {
          console.error("Login error", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;  // Add name
        token.email = user.email; // Add email
        token.role = user.role;  // Add role
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;  // Pass name
      session.user.email = token.email; // Pass email
      session.user.role = token.role;  // Pass role
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});
