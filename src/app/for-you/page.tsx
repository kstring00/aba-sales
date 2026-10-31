import { HubPage, hubMetadata } from "@/components/hub/HubPage";

export const dynamic = "force-static";
export const generateMetadata = () => hubMetadata("pages/for-you");

export default function Page() {
  return <HubPage slug="pages/for-you" />;
}
