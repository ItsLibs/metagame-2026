import type { StaticImageData } from "next/image";
import { HATS, type Hat } from "@/v2/hat-trick/hats";
import { TEAM_ACCOUNTS } from "./team-accounts";
import ben from "../../../public/images/team/ben.jpg";
import brendan from "../../../public/images/team/brendan.jpg";
import brian from "../../../public/images/team/brian.jpg";
import damon from "../../../public/images/team/damon.jpg";
import davidHolt from "../../../public/images/team/david_holt.jpg";
import jisk from "../../../public/images/team/jisk.jpg";
import john from "../../../public/images/team/john_bromels.jpg";
import kai from "../../../public/images/team/kai.jpg";
import michael from "../../../public/images/team/michael_sheely.jpg";
import patrick from "../../../public/images/team/patrick.jpg";
import ricki from "../../../public/images/team/ricki.jpg";
import sparr from "../../../public/images/team/sparr.jpg";
import tommy from "../../../public/images/team/tommy.jpg";
import yemima from "../../../public/images/team/yemima.jpg";

// The people running the con (TEAM) and the advisors (ADVISORS), shown on
// /team in display order. TeamCarousel also reads TEAM but isn't mounted
// anywhere right now. To add someone: add an entry and import their photo from
// public/images/team/ (800px JPEGs). Omit `photo` for an initials placeholder,
// `contactKey` if they'd rather not be contacted directly. Spread their entry
// from team-accounts.ts in for the name and account id, so their card can wear
// the Megagame faction they've joined.
export type Person = {
  name: string;
  // Their account (team-accounts.ts, speaker-accounts.ts), for the Megagame
  // faction medals on their card. Speakers always have one.
  userId?: string;
  title: string;
  // When set, the title renders as a link (speaker bylines).
  titleUrl?: string;
  photo?: StaticImageData;
  // Contactable through the site form. The address isn't here (this repo is
  // public): it's the server-only env var CONTACT_EMAIL_<CONTACTKEY>.
  contactKey?: string;
  // Hat Trick: hats hidden in this photo (see src/v2/hat-trick).
  hats?: Hat[];
};

export const TEAM: Person[] = [
  {
    ...TEAM_ACCOUNTS.rickiHeicklen,
    title: "Game and Conference Master",
    photo: ricki,
    contactKey: "ricki",
  },
  {
    ...TEAM_ACCOUNTS.benKarcher,
    title: "Chief of Staff",
    photo: ben,
    contactKey: "ben",
  },
  {
    ...TEAM_ACCOUNTS.brianSmiley,
    title: "Operations Lead",
    photo: brian,
    contactKey: "brian",
  },
  {
    ...TEAM_ACCOUNTS.yemimaMorris,
    title: "Volunteer Coordinator",
    photo: yemima,
    contactKey: "yemima",
  },
  { ...TEAM_ACCOUNTS.johnBromels, title: "Megagame Lead", photo: john },
  {
    ...TEAM_ACCOUNTS.jiskKopczynski,
    title: "Megagame Chief of Staff",
    photo: jisk,
    hats: [HATS.pirate],
  },
  {
    ...TEAM_ACCOUNTS.davidHolt,
    title: "Marketing & Sponsorships",
    photo: davidHolt,
    contactKey: "david",
  },
  { ...TEAM_ACCOUNTS.sparrRisher, title: "Generalist", photo: sparr },
  { ...TEAM_ACCOUNTS.kaiGeffen, title: "Generalist", photo: kai },
  { ...TEAM_ACCOUNTS.michaelSheely, title: "Generalist", photo: michael },
  {
    ...TEAM_ACCOUNTS.damonPourtahmasebSasi,
    title: "Community Health Liaison",
    photo: damon,
    contactKey: "damon",
  },
];

export const ADVISORS: Person[] = [
  {
    ...TEAM_ACCOUNTS.brendanHurst,
    title: "Advisor",
    photo: brendan,
    hats: [HATS.sequin],
  },
  { ...TEAM_ACCOUNTS.tommyHonton, title: "Advisor", photo: tommy },
  { ...TEAM_ACCOUNTS.patrickMcKenzie, title: "Advisor", photo: patrick },
];
