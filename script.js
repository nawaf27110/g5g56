// script.js
// ملاحظة: هنا نستخدم كائن questionsDatabase القادم من ملف questionsDatabase.js
// لذا تأكد أن ملف questionsDatabase.js قد تم تحميله قبل هذا الملف في الـ HTML.

/* ===============================================================================================
    1) المتغيرات العامة
   =============================================================================================== */
const STORAGE_KEY = 'examStateLocal';
const FORM_DATA_STORAGE_KEY = 'examFormData'; // تخزين بيانات الصفحة الأولى

let subjectSelected = {};
const addedQuestions = new Set();


/* ===============================================================================================
   بقية الأكواد كما هي (نفس الكود السابق) مع حذف الجزء الخاص بتعريف questionsDatabase.
   سيجد الكود كائن questionsDatabase معرفةً في ملف questionsDatabase.js
   =============================================================================================== */

/* هنا نتابع الأكواد نفسها: */

// لا نعيد تعريف questionsDatabase لأنه أصبح الآن في ملف مستقل.

// قاعدة البيانات أصبحت مستوردة من ملف آخر (عبر وسم <script> في الـHTML بالترتيب).

function validateAndGoNext() {
    const teacherName = document.getElementById('teacherName').value.trim();
    const academicYear = document.getElementById('academicYear').value.trim();
    const educationDept = document.getElementById('educationDepartment').value.trim();
    const examType = document.getElementById('examType').value;
    const totalScore = document.getElementById('manualTotalScore').value;
    const schoolName = document.getElementById('schoolName').value.trim();

    if (!teacherName || !academicYear || !educationDept || !examType || totalScore === '' || !schoolName) {
        alert("الرجاء تعبئة جميع الحقول الإلزامية قبل المتابعة.");
        return;
    }

    saveFormState(); // حفظ بيانات الصفحة الأولى
    document.getElementById('page1').style.display = 'none';
    document.getElementById('page2').style.display = 'block';

    updateTeacherName();
    updateExamType();
    updateManualTotalScore();
    updateEducationDepartment();
    updateSchoolName();
    updateDisplay();
}

function printExam() {
    window.print();
}

function updateTeacherName() {
  const teacherInput = document.getElementById('teacherName').value;

  if (girlsModeActive) {
    // وضع البنات
    document.getElementById('teacherHeader').textContent =
      teacherInput ? 'معلمة المادة: ' + teacherInput : 'معلمة المادة:';
  } else {
    // وضع البنين
    document.getElementById('teacherHeader').textContent =
      teacherInput ? 'معلم المادة: ' + teacherInput : 'معلم المادة:';
  }
}

function updateEducationDepartment() {
    const input = document.getElementById('educationDepartment').value.trim();
    const output = document.getElementById('educationDepartmentHeader');
    if (input) {
        output.textContent = 'إدارة التعليم بمنطقة ' + input;
    } else {
        output.textContent = 'إدارة التعليم بمنطقة';
    }
}

function updateSchoolName() {
    const schoolInput = document.getElementById('schoolName').value.trim();
    document.getElementById('schoolHeader').textContent = schoolInput || "اسم المدرسة";
}

function updateAcademicYear() {
    updateDisplay();
}

function updateDisplay() {
    const yearInput = document.getElementById('academicYear').value.trim();
    const examType = document.getElementById('examType').value;
    const displayElem = document.getElementById('academicYearDisplay');

    let coreText = '';

    if (examType && yearInput) {
        coreText = `${examType} - فيزياء 1 أول ثانوي العام الدراسي ${yearInput} هـ الفصل الدراسي الأول`;
    } else if (examType && !yearInput) {
        coreText = `${examType} - فيزياء 1 أول ثانوي العام الدراسي الفصل الدراسي الأول`;
    } else if (!examType && yearInput) {
        coreText = `- فيزياء 1 أول ثانوي العام الدراسي ${yearInput} هـ الفصل الدراسي الأول`;
    } else {
        coreText = `- فيزياء 1 أول ثانوي العام الدراسي الفصل الدراسي الأول`;
    }

    if (examType === 'اختبار نهائي') {
        coreText += ' - الدور الأول';
    }

    displayElem.textContent = coreText;
}


