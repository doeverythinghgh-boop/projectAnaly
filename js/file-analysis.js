// تحليل HTML باستخدام parser مبسط ومستقر
function analyzeHTMLRelationsWithAST(filePath, content) {
    try {
        const analyzer = new SimpleHTMLAnalyzer(content, filePath);
        const relations = analyzer.analyze();
        
        // تحديث dependencyMap
        if (relations.css && relations.css.length > 0) {
            dependencyMap.htmlToCss[filePath] = relations.css;
        }
        if (relations.js && relations.js.length > 0) {
            dependencyMap.htmlToJs[filePath] = relations.js;
        }
        if (relations.components) {
            projectStructure.components[filePath] = relations.components;
        }
        
        // تحديث نقاط الدخول
        if (relations.isEntryPoint) {
            projectStructure.entryPoints.push(filePath);
        }
    } catch (error) {
        console.error(`❌ خطأ في تحليل HTML: ${filePath}`, error);
        // استخدام التحليل الأساسي كبديل
        analyzeHTMLRelationsBasic(filePath, content);
    }
}

// محلل HTML مبسط ومستقر
class SimpleHTMLAnalyzer {
    constructor(content, filePath) {
        this.content = content;
        this.filePath = filePath;
        this.cssLinks = [];
        this.jsScripts = [];
        this.components = {
            ids: [],
            classes: [],
            elements: []
        };
        this.isEntryPoint = false;
    }

    analyze() {
        try {
            this.analyzeLinksAndScripts();
            this.analyzeComponents();
            this.detectEntryPoint();
            
            return {
                css: this.cssLinks,
                js: this.jsScripts,
                components: this.components,
                isEntryPoint: this.isEntryPoint
            };
        } catch (error) {
            console.error(`❌ خطأ في تحليل HTML للملف ${this.filePath}:`, error);
            return {
                css: [],
                js: [],
                components: {ids: [], classes: [], elements: []},
                isEntryPoint: false
            };
        }
    }

    analyzeLinksAndScripts() {
        // تحليل CSS links بأنماط مختلفة
        const cssPatterns = [
            /<link[^>]*rel=("|')stylesheet\1[^>]*href=("|')([^"']+\.css)\2[^>]*>/gi,
            /<link[^>]*href=("|')([^"']+\.css)\1[^>]*rel=("|')stylesheet\3[^>]*>/gi
        ];

        cssPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(this.content)) !== null) {
                const href = match[3] || match[2];
                if (href && !this.cssLinks.includes(href)) {
                    this.cssLinks.push(href);
                }
            }
        });

        // تحليل JavaScript scripts
        const jsPatterns = [
            /<script[^>]*src=("|')([^"']+\.js)\1[^>]*>/gi,
            /<script[^>]*type=("|')module\1[^>]*src=("|')([^"']+\.js)\2[^>]*>/gi
        ];

        jsPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(this.content)) !== null) {
                const src = match[2] || match[3];
                if (src && !this.jsScripts.includes(src)) {
                    this.jsScripts.push(src);
                }
            }
        });
    }

    analyzeComponents() {
        // تحليل IDs
        const idRegex = /id=("|')([^"']+)\1/gi;
        let match;
        while ((match = idRegex.exec(this.content)) !== null) {
            if (match[2] && !this.components.ids.includes(match[2])) {
                this.components.ids.push(match[2]);
            }
        }
        
        // تحليل Classes
        const classRegex = /class=("|')([^"']+)\1/gi;
        while ((match = classRegex.exec(this.content)) !== null) {
            if (match[2]) {
                const classes = match[2].split(/\s+/).filter(c => c.trim());
                classes.forEach(className => {
                    if (className && !this.components.classes.includes(className)) {
                        this.components.classes.push(className);
                    }
                });
            }
        }
        
        // تحليل العناصر المخصصة
        const customElementRegex = /<([a-z]+-[a-z-]+)[^>]*>/gi;
        while ((match = customElementRegex.exec(this.content)) !== null) {
            if (match[1] && !this.components.elements.includes(match[1])) {
                this.components.elements.push(match[1]);
            }
        }
    }

    detectEntryPoint() {
        this.isEntryPoint = 
            this.filePath.includes('index.') ||
            this.filePath.includes('main.') ||
            this.filePath.includes('app.') ||
            this.content.includes('<!DOCTYPE html>') ||
            this.content.includes('<html') ||
            this.jsScripts.length > 2;
    }
}

// تحليل HTML أساسي كبديل
function analyzeHTMLRelationsBasic(filePath, content) {
    const cssLinks = [];
    const jsScripts = [];
    
    // اكتشاف CSS links بسيط
    const cssMatches = content.match(/<link[^>]*\.css[^>]*>/g) || [];
    cssMatches.forEach(link => {
        const hrefMatch = link.match(/href=("|')([^"']+)\.css\1/);
        if (hrefMatch) {
            cssLinks.push(hrefMatch[2] + '.css');
        }
    });
    
    // اكتشاف JS scripts بسيط
    const jsMatches = content.match(/<script[^>]*\.js[^>]*>/g) || [];
    jsMatches.forEach(script => {
        const srcMatch = script.match(/src=("|')([^"']+)\.js\1/);
        if (srcMatch) {
            jsScripts.push(srcMatch[2] + '.js');
        }
    });
    
    // تحديث dependencyMap
    if (cssLinks.length > 0) {
        dependencyMap.htmlToCss[filePath] = cssLinks;
    }
    if (jsScripts.length > 0) {
        dependencyMap.htmlToJs[filePath] = jsScripts;
    }
    
    // تحديد نقاط الدخول
    if (filePath.includes('index') || filePath.includes('main')) {
        projectStructure.entryPoints.push(filePath);
    }
}

// تحديث دالة analyzeFileRelations لاستخدام المحلل المبسط
function analyzeFileRelations(filePath, fileType, content) {
    try {
        switch(fileType) {
            case "html":
                analyzeHTMLRelationsWithAST(filePath, content);
                break;
            case "css":
                analyzeCSSRelations(filePath, content);
                break;
            case "js":
                analyzeJSRelations(filePath, content); // استخدام الدالة الأساسية
                break;
            case "json":
                analyzeJSONRelations(filePath, content);
                break;
        }
    } catch (error) {
        console.error(`❌ خطأ في تحليل العلاقات للملف ${filePath}:`, error);
        // استخدام الدوال الأساسية كبديل
        switch(fileType) {
            case "html":
                analyzeHTMLRelationsBasic(filePath, content);
                break;
            case "css":
                // الدالة الأساسية موجودة بالفعل
                break;
            case "js":
                // الدالة الأساسية موجودة بالفعل
                break;
            case "json":
                // الدالة الأساسية موجودة بالفعل
                break;
        }
    }
}

// الحفاظ على الدوال الأخرى كما هي مع إضافة معالجة الأخطاء
function analyzeCSSRelations(filePath, content) {
    try {
        // ... الكود الأصلي مع إضافة try/catch
    } catch (error) {
        console.error(`❌ خطأ في تحليل CSS للملف ${filePath}:`, error);
    }
}

function analyzeJSRelations(filePath, content) {
    try {
        // ... الكود الأصلي مع إضافة try/catch
    } catch (error) {
        console.error(`❌ خطأ في تحليل JS للملف ${filePath}:`, error);
    }
}

function analyzeJSONRelations(filePath, content) {
    try {
        // ... الكود الأصلي مع إضافة try/catch
    } catch (error) {
        console.error(`❌ خطأ في تحليل JSON للملف ${filePath}:`, error);
    }
}