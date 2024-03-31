import * as THREE from './node_modules/three/build/three.module.js'
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

//import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';






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

        // Add this code after renderer setup in `spectrogram.js`
        renderer.domElement.addEventListener('click', (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            console.log(`X: ${x}, Y: ${y}`);
            // Inside the click event listener
            document.getElementById('info').innerText = `X: ${x}, Y: ${y}`;

            // Here you can also display this information on the HTML page by updating DOM elements
        });




        camera.position.z = 5;

        // Spectrogram geometry setup
        const geometry = new THREE.PlaneGeometry(5, 5, 50, bufferLength / 2);
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3));
        
        const material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            vertexColors: true
            //THREE.VertexColors // Ensure this is correctly set
        });
        const spectrogram = new THREE.Mesh(geometry, material);
        scene.add(spectrogram);



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
        






        const widgetScene = new THREE.Scene();
        const widgetCamera = new THREE.PerspectiveCamera(75, 300 / 300, 0.1, 1000); // Assuming a 300x300px orbit widget
        widgetCamera.position.z = 5;
        const cubeGeometry = new THREE.BoxGeometry();
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        widgetScene.add(cube);

        const orbitControls = new OrbitControls(widgetCamera, renderer.domElement);
        orbitControls.update();
                
        
        
        

        // function animate() {
        //     updateSpectrogram();

        //     requestAnimationFrame(animate);

        //     updateSpectrogram();

        //     renderer.render(scene, camera);
        //     // // Add these two lines for the second scene
        //     orbitControls.update(); // only required if controls.enableDamping or controls.autoRotate are set to true

        //     renderer.render(widgetScene, widgetCamera); // Render the orbit widget scene
            

        //     updateSpectrogram();
        // }

        orbitControls.addEventListener('change', () => {
            // Sync position
            camera.position.copy(widgetCamera.position);
            camera.rotation.copy(widgetCamera.rotation);
            
            // Optional: If you want to ensure the same zoom level:
            camera.zoom = widgetCamera.zoom;
            camera.updateProjectionMatrix(); // Required after modifying zoom
            
            // Any additional properties you want to sync (e.g., camera.up if you're allowing for tilt changes)
        });
        


        function animate() {
            requestAnimationFrame(animate);
        
            updateSpectrogram();
        
            // Render the main scene
            renderer.render(scene, camera);
        
            // Set up for rendering the widget scene in a small viewport
            const width = renderer.domElement.width;
            const height = renderer.domElement.height;
            const widgetSize = {
                width: width / 10,
                height: height / 10
            };
        
            // Define the small viewport (top-right corner)
            const smallerViewPort = {
                x: width - widgetSize.width,
                y: height - widgetSize.height,
                width: widgetSize.width,
                height: widgetSize.height
            };
        
            // Set the viewport for the cube orbit widget.
            // Note: WebGLRenderer.setViewport parameters -> (x, y, width, height);
            renderer.setViewport(smallerViewPort.x, smallerViewPort.y, smallerViewPort.width, smallerViewPort.height);
            renderer.setScissor(smallerViewPort.x, smallerViewPort.y, smallerViewPort.width, smallerViewPort.height);
            renderer.setScissorTest(true); // Enable the scissor to clip the rendering
        
            orbitControls.update(); // Update the orbit controls for interaction
            renderer.render(widgetScene, widgetCamera); // Render the orbit widget scene


            // Sync the main camera with the widget camera
            camera.position.copy(widgetCamera.position);
            camera.quaternion.copy(widgetCamera.quaternion);
            camera.fov = widgetCamera.fov;
            camera.updateProjectionMatrix();

            
            // Reset viewport back to full canvas size for other rendering operations
            renderer.setViewport(0, 0, width, height);
            renderer.setScissorTest(false); // Disable scissor test after rendering the small view
        }
        

        animate();

    })
    .catch(err => {
        console.error('Accessing the microphone failed: ', err);
    });

