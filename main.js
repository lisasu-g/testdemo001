var cheerio = require("cheerio");
var phantom = require("phantom");



const { daily_url, send_mail, send_password, to_mail } = process.env;
const reportPath = "./output/report.html";
const send = require("gmail-send")({
  user: send_mail,
  pass: send_password,
  to: to_mail,
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
        daily_url
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
