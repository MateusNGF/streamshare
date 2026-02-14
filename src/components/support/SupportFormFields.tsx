"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { SuporteInput } from "@/actions/suporte";

interface SupportFormFieldsProps {
    formData: SuporteInput;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    isPending: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export function SupportFormFields({ formData, onChange, isPending, onSubmit }: SupportFormFieldsProps) {
    return (
        <form id="support-form" onSubmit={onSubmit} className="space-y-4">
            <Input
                label="Seu Nome"
                name="nome"
                placeholder="Como você gostaria de ser chamado?"
                value={formData.nome}
                onChange={onChange}
                required
                disabled={isPending}
            />

            <Input
                label="E-mail de Contato"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={onChange}
                required
                disabled={isPending}
            />

            <Input
                label="Assunto"
                name="assunto"
                placeholder="Sobre o que é o contato?"
                value={formData.assunto}
                onChange={onChange}
                required
                disabled={isPending}
            />

            <Textarea
                label="Descrição Detalhada (Mín. 50 caracteres)"
                name="descricao"
                placeholder={`Descreva o que aconteceu detalhadamente.

Exemplo ideal:
"Ao tentar aceitar o convite da assinatura Netflix, cliquei no botão 'Aceitar' e nada aconteceu.
Tentei atualizar a página, mas o problema persistiu.
Erro exibido: 'Falha ao processar a solicitação'."`}
                value={formData.descricao}
                onChange={onChange}
                required
                minLength={50}
                disabled={isPending}
                className="min-h-[250px]"
            />
        </form>
    );
}
