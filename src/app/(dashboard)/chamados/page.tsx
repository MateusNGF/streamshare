import { ChamadosClient } from "./ChamadosClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Suporte | Chamados",
    description: "Consulte a Central de Ajuda ou abra um chamado para a equipa de suporte do StreamShare.",
};

export default function ChamadosPage() {
    return <ChamadosClient />;
}
