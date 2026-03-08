// 保存已抽物品索引
function saveItemDrawn(boxId, items) {
    localStorage.setItem(`itemDrawn_${boxId}`, JSON.stringify(items));
}

//保存已抽盒子索引
function saveTileDrawn(boxId, tiles) {
    localStorage.setItem(`tileDrawn_${boxId}`, JSON.stringify(tiles));
}

// 加载已抽物品
function loadItemDrawn(boxId) {
    const saved = localStorage.getItem(`itemDrawn_${boxId}`);
    return saved ? JSON.parse(saved) : [];
}

//加载已抽盒子
function loadTileDrawn(boxId) {
    const saved = localStorage.getItem(`tileDrawn_${boxId}`);
    return saved ? JSON.parse(saved) : [];
}

// 清除指定盒子的已抽记录（用于新开一盒）
function clearDrawn(boxId) {
    localStorage.removeItem(`drawn_${boxId}`);
}