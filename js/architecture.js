// تحديث التحليل المعماري
function updateArchitectureAnalysis() {
    const container = document.getElementById("architectureAnalysis");
    
    let html = `
        <div class="analysis-section">
            <div class="analysis-title">🏗️ الهيكل المعماري للمشروع</div>
            <p><strong>اسم المشروع:</strong> ${projectName}</p>
            <p><strong>نوع المشروع:</strong> ${determineProjectType()}</p>
            <p><strong>التقنيات:</strong> Vanilla JavaScript فقط - بدون أطر عمل</p>
            <p><strong>نقاط الدخول:</strong> ${projectStructure.entryPoints.length}</p>
        </div>
        
    `;
    
    // قسم جديد لتحليل JSDoc
    const jsdocStats = calculateJSDocStatistics();
    html += `
        <div class="analysis-section">
            <div class="analysis-title">📝 تحليل توثيق JSDoc</div>
            <p><strong>نسبة التوثيق:</strong> ${jsdocStats.coverage}%</p>
            <p><strong>الدوال الموثقة:</strong> ${jsdocStats.documentedFunctions} من ${jsdocStats.totalFunctions}</p>
            <div class="complexity-meter">
                <div class="complexity-fill complexity-${jsdocStats.coverageLevel}" style="width: ${jsdocStats.coverage}%"></div>
            </div>
            <p><strong>جودة التوثيق:</strong></p>
            <ul>
                <li>✅ ممتاز: ${jsdocStats.quality.excellent}</li>
                <li>⚠️ جيد: ${jsdocStats.quality.good}</li>
                <li>🔶 مقبول: ${jsdocStats.quality.fair}</li>
                <li>❌ ضعيف: ${jsdocStats.quality.poor}</li>
            </ul>
        </div>
    `;
    
    html += `<div class="analysis-section">
            <div class="analysis-title">📊 إحصائيات الملفات</div>
            <p><strong>ملفات HTML:</strong> ${Object.keys(relations.html).length}</p>
            <p><strong>ملفات CSS:</strong> ${Object.keys(relations.css).length}</p>
            <p><strong>ملفات JavaScript:</strong> ${Object.keys(relations.js).length}</p>
            <p><strong>ملفات JSON:</strong> ${Object.keys(relations.json).length}</p>
            <p><strong>الإجمالي:</strong> ${Object.keys(fileAnalysis).length} ملف</p>
        </div>
    `;
    
    // تحليل التقنيات المستخدمة
    html += `
        <div class="analysis-section">
            <div class="analysis-title">🛠️ التقنيات المستخدمة</div>
            <p><strong>الأطر:</strong> Vanilla JavaScript فقط</p>
            ${projectStructure.techStack.libraries.length > 0 ? `<p><strong>المكتبات:</strong> ${projectStructure.techStack.libraries.join(', ')}</p>` : '<p><strong>المكتبات:</strong> لا توجد مكتبات خارجية</p>'}
            ${projectStructure.techStack.buildTools.length > 0 ? `<p><strong>أدوات البناء:</strong> ${projectStructure.techStack.buildTools.join(', ')}</p>` : ''}
            ${projectStructure.techStack.preprocessors.length > 0 ? `<p><strong>المعالجات المسبقة:</strong> ${projectStructure.techStack.preprocessors.join(', ')}</p>` : ''}
        </div>
    `;
    
    // تحليل التبعيات
    html += `
    <div class="analysis-section">
        <div class="analysis-title">🔗 تحليل التبعيات</div>
        <p><strong>تبعيات HTML → CSS:</strong> ${Object.keys(dependencyMap.htmlToCss).reduce((acc, key) => acc + dependencyMap.htmlToCss[key].length, 0)}</p>
        <p><strong>تبعيات HTML → JS:</strong> ${Object.keys(dependencyMap.htmlToJs).reduce((acc, key) => acc + dependencyMap.htmlToJs[key].length, 0)}</p>
        <p><strong>تبعيات JS → JSON:</strong> ${Object.keys(dependencyMap.jsToJson).reduce((acc, key) => acc + dependencyMap.jsToJson[key].length, 0)}</p>
    </div>
    `;
    
    // تحليل التعقيد
    const complexity = calculateProjectComplexity();
    html += `
    <div class="analysis-section">
        <div class="analysis-title">📈 تحليل التعقيد</div>
        <p><strong>مستوى التعقيد:</strong> ${complexity.level}</p>
        <div class="complexity-meter">
            <div class="complexity-fill complexity-${complexity.level}" style="width: ${(complexity.score / 10) * 100}%"></div>
        </div>
        <p><strong>التوصيات:</strong></p>
        <ul>
            ${generateArchitectureRecommendations().map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
    `;
    
    container.innerHTML = html;
}

