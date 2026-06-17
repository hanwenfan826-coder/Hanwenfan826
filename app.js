const form = document.getElementById("form");
const result = document.getElementById("result");
let latestPlan = "";

const modelRules = {
  "剧情种草": ["讲故事", "把产品功能嫁接到情感或生活冲突里，用真实细节、反差和金句降低广告感。"],
  "测评讲解": ["说产品 4P", "围绕痛点、卖点、证明、购买理由组织内容，把产品放进真实决策场景，而不是堆功能。"],
  "街采互动": ["共鸣段子", "用“假如用户说出内心话”“行业内幕还原”“A 和 B 的区别”制造共鸣和信任。"],
  "教程清单": ["教知识", "用“追求更好、解决难题、防止避坑、降低成本、丰富谈资”筛选知识点，必须给用户具体获得感。"],
  "热点借势": ["热点转译", "不直接追热闹，而是把热点情绪转成账号可承接的观点、场景或反差。"]
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function readForm() {
  const data = new FormData(form);
  return {
    positioning: data.get("positioning").trim(),
    topic: data.get("topic").trim(),
    audience: data.get("audience").trim(),
    selling: data.get("selling").trim(),
    platform: data.get("platform"),
    duration: data.get("duration"),
    style: data.get("style"),
    trend: data.get("trend") === "on",
    conversion: data.get("conversion") === "on",
    team: data.get("team") === "on",
    risk: data.get("risk") === "on"
  };
}

function inferNeed(d) {
  const text = `${d.topic} ${d.audience} ${d.selling}`;
  if (/低糖|控糖|减肥|健康|避坑|省|成本|通勤|效率|焦虑/.test(text)) return "解决难题";
  if (/上新|新开|新品|首发|限量|活动/.test(text)) return "新体验";
  if (/教程|方法|技巧|怎么|如何|知识|训练/.test(text)) return "步骤技巧";
  if (/故事|人生|创业|夫妻|亲子|成长|北漂|情感/.test(text)) return "故事生活";
  return "观点重构";
}

function chooseModel(d, need) {
  if (d.style === "教程清单" || need === "步骤技巧") return modelRules["教程清单"];
  return modelRules[d.style] || ["晒过程", "展示服务过程、制作过程和专业细节，让用户眼见为实，建立信任和转化意愿。"];
}

function makePlan(d) {
  const need = inferNeed(d);
  const [modelName, modelRule] = chooseModel(d, need);
  const conversion = d.conversion ? "结尾设置轻动作：评论关键词、收藏清单、进店领取、私信咨询或直播间承接。" : "本条以拉新和信任为主，先不做强销售。";
  const trend = d.trend ? "从热榜、评论区高频词、同行爆款和用户当下情绪里找需求量大的切口。" : "先稳住账号内容线，不为了热点牺牲长期定位。";
  const firstSelling = d.selling.split("、")[0] || d.topic;
  return {
    brief: [["需求类型", need], ["脚本模型", modelName], ["内容作用", d.conversion ? "拉新 + 信任 + 转化" : "拉新 + 账号记忆"]],
    strategy: [
      ["账号定位", `${d.positioning} 不只是简介，而要形成“价值 × 用户 × 人设 × 类型 × 风格”的定位。价值必须是实在的方法、资讯、体验或判断。`],
      ["张小羊画像", `把用户具体化成一个“张小羊”：${d.audience}，在某个生活场景里遇到具体阻碍，需要一个看得懂、能立刻判断的解决方案。`],
      ["需求连接", `本条不是泛泛介绍“${d.topic}”，而是连接用户此刻关心的痛点、情绪波动、消费判断或生活场景。`],
      ["解决方案", `用“${d.selling}”提供资讯、观点、步骤技巧、故事生活或新体验中的一种，不要只罗列卖点。`],
      ["内容线部署", "保留三条线：拉热视频 2-3 条、常规系列连续 10 条、强人设爆款作为置顶内容；后续再扩展合集。"],
      ["素材库来源", "从同行爆款、评论区、热榜、日常情绪波动、关键词和真实服务过程里收集素材，借鉴形式但重组行业表达。"]
    ],
    ideas: [
      [`需求型选题：${d.topic} 背后的真实困境`, `先写清“谁在什么场景里为什么需要它”。围绕 ${d.audience} 的生活节奏、消费水平、付费意愿和高频困扰，把卖点变成具体问题的答案。`, ["需求", "张小羊", need]],
      [`过程型选题：把 ${firstSelling} 晒给用户看`, "用过程建立信任：展示选择、制作、对比、试用、服务或交付细节。知识内容容易获赞，过程内容更容易让用户相信你真的会做。", ["晒过程", "信任", "转化"]],
      ["差异化选题：在同类账号里找到反差", "用“正、反、合、跨、借、弱”做差异：正面降维讲清楚，反向挑战行业常识，跨界引入新视角，或用真实经历增强说服力。", ["主题IP", "差异化", "人设"]],
      ["系列化选题：一条视频只解决一个阶段问题", `${trend} 把大主题拆成需求清单、解决方案清单、热门评论清单和故事清单，让账号可以持续更新，而不是靠灵感硬憋。`, ["选题库", "系列", d.platform]]
    ],
    models: [
      ["三有原则", "每个选题至少满足“有用、有趣、有共鸣”之一，强选题最好同时具备关联性、有效性、高频、易操作、可持续。"],
      ["标题方向", "优先从疑问、悬念、数据、故事、反差、共鸣、价值七类里选，不写空泛形容词。"],
      ["表现形式", "真人口述适合观点和信任，图片/视频配音适合知识密度，情景剧适合冲突和反差，过程记录适合建立真实感。"],
      ["模型使用", modelRule]
    ],
    script: [
      ["0-3s", `先抛出张小羊的具体困境：${d.audience} 为什么会在这个时刻关心“${d.topic}”。不要先介绍产品，先让观众觉得“这说的是我”。`],
      ["3-8s", `给出反差或判断：多数人以为问题在 A，其实关键在 ${firstSelling}。`],
      ["8-16s", `进入 ${modelName} 模型：用真实过程、具体步骤、故事冲突或产品证明承接卖点：${d.selling}。`],
      ["16-24s", "补一个可验证细节：数据、前后对比、现场反应、用户评论或制作过程，让内容从“我说很好”变成“你看得到”。"],
      ["24-30s", `${conversion} 结尾回到账号定位，形成可记住的一句话。`]
    ],
    shots: [
      ["开场冲突", "中近景", "人物或手部动作先出现，声音先于画面，制造注意力。"],
      ["产品/主题亮相", "特写", "把最能证明价值的细节拍清楚，不要只给大而全的空镜。"],
      ["场景证明", "跟拍", "进入真实使用场景，保留自然动作和现场声音。"],
      ["卖点强化", "俯拍", "用道具、字幕或对比画面做信息分层。"],
      ["互动转化", "正面近景", "演员直视镜头给出评论、收藏或咨询动作。"],
      ["备用镜头", "空镜", "补拍环境、手部、产品、用户反应，给剪辑留余量。"]
    ],
    execution: [
      ["导演", "统一创意意图，现场判断表演、节奏和补拍镜头。"],
      ["摄影", "提前确认景别、运动、光线和收音位置。"],
      ["演员", "台词口语化，不背广告词，优先保留真实反应。"],
      ["剪辑", "前 3 秒强钩子，字幕跟随信息点，音乐卡点但不抢内容。"],
      ["应急", d.risk ? "若场地延误，切换到桌面测评版脚本；若素材丢失，用备用空镜和旁白补齐逻辑。" : "保持常规拍摄流程。"],
      ["协作", d.team ? "拍前 15 分钟对齐分镜表、道具表、台词版本和发布目标。" : "由编导统一推进。"]
    ],
    review: [
      ["流量池判断", "重点看 3 秒、5 秒、完播、互动、转粉；先判断钩子和人群匹配，再判断脚本。"],
      ["评论区复盘", "提取高频问题、反对意见、真实需求和可做成下一条的用户原话。"],
      ["内容线调整", "拉新、常规系列、强人设爆款和转化视频分开评估，不用同一套指标评价所有内容。"],
      ["素材库沉淀", "把爆款结构、标题、场景、评论、镜头和转化动作沉淀进下一轮选题库。"]
    ]
  };
}

function tagHtml(tags) { return `<div class="tags">${tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>`; }
function taskHtml(items) { return `<div class="tasks">${items.map(i => `<article class="task"><div class="check">✓</div><div><h4>${esc(i[0])}</h4><p>${esc(i[1])}</p></div></article>`).join("")}</div>`; }

function renderPlan(d) {
  const p = makePlan(d);
  latestPlan = [
    `短视频编导方案：${d.topic}`, `账号定位：${d.positioning}`, `目标用户：${d.audience}`, `核心卖点：${d.selling}`, "",
    "知识库策划诊断：", ...p.strategy.map(i => `- ${i[0]}：${i[1]}`), "",
    "选题策划：", ...p.ideas.map(i => `- ${i[0]}：${i[1]}`), "",
    "内容模型：", ...p.models.map(i => `- ${i[0]}：${i[1]}`), "",
    "脚本：", ...p.script.map(i => `- ${i[0]} ${i[1]}`), "",
    "分镜：", ...p.shots.map(i => `- ${i[0]} / ${i[1]}：${i[2]}`), "",
    "执行：", ...p.execution.map(i => `- ${i[0]}：${i[1]}`), "",
    "复盘：", ...p.review.map(i => `- ${i[0]}：${i[1]}`)
  ].join("\n");
  result.innerHTML = `
    <div class="panel-body tab-panel" data-panel="strategy">
      <div class="brief">${p.brief.map(i => `<div class="metric"><strong>${esc(i[0])}</strong><span>${esc(i[1])}</span></div>`).join("")}</div>
      <h3 class="section-title">知识库策划诊断</h3>${taskHtml(p.strategy)}
      <h3 class="section-title">选题与市场判断</h3>
      <div class="cards">${p.ideas.map(i => `<article class="card"><h4>${esc(i[0])}</h4><p>${esc(i[1])}</p>${tagHtml(i[2])}</article>`).join("")}</div>
      <h3 class="section-title">内容模型与呈现形式</h3>${taskHtml(p.models)}
    </div>
    <div class="panel-body tab-panel" data-panel="script" hidden><h3 class="section-title">可拍摄脚本</h3>${p.script.map(i => `<div class="script-line"><div class="time">${esc(i[0])}</div><p>${esc(i[1])}</p></div>`).join("")}</div>
    <div class="panel-body tab-panel" data-panel="storyboard" hidden><h3 class="section-title">分镜设计</h3><div class="shots">${p.shots.map(i => `<article class="shot"><div class="frame"></div><h4>${esc(i[0])} · ${esc(i[1])}</h4><p>${esc(i[2])}</p></article>`).join("")}</div></div>
    <div class="panel-body tab-panel" data-panel="execution" hidden><h3 class="section-title">拍摄执行与团队协作</h3>${taskHtml(p.execution)}</div>
    <div class="panel-body tab-panel" data-panel="review" hidden><h3 class="section-title">数据复盘与持续学习</h3>${taskHtml(p.review)}</div>`;
  activate("strategy");
}

function activate(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  document.querySelectorAll(".tab-panel").forEach(p => p.hidden = p.dataset.panel !== name);
}

document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => activate(t.dataset.tab)));
form.addEventListener("submit", e => { e.preventDefault(); renderPlan(readForm()); });
document.getElementById("generateTop").addEventListener("click", () => { renderPlan(readForm()); document.getElementById("workspace").scrollIntoView({ behavior: "smooth" }); });
document.getElementById("demo").addEventListener("click", () => {
  form.positioning.value = "本地生活探店账号，真实、轻松、有判断力";
  form.topic.value = "一家新开的深夜面馆如何在 30 秒内种草";
  form.audience.value = "22-40 岁喜欢夜宵、下班放松、重视性价比的人群";
  form.selling.value = "现熬汤底、开放厨房、凌晨营业、单人也舒服";
  form.platform.value = "小红书";
  form.style.value = "剧情种草";
  renderPlan(readForm());
  document.getElementById("workspace").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("copy").addEventListener("click", async () => {
  if (!latestPlan) renderPlan(readForm());
  await navigator.clipboard.writeText(latestPlan);
});
