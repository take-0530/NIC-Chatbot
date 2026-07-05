import { checkIsAdmin } from "@/lib/auth";
import KBContent from "./KBContent";

export default async function KBPage() {
  const isAdmin = await checkIsAdmin();
  return <KBContent isAdmin={isAdmin} />;
}