function showSubtopics() {
    const subject = document.getElementById('subject').value;
    const subtopicSelect = document.getElementById('subtopicSelect');
    const subtopicLabel = document.getElementById('subtopicLabel');
    const questionListDiv = document.getElementById('questionList');

    subtopicSelect.innerHTML = '<option value="">اختر القسم الفرعي</option>';
    questionListDiv.innerHTML = '';
    questionListDiv.style.display = 'none';

    if (!subject || !questionsDatabase[subject]) {
        subtopicSelect.style.display = 'none';
        subtopicLabel.style.display = 'none';
        return;
    }

    const subtopicsObj = questionsDatabase[subject].subtopics;
    if (!subtopicsObj) {
        subtopicSelect.style.display = 'none';
        subtopicLabel.style.display = 'none';
        return;
    }

    subtopicSelect.style.display = 'block';
    subtopicLabel.style.display = 'block';

    for (let subKey in subtopicsObj) {
        if (subtopicsObj.hasOwnProperty(subKey)) {
            let option = document.createElement('option');
            option.value = subKey;
            option.textContent = subtopicsObj[subKey].label;
            subtopicSelect.appendChild(option);
        }
    }
}

function showQuestionsForSubtopic() {
    const subjectValue = document.getElementById('subject').value;
    const subtopicValue = document.getElementById('subtopicSelect').value;
    const questionListDiv = document.getElementById('questionList');

    questionListDiv.innerHTML = '';

    if (!subjectValue || !subtopicValue) {
        questionListDiv.style.display = 'none';
        return;
    }

    const subtopicsObj = questionsDatabase[subjectValue].subtopics;
    const chosenSubtopicData = subtopicsObj[subtopicValue];
    if (!chosenSubtopicData || !chosenSubtopicData.questions) {
        questionListDiv.style.display = 'none';
        return;
    }

    let sortedQuestions = chosenSubtopicData.questions.slice();
    // essay => 1 سطر, essay3 => 3 أسطر, essay10 => 10 أسطر
    const orderMap = { mcq: 1, tf: 2, essay: 3, essay3: 3, essay10: 3 };
    sortedQuestions.sort((a,b) => (orderMap[a.type]||99) - (orderMap[b.type]||99));

    if (sortedQuestions.length === 0) {
        questionListDiv.innerHTML = '<p>لا توجد أسئلة متاحة</p>';
        questionListDiv.style.display = 'block';
        return;
    }

    let html = '<ul style="list-style: none; padding:0;">';
    sortedQuestions.forEach(q => {
        let labelPrefix = '';
        if (q.type === 'mcq') labelPrefix = '[اختيار متعدد] ';
        else if (q.type === 'tf') labelPrefix = '[صح / خطأ] ';
        else if (q.type === 'essay' || q.type === 'essay3' || q.type === 'essay10') labelPrefix = '[مقالي] ';

        let isSelected = subjectSelected[subjectValue]?.includes(q.question);
        html += `
          <li style="margin-bottom:5px;">
            <strong>${labelPrefix + q.question}</strong>
            <button style="float:left;"
                onclick="toggleQuestionFromList('${subjectValue}','${subtopicValue}','${q.question}')">
              ${isSelected ? 'إزالة' : 'إضافة'}
            </button>
            <div style="clear:both;"></div>
          </li>
        `;
    });
    html += '</ul>';

    questionListDiv.innerHTML = html;
    questionListDiv.style.display = 'block';
}

function toggleQuestionFromList(subjectValue, subtopicValue, questionText) {
    const chosenSubtopic = questionsDatabase[subjectValue].subtopics[subtopicValue];
    if (!chosenSubtopic) return;

    let questionData = chosenSubtopic.questions.find(q => q.question === questionText);
    if (!questionData) return;

    if (questionData.type === 'mcq') {
        createMCQInPreview(questionData.question, subjectValue, questionData.options, null);
    } else if (questionData.type === 'tf') {
        createTFInPreview(questionData.question, subjectValue, null);
    } else if (questionData.type === 'essay' || questionData.type === 'essay3' || questionData.type === 'essay10') {
        createEssayInPreview(questionData.question, subjectValue, null, null);
    }

    showQuestionsForSubtopic();
}


function toggleQuestion() {
    /* هذه الدالة يمكن تجاهلها أو تركها إن كان لديك عنصر <select> قديم */
}


