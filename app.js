// PCA Interactive Lab JavaScript
class PCALab {
    constructor() {
        this.currentSection = 1;
        this.totalSections = 6;
        this.userPoints = [];
        this.pcaLine = null;
        this.draggingLine = false;
        this.userLine = { angle: 0, x: 250, y: 200 };
        this.pcaShown = false;
        this.currentDataset = 0;
        this.angleIndex = 0;
        this.isDrawing = false;
        this.lastPointTime = 0;
        
        // Sample datasets from the provided data
        this.datasets = [
            {
                name: "Student Heights and Weights",
                description: "Data showing the relationship between student heights and weights",
                data: [
                    {x: 150, y: 45}, {x: 160, y: 55}, {x: 170, y: 65}, {x: 155, y: 48}, {x: 165, y: 58},
                    {x: 175, y: 70}, {x: 152, y: 47}, {x: 168, y: 62}, {x: 172, y: 68}, {x: 158, y: 52}
                ]
            },
            {
                name: "Study Time vs Test Scores",
                description: "Relationship between hours studied and test performance",
                data: [
                    {x: 2, y: 65}, {x: 4, y: 72}, {x: 6, y: 78}, {x: 3, y: 68}, {x: 5, y: 75},
                    {x: 7, y: 82}, {x: 1, y: 60}, {x: 8, y: 85}, {x: 4.5, y: 74}, {x: 6.5, y: 80}
                ]
            },
            {
                name: "Temperature vs Ice Cream Sales",
                description: "How temperature affects ice cream sales",
                data: [
                    {x: 20, y: 200}, {x: 25, y: 280}, {x: 30, y: 350}, {x: 22, y: 220}, {x: 28, y: 320},
                    {x: 32, y: 380}, {x: 18, y: 180}, {x: 35, y: 420}, {x: 26, y: 300}, {x: 29, y: 340}
                ]
            }
        ];

        // Preset patterns
        this.presetPatterns = {
            random: [
                {x: 100, y: 150}, {x: 200, y: 200}, {x: 150, y: 100}, {x: 250, y: 180}, {x: 180, y: 220},
                {x: 120, y: 170}, {x: 300, y: 160}, {x: 220, y: 140}, {x: 160, y: 190}, {x: 280, y: 210}
            ],
            diagonal: [
                {x: 50, y: 50}, {x: 80, y: 85}, {x: 110, y: 115}, {x: 140, y: 145}, {x: 170, y: 175},
                {x: 200, y: 205}, {x: 230, y: 235}, {x: 260, y: 265}, {x: 290, y: 295}, {x: 320, y: 325}
            ],
            clusters: [
                {x: 100, y: 100}, {x: 110, y: 105}, {x: 95, y: 110}, {x: 105, y: 95}, {x: 115, y: 100},
                {x: 250, y: 200}, {x: 260, y: 205}, {x: 245, y: 210}, {x: 255, y: 195}, {x: 265, y: 200}
            ]
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.setupIntroCanvas();
        this.setupDataCanvas();
        this.setupLineCanvas();
        this.setupProjectionCanvas();
        this.setup3DVisualization();
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('nextBtn1').addEventListener('click', () => this.nextSection());
        document.getElementById('nextBtn2').addEventListener('click', () => this.nextSection());
        document.getElementById('nextBtn3').addEventListener('click', () => this.nextSection());
        document.getElementById('nextBtn4').addEventListener('click', () => this.nextSection());
        document.getElementById('nextBtn5').addEventListener('click', () => this.nextSection());
        
        document.getElementById('prevBtn2').addEventListener('click', () => this.prevSection());
        document.getElementById('prevBtn3').addEventListener('click', () => this.prevSection());
        document.getElementById('prevBtn4').addEventListener('click', () => this.prevSection());
        document.getElementById('prevBtn5').addEventListener('click', () => this.prevSection());
        document.getElementById('prevBtn6').addEventListener('click', () => this.prevSection());

        // Section 1: Intro controls
        document.getElementById('cycleAngleBtn').addEventListener('click', () => this.cycleViewingAngle());

        // Section 2: Data creation controls
        document.querySelectorAll('[data-pattern]').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadPresetPattern(e.target.dataset.pattern));
        });
        document.getElementById('clearData').addEventListener('click', () => this.clearData());

        // Section 3: Line controls
        document.getElementById('showPCABtn').addEventListener('click', () => this.showPCALine());
        document.getElementById('resetLineBtn').addEventListener('click', () => this.resetUserLine());

        // Section 4: Projection controls
        document.getElementById('dimensionSlider').addEventListener('input', (e) => this.updateProjection(e.target.value));

        // Section 6: Final section controls
        document.getElementById('completeBtn').addEventListener('click', () => this.completeLab());
    }

    nextSection() {
        if (this.currentSection < this.totalSections) {
            document.getElementById(`section${this.currentSection}`).classList.remove('active');
            this.currentSection++;
            document.getElementById(`section${this.currentSection}`).classList.add('active');
            this.updateProgress();
            
            // Handle section-specific initialization
            if (this.currentSection === 3) {
                this.initializeLineSection();
            } else if (this.currentSection === 4) {
                this.initializeProjectionSection();
            } else if (this.currentSection === 6) {
                this.init3DVisualization();
            }
        }
    }

    prevSection() {
        if (this.currentSection > 1) {
            document.getElementById(`section${this.currentSection}`).classList.remove('active');
            this.currentSection--;
            document.getElementById(`section${this.currentSection}`).classList.add('active');
            this.updateProgress();
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const percentage = (this.currentSection / this.totalSections) * 100;
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `Section ${this.currentSection} of ${this.totalSections}`;
    }

    // Section 1: Introduction Canvas
    setupIntroCanvas() {
        this.introCanvas = document.getElementById('introCanvas');
        this.introCtx = this.introCanvas.getContext('2d');
        this.drawIntroDemo();
    }

    drawIntroDemo() {
        const ctx = this.introCtx;
        const canvas = this.introCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Sample data points
        const points = [
            {x: 100, y: 100}, {x: 150, y: 120}, {x: 200, y: 140}, {x: 250, y: 160},
            {x: 120, y: 80}, {x: 180, y: 100}, {x: 220, y: 120}, {x: 280, y: 140}
        ];
        
        // Draw points
        ctx.fillStyle = '#1FB8CD';
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Draw viewing angle line
        const angles = [0, Math.PI/6, Math.PI/4, Math.PI/3];
        const angle = angles[this.angleIndex % angles.length];
        
        ctx.strokeStyle = '#B4413C';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(50, 150);
        ctx.lineTo(50 + 300 * Math.cos(angle), 150 - 300 * Math.sin(angle));
        ctx.stroke();
        
        // Add angle label
        ctx.fillStyle = '#B4413C';
        ctx.font = '16px Arial';
        ctx.fillText(`Viewing Angle ${this.angleIndex + 1}`, 10, 280);
    }

    cycleViewingAngle() {
        this.angleIndex = (this.angleIndex + 1) % 4;
        this.drawIntroDemo();
    }

    // Section 2: Data Creation Canvas
    setupDataCanvas() {
        this.dataCanvas = document.getElementById('dataCanvas');
        this.dataCtx = this.dataCanvas.getContext('2d');
        
        this.dataCanvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            this.addDataPoint(e);
        });
        this.dataCanvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                this.addDataPoint(e);
            }
        });
        this.dataCanvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });
        this.dataCanvas.addEventListener('mouseleave', () => {
            this.isDrawing = false;
        });

        this.drawDataCanvas();
    }

    addDataPoint(event) {
        const currentTime = Date.now();
        if (currentTime - this.lastPointTime < 100) {
            return; // Debounce
        }
        this.lastPointTime = currentTime;

        const rect = this.dataCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.userPoints.push({x, y});
        this.updatePointCount();
        this.drawDataCanvas();
    }

    loadPresetPattern(pattern) {
        this.userPoints = [...this.presetPatterns[pattern]];
        this.updatePointCount();
        this.drawDataCanvas();
    }

    clearData() {
        this.userPoints = [];
        this.updatePointCount();
        this.drawDataCanvas();
    }

    updatePointCount() {
        document.getElementById('pointCount').textContent = this.userPoints.length;
    }

    drawDataCanvas() {
        const ctx = this.dataCtx;
        const canvas = this.dataCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= canvas.width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i <= canvas.height; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        
        // Draw points
        ctx.fillStyle = '#1FB8CD';
        this.userPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    // Section 3: Line Fitting Canvas
    setupLineCanvas() {
        this.lineCanvas = document.getElementById('lineCanvas');
        this.lineCtx = this.lineCanvas.getContext('2d');
        
        this.lineCanvas.addEventListener('mousedown', (e) => this.startDragLine(e));
        this.lineCanvas.addEventListener('mousemove', (e) => this.dragLine(e));
        this.lineCanvas.addEventListener('mouseup', () => this.stopDragLine());
        
        this.drawLineCanvas();
    }

    initializeLineSection() {
        this.pcaShown = false;
        this.userLine = { angle: 0, x: 250, y: 200 };
        this.calculatePCA();
        this.drawLineCanvas();
        this.updateFitScore();
        
        // Hide explanation initially
        document.getElementById('pcaExplanation').style.display = 'none';
    }

    startDragLine(event) {
        const rect = this.lineCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if click is near the line
        const distance = this.distanceToLine(x, y, this.userLine);
        if (distance < 20) {
            this.draggingLine = true;
            this.lineCanvas.style.cursor = 'grabbing';
        }
    }

    dragLine(event) {
        if (!this.draggingLine) return;
        
        const rect = this.lineCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Calculate angle from center to mouse position
        const centerX = this.lineCanvas.width / 2;
        const centerY = this.lineCanvas.height / 2;
        this.userLine.angle = Math.atan2(centerY - y, x - centerX);
        
        this.drawLineCanvas();
        this.updateFitScore();
    }

    stopDragLine() {
        this.draggingLine = false;
        this.lineCanvas.style.cursor = 'default';
    }

    distanceToLine(x, y, line) {
        const centerX = this.lineCanvas.width / 2;
        const centerY = this.lineCanvas.height / 2;
        
        const lineX1 = centerX - 200 * Math.cos(line.angle);
        const lineY1 = centerY + 200 * Math.sin(line.angle);
        const lineX2 = centerX + 200 * Math.cos(line.angle);
        const lineY2 = centerY - 200 * Math.sin(line.angle);
        
        const A = lineY2 - lineY1;
        const B = lineX1 - lineX2;
        const C = lineX2 * lineY1 - lineX1 * lineY2;
        
        return Math.abs(A * x + B * y + C) / Math.sqrt(A * A + B * B);
    }

    calculatePCA() {
        if (this.userPoints.length < 2) return;
        
        // Calculate mean
        const meanX = this.userPoints.reduce((sum, p) => sum + p.x, 0) / this.userPoints.length;
        const meanY = this.userPoints.reduce((sum, p) => sum + p.y, 0) / this.userPoints.length;
        
        // Calculate covariance matrix
        let covXX = 0, covXY = 0, covYY = 0;
        this.userPoints.forEach(point => {
            const dx = point.x - meanX;
            const dy = point.y - meanY;
            covXX += dx * dx;
            covXY += dx * dy;
            covYY += dy * dy;
        });
        covXX /= this.userPoints.length - 1;
        covXY /= this.userPoints.length - 1;
        covYY /= this.userPoints.length - 1;
        
        // Calculate eigenvalue and eigenvector
        const trace = covXX + covYY;
        const det = covXX * covYY - covXY * covXY;
        const eigenvalue1 = (trace + Math.sqrt(trace * trace - 4 * det)) / 2;
        
        let angle;
        if (Math.abs(covXY) < 1e-10) {
            angle = covXX > covYY ? 0 : Math.PI / 2;
        } else {
            angle = Math.atan2(eigenvalue1 - covXX, covXY);
        }
        
        this.pcaLine = { angle, x: meanX, y: meanY };
    }

    updateFitScore() {
        if (this.pcaLine && this.userPoints.length > 0) {
            const angleDiff = Math.abs(this.userLine.angle - this.pcaLine.angle);
            const normalizedDiff = Math.min(angleDiff, Math.PI - angleDiff);
            const score = Math.max(0, 100 - (normalizedDiff / (Math.PI / 2)) * 100);
            document.getElementById('fitScore').textContent = `${Math.round(score)}%`;
        }
    }

    showPCALine() {
        this.pcaShown = true;
        this.drawLineCanvas();
        document.getElementById('pcaExplanation').style.display = 'block';
    }

    resetUserLine() {
        this.userLine = { angle: 0, x: 250, y: 200 };
        this.pcaShown = false;
        this.drawLineCanvas();
        this.updateFitScore();
        document.getElementById('pcaExplanation').style.display = 'none';
    }

    drawLineCanvas() {
        const ctx = this.lineCtx;
        const canvas = this.lineCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw points
        ctx.fillStyle = '#1FB8CD';
        this.userPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Draw user line
        if (this.userPoints.length > 0) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            ctx.strokeStyle = '#5D878F';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX - 200 * Math.cos(this.userLine.angle), centerY + 200 * Math.sin(this.userLine.angle));
            ctx.lineTo(centerX + 200 * Math.cos(this.userLine.angle), centerY - 200 * Math.sin(this.userLine.angle));
            ctx.stroke();
        }
        
        // Draw PCA line if shown
        if (this.pcaShown && this.pcaLine) {
            ctx.strokeStyle = '#B4413C';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.pcaLine.x - 200 * Math.cos(this.pcaLine.angle), this.pcaLine.y + 200 * Math.sin(this.pcaLine.angle));
            ctx.lineTo(this.pcaLine.x + 200 * Math.cos(this.pcaLine.angle), this.pcaLine.y - 200 * Math.sin(this.pcaLine.angle));
            ctx.stroke();
            
            // Draw center point
            ctx.fillStyle = '#B4413C';
            ctx.beginPath();
            ctx.arc(this.pcaLine.x, this.pcaLine.y, 6, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    // Section 4: Projection Canvas
    setupProjectionCanvas() {
        this.projectionCanvas = document.getElementById('projectionCanvas');
        this.projectionCtx = this.projectionCanvas.getContext('2d');
        this.projectionValue = 0;
    }

    initializeProjectionSection() {
        document.getElementById('dimensionSlider').value = 0;
        this.projectionValue = 0;
        this.drawProjectionCanvas();
    }

    updateProjection(value) {
        this.projectionValue = parseFloat(value);
        this.drawProjectionCanvas();
    }

    drawProjectionCanvas() {
        const ctx = this.projectionCtx;
        const canvas = this.projectionCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.userPoints.length === 0 || !this.pcaLine) return;
        
        const t = this.projectionValue / 100;
        
        // Draw original points
        ctx.fillStyle = `rgba(31, 184, 205, ${1 - t * 0.5})`;
        this.userPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Draw PCA line
        ctx.strokeStyle = `rgba(180, 65, 60, ${1 - t * 0.3})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.pcaLine.x - 200 * Math.cos(this.pcaLine.angle), this.pcaLine.y + 200 * Math.sin(this.pcaLine.angle));
        ctx.lineTo(this.pcaLine.x + 200 * Math.cos(this.pcaLine.angle), this.pcaLine.y - 200 * Math.sin(this.pcaLine.angle));
        ctx.stroke();
        
        // Draw projected points
        if (t > 0) {
            ctx.fillStyle = `rgba(212, 186, 76, ${t})`;
            this.userPoints.forEach(point => {
                const projectedPoint = this.projectPointOntoLine(point, this.pcaLine);
                
                // Interpolate between original and projected position
                const currentX = point.x + t * (projectedPoint.x - point.x);
                const currentY = point.y + t * (projectedPoint.y - point.y);
                
                ctx.beginPath();
                ctx.arc(currentX, currentY, 8, 0, 2 * Math.PI);
                ctx.fill();
                
                // Draw projection lines
                if (t > 0.5) {
                    ctx.strokeStyle = `rgba(150, 67, 37, ${(t - 0.5) * 2})`;
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(projectedPoint.x, projectedPoint.y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            });
        }
    }

    projectPointOntoLine(point, line) {
        const dx = point.x - line.x;
        const dy = point.y - line.y;
        const dotProduct = dx * Math.cos(line.angle) - dy * Math.sin(line.angle);
        
        return {
            x: line.x + dotProduct * Math.cos(line.angle),
            y: line.y - dotProduct * Math.sin(line.angle)
        };
    }

    // Section 6: 3D Visualization
    setup3DVisualization() {
        this.container3d = document.getElementById('container_3d');
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(500, 400);
        this.container3d.appendChild(this.renderer.domElement);
    }

    init3DVisualization() {
        // Basic Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 500 / 400, 0.1, 1000);

        // Add points to the 3D scene
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.userPoints.length * 3);
        this.userPoints.forEach((p, i) => {
            positions[i * 3] = p.x - 250; // Center the points
            positions[i * 3 + 1] = p.y - 200;
            positions[i * 3 + 2] = 0;
        });
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ color: 0x1FB8CD, size: 10 });
        const points = new THREE.Points(geometry, material);
        this.scene.add(points);

        // Add PCA plane
        if (this.pcaLine) {
            const planeGeometry = new THREE.PlaneGeometry(500, 500);
            const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xB4413C, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.rotation.z = -this.pcaLine.angle;
            this.scene.add(plane);
        }

        this.camera.position.z = 300;

        const animate = () => {
            requestAnimationFrame(animate);
            points.rotation.x += 0.01;
            points.rotation.y += 0.01;
            if (this.pcaLine) {
                plane.rotation.x += 0.01;
                plane.rotation.y += 0.01;
            }
            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    completeLab() {
        document.getElementById('completionCard').style.display = 'block';
        document.getElementById('completeBtn').style.display = 'none';
    }
}

// Initialize the PCA Lab when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PCALab();
});