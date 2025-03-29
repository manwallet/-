// 闪卡数据模型
class FlashcardApp {
    constructor() {
        this.cards = [];
        this.decks = new Set();
        this.currentIndex = 0;
        this.isStudying = false;
        this.currentDeck = 'all';
        this.filteredCards = [];
        
        // 初始化应用
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.updateDeckLists();
        this.updateCardsList();
    }
    
    // 从本地存储加载数据
    loadFromLocalStorage() {
        const savedCards = localStorage.getItem('flashcards');
        if (savedCards) {
            this.cards = JSON.parse(savedCards);
            // 重建分类集合
            this.decks = new Set();
            this.cards.forEach(card => {
                if (card.deck) {
                    this.decks.add(card.deck);
                }
            });
        }
    }
    
    // 保存到本地存储
    saveToLocalStorage() {
        localStorage.setItem('flashcards', JSON.stringify(this.cards));
    }
    
    // 添加新闪卡
    addCard(front, back, deck = '', notes = '') {
        const newCard = {
            id: Date.now().toString(),
            front,
            back,
            deck: deck.trim(),
            notes: notes.trim(),
            dateCreated: new Date().toISOString(),
            lastReviewed: null,
            memoryRating: 0
        };
        
        this.cards.push(newCard);
        
        if (deck) {
            this.decks.add(deck);
            this.updateDeckLists();
        }
        
        this.saveToLocalStorage();
        this.updateCardsList();
        return newCard;
    }
    
    // 批量导入闪卡
    batchImport(text, deck = '') {
        const lines = text.trim().split('\n');
        let importCount = 0;
        
        lines.forEach(line => {
            // 使用制表符或至少3个空格作为分隔符
            const parts = line.split(/\t|\s{3,}/);
            if (parts.length >= 2) {
                const front = parts[0].trim();
                const back = parts[1].trim();
                
                if (front && back) {
                    this.addCard(front, back, deck);
                    importCount++;
                }
            }
        });
        
        return importCount;
    }
    
    // 更新闪卡
    updateCard(id, updates) {
        const index = this.cards.findIndex(card => card.id === id);
        if (index !== -1) {
            // 如果分类发生变化，更新分类列表
            if (updates.deck && updates.deck !== this.cards[index].deck) {
                this.decks.add(updates.deck);
                this.updateDeckLists();
            }
            
            this.cards[index] = { ...this.cards[index], ...updates };
            this.saveToLocalStorage();
            this.updateCardsList();
            return true;
        }
        return false;
    }
    
    // 删除闪卡
    deleteCard(id) {
        const index = this.cards.findIndex(card => card.id === id);
        if (index !== -1) {
            this.cards.splice(index, 1);
            this.saveToLocalStorage();
            this.updateCardsList();
            return true;
        }
        return false;
    }
    
    // 删除所有闪卡
    deleteAllCards() {
        if (this.currentDeck === 'all') {
            this.cards = [];
            this.decks = new Set();
        } else {
            this.cards = this.cards.filter(card => card.deck !== this.currentDeck);
            // 检查是否还有使用该分类的卡片
            const deckStillExists = this.cards.some(card => card.deck === this.currentDeck);
            if (!deckStillExists) {
                this.decks.delete(this.currentDeck);
            }
        }
        
        this.saveToLocalStorage();
        this.updateDeckLists();
        this.updateCardsList();
    }
    
    // 获取特定分类的闪卡
    getCardsByDeck(deck) {
        if (deck === 'all') {
            return [...this.cards];
        }
        return this.cards.filter(card => card.deck === deck);
    }
    
    // 搜索闪卡
    searchCards(query) {
        if (!query) {
            return this.getCardsByDeck(this.currentDeck);
        }
        
        const lowerQuery = query.toLowerCase();
        let results = this.getCardsByDeck(this.currentDeck);
        
        return results.filter(card => 
            card.front.toLowerCase().includes(lowerQuery) || 
            card.back.toLowerCase().includes(lowerQuery) ||
            (card.notes && card.notes.toLowerCase().includes(lowerQuery))
        );
    }
    