function createMCQInPreview(questionText, subject, optionsArray, selectElement) {
    const mcqList = document.getElementById('mcqList');
    let existingLi = mcqList.querySelector(`li[data-question='${questionText}']`);

    if (existingLi) {
        existingLi.remove();
        addedQuestions.delete(questionText);
        if (subjectSelected[subject]) {
            subjectSelected[subject] = subjectSelected[subject].filter(q => q !== questionText);
        }
        if (selectElement) {
            let optionInSelect = selectElement.querySelector(`option[value="${questionText}"]`);
            if (optionInSelect) optionInSelect.textContent = optionInSelect.textContent.replace(' ✅','');
        }
        updateVisibilityAndCounts();
        saveStateToLocal();
        return;
    }

    let li = document.createElement('li');
    li.setAttribute('data-question', questionText);
    li.setAttribute('data-subject', subject);
    li.setAttribute('data-type', 'mcq');

    let deleteBtn = `<span class='delete-btn' onclick='deleteQuestion(this)'>حذف</span>`;
    let editBtn   = `<span class='edit-btn' onclick='editQuestion(this)'>تعديل</span>`;

    let questionLine = `
        <div class="question-line">
            ${deleteBtn} ${editBtn}
            <strong>${questionText}</strong>
        </div>
    `;

    let letters = ['أ','ب','ج','د'];
    let rowHTML = '';
    for (let i = 0; i < 4; i++) {
        let optText = optionsArray[i] || '';
        rowHTML += `
            <td class="letter-cell">${letters[i]})</td>
            <td class="answer-cell">${optText}</td>
        `;
    }
    li.innerHTML = questionLine + `<table><tr>${rowHTML}</tr></table>`;
    mcqList.appendChild(li);

    if (window.MathJax) {
        window.MathJax.typesetPromise();
    }

    addedQuestions.add(questionText);
    if (!subjectSelected[subject]) {
        subjectSelected[subject] = [];
    }
    subjectSelected[subject].push(questionText);

    if (selectElement) {
        let optionInSelect = selectElement.querySelector(`option[value="${questionText}"]`);
        if (optionInSelect) {
            optionInSelect.textContent += ' ✅';
        }
    }

    let cells = li.querySelectorAll('td');
    cells.forEach(cell => {
        scaleTextToFit(cell, 4);
    });

    updateVisibilityAndCounts();
    saveStateToLocal();
}


/* 
    *** تم التعديل هنا لإضافة جدول سؤال الصح والخطأ بعرض 50px للخلية الثانية ***
*/
function createTFInPreview(questionText, subject, selectElement) {
    const tfList = document.getElementById('tfList');
    let existingTF = tfList.querySelector(`li[data-question='${questionText}']`);
    if (existingTF) {
        existingTF.remove();
        addedQuestions.delete(questionText);
        if (subjectSelected[subject]) {
            subjectSelected[subject] = subjectSelected[subject].filter(q => q !== questionText);
        }
        if (selectElement) {
            let optionInSelect = selectElement.querySelector(`option[value="${questionText}"]`);
            if (optionInSelect) {
                optionInSelect.textContent = optionInSelect.textContent.replace(' ✅','');
            }
        }
        updateVisibilityAndCounts();
        saveStateToLocal();
        return;
    }

    let li = document.createElement('li');
    li.setAttribute('data-question', questionText);
    li.setAttribute('data-subject', subject);
    li.setAttribute('data-type', 'tf');

    let deleteBtn = `<span class='delete-btn' onclick='deleteQuestion(this)'>حذف</span>`;
    let editBtn   = `<span class='edit-btn' onclick='editQuestion(this)'>تعديل</span>`;

    // جدول بخليتين: الأولى للسؤال، والثانية للأقواس بعرض 50px
    let tableHTML = `
      <table>
        <tr>
          <td style="width:auto; text-align:right;">${questionText}</td>
          <td style="width:50px; text-align:center;">( &emsp;&emsp; )</td>
        </tr>
      </table>
    `;

    li.innerHTML = `${deleteBtn} ${editBtn} ${tableHTML}`;
    tfList.appendChild(li);

    if (window.MathJax) {
        window.MathJax.typesetPromise();
    }

    addedQuestions.add(questionText);
    if (!subjectSelected[subject]) {
        subjectSelected[subject] = [];
    }
    subjectSelected[subject].push(questionText);

    if (selectElement) {
        let optionInSelect = selectElement.querySelector(`option[value="${questionText}"]`);
        if (optionInSelect) {
            optionInSelect.textContent += ' ✅';
        }
    }

    updateVisibilityAndCounts();
    saveStateToLocal();
}


