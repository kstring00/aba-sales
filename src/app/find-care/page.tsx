import { HubPage, hubMetadata } from "@/components/hub/HubPage";

export const dynamic = "force-static";
export const generateMetadata = () => hubMetadata("pages/find-care");

export default function Page() {
  return <HubPage slug="pages/find-care" />;
}
