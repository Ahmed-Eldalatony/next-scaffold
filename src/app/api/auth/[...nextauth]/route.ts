import NextAuth from "next-auth";
import { auth } from "@/lib/auth"; // your providers

const handler = NextAuth(auth);

export { handler as GET, handler as POST };



