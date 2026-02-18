import PlanCheckoutClient from "@/components/checkout/PlanCheckoutClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function CheckoutStartPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <PlanCheckoutClient />
        </Suspense>
    );
}