    // 开始学习
    startStudying(deck = 'all') {
        this.currentDeck = deck;
        this.filteredCards = this.getCardsByDeck(deck);
        
        if (this.filteredCards.length === 0) {
            alert('当前分类没有闪卡！');
            return false;
        }
        
        this.currentIndex = 0;
        this.isStudying = true;
        this.updateStudyUI();
        return true;
    }
    
    // 随机排序当前学习的闪卡
    shuffleCards() {
        // Fisher-Yates 洗牌算法
        for (let i = this.filteredCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.filteredCards[i], this.filteredCards[j]] = [this.filteredCards[j], this.filteredCards[i]];
        }
        this.currentIndex = 0;
        this.updateStudyUI();
    }
    
    // 下一张闪卡
    nextCard() {
        if (!this.isStudying || this.filteredCards.length === 0) return;
        
        if (this.currentIndex < this.filteredCards.length - 1) {
            this.currentIndex++;
            this.updateStudyUI();
            return true;
        }
        return false;
    }
    
    // 上一张闪卡
    prevCard() {
        if (!this.isStudying || this.filteredCards.length === 0) return;
        
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateStudyUI();
            return true;
        }
        return false;
    }
    
    // 更新记忆评分
    updateMemoryRating(rating) {
        if (!this.isStudying || this.filteredCards.length === 0) return;
        
        const currentCard = this.filteredCards[this.currentIndex];
        const index = this.cards.findIndex(card => card.id === currentCard.id);
        
        if (index !== -1) {
            this.cards[index].memoryRating = rating;
            this.cards[index].lastReviewed = new Date().toISOString();
            this.saveToLocalStorage();
        }
    }
    
    // 重置学习进度
    resetProgress() {
        const cardsToReset = this.currentDeck === 'all' 
            ? this.cards 
            : this.cards.filter(card => card.deck === this.currentDeck);
            
        cardsToReset.forEach(card => {
            card.memoryRating = 0;
            card.lastReviewed = null;
        });
        
        this.saveToLocalStorage();
        alert('学习进度已重置！');
    }
    
    // 导出闪卡
    exportCards() {
        const cardsToExport = this.currentDeck === 'all' 
            ? this.cards 
            : this.cards.filter(card => card.deck === this.currentDeck);
            
        if (cardsToExport.length === 0) {
            alert('没有可导出的闪卡！');
            return;
        }
        
        let exportText = '';
        cardsToExport.forEach(card => {
            exportText += `${card.front}\t${card.back}\n`;
        });
        
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flashcards_${this.currentDeck === 'all' ? 'all' : this.currentDeck}_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
        
        // 添加闪卡表单
        document.getElementById('add-card-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const frontContent = document.getElementById('front-content').value.trim();
            const backContent = document.getElementById('back-content').value.trim();
            const deckName = document.getElementById('deck-name').value.trim();
            const notes = document.getElementById('notes').value.trim();
            
            if (frontContent && backContent) {
                this.addCard(frontContent, backContent, deckName, notes);
                document.getElementById('front-content').value = '';
                document.getElementById('back-content').value = '';
                document.getElementById('notes').value = '';
                alert('闪卡添加成功！');
            }
        });
        
        // 批量导入
        document.getElementById('batch-import-btn').addEventListener('click', () => {
            const importContent = document.getElementById('batch-import-content').value.trim();
            const deckName = document.getElementById('batch-deck-name').value.trim();
            
            if (importContent) {
                const count = this.batchImport(importContent, deckName);
                document.getElementById('batch-import-content').value = '';
                alert(`成功导入 ${count} 张闪卡！`);
            }
        });
        
        // 学习控制
        document.getElementById('deck-select').addEventListener('change', (e) => {
            this.currentDeck = e.target.value;
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            if (this.startStudying(this.currentDeck)) {
                document.getElementById('start-btn').style.display = 'none';
                document.getElementById('flip-btn').disabled = false;
                document.getElementById('prev-btn').disabled = true;
                document.getElementById('next-btn').disabled = false;
            }
        });
        
        document.getElementById('flip-btn').addEventListener('click', () => {
            const card = document.getElementById('current-card');
            card.classList.toggle('flipped');
            
            // 显示记忆评分按钮
            if (card.classList.contains('flipped')) {
                document.querySelector('.memory-rating').style.display = 'block';
            } else {
                document.querySelector('.memory-rating').style.display = 'none';
            }
        });
        
        document.getElementById('prev-btn').addEventListener('click', () => {
            const card = document.getElementById('current-card');
            card.classList.remove('flipped');
            document.querySelector('.memory-rating').style.display = 'none';
            this.prevCard();
        });
        
        document.getElementById('next-btn').addEventListener('click', () => {
            const card = document.getElementById('current-card');
            card.classList.remove('flipped');
            document.querySelector('.memory-rating').style.display = 'none';
            
            if (!this.nextCard()) {
                alert('恭喜！您已完成所有闪卡的学习。');
                document.getElementById('start-btn').style.display = 'block';
                document.getElementById('flip-btn').disabled = true;
                document.getElementById('prev-btn').disabled = true;
                document.getElementById('next-btn').disabled = true;
                this.isStudying = false;
            }
        });
        
        document.getElementById('shuffle-btn').addEventListener('click', () => {
            if (this.isStudying) {
                this.shuffleCards();
            } else {
                alert('请先开始学习！');
            }
        });
        
        document.getElementById('reset-progress-btn').addEventListener('click', () => {
            if (confirm('确定要重置学习进度吗？')) {
                this.resetProgress();
            }
        });
        
        // 记忆评分按钮
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const rating = parseInt(btn.getAttribute('data-rating'));
                this.updateMemoryRating(rating);
                document.getElementById('next-btn').click();
            });
        });
        
        // 管理闪卡
        document.getElementById('manage-deck-select').addEventListener('change', (e) => {
            this.currentDeck = e.target.value;
            this.updateCardsList();
        });
        
        document.getElementById('search-input').addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.updateCardsList(query);
        });
        
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportCards();
        });
        
        document.getElementById('delete-all-btn').addEventListener('click', () => {
            const message = this.currentDeck === 'all' 
                ? '确定要删除所有闪卡吗？此操作不可恢复！' 
                : `确定要删除"${this.currentDeck}"分类下的所有闪卡吗？此操作不可恢复！`;
                
            if (confirm(message)) {
                this.deleteAllCards();
            }
        });
    }
    
    // 切换标签页
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }
    
    // 更新分类下拉列表
    updateDeckLists() {
        const deckSelects = [
            document.getElementById('deck-select'),
            document.getElementById('manage-deck-select')
        ];
        
        const deckList = document.getElementById('deck-list');
        
        // 清空现有选项，保留"所有闪卡"选项
        deckSelects.forEach(select => {
            select.innerHTML = '<option value="all">所有闪卡</option>';
        });
        
        deckList.innerHTML = '';
        
        // 添加分类选项
        this.decks.forEach(deck => {
            deckSelects.forEach(select => {
                const option = document.createElement('option');
                option.value = deck;
                option.textContent = deck;
                select.appendChild(option);
            });
            
            const option = document.createElement('option');
            option.value = deck;
            deckList.appendChild(option);
        });
        
        // 设置当前选中的分类
        deckSelects.forEach(select => {
            select.value = this.currentDeck;
        });
    }
    
    // 更新学习界面
    updateStudyUI() {
        if (!this.isStudying || this.filteredCards.length === 0) return;
        
        const currentCard = this.filteredCards[this.currentIndex];
        const cardElement = document.getElementById('current-card');
        
        // 更新卡片内容
        cardElement.querySelector('.flashcard-front .card-text').textContent = currentCard.front;
        cardElement.querySelector('.flashcard-back .card-text').textContent = currentCard.back;
        
        // 重置卡片状态
        cardElement.classList.remove('flipped');
        document.querySelector('.memory-rating').style.display = 'none';
        
        // 更新进度
        document.getElementById('current-index').textContent = this.currentIndex + 1;
        document.getElementById('total-cards').textContent = this.filteredCards.length;
        
        // 更新按钮状态
        document.getElementById('prev-btn').disabled = this.currentIndex === 0;
        document.getElementById('next-btn').disabled = this.currentIndex === this.filteredCards.length - 1;
    }
    
    // 更新闪卡列表
    updateCardsList(query = '') {
        const cardsList = document.getElementById('cards-list');
        cardsList.innerHTML = '';
        
        const filteredCards = query ? this.searchCards(query) : this.getCardsByDeck(this.currentDeck);
        
        if (filteredCards.length === 0) {
            cardsList.innerHTML = '<p class="no-cards">没有找到闪卡</p>';
            return;
        }
        
        filteredCards.forEach(card => {
            const cardItem = document.createElement('div');
            cardItem.className = 'card-item';
            cardItem.innerHTML = `
                <div class="card-item-header">
                    <span class="card-item-deck">${card.deck || '未分类'}</span>
                    <span class="card-item-date">创建于: ${new Date(card.dateCreated).toLocaleDateString()}</span>
                </div>
                <div class="card-item-content">
                    <div class="card-item-front">
                        <strong>英文:</strong> ${card.front}
                    </div>
                    <div class="card-item-back">
                        <strong>中文:</strong> ${card.back}
                    </div>
                </div>
                ${card.notes ? `<div class="card-item-notes">笔记: ${card.notes}</div>` : ''}
                <div class="card-item-actions">
                    <button class="edit-btn" data-id="${card.id}">编辑</button>
                    <button class="delete-btn" data-id="${card.id}">删除</button>
                </div>
            `;
            
            cardsList.appendChild(cardItem);
            
            // 添加编辑和删除按钮的事件监听器
            cardItem.querySelector('.edit-btn').addEventListener('click', () => {
                this.showEditCardModal(card);
            });
            
            cardItem.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm('确定要删除这张闪卡吗？')) {
                    this.deleteCard(card.id);
                }
            });
        });
    }
    
    // 显示编辑闪卡的模态框
    showEditCardModal(card) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        modal.innerHTML = `
            <div class="edit-modal-content">
                <span class="close-modal">&times;</span>
                <h3>编辑闪卡</h3>
                <form id="edit-card-form">
                    <div class="form-group">
                        <label for="edit-front">英文 (正面):</label>
                        <textarea id="edit-front" required>${card.front}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-back">中文 (背面):</label>
                        <textarea id="edit-back" required>${card.back}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-deck">分类:</label>
                        <input type="text" id="edit-deck" list="deck-list" value="${card.deck || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-notes">笔记 (可选):</label>
                        <textarea id="edit-notes">${card.notes || ''}</textarea>
                    </div>
                    <button type="submit">保存修改</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .edit-modal {
                display: block;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }
            
            .edit-modal-content {
                background-color: #fff;
                margin: 10% auto;
                padding: 20px;
                border-radius: 10px;
                width: 80%;
                max-width: 600px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                position: relative;
            }
            
            .close-modal {
                position: absolute;
                top: 10px;
                right: 15px;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
        
        // 关闭模态框
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // 提交表单
        modal.querySelector('#edit-card-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const updates = {
                front: modal.querySelector('#edit-front').value.trim(),
                back: modal.querySelector('#edit-back').value.trim(),
                deck: modal.querySelector('#edit-deck').value.trim(),
                notes: modal.querySelector('#edit-notes').value.trim()
            };
            
            if (updates.front && updates.back) {
                this.updateCard(card.id, updates);
                document.body.removeChild(modal);
            }
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardApp = new FlashcardApp();
});
