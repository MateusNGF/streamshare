import { Bell, LucideIcon } from "lucide-react";

interface ComingSoonProps {
    title?: string;
    description?: string;
    icon?: LucideIcon;
    tags?: string[];
}

export function ComingSoon({
    title = "Em breve",
    description = "Estamos trabalhando nesta funcionalidade. Em breve você terá novidades!",
    icon: Icon = Bell,
    tags = []
}: ComingSoonProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="relative">
                <div className="w-32 h-32 bg-primary/5 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto ring-1 ring-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Icon size={56} strokeWidth={1.5} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full border-4 border-white animate-bounce shadow-lg" />
            </div>

            <div className="space-y-4 max-w-xl">
                <h3 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
                    {title}
                </h3>
                <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
                    {description}
                </p>
            </div>

            {tags.length > 0 && (
                <div className="pt-8 flex flex-wrap justify-center gap-4">
                    {tags.map((tag, index) => (
                        <div key={index} className="px-6 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 shadow-sm hover:border-primary/20 hover:text-primary transition-all cursor-default">
                            {tag}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
