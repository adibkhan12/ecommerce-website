// pages/api/auth/[...nextauth].js
import NextAuth, { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { mongooseConnect } from "@/lib/mongoose";
import { Admin } from "@/models/Admin";

async function isAdminEmail(email) {
    if (!email) return false;
    await mongooseConnect();
    // Convert to lowercase so it matches DB
    const emailLower = email.toLowerCase();
    return !!(await Admin.findOne({ email: emailLower }));
}

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        // 1) Block sign-in if not in Admin DB
        async signIn({ user }) {
            const allowed = await isAdminEmail(user.email);
            return allowed; // false => "Access Denied"
        },

        // 2) Always return a valid session object if signIn passed
        async session({ session }) {
            // By this point, user is guaranteed admin, so you can set a flag
            session.isAdmin = true;
            return session;
        },
    },
};

export default NextAuth(authOptions);

export async function isAdminRequest(req, res) {
    await mongooseConnect();
    const session = await getServerSession(req, res, authOptions);

    // Make sure session and email exist, then check if it's admin
    if (!session?.user?.email || !(await isAdminEmail(session.user.email))) {
        res.status(401).json({ error: "Not an admin" });
        return;
    }
}
