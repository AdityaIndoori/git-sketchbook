// --- Utility to manage tabs (kept from previous version) ---
function showTab(conceptId, tabType) {
    let containerId = conceptId;
    // Handle 'head' case
    if (conceptId === 'head') containerId = 'head';
    
    // Find section - simpler to just look for the ID directly 
    // but the HTML uses `concept-X` convention.
    // Let's just use the direct IDs I put in HTML: c2-example, chead-example, etc.
    const targetId = `c${conceptId}-${tabType}`;
    const targetContent = document.getElementById(targetId);
    
    // Get the parent interactive box
    const interactiveBox = targetContent.closest('.interactive-box');
    
    const buttons = interactiveBox.querySelectorAll('.tab-btn');
    const contents = interactiveBox.querySelectorAll('.tab-content');

    // Only manage buttons here if NOT Concept 4
    if (conceptId !== 4) {
        buttons.forEach(btn => btn.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));
        
        targetContent.classList.add('active');

        // Highlight button
        // 0: Example, 1: Code
        let index = (tabType === 'code') ? 1 : 0;
        if(buttons[index]) buttons[index].classList.add('active');
    } else {
        // For Concept 4, just swap content. Button state is handled by setModMode.
        contents.forEach(content => content.classList.remove('active'));
        targetContent.classList.add('active');
    }
}

// --- Interactive Git Simulations ---

