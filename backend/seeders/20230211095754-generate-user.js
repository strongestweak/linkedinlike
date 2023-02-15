"use strict";

const { randomUserInstance } = require("../utils/axiosInstances");
const { User } = require("./../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const { data: randomUsers } = await randomUserInstance({
        method: "GET",
        url: "/",
        params: { results: 50, seed: new Date().getTime() },
      });
      const results = randomUsers?.results || [];

      const userData = {
        firstName: 'arnie',
        lastName: 'chipe',
        dob: new Date('08/22/1994'),
        email: 'arniechipe@example.com',
        avatar: "https://avatars.githubusercontent.com/u/1066868?v=4",
        password: 'arniechipe',
      };
      const user = await User.create(userData);
      for (let x = 0; x < results.length; x++) {
        const data = results[x];
        if (data?.email) {
          try {
            const userData = {
              firstName: data?.name?.first,
              lastName: data?.name?.last,
              dob: data?.dob?.date,
              email: data?.email,
              avatar: data?.picture?.medium,
              randomUserId: data?.id?.name + "-" + data?.id?.value,
              password: data?.email.split("@")[0],
            };
            const user = await User.create(userData);
            console.log(
              `User generated with credentials: ${user.email} - ${userData.password}`
            );
            await new Promise((res) => setTimeout(res, 100));
          } catch (err) {
            console.log(err.message);
          }
        }
      }
    } catch (err) {
      console.log(err);
      throw err;
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
