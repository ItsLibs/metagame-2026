// Each team member's and advisor's account: the `user.id` whose Megagame
// faction pick their /team card wears (the pick is public already, at
// /u/<id>), and their name. TEAM and ADVISORS (team.ts) spread these in; the
// dev seed (scripts/db-seed.mjs) creates an account for each, so it imports
// this file untranspiled: keep it to plain data. TODO ids are placeholders
// until the prod id is filled in; cards with one stay bare.
import { SPEAKER_ACCOUNTS } from "./speaker-accounts";

export const TEAM_ACCOUNTS = {
  // Also a featured speaker: one account, one id.
  rickiHeicklen: SPEAKER_ACCOUNTS.rickiHeicklen,
  benKarcher: {
    name: "Ben Karcher",
    userId: "QGd9pINtpWtkTL0bYfkWT7o4WQXsCubC",
  },
  brianSmiley: {
    name: "Brian Smiley",
    userId: "CxGj5KdqDTmaKbMgCekkOrG4YnMtorGO",
  },
  yemimaMorris: {
    name: "Yemima Morris",
    userId: "C28SeLW7OWtQIoEJBDP3VmaRi8XNQzdB",
  },
  johnBromels: {
    name: "John Bromels",
    userId: "fLuYCWu3qXsonu9Td64WKlEf1FjNgBiF",
  },
  jiskKopczynski: {
    name: "Jisk Kopczynski",
    userId: "BdN2llsh1gbsDaWzLYcz23bcGn9hJPwL",
  },
  davidHolt: {
    name: "David Holt",
    userId: "FjUHmWzMvF256zAEma9KWJed2rRZO6Cp",
  },
  sparrRisher: {
    name: "Sparr Risher",
    userId: "MAJQPebTczRUFRkr9DrQ5UmK0QHjfiOk",
  },
  // Kai has two accounts; this is the one with the Team role.
  kaiGeffen: {
    name: "Kai Geffen",
    userId: "p5E5VdJar2qmpu99vjbS8rgyS1hhUVp3",
  },
  michaelSheely: {
    name: "Michael Sheely",
    userId: "x95LIWLxgyKOPWwxAjLbXdoR80PMhq7u",
  },
  damonPourtahmasebSasi: {
    name: "Damon Pourtahmaseb-Sasi",
    userId: "sqCduBqbtUV100sfJCU7HHbgfl9vIwpK",
  },
  brendanHurst: {
    name: "Brendan Hurst",
    userId: "YzyhDf6XRXF7xb0nE5pSmpRgwk7yxU7Q",
  },
  // Also a featured speaker: one account, one id.
  tommyHonton: SPEAKER_ACCOUNTS.tommyHonton,
  patrickMcKenzie: {
    name: "Patrick McKenzie",
    userId: "TODO-patrick-mckenzie",
  },
};

/** Whether this account belongs to someone on /team (speakers' ids included). */
export const isTeamAccount = (userId: string) =>
  Object.values(TEAM_ACCOUNTS).some((a) => a.userId === userId);
