"use client";

import { ReactNode, useState, useEffect, Suspense } from "react";
import { LucideIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

export interface TabItem {
    id: string;
    label: string;
    icon?: LucideIcon;
    content: ReactNode;
}

interface TabsProps {
    tabs: TabItem[];
    defaultTab?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}

function TabsContent({ tabs, defaultTab, value, onValueChange }: TabsProps) {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");

    const [internalActiveTab, setInternalActiveTab] = useState(tabParam || defaultTab || tabs[0]?.id);

    useEffect(() => {
        if (tabParam && tabs.find(t => t.id === tabParam)) {
            setInternalActiveTab(tabParam);
        }
    }, [tabParam, tabs]);

    const activeTab = value !== undefined ? value : internalActiveTab;

    const handleTabChange = (tabId: string) => {
        if (onValueChange) {
            onValueChange(tabId);
        }
        if (value === undefined) {
            setInternalActiveTab(tabId);
        }
    };

    const activeTabData = tabs.find((tab) => tab.id === activeTab);

    return (
        <div className="w-full">
            {/* Tab Headers */}
            <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-3 font-bold text-sm md:text-base
                                border-b-2 transition-all whitespace-nowrap
                                ${isActive
                                    ? "border-primary text-primary"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }
                            `}
                        >
                            {Icon && <Icon size={18} />}
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-left-4 duration-500" key={activeTab}>
                {activeTabData?.content}
            </div>
        </div>
    );
}

export function Tabs(props: TabsProps) {
    return (
        <Suspense fallback={<div className="w-full h-32 animate-pulse bg-gray-100 rounded-2xl" />}>
            <TabsContent {...props} />
        </Suspense>
    );
}
