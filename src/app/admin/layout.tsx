import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Verificar autenticação
    const session = await getCurrentUser();
    if (!session) {
        redirect("/login");
    }

    // 2. Verificar se o usuário é Administrador do Sistema
    const adminUser = await prisma.usuarioAdmin.findFirst({
        where: {
            usuarioId: session.userId,
            isAtivo: true
        }
    });

    // 3. Verificar permissão
    if (!adminUser) {
        redirect("/dashboard?error=unauthorized");
    }

    return (
        <div className="flex min-h-screen w-full bg-gray-50">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto h-screen">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
