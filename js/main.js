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
    const budgetSpan = document.getElementById('budget-amount');      // 预算显示

    // 全局背包：存储所有抽到的物品（永久保存）
    let globalBackpack = loadBackpack() || [];   // 从 localStorage 加载
    // 预算相关变量
    let totalBudget = 0;        // 输入的初始预算
    let remainingBudget = 0;    // 剩余预算
    // 状态变量
    let currentBoxId = BOXES[0]?.id;
    let currentBox = BOXES.find(b => b.id === currentBoxId);
    let drawnItems = [];                         // 当前盒已抽列表
    // 加载全局背包
    loadGlobalBackpack();                      // 当前盒子已抽到的物品列表
    
    // 获取预算页面元素
    const budgetPage = document.getElementById('budget-page');
    const shopPage = document.getElementById('shop-page');
    const budgetInput = document.getElementById('budget-input');
    const enterShopBtn = document.getElementById('enter-shop');

    // 进入商店按钮点击事件
    enterShopBtn.addEventListener('click', () => {
        const budget = parseFloat(budgetInput.value);
        if (isNaN(budget) || budget < 0) {
            alert('请输入有效的预算😡');
            return;
        }
        totalBudget = budget;
        remainingBudget = budget;

        // 切换页面
        budgetPage.style.display = 'none';
        shopPage.style.display = 'flex';

        // 更新预算显示
        updateBudgetDisplay();

        // 初始化商店数据
        if (typeof init === 'function') init();
    });

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

    // 切换盒子的函数
    function switchBox(boxId) {
        console.log('切换到盒子 ID:', boxId);
        console.log('找到的盒子:', BOXES.find(b => b.id === boxId));
        currentBoxId = boxId;
        currentBox = BOXES.find(b => b.id === boxId);
        // 加载该盒子的已抽记录
        drawnItems = loadDrawn(boxId);
        // 更新界面
        updateUI();
    }

    function updateBudgetDisplay() {
        budgetSpan.textContent = remainingBudget;
        // 负数时添加红色样式
        if (remainingBudget < 0) {
            budgetSpan.classList.add('budget-negative');
        } else {
            budgetSpan.classList.remove('budget-negative');
        }
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

    // 保存/加载背包函数
    function saveBackpack(backpack) {
        localStorage.setItem('globalBackpack', JSON.stringify(backpack));
    }
    function loadBackpack() {
        const saved = localStorage.getItem('globalBackpack');
        return saved ? JSON.parse(saved) : [];
    }

    // 渲染已抽物品到背包
    function renderDrawnItems() {
        if (globalBackpack.length === 0) {
            drawnContainer.innerHTML = '<p>暂无通行证</p>';
            return;
        }
        const cardsHTML = globalBackpack.map(item =>
            `<div class="pass-card">${item}</div>`
        ).join('');
        drawnContainer.innerHTML = cardsHTML;
    }

    // 抽卡逻辑（不放回）
    function drawOne() {
        // 预算扣减（可为负）
        remainingBudget -= 25;
        updateBudgetDisplay();

        // 如果预算为负，给出提示（不影响抽卡）
        if (remainingBudget < 0) {
            alert('先吃饭后吃谷！');
        }
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
        // 加入全局背包
        globalBackpack.push(drawnItem);
        saveGlobalBackpack();
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