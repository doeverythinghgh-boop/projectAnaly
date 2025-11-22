// Search functionalities will be implemented here.
// البحث عن الملفات
function searchFiles() {
    const searchTerm = document.getElementById("fileSearchInput").value.trim();
    if (!searchTerm) {
        alert('يرجى إدخال مصطلح البحث');
        return;
    }
    
    const results = performFileSearch(searchTerm);
    displayFileSearchResults(results, searchTerm);
}

// تنفيذ البحث في الملفات
function performFileSearch(searchTerm) {
    const results = {
        exactMatches: [],
        partialMatches: [],
        extensionMatches: [],
        dependencyMatches: []
    };
    
    Object.keys(fileAnalysis).forEach(filePath => {
        const fileName = filePath.split('/').pop();
        
        // مطابقة تامة
        if (fileName === searchTerm || filePath === searchTerm) {
            results.exactMatches.push(filePath);
        }
        
        // مطابقة جزئية
        if (fileName.includes(searchTerm) || filePath.includes(searchTerm)) {
            results.partialMatches.push(filePath);
        }
        
        // مطابقة الامتداد
        if (searchTerm.startsWith('.') && fileName.endsWith(searchTerm)) {
            results.extensionMatches.push(filePath);
        }
        
        // البحث في التبعيات
        const fileDeps = fileAnalysis[filePath].dependencies || [];
        const hasDependency = fileDeps.some(dep => 
            (dep.source && dep.source.includes(searchTerm)) || 
            (dep.imports && dep.imports.some(i => i.includes(searchTerm)))
        );
        
        if (hasDependency) {
            results.dependencyMatches.push(filePath);
        }
    });
    
    // إزالة التكرارات
    results.partialMatches = results.partialMatches.filter(file => !results.exactMatches.includes(file));
    results.extensionMatches = results.extensionMatches.filter(file => !results.exactMatches.includes(file) && !results.partialMatches.includes(file));
    results.dependencyMatches = results.dependencyMatches.filter(file => !results.exactMatches.includes(file) && !results.partialMatches.includes(file) && !results.extensionMatches.includes(file));
    
    return results;
}

// عرض نتائج البحث عن الملفات
function displayFileSearchResults(results, searchTerm) {
    const container = document.getElementById("fileSearchResults");
    let html = `<h4>نتائج البحث عن: "${searchTerm}"</h4>`;
    
    if (results.exactMatches.length === 0 && results.partialMatches.length === 0 && 
        results.extensionMatches.length === 0 && results.dependencyMatches.length === 0) {
        html += `<p>❌ لم يتم العثور على نتائج مطابقة</p>`;
    } else {
        // المطابقات التامة
        if (results.exactMatches.length > 0) {
            html += `<div class="search-result-item">
                <div class="search-result-header">✅ مطابقات تامة</div>
                <ul class="function-list">`;
            results.exactMatches.forEach(file => {
                html += `<li onclick="openFile('${file}')" style="cursor: pointer;">📄 ${file}</li>`;
            });
            html += `</ul></div>`;
        }
        
        // المطابقات الجزئية
        if (results.partialMatches.length > 0) {
            html += `<div class="search-result-item">
                <div class="search-result-header">🔍 مطابقات جزئية</div>
                <ul class="function-list">`;
            results.partialMatches.forEach(file => {
                html += `<li onclick="openFile('${file}')" style="cursor: pointer;">📄 ${file}</li>`;
            });
            html += `</ul></div>`;
        }
        
        // مطابقات الامتداد
        if (results.extensionMatches.length > 0) {
            html += `<div class="search-result-item">
                <div class="search-result-header">📁 ملفات بالامتداد ${searchTerm}</div>
                <ul class="function-list">`;
            results.extensionMatches.forEach(file => {
                html += `<li onclick="openFile('${file}')" style="cursor: pointer;">📄 ${file}</li>`;
            });
            html += `</ul></div>`;
        }
        
        // مطابقات التبعيات
        if (results.dependencyMatches.length > 0) {
            html += `<div class="search-result-item">
                <div class="search-result-header">🔗 ملفات تحتوي على تبعيات مرتبطة</div>
                <ul class="function-list">`;
            results.dependencyMatches.forEach(file => {
                html += `<li onclick="openFile('${file}')" style="cursor: pointer;">📄 ${file}</li>`;
            });
            html += `</ul></div>`;
        }
        
        // تحليل مفصل للنتيجة الأولى
        const firstResult = results.exactMatches[0] || results.partialMatches[0] || results.extensionMatches[0] || results.dependencyMatches[0];
        if (firstResult) {
            html += generateFileDetailedAnalysis(firstResult);
        }
    }
    
    container.innerHTML = html;
    container.style.display = 'block';
}

