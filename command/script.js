// --- DOM Element Selection ---
// نستخدم const لأن هذه العناصر لن يتم إعادة تعيينها
const commandButton = document.getElementById('save-button');
const clearButton = document.getElementById('clear-button');
const copyOutputButton = document.getElementById('copy-output-button');
const changeColorButton = document.getElementById('change-color-button');
const copyInputButton = document.getElementById('copy-input-button'); // Added this line
const mainTextArea = document.getElementById('main-textarea');
const outputTextArea = document.getElementById('output-textarea');


// --- Event Listeners ---
// التأكد من وجود العناصر قبل إضافة المستمعين لتجنب الأخطاء
if (commandButton && mainTextArea && outputTextArea) {
    commandButton.addEventListener('click', handleCommandExecution);
}

if (clearButton && outputTextArea) {
    clearButton.addEventListener('click', handleReadProject);
}

if (copyInputButton && mainTextArea && outputTextArea) { // Added this block
    copyInputButton.addEventListener('click', handleRenameVariables);
}

if (copyOutputButton && outputTextArea) {
    copyOutputButton.addEventListener('click', handleCopyOutput);
}

if (changeColorButton && mainTextArea && outputTextArea) {
    changeColorButton.addEventListener('click', handleChangeColor);
}

// --- Logic Functions ---

/**
 * Handles the execution of the "command" button click.
 * Fetches data from order.json, processes it with the input text,
 * and displays the result in the output textarea.
 */
async function handleCommandExecution() {
    try {
        const response = await fetch('order.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const orders = await response.json();

        const userText = mainTextArea.value;
        outputTextArea.value = `${orders.end.message}\n\n${userText}\n\n${orders.start.message}`;
    } catch (error) {
        console.error('Failed to fetch or process order.json:', error);
        outputTextArea.value = 'حدث خطأ أثناء تنفيذ الأمر. يرجى مراجعة الـ console.';
    }
}

/**
 * Handles the "Read Project" button click.
 * Fetches the 'read' instructions from order.json and displays them
 * in the main textarea.
 */
async function handleReadProject() {
    try {
        const response = await fetch('order.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const orders = await response.json();
        outputTextArea.value = orders.read.instructions;
    } catch (error) {
        console.error('Failed to fetch or process order.json for read instructions:', error);
        outputTextArea.value = 'حدث خطأ أثناء جلب تعليمات المشروع. يرجى مراجعة الـ console.';
    }
}

/**
 * Handles the "Rename Variables" button click.
 * Fetches the 'rename' instructions from order.json,
 * replaces 'x1x_' with the content of mainTextArea,
 * and displays the result in the output textarea.
 */
async function handleRenameVariables() {
    try {
        const response = await fetch('order.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const orders = await response.json();

        // Split the input text into lines
        const lines = mainTextArea.value.split('\n');
        const line1 = lines[0] || ''; // First line for x2x
        const line2 = lines[1] || ''; // Second line for x1x_

        const instructions = orders.rename.instructions;
        // Chain replacements: first replace x2x, then replace x1x_
        const modifiedInstructions = instructions.replace(/x2x/g, line1).replace(/x1x_/g, `${line2}_`);

        const startMessage = orders.start.message;
        const endMessage = orders.end.message;

        outputTextArea.value = `${endMessage}\n\n${modifiedInstructions}\n\n${startMessage}`;
    } catch (error) {
        console.error('Failed to fetch or process order.json for rename instructions:', error);
        outputTextArea.value = 'حدث خطأ أثناء جلب أو معالجة تعليمات إعادة تسمية المتغيرات. يرجى مراجعة الـ console.';
    }
}

/**
 * Handles the "Change Color" button click.
 * Fetches the 'changColor' instructions from order.json,
 * replaces 'x4x' with the first line of mainTextArea,
 * and displays the result in the output textarea.
 */
async function handleChangeColor() {
    try {
        const response = await fetch('order.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const orders = await response.json();

        // Get the first line from the main textarea
        const lines = mainTextArea.value.split('\n');
        const firstLine = lines[0] || ''; // Default to empty string if no line

        const instructions = orders.changColor.instructions;
        const modifiedInstructions = instructions.replace(/x4x/g, firstLine);

        const startMessage = orders.start.message;
        const endMessage = orders.end.message;

        outputTextArea.value = `${endMessage}\n\n${modifiedInstructions}\n\n${startMessage}`;
    } catch (error) {
        console.error('Failed to fetch or process order.json for change color instructions:', error);
        outputTextArea.value = 'حدث خطأ أثناء جلب أو معالجة تعليمات تغيير الألوان. يرجى مراجعة الـ console.';
    }
}

/**
 * Handles the copy output button click.
 * Copies the content of the output textarea to the clipboard.
 */
function handleCopyOutput() {
    const textToCopy = outputTextArea.value;

    if (!textToCopy) {
        console.warn('لا يوجد نص لنسخه في منطقة النتائج.');
        return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
        console.log('تم نسخ الناتج إلى الحافظة بنجاح!');
        // تقديم تغذية راجعة مرئية للمستخدم
        const originalText = copyOutputButton.textContent;
        copyOutputButton.textContent = 'تم النسخ!';
        setTimeout(() => {
            copyOutputButton.textContent = originalText;
        }, 2000); // إعادة النص الأصلي للزر بعد ثانيتين
    }).catch(err => {
        console.error('فشل نسخ النص: ', err);
    });
}
