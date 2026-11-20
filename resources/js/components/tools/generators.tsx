import Heading from '@/components/heading';
import NipGenerator from '@/components/tools/nip-generator';
import PeselGenerator from '@/components/tools/pesel-generator';

export default function Generators() {
    return (
        <div className="grid gap-12 lg:grid-cols-2">
            <section className="min-w-0">
                <Heading
                    title="PESEL"
                    description="Random numbers with a valid checksum"
                />
                <PeselGenerator />
            </section>
            <section className="min-w-0">
                <Heading
                    title="NIP"
                    description="Random numbers with a valid checksum. They almost never belong to a real company."
                />
                <NipGenerator />
            </section>
        </div>
    );
}
