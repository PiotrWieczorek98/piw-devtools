import Heading from '@/components/heading';
import PostalCodes from '@/components/tools/postal-codes';
import RealNips from '@/components/tools/real-nips';

export default function Reference() {
    return (
        <div className="grid gap-12 lg:grid-cols-2">
            <section className="min-w-0">
                <Heading
                    title="Real company NIPs"
                    description="Existing companies, for testing against the REGON (BIR) API"
                />
                <RealNips />
            </section>
            <section className="min-w-0">
                <Heading
                    title="Postal codes"
                    description="Real codes with the city they belong to"
                />
                <PostalCodes />
            </section>
        </div>
    );
}
