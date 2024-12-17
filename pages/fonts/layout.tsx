import type {Metadata} from "next";
import {Poppins } from "next/font/google"
import "./style/global.css";
import {create} from "node:domain";
import {ReactNode} from "react";

const poppins =Poppins({weight: ["300","400","400"], subsets:["latin"]});

export const metadata: Metadata = {
    title: "Nextjs Authentication",
    description:"Nextjs Authentication",
};

export default function Rootlayout({
    children,
}:Readonly<{
    children: React.ReactNode;
}>){
    return (
        <html lang="en">
        <body className={poppins.className}>{children}</body>
        </html>
    );
}
