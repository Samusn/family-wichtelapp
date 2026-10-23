import { Link2 } from "lucide-react";
import Animation from "@components/ui/Animation";
import Card from "@components/ui/Card";
import Page from "@components/ui/Page";
import Title from "@components/ui/Title";

export default function IndexPage() {
  return (
    <Page className="items-center justify-center text-center">
      <Animation name="santa" className="w-56 h-56 -mb-6" />
      <Title className="text-6xl">Wichtel4family</Title>
      <p className="text-lg text-cream/80">Wichteln mit der ganzen Familie</p>
      <Card holly className="flex items-start gap-3 text-left">
        <Link2 className="w-5 h-5 shrink-0 mt-0.5 text-gold" aria-hidden />
        <p className="text-cream/80">
          Du hast einen persönlichen Link bekommen? Öffne ihn, um dein
          Wichtel-Los zu sehen und deinen Wunschkatalog auszufüllen.
        </p>
      </Card>
    </Page>
  );
}
