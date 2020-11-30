var cheerio = require("cheerio");
var phantom = require("phantom");



const { DAILY_URL, SEND_MAIL, SEND_PASSWORD, TO_MAIL } = process.env;
const reportPath = "./output/report.html";
const send = require("gmail-send")({
  user: SEND_MAIL,
  pass: SEND_PASSWORD,
  to: TO_MAIL,
  subject: "Daily Report",
  files: [
    {
      path: reportPath,
      filename: "daily.html",
    },
  ],
});
const fs = require("fs");

async function news() {
  fs.writeFileSync(reportPath, "", "utf8");
  var sitepage, phInstance;
  await phantom
    .create()
    .then(function (instance) {
      phInstance = instance;
      return instance.createPage();
    })
    .then(function (page) {
      sitepage = page;
      return page.open(
        DAILY_URL
      );
    })
    .then(function (status) {
      return sitepage.property("content");
    })
    .then(function (content) {
      var $ = cheerio.load(content);
      const contentMain = $("main.contentMain").html();
      if (contentMain) {
        fs.writeFileSync(reportPath, contentMain, "utf8");
      } else {
        console.log("content not exist");
      }
    })
    .then(function () {
      sitepage.close();
      phInstance.exit();
    })
    .catch(function (err) {
      console.log("error is ", err);
      phInstance.exit();
    });
  await send();
}

news();
