import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-helpers";
import { redirect } from "next/navigation";
import { PublicProfileForm } from "@/components/settings/public-profile-form";

export default async function PublicProfilePage() {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, username: true },
  });

  if (user?.plan !== "pro") {
    redirect("/pricing");
  }

  const profile = await prisma.publicProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Perfil público</h1>
        <p className="text-gray-500 text-sm mt-1">
          Seu perfil público é acessível em{" "}
          <a
            href={`/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:underline font-mono"
          >
            /{user.username}
          </a>
          {" "}e permite que clientes solicitem pré-orçamentos.
        </p>
      </div>

      <PublicProfileForm
        initialData={{
          bio: profile?.bio ?? "",
          city: profile?.city ?? "",
          serviceArea: profile?.serviceArea ?? "",
          whatsapp: profile?.whatsapp ?? "",
          instagram: profile?.instagram ?? "",
        }}
        username={user.username}
      />
    </div>
  );
}
