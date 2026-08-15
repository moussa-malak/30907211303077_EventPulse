const category = require("./models/categoryModule");
const event = require("./models/eventModules");

async function seed() {
  await event.deleteMany();
  await category.deleteMany();

  const concerts = await category.create({
    name: "concerts",
    description: "Music, plays, art and etc concerts",
  });

  const matches = await category.create({
    name: "matches",
    description: "Football, volleyball, tennis and squash matches",
  });

  const workshops = await category.create({
    name: "workshops",
    description: "Programming, designing, coloring workshops",
  });

  await event.insertMany([
    {
      name: "Amr Diab concert",
      description: "It is a good concert for our famous artist",
      date: "14/8/2026",
      location: "Alamein City",
      category: concerts._id,
      ticketPrice: 500,
      capacity: 1000,
    },
    {
      name: "Wegz concert",
      description: "It is a good concert for our famous rap artist",
      date: "31/8/2026",
      location: "Cairo",
      category: concerts._id,
      ticketPrice: 700,
      capacity: 1200,
    },
    {
      name: "Football match",
      description: "It is a match between Al Ahly vs Al Zamalek",
      date: "20/8/2026",
      location: "Cairo Stadium",
      category: matches._id,
      ticketPrice: 300,
      capacity: 2000,
    },
    {
      name: "Volleyball match",
      description: "It is a final match in the championship",
      date: "10/8/2026",
      location: "Cairo Stadium",
      category: matches._id,
      ticketPrice: 200,
      capacity: 1750,
    },
    {
      name: "Node.js workshop",
      description: "It is a very important workshop for backend developers",
      date: "6/9/2026",
      location: "Cairo University",
      category: workshops._id,
      ticketPrice: 570,
      capacity: 100,
    },
    {
      name: "Basics of graphic design",
      description: "It is a good chance for those who want to start learning graphic design",
      date: "25/8/2026",
      location: "Cairo",
      category: workshops._id,
      ticketPrice: 300,
      capacity: 120,
    },
  ]);
}

module.exports = seed;