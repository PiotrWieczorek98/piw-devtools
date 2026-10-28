import Heading from '@/components/heading';
import NipGenerator from '@/components/tools/nip-generator';
import PeselGenerator from '@/components/tools/pesel-generator';
import RealNips from '@/components/tools/real-nips';

export default function Identifiers() {
    return (
        <div className="space-y-12">
            <div className="grid gap-12 lg:grid-cols-2">
                <section>
                    <Heading
                        title="PESEL"
                        description="Random numbers with a valid checksum."
                    />
                    <PeselGenerator />
                </section>
                <section>
                    <Heading
                        title="NIP"
                        description="Random numbers with a valid checksum. They almost never belong to a real company."
                    />
                    <NipGenerator />
                </section>
            </div>
            <section>
                <Heading
                    title="Real company NIPs"
                    description="Existing companies, e.g. for testing against the REGON (BIR) API."
                />
                <RealNips />
            </section>
        </div>
    );
}
