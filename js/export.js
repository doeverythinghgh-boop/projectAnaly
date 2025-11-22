// تصدير حسب النوع مع شرح مفصل للذكاء الاصطناعي
function exportByType() {
    function generateDetailedContent(content, fileType, files) {
        let header = "";
        
        switch(fileType) {
            case "css":
                header = `/*
================================================================================
ملف تجميعي لجميع ملفات CSS في المشروع: ${projectName}
تم إنشاؤه تلقائياً بواسطة أداة تحليل مشاريع الويب المتقدمة
📌 ملاحظة: هذا المشروع يستخدم Vanilla JavaScript فقط بدون أي أطر عمل
تاريخ الإنشاء: ${new Date().toLocaleString('ar-EG')}
================================================================================

📋 نظرة عامة:
-------------
هذا الملف يحتوي على جميع أنماط CSS المستخدمة في المشروع
يشمل ملفات التصميم الرئيسية، الاستجابية، والمكونات

🔗 العلاقات بين الملفات:
------------------------
${generateDependencyAnalysis('css')}

🎯 أدوار الملفات:
----------------
${Object.keys(files).map(path => `
📁 ${path}:
   - الوظيفة: ${files[path]}
   - التأثير: ${getCSSRole(path)}
   - المكونات المستهدفة: ${getCSSTargets(path)}
`).join('')}

📊 إحصائيات:
-----------
- عدد ملفات CSS: ${Object.keys(files).length}
- إجمالي الأسطر: ${countLines(content)}
- الملفات الرئيسية: ${getMainCSSFiles(files)}

================================================================================
*/`;
                break;

            case "html":
                header = `<!--
================================================================================
ملف تجميعي لجميع ملفات HTML في المشروع: ${projectName}
تم إنشاؤه تلقائياً بواسطة أداة تحليل مشاريع الويب المتقدمة  
📌 ملاحظة: هذا المشروع يستخدم Vanilla JavaScript فقط بدون أي أطر عمل
تاريخ الإنشاء: ${new Date().toLocaleString('ar-EG')}
================================================================================

📋 نظرة عامة:
-------------
هذا الملف يحتوي على جميع هيكل المشروع (HTML)
يشمل الصفحات الرئيسية، المكونات، والقوالب

🔗 العلاقات بين الملفات:
------------------------
${generateDependencyAnalysis('html')}

🎯 أدوار الملفات:
----------------
${Object.keys(files).map(path => `
📁 ${path}:
   - الوظيفة: ${files[path]}
   - نوع الصفحة: ${getHTMLPageType(path)}
   - المكونات الرئيسية: ${getHTMLComponents(path)}
`).join('')}

📊 إحصائيات:
-----------
- عدد صفحات HTML: ${Object.keys(files).length}
- إجمالي العناصر: ${countHTMLElements(content)}

================================================================================
-->`;
                break;

            case "js":
                header = `/*
================================================================================
ملف تجميعي لجميع ملفات JavaScript في المشروع: ${projectName}
تم إنشاؤه تلقائياً بواسطة أداة تحليل مشاريع الويب المتقدمة
📌 ملاحظة: هذا المشروع يستخدم Vanilla JavaScript فقط بدون أي أطر عمل
تاريخ الإنشاء: ${new Date().toLocaleString('ar-EG')}
================================================================================

📋 نظرة عامة:
-------------
هذا الملف يحتوي على جميع منطق المشروع (JavaScript)
يشمل الوظائف، المعالجات، الاتصالات، والتفاعلات

🔗 العلاقات بين الملفات:
------------------------
${generateDependencyAnalysis('js')}

🎯 أدوار الملفات:
----------------
${Object.keys(files).map(path => `
📁 ${path}:
   - الوظيفة: ${files[path]}
   - النمط: Vanilla JavaScript - ${getJSPattern(path)}
   - الوظائف الرئيسية: ${getJSFunctions(path)}
`).join('')}

📊 إحصائيات:
-----------
- عدد ملفات JS: ${Object.keys(files).length}
- إجمالي الوظائف: ${countJSFunctions(content)}
- المكتبات المستخدمة: ${getJSLibraries(files)}

================================================================================
*/`;
                break;

            case "json":
                header = `/*
================================================================================
ملف تجميعي لجميع ملفات JSON في المشروع: ${projectName}
تم إنشاؤه تلقائياً بواسطة أداة تحليل مشاريع الويب المتقدمة
📌 ملاحظة: هذا المشروع يستخدم Vanilla JavaScript فقط بدون أي أطر عمل
تاريخ الإنشاء: ${new Date().toLocaleString('ar-EG')}
================================================================================

📋 نظرة عامة:
-------------
هذا الملف يحتوي على جميع بيانات المشروع (JSON)
يشمل الإعدادات، التهيئة، البيانات الثابتة، والترجمة

🔗 العلاقات بين الملفات:
------------------------
${generateDependencyAnalysis('json')}

🎯 أدوار الملفات:
----------------
${Object.keys(files).map(path => `
📁 ${path}:
   - الوظيفة: ${files[path]}
   - نوع البيانات: ${getJSONDataType(path)}
   - الهيكل: ${getJSONStructure(path)}
`).join('')}

📊 إحصائيات:
-----------
- عدد ملفات JSON: ${Object.keys(files).length}
- إجمالي مفاتيح البيانات: ${countJSONKeys(content)}

================================================================================
*/`;
                break;
        }

        return header + '\n\n' + content;
    }

    function generateDependencyAnalysis(fileType) {
        let analysis = "";
        
        switch(fileType) {
            case "html":
                if (Object.keys(dependencyMap.htmlToCss).length > 0) {
                    analysis += "- يستدعي ملفات CSS عبر <link rel=\"stylesheet\">\n";
                    for (let htmlFile in dependencyMap.htmlToCss) {
                        analysis += `  - ${htmlFile} → ${dependencyMap.htmlToCss[htmlFile].join(', ')}\n`;
                    }
                }
                if (Object.keys(dependencyMap.htmlToJs).length > 0) {
                    analysis += "- يستدعي ملفات JavaScript عبر <script>\n";
                    for (let htmlFile in dependencyMap.htmlToJs) {
                        analysis += `  - ${htmlFile} → ${dependencyMap.htmlToJs[htmlFile].join(', ')}\n`;
                    }
                }
                break;
                
            case "css":
                analysis += "- يتم استدعاؤها من قبل ملفات HTML\n";
                for (let htmlFile in dependencyMap.htmlToCss) {
                    dependencyMap.htmlToCss[htmlFile].forEach(cssFile => {
                        analysis += `  - ${htmlFile} ← ${cssFile}\n`;
                    });
                }
                break;
                
            case "js":
                analysis += "- يتم استدعاؤها من قبل ملفات HTML\n";
                for (let htmlFile in dependencyMap.htmlToJs) {
                    dependencyMap.htmlToJs[htmlFile].forEach(jsFile => {
                        analysis += `  - ${htmlFile} ← ${jsFile}\n`;
                    });
                }
                break;
        }
        
        return analysis || "- لا توجد علاقات خارجية محددة";
    }

    function saveFile(content, name, type, fileType, files) {
        if (!content.trim()) {
            alert(`لا يوجد محتوى لملفات ${name.split('.')[0]}`);
            return;
        }
        
        let detailedContent = generateDetailedContent(content, fileType, files);
        let blob = new Blob([detailedContent], { type: "text/plain" });
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
    }

    saveFile(cssContent, "all-css-with-detailed-analysis.txt", "text/plain", "css", relations.css);
    saveFile(htmlContent, "all-html-with-detailed-analysis.txt", "text/plain", "html", relations.html);
    saveFile(jsContent, "all-js-with-detailed-analysis.txt", "text/plain", "js", relations.js);
    saveFile(jsonContent, "all-json-with-detailed-analysis.txt", "text/plain", "json", relations.json);
}

