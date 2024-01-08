const cheerio = require("cheerio");
const axios = require("axios");

const scrape = async () => {
  const baseUrl = "https://www.tapology.com";
  const response = await axios.get(
    `${baseUrl}/fightcenter?group=major&schedule=upcoming`
  );
  const $ = cheerio.load(response.data);

  const majorOrgs = ["UFC", "PFL", "BELLATOR", "ONE", "RIZIN"];

  let events = $(".fightcenterEvents > div")
    .map((_, el) => {
      const title = $(el).find(".promotion a").first().text().trim();
      const date = $(el).find(".promotion span").eq(2).text().trim();
      const link = baseUrl + $(el).find(".promotion a").first().attr("href");

      return { title, date, link };
    })
    .get()
    .filter((event) =>
      majorOrgs.some((org) => event.title.toUpperCase().includes(org))
    )
    .slice(0, 10);

  for (const event of events) {
    const eventResponse = await axios.get(event.link);
    const $event = cheerio.load(eventResponse.data);

    const fights = $event("li.fightCard:not(.picks)")
      .map((_, el) => {
        const main = $event(el)
          .find(".billing")
          .text()
          .toLowerCase()
          .includes("main")
          ? true
          : false;
        const weight = $event(el)
          .find(".fightCardWeight .weight")
          .text()
          .trim();

        const fighterA = {
          name: $event(el).find(".fightCardFighterName.left a").text().trim(),
          record: $event(el)
            .find(".fightCardFighterBout.left .fightCardRecord")
            .text()
            .trim(),
          country:
            baseUrl +
            $event(el)
              .find(".fightCardFighterBout.left .fightCardFlag")
              .attr("src"),
          picture: $event(el)
            .find(".fightCardFighterImage img")
            .first()
            .attr("src"),
          link:
            baseUrl +
            $event(el).find(".fightCardFighterBout.left a").attr("href"),
        };

        const fighterB = {
          name: $event(el).find(".fightCardFighterName.right a").text().trim(),
          record: $event(el)
            .find(".fightCardFighterBout.right .fightCardRecord")
            .text()
            .trim(),
          country:
            baseUrl +
            $event(el)
              .find(".fightCardFighterBout.right .fightCardFlag")
              .attr("src"),
          picture: $event(el)
            .find(".fightCardFighterImage img")
            .last()
            .attr("src"),
          link:
            baseUrl +
            $event(el).find(".fightCardFighterBout.right a").attr("href"),
        };

        return { main, weight, fighterA, fighterB };
      })
      .get();

    event.fights = fights;
  }

  return events.filter((event) => event.fights.length > 0); // Changed to filter out events with no fights
};

module.exports = scrape;
