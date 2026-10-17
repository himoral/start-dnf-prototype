(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const root = $('cloud-flow'), scene = $('flow-scene'), app = document.querySelector('.app');
  const order = ['prepare','login','account','home','search','detail','install','download','ready','controls','loading','title','opening','play','menu','save','gameExit','steamReturn','sync','complete','resume','restore','continue'];
  const phases = ['进入云端','账号就绪','寻找游戏','启动游戏','游玩体验','保存退出','再次使用'];
  const phaseOf = {prepare:0,queue:0,login:1,verify:1,account:1,home:2,library:2,search:2,detail:2,install:2,download:2,ready:3,controls:3,loading:3,title:3,opening:4,touchTitle:4,touchDialogue:4,touchBattle:4,touchCinema:4,touchEditor:4,play:4,menu:4,settings:4,mapping:4,feedback:4,feedbackSent:4,reconnect:4,sessionLost:4,timeWarning:4,gameCrash:4,save:5,gameExit:5,steamReturn:5,sync:5,syncFailure:5,complete:5,resume:6,restore:6,continue:6};
  let lastGameStage = 'play';
  let current = 'prepare', selectedScheme = '键鼠操作', feedbackDraft = '', feedbackType = '操作问题';
  let toolbarExpanded = false, controlsVisible = true, touchLayout = 'full', touchOpacity = '62', touchSize = '100', safeFrame = false, immersive = false, touchDraft = null;
  let streamPreset = '自动', streamVolume = '80', overlayOrigin = 'play', toast = '';
  let keyMap = {confirm:'Enter',back:'Esc',menu:'Tab',action:'Space'};
  let savedByUser = false, gameRunning = false, sessionActive = false;
  const game = '女神异闻录5 皇家版';
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const data = {};
  function step(id,title,description,note,button,next,foot) { data[id] = {title,description,note,button,next,foot}; }
  step('prepare','等待云端环境就绪','START 申请云资源，展示连接、资源分配与 Steam 启动状态。繁忙时在这里进入排队。','资源等待发生在云会话建立阶段。预计时间与队列位置在正式产品中使用实时数据。','模拟环境就绪','login','START 云会话准备 · 方案示意');
  step('queue','资源繁忙时等待排队','保留当前申请，显示队列位置、预计等待与取消入口。获得资源后继续进入 Steam。','排队与时长数值均为演示，不引入第二次“单机游戏排队”，不套用竞品收费规则。','模拟获得资源','login','START 排队 · 异常 / 条件分支');
  step('login','登录自己的 Steam 账号','云端呈现 Steam 原生登录窗口。用户使用自己的账号密码或手机 Steam 应用完成登录。','原型不采集凭据。跨应用验证时应保留会话，实际后台保留策略待确认。','模拟登录完成','account','Steam 登录 · 公开示意界面');
  step('verify','完成 Steam 安全验证','需要 Steam Guard 验证时，提示用户在 Steam 手机应用确认，再返回当前会话。','不设计绕过验证，不将验证码或密码交给 START 保存。','模拟验证完成','account','Steam 安全验证 · 流程示意');
  step('account','确认账号与游戏库就绪','Steam 加载用户资料和游戏库，START 提醒确认账号。资料和游戏库加载完成后自动进入 Steam 大屏主页。','账号信息为演示；平台是否能读取此状态需技术评估。只展示必要的账号确认信息。','进入 Steam 主页','home','Steam 用户数据加载 · 方案示意');
  step('home','从 Steam 原生主页找游戏','保留 Steam 大屏主页与顶部搜索。START 的引导只说明如何操作，用户也可以从游戏库寻找。','主页为重绘示意，不包含真实账号内容。高亮区域用于演示 Steam 搜索入口。','使用 Steam 搜索','search','Steam 大屏主页 · 示意界面与导引');
  step('library','从游戏库选择目标游戏','展示 Steam 大屏游戏库。用户可以浏览已拥有的游戏，或切回搜索。','只开放目标游戏与搜索等主路径热点；其他 Steam 内容用于界面展示。','选择《女神异闻录5》','detail','Steam 大屏游戏库 · 示意界面与主路径热点');
  step('search','搜索《女神异闻录5 皇家版》','在 Steam 顶部搜索框输入游戏名称，查看匹配结果并进入详情。','检索与所有权状态最终由 Steam 确定。原型演示账号已拥有该游戏。','查看目标游戏','detail','Steam 搜索结果 · 方案示意');
  step('detail','在 Steam 详情确认并安装','复用 Steam 原生游戏详情结构，区分“未安装”与“已就绪”，点击安装后确认下载信息。','P5R 用于展示单机主路径。本轮不为它增加创意工坊或联机入口。','确认安装','install','Steam P5R 游戏详情 · 公开示意界面');
  step('install','确认云端安装','展示安装目标与可用空间检查。安装发生在当前云端环境，不占用本地游戏安装空间。','安装空间、磁盘保留和再次使用时是否免下载，需要结合 START 实际规则确定。','开始下载安装','download','Steam 安装确认 · 状态示意');
  step('download','下载与安装持续可见','展示下载、安装和校验状态。用户可以在会话内查看游戏资讯，下载信息保持可见。','进度、速度、剩余时间均为演示。下载计时与扣费口径在第六章另行讨论。','模拟安装完成','ready','Steam 下载与安装 · 状态示意');
  step('ready','从 Steam 启动游戏','安装完成后，Steam 详情主按钮变为“开始游戏”，用户从 Steam 发起启动。','保留原生详情结构，START 不接管 Steam 的游戏所有权或启动逻辑。','开始游戏','controls','Steam P5R 可启动状态 · 方案示意');
  step('controls','选择适合自己的操作方案','Steam 发起启动后，START 在画面中央弹窗提供操作方案，游戏可以同时加载。网页版默认键鼠。','方案为产品提案。模拟手柄和触屏方案需逐游戏适配；应用方案不会再次启动游戏。','应用操作方案','loading','START 操作方式弹窗 · 方案示意');
  step('loading','游戏在当前会话中加载','保持已选操作方案和会话，提示打开 START 菜单的入口。加载完成后自动进入 P5R 标题画面。','P5R 是单机游戏，此处没有二次云资源排队。菜单快捷键需与 Steam 及游戏按键冲突检测。','模拟游戏加载完成','title','P5R 启动与加载 · 方案示意');
  step('title','进入 P5R 标题画面','采用你提供的 P5R 标题画面，保留游戏自己的 Press Any Button 提示。START 只提供角落会话工具。','按任意键是原型推进热点。游戏账号、语言与标题内容仍由游戏本身决定。','模拟按任意键','opening','P5R 标题画面 · 用户提供的游戏截图');
  step('opening','从标题进入游戏内容','展示 P5R 真实过场画面，简化覆盖层，让角色与剧情成为主要内容。','此节点展示进入游戏的视觉衔接，不逐帧复刻原作开场顺序。实际新游戏 / 读档由游戏处理。','查看游玩状态','play','P5R 官方过场画面 · 展示原型');
  step('touchTitle','触屏：完整手柄与标题画面','参考 XGP 的双摇杆、十字键、ABXY、肩键与辅助键布局，展示 START 触屏方案。','这是手动选择的 START 拟议布局，非 Xbox 原生接入。按键仅有按下视觉反馈，不控制真实游戏。','查看剧情布局','touchDialogue','P5R 标题 · 触屏通用布局提案');
  step('touchDialogue','触屏：剧情阅读布局','保留确认 / 返回等少量按键；将画面缩至安全区域，避开游戏人物、字幕与对话框。','用户手动切换布局。P5R 输入映射需按 Steam 版本实测，不宣称自动识别剧情。','查看战斗布局','touchBattle','P5R 官方剧情画面 · 触屏布局提案');
  step('touchBattle','触屏：战斗指令布局','以十字键和 ABXY 为主，将触控区放在画面两侧，保护游戏的指令和队伍状态显示。','战斗布局是设计提案，映射与可用性待实测。按键按下只展示视觉反馈。','查看过场布局','touchCinema','P5R 官方战斗画面 · 触屏布局提案');
  step('touchCinema','触屏：过场精简布局','观看过场时减少按键，保留单个确认键和 START 会话工具。','手动切换；不承诺 Steam 游戏能直接复用 Xbox 的场景识别能力。','打开触屏布局设置','touchEditor','P5R 官方过场画面 · 触屏精简布局');
  step('touchEditor','按自己的习惯调整触屏布局','提供通用、剧情、战斗、过场预设，以及透明度、大小与画面安全区域选项。应用后回到原来的游戏节点。','布局不自动识别游戏进程。设置保存为本次演示状态，不会重新启动或结束游戏。','应用并返回画面','play','START 触屏布局设置 · 方案示意');
  step('play','开始游玩《女神异闻录5》','使用 P5R 官方游戏画面展示游玩状态。屏幕只保留小型 START 菜单入口，减少遮挡。','游戏画面用于展示；不能操作游戏角色。可点击 START 菜单，查看设置、反馈和结束流程。','打开 START 菜单','menu','P5R 官方游戏画面 · START 覆盖层设计');
  step('menu','在游戏中打开云端菜单','侧边抽屉提供操作、云画面、反馈与保存退出入口。关闭抽屉后回到当前游戏。','菜单和反馈不结束云会话，也不保证游戏暂停。抽屉接收的输入不继续传给游戏。','查看保存与退出','save','START 会话菜单 · 方案示意');
  step('settings','调整云画面与声音','在云会话内调整画面传输预设和声音，应用后回到游戏。游戏内画质需在游戏自身设置中修改。','本页设置影响云串流，不等于提升游戏内部画质。示例延迟与帧率不是性能承诺。','应用并返回游戏','play','START 云画面设置 · 方案示意');
  step('mapping','修改操作方案与按键','用户可以切换通用输入方案、修改基础映射。设置应用后返回当前游戏。','这里展示输入映射编辑结构，不保证所有游戏都支持同一套方案。P5R 专项键位需实测。','保存方案并返回','play','START 操作设置 · 方案示意');
  step('feedback','边游玩边反馈','反馈在当前会话内展开，可填写问题类型、说明并选择附带当前画面。收起后保留草稿。','反馈为演示，不向外部提交。游戏可能继续运行；真正暂停请使用游戏内暂停功能。','模拟提交反馈','feedbackSent','START 会话内反馈 · 方案示意');
  step('feedbackSent','反馈完成，继续游玩','提交后显示结果，并可立即回到游戏，不退出云进程或重新排队。','原型仅模拟提交成功。实际失败应保留草稿、允许重试并关联异常状态。','回到当前游戏','play','START 反馈结果 · 方案示意');
  step('reconnect','优先恢复原云会话','画面连接中断时，保留最后一帧，优先检查原会话并重连，避免新建第二个会话。','连接中断不等于游戏暂停。是否能保留、保留多久与资源策略需内部确认。','模拟恢复原会话','play','START 断线恢复 · 异常分支');
  step('sessionLost','原会话已不可恢复','说明当前会话不可恢复。用户可返回入口重新申请；不能宣称未保存的进度已经恢复。','重新进入只能读取已成功保存和同步的进度。资源保留与恢复规则仍待细化。','返回入口重新申请','exit','START 会话失效 · 异常分支');
  step('timeWarning','时长不足，提前准备保存','游戏仍在运行，提示尽快在游戏允许的位置完成保存，再结束本次会话。','剩余时长仅为示意。提醒阈值、额度耗尽后的宽限及后台同步策略待内部确认。','查看保存指引','save','START 时长提醒 · 条件分支');
  step('gameCrash','游戏异常退出，保留 Steam 会话','游戏进程异常终止，用户可在现有 Steam 会话中重新启动或反馈问题。','崩溃前未写入的进度可能无法恢复；不能将崩溃视为已完成保存。','返回 Steam 游戏详情','steamReturn','START 游戏异常退出 · 异常分支');
  step('save','先在游戏内保存进度','START 提醒用户回到 P5R 允许保存的位置，按游戏自身机制保存。完成后再退出游戏。','用户确认“已保存”不等于平台已验证存档成功；START 不能替游戏保存未写入的进度。','模拟用户确认已保存','gameExit','START 保存指引 · 非游戏原生存档菜单');
  step('gameExit','从游戏自身菜单退出','完成游戏内保存后，通过游戏的退出选项结束游戏，返回 Steam 大屏。','退出游戏与结束云会话分开。此页展示 START 指引，不伪造 P5R 原生退出菜单。','模拟退出游戏并返回 Steam','steamReturn','START 游戏退出指引 · 方案示意');
  step('steamReturn','退出游戏后仍可使用 Steam','回到 Steam 游戏详情，可继续使用 Steam 或准备结束云会话。适用的云存档上传可能已开始。','实际 Steam Cloud 状态能否被可靠读取需验证，无法确定时显示“待确认”，不误报成功。','准备结束云会话','sync','Steam 游戏已退出 · 收尾阶段');
  step('sync','等待 Steam 云存档同步','结束前检查适用的 Steam 云存档上传结果；同步期间保留 Steam 进程，确认完成后再回收云会话。','游戏内保存、Steam 云上传、会话关闭是三个不同状态。失败或未知不能显示“已完成”。','模拟确认同步完成并结束','complete','START 同步等待 · Steam Cloud 状态示意');
  step('syncFailure','同步未完成，保留会话重试','Steam 云同步失败或状态未确认时，告知风险并保留当前会话，允许重试或返回 Steam 检查。','不能以固定等待时间或本地文件存在代替上传成功。强制关闭分支及备份规则待内部讨论。','重试云存档同步','sync','START 云存档异常 · 异常分支');
  step('complete','本次游玩完成收尾','演示游戏已退出、适用 Steam 云存档已同步，云会话已结束。用户返回 START，可在下次继续。','此完成页建立在明确同步成功的演示条件上，不适用于直接关闭网页或不支持云存档的游戏。','查看再次使用体验','resume','START 会话结束结果 · 方案示意');
  step('resume','再次进入，继续已同步的进度','再次点击入口，申请新会话；确认同一 Steam 账号，按需拉取云存档与恢复个人操作方案。','上次会话已结束，本次是新会话；未结束会话的重连属于另一个分支。','模拟再次进入并恢复','restore','START 再次使用 · 方案示意');
  step('restore','检查账号、环境与云进度','在新会话中确认 Steam 账号一致、游戏就绪，并让 Steam 拉取适用云存档。个人操作方案单独恢复。','不承诺每次免登录或免安装。保存冲突和下载失败时需停留在 Steam 处理后再启动。','模拟恢复完成并启动游戏','continue','START 再次进入检查 · 方案示意');
  step('continue','在新的会话继续游玩','完成游戏内读档后继续游玩，START 保留操作设置与会话入口，完成整个使用闭环。','展示的是游戏画面示意；实际进度只以游戏成功保存且同步、读档的结果为准。','返回 START 入口详情','exit','P5R 官方游戏画面 · 再次使用状态');

  const photo = (src,alt) => '<img class="scene-photo" src="assets/'+src+'" alt="'+alt+'">';
  const p5 = (frame='05') => photo('p5r-gameplay-'+frame+'.jpg','女神异闻录5 皇家版官方游戏画面');
  const overlayStates = ['menu','settings','mapping','feedback','feedbackSent','touchEditor'];
  const gameStates = ['title','opening','play','continue','touchTitle','touchDialogue','touchBattle','touchCinema'];
  const steamStates = ['home','library','detail','install','download','ready','steamReturn'];
  const isGameOrigin = () => gameStates.includes(overlayOrigin);
  const originFor = id => id==='gameCrash' ? 'steamReturn' : steamStates.includes(id) || gameStates.includes(id) ? id : 'play';
  const shade = '<div class="scene-fade"></div>';
  const btn = (text,go,kind='primary') => '<button type="button" class="u-btn '+kind+'" data-go="'+go+'">'+text+'</button>';
  const chip = text => '<span class="u-chip">'+text+'</span>';
  const icon = name => {
    const paths = {
      pad:'<rect x="3" y="7" width="18" height="11" rx="4"/><path d="M7 10v5m-2.5-2.5h5M16 11h.01M19 14h.01"/>',
      menu:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
      expand:'<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/>',
      eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';
  };
  const cloudHandle = () => '<button type="button" class="cloud-handle" data-action="menu" aria-label="打开 START 菜单"><span class="tiny-start">➤</span><span class="hud-latency">18 ms</span></button>';
  const gameVisual = id => ['title','touchTitle'].includes(id) ? 'p5r-title-user.png' : ['opening','touchCinema'].includes(id) ? 'p5r-gameplay-02.jpg' : id==='touchBattle' ? 'p5r-gameplay-06.jpg' : 'p5r-gameplay-03.jpg';
  const gameView = (id=current) => '<div class="game-canvas '+(selectedScheme==='触屏虚拟手柄'&&safeFrame?'safe-frame':'')+'"><img class="p5-game-image '+(gameVisual(id)==='p5r-title-user.png'?'title-source':'')+'" src="assets/'+gameVisual(id)+'" alt="'+(['title','touchTitle'].includes(id)?'P5R 标题画面，用户提供截图':'P5R 官方游戏画面')+'"></div>';
  const padButton = (name,cls,extra='') => '<button type="button" class="pad-control '+cls+'" data-pad="'+name+'" aria-label="虚拟 '+name+' 键（按下演示）">'+(extra||name)+'</button>';
  const stick = (name,cls) => padButton(name,'stick '+cls,'<i></i><span>'+name+'</span>');
  const dpad = () => '<div class="pad-dpad" role="group" aria-label="虚拟十字键">'+['↑','←','→','↓'].map((v,i)=>padButton(v,'dpad-'+i,v)).join('')+'</div>';
  const faces = () => '<div class="pad-faces">'+['Y','X','B','A'].map(v=>padButton(v,'face face-'+v)).join('')+'</div>';
  const touchPad = () => {
    if(!controlsVisible)return '';
    let parts='';
    if(touchLayout==='full')parts=stick('L','left-stick')+dpad()+stick('R','right-stick')+faces()+padButton('LB','shoulder left-lb')+padButton('LT','trigger left-lt')+padButton('RB','shoulder right-rb')+padButton('RT','trigger right-rt')+padButton('L3','aux left-l3')+padButton('R3','aux right-r3');
    if(touchLayout==='dialogue')parts=padButton('A','dialog-confirm face-A')+padButton('B','dialog-back face-B')+padButton('X','dialog-extra face-X');
    if(touchLayout==='battle')parts=dpad()+faces()+padButton('LB','shoulder left-lb')+padButton('RB','shoulder right-rb');
    if(touchLayout==='cinema')parts=padButton('A','cinema-confirm face-A');
    if(touchLayout!=='cinema')parts+=padButton('View','aux game-view','<span class="view-symbol">▱</span>')+padButton('Menu','aux game-menu','<span>☰</span>');
    return '<div class="touch-pad layout-'+touchLayout+'" style="--pad-opacity:'+Number(touchOpacity)/100+';--pad-scale:'+Number(touchSize)/100+'">'+parts+'</div>';
  };
  const hud = (id=current) => '<div class="cloud-tools '+(toolbarExpanded?'expanded':'')+'"><button type="button" class="tool-brand" data-action="toggleToolbar" aria-label="'+(toolbarExpanded?'收起云端工具栏':'展开云端工具栏')+'"><span>➤</span></button><button type="button" class="tool-menu" data-action="menu" aria-label="打开 START 菜单">'+icon('menu')+'</button><span class="tool-connection"><i></i>18 ms</span><div class="tool-extra"><button type="button" data-go="touchEditor" aria-label="触屏布局设置">'+icon('pad')+'</button><button type="button" data-action="togglePad" aria-label="'+(controlsVisible?'隐藏触屏按键':'显示触屏按键')+'">'+icon('eye')+'</button><button type="button" data-action="immersive" aria-label="沉浸预览">'+icon('expand')+'</button></div></div>'+ (selectedScheme==='触屏虚拟手柄'?touchPad():'')+ (selectedScheme==='触屏虚拟手柄'?'<span class="layout-caption">'+({full:'通用手柄',dialogue:'剧情布局',battle:'战斗布局',cinema:'过场布局'}[touchLayout])+'</span>':'');

  const panel = (title,body,actions,extra='') => '<div class="u-panel '+extra+'"><div class="u-panel-label">START 云会话</div><h2>'+title+'</h2>'+body+'<div class="u-actions">'+actions+'</div></div>';
  const steamDetail = (state='install') => {
    const installed = state==='ready' || state==='returned';
    const button = installed ? '▶ 开始游戏' : '↓ 安装';
    return photo('steam-detail.svg','Steam 大屏模式女神异闻录5 皇家版详情示意')+
      '<div class="steam-info-rebuild"><div class="steam-action-row"><button type="button" class="steam-main-action '+(installed?'installed':'')+'" data-go="'+(installed?'controls':'install')+'">'+button+'</button><div><small>当前状态</small><b>'+(installed?'已安装 · 可启动':'未安装')+'</b></div><div><small>游戏权限</small><b>演示账号已拥有</b></div><button type="button" class="steam-icon-button" data-go="mapping" aria-label="操作设置">◉</button></div><p class="steam-owned">女神异闻录5 皇家版 · 来自您的 Steam 游戏库</p><div class="steam-cloud-state">'+(state==='returned'?'◌ STEAM 云：等待同步确认':installed?'☁ STEAM 云：启动前检查同步状态':'☁ 支持 Steam 云存档 · 同步状态以 Steam 为准')+'</div><div class="steam-tabs"><span class="active">活动</span><span>您的内容</span><span>社区</span><span>游戏信息</span></div><div class="steam-news"><strong>游戏动态</strong><p>从 Steam 进入游戏，查看相关资讯与已拥有的内容</p></div></div>'+ '<button class="steam-cloud-handle" type="button" data-action="menu" aria-label="打开 START 菜单">➤</button>';
  };
  const overlayBackground = () => {
    const source = overlayOrigin==='home' ? photo('steam-home.svg','Steam 大屏主页') :
      overlayOrigin==='library' ? photo('steam-library.svg','Steam 大屏游戏库') :
      steamStates.includes(overlayOrigin) ? steamDetail(overlayOrigin==='steamReturn'?'returned':overlayOrigin==='ready'?'ready':'install') :
      gameView(overlayOrigin);
    return '<div style="position:absolute;inset:0;pointer-events:none;z-index:0" inert aria-hidden="true">'+source+'</div>';
  };
  const choices = () => [
    ['键鼠操作','⌨','直接使用键盘与鼠标 · 网页版默认'],
    ['键鼠模拟手柄','✥','将按键映射为手柄输入'],
    ['实体手柄','◉','连接手柄后可用 · 状态示意'],
    ['触屏虚拟手柄','▧','触屏设备使用屏幕手柄']
  ].map(([name,icon,desc]) => '<button type="button" class="scheme-option '+(selectedScheme===name?'selected':'')+'" data-scheme="'+name+'"><b>'+icon+'</b><span><strong>'+name+'</strong><small>'+desc+'</small></span><i>'+(selectedScheme===name?'✓':'')+'</i></button>').join('');
  const scenes = {
    prepare: () => '<div class="prepare-scene"><div class="prepare-content"><div class="prepare-icon">ϟ</div><h2>正在准备 Steam 大屏环境</h2><p>正在连接云端资源，请稍候</p><div class="prepare-bars"><span class="done"></span><span class="active"></span><span></span></div><p class="prepare-caption">连接服务 → 分配资源 → 启动 Steam</p><button type="button" class="u-text" data-go="exit">取消准备</button></div></div>',
    queue: () => '<div class="prepare-scene"></div>'+panel('正在等待云端资源','<div class="queue-icon">◷</div><p>当前申请已保留，请稍候</p><div class="queue-stats"><div><small>队列位置 · 示例</small><strong>第 3 位</strong></div><div><small>预计等待 · 示例</small><strong>约 2 分钟</strong></div></div><div class="u-note">预计等待会随资源变化更新，进入后再登录 Steam。</div>',btn('取消申请','exit','secondary'),'queue-panel'),
    login: () => photo('start-steam-login-web.svg','Steam 登录流程公开示意界面')+'<button type="button" class="steam-login-hotspot" data-go="account" aria-label="登录 Steam 演示账号"></button>'+'<div class="login-cleanup" aria-hidden="true"></div><div class="scene-guide login-guide"><strong>登录自己的 Steam 账号</strong><br>账号密码或手机 Steam 应用扫码<br><small>点击登录按钮进入示例账号</small><br><button type="button" class="u-text" data-go="verify">查看需要安全验证时的引导 →</button></div>',
    verify: () => '<div class="prepare-scene"></div>'+panel('在 Steam 应用完成验证','<div class="u-icon">✓</div><p>请在自己的 Steam 手机应用中确认登录请求，<br>然后返回此云会话。</p><div class="u-note">当前会话保持连接。START 不获取你的密码或令牌。</div>',btn('返回登录窗口','login','secondary')+btn('验证完成，继续','account')),
    account: () => '<div class="prepare-scene"></div>'+panel('Steam 账号已登录','<div class="account-card"><span class="account-avatar">S</span><div><strong>Steam 演示账号</strong><small>请核对当前登录账号是自己的账号</small></div>'+chip('账号示意')+'</div><div class="check-list"><p><i>✓</i> Steam 用户资料已加载</p><p><i>✓</i> 游戏库已就绪</p></div>',btn('切换账号','login','secondary')+'<button type="button" class="u-btn pending" data-account-loading disabled>资料加载中…</button>'),
    home: () => photo('steam-home.svg','Steam 大屏模式主页公开示意界面')+'<button type="button" class="home-search" data-go="search" aria-label="使用 Steam 顶部搜索"><b>⌕</b>搜索游戏或个人资料……</button><div class="scene-guide home-tip"><strong>点击顶部 Steam 搜索框</strong><br>输入「女神异闻录5」寻找游戏<br><button type="button" class="u-text" data-go="library">也可以从游戏库选择 →</button></div><button class="steam-cloud-handle" type="button" data-action="menu" aria-label="打开 START 菜单">➤</button>',
    library: () => photo('steam-library.svg','Steam 大屏模式游戏库公开示意界面')+'<div class="library-target"><img src="assets/steam-detail.svg" alt="女神异闻录5 皇家版"><div><strong>女神异闻录5 皇家版</strong><small>Steam 游戏库 · 演示目标</small></div>'+btn('查看游戏','detail')+'</div><button type="button" class="library-search" data-go="search">⌕ 搜索游戏</button>',
    search: () => photo('steam-home.svg','Steam 大屏主页背景')+shade+'<div class="steam-search-panel"><div class="u-panel-label">Steam 大屏 · 搜索</div><h2>寻找想玩的游戏</h2><div class="steam-search-input"><input id="steam-game-query" aria-label="搜索游戏名称" value="'+game+'" spellcheck="false"><button type="button" class="scene-button" data-go="detail">搜索</button></div><p class="search-section-label">来自您的游戏库 · 1 个匹配结果</p><button type="button" class="search-result" data-go="detail" aria-label="打开女神异闻录5皇家版详情"><img src="assets/steam-detail.svg" alt="女神异闻录5 皇家版游戏横幅"><span><strong>'+game+'</strong><small>ATLUS / SEGA · 已拥有 · 尚未安装</small></span><b>›</b></button><p class="search-note">搜索结果与游戏权限为流程示意</p></div>',
    detail: () => steamDetail()+'<div class="scene-guide detail-tip">确认目标游戏后，点击 Steam <strong>「安装」</strong></div>',
    install: () => steamDetail()+shade+panel('安装《女神异闻录5》','<div class="install-summary"><img src="assets/steam-detail.svg" alt="P5R游戏横幅"><div><strong>'+game+'</strong><small>安装到当前云端环境</small></div></div><div class="check-list"><p><i>✓</i> 安装空间检查通过 <span>示例状态</span></p><p><i>↓</i> 所需空间以 Steam 安装窗口显示为准</p></div><div class="u-note">本地设备无需下载 PC 游戏文件。</div>',btn('取消','detail','secondary')+btn('开始安装','download')),
    download: () => steamDetail()+shade+'<div class="download-stage"><div class="u-panel-label">Steam 大屏 · 下载</div><h2>'+game+'</h2><p>下载与安装进行中</p><div class="download-track"><i></i></div><div class="download-meta"><strong>68%</strong><span>下载速度 80 MB/s · 预计剩余 2 分钟</span></div><div class="download-stages"><span class="done">✓ 下载中</span><span>安装</span><span>校验</span></div><div class="waiting-news"><img src="assets/p5r-gameplay-03.jpg" alt="P5R官方游戏画面"><div><small>等待时了解游戏</small><strong>开启你的怪盗生活</strong><p>《女神异闻录5 皇家版》游戏画面预览</p></div></div><small class="download-disclaimer">进度 / 速度 / 时间均为演示数值，云会话保持连接</small></div>',
    ready: () => steamDetail('ready')+'<div class="scene-guide ready-caption">安装完成，点击 Steam <strong>「开始游戏」</strong></div>',
    controls: () => gameView('title')+shade+panel('选择操作方式','<p>本次游玩《女神异闻录5 皇家版》</p><div class="scheme-grid">'+choices()+'</div><small class="u-muted">游戏正在加载。稍后可在 START 菜单中修改。</small>',btn('应用并继续','loading'),'scheme-panel'),
    loading: () => '<div class="load-scene"><div class="load-content"><div class="load-ring" aria-hidden="true"></div><h2>正在启动《女神异闻录5 皇家版》</h2><p>游戏即将在当前云会话中打开</p><span class="load-status">当前操作方式：'+esc(selectedScheme)+'</span><small>打开 START 菜单：Ctrl + Shift + M · 示意快捷键</small></div></div>',
        title: () => gameView('title')+hud('title')+'<button type="button" class="title-start-hotspot" data-go="opening" aria-label="按任意键进入 P5R"></button>',
    opening: () => gameView('opening')+hud('opening'),
    touchTitle: () => gameView('touchTitle')+hud('touchTitle'),
    touchDialogue: () => gameView('touchDialogue')+hud('touchDialogue'),
    touchBattle: () => gameView('touchBattle')+hud('touchBattle'),
    touchCinema: () => gameView('touchCinema')+hud('touchCinema'),
    touchEditor: () => overlayBackground()+shade+panel('调整触屏布局','<p>选择适合当前场景的布局</p><div class="touch-layout-grid">'+[['full','通用手柄','双摇杆 · 十字键 · 完整按键'],['dialogue','剧情阅读','减少按键 · 保留对话区域'],['battle','战斗指令','十字键 · ABXY · 肩键'],['cinema','观看过场','单个确认键 · 精简覆盖层']].map(([id,title,desc])=>'<button type="button" data-layout="'+id+'" class="layout-option '+(touchLayout===id?'selected':'')+'"><strong>'+title+'</strong><small>'+desc+'</small></button>').join('')+'</div><div class="touch-range-grid"><label class="u-field">按键透明度 <output id="opacity-value">'+touchOpacity+'%</output><input id="touch-opacity" type="range" min="30" max="85" value="'+touchOpacity+'"></label><label class="u-field">按键大小 <output id="size-value">'+touchSize+'%</output><input id="touch-size" type="range" min="80" max="120" value="'+touchSize+'"></label></div><label class="feedback-check"><input id="touch-safe-frame" type="checkbox" '+(safeFrame?'checked':'')+'> 为触屏按键预留两侧安全区域</label><div class="u-note">手动切换布局。当前预设与映射需按 Steam 游戏实测。</div>', '<button type="button" class="u-btn secondary" data-action="returnGame">取消并返回</button><button type="button" class="u-btn primary" data-action="applyTouch">应用触屏方案</button>','touch-editor-panel'),

    play: () => gameView('play')+hud()+(toast?'<div class="game-toast">'+esc(toast)+'</div>':''),
    continue: () => gameView('continue')+hud()+'<div class="game-toast">再次使用 · 已通过游戏内读档继续</div>',
    menu: () => overlayBackground()+(isGameOrigin()?hud(overlayOrigin):'')+'<div class="drawer-shade"></div><div class="cloud-drawer"><div class="drawer-title"><span>START 云会话</span><button type="button" class="u-close" data-action="returnGame" aria-label="收起菜单">×</button></div><div class="drawer-account"><span class="account-avatar">S</span><div><strong>本次可用时长</strong><small>剩余 00:42:18 · 示例</small></div></div><div class="drawer-health"><span><i></i> 连接正常</span><small>18 ms · 示例延迟</small></div><div class="drawer-items"><button type="button" data-action="returnGame"><i>▶</i>' +(isGameOrigin()?'继续游戏':'继续使用 Steam')+'</button><button type="button" data-go="mapping"><i>⌨</i>操作设置<span>›</span></button><button type="button" data-go="settings"><i>▣</i>云画面与声音<span>›</span></button><button type="button" data-go="feedback"><i>▤</i>问题反馈<span>›</span></button><button type="button" data-go="'+(isGameOrigin()?'save':'sync')+'" class="exit-item"><i>↪</i>'+(isGameOrigin()?'保存与退出':'结束云会话')+'<span>›</span></button></div><div class="drawer-note">云会话保持连接。<br>'+(isGameOrigin()?'展开菜单不保证游戏暂停。':'当前未运行游戏，继续保留 Steam。')+'</div></div>',
    settings: () => overlayBackground()+shade+panel('云画面与声音','<p>调整画面传输，不改变游戏内画质设置</p><label class="u-field">云画面预设<select id="stream-preset"><option '+(streamPreset==='自动'?'selected':'')+'>自动</option><option '+(streamPreset==='流畅'?'selected':'')+'>流畅</option><option '+(streamPreset==='清晰'?'selected':'')+'>清晰</option></select></label><div class="settings-summary"><span>传输分辨率<strong>1920 × 1080</strong></span><span>目标串流帧率<strong>60 FPS</strong></span></div><label class="u-field">声音音量<input id="stream-volume" type="range" min="0" max="100" value="'+streamVolume+'"></label><div class="u-note">示例参数。实际可选配置取决于设备、浏览器与云资源。</div>',btn('返回菜单','menu','secondary')+'<button type="button" class="u-btn primary" data-action="applySettings">'+(isGameOrigin()?'应用并返回游戏':'应用并返回 Steam')+'</button>','settings-panel'),
    mapping: () => overlayBackground()+shade+panel('操作方案与按键','<div class="scheme-grid compact">'+choices()+'</div><div class="mapping-grid">'+Object.entries(keyMap).map(([key,value])=>'<label><span>'+({confirm:'确认',back:'返回',menu:'菜单',action:'动作'}[key])+'</span><input data-key="'+key+'" value="'+esc(value)+'" aria-label="'+({confirm:'确认',back:'返回',menu:'菜单',action:'动作'}[key])+'映射按键"></label>').join('')+'</div><div class="u-note">基础映射示例，可按游戏自定义；实体手柄需要实际连接检测。</div>','<button type="button" class="u-btn secondary" data-action="resetMapping">恢复默认</button>'+'<button type="button" class="u-btn primary" data-action="applyMapping">'+(isGameOrigin()?'保存并返回游戏':'保存并返回 Steam')+'</button>','mapping-panel'),
    feedback: () => overlayBackground()+shade+panel('反馈当前遇到的问题','<div class="feedback-session">● 当前云会话保持连接 · '+(isGameOrigin()?'游戏可能仍在运行':'Steam 保持打开')+'</div><label class="u-field">问题类型<select id="feedback-type">'+['操作问题','画面与网络','登录 / 游戏启动','存档 / 退出','其他问题'].map(v=>'<option '+(feedbackType===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label><label class="u-field">问题说明<textarea id="feedback-text" placeholder="描述遇到的问题及发生时的操作…">'+esc(feedbackDraft)+'</textarea></label><label class="feedback-check"><input type="checkbox" id="feedback-frame"> 附带当前会话画面（可选）</label><small class="u-muted">收起可继续当前会话，草稿将保留。</small>', '<button type="button" class="u-btn secondary" data-action="returnGame">'+(isGameOrigin()?'收起并继续游戏':'收起并返回 Steam')+'</button>'+btn('提交反馈','feedbackSent'),'feedback-panel'),
    feedbackSent: () => overlayBackground()+shade+panel('反馈已记录','<div class="u-icon">✓</div><p>感谢反馈，可以继续'+(isGameOrigin()?'当前游戏':'使用 Steam')+'</p><div class="u-note">提交成功为原型示意；云会话未关闭，无需重新排队。</div>',btn(isGameOrigin()?'回到当前游戏':'回到 Steam',overlayOrigin)),
    reconnect: () => gameView(lastGameStage)+shade+panel('画面连接暂时中断','<div class="load-ring small-ring"></div><p>正在检查原云会话，尝试恢复画面</p><div class="u-note">断线不代表游戏暂停。优先恢复当前会话，避免重复启动。</div>',btn('查看原会话失效分支','sessionLost','secondary')+btn('重试连接','recoverGame')),
    sessionLost: () => gameView(lastGameStage)+shade+panel('原云会话已结束','<div class="u-icon warning">!</div><p>暂时无法恢复原会话</p><div class="u-note">未在游戏内保存或未成功同步的进度可能无法恢复。返回入口后可申请新会话。</div>',btn('返回 START 入口','exit')),
    timeWarning: () => gameView(lastGameStage)+hud(lastGameStage)+panel('剩余时长不足 5 分钟','<p>请尽快在游戏允许的位置保存进度</p><div class="u-note">保存后退出游戏，并等待适用的 Steam 云存档同步。提醒阈值为方案示意。</div>',btn('继续游戏','play','secondary')+btn('查看保存指引','save')),
    gameCrash: () => gameView(lastGameStage)+shade+panel('游戏异常退出','<p>Steam 云会话仍在运行</p><div class="u-note">你可以返回 Steam 检查并重新启动。崩溃前未写入的进度可能无法恢复。</div>',btn('反馈问题','feedback','secondary')+btn('返回 Steam','steamReturn')),
    save: () => p5('03')+shade+panel('先在游戏内保存','<div class="save-steps"><div><b>1</b><span>回到游戏允许保存的位置</span></div><div><b>2</b><span>使用 P5R 自身的存档功能</span></div><div><b>3</b><span>完成后再退出游戏并等待云同步</span></div></div><div class="u-note">START 无法替游戏保存未写入的进度。直接关闭网页可能丢失进度。</div>',btn('返回游戏完成保存','play','secondary')+'<button type="button" class="u-btn primary" data-action="saved">我已在游戏内保存</button>','save-panel'),
    gameExit: () => p5('03')+shade+panel('接下来，退出游戏','<div class="check-list"><p><i>✓</i> 用户已确认完成游戏内保存</p><p><i>2</i> 使用游戏自身菜单退出至 Steam</p></div><div class="u-note">这只结束游戏。当前 Steam 大屏云会话继续保留。</div>',btn('返回游戏','play','secondary')+btn('我已退出游戏，返回 Steam','steamReturn')),
    steamReturn: () => steamDetail('returned')+'<div class="return-session-bar"><div><strong>游戏已退出</strong><small>继续使用 Steam，或等待存档同步后结束云会话</small></div>'+btn('继续使用 Steam','home','secondary')+btn('结束云会话','sync')+'</div>',
    sync: () => steamDetail('returned')+shade+panel('正在同步 Steam 云存档','<div class="sync-status"><div><i>✓</i><span>游戏已退出</span></div><div class="active"><i>↥</i><span>等待 Steam 云存档上传完成</span></div><div><i>3</i><span>确认成功后，结束云会话</span></div></div><div class="sync-track"><i></i></div><div class="u-note">同步期间保持 Steam 进程。请勿直接关闭网页；不能确认时将显示待处理。</div>',btn('返回 Steam 检查','steamReturn','secondary')+'<button type="button" class="u-btn pending" disabled>同步中，请稍候…</button>','sync-panel'),
    syncFailure: () => steamDetail('returned')+shade+panel('云存档同步未完成','<div class="u-icon warning">!</div><p>Steam 云同步失败，或状态暂未确认</p><div class="u-note">当前会话仍保留。请重试或在 Steam 中检查。完成前不能保证跨设备进度已更新。</div>',btn('返回 Steam 检查','steamReturn','secondary')+btn('重试同步','sync'),'sync-panel'),
    complete: () => '<div class="prepare-scene"></div>'+panel('本次游玩已结束','<div class="u-icon">✓</div><div class="check-list"><p><i>✓</i> 游戏已退出</p><p><i>✓</i> 适用 Steam 云存档同步完成</p><p><i>✓</i> 云会话已结束</p></div><p class="completion-game">'+game+'</p>',btn('返回入口详情','exit','secondary')+btn('查看再次使用','resume')),
    resume: () => '<div class="prepare-scene"></div>'+panel('再次游玩，继续你的旅程','<div class="install-summary"><img src="assets/steam-detail.svg" alt="P5R横幅"><div><strong>'+game+'</strong><small>上次退出：云存档已完成同步 · 演示</small></div></div><div class="u-note">本次申请新的云会话。再次进入时需确认同一 Steam 账号，并按实际环境检查安装与云存档。</div>',btn('回到入口详情','exit','secondary')+btn('再次进入','restore')),
    restore: () => '<div class="prepare-scene"></div>'+panel('正在准备继续游玩','<div class="sync-status"><div><i>✓</i><span>Steam 账号已确认一致</span></div><div><i>✓</i><span>游戏环境已就绪 · 示例</span></div><div class="active"><i>↓</i><span>Steam 拉取适用的云存档</span></div><div><i>✓</i><span>START 操作方案：'+esc(selectedScheme)+'</span></div></div><div class="u-note">出现云存档冲突时，先在 Steam 中处理。环境与存档就绪后再启动并读档。</div>',btn('检查 Steam 游戏详情','ready','secondary')+btn('启动游戏并继续','continue'),'restore-panel')
  };

  // Accelerated local demonstration; production transitions are driven by service results.
  const waitSpecs = {
    prepare:{duration:4400,next:'login',status:['正在连接云服务','正在分配云端资源','正在启动 Steam','Steam 环境已就绪']},
    queue:{duration:7000,next:'login',status:['等待可用资源','队列正在前进','即将进入云端环境','资源已分配，正在连接']},
    account:{duration:2800,next:'home',status:['正在加载 Steam 用户资料','正在读取游戏库','正在准备大屏主页','账号与游戏库已就绪']},
    download:{duration:7200,next:'ready',status:['正在下载游戏文件','正在安装游戏','正在校验游戏文件','安装与校验完成']},
    loading:{duration:3600,next:'title',status:['正在启动游戏进程','正在加载游戏资源','正在连接游戏画面','游戏画面已就绪']},
    opening:{duration:5000,next:'play',status:['正在进入游戏','正在进入游戏','即将进入游玩画面','游戏已就绪']},
    sync:{duration:4400,next:'complete',status:['正在上传 Steam 云存档','正在上传 Steam 云存档','正在确认上传结果','云存档上传已确认']},
    restore:{duration:4500,next:'continue',status:['正在确认同一 Steam 账号','正在检查游戏安装环境','正在拉取适用云存档','环境与云进度已就绪']},
    reconnect:{duration:3200,next:'recoverGame',status:['正在检查原云会话','正在恢复画面连接','正在重新接收画面','原会话连接已恢复']}
  };
  let autoAdvance = new URLSearchParams(location.search).get('manual') !== '1';
  let mockSyncOutcome='success', waitJob=null, waitTimer=null, waitGeneration=0;
  const waitMeter=()=>'<div class="wait-meter"><div class="wait-statusline"><strong data-wait-status>正在准备…</strong><span data-wait-percent>0%</span></div><div class="wait-progress-track" data-wait-track role="progressbar" aria-label="当前任务进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i data-wait-fill></i></div></div>';
  function stopWait(){
    if(waitTimer!==null)clearInterval(waitTimer);
    waitTimer=null;waitJob=null;waitGeneration++;
  }
  function updateAutoReview(){
    const box=$('flow-auto-enabled'),label=$('flow-auto-state');
    if(box)box.checked=autoAdvance;
    if(label)label.textContent=waitJob ? (!autoAdvance?'等待演示已暂停':document.hidden?'切回页面后继续':Math.max(0,Math.ceil((waitJob.spec.duration+450-waitJob.elapsed)/1000))+' 秒后自动继续') : '等待节点自动演示';
    if($('flow-sync-result-wrap'))$('flow-sync-result-wrap').hidden=!['sync','syncFailure'].includes(current);
    if($('flow-sync-result'))$('flow-sync-result').value=mockSyncOutcome;
  }
  function mountWaitUI(id){
    let host=null;
    if(id==='prepare')host=scene.querySelector('.prepare-content');
    if(id==='account')host=scene.querySelector('.account-card')?.parentElement;
    if(id==='loading')host=scene.querySelector('.load-content');
    if(id==='opening') {const box=document.createElement('div');box.className='opening-wait';box.innerHTML=waitMeter();scene.append(box);return;}
    if(['queue','restore','reconnect'].includes(id))host=scene.querySelector('.u-panel');
    if(id==='restore'){const button=scene.querySelector('[data-go="continue"]');button.disabled=true;button.textContent='正在准备，请稍候…';}
    if(host){const meter=document.createElement('div');meter.innerHTML=waitMeter();const el=meter.firstElementChild,actions=host.querySelector('.u-actions');if(actions)host.insertBefore(el,actions);else host.append(el);}
    if(['sync','download'].includes(id)){
      const track=scene.querySelector(id==='sync'?'.sync-track':'.download-track');
      track.setAttribute('role','progressbar');track.setAttribute('aria-label',id==='sync'?'云存档上传进度':'下载安装进度');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.dataset.waitTrack='';
      track.querySelector('i').dataset.waitFill='';
      const status=document.createElement('div');status.className='wait-inline-status';status.dataset.waitStatus='';
      track.before(status);
    }
  }
  function setWaitProgress(job){
    const p=Math.min(1,job.elapsed/job.spec.duration),percent=Math.floor(p*100);
    const phase=p>=1?3:p<.34?0:p<.72?1:2;
    const label=job.spec.status[phase];
    scene.querySelectorAll('[data-wait-fill]').forEach(el=>el.style.width=percent+'%');
    scene.querySelectorAll('[data-wait-track]').forEach(el=>el.setAttribute('aria-valuenow',percent));
    scene.querySelectorAll('[data-wait-percent]').forEach(el=>el.textContent=percent+'%');
    scene.querySelectorAll('[data-wait-status]').forEach(el=>el.textContent=job.id==='sync'&&phase===3&&mockSyncOutcome==='failure'?'上传结果暂未确认':label);
    if(job.id==='prepare'){
      scene.querySelector('[data-wait-status]').textContent='环境准备进度';
      scene.querySelector('.prepare-content>p').textContent=label;
      scene.querySelectorAll('.prepare-bars span').forEach((el,i)=>{el.classList.toggle('done',i<phase);el.classList.toggle('active',i===phase);});
    }
    if(job.id==='queue'){
      const pos=p>=1?0:p<.34?3:p<.7?2:1,values=scene.querySelectorAll('.queue-stats strong');
      values[0].textContent=pos?'第 '+pos+' 位':'正在进入';
      values[1].textContent=p>=1?'已分配资源':Math.max(1,Math.ceil((job.spec.duration-job.elapsed)/1000))+' 秒 · 演示';
    }
    if(job.id==='account'){
      const rows=scene.querySelectorAll('.check-list p');
      rows[0].innerHTML='<i>'+(p>=.35?'✓':'◌')+'</i> '+(p>=.35?'Steam 用户资料已加载':'正在加载 Steam 用户资料');
      rows[1].innerHTML='<i>'+(p>=.8?'✓':'◌')+'</i> '+(p>=.8?'游戏库已就绪':'正在读取 Steam 游戏库');
      const button=scene.querySelector('[data-account-loading]');if(button)button.textContent=p>=1?'已就绪，即将进入主页':'资料加载中…';
    }
    if(job.id==='download'){
      const dPhase=p>=1?3:p<.72?0:p<.92?1:2;
      scene.querySelector('.download-stage>p').textContent=['正在下载游戏文件','下载完成，正在安装','安装完成，正在校验','安装与校验完成'][dPhase];
      scene.querySelector('.download-meta strong').textContent=percent+'%';
      scene.querySelector('.download-meta span').textContent=dPhase===0?'下载速度 80 MB/s · 约 '+Math.max(1,Math.ceil((job.spec.duration-job.elapsed)/1000))+' 秒后就绪':dPhase===1?'游戏文件已下载 · 正在完成安装':dPhase===2?'正在验证文件完整性':'即将打开可启动的游戏详情';
      scene.querySelectorAll('.download-stages span').forEach((el,i)=>{el.textContent=(i<dPhase?'✓ ':i===dPhase?'◌ ':'')+['下载','安装','校验'][i];el.classList.toggle('done',i<dPhase);el.classList.toggle('active',i===dPhase);});
      scene.querySelector('[data-wait-status]').textContent='游戏下载与安装进度';
    }
    if(job.id==='loading'){scene.querySelector('.load-content>p').textContent=label;scene.querySelector('[data-wait-status]').textContent='游戏载入进度';}
    if(job.id==='restore'){
      const launch=scene.querySelector('[data-go="continue"]');launch.disabled=p<1;launch.textContent=p<1?'正在准备，请稍候…':'准备完成，即将继续';
      const rows=scene.querySelectorAll('.sync-status>div'),thresholds=[.18,.42,.83,1];
      const names=['确认同一 Steam 账号','检查游戏安装环境','拉取适用的 Steam 云存档','恢复个人操作方案'];
      rows.forEach((el,i)=>{const done=p>=thresholds[i],active=!done&&(i===0||p>=thresholds[i-1]);el.classList.toggle('active',active);el.innerHTML='<i>'+(done?'✓':active?'◌':i+1)+'</i><span>'+names[i]+(done?' · 已就绪':'')+'</span>';});
    }
    if(job.id==='sync'){
      const rows=scene.querySelectorAll('.sync-status>div');rows[1].classList.toggle('active',p<.9);rows[2].classList.toggle('active',p>=.9);
      rows[1].innerHTML='<i>'+(p>=.9?'✓':'↥')+'</i><span>'+(p>=.9?'上传传输完成':'正在上传 Steam 云存档 · '+percent+'%')+'</span>';
      scene.querySelector('[data-wait-status]').textContent='云存档上传进度';
      rows[2].innerHTML='<i>'+(p>=1?(mockSyncOutcome==='failure'?'!':'✓'):'◌')+'</i><span>'+(p>=1?(mockSyncOutcome==='failure'?'上传结果未确认，保留会话':'上传已确认，即将结束云会话'):p>=.9?'正在确认上传结果':'确认结果后，结束云会话')+'</span>';
    }
    updateAutoReview();
  }
  function finishWait(id,generation){
    if(!waitJob||waitJob.id!==id||waitJob.generation!==generation||current!==id||root.classList.contains('hidden'))return;
    const target=id==='sync'&&mockSyncOutcome==='failure'?'syncFailure':waitJob.spec.next;
    stopWait();render(target);
  }
  function beginWait(id){
    if(!waitSpecs[id]){updateAutoReview();return;}
    mountWaitUI(id);
    waitJob={id,spec:waitSpecs[id],elapsed:0,last:performance.now(),generation:waitGeneration};
    setWaitProgress(waitJob);
    if($('flow-next'))$('flow-next').textContent='提前演示此等待结果（评审）';
    const generation=waitJob.generation;
    waitTimer=setInterval(()=>{
      const job=waitJob;if(!job||job.generation!==generation||current!==id)return;
      const now=performance.now(),delta=now-job.last;job.last=now;
      if(!autoAdvance||document.hidden||root.classList.contains('hidden'))return;
      job.elapsed+=Math.min(delta,1000);setWaitProgress(job);
      if(job.elapsed>=job.spec.duration+450)finishWait(id,generation);
    },100);
  }
  function setAutoAdvance(enabled){
    autoAdvance=Boolean(enabled);if(waitJob)waitJob.last=performance.now();updateAutoReview();
  }
  $('flow-auto-enabled').addEventListener('change',event=>setAutoAdvance(event.target.checked));
  $('flow-sync-result').addEventListener('change',event=>{mockSyncOutcome=event.target.value;updateAutoReview();});
  document.addEventListener('visibilitychange',()=>{if(waitJob)waitJob.last=performance.now();updateAutoReview();});


  function captureInputs() {
    if ($('touch-opacity') && touchDraft) touchDraft.opacity=$('touch-opacity').value;
    if ($('touch-size') && touchDraft) touchDraft.size=$('touch-size').value;
    if ($('touch-safe-frame') && touchDraft) touchDraft.safe=$('touch-safe-frame').checked;
    if ($('feedback-text')) feedbackDraft = $('feedback-text').value;
    if ($('feedback-type')) feedbackType = $('feedback-type').value;
    if ($('stream-preset')) streamPreset = $('stream-preset').value;
    if ($('stream-volume')) streamVolume = $('stream-volume').value;
    scene.querySelectorAll('[data-key]').forEach(input => keyMap[input.dataset.key] = input.value);
  }
  function render(id,explicitPreset=false) {
    if (id==='recoverGame') id=lastGameStage;
    if (id==='exit') { exit(); return; }
    if (!data[id] || !scenes[id]) return;
    stopWait();
    captureInputs();
    if (overlayStates.includes(id) && !overlayStates.includes(current)) overlayOrigin=originFor(current);
    if (id==='touchEditor'&&current!=='touchEditor') touchDraft={layout:touchLayout,opacity:touchOpacity,size:touchSize,safe:safeFrame};
    if (id.startsWith('touch')&&id!=='touchEditor'&&(explicitPreset||(!overlayStates.includes(current)&&!['reconnect','timeWarning'].includes(current)&&current!==id))) {selectedScheme='触屏虚拟手柄';controlsVisible=true;touchLayout={touchTitle:'full',touchDialogue:'dialogue',touchBattle:'battle',touchCinema:'cinema'}[id];safeFrame=['touchDialogue','touchBattle'].includes(id);}
    current = id;
    if (gameStates.includes(id)) { lastGameStage=id;gameRunning=true; sessionActive=true; }
    if (['reconnect','timeWarning'].includes(id)) gameRunning=true;
    if (steamStates.includes(id)) gameRunning=false;
    if (overlayStates.includes(id)) gameRunning=isGameOrigin();
    if (['steamReturn','sync','syncFailure','complete','sessionLost','gameCrash'].includes(id)) gameRunning=false;
    if (['complete','resume','sessionLost'].includes(id)) sessionActive=false;
    else if (!['prepare','queue'].includes(id)) sessionActive=true;
    const info = {...data[id]}, index=order.indexOf(id), phase=phaseOf[id];
    if (overlayStates.includes(id) && !isGameOrigin()) {
      if (id==='menu') {
        info.title='在 Steam 中打开云端菜单';
        info.description='侧边抽屉提供操作、云画面、反馈及结束会话入口。收起菜单回到原来的 Steam 页面。';
        info.note='当前未运行游戏。打开或应用云端设置不会启动游戏；会话仍保持连接。';
        info.button='查看结束云会话';
      }
      if (id==='settings') { info.button='应用并返回 Steam'; info.description='调整当前云会话的画面传输与声音，应用后回到原来的 Steam 页面。'; }
      if (id==='mapping') { info.button='保存方案并返回 Steam'; info.description='修改通用输入方案，保存后回到原来的 Steam 页面，不发起游戏启动。'; }
      if (id==='feedback') { info.description='在当前 Steam 会话内填写反馈；收起后保留草稿并返回原来的页面。'; info.note='反馈不关闭会话或启动游戏；此原型不向外部提交内容。'; }
      if (id==='feedbackSent') { info.button='回到 Steam'; info.description='反馈结果展示后，立即回到反馈前的 Steam 页面，无需重新排队。'; }
    }
    scene.innerHTML = scenes[id]();
    scene.dataset.stage = id;
    $('flow-count').textContent = index < 0 ? '分支场景' : String(index+1).padStart(2,'0')+' / '+order.length;
    $('flow-eyebrow').textContent = phases[phase]+' · '+(index<0?'分支原型':'核心主路径');
    $('flow-title').textContent = info.title;
    $('flow-description').textContent = info.description;
    $('flow-callout').textContent = info.note;
    $('flow-next').textContent = info.button;
    $('flow-prev').textContent = index===0?'返回入口（演示）':index<0?'返回关联展示节点':'上一个展示节点';
    $('flow-foot-label').textContent = info.foot;
    $('flow-mini-steps').innerHTML = phases.map((name,i) => '<span title="'+name+'" class="'+(i<phase?'passed':i===phase?'current':'')+'"></span>').join('');
    const jump=$('flow-jump'); if(jump) jump.value=id;
    const status=document.querySelector('.flow-connection');
    if(status) status.innerHTML = '<i class="'+(['reconnect','sessionLost','syncFailure'].includes(id)?'issue':'')+'"></i>'+ (['prepare','queue'].includes(id)?'正在申请云资源':id==='reconnect'?'连接中断 · 等待恢复':['complete','resume','sessionLost'].includes(id)?'云会话已结束':'云会话保持连接');
    history.replaceState(null,'','#flow-'+id);
    beginWait(id);
  }
  function open(id='prepare') {
    app.classList.add('hidden'); root.classList.remove('hidden');
    document.body.classList.add('flow-active'); $('overlay').classList.add('hidden');
    window.scrollTo(0,0); render(id,true);
  }
  function exit() {
    stopWait();updateAutoReview();
    setImmersive(false);
    captureInputs(); root.classList.add('hidden'); app.classList.remove('hidden');
    document.body.classList.remove('flow-active');
    $('catalog').classList.add('hidden'); $('detail').classList.remove('hidden');
    history.replaceState(null,'','#steam-detail'); window.scrollTo(0,0);
  }
  function commitTouch(){captureInputs();if(touchDraft){touchLayout=touchDraft.layout;touchOpacity=touchDraft.opacity;touchSize=touchDraft.size;safeFrame=touchDraft.safe;}selectedScheme='触屏虚拟手柄';controlsVisible=true;}
  function next() {
    if(waitJob){finishWait(current,waitJob.generation);return;}
    if(current==='touchEditor')commitTouch();
    if(current==='save') savedByUser=true;
    render(current==='reconnect'?lastGameStage:current==='menu'&&!isGameOrigin()?'sync':['settings','mapping','feedbackSent','touchEditor'].includes(current)?overlayOrigin:data[current].next);
  }
  function previous() {
    const index=order.indexOf(current);
    if(index===0) exit();
    else if(index>0) render(order[index-1]);
    else render({queue:'prepare',verify:'login',library:'home',settings:'menu',mapping:'menu',feedback:'menu',feedbackSent:'feedback',reconnect:'play',sessionLost:'reconnect',timeWarning:'play',gameCrash:'play',syncFailure:'sync'}[current] || 'play');
  }
  $('flow-next').addEventListener('click',next); $('flow-prev').addEventListener('click',previous);
  $('flow-exit').addEventListener('click',exit);
  const jump=$('flow-jump');
  if(jump) {
    jump.innerHTML = '<optgroup label="核心主路径">'+order.map((id,i)=>'<option value="'+id+'">'+String(i+1).padStart(2,'0')+' · '+data[id].title+'</option>').join('')+'</optgroup><optgroup label="设置与异常分支">'+Object.keys(data).filter(id=>!order.includes(id)).map(id=>'<option value="'+id+'">'+data[id].title+'</option>').join('')+'</optgroup>';
    jump.addEventListener('change',()=>render(jump.value,true));
  }
  const scenario=$('flow-scenario');
  if(scenario) scenario.addEventListener('change',()=>{if(scenario.value) render(scenario.value,true); scenario.value='';});
  scene.addEventListener('input',event=>{if(event.target.id==='touch-opacity')$('opacity-value').textContent=event.target.value+'%';if(event.target.id==='touch-size')$('size-value').textContent=event.target.value+'%';});
  scene.addEventListener('click',event=>{
    const pad=event.target.closest('[data-pad]'); if(pad){if(current==='title'&&pad.dataset.pad==='A'){render('opening');return;}pad.classList.add('pressed');setTimeout(()=>pad.classList.remove('pressed'),180);return;}
    const layout=event.target.closest('[data-layout]'); if(layout){if(touchDraft)touchDraft.layout=layout.dataset.layout;scene.querySelectorAll('[data-layout]').forEach(b=>b.classList.toggle('selected',b===layout));return;}
    const scheme=event.target.closest('[data-scheme]');
    if(scheme) {
      selectedScheme=scheme.dataset.scheme;
      scene.querySelectorAll('[data-scheme]').forEach(b=>{b.classList.toggle('selected',b===scheme);b.querySelector('i').textContent=b===scheme?'✓':'';});
      return;
    }
    const action=event.target.closest('[data-action]');
    if(action) {
      if(action.dataset.action==='toggleToolbar') {toolbarExpanded=!toolbarExpanded;scene.querySelector('.cloud-tools').classList.toggle('expanded',toolbarExpanded);action.setAttribute('aria-label',toolbarExpanded?'收起云端工具栏':'展开云端工具栏');}
      if(action.dataset.action==='togglePad') {controlsVisible=!controlsVisible;render(current);}
      if(action.dataset.action==='immersive') setImmersive(!immersive);
      if(action.dataset.action==='applyTouch') {commitTouch();toast='触屏布局已应用';render(overlayOrigin);}
      if(action.dataset.action==='menu') render('menu');
      if(action.dataset.action==='returnGame') render(overlayOrigin);
      if(action.dataset.action==='applySettings') {captureInputs();toast='云画面设置已应用 · '+streamPreset;render(overlayOrigin);}
      if(action.dataset.action==='applyMapping') {captureInputs();toast='操作方案已更新 · '+selectedScheme;render(overlayOrigin);}
      if(action.dataset.action==='resetMapping') {keyMap={confirm:'Enter',back:'Esc',menu:'Tab',action:'Space'}; scene.querySelectorAll('[data-key]').forEach(input=>input.value=keyMap[input.dataset.key]);}
      if(action.dataset.action==='saved') {savedByUser=true;render('gameExit');}
      return;
    }
    const go=event.target.closest('[data-go]');
    if(go) {
      if(go.textContent==='恢复默认') {keyMap={confirm:'Enter',back:'Esc',menu:'Tab',action:'Space'};}
      render(go.dataset.go);
    }
  });
  scene.addEventListener('keydown',event=>{if(event.key==='Enter' && event.target.id==='steam-game-query') render('detail');});
  document.addEventListener('keydown',event=>{
    if(root.classList.contains('hidden') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if(event.key==='Escape'&&immersive){event.preventDefault();setImmersive(false);return;}
    if(current==='title'&&['Enter',' '].includes(event.key)){event.preventDefault();render('opening');return;}
    if(event.ctrlKey && event.shiftKey && event.key.toLowerCase()==='m') {
      event.preventDefault();
      if(current==='menu') render(overlayOrigin);
      else if([...gameStates,'home','ready','steamReturn'].includes(current)) {render('menu');}
    }
  });
  function setImmersive(enabled){immersive=enabled;root.classList.toggle('immersive',enabled);document.body.classList.toggle('flow-immersive',enabled);$('flow-immersive').textContent=enabled?'返回评审视图':'沉浸预览';$('flow-immersive-exit').hidden=!enabled;}
  $('flow-immersive').addEventListener('click',()=>setImmersive(!immersive));
  $('flow-immersive-exit').addEventListener('click',()=>setImmersive(false));
  window.StartSteamFlow={open,exit,setImmersive,setAutoAdvance,getState:()=>({autoAdvance,mockSyncOutcome,wait:waitJob?{stage:waitJob.id,elapsed:Math.round(waitJob.elapsed),duration:waitJob.spec.duration,progress:Math.min(100,Math.floor(waitJob.elapsed/waitJob.spec.duration*100))}:null,lastGameStage,touchLayout,touchOpacity,touchSize,controlsVisible,safeFrame,immersive,current,overlayOrigin,selectedScheme,feedbackDraft,streamPreset,savedByUser,gameRunning,sessionActive,keyMap:{...keyMap}})};
  const initial=location.hash.replace('#flow-','');
  if(location.hash.startsWith('#flow-') && data[initial]) open(initial);
})();