function createEssayInPreview(questionText, subject, imageDataUrl=null, selectElement=null) {
    const essayList = document.getElementById('essayList');

    // لو السؤال مكرر
    if (selectElement) {
        let existingEssay = essayList.querySelector(`li[data-question='${questionText}']`);
        if (existingEssay) {
            existingEssay.remove();
            addedQuestions.delete(questionText);
            if (subjectSelected[subject]) {
                subjectSelected[subject] = subjectSelected[subject].filter(q => q !== questionText);
            }
            if (selectElement) {
                let optionInSelect = selectElement.querySelector(`option[value="${questionText}"]`);
                if (optionInSelect) {
                    optionInSelect.textContent = optionInSelect.textContent.replace(' ✅','');
                }
            }
            updateVisibilityAndCounts();
            saveStateToLocal();
            return;
        }
    }

    // ننشئ الـ <li> مع 5 أسطر فاضية تحت السؤال
    let li = document.createElement('li');
    li.setAttribute('data-question', questionText);
    li.setAttribute('data-subject', subject);
    li.setAttribute('data-type', 'essay');

    let deleteBtn = `<span class='delete-btn' onclick='deleteQuestion(this)'>حذف</span>`;
    let editBtn   = `<span class='edit-btn' onclick='editQuestion(this)'>تعديل</span>`;

    let imageHtml = '';
    if (imageDataUrl) {
        imageHtml = `
            <div class='essay-image-container' data-scale='1' data-offset='0'>
                <img src='${imageDataUrl}' class='essay-image' />
                <div class='zoom-controls'>
                    <button onclick='zoomIn(this)'>تكبير</button>
                    <button onclick='zoomOut(this)'>تصغير</button>
                    <button onclick='moveImageRight(this)'>ازاحة يمين</button>
                    <button onclick='moveImageLeft(this)'>ازاحة يسار</button>
                </div>
            </div>
        `;
    }

    // أضف 5 أسطر فاضية
    let fiveBlanks = '<br>';

    li.innerHTML = `
        ${deleteBtn} ${editBtn}
        <span class='essay-content'>${questionText}</span>
        ${imageHtml}
        ${fiveBlanks}
    `;
    essayList.appendChild(li);

    if (window.MathJax) {
        window.MathJax.typesetPromise();
    }

    addedQuestions.add(questionText);
    if (!subjectSelected[subject]) {
        subjectSelected[subject] = [];
    }
    subjectSelected[subject].push(questionText);

    if (selectElement) {
        let optionInSelect = selectElement.querySelector(`option[value="${questionText}"]`);
        if (optionInSelect) {
            optionInSelect.textContent += ' ✅';
        }
    }

    updateVisibilityAndCounts();
    saveStateToLocal();
}

function handleCustomTypeChange() {
    const selectedType = document.getElementById('customQuestionType').value;
    const mcqFields = document.getElementById('mcqFields');
    const tfFields = document.getElementById('tfFields');
    const essayFields = document.getElementById('essayFields');
    const addBtn = document.getElementById('addCustomBtn');

    mcqFields.style.display = 'none';
    tfFields.style.display = 'none';
    essayFields.style.display = 'none';
    addBtn.style.display = 'none';

    if (selectedType === 'mcq') {
        mcqFields.style.display = 'block';
        addBtn.style.display = 'block';
    } else if (selectedType === 'tf') {
        tfFields.style.display = 'block';
        addBtn.style.display = 'block';
    } else if (selectedType === 'essay') {
        essayFields.style.display = 'block';
        addBtn.style.display = 'block';
    }
}

