"use strict";

const { User, UserFollow } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await User.findAll();

    const randomFollow = async (user) => {
      let randomIndexs = [];

      while (randomIndexs.length < 2) {
        const randomIndex = Math.round(
          Math.random() * (users.length - 1 - 0) + 0
        );
        const random = users[randomIndex];
        if (!randomIndexs.includes(randomIndex) && random !== user.id) {
          randomIndexs.push(randomIndex);
        }
      }
      await Promise.all(
        randomIndexs.map(async (index) => {
          const cUser = users[index];
          try {
            await UserFollow.create({ UserId: user.id, FollowId: cUser.id });
            console.log(
              `Follow created for User ${user.email} and ${cUser.email}`
            );
          } catch (err) {
            console.log(
              `skip creating for User ${user.email} and ${cUser.email}`
            );
          }
        })
      );
      await new Promise((res) => setTimeout(res, 100));
    };

    for (let x = 0; x < users.length; x++) {
      const user = users[x];
      await randomFollow(user);
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
