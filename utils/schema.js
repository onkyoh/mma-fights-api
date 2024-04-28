import z from "zod";

const fighterSchema = z.object({
  name: z.string().min(1),
  record: z.string(),
  country: z.string().min(1),
  picture: z.string().min(1),
});

const fightSchema = z.object({
  main: z.boolean(),
  weight: z.string().max(3),
  fighterA: fighterSchema,
  fighterB: fighterSchema,
});

const scrapedDataSchema = z.array(
  z.object({
    title: z.string().min(1),
    date: z.string().min(1),
    link: z.string().min(1),
    fights: z.array(fightSchema),
  })
);

export { scrapedDataSchema };
