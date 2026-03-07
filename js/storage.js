// js/storage.js
// 保存已抽列表到 localStorage
function saveDrawn(boxId, drawnArray) {
    localStorage.setItem(`drawn_${boxId}`, JSON.stringify(drawnArray));
}

// 从 localStorage 加载已抽列表，如果没有则返回空数组
function loadDrawn(boxId) {
    const saved = localStorage.getItem(`drawn_${boxId}`);
    return saved ? JSON.parse(saved) : [];
}

// 清除指定盒子的已抽记录（用于新开一盒）
function clearDrawn(boxId) {
    localStorage.removeItem(`drawn_${boxId}`);
}