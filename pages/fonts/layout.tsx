import { Poppins } from "next/font/google";
import Head from "next/head";
import "./style/global.css";

const poppins = Poppins({ weight: ["300", "400"], subsets: ["latin"] });

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            {/* Use Head for metadata */}
            <Head>
                <title>Nextjs Authentication</title>
                <meta name="description" content="Nextjs Authentication" />
            </Head>

            <html lang="en">
            <body className={poppins.className}>{children}</body>
            </html>
        </>
    );
}
