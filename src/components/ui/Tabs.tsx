"use client";

import { ReactNode, useState } from "react";
import { LucideIcon } from "lucide-react";

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

export function Tabs({ tabs, defaultTab, value, onValueChange }: TabsProps) {
    const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id);

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
            <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-3 font-semibold text-sm md:text-base
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
            <div className="animate-fade-in slide-in-from-left duration-300" key={activeTab}>
                {activeTabData?.content}
            </div>
        </div>
    );
}
