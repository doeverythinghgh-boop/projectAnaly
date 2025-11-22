// المتغيرات العامة
let directoryHandle = null;
let projectName = "";

let cssContent   = "";
let htmlContent  = "";
let jsContent    = "";
let jsonContent  = "";

// هياكل بيانات متقدمة لتتبع العلاقات
let relations = {
    html: {},
    css: {},
    js: {},
    json: {}
};

let dependencyMap = {
    htmlToCss: {},
    htmlToJs: {},
    cssToJs: {},
    jsToJson: {},
    jsToHtml: {},
    crossReferences: {}
};

let projectStructure = {
    entryPoints: [],
    components: {},
    modules: {},
    dataFlows: [],
    architecture: {},
    techStack: {
        frameworks: [],
        libraries: [],
        buildTools: [],
        preprocessors: []
    }
};

// هياكل بيانات للبحث المتقدم
let fileAnalysis = {};
let functionAnalysis = {};
let componentAnalysis = {};
let fileDependencies = {};
let functionDependencies = {};
let reverseDependencies = {};

// دوال مساعدة أساسية
function getFileType(filename) {
    if (filename.endsWith(".css") || filename.endsWith(".scss") || filename.endsWith(".sass") || filename.endsWith(".less")) return "css";
    if (filename.endsWith(".html") || filename.endsWith(".htm")) return "html";
    if (filename.endsWith(".js") || filename.endsWith(".jsx") || filename.endsWith(".ts") || filename.endsWith(".tsx")) return "js";
    if (filename.endsWith(".json")) return "json";
    return "unsupported";
}

function getFileIcon(fileType) {
    const icons = {
        css: "🎨",
        html: "🌐",
        js: "⚙️",
        json: "📋"
    };
    return icons[fileType] || "📄";
}

function showLoading(show) {
    document.getElementById("loading").style.display = show ? "block" : "none";
}

function countLines(content) {
    return content.split('\n').length;
}

function countFunctions(content) {
    return (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(/g) || []).length;
}

function countKeys(obj) {
    let count = 0;
    for (let key in obj) {
        count++;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            count += countKeys(obj[key]);
        }
    }
    return count;
}

// فتح/إغلاق مجلد شجري
function toggleFolder(el) {
    let panel = el.nextElementSibling;
    panel.style.display = panel.style.display === "none" ? "block" : "none";
    
    // تغيير الأيقونة
    let icon = el.querySelector('span');
    if (panel.style.display === "block") {
        icon.textContent = "📂";
    } else {
        icon.textContent = "📁";
    }
}

// تجاهل عنصر
function ignoreItem(event, name) {
    event.stopPropagation();
    let area = document.getElementById("ignoreList");
    if (!area.value.includes(name)) {
        area.value += `\n${name}`;
        localStorage.setItem("ignored", area.value);
    }
    readAll();
}

// حفظ قائمة التجاهل
function saveIgnore() {
    localStorage.setItem("ignored", document.getElementById("ignoreList").value);
    alert("تم حفظ قائمة التجاهل بنجاح");
}

// إعادة تعيين قائمة التجاهل
function resetIgnore() {
    if (confirm("هل تريد حقًا إعادة تعيين قائمة التجاهل؟")) {
        document.getElementById("ignoreList").value = "node_modules\n.git\n.vscode\n.DS_Store\nThumbs.db\npackage-lock.json\nyarn.lock";
        localStorage.setItem("ignored", document.getElementById("ignoreList").value);
        readAll();
    }
}

// فتح ملف داخل نافذة
function openFile(filePath) {
    let allText = document.getElementById("output").value;

    let start = allText.indexOf(`بداية الملف: ${filePath}`);
    if (start === -1) return;

    let end = allText.indexOf(`نهاية الملف: ${filePath}`);
    let content = allText.substring(start, end + `نهاية الملف: ${filePath}`.length);

    document.getElementById("fileInfo").innerHTML = `
        <strong>اسم الملف:</strong> ${filePath}<br>
        <strong>النوع:</strong> ${getFileType(filePath)}<br>
        <strong>الوصف:</strong> ${relations[getFileType(filePath)]?.[filePath] || 'لا يوجد وصف'}<br>
        <strong>العلاقات:</strong> ${getFileRelationsSummary(filePath)}
    `;
    document.getElementById("fileContent").innerText = content;
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// الحصول على ملخص علاقات الملف
function getFileRelationsSummary(filePath) {
    const fileType = getFileType(filePath);
    let relations = [];
    
    if (fileType === 'html') {
        if (dependencyMap.htmlToCss[filePath]) {
            relations.push(`يستدعي ${dependencyMap.htmlToCss[filePath].length} ملف CSS`);
        }
        if (dependencyMap.htmlToJs[filePath]) {
            relations.push(`يستدعي ${dependencyMap.htmlToJs[filePath].length} ملف JS`);
        }
    } else if (fileType === 'js') {
        if (dependencyMap.jsToJson[filePath]) {
            relations.push(`يستدعي ${dependencyMap.jsToJson[filePath].length} ملف JSON`);
        }
        if (dependencyMap.jsToHtml[filePath]) {
            relations.push(`يتفاعل مع ${dependencyMap.jsToHtml[filePath].length} عنصر HTML`);
        }
    }
    
    return relations.length > 0 ? relations.join('، ') : 'لا توجد علاقات محددة';
}

// تصفية الشجرة حسب البحث
function filterTree() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const allItems = document.querySelectorAll('.folder, .file');
    
    if (!searchTerm) {
        allItems.forEach(item => item.style.display = 'flex');
        return;
    }
    
    allItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'flex';
            // فتح المجلدات التي تحتوي على نتائج
            if (item.classList.contains('file')) {
                let parentFolder = item.closest('.sub').previousElementSibling;
                if (parentFolder) {
                    parentFolder.style.display = 'flex';
                    let panel = parentFolder.nextElementSibling;
                    if (panel && panel.style.display === "none") {
                        toggleFolder(parentFolder);
                    }
                }
            }
        } else {
            item.style.display = 'none';
        }
    });
}

