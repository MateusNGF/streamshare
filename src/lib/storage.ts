import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

function checkConfig() {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Credenciais do Supabase não encontradas. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env");
    }
}

/**
 * Realiza o upload de um comprovante para o bucket "comprovantes" no Supabase Storage.
 * @param file O arquivo enviado pelo usuário (Blob / File / ArrayBuffer)
 * @param fileName O nome do arquivo original
 * @returns A URL pública da imagem recém-salva
 */
export async function uploadComprovante(file: File | Blob | ArrayBuffer, fileName: string): Promise<string> {
    checkConfig();
    const fileExt = fileName.split('.').pop() || 'tmp';
    const filePath = `comprovantes_streamshare/${uuidv4()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from("comprovantes_streamshare")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        console.error("Erro no upload para o Supabase Storage:", error);
        throw new Error(`Erro ao enviar comprovativo: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from("comprovantes_streamshare")
        .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
}
