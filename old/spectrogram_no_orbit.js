
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
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3));
        const material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            vertexColors: THREE.VertexColors
        });
        const spectrogram = new THREE.Mesh(geometry, material);
        scene.add(spectrogram);

        // // Lighting
        // const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
        // scene.add(ambientLight);
        // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        // scene.add(directionalLight);


        // Example of lighting adjustments
        const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Increased intensity
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
        directionalLight.position.set(0, 1, 1); // Adjust position for better illumination
        scene.add(directionalLight);

        function colorMap(zValue) {
            // Assuming maxZ is the maximum expected z-value for scaling
            const maxZ = 0.5; 
            // Normalize the zValue to a 0-1 scale
            const normalizedValue = Math.min(zValue / maxZ, 1);
            // Invert the mapping: 
            // For a direct mapping, you might increase the hue with higher values to move from blue to red.
            // To invert, decrease the hue with higher values to move from red to blue, or another desired color transition.
            const hue = 1.0 - normalizedValue; // Inverting the scale
            return new THREE.Color().setHSL(hue * 0.7, 1, 0.5); // Adjust the hue dynamically
        }
        


        // function colorMap(zValue) {
        //     const maxZ = 0.5; // Assume a maximum expected z-value
        //     const ratio = Math.min(zValue / maxZ, 1); // Ensure ratio is between 0 and 1
        //     return new THREE.Color().setHSL(ratio * 0.7, 1, 0.5); // HSL: Hue, Saturation, Lightness
        // }

        // function updateSpectrogram() {
        //     analyser.getByteFrequencyData(dataArray);
        
        //     const positions = geometry.attributes.position.array;
        //     const colors = geometry.attributes.color.array;
        //     const step = geometry.parameters.widthSegments + 1; // Calculate the step to jump rows in the grid
        
        //     // Shift the existing data to simulate scrolling
        //     for (let row = geometry.parameters.heightSegments; row > 0; row--) {
        //         for (let col = 0; col <= geometry.parameters.widthSegments; col++) {
        //             const index = row * step + col;
        //             positions[index * 3 + 2] = positions[((row - 1) * step + col) * 3 + 2];
        //         }
        //     }
        
        //     // Add new data at the 'top' and update colors based on z-value
        //     for (let i = 0; i <= geometry.parameters.widthSegments; i++) {
        //         const value = dataArray[i] || 0;
        //         positions[i * 3 + 2] = value * 0.01; // Update z position based on frequency data
        //         const color = colorMap(positions[i * 3 + 2]);
        //         colors[i * 3] = color.r;
        //         colors[i * 3 + 1] = color.g;
        //         colors[i * 3 + 2] = color.b;
        //     }
        
        //     geometry.attributes.position.needsUpdate = true;
        //     geometry.attributes.color.needsUpdate = true;
        // }

        // function updateSpectrogram() {
        //     analyser.getByteFrequencyData(dataArray);
        
        //     const positions = geometry.attributes.position.array;
        //     const colors = geometry.attributes.color.array;
        //     const step = geometry.parameters.widthSegments + 1;
        
        //     // Adjust scrolling logic to ensure correct data movement
        //     for (let row = geometry.parameters.heightSegments; row > 1; row--) { // Start at row 1 to avoid out-of-bounds
        //         for (let col = 0; col <= geometry.parameters.widthSegments; col++) {
        //             const fromIndex = ((row - 1) * step + col) * 3;
        //             const toIndex = (row * step + col) * 3;
        //             positions[toIndex + 2] = positions[fromIndex + 2]; // Shift z-value 'downward'
        //         }
        //     }
        
        //     // Update new data at the 'top' with more visible color mapping
        //     for (let i = 0; i <= geometry.parameters.widthSegments; i++) {
        //         const value = dataArray[i] || 0;
        //         positions[i * 3 + 2] = value * 0.01; // Small z for visibility
        //         const color = colorMap(value * 0.01); // Use the actual z-value for color mapping
        //         const colorIndex = i * 3;
        //         colors[colorIndex] = color.r;
        //         colors[colorIndex + 1] = color.g;
        //         colors[colorIndex + 2] = color.b;
        //     }
        
        //     geometry.attributes.position.needsUpdate = true;
        //     geometry.attributes.color.needsUpdate = true;
        // }


        // function updateSpectrogram() {
        //     analyser.getByteFrequencyData(dataArray);
        
        //     // Retrieve geometry attributes
        //     const positions = geometry.attributes.position.array;
        //     const step = (geometry.parameters.widthSegments + 1) * 3; // 3 vertices per point (x, y, z)
        
        //     // Scroll existing data down
        //     for (let i = positions.length - 1 - step; i >= 0; i -= step) {
        //         for (let j = 0; j < step; j += 3) {
        //             // Only shift the z-value (amplitude data)
        //             positions[i + j + step + 2] = positions[i + j + 2];
        //         }
        //     }
        
        //     // Insert new data at the top
        //     for (let i = 0; i < step; i += 3) {
        //         const index = Math.floor(i / 3) % (geometry.parameters.widthSegments + 1);
        //         const value = dataArray[index] / 128.0; // Normalize and scale
        //         positions[i + 2] = value; // Update z position
        
        //         // Update color based on new value
        //         const color = colorMap(value);
        //         geometry.attributes.color.setXYZ(i / 3, color.r, color.g, color.b);
        //     }
        
        //     geometry.attributes.position.needsUpdate = true;
        //     geometry.attributes.color.needsUpdate = true;
        // }

        // function updateSpectrogram() {
        //     analyser.getByteFrequencyData(dataArray);
        
        //     const positions = geometry.attributes.position.array;
        //     const step = geometry.parameters.widthSegments + 1; // Number of points in one row (x-axis)
        
        //     // Scroll existing data
        //     // Move the vertex positions for all rows, except the first one, one row "down"
        //     for (let row = geometry.parameters.heightSegments; row > 0; row--) {
        //         for (let col = 0; col < step; col++) {
        //             const fromIndex = ((row - 1) * step + col) * 3 + 2;
        //             const toIndex = (row * step + col) * 3 + 2;
        //             positions[toIndex] = positions[fromIndex];
        //         }
        //     }
        
        //     // Insert new data at the top row
        //     for (let i = 0; i < step; i++) {
        //         const value = dataArray[i] || 0;
        //         positions[i * 3 + 2] = value * 0.01; // Scale value for visualization
        
        //         // Update color based on value
        //         const color = colorMap(positions[i * 3 + 2]);
        //         geometry.attributes.color.setXYZ(i, color.r, color.g, color.b);
        //     }
        
        //     geometry.attributes.position.needsUpdate = true;
        //     geometry.attributes.color.needsUpdate = true;
        // }

        function updateSpectrogram() {
            analyser.getByteFrequencyData(dataArray);
        
            const positions = geometry.attributes.position.array;
            const colors = geometry.attributes.color.array; // Access color attribute
            const step = geometry.parameters.widthSegments + 1; // Number of points in one row (x-axis)
        
            // Scroll existing data: move the vertex positions and colors for all rows one row "down"
            for (let row = geometry.parameters.heightSegments; row > 0; row--) {
                for (let col = 0; col < step; col++) {
                    const fromIndex = ((row - 1) * step + col) * 3;
                    const toIndex = (row * step + col) * 3;
        
                    // Scroll positions
                    positions[toIndex + 2] = positions[fromIndex + 2];
        
                    // Scroll colors along with the positions
                    colors[toIndex] = colors[fromIndex]; // R
                    colors[toIndex + 1] = colors[fromIndex + 1]; // G
                    colors[toIndex + 2] = colors[fromIndex + 2]; // B
                }
            }
        
            // Insert new data at the top row and update colors based on the new values
            for (let i = 0; i < step; i++) {
                const value = dataArray[i] || 0;
                positions[i * 3 + 2] = value * 0.01; // Adjust as needed
        
                const color = colorMap(value * 0.01); // Calculate color for the new value
                const colorIndex = i * 3;
                colors[colorIndex] = color.r; // R
                colors[colorIndex + 1] = color.g; // G
                colors[colorIndex + 2] = color.b; // B
            }
        
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.color.needsUpdate = true;
        }
        
        
        
        
        

        function animate() {
            requestAnimationFrame(animate);
            updateSpectrogram();
            renderer.render(scene, camera);
        }

        animate();


        // // Initialize OrbitControls with your main camera and renderer.domElement
        // const controls = new THREE.OrbitControls(camera, renderer.domElement);

        // // Optional: Configure controls as needed
        // controls.enableDamping = true; // An animation loop is required when either damping or auto-rotation is enabled
        // controls.dampingFactor = 0.25;
        // controls.enableZoom = true;

        // function animate() {
        //     requestAnimationFrame(animate);
            
        //     // Update controls every frame
        //     controls.update();
            
        //     updateSpectrogram();
        //     renderer.render(scene, camera);
        // }

        // animate();
    })
    .catch(err => {
        console.error('Accessing the microphone failed: ', err);
    });
