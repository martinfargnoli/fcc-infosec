const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let testThreadId = "";
let testThreadId2 = "";
let testReplyId = "";

suite("Functional Tests", function () {
  test("Creating a new thread: POST request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .post("/api/threads/test1")
      .send({
        board: "test1",
        text: "text",
        delete_password: "password",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
      });
    done();
  });
  test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .get("/api/threads/test1")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isBelow(res.body.length, 11);
        assert.isBelow(res.body[0].replies.length, 4);
        /*
      assert.isArray(res.body)
      testThreadId = String(res.body[0]._id)
      testThreadId2 = String(res.body[1]._id)
      */
        done();
      });
  });
  test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", (done) => {
    chai
      .request(server)
      .delete("/api/threads/test1")
      .send({
        delete_password: "invalid password",
        thread_id: testThreadId,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "incorrect password");
      });
    done();
  });
  test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", (done) => {
    chai
      .request(server)
      .delete("/api/threads/test1")
      .send({
        delete_password: "valid password",
        thread_id: testThreadId2,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
      });
    done();
  });
  test("Reporting a thread: PUT request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .put("/api/threads/test1")
      .send({
        thread_id: testThreadId,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
      });
    done();
  });
  test("Creating a new reply: POST request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .post("/api/threads/test1")
      .send({
        thread_id: testThreadId,
        text: "text",
        delete_password: "valid password",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
      });
    done();
  });
  test("Viewing a single thread with all replies: GET request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .get("/api/threads/test1")
      .query({
        thread_id: testThreadId,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        //assert.isArray(res.body.replies)
        //testReplyId = res.body.replies[0]._id
        done();
      });
  });
  test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", (done) => {
    chai
      .request(server)
      .delete("/api/threads/test1")
      .send({
        thread_id: testThreadId,
        reply_id: testReplyId,
        delete_password: "invalid password",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '"error"');
        done();
      });
  });
  test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", (done) => {
    chai
      .request(server)
      .delete("/api/threads/test1")
      .send({
        thread_id: testThreadId,
        reply_id: testReplyId,
        delete_password: "valid password",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        //assert.equal(res.text, "success")
        done();
      });
  });
  test("Reporting a reply: PUT request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .put("/api/threads/test1")
      .send({
        thread_id: testThreadId,
        reply_id: testReplyId,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        //assert.equal(res.text, "success")
        done();
      });
  });
});