// مسح البحث
function clearSearch() {
    document.getElementById("searchInput").value = '';
    filterTree();
}

// التصفية حسب نوع الملف
function filterByType(type) {
    const allItems = document.querySelectorAll('.folder, .file');
    
    if (type === 'all') {
        allItems.forEach(item => item.style.display = 'flex');
        return;
    }
    
    allItems.forEach(item => {
        if (item.classList.contains('folder')) {
            // إظهار المجلدات دائمًا
            item.style.display = 'flex';
        } else if (item.dataset.type === type) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}




/////////////////////////

// إضافة الدوال المفقودة في core.js



/**
 * استخراج الدوال مع تعليقات JSDoc المرتبطة بها
 * @param {string} content - محتوى الملف
 * @param {string} fileType - نوع الملف
 * @returns {Array} مصفوفة الدوال مع JSDoc
 */
function extractFunctionsWithJSDoc(content, fileType) {
    const functions = [];
    
    if (fileType !== 'js' && fileType !== 'ts') {
        return functions;
    }

    try {
        // استخدام JSDocAnalyzer إذا كان متاحاً
        if (typeof JSDocAnalyzer !== 'undefined') {
            const jsdocComments = JSDocAnalyzer.parseJSDocComments(content);
            const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)|let\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)|class\s+(\w+))/g;
            let match;
            
            while ((match = functionRegex.exec(content)) !== null) {
                const functionName = match[1] || match[2] || match[3] || match[4];
                if (functionName) {
                    // البحث عن JSDoc المرتبط بهذه الدالة
                    const jsdoc = jsdocComments.find(comment => 
                        comment.functionName === functionName
                    );
                    
                    functions.push({
                        name: functionName,
                        type: match[0].includes('class') ? 'class' : 'function',
                        jsdoc: jsdoc ? jsdoc.parsed : null,
                        hasJSDoc: !!jsdoc,
                        quality: jsdoc ? JSDocAnalyzer.evaluateJSDocQuality(jsdoc) : null
                    });
                }
            }
        }
    } catch (error) {
        console.error(`❌ خطأ في استخراج JSDoc:`, error);
    }
    
    return functions;
}

/**
 * تحديث دالة performAdvancedAnalysis لدعم JSDoc
 */
function performAdvancedAnalysis(filePath, fileType, content) {
    const analysis = {
        type: fileType,
        functions: [],
        dependencies: [],
        size: content.length,
        lines: content.split('\n').length,
        complexity: calculateComplexity(fileType, content),
        jsdoc: {
            comments: [],
            coverage: 0,
            quality: {
                excellent: 0,
                good: 0,
                fair: 0,
                poor: 0
            }
        }
    };

    // تحليل JSDoc للملفات البرمجية
    if ((fileType === 'js' || fileType === 'ts') && typeof JSDocAnalyzer !== 'undefined') {
        try {
            analysis.jsdoc.comments = JSDocAnalyzer.parseJSDocComments(content);
            analysis.functions = extractFunctionsWithJSDoc(content, fileType);
            
            // حساب نسبة التغطية
            const totalFunctions = analysis.functions.length;
            const documentedFunctions = analysis.functions.filter(f => f.hasJSDoc).length;
            analysis.jsdoc.coverage = totalFunctions > 0 ? 
                Math.round((documentedFunctions / totalFunctions) * 100) : 0;
            
            // إحصائيات الجودة
            analysis.functions.forEach(func => {
                if (func.quality) {
                    const level = func.quality.level;
                    if (level === 'ممتاز') analysis.jsdoc.quality.excellent++;
                    else if (level === 'جيد') analysis.jsdoc.quality.good++;
                    else if (level === 'مقبول') analysis.jsdoc.quality.fair++;
                    else analysis.jsdoc.quality.poor++;
                }
            });
            
        } catch (error) {
            console.error(`❌ خطأ في تحليل JSDoc للملف ${filePath}:`, error);
        }
    }

    fileAnalysis[filePath] = analysis;
}


// دالة generateAST بدائية كبديل مؤقت
function generateAST(content) {
    console.log("⚠️ استخدام AST مبسط - يتم التحميل...");
    
    // إرجاع كائن AST مبسط
    return {
        type: 'Program',
        body: [],
        comments: [],
        tokens: [],
        simplified: true
    };
}

// دالة calculateComplexity بدائية
function calculateComplexity(fileType, content) {
    let score = 0;
    
    switch(fileType) {
        case 'js':
            score = (content.match(/function/g) || []).length;
            break;
        case 'html':
            score = (content.match(/</g) || []).length * 0.1;
            break;
        case 'css':
            score = (content.match(/{/g) || []).length * 0.5;
            break;
    }
    
    return {
        score: score,
        level: score > 20 ? 'مرتفع' : score > 10 ? 'متوسط' : 'منخفض'
    };
}

// التأكد من أن الدوال الأساسية معرفة
function initializeAdvancedAnalysis() {
    if (typeof window.performAdvancedAnalysis === 'undefined') {
        // إضافة الدالة إلى النطاق العام
        window.extractFunctionsWithJSDoc = extractFunctionsWithJSDoc;
        window.performAdvancedAnalysis = performAdvancedAnalysis;
    } else {
        window.performAdvancedAnalysis = performAdvancedAnalysis;
    }
    if (typeof window.generateAST === 'undefined') {
        window.generateAST = generateAST;
    }
}

// تهيئة الدوال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeAdvancedAnalysis();
});
