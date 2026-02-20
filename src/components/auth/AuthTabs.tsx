import { AuthTab } from "@/hooks/useAuthParams";

interface AuthTabsProps {
    activeTab: AuthTab;
    setActiveTab: (tab: AuthTab) => void;
}

export function AuthTabs({ activeTab, setActiveTab }: AuthTabsProps) {
    return (
        <div className="flex p-1 bg-gray-100/80 rounded-2xl mb-6 md:mb-8 relative">
            <div
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${activeTab === "login" ? "left-1" : "left-[calc(50%+2px)]"
                    }`}
            />
            <button
                onClick={() => setActiveTab("login")}
                className={`relative flex-1 py-3 text-sm font-bold transition-colors z-10 ${activeTab === "login" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                    }`}
            >
                Entrar
            </button>
            <button
                onClick={() => setActiveTab("signup")}
                className={`relative flex-1 py-3 text-sm font-bold transition-colors z-10 ${activeTab === "signup" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                    }`}
            >
                Criar conta
            </button>
        </div>
    );
}
