import NextAuth, { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { mongooseConnect } from "@/lib/mongoose";
import { Admin } from "@/models/Admin";

async function isAdminEmail(email) {
    await mongooseConnect();  // Ensure connection before querying
    return !!(await Admin.findOne({ email }));
}

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async session({ session, token, user }) {
            await mongooseConnect();
            if (await isAdminEmail(session?.user?.email)) {
                return session;
            } else {
                return null; // Return null instead of false to prevent auth issues
            }
        }
    }
}

export default NextAuth(authOptions);

export async function isAdminRequest(req, res) {
    await mongooseConnect();
    const session = await getServerSession(req, res, authOptions);

    if (!session || !(await isAdminEmail(session?.user?.email))) {
        res.status(401).json({ error: "Not an admin" });
        return;
    }
}
