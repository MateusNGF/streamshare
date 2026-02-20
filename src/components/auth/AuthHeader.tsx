import Image from "next/image";
import { AuthTab } from "@/hooks/useAuthParams";

interface AuthHeaderProps {
    activeTab: AuthTab;
    content: {
        login: { title: string; subtitle: string };
        signup: { title: string; subtitle: string };
    };
}

export function AuthHeader({ activeTab, content }: AuthHeaderProps) {
    return (
        <>
            {/* Logo Section */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center gap-3">
                    <Image
                        src="/assets/logo-branca.jpg"
                        alt="StreamShare Logo"
                        width={48}
                        height={48}
                        className="rounded-xl w-10 h-10 md:w-12 md:h-12"
                    />
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">StreamShare</span>
                </div>
            </div>

            {/* Dynamic Titles */}
            <div className="text-center mb-6 md:mb-8">
                <div className="relative h-16 overflow-hidden">
                    <div
                        className={`absolute inset-0 transition-all duration-500 flex flex-col items-center justify-center ${activeTab === "login"
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 -translate-y-8"
                            }`}
                    >
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                            {content.login.title}
                        </h1>
                        <p className="text-sm md:text-base text-gray-500">
                            {content.login.subtitle}
                        </p>
                    </div>
                    <div
                        className={`absolute inset-0 transition-all duration-500 flex flex-col items-center justify-center ${activeTab === "signup"
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-8"
                            }`}
                    >
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                            {content.signup.title}
                        </h1>
                        <p className="text-sm md:text-base text-gray-500">
                            {content.signup.subtitle}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
