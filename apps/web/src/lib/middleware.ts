import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function withAuth(
    handler: (req: NextRequest, user: { userId: number; email: string }) => Promise<NextResponse>
) {
    return async (req: NextRequest) => {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }

        return handler(req, user);
    };
}
