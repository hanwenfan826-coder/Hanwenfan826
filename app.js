const messagesEl = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const kbStatus = document.getElementById("kbStatus");
const kbList = document.getElementById("kbList");
const clearChat = document.getElementById("clearChat");

let knowledge = [];
let history = [];
let currentBrief = {
  account: "",
  audience: "",
  topic: "",
  product: "",
  platform: "",
  style: ""
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function addMessage(role, html) {
  const item = document.createElement("article");
  item.className = `message ${role}`;
  item.innerHTML = `<div class="avatar">${role === "user" ? "你" : "导"}</div><div class="bubble">${html}</div>`;
  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function tokenize(text) {
  return String(text).toLowerCase().split(/[\s,，。！？、；;:：/|]+/).filter(Boolean);
}

function scoreKnowledge(query, item) {
  const q = query.toLowerCase();
  let score = 0;
  for (const tag of item.tags) if (q.includes(tag.toLowerCase())) score += 4;
  if (q.includes(item.title.toLowerCase())) score += 6;
  for (const token of tokenize(query)) {
    if (item.summary.toLowerCase().includes(token)) score += 1;
    if (item.rules.join(" ").toLowerCase().includes(token)) score += 1;
  }
  return score;
}

function retrieve(query) {
  return knowledge
    .map(item => ({ item, score: scoreKnowledge(query, item) }))
    .sort((a, b) => b.score - a.score)
    .filter(hit => hit.score > 0)
    .slice(0, 3)
    .map(hit => hit.item);
}

function updateBrief(text) {
  const t = String(text);
  if (/抖音|小红书|视频号|B站|b站/i.test(t)) currentBrief.platform = (t.match(/抖音|小红书|视频号|B站|b站/i) || [""])[0];
  if (/账号|博主|品牌号|探店|本地生活|餐饮|美妆|知识|带货/.test(t)) currentBrief.account = t;
  if (/人群|用户|年轻人|宝妈|老板|学生|通勤|客户|粉丝|客单价/.test(t)) currentBrief.audience = t;
  if (/产品|卖点|上新|店|面馆|茶|课程|服务|直播间/.test(t)) currentBrief.product = t;
  if (/晒过程|教知识|讲故事|说产品|剧情|街采|测评|反差|人设/.test(t)) currentBrief.style = t;
  currentBrief.topic = t;
}

function inferIntent(text) {
  if (/选题|题目|内容线|方向|策划/.test(text)) return "topic";
  if (/脚本|文案|台词|开头|钩子/.test(text)) return "script";
  if (/分镜|镜头|拍摄|景别|运镜/.test(text)) return "storyboard";
  if (/复盘|数据|播放|完播|流量|转化/.test(text)) return "review";
  if (/人设|定位|账号/.test(text)) return "positioning";
  return "general";
}

function makeKnowledgeBlock(hits) {
  if (!hits.length) return "<p><strong>检索到的知识：</strong>暂未命中明确模块，我会先按通用编导流程处理。</p>";
  return `<p><strong>检索到的知识：</strong>${hits.map(h => esc(h.title)).join("、")}</p>`;
}

function bullets(items) {
  return `<ul>${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

function answerTopic(query, hits) {
  return `
    ${makeKnowledgeBlock(hits)}
    <p><strong>我先按知识库把它拆成“需求连接 + 解决方案”。</strong></p>
    ${bullets([
      "先不要急着写标题，先定义张小羊：谁、在什么场景、遇到什么阻碍、为什么现在需要你。",
      "内容线建议分三层：2-3 条拉热视频测试人群，10 条常规系列建立账号稳定感，3 条强人设爆款做置顶。",
      "选题库从五个入口补充：评论区高频问题、同行爆款形式、热榜情绪、真实服务过程、用户消费顾虑。",
      "如果要更像真人编导，下一步请告诉我：账号行业、是否真人出镜、变现方式、目标平台。"
    ])}
    <p><strong>先给你 5 个可继续展开的方向：</strong></p>
    ${bullets([
      "需求型：这个人群为什么现在需要这个东西？",
      "过程型：把选择、制作、服务或交付过程晒出来。",
      "反差型：同行都在怎么讲？我们反着讲什么？",
      "人设型：老板/博主身上有什么故事、脾气、坚持和反常识？",
      "转化型：用户下单前最怕什么？用一条视频解决一个顾虑。"
    ])}
  `;
}

function answerScript(query, hits) {
  const model = /晒过程/.test(query) ? "晒过程" : /教知识/.test(query) ? "教知识" : /说产品|产品/.test(query) ? "说产品 4P" : /段子|反差|共鸣/.test(query) ? "共鸣段子" : "讲故事";
  return `
    ${makeKnowledgeBlock(hits)}
    <p><strong>这条我建议先走「${model}」模型。</strong></p>
    ${bullets([
      "0-3 秒：不要介绍自己，直接抛出张小羊的具体困境或反差。",
      "3-8 秒：给出判断，告诉用户多数人误解在哪里。",
      "8-18 秒：进入模型主体，用过程、故事、知识点或产品证明承接。",
      "18-26 秒：补一个可验证细节，最好是现场反应、数据、对比或真实服务细节。",
      "26-30 秒：给轻动作，不要硬广。比如评论关键词、收藏、私信、进店或直播间承接。"
    ])}
    <p>你可以继续发：“按这个模型写完整 30 秒脚本”，我会直接展开。</p>
  `;
}

function answerStoryboard(query, hits) {
  return `
    ${makeKnowledgeBlock(hits)}
    <p><strong>分镜不要先追求漂亮，先服务信息效率。</strong></p>
    ${bullets([
      "镜头 1：冲突开场，中近景，声音先于画面。",
      "镜头 2：关键细节特写，拍清楚能证明价值的东西。",
      "镜头 3：过程镜头，保留真实动作和现场声。",
      "镜头 4：对比镜头，用前后变化或 A/B 区别建立判断。",
      "镜头 5：人物反应，给观众情绪出口。",
      "镜头 6：转化动作，评论、收藏、进店、私信或直播间。"
    ])}
  `;
}

function answerReview(query, hits) {
  return `
    ${makeKnowledgeBlock(hits)}
    <p><strong>复盘不要只看播放量。</strong></p>
    ${bullets([
      "3 秒低：钩子和画面冲突不够，用户没进入情境。",
      "5 秒低：用户知道你要讲什么，但觉得和自己无关。",
      "完播低：信息顺序拖沓，过程或故事没有持续悬念。",
      "互动低：没有观点、争议、问题或用户可回答的入口。",
      "转化低：信任证据不足，或行动门槛太高。",
      "下一轮动作：把评论区问题沉淀成新选题。"
    ])}
  `;
}

function answerPositioning(query, hits) {
  return `
    ${makeKnowledgeBlock(hits)}
    <p><strong>账号定位先别写口号，先写判断标准。</strong></p>
    ${bullets([
      "价值：你到底帮用户解决什么具体问题？",
      "用户：这个人处在什么阶段，有什么生活节奏、消费能力和付费意愿？",
      "人设：你和观众是什么关系？提醒者、服务者、同行者、领导者还是私密知音？",
      "类型：晒过程、教知识、讲故事、说产品，哪个是主内容？",
      "风格：真诚、犀利、温暖、嘴毒、专业、松弛，只选 1-2 个主调。"
    ])}
  `;
}

function answerGeneral(query, hits) {
  return `
    ${makeKnowledgeBlock(hits)}
    <p>我可以继续帮你做，但先要把需求落到编导问题上。你可以补充这 4 个信息：</p>
    ${bullets([
      "账号行业和变现方式是什么？",
      "真人是否出镜？谁出镜？",
      "目标用户是谁？他们最担心什么？",
      "你想要选题、脚本、分镜、拍摄执行还是复盘？"
    ])}
  `;
}

function generateReply(query) {
  updateBrief(query);
  const hits = retrieve(query);
  const intent = inferIntent(query);
  if (intent === "topic") return answerTopic(query, hits);
  if (intent === "script") return answerScript(query, hits);
  if (intent === "storyboard") return answerStoryboard(query, hits);
  if (intent === "review") return answerReview(query, hits);
  if (intent === "positioning") return answerPositioning(query, hits);
  return answerGeneral(query, hits);
}

async function loadKnowledge() {
  try {
    const response = await fetch("./knowledge/director-knowledge.json");
    knowledge = await response.json();
    kbStatus.textContent = `已加载 ${knowledge.length} 个知识模块`;
    kbList.innerHTML = knowledge.map(k => `<div class="kb-item"><strong>${esc(k.title)}</strong><span>${k.tags.map(esc).join(" / ")}</span></div>`).join("");
    addMessage("assistant", `<p>我已经加载知识库。你可以直接说需求，比如“我要做一个本地餐饮账号，老板能出镜，帮我定内容线”。我会先检索相关知识，再给编导建议。</p>`);
  } catch (error) {
    kbStatus.textContent = "知识库加载失败，请检查 knowledge/director-knowledge.json";
    addMessage("assistant", `<p>知识库暂时没有加载成功，但你仍然可以输入需求，我会按基础编导流程回答。</p>`);
  }
}

chatForm.addEventListener("submit", event => {
  event.preventDefault();
  const query = userInput.value.trim();
  if (!query) return;
  history.push({ role: "user", content: query });
  addMessage("user", `<p>${esc(query)}</p>`);
  userInput.value = "";
  const reply = generateReply(query);
  history.push({ role: "assistant", content: reply });
  addMessage("assistant", reply);
});

document.querySelectorAll(".prompt-chip").forEach(button => {
  button.addEventListener("click", () => {
    userInput.value = button.textContent.trim();
    userInput.focus();
  });
});

clearChat.addEventListener("click", () => {
  history = [];
  messagesEl.innerHTML = "";
  addMessage("assistant", `<p>已清空。重新告诉我账号、产品、人群或你要解决的问题。</p>`);
});

document.getElementById("generateTop").addEventListener("click", () => {
  document.getElementById("workspace").scrollIntoView({ behavior: "smooth" });
  userInput.focus();
});

document.getElementById("demo").addEventListener("click", () => {
  userInput.value = "我要做一个深夜面馆账号，老板能出镜，人设是嘴毒但热心，客单价 30-50，帮我按知识库定内容线并给 10 个选题。";
  document.getElementById("workspace").scrollIntoView({ behavior: "smooth" });
  userInput.focus();
});

loadKnowledge();
