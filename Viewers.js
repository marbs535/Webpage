const express = require("express");
const router = express.Router();

router.get("/fetch", (request, response) => {
    const { name, age, gender } =  request.body

    if (Number(age) === 23) {
      response.status(200).send({
        name, age, gender
      });
    } else {
        response.status(500).send({
            "message": "Age is incorrect",
            "status": "Failed!"
        });
    }
});

router.post("/insert", (request, response) => {
    console.log(request.headers);
});

module.exports = router