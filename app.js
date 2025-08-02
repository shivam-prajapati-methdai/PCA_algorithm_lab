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
        this.threeJsInitialized = false;
        this.isAnimating3D = false;

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
    }

    setupEventListeners() {
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

        document.getElementById('cycleAngleBtn').addEventListener('click', () => this.cycleViewingAngle());

        document.querySelectorAll('[data-pattern]').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadPresetPattern(e.target.dataset.pattern));
        });
        document.getElementById('clearData').addEventListener('click', () => this.clearData());

        document.getElementById('showPCABtn').addEventListener('click', () => this.showPCALine());
        document.getElementById('resetLineBtn').addEventListener('click', () => this.resetUserLine());

        document.getElementById('dimensionSlider').addEventListener('input', (e) => this.updateProjection(e.target.value));

        document.getElementById('completeBtn').addEventListener('click', () => this.completeLab());
    }

    nextSection() {
        if (this.currentSection < this.totalSections) {
            document.getElementById(`section${this.currentSection}`).classList.remove('active');
            this.currentSection++;
            document.getElementById(`section${this.currentSection}`).classList.add('active');
            this.updateProgress();
            
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

    setupIntroCanvas() {
        this.introCanvas = document.getElementById('introCanvas');
        this.introCtx = this.introCanvas.getContext('2d');
        this.drawIntroDemo();
    }

    drawIntroDemo() {
        const ctx = this.introCtx;
        const canvas = this.introCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const points = [
            {x: 100, y: 100}, {x: 150, y: 120}, {x: 200, y: 140}, {x: 250, y: 160},
            {x: 120, y: 80}, {x: 180, y: 100}, {x: 220, y: 120}, {x: 280, y: 140}
        ];
        
        ctx.fillStyle = '#4A90E2';
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        const angles = [0, Math.PI/6, Math.PI/4, Math.PI/3];
        const angle = angles[this.angleIndex % angles.length];
        
        ctx.strokeStyle = '#7ED321';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(50, 150);
        ctx.lineTo(50 + 300 * Math.cos(angle), 150 - 300 * Math.sin(angle));
        ctx.stroke();
        
        ctx.fillStyle = '#7ED321';
        ctx.font = "16px 'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', sans-serif";
        ctx.fillText(`Viewing Angle ${this.angleIndex + 1}`, 10, 280);
    }

    cycleViewingAngle() {
        this.angleIndex = (this.angleIndex + 1) % 4;
        this.drawIntroDemo();
    }

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
            return;
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
        
        ctx.fillStyle = '#4A90E2';
        this.userPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

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
        
        document.getElementById('pcaExplanation').style.display = 'none';
    }

    startDragLine(event) {
        const rect = this.lineCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
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
        
        const meanX = this.userPoints.reduce((sum, p) => sum + p.x, 0) / this.userPoints.length;
        const meanY = this.userPoints.reduce((sum, p) => sum + p.y, 0) / this.userPoints.length;
        
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
            let angleDiff = Math.abs(this.userLine.angle - this.pcaLine.angle);
            angleDiff = angleDiff > Math.PI ? 2 * Math.PI - angleDiff : angleDiff;
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
        
        ctx.fillStyle = '#4A90E2';
        this.userPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        if (this.userPoints.length > 0) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            ctx.strokeStyle = '#F5A623';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX - 200 * Math.cos(this.userLine.angle), centerY + 200 * Math.sin(this.userLine.angle));
            ctx.lineTo(centerX + 200 * Math.cos(this.userLine.angle), centerY - 200 * Math.sin(this.userLine.angle));
            ctx.stroke();
        }
        
        if (this.pcaShown && this.pcaLine) {
            ctx.strokeStyle = '#7ED321';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.pcaLine.x - 200 * Math.cos(this.pcaLine.angle), this.pcaLine.y + 200 * Math.sin(this.pcaLine.angle));
            ctx.lineTo(this.pcaLine.x + 200 * Math.cos(this.pcaLine.angle), this.pcaLine.y - 200 * Math.sin(this.pcaLine.angle));
            ctx.stroke();
            
            ctx.fillStyle = '#7ED321';
            ctx.beginPath();
            ctx.arc(this.pcaLine.x, this.pcaLine.y, 6, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

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
        
        ctx.fillStyle = `rgba(74, 144, 226, ${1 - t * 0.5})`;
        this.userPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        ctx.strokeStyle = `rgba(126, 211, 33, ${1 - t * 0.3})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.pcaLine.x - 200 * Math.cos(this.pcaLine.angle), this.pcaLine.y + 200 * Math.sin(this.pcaLine.angle));
        ctx.lineTo(this.pcaLine.x + 200 * Math.cos(this.pcaLine.angle), this.pcaLine.y - 200 * Math.sin(this.pcaLine.angle));
        ctx.stroke();
        
        if (t > 0) {
            ctx.fillStyle = `rgba(245, 166, 35, ${t})`;
            this.userPoints.forEach(point => {
                const projectedPoint = this.projectPointOntoLine(point, this.pcaLine);
                
                const currentX = point.x + t * (projectedPoint.x - point.x);
                const currentY = point.y + t * (projectedPoint.y - point.y);
                
                ctx.beginPath();
                ctx.arc(currentX, currentY, 8, 0, 2 * Math.PI);
                ctx.fill();
                
                if (t > 0.5) {
                    ctx.strokeStyle = `rgba(231, 76, 60, ${(t - 0.5) * 2})`;
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

    init3DVisualization() {
        if (!this.threeJsInitialized) {
            this.container3d = document.getElementById('container_3d');
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.container3d.appendChild(this.renderer.domElement);

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;

            document.getElementById('vis_step_1').addEventListener('click', () => this.visualizeStep(1));
            document.getElementById('vis_step_2').addEventListener('click', () => this.visualizeStep(2));
            document.getElementById('vis_step_3').addEventListener('click', () => this.visualizeStep(3));
            document.getElementById('vis_step_4').addEventListener('click', () => this.visualizeStep(4));
            document.getElementById('vis_reset').addEventListener('click', () => this.init3DVisualization());
            
            window.addEventListener('resize', () => this.onWindowResize(), false);
            this.threeJsInitialized = true;
        }

        this.generate3DData();
        this.onWindowResize();

        this.scene.clear();
        this.scene.background = new THREE.Color('#F0F8FF');

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(10, 15, 10);
        this.scene.add(directionalLight);

        const gridHelper = new THREE.GridHelper(500, 20, 0xD8D8D8, 0xD8D8D8);
        this.scene.add(gridHelper);

        document.getElementById('vis_step_1').disabled = false;
        document.getElementById('vis_step_2').disabled = true;
        document.getElementById('vis_step_3').disabled = true;
        document.getElementById('vis_step_4').disabled = true;
        document.getElementById('pca_3d_explanation_card').style.display = 'none';

        this.points3D = new THREE.Group();
        const geometry = new THREE.SphereGeometry(4, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: '#4A90E2', metalness: 0.3, roughness: 0.4 });
        this.points3DData.forEach(p => {
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.copy(p);
            this.points3D.add(sphere);
        });
        this.scene.add(this.points3D);

        this.camera.position.set(100, 100, 150);
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        if (!this.isAnimating3D) {
            this.isAnimating3D = true;
            this.animate3D();
        }
    }

    generate3DData() {
        this.points3DData = [];
        const numPoints = 50;
        for (let i = 0; i < numPoints; i++) {
            const x = Math.random() * 100 - 50;
            const y = x * 0.5 + (Math.random() - 0.5) * 30;
            const z = x * 0.2 + (Math.random() - 0.5) * 40;
            this.points3DData.push(new THREE.Vector3(x, y, z));
        }
    }

    onWindowResize() {
        if (!this.container3d) return;
        const width = this.container3d.clientWidth;
        const height = this.container3d.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    visualizeStep(step) {
        const explanationCard = document.getElementById('pca_3d_explanation_card');
        const explanationTitle = document.getElementById('pca_3d_explanation_title');
        const explanationText = document.getElementById('pca_3d_explanation_text');
        explanationCard.style.display = 'block';

        if (step === 1) {
            explanationTitle.textContent = 'Step 1: Center the 3D Data';
            explanationText.textContent = 'Just like before, we find the average center of our 3D cloud of points and shift everything so the center is at the origin (0,0,0).';
            
            const mean = new THREE.Vector3();
            this.points3D.children.forEach(p => mean.add(p.position));
            mean.divideScalar(this.points3D.children.length);

            this.points3D.children.forEach(p => {
                this.animateToPosition(p, p.position.clone().sub(mean), 800);
            });

            document.getElementById('vis_step_1').disabled = true;
            document.getElementById('vis_step_2').disabled = false;
        } else if (step === 2) {
            explanationTitle.textContent = 'Step 2: Find the Best Flat Plane';
            explanationText.textContent = 'With 3D data, PCA first finds the best flat plane (a 2D surface) that cuts through the data, capturing the most variation. This is our new simplified view.';

            this.calculate3DPCA();
            document.getElementById('vis_step_2').disabled = true;
            document.getElementById('vis_step_3').disabled = false;
        } else if (step === 3) {
            explanationTitle.textContent = 'Step 3: Project from 3D to 2D';
            explanationText.textContent = 'Now, we project each point from its position in 3D space directly onto the new 2D plane. We are reducing the dimension from 3 to 2!';

            this.projectToPlane();
            document.getElementById('vis_step_3').disabled = true;
            document.getElementById('vis_step_4').disabled = false;
        } else if (step === 4) {
            explanationTitle.textContent = 'Step 4: Project from 2D to 1D';
            explanationText.textContent = 'Finally, we can simplify even more by projecting the points from the 2D plane onto the most important line (PC1) within that plane. Now we have a 1D representation!';

            this.projectToLine();
            document.getElementById('vis_step_4').disabled = true;
        }
    }

    calculate3DPCA() {
        const planeGeometry = new THREE.PlaneGeometry(200, 200, 1, 1);
        const planeMaterial = new THREE.MeshStandardMaterial({ 
            color: '#7ED321', 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 0.5, 
            metalness: 0.2, 
            roughness: 0.6 
        });
        this.pcaPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        
        this.pcaPlane.rotation.x = Math.PI / 5;
        this.pcaPlane.rotation.y = Math.PI / 6;
        this.scene.add(this.pcaPlane);
    }

    projectToPlane() {
        const projectedMaterial = new THREE.MeshStandardMaterial({ color: '#F5A623', metalness: 0.3, roughness: 0.4 });
        const lineMaterial = new THREE.LineDashedMaterial({ color: '#E74C3C', dashSize: 2, gapSize: 2 });

        this.projectedPoints = new THREE.Group();
        this.scene.add(this.projectedPoints);

        this.points3D.children.forEach(p => {
            const point = p.position.clone();
            const projectedPoint = new THREE.Vector3();
            this.pcaPlane.worldToLocal(point);
            projectedPoint.set(point.x, point.y, 0);
            this.pcaPlane.localToWorld(projectedPoint);

            const projectedSphere = new THREE.Mesh(p.geometry.clone(), projectedMaterial);
            projectedSphere.position.copy(projectedPoint);
            this.projectedPoints.add(projectedSphere);

            const lineGeometry = new THREE.BufferGeometry().setFromPoints([p.position, projectedPoint]);
            const projectionLine = new THREE.Line(lineGeometry, lineMaterial);
            projectionLine.computeLineDistances();
            this.scene.add(projectionLine);
        });
    }

    projectToLine() {
        const pc1Direction = new THREE.Vector3(1, 0, 0);
        this.pcaPlane.localToWorld(pc1Direction);
        pc1Direction.sub(this.pcaPlane.position).normalize();

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            pc1Direction.clone().multiplyScalar(-100),
            pc1Direction.clone().multiplyScalar(100)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: '#50E3C2', linewidth: 3 });
        const pc1Line = new THREE.Line(lineGeometry, lineMaterial);
        this.scene.add(pc1Line);

        const finalProjectedMaterial = new THREE.MeshStandardMaterial({ color: '#50E3C2', metalness: 0.3, roughness: 0.4 });

        this.projectedPoints.children.forEach(p => {
            const point = p.position.clone();
            const projectedPoint = new THREE.Vector3().copy(pc1Direction).multiplyScalar(point.dot(pc1Direction));
            
            const finalSphere = new THREE.Mesh(p.geometry.clone(), finalProjectedMaterial);
            finalSphere.position.copy(projectedPoint);
            this.scene.add(finalSphere);

            const lineGeometry = new THREE.BufferGeometry().setFromPoints([p.position, projectedPoint]);
            const projectionLine = new THREE.Line(lineGeometry, new THREE.LineDashedMaterial({ color: '#E74C3C', dashSize: 1, gapSize: 2 }));
            projectionLine.computeLineDistances();
            this.scene.add(projectionLine);
        });
    }

    animateToPosition(object, targetPosition, duration) {
        const startPosition = object.position.clone();
        let startTime = null;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const t = Math.min(elapsedTime / duration, 1);
            object.position.lerpVectors(startPosition, targetPosition, t);
            if (t < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    animate3D() {
        if (!this.isAnimating3D) return;
        requestAnimationFrame(() => this.animate3D());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    completeLab() {
        document.getElementById('completionCard').style.display = 'block';
        document.getElementById('completeBtn').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PCALab();
});