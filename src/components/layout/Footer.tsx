import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
    const appUrl = process.env.NEXT_PUBLIC_URL || "";

    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Image
                                src="/assets/logo-branca.jpg"
                                alt="StreamShare"
                                width={40}
                                height={40}
                                className="rounded-xl"
                            />
                            <span className="text-xl font-bold">StreamShare</span>
                        </div>
                        <p className="text-gray-400">Gestão inteligente de assinaturas compartilhadas</p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Produto</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <a href={`${appUrl}/#recursos`} className="hover:text-white">
                                    Recursos
                                </a>
                            </li>
                            <li>
                                <a href={`${appUrl}/#planos`} className="hover:text-white">
                                    Planos
                                </a>
                            </li>
                            <li>
                                <a href={`${appUrl}/#faq`} className="hover:text-white">
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <Link href={`${appUrl}/termos-de-uso`} className="hover:text-white">
                                    Termos de Uso
                                </Link>
                            </li>
                            <li>
                                <Link href={`${appUrl}/politica-de-privacidade`} className="hover:text-white">
                                    Política de Privacidade
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Suporte</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <Link href={`${appUrl}/status`} className="hover:text-white">
                                    Histórico de Atualizações
                                </Link>
                            </li>
                            <li>
                                <a href={`${appUrl}/#faq`} className="hover:text-white">
                                    Central de Ajuda
                                </a>
                            </li>
                            <li>
                                <a href="mailto:atendimento@streamshare.com.br" className="hover:text-white">
                                    Contato
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>


                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <p className="text-gray-400 text-sm">
                            © 2026 StreamShare. Todos os direitos reservados.
                        </p>
                        <p className="text-gray-500 text-[10px] max-w-md">
                            O StreamShare é uma plataforma independente e não possui vínculo oficial com os serviços de streaming mencionados. As marcas são propriedade de seus respectivos donos.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                            <Facebook size={20} />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                            <Twitter size={20} />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                            <Instagram size={20} />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                            <Linkedin size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
