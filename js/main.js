// تهيئة التطبيق

// تهيئة التطبيق
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("ignoreList").value =
    localStorage.getItem("ignored") ||
    "node_modules\n.git\n.vscode\n.DS_Store\nThumbs.db\npackage-lock.json\nyarn.lock";

  // إضافة مستمعي الأحداث
  document.getElementById("pickFolder").addEventListener("click", pickFolder);
  document.getElementById("reRead").addEventListener("click", readAll);
  document.getElementById("exportTxt").addEventListener("click", exportTxt);
  document.getElementById("exportMd").addEventListener("click", exportMd);
  document
    .getElementById("exportByType")
    .addEventListener("click", exportByType);
  document
    .getElementById("exportForAIAgent")
    .addEventListener("click", exportForAIAgent); // جديد
  document
    .getElementById("exportRelations")
    .addEventListener("click", exportRelations);
  document
    .getElementById("exportArchitecture")
    .addEventListener("click", exportArchitecture);
  document
    .getElementById("exportJSDoc")
    .addEventListener("click", exportJSDocAnalysis);
  document.getElementById("saveIgnore").addEventListener("click", saveIgnore);
  document.getElementById("resetIgnore").addEventListener("click", resetIgnore);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("searchInput").addEventListener("input", filterTree);
  document.getElementById("clearSearch").addEventListener("click", clearSearch);

  // أحداث البحث
  document.getElementById("searchFile").addEventListener("click", searchFiles);
  document
    .getElementById("clearFileSearch")
    .addEventListener("click", clearFileSearch);
  document
    .getElementById("searchFunction")
    .addEventListener("click", searchFunctions);
  document
    .getElementById("clearFunctionSearch")
    .addEventListener("click", clearFunctionSearch);
  document
    .getElementById("fileSearchInput")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") searchFiles();
    });
  document
    .getElementById("functionSearchInput")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") searchFunctions();
    });

  // إضافة مستمعي الأحداث لأزرار التصفية حسب النوع
  document.querySelectorAll(".file-type-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".file-type-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      filterByType(this.dataset.type);
    });
  });

  // إغلاق النافذة المنبثقة بالنقر خارج المحتوى
  document.getElementById("modal").addEventListener("click", function (e) {
    if (e.target === this) closeModal();
  });

  console.log("🔧 أداة تحليل مشاريع الويب جاهزة - Vanilla JavaScript فقط");
});

async function pickFolder() {
  try {
    directoryHandle = await window.showDirectoryPicker();
    projectName = directoryHandle.name;
    document.getElementById("projectName").textContent = projectName;
    await readAll();
  } catch (error) {
    if (error.name !== "AbortError") {
      alert("حدث خطأ أثناء اختيار المجلد: " + error.message);
    }
  }
}

////////////////

