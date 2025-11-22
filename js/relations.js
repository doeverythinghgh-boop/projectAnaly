// تحليل العلاقات بين الملفات
// في بداية الملف، تأكد من أن الدوال الأساسية معرفة
if (typeof analyzeHTMLRelations === 'undefined') {
    function analyzeHTMLRelations(filePath, content) {
        // استخدام التحليل المبسط
        analyzeHTMLRelationsBasic(filePath, content);
    }
}

// تأكد من وجود الدوال الأساسية الأخرى
if (typeof analyzeCSSRelations === 'undefined') {
    function analyzeCSSRelations(filePath, content) {
        // تحليل CSS أساسي
        const imports = content.match(/@import[^;]+;/g) || [];
        if (imports.length > 0) {
            dependencyMap.cssToCss = dependencyMap.cssToCss || {};
            dependencyMap.cssToCss[filePath] = imports;
        }
    }
}
function analyzeFileRelations(filePath, fileType, content) {
    switch(fileType) {
        case "html":
            analyzeHTMLRelations(filePath, content);
            break;
        case "css":
            analyzeCSSRelations(filePath, content);
            break;
        case "js":
            analyzeJSRelations(filePath, content);
            break;
        case "json":
            analyzeJSONRelations(filePath, content);
            break;
    }
}

// تحليل العلاقات في ملفات HTML
function analyzeHTMLRelations(filePath, content) {
    // اكتشاف استدعاءات CSS
    const cssLinks = content.match(/<link[^>]*href="([^"]*\.css)[^>]*>/g) || [];
    cssLinks.forEach(link => {
        const href = link.match(/href="([^"]*)"/)[1];
        if (!dependencyMap.htmlToCss[filePath]) {
            dependencyMap.htmlToCss[filePath] = [];
        }
        dependencyMap.htmlToCss[filePath].push(href);
    });
    
    // اكتشاف استدعاءات JS
    const jsScripts = content.match(/<script[^>]*src="([^"]*\.js)[^>]*>/g) || [];
    jsScripts.forEach(script => {
        const src = script.match(/src="([^"]*)"/)[1];
        if (!dependencyMap.htmlToJs[filePath]) {
            dependencyMap.htmlToJs[filePath] = [];
        }
        dependencyMap.htmlToJs[filePath].push(src);
    });
    
    // اكتشاف العناصر ذات الأيدي (IDs) والفئات (Classes)
    const elementsWithIds = content.match(/id="([^"]*)"/g) || [];
    const elementsWithClasses = content.match(/class="([^"]*)"/g) || [];
    
    if (elementsWithIds.length > 0 || elementsWithClasses.length > 0) {
        projectStructure.components[filePath] = {
            ids: elementsWithIds.map(id => id.match(/id="([^"]*)"/)[1]),
            classes: elementsWithClasses.map(cls => cls.match(/class="([^"]*)"/)[1].split(' ')).flat()
        };
    }
    
    // تحديد إذا كان ملف دخول رئيسي
    if (filePath.includes('index') || filePath.includes('main') || filePath.includes('app.')) {
        projectStructure.entryPoints.push(filePath);
    }
}