function addCustomQuestion() {
    const selectedType = document.getElementById('customQuestionType').value;
    if (!selectedType) return;

    if (selectedType === 'mcq') {
        const questionText = document.getElementById('mcqQuestionInput').value.trim();
        const opt1 = document.getElementById('mcqOption1').value;
        const opt2 = document.getElementById('mcqOption2').value;
        const opt3 = document.getElementById('mcqOption3').value;
        const opt4 = document.getElementById('mcqOption4').value;
        if (!questionText) return;
        createMCQInPreview(questionText, 'custom', [opt1,opt2,opt3,opt4], null);

        document.getElementById('mcqQuestionInput').value = '';
        document.getElementById('mcqOption1').value = '';
        document.getElementById('mcqOption2').value = '';
        document.getElementById('mcqOption3').value = '';
        document.getElementById('mcqOption4').value = '';

    } else if (selectedType === 'tf') {
        const questionText = document.getElementById('tfQuestionInput').value.trim();
        if (!questionText) return;
        createTFInPreview(questionText, 'custom', null);
        document.getElementById('tfQuestionInput').value = '';

    } else if (selectedType === 'essay') {
        const questionText = document.getElementById('essayQuestionInput').value.trim();
        const fileInput = document.getElementById('essayImageInput');
        const file = fileInput.files[0];

        if (!questionText && !file) return;

        let imagePromise = Promise.resolve(null);
        if (file) {
            imagePromise = new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        }

        imagePromise.then(imageDataUrl => {
            createEssayInPreview(questionText, 'custom', imageDataUrl, null);
            document.getElementById('essayQuestionInput').value = '';
            document.getElementById('essayImageInput').value = '';
        });
    }
}

function deleteQuestion(button) {
    let li = button.closest('li');
    if (!li) return;

    let questionText = li.getAttribute('data-question');
    let subject = li.getAttribute('data-subject');

    li.remove();
    addedQuestions.delete(questionText);

    if (subjectSelected[subject]) {
        subjectSelected[subject] = subjectSelected[subject].filter(q => q !== questionText);
    }

    updateVisibilityAndCounts();
    saveStateToLocal();
}

/* 
    *** تم التعديل هنا لدعم تعديل نص السؤال للـ TF مع الجدول (خليتان) ***
*/
function editQuestion(button) {
    let li = button.closest('li');
    if (!li) return;

    let questionText = li.getAttribute('data-question');
    let questionType = li.getAttribute('data-type');

    if (questionType === 'mcq') {
        let newQuestionText = prompt("عدل نص السؤال:", questionText);
        if (newQuestionText === null) return;
        newQuestionText = newQuestionText.trim() || questionText;

        let cells = li.querySelectorAll('table td.answer-cell');
        let oldOptions = Array.from(cells).map(td => td.textContent.trim());
        let newOptions = [];
        for (let i=0; i<oldOptions.length; i++) {
            let opt = prompt(`عدل الخيار ${i+1}:`, oldOptions[i]);
            if (opt===null) opt=oldOptions[i];
            newOptions.push(opt.trim());
        }

        li.setAttribute('data-question', newQuestionText);
        let strongElem = li.querySelector('.question-line strong');
        if (strongElem) strongElem.textContent = newQuestionText;

        let letters = ['أ','ب','ج','د'];
        let rowHTML = '';
        for (let i=0; i<4; i++) {
            rowHTML += `
              <td class="letter-cell">${letters[i]})</td>
              <td class="answer-cell">${newOptions[i]}</td>
            `;
        }
        li.querySelector('table').innerHTML = `<tr>${rowHTML}</tr>`;

    } else if (questionType === 'tf') {
        // التعديل على نص السؤال في أول خلية
        let newQuestionText = prompt("عدل نص السؤال:", questionText);
        if (newQuestionText === null) return;
        newQuestionText = newQuestionText.trim() || questionText;

        li.setAttribute('data-question', newQuestionText);

        // خلية السؤال هي الخلية الأولى في الجدول
        let questionCell = li.querySelector('table tr td:first-child');
        if (questionCell) {
            questionCell.textContent = newQuestionText;
        }

    } else if (questionType === 'essay' || questionType === 'essay3' || questionType === 'essay10') {
        let newQuestionText = prompt("عدل نص السؤال:", questionText);
        if (newQuestionText === null) return;
        newQuestionText = newQuestionText.trim() || questionText;
        li.setAttribute('data-question', newQuestionText);

        let essayContentSpan = li.querySelector('.essay-content');
        if (essayContentSpan) essayContentSpan.textContent = newQuestionText;
    }

    if (window.MathJax) {
        window.MathJax.typesetPromise();
    }
    updateVisibilityAndCounts();
    saveStateToLocal();
}

