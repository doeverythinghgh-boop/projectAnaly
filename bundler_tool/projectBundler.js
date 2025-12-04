/**
 * @file projectBundler.js
 * @description أداة لتجميع وتصغير ملفات المشروع في ملف نصي واحد.
 * تستخدم File System Access API لقراءة الملفات من جهاز المستخدم.
 */

/**
 * القائمة الافتراضية للملفات والمجلدات التي يجب تجاهلها.
 */
const DEFAULT_IGNORES = [
    ".git",
    ".vscode",
    "node_modules",
    ".DS_Store",
    "project-bundle.txt", // الملف الناتج نفسه
    "package-lock.json",
    "yarn.lock",
    "bundler_tool" // تجاهل مجلد الأداة نفسها إذا كان داخل المشروع
];

/**
 * امتدادات الصور والملفات الثنائية التي يجب تجاهلها (لأننا نريد ملف نصي).
 */
const BINARY_EXTENSIONS = [
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".webm", ".mp3", ".pdf", ".zip", ".rar", ".7z"
];

/**
 * الدالة الرئيسية لتجميع المشروع.
 * @param {Array<string>} userIgnores - قائمة إضافية للتجاهل يحددها المستخدم.
 * @param {Function} logCallback - دالة لطباعة الرسائل في الواجهة.
 */
export async function bundleProject(userIgnores = [], logCallback = console.log) {
    try {
        logCallback("Starting bundling process...");
        
        // دمج قوائم التجاهل
        const ignoreList = [...DEFAULT_IGNORES, ...userIgnores];

        // 1. طلب اختيار المجلد من المستخدم
        logCallback("Please select the project folder...");
        const dirHandle = await window.showDirectoryPicker();
        logCallback(`Selected folder: ${dirHandle.name}`);
        
        // 2. بدء عملية المسح والتجميع
        let bundleContent = "";
        bundleContent += `Project Bundle Generated on: ${new Date().toISOString()}\n`;
        bundleContent += `Source Directory: ${dirHandle.name}\n`;
        bundleContent += `==================================================\n\n`;

        let fileCount = 0;

        // دالة تكرارية لمسح المجلدات
        async function processDirectory(handle, path = "") {
            for await (const entry of handle.values()) {
                const entryPath = path ? `${path}/${entry.name}` : entry.name;

                // التحقق من التجاهل
                if (ignoreList.some(ignore => entry.name === ignore || entryPath.includes(ignore))) {
                    // logCallback(`Ignored: ${entryPath}`);
                    continue;
                }

                if (entry.kind === "file") {
                    // التحقق من الامتدادات الثنائية
                    const extension = entry.name.substring(entry.name.lastIndexOf(".")).toLowerCase();
                    if (BINARY_EXTENSIONS.includes(extension)) {
                        continue;
                    }

                    // قراءة الملف
                    try {
                        const file = await entry.getFile();
                        const text = await file.text();
                        
                        // تصغير الكود
                        const minifiedText = minifyCode(text, extension);

                        // إضافة للملف المجمع
                        bundleContent += `--- FILE: ${entryPath} ---\n`;
                        bundleContent += minifiedText + "\n\n";
                        
                        fileCount++;
                        logCallback(`Processed: ${entryPath}`);
                    } catch (err) {
                        logCallback(`Error reading ${entryPath}: ${err.message}`);
                    }

                } else if (entry.kind === "directory") {
                    // استدعاء تكراري للمجلدات الفرعية
                    await processDirectory(entry, entryPath);
                }
            }
        }

        await processDirectory(dirHandle);

        logCallback(`Bundling complete! Processed ${fileCount} files.`);

        // 3. إنشاء الملف وتنزيله
        downloadFile(bundleContent, "project-bundle.txt");
        logCallback("File downloaded: project-bundle.txt");

    } catch (error) {
        if (error.name !== 'AbortError') { // تجاهل خطأ إلغاء المستخدم
            console.error("Error bundling project:", error);
            logCallback(`Error: ${error.message}`);
            alert("حدث خطأ أثناء تجميع المشروع: " + error.message);
        } else {
            logCallback("Operation cancelled by user.");
        }
    }
}

/**
 * دالة لتصغير الكود (Minification) بشكل بسيط.
 * @param {string} code - الكود الأصلي.
 * @param {string} extension - امتداد الملف.
 * @returns {string} الكود المصغر.
 */
function minifyCode(code, extension) {
    let minified = code;

    // إزالة التعليقات والمسافات الزائدة بناءً على النوع
    if (extension === ".js" || extension === ".css" || extension === ".json") {
        // إزالة التعليقات متعددة الأسطر /* ... */
        minified = minified.replace(/\/\*[\s\S]*?\*\//g, "");
        
        // إزالة التعليقات سطر واحد // ... (فقط لـ JS)
        if (extension === ".js") {
            minified = minified.replace(/\/\/.*$/gm, "");
        }

        // إزالة الأسطر الفارغة المتعددة
        minified = minified.replace(/^\s*[\r\n]/gm, "");
        
    } else if (extension === ".html") {
        // إزالة تعليقات HTML <!-- ... -->
        minified = minified.replace(/<!--[\s\S]*?-->/g, "");
        // إزالة الأسطر الفارغة
        minified = minified.replace(/^\s*[\r\n]/gm, "");
    }

    return minified.trim();
}

/**
 * دالة لإنشاء وتنزيل ملف نصي.
 * @param {string} content - محتوى الملف.
 * @param {string} filename - اسم الملف.
 */
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