// تحليل العلاقات في ملفات CSS
function analyzeCSSRelations(filePath, content) {
    // اكتشاف استدعاءات CSS الأخرى
    const imports = content.match(/@import\s+(?:url\(['"]?([^'")]*)['"]?|['"]([^'"]*)['"])/g) || [];
    imports.forEach(imp => {
        const urlMatch = imp.match(/@import\s+(?:url\(['"]?([^'")]*)['"]?|['"]([^'"]*)['"])/);
        const url = urlMatch[1] || urlMatch[2];
        if (url && !dependencyMap.cssToJs[filePath]) {
            dependencyMap.cssToJs[filePath] = [];
        }
        if (url) {
            dependencyMap.cssToJs[filePath].push(url);
        }
    });
    
    // تحليل الفئات والأيدي المستخدمة
    const classes = content.match(/\.([a-zA-Z0-9_-]+)/g) || [];
    const ids = content.match(/#([a-zA-Z0-9_-]+)/g) || [];
    
    if (classes.length > 0 || ids.length > 0) {
        projectStructure.components[filePath] = {
            classes: [...new Set(classes.map(c => c.substring(1)))],
            ids: [...new Set(ids.map(id => id.substring(1)))]
        };
    }
}

// تحليل العلاقات في ملفات JavaScript
function analyzeJSRelations(filePath, content) {
    // اكتشاف استدعاءات JSON
    const jsonImports = content.match(/fetch\(['"]([^'"]*\.json)['"]\)|import\s+.*from\s+['"]([^'"]*\.json)['"]/g) || [];
    jsonImports.forEach(imp => {
        const match = imp.match(/['"]([^'"]*\.json)['"]/);
        if (match) {
            if (!dependencyMap.jsToJson[filePath]) {
                dependencyMap.jsToJson[filePath] = [];
            }
            dependencyMap.jsToJson[filePath].push(match[1]);
        }
    });
    
    // اكتشاف التلاعب بالـ DOM
    const domSelectors = content.match(/document\.(querySelector|getElementById|getElementsByClassName)\(['"]([^'"]*)['"]\)/g) || [];
    domSelectors.forEach(selector => {
        const match = selector.match(/\(['"]([^'"]*)['"]\)/);
        if (match) {
            if (!dependencyMap.jsToHtml[filePath]) {
                dependencyMap.jsToHtml[filePath] = [];
            }
            dependencyMap.jsToHtml[filePath].push(match[1]);
        }
    });
    
    // اكتشاف استدعاءات APIs
    const apiCalls = content.match(/(fetch|axios|XMLHttpRequest)\(['"]([^'"]*)['"]\)/g) || [];
    if (apiCalls.length > 0) {
        projectStructure.dataFlows.push({
            file: filePath,
            apis: apiCalls.map(api => {
                const match = api.match(/\(['"]([^'"]*)['"]\)/);
                return match ? match[1] : 'unknown';
            })
        });
    }
    
    // تحديد إذا كان ملف دخول رئيسي
    if (filePath.includes('index') || filePath.includes('main') || filePath.includes('app.')) {
        projectStructure.entryPoints.push(filePath);
    }
}

// تحليل العلاقات في ملفات JSON
function analyzeJSONRelations(filePath, content) {
    try {
        const data = JSON.parse(content);
        
        // تحليل هيكل البيانات
        projectStructure.architecture[filePath] = {
            type: determineJSONType(data),
            structure: analyzeJSONStructure(data),
            size: Object.keys(data).length
        };
    } catch(e) {
        // في حالة خطأ في تحليل JSON
        console.error(`Error parsing JSON file ${filePath}:`, e);
    }
}

// تحديد نوع ملف JSON
function determineJSONType(data) {
    if (data.dependencies || data.devDependencies) return 'package';
    if (data.name && data.version) return 'config';
    if (Array.isArray(data)) return 'array-data';
    if (typeof data === 'object') {
        if (Object.keys(data).every(key => typeof data[key] === 'string')) return 'key-value';
        return 'complex-object';
    }
    return 'unknown';
}

// تحليل هيكل JSON
function analyzeJSONStructure(obj, depth = 0) {
    if (depth > 3) return 'deep-structure';
    
    const structure = {};
    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            if (Array.isArray(obj[key])) {
                structure[key] = `array[${obj[key].length}]`;
                if (obj[key].length > 0 && typeof obj[key][0] === 'object') {
                    structure[key] += ` of ${analyzeJSONStructure(obj[key][0], depth + 1)}`;
                }
            } else {
                structure[key] = analyzeJSONStructure(obj[key], depth + 1);
            }
        } else {
            structure[key] = typeof obj[key];
        }
    }
    return structure;
}

// دوال تحليل CSS
function getCSSRole(path) {
    if (path.includes('main') || path.includes('style')) return 'التصميم الرئيسي والتخطيط العام';
    if (path.includes('responsive') || path.includes('mobile')) return 'التصميم الاستجابي للشاشات المختلفة';
    if (path.includes('component') || path.includes('module')) return 'أنماط المكونات الخاصة';
    if (path.includes('layout')) return 'تخطيط الصفحة والهيكل العام';
    return 'أنماط مساعدة وإضافية';
}

function getCSSTargets(path) {
    if (path.includes('layout')) return 'الهيكل العام، الشبكة، والتخطيط';
    if (path.includes('form')) return 'الحقول، الأزرار، والنماذج';
    if (path.includes('nav')) return 'القوائم والتنقل';
    if (path.includes('button')) return 'الأزرار وتفاعلاتها';
    return 'عناصر عامة ومتنوعة';
}

// دوال تحليل HTML
function getHTMLPageType(path) {
    if (path.includes('index')) return 'الصفحة الرئيسية';
    if (path.includes('admin')) return 'لوحة التحكم';
    if (path.includes('login')) return 'صفحة تسجيل الدخول';
    if (path.includes('dashboard')) return 'لوحة الإحصائيات';
    return 'صفحة محتوى';
}

function getHTMLComponents(path) {
    if (path.includes('header')) return 'رأس الصفحة، شعار، قوائم';
    if (path.includes('footer')) return 'تذييل الصفحة، روابط، معلومات';
    if (path.includes('sidebar')) return 'الشريط الجانبي، التنقل الثانوي';
    return 'محتوى رئيسي وعناصر متنوعة';
}

// دوال تحليل JavaScript
function getJSPattern(path) {
    if (path.includes('module') || path.includes('class')) return 'برمجة كائنية التوجه (OOP)';
    if (path.includes('util') || path.includes('helper')) return 'وظائف مساعدة (Utility)';
    if (path.includes('component')) return 'مكونات UI';
    return 'برمجة إجرائية (Procedural)';
}

function getJSFunctions(path) {
    if (path.includes('api')) return 'الاتصال بالخوادم وAPIs';
    if (path.includes('event')) return 'معالجة الأحداث والتفاعلات';
    if (path.includes('util')) return 'وظائف مساعدة وعمليات';
    return 'وظائف عامة ومنطق تطبيقي';
}

// دوال تحليل JSON
function getJSONDataType(path) {
    if (path.includes('config')) return 'إعدادات التطبيق';
    if (path.includes('data')) return 'بيانات التطبيق';
    if (path.includes('i18n')) return 'ترجمة ونصوص';
    if (path.includes('package')) return 'إعدادات المشروع';
    return 'بيانات عامة';
}

function getJSONStructure(content) {
    try {
        const data = JSON.parse(content);
        if (Array.isArray(data)) return 'مصفوفة بيانات';
        return 'كائن بيانات';
    } catch(e) {
        return 'هيكل غير معروف';
    }
}

// إنشاء وصف تفصيلي للملف
function generateFileDescription(name, fullPath, fileType, content) {
    let description = "";
    
    switch(fileType) {
        case "css":
            description = `ملف أنماط CSS - ${getCSSRole(name)} - ${getCSSTargets(name)}`;
            if (content.includes('@media')) description += " - يحتوي على استعلامات وسائط للتصميم المتجاوب";
            if (content.includes('animation') || content.includes('@keyframes')) description += " - يحتوي على حركات وتفاعلات";
            if (content.includes('--')) description += " - يستخدم متغيرات CSS";
            break;
            
        case "html":
            description = `ملف هيكل HTML - ${getHTMLPageType(name)} - ${getHTMLComponents(name)}`;
            if (content.includes('<form')) description += " - يحتوي على نماذج إدخال";
            if (content.includes('<script')) description += " - يتضمن أكواد JavaScript";
            if (content.includes('<link rel="stylesheet"')) description += " - يستدعي ملفات أنماط خارجية";
            break;
            
      case "js":
    description = `ملف JavaScript - Vanilla JS - ${getJSPattern(name)} - ${getJSFunctions(name)}`;
    if (content.includes('function')) description += ` - يحتوي على ${countFunctions(content)} وظيفة`;
    if (content.includes('class')) description += " - يحتوي على فئات";
    if (content.includes('addEventListener')) description += " - يعالج أحداث المستخدم";
    if (content.includes('fetch') || content.includes('ajax')) description += " - يتواصل مع APIs خارجية";
    if (content.includes('import') || content.includes('require')) description += " - يستدعي وحدات خارجية";
    break;
            break;
            
        case "json":
            description = `ملف بيانات JSON - ${getJSONDataType(name)} - ${getJSONStructure(content)}`;
            try {
                const data = JSON.parse(content);
                description += ` - يحتوي على ${Object.keys(data).length} خاصية رئيسية`;
            } catch(e) {}
            break;
    }
    
    return description;
}

// تحليل هيكل HTML
function analyzeHTMLStructure(filePath, content) {
    // تحليل العناصر الدلالية
    const semanticElements = {
        header: (content.match(/<header/g) || []).length,
        nav: (content.match(/<nav/g) || []).length,
        main: (content.match(/<main/g) || []).length,
        section: (content.match(/<section/g) || []).length,
        article: (content.match(/<article/g) || []).length,
        aside: (content.match(/<aside/g) || []).length,
        footer: (content.match(/<footer/g) || []).length
    };
    
    fileAnalysis[filePath].semanticElements = semanticElements;
    fileAnalysis[filePath].semanticScore = calculateSemanticScore(semanticElements);
}

// حساب درجة الدلالية
function calculateSemanticScore(elements) {
    const totalElements = Object.values(elements).reduce((a, b) => a + b, 0);
    const semanticElements = totalElements - (elements.header + elements.footer);
    return totalElements > 0 ? (semanticElements / totalElements) * 100 : 0;
}

// حساب التعقيد
function calculateComplexity(fileType, content) {
    let score = 0;
    let level = 'منخفض';
    
    switch(fileType) {
        case 'js':
            // حساب التعقيد بناءً على عدد الدوال والاستيرادات
            const functions = (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(|class\s+\w+/g) || []).length;
            const imports = (content.match(/import\s+.*from/g) || []).length;
            score = functions + imports;
            break;
            
        case 'html':
            // حساب التعقيد بناءً على عدد العناصر والمكونات
            const elements = (content.match(/<[^>]+>/g) || []).length;
            const components = (content.match(/<[A-Z][A-Za-z0-9]*/g) || []).length;
            score = elements * 0.1 + components * 2;
            break;
            
        case 'css':
            // حساب التعقيد بناءً على عدد القواعد والمتغيرات
            const rules = (content.match(/[^{]+\{[^}]*\}/g) || []).length;
            const variables = (content.match(/--[a-z0-9-]+\s*:/g) || []).length;
            score = rules * 0.5 + variables;
            break;
            
        case 'json':
            // حساب التعقيد بناءً على حجم البيانات
            try {
                const data = JSON.parse(content);
                score = countKeys(data) * 0.1;
            } catch(e) {
                score = content.length * 0.001;
            }
            break;
    }
    
    if (score > 20) level = 'مرتفع';
    else if (score > 10) level = 'متوسط';
    
    return { score, level };
}

// دوال مساعدة إضافية
function getMainCSSFiles(files) {
    return Object.keys(files).filter(f => 
        f.includes('main') || f.includes('style') || f.includes('global')
    ).join(', ');
}

function countHTMLElements(content) {
    const matches = content.match(/<[^>]+>/g);
    return matches ? matches.length : 0;
}

function countJSFunctions(content) {
    return (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(|class\s+\w+/g) || []).length;
}

function countJSONKeys(content) {
    try {
        const data = JSON.parse(content);
        return countKeys(data);
    } catch(e) {
        return 'غير محدد';
    }
}

function getJSLibraries(files) {
    const libraries = projectStructure.techStack.libraries;
    return libraries.length > 0 ? libraries.join(', ') : "لم يتم اكتشاف مكتبات خارجية";
}


///////////////////




// تعديل دالة analyzeJSRelationsWithAST لمعالجة الأخطاء
function analyzeJSRelationsWithAST(filePath, content) {
    try {
        // التحقق من وجود generateAST
        if (typeof generateAST === 'undefined') {
            console.warn(`⚠️ generateAST غير معرفة - استخدام التحليل التقليدي للملف: ${filePath}`);
            analyzeJSRelations(filePath, content);
            return;
        }

        const ast = generateAST(content);
        if (!ast) {
            console.warn(`❌ فشل في إنشاء AST - استخدام التحليل التقليدي للملف: ${filePath}`);
            analyzeJSRelations(filePath, content);
            return;
        }

        // التحقق من وجود JSRelationAnalyzer
        if (typeof JSRelationAnalyzer === 'undefined') {
            console.warn(`⚠️ JSRelationAnalyzer غير معرفة - استخدام التحليل التقليدي`);
            analyzeJSRelations(filePath, content);
            return;
        }

        const analyzer = new JSRelationAnalyzer(ast, content, filePath);
        const relations = analyzer.analyze();
        
        // تحديث dependencyMap
        if (relations.json.length > 0) {
            dependencyMap.jsToJson[filePath] = relations.json;
        }
        if (relations.html.length > 0) {
            dependencyMap.jsToHtml[filePath] = relations.html;
        }
        if (relations.apis.length > 0) {
            projectStructure.dataFlows.push({
                file: filePath,
                apis: relations.apis,
                type: 'external'
            });
        }
        
        // تحديث نقاط الدخول
        if (relations.isEntryPoint) {
            projectStructure.entryPoints.push(filePath);
        }

        // كشف التقنيات
        detectJSTechStack(filePath, content);

    } catch (error) {
        console.error(`❌ خطأ في تحليل علاقات JS: ${filePath}`, error);
        // العودة إلى التحليل التقليدي في حالة الخطأ
        analyzeJSRelations(filePath, content);
    }
}

// الحفاظ على الدالة الأصلية كبديل
function analyzeJSRelations(filePath, content) {
    // اكتشاف استدعاءات JSON
    const jsonImports = content.match(/fetch\(['"]([^'"]*\.json)['"]\)|import\s+.*from\s+['"]([^'"]*\.json)['"]/g) || [];
    jsonImports.forEach(imp => {
        const match = imp.match(/['"]([^'"]*\.json)['"]/);
        if (match) {
            if (!dependencyMap.jsToJson[filePath]) {
                dependencyMap.jsToJson[filePath] = [];
            }
            dependencyMap.jsToJson[filePath].push(match[1]);
        }
    });
    
    // اكتشاف التلاعب بالـ DOM
    const domSelectors = content.match(/document\.(querySelector|getElementById|getElementsByClassName)\(['"]([^'"]*)['"]\)/g) || [];
    domSelectors.forEach(selector => {
        const match = selector.match(/\(['"]([^'"]*)['"]\)/);
        if (match) {
            if (!dependencyMap.jsToHtml[filePath]) {
                dependencyMap.jsToHtml[filePath] = [];
            }
            dependencyMap.jsToHtml[filePath].push(match[1]);
        }
    });
    
    // اكتشاف استدعاءات APIs
    const apiCalls = content.match(/(fetch|axios|XMLHttpRequest)\(['"]([^'"]*)['"]\)/g) || [];
    if (apiCalls.length > 0) {
        projectStructure.dataFlows.push({
            file: filePath,
            apis: apiCalls.map(api => {
                const match = api.match(/\(['"]([^'"]*)['"]\)/);
                return match ? match[1] : 'unknown';
            })
        });
    }
    
    // تحديد إذا كان ملف دخول رئيسي
    if (filePath.includes('index') || filePath.includes('main') || filePath.includes('app.')) {
        projectStructure.entryPoints.push(filePath);
    }
}