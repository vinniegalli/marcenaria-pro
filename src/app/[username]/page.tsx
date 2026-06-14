import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Hammer, MapPin, MessageSquare, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CarpenterPublicProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      phone: true,
      plan: true,
      publicProfile: true,
    },
  });

  if (!user) notFound();

  const profile = user.publicProfile;
  const acceptingRequests = user.plan === "pro";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-amber-500 rounded-lg p-1.5">
            <Hammer className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm text-gray-900">MarcenariaPro</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Perfil */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="bg-amber-500 h-24" />
          <div className="px-6 pb-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-4 border-white -mt-8 flex items-center justify-center mb-3">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-amber-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">Marceneiro</p>

            {profile?.city && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {profile.city}
              </div>
            )}

            {profile?.bio && (
              <p className="mt-4 text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
            )}

            {profile?.serviceArea && (
              <div className="mt-3 text-sm text-gray-500">
                <span className="font-medium text-gray-700">Área de atendimento: </span>
                {profile.serviceArea}
              </div>
            )}

            <div className="flex items-center gap-3 mt-5 flex-wrap">
              {acceptingRequests ? (
                <Link href={`/${username}/solicitar`}>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Solicitar pré-orçamento
                  </Button>
                </Link>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Este marceneiro não está recebendo solicitações no momento.
                </p>
              )}

              {profile?.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  <AtSign className="h-4 w-4" />
                  {profile.instagram}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Contato */}
        {user.phone && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Contato</h2>
            <a
              href={`https://wa.me/55${user.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {user.phone}
            </a>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 pb-4">
          <p>Perfil gerado por MarcenariaPro</p>
        </div>
      </main>
    </div>
  );
}
