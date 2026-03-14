import { FilterConfig } from "@/components/ui/GenericFilter";
import { StreamingLogo } from "@/components/ui/StreamingLogo";

interface GetAssinaturasFilterConfigProps {
    participantes: any[];
    streamings: any[];
}

export function getAssinaturasFilterConfig({
    participantes,
    streamings
}: GetAssinaturasFilterConfigProps): FilterConfig[] {
    return [
        {
            key: "search",
            type: "text",
            placeholder: "Buscar participante...",
            className: "flex-1 min-w-[200px]"
        },
        {
            key: "participante",
            type: "select",
            label: "Participante",
            emptyLabel: "Todos",
            className: "w-full md:w-[200px]",
            options: participantes.map(p => ({
                label: p.nome,
                value: p.id.toString()
            }))
        },
        {
            key: "status",
            type: "select",
            label: "Status",
            className: "w-full md:w-[150px]",
            options: [
                { label: "Ativas", value: "ativa" },
                { label: "Suspensas", value: "suspensa" },
                { label: "Canceladas", value: "cancelada" }
            ]
        },
        {
            key: "streaming",
            type: "select",
            label: "Streaming",
            emptyLabel: "Todos",
            className: "w-full md:w-[200px]",
            options: streamings.map(s => ({
                label: s.apelido || s.catalogo.nome,
                value: s.id.toString(),
                iconNode: (
                    <StreamingLogo
                        name={s.apelido || s.catalogo.nome}
                        iconeUrl={s.catalogo.iconeUrl}
                        color={s.catalogo.corPrimaria || "#ccc"}
                        size="xs"
                        rounded="md"
                    />
                )
            }))
        },
        {
            key: "criacao",
            type: "dateRange",
            label: "Data de Início",
            placeholder: "Filtrar por data"
        },
        {
            key: "vencimento",
            type: "dateRange",
            label: "Data de Vencimento",
            placeholder: "Filtrar por vencimento"
        },
        {
            key: "valor",
            type: "numberRange",
            label: "Intervalo de Valor",
            placeholder: "Valor entre..."
        },
        {
            key: "hasWhatsapp",
            type: "switch",
            label: "Apenas com WhatsApp",
            className: "md:w-auto"
        }
    ];
}
