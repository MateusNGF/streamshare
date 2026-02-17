-- 1. Remover o valor padrão da coluna cpf (impede que novos registros herdem "")
ALTER TABLE "participante" ALTER COLUMN "cpf" DROP DEFAULT;

-- 2. Converter CPFs vazios em NULL para limpar colisões de restrição UNIQUE
UPDATE "participante" SET "cpf" = NULL WHERE "cpf" = '';

-- 3. (Opcional) Converter números de WhatsApp vazios em NULL por precaução
UPDATE "participante" SET "whatsappNumero" = NULL WHERE "whatsappNumero" = '';