-- CreateIndex
CREATE INDEX "convite_usuarioId_idx" ON "convite"("usuarioId");

-- CreateIndex
CREATE INDEX "convite_contaId_status_idx" ON "convite"("contaId", "status");
