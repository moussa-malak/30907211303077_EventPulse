const category = require("./models/categoryModule");
const event = require("./models/eventModules");
const mongoose = require("mongoose");


async function seed() {
    await event.deleteMany();
        await category.deleteMany();

        const concerts = await category.create({
            name: "concerts",
            description: "Music,plays,art and etc concerts ",
        });
        const matches = await category.create({
            name: "matches",
            description: "football , vollyball , tinnis and squash matches ",
        });
        const workshops = await category.create({
            name: "workshops",
            description: "programming , designing , coloring workshops",
        })
        await event.insertMany([
            {
                name: "Amr Diab concert",
                description: "it is a good concert for our famous artist ",
                date: "14/8/2026",
                location: "Alalamin city",
                category: concerts._id,
                ticketPrice: 500,
                capacity: 1000
            },
            {
                name: "wegz concert",
                description: "it is a good concert for our famous rab artist ",
                date: "31/8/2026",
                location: "cairo",
                category: concerts._id,
                ticketPrice: 700,
                capacity: 1200
            },
            {
                name: "foot ball matche",
                description: "it is a matche between Alahly vs Alzamalic ",
                date: "20/8/2026",
                location: "cairo stad",
                category: matches._id,
                ticketPrice: 300,
                capacity: 2000
            }
            ,
            {
                name: "vollyball matche",
                description: "it is a final matche in the championship ",
                date: "10/8/2026",
                location: "cairo stad",
                category: matches._id,
                ticketPrice: 200,
                capacity: 1750
            },
            {
                name: "node.js workshop",
                description: "it is a very important work shop for backend developers ",
                date: "6/9/2026",
                location: "cairo University",
                category: workshops._id,
                ticketPrice: 570,
                capacity: 100
            },
            {
                name: "basics of graphic design",
                description: "it is a good chance to who want to start learning graphic design ",
                date: "25/8/2026",
                location: "cairo",
                category: workshops._id,
                ticketPrice: 300,
                capacity: 120
            }])
}
module.exports= seed;