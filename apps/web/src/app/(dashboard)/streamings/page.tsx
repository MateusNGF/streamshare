import { getStreamings } from "@/actions/streamings";
import { StreamingsClient } from "@/components/streamings/StreamingsClient";

export default async function StreamingsPage() {
    const streamings = await getStreamings();

    const serializedStreamings = streamings.map(s => ({
        ...s,
        valorIntegral: Number(s.valorIntegral)
    }));

    return <StreamingsClient initialData={serializedStreamings} />;
}
