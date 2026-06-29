from docx import Document
from docx.shared import Pt, Inches, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()

# 设置默认字体
style = doc.styles['Normal']
font = style.font
font.name = '微软雅黑'
font.size = Pt(11)

# === 封面 ===
for _ in range(4):
    doc.add_paragraph()

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run('基于Vibe Coding的\n每日习惯打卡App开发实践')
run.font.size = Pt(22)
run.font.bold = True
run.font.color.rgb = RGBColor(0x4E, 0xC4, 0xDC)

doc.add_paragraph()

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = subtitle.add_run('—— HabitCheck v1.0.0 开发报告')
run.font.size = Pt(14)
run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

for _ in range(4):
    doc.add_paragraph()

info = doc.add_paragraph()
info.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = info.add_run('创新实践 课程报告')
run.font.size = Pt(14)
run.font.bold = True

doc.add_paragraph()

name = doc.add_paragraph()
name.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = name.add_run('姓    名：黄忠胜')
run.font.size = Pt(12)

sid = doc.add_paragraph()
sid.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = sid.add_run('学    号：23051237')
run.font.size = Pt(12)

date_p = doc.add_paragraph()
date_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = date_p.add_run('日    期：2026年6月21日')
run.font.size = Pt(12)

doc.add_page_break()

# === 正文 ===
def h1(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x4E, 0xC4, 0xDC)
    p.space_after = Pt(6)