// تعديل دالة readAll لمعالجة الأخطاء
async function readAll() {
  if (!directoryHandle) {
    alert("يرجى اختيار مجلد المشروع أولاً");
    return;
  }

  showLoading(true);

  let output = "";
  let fileCount = 0;
  let lineCount = 0;
  let totalSize = 0;

  cssContent = "";
  htmlContent = "";
  jsContent = "";
  jsonContent = "";

  // إعادة تهيئة هياكل البيانات
  relations = { html: {}, css: {}, js: {}, json: {} };
  dependencyMap = {
    htmlToCss: {},
    htmlToJs: {},
    cssToJs: {},
    jsToJson: {},
    jsToHtml: {},
    crossReferences: {},
  };
  projectStructure = {
    entryPoints: [],
    components: {},
    modules: {},
    dataFlows: [],
    architecture: {},
    techStack: {
      frameworks: [],
      libraries: [],
      buildTools: [],
      preprocessors: [],
    },
  };

  // إعادة تهيئة هياكل البحث الجديدة
  fileAnalysis = {};
  functionAnalysis = {};
  componentAnalysis = {};
  fileDependencies = {};
  functionDependencies = {};
  reverseDependencies = {};

  let ignored = document
    .getElementById("ignoreList")
    .value.split("\n")
    .map((s) => s.trim())
    .filter((s) => s);

  async function traverse(dirHandle, path = "") {
    let treeHTML = `<div class="folder" data-path="${
      path || "/"
    }" data-type="folder">
            <span>📁</span> ${path || "/"}
        </div>
        <div class="sub" style="display:none;">`;

    for await (let [name, handle] of dirHandle.entries()) {
      // تجاهل العناصر في قائمة التجاهل
      if (ignored.includes(name)) continue;

      let fullPath = path ? `${path}/${name}` : name;

      if (handle.kind === "file") {
        let fileType = getFileType(name);

        // تجاهل الملفات غير المدعومة
        if (fileType === "unsupported") continue;

        let file = await handle.getFile();
        let text = await file.text();
        let sizeKB = (file.size / 1024).toFixed(2);

        treeHTML += `
                    <div class="file" data-path="${fullPath}" data-type="${fileType}">
                        <span>${getFileIcon(fileType)}</span> ${name}
                        <span style="margin-right: auto; font-size: 0.8rem; color: #777;">${sizeKB} KB</span>
                        <button class="ignore-btn" onclick="ignoreItem(event, '${name}')">تجاهل</button>
                    </div>
                `;

        output += `\n------ بداية الملف: ${fullPath} ------\n`;
        output += text;
        output += `\n------ نهاية الملف: ${fullPath} ------\n`;

        fileCount++;
        lineCount += text.split("\n").length;
        totalSize += file.size;

        try {
          // تحليل العلاقات والتبعيات (مع معالجة الأخطاء)
          analyzeFileRelations(fullPath, fileType, text);

          // التحليل المتقدم للملفات والدوال (مع معالجة الأخطاء)
          safePerformAdvancedAnalysis(fullPath, fileType, text);
        } catch (error) {
          console.error(`❌ خطأ في تحليل الملف ${fullPath}:`, error);
          // الاستمرار مع الملفات الأخرى رغم الخطأ
        }

        // إنشاء وصف تفصيلي للملف
        let relationText = generateFileDescription(
          name,
          fullPath,
          fileType,
          text
        );

        // تصنيف حسب النوع + إضافة علاقة
        switch (fileType) {
          case "css":
            relations.css[fullPath] = relationText;
            cssContent += `\n/* FILE: ${fullPath} */\n/* DESCRIPTION: ${relationText} */\n${text}\n`;
            break;
          case "html":
            relations.html[fullPath] = relationText;
            htmlContent += `\n<!-- FILE: ${fullPath} -->\n<!-- DESCRIPTION: ${relationText} -->\n${text}\n`;
            break;
          case "js":
            relations.js[fullPath] = relationText;
            jsContent += `\n// FILE: ${fullPath}\n// DESCRIPTION: ${relationText}\n${text}\n`;
            break;
          case "json":
            relations.json[fullPath] = relationText;
            jsonContent += `\n// FILE: ${fullPath}\n// DESCRIPTION: ${relationText}\n${text}\n`;
            break;
        }
      } else if (handle.kind === "directory") {
        treeHTML += `
                    <div class="folder" data-path="${fullPath}" data-type="folder">
                        <span>📁</span> ${name}
                        <button class="ignore-btn" onclick="ignoreItem(event, '${name}')">تجاهل</button>
                    </div>`;
        treeHTML += `<div class="sub" style="display:none;">`;
        treeHTML += await traverse(handle, fullPath);
        treeHTML += `</div>`;
      }
    }

    treeHTML += "</div>";
    return treeHTML;
  }

  try {
    document.getElementById("treeView").innerHTML = await traverse(
      directoryHandle
    );

    // إضافة مستمعي الأحداث للمجلدات
    document.querySelectorAll(".folder").forEach((folder) => {
      folder.addEventListener("click", function (e) {
        if (!e.target.classList.contains("ignore-btn")) {
          toggleFolder(this);
        }
      });
    });

    // إضافة مستمعي الأحداث للملفات
    document.querySelectorAll(".file").forEach((file) => {
      file.addEventListener("click", function (e) {
        if (!e.target.classList.contains("ignore-btn")) {
          openFile(this.dataset.path);
        }
      });
    });

    document.getElementById("output").value = output;
    document.getElementById("fileCount").innerText = fileCount;
    document.getElementById("lineCount").innerText = lineCount;
    document.getElementById("totalSize").innerText =
      (totalSize / 1024).toFixed(2) + " KB";

    // تحديث خريطة العلاقات
    updateRelationsView();

    // تحديث التحليل المعماري
    updateArchitectureAnalysis();

    showLoading(false);
  } catch (error) {
    showLoading(false);
    alert("حدث خطأ أثناء قراءة الملفات: " + error.message);
  }
}