function zoomIn(btn) {
    const container = btn.closest('.essay-image-container');
    if (!container) return;
    let currentScale = parseFloat(container.dataset.scale) || 1;
    let newScale = currentScale + 0.1;
    container.dataset.scale = newScale;
    const img = container.querySelector('img.essay-image');
    img.style.transform = `scale(${newScale})`;
    img.style.transformOrigin = '50% 50%';
}

function zoomOut(btn) {
    const container = btn.closest('.essay-image-container');
    if (!container) return;
    let currentScale = parseFloat(container.dataset.scale) || 1;
    let newScale = currentScale - 0.1;
    if (newScale < 0.1) newScale = 0.1;
    container.dataset.scale = newScale;
    const img = container.querySelector('img.essay-image');
    img.style.transform = `scale(${newScale})`;
    img.style.transformOrigin = '50% 50%';
}

function moveImageRight(btn) {
    const container = btn.closest('.essay-image-container');
    if (!container) return;

    let currentOffset = parseFloat(container.dataset.offset) || 0;
    currentOffset += 10;
    container.dataset.offset = currentOffset;
    container.style.transform = `translateX(${currentOffset}px)`;

    const examPreview = document.getElementById('examPreview');
    const containerRect = container.getBoundingClientRect();
    const previewRect = examPreview.getBoundingClientRect();
    if (containerRect.right > previewRect.right) {
        currentOffset -= 10;
        container.dataset.offset = currentOffset;
        container.style.transform = `translateX(${currentOffset}px)`;
    }
}

function moveImageLeft(btn) {
    const container = btn.closest('.essay-image-container');
    if (!container) return;

    let currentOffset = parseFloat(container.dataset.offset) || 0;
    currentOffset -= 10;
    container.dataset.offset = currentOffset;
    container.style.transform = `translateX(${currentOffset}px)`;

    const examPreview = document.getElementById('examPreview');
    const containerRect = container.getBoundingClientRect();
    const previewRect = examPreview.getBoundingClientRect();
    if (containerRect.left < previewRect.left) {
        currentOffset += 10;
        container.dataset.offset = currentOffset;
        container.style.transform = `translateX(${currentOffset}px)`;
    }
}

function scaleTextToFit(cell, minFont=4) {
    let fontSize = parseFloat(window.getComputedStyle(cell).fontSize);
    while (cell.scrollWidth > cell.clientWidth && fontSize > minFont) {
        fontSize--;
        cell.style.fontSize = fontSize + 'px';
    }
}

function updateVisibilityAndCounts() {
    const sections = [
        {
            type: 'mcq',
            headingText: 'اختر الإجابة الصحيحة فيما يلي',
            sectionEl: document.querySelector('.mcq-section'),
            listEl: document.getElementById('mcqList')
        },
        {
            type: 'tf',
            headingText: 'ضع علامة (√) أمام العبارة الصحيحة وعلامة (×) أمام العبارة الخاطئة فيما يلي',
            sectionEl: document.querySelector('.tf-section'),
            listEl: document.getElementById('tfList')
        },
        {
            type: 'essay',
            headingText: 'أجب عن جميع الأسئلة التالية',
            sectionEl: document.querySelector('.essay-section'),
            listEl: document.getElementById('essayList')
        }
    ];

    const questionNumberLabels = ['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر'];

    let questionIndex = 0;

    sections.forEach(sec => {
        const count = sec.listEl.querySelectorAll('li[data-question]').length;
        if (count > 0) {
            sec.sectionEl.style.display = 'block';
            sec.sectionEl.querySelector('h3').textContent =
                `السؤال ${questionNumberLabels[questionIndex]}: ${sec.headingText}`;
            questionIndex++;
        } else {
            sec.sectionEl.style.display = 'none';
        }
    });

    const mcqCount = sections[0].listEl.querySelectorAll('li[data-question]').length;
    const tfCount  = sections[1].listEl.querySelectorAll('li[data-question]').length;
    const essayCount = sections[2].listEl.querySelectorAll('li[data-question]').length;
    let totalQuestions = mcqCount + tfCount + essayCount;

    document.getElementById('mcqCount').textContent = mcqCount;
    document.getElementById('tfCount').textContent = tfCount;
    document.getElementById('essayCount').textContent = essayCount;
    document.getElementById('totalQuestionsCount').textContent = totalQuestions;

    updateManualTotalScore();
}

