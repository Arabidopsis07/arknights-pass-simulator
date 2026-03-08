document.addEventListener('DOMContentLoaded', () => {
    // 获取页面元素
    const budgetPage = document.getElementById('budget-page');
    const shopPage = document.getElementById('shop-page');
    const budgetInput = document.getElementById('budget-input');
    const enterShopBtn = document.getElementById('enter-shop');
    const budgetSpan = document.getElementById('budget-amount');
    const drawnContainer = document.getElementById('drawn-container');
    const clearBackpackBtn = document.getElementById('clear-backpack-btn');

    // 视图容器
    const boxSelectView = document.getElementById('box-select-view');
    const boxDetailView = document.getElementById('box-detail-view');
    const boxGrid = document.getElementById('box-grid');
    const itemGrid = document.getElementById('item-grid');
    const backBtn = document.getElementById('back-to-boxes');
    const detailBoxName = document.getElementById('detail-box-name');
    const drawBtn = document.getElementById('draw-btn');
    const newBoxBtn = document.getElementById('new-box-btn');
    const budgetWarning = document.getElementById('budget-warning');

    // 全局变量
    let globalBackpack = loadBackpack() || [];
    let totalBudget = 0;
    let remainingBudget = 0;
    let currentBoxId = BOXES[0]?.id;
    let currentBox = BOXES.find(b => b.id === currentBoxId);
    let drawnItems = [];   // 当前盒已抽列表

    // 初始化预算页面进入商店
    enterShopBtn.addEventListener('click', () => {
        const budget = parseFloat(budgetInput.value);
        if (isNaN(budget) || budget < 0) {
            alert('请输入有效的预算😡');
            return;
        }
        totalBudget = budget;
        remainingBudget = budget;

        budgetPage.style.display = 'none';
        shopPage.style.display = 'flex';

        updateBudgetDisplay();
        // 初始化视图
        renderBoxGrid();
        // 默认显示选盒视图
        showBoxSelectView();
    });

    // 视图切换函数
    function showBoxSelectView() {
        boxSelectView.style.display = 'block';
        boxDetailView.style.display = 'none';
    }
    function showBoxDetailView() {
        boxSelectView.style.display = 'none';
        boxDetailView.style.display = 'block';
    }

    // 渲染所有盒子（选盒界面）
    function renderBoxGrid() {
        boxGrid.innerHTML = '';  // 清空
        BOXES.forEach(box => {
            const tile = document.createElement('div');
            tile.className = 'box-tile';
            tile.style.backgroundColor = box.themeColor || '#00bfff';
            tile.textContent = box.name;  // 左上角显示盒名
            tile.dataset.boxId = box.id;
            tile.addEventListener('click', () => {
                // 切换到该盒子的抽盒视图
                switchToBox(box.id);
            });
            boxGrid.appendChild(tile);
        });
    }

    // 切换到指定盒子的抽盒视图
    function switchToBox(boxId) {
        currentBoxId = boxId;
        currentBox = BOXES.find(b => b.id === boxId);
        drawnItems = loadDrawn(boxId) || [];  // 加载该盒已抽记录
        detailBoxName.textContent = currentBox.name;
        renderItemGrid();
        showBoxDetailView();
    }

    // 渲染当前盒子的14个小盒子（抽盒界面）
    function renderItemGrid() {
        itemGrid.innerHTML = '';
        if (!currentBox) return;

        // 生成盒子（根据items数量）
        for (let i = 0; i < currentBox.items.length; i++) {
            const itemName = currentBox.items[i];
            const tile = document.createElement('div');
            tile.className = 'item-tile';
            // 根据是否已抽设置样式
            if (drawnItems.includes(itemName)) {
                tile.classList.add('drawn');
            } else {
                tile.style.backgroundColor = currentBox.themeColor || '#00bfff';
            }
            tile.dataset.item = itemName;
            tile.dataset.index = i;
            tile.addEventListener('click', (e) => {
                // 只有未抽的盒子才触发抽卡
                if (!tile.classList.contains('drawn')) {
                    drawOne();
                }
            });
            itemGrid.appendChild(tile);
        }
    }

    //抽卡逻辑（随机不放回）
    function drawOne() {
        // 预算扣减
        remainingBudget -= 25;
        updateBudgetDisplay();

        // 检查预算并显示警告
        if (remainingBudget < 0) {
            budgetWarning.textContent = '先吃饭后吃谷！';
        } else {
            budgetWarning.textContent = '';
        }

        // 找出当前盒子中未抽的物品
        const available = currentBox.items.filter(item => !drawnItems.includes(item));
        if (available.length === 0) {
            alert('这盒已经集齐啦！');
            return;
        }
        // 随机选择一个
        const randomIndex = Math.floor(Math.random() * available.length);
        const drawnItem = available[randomIndex];

        // 将该物品加入已抽列表和全局背包
        drawnItems.push(drawnItem);
        globalBackpack.push(drawnItem);

        // 保存
        saveDrawn(currentBoxId, drawnItems);
        saveBackpack(globalBackpack);

        // 更新UI：重新渲染小盒子（更新空心状态）和背包
        renderItemGrid();
        renderBackpack();

        // 显示抽卡弹窗
        showToast(`你抽到了：${drawnItem}`);
    }

    // 渲染背包（基于全局背包）
    function renderBackpack() {
        if (globalBackpack.length === 0) {
            drawnContainer.innerHTML = '<p>什么也没有</p>';
            return;
        }
        const cardsHTML = globalBackpack.map(item =>
            `<div class="pass-card">${item}</div>`
        ).join('');
        drawnContainer.innerHTML = cardsHTML;
    }

    // 清空背包事件
    clearBackpackBtn.addEventListener('click', () => {
        if (confirm('确定要放生所有已抽通行证吗？此操作不可撤销😨')) {
            globalBackpack = []; 
            saveBackpack(globalBackpack);
            renderBackpack();
        }
    });

    // 更新预算显示和警告
    function updateBudgetDisplay() {
        budgetSpan.textContent = remainingBudget;
        if (remainingBudget < 0) {
            budgetSpan.classList.add('budget-negative');
        } else {
            budgetSpan.classList.remove('budget-negative');
        }
    }

    // 开新盒按钮：重置当前盒的已抽记录，但不影响全局背包
    function resetCurrentBox() {
        if (confirm('还要继续读博吗🥺')) {
            drawnItems = [];
            clearDrawn(currentBoxId);
            renderItemGrid();  // 重新渲染小盒子（全部变实心）
        }
    }

    // 返回按钮：回到选盒视图
    backBtn.addEventListener('click', () => {
        showBoxSelectView();
    });

    drawBtn.style.display = 'none';

    // 新盒按钮绑定事件
    newBoxBtn.addEventListener('click', resetCurrentBox);

    // 初始化时渲染背包
    renderBackpack();

    // 辅助函数：保存/加载背包
    function saveBackpack(backpack) {
        localStorage.setItem('globalBackpack', JSON.stringify(backpack));
    }
    function loadBackpack() {
        const saved = localStorage.getItem('globalBackpack');
        return saved ? JSON.parse(saved) : [];
    }

    // 弹窗显示
    function showToast(message) {
        // 如果页面上还没有toast元素，先创建
        let toast = document.getElementById('draw-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'draw-toast';
            toast.style.position = 'fixed';
            toast.style.top = '50%';
            toast.style.left = '50%';
            toast.style.transform = 'translate(-50%, -50%)';
            toast.style.backgroundColor = '#00bfff';
            toast.style.color = 'white';
            toast.style.padding = '20px 40px';
            toast.style.borderRadius = '8px';
            toast.style.fontSize = '24px';
            toast.style.zIndex = '1000';
            toast.style.boxShadow = '0 0 20px rgba(74,158,255,0.5)';
            toast.style.transition = 'opacity 0.3s';
            toast.style.opacity = '0';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 2000);
    }
});