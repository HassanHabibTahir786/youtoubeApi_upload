const express = require("express");
const Youtube = require("youtube-api");
const uuid = require("uuid");
const cors = require("cors");
const path = require("path");

const CREDENTIALS = require("./credentials.json");
const open = require("open");
const multer = require("multer");
const app = express();
const fs = require("fs");
app.use("/images", express.static("images"));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "/images"));
  },
  filename(req, file, cb) {
    cb(null, Date.now() + Math.random() + "-" + file.originalname);
  },
});
const uploadVideoFile = multer({
  storage: storage,
}).single("videoFile");
let oauth = Youtube.authenticate({
  type: "oauth",
  client_id: CREDENTIALS.web.client_id,
  client_secret: CREDENTIALS.web.client_secret,
  redirect_url: CREDENTIALS.web.redirect_uris[0],
});

app.use(cors());
app.use(express.json());

app.post("/upload", uploadVideoFile, (req, res) => {
  if (req.file) {
    const filename = req.file.filename;
    const { title, description } = req.body;
    console.log(filename, "-----------");
    open(
      oauth.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/youtube.upload"],
        state: JSON.stringify({
          filename,
          title,
          description,
        }),
      })
    );
  }
});

app.get("/aouth2callback", (lien, res) => {
  try {
    console.log(
      "Trying to get the token using the following code: " + lien.query.code
    );
    oauth.getToken(lien.query.code, async (err, tokens) => {
      if (err) {
        // lien.lien(err, 400);
        return console.log(err);
      }

      console.log("Got the tokens.");

      oauth.setCredentials(tokens);

      console.log(
        "The video is being uploaded. Check out the logs in the terminal."
      );
      const { filename, title, description } = JSON.parse(lien.query.state);
      let sendVideo = await Youtube.videos.insert(
        {
          resource: {
            // Video title and description
            snippet: {
              title,
              description,
            },
            // I don't want to spam my subscribers
            status: {
              privacyStatus: "private",
            },
          },
          // This is for the callback function
          part: "snippet,status",

          // Create the readable stream to upload the video
          media: {
            body: fs.createReadStream(`./images/${filename}`),
          },
        },
        (err, data) => {
          console.log(data, err);
          process.exit();
        }
      );
      res.redirect("http://localhost:3000");
      console.log(sendVideo, "-------------");
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(4000, (req, res) => {
  console.log("app is listening");
});
