import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Acessar Conta | StreamShare",
    description: "Entre ou crie sua conta no StreamShare para começar a economizar nas suas assinaturas.",
    robots: {
        index: true,
        follow: true,
    }
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center">
            {children}
        </div>
    );
}
