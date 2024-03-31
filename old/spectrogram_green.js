// Request access to the microphone
navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(stream => {
        // Audio setup
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);

        // Three.js setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        camera.position.z = 5;

        // Spectrogram geometry setup
        const geometry = new THREE.PlaneGeometry(5, 5, 50, bufferLength / 2);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const spectrogram = new THREE.Mesh(geometry, material);
        scene.add(spectrogram);

        function updateSpectrogram() {
            analyser.getByteFrequencyData(dataArray);
        
            const positions = geometry.attributes.position.array;
            const step = geometry.parameters.widthSegments + 1; // Calculate the step to jump rows in the grid
        
            // Shift the existing data to simulate scrolling
            // We're effectively moving rows down to make space for new data at the 'top'
            for (let row = geometry.parameters.heightSegments; row > 0; row--) {
                for (let col = 0; col <= geometry.parameters.widthSegments; col++) {
                    positions[(row * step + col) * 3 + 2] = positions[((row - 1) * step + col) * 3 + 2];
                }
            }
        
            // Add new data at the 'top'
            // Note: You might need to adjust how you populate this based on your desired visualization
            for (let i = 0; i <= geometry.parameters.widthSegments; i++) {
                // Assuming the widthSegments matches the dataArray length
                // You may need to adjust this if they don't match
                const value = dataArray[i] || 0;
                positions[i * 3 + 2] = value * 0.01; // Update z position based on frequency data
            }
        
            geometry.attributes.position.needsUpdate = true;
        }
        

        function animate() {
            requestAnimationFrame(animate);
            updateSpectrogram();
            renderer.render(scene, camera);
        }

        animate();
    })
    .catch(err => {
        console.error('Accessing the microphone failed: ', err);
    });
