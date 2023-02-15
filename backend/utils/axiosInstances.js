const { default: axios } = require("axios");

const randomUserInstance = axios.create({
    baseURL:"https://randomuser.me/api/"
})

module.exports = {
    randomUserInstance
}