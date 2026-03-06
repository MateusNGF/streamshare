import React from 'react';
import { Info, AlertTriangle, Lightbulb, AlertCircle } from 'lucide-react';
import { HeadingWithCopy } from './HeadingWithCopy';
import { Mermaid } from './Mermaid';

interface CalloutProps {
    tipo?: 'info' | 'aviso' | 'dica' | 'perigo';
    children: React.ReactNode;
}

const CalloutIcon = ({ tipo }: { tipo: CalloutProps['tipo'] }) => {
    switch (tipo) {
        case 'aviso': return <AlertTriangle className="w-5 h-5 flex-shrink-0" />;
        case 'dica': return <Lightbulb className="w-5 h-5 flex-shrink-0" />;
        case 'perigo': return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
        case 'info':
        default: return <Info className="w-5 h-5 flex-shrink-0" />;
    }
};

const getCalloutStyles = (tipo: CalloutProps['tipo']) => {
    switch (tipo) {
        case 'aviso': return 'bg-amber-50 text-amber-900 border-amber-200 [&>p]:text-amber-800';
        case 'dica': return 'bg-emerald-50 text-emerald-900 border-emerald-200 [&>p]:text-emerald-800';
        case 'perigo': return 'bg-red-50 text-red-900 border-red-200 [&>p]:text-red-800';
        case 'info':
        default: return 'bg-blue-50 text-blue-900 border-blue-200 [&>p]:text-blue-800';
    }
};

export const Callout = ({ children, tipo = 'info' }: CalloutProps) => (
    <div className={`p-4 rounded-xl my-6 border flex items-start gap-4 transition-colors ${getCalloutStyles(tipo)}`}>
        <div className="mt-0.5">
            <CalloutIcon tipo={tipo} />
        </div>
        <div className="flex-1 [&>p]:m-0">
            {children}
        </div>
    </div>
);

export const Steps = ({ children }: { children: React.ReactNode }) => (
    <div className="my-8 ml-4 border-l border-gray-200 space-y-6 lg:space-y-8 pl-8 relative [&>li]:list-none [counter-reset:step]">
        {children}
    </div>
);

export const StepItem = ({ children }: { children: React.ReactNode }) => (
    <div className="relative pb-1">
        <div className="absolute -left-12 flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 ring-8 ring-white">
            <span className="text-sm font-semibold text-violet-700 [counter-increment:step] content-[counter(step)]" />
        </div>
        {children}
    </div>
);

// MDX Components Mapping
export const mdxComponents = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-3xl font-bold mt-10 mb-6 text-gray-900 tracking-tight" {...props} />,
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <HeadingWithCopy level={2} className="text-2xl font-semibold mt-10 mb-4 text-gray-900 tracking-tight" {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <HeadingWithCopy level={3} className="text-xl font-medium mt-8 mb-3 text-gray-900" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-5 text-gray-600 leading-relaxed" {...props} />,
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-violet-600 hover:text-violet-800 hover:underline font-medium transition-colors" {...props} />,
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="mb-5 pl-8 list-disc text-gray-600 space-y-2" {...props} />,
    ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => {
        return <ol className="mb-5 pl-8 list-decimal text-gray-600 space-y-2 marker:text-gray-500 marker:font-medium" {...props} />;
    },
    li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="leading-relaxed" {...props} />,
    strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-semibold text-gray-900" {...props} />,
    blockquote: (props: React.HTMLAttributes<HTMLElement>) => <blockquote className="border-l-4 border-gray-200 pl-4 py-1 italic text-gray-600 my-6 bg-gray-50 rounded-r-lg" {...props} />,
    code: (props: React.HTMLAttributes<HTMLElement> & { className?: string; children?: React.ReactNode }) => {
        const isMermaid = props.className === 'language-mermaid';
        if (isMermaid) {
            return <Mermaid chart={String(props.children)} />;
        }
        const isInline = !props.className?.includes('language-');
        if (isInline) {
            return <code className="bg-gray-100 text-gray-800 rounded px-1.5 py-0.5 text-sm font-medium" {...props} />;
        }
        return <code {...props} />;
    },
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
        const isMermaid = React.isValidElement(props.children) &&
            (props.children.props as any)?.className === 'language-mermaid';

        if (isMermaid) {
            return <>{props.children}</>;
        }
        return (
            <pre className="mb-6 p-4 rounded-lg bg-gray-900 overflow-x-auto text-[13px] leading-relaxed text-gray-50 shadow-sm border border-transparent" {...props} />
        );
    },
    hr: (props: React.HTMLAttributes<HTMLHRElement>) => <hr className="my-10 border-gray-200" {...props} />,
    Callout,
    Steps,
    StepItem,
};
