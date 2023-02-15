"use strict";
const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const { User, Article } = require("../models");

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

function randomDate(date1, date2) {
  function randomValueBetween(min, max) {
    return Math.random() * (max - min) + min;
  }
  var date1 = date1 || "01-01-1970";
  var date2 = date2 || new Date().toLocaleDateString();
  date1 = new Date(date1).getTime();
  date2 = new Date(date2).getTime();
  if (date1 > date2) {
    return new Date(randomValueBetween(date2, date1));
  } else {
    return new Date(randomValueBetween(date1, date2));
  }
}

const generateArticle = async (user) => {
  const imageRandom = 1084;
  const thumbnameIdl = Math.round(Math.random() * (imageRandom - 0) + 0);
  const articleData = {
    title: lorem.generateWords(5),
    UserId: user.id,
    datePublished: randomDate(new Date("1/1/2020"), new Date()),
    description: lorem.generateParagraphs(5),
    thumbnail: `https://picsum.photos/id/${thumbnameIdl}/300/200`,
  };
  console.log(`Generate article for ${user.email}`);
  await Article.create(articleData);
  await new Promise((res) => setTimeout(res, 100));
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await User.findAll();
    for (let x = 0; x < users.length; x++) {
      const user = users[x];
      await generateArticle(user);
      await generateArticle(user);
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
