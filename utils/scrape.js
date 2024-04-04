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
    .filter(
      (event) =>
        majorOrgs.some((org) => event.title.toUpperCase().includes(org)) &&
        !event.title.toUpperCase().includes("ONE FRIDAY FIGHTS")
    )
    .slice(0, 10);

  for (const event of events) {
    const eventResponse = await axios.get(event.link);
    const $event = cheerio.load(eventResponse.data);

    const fights = $event("li.border-b.border-dotted.border-tap_6")
      .map((_, el) => {
        const main = $event(el)
          .find(
            "a.hover\\:border-solid.hover\\:border-b.hover\\:border-neutral-950.hover\\:text-neutral-950"
          )
          .text()
          .toLowerCase()
          .includes("main");

        // Extract the weight class
        const weight = $event(el)
          .find(
            "span.bg-tap_darkgold.px-1\\.5.md\\:px-1.leading-\\[23px\\].text-sm.md\\:text-\\[13px\\].text-neutral-50.rounded"
          )
          .text()
          .trim();

        // Find the container that encapsulates each fighter's info
        const fighterContainers = $event(el).find(
          ".div.flex.flex-row.gap-0\\.5.md\\:gap-0.w-full"
        );

        // Extracting Fighter A's Information
        const fighterAContainer = fighterContainers.eq(0); // First fighter container
        const fighterA = {
          name: fighterAContainer.find(".link-primary-red").text().trim(),
          record: fighterAContainer
            .find(".text-\\[15px\\].md\\:text-xs.order-2")
            .text()
            .trim(),
          country:
            baseUrl +
            fighterAContainer
              .find(
                ".opacity-70.h-\\[14px\\].md\\:h-\\[11px\\].w-\\[22px\\].md\\:w-\\[17px\\]"
              )
              .attr("src"),
          picture: fighterAContainer
            .find(
              ".w-\\[77px\\].h-\\[77px\\].md\\:w-\\[104px\\].md\\:h-\\[104px\\].rounded"
            )
            .attr("src"),
          link:
            baseUrl + fighterAContainer.find(".link-primary-red").attr("href"),
        };

        // Extracting Fighter B's Information
        const fighterBContainer = fighterContainers.eq(1); // Second fighter container, assuming it's structured similarly
        const fighterB = {
          name: fighterBContainer.find(".link-primary-red").text().trim(),
          record: fighterBContainer
            .find(".text-\\[15px\\].md\\:text-xs.order-1")
            .text()
            .trim(),
          country:
            baseUrl +
            fighterBContainer
              .find(
                ".opacity-70.h-\\[14px\\].md\\:h-\\[11px\\].w-\\[22px\\].md\\:w-\\[17px\\]"
              )
              .attr("src"),
          picture: fighterBContainer
            .find(
              ".w-\\[77px\\].h-\\[77px\\].md\\:w-\\[104px\\].md\\:h-\\[104px\\].rounded"
            )
            .attr("src"),
          link:
            baseUrl + fighterBContainer.find(".link-primary-red").attr("href"),
        };

        return { main, weight, fighterA, fighterB };
      })
      .get();

    event.fights = fights;
  }

  return events.filter((event) => event.fights.length > 0); // Changed to filter out events with no fights
};

module.exports = scrape;
