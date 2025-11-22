// jsdoc-analysis.js - محلل متخصص لتعليقات JSDoc
class JSDocAnalyzer {
    /**
     * تحليل جميع تعليقات JSDoc في محتوى الملف
     * @param {string} content - محتوى الملف
     * @returns {Array} مصفوفة تحتوي على جميع تعليقات JSDoc المحللة
     */
    static parseJSDocComments(content) {
        const jsdocRegex = /\/\*\*[\s\S]*?\*\/\s*(?:(?:function|class|const|let|var)\s+(\w+)|(?:\s*(\w+)\s*[:=]\s*(?:function|\([^)]*\)\s*=>)))/g;
        const comments = [];
        let match;
        
        while ((match = jsdocRegex.exec(content)) !== null) {
            const fullComment = match[0];
            const functionName = match[1] || match[2];
            
            if (functionName) {
                comments.push({
                    functionName: functionName,
                    comment: fullComment,
                    parsed: this.parseSingleJSDoc(fullComment),
                    position: match.index
                });
            }
        }
        return comments;
    }

    /**
     * تحليل تعليق JSDoc مفرد
     * @param {string} comment - تعليق JSDoc
     * @returns {Object} كائن يحتوي على المعلومات المحللة
     */
    static parseSingleJSDoc(comment) {
        const parsed = {
            description: '',
            params: [],
            returns: null,
            examples: [],
            tags: [],
            since: '',
            version: '',
            author: '',
            see: []
        };

        // استخراج الوصف الرئيسي
        const lines = comment.split('\n');
        let descriptionLines = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].replace(/^\s*\*\s?/, '').trim();
            
            if (line.startsWith('@') || line === '*/') {
                break;
            }
            if (line) {
                descriptionLines.push(line);
            }
        }
        parsed.description = descriptionLines.join(' ').trim();

        // استخراج المعاملات @param
        const paramRegex = /@param\s+{([^}]+)}\s+(\w+)\s*-\s*(.*?)(?=\n\s*\* @|\n\s*\*\/)/g;
        let paramMatch;
        while ((paramMatch = paramRegex.exec(comment)) !== null) {
            parsed.params.push({
                type: paramMatch[1].trim(),
                name: paramMatch[2].trim(),
                description: paramMatch[3].trim()
            });
        }

        // استخراج قيمة الإرجاع @returns
        const returnRegex = /@returns?\s+{([^}]+)}\s*(.*?)(?=\n\s*\* @|\n\s*\*\/)/gs;
        const returnMatch = returnRegex.exec(comment);
        if (returnMatch) {
            parsed.returns = {
                type: returnMatch[1].trim(),
                description: returnMatch[2].trim()
            };
        }

        // استخراج أمثلة @example
        const exampleRegex = /@example\s*\n\s*\*\s*(.*?)(?=\n\s*\* @|\n\s*\*\/)/gs;
        let exampleMatch;
        while ((exampleMatch = exampleRegex.exec(comment)) !== null) {
            parsed.examples.push(exampleMatch[1].trim());
        }

        // استخراج tags أخرى
        parsed.since = this.extractTag(comment, 'since');
        parsed.version = this.extractTag(comment, 'version');
        parsed.author = this.extractTag(comment, 'author');
        
        // استخراج @see
        const seeRegex = /@see\s+(.*?)(?=\n\s*\* @|\n\s*\*\/)/g;
        let seeMatch;
        while ((seeMatch = seeRegex.exec(comment)) !== null) {
            parsed.see.push(seeMatch[1].trim());
        }

        // استخراج جميع tags
        const tagRegex = /@(\w+)\s+([^@]*?)(?=\n\s*\* @|\n\s*\*\/)/g;
        let tagMatch;
        while ((tagMatch = tagRegex.exec(comment)) !== null) {
            if (!['param', 'returns', 'example', 'since', 'version', 'author', 'see'].includes(tagMatch[1])) {
                parsed.tags.push({
                    tag: tagMatch[1],
                    value: tagMatch[2].trim()
                });
            }
        }

        return parsed;
    }

    /**
     * استخراج قيمة tag محددة
     * @param {string} comment - تعليق JSDoc
     * @param {string} tagName - اسم ال tag
     * @returns {string} قيمة ال tag
     */
    static extractTag(comment, tagName) {
        const regex = new RegExp(`@${tagName}\\s+(.*?)(?=\\n\\s*\\* @|\\n\\s*\\*\\/)`, 's');
        const match = regex.exec(comment);
        return match ? match[1].trim() : '';
    }

    /**
     * تقييم جودة تعليق JSDoc
     * @param {Object} jsdoc - كائن JSDoc المحلل
     * @returns {Object} تقييم الجودة
     */
    static evaluateJSDocQuality(jsdoc) {
        const quality = {
            score: 0,
            maxScore: 100,
            missing: [],
            suggestions: []
        };

        // الوصف
        if (jsdoc.parsed.description) {
            quality.score += 30;
        } else {
            quality.missing.push('الوصف الرئيسي');
        }

        // المعاملات
        if (jsdoc.parsed.params.length > 0) {
            quality.score += 30;
        } else {
            quality.missing.push('توثيق المعاملات (@param)');
        }

        // قيمة الإرجاع
        if (jsdoc.parsed.returns) {
            quality.score += 30;
        } else {
            quality.missing.push('توثيق قيمة الإرجاع (@returns)');
        }

        // أمثلة
        if (jsdoc.parsed.examples.length > 0) {
            quality.score += 10;
        } else {
            quality.suggestions.push('إضافة أمثلة استخدام (@example)');
        }

        // تقييم مستوى الجودة
        quality.level = quality.score >= 80 ? 'ممتاز' : 
                       quality.score >= 60 ? 'جيد' : 
                       quality.score >= 40 ? 'مقبول' : 'ضعيف';

        return quality;
    }

    /**
     * إنشاء تقرير تحليل JSDoc لملف معين
     * @param {string} filePath - مسار الملف
     * @param {Array} jsdocComments - تعليقات JSDoc
     * @returns {string} تقرير التحليل
     */
    static generateJSDocReport(filePath, jsdocComments) {
        let report = `📊 تقرير تحليل JSDoc للملف: ${filePath}\n`;
        report += `=========================================\n\n`;
        
        if (jsdocComments.length === 0) {
            report += '❌ لا توجد تعليقات JSDoc في هذا الملف\n';
            return report;
        }

        report += `📝 عدد الدوال الموثقة: ${jsdocComments.length}\n\n`;

        jsdocComments.forEach((jsdoc, index) => {
            report += `${index + 1}. 🎯 الدالة: ${jsdoc.functionName}\n`;
            report += `   📄 الوصف: ${jsdoc.parsed.description || 'لا يوجد وصف'}\n`;
            
            // المعاملات
            if (jsdoc.parsed.params.length > 0) {
                report += `   ⚙️  المعاملات:\n`;
                jsdoc.parsed.params.forEach(param => {
                    report += `      • ${param.name} (${param.type}) - ${param.description}\n`;
                });
            } else {
                report += `   ⚠️  لا توجد معاملات موثقة\n`;
            }

            // قيمة الإرجاع
            if (jsdoc.parsed.returns) {
                report += `   🔙 الإرجاع: ${jsdoc.parsed.returns.type} - ${jsdoc.parsed.returns.description}\n`;
            } else {
                report += `   ⚠️  لا يوجد توثيق لقيمة الإرجاع\n`;
            }

            // تقييم الجودة
            const quality = this.evaluateJSDocQuality(jsdoc);
            report += `   📈 جودة التوثيق: ${quality.level} (${quality.score}/100)\n`;

            if (quality.missing.length > 0) {
                report += `   ❌ مفقود: ${quality.missing.join(', ')}\n`;
            }
            if (quality.suggestions.length > 0) {
                report += `   💡 اقتراحات: ${quality.suggestions.join(', ')}\n`;
            }

            report += '\n';
        });

        return report;
    }
}

// جعل الكلاس متاحاً globally
if (typeof window !== 'undefined') {
    window.JSDocAnalyzer = JSDocAnalyzer;
}