import { HubPage, hubMetadata } from "@/components/hub/HubPage";

export const dynamic = "force-static";
export const generateMetadata = () => hubMetadata("pages/learn");

export default function Page() {
  return <HubPage slug="pages/learn" />;
}
