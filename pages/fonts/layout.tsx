import { Poppins } from "next/font/google";
import Head from "next/head";


const poppins = Poppins({ weight: ["300", "400"], subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* ✅ Use Head for metadata */}
            <Head>
                <title>Nextjs Authentication</title>
                <meta name="description" content="Nextjs Authentication" />
            </Head>

            <div className={poppins.className}>{children}</div>
        </>
    );
} 
