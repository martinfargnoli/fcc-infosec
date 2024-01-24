const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("Five functional GET request tests", function () {
    test("Viewing one stock: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .set("content-type", "application/json")
        .query({ stock: "GOOG" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.exists(
            res.body.stockData.price,
            "GOOG price should be returned.",
          );
          done();
        });
    });
    test("Viewing one stock and liking it: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .set("content-type", "application/json")
        .query({ stock: "GOLD", like: "true" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, "GOLD");
          assert.equal(res.body.stockData.likes, 1);
          assert.exists(
            res.body.stockData.price,
            "GOLD price should be returned.",
          );
          done();
        });
    });
    test("Viewing the same stock and liking it again: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .set("content-type", "application/json")
        .query({ stock: "GOLD", like: "true" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, "GOLD");
          assert.equal(res.body.stockData.likes, 1);
          assert.exists(
            res.body.stockData.price,
            "GOLD price should be returned.",
          );
          done();
        });
    });
    test("Viewing two stocks: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .set("content-type", "application/json")
        .query({ stock: ["AMZN", "T"] })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData[0].stock, "AMZN");
          assert.equal(res.body.stockData[1].stock, "T");
          assert.exists(
            res.body.stockData[0].price,
            "AMZN price should be returned.",
          );
          assert.exists(
            res.body.stockData[1].price,
            "T price should be returned.",
          );
          done();
        });
    });
    test("Viewing two stocks and liking them: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .set("content-type", "application/json")
        .query({ stock: ["AMZN", "T"], like: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData[0].stock, "AMZN");
          assert.equal(res.body.stockData[1].stock, "T");
          assert.exists(
            res.body.stockData[0].price,
            "AMZN price should be returned.",
          );
          assert.exists(
            res.body.stockData[1].price,
            "T price should be returned.",
          );
          assert.exists(
            res.body.stockData[0].rel_likes,
            "AMZN rel_likes should be returned.",
          );
          assert.exists(
            res.body.stockData[1].rel_likes,
            "T rel_likes should be returned.",
          );
          done();
        });
    });
  });
});
