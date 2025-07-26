import NextAuth from "next-auth";
import { auth } from "@/lib/auth";
import { config } from "@/lib/auth";

const handler = NextAuth(config);

export { handler as GET, handler as POST };



