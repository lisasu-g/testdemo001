var moment = require("moment");
var { parse } = require("node-html-parser");
const puppeteer = require("puppeteer");
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
  console.log(moment());
  console.log(moment().weekday());
  // 如果是周日，周六就啥也不干
  if (moment().weekday() === 6 || moment().weekday() === 0) {
    console.log("休息日");
    return;
  }
  // 交易日
  console.log("交易日");

  fs.writeFileSync(reportPath, "", "utf8");

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(DAILY_URL);
  const contentMain = await page.content();


  if (contentMain) {
    const root = parse(contentMain);
    const emailContent = root.querySelector('.pageContent').toString();
    fs.writeFileSync(reportPath, emailContent, "utf8");
  } else {
    console.log("content not exist");
  }
  await browser.close();

  await send();
}

news();