// تصدير TXT
function exportTxt() {
    let content = document.getElementById("output").value;
    if (!content.trim()) {
        alert("لا يوجد محتوى للتصدير");
        return;
    }
    
    let blob = new Blob([content], { type:"text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "all-project.txt";
    a.click();
}

// تصدير MD
function exportMd() {
    let content = document.getElementById("output").value;
    if (!content.trim()) {
        alert("لا يوجد محتوى للتصدير");
        return;
    }
    
    let blob = new Blob([content], { type:"text/markdown" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "all-project.md";
    a.click();
}

// تصدير خريطة العلاقات
function exportRelations() {
    const relationData = {
        project: projectName,
        timestamp: new Date().toISOString(),
        dependencies: dependencyMap,
        structure: projectStructure,
        files: {
            html: Object.keys(relations.html),
            css: Object.keys(relations.css),
            js: Object.keys(relations.js),
            json: Object.keys(relations.json)
        },
        analysis: {
            totalFiles: Object.keys(fileAnalysis).length,
            totalLines: document.getElementById("lineCount").textContent,
            totalSize: document.getElementById("totalSize").textContent,
            functionCount: Object.keys(functionAnalysis).length,
            componentCount: Object.keys(componentAnalysis).length
        }
    };
    
    const content = JSON.stringify(relationData, null, 2);
    downloadFile(content, "project-relations-map.json", "application/json");
}

// تصدير الهيكل المعماري
function exportArchitecture() {
    const architectureData = {
        project: projectName,
        timestamp: new Date().toISOString(),
        type: determineProjectType(),
        techStack: projectStructure.techStack,
        entryPoints: projectStructure.entryPoints,
        fileStats: {
            html: Object.keys(relations.html).length,
            css: Object.keys(relations.css).length,
            js: Object.keys(relations.js).length,
            json: Object.keys(relations.json).length
        },
        dependencies: {
            htmlToCss: Object.keys(dependencyMap.htmlToCss).length,
            htmlToJs: Object.keys(dependencyMap.htmlToJs).length,
            jsToJson: Object.keys(dependencyMap.jsToJson).length
        },
        analysis: generateArchitectureAnalysis()
    };
    
    const content = JSON.stringify(architectureData, null, 2);
    downloadFile(content, "project-architecture.json", "application/json");
}

// 🔄 دوال تصدير جديدة للـ AI Agent

// تصدير هيكل المشروع الكامل
function exportProjectStructure() {
    const structureData = {
        projectName: projectName,
        timestamp: new Date().toISOString(),
        fileTree: generateCompleteFileTree(),
        entryPoints: projectStructure.entryPoints,
        architecture: {
            type: determineProjectType(),
            complexity: calculateProjectComplexity(),
            patterns: detectArchitecturePatterns()
        },
        dependencies: dependencyMap,
        techStack: projectStructure.techStack,
        analysis: {
            totalFiles: Object.keys(fileAnalysis).length,
            totalLines: document.getElementById("lineCount").textContent,
            totalSize: document.getElementById("totalSize").textContent,
            functionCount: Object.keys(functionAnalysis).length,
            componentCount: Object.keys(componentAnalysis).length
        }
    };
    
    const content = JSON.stringify(structureData, null, 2);
    downloadFile(content, "project-structure-analysis.json", "application/json");
}

// تصدير تحليل الدوال والعلاقات
function exportFunctionAnalysis() {
    const analysisData = {
        functions: functionAnalysis,
        components: componentAnalysis,
        fileDependencies: fileDependencies,
        functionDependencies: functionDependencies,
        callHierarchy: generateCallHierarchy(),
        dataFlows: projectStructure.dataFlows
    };
    
    const content = JSON.stringify(analysisData, null, 2);
    downloadFile(content, "function-dependency-analysis.json", "application/json");
}

// تصدير تحليل الإعدادات
function exportConfigAnalysis() {
    const configData = {
        packageJson: findAndAnalyzePackageJson(),
        configFiles: findConfigFiles(),
        buildTools: detectBuildTools(),
        devDependencies: analyzeDevDependencies()
    };
    
    const content = JSON.stringify(configData, null, 2);
    downloadFile(content, "project-config-analysis.json", "application/json");
}

// تصدير تقرير شامل
function exportComprehensiveReport() {
    const report = `# 📊 التقرير الشامل للمشروع: ${projectName}

## 🏗️ الهيكل المعماري
${generateArchitectureReport()}

## 🔗 العلاقات والتبعيات
${generateDependencyReport()}

## ⚙️ التقنيات المستخدمة
${generateTechStackReport()}

## 📈 الإحصائيات
${generateStatisticsReport()}

## 🎯 التوصيات
${generateRecommendationsReport()}

## 🔍 نقاط الدخول الرئيسية
${generateEntryPointsReport()}

## 🤖 ملاحظات للـ AI Agent
${generateAIAgentNotes()}

## 📝 ملاحظات التطوير
- 🔧 المشروع يستخدم Vanilla JavaScript فقط
- 🎯 لا توجد أطر عمل خارجية
- 📁 الهيكل: ${determineProjectType()}
- ⚡ التعقيد: ${calculateProjectComplexity().level}
    `;
    
    downloadFile(report, "comprehensive-project-report.md", "text/markdown");
}



// دالة مساعدة للتحميل
function downloadFile(content, filename, mimeType) {
    let blob = new Blob([content], { type: mimeType });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

// 🔧 دوال مساعدة جديدة

function generateCompleteFileTree() {
    return document.getElementById("treeView").innerHTML;
}

function detectArchitecturePatterns() {
    const patterns = [];
    if (Object.keys(componentAnalysis).length > 0) patterns.push("مكونات UI");
    if (Object.keys(functionAnalysis).length > 10) patterns.push("وظائف مساعدة");
    if (projectStructure.dataFlows.length > 0) patterns.push("تدفق بيانات");
    return patterns.length > 0 ? patterns : ["هيكل تقليدي"];
}

function generateCallHierarchy() {
    const hierarchy = {};
    Object.keys(functionAnalysis).forEach(funcName => {
        hierarchy[funcName] = {
            calls: functionAnalysis[funcName].calls,
            calledBy: findFunctionCallers(funcName)
        };
    });
    return hierarchy;
}

function findFunctionCallers(functionName) {
    const callers = [];
    Object.keys(functionAnalysis).forEach(func => {
        if (functionAnalysis[func].dependencies && 
            functionAnalysis[func].dependencies.includes(functionName)) {
            callers.push(func);
        }
    });
    return callers;
}

function findAndAnalyzePackageJson() {
    // البحث عن package.json وتحليله
    for (let filePath in relations.json) {
        if (filePath.includes('package.json')) {
            return { exists: true, path: filePath };
        }
    }
    return { exists: false };
}

function findConfigFiles() {
    const configFiles = [];
    Object.keys(fileAnalysis).forEach(filePath => {
        if (filePath.includes('config') || filePath.includes('.config.') || 
            filePath.includes('webpack') || filePath.includes('babel')) {
            configFiles.push(filePath);
        }
    });
    return configFiles;
}

function detectBuildTools() {
    const tools = [];
    const allFiles = Object.keys(fileAnalysis);
    if (allFiles.some(f => f.includes('webpack'))) tools.push("Webpack");
    if (allFiles.some(f => f.includes('gulp'))) tools.push("Gulp");
    if (allFiles.some(f => f.includes('grunt'))) tools.push("Grunt");
    return tools.length > 0 ? tools : ["لا توجد أدوات بناء محددة"];
}

function analyzeDevDependencies() {
    // تحليل تبعيات التطوير
    return {
        hasPackageJson: findAndAnalyzePackageJson().exists,
        buildTools: detectBuildTools(),
        configFiles: findConfigFiles().length
    };
}


function generateDependencyReport() {
    return `
- **HTML → CSS:** ${Object.keys(dependencyMap.htmlToCss).length} علاقة
- **HTML → JS:** ${Object.keys(dependencyMap.htmlToJs).length} علاقة  
- **JS → JSON:** ${Object.keys(dependencyMap.jsToJson).length} علاقة
- **إجمالي التبعيات:** ${Object.keys(dependencyMap.htmlToCss).length + Object.keys(dependencyMap.htmlToJs).length + Object.keys(dependencyMap.jsToJson).length}
    `;
}

function generateTechStackReport() {
    return `
- **الأطر:** ${projectStructure.techStack.frameworks.join(', ') || 'لا يوجد'}
- **المكتبات:** ${projectStructure.techStack.libraries.join(', ') || 'لا يوجد'}
- **أدوات البناء:** ${projectStructure.techStack.buildTools.join(', ') || 'لا يوجد'}
- **المعالجات المسبقة:** ${projectStructure.techStack.preprocessors.join(', ') || 'لا يوجد'}
    `;
}

function generateStatisticsReport() {
    return `
- **الملفات الإجمالية:** ${Object.keys(fileAnalysis).length}
- **الأسطر الإجمالية:** ${document.getElementById("lineCount").textContent}
- **الحجم الإجمالي:** ${document.getElementById("totalSize").textContent}
- **عدد الدوال:** ${Object.keys(functionAnalysis).length}
- **عدد المكونات:** ${Object.keys(componentAnalysis).length}
    `;
}

function generateRecommendationsReport() {
    const recommendations = generateArchitectureRecommendations();
    return recommendations.map(rec => `- ${rec}`).join('\n');
}

function generateEntryPointsReport() {
    return projectStructure.entryPoints.map(entry => `- ${entry}`).join('\n') || '- لا توجد نقاط دخول محددة';
}


// تحديث دوال التصدير لتشمل تحليل AST
function generateAIAgentNotes() {
    const astStats = calculateASTStatistics();
    const dataFlowStats = calculateDataFlowStatistics();
    
    return `
## 🎯 تعليمات للـ AI Agent:

### التحليل المتقدم المستخدم:
- 🔧 تحليل شجرة التجريد النحوية (AST) لملفات JavaScript
- 📊 تحليل تدفق البيانات للتبعيات غير المباشرة
- 🎯 اكتشاف الاستدعاءات الدقيقة باستخدام Variable Mapping
- 🔍 تحليل تدفق البيانات للتبعيات غير المباشرة

### إحصائيات التحليل المتقدم:
${astStats}

### نماذج التبعيات غير المباشرة المكتشفة:
${generateIndirectDependenciesReport()}

### تحليل تدفق البيانات:
${dataFlowStats}

### ملاحظات تقنية:
- المشروع يستخدم Vanilla JavaScript فقط
- تم استخدام تحليل AST متقدم لاكتشاف التبعيات الدقيقة
- تحليل تدفق البيانات يكتشف التبعيات غير المباشرة مثل: 
  const func = generatePurchaseItemHTML; func(item);
- نظام Variable Mapping يتتبع تعيينات الدوال والمتغيرات
    `;
}

function calculateASTStatistics() {
    let totalFunctions = 0;
    let totalDependencies = 0;
    let astAnalyzedFiles = 0;
    let indirectDependencies = 0;

    Object.keys(fileAnalysis).forEach(filePath => {
        const analysis = fileAnalysis[filePath];
        if (analysis.astAnalysis) {
            astAnalyzedFiles++;
            totalFunctions += analysis.functions.length;
            totalDependencies += analysis.dependencies.length;
            
            if (analysis.dataFlow) {
                indirectDependencies += analysis.dataFlow.dataDependencies.length;
            }
        }
    });

    return `
- الملفات المحللة بـ AST: ${astAnalyzedFiles}
- إجمالي الدوال المكتشفة: ${totalFunctions}
- إجمالي التبعيات المباشرة: ${totalDependencies}
- التبعيات غير المباشرة: ${indirectDependencies}
- متوسط التعقيد: ${calculateAverageComplexity()}
    `;
}

function calculateDataFlowStatistics() {
    let totalVariableAssignments = 0;
    let totalFunctionCalls = 0;
    let totalDataDependencies = 0;

    Object.keys(fileAnalysis).forEach(filePath => {
        const analysis = fileAnalysis[filePath];
        if (analysis.dataFlow) {
            totalVariableAssignments += analysis.dataFlow.variableAssignments.length;
            totalFunctionCalls += analysis.dataFlow.functionCalls.length;
            totalDataDependencies += analysis.dataFlow.dataDependencies.length;
        }
    });

    return `
- تعيينات المتغيرات: ${totalVariableAssignments}
- استدعاءات الدوال: ${totalFunctionCalls}
- تبعيات البيانات: ${totalDataDependencies}
    `;
}

function generateIndirectDependenciesReport() {
    const indirectDeps = [];
    
    Object.keys(fileAnalysis).forEach(filePath => {
        const analysis = fileAnalysis[filePath];
        if (analysis.dataFlow) {
            analysis.dataFlow.dataDependencies.forEach(dep => {
                if (dep.type === 'indirect') {
                    indirectDeps.push(dep);
                }
            });
        }
        
        // البحث عن تبعيات غير مباشرة في dependencies العادية
        if (analysis.dependencies) {
            analysis.dependencies.forEach(dep => {
                if (typeof dep === 'string' && dep.includes('indirect:')) {
                    indirectDeps.push({
                        type: 'string-indirect',
                        evidence: dep
                    });
                }
            });
        }
    });
    
    if (indirectDeps.length === 0) {
        return '- لا توجد تبعيات غير مباشرة مكتشفة';
    }
    
    return indirectDeps.map(dep => {
        if (dep.type === 'indirect') {
            return `- ${dep.caller} → ${dep.actualTarget} (${dep.evidence})`;
        } else {
            return `- ${dep.evidence}`;
        }
    }).join('\n');
}

function calculateAverageComplexity() {
    let totalComplexity = 0;
    let fileCount = 0;

    Object.keys(fileAnalysis).forEach(filePath => {
        const analysis = fileAnalysis[filePath];
        if (analysis.complexity && analysis.complexity.score) {
            totalComplexity += analysis.complexity.score;
            fileCount++;
        }
    });

    return fileCount > 0 ? (totalComplexity / fileCount).toFixed(2) : '0';
}

// تحديث التقرير الشامل
function generateArchitectureReport() {
    const astStats = calculateASTStatistics();
    
    return `
- **نوع المشروع:** ${determineProjectType()}
- **نقاط الدخول:** ${projectStructure.entryPoints.length}
- **نمط العمارة:** ${detectArchitecturePatterns().join(', ')}
- **مستوى التعقيد:** ${calculateProjectComplexity().level}
- **التقنيات:** ${projectStructure.techStack.frameworks.join(', ') || 'Vanilla JavaScript'}
- **التحليل المستخدم:** AST + تحليل تدفق البيانات
- **إحصائيات AST:** ${astStats.split('\n').slice(1).join('\n')}
    `;
}

// إضافة تحليل متقدم في تصدير العلاقات
function exportAdvancedAnalysis() {
    const advancedAnalysis = {
        project: projectName,
        timestamp: new Date().toISOString(),
        astAnalysis: {},
        dataFlowAnalysis: {},
        indirectDependencies: [],
        techStack: projectStructure.techStack
    };

    // جمع بيانات AST
    Object.keys(fileAnalysis).forEach(filePath => {
        const analysis = fileAnalysis[filePath];
        if (analysis.astAnalysis) {
            advancedAnalysis.astAnalysis[filePath] = analysis.astAnalysis;
        }
        if (analysis.dataFlow) {
            advancedAnalysis.dataFlowAnalysis[filePath] = analysis.dataFlow;
        }
    });

    // جمع التبعيات غير المباشرة
    advancedAnalysis.indirectDependencies = findAllIndirectDependencies();

    const content = JSON.stringify(advancedAnalysis, null, 2);
    downloadFile(content, "advanced-ast-analysis.json", "application/json");
}

function findAllIndirectDependencies() {
    const indirectDeps = [];
    
    Object.keys(fileAnalysis).forEach(filePath => {
        const analysis = fileAnalysis[filePath];
        
        if (analysis.dataFlow) {
            analysis.dataFlow.dataDependencies.forEach(dep => {
                if (dep.type === 'indirect') {
                    indirectDeps.push({
                        file: filePath,
                        ...dep
                    });
                }
            });
        }
        
        if (analysis.dependencies) {
            analysis.dependencies.forEach(dep => {
                if (typeof dep === 'string' && dep.startsWith('indirect:')) {
                    indirectDeps.push({
                        file: filePath,
                        type: 'string-indirect',
                        dependency: dep.replace('indirect:', '')
                    });
                }
            });
        }
    });
    
    return indirectDeps;
}

/**
 * تصدير تحليل JSDoc كملف منفصل
 */
function exportJSDocAnalysis() {
    const jsdocData = {
        project: projectName,
        timestamp: new Date().toISOString(),
        files: {},
        summary: {
            totalFunctions: 0,
            documentedFunctions: 0,
            coverage: 0,
            qualityBreakdown: {
                excellent: 0,
                good: 0,
                fair: 0,
                poor: 0
            }
        }
    };

    Object.keys(fileAnalysis).forEach(filePath => {
        const analysis = fileAnalysis[filePath];
        
        if (analysis.jsdoc && analysis.functions && analysis.functions.length > 0) {
            jsdocData.files[filePath] = {
                functions: analysis.functions,
                jsdoc: analysis.jsdoc,
                coverage: analysis.jsdoc.coverage
            };
            
            jsdocData.summary.totalFunctions += analysis.functions.length;
            jsdocData.summary.documentedFunctions += analysis.functions.filter(f => f.hasJSDoc).length;
            
            // تجميع إحصائيات الجودة
            if (analysis.jsdoc.quality) {
                Object.keys(analysis.jsdoc.quality).forEach(level => {
                    if (jsdocData.summary.qualityBreakdown.hasOwnProperty(level)) {
                        jsdocData.summary.qualityBreakdown[level] += analysis.jsdoc.quality[level];
                    }
                });
            }
        }
    });

    // حساب النسب المئوية
    jsdocData.summary.coverage = jsdocData.summary.totalFunctions > 0 ? 
        Math.round((jsdocData.summary.documentedFunctions / jsdocData.summary.totalFunctions) * 100) : 0;

    const content = JSON.stringify(jsdocData, null, 2);
    downloadFile(content, "jsdoc-analysis.json", "application/json");
}

/**
 * إنشاء تقرير JSDoc تفصيلي
 */
function generateJSDocReport() {
    let report = `# 📊 تقرير تحليل JSDoc للمشروع: ${projectName}\n\n`;
    report += `**تاريخ الإنشاء:** ${new Date().toLocaleString('ar-EG')}\n\n`;

    let totalFunctions = 0;
    let documentedFunctions = 0;

    Object.keys(fileAnalysis).forEach(filePath => {
        const analysis = fileAnalysis[filePath];
        
        if (analysis.jsdoc && analysis.functions && analysis.functions.length > 0) {
            totalFunctions += analysis.functions.length;
            documentedFunctions += analysis.functions.filter(f => f.hasJSDoc).length;
        }
    });

    // الملخص العام
    const coverage = totalFunctions > 0 ? Math.round((documentedFunctions / totalFunctions) * 100) : 0;
    
    report += `# 📈 ملخص عام\n\n`;
    report += `- **إجمالي الدوال:** ${totalFunctions}\n`;
    report += `- **الدوال الموثقة:** ${documentedFunctions}\n`;
    report += `- **نسبة التغطية الإجمالية:** ${coverage}%\n`;
    report += `- **التوصية:** ${coverage >= 80 ? '✅ ممتاز' : coverage >= 60 ? '⚠️ يحتاج تحسين' : '❌ ضعيف'}\n`;

    downloadFile(report, "jsdoc-comprehensive-report.md", "text/markdown");
}

/**
 * تحديث دالة exportForAIAgent لتضمين تحليل JSDoc
 */
function exportForAIAgent() {
    // الملفات الأساسية الحالية
    exportByType();
    
    // الملفات الجديدة للـ AI Agent مع JSDoc
    exportProjectStructure();
    exportFunctionAnalysis();
    exportConfigAnalysis();
    exportComprehensiveReport();
    exportRelations();
    exportArchitecture();
    exportAdvancedAnalysis(); // جديد
    exportJSDocAnalysis(); // جديد
    generateJSDocReport(); // جديد
    
    alert("✅ تم تصدير جميع ملفات التحليل المتقدم للـ AI Agent بما في ذلك تحليل JSDoc!");
}