// إنشاء تحليل مفصل للملف
function generateFileDetailedAnalysis(filePath) {
    const analysis = fileAnalysis[filePath];
    if (!analysis) return '';
    
    let html = `<div class="search-result-item">
        <div class="search-result-header">📊 تحليل مفصل لـ: ${filePath}</div>
        <div class="search-result-content">`;
    
    // المعلومات الأساسية
    html += `<p><strong>نوع الملف:</strong> ${analysis.type} <span class="tech-badge badge-${analysis.type}">${analysis.type.toUpperCase()}</span></p>`;
    html += `<p><strong>الحجم:</strong> ${analysis.size} حرف</p>`;
    html += `<p><strong>عدد الأسطر:</strong> ${analysis.lines}</p>`;
    html += `<p><strong>التعقيد:</strong> ${analysis.complexity.level} <div class="complexity-meter"><div class="complexity-fill complexity-${analysis.complexity.level}"></div></div></p>`;
    
    // الدوال الموجودة في الملف (للملفات البرمجية)
    if (analysis.functions && analysis.functions.length > 0) {
        html += `<div class="search-result-header">📝 الدوال المحددة في هذا الملف:</div>
                <ul class="function-list">`;
        analysis.functions.forEach(func => {
            html += `<li onclick="searchFunctionByName('${func}')" style="cursor: pointer; color: var(--primary-color);">⚙️ ${func}</li>`;
        });
        html += `</ul>`;
    }
    
    // المكونات (لملفات HTML)
    if (analysis.components && analysis.components.length > 0) {
        html += `<div class="search-result-header">🧩 المكونات المكتشفة:</div>
                <ul class="function-list">`;
        analysis.components.forEach(comp => {
            html += `<li>🔧 ${comp}</li>`;
        });
        html += `</ul>`;
    }
    
    // التبعيات (الملفات التي يعتمد عليها هذا الملف)
    if (analysis.dependencies && analysis.dependencies.length > 0) {
        html += `<div class="search-result-header">📥 الملفات التي يعتمد عليها هذا الملف:</div>
                <ul class="dependency-list">`;
        analysis.dependencies.forEach(dep => {
            if (dep.type === 'module') {
                html += `<li>📦 ${dep.source} <small>(${dep.imports.join(', ')})</small></li>`;
            } else {
                html += `<li>🔗 ${dep.file} (${dep.type}) - ${dep.relation}</li>`;
            }
        });
        html += `</ul>`;
    }
    
    html += `</div></div>`;
    return html;
}

// البحث عن الدوال
function searchFunctions() {
    const searchTerm = document.getElementById("functionSearchInput").value.trim();
    if (!searchTerm) {
        alert('يرجى إدخال اسم الدالة');
        return;
    }
    
    const results = performFunctionSearch(searchTerm);
    displayFunctionSearchResults(results, searchTerm);
}

// البحث عن دالة بالاسم (للاستخدام من الروابط)
function searchFunctionByName(functionName) {
    document.getElementById("functionSearchInput").value = functionName;
    searchFunctions();
}

/**
 * تحديث دالة performFunctionSearch للبحث في JSDoc
 */
