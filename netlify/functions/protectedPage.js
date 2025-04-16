
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  const params = event.queryStringParameters;
  const code = (params.code || "").trim();
  const email = (params.email || "").trim().toLowerCase();

  const sheetUrl = "https://opensheet.elk.sh/1YYMgZwzqRZer7TPZmZ3mkdGvBEdvpRLcr1NurEKVkZo/Sheet1";

  try {
    const response = await fetch(sheetUrl);
    const data = await response.json();

    const match = data.find(row =>
      row.code?.trim() === code &&
      row.email?.trim().toLowerCase() === email
    );

    if (!match) {
      return {
        statusCode: 302,
        headers: {
          Location: "/check.html"
        },
        body: ""
      };
    }

    const filePath = path.join(__dirname, "indexProtected.html");
    const htmlContent = fs.readFileSync(filePath, "utf8");

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: htmlContent
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "حدث خطأ في التحقق أو جلب البيانات."
    };
  }
};
