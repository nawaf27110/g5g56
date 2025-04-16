//// netlify/functions/sheetdata.js

exports.handler = async (event, context) => {
  try {
    // رابط OpenSheet الذي ترغب بإخفائه
    const openSheetURL = "https://opensheet.elk.sh/1YYMgZwzqRZer7TPZmZ3mkdGvBEdvpRLcr1NurEKVkZo/Sheet1";
    
    // جلب البيانات باستخدام fetch المدمج في Node.js 18
    const response = await fetch(openSheetURL);
    const data = await response.json();

    // إعادة إرسال البيانات بصيغة JSON إلى الواجهة الأمامية
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "حدث خطأ أثناء جلب البيانات." })
    };
  }
};

