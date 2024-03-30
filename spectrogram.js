//spectrogram.js: a simple example of a spectrogram visualization using Three.js and the Web Audio API.

import * as THREE from './js/three.module.js';


// Request access to the microphone
navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(stream => {
        // Audio setup
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        //analyser.fftSize = 2048;
        analyser.fftSize = 1024;
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
            const maxZ = 2; 
            // Normalize the zValue to a 0-1 scale
            const normalizedValue = Math.min(zValue / maxZ, 1);
            // Invert the mapping: 
            // For a direct mapping, you might increase the hue with higher values to move from blue to red.
            // To invert, decrease the hue with higher values to move from red to blue, or another desired color transition.
            const hue = 1.0 - normalizedValue; // Inverting the scale
            return new THREE.Color().setHSL(hue * 0.7, 1, 0.5); // Adjust the hue dynamically
        }
        

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
            updateSpectrogram();

            requestAnimationFrame(animate);

            updateSpectrogram();

            renderer.render(scene, camera);

            updateSpectrogram();
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
