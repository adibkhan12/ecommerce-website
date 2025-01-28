import Layout from '@/components/Layout';
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Home() {
    const { data: session, status } = useSession();
    console.log({ session });

    if (status === "loading") {
        return (
            <Layout>
                <div className="text-blue-900">Loading...</div>
            </Layout>
        );
    }

    if (!session) {
        return (
            <Layout>
                <div className="text-blue-900">
                    You are not logged in. Please log in to access your account.
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="text-blue-900 flex justify-between">
                <h2>
                    Hello, <b>{session?.user?.name}!</b>
                </h2>
                <div className="flex bg-gray-300 gap-1 text-black rounded-lg overflow-hidden">
                    <Image 
                        src={session?.user?.image || '/default-avatar.png'} 
                        alt="User Avatar" 
                        width={24} 
                        height={24} 
                        className="rounded-full"
                    />
                    <span className="px-2">
                        {session?.user?.name}
                    </span>
                </div>
            </div>
        </Layout>
    );
}
