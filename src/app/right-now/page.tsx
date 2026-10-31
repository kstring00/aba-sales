import { HubPage, hubMetadata } from "@/components/hub/HubPage";

export const dynamic = "force-static";
export const generateMetadata = () => hubMetadata("pages/right-now");

export default function Page() {
  return <HubPage slug="pages/right-now" />;
}
