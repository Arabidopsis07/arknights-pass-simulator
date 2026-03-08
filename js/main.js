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
    let drawnItems = [];   // 当前盒已抽物品索引
    let clickedTiles = [];    // 已点方块索引

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
        drawnItems = loadItemDrawn(boxId) || [];      // 已抽物品索引
        clickedTiles = loadTileDrawn(boxId) || [];    // 已点盒子索引
        detailBoxName.textContent = currentBox.name;
        detailBoxName.style.color = currentBox.themeColor || '#00bfff';
        renderItemGrid();
        showBoxDetailView();
    }

    // 渲染当前盒子的14个小盒子（抽盒界面）
    function renderItemGrid() {
        itemGrid.innerHTML = '';
        if (!currentBox) return;

        for (let i = 0; i < currentBox.items.length; i++) {
            const tile = document.createElement('div');
            tile.className = 'item-tile';
            tile.dataset.index = i;  // 记录盒子索引

            // 根据是否已抽设置样式
            if (drawnItems.includes(i)) {
                tile.classList.add('drawn');
                tile.style.borderColor = currentBox.themeColor || '#00bfff';
            } else {
                tile.style.backgroundColor = currentBox.themeColor || '#00bfff';
            }

            tile.addEventListener('click', (e) => {
                if (!clickedTiles.includes(i)) {
                    drawOne(tile);  // 传入被点击的盒子
                }
            });
            itemGrid.appendChild(tile);
        }
    }

    //抽卡逻辑（随机不放回）
    function drawOne(clickedTile) {
        // 预算扣减
        remainingBudget -= 25;
        updateBudgetDisplay();

        if (remainingBudget < 0) {
            budgetWarning.textContent = '先吃饭后吃谷！';
        } else {
            budgetWarning.textContent = '';
        }

        const clickedIndex = parseInt(clickedTile.dataset.index);

        // 找出当前盒子中未抽的物品（按索引）
        const availableIndices = [];
        for (let i = 0; i < currentBox.items.length; i++) {
            if (!drawnItems.includes(i)) {
                availableIndices.push(i);
            }
        }
        if (availableIndices.length === 0) {
            alert('这盒已经抽完啦！');
            return;
        }

        // 随机选择一个索引
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        const drawnItem = currentBox.items[randomIndex];

        // 标记已抽物品
        if (!drawnItems.includes(randomIndex)) {
            drawnItems.push(randomIndex);
        }
        // 标记已点方块
        if (!clickedTiles.includes(clickedIndex)) {
            clickedTiles.push(clickedIndex);
        }

        // 保存两个状态
        saveItemDrawn(currentBoxId, drawnItems);
        saveTileDrawn(currentBoxId, clickedTiles);

        // 更新全局背包
        globalBackpack.push(drawnItem);
        saveBackpack(globalBackpack);

        // 更新UI
        clickedTile.classList.add('drawn');
        clickedTile.style.backgroundColor = '';
        clickedTile.style.borderColor = currentBox.themeColor || '#00bfff';

        // 重新渲染背包
        renderBackpack();

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
            clickedTiles = [];
            clearDrawn(currentBoxId);
            localStorage.removeItem(`tileDrawn_${currentBoxId}`);
            localStorage.removeItem(`itemDrawn_${currentBoxId}`);
            renderItemGrid();  // 重新渲染盒子（全部变实心）
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