function performFunctionSearch(searchTerm) {
    const results = {
        exactMatches: [],
        partialMatches: [],
        jsdocMatches: [], // جديد للبحث في JSDoc
        calls: [],
        dependencies: []
    };
    
    Object.keys(fileAnalysis).forEach(filePath => {
        const analysis = fileAnalysis[filePath];
        
        // البحث في JSDoc (جديد)
        if (analysis.jsdoc && analysis.jsdoc.comments) {
            analysis.jsdoc.comments.forEach(jsdocItem => {
                const searchableContent = [
                    jsdocItem.functionName,
                    jsdocItem.parsed.description,
                    ...jsdocItem.parsed.params.map(p => p.description),
                    jsdocItem.parsed.returns?.description,
                    ...jsdocItem.parsed.examples
                ].join(' ').toLowerCase();
                
                if (searchableContent.includes(searchTerm.toLowerCase())) {
                    results.jsdocMatches.push({
                        file: filePath,
                        function: jsdocItem.functionName,
                        jsdoc: jsdocItem.parsed,
                        matchType: 'jsdoc',
                        relevance: calculateRelevance(searchableContent, searchTerm)
                    });
                }
            });
        }
        
        // البحث التقليدي في أسماء الدوال
        if (analysis.functions) {
            analysis.functions.forEach(func => {
                if (func.name === searchTerm) {
                    results.exactMatches.push({
                        file: filePath,
                        function: func,
                        matchType: 'exact'
                    });
                } else if (func.name.includes(searchTerm)) {
                    results.partialMatches.push({
                        file: filePath,
                        function: func,
                        matchType: 'partial'
                    });
                }
            });
        }
    });
    
    // ترتيب نتائج JSDoc حسب الأهمية
    results.jsdocMatches.sort((a, b) => b.relevance - a.relevance);
    
    return results;
}

/**
 * حساب أهمية نتيجة البحث في JSDoc
 */
function calculateRelevance(content, searchTerm) {
    let relevance = 0;
    const lowerContent = content.toLowerCase();
    const lowerSearch = searchTerm.toLowerCase();
    
    if (lowerContent.includes(lowerSearch)) {
        relevance += 10;
    }
    
    // زيادة الأهمية إذا كانت المطابقة في اسم الدالة
    if (content.split(' ')[0].toLowerCase().includes(lowerSearch)) {
        relevance += 20;
    }
    
    // زيادة الأهمية إذا كانت المطابقة في الوصف الرئيسي
    const lines = content.split(' ');
    if (lines[1] && lines[1].toLowerCase().includes(lowerSearch)) {
        relevance += 15;
    }
    
    return relevance;
}

/**
 * تحديث عرض نتائج البحث لتضمين JSDoc
 */
