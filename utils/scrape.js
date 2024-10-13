import * as cheerio from "cheerio";
import { gotScraping } from "got-scraping";

const baseUrl = "https://www.tapology.com";

const scrapeEvents = async () => {
  try {
    const response = await gotScraping({
      url: `${baseUrl}/fightcenter?group=major&schedule=upcoming`,
    });

    if (response.statusCode !== 200) {
      throw new Error("Failed to scrape data from Tapology");
    }

    const $ = cheerio.load(response.body);

    const majorOrgs = ["UFC", "PFL", "BELLATOR", "ONE", "RIZIN"];

    const events = $(".fightcenterEvents > div")
      .toArray()
      .map((el) => {
        const eventLink = $(el).find(".promotion a");
        const date = $(el).find(".promotion span").eq(3).text().trim();
        return {
          title: eventLink.first().text().trim(),
          date,
          link: baseUrl + eventLink.first().attr("href"),
        };
      })
      .filter(
        (event) =>
          majorOrgs.some((org) => event.title.toUpperCase().includes(org)) &&
          !event.title.toUpperCase().includes("ONE FRIDAY FIGHTS")
      )
      .slice(0, 10); // Limit to 10 events

    return events;
  } catch (error) {
    console.error("Scraping error:", error);
    throw new Error("Error during scraping: ", error);
  }
};

const scrapeEventDetails = async (events) => {
  try {
    const eventsWithFights = await Promise.all(
      events.map(async (event) => {
        const eventResponse = await gotScraping({
          url: event.link,
        });

        if (eventResponse.statusCode !== 200) {
          throw new Error("Failed to fetch for: ", event.link);
        }

        const $ = cheerio.load(eventResponse.body);

        const fights = $('ul[data-event-view-toggle-target="list"] li')
          .toArray()
          .map((el) => {
            const main = $(el)
              .find(
                "a.hover\\:border-solid.hover\\:border-b.hover\\:border-neutral-950.hover\\:text-neutral-950"
              )
              .text()
              .toLowerCase()
              .includes("main");

            const weight = $(el)
              .find(
                "span.px-1\\.5.md\\:px-1.leading-\\[23px\\].text-sm.md\\:text-\\[13px\\].text-neutral-50.rounded"
              )
              .text()
              .trim()
              .substring(0, 3);

            const fighterContainers = $(el).find(
              ".div.flex.flex-row.gap-0\\.5.md\\:gap-0.w-full"
            );

            const fighterAContainer = fighterContainers.eq(0);
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
                baseUrl +
                fighterAContainer.find(".link-primary-red").attr("href"),
            };

            const fighterBContainer = fighterContainers.eq(1);
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
                baseUrl +
                fighterBContainer.find(".link-primary-red").attr("href"),
            };

            return { main, weight, fighterA, fighterB };
          });

        event.fights = fights;
        return event;
      })
    );

    return eventsWithFights.filter((event) => event.fights.length > 0);
  } catch (error) {
    console.error("Error during scraping event details:", error);
    throw new Error("Error during scraping event details:", error);
  }
};

export { scrapeEvents, scrapeEventDetails };
