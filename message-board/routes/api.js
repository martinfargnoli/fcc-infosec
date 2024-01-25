"use strict";

const expect = require("chai").expect;
const mongoose = require("mongoose");
const id = mongoose.Types.ObjectId();
const path = require("path");
const dotenv = require("dotenv").config();
const ObjectId = require("mongodb").ObjectID;

const Schema = mongoose.Schema;

const threadSchema = new Schema({
  board: String,
  text: String,
  created_on: Date,
  bumped_on: Date,
  reported: Boolean,
  delete_password: String,
  replies: [
    {
      text: String,
      created_on: Date,
      delete_password: String,
      reported: Boolean,
    },
  ],
});

const Thread = mongoose.model("Thread", threadSchema);

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    // Create new thread.
    .post(async (req, res, next) => {
      try {
        let board = req.params.board;

        let newThread = await Thread.create({
          board: board,
          text: req.body.text,
          created_on: new Date(),
          bumped_on: new Date(),
          reported: false,
          delete_password: req.body.delete_password,
          replies: [],
        });

        return res.redirect("/b/" + board);
      } catch (err) {
        return res.json("error");
      }
    })
    // Get recent threads.
    .get(async (req, res) => {
      try {
        let board = req.params.board;
        await Thread.find(
          { board: board },
          {
            reported: 0,
            delete_password: 0,
            "replies.delete_password": 0,
            "replies.reported": 0,
          },
        )
          .sort({ bumped_on: -1 })
          .limit(10)
          .lean()
          .exec((err, threadArray) => {
            if (!err && threadArray) {
              threadArray.forEach((ele) => {
                ele.replycount = ele.replies.length;

                ele.replies.sort((a, b) => {
                  return b.created_on - a.created_on;
                });

                if (ele.replies.length > 3) {
                  ele.replies = ele.replies.slice(-3);
                }
              });

              return res.json(threadArray);
            }
          });
      } catch (err) {
        return res.json("error");
      }
    })
    // Delete a thread.
    .delete(async (req, res) => {
      try {
        let board = req.params.board;
        let deletedThread = await Thread.findById(req.body.thread_id);
        if (req.body.delete_password === deletedThread.delete_password) {
          await deletedThread.delete();
          return res.send("success");
        } else {
          return res.send("incorrect password");
        }
      } catch (err) {
        res.json("error");
      }
    })
    // Report a thread.
    .put((req, res) => {
      const { thread_id } = req.body;
      Thread.findOneAndUpdate(
        { _id: thread_id },
        { $set: { reported: true } },
        { new: true, upsert: true },
        (err, data) => {
          if (data) {
            res.send("reported");
          } else {
            res.send("not reported");
          }
        },
      );
    });

  app
    // Create reply.
    .route("/api/replies/:board")
    .post(async (req, res, next) => {
      try {
        let board = req.params.board;
        let foundBoard = await Thread.findById(req.body.thread_id);
        foundBoard.bumped_on = new Date().toUTCString();
        foundBoard.replies.push({
          text: req.body.text,
          created_on: new Date().toUTCString(),
          delete_password: req.body.delete_password,
          reported: false,
        });

        await foundBoard.save();
        return res.redirect("/b/" + board + "/" + req.body.thread_id);
      } catch (err) {
        res.json("error");
      }
    })
    // Get all replies on a thread.
    .get(async (req, res) => {
      try {
        let board = req.params.board;
        await Thread.findById(req.query.thread_id, async (err, thread) => {
          if (!err && thread) {
            thread.delete_password = undefined;
            thread.reported = undefined;
            thread.replycount = thread.replies.length;

            thread.replies.forEach((reply) => {
              reply.delete_password = undefined;
              reply.reported = undefined;
            });

            return res.json(thread);
          }
        });
      } catch (err) {
        res.json("error");
      }
    })
    // Delete a reply.
    .delete(async (req, res) => {
      try {
        let foundThread = await Thread.findById(req.body.thread_id);
        foundThread.replies.forEach(async (ele) => {
          if (
            ele._id == req.body.reply_id &&
            ele.delete_password == req.body.delete_password
          ) {
            ele.text = "[deleted]";
            await foundThread.save();
            return res.send("success");
          } else if (
            ele._id == req.body.reply_id &&
            ele.delete_password != req.body.delete_password
          ) {
            return res.send("incorrect password");
          }
        });
      } catch (err) {
        res.json("error");
      }
    })
    // Report a reply.
    .put((req, res) => {
      const { thread_id, reply_id } = req.body;
      Thread.findOneAndUpdate(
        {
          _id: thread_id,
          "replies._id": reply_id,
        },
        { $set: { "replies.$.reported": true } },
        (err, data) => {
          if (err) {
            res.send("error");
          } else {
            res.send("reported");
          }
        },
      );
    });
};
