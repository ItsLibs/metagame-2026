import aemilia from "../../../public/images/speakers/aemilia_dixon.jpg";
import amy from "../../../public/images/speakers/amy_schneider.jpg";
import andrew from "../../../public/images/speakers/andrew_nathenson.jpg";
import caro from "../../../public/images/speakers/caro_murphy.jpg";
import chris from "../../../public/images/speakers/chris_grace.jpg";
import chrisKay from "../../../public/images/speakers/chris_kay.jpg";
import david from "../../../public/images/speakers/david_turner.jpg";
import elli from "../../../public/images/speakers/elli_furedy.jpg";
import iris from "../../../public/images/speakers/iris_lemony.jpg";
import jamie from "../../../public/images/speakers/jamie_wahls.jpg";
import lexi from "../../../public/images/speakers/lexi_kohanski.jpg";
import marlee from "../../../public/images/speakers/marlee_honton.jpg";
import peihGee from "../../../public/images/speakers/peih_gee_law.jpg";
import randy from "../../../public/images/speakers/randy_lubin.jpg";
import raph from "../../../public/images/speakers/raph_damico.jpg";
import ricki from "../../../public/images/speakers/ricki_heicklen.jpg";
import spencer from "../../../public/images/speakers/spencer_beebe.jpg";
import tommy from "../../../public/images/team/tommy.jpg";
import alleycatLogo from "../../../public/images/speakers/logos/alleycat.png";
import candlecraftLogo from "../../../public/images/speakers/logos/candlecraft.png";
import cosmicEggLogo from "../../../public/images/speakers/logos/cosmic-egg.png";
import dropoutLogo from "../../../public/images/speakers/logos/dropout.png";
import laughingKaijuLogo from "../../../public/images/speakers/logos/laughing-kaiju.png";
import leveragedPlayLogo from "../../../public/images/speakers/logos/leveraged-play.png";
import repodLogo from "../../../public/images/speakers/logos/repod.png";
import semantleLogo from "../../../public/images/speakers/logos/semantle.png";
import shineOnLogo from "../../../public/images/speakers/logos/shine-on.png";
import spencerLogo from "../../../public/images/speakers/logos/spencer.png";
import tommyLogo from "../../../public/images/speakers/logos/tommy-honton.png";
import metagameLogo from "../../../public/images/logo_single.png";
import { HATS } from "@/v2/hat-trick/hats";
import type { Person } from "./team";

// Featured speakers, in display order on the home page. Logos are each
// site's favicon (public/images/speakers/logos), where it has a usable one.
export const SPEAKERS: Person[] = [
  {
    name: "Chris Grace",
    title: "Dropout",
    titleUrl: "https://dropout.fandom.com/wiki/Chris_Grace",
    photo: chris,
    logo: dropoutLogo,
  },
  {
    name: "Caro Murphy",
    title: "Cosmic Egg",
    titleUrl: "https://cosmice.gg/",
    photo: caro,
    logo: cosmicEggLogo,
  },
  {
    name: "Peih-Gee Law",
    title: "REPOD",
    titleUrl: "https://roomescapeartist.com/reality-escape-pod/",
    photo: peihGee,
    hats: [HATS.peihGee],
    logo: repodLogo,
  },
  {
    name: "Tommy Honton",
    title: "tommyhonton.com",
    titleUrl: "https://tommyhonton.com/",
    photo: tommy,
    logo: tommyLogo,
  },
  {
    name: "Lexi Kohanski",
    title: "Worlds to Come",
    titleUrl:
      "https://www.kickstarter.com/projects/kohanski/worlds-to-come?tab=prelaunch-story",
    photo: lexi,
  },
  {
    name: "Amy Schneider",
    title: "Jeopardy!",
    titleUrl: "https://en.wikipedia.org/wiki/Amy_Schneider",
    photo: amy,
  },
  {
    name: "Andrew Nathenson",
    title: "Cult of the Clocktower",
    titleUrl:
      "https://podcasts.apple.com/us/podcast/cult-of-the-clocktower/id1478486574",
    photo: andrew,
  },
  {
    name: "David Turner",
    title: "Semantle",
    titleUrl: "https://semantle.com/",
    photo: david,
    logo: semantleLogo,
  },
  {
    name: "Elli Furedy",
    title: "Alleycat Asset Acquisitions",
    titleUrl: "https://www.alleycat.agency/",
    photo: elli,
    hats: [HATS.elli],
    logo: alleycatLogo,
  },
  {
    name: "Raph D’Amico",
    title: "Laughing Kaiju",
    titleUrl: "https://laughingkaiju.com/about/",
    photo: raph,
    hats: [HATS.raph],
    logo: laughingKaijuLogo,
  },
  {
    name: "Randy Lubin",
    title: "Leveraged Play",
    titleUrl: "https://leveragedplay.com/",
    photo: randy,
    logo: leveragedPlayLogo,
  },
  {
    name: "Jamie Wahls",
    title: "jamiewahls.com",
    titleUrl: "https://jamiewahls.com/",
    photo: jamie,
  },
  {
    name: "Marlee Honton",
    title: "Shine On Collective",
    titleUrl: "https://www.shineoncollective.com/",
    photo: marlee,
    logo: shineOnLogo,
  },
  {
    name: "Aemilia Dixon",
    title: "The Treacherous Turn",
    titleUrl: "https://thetreacherousturn.ai/",
    photo: aemilia,
    hats: [HATS.aemilia],
  },
  {
    name: "iris lemony",
    title: "The Treacherous Turn",
    titleUrl: "https://thetreacherousturn.ai/",
    photo: iris,
  },
  {
    name: "Spencer Beebe",
    title: "spencerispuzzling.com",
    titleUrl: "https://www.spencerispuzzling.com/",
    photo: spencer,
    logo: spencerLogo,
  },
  {
    name: "Chris Kay",
    title: "Candlecraft Games",
    titleUrl: "https://candlecraftgames.com/",
    photo: chrisKay,
    logo: candlecraftLogo,
  },
  {
    name: "Ricki Heicklen",
    title: "Metagame",
    titleUrl: "/",
    photo: ricki,
    logo: metagameLogo,
  },
];
