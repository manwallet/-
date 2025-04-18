# 英语学习闪卡应用

这是一个简单但功能完整的英语学习闪卡应用，使用HTML、CSS和JavaScript开发，可以直接在浏览器中运行。

## 功能特点

- **添加闪卡**：添加英语单词/短语及其中文翻译
- **批量导入**：通过文本批量导入多个闪卡
- **分类管理**：将闪卡分类整理，便于学习
- **学习模式**：翻转卡片进行记忆练习
- **记忆评分**：根据记忆程度对闪卡进行评分
- **随机排序**：随机打乱闪卡顺序，增加学习效果
- **搜索功能**：快速查找特定闪卡
- **导出功能**：将闪卡导出为文本文件
- **本地存储**：数据保存在浏览器本地，无需联网

## 使用方法

1. 在浏览器中打开`index.html`文件
2. 应用分为三个主要标签页：学习、添加闪卡和管理闪卡

### 添加闪卡

1. 点击"添加闪卡"标签
2. 填写英文（正面）和中文（背面）内容
3. 可选择添加分类和笔记
4. 点击"添加闪卡"按钮保存

### 批量导入

1. 在"添加闪卡"标签页下方找到批量导入区域
2. 按照指定格式（英文和中文用制表符或至少3个空格分隔）输入多个闪卡
3. 可选择添加分类
4. 点击"批量导入"按钮

### 学习闪卡

1. 点击"学习"标签
2. 从下拉菜单选择要学习的分类
3. 点击"开始学习"按钮
4. 使用"翻转"按钮查看卡片背面
5. 根据记忆程度选择评分
6. 使用"上一个"和"下一个"按钮浏览闪卡

### 管理闪卡

1. 点击"管理闪卡"标签
2. 可以查看、编辑和删除已添加的闪卡
3. 使用搜索框查找特定闪卡
4. 点击"导出闪卡"按钮将闪卡导出为文本文件

## 数据存储

所有闪卡数据存储在浏览器的本地存储(localStorage)中，关闭浏览器后数据不会丢失。但请注意，清除浏览器数据可能会导致闪卡数据丢失，建议定期使用导出功能备份数据。

## 示例闪卡

以下是一些示例闪卡，可以复制到批量导入区域：

```
apple    苹果
book    书
cat    猫
dog    狗
elephant    大象
flower    花
garden    花园
house    房子
internet    互联网
journey    旅行
knowledge    知识
language    语言
```

## 技术说明

- 使用HTML5构建界面
- 使用CSS3实现样式和动画
- 使用JavaScript实现交互功能
- 使用localStorage进行数据存储
- 响应式设计，适配不同屏幕尺寸
