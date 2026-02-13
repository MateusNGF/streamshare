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
        <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-xl shadow-primary/5 border border-primary/10 max-w-lg w-full text-center space-y-6">
                <div className="w-24 h-24 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto ring-8 ring-primary/5">
                    <Icon size={48} />
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {title}
                    </h3>
                    <p className="text-gray-500 text-lg leading-relaxed">
                        {description}
                    </p>
                </div>

                {tags.length > 0 && (
                    <div className="pt-4 flex flex-wrap justify-center gap-3">
                        {tags.map((tag, index) => (
                            <div key={index} className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-500 border border-gray-100">
                                {tag}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