// دالة آمنة لتحليل الملفات المتقدم
function safePerformAdvancedAnalysis(filePath, fileType, content) {
  try {
    if (typeof performAdvancedAnalysis === "function") {
      performAdvancedAnalysis(filePath, fileType, content);
    } else {
      console.warn(
        `⚠️ performAdvancedAnalysis غير معرفة - استخدام التحليل الأساسي للملف: ${filePath}`
      );
      // استخدام التحليل الأساسي كبديل
      performBasicAnalysis(filePath, fileType, content);
    }
  } catch (error) {
    console.error(
      `❌ خطأ في performAdvancedAnalysis للملف ${filePath}:`,
      error
    );
    performBasicAnalysis(filePath, fileType, content);
  }
}

// تحليل أساسي كبديل
function performBasicAnalysis(filePath, fileType, content) {
  fileAnalysis[filePath] = {
    type: fileType,
    functions: [],
    dependencies: [],
    size: content.length,
    lines: content.split("\n").length,
    complexity: calculateComplexity(fileType, content),
  };

  // تحليل أساسي للدوال في JavaScript
  if (fileType === "js") {
    const functions =
      content.match(
        /function\s+(\w+)|const\s+(\w+)\s*=\s*\(|let\s+(\w+)\s*=\s*\(/g
      ) || [];
    fileAnalysis[filePath].functions = functions
      .map((f) => {
        const match = f.match(
          /(?:function\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*\()/
        );
        return match[1] || match[2];
      })
      .filter((f) => f && !isReservedKeyword(f));
  }
}

// دالة مساعدة للتحقق من الكلمات المحجوزة
function isReservedKeyword(word) {
  const reserved = [
    "if",
    "for",
    "while",
    "switch",
    "case",
    "return",
    "break",
    "continue",
    "var",
    "let",
    "const",
  ];
  return reserved.includes(word);
}

///////////////

// تحديث عرض العلاقات
function updateRelationsView() {
  let relationsHTML = '<div class="relations-container">';

  // إحصاء العلاقات
  let relationCount = 0;

  // عرض العلاقات من HTML إلى CSS
  if (Object.keys(dependencyMap.htmlToCss).length > 0) {
    relationsHTML += "<h4>🔗 علاقات HTML → CSS:</h4>";
    for (let htmlFile in dependencyMap.htmlToCss) {
      relationsHTML += `<div class="relation-item">${htmlFile} → ${dependencyMap.htmlToCss[
        htmlFile
      ].join(", ")}</div>`;
      relationCount += dependencyMap.htmlToCss[htmlFile].length;
    }
  }

  // عرض العلاقات من HTML إلى JS
  if (Object.keys(dependencyMap.htmlToJs).length > 0) {
    relationsHTML += "<h4>🔗 علاقات HTML → JavaScript:</h4>";
    for (let htmlFile in dependencyMap.htmlToJs) {
      relationsHTML += `<div class="relation-item">${htmlFile} → ${dependencyMap.htmlToJs[
        htmlFile
      ].join(", ")}</div>`;
      relationCount += dependencyMap.htmlToJs[htmlFile].length;
    }
  }

  relationsHTML += "</div>";
  document.getElementById("relationsView").innerHTML = relationsHTML;
  document.getElementById("relationCount").innerText = relationCount;
}
