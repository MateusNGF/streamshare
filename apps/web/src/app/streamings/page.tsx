import { getStreamings } from "@/actions/streamings";
import { StreamingsClient } from "@/components/streamings/StreamingsClient";

export default async function StreamingsPage() {
    const streamings = await getStreamings();

    return <StreamingsClient initialData={streamings} />;
}