def h2(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size = Pt(13)
    run.font.bold = True
    p.space_before = Pt(8)
    p.space_after = Pt(4)

def body(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size = Pt(11)
    p.space_after = Pt(6)
    p.first_line_indent = Cm(0.75)

# === 一、缘起 ===
h1('一、缘起')

body('这个项目的想法其实挺偶然的。今年考研备考之余，我偶尔会刷到一些关于面试和找工作的信息。有段时间经常听同学说，现在面试官特别喜欢问"你会不会Vibe Coding？"这个问题。说实话第一次听到这个词的时候我完全不知道是什么，但问的人多了，我就好奇去搜了一下。')

body('在B站上看到了一个视频（链接：https://www.bilibili.com/video/BV1BvR1BtEFD/），讲的是一个非程序员用AI工具从零写了一个App的完整过程。视频里那个人甚至连代码都看不太懂，就是不断地跟AI对话、描述需求，然后AI就帮他写出了完整的应用。当时看完挺震撼的——原来现在AI已经能做到这种程度了。')

body('同时我最近在准备考研，每天都有固定的学习任务需要完成。有时候学着学着就忘了自己今天学了什么、学了多久，也缺少一个清晰的计划。我就在想，能不能做一个App，每天提醒自己要做什么、做了没有，就像打卡一样。')

body('这两个事情碰撞在一起，就产生了这个想法：为什么不自己用AI试着做一个每日习惯打卡App呢？既是对Vibe Coding的一次实践，也能做出一个自己真正用得上的东西。')

# === 二、什么是 Vibe Coding ===
h1('二、什么是 Vibe Coding')

body('"Vibe Coding"这个概念最早是OpenAI的CEO Sam Altman在一次访谈中提到的，后来被 Andrej Karpathy 推广开来。简单来说，Vibe Coding 就是"跟着感觉编程"——你不需要会写代码，你只需要把你的想法用自然语言描述给AI，AI就会帮你把代码写出来。')

body('传统的软件开发流程是：需求分析 → 设计 → 编码 → 测试 → 部署。每一步都需要有专业技能的人来完成。而Vibe Coding把中间的"编码"这一步完全交给了AI，开发者更多地扮演"产品经理"和"测试员"的角色——你想做什么，告诉AI，AI写出来，你验收，不满意让AI改。')

body('当然，Vibe Coding并不是万能的。对于复杂的业务逻辑、高性能要求的系统，传统开发方式仍然不可替代。但对于个人项目、原型验证、工具类App这种场景，Vibe Coding能极大地降低开发门槛，让有想法但不会编程的人也能做出自己的产品。')

body('我的这次实践，就是典型的Vibe Coding——我描述需求、提修改意见，AI（GitHub Copilot）负责写代码、修Bug，最后我们合作完成了这个App。')

# === 三、确定要做个什么 App ===
h1('三、确定要做个什么 App')

body('有了用AI做App的想法之后，我开始想具体做什么。结合我考研备考的需求，以及之前用过一些打卡类App的体验，我决定做一个"每日习惯打卡"工具。')

body('核心功能是：每天列出需要完成的任务，完成了就点一下打卡，能看到自己的连续打卡天数（streak），还有统计和日历视图。')

body('具体的功能清单：')
features = [
    '今日任务列表：每天早上自动展示今天需要打卡的任务，打卡后有动画反馈',
    '添加/编辑任务：支持自定义任务名、选Emoji、选颜色、设置重复规则（每日/工作日/自定义星期），还能设提醒时间',
    '日历视图：在日历上能看到哪天打了卡、哪天没打，点日期可以看详情',
    '统计页面：显示连续打卡天数、最长连续记录、周完成率',
    '本地通知：到设定的时间弹出通知提醒打卡',
    '归档/删除：不想要的任务可以归档（保留数据）或彻底删除',
]
for f in features:
    p = doc.add_paragraph()
    run = p.add_run(f'• {f}')
    run.font.size = Pt(11)
    p.space_after = Pt(3)

# === 四、技术选型 ===
h1('四、技术选型')

body('确定功能之后就是选技术方案。因为是移动App，我对比了几个方案：')

tech_options = [
    ('Flutter', 'Google的跨平台框架，用Dart语言，学习成本有点高'),
    ('原生Android（Kotlin）', '功能最全，但要写两份代码（如果需要iOS），而且我对Kotlin不熟'),
    ('React Native + Expo', '用JavaScript/TypeScript开发，一套代码跑Android和iOS，Expo提供了很多开箱即用的功能'),
]
for name, desc in tech_options:
    p = doc.add_paragraph()
    run = p.add_run(f'• {name}：{desc}')
    run.font.size = Pt(11)
    p.space_after = Pt(3)

body('最后选了React Native + Expo这套方案。原因很简单：TypeScript我比较熟悉，Expo帮我处理了很多原生配置的麻烦事（比如打包、权限申请、通知配置等），而且社区生态很活跃，遇到问题基本都能搜到答案。')

# === 五、开发过程 ===
h1('五、开发过程')

h2('阶段1：项目初始化')
body('用Expo CLI创建了项目骨架，安装了需要的依赖包。这一步花了一些时间，因为npm在国内的网络不太稳定，后来换了镜像源才搞定。整个项目用了大概576个npm包。')

h2('阶段2：数据层')
body('首先写了数据存储的部分。本来想用AsyncStorage，但发现Expo SDK 56里AsyncStorage不兼容，临时换成了expo-file-system，把数据以JSON文件的形式存储在手机本地。UUID生成也遇到了问题，后来改用expo-crypto来解决。')

h2('阶段3：UI和导航')
body('搭了底部Tab导航（今日、日历、统计、设置四个Tab），写了主题常量（颜色、字体、间距等），保证了整个App的视觉一致性。')

h2('阶段4：核心功能——今日打卡')
body('这是最核心的部分。实现了环形进度条（显示今日完成率）、任务卡片（打卡按钮带弹簧动画+震动反馈）、添加/编辑任务的底部弹窗（带Emoji选择器、颜色选择器、重复规则选择、时间选择器）。')

h2('阶段5：日历和统计')
body('集成了react-native-calendars做日历视图，可以显示打卡记录。统计页面计算了streak（连续打卡天数）、最长streak、周完成率等指标，还有根据不同完成率显示的鼓励文案。')

h2('阶段6：通知系统')
body('用expo-notifications实现了本地通知功能。在Expo Go中测试时遇到兼容性问题，做了环境检测，Expo Go中静默跳过，独立APK中正常使用。通知的调度、取消、更新逻辑都封装在一个工具模块里。')

h2('阶段7：打磨和修Bug')
body('基本功能做完之后花了不少时间修Bug。最头疼的是Android上的时间选择器——选完时间点确定之后会重复弹出，跟AI反复调试了很多轮才解决。最后发现是Android原生对话框的生命周期问题，用了"key值控制渲染"的技巧才彻底修好。')

# === 六、踩坑 ===
h1('六、遇到的那些坑')

bugs = [
    ('npm网络超时', 'npm install经常失败，换成 npmmirror.com 镜像才解决'),
    ('AsyncStorage不兼容', 'Expo SDK 56不支持AsyncStorage，换成了expo-file-system'),
    ('UUID生成失败', 'uuid库在Expo中无法使用，改用expo-crypto.randomUUID()'),
    ('Reanimated动画不工作', '需要配置Babel插件，并且锁定版本为4.3.1'),
    ('Expo Go中通知不能用', '做了环境检测，Expo Go中静默跳过'),
    ('Android时间选择器重复弹出', '最棘手的Bug，原因是onValueChange触发重渲染导致原生对话框重新弹出，用key强制卸载+ref存值的方式解决'),
    ('通知不弹出', 'Android 8.0+需要创建通知频道，补上setNotificationChannelAsync就好了'),
    ('ADB连接不上', '电脑上ADB不在PATH里，每次要用完整路径 D:\\leidian\\LDPlayer9\\adb.exe'),
]
for bug, solution in bugs:
    p = doc.add_paragraph()
    run = p.add_run(f'• {bug}')
    run.font.bold = True
    run.font.size = Pt(11)
    p2 = doc.add_paragraph()
    run2 = p2.add_run(f'  解决：{solution}')
    run2.font.size = Pt(10)
    run2.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
    p2.space_after = Pt(4)

# === 七、当前成果 ===
h1('七、当前成果')

body('经过大约两天的集中开发（当然中间也休息了），HabitCheck v1.0.0 已经完成。以下是目前做到的：')

p = doc.add_paragraph()
run = p.add_run('已完成的功能：')
run.font.bold = True
run.font.size = Pt(11)

done = [
    '今日任务列表 + 环形进度显示 + 打卡弹簧动画 + 震动反馈',
    '添加/编辑任务弹窗（Emoji选择、颜色选择、重复规则、提醒时间）',
    '日历月视图 + 打卡记录标记 + 点击日期查看详情',
    '统计页面 + Streak计算 + 鼓励文案',
    '本地通知（提醒打卡）',
    '长按任务归档/删除 + 设置页恢复',
    'TypeScript strict模式零错误',
    'EAS云端构建APK，已测试通过',
]
for d in done:
    p = doc.add_paragraph()
    run = p.add_run(f'  ✅ {d}')
    run.font.size = Pt(11)
    p.space_after = Pt(2)

body('项目已经完全上传到了GitHub：github.com/idddfc/HabitCheck')

# === 八、总结 ===
h1('八、总结与展望')

body('这次实践让我亲身体验了Vibe Coding的能力和局限。说实在的，AI现在的编程能力确实超出了我的预期——你描述一个功能，它很快就能给出可运行的代码。遇到Bug，你把错误信息贴给它，它也能分析原因并给出修复方案。整个开发过程中，我更多是在"做决策"和"验收"，而不是"写代码"。')

body('但同时我也发现，AI并不是万能的。对于复杂的交互逻辑、原生平台的兼容性问题（比如Android的时间选择器），AI可能需要在你的引导下多次尝试才能找到正确的解决方案。这也意味着，完全不懂编程的人要做好一个App仍然有难度——你至少需要有足够的"编程直觉"来判断AI给出的方案是否靠谱。')

body('关于这个App未来的方向，我有一些想法：')

future = [
    '数据云同步：目前数据只存在手机本地，如果能支持多设备同步会更好',
    '小组件（Widget）：在手机桌面直接显示今日任务和进度',
    '更多的统计维度：月度报告、年度热力图等',
    '自定义主题：让用户自由搭配颜色',
    '专注计时：结合番茄工作法，把习惯打卡和时间管理结合起来',
]
for f_item in future:
    p = doc.add_paragraph()
    run = p.add_run(f'• {f_item}')
    run.font.size = Pt(11)

body('总的来说，这次用Vibe Coding的方式开发HabitCheck是一次很有意思的体验。从一个模糊的想法开始，到做出一个能真正在手机上运行的App，整个过程让我对AI辅助编程有了更具体的认识。以后有新功能还继续更新这个App。')

# 保存
doc.save('创新实践 黄忠胜.docx')
print('报告已生成！')