function updateManualTotalScore() {
    const val = parseFloat(document.getElementById('manualTotalScore').value) || 0;
    document.getElementById('totalExamScore').textContent = val;
    saveStateToLocal();
}

function saveStateToLocal() {
    const examState = {
        addedQuestions: Array.from(addedQuestions),
        mcqHtml: document.getElementById('mcqList').innerHTML,
        tfHtml: document.getElementById('tfList').innerHTML,
        essayHtml: document.getElementById('essayList').innerHTML,
        subjectSelected: subjectSelected,
        manualTotalScore: document.getElementById('manualTotalScore').value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(examState));
}

function loadStateFromLocal() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return;
    try {
        const examState = JSON.parse(storedData);
        if (examState.addedQuestions) {
            examState.addedQuestions.forEach(q => addedQuestions.add(q));
        }
        if (examState.mcqHtml !== undefined) {
            document.getElementById('mcqList').innerHTML = examState.mcqHtml;
        }
        if (examState.tfHtml !== undefined) {
            document.getElementById('tfList').innerHTML = examState.tfHtml;
        }
        if (examState.essayHtml !== undefined) {
            document.getElementById('essayList').innerHTML = examState.essayHtml;
        }
        if (examState.subjectSelected) {
            subjectSelected = examState.subjectSelected;
        }
        if (examState.manualTotalScore !== undefined) {
            document.getElementById('manualTotalScore').value = examState.manualTotalScore;
        }
        if (window.MathJax) {
            window.MathJax.typesetPromise();
        }
    } catch(e) {
        console.error('Error loading from localStorage:', e);
    }

    let cells = document.querySelectorAll('#mcqList td');
    cells.forEach(cell => {
        scaleTextToFit(cell, 4);
    });
    updateVisibilityAndCounts();
}

let allQuestionsArray = [];

function buildAllQuestionsArray() {
    allQuestionsArray = [];
    for (let subjectKey in questionsDatabase) {
        let subtopics = questionsDatabase[subjectKey].subtopics;
        for (let subKey in subtopics) {
            let subtopicObj = subtopics[subKey];
            let questions = subtopicObj.questions || [];
            questions.forEach(q => {
                allQuestionsArray.push({
                    subject: subjectKey,
                    subtopic: subKey,
                    question: q
                });
            });
        }
    }
}

function searchAllQuestions() {
    const inputVal = document.getElementById('searchQuestionsInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');

    if (!inputVal) {
        resultsDiv.innerHTML = `<p style="font-size:14px; color:#999; text-align:center;">اكتب كلمات البحث أعلاه</p>`;
        return;
    }

    let filtered = allQuestionsArray.filter(item => {
        const qText = item.question.question.toLowerCase();
        return qText.includes(inputVal);
    });

    if (filtered.length === 0) {
        resultsDiv.innerHTML = `<p style="font-size:14px; color:#999; text-align:center;">لا توجد نتائج مطابقة</p>`;
        return;
    }

    let html = `<ul style="list-style: none; padding:0; margin:0;">`;
    filtered.forEach(obj => {
        let questionType = obj.question.type;
        let prefix = '[مقالي] ';
        if (questionType === 'mcq') prefix='[اختيار متعدد] ';
        if (questionType === 'tf') prefix='[صح/خطأ] ';

        const isAlreadyAdded = addedQuestions.has(obj.question.question);

        html += `
          <li style="margin-bottom:5px;">
            <strong>${prefix}${obj.question.question}</strong>
            <button style="float:left;"
                onclick="toggleQuestionFromSearch('${obj.subject}','${obj.subtopic}','${obj.question.question}')">
              ${isAlreadyAdded ? 'إزالة' : 'إضافة'}
            </button>
            <div style="clear:both;"></div>
          </li>`;
    });
    html += `</ul>`;

    resultsDiv.innerHTML = html;
}