// تحديد نوع المشروع
function determineProjectType() {
    const jsFiles = Object.keys(relations.js);
    const htmlFiles = Object.keys(relations.html);
    
    // مشروع Vanilla JavaScript فقط
    if (htmlFiles.length === 1 && htmlFiles[0].includes('index')) {
        return 'تطبيق صفحة واحدة (SPA) - Vanilla JS';
    }
    
    // تحقق إذا كان موقع تقليدي
    if (htmlFiles.length > 1) {
        return 'موقع ويب تقليدي - Vanilla JS';
    }
    
    return 'مشروع ويب - Vanilla JavaScript';
}

// كشف التقنيات المستخدمة في JavaScript
function detectJSTechStack(filePath, content) {
    // تأكيد استخدام Vanilla JavaScript فقط
    if (!projectStructure.techStack.frameworks.includes('Vanilla JavaScript')) {
        projectStructure.techStack.frameworks.push('Vanilla JavaScript');
    }
    
    // كشف المكتبات البسيطة فقط
    if (content.includes('jQuery') || content.includes('$(') || content.includes('jquery')) {
        if (!projectStructure.techStack.libraries.includes('jQuery')) {
            projectStructure.techStack.libraries.push('jQuery');
        }
    }
    
    if (content.includes('axios') || content.includes('Axios')) {
        if (!projectStructure.techStack.libraries.includes('Axios')) {
            projectStructure.techStack.libraries.push('Axios');
        }
    }
    
    // كشف إذا كان هناك استخدام لـ Web APIs متقدمة
    if (content.includes('fetch(') || content.includes('Promise') || content.includes('async')) {
        if (!projectStructure.techStack.libraries.includes('Modern Web APIs')) {
            projectStructure.techStack.libraries.push('Modern Web APIs');
        }
    }
}

// كشف التقنيات المستخدمة في CSS
function detectCSSTechStack(filePath, content) {
    // Sass/SCSS
    if (filePath.includes('.scss') || filePath.includes('.sass') || 
        content.includes('@mixin') || content.includes('@include')) {
        if (!projectStructure.techStack.preprocessors.includes('Sass')) {
            projectStructure.techStack.preprocessors.push('Sass');
        }
    }
    
    // Less
    if (filePath.includes('.less') || content.includes('@base-color')) {
        if (!projectStructure.techStack.preprocessors.includes('Less')) {
            projectStructure.techStack.preprocessors.push('Less');
        }
    }
    
    // CSS Variables (Custom Properties)
    if (content.includes('--') && content.includes('var(--')) {
        if (!projectStructure.techStack.libraries.includes('CSS Custom Properties')) {
            projectStructure.techStack.libraries.push('CSS Custom Properties');
        }
    }
}

// إنشاء تحليل معماري
function generateArchitectureAnalysis() {
    return {
        projectComplexity: calculateProjectComplexity(),
        recommendations: generateArchitectureRecommendations(),
        potentialIssues: detectPotentialIssues(),
        bestPractices: suggestBestPractices(),
        techStack: {
            type: 'Vanilla JavaScript',
            frameworks: projectStructure.techStack.frameworks,
            libraries: projectStructure.techStack.libraries
        }
    };
}

