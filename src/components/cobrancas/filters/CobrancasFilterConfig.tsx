import { FilterConfig } from "@/components/ui/GenericFilter";
import { StreamingLogo } from "@/components/ui/StreamingLogo";

interface GetCobrancasFilterConfigProps {
    participantes: any[];
    streamings: any[];
    monthOptions: { label: string; value: string }[];
}

export function getCobrancasFilterConfig({
    participantes,
    streamings,
    monthOptions
}: GetCobrancasFilterConfigProps): FilterConfig[] {
    return [
        {
            key: "search",
            type: "text",
            placeholder: "Buscar...",
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
                { label: "Pendente", value: "pendente" },
                { label: "Aguardando", value: "aguardando_aprovacao" },
                { label: "Pago", value: "pago" },
                { label: "Atrasado", value: "atrasado" }
            ]
        },
        {
            key: "mesReferencia",
            type: "select",
            label: "Período",
            className: "w-full md:w-[200px]",
            options: monthOptions
        },
        {
            key: "streaming",
            type: "select",
            label: "Streaming",
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
            key: "vencimento",
            type: "dateRange",
            label: "Vencimento",
            placeholder: "Filtrar por data"
        },
        {
            key: "pagamento",
            type: "dateRange",
            label: "Data de Pagamento",
            placeholder: "Filtrar pagamento"
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