const gitCmd = {
    // 1. COMMIT CHAIN
    commitCount: 1,
    commit: function() {
        const canvas = document.getElementById('canvas-1');
        if (canvas.children.length >= 8) { // Increased limit slightly
            alert("Canvas full! Hit the reset button to start over.");
            return;
        }
        
        this.commitCount++;
        
        // Add connector
        const connector = document.createElement('div');
        connector.className = 'commit-connector';
        connector.style.animation = 'fadeIn 0.5s';
        canvas.appendChild(connector);

        // Create new node
        const node = document.createElement('div');
        node.className = 'commit-node';
        node.style.animation = 'fadeIn 0.5s';
        
        const hash = Math.random().toString(16).substr(2, 6);
        node.innerHTML = `
            <span class="commit-hash">${hash}</span>
            <span class="commit-msg">C${this.commitCount}</span>
        `;
        
        canvas.appendChild(node);
    },

    // 2. BRANCHES
    initBranches: function() {
        const canvas = document.getElementById('canvas-2');
        canvas.innerHTML = ''; 
        
        // Create 3 nodes: C1 -> C2 -> C3
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.marginTop = '40px'; // Give space for stacks
        
        for(let i=1; i<=3; i++) {
            if(i > 1) {
                const conn = document.createElement('div');
                conn.className = 'commit-connector';
                container.appendChild(conn);
            }
            const node = document.createElement('div');
            node.className = 'commit-node clickable-node';
            node.id = `b-node-${i}`;
            node.innerHTML = `<span class="commit-msg">C${i}</span>`;
            node.onclick = () => this.clickBranchNode(i);
            
            // Initial Main on C3
            if (i === 3) {
                const badge = document.createElement('div');
                badge.className = 'branch-label';
                badge.id = 'lbl-main';
                badge.innerText = 'main';
                node.appendChild(badge);
            }
            
            container.appendChild(node);
        }
        canvas.appendChild(container);
        
        // Initial Stack Calculation
        this.restackBranches(document.getElementById('b-node-3'));
    },

    restackBranches: function(node) {
        if (!node) return;
        const labels = node.querySelectorAll('.branch-label');
        labels.forEach((label, index) => {
            // Stack upwards: -35, -65, -95...
            const topOffset = -35 - (index * 30);
            label.style.top = `${topOffset}px`;
            
            // Random-ish rotation for the stack look
            // We maintain translateX(-50%) to keep it centered
            const rot = (index % 2 === 0) ? -2 : 2; 
            label.style.transform = `translateX(-50%) rotate(${rot}deg)`;
        });
    },

    clickBranchNode: function(nodeIndex) {
        const branchName = document.getElementById('branch-name-input').value || 'feature';
        const targetNode = document.getElementById(`b-node-${nodeIndex}`);
        
        let existingBadge = null;
        // Search all badges in this canvas to see if we are moving one
        document.querySelectorAll('#canvas-2 .branch-label').forEach(b => {
            if (b.innerText === branchName) existingBadge = b;
        });

        if (existingBadge) {
            // Check if actually moving to a new node
            const oldParent = existingBadge.parentNode;
            
            if (oldParent !== targetNode) {
                targetNode.appendChild(existingBadge);
                // Restack both old and new
                this.restackBranches(oldParent);
                this.restackBranches(targetNode);
                
                // Animation effect
                existingBadge.style.animation = 'none';
                existingBadge.offsetHeight; /* trigger reflow */
                existingBadge.style.animation = 'fadeOnly 0.3s';
            }
        } else {
            // CREATE IT
            const badge = document.createElement('div');
            badge.className = 'branch-label';
            badge.innerText = branchName;
            badge.style.background = '#e67e22'; 
            badge.style.animation = 'fadeOnly 0.3s';
            
            targetNode.appendChild(badge);
            this.restackBranches(targetNode);
        }
    },
    
    createBranch: function() {
        alert("Click a commit node to place the branch there!");
    },

    // 2.5 HEAD POINTER
    headState: { target: 'main', type: 'branch', commitIndex: 3 }, // Tracks current HEAD
    
    initHead: function() {
        const canvas = document.getElementById('canvas-head');
        canvas.innerHTML = '';
        
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.marginTop = '60px'; // More space for stacking
        
        // Create 3 Nodes
        for(let i=1; i<=3; i++) {
            if(i > 1) {
                const conn = document.createElement('div');
                conn.className = 'commit-connector';
                container.appendChild(conn);
            }
            const node = document.createElement('div');
            node.className = 'commit-node clickable-node';
            node.id = `h-node-${i}`;
            node.innerHTML = `<span class="commit-msg">C${i}</span>`;
            
            // Add click listener for Detached HEAD
            node.onclick = (e) => {
                e.stopPropagation(); // Prevent bubbling
                this.checkoutHead(i, 'commit');
            };
            
            // Add Branches
            if (i === 2) this.addHeadBranch(node, 'feature', '#e67e22');
            if (i === 3) this.addHeadBranch(node, 'main', '#27ae60');
            
            container.appendChild(node);
        }
        canvas.appendChild(container);

        // Render HEAD Pointer
        const head = document.createElement('div');
        head.className = 'head-pointer';
        head.innerText = 'HEAD';
        head.id = 'real-head';
        canvas.appendChild(head);
        
        // Initial State
        this.headState = { target: 'main', type: 'branch', commitIndex: 3 };
        // Wait for layout
        setTimeout(() => this.updateHeadVisual(), 100);
    },

    addHeadBranch: function(node, name, color) {
        const badge = document.createElement('div');
        badge.className = 'branch-label';
        badge.innerText = name;
        badge.style.backgroundColor = color;
        badge.id = `h-lbl-${name}`;
        
        // Click listener for Attached HEAD
        badge.onclick = (e) => {
            e.stopPropagation();
            // Find which node this belongs to (parent)
            const parentId = node.id; // e.g., h-node-3
            const idx = parseInt(parentId.split('-')[2]);
            this.checkoutHead(name, 'branch', idx);
        };
        
        // Stacking logic for static initialization
        // (For this specific demo, we know where they go, but let's be generic)
        const existing = node.querySelectorAll('.branch-label').length;
        const topOffset = -35 - (existing * 30);
        badge.style.top = `${topOffset}px`;
        
        node.appendChild(badge);
    },

    checkoutHead: function(targetId, type, commitIndex) {
        if (type === 'commit') {
            this.headState = { target: targetId, type: 'commit', commitIndex: targetId };
        } else {
            this.headState = { target: targetId, type: 'branch', commitIndex: commitIndex };
        }
        this.updateHeadVisual();
    },

    updateHeadVisual: function() {
        const head = document.getElementById('real-head');
        const canvasRect = document.getElementById('canvas-head').getBoundingClientRect();
        
        let targetElement = null;
        let baseCommit = document.getElementById(`h-node-${this.headState.commitIndex}`);
        
        if (!baseCommit) return;

        // Calculate Target Position
        let targetTop = 0;
        
        if (this.headState.type === 'branch') {
            // Attached: Pointing to the Branch Label
            targetElement = document.getElementById(`h-lbl-${this.headState.target}`);
            head.innerText = `HEAD -> ${this.headState.target}`;
            head.style.backgroundColor = '#27ae60'; // Green for safe attached state
        } else {
            // Detached: Pointing to the Commit (but must sit above any branches)
            targetElement = baseCommit;
            head.innerText = `HEAD (${this.headState.target})`; // e.g. HEAD (C2)
            head.style.backgroundColor = '#c0392b'; // Red for detached
        }

        if (!targetElement) return;

        const rect = targetElement.getBoundingClientRect();
        
        // Horizontal Center
        const relativeLeft = rect.left - canvasRect.left + (rect.width/2);
        
        // Vertical: We need to stack ABOVE everything on this commit
        // 1. Get all branch labels on this commit
        const labels = baseCommit.querySelectorAll('.branch-label');
        let highestOffset = -25; // Base offset for commit node
        
        if (labels.length > 0) {
            // If there are labels, we need to be above the highest one
            // Each label is ~30px high. 
            // Simple math: -35 (first) - 30 * (n-1)
            highestOffset = -35 - ((labels.length - 1) * 30);
            
            // If we are attached to a specific branch, we just sit above that specific label?
            // No, HEAD is usually visualized as the topmost pointer.
            // But if we are attached to 'feature' and 'main' is also there... 
            // visually we just put HEAD at the very top of the stack.
        }

        // Adjust for HEAD's own height (~25px) + pointer arrow
        const finalTop = rect.top - canvasRect.top - 40;
        
        // Wait, better approach:
        // Just find the top-most element physically on that node.
        // Actually, my `addHeadBranch` sets `top` style. 
        // Let's use that.
        
        let minTop = 0; // Relative to node top
        labels.forEach(l => {
            const t = parseInt(l.style.top || 0);
            if (t < minTop) minTop = t;
        });

        // HEAD should be above minTop
        // We need to calculate absolute position relative to canvas
        const nodeRect = baseCommit.getBoundingClientRect();
        const nodeTopRel = nodeRect.top - canvasRect.top;
        
        // HEAD top = Node Top + minTop - HEAD Height - Padding
        const headTop = nodeTopRel + minTop - 35;

        head.style.left = (relativeLeft - 20) + 'px'; // -20 to center the 'HEAD' box approx
        head.style.top = headTop + 'px';
    },

    // 3. THREE AREAS
    fileState: 'working', // working, staging, repo
    addFile: function() {
        if (this.fileState !== 'working') return;
        
        const working = document.getElementById('area-working');
        const file = working.querySelector('.file-item');
        if (!file) return;

        const staging = document.getElementById('area-staging');
        staging.appendChild(file);
        this.fileState = 'staging';
        file.style.transform = 'rotate(-2deg)';
    },
    stageFile: function(el) {
        // Legacy click handler, optionally keep or redirect
        // For now, let's just allow clicking too as a shortcut
        if (this.fileState === 'working') this.addFile();
    },
    commitArea: function() {
        if (this.fileState !== 'staging') {
            alert("You need to stage the file first! Click 'git add'.");
            return;
        }
        
        const repo = document.getElementById('area-repo');
        const file = document.querySelector('.file-item'); 
        repo.appendChild(file);
        this.fileState = 'repo';
        file.style.borderColor = '#27ae60';
        file.innerText = "Committed!";
    },
    pushArea: function() {
        if (this.fileState !== 'repo') {
            alert("You need to commit first! Click 'git commit'.");
            return;
        }

        const remote = document.getElementById('area-remote');
        const file = document.querySelector('.file-item');
        remote.appendChild(file);
        this.fileState = 'remote';
        file.style.backgroundColor = '#ecf0f1';
        file.style.borderStyle = 'dashed';
        file.innerText = "Pushed!";
    },

    // 4. MODIFYING HISTORY (Reset, Revert, Rebase)
    modMode: 'reset',
    modState: 'initial', // initial, done
    rebaseOffsetX: 220, // Store for execRebase to use

    initModHistory: function() {
        this.setModMode('reset');
    },

    setModMode: function(mode, btn) {
        this.modMode = mode;
        this.modState = 'initial';
        
        const section = document.getElementById('concept-4');
        const tabs = section.querySelectorAll('.tab-btn');
        let targetBtn = btn;

        // If no button passed (initial load/reset), find the right tab button
        if (!targetBtn) {
            tabs.forEach(t => {
                if (t.innerText.toLowerCase().trim() === mode.toLowerCase().trim()) targetBtn = t;
            });
        }

        // Clean all tabs in this section and highlight target
        tabs.forEach(b => b.classList.remove('active'));
        if (targetBtn) {
            targetBtn.classList.add('active');
        }

        // Update Description Content
        // We call showTab but tell it to skip button management for this section
        showTab(4, mode);

        // Render Canvas Visuals
        this.renderModVisuals();
    },

    renderModVisuals: function() {
        const canvas = document.getElementById('canvas-4');
        const controls = document.getElementById('controls-4');
        const note = document.getElementById('note-4');
        
        canvas.innerHTML = '';
        controls.innerHTML = '';

        if (this.modMode === 'reset') {
            this.renderReset(canvas, controls);
            note.innerText = '"Going back in time..."';
        } else if (this.modMode === 'revert') {
            this.renderRevert(canvas, controls);
            note.innerText = '"Adding an opposite commit."';
        } else if (this.modMode === 'rebase') {
            this.renderRebase(canvas, controls);
            note.innerText = '"Moving the base."';
        }
    },

    // --- RESET VISUALS ---
    renderReset: function(canvas, controls) {
        // Visual: C1 <- C2 <- C3 (HEAD)
        this.createChain(canvas, 3, ['C1', 'C2', 'C3']);
        
        // Add Branch Label on C3
        const c3 = document.getElementById('mod-node-3');
        const badge = document.createElement('div');
        badge.className = 'branch-label';
        badge.id = 'mod-lbl-main';
        badge.innerText = 'main';
        badge.style.top = '-35px';
        c3.appendChild(badge);

        const head = this.createHead(canvas, 3);
        head.id = 'mod-head';
        
        // Adjust HEAD to be above branch
        // We need to wait for render or just guess offset. 
        // Default createHead is top 60px (absolute relative to canvas). 
        // Node is ~ centered. Let's assume standard position.
        // Actually, createHead calculates based on node position.
        // We'll rely on its calculation but update text.
        head.innerText = 'HEAD -> main';

        // Controls
        controls.innerHTML = `
            <button class="sketch-btn small" onclick="gitCmd.execReset('soft')">--soft</button>
            <button class="sketch-btn small" onclick="gitCmd.execReset('mixed')">--mixed</button>
            <button class="sketch-btn small" onclick="gitCmd.execReset('hard')">--hard</button>
        `;
    },
    execReset: function(type) {
        // Remove 'done' check to allow switching modes (soft/mixed/hard)
        // if (this.modState === 'done') return;
        this.modState = 'done';

        // Animate Head moving back to C2
        const head = document.getElementById('mod-head');
        const c2 = document.getElementById('mod-node-2');
        const canvas = document.getElementById('canvas-4');
        const lbl = document.getElementById('mod-lbl-main');

        // Move Branch Label to C2
        c2.appendChild(lbl);
        lbl.style.animation = 'none';
        lbl.offsetHeight; /* trigger reflow */
        lbl.style.animation = 'fadeOnly 0.5s';
        
        const c2Rect = c2.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        head.style.left = (c2Rect.left - canvasRect.left + 15) + 'px';
        head.innerText = `HEAD -> main`; 
        
        // Clean up previous status label if exists
        const oldStatus = document.getElementById('mod-status-lbl');
        if (oldStatus) oldStatus.remove();

        // Visual feedback for file status
        const status = document.createElement('div');
        status.id = 'mod-status-lbl'; // Add ID for cleanup
        status.className = 'branch-label'; // reuse style
        
        if (type === 'soft') status.innerText = "Changes: Staged";
        if (type === 'mixed') status.innerText = "Changes: Working Dir";
        if (type === 'hard') {
            status.innerText = "Changes: DESTROYED";
            status.style.background = '#c0392b';
            status.style.color = '#fff';
        } else {
            status.style.background = '#f1c40f';
            status.style.color = '#333';
        }
        
        const c3 = document.getElementById('mod-node-3');
        c3.appendChild(status);
        
        status.style.position = 'absolute';
        status.style.top = '85px';
        status.style.bottom = 'auto';
        status.style.left = '50%';
        status.style.transform = 'translateX(-50%)';
        status.style.width = '140px';
        status.style.opacity = '0'; // Start hidden
        
        setTimeout(() => status.style.opacity = 1, 50);
    },

    // --- REVERT VISUALS ---
    renderRevert: function(canvas, controls) {
        // Visual: C1 <- C2
        this.createChain(canvas, 2, ['C1', 'C2']);
        
        // Add Branch Label on C2
        const c2 = document.getElementById('mod-node-2');
        const badge = document.createElement('div');
        badge.className = 'branch-label';
        badge.id = 'mod-lbl-main';
        badge.innerText = 'main';
        badge.style.top = '-35px';
        c2.appendChild(badge);

        // Head
        const head = this.createHead(canvas, 2);
        head.id = 'mod-head';
        head.innerText = 'HEAD -> main';
        
        controls.innerHTML = `
            <button class="sketch-btn" onclick="gitCmd.execRevert()">git revert C2</button>
        `;
    },
    execRevert: function() {
        if (this.modState === 'done') return;
        this.modState = 'done';

        const canvas = document.getElementById('canvas-4');
        const lbl = document.getElementById('mod-lbl-main');
        const head = document.getElementById('mod-head');
        
        // Add connector
        const conn = document.createElement('div');
        conn.className = 'commit-connector';
        conn.style.animation = 'fadeOnly 0.5s';
        canvas.appendChild(conn);

        // Add C2' (Revert)
        const node = document.createElement('div');
        node.className = 'commit-node';
        node.style.animation = 'fadeOnly 0.5s';
        node.innerHTML = `<span class="commit-msg">Revert "C2"</span>`;
        node.id = 'revert-node';
        canvas.appendChild(node);
        
        // Move Branch Label to new node
        node.appendChild(lbl);
        lbl.style.animation = 'fadeOnly 0.5s';
        
        // Move HEAD
        setTimeout(() => {
             const rect = node.getBoundingClientRect();
             const canvasRect = canvas.getBoundingClientRect();
             head.style.left = (rect.left - canvasRect.left + 15) + 'px';
        }, 50);
    },

    // --- REBASE VISUALS (FIXED FOR MOBILE) ---
    renderRebase: function(canvas, controls) {
        canvas.style.position = 'relative';
        canvas.style.minHeight = '280px';
        canvas.style.display = 'block'; // Override flex from other modes
        
        // MOBILE FIX: Calculate dynamic offset based on canvas width
        // Wait for canvas to render to get accurate width
        setTimeout(() => {
            const canvasWidth = canvas.offsetWidth || 600;
            // Use smaller spacing that fits mobile: total graph width ~300px
            // Center it: (canvasWidth - 300) / 2, with minimum of 20px
            const offsetX = Math.max(20, (canvasWidth - 300) / 2);
            
            // Store for execRebase to use
            this.rebaseOffsetX = offsetX;
            
            // Layout: C1 at left, C2 to the right of C1 (main branch), C3 above C2 (feature branch)
            // Using 100px spacing instead of 160px for mobile compatibility
            const c1 = this.drawNode(canvas, offsetX, 140, 'C1');
            c1.id = 'rebase-c1';
            
            const c2 = this.drawNode(canvas, offsetX + 100, 140, 'C2');
            c2.id = 'rebase-c2';
            // main label positioned well below C2's commit-msg
            this.drawLabel(canvas, offsetX + 100, 220, 'main', '#27ae60', 'lbl-main');
            
            const c3 = this.drawNode(canvas, offsetX + 100, 50, 'C3');
            c3.id = 'rebase-c3';
            this.drawLabel(canvas, offsetX + 100, 15, 'feature', '#e67e22', 'lbl-feat');
            
            // Connections with arrows (arrow points to parent)
            // C1 -> C2 (horizontal line) - at center height of nodes (y=140+25=165)
            this.drawLine(canvas, offsetX + 50, 165, offsetX + 100, 165); // from C1 right edge to C2 left edge
            
            // C1 -> C3 (diagonal line going up-right)
            const lineFeat = this.drawLine(canvas, offsetX + 50, 165, offsetX + 100, 75); // from C1 to C3
            lineFeat.id = 'line-feat';

            // HEAD Pointer - positioned above the feature label
            const head = document.createElement('div');
            head.className = 'head-pointer';
            head.id = 'rebase-head';
            head.innerText = 'HEAD -> feature';
            head.style.position = 'absolute';
            head.style.left = (offsetX + 75) + 'px';
            head.style.top = '-15px'; 
            canvas.appendChild(head);
        }, 0);

        controls.innerHTML = `
            <button class="sketch-btn" onclick="gitCmd.execRebase()">git rebase main</button>
        `;
    },
    execRebase: function() {
        if (this.modState === 'done') return;
        this.modState = 'done';

        const c3 = document.getElementById('rebase-c3');
        const lbl = document.getElementById('lbl-feat');
        const line = document.getElementById('line-feat');
        const head = document.getElementById('rebase-head');
        const canvas = document.getElementById('canvas-4');
        
        // Use the stored offsetX from renderRebase
        const offsetX = this.rebaseOffsetX;
        
        // Animation: Move C3 to be after C2
        // C2 is at offsetX+100, so new C3' at offsetX+200 (100px to the right)
        c3.style.transition = 'all 1s ease';
        c3.style.left = (offsetX + 200) + 'px';
        c3.style.top = '140px';
        
        lbl.style.transition = 'all 1s ease';
        lbl.style.left = (offsetX + 225) + 'px'; // x + 25 for centering
        lbl.style.top = '220px';

        head.style.transition = 'all 1s ease';
        head.style.left = (offsetX + 175) + 'px';
        head.style.top = '95px';
        
        // Update Line: Connect C2 to New C3' (horizontal)
        // C2 is at offsetX+100, right edge at offsetX+150, line to new C3 at offsetX+200
        line.style.transition = 'all 1s ease';
        line.style.width = '50px'; 
        line.style.transform = 'rotate(0deg)';
        line.style.left = (offsetX + 150) + 'px'; // C2 right edge
        line.style.top = '165px';
        
        // Change Hash/Color to show it's a NEW commit
        setTimeout(() => {
            c3.style.backgroundColor = '#81ecec';
            c3.querySelector('.commit-msg').innerText = "C3'";
        }, 1000);
    },

    // Helpers for Mod History
    createChain: function(canvas, count, labels) {
        canvas.style.display = 'flex';
        canvas.style.alignItems = 'center';
        canvas.style.justifyContent = 'center';
        
        for(let i=0; i<count; i++) {
            if (i > 0) {
                const conn = document.createElement('div');
                conn.className = 'commit-connector';
                canvas.appendChild(conn);
            }
            const node = document.createElement('div');
            node.className = 'commit-node';
            node.id = `mod-node-${i+1}`;
            node.innerHTML = `<span class="commit-msg">${labels[i]}</span>`;
            canvas.appendChild(node);
        }
    },
    createHead: function(canvas, nodeIndex) {
        const node = document.getElementById(`mod-node-${nodeIndex}`);
        const rect = node.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        const head = document.createElement('div');
        head.className = 'head-pointer';
        head.innerText = 'HEAD';
        head.style.position = 'absolute';
        head.style.top = '60px'; 
        head.style.left = (rect.left - canvasRect.left + 15) + 'px';
        canvas.appendChild(head);
        return head;
    },
    drawNode: function(canvas, x, y, label) {
        const node = document.createElement('div');
        node.className = 'commit-node';
        node.style.position = 'absolute';
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        node.innerHTML = `<span class="commit-msg">${label}</span>`;
        canvas.appendChild(node);
        return node;
    },
    drawLabel: function(canvas, x, y, text, color, id) {
        const lbl = document.createElement('div');
        lbl.className = 'branch-label';
        if(id) lbl.id = id;
        lbl.innerText = text;
        lbl.style.background = color;
        lbl.style.left = x + 25 + 'px'; // Center roughly
        lbl.style.top = y + 'px';
        lbl.style.transform = 'translateX(-50%)';
        canvas.appendChild(lbl);
        return lbl;
    },
    drawLine: function(canvas, x1, y1, x2, y2) {
        const length = Math.hypot(x2 - x1, y2 - y1);
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.background = '#2c3e50';
        line.style.height = '3px';
        line.style.left = x1 + 'px';
        line.style.top = y1 + 'px';
        line.style.width = length + 'px';
        line.style.transformOrigin = '0 0';
        line.style.transform = `rotate(${angle}deg)`;
        line.style.zIndex = '1';
        
        // Arrowhead pointing LEFT (toward parent/start of line) - positioned near start
        // Using borderLeft to point toward x1,y1 (the parent commit)
        const arrow = document.createElement('div');
        arrow.style.position = 'absolute';
        arrow.style.left = '15px'; // Position along the line where it's visible
        arrow.style.top = '-7px';
        arrow.style.width = '0';
        arrow.style.height = '0';
        arrow.style.borderTop = '8px solid transparent';
        arrow.style.borderBottom = '8px solid transparent';
        arrow.style.borderRight = '16px solid #2c3e50'; // Points LEFT (toward parent)
        arrow.style.zIndex = '2';
        line.appendChild(arrow);
        
        canvas.appendChild(line);
        return line; 
    },

    // 5. REFLOG
    reflogHistory: ['commit: initial'],
    reflogState: 'normal', 
    renderReflog: function() {
        const list = document.getElementById('reflog-list');
        list.innerHTML = '';
        this.reflogHistory.forEach((entry, i) => {
            const div = document.createElement('div');
            div.className = 'log-entry';
            div.innerText = `HEAD@{${i}}: ${entry}`;
            list.appendChild(div);
        });
    },
    resetHard: function() {
        const graph = document.getElementById('reflog-graph');
        if (this.reflogState === 'deleted') return;

        graph.innerHTML = ''; 
        this.reflogState = 'deleted';
        
        this.reflogHistory.unshift("reset: moving to HEAD~1");
        this.renderReflog();
    },
    recoverReflog: function() {
        if (this.reflogState !== 'deleted') return;
        
        const graph = document.getElementById('reflog-graph');
        const node = document.createElement('div');
        node.className = 'commit-node';
        node.innerHTML = '<span class="commit-hash">restored</span>';
        node.style.animation = 'fadeIn 0.5s';
        graph.appendChild(node);
        
        this.reflogState = 'normal';
        this.reflogHistory.unshift("checkout: moving to restored_hash");
        this.renderReflog();
    },

    // --- UNIVERSAL RESET ---
    reset: function(areaId) {
        if (areaId === 1) {
            // Reset Commits
            const c1 = document.getElementById('canvas-1');
            this.commitCount = 1;
            c1.innerHTML = `
                <div class="commit-node">
                    <span class="commit-hash">init</span>
                    <span class="commit-msg">Init</span>
                </div>
            `;
        } else if (areaId === 2) {
            // Reset Branches
            document.getElementById('branch-name-input').value = 'feature';
            this.initBranches();
        } else if (areaId === 'head') {
            // Reset HEAD
            this.initHead();
        } else if (areaId === 3) {
            // Reset Areas
            const working = document.getElementById('area-working');
            const file = document.querySelector('.file-item');
            if (file) {
                file.remove(); 
            }
            // Recreate file
            const newFile = document.createElement('div');
            newFile.className = 'file-item';
            // Remove click handler since we have a button now, or keep it for fun?
            // User asked for a button instead. Let's make the file non-clickable for action.
            newFile.innerText = 'file.txt';
            working.appendChild(newFile);
            this.fileState = 'working';
        } else if (areaId === 4) {
            // Reset Mod History
            this.setModMode(this.modMode);
        } else if (areaId === 5) {
            // Reset Reflog
            this.reflogState = 'normal';
            this.reflogHistory = ['commit: initial'];
            document.getElementById('reflog-graph').innerHTML = `
                <div class="commit-node">
                    <span class="commit-hash">e4f2g</span>
                    <span class="commit-msg">My Work</span>
                </div>
            `;
            this.renderReflog();
        }
    }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Init Concept 1
    gitCmd.reset(1); // Use reset to init

    // Init Concept 2
    gitCmd.initBranches();
    
    // Init Concept HEAD
    gitCmd.initHead();

    // Init Mod History
    gitCmd.initModHistory();

    // Init Concept 5 (Graph)
    gitCmd.reset(5); // Use reset to init
    
    // Scroll Animations
    const observerOptions = { threshold: 0.2 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.sketch-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });

    // Handle Resize for HEAD positioning
    window.addEventListener('resize', () => {
        gitCmd.updateHeadVisual();
    });
});