function toggleQuestionFromSearch(subjectKey, subtopicKey, questionText) {
    let questionDataObj = questionsDatabase[subjectKey].subtopics[subtopicKey].questions
        .find(q => q.question === questionText);
    if (!questionDataObj) return;

    if (questionDataObj.type === 'mcq') {
        createMCQInPreview(questionDataObj.question, subjectKey, questionDataObj.options, null);
    } else if (questionDataObj.type === 'tf') {
        createTFInPreview(questionDataObj.question, subjectKey, null);
    } else if (questionDataObj.type === 'essay' || questionDataObj.type === 'essay3' || questionDataObj.type === 'essay10') {
        createEssayInPreview(questionDataObj.question, subjectKey, null, null);
    }

    searchAllQuestions();
}

window.addEventListener('load', () => {
    buildAllQuestionsArray();
    loadStateFromLocal(); // تحميل حالة الأسئلة
    loadFormState();      // تحميل بيانات الحقول المدخلة (الصفحة الأولى)
});

function goBackToPage1() {
    document.getElementById('page2').style.display = 'none';
    document.getElementById('page1').style.display = 'block';
}

function updateExamType() {
    const examType = document.getElementById('examType').value;
    const testTimeElement = document.getElementById('testTime');
    const seatNumberElement = document.getElementById('seatNumber');
    const gradeContainer = document.querySelector('.grade-container');
    const manualTotalScoreInput = document.getElementById('manualTotalScore');

    if (examType === 'اختبار نهائي') {
        testTimeElement.textContent = 'زمن الاختبار: ساعتين ونصف';
        seatNumberElement.style.display = 'block';
        gradeContainer.style.display = 'block';
        manualTotalScoreInput.value = 30;
    } else if (examType === 'اختبار الفترة الاولى') {
        testTimeElement.textContent = 'زمن الاختبار: 45 دقيقة';
        seatNumberElement.style.display = 'none';
        gradeContainer.style.display = 'block';
        manualTotalScoreInput.value = 15;
    } else if (examType === 'أختبار قصير' || examType === 'واجب') {
        testTimeElement.textContent = '';
        seatNumberElement.style.display = 'none';
        gradeContainer.style.display = 'block';
        manualTotalScoreInput.value = 0;
    } else {
        testTimeElement.textContent = '';
        seatNumberElement.style.display = 'none';
        gradeContainer.style.display = 'none';
        manualTotalScoreInput.value = 0;
    }

    updateManualTotalScore();
    updateDisplay();
}

function saveFormState() {
    const formData = {
        teacherName: document.getElementById('teacherName').value,
        academicYear: document.getElementById('academicYear').value,
        educationDepartment: document.getElementById('educationDepartment').value,
        examType: document.getElementById('examType').value,
        manualTotalScore: document.getElementById('manualTotalScore').value,
        schoolName: document.getElementById('schoolName').value
    };
    localStorage.setItem(FORM_DATA_STORAGE_KEY, JSON.stringify(formData));
}

function loadFormState() {
    const formDataStr = localStorage.getItem(FORM_DATA_STORAGE_KEY);
    if (!formDataStr) return;

    try {
        const formData = JSON.parse(formDataStr);
        document.getElementById('teacherName').value = formData.teacherName || '';
        document.getElementById('academicYear').value = formData.academicYear || '';
        document.getElementById('educationDepartment').value = formData.educationDepartment || '';
        document.getElementById('examType').value = formData.examType || '';
        document.getElementById('manualTotalScore').value = formData.manualTotalScore || '';
        document.getElementById('schoolName').value = formData.schoolName || '';
    } catch (e) {
        console.error('Error loading form data:', e);
    }
}

let girlsModeActive = false;

function toggleGenderMode() {
  const genderValue = document.getElementById('genderSelect').value;

  if (genderValue === 'girls') {
    girlsModeActive = true;
    document.getElementById('studentHeader').textContent = 'اسم الطالبة: ____________________';
  } else {
    girlsModeActive = false;
    document.getElementById('studentHeader').textContent = 'اسم الطالب: ____________________';
  }

  updateTeacherName();
}

function checkInternetConnection() {
    if (!navigator.onLine) {
        alert("تم فقد الاتصال بالإنترنت. سيتم توجيهك لصفحة التنبيه.");
        window.location.href = "/offline.html";
    }
}

checkInternetConnection();
setInterval(checkInternetConnection, 20000);
