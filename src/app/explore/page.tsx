import { exploreService } from "@/services/explore-service";
import { ExploreView } from "@/components/explore/explore-view";

export const dynamic = 'force-dynamic'; // Ensure we always fetch fresh data

export default async function ExplorePage() {
    const streamings = await exploreService.getAvailableSlots();

    return <ExploreView initialStreamings={streamings} />;
}
