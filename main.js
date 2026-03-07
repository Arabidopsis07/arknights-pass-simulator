// js/main.js
// 等待 DOM 加载完成再执行
document.addEventListener('DOMContentLoaded', () => {
    // 获取页面元素
    const boxSelect = document.getElementById('box-select');          // 下拉框
    const boxNameSpan = document.getElementById('box-name');          // 盒子名称显示
    const remainingSpan = document.getElementById('remaining-count'); // 剩余数量
    const drawBtn = document.getElementById('draw-btn');              // 抽卡按钮
    const newBoxBtn = document.getElementById('new-box-btn');         // 新开一盒按钮
    const drawnContainer = document.getElementById('drawn-container');// 背包容器
    const budgetSpan = document.getElementById('budget-amount');      // 预算显示（暂未使用）

    // 状态变量
    let currentBoxId = 'box49';                  // 当前选中的盒子ID
    let currentBox = BOXES.find(b => b.id === currentBoxId); // 当前盒子对象
    let drawnItems = [];                         // 当前盒子已抽到的物品列表

    // 初始化函数：填充下拉框并设置当前盒子
    function init() {
        // 填充下拉选项
        BOXES.forEach(box => {
            const option = document.createElement('option');
            option.value = box.id;
            option.textContent = box.name;
            boxSelect.appendChild(option);
        });
        // 设置当前盒子
        switchBox(currentBoxId);
    }

    // 切换盒子的函数（后续多盒扩展用）
    function switchBox(boxId) {
        currentBoxId = boxId;
        currentBox = BOXES.find(b => b.id === boxId);
        // 加载该盒子的已抽记录
        drawnItems = loadDrawn(boxId);
        // 更新界面
        updateUI();
    }

    // 更新界面：显示盒子名称、剩余数量、背包列表
    function updateUI() {
        // 更新名称和剩余数量
        boxNameSpan.textContent = currentBox.name;
        const remaining = currentBox.items.length - drawnItems.length;
        remainingSpan.textContent = remaining;

        // 渲染背包
        renderDrawnItems();
    }

    // 渲染已抽物品到背包容器（生成卡片）
    function renderDrawnItems() {
        if (drawnItems.length === 0) {
            drawnContainer.innerHTML = '<p>暂无通行证</p>';
            return;
        }
        // 用 map 生成卡片 HTML
        const cardsHTML = drawnItems.map(item =>
            `<div class="pass-card">${item}</div>`
        ).join('');
        drawnContainer.innerHTML = cardsHTML;
    }

    // 抽卡逻辑（不放回）
    function drawOne() {
        // 计算可抽物品：在总物品中但不在已抽列表中的
        const available = currentBox.items.filter(item => !drawnItems.includes(item));
        if (available.length === 0) {
            alert('这盒已经集齐啦！');
            return null;
        }
        // 随机抽取一个
        const randomIndex = Math.floor(Math.random() * available.length);
        const drawnItem = available[randomIndex];
        // 加入已抽列表
        drawnItems.push(drawnItem);
        // 保存到 localStorage
        saveDrawn(currentBoxId, drawnItems);
        // 更新界面
        updateUI();
        // 弹出提示（后续替换为动画）
        alert(`你抽到了：${drawnItem}`);
        return drawnItem;
    }

    // 重置当前盒子
    function resetCurrentBox() {
        if (confirm('确定要新开一盒吗？当前盒子的已抽记录将清空。')) {
            drawnItems = [];
            // 清除存储
            clearDrawn(currentBoxId);
            // 更新界面
            updateUI();
        }
    }

    // 绑定事件
    drawBtn.addEventListener('click', drawOne);
    newBoxBtn.addEventListener('click', resetCurrentBox);
    boxSelect.addEventListener('change', (e) => {
        switchBox(e.target.value);
    });

    // 启动初始化
    init();
});