// حساب تعقيد المشروع
function calculateProjectComplexity() {
    let complexity = 0;
    
    // تعقيد بناءً على عدد الملفات
    complexity += Object.keys(fileAnalysis).length * 0.1;
    
    // تعقيد بناءً على عدد التبعيات
    complexity += Object.keys(dependencyMap.htmlToCss).length * 0.5;
    complexity += Object.keys(dependencyMap.htmlToJs).length * 0.5;
    complexity += Object.keys(dependencyMap.jsToJson).length * 0.3;
    
    // تعقيد بناءً على عدد الدوال
    complexity += Object.keys(functionAnalysis).length * 0.2;
    
    return {
        score: Math.min(complexity, 10),
        level: complexity > 7 ? 'مرتفع' : complexity > 4 ? 'متوسط' : 'منخفض'
    };
}

// إنشاء توصيات معمارية
function generateArchitectureRecommendations() {
    const recommendations = [];
    const totalFiles = Object.keys(fileAnalysis).length;
    
    // توصيات بناءً على عدد الملفات
    if (totalFiles > 50) {
        recommendations.push("✅ تقسيم المشروع إلى وحدات أصغر لتسهيل الصيانة");
    }
    
    // توصيات بناءً على التبعيات
    if (Object.keys(dependencyMap.htmlToJs).length > 10) {
        recommendations.push("✅ تنظيم ملفات JavaScript في وحدات منفصلة");
    }
    
    // توصيات بناءً على التعقيد
    const complexity = calculateProjectComplexity();
    if (complexity.level === 'مرتفع') {
        recommendations.push("✅ إعادة هيكلة الملفات المعقدة إلى وحدات أبسط");
    }
    
    return recommendations.length > 0 ? recommendations : ["✅ الهيكل الحالي جيد ولا يحتاج إلى تغييرات رئيسية"];
}

// كشف المشاكل المحتملة
function detectPotentialIssues() {
    const issues = [];
    
    // تحقق من وجود ملفات كبيرة
    Object.keys(fileAnalysis).forEach(filePath => {
        if (fileAnalysis[filePath].size > 100000) { // 100KB
            issues.push(`📁 الملف ${filePath} كبير الحجم (${(fileAnalysis[filePath].size / 1024).toFixed(1)}KB)`);
        }
    });
    
    // تحقق من التعقيد العالي
    Object.keys(fileAnalysis).forEach(filePath => {
        if (fileAnalysis[filePath].complexity.level === 'مرتفع') {
            issues.push(`⚙️ الملف ${filePath} معقد جدًا`);
        }
    });
    
    // تحقق من التبعيات غير المنظمة
    if (Object.keys(dependencyMap.htmlToJs).length > 15) {
        issues.push("🔗 عدد كبير من تبعيات JavaScript قد يؤثر على الأداء");
    }
    
    return issues.length > 0 ? issues : ["✅ لا توجد مشاكل رئيسية مكتشفة"];
}

// اقتراح أفضل الممارسات
function suggestBestPractices() {
    const practices = [
        "📝 استخدام JavaScript Modules لتقسيم الكود",
        "🎨 استخدام نظام تصميم متسق مع CSS Variables",
        "🔧 تنظيم الدوال في ملفات متخصصة",
        "📱 التأكد من استجابة التصميم لجميع الشاشات",
        "⚡ تحسين أداء التحميل للملفات الكبيرة",
        "🔒 تطبيق ممارسات الأمان في معالجة البيانات"
    ];
    
    return practices;
}

/**
 * حساب إحصائيات JSDoc
 */
function calculateJSDocStatistics() {
    let totalFunctions = 0;
    let documentedFunctions = 0;
    const quality = { excellent: 0, good: 0, fair: 0, poor: 0 };

    Object.keys(fileAnalysis).forEach(filePath => {
        const analysis = fileAnalysis[filePath];
        if (analysis.jsdoc && analysis.functions) {
            totalFunctions += analysis.functions.length;
            documentedFunctions += analysis.functions.filter(f => f.hasJSDoc).length;
            
            Object.keys(analysis.jsdoc.quality).forEach(level => {
                quality[level] += analysis.jsdoc.quality[level];
            });
        }
    });

    const coverage = totalFunctions > 0 ? Math.round((documentedFunctions / totalFunctions) * 100) : 0;
    const coverageLevel = coverage >= 80 ? 'low' : coverage >= 60 ? 'medium' : 'high'; // low = green, high = red

    return {
        totalFunctions,
        documentedFunctions,
        coverage,
        coverageLevel,
        quality
    };
}