function displayFunctionSearchResults(results, searchTerm) {
    const container = document.getElementById("functionSearchResults");
    let html = `<h4>نتائج البحث عن الدالة: "${searchTerm}"</h4>`;
    
    if (results.exactMatches.length === 0 && results.partialMatches.length === 0 && results.jsdocMatches.length === 0) {
        html += `<p>❌ لم يتم العثور على دوال مطابقة</p>`;
    } else {
        // عرض نتائج JSDoc أولاً (جديد)
        if (results.jsdocMatches.length > 0) {
            html += `<div class="search-result-item">
                <div class="search-result-header">📝 مطابقات في توثيق JSDoc</div>
                <ul class="function-list">`;
            results.jsdocMatches.forEach(result => {
                html += `<li onclick="showFunctionDetails('${result.function}', '${result.file}')" style="cursor: pointer;">
                    📄 ${result.function} - ${result.jsdoc.description?.substring(0, 50)}...
                    <span class="tech-badge badge-js">JSDoc</span>
                </li>`;
            });
            html += `</ul></div>`;
        }
        
        // المطابقات التامة
        if (results.exactMatches.length > 0) {
            html += `<div class="search-result-item">
                <div class="search-result-header">✅ مطابقات تامة للدوال</div>
                <ul class="function-list">`;
            results.exactMatches.forEach(result => {
                html += `<li onclick="showFunctionDetails('${result.function.name}', '${result.file}')" style="cursor: pointer;">
                    ⚙️ ${result.function.name}
                    ${result.function.hasJSDoc ? '<span class="tech-badge badge-js">📝</span>' : ''}
                </li>`;
            });
            html += `</ul></div>`;
        }
        
        // المطابقات الجزئية
        if (results.partialMatches.length > 0) {
            html += `<div class="search-result-item">
                <div class="search-result-header">🔍 مطابقات جزئية للدوال</div>
                <ul class="function-list">`;
            results.partialMatches.forEach(result => {
                html += `<li onclick="showFunctionDetails('${result.function.name}', '${result.file}')" style="cursor: pointer;">
                    ⚙️ ${result.function.name}
                    ${result.function.hasJSDoc ? '<span class="tech-badge badge-js">📝</span>' : ''}
                </li>`;
            });
            html += `</ul></div>`;
        }
        
        // تحليل مفصل للنتيجة الأولى
        const firstResult = results.jsdocMatches[0] || results.exactMatches[0] || results.partialMatches[0];
        if (firstResult) {
            html += generateFunctionDetailedAnalysis(firstResult.function?.name || firstResult.function, firstResult.file);
        }
    }
    
    container.innerHTML = html;
    container.style.display = 'block';
}

/**
 * دالة مساعدة لعرض تفاصيل الدالة
 */
function showFunctionDetails(functionName, filePath) {
    const analysis = fileAnalysis[filePath];
    if (!analysis || !analysis.functions) return;
    
    const func = analysis.functions.find(f => f.name === functionName);
    
    if (!func) return;
    
    let modalContent = `
        <div class="function-details">
            <h3>🎯 تفاصيل الدالة: ${functionName}</h3>
            <p><strong>الملف:</strong> ${filePath}</p>
            <p><strong>النوع:</strong> ${func.type}</p>
    `;
    
    if (func.hasJSDoc && func.jsdoc) {
        modalContent += `
            <div class="jsdoc-details">
                <h4>📝 توثيق JSDoc:</h4>
                <p><strong>الوصف:</strong> ${func.jsdoc.description || 'لا يوجد'}</p>
        `;
        
        if (func.jsdoc.params.length > 0) {
            modalContent += `<p><strong>المعاملات:</strong></p><ul>`;
            func.jsdoc.params.forEach(param => {
                modalContent += `<li>${param.name} (${param.type}) - ${param.description}</li>`;
            });
            modalContent += `</ul>`;
        }
        
        if (func.jsdoc.returns) {
            modalContent += `<p><strong>الإرجاع:</strong> ${func.jsdoc.returns.type} - ${func.jsdoc.returns.description}</p>`;
        }
        
        if (func.quality) {
            modalContent += `<p><strong>جودة التوثيق:</strong> ${func.quality.level} (${func.quality.score}/100)</p>`;
        }
        
        modalContent += `</div>`;
    } else {
        modalContent += `<p>❌ لا يوجد توثيق JSDoc لهذه الدالة</p>`;
    }
    
    modalContent += `</div>`;
    
    // استخدام النافذة المنبثقة الحالية لعرض التفاصيل
    document.getElementById("fileInfo").innerHTML = modalContent;
    document.getElementById("fileContent").innerHTML = ''; // مسح محتوى الملف السابق
    document.getElementById("modal").style.display = "flex";
}

// مسح البحث عن الملفات
function clearFileSearch() {
    document.getElementById("fileSearchInput").value = '';
    document.getElementById("fileSearchResults").style.display = 'none';
}

// مسح البحث عن الدوال
function clearFunctionSearch() {
    document.getElementById("functionSearchInput").value = '';
    document.getElementById("functionSearchResults").style.display = 'none';
}

// جعل الدوال متاحة globally
window.showFunctionDetails = showFunctionDetails;